// ============================================================
// Day 5 验证脚手架：柯里化（curry）
// 用法：node week1-language/day05-curry-verify.js
//
// 这是【测试脚本】。按计划 §一 的规则，测试允许让 AI 写，实现必须你自己写。
//
// 你的实现要放在 week1-language/day02-curry.js 里，并满足两件事：
//   ① 定义 function curry(fn)
//   ② 文件最后加 module.exports = { curry };
//
// 本脚本分两部分：
//   【第 1 部分】7 组必过测试
//   【第 2 部分】1 个陷阱探针 —— fn.length 的坑，不判定对错，只让你亲眼看到它
// ============================================================

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hintAndExit(why) {
  console.log('❌ ' + why);
  console.log('');
  console.log('检查这三件事：');
  console.log('  1. week1-language/day02-curry.js 里有没有一个叫 curry 的函数？');
  console.log('  2. 文件最后有没有加一行 module.exports = { curry };');
  console.log('  3. 你写的代码是不是还在注释里（// 或 /* */ 包着）？');
  console.log('  4. 文件语法对不对？单独敲一次：node --check week1-language/day02-curry.js');
  process.exit(1);
}

let curry;
try {
  ({ curry } = require('./day02-curry.js'));
} catch (err) {
  if (err instanceof SyntaxError) {
    hintAndExit('day02-curry.js 有【语法错误】，整个文件都没法被加载进来。\n'
      + '   原始错误：' + err.message
      + '\n   → 先单独检查语法：node --check week1-language/day02-curry.js'
      + '\n     （它会直接告诉你第几行、哪个字符出错）');
  }
  hintAndExit('读不到 day02-curry.js。错误信息：' + err.message);
}
if (typeof curry !== 'function') {
  hintAndExit('文件读到了，但导出的 curry 不是函数，它现在是：' + typeof curry
    + '（多半是模块导出还没写，或者代码还注释着）');
}

let pass = 0;
let fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + '　→ ' + detail); }
}

const add3 = (a, b, c) => a + b + c;   // 注意：它的 length 是 3

function main() {
  try {
    console.log('\n=== 测试 1：逐个传参 curry(f)(1)(2)(3) ===');
    {
      const c = curry(add3);
      check('未收够时返回的仍然是函数', typeof c(1) === 'function', '返回了 ' + typeof c(1));
      check('c(1)(2)(3) 得到 6', c(1)(2)(3) === 6, '得到 ' + c(1)(2)(3));
    }

    console.log('\n=== 测试 2：一次传多个参数也要支持 ===');
    {
      const c = curry(add3);
      check('c(1, 2)(3) 得到 6', c(1, 2)(3) === 6, '得到 ' + c(1, 2)(3));
      check('c(1)(2, 3) 得到 6', c(1)(2, 3) === 6, '得到 ' + c(1)(2, 3));
      check('c(1, 2, 3) 一次传够 得到 6', c(1, 2, 3) === 6, '得到 ' + c(1, 2, 3));
    }

    console.log('\n=== 测试 3：返回值要原样透传 ===');
    {
      const greet = (a, b) => 'hi ' + a + ' and ' + b;
      check('返回字符串类型正确', typeof curry(greet)('x')('y') === 'string',
        '得到 ' + typeof curry(greet)('x')('y'));
      check('返回值内容正确', curry(greet)('x')('y') === 'hi x and y',
        '得到 ' + JSON.stringify(curry(greet)('x')('y')));
    }

    console.log('\n=== 测试 4：柯里化后的函数要能复用（最容易翻车的一项）===');
    console.log('   （这一项抓的是"多个柯里化函数共用同一个 args 数组"的 bug）');
    {
      const c = curry(add3);
      check('第一次用：c(1)(2)(3) === 6', c(1)(2)(3) === 6, '得到 ' + c(1)(2)(3));
      check('第二次用：c(4)(5)(6) === 15', c(4)(5)(6) === 15, '得到 ' + c(4)(5)(6));
      check('第三次用：c(1,2)(3) === 6（换传法也要对）', c(1, 2)(3) === 6, '得到 ' + c(1, 2)(3));
    }

    console.log('\n=== 测试 5：两个柯里化函数之间互不干扰 ===');
    {
      const c1 = curry(add3);
      const c2 = curry((a, b, c) => a * b * c);
      check('c2(2)(3)(4) === 24', c2(2)(3)(4) === 24, '得到 ' + c2(2)(3)(4));
      check('c1(1)(2)(3) 仍然是 6', c1(1)(2)(3) === 6, '得到 ' + c1(1)(2)(3));
    }

    // ---------------- 以下不判定对错 ----------------
    console.log('\n\n=== 陷阱探针：fn.length 的坑（不判定对错，只让你看清它）===');
    console.log('curry 判断"参数收够了没"靠的是 fn.length，而 fn.length 有两个陷阱：\n');
    {
      console.log('  (a, b, c) => {}       .length = ' + ((a, b, c) => {}).length);
      console.log('  (a, b = 2, c) => {}   .length = ' + ((a, b = 2, c) => {}).length
        + '   ← 第一个默认参数之后的都不计入！');
      console.log('  (...args) => {}       .length = ' + ((...args) => {}).length
        + '   ← rest 参数不计入');
      console.log('');
      console.log('  所以对"带默认参数的函数"做 curry，会在只收到 1 个参数时就误判为收够了：');

      const withDefault = (a, b = 2, c) => 'a=' + a + ' b=' + b + ' c=' + c;
      const step1 = curry(withDefault)(1);
      console.log('    curry((a, b = 2, c) => ...)(1) 的结果：');
      console.log('      类型 = ' + typeof step1);
      console.log('      内容 = ' + JSON.stringify(step1));
      console.log('    ← 它只收到 1 个参数就执行了！因为 fn.length 是 1。');
      console.log('      你以为还能接着写 (2)(3)，其实参数已经错位了 —— 这就是陷阱的真面目。');
      console.log('');
      console.log('  【和 Day 4 装饰器的联系】包装函数会让 length 变成 0：');
      function fakeWrap(fn) { return function (...arg) { return fn.apply(this, arg); }; }
      console.log('    原函数       add3.length        = ' + add3.length);
      console.log('    包装之后     fakeWrap(add3).length = ' + fakeWrap(add3).length
        + '   ← 所以对被包装过的函数做 curry，会永远收不够、永远返回函数');
      console.log('    这就是 Day 4 那一章「装饰器和函数属性」讲的东西，今天撞上了。');
    }
  } catch (e) {
    fail++;
    console.log('\n💥 你的实现在某个测试里抛错了：' + e.constructor.name + ': ' + e.message);
    console.log('   失败点就在上面最后一条通过的测试之后。');
  }

  console.log('\n---------------- 结果 ----------------');
  console.log('必过测试：通过 ' + pass + ' 项，失败 ' + fail + ' 项');
  if (fail === 0) {
    console.log('🎉 全部通过。今天两个函数都齐了 —— 接下来是 p0-toolkit 立项。');
  } else {
    console.log('还有失败项 —— 测试 4 和 5 挂掉的话，多半是 args 数组被共用了。');
  }
  return sleep(50).then(() => process.exit(fail === 0 ? 0 : 1));
}

main();
