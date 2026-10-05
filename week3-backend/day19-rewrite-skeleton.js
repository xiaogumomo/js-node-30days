


const fastify = require('fastify');
const {DatabaseSync} = require('node:sqlite');
const path = require("node:path");
const fs =require("node:fs");


function buildServer(){
    const app = fastify();


    //1.定义dbfile 确认文件所在的地址
    const dbfile = process.env.DB_FILE || path.join(__dirname,'..','data','tasks.db');

    //2.mkdirSynce造debfile的目录

    //3.定义db SQL数据库连接对象

    const db =new DatabaseSync(filePath);

    //4.db.parpare()编译SQL ins one all upd 准备用

    const ins = db.prepare(`INSERT INTO tasks(title,done)VALUES(?,?)`);
    const one = db.prepare(`SELECT id ,title ,done FROM tasks WHERE id = (?)`);
    const toObj = (r)=>(r?{id:Number(r.id),title: r.title,done: !!r.done}:null);

    //5.app.get 注册/tasks  GET请求路由

    //6.app.post 注册/tasks POST 请求路由


    app.post("/tasks",(req,reply)=>{

           if(!req.body || typeof req.body.title !== 'string' || req.title.body.trim()=== ''){
            return reply.code(400).send({error:'title必填'});
           }
        
            const info =ins.run(req.body.title,req.body.done?1:0);
            return reply.code(201).send(toObj(one.get(Number(info.lastInsetRowid))));

        }
        
    );

    //7.app.get /tasks/:id


    //8.app.patch 注册/tasks/:id 处理patch修改请求路由

    //7.app.delete 注册/tasks/:id delete 请求路由

    //8.返回app
}

