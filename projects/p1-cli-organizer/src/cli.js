
const path =require("node:path");
const {parseArgs} = require("node:util");
const fsp = require("node:fs/promises");
const { pipeline } = require("node:stream/promises");
const { createHash } = require('node:crypto');
const fs = require("node:fs");
const logger = require('pino')({base:undefined});

process.on('unhandledRejection', (err) => { console.error('未处理的拒绝：', err); process.exit(1); });
process.on('uncaughtException',  (err) => { console.error('未捕获的异常：', err); process.exit(1); });//这只是兜底，不是正常流程 —— 正常错误必须被 try/catch 分类处理

class MoveError extends Error{
    constructor(file,cause){
        super(`搬不动${file}`,{cause});
        this.name = 'MoveError';
        this.file = file ;
        this.code = cause?.code;
    }
}
const HINTS ={
        ENOSPC: '磁盘空间不足',
        EACCES: '没有权限', 
        EPERM: '没有权限',
        EEXIST: '目标位置被同名文件占住了',
        ENOTDIR: '目标路径被文件挡住了',
        ENOENT: '路径不存在', 
        EISDIR: '目标是目录' 
    };

const sorts = {
        images : ['.jpg','.jpeg','.png','.gif'],
        docs : ['.pdf','.docx' ,'.txt','.md'],
        videos : ['.mp4','.mov'],
    }   




function  classify(name){
  const names =path.extname(name).toLowerCase();
      
     for(const [group,members] of Object.entries(sorts)){
         if(members.includes(names)){
            return group ;
        }
    }
            return 'others' ;
}

//删除文件，忽略不存在的错误(卡住了)
async function safeUnlink(filePath){
    try{
        await fsp.unlink(filePath)
    }catch(err){
        if(err.code !== 'ENOENT')throw new MoveError(filePath,err);
    }
}

//计算文件哈希（卡住了）
function filehash(filePath){
    return  new Promise((resolve,reject)=>{
        const hash = createHash('sha256');
        const rs = fs.createReadStream(filePath);
        rs.on('error',reject);
        rs.on('data',(chunk)=>hash.update(chunk));
        rs.on('end',()=>resolve(hash.digest('hex')));
    })
}
//读流+哈希

// async function fileHash(filePath){
//     const hash = createHash('sha256');
//     await pipeline(fs.createReadStream(),hash);
//     return hash.digest('hex');
// }


//判断目标路径文件是否存在（卡住了。卡在不知道fsp.access的方法）

async function exists(p){
    try{
        await fsp.access(p);
        return true ;
    }catch(err){
        if(err.code === 'ENOENT')  {
            return false ;
            }

        throw new MoveError(filePath,err) ;
    }
}
//判断目标路径文件是否存在,存在就改名（卡住了，不知道while循环可以失败条件直接退出，直接用{neme，ext}对象形式取出parse）

async function  resolvefilePath(destdir,filePath){
    const {name, ext}= path.parse(filePath);
    let candidate = filePath ;
    let i = 1 ;
    while(await exists(path.join(destdir,candidate))){
        candidate = `${name}(${i})${ext}`;
        i++;
    }
    return path.join(destdir,candidate);
}



async function  moveOne(srcPath,destDir){//srcPath 为完整路径，destDir为目标路径 moveOne的目的是让一个文件从一个目录到另一个目录
    const srcStat  = await fsp.stat (srcPath);//看文件或者目录的元信息（人话看文件或目录的属性并存储）
    if(!srcStat.isFile()){
        throw new Error(`不是普通文件:${srcPath}`);
    }
    const fileName = path.basename(srcPath);//path.basename为看路径最后一部分的是什么
    const destPath =  await resolvefilePath(destDir,fileName);
    
    //fs.mkdir 创造一个destDir路径的目录
    await fsp.mkdir(destDir,{recursive:true});
    
    //流式复制
    await pipeline(
        fs.createReadStream(srcPath),
        fs.createWriteStream(destPath)
    )

    //校验
    const destStat = await fsp.stat(destPath);


    //校验1 比大小
    if(destStat.size!== srcStat.size){
        safeUnlink(destPath);
        new Error(`大小不一致 src =${srcStat.size}dir=${destStat.size}`);
        throw new MoveError(filePath,err) ;

    }

    //校验2 比哈希

    const [srcHash,destHash] = await Promise.all ([
         filehash(srcPath),
         filehash(destPath)
    ]);

    if(srcHash!==destHash){
        safeUnlink(destPath);
        new Error(`哈希值不相等 src:${srcHash} dest : ${destHash}`);
        throw new MoveError(filePath,err) ;
    }

    await fsp.unlink(srcPath);

    return destPath ;
    
}




