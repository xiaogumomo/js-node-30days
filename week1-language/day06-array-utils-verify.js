// ============================================================
// Day 6 验证脚手架：数组三个方法的 polyfill（myMap / myFilter / myReduce）
// 用法：node week1-language/day06-array-utils-verify.js
//
// 这是【测试脚本】（计划 §一 允许让 AI 写测试）。实现必须你自己写。
//
// 你的实现在 week1-language/day06-array-utils.js 里，需要满足：
//   ① 定义 myMap(arr, fn) / myFilter(arr, fn) / myReduce(arr, fn, init)
//   ② 文件最后加：module.exports = { myMap, myFilter, myReduce };
//
// 本脚本分两部分：
//   【第 1 部分】7 组必过测试
//   【第 2 部分】1 个边界探针 —— 空数组 + 不传初始值时，内置 reduce 会抛错
//
// 【先想清楚这三件事，再动手】（都是内置方法的行为，可以先用 node 验证）
//   · 回调收到的参数：map 和 filter 是 (元素, 下标, 原数组)，reduce 是 (累计值, 元素, 下标, 原数组)
//   · reduce 的第三个参数（初始值）是可以不传的 —— 不传时用什么当起点？
//   · 三个方法都不应该改动原数组
// ============================================================

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hintAndExit(why) {
  console.log('❌ ' + why);
  console.log('');
  console.log('检查这几件事：');
  console.log('  1. week1-language/day06-array-utils.js 里三个函数都定义了吗？名字对得上吗？');
  console.log('  2. 文件最后有没有加 module.exports = { myMap, myFilter, myReduce };');
  console.log('  3. 语法对不对？单独敲一次：node --check week1-language/day06-array-utils.js');
  process.exit(1);
}

let myMap, myFilter, myReduce;
try {
  ({ myMap, myFilter, myReduce } = require('./day06-array-utils.js'));
} catch (err) {
  if (err instanceof SyntaxError) {
    hintAndExit('day06-array-utils.js 有【语法错误】，整个文件都没法被加载进来。\n'
      + '   原始错误：' + err.message
      + '\n   → 先单独检查语法：node --check week1-language/day06-array-utils.js');
  }
  hintAndExit('读不到 day06-array-utils.js。错误信息：' + err.message);
}
const missing = [['myMap', myMap], ['myFilter', myFilter], ['myReduce', myReduce]]
  .filter(([, v]) => typeof v !== 'function').map(([k]) => k);
if (missing.length) {
  hintAndExit('这几个导出的不是函数：' + missing.join('、')
    + '（多半是没写 module.exports，或者名字写错了）');
}

