// ============================================================
// 测试 throttle（节流）
//
// 【比 debounce 多认识了两个东西】
//   1. assert.deepEqual —— 比较"内容相等"而不是"同一个引用"
//      （assert.equal 比的是 ===，两个内容相同的数组用 === 比是 false）
//   2. 一条用例结束时多等一会儿（sleep(150)），让残留的定时器跑完，
//      免得它干扰下一条用例
//
// ⚠️ 2026-09-21 恢复：这一份从 Day 6 起被整段注释掉了，`pnpm test` 里它是个"空文件通过"
//   （0 条测试也算 ✔），所以 throttle 实际上一直没有测试。恢复后在真实实现上跑过 **5/5 通过**。
// ============================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const { throttle, throttleBySwitch } = require('../src/throttle.ts');

const sleep = (ms:number) => new Promise((r) => setTimeout(r, ms));

test('throttle：interval 内多次调用只执行 1 次', async () => {
  let calls = 0;
  const fn = throttle(() => { calls++; }, 80);
  fn();
  await sleep(10); fn();
  await sleep(10); fn();
  assert.equal(calls, 1);
  await sleep(150);   // 收尾，让状态干净
});

test('throttle：过了 interval 再调用能再次执行', async () => {
  let calls = 0;
  const fn = throttle(() => { calls++; }, 60);
  fn();
  assert.equal(calls, 1);   // 首次调用立刻执行
  await sleep(120);         // 等过了 interval
  fn();
  assert.equal(calls, 2);
  await sleep(150);
});

test('throttle：调用时的参数会透传', async () => {
  const got: any[] = [];
  const fn = throttle((a:number, b:number) => { got.push([a, b]); }, 60);
  fn(1, 2);
  await sleep(120);
  assert.deepEqual(got, [[1, 2]]);
});

test('throttleBySwitch：另一条实现路线（开关 + 定时器）行为一致', async () => {
  let calls = 0;
  const fn = throttleBySwitch(() => { calls++; }, 80);
  fn();
  await sleep(10); fn();
  await sleep(10); fn();
  assert.equal(calls, 1);
  await sleep(150);
});

// 这一条是他自己补的
test('throttle：首次调用时将立刻执行', () => {
  let calls = 0;
  const fn = throttle(() => { calls++; }, 50);
  fn();
  assert.equal(calls, 1);
  fn();
  fn();
  assert.equal(calls, 1);
});


// ── 以下是他的笔记（原样留着）────────────────────────────
// 没有对象时 this == undefined
//
// 在对象字面量中使用 "this"
// 重要程度: 5
// 这里 makeUser 函数返回了一个对象。访问 ref 的结果是什么？为什么？
//
// function makeUser() {
//   return {
//     name: "John",
//     ref: this
//   };
// }
// let user = makeUser();
// alert( user.ref.name );
// this本来为undefined
