// Day 10 判据：验收 week2-runtime/day10-dir-size.js（AI 写）
//
// 跑法：node --test week2-runtime/day10-dir-size-verify.js
//
// 结构照项目惯例分两档：
//   · 必过（判对错）—— dirSize 的形状与数字 / 命令行跑得出数字 / 目录不存在时不崩栈 / 模块能被 require
//   · 探针（只记录不判错）—— 空目录 / --top=3 / --json
//     （这三项在任务书「砍单顺序」里可以顺延，所以没做不算红；跑完在最后打印一行结论）
//
// 判据自己造一棵已知大小的临时目录树（在系统临时目录里，跑完删掉，不碰仓库）：
//   root/a.txt            10 字节
//   root/chinese.txt       6 字节（「中文」2 个字符 → UTF-8 是 6 字节；用字符串长度算会得到 2）
//   root/sub/b.txt        20 字节
//   root/sub/c.txt        30 字节
//   root/sub/deep/d.bin   40 字节   ← 两层深，用来抓「只递归一层」
//   root/f.txt             1 字节   ← 最小，用来抓「largest 没截断到 5」
//   root/empty/            空目录   ← 探针
//   合计 6 个文件 / 107 字节，前 5 大 = d.bin(40) c.txt(30) b.txt(20) a.txt(10) chinese.txt(6)
//   （数字不是抄来的：下面建完树会真的 stat 一遍再算，免得我自己算错）

const { test, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const SCRIPT = path.join(__dirname, 'day10-dir-size.js');
const TOP_N = 5; // 契约：largest 默认前 5

// ─────────────────────────────────────────────────────────────
// 0. 先探一件事：require 你的文件，会不会把 CLI 入口也执行了？
//    （入口没包进 `if (require.main === module)` 时就会执行；万一它里面有 process.exit()，
//      判据进程当场就死了 —— 所以先在一个独立子进程里探，再决定要不要在本进程里 require）
// ─────────────────────────────────────────────────────────────
const scriptExists = fs.existsSync(SCRIPT);

if (!scriptExists) {
  console.log(
    '\n⚠️ 还没看到 week2-runtime/day10-dir-size.js —— 这份判据是拿来验收它的。\n' +
      '   先写出最小版（只统计当前目录、能出数字就算），再回来跑。\n'
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
  if (/SyntaxError|Cannot find module|ERR_MODULE_NOT_FOUND/.test(probeOut)) {
    // 挑「错误那一行」，别挑 Node 的版本号（最后一行往往是 Node.js v24.x）
    const lines = probeOut.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    const errLine = lines.find((l) => /^(SyntaxError|ReferenceError|TypeError|Error|Cannot find module|ERR_)/.test(l));
    probeCrash = (errLine || lines[lines.length - 1] || '（没抓到具体错误行）').slice(0, 200);
  } else if (probeRequire.status !== 0 || probeOut.trim() !== '') {
    guardProblem = true;
  }
}

let dirSize = null;
let loadError = null;
if (scriptExists && !guardProblem && !probeCrash) {
  try {
    ({ dirSize } = require(SCRIPT));
  } catch (err) {
    loadError = err;
  }
}

const ok = typeof dirSize === 'function';
const skip = ok ? false : '先修好模块导出/入口，再跑这条';

function moduleTrouble() {
  if (!scriptExists) {
    return '还没看到 week2-runtime/day10-dir-size.js —— 先把它写出来（最小版就行），再跑这份判据';
  }
  if (probeCrash) {
    return (
      `你的文件在 require 的时候就炸了：${probeCrash}\n` +
      '    → 先 node --check week2-runtime/day10-dir-size.js 看语法；引了不存在的模块也会长这样'
    );
  }
  if (guardProblem) {
    return (
      'CLI 入口在 require 的时候就被执行了。\n' +
      '    → 把入口那几行包起来：if (require.main === module) { ... }'
    );
  }
  if (loadError) return `require 你的文件时报错：${loadError.message}`;
  return 'module.exports 里没有 dirSize（契约：module.exports = { dirSize }）';
}

if (!ok && scriptExists) {
  console.log(`\n⚠️ 没能加载你的 dirSize —— 下面除了 00/08 之外全部跳过。\n   原因：${moduleTrouble().split('\n')[0]}\n`);
}

// ─────────────────────────────────────────────────────────────
// 1. 造临时目录树
// ─────────────────────────────────────────────────────────────
const labRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'day10-verify-'));
const root = path.join(labRoot, 'root');

