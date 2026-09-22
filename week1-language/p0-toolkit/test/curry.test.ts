// ============================================================
// 测试 curry（柯里化）
//
// 【和上面两个文件最大的不同：没有 sleep、没有 async】
//   curry 是纯同步的 —— 它没有任何定时器，调用完就有结果。
//   所以断言可以紧跟在调用后面。
//
// 【add3 的作用】
//   它的 length 是 3，curry 就是靠 fn.length 判断"参数收够了没"。
//   测试时用一个 length 明确的函数最省事。
// ============================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const { curry } = require('../src/curry.ts');

const add3 = (a:number, b:number, c:number) => a + b + c;

test('逐个传参：c(1)(2)(3) 得到 6', () => {
  assert.equal(curry(add3)(1)(2)(3), 6);
});

test('一次传够：c(1, 2, 3) 得到 6', () => {
  assert.equal(curry(add3)(1, 2, 3), 6);
});

test('一次传多个也要支持：c(1,2)(3) 和 c(1)(2,3)', () => {
  const c = curry(add3);
  assert.equal(c(1, 2)(3), 6);
  assert.equal(c(1)(2, 3), 6);
});

test('未收够时返回的仍然是一个函数', () => {
  assert.equal(typeof curry(add3)(1), 'function');
});

test('柯里化后的函数能复用，不串参数（最值钱的一条）', () => {
  const c = curry(add3);
  assert.equal(c(1)(2)(3), 6);
  // 如果实现里把参数数组存在了共用的地方，这一次会带上 1、2、3 而算错
  assert.equal(c(4)(5)(6), 15);
  assert.equal(c(1, 2)(3), 6);
});

test('两个柯里化函数之间互不干扰', () => {
  const c1 = curry(add3);
  const c2 = curry((a:number, b:number, c:number) => a * b * c);
  assert.equal(c2(2)(3)(4), 24);
  assert.equal(c1(1)(2)(3), 6);
});
