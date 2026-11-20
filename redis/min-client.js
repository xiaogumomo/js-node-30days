
const Redis = require('ioredis');


const redis = new Redis ({host: '127.0.0.1',port :6379});


async function main() {

    redis.on('ready',()=>{console.log('已连接');});

    console.log(await redis.set('lab:node:counter','1'));
   
    console.log ( await redis.incr('lab:node:counter'));
    console.log ( await redis.incr('lab:node:counter'));
    console.log ( await redis.incr('lab:node:counter'));

    console.log(await redis.get('lab:node:nothing'));
    await redis.hset('lab:node:hash','a',1,'b',2,'c',3);
    console.log(await redis.hgetall('lab:node:hash'));
    await redis.quit();
};

main() .catch((e)=>{
    console.error('出错',e.message);
    process.exit(1);
});