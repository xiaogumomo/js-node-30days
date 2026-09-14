// ============================================================
// Day 4 验证脚手架：深克隆（deepClone）
// 用法：node week1-language/day04-clone-verify.js
//
// 这是【测试脚本】。按计划 §一 的规则，测试允许让 AI 写，实现必须你自己写。
//
// 你的实现要放在 week1-language/day02-clone.js 里，并满足两件事：
//   ① 定义一个名为 deepClone 的函数（接收一个值，返回它的深克隆）
//   ② 文件最后加一行：module.exports = { deepClone };
//
// 本脚本分两部分：
//   【第 1 部分】6 项必过测试 —— 判定对错，全过才算合格
//   【第 2 部分】2 项局限探针 —— 不判定对错，只记录"手写版和 structuredClone 差在哪"
//                （这部分是故意不修的，它是你的 p0-toolkit README 里的「已知限制」）
// ============================================================

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hintAndExit(why) {
  console.log('❌ ' + why);
  console.log('');
  console.log('检查这三件事：');
  console.log('  1. week1-language/day02-clone.js 里有没有一个叫 deepClone 的函数？');
  console.log('  2. 文件最后有没有加一行 module.exports = { deepClone };');
  console.log('  3. 你写的代码是不是还在注释里（// 或 /* */ 包着）？');
  process.exit(1);
}

let deepClone;
try {
  ({ deepClone } = require('./day02-clone.js'));
} catch (err) {
  hintAndExit('读不到 day02-clone.js。错误信息：' + err.message);
}
if (typeof deepClone !== 'function') {
  hintAndExit('文件读到了，但导出的 deepClone 不是函数，它现在是：' + typeof deepClone
    + '（多半是模块导出还没写，或者代码还注释着）');
}

let pass = 0;
let fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + '　→ ' + detail); }
}