async function main(){
    

    const {values,positionals}= parseArgs({
        args : process.argv.slice(2),
        options:{
            target : {
            type : "string",
             },
             apply : {
            type : "boolean",
            default : false,
            },
             verbose : {
            type : "boolean",
            default : false ,
            }},
        allowPositionals : true,
    });

    const dir = positionals[0] || '.' ;
    try{
        
        const counts  = { images:0, docs:0, videos:0, others:0 } ;

        const files  = [];
        const targetRoot = values.target || dir ;

     
    const walk =async (current,rel)=>{
        const entires = await fsp.readdir(current,{withFileTypes:true});//readdir读取目录内容的方法 name地址 withFileTypes是否为数组字符串形式返回，encoding返回文件名的编码，recursive为true时递归读取所有子目录
        
        for(const entry of entires){
            const fullPath = path.join(current,entry.name);
            const relPath = rel ? path.join(rel,entry.name) : entry.name
        

        if(entry.isDirectory()){
            if(path.resolve(targetRoot) === path.resolve(fullPath)) continue;
             await walk(fullPath,relPath);
        }else if (entry.isFile()){
          counts[classify(entry.name)] += 1;
          files.push({rel: relPath,category: classify(entry.name)});
        }


        }
    }  
    await walk(dir,'');
    let moved = 0;
    let failed = 0 ;
  
    if (values.apply){
        process.on('SIGINT',()=>{
                    console.log(`已搬 ${moved} 个、失败 ${failed} 个；正在复制的那一个不会丢（复制完成 + 校验通过才删源）`);
                    process.exit(130);
         });
        for(const f of files){
            try {
                let destDir = path.join(targetRoot,f.category);
                await moveOne(path.join(dir,f.rel),destDir);
                moved++;
                logger.info({file:f.rel,category:f.category},'搬运成功');
              
              
            }catch(err){
                failed ++ ;
                if(err instanceof MoveError){
                    const hint = HINTS[err.code]??err.message;
                    console.error(`文件出错了:${err.file}-${hint}`);
                    logger.error({err:err,file:err.file},'搬运失败');

                }else{
                    const hint  = HINTS[err.code] ?? err.message ;
                    console.error(`文件出错了：${f.rel}-${hint}`);       
                    logger.error({err:err,file:f.rel},'搬运失败');

                }
                process.exitCode = 1;
                
            }
            
        }
       
        console.log(`共 ${files.length} 个文件,共计搬了${moved}个文件，失败了${failed}个文件`);
    }

    if (values.target)  {
            console.log('目标目录：' + values.target); 
    }
    for (const f of files){
                                
      if (values.verbose){
        console.log(`  计划：${f.rel} → ${f.category}/  （${path.join(dir, f.rel)}）`);
      }
      else console.log(`  计划：${f.rel} → ${f.category}/`);
    }
    console.log(`共 ${files.length} 个文件：images ${counts.images}、docs ${counts.docs}、videos ${counts.videos}、others ${counts.others}`);
        
    }catch(err){

     
         
         const hint = HINTS[err.code] ?? err.message;   
        console.error(`源目录读取不了 ${dir} —— ${hint}`);
        process.exitCode = 1 ;
    }
}


if(require.main === module)main();
module.exports = {classify,moveOne};
