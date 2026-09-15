// ============================================================
// 产出物 5：day02-clone.js —— 浅拷贝三种写法 + 手写深克隆 + structuredClone 对比
// 状态：✅ 全部完成（浅拷贝 3/3 + 深克隆 17/17 通过）
// 完成日期：2026-09-14（Day 4）
//
// 【浅拷贝三种写法】✅ 三个遗留问题全部修掉，三段输出完全一致：
//     克隆后修改前的原对象： { name: 'John', address: { city: 'NL' } }
//     克隆后修改后的原对象： { name: 'John', address: { city: 'cn' } }
//   原对象的 city 从 'NL' 变成 'cn' —— 这就是"浅拷贝只复制第一层"的铁证：
//   副本的 address 和原对象的 address 是同一份，改哪个都是改同一份。
//
// 【手写深克隆】✅ `node week1-language/day04-clone-verify.js` → 通过 17 项，失败 0 项
//
// 【为什么下面那段演示代码被包在 if (require.main === module) 里】
//   `require` 一个文件 = 从头到尾执行它一遍，**顶层代码全都会跑**。
//   之前跑脚手架时输出开头会多出 6 行浅拷贝的打印，原因就是脚手架的
//   `require('./day02-clone.js')` 把这个文件顶层的 console.log 也执行了。
//   `require.main === module` 的意思是"这个文件是被 node 直接运行的"：
//     · node 直接跑这个文件     → 条件成立 → 执行演示，你能看到输出
//     · 被别的文件 require 进来 → 条件不成立 → 只导出函数，一行打印都不产生
//   于是同一个文件既当"能跑的演示"，又当"干净的库"。明天 p0-toolkit 引用它就不会被污染。
//   这就是上一课"库文件不该在顶层产生副作用"的标准解法。
// ============================================================


if (require.main === module) {

  //浅拷贝三种写法：{...obj} /Object.assign({}, obj)/for...in，并用代码证明它们只复制第一层

  //{...obj}

  let user = {
    name: 'John',
    address: { city: 'NL' }
  }
  let clone = { ...user };
  console.log("克隆后修改前的原对象：", user);
  clone.address.city = 'cn';
  console.log("克隆后修改后的原对象：", user);//原对象改变了！

  //Object.assign({},obj)

  let user1 = {
    name: 'John',
    address: { city: 'NL' }
  }
  let clone1 = Object.assign({}, user1);
  console.log("克隆后修改前的原对象：", user1);
  clone1.address.city = 'cn';
  console.log("克隆后修改后的原对象：", user1);//原对象改变了！

  //for...in

  let user2 = {
    name: 'John',
    address: { city: 'NL' }
  }
  let clone2 = {};
  for (let key in user2) {
    clone2[key] = user2[key]
  }
  console.log("克隆后修改前的原对象：", user2);
  clone2.address.city = 'cn';
  console.log("克隆后修改后的原对象：", user2);//原对象改变了！

}


//deepClone(值)：
//   ①【出口】这个值不是对象（或者它就是 null）→ 原样返回它
//   ② 它是数组 → 造一个新数组，把每个元素递归 deepClone 一遍放进去，返回
//   ③ 否则它是普通对象 → 造一个新对象，把每个键对应的值递归 deepClone 一遍放进去，返回
//
// 【已知限制（已实测，不是猜的）】手写版处理不了下面这些，需要时请换 structuredClone：
//   · 循环引用（对象自己包含自己）→ RangeError: Maximum call stack size exceeded
//       递归永远遇不到出口，堆栈被打穿。这正是《递归和堆栈》里"最大递归深度受限于引擎"。
//   · Date → 退化成 {}（因为 Date 没有可枚举的自有属性，for...in 什么也遍历不到）
//   · Map / Set / RegExp / 函数 → 退化成 {} 或原型丢失
// 【structuredClone 也不是万能的】它同样处理不了：
//   · 函数 → 抛 DataCloneError: () => 1 could not be cloned.
//   · class 实例的原型 → 丢失（克隆出来是普通对象，方法没了）
// 【JSON.parse(JSON.stringify(x)) 这条路更差】：
//   · 循环引用 → 抛 TypeError: Converting circular structure to JSON
//   · Date → 变成 ISO 字符串（类型信息丢了）
//   · 函数和 undefined 属性 → 被**静默丢弃**（不报错，属性凭空消失）


function deepClone(x) {

    if (typeof x !== 'object' || x === null) {
        return x;
    }
    if (Array.isArray(x)) {
        return x.map(item => deepClone(item));
    }
    let result = {}
    for (const key in x) {
        result[key] = deepClone(x[key]);
    }

    return result

}


module.exports = { deepClone }


// ============================================================
// 【踩坑记录】出口条件写反 —— 以及它为什么只对字符串炸
//
// 一开始写成了：
//     if (typeof x === 'object' || x === 'function') return x;   // ❌ 方向反了
// 出口的职责是"拦住不该往下钻的值"，而不该往下钻的正是**原始类型**。
// 所以条件应该是"**不是**对象"，不是"是对象"。
//
// 写反之后逐值验一遍：
//     1        → 该原样返回，却掉进对象分支，被悄悄变成 {}
//     'abc'    → 该原样返回，却掉进对象分支 → **死循环** → RangeError
//     null     → 靠"第一个条件写反"蒙对了（typeof null === 'object'）
//     {a:1}    → 原样返回**它自己**（同一个引用，根本不是克隆！）
//
// 死循环的来源特别反直觉：**for...in 可以遍历字符串。**
//     for (const key in 'a')  →  key = "0"
//     'a'[0]                  →  又是 'a'
//   于是 deepClone('a') 一路调用自己，永不停止。单个字符就够触发。
//   实测：只有字符串炸；数字、布尔、undefined 不报错，但会被静默变成 {}（更危险）。
//
// 修法（只改一个字符）：
//     if (typeof x !== 'object' || x === null) return x;
// 改对之后，函数会被 typeof x !== 'object' 自动拦住（typeof fn === 'function'），
// 所以原来那个 `x === 'function'` 判断可以删掉。
//
// 为什么这个 bug 靠"读代码"发现不了？因为字符串看起来完全不像"能被 for...in 遍历的东西"。
// 这类错误只有跑起来才会露出来 —— 这就是"写完必须跑一次"的实证。
// ============================================================
