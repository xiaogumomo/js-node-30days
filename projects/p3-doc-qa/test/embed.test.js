'use strict';
// ============================================================
// test/embed.test.js —— 向量化 `embed` 的判据（AI 写的，实现由你写）
//
// 走的全是假服务器（不花一分钱、不看网络脸色）。真调用那条单独放
// （`embed.live.test.js`，要设 LLM_LIVE=1 + .env 里有真 key 才跑）。
//
// ★ 契约：
//   const { embed } = require('../src/embed.js');
//
//   await embed(texts, opts) -> { vectors, usage, cost, meta }
//     vectors: number[][]   与 texts **同序、同长**（第 i 条文本 → vectors[i]）
//     usage:   { promptTokens, totalTokens }   从响应 usage.prompt_tokens / total_tokens 映射
//     cost:    number        = estimateCost(usage, model, priceTable)
//     meta:    { model, status, latencyMs, attempts }   ← 来自公共层 requestJson
//
//   opts（全部可选）：
//     apiKey     默认 process.env.EMBED_API_KEY（没有 → 立刻抛错，信息里要点名 EMBED_API_KEY）
//     baseUrl    默认 process.env.EMBED_BASE_URL ?? 'https://open.bigmodel.cn/api/paas/v4'
//     model      默认 process.env.EMBED_MODEL ?? 'embedding-3'（智谱，实测 **2048 维**）
//     timeoutMs / retries / backoffMs / logger   透传给 requestJson
//     priceTable 默认内置表（inPerM: 0 —— 现在吃新用户赠送包；**价格待照官网核**）
//
//   行为：
//     **内部必须调 `src/http.js` 的 `requestJson`**（别再抄一套重试）→ 判据 08 就是守这条
//     请求：POST `${baseUrl}/embeddings`，头 authorization: Bearer <key>，体 { model, input: texts }
//     texts 为空数组 → 直接返回（**不发请求**）
//     texts 不是数组 / 含非字符串 → 抛 TypeError（**不发请求**）
//     **返回条数 ≠ 输入条数 → 抛错**；**各条维度不一致 → 抛错**（这两条防"静默对不齐"）
// ============================================================

const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const { embed } = require('../src/embed.js');

// ---------- 小工具 ----------

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

// 按"文本 → 向量"的固定映射回一个 OpenAI 形状的 embeddings 响应
const VEC = { 甲: [1, 0, 0], 乙: [0, 1, 0], 丙: [0, 0, 1] };

function embBody(input, opts = {}) {
  const rows = input.map((t, i) => ({ object: 'embedding', index: i, embedding: opts.weird ? (i === 0 ? [1, 2] : [1, 2, 3]) : VEC[t] ?? [i, i, i] }));
  const keep = opts.dropLast ? rows.slice(0, -1) : rows;
  return JSON.stringify({ object: 'list', model: 'embedding-3', data: keep, usage: { prompt_tokens: opts.tokens ?? input.length * 3, total_tokens: opts.tokens ?? input.length * 3 } });
}

const KEY = 'sk-test-embed-1';

// ---------- 判据正文 ----------

// 01 在防：URL 拼错 / key 头没发 / body 形状不对 / 返回结构取错
test('01 正常：请求形状对 + vectors 按序返回 + meta/usage 映射对', async () => {
  let hit = null;
  const srv = await startFakeServer(async (req, res) => {
    const raw = await readBody(req);
    hit = { method: req.method, url: req.url, auth: req.headers.authorization, body: JSON.parse(raw) };
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(embBody(JSON.parse(raw).input));
  });
  try {
    const r = await embed(['甲', '乙', '丙'], { baseUrl: srv.baseUrl, apiKey: KEY, logger: fakeLogger() });
    assert.strictEqual(hit.method, 'POST');
    assert.strictEqual(hit.url, '/embeddings', '路径要拼成 /embeddings（baseUrl 已含 /v1）');
    assert.strictEqual(hit.auth, `Bearer ${KEY}`);
    assert.strictEqual(hit.body.model, 'embedding-3');
    assert.deepStrictEqual(hit.body.input, ['甲', '乙', '丙'], 'input 要原样传数组');
    assert.deepStrictEqual(r.vectors, [VEC['甲'], VEC['乙'], VEC['丙']]);
    assert.strictEqual(r.meta.attempts, 1);
    assert.strictEqual(r.meta.status, 200);
    assert.strictEqual(r.usage.promptTokens, 9, 'usage.prompt_tokens 要映射成 promptTokens');
  } finally {
    await srv.close();
  }
});

// 02 在防：多条输入时顺序错位（第 2 条的向量配到第 1 条文本上 —— 静默、且下游全错）
test('02 多条输入顺序不错位：反序输入 → 向量也跟着反序', async () => {
  const srv = await startFakeServer(async (req, res) => {
    const input = JSON.parse(await readBody(req)).input;
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(embBody(input));
  });
  try {
    const r = await embed(['乙', '甲', '丙'], { baseUrl: srv.baseUrl, apiKey: KEY, logger: fakeLogger() });
    assert.deepStrictEqual(r.vectors[0], VEC['乙'], '第 1 条应是乙的向量');
    assert.deepStrictEqual(r.vectors[1], VEC['甲']);
    assert.deepStrictEqual(r.vectors[2], VEC['丙']);
    assert.strictEqual(r.vectors.length, 3);
  } finally {
    await srv.close();
  }
});

