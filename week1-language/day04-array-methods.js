// ============================================================
// Day 4 产出物 2：数组清单第 7、8 项的重做（第 2 版）
// 完成日期：2026-09-14（Day 4）
// 来源：D:\code\2026\vs code\9.14\day04-array-methods.js（原样搬入，未改写）
// 对应：day03-array-methods.js 里"做了但证明不了"的那两项
// 实跑复核：node v24.21.0，2026-09-14。**本版整个脚本跑到底，退出码 0**（上一版在第 38 行中断）
//
// 【第 7 项 不可更新 + sort() 对照】✅ 完全合格
//   四个非原位方法都接住了返回值，实测原数组始终是 [1,5,3,4]。
//   新加的 sort() 对照成立 —— 同一组输出里，前四个方法原数组不变，sort() 变了：
//     新数组： [ 1, 3, 4, 5 ]   原数组： [ 1, 5, 3, 4 ]   ← toSorted
//     新数组： [ 4, 3, 5, 1 ]   原数组： [ 1, 5, 3, 4 ]   ← toReversed
//     新数组： [ 99, 5, 3, 4 ]  原数组： [ 1, 5, 3, 4 ]   ← with
//     新数组： [ 1, 1, 3, 4 ]   原数组： [ 1, 5, 3, 4 ]   ← toSpliced
//     新数组： [ 1, 3, 4, 5 ]   原数组： [ 1, 3, 4, 5 ]   ← sort()「原位」：原数组被改了
//   💡 更锋利的一行（实测）：console.log(arr.sort() === arr) → true
//                              console.log(arr.toSorted() === arr) → false
//      一行就说清"原位"和"非原位"的本质区别，比对比打印结果更直接。
//
// 【第 8 项 structuredClone 嵌套对象】✅ 完全合格
//   改成 ① ② 各用一个独立对象后，演示干净了：
//     ①拷贝后的原对象： { city: 'LA' }   ← 浅拷贝改副本 → 原对象跟着变
//     ②深拷贝后的原对象： { city: 'NY' } ← 改副本 city 为 'LA' 之后，原对象仍是 'NY'
//     深拷贝修改后的对象： { city: 'LA' }
//   两组的因果不再互相污染，"深拷贝没有连带修改原对象"一眼可见。
//
// 【第 ③ 段 JSON vs structuredClone 循环引用】⚠️ 只算完成一半
//   崩溃修好了（把 JSON 那行注释掉），脚本能跑到底，structuredClone 正常处理循环引用：
//     structuredClone深拷贝的： <ref *1> { address: [Circular *1] }
//     （`<ref *1>` / `[Circular *1]` 是 Node 打印循环结构的方式，说明克隆成功）
//   ⚠️ 但这样一来**对比就消失了**：JSON 那半被注释掉，只剩 structuredClone 一行输出。
//      这一段的目的是"亲眼看到 JSON 方式会抛错，而 structuredClone 不会"——现在只证明了后半句。
//      修法：把注释取消，用 try/catch 把错误接住打印出来。
//      try/catch 你在 day02-scope.js 里已经写过了，直接搬过来即可。
//      期望看到：TypeError: Converting circular structure to JSON
//                 --> starting at object with constructor 'Object'
//                 --- property 'address' closes the circle
// ============================================================



//四个方法 toSorted / toReversed / with / toSpliced

const arr =[1,5,3,4];
const sorted =arr.toSorted()
console.log('原数组：',arr);
console.log('新数组：',sorted);
const reversed=arr.toReversed();
console.log('新数组：',reversed);
console.log('原数组：',arr);
const thewith=arr.with(0,99);
console.log('新数组：',thewith);
console.log('原数组：',arr);
const spliced=arr.toSpliced(1,1,1);
console.log('新数组：',spliced);
console.log('原数组：',arr);
const sort=arr.sort();
console.log('新数组：',sort);
console.log('原数组：',arr);



//今天写一组三连对比（这是深浅拷贝最锋利的一刀）：

const nested ={name:"John",address :{city:"NY"}};
console.log("①拷贝前的原对象：",nested.address);
const shallow = {...nested};
shallow.address.city = 'LA';
console.log("①拷贝后的原对象：",nested.address);

const nested1 ={name:"John",address :{city:"NY"}};
const deep=structuredClone(nested1);
console.log("②深拷贝后的原对象：",nested1.address);
console.log('深拷贝修改前的对象：',deep.address);
deep.address.city='LA';
console.log("②深拷贝后的原对象：",nested1.address);
console.log('深拷贝修改后的对象：',deep.address);



// 再加一条：JSON.parse(JSON.stringify(x))
// 遇到循环引用会抛 TypeError，而
// structuredClone 能正常处理 —— 昨天我实测过，可以自己复现。
const a={};
a.address=a;
//const Json=JSON.parse(JSON.stringify(a));
const clone=structuredClone(a);
console.log ('structuredClone深拷贝的：',clone);
//console.log ('Jspm深拷贝的：',Json);






