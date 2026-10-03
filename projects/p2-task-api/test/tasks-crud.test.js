// Day 18 判据：验收项目 2 的**数据持久化**（tasks 表 + CRUD 真连库）（AI 写）
//
// 跑法：node --test projects/p2-task-api/test/tasks-crud.test.js
//
// 契约（也写在 notes/day18-database.md 里）：
//   · **数据库文件路径读 `process.env.DB_FILE`**（默认 `data/tasks.db`），**在 buildServer() 被调用时读**
//     ⚠️ 不许在模块顶层就 open 数据库（那是模块副作用 —— 判据要能按测试换库，同 Day 17 的"不许自己 listen"）
//   · 端点（在 Day 17 的骨架上加；全部返回 JSON）：
//     POST   /tasks      body {"title":"…","done"?:false}  → **201** + JSON，且带**非空 `id`**
//     GET    /tasks      → 200 + JSON 数组（真从库里读）
//     GET    /tasks/:id  → 200 + 那条；**不存在 → 404 + JSON**
//     PATCH  /tasks/:id  body {"title"?,"done"?}           → 200 + 更新后的对象；不存在 → 404 + JSON
//     DELETE /tasks/:id  → **204**（无 body）或 200 + JSON；不存在 → 404 + JSON
//     `title` 缺失/为空  → **400 / 422** + JSON
//   · **持久化**：一条数据创建之后，**换一个进程**起同一个 DB_FILE → 它还在（06 专门防"内存数组假装数据库"）
//
// 必过 8 条 + 探针 1 条 = 本文件 9 条 test()。**只看 HTTP 行为 + 跨进程还在**，不挑 ORM / 驱动
// （`node:sqlite` / Prisma / better-sqlite3 都行）。全打本地随机端口 + 临时 DB 文件（在系统临时目录，跑完删掉），不碰仓库。

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');            // projects/p2-task-api
const ENTRY = path.join(ROOT, 'src', 'server.js');

// ── 0. 临时 DB 文件（判据自己造，跑完删）────────────────────────────
const labDir = fs.mkdtempSync(path.join(os.tmpdir(), 'p2-db-'));
const DB_FILE = path.join(labDir, 'tasks.db');
process.env.DB_FILE = DB_FILE;   // ⚠️ 必须在 require 之前设：万一他的模块"顶层读"也能拦住（但契约要求运行时读）

// ── 1. 先探：文件在不在 / require 必不爆炸 / 导出对不对（照 server.test.js）──
const exists = fs.existsSync(ENTRY);
if (!exists) {
  console.log(
    '\n⚠️ 还没看到 projects/p2-task-api/src/server.js —— 这份判据是拿来验收"接上数据库"的。\n' +
      '   先把 Day 17 的骨架写到 7/7，再加 tasks 表和 CRUD，再回来跑。\n'
  );
}
const probe = exists
  ? spawnSync(process.execPath, ['-e', `require(${JSON.stringify(ENTRY)})`], { encoding: 'utf8', timeout: 20000 })
  : { status: 0, stdout: '', stderr: '' };
const probeOut = `${probe.stdout || ''}${probe.stderr || ''}`;
const probeCrash = exists && /SyntaxError|ReferenceError|TypeError|Cannot find module|ERR_MODULE_NOT_FOUND/.test(probeOut);

function moduleTrouble() {
  if (!exists) return '还没看到 projects/p2-task-api/src/server.js —— 先写 Day 17 的骨架';
  if (probeCrash)
    return `加载 src/server.js 时就炸了：\n   ${probeOut.trim().split('\n').slice(0, 3).join('\n   ')}\n   → 先 node --check src/server.js`;
  if (/buildServer/.test(probeOut)) return '加载时打印了东西（模块不该有副作用）';
  return '⚠️ 上面那行 require 探针的原始输出里可能有线索';
}

let buildServer = null;
let loadError = null;
if (exists && !probeCrash) {
  try {
    const mod = require(ENTRY);
    buildServer = mod.buildServer ?? mod.default?.buildServer ?? (typeof mod === 'function' ? mod : mod.default);
  } catch (err) {
    loadError = err;
  }
}
const ok = typeof buildServer === 'function';
const skip = ok ? false : '先让 buildServer 能被导出，再跑这条';
if (!ok && exists) console.log(`\n⚠️ 没能拿到 buildServer —— 除了 00 之外全部跳过。\n   原因：${moduleTrouble()}\n`);

