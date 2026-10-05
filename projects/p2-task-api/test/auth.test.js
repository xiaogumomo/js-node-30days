// Day 19 判据：验收项目 2 的**认证与隔离**（注册 / 登录 / 保护路由 / 只能看自己的）（AI 写）
//
// 跑法：node --test projects/p2-task-api/test/auth.test.js
//
// 契约（也写在 notes/day19-auth.md 里）：
//   · 迁移：`db/migrations/002_users.sql` 建 **`users` 表**（邮箱唯一 + 密码**哈希**），
//     并给 `tasks` 加一个"属于谁"的列（名字你自己定，判据不看列名，只看行为）
//   · 端点：
//     POST /auth/register  body {"email":"…","password":"…"} → **201** + JSON
//                          ⚠️ **返回体里不能有密码**；**数据库里也不能有明文**（判据会自己去读库）
//                          邮箱已存在 → **409 / 400**（不能 201，也不能 500）
//     POST /auth/login     body {"email":"…","password":"…"} → **200 + {"token":"…"}**
//                          密码错 / 没这个邮箱 → **401**
//     GET  /tasks 等任务接口 → **必须带 `Authorization: Bearer <token>`**
//                          · 不带 / token 是乱码 → **401 + JSON**（不是 500、不是 200）
//                          · 带上 → 正常（列表 200 / 创建 201 …）
//   · **隔离**：每个 token 只能看到 / 改到 / 删到**自己的** tasks（别人的一律 404，不是 403 —— 403 会泄露"存在"）
//
// 必过 9 条 + 探针 1 条 = 本文件 10 条 test()。**只看 HTTP 行为 + 库里没有明文**，不挑哈希算法 / 不挑 JWT 库
// （`node:crypto` 的 scrypt、bcrypt、argon2 都行；JWT 手写或用库都行）。全打本地随机端口 + 临时 DB，跑完删。

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const ENTRY = path.join(ROOT, 'src', 'server.js');

// ── 0. 临时 DB（判据自己造，跑完删）────────────────────────────────
const labDir = fs.mkdtempSync(path.join(os.tmpdir(), 'p2-auth-'));
const DB_FILE = path.join(labDir, 'tasks.db');
process.env.DB_FILE = DB_FILE;

// ── 1. 加载探针（照 server.test.js）───────────────────────────────
const exists = fs.existsSync(ENTRY);
if (!exists) console.log('\n⚠️ 还没看到 projects/p2-task-api/src/server.js —— 这份判据是拿来验收它的。\n');
const probe = exists
  ? spawnSync(process.execPath, ['-e', `require(${JSON.stringify(ENTRY)})`], { encoding: 'utf8', timeout: 20000 })
  : { status: 0, stdout: '', stderr: '' };
const probeOut = `${probe.stdout || ''}${probe.stderr || ''}`;
const probeCrash = exists && /SyntaxError|ReferenceError|TypeError|Cannot find module|ERR_MODULE_NOT_FOUND/.test(probeOut);

function moduleTrouble() {
  if (!exists) return '还没看到 projects/p2-task-api/src/server.js';
  if (probeCrash)
    return (
      `加载 src/server.js 时就炸了：\n   ${probeOut.trim().split('\n').slice(0, 3).join('\n   ')}\n` +
      (/Cannot find module|ERR_MODULE_NOT_FOUND/.test(probeOut)
        ? '   → 这是 **require 的路径 / 包名**写错了（不是语法问题：`node --check` 会通过）'
        : '   → 先 `node --check src/server.js`；再 `node src/server.js` 跑一次（启动报错会指行号）')
    );
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
    '\n判据覆盖面：00–08 共 9 条必过 + P 探针 1 条 = 本文件 10 条 test()。\n' +
      '（报绿之前看一眼上面的 pass 数：大半是 skipped，那不是绿，是没跑起来。）'
  );
});

// ── 2. 起服务（框架无关；同 server.test.js）────────────────────────
let server = null;
let base = null;

async function listenWith(s) {
  let handle = s;
  await new Promise((resolve, reject) => {
    const cb = (err) => (err ? reject(err) : resolve());
    try {
      const ret = s.listen({ port: 0, host: '127.0.0.1' }, cb);
      if (ret && typeof ret.then === 'function') ret.catch(reject);
      else if (ret && typeof ret.address === 'function') handle = ret;
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
  if (!addr || typeof addr.port !== 'number') throw new Error('拿不到监听端口 —— buildServer() 要返回"能被 listen 的对象"');
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

/** 带超时的请求；token 传了就带 Authorization */
async function req(method, p, body, token, ms = 5000) {
  let timer;
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = `Bearer ${token}`;
  try {
    const res = await Promise.race([
      fetch(base + p, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }),
      new Promise((_, rej) => {
        timer = setTimeout(() => rej(new Error(`${method} ${p} 在 ${ms}ms 内没响应 —— 服务大概率崩了，或压根没起来`)), ms);
      }),
    ]);
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* 不是 JSON */
    }
    return { status: res.status, ct: res.headers.get('content-type') ?? '', json, text };
  } finally {
    clearTimeout(timer);
  }
}

const uniqueEmail = (tag) => `${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`;

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
    fs.rmSync(labDir, { recursive: true, force: true });
  } catch {
    /* 清理失败不掩盖判据结果 */
  }
});

