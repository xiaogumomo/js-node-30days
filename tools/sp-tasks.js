#!/usr/bin/env node
// ============================================================
// tools/sp-tasks.js —— 把当天的"时段表"写进 Super Productivity（它的本地 REST API）
//
// 为什么有这个：每天开工时 AI 写任务书/日志，顺手把时段表作为任务写进 SP ——
//   学生就不用手工复制粘贴（这是他 10/3 反思的第 2 条），而且 SP 会自动记录
//   **每个时段实际花了多久** → 收尾时能对比"计划 vs 实际"（这就是可数的产出单位）。
//
// ⚠️ 已经实测过的坑（4 条），别踩回去：
//   1. **中文标题不要用 `curl.exe -d '…'` 传** —— Windows 原生 exe 会把参数按本机代码页转一遍，
//      中文会变成 U+FFFD（10/3 实测：curl 建出来的任务在 SP 里是乱码）。
//      Node 自己没这个问题（实测 argv / stdin 都正常），但批量写入统一走 `plan`（**从 stdin 读 JSON**）：
//      一次写一整天、也免掉这一类编码坑。
//   2. `GET /tasks` **默认不返回已完成的任务**，要 `?includeDone=true`（不然你以为数据丢了）。
//   3. **界面是"最后建的在最上面"**（API 却按创建先后返回，两者相反 —— 10/4 实测：
//      顺序写入后，界面上第一条反而是"收尾"）。所以**写一整天的时段表要用 `--reverse`**：
//      列表按时间顺序写，让它从后往前建 → 界面上从上到下就是 10:00 → 17:55。
//   4. **标题里别用 `#`**（10/6 实测）：写进去的 `抽考 #13+#22`，存下来变成 `抽考 +#22`
//      —— SP 的"短语法"把 `#13` 当标签吞了（而且 tagIds 还是空的 = **静默丢字**）。
//      要写编号就写 `13 + 22` / `No.13`。**写完一定要回读核对**（`list` 或 API 取一遍）。
//
// 令牌（Access Token，在 SP 的 Settings → Misc）从哪来：
//   · 环境变量 `SP_API_TOKEN`，或
//   · 文件 `~/.sp-token`（**故意放在仓库外面**，所以 `git add -A` 扫不到它）
//   ⚠️ 令牌 = 钥匙（能读改你全部任务）。别提交、别贴到外部服务。
//
// 用法：
//   node tools/sp-tasks.js status                        # 当前任务 + 任务总数
//   node tools/sp-tasks.js list [--all]                  # 列任务（--all 含已完成）
//   node tools/sp-tasks.js today                         # 今天：计划时长 vs 实际时长
//   node tools/sp-tasks.js clear --prefix "[10/4]"       # 按标题前缀批量删（防手滑，必须给前缀）
//   printf '%s' '[{"title":"[10/4] 9:00 读文档","min":25}]' | node tools/sp-tasks.js plan --reverse [--day 2026-10-04]
//
// 退出码：0 正常；1 出错（SP 没开 / 令牌不对 / 参数错）
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
  console.error(
    `❌ 没找到令牌。两种办法：\n   ① 设环境变量 SP_API_TOKEN\n   ② 把令牌写进 ${TOKEN_FILE}\n` +
      '   （令牌在 SP 的 Settings → Misc → Access Token；顺便确认 Settings → Misc 里 Local REST API 是开的）'
  );
  process.exit(1);
}

async function api(method, p, body) {
  let res;
  try {
    res = await fetch(BASE + p, {
      method,
      headers: { authorization: 'Bearer ' + token(), 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (e) {
    console.error(`❌ 连不上 ${BASE} —— Super Productivity 没开？还是 Settings → Misc 里的 Local REST API 没开？\n   (${e.message})`);
    process.exit(1);
  }
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* 不是 JSON */
  }
  if (!res.ok) {
    console.error(`❌ ${method} ${p} -> ${res.status}\n   ${text.slice(0, 300)}`);
    process.exit(1);
  }
  return json;
}

const flag = (name, def) => {
  const i = process.argv.indexOf('--' + name);
  return i > -1 ? process.argv[i + 1] : def;
};
const today = () => new Date().toISOString().slice(0, 10);
const mmss = (ms) => `${Math.round((ms || 0) / 60000)}m`;
const row = (t) => `${t.isDone ? '✔' : '·'} ${mmss(t.timeEstimate).padStart(5)} ${String(t.id).padEnd(24)} ${t.title}`;

async function allTasks() {
  const r = await api('GET', '/tasks?includeDone=true');
  return r.data || [];
}

(async () => {
  const cmd = process.argv[2];
  if (cmd === 'status') {
    const r = await api('GET', '/status');
    console.log(`当前任务: ${r.data.currentTask ? r.data.currentTask.title : '（没有在计时的）'}`);
    console.log(`任务总数: ${r.data.taskCount}`);
  } else if (cmd === 'list') {
    const ts = process.argv.includes('--all') ? await allTasks() : (await api('GET', '/tasks')).data || [];
    ts.forEach((t) => console.log(row(t)));
    console.log(`共 ${ts.length} 条`);
  } else if (cmd === 'today') {
    const day = today();
    const ts = await allTasks();
    let plan = 0,
      real = 0;
    for (const t of ts) {
      const r = (t.timeSpentOnDay || {})[day] || 0;
      if (!r && !t.timeEstimate) continue;
      plan += t.timeEstimate || 0;
      real += r;
      console.log(`${mmss(t.timeEstimate).padStart(5)} → ${mmss(r).padStart(5)}  ${t.title}`);
    }
    console.log(`—— 今天：计划 ${mmss(plan)} / 实际 ${mmss(real)}`);
  } else if (cmd === 'clear') {
    const prefix = flag('prefix', '');
    if (!prefix) {
      console.error('❌ 必须给 --prefix（比如 --prefix "[10/4]"）—— 防止手滑把任务全删了');
      process.exit(1);
    }
    const hit = (await allTasks()).filter((t) => String(t.title).startsWith(prefix));
    for (const t of hit) {
      await api('DELETE', '/tasks/' + t.id);
      console.log('🗑  ' + t.title);
    }
    console.log(`删了 ${hit.length} 条（前缀 ${prefix}）`);
  } else if (cmd === 'plan') {
    const raw = fs.readFileSync(0, 'utf8'); // 从 stdin 读 —— 中文安全（见文件头 ⚠️1）
    const items = JSON.parse(raw);
    if (process.argv.includes('--reverse')) items.reverse(); // 见文件头 ⚠️3：界面"最后建的在最上面"
    const day = flag('day', today());
    if (!Array.isArray(items) || !items.length) {
      console.error('❌ stdin 要给一个 JSON 数组，例如：[{"title":"[10/4] 9:00 读文档","min":25}]');
      process.exit(1);
    }
    let sum = 0;
    for (const it of items) {
      const r = await api('POST', '/tasks', {
        title: it.title,
        timeEstimate: Math.round((it.min || 0) * 60000),
        dueDay: it.day || day,
      });
      sum += it.min || 0;
      console.log(`✅ ${mmss(r.data.timeEstimate).padStart(5)}  ${r.data.title}`);
    }
    console.log(`写进 SP 共 ${items.length} 条 / 计划合计 ${sum} 分钟（dueDay=${day}）`);
  } else {
    console.log(
      '用法：\n' +
        '  status\n' +
        '  list [--all]\n' +
        '  today\n' +
        '  clear --prefix "[10/4]"\n' +
        '  printf \'%s\' \'[{"title":"...","min":25}]\' | plan [--day YYYY-MM-DD]'
    );
  }
})().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
