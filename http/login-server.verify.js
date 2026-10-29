#!/usr/bin/env node
// ============================================================
// http/login-server.verify.js —— 产物 3 的判据（AI 写，他跑）
//
// 用法：node http/login-server.verify.js
// 前提：同目录下有 login-server.js，监听 127.0.0.1:PORT（默认 9001）
//
// 契约（判据照它写，实现照它写）：
//   POST /api/register  {email,password} → 201 {id,email} | 400 缺字段 | 409 已存在
//   POST /api/login     {email,password} → 200 {email} + Set-Cookie: sid=... | 401
//   GET  /api/me                          → 200 {email}（带 Cookie）| 401（无/无效 Cookie）
//   未知路径 → 404 ；存在的路径 + 错方法 → 405
//
// 设计说明：
//   · 用 Node 自带的 fetch，不引第三方
//   · Cookie 从 Set-Cookie 里取第一段（`sid=xxx`），后续手动带回去
//   · 每次跑用一个新 email（时间戳），不依赖服务端清空状态
// ============================================================
'use strict';
const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = Number(process.env.PORT || 9001);
const BASE = `http://127.0.0.1:${PORT}`;
const results = [];
function ok(name, cond, extra) {
  results.push([cond, name]);
  console.log(`${cond ? '✓' : '✗'} ${name}${extra ? '  — ' + extra : ''}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const post = (p, body) =>
  fetch(BASE + p, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
const j = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

(async () => {
  const srv = spawn(process.execPath, [path.join(__dirname, 'login-server.js')], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let out = '';
  srv.stdout.on('data', (d) => (out += d));
  srv.stderr.on('data', (d) => (out += d));
  await sleep(900);

  const email = `u${Date.now()}@test.com`;

  try {
    const ping = await fetch(BASE + '/api/nope').catch(() => null);
    ok('1 服务能启动、能连上', ping !== null);

    const r1 = await post('/api/register', { email, password: 'p1' });
    const b1 = await j(r1);
    ok(
      '2 register → 201，返回 id + email',
      r1.status === 201 && b1.id !== undefined && b1.email === email,
      `status=${r1.status} body=${JSON.stringify(b1)}`
    );

    const r2 = await post('/api/register', { email, password: 'p2' });
    ok('3 重复 register → 409', r2.status === 409, `status=${r2.status}`);

    const r3 = await post('/api/register', { email: 'x@y.z' }); // 缺 password
    ok('4 缺 password → 400', r3.status === 400, `status=${r3.status}`);

    const r4 = await post('/api/login', { email, password: 'p1' });
    const raw = r4.headers.getSetCookie ? r4.headers.getSetCookie() : [r4.headers.get('set-cookie') || ''];
    const cookie = String(raw[0] || '').split(';')[0].trim();
    ok(
      '5 login 正确 → 200 且带 Set-Cookie',
      r4.status === 200 && cookie.startsWith('sid=') && cookie.length > 4,
      `status=${r4.status} cookie="${cookie}"`
    );

    const r5 = await post('/api/login', { email, password: 'wrong-pass' });
    ok('6 login 错密码 → 401', r5.status === 401, `status=${r5.status}`);

    const r6 = await fetch(BASE + '/api/me');
    ok('7 /api/me 不带 Cookie → 401', r6.status === 401, `status=${r6.status}`);

    const r7 = await fetch(BASE + '/api/me', { headers: { cookie } });
    const b7 = await j(r7);
    ok(
      '8 /api/me 带 Cookie → 200 且 email 正确',
      r7.status === 200 && JSON.stringify(b7).includes(email),
      `status=${r7.status} body=${JSON.stringify(b7)}`
    );

    const r8 = await fetch(BASE + '/api/nope');
    ok('9 未知路径 → 404', r8.status === 404, `status=${r8.status}`);

    const r9 = await fetch(BASE + '/api/register'); // 存在的路径，但方法是 GET
    ok('10 存在的路径 + 错方法 → 405', r9.status === 405, `status=${r9.status}`);
  } catch (e) {
    ok('运行阶段抛错', false, e.message);
  } finally {
    srv.kill();
  }

  const pass = results.filter((r) => r[0]).length;
  console.log(`\n${pass}/${results.length} 通过`);
  if (pass !== results.length) {
    console.log('--- 服务端输出 ---\n' + out);
    process.exitCode = 1;
  }
})();