// ── 3. 必过项 ──────────────────────────────────────────────────────
test('00 模块能被加载，并导出 buildServer 函数', () => {
  assert.ok(
    ok,
    (loadError ? `加载 src/server.js 时报错：${loadError.message}` : moduleTrouble()) +
      '\n   契约：`module.exports = { buildServer }`；`buildServer()` 不许自己 listen；**库路径在它被调用时读 `process.env.DB_FILE`**。'
  );
});

test('01 注册 → 201，而且**密码没有明文落库 / 没有回给客户端**', { skip, timeout: 15000 }, async () => {
  assert.ok(base, '服务没起来（见上面的警告）');
  const email = uniqueEmail('reg');
  const password = 'P@ssw0rd-明文标记-9F3';
  const res = await req('POST', '/auth/register', { email, password });
  assert.strictEqual(res.status, 201, `注册应该 201，实际 ${res.status}（body: ${res.text.slice(0, 200)}）`);

  // ① 返回体里不能有明文
  assert.ok(!res.text.includes(password), `注册的响应里出现了明文密码！body: ${res.text.slice(0, 200)}`);

  // ② 库里也不能有明文 —— 判据自己去读库（schema 无关：只要求没这个子串）
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(DB_FILE, { readOnly: true });
  try {
    const users = db.prepare('SELECT * FROM users').all();
    assert.ok(users.length >= 1, '`users` 表里应该有刚注册的那行');
    const dump = JSON.stringify(users);
    assert.ok(
      !dump.includes(password),
      '**密码明文出现在 `users` 表里了** —— 必须存哈希（`node:crypto` 的 `scrypt` / bcrypt / argon2 都行）\n   ' +
        `实际那一行：${dump.slice(0, 300)}`
    );
  } finally {
    db.close();
  }
});

test('02 同一个邮箱注册两次 → 409/400（不是 201、更不能 500）', { skip, timeout: 15000 }, async () => {
  const email = uniqueEmail('dup');
  const first = await req('POST', '/auth/register', { email, password: 'aaaa1111' });
  assert.strictEqual(first.status, 201, `第一次注册应该 201，实际 ${first.status}`);
  const second = await req('POST', '/auth/register', { email, password: 'bbbb2222' });
  assert.ok(
    second.status === 409 || second.status === 400,
    `重复邮箱应该 409 或 400，实际 ${second.status}（body: ${second.text.slice(0, 200)}）—— 靠数据库的 UNIQUE 约束挡住，再把它翻译成 409/400`
  );
});

test('03 登录成功 → 200 + 非空 token', { skip, timeout: 15000 }, async () => {
  const email = uniqueEmail('login');
  await req('POST', '/auth/register', { email, password: 'good-pass-123' });
  const res = await req('POST', '/auth/login', { email, password: 'good-pass-123' });
  assert.strictEqual(res.status, 200, `正确密码应该 200，实际 ${res.status}（body: ${res.text.slice(0, 200)}）`);
  assert.ok(typeof res.json?.token === 'string' && res.json.token.length > 10, `应该返回 {"token":"…"}，实际 ${res.text.slice(0, 200)}`);
});

test('04 密码错 / 没这个邮箱 → 401', { skip, timeout: 15000 }, async () => {
  const email = uniqueEmail('wrong');
  await req('POST', '/auth/register', { email, password: 'right-pass' });
  const bad = await req('POST', '/auth/login', { email, password: 'wrong-pass' });
  assert.strictEqual(bad.status, 401, `密码错应该 401，实际 ${bad.status}`);
  const noUser = await req('POST', '/auth/login', { email: uniqueEmail('nobody'), password: 'whatever' });
  assert.strictEqual(noUser.status, 401, `邮箱不存在也应该 401（别用 404 泄露"这个邮箱注册过"），实际 ${noUser.status}`);
});

test('05 不带 token 访问 /tasks → 401 + JSON', { skip, timeout: 15000 }, async () => {
  const res = await req('GET', '/tasks');
  assert.strictEqual(res.status, 401, `没带 token 应该 401，实际 ${res.status}（如果 200 = 谁都能看你的数据；如果 500 = 没处理这个分支）`);
  assert.match(res.ct, /json/, `401 的 body 也应该是 JSON（实际 ${res.ct}）`);
  assert.ok(res.json && typeof res.json === 'object', `401 的 body 应该是个对象，实际 ${res.text.slice(0, 200)}`);
});

