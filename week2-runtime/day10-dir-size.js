
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
    let files = [];
    let fileCount = 0 ;
    let totalBytes = 0;
    

    async function walk(current, rel){
        const entries = await fsp.readdir(current,{withFileTypes : true});
    
        for(const entry of entries){
            const fullPath = path.join(current,entry.name);
            const relPath = rel ? path.join(rel,entry.name) : entry.name;
            
            if(entry.isDirectory()){
               await walk(fullPath,relPath);
            }else if(entry.isFile()){
                const Stats = await fsp.stat(fullPath);
                fileCount ++ ;
                totalBytes += Stats.size ;
                files.push({path:relPath,bytes: Stats.size});
            }
       }
       

    }
     await walk(dir,'');
     let largest = files.sort((a,b)=>b.bytes-a.bytes).slice(0,n);
     
     return{largest ,fileCount,totalBytes};
  
 }


 async function main(){
    const {values,positionals} =parseArgs({
        args:process.argv.slice(2),
        options:{
            top:{type:"string",default:'5'},
            json:{type:'boolean'}
        }, 
        allowPositionals:true,
    });
    const top = Number(values.top);
    const dir =  positionals[0]||'.';
    try{
        const report = await dirSize(dir,top);

        if(values.json){
            console.log(JSON.stringify(report , null ,2));
            return;
        }
        
        console.log(`目录${dir}`);
        console.log(`一共有文件${report.fileCount}个,文件大小一共${report.totalBytes}bytes`);
        if(report.largest.length === 0){
            return console.log('这个目录中没有文件');
        } 
        console.log(`一共有${report.largest.length}个最大文件`);
        for(const f of report.largest){
            console.log(`文件${String(f.bytes).padStart(8)}${f.path}`);
        }
    }catch(err){
        console.error(`文件目录不存在${dir}(${err.code}||${err.message}`);
        process.exitCode = 1 ;
    }
}


if(require.main === module) main();
module .exports= {dirSize};

 

