after(() => {
  console.log(
    '\n判据覆盖面：00–07 共 8 条必过 + P 探针 1 条 = 本文件 9 条 test()。\n' +
      '（报绿之前看一眼上面的 pass 数：大半是 skipped，那不是绿，是没跑起来。）'
  );
});

// ── 2. 起服务（框架无关；同 server.test.js 的写法）──────────────────
let server = null;
let base = null;

async function listenWith(s) {
  let handle = s;
  await new Promise((resolve, reject) => {
    const cb = (err) => (err ? reject(err) : resolve());
    try {
      const ret = s.listen({ port: 0, host: '127.0.0.1' }, cb);
      if (ret && typeof ret.then === 'function') ret.catch(reject);          // Fastify
      else if (ret && typeof ret.address === 'function') handle = ret;       // Express
    } catch (err) {
      reject(err);
    }
  });
  return handle;
}

function portOf(handle) {
  const inner = handle.server ?? handle;
  const addr =
    (typeof inner.address === 'function' ? inner.address() : null) ??
    (typeof handle.address === 'function' ? handle.address() : null);
  if (!addr || typeof addr.port !== 'number') {
    throw new Error('拿不到监听端口 —— buildServer() 要返回"能被 listen 的对象"（见 notes/day17-web-framework.md 的契约）');
  }
  return addr.port;
}

async function startServer() {
  const maybe = buildServer();
  const s = await Promise.resolve(maybe);
  server = await listenWith(s);
  base = `http://127.0.0.1:${portOf(server)}`;
}

async function closeServer(handle) {
  if (!handle) return;
  const inner = handle.server ?? handle;
  inner.closeAllConnections?.();
  await new Promise((r) => handle.close(() => r()));
}

