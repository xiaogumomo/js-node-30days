'use strict';
// ============================================================
// scratch/04-ask-reference.js —— ★ AI 给的【对照版】：`ask` 的四步
//
// ⚠️⚠️ 规矩（项目老规矩）：**直接粘贴判不合格** —— 读一遍 → **合上** → 自己重写进 `03-rag-demo.js`，
//      **那一遍才算你的**。日志"记账三列"里写明：这段是 AI 给的对照版。
//
// 跑法（在 projects/p3-doc-qa/ 里）：node --env-file=.env scratch/04-ask-reference.js
//
// 它跟 03 的区别：**只多了一个 ask()**，而且 ask 里**没有一处 fetch / requestJson / apiKey / 模型名** ——
// 因为那些活已经在 embed.js / llm.js / store.js 里做完了。
// ============================================================

const fs = require('node:fs');
const path = require('node:path');
const { chunkText } = require('../src/chunk.js');
const { embed } = require('../src/embed.js');
const { chat } = require('../src/llm.js'); // ★ 就是你 llm.js 里导出的那个 chat
const { createStore } = require('../src/store.js');

// ⭐ ask 四步：① 检索 → ② 组 prompt → ③ 问模型 → ④ 组装返回
async function ask(question, { store, chunks, topK = 3 }) {
  // ① 检索：**只 embed 问题**（块在入库时已经 embed 过了 —— 这就是"库"的意义）
  const q = await embed([question]);
  const hits = store.search(q.vectors[0], topK);

  // ② 组 prompt（RAG 的心脏）：资料编号 + 问题，一起交给模型；system 立规矩（不许编）
  const 资料 = hits.map((h, i) => `[${i + 1}] ${h.text}`).join('\n\n');
  const messages = [
    { role: 'system', content: '你只根据【资料】回答；资料里没有就说"资料里没有"，不要编造。' },
    { role: 'user', content: `【资料】\n${资料}\n\n【问题】\n${question}` },
  ];

  // ③ 问模型（收 messages、回 { text, cost, meta }）
  const r = await chat(messages);

  // ④ 组装返回：用 index 回查 chunks，拿 start/end（引用溯源）
  const sources = hits.map((h) => {
    const c = chunks[h.index];
    return { index: h.index, score: Number(h.score.toFixed(3)), start: c.start, end: c.end };
  });
  return { answer: r.text, sources, cost: r.cost + q.cost, meta: r.meta };
}

async function main() {
  const notes = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'notes', 'day26.md'), 'utf8');
  const chunks = chunkText(notes, { size: 500, overlap: 50 });
  const vec = await embed(chunks.map((c) => c.text));
  const store = createStore();
  store.upsert(chunks.map((c, i) => ({ ...c, vector: vec.vectors[i] })));
  console.log(`\n[库建好] ${store.size()} 块 · ${vec.vectors[0].length} 维 · 入库花费 ${vec.cost} 元\n`);

  for (const question of ['判据结果那栏要回填什么？', '西湖在哪里']) {
    const r = await ask(question, { store, chunks });
    console.log(`【问】${question}`);
    console.log(`【答】${String(r.answer || '').slice(0, 140)}`);
    console.log(`【来源】${r.sources.map((s) => `[块${s.index}] ${s.score} 原文${s.start}-${s.end}`).join('   ')}`);
    console.log(`【花费】${r.cost} 元（embed + chat 两笔相加）\n`);
  }
}

main().catch((e) => {
  console.error('炸了：', e);
  process.exit(1);
});