let pass = 0;
let fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + '　→ ' + detail); }
}
// 比"内容相等"，用来比数组
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function main() {
  try {
    console.log('\n=== 测试 1：myMap 基本行为 + 不改原数组 ===');
    {
      const src = [1, 2, 3];
      const out = myMap(src, (x) => x * 2);
      check('结果正确：[1,2,3] 每个乘 2 → [2,4,6]', same(out, [2, 4, 6]), '得到 ' + JSON.stringify(out));
      check('返回的是新数组', out !== src, '返回的就是原数组本身（没有新建）');
      check('原数组没被改', same(src, [1, 2, 3]), '原数组变成了 ' + JSON.stringify(src));
    }

    console.log('\n=== 测试 2：myMap 的回调要收到 (元素, 下标, 原数组) ===');
    {
      const src = [10, 20];
      const out = myMap(src, (el, i) => el + i);
      check('用得上下标：[10,20] 加各自下标 → [10,21]', same(out, [10, 21]),
        '得到 ' + JSON.stringify(out) + '（说明回调没收到下标，或下标传错了）');

      let third = null;
      myMap([7], (el, i, arr) => { third = arr; return el; });
      check('第三个参数是原数组', same(third, [7]), '第三个参数收到的是 ' + JSON.stringify(third));
    }

    console.log('\n=== 测试 3：myFilter 基本行为 + 不改原数组 ===');
    {
      const src = [1, 2, 3, 4];
      const out = myFilter(src, (x) => x % 2 === 0);
      check('过滤出偶数 → [2,4]', same(out, [2, 4]), '得到 ' + JSON.stringify(out));
      check('原数组没被改', same(src, [1, 2, 3, 4]), '原数组变成了 ' + JSON.stringify(src));
    }

    console.log('\n=== 测试 4：对"对象数组"也要能用（真实场景）===');
    console.log('   （每组检查都用一份新的数据 —— 免得写错的实现把数组改坏了、连累下一组检查）');
    {
      // 每次都造一份新的，避免"上一个检查把数据改坏 → 下一个检查抛无关的错"这种连锁
      const makeUsers = () => [{ n: 'a', age: 20 }, { n: 'b', age: 15 }];

      const forMap = makeUsers();
      check('myMap 取属性 → ["a","b"]', same(myMap(forMap, (u) => u.n), ['a', 'b']),
        '得到 ' + JSON.stringify(myMap(forMap, (u) => u.n)));

      const forFilter = makeUsers();
      const filtered = myFilter(forFilter, (u) => u.age >= 18);
      check('myFilter 按条件筛选 → 只剩 age≥18 的那个', filtered.length === 1,
        '得到 ' + filtered.length + ' 个');

      const forKeep = makeUsers();
      myMap(forKeep, (u) => u.n);
      myFilter(forKeep, (u) => u.age >= 18);
      check('原数组里的对象没被改', forKeep[0].n === 'a' && forKeep[0].age === 20,
        '对象被改了：' + JSON.stringify(forKeep[0]));
    }

    console.log('\n=== 测试 5：myReduce 传了初始值 ===');
    {
      check('myReduce([1,2,3], 求和, 10) → 16', myReduce([1, 2, 3], (s, x) => s + x, 10) === 16,
        '得到 ' + myReduce([1, 2, 3], (s, x) => s + x, 10));
      check('空数组 + 初始值 0 → 0', myReduce([], (s, x) => s + x, 0) === 0,
        '得到 ' + myReduce([], (s, x) => s + x, 0));
      const users = [{ age: 20 }, { age: 15 }];
      check('对象数组求和 → 35', myReduce(users, (s, u) => s + u.age, 0) === 35,
        '得到 ' + myReduce(users, (s, u) => s + u.age, 0));
    }

    console.log('\n=== 测试 6：myReduce 不传初始值（起点是第一个元素）===');
    {
      check('myReduce([1,2,3], 求和) → 6', myReduce([1, 2, 3], (s, x) => s + x) === 6,
        '得到 ' + myReduce([1, 2, 3], (s, x) => s + x));
      check('只有一个元素：[5] → 5（回调一次都不该被调用）',
        myReduce([5], (s, x) => s + x) === 5,
        '得到 ' + myReduce([5], (s, x) => s + x));
      const src = [1, 2, 3];
      myReduce(src, (s, x) => s + x);
      check('原数组没被改', same(src, [1, 2, 3]), '原数组变成了 ' + JSON.stringify(src));
    }

    console.log('\n=== 测试 7：myReduce 的回调要收到 (累计值, 元素, 下标, 原数组) ===');
    {
      const seen = [];
      myReduce([10, 20], (acc, el, i) => { seen.push(i); return acc + el; }, 0);
      check('累计值在增长（第二次收到的 acc 应当是 10）', seen.length === 2 && seen[1] === 1,
        '回调收到的下标序列是 ' + JSON.stringify(seen));
    }

    // ---------------- 以下不判定对错 ----------------
    console.log('\n\n=== 边界探针（不判定对错，只让你看清规范怎么定的）===');
    console.log('【探针】空数组 + 不传初始值，应该怎么办？\n');
    {
      let builtin;
      try { [].reduce((a, b) => a + b); builtin = '没有抛错'; }
      catch (e) { builtin = e.constructor.name + ': ' + e.message; }
      console.log('  内置 reduce → ' + builtin);

      let mine;
      try { mine = '返回了 ' + JSON.stringify(myReduce([], (a, b) => a + b)); }
      catch (e) { mine = e.constructor.name + ': ' + e.message; }
      console.log('  你的实现   → ' + mine);
      console.log('');
      console.log('  内置的做法是**抛错**（因为"没有起点、也没有元素"，累加无从开始）。');
      console.log('  你的实现如果没处理这种情况，会返回 undefined 或 NaN —— 不算错，');
      console.log('  但面试被问"你的 reduce 遇到空数组会怎样"时，要能说出这个差别。');
    }
  } catch (e) {
    fail++;
    console.log('\n💥 你的实现在某个测试里抛错了：' + e.constructor.name + ': ' + e.message);
    console.log('   失败点就在上面最后一条通过的测试之后。');
  }

  console.log('\n---------------- 结果 ----------------');
  console.log('必过测试：通过 ' + pass + ' 项，失败 ' + fail + ' 项');
  if (fail === 0) {
    console.log('🎉 全部通过。接着把它搬进 p0-toolkit：src/arrayUtils.js + 一个测试文件。');
  } else {
    console.log('还有失败项 —— 括号里通常写着"实际得到了什么"。');
  }
  return sleep(50).then(() => process.exit(fail === 0 ? 0 : 1));
}

main();
