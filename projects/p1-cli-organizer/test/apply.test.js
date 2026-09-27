// Day 14 判据：验收项目 1 的 `--apply`（真的搬文件：流式复制 + 校验）（AI 写）
//
// 跑法：node --test projects/p1-cli-organizer/test/apply.test.js
//
// 契约（也写在 notes/day14-packages-project1.md 和项目 README 里）：
//   node src/cli.js <源目录> [--target <目标目录>] [--verbose] [--apply]
//   · 默认干跑；**只有 `--apply` 才动文件**（干跑那条底线在 cli.test.js 里，这份不重复）
//   · 每个文件 = 4 步：mkdir <目标>/<分类>/ → **流式复制** → **校验**（size + sha256）→ **校验通过才删源**
//   · 任一步失败：**源文件必须还在**、报错要带文件名、退出码非零、**其余文件继续搬**（失败隔离）
//   · 扫描时**跳过目标目录** —— 连跑两次不许"套娃"（`_out/images/photo.jpg` 不能变成 `_out/images/images/photo.jpg`）
//   · 重名冲突（两个子目录里的同名文件）：改名或跳过都行，**不许覆盖、不许丢**
//
// 全部在系统临时目录里造树（跑完删掉，绝不碰仓库）。必过 8 条 + 探针 1 条 = 本文件 9 条 test()。
//
// ⚠️ **一条实话（AI 实测过，才写下来的）**：这份判据**验不了"复制用了流式"这个行为**。
//    - 试过用 `--max-old-space-size=16` + 大文件去卡"整份读进内存"的实现：**卡不住** ——
//      V8 的大对象空间（大字符串 / Buffer）不认这个上限（64MB / 128MB 的文件都照样跑通，只有 256MB 才崩）。
//    - 所以第 06 条改成**看代码的合同检查**（有没有 `createReadStream`/`createWriteStream`、有没有整份 `readFile`），
//      它**不是行为测试**，会被"写成流的样子但不用流"骗过 —— 那部分的牙在 AI 读代码复核，不在判据里。
//    - 第 05 条（24MB 大文件）也只是**规模冒烟**（搬得动、字节不差），**不证明**用了流。

const { test, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { pipeline } = require('node:stream/promises');
const { spawnSync } = require('node:child_process');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const SRC_DIR = path.join(__dirname, '..', 'src');

// ─────────────────────────────────────────────────────────────
// 0. 先探：require 你的文件会不会把 CLI 入口也执行了 / 直接炸掉
// ─────────────────────────────────────────────────────────────
const cliExists = fs.existsSync(CLI);

if (!cliExists) {
  console.log(
    '\n⚠️ 还没看到 projects/p1-cli-organizer/src/cli.js —— 这份判据是拿来验收它的 `--apply` 的。\n' +
      '   先让干跑的判据（cli.test.js）全绿，再回来做 `--apply`。\n'
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
    const err = lines.find((l) => /^(SyntaxError|ReferenceError|TypeError|Error|Cannot find module|ERR_)/.test(l));
    probeCrash = (err || lines[lines.length - 1] || '（没抓到具体错误行）').slice(0, 200);
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
const moduleOk = typeof classify === 'function';
const skip = moduleOk ? false : '先修好模块导出/入口，再跑这条';

function moduleTrouble() {
  if (!cliExists) return '还没看到 projects/p1-cli-organizer/src/cli.js';
  if (probeCrash) return `你的文件在 require 的时候就炸了：${probeCrash}\n    → 先 node --check ${path.relative(process.cwd(), CLI)}`;
  if (guardProblem) return 'require 你的文件时有东西被打印/执行了（模块不该有副作用）';
  if (loadError) return `require 你的文件时报错：${loadError.message}`;
  return 'module.exports 里没有 classify（契约：module.exports = { classify }）';
}
if (!moduleOk && cliExists) console.log(`\n⚠️ 没能加载你的模块 —— 除了 00/07 之外全部跳过。\n   原因：${moduleTrouble().split('\n')[0]}\n`);

// ─────────────────────────────────────────────────────────────
// 临时实验室（每次跑都新建，跑完删掉）
// ─────────────────────────────────────────────────────────────
const labRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'p1-apply-lab-'));

after(() => {
  fs.rmSync(labRoot, { recursive: true, force: true });
  console.log(
    '\n判据覆盖面：00–07 共 8 条必过 + P 探针 1 条 = 本文件 9 条 test()。\n' +
      '（报绿之前看一眼上面的 pass 数：大半是 skipped、pass 只有个位数，那不是绿，是没跑起来。）\n' +
      '    · 06 是**看代码的合同检查**、05 是**规模冒烟** —— 两条都不证明"用了流"，详见文件顶部说明。'
  );
});

const runCli = (args) => spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', timeout: 60000 });

/** 造一棵树：{ '相对路径': '内容' } */
function tree(name, files) {
  const root = path.join(labRoot, name);
  fs.mkdirSync(root, { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
  return root;
}

/** 树下所有文件的相对路径（递归；目录本身不算） */
function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(p);
      else out.push(path.relative(root, p));
    }
  }
  return out.sort();
}

