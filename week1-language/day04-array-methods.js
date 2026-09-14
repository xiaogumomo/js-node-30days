// ============================================================
// Day 4 产出物 2：数组清单第 7、8 项的重做（定稿）
// 完成日期：2026-09-14（Day 4）
// 来源：D:\code\2026\vs code\9.14\day04-array-methods.js（原样搬入，未改写）
// 对应：day03-array-methods.js 里"做了但证明不了"的那两项
// 实跑复核：Node v24.21.0 —— 脚本跑到底，退出码 0，三项全部合格。
//
// 【三项验收】（都经过实跑，不是看代码判断）
//   ✅ 第 7 项 不可更新演示
//      四个非原位方法都接住了返回值，原数组始终 [1,5,3,4]；sort() 原位对照成立，
//      并加了最锋利的身份比较 —— 一行定论"原位"和"非原位"的本质区别：
//          console.log(arr.sort() === arr);      // true  原位：返回的就是原数组自己
//          console.log(arr.toSorted() === arr);  // false 非原位：返回的是新数组
//   ✅ 第 8 项 structuredClone 嵌套对象
//      ①②各用独立对象，因果不再互相污染：
//          ①拷贝后的原对象：{ city: 'LA' }            ← 浅拷贝改副本 → 原对象跟着变
//          克隆后（修改后）的原对象：{ city: 'NY' }    ← 深拷贝改副本 → 原对象没变
//   ✅ 第 ③ 段 JSON vs structuredClone 循环引用
//      try/catch 把错误接住，对比成立，并打印了 error.name / error.stack / error.message：
//          structuredClone深拷贝的： <ref *1> { address: [Circular *1] }
//          TypeError
//          TypeError: Converting circular structure to JSON
//              --> starting at object with constructor 'Object'
//              --- property 'address' closes the circle
//
// 上一轮列的 5 个可选打磨这一版全部改掉了：变量改名 oldsort、补身份比较、
// 标签去重（克隆后（修改前）/（修改后））、Json 拼写、try 块缩进，外加补上 error.name。
//
// 【为什么这一版值得记一笔】第 ③ 段最初是"把出错的行注释掉"，让报错消失；
// 现在是"用 try/catch 接住它并打印出来"。两者在工程上的差别很大：
//   注释掉 = 把证据藏起来 —— 面试被问"JSON 深拷贝有什么坑"，只能说"我记得有问题"；
//   接住并打印 = 手里攥着真实报错原文 —— 能直接答 TypeError: Converting circular structure to JSON。
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
const oldsort=arr.sort();
console.log(arr.sort() === arr);
console.log(arr.toSorted() === arr );
console.log('新数组：',oldsort);
console.log('原数组：',arr);



//今天写一组三连对比（这是深浅拷贝最锋利的一刀）：

const nested ={name:"John",address :{city:"NY"}};
console.log("①拷贝前的原对象：",nested.address);
const shallow = {...nested};
shallow.address.city = 'LA';
console.log("①拷贝后的原对象：",nested.address);

const nested1 ={name:"John",address :{city:"NY"}};
const deep=structuredClone(nested1);
console.log("克隆后（修改前）的原对象：",nested1.address);
console.log('深拷贝修改前的对象：',deep.address);
deep.address.city='LA';
console.log("克隆后（修改后）的原对象：",nested1.address);
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
    console.log ('Json深拷贝的：',Json);
}catch(error){
    console.log(error.name);
    console.log(error.stack);
    console.log(error.message);

}






