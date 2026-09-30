

// 造大文件：20 万行 NDJSON（约 13MB）。
// 用写流造（createWriteStream + 循环 write），别一次拼个巨型字符串。
const path = require('node:path');
const fs = require("node:fs");
const {once}= require("node:events");
const {finished}= require ("node:stream/promises");
const {summarize,summarizeWhole}=require("./day11-ndjson.js");
async function createLargeNDJSON(file,totalLines=200000){
    const ws = fs.createWriteStream(file,{encoding:"utf-8"});
    
    for(let i = 0 ; i < totalLines ; i ++){
        const obj = {
            id : i ,
            name : `user_${i}`,
            age: Math.floor(Math.random()* 60)+18 ,
            email : `user${i}@example.com`,
            createAt:new Date().toISOString(),
        };
        const line =JSON.stringify(obj)+'\n';
        if(!ws.write(line)){
            await once(ws,'drain');
        }
      
    }
    ws.end();
    await finished(ws);
}
async function main(){
   const file = process.argv[2] || './big.ndjson';
   if(!fs.existsSync(file)){
    console.log("造文件中...",file);
    await createLargeNDJSON(file,200000);
   }
   

    console.log("文件大小：",(fs.statSync(file).size/1024/1024).toFixed(1),'MB');


   const messure =async (label,fn)=>{
       let peak = 0;

    const t = setInterval(()=>{peak = Math .max(peak,process.memoryUsage().heapUsed);},5);
    const before = process.memoryUsage().heapUsed;
    const r = await fn(file);
    clearInterval(t);
    const mb = (n)=> (n/1024/1024).toFixed(1);
    
    console.log(`${label}:${JSON.stringify(r)}|峰值≈${mb(peak)}MB (起跑${mb(before)}->涨${mb(peak-before)})` );  

    };

    const which = process.argv[3];
    if(which === 'stream') await messure("整读版",summarizeWhole);
    else await messure("流式版",summarize);
   }
 
main();
