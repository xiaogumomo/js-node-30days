'use strict';
// ============================================================
// test/http.test.js —— 公共层 `requestJson` 的判据（AI 写的，实现由你写）
//
// 这层是今天"抽公共层"的产物：`llm.js` 和 `embed.js` 都调它。
// 它是**最底下那层**，所以它的判据也最"底层" —— 走的全是假服务器，不花钱。
//
// ★ 契约：
//   const { requestJson } = require('../src/http.js');
//
//   await requestJson(url, opts) -> { data, status, latencyMs, attempts }
//     data: 2xx 响应体 JSON.parse 后的对象
//     status: 成功那次的 HTTP 码；latencyMs: 这次尝试耗的毫秒；attempts: 一共试了几次
//
//   opts（全部可选）：
//     method      默认 'POST'
//     headers     默认 {}
//     body        对象 → 自动 JSON.stringify；字符串 → 原样发；undefined → 不带 body
//     timeoutMs   默认 30000（**每次尝试各自计时**）
//     retries     默认 2（= 首次之后再试几次；总次数 = retries + 1）
//     backoffMs   默认 200（退避基数：第 n 次重试前等 backoffMs * 2^(n-2)）
//     logger      默认 pino；形状 .info(obj, msg) / .warn(obj, msg)
//     logFields   默认 {} —— ★ 调用方补充的字段，**合并进每条日志记录**
//                 （llm.js 传 { model }，于是 http 记的每条都带 model → 判据 08 才认）
//
//   行为：
//     2xx → 解 JSON 返回；**body 不是合法 JSON → 抛错**（别静默返回 undefined）
//     网络错 / 超时 / 429 / 5xx → 退避重试，到上限抛最后一个错误（HttpError，带 .status）
//     其它 4xx → **不重试**，立即抛（err.status = 状态码）
//     日志：**每次尝试一条**（成功 info、失败含重试中 warn），
//           字段至少 { status, latencyMs, attempt }，外加 logFields 里的字段
// ============================================================

const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const { requestJson } = require('../src/http.js');

// ---------- 测试小工具（和 llm.test.js 同一套） ----------

function fakeLogger() {
  const records = [];
  const mk = (level) => (a, b) => {
    records.push(typeof a === 'object' && a !== null ? { level, msg: b ?? '', ...a } : { level, msg: a });
  };
  return { records, info: mk('info'), warn: mk('warn'), error: mk('error'), debug: mk('debug') };
}

function startFakeServer(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((r) => {
            if (server.closeAllConnections) server.closeAllConnections();
            server.close(() => r());
          }),
      });
    });
  });
}

function readBody(req) {
  return new Promise((resolve) => {
    let s = '';
    req.on('data', (c) => (s += c));
    req.on('end', () => resolve(s));
  });
}

function jsonRes(res, status, obj) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(obj));
}

// ---------- 判据正文 ----------

// 01 在防：方法/头/body 的编码方式不对 —— 最底层的地基
test('01 正常：POST + JSON body + 自定义头，返回 { data, status, latencyMs, attempts }', async () => {
  let hits = 0;
  let seen = null;
  const srv = await startFakeServer(async (req, res) => {
    hits++;
    seen = { method: req.method, url: req.url, auth: req.headers.authorization, body: JSON.parse(await readBody(req)) };
    jsonRes(res, 200, { ok: true, echo: 'hi' });
  });
  try {
    const r = await requestJson(`${srv.baseUrl}/things`, {
      headers: { authorization: 'Bearer token-1' },
      body: { a: 1, b: 'x' },
      logger: fakeLogger(),
    });
    assert.strictEqual(hits, 1);
    assert.strictEqual(seen.method, 'POST');
    assert.strictEqual(seen.url, '/things');
    assert.strictEqual(seen.auth, 'Bearer token-1', '自定义头要发出去');
    assert.deepStrictEqual(seen.body, { a: 1, b: 'x' }, '对象 body 要自动 JSON.stringify');
    assert.deepStrictEqual(r.data, { ok: true, echo: 'hi' });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.attempts, 1);
    assert.strictEqual(typeof r.latencyMs, 'number');
  } finally {
    await srv.close();
  }
});

// 02 在防：2xx 但 body 不是 JSON 时静默返回 undefined（下游拿到 undefined 一路烂下去）
//   ⚠️ 假响应的 body 故意**不含 "JSON" 这个词** —— 否则回显的 body 会替实现满足 /JSON/i 这条断言
test('02 2xx 但 body 不是合法 JSON → 抛错（不许静默返回 undefined）', async () => {
  const srv = await startFakeServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<html>oops</html>');
  });
  try {
    await assert.rejects(requestJson(`${srv.baseUrl}/x`, { logger: fakeLogger() }), /JSON/i);
  } finally {
    await srv.close();
  }
});

