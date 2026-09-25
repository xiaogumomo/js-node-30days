// Day 11 判据：验收 week2-runtime/day11-ndjson.js（AI 写）
//
// 跑法：node --test week2-runtime/day11-ndjson-verify.js
//
// 结构照项目惯例分两档：
//   · 必过（判对错）—— summarize 的四个数字 / 字节不是字符 / 坏行不崩 / 命令行出数字 / 不存在时友好报错 / 模块能被 require
//   · 探针（只记录不判错）—— --json / 空文件 / 全是空行的文件
//
// 判据自己造一个已知内容的 .ndjson 小文件（系统临时目录，跑完删掉，不碰仓库）：
//   ① {"id":1,"name":"小明"}         → ok   （中文：字节 ≠ 字符，用来抓"用 length 当字节"）
//   ② {"id":2}                       → ok
//   ③ （空行，0 长度）                → 不算 lines
//   ④ {"id":3,"note":"中文内容"}      → ok
//   ⑤ {"broken":                     → bad  （JSON 不完整）
//   ⑥ not json at all                → bad
//   ⑦ {"id":4}                       → ok   ← 【最后一行没有换行符】（别漏它）
//   期望：lines=6  ok=4  bad=2  bytes=文件真实字节数
//   （数字不是抄来的：下面写完文件会真的 stat 一遍再算，免得我自己算错）

const { test, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const SCRIPT = path.join(__dirname, 'day11-ndjson.js');

// ─────────────────────────────────────────────────────────────
// 0. 先探：require 你的文件会不会把 CLI 入口也执行了
//    （入口没包进 `if (require.main === module)` 时就会执行；万一它里面有 process.exit()，
//      判据进程当场就死了 —— 所以先在一个独立子进程里探，再决定要不要在本进程里 require）
// ─────────────────────────────────────────────────────────────
const scriptExists = fs.existsSync(SCRIPT);

if (!scriptExists) {
  console.log(
    '\n⚠️ 还没看到 week2-runtime/day11-ndjson.js —— 这份判据是拿来验收它的。\n' +
      '   先写出"整读版"（能出四个数字就算），再回来跑。\n'
  );
}

const probeRequire = scriptExists
  ? spawnSync(process.execPath, ['-e', `require(${JSON.stringify(SCRIPT)})`], {
      encoding: 'utf8',
      timeout: 20000,
    })
  : { status: 0, stdout: '' };
const probeOut = `${probeRequire.stdout || ''}${probeRequire.stderr || ''}`;

// require 时的输出分两种，报错文案完全不同，别混：
//   · 文件本身炸了（语法错 / 引了不存在的模块）→ probeCrash
//   · 文件没事，只是入口没包 require.main、被顺手执行了 → guardProblem
let guardProblem = false;
let probeCrash = null;
if (scriptExists) {
  if (/SyntaxError|ReferenceError|TypeError|Cannot find module|ERR_MODULE_NOT_FOUND/.test(probeOut)) {
    const lines = probeOut.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    const errLine = lines.find((l) => /^(SyntaxError|ReferenceError|TypeError|Error|Cannot find module|ERR_)/.test(l));
    probeCrash = (errLine || lines[lines.length - 1] || '（没抓到具体错误行）').slice(0, 200);
  } else if (probeRequire.status !== 0 || probeOut.trim() !== '') {
    guardProblem = true;
  }
}

let summarize = null;
let loadError = null;
if (scriptExists && !guardProblem && !probeCrash) {
  try {
    ({ summarize } = require(SCRIPT));
  } catch (err) {
    loadError = err;
  }
}

const ok = typeof summarize === 'function';
const skip = ok ? false : '先修好模块导出/入口，再跑这条';

function moduleTrouble() {
  if (!scriptExists) {
    return '还没看到 week2-runtime/day11-ndjson.js —— 先把它写出来（整读版就行），再跑这份判据';
  }
  if (probeCrash) {
    return (
      `你的文件在 require 的时候就炸了：${probeCrash}\n` +
      '    → 先 node --check week2-runtime/day11-ndjson.js 看语法；引了不存在的模块也会长这样'
    );
  }
  if (guardProblem) {
    return (
      'CLI 入口在 require 的时候就被执行了。\n' +
      '    → 把入口那几行包起来：if (require.main === module) { ... }'
    );
  }
  if (loadError) return `require 你的文件时报错：${loadError.message}`;
  return 'module.exports 里没有 summarize（契约：module.exports = { summarize }）';
}

if (!ok && scriptExists) {
  console.log(`\n⚠️ 没能加载你的 summarize —— 下面除了 00/07 之外全部跳过。\n   原因：${moduleTrouble().split('\n')[0]}\n`);
}

// ─────────────────────────────────────────────────────────────
// 1. 造 fixture（字节数照 stat 实算）
// ─────────────────────────────────────────────────────────────
const labRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'day11-verify-'));
const fixture = path.join(labRoot, 'sample.ndjson');

