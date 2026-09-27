// Day 12 判据：验收项目 1 的 CLI 骨架（AI 写）
//
// 跑法：node --test projects/p1-cli-organizer/test/cli.test.js
//
// 结构照项目惯例分两档：
//   · 必过（判对错）—— classify 规则 / 干跑打印计划 / **干跑绝不动文件（快照对比）** /
//                     `--apply` 也不动文件 / 目录不存在时友好报错 / 空目录 / 模块能被 require
//   · 探针（只记录不判错）—— --verbose / --target / 无参数用法 / 子目录要不要递归
//
// 判据在系统临时目录造一棵小树（跑完删掉，不碰仓库）：
//   photo.JPG  images（大写也要认得）      pic.png   images
//   note.txt   docs                        report.pdf docs
//   clip.mp4   videos                      README    others（没有扩展名）
//   → images 2、docs 2、videos 1、others 1，共 6 个文件
//   （数字不是抄来的：建完会真的数一遍 + 记下快照，用来比对"干跑有没有偷偷动文件"）

const { test, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');

// ─────────────────────────────────────────────────────────────
// 0. 先探：require 你的文件会不会把 CLI 入口也执行了
// ─────────────────────────────────────────────────────────────
const cliExists = fs.existsSync(CLI);

if (!cliExists) {
  console.log(
    '\n⚠️ 还没看到 projects/p1-cli-organizer/src/cli.js —— 这份判据是拿来验收它的。\n' +
      '   先写出最小版（classify + 干跑打印），再回来跑。\n'
  );
}

const probeRequire = cliExists
  ? spawnSync(process.execPath, ['-e', `require(${JSON.stringify(CLI)})`], { encoding: 'utf8', timeout: 20000 })
  : { status: 0, stdout: '' };
const probeOut = `${probeRequire.stdout || ''}${probeRequire.stderr || ''}`;

let guardProblem = false;
let probeCrash = null;
if (cliExists) {
  if (/SyntaxError|ReferenceError|TypeError|Cannot find module|ERR_MODULE_NOT_FOUND/.test(probeOut)) {
    const lines = probeOut.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    const errLine = lines.find((l) => /^(SyntaxError|ReferenceError|TypeError|Error|Cannot find module|ERR_)/.test(l));
    probeCrash = (errLine || lines[lines.length - 1] || '（没抓到具体错误行）').slice(0, 200);
  } else if (probeRequire.status !== 0 || probeOut.trim() !== '') {
    guardProblem = true;
  }
}

let classify = null;
let loadError = null;
if (cliExists && !guardProblem && !probeCrash) {
  try {
    ({ classify } = require(CLI));
  } catch (err) {
    loadError = err;
  }
}

const ok = typeof classify === 'function';
const skip = ok ? false : '先修好模块导出/入口，再跑这条';

function moduleTrouble() {
  if (!cliExists) return '还没看到 projects/p1-cli-organizer/src/cli.js —— 先把最小版写出来';
  if (probeCrash) {
    return `你的文件在 require 的时候就炸了：${probeCrash}\n    → 先 node --check projects/p1-cli-organizer/src/cli.js 看语法`;
  }
  if (guardProblem) {
    return 'CLI 入口在 require 的时候就被执行了。\n    → 把入口包起来：if (require.main === module) { ... }';
  }
  if (loadError) return `require 你的文件时报错：${loadError.message}`;
  return 'module.exports 里没有 classify（契约：module.exports = { classify }）';
}

if (!ok && cliExists) {
  console.log(`\n⚠️ 没能加载你的 classify —— 下面除了 00/06 之外全部跳过。\n   原因：${moduleTrouble().split('\n')[0]}\n`);
}

// ─────────────────────────────────────────────────────────────
// 1. 造 fixture 目录树 + 快照工具
// ─────────────────────────────────────────────────────────────
const labRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'p1-cli-verify-'));
const srcDir = path.join(labRoot, 'inbox');

const FIXTURE = {
  'photo.JPG': 10,
  'pic.png': 20,
  'note.txt': 30,
  'report.pdf': 40,
  'clip.mp4': 50,
  'README': 60,
};
fs.mkdirSync(srcDir, { recursive: true });
for (const [name, bytes] of Object.entries(FIXTURE)) {
  fs.writeFileSync(path.join(srcDir, name), Buffer.alloc(bytes, 0x61));
}
const EXPECTED_COUNTS = { images: 2, docs: 2, videos: 1, others: 1 };
const EXPECTED_TOTAL = Object.keys(FIXTURE).length;

/** 递归记下"目录里有什么"：相对路径 + 字节数（用来比对有没有被动过） */
function snapshot(dir) {
  const out = [];
  const walk = (d, rel) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const abs = path.join(d, e.name);
      const r = rel ? path.join(rel, e.name) : e.name;
      if (e.isDirectory()) walk(abs, r);
      else out.push(r + ':' + fs.statSync(abs).size);
    }
  };
  walk(dir, '');
  return out.sort();
}

const emptyDir = path.join(labRoot, 'empty');
fs.mkdirSync(emptyDir, { recursive: true });

