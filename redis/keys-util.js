

const {Redis} = require('ioredis');




// scanAll —— 不只是"扫键"
// | 项 | 内容 |
// | --- | --- |
// | 作用 | 把"符合某个模式的所有键"取回来，并且不阻塞 Redis |
// | 为什么不能直接用 KEYS | KEYS 是 O(N) 全表扫 + 单线程阻塞 —— 线上几百万键时一条 KEYS 能让 Redis 卡几百毫秒（第 7 章「内在原因」第一条）。SCAN 分批，每次只扫一点 |
// | 为什么要剥前缀 | 多环境共用一台 Redis 时 keyPrefix 是隔离手段；但业务代码只认 cache:1，不认 p2:dev:cache:1 |
// | 谁调它 | 11/29 缓存层的两处：① 缓存预热（启动时扫一遍热点）② 批量失效（某类数据改了，把这批缓存删掉） |
// | 什么时候调 | 低频运维动作（上线预热 / 手动清缓存）。绝不能在请求路径里调 —— 扫全库再快也是 O(N) |


/**
 * @param redis        带 keyPrefix 的客户端
 * @param matchPattern 【全名】模式（如 'p2:dev:cache:*'）——
 *                     keyPrefix 不会替你补，因为 SCAN 的 MATCH 不算键
 * @returns 已剥掉 keyPrefix 的键数组
 */



async function scanAll(redis,matchPattern,{count = 100} = {}){
    let result = await redis.scan('0',`MATCH`,matchPattern,`COUNT`,count);
    let strings = [] ;
    strings =strings.concat(result[1]);
    
    while(Number(result[0]) !== 0){
        result = await redis.scan(result[0],`MATCH`, matchPattern,'COUNT',count);
        strings = strings.concat(result[1]);
    };
    for(let i = 0 ; i < strings.length ; i ++){
         strings[i] = strings[i].slice(redis.options.keyPrefix.length)
    }
    
    return strings ;
}

// groupLag —— MQ 的"体温计"
// 项	内容
// 作用	读出每个消费组的积压情况，供监控/告警
// 为什么必须有它	11/20 那套 MQ 里，"消费者挂了"没有任何信号 —— 消息卡在 PEL 里没人知道。lag 是唯一能早期发现的指标
// 谁调它	监控进程定时（比如每 10 秒）调一次，超阈值告警
// 代价	O(组数)，非常便宜。但它是"读"，不要放进请求路径做实时判断
/**
 * @param streamKey 【短名】（如 'mq'）—— XINFO 的键会被自动加前缀，
 *                  传全名会变成 p2:dev:p2:dev:mq
 * @returns [{ group, lag, pending }]
 */

async function groupLag(redis,streamKey){
    const groups =await redis.xinfo('GROUPS',streamKey);
    
    const result = [];
    for(let group of groups){
        const pairs = [];
        for(let i = 0 ; i < group.length ; i+=2){
            pairs .push([group[i],group[i+1]]);
        }
        const obj = Object.fromEntries(pairs);
        const name = obj.name ;
        const lag = obj.lag;
        const pending = obj.pending ;

        result.push({group:name,lag,pending});
        
    };

    return result ;

    
}

module.exports = {groupLag,scanAll};