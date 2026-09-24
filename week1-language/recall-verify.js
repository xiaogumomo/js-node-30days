// ============================================================
// 逆向练习 / 复习轮转器：把"凭记忆重写"变成每天 5 分钟、且有客观判据的动作
//
// 用法：
//   node week1-language/recall-verify.js                     # 看今天该复习哪个（轮转表）
//   node week1-language/recall-verify.js curry               # 默认读 week1-language/recall-curry.js
//   node week1-language/recall-verify.js curry 别的路径.js    # 指定文件
//
// 它干的事：
//   1. 找到 p0-toolkit/test/<模块名>.test.js（工具箱自己的那份测试）
//   2. 在系统临时目录里搭一个一次性的工具箱：其余模块照抄，<模块名>.js 换成【你凭记忆写的那份】
//   3. 在临时目录里跑 node --test → 拿工具箱的测试当判据
//   4. 删掉临时目录（不会碰仓库里任何文件）
//
// 【为什么这么设计】2026-09-20 的发现：复习最有效的方式不是"重读"，是**回想**（retrieval）。
//   而"回想"需要一个客观判据 —— 工具箱那 5 份测试就是现成的判据，不用再写新的。
//   所以复习的选题可以轮转：debounce → curry → deepClone → throttle → arrayUtils → ……
//
// ⚠️ 规矩没变：**先别打开 p0-toolkit/src/<模块名>.js**。跑完再看差异，那才是这 5 分钟的价值。
// ============================================================

'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO = path.join(__dirname, '..');
const TOOLKIT = path.join(REPO, 'week1-language', 'p0-toolkit');
const SRC_DIR = path.join(TOOLKIT, 'src');
const TEST_DIR = path.join(TOOLKIT, 'test');

// 轮转表：第 1 周交付过的东西，每天轮一个
const ROTATION = [
  { name: 'debounce', from: 'Day 4' },
  { name: 'curry', from: 'Day 5' },
  { name: 'deepClone', from: 'Day 4' },
  { name: 'throttle', from: 'Day 5' },
  { name: 'arrayUtils', from: 'Day 6–7' },
];

function listModules() {
  if (!fs.existsSync(TEST_DIR)) return [];
  return fs.readdirSync(TEST_DIR)
    .filter((f) => /\.test\.(js|ts)$/.test(f))
    .map((f) => f.replace(/\.test\.(js|ts)$/, ''));
}

// 从测试文件的 require 那行里读出"这个模块要导出哪些名字"，给失败提示用
function expectedExports(moduleName) {
  const testFile = ['ts', 'js']
    .map((ext) => path.join(TEST_DIR, moduleName + '.test.' + ext))
    .find((f) => fs.existsSync(f));
  if (!testFile) return null;
  const text = fs.readFileSync(testFile, 'utf8');
  const re = new RegExp('\\{([^}]*)\\}\\s*=\\s*require\\([^)]*' + moduleName + '\\.(js|ts)');
  const m = re.exec(text);
  if (!m) return null;
  return m[1].split(',').map((s) => s.trim()).filter(Boolean);
}

// 读他的重写稿"实际导出了什么"（只在有失败时才调用，免得执行顶层代码干扰输出）
function actualExports(file) {
  try {
    // ⚠️ 必须先 resolve 成绝对路径：require('相对路径') 是相对**本文件所在目录**解析的，
    //    而这里的 file 可能是用户从命令行传进来的相对路径（相对 cwd）→ 会报一个假的
    //    "Cannot find module"（9/24 实测踩到：明明跑得动，却提示"你的文件加载不了"）
    const mod = require(path.resolve(file));
    return Object.keys(mod || {});
  } catch (e) {
    return { loadError: e.message };
  }
}

// 简易编辑距离：用来判断"是不是拼错了"（2026-09-22 加，起因是 `throttleBySwich` 少一个 t）
function editDistance(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[m][n];
}