const FIXTURE_TEXT =
  '{"id":1,"name":"小明"}\n' + // ① ok（中文）
  '{"id":2}\n' + // ② ok
  '\n' + // ③ 空行 → 不算 lines
  '{"id":3,"note":"中文内容"}\n' + // ④ ok
  '{"broken":\n' + // ⑤ bad（JSON 不完整）
  'not json at all\n' + // ⑥ bad
  '{"id":4}'; // ⑦ ok  ← 最后一行【没有换行符】
fs.writeFileSync(fixture, FIXTURE_TEXT, 'utf8');

const EXPECTED = {
  lines: 6,
  ok: 4,
  bad: 2,
  bytes: fs.statSync(fixture).size,
};
// 自检：这个 fixture 本身要符合预期（免得我数错）
assert.strictEqual(EXPECTED.lines, FIXTURE_TEXT.split('\n').filter((l) => l.length > 0).length, '判据自己的 fixture 数错了');
assert.strictEqual(EXPECTED.ok + EXPECTED.bad, EXPECTED.lines, '判据自己的 fixture 数错了');

// 空文件 / 全空行文件（探针用）
const emptyFile = path.join(labRoot, 'empty.ndjson');
fs.writeFileSync(emptyFile, '', 'utf8');
const blankFile = path.join(labRoot, 'blank.ndjson');
fs.writeFileSync(blankFile, '\n\n\n', 'utf8');

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
      '（这就是那个「绿」的含金量 —— 报绿之前看一眼上面的 pass 数：\n' +
      '  如果大半是 skipped、pass 只有个位数，那不是绿，是没跑起来。）'
  );
});

const asNum = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);
const runCli = (args) =>
  spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', timeout: 30000 });

// ─────────────────────────────────────────────────────────────
// 必过项
// ─────────────────────────────────────────────────────────────
test('00 模块能被 require，并导出 summarize 函数', () => {
  assert.strictEqual(typeof summarize, 'function', moduleTrouble());
});

test('01 summarize(file) 返回 { lines, ok, bad, bytes }', { skip }, async () => {
  const got = await summarize(fixture);
  assert.ok(got && typeof got === 'object', `要返回一个对象，实际拿到 ${typeof got}`);
  for (const key of ['lines', 'ok', 'bad', 'bytes']) {
    assert.ok(key in got, `返回的对象缺 ${key}。实际拿到：${JSON.stringify(got).slice(0, 300)}`);
    assert.ok(Number.isFinite(got[key]), `${key} 要是数字，实际是 ${typeof got[key]}（${got[key]}）`);
  }
});

test('02 lines / ok / bad 三个数字对（空行不算、坏行要计数、最后一行别漏）', { skip }, async () => {
  const got = await summarize(fixture);
  const hints = [];
  if (asNum(got.bad) === 0 && asNum(got.lines) === EXPECTED.lines) {
    hints.push('   · bad 是 0 → 坏行可能被直接抛出去了（要求是"计数不抛错"），或者你把 try/catch 写在别处了');
  }
  if (asNum(got.lines) > EXPECTED.lines) {
    hints.push('   · lines 偏大 → 空行（长度为 0 的行）是不是也算进去了？');
  }
  if (asNum(got.lines) === EXPECTED.lines - 1) {
    hints.push('   · lines 少 1 → 少了一行：fixture 的最后一行【没有换行符】，用 split("\\n") 时别把它丢掉');
  }
  if (asNum(got.ok) === EXPECTED.bad && asNum(got.bad) === EXPECTED.ok) {
    hints.push('   · ok 和 bad 正好互换了 → 两个变量是不是写反了？');
  }
  const tail = hints.length ? `\n${hints.join('\n')}` : '';
  assert.strictEqual(
    asNum(got.lines),
    EXPECTED.lines,
    `lines 应该是 ${EXPECTED.lines}（有内容的行数，不含空行），你给的是 ${got.lines}${tail}`
  );
  assert.strictEqual(asNum(got.ok), EXPECTED.ok, `ok 应该是 ${EXPECTED.ok}，你给的是 ${got.ok}${tail}`);
  assert.strictEqual(asNum(got.bad), EXPECTED.bad, `bad 应该是 ${EXPECTED.bad}，你给的是 ${got.bad}${tail}`);
});

test('03 bytes 是【字节】不是字符（stat.size，别用 content.length）', { skip }, async () => {
  const got = await summarize(fixture);
  if (asNum(got.bytes) === EXPECTED.bytes) return;
  const charLen = FIXTURE_TEXT.length;
  const hints = [];
  if (asNum(got.bytes) === charLen) {
    hints.push(`   · 正好等于 ${charLen} = 这个 fixture 的【字符】数 → 你用的是字符串长度；中文一个字 3 字节，要用 stat.size 或 Buffer.byteLength`);
  }
  assert.fail(
    `bytes 应该是 ${EXPECTED.bytes}（文件真实字节数），你给的是 ${got.bytes}` + (hints.length ? `\n${hints.join('\n')}` : '')
  );
});

