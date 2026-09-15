// ============================================================
// 测试 deepClone（深克隆）
//
// 【也是纯同步的，不需要 sleep】
//
// 【这一组里有两个断言最值钱】
//   assert.notEqual(copy.address, src.address)  → 第二层也是新对象，这才叫"深"
//   assert.equal(src.address.city, 'NY')        → 改副本不影响原对象，这才是目的
// ============================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const { deepClone } = require('../src/deepClone.js');

test('嵌套对象：改副本的深层属性，原对象不受影响', () => {
  const src = { name: 'John', address: { city: 'NY' } };
  const copy = deepClone(src);
  assert.notEqual(copy, src);                  // 第一层是新对象
  assert.notEqual(copy.address, src.address);  // 第二层也是新对象 ← 这一条才算"深"
  copy.address.city = 'LA';
  assert.equal(src.address.city, 'NY');        // 原对象没被改
});

test('数组（含嵌套数组、数组里的对象）', () => {
  const src = [1, [2, 3], { a: 1 }];
  const copy = deepClone(src);
  assert.ok(Array.isArray(copy));              // ok() 就是"断言它是真值"
  assert.notEqual(copy[1], src[1]);
  copy[1].push(999);
  copy[2].a = 99;
  assert.equal(src[1].length, 2);
  assert.equal(src[2].a, 1);
});

test('null 必须保持 null（不能变成空对象）', () => {
  assert.equal(deepClone(null), null);
  const copy = deepClone({ a: null, b: 1 });
  assert.equal(copy.a, null);
});

test('原始类型原样返回', () => {
  assert.equal(deepClone(1), 1);
  assert.equal(deepClone('abc'), 'abc');
  assert.equal(deepClone(true), true);
});
