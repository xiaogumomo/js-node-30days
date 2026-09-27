
const path =require("node:path");
const {parseArgs} = require("node:util");
const fsp = require("node:fs/promises");

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
         if (values.apply){
            console.error("--apply 还没实现（Day14做）");
            process.exitCode = 1 ;
            return ;
        }
    const walk =async (current,rel)=>{
        const entires = await fsp.readdir(current,{withFileTypes:true});//readdir读取目录内容的方法 name地址 withFileTypes是否为数组字符串形式返回，encoding返回文件名的编码，recursive为true时递归读取所有子目录
        
        for(const entry of entires){
            const fullPath = path.join(current,entry.name);
            const relPath = rel ? path.join(rel,entry.name) : entry.name
       
        if(entry.isDirectory()){
             await walk(fullPath,relPath);
        }else if (entry.isFile()){
          counts[classify(entry.name)] += 1;
          files.push({rel: relPath,category: classify(entry.name)});
        }


        }
    }  
    await walk(dir,'');

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
        console.error(`"读不了这个目录${dir}(${err.code}||${err.message}`);
        process.exitCode = 1 ;
    }
   
}


if(require.main === module)main();
module.exports = {classify};
