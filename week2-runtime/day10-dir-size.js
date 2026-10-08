
// ⚠️ 记账：main() 里 --top / --json 的写法是 AI 给的（Day 10，见 notes/day10.md 的「AI 复核」）；
//    我自己重写的那一遍在 Day 11。dirSize() 全程是自己写的。
const fsp = require('node:fs/promises');
const path = require("node:path");
const {parseArgs}= require('node:util');


//统计一个目录的总大小，并生成一份报告。
//先读取当前目录的内容 raddirSync(dir,{withFileTypes:true})
//whitFileTypes要true 默认是false，就输出字符串
//为true 输出Dirent对象，因为是对象才能继续筛选它还有没有子目录
//里面


 //计算文件大小，并根据n将对象进行大小排列

 async function dirSize(dir,n=5){
    let fileCount = 0 ;
    let totalBytes = 0;
    let files = [];
    
    async function walk(crruent,ext){
         const entires = await fsp.readdir(crruent,{withFileTypes:true});
         
         
         for(const emtry of entires){
         const fullPath = path.join(crruent,emtry.name);
         const dirPath = ext? path.join(ext,emtry.name) : emtry.name;
         if(emtry.isDirectory()){
           await  walk(fullPath,dirPath);
         }else if(emtry.isFile()){
            const stats = await fsp.stat(fullPath);
            fileCount++;
            totalBytes +=  stats.size;
            files.push({path:dirPath,bytes: stats.size});
         }
         }
       
    }

    await walk(dir,'');
    const largest =files.sort((a,b)=>b.bytes-a.bytes).slice(0,n);
    
    return {fileCount,totalBytes,largest};
}



async function main(){
    const {values,positionals}=parseArgs({
        args: process.argv.slice(2),
        options:{
            top:{
                type:'string',
                default: '5',
            },
            json:{
                type:'boolean',
                default: false,
            }
        },
        allowPositionals:true 
    });

    const dir = positionals[0]||'.';
    const top = Number(values.top);

    try{
       const report = await dirSize(dir,top);
       if(values.json){
         return console.log(JSON.stringify(report,null,2));
       }
       console.log(`目录${dir}`);
       console.log(`文件的个数一共${report.fileCount},文件总大小一共${report.totalBytes}`);
       if(report.largest.length === 0){
        throw new Error('这个目录没有文件')
       }
       console.log(`最大的文件一共${report.largest.length}`);
       for(let i =0 ; i<report.largest.length ; i++){
        console.log(`文件名：${String(report.largest[i].path).padStart(8)}${report.largest[i].bytes}`);
       }
    }catch(err){
        console.error(`没有这个目录${dir}(${err.code}||${err.message})`);
        process.exitCode = 1;
    }
}


if(require.main === module) main();

module.exports = {dirSize};

 

















