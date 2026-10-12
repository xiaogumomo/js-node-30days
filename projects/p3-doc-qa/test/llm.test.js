'use strict';
// ============================================================
// test/llm.test.js —— llm.js 客户端的判据（AI 写的，实现由你写）
//
// 这份文件就是"待办清单"：跑 `node --test`，红着的每一条 = 还差的一块。
// 全部绿 = 今天的主体交付完成。
//
// ★ 契约（你实现时必须对齐，判据是照它写的）：
//
//   const { chat, estimateCost } = require('src/llm.js');
//
//   await chat(messages, opts) -> {
//     text: string,                       // choices[0].message.content
//     usage: { promptTokens, completionTokens },   // 从 usage.prompt_tokens / completion_tokens 映射
//     cost: number,                       // 本次调用的钱 = estimateCost(usage, model, priceTable)
//     meta: { model, status, latencyMs, attempts }
//   }
//
//   opts（全部可选，都能注入 —— 判据就是靠注入假货才测得了超时/重试）：
//     apiKey     默认 process.env.DEEPSEEK_API_KEY（没有 → 立刻抛错，错误信息里要出现 DEEPSEEK_API_KEY）
//     baseUrl    默认 process.env.LLM_BASE_URL ?? 'https://api.deepseek.com'（POST 到 `${baseUrl}/chat/completions`）
//     model      默认 process.env.LLM_MODEL ?? 'deepseek-chat'
//     timeoutMs  默认 30000（每次尝试各自计时，不是整个循环共享一个）
//     retries    默认 2（= 首次之后最多再重试 2 次 → 最多 3 次尝试）
//     backoffMs  重试间隔基数（判据不测它的曲线，但别写成 0）
//     logger     默认 pino；形状是 pino 的 .info(obj, msg) / .warn(obj, msg)
//     priceTable 形如 { '模型名': { inPerM, outPerM } }（元/百万 token）；默认表里要有 deepseek-chat
//
//   请求体（POST）：{ model, messages }，头：content-type: application/json + authorization: Bearer <key>
//   可重试：网络错 / 超时 / 429 / 5xx；不可重试：其余 4xx（400/401/403/404…，立刻抛，status 挂在 err.status 上）
//   日志：每次尝试一条 —— 成功用 info、失败（含重试中）用 warn，
//        字段至少 { model, status, latencyMs, attempt }；**任何一条里都不许出现 key 本体**
//
//   estimateCost(usage, model, priceTable) -> number
//     = usage.promptTokens/1e6 * inPerM + usage.completionTokens/1e6 * outPerM
//     价格表里没有这个模型 → 抛错（信息里带模型名）
//     客户端是无状态的：只返回"本次调用"的成本；累计 = 调用方自己加（后面 RAG 里你会用到）
//
// ★ 测试技术说明（你可以先看这几行，后面写 RAG 判据能复用）：
//   超时/重试这类"网络坏法"，用**本地假服务器**（node:http，listen(0) 拿随机端口）模拟 ——
//   不花一分钱、不看网络脸色、还跑得快。真调用的判据只有 live 那一条（单独文件、手动开关）。
// ============================================================

const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const { chat, estimateCost } = require('../src/llm.js');

// ---------- 测试用的小工具 ----------

// 价格表：故意用整数，让成本断言能精确比较（金额别拿浮点硬比，这条自己算得出来）
const TABLE = { 'test-model': { inPerM: 2, outPerM: 4 } };

// 假 logger：把每条记录存下来，给 08 号判据查
function fakeLogger() {
  const records = [];
  const mk = (level) => (a, b) => {
    records.push(typeof a === 'object' && a !== null ? { level, msg: b ?? '', ...a } : { level, msg: a });
  };
  return { records, info: mk('info'), warn: mk('warn'), error: mk('error'), debug: mk('debug') };
}

// 假服务器：起在随机端口；close() 要先断掉保持中的连接（fetch 会 keep-alive，不然关不掉）
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

// OpenAI 形状的成功响应体
function okBody(text, promptTokens = 12, completionTokens = 7) {
  return JSON.stringify({
    choices: [{ message: { role: 'assistant', content: text } }],
    usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens },
  });
}

const MSGS = [{ role: 'user', content: '用一句话解释什么是 RAG。' }];

// ---------- 判据正文 ----------

