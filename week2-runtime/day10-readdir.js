// day10小实验（未完善）

// const fs = require ("node:fs");
// const t0 = Date.now();
// setTimeout(()=>{
//     console.log("定时器等了",Date.now()-t0,"ms");
// },0);


// //A:同步读目录（卡住事件循环）

// fs.readdirSync(__dirname);
// //B.异步读目录(交还控制权)
// fs.readdir(__dirname,()=>{
//     console.log("异步读完了",Date.now()-t0,"ms");
// });


//day11: 补做 Day 10 的 ④ 小实验


const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const N = 100 ;
const FILE_COUNT =3000 ;

const big = fs.mkdtempSync(path.join(os.tmpdir(),"readdir-redo-"));
for(let i = 0;i<FILE_COUNT;i++)fs.writeFileSync(path.join(big,"f"+i+".txt"),"x");
console.log(`造的目录：${FILE_COUNT}个文件；同步/异步各读${N}遍`);
console.log(`预测 A 同步=  100  ms      B 异步=  1ms`);


//A:同步版
{
const t0 =Date.now();
setTimeout(()=>console.log(`A同步:定时器等了${Date.now()-t0}ms`),0);
for(let i=0;i<N;i++)fs.readdirSync(big);
console.log(`(A的同步循环本身花了${Date.now()-t0} ms`);
}
// B:异步版
setTimeout(()=>{
    const t0 =Date.now();
   setTimeout(()=>{console.log(`（B异步：定时器等了${Date.now()-t0}ms）`),0});
   (async()=>{
    for(let i = 0 ; i<N;i++)await fs.promises.readdir(big);
    console.log(`（B的异步循环总共花了${Date.now()-t0}ms）`)
   fs.rmSync(big,{recursive:true,force:true});
   })();
},400);

// 造的目录：3000个文件；同步/异步各读20遍
// 预测 A 同步=  20  ms      B 异步=  1ms
// (A的同步循环本身花了17 ms
// A同步:定时器等了18ms
// （B异步：定时器等了2ms）
// （B的异步循环总共花了22ms）



// 造的目录：3000个文件；同步/异步各读100遍
// 预测 A 同步=  100  ms      B 异步=  1ms
// (A的同步循环本身花了84 ms
// A同步:定时器等了84ms
// （B异步：定时器等了1ms）
// （B的异步循环总共花了98ms）


// **2. 如果第 3 周的 API 服务在请求处理里用了 `readdirSync`，会发生什么**：









