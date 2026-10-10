


const fastify = require("fastify");
const {DatabaseSync} =require('node:sqlite');
const crypto =require('node:crypto');
const  path =require("node:path");
const fs = require('node:fs');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-初始秘钥';
const {openDb} = require('./db.js');


function hashPassword(pw){
     //造盐 
    const salt = crypto.randomBytes(16);//造16字节随机数返还一个BUFFER二进制
    // console.log('盐 hex：',salt.toString('hex'));//64个字符

    //造哈希
    const key = crypto.scryptSync(pw,salt,32);
    // console.log("哈希 hex:",key.toString('hex'));
    
    //进数据库的一段
    
    const stored =`scrypt$${salt.toString('hex')}$${key.toString('hex')}`;

    // console.log("要存的串：",stored.slice(0,50)+'...');


    return stored ;
}
function verifyPassword(pw,stored){

    const [algo,saltHex,keyHex] = stored.split("$") ;
    
    const again =  crypto.scryptSync(pw,Buffer.from(saltHex,'hex'),32);

    if(crypto.timingSafeEqual(again,Buffer.from(keyHex,'hex'))){
        return true;
    }

    return false;
    
}


function signJwt(Payload,ttlSec = 3600){
    const b64 = (obj)=>  Buffer.from(JSON.stringify(obj)).toString('base64url');


    const header = b64 ({alg:'HS256',typ:'JWT'});
    Payload ={...Payload,exp: Math.floor(Date.now()/1000)+ttlSec} ;
   

    const payload = b64 (Payload);

    const sig = crypto.createHmac('sha256',JWT_SECRET).update(header+'.'+payload).digest('base64url');
    

    const token = `${header}.${payload}.${sig}`;

    return token ;
}

function verifyJwt(token){
    const parts = token.split('.');
    if(parts.length!== 3){
        return null ;
    }
    
    const same = (a,b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
    const want =  crypto.createHmac('sha256',JWT_SECRET).update(parts[0]+'.'+parts[1]).digest('base64url');
    try{
      let payload =  JSON.parse(Buffer.from(parts[1],'base64url').toString());
    
    if(payload.exp && Date.now()/1000>payload.exp) return null ;
    if(!same(parts[2],want)){
          return null ;

    
    }

      return payload ;
    }catch{
        return null ;
    }
}





function auth(req,reply){
    const m = /^Bearer (.+)$/.exec(req.headers.authorization|| '');//正则表达式必须以Bearer开头接空格（.+）匹配任意一个字符一次或多次
    const payload = m ? verifyJwt(m[1]):null;
    if(!payload){reply.code(401).send({error:'需要登陆'});return null ;}
    return payload ;
}

   

   

 async function buildServer(){
    const db = await openDb();
    const {createTask,findTask, listTasks,updateTask,deleteTask, createUser,findUserByEmail } = db;
     const app = fastify();


    //注册路由当有客户端用GET请求/tasks或/health路径时 让Fastify调用对应函数 发出响应
    app.get('/health',async()=>{
        return {ok:true};
    });

  
   //自定义错误 500 
    if(process.env.NODE_ENV !== 'production'){
           app.get('/boom',async()=>{
             throw new Error('boom');
           });
    }

    app.setErrorHandler(async(error,request,reply)=>{
        console.log("💥",error);
        const code =error.statusCode ?? 500 ;
        reply.status(code).send({error:code<500?'请求有问题':'服务器开小差啦'});

    });

    //钩子 HOOKs 
    app.addHook('onRequest',async(req)=>{
        console.log(`${new Date().toISOString()}${req.method}${req.url}`);
    });

    app.addHook(`onClose`,async()=>await db.close());

    
    //  ⑥ 路由

    app.get("/tasks",async(req,reply)=>{
         const me = auth(req,reply);
        if(!me) return ;
        return await listTasks(me.sub);
    });

    app.post('/tasks',async(req,reply)=>{
        const me = auth(req,reply);
        if(!me) return ;
        
        if(!req.body||typeof req.body.title !== 'string'||req.body.title.trim()===''){
         return reply.code(400).send({error:'title 必填'});
         }
        const task  = await createTask(req.body.title,req.body.done?1:0,me.sub);// .body自动解析JOSN
        return reply.code(201).send(task);//lastInsertRowid 获取刚刚插入哪一行记录的自增主键id的属性 
    });
    //块2 找表 修改表

    app.get('/tasks/:id',async(req,reply)=>{
          const me = auth(req,reply);
        if(!me) return ;
        
        const row = await findTask(Number(req.params.id),me.sub);
        if(!row)return reply.code(404).send({error:'没有这一条'});
        return row;
    });
    app.patch('/tasks/:id',async(req,reply)=>{
         const me = auth(req,reply);
        if(!me) return ;
        const id = Number(req.params.id)//req.params取出动态参数对象
        const cur = await findTask(id,me.sub);
        if(!cur) return reply.code(404).send({error:'没有这条'});
        const title =req.body.title !== undefined? req.body.title : cur.title;
        const done = req.body.done !== undefined ? (req.body.done? 1 : 0) : (cur.done? 1 : 0 );
        return await updateTask(title,done,id,me.sub);
    });
// 块3 delete路由建立

    app.delete('/tasks/:id',async(req,reply)=>{
         const me = auth(req,reply);
        if(!me) return ;
        const n = await deleteTask(Number(req.params.id),me.sub);
        if(n === 0)return reply.code(404).send({error:'没有这条'});//受影响的行数changes lastInsertRowid最后插入行的id
        return reply.code(204).send();
    })

//拼装A

//注册
app.post('/auth/register', async(req,reply)=>{
   if(!req.body.email.includes('@')|| req.body.password.length<6 ){
    return reply.code(400).send({error:'email必须有@，password必须6位以上'});
   }
   try{
   const info = await createUser(req.body.email,hashPassword(req.body.password),Date.now());
   return reply.code(201).send({id:Number(info.lastInsertRowid),email:req.body.email});

   }catch(err){
    if(err.code === '23505'){
        return reply.code(409).send({error:'和服务器当前状态冲突'});
    }

    throw err ;

   }  

});


//登陆
app.post('/auth/login',async(req,reply)=>{
    const info =await  findUserByEmail(req.body.email);
    if(info === null){
        return reply.code(401).send({error:'没有email'});
    }
    if(!verifyPassword(req.body.password,info.passwordHash)){
        return reply.code(401).send({error:'密码错误'});
    }
    const token = signJwt({sub:info.id}) ;

    return reply.code(200).send({token});   

    

})





    return app ;
 }



 async function main(){
    const app = await buildServer();
    
    app.listen({port:process.env.PORT||3000},(err)=>{
        if(err){console.log(err);process.exit(1);}
        console.log(`http://127.0.0.1:${process.env.PORT||3000}/health`);
    });

    const shutdown = async(sig)=>{
        console.log(`[shutdown]收到${sig},正在优雅退出`);
        app.server.closeAllConnections();
        await app.close();
        console.log(`[shutdown]已关闭`);
        process.exit(0);
    }


    process.on('SIGTERM',()=>{
       shutdown('SIGTERM')
        
    });
    
    process.on('SIGINT',()=>{
       shutdown('SIGINT')
    
    });

 }



 if(require.main === module)main();




module.exports = { buildServer, hashPassword, verifyPassword, signJwt, verifyJwt };




