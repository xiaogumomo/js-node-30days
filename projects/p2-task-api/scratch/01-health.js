

const fastify = require("fastify");




app.get('/health',async()=>{
    const app = fastify();
    return {ok:true};
})



app.get('/tasks',async()=>{
    return [];
});

app.get('/tasks/:id',(request)=>{
    return  {id: request.params.id,title:'假代码',query:request.query}; 
})


app.listen({port:process.env.PORT||3000},(err)=>{
    if(err){
        console.error(err);
        process.exit(1);
    }
    console.log(`Http://127.0.0.1:${app.server.address().port}/health`);
});