const shaFile = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

/**
 * 把几棵树下所有文件的 sha256 收成一个排序数组。
 * ⚠️ 故意**不带路径**：只看"这些内容还在不在" —— 这样"改名保留"和"跳过保留"两种冲突策略都能过。
 */
function contentBag(roots) {
  const bag = [];
  for (const r of roots) for (const rel of walkFiles(r)) bag.push(shaFile(path.join(r, rel)));
  return bag.sort();
}

// ─────────────────────────────────────────────────────────────
// 必过项
// ─────────────────────────────────────────────────────────────
test('00 模块能被 require，并导出 classify 函数', () => {
  assert.strictEqual(typeof classify, 'function', moduleTrouble());
});

test('01 --apply 真的搬：源目录清空、目标按分类就位、每个文件的 sha256 与原来一致', { skip }, () => {
  const src = tree('t01/src', { 'photo.JPG': 'A 的内容', 'note.txt': 'B 的内容', 'clip.mp4': 'C 的内容', 'README': 'D 的内容' });
  const dst = path.join(labRoot, 't01/dst');
  const beforeBag = contentBag([src]);

  const r = runCli([src, '--apply', '--target', dst]);
  const out = `${r.stdout || ''}${r.stderr || ''}`;

  assert.strictEqual(r.status, 0, `退出码 ${r.status}（期望 0）。输出：\n${out.slice(0, 800) || '（没有任何输出）'}`);

  const left = walkFiles(src);
  assert.deepStrictEqual(
    left,
    [],
    `搬完之后**源目录应该空了**（文件是"搬"不是"复制"），还剩：${left.join('、')}\n   （如果是复制+没删源：那叫复制不叫移动；删源那一步要放在"校验通过"之后）`
  );

  const afterBag = contentBag([dst]);
  assert.deepStrictEqual(
    afterBag,
    beforeBag,
    `目标里的**内容**应该和源一一对应（sha256 集合相等）。\n   搬过去 ${afterBag.length} 个、原来 ${beforeBag.length} 个\n   （对着看：丢内容 / 内容不一样 / 多出空文件，都会在这里露出来）`
  );

  for (const [rel, cat] of [
    ['photo.JPG', 'images'],
    ['note.txt', 'docs'],
    ['clip.mp4', 'videos'],
    ['README', 'others'],
  ]) {
    const p = path.join(dst, cat, rel);
    assert.ok(fs.existsSync(p), `应该出现在 <目标>/${cat}/${rel}（分类规则见 README）`);
  }
});

test('02 重名冲突：两个子目录里的同名文件，一个都不许丢', { skip }, () => {
  const src = tree('t02/src', {
    'a/photo.jpg': 'A 目录里的照片',
    'b/photo.jpg': 'B 目录里的照片',
    'note.txt': '这个没冲突',
  });
  const dst = path.join(labRoot, 't02/dst');
  const beforeBag = contentBag([src]);

  runCli([src, '--apply', '--target', dst]);

  // 源里剩下的 + 目标里的 = 必须还是原来那三份内容
  const afterBag = contentBag([src, dst]);
  assert.deepStrictEqual(
    afterBag,
    beforeBag,
    '⚠️ **有内容丢了**：两个 `photo.jpg` 撞名时，你是不是直接写进同一个名字、把前一个覆盖掉了？\n' +
      '   README 的「已知限制」里就写着这一条。两种活法都行：① 改名（`photo.jpg` → `photo (1).jpg`）② 跳过并报一声。\n' +
      '   判据只看一件事：**原来的每一份内容，搬完之后都还得在**。'
  );

  const movedNote = walkFiles(dst).filter((rel) => rel.endsWith('note.txt'));
  assert.ok(
    movedNote.length > 0,
    '没冲突的那个文件（note.txt）应该照常搬走 —— 遇到冲突可以跳过那一个，但不能整个不干活'
  );
});

