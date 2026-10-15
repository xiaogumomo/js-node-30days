'use strict';
// ============================================================
// test/ask.test.js —— RAG 主流程 `ask` 的判据（AI 写的，实现由你写）
//
// p3 的**第 6 个模块**：它自己不碰网络，只把 chunk / embed / store / llm
// 四个模块按顺序接起来 —— 是唯一"串线"的那个。
//
// ★ 契约（照它写；和 scratch/04 对照版**只差一处**，见最下面那两行）：
//
//   const { ask } = require('../src/ask.js');
//
//   await ask(question, { store, chunks, topK = 3, embedOpts = {}, chatOpts = {} })
//     -> { answer: string, sources: [{ index, score, start, end }], cost: number, meta: object }
//
//     question    用户的问题（字符串）
//     store       createStore() 造出来的库
//     chunks      chunkText() 切出来的**原始块数组** —— 溯源要回查它拿 start/end
//     topK        默认 3，**要原样传给 store.search(q.vectors[0], topK)**
//     embedOpts / chatOpts
//                 ★★ 就是和对照版差的那一处：透传给 embed([question], embedOpts)
//                 和 chat(messages, chatOpts)。默认 {}（正常跑走 env）；
//                 判据靠它们把两个**假服务器**分别塞进 embed 和 chat —— 不花一分钱。
//
//   四步（和对照版一致）：
//     ① 只 embed **问题**（块在入库时已经 embed 过了）→ store.search(q.vectors[0], topK)
//     ② 组 prompt：命中块拼成【资料】（带编号），和问题一起进 messages；system 立规矩
//     ③ chat(messages, chatOpts)
//     ④ 用命中的 h.index **回查 chunks** 拿 start/end → sources；cost = chat + embed 两笔相加
//
//   跑法：node --test test/ask.test.js（全量 node --test 也会带到它：43 + 7 = 50）
// ============================================================

const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const { ask } = require('../src/ask.js');
const { createStore } = require('../src/store.js');

// 保险：本文件全程用假服务器 + 注入 key。把真 key 从环境里摘掉 ——
// 万一漏传了 embedOpts/chatOpts，会直接报"缺 key"（不花钱），而不是打到真 API。
delete process.env.DEEPSEEK_API_KEY;
delete process.env.EMBED_API_KEY;

// ---------- 测试用的小工具 ----------

// 假 logger（和 llm.test.js 同一手法：把记录收进口袋，别让 pino 刷屏）
function fakeLogger() {
  const records = [];
  const mk = (level) => (a, b) => {
    records.push(typeof a === 'object' && a !== null ? { level, msg: b ?? '', ...a } : { level, msg: a });
  };
  return { records, info: mk('info'), warn: mk('warn'), error: mk('error'), debug: mk('debug') };
}

function readBody(req) {
  return new Promise((resolve) => {
    let s = '';
    req.on('data', (c) => (s += c));
    req.on('end', () => resolve(s));
  });
}

// 一个假服务器扮两个角色，按路径分流；顺手把收到的请求体记下来（给 02/03 查）
function startRagServer({ answer = '资料里说：判据结果那栏要回填实际值。' } = {}) {
  const seen = { embed: [], chat: [] };
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      const body = JSON.parse(await readBody(req));
      if (req.url === '/embeddings') {
        seen.embed.push(body);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({
          data: [{ embedding: [1, 0, 0] }],
          usage: { prompt_tokens: 1000000, total_tokens: 1000000 },
        }));
        return;
      }
      if (req.url === '/chat/completions') {
        seen.chat.push(body);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({
          choices: [{ message: { role: 'assistant', content: answer } }],
          usage: { prompt_tokens: 500000, completion_tokens: 1000000 },
        }));
        return;
      }
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end('{"error":"不知道这个路径"}');
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        seen,
        close: () =>
          new Promise((r) => {
            if (server.closeAllConnections) server.closeAllConnections();
            server.close(() => r());
          }),
      });
    });
  });
}

// 每个用例同一套账单：embed = 1e6 token × 1 元/百万 = 1 元
//                    chat  = 0.5e6×1 + 1e6×2 = 0.5 + 2 = 2.5 元 → 合计 3.5 元
const EMBED_PRICE = { 'em-test': { inPerM: 1, outPerM: 0 } };
const CHAT_PRICE = { 'chat-test': { inPerM: 1, outPerM: 2 } };

function optsFor(srv) {
  return {
    embedOpts: { baseUrl: srv.baseUrl, apiKey: 'k-embed', model: 'em-test', priceTable: EMBED_PRICE, logger: fakeLogger() },
    chatOpts: { baseUrl: srv.baseUrl, apiKey: 'k-chat', model: 'chat-test', priceTable: CHAT_PRICE, logger: fakeLogger() },
  };
}

// 库里的四块：向量是三维假向量，和提问向量 [1,0,0] 的余弦各不相同 → 排序唯一确定
const CHUNKS = [
  { text: '第一块：今天天气不错，出去走走。', index: 0, start: 0, end: 40, vector: [0, 1, 0] }, // cos 0
  { text: '第二块：判据的牙要对着坏法长。', index: 1, start: 41, end: 80, vector: [1, 1, 0] }, // ≈0.707
  { text: '第三块：唯一标记-乙-9527，这段只有库里才有。', index: 2, start: 81, end: 120, vector: [1, 0, 0] }, // 1.0 ← 最像
  { text: '第四块：随便一段占位文字。', index: 3, start: 121, end: 160, vector: [0.5, 1, 0] }, // ≈0.447
];