const TREE = [
  ['a.txt', Buffer.alloc(10, 0x61)],
  ['chinese.txt', Buffer.from('中文', 'utf8')],
  ['sub/b.txt', Buffer.alloc(20, 0x62)],
  ['sub/c.txt', Buffer.alloc(30, 0x63)],
  ['sub/deep/d.bin', Buffer.alloc(40, 0x64)],
  ['f.txt', Buffer.alloc(1, 0x65)],
];

for (const [rel, buf] of TREE) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, buf);
}
fs.mkdirSync(path.join(root, 'empty'), { recursive: true });

// 建完真的量一遍（别信手算）
const EXPECTED = { totalBytes: 0, fileCount: 0, files: [] };
for (const [rel, buf] of TREE) {
  const size = fs.statSync(path.join(root, rel)).size;
  assert.strictEqual(size, buf.length, `判据自己的准备步骤就错了：${rel} 应该是 ${buf.length} 字节，实际 ${size}`);
  EXPECTED.totalBytes += size;
  EXPECTED.fileCount += 1;
  EXPECTED.files.push({ rel, size });
}
EXPECTED.largest = [...EXPECTED.files].sort((a, b) => b.size - a.size).slice(0, TOP_N);

// 中文那个文件：字节数 vs 字符数（诊断用）
const cn = EXPECTED.files.find((f) => f.rel === 'chinese.txt');
const CN_CHARS = '中文'.length;

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
process.on('exit', cleanup); // 兜底：万一判据进程被你的代码 process.exit 掉

after(() => {
  console.log(
    '\n判据覆盖面：00–08 共 9 条必过 + P 探针 1 条 = 本文件 10 条 test()。\n' +
      '（这就是那个「绿」的含金量 —— 报绿之前看一眼上面的 pass 数：\n' +
      '  如果大半是 skipped、pass 只有个位数，那不是绿，是没跑起来。）'
  );
});

