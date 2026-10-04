


const fastify = require("fastify");
const {DatabaseSync} =require('node:sqlite');

const  path =require("node:path");
const fs = require('node:fs');



 function buildServer(){
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
        reply.status(500).send({error:'服务器开小差啦'});

    });

    //钩子 HOOKs 
    app.addHook('onRequest',async(req)=>{
        console.log(`${new Date().toISOString()}${req.method}${req.url}`);
    });


    //CRUD
    //块1 取表填表
    const dbFile = process.env.DB_FILE || path.join(__dirname,'..','data','tasks.db');//__dirname该文件的目录的绝对地址
    fs .mkdirSync(path.dirname(dbFile),{recursive:true});
    const db = new DatabaseSync(dbFile);//创建SQLite 数据库连接对象,对一个文件进行管理
    db.exec(fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '001_init.sql'),'utf-8'));
    const ins = db.prepare(`INSERT INTO tasks(title,done)VALUES(?,?)`);//插入一列
    const one = db.prepare(`SELECT id , title ,done FROM tasks WHERE id = (?)`);//检索三列
    const all = db.prepare('SELECT id ,title, done FROM tasks ORDER BY id');//取出三列
    const upd = db.prepare('UPDATE tasks SET title = ? , done = ? WHERE id = ?');//修改具体值
    const toObj = (r)=>(r?{id: Number(r.id),title:r.title,done:!!r.done}:null);//!!r.done强行变为布尔值
        
    app.get("/tasks",async()=>{
       return  all.all().map(toObj);
    });

    app.post('/tasks',async(req,reply)=>{
        if(!req.body||typeof req.body.title !== 'string'||req.body.title.trim()===''){
         return reply.code(400).send({error:'title 必填'});
         }
        const info  = ins.run(req.body.title,req.body.done?1:0);// .body自动解析JOSN
        return reply.code(201).send(toObj(one.get(Number(info.lastInsertRowid))));//lastInsertRowid 获取刚刚插入哪一行记录的自增主键id的属性 
    });
    //块2 找表 修改表

    app.get('/tasks/:id',async(req,reply)=>{
        const row = one.get(Number(req.params.id));
        if(!row)return reply.code(404).send({error:'没有这一条'});
        return toObj(row);
    })
    app.patch('/tasks/:id',async(req,reply)=>{
        const id = Number(req.params.id)//req.params取出动态参数对象
        const cur = one.get(id);
        if(!cur) return reply.code(404).send({error:'没有这条'});
        const title =req.body.title !== undefined? req.body.title : cur.title;
        const done = req.body.done !== undefined ? (req.body.done? 1 : 0) : cur.done;
        
        upd.run(title,done,id);
        return toObj(one.get(id));
    });
// 块3 delete路由建立

    const del = db.prepare('DELETE FROM tasks WHERE id = ?');
    app.delete('/tasks/:id',async(req,reply)=>{
        const info = del.run(Number(req.params.id));
        if(info.changes === 0)return reply.code(404).send({error:'没有这条'});//受影响的行数changes lastInsertRowid最后插入行的id
        return reply.code(204).send();
    })


    return app ;
 }


 if(require.main === module){
    buildServer().listen({port:process.env.PORT||3000},(err)=>{
        if(err){console.log(err);process.exit(1);}
        console.log(`http://127.0.0.1:${process.env.PORT||3000}/health`);
    });
 }


 module.exports={buildServer};
