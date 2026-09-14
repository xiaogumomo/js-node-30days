// ============================================================
// Day 4 验证脚手架：debounce
// 用法：node week1-language/day04-debounce-verify.js
//
// 这是【测试脚本】。按计划 §一 的规则，测试允许让 AI 写（"允许：让它写测试"），
// 但 day02-debounce.js 里的【实现】必须你自己写。
//
// 这个脚本只做一件事：把你写的 debounce 挂上去，自己喊 5 次，然后数原函数被执行了几次。
// 你要写的实现只要满足两件事就能被它读到：
//   ① 文件里用 function debounce(...) 或 const debounce = ... 定义
//   ② 文件最后加一行：module.exports = { debounce };
//     （module.exports / require 是 CommonJS 的写法，Day 7 会正式讲原理，
//       你今天照抄这一行就行 —— 你 9/12 写过的 require('node:readline/promises') 就是同一套东西）
// ============================================================

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let debounce;
try {
  ({ debounce } = require('./day02-debounce.js'));
} catch (err) {
  console.log('❌ 读不到你的实现。错误信息：' + err.message);
  console.log('');
  console.log('检查这三件事：');
  console.log('  1. week1-language/day02-debounce.js 里的代码是不是还在注释里？');
  console.log('  2. 文件最后有没有加 module.exports = { debounce };');
  console.log('  3. 函数名是不是就叫 debounce？');
  process.exit(1);
}
if (typeof debounce !== 'function') {
  console.log('❌ 读到了，但 debounce 不是函数，它现在是：' + typeof debounce);
  process.exit(1);
}

let pass = 0;
let fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + '　→ ' + detail); }
}

async function main() {
  console.log('\n=== 用例 1：连调 5 次，只执行 1 次（今天的基本要求）===');
  {
    let calls = 0;
    const fn = debounce(() => { calls++; }, 60);
    for (let i = 0; i < 5; i++) fn();
    await sleep(150);
    check('连调 5 次后只执行 1 次', calls === 1, '实际执行了 ' + calls + ' 次');
  }

  console.log('\n=== 用例 2：delay 没到就再次调用，要重新计时（最后一次之后才执行）===');
  {
    let calls = 0;
    const fn = debounce(() => { calls++; }, 60);
    fn();
    await sleep(30);
    fn();
    await sleep(30);
    fn();
    check('delay 未到就再次调用 → 此刻还没执行', calls === 0, '实际执行了 ' + calls + ' 次（说明没重置计时器）');
    await sleep(120);
    check('最后一次调用之后 delay 到点 → 执行 1 次', calls === 1, '实际执行了 ' + calls + ' 次');
  }

  console.log('\n=== 用例 3：immediate: true（今天的基本要求）===');
  {
    let calls = 0;
    const fn = debounce(() => { calls++; }, 60, true);
    fn();
    check('第一次调用立刻执行', calls === 1, '实际执行了 ' + calls + ' 次（说明 immediate 没生效）');
    fn(); fn(); fn();
    check('紧接着的 3 次调用被忽略', calls === 1, '实际执行了 ' + calls + ' 次');
    await sleep(150);
  }

  console.log('\n=== 用例 4（进阶，不做不影响今天的完成标准）：调用时的参数要透传给原函数 ===');
  {
    let got = null;
    const fn = debounce((a, b) => { got = [a, b]; }, 40);
    fn(1, 2);
    await sleep(120);
    check('参数 1 和 2 传到了原函数', Array.isArray(got) && got[0] === 1 && got[1] === 2,
      '原函数实际收到 ' + JSON.stringify(got));
  }

  console.log('\n---------------- 结果 ----------------');
  console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项');
  if (fail === 0) console.log('🎉 全部通过。可以开始写 throttle 了（如果还有力气的话）。');
  else console.log('还有失败项 —— 别急着往下走，先把失败的那条改对。');
  process.exit(fail === 0 ? 0 : 1);
}

main();
