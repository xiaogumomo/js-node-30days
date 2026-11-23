'use strict'
// ============================================================================
// REDIS-C1：缓存客户端工厂 —— 连接 / 前缀 / 重连 / 错误 / 优雅关闭
// 预计 40–50 分钟。这是 **p2 缓存层（11/29 产物）的第一块真实组件**，不是练习题。
// ----------------------------------------------------------------------------
// 【今天之前已经学过什么】（这些不再考）
//   · ioredis 四种连接写法；`on('error')` 必须早于任何 await
//   · `retryStrategy(times)`：返回数字 = 等多少毫秒再试；返回 null = 放弃并触发 'end'
//   · `maxRetriesPerRequest` = 单条命令最多重试几次（默认 20）
//   · `enableOfflineQueue` = 断线时命令排队(true) 还是立刻报错(false)
//   · `redis.status` 六态；`quit()` 优雅关；`disconnect()` 立刻断
// 【本题新增的责任】（今天要学的）
//   把上面这些【零散的选项】组装成一个 **别人可以直接调用的工厂**，
//   并且让三条失败路径可控：连不上 / 命令失败 / 关闭时挂住。
// ----------------------------------------------------------------------------
// 【官方来源】ioredis 6.0.0  https://github.com/redis/ioredis/tree/v6.0.0#connect
//   本机版本：ioredis 6.0.0 / Redis 7.4.12 / 默认 protocol:3
// ----------------------------------------------------------------------------
// 【怎么跑】
//   node redis/cache-conn.task.cjs                    契约 + 真连，两项都跑
//   node redis/cache-conn.task.cjs --check contract    只验契约（不连真库，秒出结果）
//   node redis/cache-conn.task.cjs --check real        只真连 127.0.0.1:6379
// ----------------------------------------------------------------------------
// 【参数与资源归属】
//   createCache(options)  options = {host, port, password?, env}
//     env：'dev' | 'prod'，**必填**，没有默认值（缺了就 throw，不要静默兜底）
//     返回：一个 **已经 new 好的 ioredis 实例**（不是 Promise！函数不需要 async）
//   close(redis)  接收 createCache 的返回值；成功后 redis.status === 'end'
//
//   连接对象由 createCache 创建，也就由 close 负责关闭；调用方不碰底层。
// ----------------------------------------------------------------------------
// 【交付：只实现下面两个函数，其余一律不改】
// ----------------------------------------------------------------------------
// 【已学 API 在本题的确切形状】
//   new Redis(options) -> 实例（同步构造；连接是异步建立的，不必 await）
//   redis.options      -> 归一化后的配置对象（可以直接断言 keyPrefix / maxRetriesPerRequest）
//   redis.listenerCount('error') -> 当前 'error' 事件挂了多少个监听器（整数）
//   redis.status       -> 'wait'|'connecting'|'connect'|'ready'|'close'|'reconnecting'|'end'
//   await redis.ping() -> 'PONG'
//   await redis.quit() -> 'OK'（socket 真正关闭后才变 status='end'，那一刻是之后的 tick）
// ----------------------------------------------------------------------------
// 【五条硬要求】（每条都要在代码上方写一行注释说明"为什么"）
//   1. `on('error')` 必须在 `new Redis(...)` 之后【立刻】注册，早于任何 await；
//      回调里 **不要 process.exit** —— 缓存层连不上要降级，不能把整个服务带走。
//   2. retryStrategy(times)：第 n 次等 `Math.min(n * 100, 500)` 毫秒；
//      **times >= 10 时返回 null**（放弃重连）。
//   3. `maxRetriesPerRequest: 3`（**不是默认的 20**：一个请求卡 20 次重连等于卡死）。
//   4. `enableOfflineQueue: false`（断线时立刻报错，而不是排队等下辈子）。
//   5. `keyPrefix: 'p2:' + env + ':'`（**末尾要冒号**；并且注释里写明：
//      `KEYS`/`SCAN` 的返回值【不会】自动去掉这个前缀）。
// ----------------------------------------------------------------------------
// 【具体输入 → 输出】（契约检查就是按这个断言的）
//   createCache({host:'127.0.0.1', port:6379, env:'dev'})
//     -> 实例；instance.options.keyPrefix === 'p2:dev:'
//        instance.options.maxRetriesPerRequest === 3
//        instance.options.enableOfflineQueue === false
//        instance.listenerCount('error') >= 1
//        instance.options.retryStrategy(1) === 100
//        instance.options.retryStrategy(4) === 400
//        instance.options.retryStrategy(9) === 500     // 封顶
//        instance.options.retryStrategy(10) === null   // 放弃
//   createCache({host:'127.0.0.1', port:6379})        // 缺 env
//     -> throw（消息里要有 env 这个词）
//   set 一个 key 之后，用【没有前缀】的裸客户端能 GET 到 'p2:dev:' + key
// ============================================================================

