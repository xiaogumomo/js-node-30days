
// ⚠️ 记账：main() 里 --top / --json 的写法是 AI 给的（Day 10，见 notes/day10.md 的「AI 复核」）；
//    我自己重写的那一遍在 Day 11。dirSize() 全程是自己写的。
const fsp = require("node:fs/promises");
const path = require("node:path");

const { parseArgs } = require('node:util');

//统计一个目录的总大小，并生成一份报告。
//先读取当前目录的内容 raddirSync(dir,{withFileTypes:true})
//whitFileTypes要true 默认是false，就输出字符串
//为true 输出Dirent对象，因为是对象才能继续筛选它还有没有子目录
//里面


 //计算文件大小，并根据n将对象进行大小排列

   async function dirSize(dir,n=5){
        let totalBytes = 0;
        let files = [];
        let fileCount = 0;

        async function walk(current,rel){
        const entries = await fsp.readdir(current,{withFileTypes:true});//忘记readdir括号中第二个空中的属性
    
        for(const entry of entries){
            const fullpath = path.join(current,entry.name);//忘记Dirent对象有哪些属性了
            const relPath = rel ? path.join(rel,entry.name) : entry.name ;
            
            if(entry.isDirectory()){
                await walk(fullpath,relPath);
            }else if(entry.isFile()){
                const Stats = await fsp.stat(fullpath);
                totalBytes += Stats.size ;
                fileCount++ ;
                files.push({path:relPath,bytes : Stats.size});
            }
        }

        }

        await  walk(dir,'');
        files.sort((a,b)=>b.bytes-a.bytes);
        return {largest:files.slice(0,n),totalBytes,fileCount};
      
    }


    async function main(){
        const {values,positionals}=parseArgs({
           args: process.argv.slice(2),
           options:{
            top:{type:'string',default:'5'},
            
           },
           allowPositionals:true,
        });
            const dir = positionals[0]||'.';
            const top = Number(values.top);//忘记转化成数字了
        try{

            const report =  await dirSize(dir,top);
            //忘记先判断是否为机器人了和判断机器人后输出为什么忘了
            if(values.json){
                console.log(JSON.stringify(report,null,2));//忘记JOSN.stringify(values,replacer,space)格式
            }
            console.log(`文件目录：${dir}`);
            console.log(`一共有${report.fileCount}个文件，文件大小一共为：${report.totalBytes} bytes`);
            if(report.largest.length === 0){
                return console.log('这个目录没有文件');
            }
            console.log(`最大的文件有${report.largest.length}个`);

            for(const f of report.largest){
                 console.log(`${String(f.bytes).padStart(8)}${f.path}`);//忘记padstart的含义：目标字符串长度，如果不够用空格代替
            }

        }catch(err){
            console.log(`读不了这个文件：${dir}(${err.code}||${err.message})`);
            process.exitCode = 1;//没有正常throw err 用process.code非零代表出现错误
        }
    }

    if(require.main===module) main();
    module. exports ={dirSize};



