function rotationHint() {
  const have = listModules();
  console.log('复习轮转（每天轮一个，凭记忆重写 + 跑本脚本验收）：\n');
  ROTATION.forEach((r, i) => {
    const ok = have.includes(r.name) ? '✅ 有测试' : '⚠️ 还没有测试，先跳过';
    console.log('  ' + (i + 1) + '. ' + r.name.padEnd(12) + r.from.padEnd(9) + ok);
  });
  console.log('\n命令：node week1-language/recall-verify.js <上面某个名字>');
  console.log('默认读：week1-language/recall-<名字>.js（也可以自己传路径）\n');
  console.log('没测过的模块（第 1 周还有这些，靠自己口述 + 写 demo 验）：');
  console.log('  · 手写原型继承 vs class 重写 / 字段初始化 4 步顺序（Day 6）');
  console.log('  · this 的四种绑定 + 箭头函数例外（Day 6）');
}

// 工具箱转 TS 之后（Day 8），源码/测试都是 .ts —— 提示里别再写死 .js，会指到一个不存在的文件
function pickFile(dir, base) {
  return ['ts', 'js']
    .map((ext) => path.join(dir, base + '.' + ext))
    .find((f) => fs.existsSync(f));
}
function srcShown(moduleName) {
  const f = pickFile(SRC_DIR, moduleName);
  return f ? path.relative(REPO, f) : path.join('week1-language', 'p0-toolkit', 'src', moduleName + '.ts');
}

