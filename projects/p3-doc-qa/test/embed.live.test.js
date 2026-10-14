'use strict';
// ============================================================
// test/embed.live.test.js —— 真调一次智谱 embedding（embed 里唯一碰真网络的判据）
//
// 为什么单独放：假服务器测"坏法"，这条测"真协议"——**真 URL / 真 key / 真模型名 / 真维度**。
//
// 跑法（在 projects/p3-doc-qa 里，PowerShell）：
//   $env:LLM_LIVE='1'; node --env-file=.env --test test/embed.live.test.js
// 不设 LLM_LIVE 时自动跳过（`node --test` 的日常全量不受影响）。
//
// 已知真形状（2026-10-14 实测，智谱 embedding-3）：
//   维度 **2048**；`data[i]` 里有 `embedding / index / object`；`usage` 里有 `prompt_tokens`；
//   ⚠️ 空 `input: []` 智谱回 **400**、未知模型回 **400** → 所以"空数组不发请求"那个守卫不是洁癖。
// ============================================================

const { test } = require('node:test');
const assert = require('node:assert');

const LIVE = process.env.LLM_LIVE === '1';
const skip = LIVE ? false : "没设 LLM_LIVE=1（跑法：$env:LLM_LIVE='1'; node --env-file=.env --test test/embed.live.test.js）";

test('真调一次：2048 维、usage 有数、attempts = 1', { skip }, async () => {
  const { embed } = require('../src/embed.js');
  const r = await embed(['文档问答里，切块为什么要留一点重叠？'], { timeoutMs: 30000 });
  assert.strictEqual(r.vectors.length, 1);
  assert.strictEqual(r.vectors[0].length, 2048, '智谱 embedding-3 实测是 2048 维');
  assert.ok(r.usage.promptTokens > 0, 'usage 要有真数');
  assert.strictEqual(r.meta.attempts, 1);
  assert.ok(r.cost >= 0);
});

test('语义自检：猫 跟 小狗 比 汽车 更像（这是"检索能成立"的根）', { skip }, async () => {
  const { embed } = require('../src/embed.js');
  const r = await embed(['猫', '小狗', '汽车']);
  const cos = (a, b) => {
    let d = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    return d / (Math.sqrt(na) * Math.sqrt(nb));
  };
  const catDog = cos(r.vectors[0], r.vectors[1]);
  const catCar = cos(r.vectors[0], r.vectors[2]);
  assert.ok(catDog > catCar, `猫-小狗(${catDog.toFixed(3)}) 应该大于 猫-汽车(${catCar.toFixed(3)})`);
});

test('空数组不发请求（智谱对 input:[] 会回 400 —— 我们的守卫替我们挡住了）', { skip }, async () => {
  const { embed } = require('../src/embed.js');
  const r = await embed([]);
  assert.deepStrictEqual(r.vectors, []);
  assert.strictEqual(r.cost, 0);
});