test('03 建目录失败时：那一类的源文件原地不动、别的类照常搬、退出码非零', { skip }, () => {
  const src = tree('t03/src', { 'photo.jpg': 'A', 'note.txt': 'B', 'clip.mp4': 'C' });
  const dst = path.join(labRoot, 't03/dst');
  const SENTINEL = '我占住了 images 这个名字（我是个文件，不是目录）';
  fs.mkdirSync(dst, { recursive: true });
  fs.writeFileSync(path.join(dst, 'images'), SENTINEL);

  const r = runCli([src, '--apply', '--target', dst]);
  const out = `${r.stdout || ''}${r.stderr || ''}`;

  assert.strictEqual(
    fs.readFileSync(path.join(dst, 'images'), 'utf8'),
    SENTINEL,
    '⚠️ 目标里那个占位文件被删/被改了 —— 搬不动就报错，**不许去动挡住你的东西**'
  );

  assert.ok(
    fs.existsSync(path.join(src, 'photo.jpg')),
    '⚠️ **搬不动的那一类（images）源文件必须原地不动** —— 建目录/复制失败时，源文件还在才是安全的\n' +
      `   （实测输出：\n${out.slice(0, 600) || '（没有任何输出）'}）`
  );

  assert.ok(
    !fs.existsSync(path.join(src, 'note.txt')),
    'docs 这一类没遇到问题，**应该照常搬走**（一个文件失败不能拖累别的 —— 和 p-limit 的"失败隔离"是同一件事）'
  );

  assert.notStrictEqual(r.status, 0, '有文件没搬成功，退出码要非零（别"看着跑完了"其实丢东西）');
  assert.ok(
    out.includes('photo.jpg'),
    `报错里要带上是哪个文件出了问题（否则用户不知道去哪儿看）。实际输出：\n${out.slice(0, 600) || '（没有任何输出）'}`
  );
});

test('04 幂等：连跑两次，第二次不许把已经搬好的文件再搬一层（目标在源目录里面）', { skip }, () => {
  const src = tree('t04/src', { 'photo.jpg': 'A', 'note.txt': 'B' });
  const dst = path.join(src, '_out'); // ← 目标就在源目录里：最容易"套娃"的排布

  runCli([src, '--apply', '--target', dst]);
  assert.ok(
    fs.existsSync(path.join(dst, 'images', 'photo.jpg')),
    `第一次跑就该把 photo.jpg 搬进 <目标>/images/ 里。实际目标目录里：${walkFiles(dst).join('、') || '（空的）'}`
  );

  runCli([src, '--apply', '--target', dst]);

  assert.ok(
    fs.existsSync(path.join(dst, 'images', 'photo.jpg')),
    '第二次跑不该把已经搬好的文件挪走'
  );
  assert.ok(
    !fs.existsSync(path.join(dst, 'images', 'images')),
    '⚠️ **套娃了**：第二次扫描时把"目标目录自己"也当成了要整理的源目录。\n' +
      '   扫描时要跳过目标目录（否则连跑几次就会变成 _out/images/images/images/…）'
  );

  const bag = contentBag([dst]);
  assert.strictEqual(
    bag.length,
    2,
    `目标里应该还是那 2 个文件（实际 ${bag.length} 个：${walkFiles(dst).join('、')}）`
  );
});

test('05 大文件（24MB）搬得动、字节一模一样（规模冒烟 —— 不证明"用了流"）', { skip, timeout: 60000 }, async () => {
  const src = tree('t05/src', {});
  const big = path.join(src, 'big.bin');
  const CHUNK = Buffer.alloc(1024 * 1024, 65);
  await pipeline(
    async function* () {
      for (let i = 0; i < 24; i++) yield CHUNK;
    },
    fs.createWriteStream(big)
  );
  const expectHash = shaFile(big);
  const dst = path.join(labRoot, 't05/dst');

  const r = runCli([src, '--apply', '--target', dst]);
  const out = `${r.stdout || ''}${r.stderr || ''}`;

  const moved = path.join(dst, 'others', 'big.bin');
  assert.ok(
    fs.existsSync(moved),
    `24MB 的文件没搬成功：<目标>/others/big.bin 不存在（退出码 ${r.status}）。输出：\n${out.slice(0, 800) || '（没有任何输出）'}`
  );
  assert.strictEqual(shaFile(moved), expectHash, '搬过去的字节要和原来一模一样（sha256 对不上 = 内容变了）');
  assert.ok(!fs.existsSync(big), '源文件应该已经删掉（是搬，不是复制）');
});

