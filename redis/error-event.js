



const {Redis} = require('ioredis');


const redis = new Redis({
        port: 6379,
        retryStrategy(times){
        console.log('第',times,'重连');
        return times > 5 ? null : 200 ;
        },
});
redis.on('error',(err)=>{
    console.error('redis error:',err);
});
async function main(){
    console.log(await redis.ping());
    console.log('ping 之后：',redis.status);
    console.log(await redis.quit());
    console.log('quit 之后：',redis.status);
    await new Promise(r=>setTimeout(r,100));
    console.log('等100ms后：',redis.status);
}
redis.on('end',()=>console.log('end 事件触发'));

main();

