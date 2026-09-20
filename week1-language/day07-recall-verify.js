// ============================================================
// Day 7 逆向练习验收：合上代码，凭记忆重写 debounce
// 用法：node week1-language/day07-recall-verify.js
//       （可选）node week1-language/day07-recall-verify.js 别的路径.js
//
// 【这个脚本不是来考你的，是来给你"地图"的】
// 目标文件：week1-language/day07-recall-debounce.js
//   ① 写一个 debounce(fn, delay)：delay 内连续触发，只执行最后一次
//   ② 文件最后加：module.exports = { debounce };
//
// 规则（就三条）：
//   · 不许打开 src/debounce.js 或 day02-debounce.js 偷看，凭记忆写
//   · 限时 5 分钟，写多少算多少 —— 写不出来的那个地方，就是你真正不会的地方
//   · 写完再打开工具箱那份对照，看差异在哪（这才是这 5 分钟的价值）
//
// 全部通过当然好；没通过也**不算错** —— 它只是把"你以为你会了"和"你真的会了"分开。
// ============================================================

'use strict';
const path = require('node:path');

const implPath = process.argv[2] || path.join(__dirname, 'day07-recall-debounce.js');
const shownPath = path.relative(process.cwd(), implPath) || implPath;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hintAndExit(why, extra) {
  console.log('❌ ' + why);
  if (extra) console.log('   → ' + extra);
  console.log('');
  console.log('检查这几件事：');
  console.log('  1. ' + shownPath + ' 写了吗？');
  console.log('  2. 函数名是不是就叫 debounce？');
  console.log('  3. 文件最后有没有加 module.exports = { debounce };');
  console.log('  4. 语法对不对：node --check ' + shownPath);
  process.exit(1);
}

let debounce;
try {
  ({ debounce } = require(implPath));
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') hintAndExit('读不到 ' + shownPath + '（文件还不存在？）');
  if (err instanceof SyntaxError) {
    hintAndExit(shownPath + ' 有【语法错误】，整个文件都没法被加载。', '原始错误：' + err.message);
  }
  hintAndExit('加载 ' + shownPath + ' 时抛错了。', err.message);
}
if (typeof debounce !== 'function') {
  hintAndExit('debounce 导出的不是函数', '多半是没写 module.exports = { debounce };');
}

let pass = 0;
let fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + '　→ ' + detail); }
}

async function main() {
  const DELAY = 120;

  console.log('\n=== 1：连续喊 5 次，原函数该被调用几次？===');
  {
    const calls = [];
    const fn = debounce((...a) => calls.push(a), DELAY);
    for (let i = 1; i <= 5; i++) fn(i);
    await sleep(DELAY / 2);
    check('还没到点时，一次都还没执行', calls.length === 0,
      '已经执行了 ' + calls.length + ' 次 —— 现在应该还在等');
    await sleep(DELAY + 60);
    check('一共只执行 1 次（5 次被合并成 1 次）', calls.length === 1,
      '执行了 ' + calls.length + ' 次');
    check('执行时收到的是最后一次的参数（5）', calls[0] && calls[0][0] === 5,
      '收到的是 ' + JSON.stringify(calls[0]));
  }

  console.log('\n=== 2：等完之后再喊，还能再来一轮吗？（能不能重复使用）===');
  {
    const calls = [];
    const fn = debounce((...a) => calls.push(a), DELAY);
    fn('第一轮');
    await sleep(DELAY + 60);
    fn('第二轮');
    await sleep(DELAY + 60);
    check('两轮各执行 1 次，一共 2 次', calls.length === 2,
      '执行了 ' + calls.length + ' 次（如果是 1 次，说明定时器没被重置；如果是 3 次以上，说明没在等）');
    check('两次的参数分别对得上', calls[0] && calls[1]
      && calls[0][0] === '第一轮' && calls[1][0] === '第二轮',
      '收到的是 ' + JSON.stringify(calls));
  }

  console.log('\n=== 3：参数要"跟着最新的那次"走 ===');
  {
    let seen = null;
    const fn = debounce((x) => { seen = x; }, DELAY);
    fn('早的');
    await sleep(30);
    fn('晚的');
    await sleep(DELAY + 60);
    check('执行时用的是"晚的"（后一次覆盖前一次）', seen === '晚的',
      '收到的是 ' + JSON.stringify(seen));
  }

  console.log('\n\n=== 探针（不判对错，只记录规范怎么定的）===');
  {
    const fn = debounce(() => '原函数的返回值', DELAY);
    const ret = fn();
    console.log('  你的 debounce 调用后立即返回：' + JSON.stringify(ret));
    console.log('  工具箱里那份（trailing 模式）也是 undefined —— 原因不是实现错了：');
    console.log('  那一刻原函数**还没执行**，返回值根本还不存在。这是防抖本身的时间冲突。');
    await sleep(DELAY + 60);
  }

  console.log('\n---------------- 结果 ----------------');
  console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项');
  if (fail === 0) {
    console.log('🎉 记忆里的版本是能跑的。现在打开 week1-language/p0-toolkit/src/debounce.js 对照一遍：');
    console.log('   差异在哪、为什么那么写 —— 这一步才是"逆向练习"真正的收获。');
  } else {
    console.log('这不算错，这是地图：失败的那一项，就是你"以为自己会了、其实还没长熟"的地方。');
    console.log('现在打开 src/debounce.js 看一眼，然后**合上再写一遍**（第二遍通常就成了）。');
  }
  return sleep(50).then(() => process.exit(fail === 0 ? 0 : 1));
}

main().catch((e) => {
  console.log('\n💥 你的实现在跑到一半抛错了：' + e.constructor.name + ': ' + e.message);
  const loc = (e.stack || '').split('\n').find((l) => l.includes('day07-recall-debounce.js'));
  if (loc) console.log('   出错位置：' + loc.trim().replace(/^at /, ''));
  console.log('   最常见的三个原因：');
  console.log('     ① API 名字拼错（setTimeout / clearTimeout —— 大小写错一个字母就是这个错）');
  console.log('     ② 变量名拼错，或者用了没声明的变量');
  console.log('     ③ 括号 / 逗号不配对');
  console.log('   → 改完先单独跑一次：node --check week1-language/day07-recall-debounce.js');
  process.exitCode = 1;
});