function main() {
  const moduleName = process.argv[2];
  if (!moduleName) { rotationHint(); process.exit(0); }

  const testFile = ['ts', 'js']
    .map((ext) => path.join(TEST_DIR, moduleName + '.test.' + ext))
    .find((f) => fs.existsSync(f));
  if (!testFile) {
    console.log('❌ 工具箱里没有 ' + moduleName + '.test.{ts,js}，没判据可用。');
    console.log('   可用的模块：' + listModules().join('、'));
    process.exit(1);
  }

  const rewriteFile = process.argv[3] || path.join(__dirname, 'recall-' + moduleName + '.js');
  const shown = path.relative(REPO, rewriteFile) || rewriteFile;
  if (!fs.existsSync(rewriteFile)) {
    const names = expectedExports(moduleName);
    console.log('❌ 还没写重写稿：' + shown);
    console.log('');
    console.log('【规则】合上所有代码，凭记忆写，写在 ' + shown);
    console.log('   这个模块要导出：' + (names ? names.join('、') : '（见测试文件开头）'));
    console.log('   文件最后加：module.exports = { ' + (names ? names.join(', ') : '...') + ' };');
    console.log('   想不起来的地方，**留空也不要翻源码** —— 空档才是今天要补的东西。');
    process.exit(1);
  }

  // 搭临时工具箱：其余模块照抄，目标模块换成他的重写稿
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'recall-'));
  let exitCode = 0;
  try {
    fs.mkdirSync(path.join(tmp, 'src'));
    fs.mkdirSync(path.join(tmp, 'test'));
    for (const f of fs.readdirSync(SRC_DIR)) {
      fs.copyFileSync(path.join(SRC_DIR, f), path.join(tmp, 'src', f));
    }
    // 目标文件名 = 测试文件里 require('../src/xxx') 的那个 xxx（工具箱转 TS 后要跟着变）
    const testText = fs.readFileSync(testFile, 'utf8');
    const after = testText.split('../src/')[1];
    const targetName = after ? after.split(/['")]/)[0] : moduleName + '.js';
    fs.copyFileSync(rewriteFile, path.join(tmp, 'src', targetName));
    fs.copyFileSync(testFile, path.join(tmp, 'test', path.basename(testFile)));

    const r = spawnSync(process.execPath, ['--test'], { cwd: tmp, encoding: 'utf8' });
    const out = (r.stdout || '') + (r.stderr || '');
    const line = (re) => { const m = out.match(re); return m ? m[1] : '?'; };
    const tests = line(/^ℹ tests (\d+)/m), pass = line(/^ℹ pass (\d+)/m), fail = line(/^ℹ fail (\d+)/m);

    // ⚠️ 防"假绿"：测试文件里一条 test() 都没有时，`node --test` 会把整个文件算成 1 条通过的测试。
    // （2026-09-21 真实踩到过：test/throttle.test.js 整段被注释掉，于是 throttle 拿到了 1/1 的假绿。）
    const liveTests = (fs.readFileSync(testFile, 'utf8').match(/^\s*test\s*\(/gm) || []).length;

    console.log('=== 复习验收：' + moduleName + '（用工具箱 ' + path.relative(REPO, testFile) + ' 判）===\n');
    if (liveTests === 0) {
      console.log('⚠️ 判据是空的：' + path.relative(REPO, testFile) + ' 里一条 test() 都没有（被注释掉了？）。');
      console.log('   "通过 ' + pass + '/' + tests + '" 这个绿不算数 —— 先把那个测试文件修好，再来复习。');
      process.exitCode = 1;   // 提前 return 会跳过 finally 之后的赋值，所以这里直接设
      return;
    }
    console.log('  通过 ' + pass + ' / ' + tests + ' 条，失败 ' + fail + ' 条\n');

    if (fail === '0') {
      console.log('✅ 全绿 —— 这个模块还记得住。下一轮换一个。');
      console.log('   收尾（30 秒）：打开 ' + srcShown(moduleName) + ' 扫一眼，看你写的和它的差异。');
    } else {
      console.log('下面是没有通过的用例（每条的括号里通常写着"实际得到了什么"）：\n');
      const failing = out.split('\n').filter((l) => /^\s*✖/.test(l));
      failing.slice(0, 12).forEach((l) => console.log('  ' + l.trim()));

      // 把真正的报错行也打出来（只打用例名，看不出是"名字拼错"还是"逻辑错"）
      const errLines = out.split('\n')
        .filter((l) => /TypeError|AssertionError|ReferenceError|is not a function|Cannot read/.test(l));
      if (errLines.length) {
        console.log('\n报错原文（挑前 3 行）：');
        errLines.slice(0, 3).forEach((l) => console.log('  ' + l.trim().slice(0, 150)));
      }

      console.log('');
      console.log('【这才是收获的地方】先别急着改代码 —— 打开 ' + srcShown(moduleName) + '，');
      console.log('   带着"我哪一行想岔了"的问题读一遍，然后**合上再写一遍**（第二遍才算过）。');

      // 导出名对不上是"手滑"里最常见的一类，直接点名（2026-09-22 加）
      const want = expectedExports(moduleName);
      if (want) {
        const got = actualExports(rewriteFile);
        if (got && got.loadError) {
          const isSyntax = /SyntaxError|Invalid or unexpected token|Unexpected token/.test(got.loadError);
          console.log('   ⚠️ 你的文件加载不了：' + got.loadError + (isSyntax ? '（先跑 node --check 定位语法）' : ''));
        } else if (got) {
          const missing = want.filter((n) => !got.includes(n));
          if (missing.length) {
            console.log('   ⚠️ **导出名对不上**：测试要的是 ' + want.join('、') + '；你导出的是 ' + (got.join('、') || '（空）'));
            missing.forEach((name) => {
              const near = got.find((g) => g !== name && editDistance(g, name) <= 2);
              if (near) console.log('      → **疑似拼错**：要 `' + name + '`，你写的是 `' + near + '`（差 ' + editDistance(near, name) + ' 个字符）');
            });
          } else {
            console.log('   （导出名齐了：' + want.join('、') + ' —— 所以问题在函数体里）');
          }
        }
      }
    }
    console.log('\n（临时目录已清理，仓库里没有被改动）');
    exitCode = fail === '0' ? 0 : 1;
  } finally {
    // ⚠️ 这里不能用 process.exit()：它会立刻结束进程，finally 就不执行了 —— 临时目录会残留
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  process.exitCode = exitCode;
}

main();
