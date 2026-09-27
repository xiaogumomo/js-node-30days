// ⚠️ 记账：本文件的流式实现是 AI 帮我一起写的（我不会独立写流式处理，只是看懂了代码在干嘛）；
//    我自己重写的那一遍在 Day 12 早上。见 notes/day11.md 的「AI 复核」。

// const fs = require("node:fs"); 
// const fsPromises = require("node:fs/promises");
// {
//   lines: 6,      // 【有内容的行】数（纯空行不算）
//   ok: 5,         // 能 JSON.parse 成功的行数
//   bad: 1,        // 有内容但 parse 失败的行数   ← 恒等于 lines - ok
//   bytes: 123     // 文件的字节数（stat.size；注意是字节不是字符）
// }


// 读一个大文件（NDJSON —— 一行一个 JSON），
// 逐行解析并统计，并且实测"整读"和"流式"的内存差别。

//整读版
// async function summarize(file){
//     const stat = await fsPromises.stat(file);
//     const bytes = stat.size;
//     const content = await fsPromises.readFile(file,"utf8");
//     const rawLines = content.split("\n");
//     let lines = 0 ;
//     let ok = 0;
//     for(const line of rawLines){//只统计有内容的行
//         if(line.trim()===''){
//             continue;
//         }
//         lines++;
    
//     try{
//         JSON.parse(line);
//         ok++;
//     }catch{

//     }
//     }
//     const bad =lines -ok;
//     return {lines,ok,bad,bytes}
// }

// async function main(){
//     try{
//     const file = process.argv[2]||'./big.ndjson';
//     const result = await summarize(file);
//     console.log(result);}
//     catch{}
// }



//流式版

// async function summarize(file){
//     const stat = await fsPromises.stat(file);
//     const bytes = stat.size; 
    
//     let lines = 0;
//     let ok = 0;
//     let leftover = '';
//     const readStream = fs.createReadStream(file,{encoding:'utf8'});
//     for await (const chunk of readStream){
//         const text =leftover +chunk ;
//         const parts = text.split('\n');
//         leftover = parts.pop();
//         for(const line of parts){
//             if(line.trim()==="")continue;
//             lines ++; 
//             try{
//                 JSON.parse(line);
//                 ok++;
//             }catch{
                
//             }

//         }
//     }
//     if (leftover.trim()!==""){
//         lines++;
//         try{
//             JSON.parse(leftover);
//             ok++
//         }catch{

//         }
//     }
//     const bad = lines - ok ;
//     return {lines,ok,bad,bytes};
// }

// async function main(){
//     try{
//     const file = process.argv[2] ||"./big.ndjson";
//     const result =await summarize(file);
//     console.log(result);
//     }catch{
//       console.log(`'读不了这个文件：'+file+'（'+(err.cod)`);
//       process.exitCode = 1;
//     }

// }



// if(require.main === module)main();
// module.exports={summarize};




//day12 重写任务



// {
//   lines: 6,      // 【有内容的行】数（纯空行不算）
//   ok: 5,         // 能 JSON.parse 成功的行数
//   bad: 1,        // 有内容但 parse 失败的行数   ← 恒等于 lines - ok
//   bytes: 123     // 文件的字节数（stat.size；注意是字节不是字符）
// }




const fs = require ("node:fs");
const fsPromises =  require("node:fs/promises");
const { Readline } = require("node:readline/promises");


// 整读版

async function summarizeWhole(file){
    const  stat = await fsPromises.stat(file);
    const  bytes = stat.size ;
    const content = await fsPromises.readFile(file,'utf-8');
    const rawlines = content.split("\n");
    let lines = 0 ;
    let ok = 0;

    for(const line of rawlines){
        if(line.trim()===""){
            continue;
        }
        lines++;
        try{
            JSON.parse(line);
            ok++;
        }catch{
            
        }
    }

    let bad =lines - ok;
    return {lines,ok,bad,bytes};
}

// async function main(){
//     try{
//         const file = process.argv[2] || './big.json';
//         const result = await summarizeWhole(file);
//         console.log(result);
//     }catch{
//         console.log(`'读不了这个文件'+file+'('(err.cod)`); 
//         process.exitCode = 1 ;
//     }
// }


// 流式版


// {
//   lines: 6,      // 【有内容的行】数（纯空行不算）
//   ok: 5,         // 能 JSON.parse 成功的行数
//   bad: 1,        // 有内容但 parse 失败的行数   ← 恒等于 lines - ok
//   bytes: 123     // 文件的字节数（stat.size；注意是字节不是字符）
// }


async function summarize(file){
    const stat  = await  fsPromises.stat(file);
    const bytes = stat.size ;
    let lines = 0 ;
    let ok = 0 ;

    let leftover = '';
    const readstream = fs.createReadStream(file,{encoding:"utf-8"});
    
    // const r1 =Readline.createReadStream({
    //     input: readstream ,
    //     crlfDelay : Infinity,
    // })
// 用Readline.createReadStream 直接实现按行读的接口
    // for await(const line of r1){
    //     if(line.trim()===""){
    //         continue;
    //     }
    //      lines++;
        
    //      try{
    //         JSON.parse(line);
    //         ok++;
    //      }catch{

    //      }
    // }
    // let bad = lines - ok ;
    // return {lines,ok,bad,bytes};
    
//用leftover自己分行
    for await (const chunk of readstream){
        const text = leftover + chunk ;
        const parts = text.split("\n");
        leftover = parts.pop();
        for (const line of parts){
            if(line.trim()===""){
                continue;
            }
            lines ++ ;
            try{
                JSON.parse(line);
                ok++;
            }catch{
                
            }
        }


    }
        if (leftover.trim() !==""){
            lines ++ ;
            try{
                JSON.parse(leftover);
                ok++;
            }catch{  
            }
        }
    let bad = lines - ok ;
    return{lines,ok,bad,bytes};
    
}

async function main(){
    try{
        const file = process.argv[2] || './big.json';
        const result = await summarize(file);
        console.log(result);
    
    }catch{
        console.log(`"读不到这个文件"+file+'('+(err.code||err.message)+')'`);
        process.exitCode = 1 ;
    }
}



if(require.main === module)main();
module.exports={summarize,summarizeWhole};





    