let cleaned = false;
function cleanup() {
  if (cleaned) return;
  cleaned = true;
  try {
    fs.rmSync(labRoot, { recursive: true, force: true });
  } catch {
    /* 清理失败不掩盖判据结果 */
  }
}
after(cleanup);
process.on('exit', cleanup);

after(() => {
  console.log(
    '\n判据覆盖面：00–07 共 8 条必过 + P 探针 1 条 = 本文件 9 条 test()。\n' +
      '（报绿之前看一眼上面的 pass 数：大半是 skipped、pass 只有个位数，那不是绿，是没跑起来。）'
  );
});

const runCli = (args) => spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', timeout: 30000 });

// ─────────────────────────────────────────────────────────────
// 必过项
// ─────────────────────────────────────────────────────────────
test('00 src/cli.js 能被 require，并导出 classify 函数', () => {
  assert.strictEqual(typeof classify, 'function', moduleTrouble());
});

test('01 classify：分类规则（含大写、含没有扩展名的）', { skip }, () => {
  const cases = [
    ['photo.JPG', 'images'],
    ['pic.png', 'images'],
    ['a.gif', 'images'],
    ['a.jpeg', 'images'],
    ['note.txt', 'docs'],
    ['report.pdf', 'docs'],
    ['a.docx', 'docs'],
    ['a.md', 'docs'],
    ['clip.mp4', 'videos'],
    ['a.mov', 'videos'],
    ['README', 'others'],
    ['a.zip', 'others'],
    ['没有扩展名', 'others'],
  ];
  const wrong = [];
  for (const [name, want] of cases) {
    let got;
    try {
      got = classify(name);
    } catch (err) {
      wrong.push(`   · ${name} → 抛错了：${err.message}`);
      continue;
    }
    if (got !== want) wrong.push(`   · ${name}：应该 ${want}，你给的是 ${JSON.stringify(got)}`);
  }
  assert.deepStrictEqual(
    wrong,
    [],
    `分类规则有 ${wrong.length} 处不对（规则表见任务书/README）：\n${wrong.join('\n')}\n   （提示：大小写要不要管？没有扩展名的算哪类？）`
  );
});

test('02 干跑：打印计划 + 汇总 + 【文件一个都没动】', { skip }, () => {
  const before = snapshot(srcDir);
  const r = runCli([srcDir]);
  const out = `${r.stdout || ''}${r.stderr || ''}`;

  assert.strictEqual(r.status, 0, `退出码 ${r.status}（期望 0）。输出：\n${out.slice(0, 700) || '（没有任何输出）'}`);

  const missingNames = Object.keys(FIXTURE).filter((n) => !out.includes(n));
  assert.deepStrictEqual(
    missingNames,
    [],
    `输出里应该出现每个文件的文件名，这些没找到：${missingNames.join('、')}。实际输出：\n${out.slice(0, 700)}`
  );

  for (const [cat, n] of Object.entries(EXPECTED_COUNTS)) {
    const re = new RegExp(`${cat}\\s*[:：]?\\s*${n}`); // 「images 2」/「images: 2」/「images：2」都算
    assert.ok(
      re.test(out),
      `汇总行里应该有「${cat} ${n}」（期望格式如：共 6 个文件：images 2、docs 2、videos 1、others 1）。实际输出：\n${out.slice(0, 700)}`
    );
  }

  const after_ = snapshot(srcDir);
  assert.deepStrictEqual(
    after_,
    before,
    '⚠️ **干跑却动了文件**！这个目录在做计划的时候应该是只读的。\n' +
      `   跑之前：${before.join(' | ')}\n   跑之后：${after_.join(' | ')}`
  );
});

test('03 --apply 也不许动文件（今天还没实现它）', { skip }, () => {
  const before = snapshot(srcDir);
  const r = runCli([srcDir, '--apply']);
  const out = `${r.stdout || ''}${r.stderr || ''}`;

  const after_ = snapshot(srcDir);
  assert.deepStrictEqual(
    after_,
    before,
    '⚠️ **`--apply` 动了文件**！今天它还不该实现（Day 14 才做），必须先做到"怎么调都不动文件"。\n' +
      `   跑之前：${before.join(' | ')}\n   跑之后：${after_.join(' | ')}`
  );
  assert.ok(
    r.status !== 0 || /没实现|尚未实现|未实现|Day\s*14|not implemented/i.test(out),
    `今天 \`--apply\` 应该明确说明"还没实现"（并给非零退出码）。实际输出：\n${out.slice(0, 400) || '（没有任何输出）'}`
  );
});

test('04 源目录不存在：一句人话 + 非零退出码（不是崩栈）', { skip }, () => {
  const missing = path.join(labRoot, 'no-such-dir');
  const r = runCli([missing]);
  const out = `${r.stdout || ''}${r.stderr || ''}`;

  if (/\n\s+at\s+\S+/.test(out)) {
    assert.fail(`目录不存在时打出了调用栈 —— 用 try/catch 包住，打印一句人能看懂的话。实际输出：\n${out.slice(0, 600)}`);
  }
  assert.ok(out.trim().length > 0, `目录不存在时一句话都没说就退出了 —— 至少要说明是哪个目录不存在`);
  assert.notStrictEqual(r.status, 0, `目录不存在时退出码应该是非 0（现在 ${r.status}），否则脚本嵌进流水线时会被当成成功`);
});

