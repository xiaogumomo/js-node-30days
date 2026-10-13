'use strict';
// ============================================================
// test/store.test.js —— 内存向量仓库 `store` 的判据（AI 写的，实现由你写）
//
// 这是今天"内存数组"那条选型的落地：能放向量、能按"最像"查回来。
// 换 pgvector 时，**只要这两个接口不变**，调用方一行都不用改。
//
// ★ 契约：
//   const { createStore, cosineSimilarity } = require('../src/store.js');
//
//   cosineSimilarity(a, b) -> number          // 单独导出的【纯函数】
//     余弦 = (a·b) / (|a| · |b|)
//     ★ 任一向量是**零向量**（模长为 0）→ 返回 0（**不许 NaN、不许抛**）
//     两向量长度不一致 → 抛 Error
//
//   createStore() -> { upsert(items), search(queryVector, topK), size() }
//     items: [{ text, index, start, end, vector }]     // 就是 chunk + embedding 拼起来
//     upsert(items) -> number     写进去几条；**追加**（不去重）
//       元素缺 text 或 vector 不是数组 → 抛 TypeError（别把垃圾静默入进去）
//     search(queryVector, topK = 3) -> [{ text, index, score }]，**按 score 降序**
//       空库 → []；topK 大于库大小 → 返回全部（不抛）
//     size() -> number
//     ★ 每个实例**独立**（一个 upsert 了，另一个的 size() 不受影响）
// ============================================================

const { test } = require('node:test');
const assert = require('node:assert');

const { createStore, cosineSimilarity } = require('../src/store.js');

// 造一个 item（text/index/vector 够用就行）
const item = (text, vector, index = 0) => ({ text, index, start: 0, end: text.length, vector });

// ---------- 判据正文 ----------

// 01 在防：余弦公式写错（漏模长 / 只算点积）—— 排序会整体错但"看着有结果"
test('01 cosineSimilarity：同向 = 1、正交 = 0、反向 = -1', () => {
  assert.ok(Math.abs(cosineSimilarity([1, 0], [2, 0]) - 1) < 1e-12, '同向应为 1（长度不影响方向）');
  assert.ok(Math.abs(cosineSimilarity([1, 0], [0, 1])) < 1e-12, '正交应为 0');
  assert.ok(Math.abs(cosineSimilarity([1, 0], [-1, 0]) + 1) < 1e-12, '反向应为 -1');
  assert.throws(() => cosineSimilarity([1, 0], [1, 0, 0]), /长度|不一致/);
});

// 02 在防：零向量 → 除零 → NaN 静默流进排序（NaN 比较全 false，顺序全乱）
test('02 零向量 → 返回 0（不许 NaN、不许抛）', () => {
  assert.strictEqual(cosineSimilarity([0, 0, 0], [1, 2, 3]), 0);
  assert.strictEqual(cosineSimilarity([1, 2, 3], [0, 0, 0]), 0);
  assert.ok(!Number.isNaN(cosineSimilarity([0, 0], [0, 0])));
});

// 03 在防：空库 search 炸掉 / 返回 undefined（下游 for..of 直接崩）
test('03 空库：size() = 0，search() = []', () => {
  const s = createStore();
  assert.strictEqual(s.size(), 0);
  assert.deepStrictEqual(s.search([1, 0], 3), []);
});

// 04 在防：upsert 不返回条数 / 第二次 upsert 覆盖了第一次（把旧数据弄丢）
test('04 upsert 追加：写 2 条再写 1 条 → size = 3，返回值是本次写的条数', () => {
  const s = createStore();
  assert.strictEqual(s.upsert([item('甲', [1, 0]), item('乙', [0, 1])]), 2);
  assert.strictEqual(s.size(), 2);
  assert.strictEqual(s.upsert([item('丙', [1, 1])]), 1);
  assert.strictEqual(s.size(), 3, '第二次 upsert 要追加，不是替换');
});

// 05 在防：不排序 / 排序方向反了 / 没截断到 topK（"最像的"取错 → RAG 引用的全是无关内容）
test('05 search 按相似度降序取 topK', () => {
  const s = createStore();
  s.upsert([item('最像', [1, 0, 0], 0), item('正交', [0, 1, 0], 1), item('次像', [0.9, 0.1, 0], 2)]);
  const r = s.search([1, 0, 0], 2);
  assert.strictEqual(r.length, 2, 'topK=2 → 只回 2 条');
  assert.strictEqual(r[0].text, '最像');
  assert.ok(Math.abs(r[0].score - 1) < 1e-12, '最像那条分数应为 1');
  assert.strictEqual(r[1].text, '次像', '第二条应是次像（不是正交那条）');
  assert.ok(r[0].score > r[1].score, '必须降序');
  // 返回的元素形状：text / index / score
  assert.strictEqual(r[0].index, 0);
  assert.strictEqual(typeof r[0].score, 'number');
});

// 06 在防：topK 大于库大小时抛错 / 越界（取 10 条但库里只有 2 条 → 报错而不是给全部）
test('06 topK 大于库大小 → 返回全部；不传 topK → 默认 3', () => {
  const s = createStore();
  s.upsert([item('甲', [1, 0]), item('乙', [0, 1])]);
  assert.strictEqual(s.search([1, 0], 10).length, 2);
  const many = createStore();
  many.upsert([item('0', [1, 0]), item('1', [0.9, 0.1]), item('2', [0.8, 0.2]), item('3', [0.7, 0.3]), item('4', [0.6, 0.4])]);
  assert.strictEqual(many.search([1, 0]).length, 3, '默认 topK = 3');
});

// 07 在防：把数据放在**模块级数组**里 → 两个实例互相污染（判据自己都会互相影响）
test('07 两个 store 实例互不干扰', () => {
  const a = createStore();
  const b = createStore();
  a.upsert([item('只属于 a', [1, 0])]);
  assert.strictEqual(a.size(), 1);
  assert.strictEqual(b.size(), 0, 'b 不该被 a 的入库影响');
  assert.deepStrictEqual(b.search([1, 0], 3), []);
});

// 08 在防：垃圾入进库（缺 text / vector 不是数组）→ 到 search 时才算余弦，炸得莫名其妙
test('08 upsert 元素不合法 → 抛 TypeError（不许静默入库）', () => {
  const s = createStore();
  assert.throws(() => s.upsert([{ text: '甲' }]), TypeError, '缺 vector 要抛');
  assert.throws(() => s.upsert([{ text: '甲', vector: '1,2,3' }]), TypeError, 'vector 不是数组要抛');
  assert.throws(() => s.upsert([null]), TypeError);
  assert.strictEqual(s.size(), 0, '抛了就不该有东西进库');
});
