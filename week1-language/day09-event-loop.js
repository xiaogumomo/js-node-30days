



// //实验 1：setImmediate vs setTimeout(fn, 0)，在主模块里
// console.log("=== 实验 1 ===");

// setTimeout(()=>console.log("=== 实验 1 ===AsetTimeout 0"),0);
// setImmediate(()=>console.log("=== 实验 1 ===B setImmediate"));

// //实验 2：把它们放进一个 I/O 回调里（这才是重点）
// console.log("=== 实验 2 ===");

// const fs = require('node:fs');
// fs.readFile(__filename,()=>{
//     setTimeout(()=>console.log("=== 实验 2 ===A setTimeout 0"),0);
//     setImmediate(()=>console.log("=== 实验 2 ===B setImmediate"));
// });

// //实验 3：微任务 vs 宏任务（复习 9/21 那题，这次自己推）
// console.log("=== 实验 3 ===");

// console.log('1.同步');
// setTimeout(()=>{
//     console.log("=== 实验 3 ===2setTimeout");
// },0);
// Promise.resolve().then(()=>console.log("=== 实验 3 ===3then"));
// process.nextTick(()=>console.log("=== 实验 3 ===4.nextTick"));
// console.log("5.同步结束");


//实验 4.a：同步代码会不会阻塞事件循环（用数字说话）
console.log("=== 实验 4.a ===");
const t0 = Date.now();
setTimeout(()=>{
    console.log('=== 实验 4.a ===A定时器等了',Date.now()-t0,"ms");},0);
while(Date.now()-t0<300);

// 实验4.b把忙等换成 fs.readFileSync 读一个大文件效果一样，只是没这么夸张 —— 见文末附录。）

console.log("=== 实验 4.b ===");
const t1 = Date.now();
setTimeout(()=>console.log("=== 实验 4.b ===B定时器（0ms）等了",Date.now()-t1,"ms"),0);
setTimeout(()=>console.log("=== 实验 4.b ===(异步等300ms结束)"),300);
