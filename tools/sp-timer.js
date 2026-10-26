#!/usr/bin/env node
// ============================================================
// tools/sp-timer.js —— 由 AI 代管 SP 计时（他 10/26 说"我记不了时间了"）
//
// 背景：SP 的 Local REST API **只有 start，没有 stop**
//   ✅ POST /tasks/:id/start   → 开始计时（会把上一个任务的计时停掉，天然实现"切格"）
//   ❌ POST /tasks/:id/stop    → 404
//   ❌ PUT  /tasks/:id         → 404（只有 PATCH 可用）
//   ⚠️ PATCH 能改 timeSpent，但 **timeSpentOnDay 改不动**（它由运行中的计时器驱动）
//   → 所以正确用法：**每格开始前 start 那一格**；一天最后一格结束后 start 一个"下班"任务，
//     否则最后一格会一直涨。
//
// 用法：
//   node tools/sp-timer.js status              # 今天各任务的 计划 vs 实际
//   node tools/sp-timer.js start "LC438"       # 按标题片段找【未完成】任务并开始计时
//   node tools/sp-timer.js stop                # 开始一个名为"下班"的占位任务（等价于停表）
// ============================================================
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const BASE = process.env.SP_API_URL || 'http://127.0.0.1:3876';
const TOKEN_FILE = path.join(os.homedir(), '.sp-token');

function token() {
  if (process.env.SP_API_TOKEN) return process.env.SP_API_TOKEN.trim();
  if (fs.existsSync(TOKEN_FILE)) return fs.readFileSync(TOKEN_FILE, 'utf8').trim();
  console.error('❌ 没找到 SP 令牌（SP_API_TOKEN 或 ~/.sp-token）');
  process.exit(1);
}
const H = { authorization: 'Bearer ' + token(), 'content-type': 'application/json' };
const today = () => new Date().toISOString().slice(0, 10);
const mmss = (ms) => Math.floor(ms / 60000) + 'm';

async function tasks() {
  const res = await fetch(BASE + '/tasks', { headers: H });
  const j = await res.json();
  return Array.isArray(j) ? j : j.data || [];
}
async function startById(id) {
  const res = await fetch(BASE + '/tasks/' + id + '/start', { method: 'POST', headers: H });
  const j = await res.json();
  if (!res.ok || j.ok === false) throw new Error(JSON.stringify(j));
  return j.data;
}

const cmd = process.argv[2];

(async () => {
  if (cmd === 'status') {
    const list = await tasks();
    let plan = 0,
      real = 0;
    for (const t of list) {
      const r = (t.timeSpentOnDay || {})[today()] || 0;
      plan += t.timeEstimate || 0;
      real += r;
      console.log(`${mmss(t.timeEstimate).padStart(5)} → ${mmss(r).padStart(5)}  ${t.title}`);
    }
    console.log(`—— 计划 ${mmss(plan)} / 实际 ${mmss(real)}`);
  } else if (cmd === 'start') {
    const kw = process.argv[3];
    if (!kw) {
      console.error('用法：node tools/sp-timer.js start "<标题片段>"');
      process.exit(1);
    }
    const list = await tasks();
    const hit = list.filter((t) => String(t.title).includes(kw) && !t.isDone);
    if (!hit.length) {
      console.error(`❌ 没找到未完成任务包含 "${kw}"`);
      process.exit(1);
    }
    if (hit.length > 1) {
      console.error(`⚠️ 匹配到 ${hit.length} 条，请写更具体：`);
      hit.forEach((t) => console.error('   ' + t.title));
      process.exit(1);
    }
    await startById(hit[0].id);
    console.log('▶ 开始计时：' + hit[0].title);
  } else if (cmd === 'stop') {
    const list = await tasks();
    let idle = list.find((t) => t.title === '下班' && !t.isDone);
    if (!idle) {
      const res = await fetch(BASE + '/tasks', {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ title: '下班', timeEstimate: 0 }),
      });
      const j = await res.json();
      idle = j.data || j;
    }
    await startById(idle.id);
    console.log('⏹ 已停表（当前任务是"下班"占位）');
  } else {
    console.log('用法：status | start "<标题片段>" | stop');
  }
})().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