// 01 在防：URL 拼错 / 没带 key 头 / 请求体形状不对 / 响应字段取错 —— "能跑通"的地基
test('01 正常调用：请求形状 + 返回形状都对', async () => {
  let hits = 0;
  let seen = null;
  const srv = await startFakeServer(async (req, res) => {
    hits++;
    seen = { method: req.method, url: req.url, auth: req.headers.authorization, body: JSON.parse(await readBody(req)) };
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(okBody('你好，这是回答'));
  });
  try {
    const r = await chat(MSGS, { baseUrl: srv.baseUrl, apiKey: 'test-key-123', model: 'test-model', priceTable: TABLE, logger: fakeLogger() });
    assert.strictEqual(hits, 1, '应该只打一次请求');
    assert.strictEqual(seen.method, 'POST');
    assert.strictEqual(seen.url, '/chat/completions', '路径要是 /chat/completions');
    assert.strictEqual(seen.auth, 'Bearer test-key-123', 'key 要放在 Authorization: Bearer 里');
    assert.strictEqual(seen.body.model, 'test-model');
    assert.deepStrictEqual(seen.body.messages, MSGS, 'messages 要原样传过去');

    assert.strictEqual(r.text, '你好，这是回答');
    assert.strictEqual(r.usage.promptTokens, 12);
    assert.strictEqual(r.usage.completionTokens, 7);
    assert.strictEqual(r.meta.status, 200);
    assert.strictEqual(r.meta.attempts, 1);
    assert.strictEqual(r.meta.model, 'test-model');
    assert.strictEqual(typeof r.meta.latencyMs, 'number');
  } finally {
    await srv.close();
  }
});

// 02 在防：没配 key 还去发请求（浪费一次往返 + 报一个看不懂的 401）
test('02 缺 key：立刻抛错（不许打网络），错误信息里要点名 DEEPSEEK_API_KEY', async () => {
  let hits = 0;
  const srv = await startFakeServer((req, res) => {
    hits++;
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(okBody('不该到这儿'));
  });
  const saved = process.env.DEEPSEEK_API_KEY;
  delete process.env.DEEPSEEK_API_KEY;
  try {
    await assert.rejects(chat(MSGS, { baseUrl: srv.baseUrl, logger: fakeLogger() }), /DEEPSEEK_API_KEY/);
    assert.strictEqual(hits, 0, '缺 key 时一次网络都不该打');
  } finally {
    if (saved !== undefined) process.env.DEEPSEEK_API_KEY = saved;
    await srv.close();
  }
});

// 03 在防：5xx 不重试（服务器抽风一次就整段失败）／重试次数算错（把 retries 当成总次数）
test('03 一直 500：重试到上限后抛（err.status=500，命中 3 次 = 首次 + 2 次重试）', async () => {
  let hits = 0;
  const log = fakeLogger();
  const srv = await startFakeServer((req, res) => {
    hits++;
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end('{"error":"boom"}');
  });
  try {
    await assert.rejects(
      chat(MSGS, { baseUrl: srv.baseUrl, apiKey: 'k', model: 'test-model', priceTable: TABLE, retries: 2, backoffMs: 10, logger: log }),
      (err) => err.status === 500,
      '抛出来的错误上要带 status = 500'
    );
    assert.strictEqual(hits, 3, 'retries=2 应该是 1 次首发 + 2 次重试 = 3 次');
    assert.ok(log.records.some((r) => r.level === 'warn'), '失败路径要留 warn 记录');
  } finally {
    await srv.close();
  }
});