test('05 空目录：汇总 0，不报错', { skip }, () => {
  const r = runCli([emptyDir]);
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  assert.strictEqual(r.status, 0, `空目录不该算错误（退出码 ${r.status}）。输出：\n${out.slice(0, 400)}`);
  assert.ok(
    /0/.test(out),
    `空目录的汇总里应该有 0（例如「共 0 个文件：images 0、docs 0、videos 0、others 0」）。实际输出：\n${out.slice(0, 400)}`
  );
});

test('06 模块能被 require 而不会顺手把 CLI 入口跑起来', () => {
  assert.ok(
    !guardProblem,
    moduleTrouble() + `\n    （实测：require 它时退出码 ${probeRequire.status}，输出：${JSON.stringify(probeOut.trim().slice(0, 200))}）`
  );
});

test('07 汇总行的四个分类都出现（顺序固定：images、docs、videos、others）', { skip }, () => {
  const r = runCli([srcDir]);
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  // ⚠️ 只查【汇总那一行】：计划行里的分类顺序跟着文件名走，不能拿来判顺序
  const line = out.split('\n').find((l) => /共\s*\d+\s*个文件/.test(l));
  assert.ok(line, `要有一行汇总，形如「共 6 个文件：images 2、docs 2、videos 1、others 1」。实际输出：\n${out.slice(0, 700)}`);
  const idx = ['images', 'docs', 'videos', 'others'].map((c) => line.indexOf(c));
  assert.ok(idx.every((x) => x >= 0), `汇总行里四个分类都要出现。实际：${line}`);
  assert.ok(idx[0] < idx[1] && idx[1] < idx[2] && idx[2] < idx[3], `汇总行里要按 images → docs → videos → others 排。实际：${line}`);
});

// ─────────────────────────────────────────────────────────────
// 探针（只记录，不判错）
// ─────────────────────────────────────────────────────────────
test('P 探针：--verbose / --target / 无参数 / 子目录（只记录，不判错）', { skip }, () => {
  console.log(`\n探针（只记录，不判错；fixture = ${srcDir}，跑完会删）：`);

  // P1 --verbose
  try {
    const base = runCli([srcDir]);
    const r = runCli([srcDir, '--verbose']);
    const out = `${r.stdout || ''}${r.stderr || ''}`;
    const more = out.length > `${base.stdout || ''}`.length;
    console.log(`  · --verbose（退出码 ${r.status}）：${more ? '✅ 输出比默认更长' : '⚠️ 和默认一样长（可能还没实现）'}`);
  } catch (err) {
    console.log(`  · --verbose：探针自己出错 — ${err.message}`);
  }

  // P2 --target
  try {
    const r = runCli([srcDir, '--target', path.join(labRoot, 'out')]);
    const out = `${r.stdout || ''}${r.stderr || ''}`;
    const shown = out.includes('out');
    const created = fs.existsSync(path.join(labRoot, 'out'));
    console.log(
      `  · --target：${shown ? '✅ 输出里出现了目标目录' : '⚠️ 输出里没看到目标目录'}；` +
        `目标目录${created ? '被创建了（今天任务书说"只显示，不创建" —— 看你自己怎么定）' : '没被创建 ✅'}`
    );
  } catch (err) {
    console.log(`  · --target：探针自己出错 — ${err.message}`);
  }

  // P3 无参数
  try {
    const r = runCli([]);
    const out = `${r.stdout || ''}${r.stderr || ''}`;
    console.log(`  · 无参数（退出码 ${r.status}）：${out.trim() ? '✅ 有提示：' + out.trim().split('\n')[0].slice(0, 60) : '⚠️ 什么都没输出'}`);
  } catch (err) {
    console.log(`  · 无参数：探针自己出错 — ${err.message}`);
  }

  // P4 子目录要不要递归（今天任务书没规定，记一笔，Day 14 再定）
  try {
    const withSub = path.join(labRoot, 'with-sub');
    fs.mkdirSync(path.join(withSub, 'sub'), { recursive: true });
    fs.writeFileSync(path.join(withSub, 'top.txt'), 'x');
    fs.writeFileSync(path.join(withSub, 'sub', 'deep.png'), 'x');
    const r = runCli([withSub]);
    const out = `${r.stdout || ''}${r.stderr || ''}`;
    console.log(
      `  · 子目录：${out.includes('deep.png') ? '**递归了**（子目录里的文件也列出来了）' : '只扫了顶层（子目录里的 deep.png 没出现）'}` +
        ' ← 今天没规定，两种都行；**写进 README 的「已知限制」或设计说明**'
    );
  } catch (err) {
    console.log(`  · 子目录：探针自己出错 — ${err.message}`);
  }

  console.log('  （探针不判错：--verbose / --target / 用法提示 属砍单顺序里可以顺延的，欠了要登记进日志）\n');
});
