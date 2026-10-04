
const fastify = require('fastify');



function buildServer() {
    const app =fastify();
    app.get('./ping',async()=>({pong:true}));
    return app;
}



if(require.main === module){
    buildServer().listen ({port:Number(process.env.PORT)||3000},(err)=>{
        if(err){console.error(err);process.exit(1);}
        console.log(`起来了-> http://127.0.0.1:${process.env.PORT || 3000}/ping`);

    });
}

module. exports = {buildServer};


