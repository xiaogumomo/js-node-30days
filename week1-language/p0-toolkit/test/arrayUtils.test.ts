// ============================================================
// 测试 arrayUtils（myMap / myFilter / myReduce）
//
// 【这组测试是 AI 写的】—— 计划 §一 允许："允许：让它写测试"。
// 内容就是从 day06-array-utils-verify.js 的 17 项搬过来的，换成 node:test 的写法。
//
// 【三条最值钱的断言】
//   assert.notEqual(out, src)      → 返回的是新数组，不是原数组
//   assert.deepEqual(src, [...])   → 改副本不碰原数组（这一条最常被写错）
//   myReduce([5], fn) 里 fn 一次都不该被调用 → "不传初始值时起点是第一个元素"的证据
//
// 【一个规范差异（探针的结论，不是 bug）】
//   内置 [].reduce(f) 遇到"空数组 + 没初始值"会抛 TypeError；我们的实现返回 undefined。
//   README 的「已知限制」可以把这一条补上 —— 面试被问到要能说出差别。
// ============================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const { myMap, myFilter, myReduce } = require('../src/arrayUtils.ts');

test('myMap：每个元素过一遍回调，返回新数组，原数组不动', () => {
  const src = [1, 2, 3];
  const out = myMap(src, (x:number) => x * 2);
  assert.deepEqual(out, [2, 4, 6]);
  assert.notEqual(out, src, '返回的应该是新数组，不是原数组本身');
  assert.deepEqual(src, [1, 2, 3], '原数组被改了');
});

test('myMap：回调收到 (元素, 下标, 原数组)', () => {
  assert.deepEqual(myMap([10, 20], (el:number, i:number) => el + i), [10, 21]);

  let third = null;
  myMap([7], (el:number, i:number, arr:number) => { third = arr; return el; });
  assert.deepEqual(third, [7], '回调的第三个参数应该是原数组');
});

test('myFilter：留下回调返回"真"的元素，返回新数组', () => {
  const src = [1, 2, 3, 4];
  const out = myFilter(src, (x:number) => x % 2 === 0);
  assert.deepEqual(out, [2, 4]);
  assert.notEqual(out, src, '返回的应该是新数组');
  assert.deepEqual(src, [1, 2, 3, 4], '原数组被改了');
});

test('myFilter：筛选规则完全由回调决定，不能自己预设元素类型', () => {
  // 这一条防的是"在实现里自作主张加 typeof x === 'number'"那种写法
  const users = [{ n: 'a', age: 20 }, { n: 'b', age: 15 }];
  const adults = myFilter(users, (u:Record<string,any>) => u.age >= 18);
  assert.equal(adults.length, 1);
  assert.equal(adults[0].n, 'a');
  // 回调返回的不是"新元素"而是"要不要"：结果数组里放的必须是原元素本身
  assert.equal(adults[0], users[0], 'filter 的结果里应该还是原来那些元素');
});

test('myReduce：传了初始值', () => {
  assert.equal(myReduce([1, 2, 3], (s:number, x:number) => s + x, 10), 16);
  assert.equal(myReduce([], (s:number, x:number) => s + x, 0), 0);
  const users = [{ age: 20 }, { age: 15 }];
  assert.equal(myReduce(users, (s:number, u:Record<string,any>) => s + u.age, 0), 35);
});

test('myReduce：不传初始值时，起点是第一个元素（回调少跑一次）', () => {
  assert.equal(myReduce([1, 2, 3], (s:number, x:number) => s + x), 6);
  assert.equal(myReduce(['a', 'b'], (s:number, x:number) => s + x), 'ab');

  let calls = 0;
  const only = myReduce([5], () => { calls++; return 0; });
  assert.equal(only, 5, '只有一个元素时应该直接返回它');
  assert.equal(calls, 0, '只有一个元素时回调一次都不该被调用');
});

test('myReduce：回调收到 (累计值, 元素, 下标, 原数组)', () => {
  const seen:any[] = [];
  const src = [10, 20];
  const total = myReduce(src, (acc:any, el:any, i:any, arr:any) => {
    seen.push({ acc, el, i, arr });
    return acc + el;
  }, 0);
  assert.equal(total, 30);
  assert.equal(seen.length, 2);
  assert.deepEqual(seen.map((x) => x.i), [0, 1], '下标没传对');
  assert.equal(seen[1].acc, 10, '第二次收到的累计值应该是第一次的结果');
  assert.deepEqual(seen[0].arr, src, '第四个参数应该是原数组');
});

test('三个方法都不改原数组（对象数组也一样）', () => {
  const make = () => [{ n: 'a', age: 20 }, { n: 'b', age: 15 }];
  const forMap = make();
  myMap(forMap, (u:Record<string,any>) => u.n);
  assert.deepEqual(forMap, [{ n: 'a', age: 20 }, { n: 'b', age: 15 }]);

  const forFilter = make();
  myFilter(forFilter, (u:Record<string,any>) => u.age >= 18);
  assert.deepEqual(forFilter, [{ n: 'a', age: 20 }, { n: 'b', age: 15 }]);

  const forReduce = make();
  myReduce(forReduce, (s:any, u:Record<string,any>) => s + u.age, 0);
  assert.deepEqual(forReduce, [{ n: 'a', age: 20 }, { n: 'b', age: 15 }]);
});
