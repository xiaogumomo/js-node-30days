// ============================================================
// Day 4 产出物 2：数组清单第 7、8 项的重做（定稿版）
// 完成日期：2026-09-14（Day 4）
// 来源：D:\code\2026\vs code\9.14\day04-array-methods.js（原样搬入，未改写）
// 对应：day03-array-methods.js 里"做了但证明不了"的那两项
// 实跑复核：node v24.21.0，2026-09-14 —— 剧本跑到底，退出码 0，三项全部合格。
//
// 【第 7 项 不可更新 + sort() 对照】✅ 合格
//   四个非原位方法都接住了返回值，实测原数组始终是 [1,5,3,4]；新加的 sort()
//   对照成立 —— 同一组输出里前四个方法原数组不变，sort() 一动就变：
//     新数组： [ 1, 3, 4, 5 ]   原数组： [ 1, 5, 3, 4 ]   ← toSorted
//     新数组： [ 4, 3, 5, 1 ]   原数组： [ 1, 5, 3, 4 ]   ← toReversed
//     新数组： [ 99, 5, 3, 4 ]  原数组： [ 1, 5, 3, 4 ]   ← with
//     新数组： [ 1, 1, 3, 4 ]   原数组： [ 1, 5, 3, 4 ]   ← toSpliced
//     新数组： [ 1, 3, 4, 5 ]   原数组： [ 1, 3, 4, 5 ]   ← sort()「原位」：原数组被改了
//
// 【第 8 项 structuredClone 嵌套对象】✅ 合格
//   ①②各用独立对象后，因果不再互相污染：
//     ①拷贝后的原对象： { city: 'LA' }    ← 浅拷贝改副本 → 原对象跟着变
//     ②深拷贝后的原对象： { city: 'NY' }  ← 改副本为 'LA' 后，原对象仍是 'NY'
//     深拷贝修改后的对象： { city: 'LA' }
//
// 【第 ③ 段 JSON vs structuredClone 循环引用】✅ 合格
//   try/catch 把错误接住了，对比成立 —— 两行输出并排，一句废话没有：
//     structuredClone深拷贝的： <ref *1> { address: [Circular *1] }   ← 成功处理循环引用
//     Converting circular structure to JSON                            ← JSON 方式抛错
//         --> starting at object with constructor 'Object'
//         --- property 'address' closes the circle
//   `error.message` 把真实报错原文完整带出来了。这就是"看懂报错"，而不是
//   "把出错的代码注释掉" —— 面试被问"JSON 深拷贝有什么坑"时，你要说的是这段文字。
//
// ============ 以上三项全部合格。以下是可选打磨（不影响合格判定）============
//   1. try/catch 里只打印了 error.message，没打印错误类型。建议：
//        console.log(error.name + ': ' + error.message)
//      → 输出变成 "TypeError: Converting circular structure to JSON"，更完整。
//      （error.name / error.message 你在 day02-scope.js 里已经用过，直接搬）
//   2. 第 51 行标签拼写 'Jspm深拷贝的' 应为 'Json…'（该行在 try 内，实际执行不到）
//   3. 第 18 行 `const sort = arr.sort()`：变量名 sort 装的是"结果"，容易和 sort
//      方法混淆；而且 sort 和 arr 是同一个数组，两行打印的是同一个东西。
//      建议改名，并加一行：console.log(arr.sort() === arr) → true
//      （对比 console.log(arr.toSorted() === arr) → false，这是"原位 vs 非原位"
//       最锋利的一行定论）
//   4. 第 34 行和第 37 行标签重复（都是"②深拷贝后的原对象"），建议第一次改成
//      "克隆后（修改前）"
//   5. 第 51 行缩进与相邻行不一致
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
const clone=structuredClone(a);
console.log ('structuredClone深拷贝的：',clone);
try{
    const Json=JSON.parse(JSON.stringify(a));
console.log ('Jspm深拷贝的：',Json);
}catch(error){
    console.log(error.message);
}