test('04 命令行：node day11-ndjson.js <文件> 能跑出四个数字', { skip }, () => {
  const r = runCli([fixture]);
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  assert.strictEqual(r.status, 0, `退出码 ${r.status}（期望 0）。输出：\n${out.slice(0, 600) || '（没有任何输出）'}`);
  for (const [name, v] of Object.entries(EXPECTED)) {
    assert.ok(
      out.includes(String(v)),
      `输出里应该出现 ${name} = ${v}，但没找到。实际输出：\n${out.slice(0, 600) || '（没有任何输出）'}`
    );
  }
});

test('05 命令行：文件不存在时友好报错（不是崩一堆栈）', { skip }, () => {
  const missing = path.join(labRoot, 'no-such.ndjson');
  const r = runCli([missing]);
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  if (/\n\s+at\s+\S+/.test(out)) {
    assert.fail(`文件不存在时打出了调用栈 —— 用 try/catch 包住，打印一句人能看懂的话。实际输出：\n${out.slice(0, 600)}`);
  }
  assert.ok(out.trim().length > 0, `文件不存在时一句话都没说就退出了（退出码 ${r.status}）—— 至少要说明是哪个文件不存在`);
  if (r.status === 0) {
    console.log('   ℹ️ 探针：文件不存在时退出码是 0。不算错，但建议 process.exitCode = 1。');
  }
});

test('06 坏行不崩：满文件里混着 2 条坏行，仍然能读完并给出数字', { skip }, async () => {
  // 与 02 是同一件事的两面：02 判数字，这条判"有没有把整份文件读完"
  const got = await summarize(fixture);
  assert.strictEqual(
    asNum(got.lines),
    EXPECTED.lines,
    `坏行应该只被"计数"，不该让程序提前结束 —— lines 应该是 ${EXPECTED.lines}，你给的是 ${got.lines}`
  );
  assert.strictEqual(asNum(got.ok) + asNum(got.bad), asNum(got.lines), `ok + bad 应该等于 lines（${got.ok} + ${got.bad} ≠ ${got.lines}）`);
});

// ⚠️ 07 故意不跟 skip 走：模块加载不起来时，恰恰要靠它说清是为什么
test('07 模块能被 require 而不会顺手把 CLI 入口跑起来', () => {
  assert.ok(
    !guardProblem,
    moduleTrouble() + `\n    （实测：require 它时退出码 ${probeRequire.status}，输出：${JSON.stringify(probeOut.trim().slice(0, 200))}）`
  );
});

// ─────────────────────────────────────────────────────────────
// 探针（只记录，不判错）
// ─────────────────────────────────────────────────────────────
test('P 探针：--json / 空文件 / 全是空行的文件（只记录，不判错）', { skip }, async () => {
  console.log(`\n探针（只记录，不判错；fixture = ${fixture}，跑完会删）：`);

  // P1 --json
  try {
    const r = runCli([fixture, '--json']);
    const out = String(r.stdout || '').trim();
    let parsed = null;
    try {
      parsed = JSON.parse(out);
    } catch {
      const m = out.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch {
          parsed = null;
        }
      }
    }
    if (!parsed) {
      console.log(`  · --json（退出码 ${r.status}）：⚠️ 输出不是能 JSON.parse 的东西（可能还没实现）`);
    } else {
      const same = parsed.lines === EXPECTED.lines && parsed.ok === EXPECTED.ok && parsed.bad === EXPECTED.bad;
      console.log(
        `  · --json：解析成功，lines=${parsed.lines} ok=${parsed.ok} bad=${parsed.bad} ` +
          `${same ? '✅ 和 summarize() 一致' : '⚠️ 和 summarize() 对不上 —— 两条路要产出同一份数字'}`
      );
    }
  } catch (err) {
    console.log(`  · --json：探针自己出错了 — ${err.message}`);
  }

  // P2 空文件
  try {
    const got = await summarize(emptyFile);
    const shapeOk = got && got.lines === 0 && got.ok === 0 && got.bad === 0 && got.bytes === 0;
    console.log(`  · 空文件：${JSON.stringify(got)}  ${shapeOk ? '✅ 与直觉一致' : '⚠️ 直觉上四个数字都该是 0，自己看合不合理'}`);
  } catch (err) {
    console.log(`  · 空文件：抛错了 — ${err.message}  ⚠️ 空文件算不算"坏"，是个设计选择，记一笔`);
  }

  // P3 全是空行的文件
  try {
    const got = await summarize(blankFile);
    console.log(`  · 全是空行：${JSON.stringify(got)}  （空行不算 lines → 直觉上 lines 应该是 0）`);
  } catch (err) {
    console.log(`  · 全是空行：抛错了 — ${err.message}`);
  }

  console.log('  （探针不判错：--json 属任务书「砍单顺序」里可以顺延的，欠了要登记进日志）\n');
});
