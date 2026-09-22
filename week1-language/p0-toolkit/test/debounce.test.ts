// ============================================================
// 测试 debounce（防抖）
//
// 【这个文件在做什么】
//   它不是"运行程序看输出"，而是"调用函数 + 断言结果"。
//   每条 test() 是一个用例；断言不成立时，node --test 会打印出来并把退出码变成 1。
//
// 【node:test 的三个基本元素】
//   1. require('node:test')          → 拿到 test()，用来"声明一条用例"
//   2. require('node:assert/strict') → 拿到 assert，用来"断言"
//      （/strict 的意思是 assert.equal 用严格相等，和 === 一样，不会做类型转换）
//   3. test('描述', 函数)             → 一条用例，描述会出现在测试报告里
//
// 【关键：防抖是异步的】
//   debounce 要等 delay 毫秒之后才执行原函数，所以"调用完立刻断言"一定是错的
//   （会得到 0）。凡是需要等的用例，函数要写成 async，并先 await 一会儿。
//   唯一的例外是 immediate: true —— 它立刻就执行，所以不用等。
// ============================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const { debounce } = require('../src/debounce.ts');

// 等 ms 毫秒的工具函数。写一次，各个测试文件都复制这一行。
const sleep = (ms:number) => new Promise((r) => setTimeout(r, ms));

test('连调 5 次只执行 1 次', async () => {
  let calls = 0;                                // 计数器：原函数被执行了几次
  const fn = debounce(() => { calls++; }, 50);  // 造一个防抖函数，delay 50ms
  for (let i = 0; i < 5; i++) fn();             // 连调 5 次
  await sleep(120);                             // ★ 等过了 delay 再断言（关键）
  assert.equal(calls, 1);                       // 断言：只执行了 1 次
});

test('delay 没到就再次调用，会重新计时', async () => {
  let calls = 0;
  const fn = debounce(() => { calls++; }, 60);
  fn();
  await sleep(30);        // 才过 30ms，还没到 60ms
  fn();                   // 再调一次 → 计时重来
  assert.equal(calls, 0); // 此刻一次都还没执行
  await sleep(120);
  assert.equal(calls, 1); // 最后一次调用之后才执行
});

test('immediate: true 第一次立刻执行（这一条不用等）', () => {
  let calls = 0;
  const fn = debounce(() => { calls++; }, 50, true);
  fn();                   // immediate 是"立刻执行"，所以同步断言就是对的
  assert.equal(calls, 1);
});

test('immediate: true 时，delay 内的第二次调用应被忽略（leading + trailing 语义）', async () => {
  let calls = 0;
  const fn = debounce(() => { calls++; }, 80, true);
  fn(); fn();                       // 连喊两次
  assert.equal(calls, 1, '第一次立刻执行，delay 内的第二次应该被忽略');
  await sleep(200);                 // 等过 delay
  assert.equal(calls, 2, 'delay 结束后应该补一次（leading + trailing）');
});
