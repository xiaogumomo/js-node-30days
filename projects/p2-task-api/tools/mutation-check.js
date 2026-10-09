#!/usr/bin/env node
// ============================================================
// tools/mutation-check.js —— "判据的牙"（突变检查器）· Day 20（10/6 测试日）AI 给
//
// 它回答一个问题：**你写的那份测试，到底能抓住哪种坏法？**
//
// 做法（突变测试 mutation testing 的最小版）：
//   把你的 `src/server.js` **只改坏一处**（13 种坏法各来一次），然后拿**你自己写的测试**去打它：
//     · 该变红 → 说明你的测试**真的在守这个行为** ✅
//     · 照样全绿 → 这条坏法**从你的测试底下溜过去了** ❌（= 你还缺一条测试）
//
// 三条诚实规则（都是踩过的坑换来的）：
//   ① **基线先绿**：先在**没被改坏**的实现上跑一次。基线有红 → 先分清"测试写错了"还是"实现有 bug"，
//      别的结论都不算数。
//   ② **借来的红不算**：某条测试在基线上**本来就是红的**，不能算它"抓到了突变"——
//      判定用的是**新增的红**（突变后的失败集合 − 基线的失败集合）。这防的是"崩溃式假绿"的反面。
//   ③ **改坏了就说改坏了**：每条突变都**验证真的改上了**（改不上会点名）+ 突变后的源码**先过语法检查**
//      （否则"全红"只是语法错，不是你抓到的）。
//
// 用法：
//   node tools/mutation-check.js                  # 默认跑 test/edge-cases.test.js
//   node tools/mutation-check.js --list           # 只列这 13 条突变（= 今天的行为契约）
//   node tools/mutation-check.js --only M2,M5     # 只跑指定几条（修漏网的时候用，快）
//   node tools/mutation-check.js --file test/xxx.test.js
//   node tools/mutation-check.js --keep           # 保留临时实验室目录（用来手看变体）
//
// ⚠️ 它**不碰你的真文件**：所有突变都发生在系统临时目录的副本里（src / db / test 是拷的，
//    node_modules 用 junction 接过来）。跑完退出码：0 = 基线绿 + 13 条全抓到 + 没有"改不上"。
//
// 负向验证（2026-10-06，AI 在仓库外搭了一次性实验室跑的三组对照 —— 数字都是实测的）：
//   · 参照判据（按契约写全，13 条）× 修好的实现 → 基线**全绿** + **13/13 全抓到**（退出码 0）
//   · "假判据"（只打 /health 判 200，6 条）× 同一个实现 → 基线全绿 + **0/13**
//     （说明这个工具**分得出来**牙多牙少，不是"凡是有测试就给绿"）
//   · 参照判据 × **还没修 bug 的实现** → 基线 **4 条红**（02 乱码 500 / 04 与 13 因为纯函数还没导出 /
//     08 坏 JSON 500）→ 10/13，M11、M13 报"找不到锚点"（实现里还没有"看状态码"和"护栏"这两样东西）。
//     ⚠️ 这一组里 M2 判"漏网"是**对**的：它那条测试本来就红（TypeError），按规则②不算"新增的红" ✓
//   · 防假绿守卫也验过：一个把 test() 写在 for 循环里的文件被数成 1 条 → 直接拒收（退出码 2）✓
//   · 每条突变都核过"真的改上了"（改了几处会打出来）；改不上/改完编译不过 → 明说，不糊过去
//   · **10/7 在学生的真文件上首跑**（13 条测试）：先 10/13 —— **M10 漏网**（真因：他 `06` 里第二条的邮箱少了 `@`，
//     那条于是被【邮箱规则】挡住 → **密码长度规则根本没被考到**）；**M11/M13 报"无法判定"**（**工具自己的毛病**：
//     M11 原来 `to: ''` 会造出语法错 `= ?? 500`；M13 的 `[^}]*` 撑不住多行 try 块）→ 修完这两条重跑 → **12/13** ✓
//     ⭐ 这就是突变测试的第一价值：**"看起来写了、其实没考到"的测试，靠人眼看不出来**。
// ============================================================
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');            // projects/p2-task-api
const NODE_MODULES = path.join(ROOT, 'node_modules');

