// ============================================================
// Day 4 产出物 2：数组清单第 7、8 项的重做
// 完成日期：2026-09-14（Day 4）
// 来源：D:\code\2026\vs code\9.14\day04-array-methods.js（原样搬入，未改写）
// 对应：day03-array-methods.js 里"做了但证明不了"的那两项
// 实跑复核：node v24.21.0，2026-09-14（AI 逐个现象实测，不是推测）
//
// 【第 7 项 不可更新演示】✅ 合格
//   toSorted / toReversed / with / toSpliced 四个方法都接住了返回值，
//   并且每个都打印了"新数组"和"原数组"。实测输出里原数组始终是 [1,5,3,4]：
//     新数组： [ 1, 3, 4, 5 ]   原数组： [ 1, 5, 3, 4 ]
//     新数组： [ 4, 3, 5, 1 ]   原数组： [ 1, 5, 3, 4 ]
//     新数组： [ 99, 5, 3, 4 ]  原数组： [ 1, 5, 3, 4 ]
//     新数组： [ 1, 1, 3, 4 ]   原数组： [ 1, 5, 3, 4 ]
//   —— 昨天"只调用不接住、四次都只打印原数组"的问题解决了。
//   ⬜ 还差一项：原要求里"再加一组 sort()（原位方法）的对照"没做。
//      用同一个数组把 sort() 和 toSorted() 并排跑，一个改原数组一个不改，
//      两组挨着才是一刀见血。
//
// 【第 8 项 structuredClone 嵌套对象】✅ 基本合格（一处瑕疵）
//   用嵌套对象做出了关键对比：
//     ①拷贝前的原对象： { city: 'NY' }
//     ①拷贝后的原对象： { city: 'LA' }   ← 浅拷贝改副本，原对象跟着变
//     深拷贝的对象：   { city: 'ch' }
//     ②深拷贝后的原对象： { city: 'LA' }  ← 深拷贝改副本，原对象不受影响
//   ⚠️ 瑕疵：②里 structuredClone 克隆的是"已经被①改过"的 nested（city 已是 'LA'），
//      所以最后这行打印 'LA' 需要读者自己推理才明白"它没被改成 'ch'"。
//      更干净的写法：①②各用一个独立的原始对象，两组互不干扰。
//
// 【第 ③ 段 JSON vs structuredClone 循环引用】❌ 这一段跑不通
//   实测：第 38 行 `JSON.parse(JSON.stringify(a))` 直接抛错，**整个脚本在此中断**，
//   后面的 structuredClone 根本没执行到。真实报错：
//     TypeError: Converting circular structure to JSON
//       --> starting at object with constructor 'Object'
//       --- property 'address' closes the circle
//       at JSON.stringify (<anonymous>)
//   这一段的目的是"观察到"JSON 方式会炸、而 structuredClone 不会。要观察到它，
//   必须用 try/catch 把错误接住再打印，否则脚本会被打断，你也就看不到后半段。
//
// 【本次最该记住的一条】这份文件没有跑过——这是第 4 次"写完没运行"
//   （day02-scope.js、day02-clone.js、day03-array-methods.js、今天这份）。
//   它不需要测试脚手架，直接 `node week1-language/day04-array-methods.js`
//   就能看到上面那个报错。敲一次就好，而这一次能把上面三处问题全部暴露出来。
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


//今天写一组三连对比（这是深浅拷贝最锋利的一刀）：

const nested ={name:"John",address :{city:"NY"}};
console.log("①拷贝前的原对象：",nested.address);
const shallow = {...nested};
shallow.address.city = 'LA';
console.log("①拷贝后的原对象：",nested.address);
const deep=structuredClone(nested);
deep.address.city='ch';
console.log('深拷贝的对象：',deep.address);
console.log("②深拷贝后的原对象：",nested.address);


// 再加一条：JSON.parse(JSON.stringify(x))
// 遇到循环引用会抛 TypeError，而
// structuredClone 能正常处理 —— 昨天我实测过，可以自己复现。
const a={};
a.address=a;
const Json=JSON.parse(JSON.stringify(a));
const clone=structuredClone(a);
console.log ('structuredClone深拷贝的：',clone);
console.log ('Jspm深拷贝的：',Json);






