


const crypto = require('node:crypto');
const fastify = require("fastify");
const path = require("node:path");
const fs =require("node:fs");
const {DatabaseSync} = require("node:sqlite");

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-初始秘钥';


function hashPassword(pw){
    //TODO:忘记如何crypto如何造几位字节随机数了
    const salt = crypto.randomBytes(16);
    
    
    //TODO:忘记如何crypto如何造慢哈希了 32表示想要生成的字节长度
    const  key = crypto.scryptSync(pw,salt,32);


    const stored = `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;

    return stored;

    
}



function  verifyPassword(pw,stored){
    const[algo,saltHex,keyHex] = stored.split('$');
    
    const again = crypto.scryptSync(pw,Buffer.from(saltHex,'hex'),32);

    if(crypto.timingSafeEqual(again,Buffer.from(keyHex,'hex'))){
        return true ;
    }

    return false ;
}




function signJwt(Payload,ttlSec=3600){

    //TODO 忘记exp的内容了
    Payload = {...Payload,exp:Math.floor(Date.now()/1000)+ttlSec};
    //TODO 忘记b64该怎么从对象转化了

    const b64 = (obj)=>Buffer.from(JSON.stringify(obj)).toString('base64url');
    //TODO 忘记 头 header对象内容怎么定义了

    const header = b64({alg:'HS256',typ:'JWT'});
    
    //TODO 忘记怎么造Hmac对象了

    const payload = b64(Payload);
    const sig = crypto.createHmac('sha256',JWT_SECRET).update(header+'.'+payload).digest('base64url');

    const token = `${header}.${payload}.${sig}`;

    return token ;
}


function verifyJwt(token){
    const parts = token.split('.');
    if(parts.length!==3){
        return null ;
    }

    //字符串->buffer->JSON字符串形式->JSON对象形式
    const payload =JSON.parse(Buffer.from(parts[1],'base64url').toString());

    

    const same = (a,b)=>a.length === b.length && crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
    const want = crypto
    .createHmac('sha256',JWT_SECRET)
    .update(parts[0]+'.'+parts[1])
    .digest('base64url');
    if(payload.exp && Date.now()/1000 > payload.exp)return null ;
    if(!same(parts[2],want)){return null};

    return payload ;
}


//TODO auth函数不理解+不会用
function auth(req ,reply){
    const  m =/^Bearer (.+)$/.exec(req.headers.authorization||``); 
    const payload = m ? verifyJwt(m[1]):null ;
    if(!payload){reply.code(401).send({error:'需要denglu'});return null ;}
    return payload ;
}


function buildServer(){
    const app = fastify();

    app.get('/health',async()=>{
        return {ok:true};
    });
     
    //TODO 不知道如何自定义错误

    if(process.env.NODE_ENV !== 'production'){
        app.get('/boom',async()=>{
            throw new Error('boom');
        });
    }

    app.setErrorHandler(async(error,request,reply)=>{
        console.log('错误',error);
        reply.code(500).send({error:'服务器开小差了'});
    });
    
    //TODO 不知道如何建立钩子（console.log显示的具体内容）
    //onRequest 当有请求进来时执行
    app.addHook('onRequest',async(req)=>{
        console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    });

    const dbFile = process.env.DB_FILE || path.join(__dirname,'..','data','tasks.db');
    fs.mkdirSync(path.dirname(dbFile),{recursive:true});

    const  db =new DatabaseSync(dbFile);
    
    const MIG_DIR =path.join(__dirname,'..','db','migrations');
    //TODO 不知道如何迁移
    //迁移脚本：对数据库进行变更结构的脚本，迁移：按顺序执行脚本从一个版本推进到下一个版本
    for(const f of ['001_init.sql','002_users.sql']){
        db.exec(fs.readFileSync(path.join(MIG_DIR,f),'utf8'));
    }

    const 列 = db.prepare(`PRAGMA table_info(tasks)`).all().map((c)=>c.name);
    
    if(!列.includes(`userId`)) db.exec(`ALTER TABLE tasks ADD COLUMN userId INTEGER`);
    //TODO SQL的语句我没记住+不会用

    const ins =db.prepare(`INSERT INTO tasks(title,done,userId) VALUES(?,?,?)`);
    const one = db.prepare(`SELECT id,title,done FROM tasks WHERE id = (?)AND userId = (?)`);
    const all = db.prepare(`SELECT id,title,done FROM tasks WHERE userId= ? ORDER BY id`);
    const upd = db.prepare(`UPDATE tasks SET title =? ,done = ? WHERE id =? AND userId = ?`);
    const toObj = (r)=>(r?{id:Number(r.id),title:r.title,done:!!r.done}:null);
    const insertUser = db.prepare(`INSERT INTO users(email,passwordHash,createAt) VALUES (?,?,?)`);
    const userByEmail = db.prepare(`SELECT*FROM users WHERE email = (?)`);
    const del = db .prepare(`DELETE FROM tasks WHERE id =? AND userId = ?`);

   //TODO 不会造相关路由
    app.get('/tasks',async(req,reply)=>{
        const me = auth(req,reply)
        if(!me) return ;
        return all.all(me.sub).map(toObj);

    });

    app.post('/tasks',async(req,reply)=>{
         const me = auth(req,reply)
        if(!me) return ;
        
        if(!req.body||typeof req.body.title !== 'string' || req.body.title.trim()=== ''){
            return reply.code(400).send({error:'title必须填'});
        }

        const info = ins.run(req.body.title,req.body.done?1:0,me.sub);
        return reply.code(201).send(toObj(one.get(Number(info.lastInsertRowid),me.sub)));
        
    });

    app.get('/tasks/:id',async(req,reply)=>{
        const me =auth(req,reply);
        if(!me) return ;
        const row  = one.get(Number(req.params.id),me.sub);
        
        if(!row)return reply.code(404).send({error:'没有这一条'});
        return toObj(row);
    });

    app.patch('/tasks/:id',async(req,reply)=>{
        const me = auth(req,reply);
        if(!me) return ;
        const id = Number(req.params.id);
        const cur = one.get(id,me.sub);
        if(!cur)return reply.code(404).send({error:"没有这一条"});
        const title = req.body.title !== undefined ? req.body.title : cur.title ;
        const done = req.body.done !== undefined? (req.body.done?1:0) : cur.done ;
        upd.run(title,done,id,me.sub);
        return toObj(one.get(id,me.sub));
    });


    app.delete('/tasks/:id',async(req,reply)=>{
        const me = auth(req,reply);
        if(!me) return ;
        const info = del.run(Number(req.params.id),me.sub);
        if(info.changes === 0)return reply.code(404).send({error:'没有这一条'});
        return reply.code(204).send();
    })

    app.post('/auth/register',(req,reply)=>{
        if(!req.body.email.includes('@')||req.body.password.length<6){
            return reply.code(400).send({error:'email必须有@,password必须六位以上'});
        }

         try{
            const info = insertUser.run(req.body.email,hashPassword(req.body.password),Date.now());
            return reply.code(201).send({id:Number(info.lastInsertRowid),email:req.body.email});

         }catch(err){
            if(err.message.includes(`UNIQUE`)){
                return reply.code(409).send({error:'和服务器当前状态冲突'});
            
            }

            throw err ;
         }
    });



    app.post('/auth/login',(req,reply)=>{
        const info = userByEmail.get(req.body.email);
        if(info === undefined){
            return reply.code(401).send({error:'没有email'});


        }
        if(!verifyPassword(req.body.password,info.passwordHash)){
            return reply.code(401).send({error:'密码错误'});

        }

        const token =signJwt({sub:info.id});

        return reply.code(200).send({token});

    })


  
   return app;
   



}

if(require.main === module){
    buildServer().listen({port:process.env.PORT||3000},(err)=>{
        if(err){console.log(err);process.exit(1);}
        console.log(`Http://127.0.0.1:${process.env.PORT||3000}/health`);

    });


}

module. exports={buildServer};