const { Redis } = require('ioredis')

// TODO 1：实现 createCache
function createCache(options) {
      const {
        host,
        port,
        password,
        env ,
      }=  options ;

    if(env === undefined){
       throw Error('缺env');
    }
  
    const redis = new Redis({
      host,
      port,
      password,
     retryStrategy(times){
        if(times >= 10) return null ;
        return Math.min(times * 100, 500);
     },//重连策略
     maxRetriesPerRequest : 3 ,//单条命令的重试次数
     enableOfflineQueue : false,//断线时候有命令直接报错
     keyPrefix : `p2:${env}:` //给key加前缀
    }); 

    redis.on('error',(error)=>{
    console.error('发生错误',error.code ||error.message);
    });
    return redis ;
}

// TODO 2：实现 close
async function close(redis) {
     try{
       await redis.quit();//向服务区发送quit请求正常关闭
    }catch{
        redis.disconnect();//不管怎么样直接把连接强制关闭
    }
}

module.exports = { createCache, close }

// ============================================================================
// 以下为教师验收，无须修改；不要求学习其中的连接配置、超时和测试工具。
// ============================================================================
if (require.main === module) {
  const assert = require('node:assert/strict')
  const mode = process.argv.includes('--check')
    ? process.argv[process.argv.indexOf('--check') + 1]
    : 'all'

  const results = []
  async function check(label, fn) {
    try {
      await fn()
      results.push([true, label])
      console.log(`PASS ${label}`)
    } catch (e) {
      results.push([false, label])
      console.error(`FAIL ${label}\n     ${e.message}`)
    }
  }
  const withTimeout = (p, ms, hint) =>
    Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error(hint || `超时 ${ms}ms`)), ms).unref()),
    ])

  const waitReady = async (r) => {
    if (r.status === 'ready') return
    await withTimeout(
      new Promise((res) => r.once('ready', res)),
      4000,
      `等不到 ready（当前 status=${r.status}）。注意：enableOfflineQueue:false 时，连接没 ready 就发命令会立刻报 "Stream isn't writeable"`
    )
  }

  async function contractChecks() {
    await check('C1 createCache 同步返回实例（不是 Promise）', async () => {
      const r = createCache({ host: '127.0.0.1', port: 6399, env: 'dev' })
      try {
        assert.equal(typeof r.then, 'undefined', '返回了 Promise —— createCache 不该是 async')
        assert.equal(typeof r.get, 'function', '返回的不是 ioredis 实例')
      } finally { r.disconnect() }
    })

    await check('C2 keyPrefix 是 p2:dev:（末尾冒号）', async () => {
      const r = createCache({ host: '127.0.0.1', port: 6399, env: 'dev' })
      try { assert.equal(r.options.keyPrefix, 'p2:dev:') } finally { r.disconnect() }
    })

    await check('C3 maxRetriesPerRequest=3 且 enableOfflineQueue=false', async () => {
      const r = createCache({ host: '127.0.0.1', port: 6399, env: 'prod' })
      try {
        assert.equal(r.options.maxRetriesPerRequest, 3)
        assert.equal(r.options.enableOfflineQueue, false)
      } finally { r.disconnect() }
    })

    await check('C4 error 监听器已注册（listenerCount >= 1）', async () => {
      const r = createCache({ host: '127.0.0.1', port: 6399, env: 'dev' })
      try {
        assert.ok(r.listenerCount('error') >= 1, `listenerCount('error') = ${r.listenerCount('error')}`)
      } finally { r.disconnect() }
    })

    await check('C5 retryStrategy：1→100 / 4→400 / 9→500 / 10→null', async () => {
      const r = createCache({ host: '127.0.0.1', port: 6399, env: 'dev' })
      try {
        const f = r.options.retryStrategy
        assert.equal(typeof f, 'function', 'retryStrategy 没生效（选项名拼错了？）')
        assert.equal(f(1), 100)
        assert.equal(f(4), 400)
        assert.equal(f(9), 500)
        assert.equal(f(10), null)
      } finally { r.disconnect() }
    })

    await check('C6 缺 env 时 throw（且消息里有 env）', async () => {
      assert.throws(
        () => createCache({ host: '127.0.0.1', port: 6399 }),
        (e) => /env/i.test(e.message)
      )
    })

    await check('C7 连不上时进程不退出（listen 到 error 且没 process.exit）', async () => {
      const r = createCache({ host: '127.0.0.1', port: 6399, env: 'dev' })
      let got = 0
      r.on('error', () => { got++ })
      await new Promise((res) => setTimeout(res, 800).unref())
      assert.ok(got >= 1, '没收到 error 事件（也许回调里 process.exit 了？）')
      r.disconnect()
    })
  }

  async function realChecks() {
    let r
    await check('R1 连上并 ping 通', async () => {
      r = createCache({ host: '127.0.0.1', port: 6379, env: 'dev' })
      await waitReady(r)
      const pong = await withTimeout(r.ping(), 4000, 'ping 超时，检查 Redis 是否在 6379')
      assert.equal(pong, 'PONG')
    })

    await check('R2 keyPrefix 真的生效（裸客户端能看到 p2:dev: 前缀）', async () => {
      await waitReady(r)
      const raw = new Redis({ host: '127.0.0.1', port: 6379 })
      const probe = 'task:' + process.pid
      try {
        await r.set(probe, 'v1')
        const viaPrefix = await raw.get('p2:dev:' + probe)
        assert.equal(viaPrefix, 'v1', '前缀没生效，或末尾少了冒号')
        await raw.del('p2:dev:' + probe)
      } finally { raw.disconnect() }
    })

    await check('R3 close 之后 status 变成 end', async () => {
      await close(r)
      await withTimeout(
        (async () => {
          while (r.status !== 'end') await new Promise((res) => setTimeout(res, 20))
        })(),
        3000,
        `close 之后 status 一直是 ${r.status}`
      )
    })
  }

  // ⚠️ 提前退出守卫：如果你在 error 回调里写了 process.exit，验收会被【无声掐断】——
  //    看不到 FAIL、也看不到总结行。这个守卫把"无声"变成"有声"。
  let summarized = false
  process.on('exit', (code) => {
    if (!summarized) {
      console.error('\n⚠️ 验收在打印总结之前就被退出了（exit code ' + code + '）。')
      console.error('   最常见原因：createCache 的 error 回调里写了 process.exit。')
      console.error('   缓存层连不上必须【降级】，不能让整个进程退出 —— 改成 console.error 即可。')
      process.exitCode = 1
    }
  })

  ;(async () => {
    if (mode === 'all' || mode === 'contract') await contractChecks()
    if (mode === 'all' || mode === 'real') await realChecks()
    const fail = results.filter(([ok]) => !ok).length
    summarized = true
    console.log(`\n—— ${results.length - fail}/${results.length} 通过 ——`)
    process.exitCode = fail ? 1 : 0
  })()
}