// 04 在防：429（限流）当普通 4xx 处理 → 一次限流就整段失败
test('04 429 一次后成功：要重试，且最终成功', async () => {
  let hits = 0;
  const srv = await startFakeServer((req, res) => {
    hits++;
    if (hits === 1) {
      res.writeHead(429, { 'content-type': 'application/json' });
      res.end('{"error":"rate limited"}');
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(okBody('限流后成功了'));
  });
  try {
    const r = await chat(MSGS, { baseUrl: srv.baseUrl, apiKey: 'k', model: 'test-model', priceTable: TABLE, backoffMs: 10, logger: fakeLogger() });
    assert.strictEqual(r.text, '限流后成功了');
    assert.strictEqual(hits, 2);
    assert.strictEqual(r.meta.attempts, 2, 'attempts 要反映真实尝试次数');
  } finally {
    await srv.close();
  }
});

// 05 在防：网络错（连接被掐）当成"没救"直接放弃 —— 这类才是最该重试的
test('05 连接被掐两次后成功：网络错也要重试', async () => {
  let hits = 0;
  const srv = await startFakeServer((req, res) => {
    hits++;
    if (hits <= 2) {
      req.socket.destroy(); // 模拟连接中途断掉
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(okBody('断了两次还是成功了'));
  });
  try {
    const r = await chat(MSGS, { baseUrl: srv.baseUrl, apiKey: 'k', model: 'test-model', priceTable: TABLE, backoffMs: 10, logger: fakeLogger() });
    assert.strictEqual(r.text, '断了两次还是成功了');
    assert.strictEqual(hits, 3);
    assert.strictEqual(r.meta.attempts, 3);
  } finally {
    await srv.close();
  }
});

// 06 在防：把不可重试的 4xx 也拿去重试（key 错了重试一万次也还是错，纯浪费）
test('06 400：立刻抛，一次都不许重试', async () => {
  let hits = 0;
  const srv = await startFakeServer((req, res) => {
    hits++;
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end('{"error":"bad request"}');
  });
  try {
    await assert.rejects(
      chat(MSGS, { baseUrl: srv.baseUrl, apiKey: 'k', model: 'test-model', priceTable: TABLE, backoffMs: 10, logger: fakeLogger() }),
      (err) => err.status === 400
    );
    assert.strictEqual(hits, 1, '400 不是可重试的，打一次就够');
  } finally {
    await srv.close();
  }
});

// 07 在防：没有超时 —— 服务器挂住就永远等下去（LLM 很常见：接口不回也不报错）
//     注意这条自己带 GUARD：万一"超时没实现"，判据 3 秒内自己失败，不陪它永远等
test('07 超时：服务器挂住 + timeoutMs=300 → 短时间抛错，不会永远等', async () => {
  const srv = await startFakeServer((req, res) => {
    /* 故意不回应 */
  });
  try {
    const t0 = Date.now();
    let caught = null;
    await Promise.race([
      chat(MSGS, { baseUrl: srv.baseUrl, apiKey: 'k', model: 'test-model', priceTable: TABLE, timeoutMs: 300, retries: 0, logger: fakeLogger() }).catch((e) => {
        caught = e;
      }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('GUARD：3 秒了还没抛错 —— 超时没生效？')), 3000)),
    ]);
    const elapsed = Date.now() - t0;
    assert.ok(caught, '应该以超时错误失败');
    assert.ok(elapsed < 2000, `超时该在 ~300ms 生效，实际 ${elapsed}ms`);
  } finally {
    await srv.close();
  }
});

// 08 在防：静默无日志（出问题没法查）／把 key 写进日志（安全级）
test('08 日志：成功记一条带 model/status/latencyMs/attempt 的记录；任何一条里都不许出现 key', async () => {
  const log = fakeLogger();
  const srv = await startFakeServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(okBody('记日志'));
  });
  try {
    await chat(MSGS, { baseUrl: srv.baseUrl, apiKey: 'sk-super-secret-123', model: 'test-model', priceTable: TABLE, logger: log });
    assert.ok(log.records.length >= 1, '至少要有 1 条记录');
    const ok = log.records.find((r) => r.status === 200);
    assert.ok(ok, '成功那条要带 status');
    assert.strictEqual(typeof ok.latencyMs, 'number');
    assert.strictEqual(ok.model, 'test-model');
    assert.strictEqual(ok.attempt, 1);
    assert.ok(!JSON.stringify(log.records).includes('sk-super-secret-123'), '日志里出现了 key 本体 ✗（安全级）');
  } finally {
    await srv.close();
  }
});

// 09 在防：成本算成"看心情"（漏了除 1e6 / 把输出价当输入价）／模型不在表里时静默算成 0
test('09 estimateCost 纯函数：整数价格表精确算 + 未知模型抛错', () => {
  const c = estimateCost({ promptTokens: 1000000, completionTokens: 0 }, 'test-model', TABLE);
  assert.strictEqual(c, 2, '1e6 输入 token × 2 元/百万 = 2 元');
  const c2 = estimateCost({ promptTokens: 0, completionTokens: 500000 }, 'test-model', TABLE);
  assert.strictEqual(c2, 2, '0.5e6 输出 token × 4 元/百万 = 2 元');
  assert.throws(() => estimateCost({ promptTokens: 1, completionTokens: 1 }, 'no-such-model', TABLE), /no-such-model/);
});

// 10 在防：返回的 cost 和 usage 对不上（两处各算各的）／没把 usage 从响应里映射出来
test('10 成本集成：一次真实调用后 cost = 按注入价格表算出的精确值', async () => {
  const srv = await startFakeServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(okBody('成本测试', 500000, 250000));
  });
  try {
    const r = await chat(MSGS, { baseUrl: srv.baseUrl, apiKey: 'k', model: 'test-model', priceTable: TABLE, logger: fakeLogger() });
    assert.strictEqual(r.usage.promptTokens, 500000);
    assert.strictEqual(r.usage.completionTokens, 250000);
    assert.strictEqual(r.cost, 2, '0.5e6×2 + 0.25e6×4 = 1 + 1 = 2 元');
  } finally {
    await srv.close();
  }
});
