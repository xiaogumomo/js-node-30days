'use strict';
// ============================================================
// test/llm.live.test.js —— 真调用一次（唯一一条碰真网络/真花钱的判据）
//
// 为什么单独放：假服务器测的是"坏法"，这条测的是"真协议对不对"
// （你抄的 baseURL / 模型名 / key 真不真 —— 假服务器测不出这些）。
//
// 跑法（在 projects/p3-doc-qa 里，PowerShell）：
//   $env:LLM_LIVE='1'; node --env-file=.env --test test/llm.live.test.js
// 不设 LLM_LIVE 时自动跳过（`node --test` 的日常全量跑不受影响）。
// ============================================================

const { test } = require('node:test');
const assert = require('node:assert');

const LIVE = process.env.LLM_LIVE === '1';

test(
  '真调用一次：能拿回非空回答 + 真 usage + cost',
  { skip: LIVE ? false : '没设 LLM_LIVE=1（要真调一次：$env:LLM_LIVE=\'1\'; node --env-file=.env --test test/llm.live.test.js）' },
  async () => {
    const { chat } = require('../src/llm.js');
    const r = await chat([{ role: 'user', content: '只回四个字：收到收到' }], { timeoutMs: 30000 });
    assert.ok(typeof r.text === 'string' && r.text.length > 0, '回答不能是空的');
    assert.ok(r.usage.promptTokens > 0, '真调用应该有真 usage');
    assert.strictEqual(r.meta.attempts, 1, '一次就成功（这条要是 >1，说明网络在抖）');
    assert.ok(r.cost >= 0, 'cost 是数字（默认价格表是示例值，等你照官网核实）');
  }
);