/** 带超时的 fetch —— 服务崩了/没响应时要报错，别把判据挂死（2026-10-01 踩过） */
async function req(method, p, body, ms = 5000) {
  let timer;
  try {
    const res = await Promise.race([
      fetch(base + p, {
        method,
        headers: body === undefined ? undefined : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      new Promise((_, rej) => {
        timer = setTimeout(
          () => rej(new Error(`${method} ${p} 在 ${ms}ms 内没有响应 —— 服务大概率崩了（检查有没有统一错误处理），或压根没起来`)),
          ms
        );
      }),
    ]);
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* 不是 JSON（下面按需报） */
    }
    return { status: res.status, ct: res.headers.get('content-type') ?? '', json, text };
  } finally {
    clearTimeout(timer);
  }
}

before(async () => {
  if (!ok) return;
  try {
    await startServer();
  } catch (err) {
    console.log(`\n⚠️ buildServer() 起不来：${err.message}\n`);
  }
});

after(async () => {
  await closeServer(server);
  try {
    fs.rmSync(labDir, { recursive: true, force: true });   // 临时 DB 一起删掉
  } catch {
    /* 清理失败不掩盖判据结果 */
  }
});

// ── 3. 必过项 ──────────────────────────────────────────────────────
test('00 模块能被加载，并导出 buildServer 函数', () => {
  assert.ok(
    ok,
    (loadError ? `加载 src/server.js 时报错：${loadError.message}` : moduleTrouble()) +
      '\n   契约：`module.exports = { buildServer }`；`buildServer()` 只负责"造一个服务"，**不许自己 listen**，' +
      '\n   而且**数据库文件路径要在它被调用时读 `process.env.DB_FILE`**（默认 `data/tasks.db`）——判据就是靠这个换临时库的。'
  );
});

test('01 POST /tasks → 201 + JSON，且返回非空 id', { skip, timeout: 15000 }, async () => {
  assert.ok(base, '服务没起来（见上面的警告）');
  const res = await req('POST', '/tasks', { title: '写周报' });
  assert.strictEqual(res.status, 201, `创建成功应该 201，实际 ${res.status}（body: ${res.text.slice(0, 200)}）`);
  assert.match(res.ct, /json/, `Content-Type 应该是 JSON（实际 ${res.ct}）`);
  assert.ok(res.json && typeof res.json === 'object', `要返回刚创建的那条（对象），实际 ${res.text.slice(0, 200)}`);
  assert.ok(
    (typeof res.json.id === 'number' || typeof res.json.id === 'string') && String(res.json.id) !== '',
    `返回的对象要有**非空 id**（主键；数字或字符串都行），实际 ${JSON.stringify(res.json)}`
  );
  assert.strictEqual(res.json.title, '写周报', '返回的 title 应该是刚提交的那个');
});

test('02 GET /tasks → 200 + JSON 数组，且里面能找到刚创建的那条', { skip, timeout: 15000 }, async () => {
  const created = (await req('POST', '/tasks', { title: '第二条-列表用' })).json;
  const list = await req('GET', '/tasks');
  assert.strictEqual(list.status, 200, `期望 200，实际 ${list.status}`);
  assert.match(list.ct, /json/, 'Content-Type 应该是 JSON');
  assert.ok(Array.isArray(list.json), `GET /tasks 要返回**数组**，实际 ${list.text.slice(0, 200)}`);
  assert.ok(
    list.json.some((t) => String(t?.id) === String(created?.id)),
    `列表里应该能找到刚创建的那条（id=${created?.id}）—— 说明是**真从库里读**的。实际列表：${list.text.slice(0, 300)}`
  );
});

test('03 GET /tasks/:id → 200 + 那条；不存在的 id → 404 + JSON', { skip, timeout: 15000 }, async () => {
  const created = (await req('POST', '/tasks', { title: '单条查询用' })).json;
  const one = await req('GET', `/tasks/${created?.id}`);
  assert.strictEqual(one.status, 200, `存在的 id 应该 200，实际 ${one.status}`);
  assert.strictEqual(one.json?.title, '单条查询用', `取回来的应该是那一条，实际 ${one.text.slice(0, 200)}`);

  const missing = await req('GET', '/tasks/999999');
  assert.strictEqual(missing.status, 404, `不存在的 id 应该 404，实际 ${missing.status}`);
  assert.match(missing.ct, /json/, `404 的 body 也应该是 JSON（实际 ${missing.ct}）`);
  assert.ok(missing.json && typeof missing.json === 'object', `404 的 body 应该是个对象，实际 ${missing.text.slice(0, 200)}`);
});

test('04 PATCH /tasks/:id 改字段 → 200 + 新值（再 GET 确认已落库）', { skip, timeout: 15000 }, async () => {
  const created = (await req('POST', '/tasks', { title: '待改' })).json;
  const patched = await req('PATCH', `/tasks/${created?.id}`, { done: true, title: '改过了' });
  assert.strictEqual(patched.status, 200, `PATCH 应该 200，实际 ${patched.status}（body: ${patched.text.slice(0, 200)}）`);
  assert.strictEqual(patched.json?.done, true, `返回的 done 应该是 true，实际 ${JSON.stringify(patched.json)}`);

  const again = await req('GET', `/tasks/${created?.id}`);
  assert.strictEqual(again.json?.done, true, 'PATCH 之后**再 GET** 也应该是新值（说明真的写进库了，不是只改了内存里的副本）');
  assert.strictEqual(again.json?.title, '改过了', 'title 也应该被改掉');
});

test('05 DELETE /tasks/:id → 200/204；再 GET → 404', { skip, timeout: 15000 }, async () => {
  const created = (await req('POST', '/tasks', { title: '待删' })).json;
  const del = await req('DELETE', `/tasks/${created?.id}`);
  assert.ok(
    del.status === 200 || del.status === 204,
    `删除成功应该 200（带 body）或 204（无 body），实际 ${del.status}`
  );
  const after = await req('GET', `/tasks/${created?.id}`);
  assert.strictEqual(after.status, 404, `删掉之后再查应该 404，实际 ${after.status}`);
});

test('06 跨进程持久化：换个进程起同一个 DB_FILE，数据还在（防"内存数组假数据库"）', { skip, timeout: 40000 }, async () => {
  const port1 = 31000 + Math.floor(Math.random() * 10000);
  const port2 = port1 + 1;
  const marker = `持久化标记-${Date.now()}`;

  const child1 = spawn(process.execPath, ['src/server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port1), DB_FILE },
  });
  const child2 = { proc: null };
  const log = { out: '' };
  child1.stdout.on('data', (d) => (log.out += d));
  child1.stderr.on('data', (d) => (log.out += d));

  const waitHealth = async (port, ms) => {
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/health`);
        if (r.status === 200) return true;
      } catch {
        /* 还没起来 */
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    return false;
  };

  try {
    assert.ok(
      await waitHealth(port1, 8000),
      `第一次没起来（PORT=${port1}）。检查"直接运行 src/server.js 时才监听 + 读 PORT"那一段。进程输出：\n${log.out.slice(0, 400)}`
    );
    const created = await fetch(`http://127.0.0.1:${port1}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: marker }),
    });
    assert.strictEqual(created.status, 201, `往子进程里 POST 应该 201，实际 ${created.status}`);

    // 关掉第一个进程（模拟"重启服务"）
    child1.kill();
    await new Promise((r) => child1.once('exit', r));

    // 换一个进程、同一个 DB_FILE 再起来
    const c2 = spawn(process.execPath, ['src/server.js'], {
      cwd: ROOT,
      env: { ...process.env, PORT: String(port2), DB_FILE },
    });
    child2.proc = c2;
    c2.stdout.on('data', (d) => (log.out += d));
    c2.stderr.on('data', (d) => (log.out += d));
    assert.ok(await waitHealth(port2, 8000), `重启后没起来（PORT=${port2}）。进程输出：\n${log.out.slice(0, 400)}`);

    const list = await (await fetch(`http://127.0.0.1:${port2}/tasks`)).json();
    assert.ok(
      Array.isArray(list) && list.some((t) => t?.title === marker),
      `重启之后"${marker}"应该还在 —— 不在就说明数据**只存在内存里**（数组/Map），不是真的写进了数据库文件。\n` +
        `   实际列表：${JSON.stringify(list).slice(0, 300)}`
    );
  } finally {
    child1.kill();
    child2.proc?.kill();
  }
});

