

const Redis = require('ioredis');


const redis = new Redis({port:6379,host:'127.0.0.1'});

async function main(){
    console.log(await redis.del('mystream'));
    const a = await redis.xadd('mystream','*','user_id',1,'amount',1);
    console.log(a); 
    console.log(await redis.xadd('mystream','*','user_id',2,'amount',2));
    console.log(await redis.xadd('mystream','*','user_id',3,'amount',3));
    console.log(await redis.xrange('mystream','-','+'));
    try{
    console.log(await redis.xgroup('CREATE','mystream','g1',0));

    }catch(e){
        console.error(e.message);
    }
    console.log(JSON.stringify(await redis.xreadgroup('GROUP','g1','consumer_a','COUNT',1,'STREAMS','mystream','>')));
    console.log('ack前',await redis.xpending('mystream','g1'));
    console.log(await redis.xack('mystream','g1',a));
    console.log('ack后',await redis.xpending('mystream','g1'));
    console.log(await redis.xrange('mystream','-','+'));
    await redis.quit();


};

main().catch((e)=>{
    console.error(e);
    process.exit(1);
});