test('06 合同检查（**看代码**）：用流式复制，没有把整个文件读成一个字符串', { skip }, () => {
  const files = walkFiles(SRC_DIR).filter((rel) => rel.endsWith('.js'));
  assert.ok(files.length > 0, `${path.relative(process.cwd(), SRC_DIR)} 里没有 .js 文件？`);

  const readCode = (rel) =>
    fs
      .readFileSync(path.join(SRC_DIR, rel), 'utf8')
      .split('\n')
      .map((line) => line.replace(/\/\/.*$/, '')) // 去掉行注释，免得注释里的 readFile 也算
      .join('\n');

  const streamy = [];
  const readsAll = [];
  for (const rel of files) {
    const code = readCode(rel);
    if (/createReadStream|createWriteStream/.test(code)) streamy.push(rel);
    if (/\breadFile(Sync)?\s*\(/.test(code)) readsAll.push(rel);
  }

  assert.deepStrictEqual(
    readsAll,
    [],
    `这些文件里有**整份读文件**的写法：${readsAll.join('、')}\n` +
      '   契约要求流式复制（`createReadStream` → `pipeline` → `createWriteStream`），校验也要流式算哈希：\n' +
      "   `await pipeline(createReadStream(src), createHash('sha256'))`。\n" +
      '   （`readFile` 会把整个文件放进内存；`fs.copyFile` 虽然安全，但不是今天要练的流，见任务书）'
  );
  assert.ok(
    streamy.length > 0,
    `没有找到流式复制的痕迹（\`createReadStream\` / \`createWriteStream\`）—— 在 ${path.relative(process.cwd(), SRC_DIR)} 的哪个文件里？\n` +
      '   契约要求的四步：mkdir → 流式复制 → 校验（size + sha256）→ 通过才删源'
  );
});

test('07 模块能被 require 而没有副作用（不打印、不搬文件）', () => {
  assert.ok(
    !guardProblem,
    moduleTrouble() + `\n    （实测：require 它时退出码 ${probeRequire.status}，输出：${JSON.stringify(probeOut.trim().slice(0, 200))}）`
  );
});

// ─────────────────────────────────────────────────────────────
// 探针（只记录，不判错）
// ─────────────────────────────────────────────────────────────
test('P 探针：--verbose 长什么样 / 冲突策略 / 汇总行 / 空目录留不留（只记录，不判错）', { skip, timeout: 30000 }, () => {
  console.log('\n探针（只记录，不判错）：');

  // P1 --verbose：每个文件有没有单独一行
  const src1 = tree('p1/src', { 'photo.jpg': 'A', 'note.txt': 'B' });
  const dst1 = path.join(labRoot, 'p1/dst');
  const r1 = runCli([src1, '--apply', '--target', dst1, '--verbose']);
  const lines1 = `${r1.stdout || ''}`.split('\n').filter((l) => l.trim());
  console.log(`  · --verbose 输出了 ${lines1.length} 行：`);
  for (const l of lines1.slice(0, 8)) console.log(`      ${l.slice(0, 110)}`);

  // P2 汇总行
  const r1b = runCli([src1, '--apply', '--target', path.join(labRoot, 'p1/dst2')]);
  console.log(`  · 不加 --verbose 的汇总：${`${r1b.stdout || ''}${r1b.stderr || ''}`.split('\n').filter((l) => l.trim()).slice(-3).join(' | ').slice(0, 200) || '（没有任何输出）'}`);

  // P3 冲突策略：改名还是跳过？
  const src3 = tree('p3/src', { 'a/same.txt': 'X', 'b/same.txt': 'Y' });
  const dst3 = path.join(labRoot, 'p3/dst');
  const r3 = runCli([src3, '--apply', '--target', dst3]);
  console.log(`  · 撞名（两个 same.txt）之后，目标 docs/ 里是：${walkFiles(dst3).join('、') || '（空）'}`);
  console.log(`    源里还剩：${walkFiles(src3).join('、') || '（空）'}　退出码 ${r3.status}`);

  // P4 搬完之后，源目录里的空目录还在不在
  const src4 = tree('p4/src', { 'a/photo.jpg': 'A' });
  runCli([src4, '--apply', '--target', path.join(labRoot, 'p4/dst')]);
  const dirs = [];
  for (const e of fs.readdirSync(src4, { withFileTypes: true })) if (e.isDirectory()) dirs.push(e.name);
  console.log(`  · 搬完之后源目录里还剩：${dirs.length ? dirs.join('、') + '（空目录，留着也没错）' : '（什么都没有，源目录被清干净了）'}`);

  console.log('  （探针不判错：冲突策略、空目录留不留都是设计选择 —— 记进日志就行）\n');
});
