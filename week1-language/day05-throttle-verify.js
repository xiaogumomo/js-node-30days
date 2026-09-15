// ============================================================
// Day 5 验证脚手架：节流（throttle）
// 用法：node week1-language/day05-throttle-verify.js
//
// 这是【测试脚本】。按计划 §一 的规则，测试允许让 AI 写，实现必须你自己写。
//
// 你的实现要放在 week1-language/day02-throttle.js 里，并满足两件事：
//   ① 定义 function throttle(fn, interval)
//   ② 文件最后加 module.exports = { throttle };
//
// 本脚本分两部分：
//   【第 1 部分】4 组必过测试
//   【第 2 部分】1 个行为探针 —— 不判定对错，只记录"末尾补不补执行"。
//                两种设计都是合法的（lodash 用 leading / trailing 两个选项控制），
//                但你必须清楚自己选的是哪种，并写进注释。
// ============================================================

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hintAndExit(why) {
  console.log('❌ ' + why);
  console.log('');
  console.log('检查这三件事：');
  console.log('  1. week1-language/day02-throttle.js 里有没有一个叫 throttle 的函数？');
  console.log('  2. 文件最后有没有加一行 module.exports = { throttle };');
  console.log('  3. 你写的代码是不是还在注释里（// 或 /* */ 包着）？');
  console.log('  4. 文件语法对不对？单独敲一次：node --check week1-language/day02-throttle.js');
  process.exit(1);
}

let throttle;
try {
  ({ throttle } = require('./day02-throttle.js'));
} catch (err) {
  if (err instanceof SyntaxError) {
    hintAndExit('day02-throttle.js 有【语法错误】，整个文件都没法被加载进来。\n'
      + '   原始错误：' + err.message
      + '\n   → 先单独检查语法：node --check week1-language/day02-throttle.js'
      + '\n     （它会直接告诉你第几行、哪个字符出错）');
  }
  hintAndExit('读不到 day02-throttle.js。错误信息：' + err.message);
}
if (typeof throttle !== 'function') {
  hintAndExit('文件读到了，但导出的 throttle 不是函数，它现在是：' + typeof throttle
    + '（多半是模块导出还没写，或者代码还注释着）');
}

let pass = 0;
let fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + '　→ ' + detail); }
}

async function main() {
  try {
    console.log('\n=== 测试 1：首次调用立刻执行（节流是"开头触发"的）===');
    {
      let calls = 0;
      const fn = throttle(() => { calls++; }, 60);
      fn();
      check('第一次调用立刻执行', calls === 1, '实际执行了 ' + calls + ' 次');
      await sleep(150);
    }

    console.log('\n=== 测试 2：interval 内连续调用只执行一次 ===');
    {
      let calls = 0;
      const fn = throttle(() => { calls++; }, 80);
      fn();
      await sleep(10); fn();
      await sleep(10); fn();
      await sleep(10); fn();
      check('80ms 内的 4 次调用只执行 1 次', calls === 1, '实际执行了 ' + calls + ' 次');
      await sleep(150);
    }

    console.log('\n=== 测试 3：interval 过去之后再调用，可以再次执行 ===');
    {
      let calls = 0;
      const fn = throttle(() => { calls++; }, 60);
      fn();
      await sleep(10); fn();          // 被忽略
      check('第一次已执行', calls === 1, '实际 ' + calls + ' 次');
      await sleep(100);               // 等过了 interval
      fn();
      check('过了 interval 再调用 → 执行第 2 次', calls === 2, '实际 ' + calls + ' 次');
      await sleep(150);
    }

    console.log('\n=== 测试 4：调用时的参数要透传给原函数 ===');
    {
      const got = [];
      const fn = throttle((a, b) => { got.push([a, b]); }, 60);
      fn(1, 2);
      await sleep(150);
      check('参数 1 和 2 传到了原函数',
        got.length === 1 && got[0][0] === 1 && got[0][1] === 2,
        '原函数实际收到 ' + JSON.stringify(got));
    }

    // ---------------- 以下不判定对错 ----------------
    console.log('\n\n=== 行为探针（不判定对错，只记录你选了哪种设计）===');
    console.log('【探针】interval 内被忽略的那些调用，末尾会不会补执行一次？\n');
    {
      let calls = 0;
      const fn = throttle(() => { calls++; }, 80);
      fn();                    // 开头执行 → calls = 1
      await sleep(10); fn();   // 被忽略
      await sleep(10); fn();   // 被忽略
      const afterBurst = calls;
      await sleep(200);        // 等足够久，看末尾会不会补一次
      console.log('  开头那次执行后 calls = ' + afterBurst);
      console.log('  等 200ms 之后 calls = ' + calls);
      if (calls === afterBurst) {
        console.log('  → 你的实现是【只开头触发】（leading only）：被忽略的调用就彻底丢了。');
        console.log('     适合：鼠标移动、滚动这类"我只关心当前状态"的场景。');
      } else {
        console.log('  → 你的实现是【开头 + 末尾都触发】（leading + trailing）：');
        console.log('     末尾补执行了最后一次被忽略的调用。');
        console.log('     适合：搜索联想、窗口 resize 这类"最后一次必须算"的场景。');
      }
      console.log('  （两种都对，但你要在 day02-throttle.js 的注释里写清自己选的是哪种、为什么）');
    }
  } catch (e) {
    fail++;
    console.log('\n💥 你的实现在某个测试里抛错了：' + e.constructor.name + ': ' + e.message);
    console.log('   失败点就在上面最后一条通过的测试之后。');
  }

  console.log('\n---------------- 结果 ----------------');
  console.log('必过测试：通过 ' + pass + ' 项，失败 ' + fail + ' 项');
  if (fail === 0) {
    console.log('🎉 全部通过。接着写 curry —— 它是今天最后一件事，也是同一个模式。');
  } else {
    console.log('还有失败项 —— 先别往下走。失败项的括号里通常写着"实际执行了几次"。');
  }
  return sleep(50).then(() => process.exit(fail === 0 ? 0 : 1));
}

main();
