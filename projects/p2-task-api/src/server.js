


const fastify = require("fastify");

const app = fastify();


 function buildServer(){

    //注册路由当有客户端用GET请求/tasks或/health路径时 让Fastify调用对应函数 发出响应
    app.get('/health',async()=>{
        return {ok:true};
    });

    app.get('/tasks',async()=>{
        return [];
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
    

    

    return app ;
 }


 if(require.main === module){
    buildServer().listen({port:process.env.PORT||3000},(err)=>{
        if(err){console.log(err);process.exit(1);}
        console.log(`http://127.0.0.1:${process.env.PORT||3000}/health`);
    });
 }


 module.exports={buildServer};
