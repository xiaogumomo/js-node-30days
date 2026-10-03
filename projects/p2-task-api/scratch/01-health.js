

const fastify = require('fastify');

const app = fastify();

app.get('/health',async()=>{
    return {ok:true};
});

app.listen({port:Number(process.env.PORT)||3000},(err)=>{
    if(err){
        console.error(err);
        process.exit(1);
    }
console.log(`起来了->http://127.0.0.1:${app.server.address().port}/health`);

});



app.get("/tasks",async()=>{
    return [];
});


app.get('/tasks/:id',async(req)=>{
    return{id:req.params.id,title:'假数据',query:req.query};
});














