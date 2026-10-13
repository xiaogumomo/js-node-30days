'use strict';
// ============================================================
// test/chunk.test.js —— 切块（`chunkText`）的判据（AI 写的，实现由你写）
//
// 跑 `node --test`，红着的每一条 = 还差的一块。
//
// ★ 契约（你实现时必须对齐；判据照它写）：
//
//   const { chunkText } = require('../src/chunk.js');
//
//   chunkText(text, opts) -> [ { text, index, start, end } ]
//     opts: { size = 500, overlap = 50 }        // size/overlap 都以"字符"为单位
//     index: 第几块（0 起）                       // 下游打印/检索会用到
//     start / end: 这一块在【原文】里的下标区间（`end` 不含）—— **给 Day 3 的引用溯源留的**
//     text: 就是 text.slice(start, end)
//
//   ★ 切法（固定长度 + 滑窗）：
//     step = size - overlap      // 下一块从"上一块的起点"往后挪这么多
//     从 start = 0 开始：
//       end = Math.min(start + size, text.length)
//       产出 { text: text.slice(start, end), index, start, end }
//       **若 end === text.length（这一块已经切到末尾）→ 停**（不再产出多余的"尾巴重叠块"）
//       否则 start += step，继续
//
//   ★ 边界：
//     空串 / 纯空白 → []
//     非字符串（null / 数字 / 数组…）→ 抛 TypeError
//     size 不是正整数 → 抛 Error
//     overlap 为负 或 overlap >= size → 抛 Error（overlap = 0 是**合法**的：不重叠）
//
//   ⚠️ 已知局限（判据不测，但你要知道）：按 JS 字符串（UTF-16 码元）切，
//      中文没事，**emoji 这类代理对会被从中间切开** —— 记进 README「已知限制」。
// ============================================================

const { test } = require('node:test');
const assert = require('node:assert');

const { chunkText } = require('../src/chunk.js');

// 造一段"字字不同"的测试文本：第 i 个字符是 i 的某种编码，方便一眼看出切错没切错
function makeText(n) {
  let s = '';
  for (let i = 0; i < n; i++) s += String.fromCharCode(0x4e00 + (i % 2000)); // 一段不重复的汉字
  return s;
}

// 把各块按 step 拼回去，看能不能还原原文（防"丢字 / 添字"）
function rebuild(chunks, size, overlap) {
  const step = size - overlap;
  let out = '';
  for (const c of chunks) out += c.text.slice(0, step); // 每块只取"不重复的那段"
  const last = chunks[chunks.length - 1];
  out += last.text.slice(Math.min(step, last.text.length)); // 最后一块的尾巴都算
  return out;
}

// 01 在防：块数算错 / 起点步长算错 / index 没给 / offsets 不对
test('01 正常切：1200 字 / size 500 / overlap 50 → 3 块，start 依次 0、450、900', () => {
  const text = makeText(1200);
  const chunks = chunkText(text, { size: 500, overlap: 50 });
  assert.strictEqual(chunks.length, 3, '应该切出 3 块');
  const expectStarts = [0, 450, 900];
  const expectEnds = [500, 950, 1200];
  chunks.forEach((c, i) => {
    assert.strictEqual(c.index, i, 'index 要 0 起递增');
    assert.strictEqual(c.start, expectStarts[i], `第 ${i} 块的 start`);
    assert.strictEqual(c.end, expectEnds[i], `第 ${i} 块的 end`);
    assert.strictEqual(c.text, text.slice(expectStarts[i], expectEnds[i]), `第 ${i} 块的 text 要等于原文切片`);
  });
});

// 02 在防：切的过程中丢字 / 多字 / 顺序错乱（文本类功能最容易的静默坏法）
test('02 把各块拼回去 === 原文（不丢字、不添字）', () => {
  const text = makeText(1234);
  const chunks = chunkText(text, { size: 300, overlap: 40 });
  assert.strictEqual(rebuild(chunks, 300, 40), text);
});

// 03 在防：overlap 只是参数、根本没实现（"看起来切了、其实没重叠"）
test('03 重叠真的存在：相邻两块的重叠区字符相同', () => {
  const text = makeText(800);
  const chunks = chunkText(text, { size: 300, overlap: 60 });
  for (let i = 0; i + 1 < chunks.length; i++) {
    assert.strictEqual(
      chunks[i].text.slice(-60),
      chunks[i + 1].text.slice(0, 60),
      `第 ${i} 块和第 ${i + 1} 块的重叠区应一致`
    );
  }
});

// 04 在防：末尾多出来一块"只和上一块重叠的小尾巴"（切到末尾就该停）
test('04 刚好一整块不多出尾巴：长度 500 → 1 块；长度 501 → 2 块（第 2 块 51 字）', () => {
  const one = chunkText(makeText(500), { size: 500, overlap: 50 });
  assert.strictEqual(one.length, 1, '一整块就该只有 1 块');
  const two = chunkText(makeText(501), { size: 500, overlap: 50 });
  assert.strictEqual(two.length, 2, '超出一个字符 → 第 2 块');
  assert.strictEqual(two[1].text.length, 51, '第 2 块应是从 450 到 501 的 51 个字');
});

// 05 在防：空输入炸掉 / 把非字符串当成字符串处理（静默出错）
test('05 边界输入：空串和纯空白 → []；非字符串 → 抛错', () => {
  assert.deepStrictEqual(chunkText(''), []);
  assert.deepStrictEqual(chunkText('   \n\t  '), []);
  for (const bad of [null, undefined, 123, ['a'], { a: 1 }]) {
    assert.throws(() => chunkText(bad), TypeError, `${JSON.stringify(bad)} 应该抛 TypeError`);
  }
});

// 06 在防：参数不校验 → 死循环 / 切成碎渣（overlap >= size 会让 step <= 0）
test('06 非法参数要抛错：size 非正整数 / overlap 为负 / overlap >= size', () => {
  const t = makeText(100);
  assert.throws(() => chunkText(t, { size: 0, overlap: 0 }));
  assert.throws(() => chunkText(t, { size: -5, overlap: 0 }));
  assert.throws(() => chunkText(t, { size: 10.5, overlap: 0 }));
  assert.throws(() => chunkText(t, { size: 50, overlap: -1 }));
  assert.throws(() => chunkText(t, { size: 50, overlap: 50 }), 'overlap 等于 size 会让 step=0');
  assert.throws(() => chunkText(t, { size: 50, overlap: 80 }));
});

// 07 在防：默认值没生效（不传 opts 就崩 / 用了别的默认值）
test('07 默认参数：不传 opts → size 500 / overlap 50', () => {
  const chunks = chunkText(makeText(501));
  assert.strictEqual(chunks.length, 2, '默认 500/50 时，501 字的文本应切成 2 块');
  assert.strictEqual(chunks[0].text.length, 500);
});

// 08 在防：overlap=0（合法的"不重叠"）被误当成非法 / 参数传不进去
test('08 overlap=0 合法：25 字 / size 10 / overlap 0 → 3 块（10、10、5）', () => {
  const chunks = chunkText(makeText(25), { size: 10, overlap: 0 });
  assert.strictEqual(chunks.length, 3);
  assert.deepStrictEqual(chunks.map((c) => c.text.length), [10, 10, 5]);
  assert.deepStrictEqual(chunks.map((c) => c.start), [0, 10, 20]);
});