const QUESTION = '判据结果那栏要回填什么？';

function seededStore() {
  const store = createStore();
  store.upsert(CHUNKS.map((c) => ({ ...c })));
  return store;
}

// ---------- 判据正文 ----------

// 01 在防：返回形状对不上（answer/sources/cost/meta 四件缺一）—— "串线接通"的地基
test('01 正常一问：返回 { answer, sources, cost, meta }，答案是模型回的那句', async () => {
  const srv = await startRagServer();
  try {
    const r = await ask(QUESTION, { store: seededStore(), chunks: CHUNKS, ...optsFor(srv) });
    assert.strictEqual(typeof r.answer, 'string');
    assert.strictEqual(r.answer, '资料里说：判据结果那栏要回填实际值。');
    assert.ok(Array.isArray(r.sources), 'sources 要是数组');
    assert.strictEqual(typeof r.cost, 'number');
    assert.ok(r.meta && typeof r.meta === 'object', 'meta 要是个对象');
  } finally {
    await srv.close();
  }
});

// 02 在防：把【资料】或整个 prompt 也拿去 embed（白花钱，还把库的意义搞没了）
test('02 只 embed 问题：embed 服务器收到的 input 恰好是 [问题原文]', async () => {
  const srv = await startRagServer();
  try {
    await ask(QUESTION, { store: seededStore(), chunks: CHUNKS, ...optsFor(srv) });
    assert.strictEqual(srv.seen.embed.length, 1, 'embed 只该被调一次');
    assert.deepStrictEqual(srv.seen.embed[0].input, [QUESTION], 'input 必须只有问题这一条');
  } finally {
    await srv.close();
  }
});

// 03 在防：检索到了但【资料】没拼进 prompt → 模型只能说"资料里没有"（你昨晚的 bug 就是它）
test('03 资料真进了 prompt：chat 收到的 messages 里有 system 规矩 + 命中块原文 + 问题', async () => {
  const srv = await startRagServer();
  try {
    await ask(QUESTION, { store: seededStore(), chunks: CHUNKS, ...optsFor(srv) });
    assert.strictEqual(srv.seen.chat.length, 1, 'chat 只该被调一次');
    const msgs = srv.seen.chat[0].messages;
    assert.ok(Array.isArray(msgs) && msgs.length >= 2, '至少要有 system + user 两条');
    assert.strictEqual(msgs[0].role, 'system', '第一条要是 system（立规矩那句）');
    const all = JSON.stringify(msgs);
    assert.ok(all.includes('唯一标记-乙-9527'), '命中块的原文必须出现在 prompt 里');
    assert.ok(all.includes(QUESTION), '问题也要在 prompt 里');
  } finally {
    await srv.close();
  }
});

// 04 在防：溯源乱指（拿循环下标当 index，或写死 chunks[0]）—— 指到别的块去了
test('04 引用溯源：sources 按命中顺序回查 chunks 的 index/start/end', async () => {
  const srv = await startRagServer();
  try {
    const r = await ask(QUESTION, { store: seededStore(), chunks: CHUNKS, ...optsFor(srv) });
    // 提问向量 [1,0,0]，最像的是 index=2 那块（故意不放在 0 位）
    assert.deepStrictEqual(r.sources.map((s) => s.index), [2, 1, 3], '顺序按分数降序，index 要跟着命中走');
    const top = r.sources[0];
    assert.strictEqual(top.start, 81, 'start/end 要从 chunks[h.index] 回查，不是 chunks[0]');
    assert.strictEqual(top.end, 120);
    assert.strictEqual(typeof top.score, 'number');
    const scores = r.sources.map((s) => s.score);
    assert.deepStrictEqual(scores, [...scores].sort((a, b) => b - a), 'sources 要按分数降序');
  } finally {
    await srv.close();
  }
});

// 05 在防：topK 忘了往下传（默认 3 生效；显式传 2 就只回 2 条）
test('05 topK：不传默认 3 条；显式 topK=2 就只回 2 条', async () => {
  const srv = await startRagServer();
  try {
    const d = await ask(QUESTION, { store: seededStore(), chunks: CHUNKS, ...optsFor(srv) });
    assert.strictEqual(d.sources.length, 3);
    const two = await ask(QUESTION, { store: seededStore(), chunks: CHUNKS, topK: 2, ...optsFor(srv) });
    assert.deepStrictEqual(two.sources.map((s) => s.index), [2, 1]);
  } finally {
    await srv.close();
  }
});

// 06 在防：成本只算了一笔（吃了 chat 忘了 embed，或反过来）—— 账单对不上
test('06 成本相加：cost = chat 那一笔 + embed 那一笔（精确 3.5 元）', async () => {
  const srv = await startRagServer();
  try {
    const r = await ask(QUESTION, { store: seededStore(), chunks: CHUNKS, ...optsFor(srv) });
    assert.strictEqual(r.cost, 3.5, 'embed 1 元 + chat (0.5e6×1 + 1e6×2)/1e6 = 2.5 元');
  } finally {
    await srv.close();
  }
});

// 07 在防：空库直接崩（还没入库就问 —— 演示时最容易撞的边界）
test('07 空库：不崩，sources 回空数组', async () => {
  const srv = await startRagServer();
  try {
    const r = await ask(QUESTION, { store: createStore(), chunks: [], ...optsFor(srv) });
    assert.deepStrictEqual(r.sources, []);
    assert.strictEqual(typeof r.answer, 'string');
  } finally {
    await srv.close();
  }
});