test('06 带 token 访问 /tasks → 200 + 数组', { skip, timeout: 15000 }, async () => {
  const email = uniqueEmail('ok');
  await req('POST', '/auth/register', { email, password: 'pass-123456' });
  const token = (await req('POST', '/auth/login', { email, password: 'pass-123456' })).json?.token;
  const res = await req('GET', '/tasks', undefined, token);
  assert.strictEqual(res.status, 200, `带正确 token 应该 200，实际 ${res.status}（body: ${res.text.slice(0, 200)}）`);
  assert.ok(Array.isArray(res.json), `应该是数组，实际 ${res.text.slice(0, 200)}`);
});

test('07 **隔离**：A 的任务，B 看不到、也改不到（一律 404）', { skip, timeout: 20000 }, async () => {
  const loginAs = async (tag) => {
    const email = uniqueEmail(tag);
    await req('POST', '/auth/register', { email, password: 'pass-123456' });
    return (await req('POST', '/auth/login', { email, password: 'pass-123456' })).json.token;
  };
  const tokenA = await loginAs('a');
  const tokenB = await loginAs('b');

  const made = await req('POST', '/tasks', { title: 'A 的秘密任务' }, tokenA);
  assert.strictEqual(made.status, 201, `A 建任务应该 201，实际 ${made.status}（body: ${made.text.slice(0, 200)}）`);
  const aTaskId = made.json?.id;
  assert.ok(aTaskId !== undefined, `创建要返回 id，实际 ${made.text.slice(0, 200)}`);

  const listB = await req('GET', '/tasks', undefined, tokenB);
  assert.ok(
    Array.isArray(listB.json) && !listB.json.some((t) => String(t?.id) === String(aTaskId)),
    `B 的列表里**不该**出现 A 的任务 —— 这是"越权"（每个任务要归属到人，查询时按当前用户过滤）\n   实际：${listB.text.slice(0, 300)}`
  );

  const getB = await req('GET', `/tasks/${aTaskId}`, undefined, tokenB);
  assert.strictEqual(getB.status, 404, `B 直接按 id 查 A 的任务，应该 404（不给 403 —— 那会泄露"它存在"），实际 ${getB.status}`);

  const patchB = await req('PATCH', `/tasks/${aTaskId}`, { title: '被 B 改了' }, tokenB);
  assert.strictEqual(patchB.status, 404, `B 改 A 的任务应该 404，实际 ${patchB.status}`);

  const delB = await req('DELETE', `/tasks/${aTaskId}`, undefined, tokenB);
  assert.strictEqual(delB.status, 404, `B 删 A 的任务应该 404，实际 ${delB.status}`);
});

test('08 乱码 / 伪造的 token → 401（不能 500）', { skip, timeout: 15000 }, async () => {
  const res = await req('GET', '/tasks', undefined, 'not-a-real-token');
  assert.strictEqual(res.status, 401, `坏 token 应该 401（别让它 500），实际 ${res.status}（body: ${res.text.slice(0, 200)}）`);
});

// ── 4. 探针（只记录，不判错）───────────────────────────────────────
test('P 探针：token 结构 / 库里那条哈希长什么样 / 迁移文件（只记录，不判错）', { skip, timeout: 20000 }, async () => {
  console.log('\n探针（只记录，不判错）：');

  const email = uniqueEmail('probe');
  await req('POST', '/auth/register', { email, password: 'probe-pass-1' });
  const token = (await req('POST', '/auth/login', { email, password: 'probe-pass-1' })).json?.token ?? '';
  const parts = String(token).split('.');
  console.log(`  · token 分成 ${parts.length} 段（标准 JWT 是 3 段：header.payload.signature）`);
  try {
    const head = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    console.log(`  · token 头部：${JSON.stringify(head)}（看 alg，比如 HS256）`);
  } catch {
    console.log('  · token 头部解不出来（不是 base64url 的 JSON —— 如果你用了库，它可能是另一种格式，不算错）');
  }

  try {
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(DB_FILE, { readOnly: true });
    const row = db.prepare('SELECT * FROM users LIMIT 1').get();
    const dump = JSON.stringify(row);
    console.log(`  · users 表里那一行长这样：${dump.slice(0, 160)}`);
    const looksHashed = /\$2[aby]\$|\$argon2|scrypt|[0-9a-f]{32,}/.test(dump);
    console.log(`  · 看起来像哈希吗：${looksHashed ? '像 ✓' : '⚠️ 不太像（也可能只是格式特殊，自己确认一下）'}`);
    db.close();
  } catch (e) {
    console.log(`  · 读库失败：${e.message}`);
  }

  const found = ['db/migrations'].filter((p) => fs.existsSync(path.join(ROOT, p)));
  console.log(`  · 迁移目录：${found.length ? found.join('、') : '⚠️ 没找到（迁移文件要进 git）'}`);

  console.log('  （探针不判错：哈希算法、token 格式、列名怎么起，都是设计选择 —— 记进日志就行）\n');
});
