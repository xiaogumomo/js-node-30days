
// ⚠️ 记账：main() 里 --top / --json 的写法是 AI 给的（Day 10，见 notes/day10.md 的「AI 复核」）；
//    我自己重写的那一遍在 Day 11。dirSize() 全程是自己写的。
const fsp = require("node:fs/promises");
const path = require("node:path");
const {stat} = require("node:fs/promises");
const { parseArgs } = require('node:util');
//统计一个目录的总大小，并生成一份报告。
//先读取当前目录的内容 raddirSync(dir,{withFileTypes:true})
//whitFileTypes要true 默认是false，就输出字符串
//为true 输出Dirent对象，因为是对象才能继续筛选它还有没有子目录
//里面




async function dirSize(dir,n=5){
  
    const files = [];
    let totalBytes = 0;
    let fileCount = 0;
    async function walk(current, rel){
    const entries =  await fsp.readdir(current,{ withFileTypes :true });//读取当前一层目录内容
    for(const entry of entries){
        const fullPath = path .join(current,entry.name);
        const  relPath = rel ?path.join(rel,entry.name) :entry.name;
        
        if(entry.isDirectory()){
            await walk(fullPath, relPath);
        }else if(entry.isFile()){
            const stats =await stat(fullPath);
            totalBytes  += stats.size ;
            fileCount ++ ;
            files.push({path:relPath ,bytes: stats.size});
        }
    }
    }  
    await walk(dir,"");
    files.sort((a,b)=>b.bytes-a.bytes);
    return {largest:files.slice(0,n),totalBytes,fileCount};
}


// async function main(){
//     const {values,positionals}=parseArgs({
//         args:process.argv.slice(2),
//         options:{n:{type:"string",default:"5"}},
//         allowPositionals: true,
//     });
//     const dir = positionals[0]||".";
//     try{
//         const list =await dirSize(dir,Number(values.n));
//         if(list.largest.length===0) console.log("(这个目录里没有文件)");
       
//         console.log("总大小:"+list.totalBytes +"字节,文件数："+list.fileCount);
//          for (const f of list.largest){
//             console.log(String(f.bytes).padStart(8),f.path);
//         }
//     }catch(err){
//         process.exitCode = 1;
//         console.log("读不了这个目录"+ dir + '(' + (err.code||err.message)+")") ;
//     }
// }


//怎么用0到5排序呢？
// const total = await scan(__dirname);
// const top5 =total.fules.sort((a,b)=>b.size-a.size).slice(0,5);



async function main() {
  const { values, positionals } = parseArgs({
    // ① 只把"用户写的那些"交给它（前两个是 node 和脚本自己）
    args: process.argv.slice(2),
    // ② 每个选项三样东西：名字、type（只能是 string / boolean）、default
    options: {
      top:  { type: 'string',  default: '5' },    // 命令行：--top=3 或 --top 3
      json: { type: 'boolean', default: false },  // 命令行：--json（布尔选项：写了就是 true）
    },
    // ③ 目录是【位置参数】—— 不写这句，默认会被当成"非法参数"抛错
    allowPositionals: true,
  });

  const dir = positionals[0] || '.';
  const top = Number(values.top); // ④ string 类型拿到的永远是字符串，自己转数字

  try {
    const report = await dirSize(dir, top);

    // ⑤ 输出分两条路：机器读的走 JSON，人读的走下面那套  
    if (values.json) {
      console.log(JSON.stringify(report, null, 2)); // json 模式只打 JSON，一句人话都别混进去
      return;
    }

    console.log(`目录：${dir}`);
    console.log(`总大小：${report.totalBytes} 字节（${report.fileCount} 个文件）`);
    if (report.largest.length === 0) {
      console.log('（这个目录里没有文件）');
      return;
    }
    console.log(`最大的 ${report.largest.length} 个：`);
    for (const f of report.largest) {
      console.log(`  ${String(f.bytes).padStart(8)}  ${f.path}`);
    }
  } catch (err) {
    console.error(`读不了这个目录：${dir}（${err.code || err.message}）`);
    process.exitCode = 1;
  }
}

if (require.main === module)main();
module.exports ={dirSize};


