// ─────────────────────────────────────────────────────────────
// 小工具
// ─────────────────────────────────────────────────────────────
const asPosix = (p) => String(p).replace(/\\/g, '/').replace(/^\.\//, '');
const runCli = (args) =>
  spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', timeout: 30000 });

// ─────────────────────────────────────────────────────────────
// 必过项
// ─────────────────────────────────────────────────────────────
// ⚠️ 00 和 08 两个加载类的检查**故意不跟 skip 走**：模块没加载起来时，恰恰要靠它们说清是为什么。
//    （第一版让它们跟着 skip 一起跳过了 → 「一行没跑、退出码 0」，这是假绿 —— 负向验证时抓到的）
test('00 模块能被 require，并导出 dirSize 函数', () => {
  assert.strictEqual(typeof dirSize, 'function', moduleTrouble());
});

test('01 dirSize(dir) 返回 { totalBytes, fileCount, largest }', { skip }, async () => {
  const got = await dirSize(root);
  assert.ok(got && typeof got === 'object', `要返回一个对象，实际拿到 ${typeof got}`);
  for (const key of ['totalBytes', 'fileCount', 'largest']) {
    assert.ok(key in got, `返回的对象缺 ${key}。实际拿到：${JSON.stringify(got).slice(0, 300)}`);
  }
  assert.ok(Array.isArray(got.largest), `largest 要是数组，实际是 ${typeof got.largest}`);
});

test('02 totalBytes = 递归所有文件的字节数之和（含两层子目录、按字节不按字符）', { skip }, async () => {
  const { totalBytes } = await dirSize(root);
  if (totalBytes !== EXPECTED.totalBytes) {
    const hints = [];
    if (totalBytes === EXPECTED.totalBytes - (cn.size - CN_CHARS)) {
      hints.push(
        `   · 差正是 chinese.txt 的「字节 − 字符」= ${cn.size} − ${CN_CHARS} = ${cn.size - CN_CHARS} ` +
          `→ 你大概是读了文件内容用 content.length 算的；要用字节（fs.stat 的 size），或 Buffer.byteLength(content)`
      );
    }
    if (totalBytes < EXPECTED.totalBytes) {
      hints.push('   · 偏小 → 检查有没有递归进 sub/ 和 sub/deep/（下面 fileCount 也会帮你确认）');
    }
    if (totalBytes > EXPECTED.totalBytes) {
      hints.push('   · 偏大 → 检查是不是把目录本身的 size 也加进去了（目录的 stat.size 在 Windows 上是 0，别依赖）');
    }
    assert.fail(
      `totalBytes 应该是 ${EXPECTED.totalBytes}，你给的是 ${totalBytes}\n` +
        `   （树：${EXPECTED.files.map((f) => `${asPosix(f.rel)}=${f.size}`).join(' ')}）` +
        (hints.length ? `\n${hints.join('\n')}` : '')
    );
  }
});

test('03 fileCount = 文件个数，不含目录', { skip }, async () => {
  const { fileCount } = await dirSize(root);
  if (fileCount !== EXPECTED.fileCount) {
    const hint =
      fileCount > EXPECTED.fileCount
        ? `   · 偏大 → 可能把目录也数进去了（树里除 6 个文件外还有 3 个目录：sub/、sub/deep/、empty/）`
        : '   · 偏小 → 检查有没有递归进子目录';
    assert.fail(`fileCount 应该是 ${EXPECTED.fileCount}，你给的是 ${fileCount}\n${hint}`);
  }
});

test('04 largest 默认最多 5 条、按字节从大到小', { skip }, async () => {
  const { largest } = await dirSize(root);
  assert.ok(Array.isArray(largest), 'largest 要是数组');
  assert.ok(
    largest.length <= TOP_N,
    `默认最多 ${TOP_N} 条，你给了 ${largest.length} 条（树里一共 ${EXPECTED.fileCount} 个文件 —— 是不是没截断？）`
  );
  const sizes = largest.map((it) => it?.bytes);
  for (let i = 1; i < sizes.length; i += 1) {
    assert.ok(
      sizes[i - 1] >= sizes[i],
      `要按字节从大到小，第 ${i} 和第 ${i + 1} 条反了：${JSON.stringify(sizes)}`
    );
  }
  const want = EXPECTED.largest.map((f) => f.size);
  const got = sizes.slice(0, TOP_N);
  assert.deepStrictEqual(got, want, `前 ${TOP_N} 大的字节数应该是 [${want}]，你给的是 [${got}]`);
});

test('05 largest[].path 是相对被统计目录的路径、bytes 与文件对得上', { skip }, async () => {
  const { largest } = await dirSize(root);
  const wantBySize = new Map(EXPECTED.largest.map((f) => [f.size, asPosix(f.rel)]));
  for (const item of largest) {
    assert.ok(item && typeof item === 'object', `largest 的每一项要是 { path, bytes }，实际：${JSON.stringify(item)}`);
    assert.ok('path' in item && 'bytes' in item, `largest 每一项要有 path 和 bytes，实际：${JSON.stringify(item)}`);
    if (path.isAbsolute(item.path)) {
      assert.fail(
        `largest 里的 path 是绝对路径（${item.path}）—— 契约要「相对被统计目录」的路径，如 sub/deep/d.bin`
      );
    }
    const want = wantBySize.get(item.bytes);
    if (want === undefined) {
      assert.fail(
        `largest 里有一条 ${item.bytes} 字节（${item.path}），但它不在「前 ${TOP_N} 大」里 ——\n` +
          `   说明 02/04 就已经不对了，先修那两条。期望的前 ${TOP_N} 大：` +
          EXPECTED.largest.map((f) => `${asPosix(f.rel)}=${f.size}`).join(' ')
      );
    }
    const norm = asPosix(path.normalize(item.path));
    assert.strictEqual(
      norm,
      want,
      `${item.bytes} 字节的那个文件应该是 ${want}，你写的是 ${norm}（path.join 拼出来的反斜杠也算对，判据会归一化）`
    );
  }
});

test('06 命令行：node day10-dir-size.js <目录> 能跑出 totalBytes', { skip }, () => {
  const r = runCli([root]);
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  assert.strictEqual(
    r.status,
    0,
    `退出码 ${r.status}（期望 0）。输出：\n${out.slice(0, 600) || '（没有任何输出）'}`
  );
  assert.ok(
    out.includes(String(EXPECTED.totalBytes)),
    `输出里要出现总字节数 ${EXPECTED.totalBytes}（带单位没关系，数字要在）。实际输出：\n${out.slice(0, 600) || '（没有任何输出）'}`
  );
});

test('07 命令行：目录不存在时友好报错（不是崩一堆栈）', { skip }, () => {
  const missing = path.join(root, 'no-such-dir');
  const r = runCli([missing]);
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  const isStacky = /\n\s+at\s+\S+/.test(out);
  const hasSomethingToSay = out.trim().length > 0;
  if (isStacky) {
    assert.fail(
      `目录不存在时打出了调用栈 —— 用 try/catch 包住，打印一句人能看懂的话。实际输出：\n${out.slice(0, 600)}`
    );
  }
  assert.ok(
    hasSomethingToSay,
    `目录不存在时一句话都没说就退出了（退出码 ${r.status}）—— 至少要说明是哪个目录不存在`
  );
  if (r.status === 0) {
    console.log(
      `   ℹ️ 探针：目录不存在时退出码是 0。不算错，但建议 process.exitCode = 1 ——` +
        ` 这样别人把脚本接进流水线时能知道这次没成功。`
    );
  }
});

// ⚠️ 这一条也**故意不跟 skip 走**（同上）。
test('08 模块能被 require 而不会顺手把 CLI 入口跑起来', () => {
  assert.ok(
    !guardProblem,
    moduleTrouble() +
      `\n    （实测：require 它时退出码 ${probeRequire.status}，输出：${JSON.stringify(probeOut.trim().slice(0, 200))}）`
  );
});

// ─────────────────────────────────────────────────────────────
// 探针（只记录，不判错）
// ─────────────────────────────────────────────────────────────
test('P 探针：空目录 / --top=3 / --json（只记录，不判错）', { skip }, async () => {
  console.log(`\n探针（只记录，不判错；临时树 = ${root}，跑完会删）：`);

  // P1 空目录
  try {
    const got = await dirSize(path.join(root, 'empty'));
    const shapeOk =
      got && got.totalBytes === 0 && got.fileCount === 0 && Array.isArray(got.largest) && got.largest.length === 0;
    console.log(
      `  · 空目录：${JSON.stringify(got)}  ` +
        `${shapeOk ? '✅ 与直觉一致' : '⚠️ 直觉上期望 {totalBytes:0, fileCount:0, largest:[]}，自己看合不合理'}`
    );
  } catch (err) {
    console.log(`  · 空目录：抛错了 — ${err.message}  ⚠️ 空目录算不算「不存在」，是个设计选择，记一笔`);
  }

  // P2 --top=3
  try {
    const r = runCli([root, '--top=3']);
    const out = `${r.stdout || ''}${r.stderr || ''}`;
    const dropped = EXPECTED.largest[TOP_N - 1] ? asPosix(EXPECTED.largest[TOP_N - 1].rel) : '';
    const base = path.basename(dropped);
    const keptTop3 = EXPECTED.largest.slice(0, 3).every((f) => out.includes(path.basename(asPosix(f.rel))));
    const droppedOut = base ? !out.includes(base) : false;
    const verdict = keptTop3 && droppedOut ? '✅ 看起来生效（前 3 大都在、第 5 大的不在）' : '⚠️ 没看出效果（可能还没实现，或输出里没带文件名）';
    console.log(`  · --top=3（退出码 ${r.status}）：${verdict}`);
  } catch (err) {
    console.log(`  · --top=3：探针自己出错了 — ${err.message}`);
  }

  // P3 --json
  try {
    const r = runCli([root, '--json']);
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
      const same =
        parsed.totalBytes === EXPECTED.totalBytes && parsed.fileCount === EXPECTED.fileCount;
      console.log(
        `  · --json：解析成功，totalBytes=${parsed.totalBytes} fileCount=${parsed.fileCount} ` +
          `${same ? '✅ 和 dirSize() 一致' : '⚠️ 和 dirSize() 对不上 —— 两条路要产出同一份数字'}`
      );
    }
  } catch (err) {
    console.log(`  · --json：探针自己出错了 — ${err.message}`);
  }

  console.log('  （探针不判错：--top / --json 属于任务书「砍单顺序」里可以顺延的，欠了要登记进日志）\n');
});