test('07 POST /tasks 不带 title → 400/422 + JSON（校验真的生效）', { skip, timeout: 15000 }, async () => {
  const res = await req('POST', '/tasks', { done: false });
  assert.ok(
    res.status === 400 || res.status === 422,
    `title 缺失时应该 400 或 422（拒绝写入），实际 ${res.status} —— 没校验的话会把空标题存进库`
  );
  assert.match(res.ct, /json/, '错误响应也应该是 JSON');
  assert.ok(res.json && typeof res.json === 'object', `错误 body 应该是个对象，实际 ${res.text.slice(0, 200)}`);
});

// ── 4. 探针（只记录，不判错）───────────────────────────────────────
test('P 探针：建表/迁移文件 / ?done= 过滤 / 响应头 / 耗时（只记录，不判错）', { skip, timeout: 20000 }, async () => {
  console.log('\n探针（只记录，不判错）：');

  const schemaCandidates = [
    'prisma/schema.prisma',
    'db/schema.sql',
    'db/migrations',
    'src/db.js',
    'src/db.ts',
    'migrations',
  ];
  const found = schemaCandidates.filter((p) => fs.existsSync(path.join(ROOT, p)));
  console.log(`  · 建表/迁移相关文件：${found.length ? found.join('、') : '⚠️ 一个都没找到（迁移文件要进 git —— 见 Day 18 任务书）'}`);

  const r = await req('GET', '/tasks');
  console.log(`  · GET /tasks 的响应头：${JSON.stringify({ 'content-type': r.ct }).slice(0, 200)}`);

  const filtered = await req('GET', '/tasks?done=true');
  console.log(
    `  · GET /tasks?done=true → ${filtered.status}，${Array.isArray(filtered.json) ? `数组 ${filtered.json.length} 条` : '不是数组'}` +
      `（可选功能：过滤还没做也没关系，记进日志就行）`
  );

  const t0 = Date.now();
  await req('GET', '/health');
  console.log(`  · 一次 /health 往返耗时 ≈ ${Date.now() - t0}ms`);

  console.log('  （探针不判错：用什么 ORM、表怎么建、错误文案怎么写，都是设计选择 —— 记进日志就行）\n');
});