function main() {
  try {
  console.log('\n=== 测试 1：原始类型原样返回（不用复制，它们存的就是值）===');
  {
    const cases = [1, 'abc', true, undefined, 0, NaN];
    const bad = cases.filter((v) => !Object.is(deepClone(v), v));
    check('数字 / 字符串 / 布尔 / undefined / NaN 都原样返回', bad.length === 0,
      '这些值没原样返回：' + bad.map(String).join(', '));
  }

  console.log('\n=== 测试 2：嵌套对象 —— 改副本的深层属性，原对象不能受影响 ===');
  {
    const src = { name: 'John', address: { city: 'NY' } };
    const copy = deepClone(src);
    check('返回的是一个新对象', copy !== src, 'copy 和 src 是同一个引用');
    check('第二层也是新对象', copy.address !== src.address,
      'copy.address 和 src.address 是同一个引用 —— 说明只复制了第一层（浅拷贝）');
    copy.address.city = 'LA';
    check('改副本的 city → 原对象仍是 NY', src.address.city === 'NY',
      '原对象变成了 ' + src.address.city);
  }

  console.log('\n=== 测试 3：数组（包括嵌套数组、数组里的对象）===');
  {
    const src = [1, [2, 3], { a: 1 }];
    const copy = deepClone(src);
    check('返回的是数组', Array.isArray(copy), '返回的不是数组：' + Object.prototype.toString.call(copy));
    check('长度相同', copy.length === src.length, '长度 ' + copy.length + ' vs ' + src.length);
    check('内层数组是新数组', copy[1] !== src[1], '内层数组还是同一个引用');
    copy[1].push(999);
    copy[2].a = 99;
    check('改副本的内层数组 → 原数组长度不变', src[1].length === 2, '原数组长度变成了 ' + src[1].length);
    check('改副本里对象的属性 → 原数组不受影响', src[2].a === 1, '原对象变成了 ' + src[2].a);
  }

  console.log('\n=== 测试 4：null 必须保持 null（今天最容易翻车的一项）===');
  {
    const bare = deepClone(null);
    check('deepClone(null) 得到 null', bare === null, '得到的是 ' + JSON.stringify(bare)
      + ' —— 注意 typeof null === "object"，如果先判 object 就会把 null 当对象处理');

    const src = { a: null, b: 1 };
    const copy = deepClone(src);
    check('对象属性值是 null 时也保持 null', copy.a === null, '得到的是 ' + JSON.stringify(copy.a));
    check('整个副本和原对象一致', JSON.stringify(copy) === JSON.stringify(src),
      JSON.stringify(copy) + ' vs ' + JSON.stringify(src));
  }

  console.log('\n=== 测试 5：混合结构 + 三层深度 ===');
  {
    const src = { name: 'John', tags: ['a', 'b'], address: { city: 'NY', geo: { lat: 1 } } };
    const copy = deepClone(src);
    copy.address.geo.lat = 99;
    copy.tags.push('c');
    check('改第三层（address.geo.lat）→ 原对象不变', src.address.geo.lat === 1,
      '原对象变成了 ' + src.address.geo.lat);
    check('改副本的数组 → 原数组长度不变', src.tags.length === 2, '原数组长度变成了 ' + src.tags.length);
  }

  console.log('\n=== 测试 6：空值和边界 ===');
  {
    check('deepClone({}) 得到空对象', JSON.stringify(deepClone({})) === '{}', '得到 ' + JSON.stringify(deepClone({})));
    check('deepClone([]) 得到空数组', JSON.stringify(deepClone([])) === '[]', '得到 ' + JSON.stringify(deepClone([])));
    const src = { a: undefined };
    check('属性值是 undefined 时保留该属性', 'a' in deepClone(src), '属性 a 丢了');
  }

  // ---------------- 以下不判定对错 ----------------
  console.log('\n\n=== 局限探针（不判定对错，只记录行为）===');
  console.log('这两条是故意不修的 —— 它们是 p0-toolkit README 里的「已知限制」。\n');

  console.log('【探针 A】循环引用（对象自己包含自己）');
  {
    const cyc = { name: 'x' };
    cyc.self = cyc;
    try {
      deepClone(cyc);
      console.log('  手写版     → 没有抛错（意外，通常应该栈溢出）');
    } catch (e) {
      console.log('  手写版     → ' + e.constructor.name + ': ' + e.message);
      console.log('               递归永不终止，堆栈被打穿 —— 这就是《递归和堆栈》里说的最大递归深度限制');
    }
    try {
      const c = structuredClone(cyc);
      console.log('  structuredClone → 成功，且 c.self === c ？ ' + (c.self === c));
    } catch (e) {
      console.log('  structuredClone → ' + e.constructor.name);
    }
  }

  console.log('\n【探针 B】Date 对象');
  {
    const src = { d: new Date('2026-09-14') };
    const copy = deepClone(src);
    console.log('  手写版     → cloned.d 还是 Date 吗？ ' + (copy.d instanceof Date)
      + '（朴素递归版会退化成 {}，因为 Date 没有可枚举的自有属性）');
    console.log('  structuredClone → 还是 Date 吗？ ' + (structuredClone(src).d instanceof Date));
    console.log('  JSON 方式  → ' + JSON.stringify(JSON.parse(JSON.stringify(src))).slice(0, 40)
      + '（Date 变成了字符串，类型信息丢了）');
  }

  } catch (e) {
    fail++;
    console.log('\n💥 你的实现在某个测试里抛错了：' + e.constructor.name + ': ' + e.message);
    console.log('   失败点就在上面最后一条通过的测试之后。');
    if (e.constructor.name === 'RangeError') {
      console.log('   RangeError 通常是递归没有出口（无限递归）—— 检查你的"出口"条件。');
    }
  }

  console.log('\n---------------- 结果 ----------------');
  console.log('必过测试：通过 ' + pass + ' 项，失败 ' + fail + ' 项');
  if (fail === 0) {
    console.log('🎉 全部通过。接下来把「局限探针」里的两条结论写进 day02-clone.js 的注释 ——');
    console.log('   那句注释明天直接进 p0-toolkit 的 README「已知限制」。');
  } else {
    console.log('还有失败项 —— 先别往下走。失败项的描述里通常写着"实际得到了什么"。');
  }
  // 等一下再退出，免得探针里的异步输出被截断
  return sleep(50).then(() => process.exit(fail === 0 ? 0 : 1));
}

main();
