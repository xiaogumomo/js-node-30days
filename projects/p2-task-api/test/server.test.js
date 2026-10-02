// Day 17 判据：验收项目 2（任务管理 REST API）的**骨架**（AI 写）
//
// 跑法：node --test projects/p2-task-api/test/server.test.js
//
// 契约（也写在 notes/day17-web-framework.md 里）：
//   projects/p2-task-api/
//     src/server.js    导出 buildServer()  —— **不许自己 listen**（谁调用谁决定端口，判据才测得了）
//     直接运行它（node src/server.js）时**才**监听：端口读 process.env.PORT，默认 3000
//   端点（今天只做骨架，还没有数据库）：
//     GET /health          → 200 + JSON {"ok":true}
//     GET /tasks           → 200 + JSON 数组（今天返回空数组 [] 就行）
//     GET /boom            → 故意抛错（**只在非 production 注册**）→ 500 + JSON，且**进程不许崩**
//     未知路径             → 404 + **JSON**（不是 HTML 错误页）
//
// 这份判据**只看 HTTP 行为**，不挑框架 → 你用 Fastify 或 Express 都能过（也**不碰仓库**：
// 全部打本地随机端口，跑完关掉）。必过 6 条 + 探针 1 条 = 本文件 7 条 test()。

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');            // projects/p2-task-api
const ENTRY = path.join(ROOT, 'src', 'server.js');

// ── 0. 先探：文件在不在 / require 必不爆炸 / 导出对不对 ─────────────
const exists = fs.existsSync(ENTRY);
if (!exists) {
  console.log(
    '\n⚠️ 还没看到 projects/p2-task-api/src/server.js —— 这份判据是拿来验收它的。\n' +
      '   先写出最小版（buildServer + GET /health），再回来跑。\n'
  );
}
const probe = exists
  ? spawnSync(process.execPath, ['-e', `require(${JSON.stringify(ENTRY)})`], { encoding: 'utf8', timeout: 20000 })
  : { status: 0, stdout: '', stderr: '' };
const probeOut = `${probe.stdout || ''}${probe.stderr || ''}`;
const probeCrash = exists && /SyntaxError|ReferenceError|TypeError|Cannot find module|ERR_MODULE_NOT_FOUND/.test(probeOut);

function moduleTrouble() {
  if (!exists) return '还没看到 projects/p2-task-api/src/server.js —— 先写最小版';
  if (probeCrash) return `加载 src/server.js 时就炸了：\n   ${probeOut.trim().split('\n').slice(0, 3).join('\n   ')}\n   → 先 node --check src/server.js`;
  if (/buildServer/.test(probeOut)) return '加载时打印了东西（模块不该有副作用）';
  return '⚠️ 上面那行 require 探针的原始输出里可能有线索';
}

// ⚠️ 这里**必须是同步 require**：这个判据文件是 CJS，**不能出现顶层 await**
//    （CJS 里同时有 require 和顶层 await → Node 直接报 "Cannot determine intended module format"）
//    Node 24 的 require() 本来就能加载"没有顶层 await 的 ESM"，所以 CJS / ESM 都不用特殊处理。
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
if (!ok && exists) console.log(`\n⚠️ 没能拿到 buildServer —— 除了 00/05 之外全部跳过。\n   原因：${moduleTrouble()}\n`);

after(() => {
  console.log(
    '\n判据覆盖面：00–05 共 6 条必过 + P 探针 1 条 = 本文件 7 条 test()。\n' +
      '（报绿之前看一眼上面的 pass 数：大半是 skipped，那不是绿，是没跑起来。）'
  );
});

// ── 1. 测试用的服务实例（每条测试共用一个）────────────────────────
let server = null;
let base = null;

async function startServer() {
  const maybe = buildServer();
  const s = await Promise.resolve(maybe);            // 同步返回或返回 Promise 都支持
  await new Promise((r) => s.listen(0, '127.0.0.1', r));  // 端口 0 = 让系统随便给一个（不占固定端口）
  server = s;
  base = `http://127.0.0.1:${s.address().port}`;
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
  if (server) {
    server.closeAllConnections?.();
    await new Promise((r) => server.close(r));
  }
});

const get = (p) => fetch(base + p);

/**
 * 带超时的 GET：服务**崩了 / 没响应**时，判据要能**报错**，而不是把自己挂死。
 * （2026-10-01 实测踩到：没有统一错误处理时 `/boom` 把进程弄崩 → `await fetch` 永远不返回
 *   → 整个 `node --test` 卡 60 秒。判据挂死比判据报红糟得多。）
 */