// 03 在防：把"请求本身错"（4xx）也拿去重试 —— 重发一万次还是错，纯浪费
test('03 400 → 立即抛（只打一次），err.status = 400', async () => {
  let hits = 0;
  const srv = await startFakeServer((req, res) => {
    hits++;
    jsonRes(res, 400, { error: 'bad request' });
  });
  try {
    await assert.rejects(
      requestJson(`${srv.baseUrl}/x`, { body: {}, backoffMs: 10, logger: fakeLogger() }),
      (err) => err.status === 400
    );
    assert.strictEqual(hits, 1, '400 不该重试');
  } finally {
    await srv.close();
  }
});

// 04 在防：5xx 不重试 / 重试次数算错（retries 当成总次数）
test('04 一直 500 → 重试到上限抛（retries=2 → 打 3 次），err.status = 500', async () => {
  let hits = 0;
  const srv = await startFakeServer((req, res) => {
    hits++;
    jsonRes(res, 500, { error: 'boom' });
  });
  try {
    await assert.rejects(
      requestJson(`${srv.baseUrl}/x`, { body: {}, retries: 2, backoffMs: 10, logger: fakeLogger() }),
      (err) => err.status === 500
    );
    assert.strictEqual(hits, 3, 'retries=2 → 1 次首发 + 2 次重试');
  } finally {
    await srv.close();
  }
});

// 05 在防：429（限流）当普通 4xx 处理 → 一次限流整段失败
test('05 429 一次后成功：要重试，attempts = 2', async () => {
  let hits = 0;
  const srv = await startFakeServer((req, res) => {
    hits++;
    if (hits === 1) return jsonRes(res, 429, { error: 'rate limited' });
    jsonRes(res, 200, { ok: true });
  });
  try {
    const r = await requestJson(`${srv.baseUrl}/x`, { body: {}, backoffMs: 10, logger: fakeLogger() });
    assert.strictEqual(r.data.ok, true);
    assert.strictEqual(hits, 2);
    assert.strictEqual(r.attempts, 2);
  } finally {
    await srv.close();
  }
});

// 06 在防：网络错（连接被掐）当"没救"直接放弃 —— 这类才是最该重试的
test('06 连接被掐两次后成功：网络错也要重试（attempts = 3）', async () => {
  let hits = 0;
  const srv = await startFakeServer((req, res) => {
    hits++;
    if (hits <= 2) return req.socket.destroy();
    jsonRes(res, 200, { ok: true });
  });
  try {
    const r = await requestJson(`${srv.baseUrl}/x`, { body: {}, backoffMs: 10, logger: fakeLogger() });
    assert.strictEqual(r.data.ok, true);
    assert.strictEqual(r.attempts, 3);
  } finally {
    await srv.close();
  }
});

// 07 在防：没有超时 → 服务器挂住就永远等（带 GUARD，不让判据自己挂死）
test('07 超时：服务器挂住 + timeoutMs=300 → 2 秒内抛错', async () => {
  const srv = await startFakeServer(() => {
    /* 故意不回 */
  });
  try {
    const t0 = Date.now();
    let caught = null;
    await Promise.race([
      requestJson(`${srv.baseUrl}/x`, { body: {}, timeoutMs: 300, retries: 0, logger: fakeLogger() }).catch((e) => {
        caught = e;
      }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('GUARD：3 秒了还没抛错 —— 超时没生效？')), 3000)),
    ]);
    assert.ok(caught, '应该以超时错误失败');
    assert.ok(Date.now() - t0 < 2000, `超时该在 ~300ms 生效，实际 ${Date.now() - t0}ms`);
  } finally {
    await srv.close();
  }
});

// 08 在防：静默无日志（出问题没法查）/ logFields 没合并（调用方的字段进不来）
test('08 日志：每次尝试一条，字段含 status/latencyMs/attempt + 合并 logFields', async () => {
  let hits = 0;
  const log = fakeLogger();
  const srv = await startFakeServer((req, res) => {
    hits++;
    if (hits === 1) return jsonRes(res, 500, { error: 'boom' }); // 先失败一次，制造一条 warn
    jsonRes(res, 200, { ok: true });
  });
  try {
    await requestJson(`${srv.baseUrl}/x`, {
      body: {},
      backoffMs: 10,
      logger: log,
      logFields: { model: 'test-model', role: 'chat' }, // ★ 调用方补的字段
    });
    assert.ok(log.records.length >= 2, '两次尝试应有至少 2 条记录');
    const okRec = log.records.find((r) => r.status === 200);
    assert.ok(okRec, '成功那条要带 status');
    assert.strictEqual(okRec.attempt, 2, '成功那次是第 2 次尝试');
    assert.strictEqual(typeof okRec.latencyMs, 'number');
    assert.strictEqual(okRec.model, 'test-model', 'logFields 要合并进记录');
    assert.strictEqual(okRec.role, 'chat');
    assert.ok(log.records.some((r) => r.level === 'warn'), '失败路径要留 warn');
  } finally {
    await srv.close();
  }
});
