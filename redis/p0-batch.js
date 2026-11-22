

'use strict'


const {Redis} = require('ioredis');


const redis =  new Redis();

function  pipeline(){
    async function main(){
    await console.log('pipeline实验开始');
    const p = redis.pipeline();
    p.set('lab:p:a',1);
    p.incr('lab:p:a');
    p.get('lab:p:no-such-key');
    console.log(await p.exec());
    redis.quit();

    
};


main().catch((err)=>{
    console.log('发生错误：',err.message);
    process.exit(1);
});

};

function multi(){
    async function main(){
        await console.log('事务实验开始');
        await redis.set('lab:m:balance',1);
        await redis.watch('lab:m:balance');
         const redis2 = new Redis();
         redis2.on('error',(err)=>{
            console.log('发生错误：',err.message);
            process.exit(1);
         })
         await redis2.incr('lab:m:balance');
         console.log(await redis.multi().decrby('lab:m:balance',10).exec());
         redis.quit(); 
         redis2.quit();
         
    };

    main().catch((err)=>{
            console.log('发生错误：',err.message);
            process.exit(1);
    });

     
}


function lua(){
    async function main(){
        redis.defineCommand('releaseLock',{
            numberOfKeys:1,
            lua:"if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end ",
        });
        await redis.set('lab:lock','my-token');
        console.log('第一次运行：',await redis.releaseLock('lab:lock','my-token'));
        console.log('第二次运行：',await redis.releaseLock('lab:lock','my-token'));

        redis.quit();

    }
    main().catch((err)=>{
            console.log('发生错误：',err.message);
            process.exit(1);
    });
}


function duplicate(){
    async function main(){
         const sub = redis.duplicate({protocol:2});
         await sub.subscribe('lab:news');
         sub.on('message',(channel,message)=>{
            console.log('频道名称：',channel);
            console.log('消息内容：',message);
         });
         await redis.publish('lab:news','Hello Redis!');
         console.log('set报错:',await sub.set('lab:error',1));
         await sub.unsubscribe();
         await sub.quit();
         redis.quit();
    }

    main().catch((err)=>{
            console.log('发生错误：',err.message);
            process.exit(1);
    });
}




//  pipeline();
//  multi();
// lua();
// duplicate();


redis.on('error',()=>{});
redis.defineCommand('foo',{
    numberOfKeys:1,
    lua:'return 1',
});
const d = redis.duplicate();
console.log('监听器数：',d.listenerCount('error'));
console.log('typeof d.foo:',typeof d.foo);
d.quit();
redis.quit();