async function getOrFail(p, ms = 3000) {
  let timer;
  try {
    return await Promise.race([
      fetch(base + p),
      new Promise((_, rej) => {
        timer = setTimeout(
          () => rej(new Error(`GET ${p} 在 ${ms}ms 内没有响应 —— 服务大概率崩了（检查有没有统一错误处理），或压根没起来`)),
          ms
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

// ── 2. 必过项 ──────────────────────────────────────────────────────
test('00 模块能被加载，并导出 buildServer 函数', () => {
  assert.ok(
    ok,
    (loadError ? `加载 src/server.js 时报错：${loadError.message}` : moduleTrouble()) +
      '\n   契约：module.exports = { buildServer }（或 ESM 的 export）；' +
      '\n   **buildServer() 只负责"造一个服务"，不许自己 listen**（监听交给调用方，判据才测得了）'
  );
});

test('01 GET /health → 200 + JSON {"ok":true}', { skip, timeout: 10000 }, async () => {
  assert.ok(base, '服务没起来（见上面的警告）');
  const res = await getOrFail('/health');
  assert.strictEqual(res.status, 200, `期望 200，实际 ${res.status}`);
  assert.match(
    res.headers.get('content-type') ?? '',
    /json/,
    `Content-Type 应该是 JSON（实际 ${res.headers.get('content-type')}）—— 客户端要靠它判断怎么解析`
  );
  const body = await res.json();
  assert.deepStrictEqual(body, { ok: true }, `body 应该是 {"ok":true}，实际 ${JSON.stringify(body)}`);
});

test('02 GET /tasks → 200 + JSON 数组（今天返回空数组就行）', { skip, timeout: 10000 }, async () => {
  const res = await getOrFail('/tasks');
  assert.strictEqual(res.status, 200, `期望 200，实际 ${res.status}`);
  assert.match(res.headers.get('content-type') ?? '', /json/, 'Content-Type 应该是 JSON');
  const body = await res.json();
  assert.ok(Array.isArray(body), `今天可以返回空数组 []，但**必须是数组**，实际：${JSON.stringify(body)}`);
});

test('03 未知路径 → 404，且**body 是 JSON**（不是 HTML 错误页）', { skip, timeout: 10000 }, async () => {
  const res = await getOrFail('/这个路由不存在');
  assert.strictEqual(res.status, 404, `未知路径应该 404，实际 ${res.status}`);
  assert.match(
    res.headers.get('content-type') ?? '',
    /json/,
    `404 的 body 也应该是 JSON（框架默认会给 HTML 错误页 → 要自己覆盖，客户端才不用猜格式）。` +
      `\n   实际 Content-Type：${res.headers.get('content-type')}`
  );
  let body;
  try {
    body = await res.json();
  } catch (err) {
    assert.fail('404 的 body 解析不成 JSON');
  }
  assert.ok(body && typeof body === 'object', `404 的 body 应该是个对象（比如 {"error":"..."}），实际 ${JSON.stringify(body)}`);
});

test('04 统一错误处理：/boom 抛错 → 500 + JSON，而且**进程不许崩**', { skip, timeout: 15000 }, async () => {
  const res = await getOrFail('/boom');
  assert.strictEqual(
    res.status,
    500,
    `handler 里抛的错应该被统一错误处理接住、返回 500，实际 ${res.status}。\n` +
      '   ⚠️ 如果这里直接报网络错误（fetch 失败），说明**进程真的崩了** —— 那就是"没有统一错误处理"'
  );
  assert.match(res.headers.get('content-type') ?? '', /json/, '500 的 body 也应该是 JSON');
  const body = await res.json();
  assert.ok(body && typeof body === 'object', `500 的 body 应该是个对象（比如 {"error":"..."}），实际 ${JSON.stringify(body)}`);

  // 关键：崩没崩 —— 紧接着再打一次别的端点
  const again = await getOrFail('/health');
  assert.strictEqual(again.status, 200, '一个请求出错之后，服务**必须还能继续服务**（进程不许崩）');
});

test('05 直接运行 src/server.js 真的能起起来（读 PORT，能访问 /health）', { skip, timeout: 30000 }, async () => {
  const port = 30000 + Math.floor(Math.random() * 20000);   // 随机高位端口，避免撞车
  const child = spawn(process.execPath, ['src/server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port) },
    encoding: 'utf8',
  });
  let out = '';
  child.stdout.on('data', (d) => (out += d));
  child.stderr.on('data', (d) => (out += d));

  const deadline = Date.now() + 8000;
  let status = null;
  try {
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/health`);
        status = res.status;
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 250));      // 还没起来，再等等
      }
    }
    assert.strictEqual(
      status,
      200,
      `直接运行 \`node src/server.js\`（PORT=${port}）之后，8 秒内没能访问到 /health。\n` +
        `   两种可能：① 它没有 listen（只导出了 buildServer，忘了"直接运行时才监听"那一段）` +
        `② 它监听的端口不是 process.env.PORT\n   进程输出：\n${out.slice(0, 500) || '（没有任何输出）'}`
    );
  } finally {
    child.kill();
  }
});

// ── 3. 探针（只记录，不判错）───────────────────────────────────────
test('P 探针：响应头 / 404 的 body / 启动耗时（只记录，不判错）', { skip, timeout: 20000 }, async () => {
  console.log('\n探针（只记录，不判错）：');

  const res = await getOrFail('/health');
  const headers = {};
  for (const [k, v] of res.headers) headers[k] = v;
  console.log(`  · GET /health 的响应头：${JSON.stringify(headers).slice(0, 300)}`);

  const r404 = await getOrFail('/nope');
  console.log(`  · 404 的 content-type = ${r404.headers.get('content-type')}，body = ${(await r404.text()).slice(0, 120)}`);

  const r500 = await getOrFail('/boom');
  console.log(`  · 500 的 content-type = ${r500.headers.get('content-type')}，body = ${(await r500.text()).slice(0, 160)}`);

  const t0 = Date.now();
  const r = await getOrFail('/health');
  await r.text();
  console.log(`  · 一次 /health 往返耗时 ≈ ${Date.now() - t0}ms`);

  console.log('  （探针不判错：响应头里多什么字段、404 的文案怎么写，都是设计选择 —— 记进日志就行）\n');
});
