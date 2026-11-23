
const {Redis} = require('ioredis');







function createCache(options){
    const {
        host,
        port,
        password,
        env = 'dev'| 'prod',
    }=  options ;
  
    const redis = new Redis({
      host,
      port,
      password,
     retryStrategy(times){
        if(times >= 10) return null ;
        return Math.min(times * 200 ,3000);
     },//重连策略
     maxRetriesPerRequest : 3 ,//单条命令的重试次数
     enableOfflineQueue : false ,//断线时候有命令直接报错
     keyPrefix : `p2:${env}:` //给key加前缀
    }); 

    redis.on((error)=>{
    console.error('发生错误',error.message);
    process.exit(1);

});
    return redis ;

};

async function close(redis){
    try{
       await redis.quit();//向服务区发送quit请求正常关闭
    }catch{
        redis.disconnect();//不管怎么样直接把连接强制关闭
    }
};



module.exports = { close,createCache};