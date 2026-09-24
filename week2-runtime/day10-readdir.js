

const fs = require ("node:fs");
const t0 = Date.now();
setTimeout(()=>{
    console.log("定时器等了",Date.now()-t0,"ms");
},0);


//A:同步读目录（卡住事件循环）

fs.readdirSync(__dirname);
//B.异步读目录(交还控制权)
fs.readdir(__dirname,()=>{
    console.log("异步读完了",Date.now()-t0,"ms");
});