// ── 参数 ─────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
// --file 给仓库内的相对路径（默认 test/edge-cases.test.js）；也给绝对路径（AI 做工具自检时用）
const FILE_ARG = opt('--file', path.join('test', 'edge-cases.test.js'));
const IMPL_ARG = opt('--impl', path.join('src', 'server.js'));
// ⚠️ 2026-10-09：第二靶子。数据层抽成 src/db.js 之后，M5/M6/M7 的锚点（SQL 字符串）
//    跟着搬了过去 —— 主靶子上找不到锚点时，工具会再到这个文件上试一次。
const IMPL2_ARG = opt('--impl2', path.join('src', 'db.js'));   // 同上：默认仓库内，绝对路径也收
const KEEP = flag('--keep');
const ONLY = opt('--only', '')
  .split(',')
  .map((s) => s.trim().toUpperCase())
  .filter(Boolean);
const RUN_TIMEOUT = Number(opt('--timeout', '120000'));

// ══════════════════════════════════════════════════════════════
// 13 条突变：每条 = 「怎么只改坏一处」+「它坏的是哪个行为」
// 每条都写成**多形态**（steps 里几组正则挨个试）—— 你的写法只要命中任一组就算改上了；
// 一组都没命中 → 会**点名报"找不到锚点"**，绝不悄悄跳过。
// ══════════════════════════════════════════════════════════════
const MUTATIONS = [
  {
    id: 'M1',
    name: '验签失效：改过签名的 token 也放行',
    behavior: '篡改过 / 乱码的 token → 401（不能 200、不能 500）',
    steps: [
      { re: /if\s*\(\s*!\s*same\s*\([^)]*\)\s*\)/, to: 'if(false)' },
      { re: /same\s*\(\s*parts\s*\[\s*2\s*\]\s*,[^)]*\)/, to: 'true' },
      { re: /if\s*\(\s*!\s*\w+\s*\(\s*parts\s*\[\s*2\s*\]\s*,[^)]*\)\s*\)/, to: 'if(false)' },
    ],
  },
  {
    id: 'M2',
    name: '过期检查删掉：过期的 token 还能用',
    behavior: '过期的 token → 401（不是 200）',
    steps: [
      { re: /if\s*\(\s*\w*(?:\.\w+)?\.exp\s*&&[^{;]*\)\s*return\s+(?:null|false)\s*;?/, to: ';' },
      { re: /Date\.now\s*\(\s*\)\s*\/\s*1000\s*>\s*\w*(?:\.\w+)?\.exp/, to: 'false' },
      { re: /\.exp\s*<\s*Math\.floor\s*\(\s*Date\.now\s*\(\s*\)\s*\/\s*1000\s*\)/, to: 'false' },
    ],
  },
  {
    id: 'M3',
    name: '跳过密码校验：密码错了也能登录',
    behavior: '密码错 / 邮箱不存在 → 401（不是 200）',
    steps: [
      { re: /if\s*\(\s*!\s*(verifyPassword\s*\([^)]*\))\s*\)/, to: 'if(false)' },
      { re: /if\s*\(\s*!\s*(\w*[Pp]assword\w*\s*\([^)]*\))\s*\)/, to: 'if(false)' },
      { re: /timingSafeEqual\s*\([^)]*\)/, to: 'true' },
    ],
  },
  {
    id: 'M4',
    name: '无 token 也放行（当成 1 号用户）',
    behavior: '不带 token 打 /tasks → 401（不是 200）',
    // 在 auth 函数里（窗口 800 字够覆盖它的函数体）："取不出身份"时兜一个 { sub: 1 }
    scoped: {
      start: /function\s+auth\s*\(|const\s+auth\s*=\s*(?:async\s*)?\(/,
      window: 800,
      steps: [
        { re: /(\w+\s*\?\s*verifyJwt\s*\([^)]*\)\s*:\s*null)/, to: '($1) ?? { sub: 1 }' },
        { re: /(\w+\s*\?\s*\w+\s*\([^)]*\)\s*:\s*null)/, to: '($1) ?? { sub: 1 }' },
        { re: /(verifyJwt\s*\([^)]*\))/, to: '($1 ?? { sub: 1 })' },
      ],
    },
  },
  {
    id: 'M5',
    name: '按 id 的隔离条件丢了（别人的任务能读/改/删）',
    behavior: '别人的任务：GET / PATCH / DELETE → 404（不是 200 / 204）',
    allForms: true,   // 三种语句（SELECT / UPDATE / DELETE）里的这个条件都要改掉
    steps: [
      { re: /AND\s+userId\s*=\s*\(\s*\?\s*\)/g, to: 'AND (? IS NOT NULL)' },
      { re: /AND\s+userId\s*=\s*\?/g, to: 'AND (? IS NOT NULL)' },
    ],
  },
  {
    id: 'M6',
    name: '列表的隔离条件丢了（列表里能看到别人的任务）',
    behavior: 'GET /tasks 只返回自己的（别人的一条都不许出现）',
    allForms: true,
    steps: [
      { re: /WHERE\s+userId\s*=\s*\(\s*\?\s*\)/g, to: 'WHERE (? IS NOT NULL)' },
      { re: /WHERE\s+userId\s*=\s*\?/g, to: 'WHERE (? IS NOT NULL)' },
    ],
  },
  {
    id: 'M7',
    name: 'PATCH 的 done 不落库（只改 title 能存）',
    behavior: 'PATCH 改 done → 再 GET 确认真的改了',
    steps: [
      { re: /SET\s+title\s*=\s*\?\s*,\s*done\s*=\s*\?/i, to: 'SET title = ?, done = done' },
      { re: /SET\s+done\s*=\s*\?\s*,\s*title\s*=\s*\?/i, to: 'SET done = done, title = ?' },
    ],
  },
  {
    id: 'M8',
    name: '空 title 也收下（校验删掉）',
    behavior: 'POST /tasks 的 title 是空串 / 只有空格 → 400（不能 201）',
    steps: [
      { re: /\.title\.trim\(\)\s*===?\s*['"]\s*['"]/, to: 'false' },
      { re: /!\s*\w+\.title\.trim\(\)/, to: 'false' },
      { re: /\.title\.trim\(\)\.length\s*===?\s*0/, to: 'false' },
    ],
  },
  {
    id: 'M9',
    name: '注册的邮箱校验删掉（没有 @ 也收）',
    behavior: 'POST /auth/register 邮箱不合法 → 400',
    steps: [
      { re: /!\s*\w+(?:\.\w+)*\.email\.includes\(\s*['"]@['"]\s*\)/, to: 'false' },
      { re: /email\s*\.\s*includes\(\s*['"]@['"]\s*\)\s*===?\s*false/, to: 'false' },
      { re: /\/[^/\n]+\/\s*\.\s*test\s*\(\s*\w+(?:\.\w+)*\.email\s*\)/, to: 'true' },
    ],
  },
  {
    id: 'M10',
    name: '注册的密码长度校验删掉（5 位也收）',
    behavior: 'POST /auth/register 密码太短 → 400',
    steps: [
      { re: /\.password\s*\.length\s*<\s*6/, to: '.password.length < 0' },
      { re: /\.password\s*\.length\s*<=\s*5/, to: '.password.length < 0' },
    ],
  },
  {
    id: 'M11',
    name: '错误处理不看状态码（坏 JSON 也 500）',
    behavior: '畸形 JSON body → 400（不是 500）',
    // 把"读错误自带的状态码"这件事拆掉：`error.statusCode` → `500`
    // ⚠️ 不能换成空串（`const code = ?? 500` 直接是语法错；10/7 实测）→ 换成 500，两种写法都合法：
    //    `500 ?? 500` ✓ ｜ `Number(500) >= 400 && Number(500) < 500 ? 500 : 500` → 500 ✓
    steps: [{ re: /(?:error|err|e)\s*\.\s*statusCode\b/g, to: '500' }],
  },
  {
    id: 'M12',
    name: 'DELETE 不看"删到没删到"（删别人的也报成功）',
    behavior: 'DELETE 不存在的 id / 别人的任务 → 404（不是 204）',
    steps: [
      { re: /\.changes\s*===?\s*0/, to: '.changes < 0' },
      { re: /\.changes\s*<\s*1/, to: '.changes < 0' },
    ],
  },
  {
    id: 'M13',
    name: 'verifyJwt 对坏 payload 没有护栏（解不开就崩）',
    behavior: '乱码 token（**三段但内容是垃圾**，如 aaa.bbb.ccc）→ 401（不是 500）',
    // 把那圈 try/catch 护栏摘掉、保留原来的赋值 → 解不开的 payload 直接抛错 → 500
    // ⚠️ 用 `[\s\S]*?`（跨行、容忍花括号）—— 原来的 `[^}]*` 在"try 块里有多行/嵌套"时会失配（10/7 实测）
    steps: [
      {
        re: /try\s*\{([\s\S]*?JSON\.parse[\s\S]*?)\}\s*catch\s*(?:\([^)]*\))?\s*\{\s*return\s+null\s*;?\s*\}/,
        to: '$1',
      },
      { re: /try\s*\{([\s\S]*?payload[\s\S]*?)\}\s*catch\s*(?:\([^)]*\))?\s*\{\s*return\s+null\s*;?\s*\}/, to: '$1' },
    ],
  },
];

// ── 小工具 ───────────────────────────────────────────────────
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;

if (flag('--list')) {
  console.log(bold(`这 13 条突变 = 今天的行为契约（你的测试至少要能抓住它们）\n`));
  for (const m of MUTATIONS) {
    console.log(`  ${bold(m.id)}  ${m.name}\n      守的是：${m.behavior}\n`);
  }
  console.log('跑法：node tools/mutation-check.js   （默认拿 test/edge-cases.test.js 去打）');
  process.exit(0);
}

// ── 1. 先看你的测试文件在不在 ────────────────────────────────
// 实验室里的落点：绝对路径进来的（工具自检）就放进 test/ 下，用文件名
const TEST_REL = path.isAbsolute(FILE_ARG) ? path.join('test', path.basename(FILE_ARG)) : FILE_ARG;
const TEST_ABS = path.isAbsolute(FILE_ARG) ? FILE_ARG : path.join(ROOT, FILE_ARG);
const IMPL_ABS = path.isAbsolute(IMPL_ARG) ? IMPL_ARG : path.join(ROOT, IMPL_ARG);
if (!fs.existsSync(TEST_ABS)) {
  console.error(
    red(`\n❌ 还没看到 ${TEST_ABS} —— 这份判据是拿来验收"你自己写的那份测试"的。\n`) +
      `   今天的目标：给项目 2 补一份**你自己写的**测试（单元 + 集成混在一份里也行），\n` +
      `   文件放在 ${TEST_REL}，然后回来跑这个。\n` +
      `   想先看它要守哪些行为：node tools/mutation-check.js --list\n`
  );
  process.exit(2);
}
const testSrc = fs.readFileSync(TEST_ABS, 'utf8');

// ── 2. 防假绿守卫：文件里到底有几条 test() ───────────────────
// （先扣掉整行注释：注释里写 "test(" 不该被算成一条真测试）
const testCount = (testSrc.replace(/^[ \t]*\/\/.*$/gm, '').match(/(^|[^\w.])test\s*\(/g) || []).length;
if (testCount < 6) {
  console.error(
    red(`\n❌ ${TEST_REL} 里只数出 ${testCount} 条 test() —— 这个绿不算数。\n`) +
      `   13 条突变至少要有 6 条测试才谈得上覆盖（契约见 --list）。\n`
  );
  process.exit(2);
}

const baseSrc = fs.readFileSync(IMPL_ABS, 'utf8');

// 第二靶子：存在就加载（重构后 SQL 住在 src/db.js）
const IMPL2_ABS = path.isAbsolute(IMPL2_ARG) ? IMPL2_ARG : path.join(ROOT, IMPL2_ARG);
const HAS_IMPL2 = fs.existsSync(IMPL2_ABS) && path.resolve(IMPL2_ABS) !== path.resolve(IMPL_ABS);
const baseSrc2 = HAS_IMPL2 ? fs.readFileSync(IMPL2_ABS, 'utf8') : null;
const IMPL2_REL = HAS_IMPL2 ? path.basename(IMPL2_ABS) : null;

// ── 3. 搭一次性实验室（系统临时目录；真文件一个都不动）───────
const lab = fs.mkdtempSync(path.join(os.tmpdir(), 'p2-mut-'));
const MIG_SRC = path.join(ROOT, 'db', 'migrations');
const PKG_SRC = path.join(ROOT, 'package.json');

function makeVariant(id, src, targetRel = path.basename(IMPL_ABS)) {
  const dir = path.join(lab, id);
  fs.mkdirSync(path.join(dir, 'test'), { recursive: true });
  // ⚠️ 2026-10-09：整个 src/ 一起搬进实验室。
  //    因为数据层抽成了 src/db.js —— 只搬 server.js 会让 require('./db') 当场失败，
  //    于是 13 条**全部**报"无法判定"（工具对"项目只有一个源文件"的假设露出来了）。
  fs.cpSync(path.join(ROOT, 'src'), path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src', targetRel), src); // 再盖成突变版（默认 server.js；突变住在第二靶子时就是它）
  fs.cpSync(MIG_SRC, path.join(dir, 'db', 'migrations'), { recursive: true });
  fs.copyFileSync(PKG_SRC, path.join(dir, 'package.json'));
  const testDst = path.join(dir, TEST_REL);
  fs.mkdirSync(path.dirname(testDst), { recursive: true });
  fs.copyFileSync(TEST_ABS, testDst);
  // node_modules：junction（Windows 上不需要管理员；真目录不复制，省时间）
  try {
    fs.symlinkSync(NODE_MODULES, path.join(dir, 'node_modules'), 'junction');
  } catch (e) {
    throw new Error(`给实验室接 node_modules 失败（${e.code}）：${e.message}`);
  }
  return dir;
}

// ── 4. 跑一次：返回 { failures:Set, passes, loadFail, raw } ──
function runTests(dir) {
  const r = spawnSync(
    process.execPath,
    ['--test', '--test-isolation=none', '--test-reporter=tap', TEST_REL],
    {
      cwd: dir,
      encoding: 'utf8',
      timeout: RUN_TIMEOUT,
      env: { ...process.env, DB_FILE: path.join(dir, 'data', 'lab.db') },
    }
  );
  const out = `${r.stdout || ''}\n${r.stderr || ''}`;
  const failures = new Set();
  for (const line of (r.stdout || '').split('\n')) {
    const m = /^not ok \d+ - (.*)$/.exec(line.trim());
    if (m) failures.add(m[1].trim());
  }
  const passM = /^# pass (\d+)/m.exec(r.stdout || '');
  const failM = /^# fail (\d+)/m.exec(r.stdout || '');
  const passes = passM ? Number(passM[1]) : null;
  // 文件根本没跑起来（语法错 / require 炸了 / 模块格式撞车）——"0 条通过 + 错误名在输出里"
  const loadFail =
    (!passM && !failM) ||
    (Number(passes) === 0 &&
      /SyntaxError|Cannot find module|ERR_MODULE_NOT_FOUND|ERR_AMBIGUOUS_MODULE_SYNTAX|Unexpected token|Unexpected end of input/.test(out));
  return { failures, passes, fails: failM ? Number(failM[1]) : null, loadFail, out, timedOut: r.error && r.error.code === 'ETIMEDOUT' };
}

// 语法检查：突变后的源码自己要能编译（否则"全红"只是语法错，不算抓到）
function compiles(src) {
  try {
    new vm.Script(src, { filename: 'mutant.js' });
    return true;
  } catch {
    return false;
  }
}

// 应用一条突变：返回 { src, replaced, detail } 或 { applyFail: '原因' }
function applyMutation(src, mut) {
  if (mut.scoped) {
    const startM = mut.scoped.start.exec(src);
    if (!startM) return { applyFail: `找不到锚点 ${mut.scoped.start}` };
    const from = startM.index;
    const afterStart = from + startM[0].length;
    // 作用域终点：给定的"下一个顶层定义"；没给就取固定窗口（短处理器的场景）
    let to;
    if (mut.scoped.end) {
      const endRel = mut.scoped.end.exec(src.slice(afterStart));
      to = endRel ? afterStart + endRel.index : src.length;
    } else {
      to = Math.min(src.length, afterStart + (mut.scoped.window || 800));
    }
    let slice = src.slice(from, to);

    if (mut.scoped.steps) {
      // 形态：在作用域里改一处（第一个命中的写法就用它，**不再往下试** ——
      // 叠加两种写法会把源码改成语法错，8/10 那次实测踩过）
      let replaced = 0;
      let used = null;
      for (const step of mut.scoped.steps) {
        const hits = (slice.match(step.re) || []).length;
        if (!hits) continue;
        slice = slice.replace(step.re, step.to);
        replaced += hits;
        used = String(step.re);
        break;
      }
      if (!replaced) return { applyFail: '这段里没有可改的位置（写法不在工具认识的形态里）' };
      return { src: src.slice(0, from) + slice + src.slice(to), replaced, used };
    }
    // 形态：替换作用域里**最后一个** returnXxx
    const hits = [...slice.matchAll(new RegExp(mut.scoped.lastReturnRe.source, 'g'))];
    const last = hits.pop();
    if (!last) return { applyFail: `这段里找不到 ${mut.scoped.lastReturnRe}` };
    slice = slice.slice(0, last.index) + mut.scoped.to + slice.slice(last.index + last[0].length);
    return { src: src.slice(0, from) + slice + src.slice(to), replaced: 1 };
  }

  let out = src;
  let replaced = 0;
  const missed = [];
  for (const step of mut.steps) {
    const hits = (out.match(step.re) || []).length;
    if (!hits) {
      missed.push(String(step.re));
      continue;
    }
    out = out.replace(step.re, step.to);
    replaced += hits;
    // 默认：第一个命中的写法就用它（多形态是"或"，不是"且"）；
    // allForms 的突变（隔离条件那种）才把两种写法都改上
    if (!mut.allForms) break;
  }
  if (!replaced) return { applyFail: `找不到锚点（试了 ${mut.steps.length} 种写法都没命中）` };
  return { src: out, replaced, missed };
}

// ── 5. 跑 ────────────────────────────────────────────────────
const picked = ONLY.length ? MUTATIONS.filter((m) => ONLY.includes(m.id)) : MUTATIONS;
if (!picked.length) {
  console.error(red(`\n❌ --only ${ONLY.join(',')} 里没有一条是真的突变 id（现有：${MUTATIONS.map((m) => m.id).join(',')}）\n`));
  process.exit(1);
}

console.log(
  bold(`\n突变检查：拿「${TEST_REL}」（${testCount} 条 test()）去打 ${picked.length} 种"只改坏一处"的实现`) +
    `\n实验室：${lab}${KEEP ? '（--keep，跑完保留）' : ''}\n`
);

// 5a. 基线
process.stdout.write('  基线（没改坏的实现）…… ');
let baseline;
try {
  const dir = makeVariant('baseline', baseSrc);
  baseline = runTests(dir);
} catch (e) {
  console.error(red(`\n❌ 搭实验室失败：${e.message}`));
  process.exit(1);
}
const baseFails = baseline.failures;
if (baseline.loadFail || baseline.timedOut) {
  console.log(red('你的测试文件根本没跑起来'));
  console.log(
    red(`\n❌ 基线都没跑起来（${baseline.timedOut ? '超时了' : '一条 TAP 都没有'}）—— 先让 `) +
      `${TEST_REL} 自己能跑，再谈突变。\n原始输出（前 2000 字）：\n${baseline.out.slice(0, 2000)}\n`
  );
  process.exit(1);
}
if (baseFails.size) {
  console.log(yellow(`有 ${baseFails.size} 条红`));
  console.log(
    yellow(`\n⚠️ 基线就有红 —— 先分清是"测试写错了"还是"实现有 bug"（今天的坏 JSON 就是后者）。\n`) +
      `   规则②：基线本来就红的测试，**不能算它抓到了突变**；下面的"抓到"只认**新增的红**。\n` +
      [...baseFails].map((f) => `     ✖ ${f}`).join('\n') +
      '\n'
  );
} else {
  console.log(green(`全绿（${baseline.passes} 条通过）`));
}

// 5b. 逐条突变
const rows = [];
for (const mut of picked) {
  process.stdout.write(`  ${mut.id} ${mut.name} …… `);
  let ap = applyMutation(baseSrc, mut);
  let targetRel = path.basename(IMPL_ABS);
  if (ap.applyFail && baseSrc2) {
    // 锚点可能随重构搬到了第二靶子（例：SQL 从 server.js 搬进 db.js）
    const ap2 = applyMutation(baseSrc2, mut);
    if (!ap2.applyFail) {
      ap = ap2;
      targetRel = IMPL2_REL;
    }
  }
  if (ap.applyFail) {
    console.log(yellow('找不到锚点'));
    rows.push({ mut, status: 'applyFail', detail: ap.applyFail, caughtBy: [] });
    continue;
  }
  if (!compiles(ap.src)) {
    console.log(red('突变本身就是语法错（工具问题）'));
    rows.push({ mut, status: 'toolBug', detail: '突变后编译不过', caughtBy: [] });
    continue;
  }
  let res;
  try {
    const dir = makeVariant(mut.id, ap.src, targetRel);
    res = runTests(dir);
  } catch (e) {
    console.log(red(`搭实验室失败：${e.message}`));
    rows.push({ mut, status: 'toolBug', detail: e.message, caughtBy: [] });
    continue;
  }
  if (res.loadFail) {
    console.log(red('实现被改坏到跑不起来（工具问题）'));
    rows.push({ mut, status: 'toolBug', detail: '突变后加载失败', caughtBy: [] });
    continue;
  }
  const newFails = [...res.failures].filter((f) => !baseFails.has(f));
  if (newFails.length) {
    console.log(green(`✅ 抓到（${newFails.length} 条新增红）`));
    rows.push({ mut, status: 'caught', detail: `${ap.replaced} 处替换`, caughtBy: newFails });
  } else {
    console.log(red('❌ 没抓到'));
    rows.push({ mut, status: 'survived', detail: `${ap.replaced} 处替换`, caughtBy: [] });
  }
}

// ── 6. 汇总 ──────────────────────────────────────────────────
const caught = rows.filter((r) => r.status === 'caught').length;
const survived = rows.filter((r) => r.status === 'survived');
const broken = rows.filter((r) => r.status === 'applyFail' || r.status === 'toolBug');

console.log(bold('\n── 结果 ──────────────────────────────────────────'));
for (const r of rows) {
  const mark =
    r.status === 'caught' ? green('✅ 抓到') : r.status === 'survived' ? red('❌ 没抓到') : yellow('⚠️ 无法判定');
  console.log(`${mark}  ${r.mut.id} ${r.mut.name}`);
  if (r.status === 'caught') console.log(`         抓到它的测试：${r.caughtBy.slice(0, 3).join(' / ')}${r.caughtBy.length > 3 ? ` …共 ${r.caughtBy.length} 条` : ''}`);
  if (r.status === 'survived') console.log(`         守的行为：${r.mut.behavior}\n         → 补一条测试（或补一条断言）再跑：node tools/mutation-check.js --only ${r.mut.id}`);
  if (r.status === 'applyFail') console.log(`         ${r.detail} → 你的写法和工具认识的三形态都不同：人工确认这条行为有没有被测到，记进日志`);
  if (r.status === 'toolBug') console.log(`         ${r.detail} → 这是工具的锅，不是你：把这条记进日志`);
}

console.log(`\n${bold(`抓到 ${caught}/${rows.length}`)}` + (survived.length ? red(`　漏网 ${survived.length} 条：${survived.map((r) => r.mut.id).join(' ')}`) : '') + (broken.length ? yellow(`　无法判定 ${broken.length} 条：${broken.map((r) => r.mut.id).join(' ')}`) : ''));
console.log(`覆盖面：${rows.length} 条突变 + 1 次基线 = ${rows.length + 1} 次运行，每次跑的都是 ${TEST_REL}`);
console.log(`（判"抓到"的口径：突变后的**新增红** —— 基线本来就红的测试不算数；每条突变都核过"真的改上了"）\n`);

const verdictOk = baseFails.size === 0 && caught === rows.length && broken.length === 0;
if (!KEEP) {
  try {
    fs.rmSync(lab, { recursive: true, force: true });
  } catch {
    console.log(`（实验室占用中，没删掉：${lab} —— 不影响结果）`);
  }
} else {
  console.log(`实验室保留在：${lab}`);
}
process.exit(verdictOk ? 0 : 1);