// 03 在防：返回条数对不上还照单全收（下游 chunk 和 vector 会错位 / 缺一条）
test('03 返回条数 ≠ 输入条数 → 抛错', async () => {
  const srv = await startFakeServer(async (req, res) => {
    const input = JSON.parse(await readBody(req)).input;
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(embBody(input, { dropLast: true })); // 少回一条
  });
  try {
    await assert.rejects(embed(['甲', '乙', '丙'], { baseUrl: srv.baseUrl, apiKey: KEY, logger: fakeLogger() }), /条数|不一致/);
  } finally {
    await srv.close();
  }
});

// 04 在防：各条维度不一致还照收（后面做余弦相似度时会算出 NaN / 维度对不上）
test('04 各条向量维度不一致 → 抛错', async () => {
  const srv = await startFakeServer(async (req, res) => {
    const input = JSON.parse(await readBody(req)).input;
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(embBody(input, { weird: true })); // 第 1 条 2 维、其它 3 维
  });
  try {
    await assert.rejects(embed(['甲', '乙'], { baseUrl: srv.baseUrl, apiKey: KEY, logger: fakeLogger() }), /维度/);
  } finally {
    await srv.close();
  }
});

// 05 在防：空数组也去发请求（白花钱 + 有些接口对空 input 直接报错）
test('05 空数组 → 不发请求，直接返回空结果', async () => {
  let hits = 0;
  const srv = await startFakeServer((req, res) => {
    hits++;
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(embBody([]));
  });
  try {
    const r = await embed([], { baseUrl: srv.baseUrl, apiKey: KEY, logger: fakeLogger() });
    assert.strictEqual(hits, 0, '空数组不该发请求');
    assert.deepStrictEqual(r.vectors, []);
    assert.strictEqual(r.cost, 0);
  } finally {
    await srv.close();
  }
});

// 06 在防：非字符串混进去（数组/数字/undefined）→ 拼出怪 body 或静默丢内容
test('06 元素不是字符串 → 抛 TypeError，且不发请求', async () => {
  let hits = 0;
  const srv = await startFakeServer((req, res) => {
    hits++;
    res.end('{}');
  });
  try {
    await assert.rejects(embed(['甲', null], { baseUrl: srv.baseUrl, apiKey: KEY, logger: fakeLogger() }), TypeError);
    await assert.rejects(embed(['甲', 123], { baseUrl: srv.baseUrl, apiKey: KEY, logger: fakeLogger() }), TypeError);
    await assert.rejects(embed('不是数组', { baseUrl: srv.baseUrl, apiKey: KEY, logger: fakeLogger() }), TypeError);
    assert.strictEqual(hits, 0);
  } finally {
    await srv.close();
  }
});

// 07 在防：没配 key 还去发请求（拿一个看不懂的 401）
test('07 缺 key → 立刻抛（信息里点名 EMBED_API_KEY），零请求', async () => {
  let hits = 0;
  const srv = await startFakeServer((req, res) => {
    hits++;
    res.end('{}');
  });
  const saved = process.env.EMBED_API_KEY;
  delete process.env.EMBED_API_KEY;
  try {
    await assert.rejects(embed(['甲'], { baseUrl: srv.baseUrl, logger: fakeLogger() }), /EMBED_API_KEY/);
    assert.strictEqual(hits, 0);
  } finally {
    if (saved !== undefined) process.env.EMBED_API_KEY = saved;
    await srv.close();
  }
});

// 08 ★ 在防：embed 自己又抄了一套重试（"抽公共层"白抽）—— 这条守今天的重构成果
test('08 重试走公共层：服务器先 500 一次 → 成功，且 attempts = 2', async () => {
  let hits = 0;
  const srv = await startFakeServer(async (req, res) => {
    hits++;
    const input = JSON.parse(await readBody(req)).input;
    if (hits === 1) {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end('{"error":"boom"}');
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(embBody(input));
  });
  try {
    const r = await embed(['甲'], { baseUrl: srv.baseUrl, apiKey: KEY, backoffMs: 10, logger: fakeLogger() });
    assert.strictEqual(hits, 2, '5xx 应该被重试（说明复用了公共层）');
    assert.strictEqual(r.meta.attempts, 2);
    assert.deepStrictEqual(r.vectors[0], VEC['甲']);
  } finally {
    await srv.close();
  }
});

// 09 在防：成本两处各算各的 / 价格表读不到（NaN）
test('09 成本：按注入的价格表精确算', async () => {
  const srv = await startFakeServer(async (req, res) => {
    const input = JSON.parse(await readBody(req)).input;
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(embBody(input, { tokens: 1000000 })); // 100 万 input token
  });
  try {
    const r = await embed(['甲'], {
      baseUrl: srv.baseUrl,
      apiKey: KEY,
      logger: fakeLogger(),
      priceTable: { 'embedding-3': { inPerM: 2 } },
    });
    assert.strictEqual(r.usage.promptTokens, 1000000);
    assert.strictEqual(r.cost, 2, '100 万 token × 2 元/百万 = 2 元');
  } finally {
    await srv.close();
  }
});
