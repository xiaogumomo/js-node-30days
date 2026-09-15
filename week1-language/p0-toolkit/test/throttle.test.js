// ============================================================
// 测试 throttle（节流）
//
// 【比 debounce 多认识了两个东西】
//   1. assert.deepEqual —— 比较"内容相等"而不是"同一个引用"
//      （assert.equal 比的是 ===，两个内容相同的数组用 === 比是 false）
//   2. 一条用例结束时多等一会儿（sleep(150)），让残留的定时器跑完，
//      免得它干扰下一条用例
// ============================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const { throttle, throttleBySwitch } = require('../src/throttle.js');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  const got = [];
  const fn = throttle((a, b) => { got.push([a, b]); }, 60);
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
