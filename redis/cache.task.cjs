'use strict'
// ============================================================================
// REDIS-CACHE：p2 缓存层（A4 的唯一产物）—— 防穿透 / 防击穿 / 逻辑过期
// 预计 2 天（11/26 读契约 → 11/27–30 实现 + 返工）
// ----------------------------------------------------------------------------
// 【作用】
//   给 p2 的"读接口"套一层 Redis 缓存：同一份数据在 TTL 内只查一次 PG，
//   并且在没有缓存 / 缓存过期 / 数据不存在 这三种情况下【都不把 DB 打死】。
//
// 【为什么需要它】
//   p2 现在每个读请求都打 PG。第 8 章算过：20 万 key / 0.28GB。
//   按 80% 命中率算，PG 的读 QPS 能降到 20%。没有这一层，DB 就是瓶颈。
//
// 【谁调它 / 什么时候调】
//   每个读接口的 handler 里调一次 getOrLoad；写接口在写完 DB 之后调一次 invalidate。
//   ⚠️ getOrLoad 在"缓存过期"时【立刻返回旧值】、把重建丢到后台 —— 所以它一定是快的。
//
// 【交付规格】（四个函数，只写这四个）
//   serializeEntry(entry)      entry = {value, expireAt}  -> string
//   deserializeEntry(raw)      raw: string|null           -> {value, expireAt} | null
//   getOrLoad(cache, key, loader, opts?)                  -> Promise<any>
//   invalidate(cache, key)                                -> Promise<void>
//
//   opts = { ttlMs = 60000, lockTtlSec = 5, waitMs = 50, maxWaitRounds = 100 }
//     ttlMs     逻辑过期时长（不是 Redis 的 TTL！值里带 expireAt）
//     lockTtlSec 防击穿那把锁的 TTL（秒）
//     waitMs      没抢到锁时，隔多久重读一次缓存
//     maxWaitRounds 最多重读几轮；超过就自己去 loader（兜底，不许死等）
//   ⚠️ waitMs * maxWaitRounds 必须 >= lockTtlSec*1000（默认 50*100 = 5s = lockTtlSec）
//      理由：兜底只应该在"锁早该过期了、持有者已经死了"之后才开火。
//      如果兜底比锁 TTL 还早触发，等待者们会在锁还没失效时一起去查 DB ——
//      那不是兜底，是【惊群】，比不加锁更糟。
// ----------------------------------------------------------------------------
// 【允许使用的 API —— 白名单】（产物里出现名单外的调用 → 验收直接 FAIL 并给行号）
//   JS：require / module.exports / async-await / Promise / try-catch-finally / throw
//       setTimeout / console / JSON.parse / JSON.stringify / Date.now / Math.random
//       Map（get/set/has/delete）/ 数组 map-filter-forEach-push / 字符串 slice-split
//   cache 客户端：get / set / del / eval
//   set 的选项只允许：'NX' / 'EX'
//   ⚠️ 不许用：Redis.Cluster、getex/getdel、pipeline、multi、xadd 系列、
//              setInterval（本产物用懒重建 + setTimeout 兜底，不用定时器）
// ----------------------------------------------------------------------------
// 【怎么跑】
//   node redis/cache.task.cjs                   静态检查 + 契约检查 + 真连检查（全跑）
//   node redis/cache.task.cjs --check contract   只跑契约（用内存假 Redis，不连库，秒出）
//   node redis/cache.task.cjs --check real       只跑真连 127.0.0.1:6379
//
// 【已学 API 在本题的确切形状】
//   cache.get(key)                       -> Promise<string|null>
//   cache.set(key, val, 'NX', 'EX', n)   -> Promise<'OK'|null>   （NX 抢不到返回 null）
//   cache.set(key, val)                  -> Promise<'OK'>
//   cache.del(key)                       -> Promise<number>
//   cache.eval(lua, numkeys, k1, a1)     -> Promise<any>
//   Date.now()                           -> 毫秒时间戳
// ----------------------------------------------------------------------------
// 【逻辑过期 = 值里带过期时间，不靠 Redis 的 TTL】
//   写：set(key, JSON.stringify({value, expireAt}))      ← 不带 EX！
//   读：反序列化 → 比较 Date.now() 与 expireAt
//       未过期 -> 直接返回
//       已过期 -> 【立刻返回旧 value】+ 后台重建（不许等）
// ============================================================================

const SENTINEL = '__CACHE_NULL__' // 防穿透用的哨兵值：代表"DB 里确实没有"

// ---------------------------------------------------------------------------
// TODO 1：把 {value, expireAt} 变成字符串；把字符串变回对象
//   要求：deserializeEntry 遇到 null / 坏 JSON / 缺字段 一律返回 null，【不许 throw】
// ---------------------------------------------------------------------------
function serializeEntry(entry) {
  try{
     const raw = JSON.stringify(entry);
     return raw ;
  }catch(err){
    throw new Error('输入的数不合法');
  }

}
function deserializeEntry(raw) {
      try{
         const entry = JSON.parse(raw);
          if(entry === null){
            return  null ;
          }
          if(entry.value === undefined || entry.expireAt === undefined){
            return null ;
          }
            return entry ;

        }catch(err){
           return null ;
      }
}

// ---------------------------------------------------------------------------
// TODO 2：核心 —— 读缓存 / 防穿透 / 防击穿 / 逻辑过期
//   流程（必须按这个顺序，验收逐条断言）：
//     ① get(key)
//     ② 拿不到（null）或反序列化失败 -> 走【miss 路径 A】
//     ③ 反序列化出来的 value === SENTINEL -> 直接返回 null（防穿透，不调 loader）
//     ④ Date.now() <= expireAt -> 返回 value（命中）
//     ⑤ 已过期 -> 【立刻返回旧 value】，并在后台触发重建（懒重建，同一个 key 只跑一个）
//   miss 路径 A：
//     a) 抢锁：set('lock:' + key, token, 'NX', 'EX', lockTtlSec)
//     b) 抢到 -> try { v = await loader() } finally { 用 Lua 释放锁 }
//          v 为 null/undefined -> 写哨兵（防穿透），返回 null
//          否则 -> 写正常值，返回 v
//     c) 没抢到 -> 等 waitMs 再重读缓存，最多 maxWaitRounds 轮
//          等到了 -> 返回它；等不到 -> 自己 await loader()（兜底，不许死等）
//   opts = { ttlMs = 60000, lockTtlSec = 5, waitMs = 50, maxWaitRounds = 100 }
//     ttlMs     逻辑过期时长（不是 Redis 的 TTL！值里带 expireAt）
//     lockTtlSec 防击穿那把锁的 TTL（秒）
//     waitMs      没抢到锁时，隔多久重读一次缓存
//     maxWaitRounds 最多重读几轮；超过就自己去 loader（兜底，不许死等）
//   ⚠️ waitMs * maxWaitRounds 必须 >= lockTtlSec*1000（默认 50*100 = 5s = lockTtlSec）
//      理由：兜底只应该在"锁早该过期了、持有者已经死了"之后才开火。
//      如果兜底比锁 TTL 还早触发，等待者们会在锁还没失效时一起去查 DB ——
//      那不是兜底，是【惊群】，比不加锁更糟。
// ---------------------------------------------------------------------------


const rebuilds = new Map();

async function getOrLoad(cache, key, loader, opts = {}) {
  const {
    ttlMs = 60000,
    lockTtlSec = 5,
    waitMs = 50,
    maxWaitRounds = 100,
  }=opts ;
  const rebuild = async () =>{
      const v = await loader();
      await cache.set(key,serializeEntry({
      value: wrap(v),
      expireAt : Date.now() +  ttlMs 
      }));
  };
  const wrap = (v)=>( v === null ||  v === undefined ? SENTINEL : v);

  const sleep = (ms) =>new Promise((rs)=>setTimeout(rs,ms));

  const miss = async ()=>{
     const token = String(Date.now()) + ':' + Math.random();
     const lockkey = 'lock:' + key ;
     const got = await cache.set(lockkey,token,'NX','EX',lockTtlSec);
     if(got === null){
       let round = 1 ;
       while(round <= maxWaitRounds){
          await sleep(waitMs);
          const again =deserializeEntry( await cache.get(key));
          if(again !== null){  
              return again.value === SENTINEL ? null : again.value ;
          }
          round ++ ;
       }
          return await loader() ;
     }
     try{
      const v = await loader();
      if(v === null || v === undefined ){
         const got = await cache.set(key,serializeEntry({value:wrap(v),  expireAt : Date.now() +  ttlMs }),'EX',60);
         return null ;
      };
      await cache.set(key,serializeEntry({value:wrap(v),  expireAt : Date.now() +  ttlMs }))
      return v ;
      
     }finally{
      await cache.eval(
       "if redis.call('get',KEYS[1]) == ARGV[1] then redis.call('del',KEYS[1]) else return 0 end" ,1, lockkey,token);
     }
  
  }
  try{
      const raw = await cache.get(key);
      let entry ;
      try{
          entry = deserializeEntry(raw);
      }catch{
         return await miss() ;
      }
      
      if(entry === null){
          return await miss();
      }

      const value = entry.value ;
      const  expireAt = entry.expireAt ;
 
      if(value === SENTINEL){
         return  null ;
      }
      if(Date.now() <=  expireAt){
         return value ;
      }else{
          if(!rebuilds.has(key)){
            const p =rebuild();
            rebuilds.set(key,p);
            p.finally(()=>rebuilds.delete(key)).catch(()=>{});
            return value ;
          }
      }
      
  }catch(err){

        console.error('发生错误：',err.code || err.message);

  }     


}

// ---------------------------------------------------------------------------
// TODO 3：主动更新（Cache Aside 的"删"）—— 写完 DB 之后调它
// ---------------------------------------------------------------------------
async function invalidate(cache, key) {
    await cache.del(key);
    return ;
}

module.exports = { SENTINEL, serializeEntry, deserializeEntry, getOrLoad, invalidate }

// ============================================================================
// 以下为教师验收，无须修改；不要求学习其中的假 Redis、超时和检查工具。
// ============================================================================
if (require.main === module) {
  const assert = require('node:assert/strict')
  const fs = require('node:fs')
  const path = require('node:path')
  const mode = process.argv.includes('--check')
    ? process.argv[process.argv.indexOf('--check') + 1]
    : 'all'

  const results = []
  async function check(label, fn) {
    try { await fn(); results.push([true, label]); console.log(`PASS ${label}`) }
    catch (e) { results.push([false, label]); console.error(`FAIL ${label}\n     ${e.message}`) }
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  // ---- 静态白名单检查（扫源码，不看运行时） ----
  const ALLOWED_CACHE = new Set(['get', 'set', 'del', 'eval'])
  const ALLOWED_REQUIRE = new Set(['ioredis', 'node:assert/strict', 'node:fs', 'node:path', 'node:crypto'])
  const FORBIDDEN = ['setInterval', 'pipeline', 'multi', 'getex', 'getdel', 'Cluster', 'Sentinel', 'watch']

  async function staticCheck() {
    await check('S1 源码里没有白名单外的 cache 方法', async () => {
      const src = fs.readFileSync(__filename, 'utf8')
      // 只看 TODO 区（module.exports 之前）
      const body = src.split('module.exports')[0]
      const bad = []
      for (const m of body.matchAll(/\bcache\.([a-zA-Z_$][\w$]*)\s*\(/g)) {
        if (!ALLOWED_CACHE.has(m[1])) bad.push(m[1])
      }
      assert.deepEqual([...new Set(bad)], [], `用了白名单外的 cache 方法：${[...new Set(bad)].join(', ')}`)
    })
    await check('S2 源码里没有禁用 API', async () => {
      const body = fs.readFileSync(__filename, 'utf8').split('module.exports')[0]
      const hit = FORBIDDEN.filter((k) => new RegExp(`\\b${k}\\b`).test(body))
      assert.deepEqual(hit, [], `出现禁用 API：${hit.join(', ')}`)
    })
    await check('S3 require 只在白名单内', async () => {
      const body = fs.readFileSync(__filename, 'utf8').split('module.exports')[0]
      const mods = [...body.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1])
      const bad = mods.filter((m) => !ALLOWED_REQUIRE.has(m))
      assert.deepEqual(bad, [], `require 了白名单外的模块：${bad.join(', ')}`)
    })
  }

  // ---- 内存版假 Redis（只实现 get/set/del/eval，行为对齐真 Redis） ----
  function fakeCache() {
    const store = new Map()
    const calls = []
    return {
      store, calls,
      async get(k) { calls.push(['get', k]); return store.has(k) ? store.get(k) : null },
      async set(k, v, ...flags) {
        calls.push(['set', k, v, ...flags])
        const nx = flags.includes('NX')
        if (nx && store.has(k)) return null
        store.set(k, v)
        return 'OK'
      },
      async del(k) { calls.push(['del', k]); const had = store.delete(k); return had ? 1 : 0 },
      async eval(_lua, _n, k, token) {
        calls.push(['eval', k])
        if (store.get(k) === token) { store.delete(k); return 1 }
        return 0
      },
    }
  }
  const countCalls = (cache, name) => cache.calls.filter((c) => c[0] === name).length

  async function contractChecks() {
    await check('C1 serialize/deserialize 往返', async () => {
      const s = serializeEntry({ value: { a: 1 }, expireAt: 123 })
      assert.equal(typeof s, 'string')
      assert.deepEqual(deserializeEntry(s), { value: { a: 1 }, expireAt: 123 })
    })
    await check('C2 deserializeEntry(null) -> null', async () => {
      assert.equal(deserializeEntry(null), null)
    })
    await check('C3 坏数据不 throw，返回 null', async () => {
      assert.equal(deserializeEntry('not-json'), null)
      assert.equal(deserializeEntry('{"nope":1}'), null)
    })
    await check('C4 命中未过期：返回 value，且不调 loader', async () => {
      const c = fakeCache()
      c.store.set('k', serializeEntry({ value: 'v1', expireAt: Date.now() + 60000 }))
      let loaded = 0
      const got = await getOrLoad(c, 'k', async () => { loaded++; return 'db' })
      assert.equal(got, 'v1'); assert.equal(loaded, 0)
    })
    await check('C5 逻辑过期：立刻返回旧值（不等 loader）', async () => {
      const c = fakeCache()
      c.store.set('k', serializeEntry({ value: 'old', expireAt: Date.now() - 1 }))
      let loaded = 0
      const t0 = Date.now()
      const got = await getOrLoad(c, 'k', async () => { loaded++; await sleep(300); return 'new' })
      assert.equal(got, 'old', '过期时必须先返回旧值')
      assert.ok(Date.now() - t0 < 100, `不许等重建完成（花了 ${Date.now() - t0}ms）`)
      await sleep(400)
      assert.equal(loaded, 1, '后台重建应被触发一次')
    })
    await check('C6 防穿透：命中哨兵直接返回 null，不调 loader', async () => {
      const c = fakeCache()
      c.store.set('k', serializeEntry({ value: SENTINEL, expireAt: Date.now() + 60000 }))
      let loaded = 0
      const got = await getOrLoad(c, 'k', async () => { loaded++; return 'db' })
      assert.equal(got, null); assert.equal(loaded, 0)
    })
    await check('C7 miss 且抢到锁：先 NX 抢锁，再 loader，再回填', async () => {
      const c = fakeCache()
      let loaded = 0
      const got = await getOrLoad(c, 'k', async () => { loaded++; return 'fromDB' })
      assert.equal(got, 'fromDB')
      assert.equal(loaded, 1, 'miss 路径只该查一次 DB —— 别在拿到 v 之后又 rebuild() 再查一次')
      assert.equal(countCalls(c, 'set') >= 2, true, '应有抢锁 set + 回填 set')
      const filled = deserializeEntry(c.store.get('k'))
      assert.equal(filled.value, 'fromDB')
      assert.ok(
        c.calls.some((x) => x[0] === 'set' && x[1] === 'lock:k'),
        '抢锁必须用 "lock:" + key —— 锁名写错等于没有锁'
      )
      assert.equal(countCalls(c, 'eval'), 1, '锁必须被释放（用 eval）')
      assert.equal(c.store.has('lock:k'), false, '锁必须真的被删掉 —— token 传错就删不掉（会删别人的锁）')
    })
    await check('C8 loader 返回 null：写哨兵（防穿透）', async () => {
      const c = fakeCache()
      const got = await getOrLoad(c, 'k', async () => null)
      assert.equal(got, null)
      const filled = deserializeEntry(c.store.get('k'))
      assert.equal(filled.value, SENTINEL, '查不到也要缓存哨兵')
    })
    await check('C9 miss 且没抢到锁：等待后重读，不重复调 loader', async () => {
      const c = fakeCache()
      c.store.set('lock:k', 'someone-else')
      // 教师侧的定时器必须自己兜住异常：TODO 未实现时 serializeEntry 会 throw，
      // 而定时器里的 throw 逃不出 check() 的 try/catch → 会直接杀掉进程。
      setTimeout(() => {
        try { c.store.set('k', serializeEntry({ value: 'byOther', expireAt: Date.now() + 60000 })) }
        catch (e) { /* 学生还没实现，忽略 */ }
      }, 60)
      let loaded = 0
      const got = await getOrLoad(c, 'k', async () => { loaded++; return 'mine' })
      assert.equal(got, 'byOther'); assert.equal(loaded, 0)
    })
    await check('C11 等满轮数后兜底：自己调 loader 一次（不死等）', async () => {
      const c = fakeCache()
      c.store.set('lock:k', 'held-by-someone-who-died')
      let loaded = 0
      const got = await getOrLoad(c, 'k', async () => { loaded++; return 'fallback' }, { waitMs: 10, maxWaitRounds: 3 })
      assert.equal(got, 'fallback', '兜底应返回 loader 的结果')
      assert.equal(loaded, 1, '兜底必须只调一次 loader')
    })
    await check('C10 invalidate 调 del', async () => {
      const c = fakeCache()
      c.store.set('k', 'x')
      await invalidate(c, 'k')
      assert.equal(countCalls(c, 'del'), 1)
      assert.equal(c.store.has('k'), false)
    })
  }

  async function realChecks() {
    const { Redis } = require('ioredis')
    const raw = new Redis({ host: '127.0.0.1', port: 6379 })
    const k = 'task:cache:' + process.pid
    try {
      await check('R1 连上并发命令', async () => {
        assert.equal(await raw.ping(), 'PONG')
      })
      await check('R2 真命中：不打 loader', async () => {
        await raw.del(k)
        await raw.set(k, serializeEntry({ value: 'realV', expireAt: Date.now() + 60000 }))
        let loaded = 0
        const got = await getOrLoad(raw, k, async () => { loaded++; return 'db' })
        assert.equal(got, 'realV'); assert.equal(loaded, 0)
      })
      await check('R3 防穿透真生效：第二次不再打 loader', async () => {
        await raw.del(k)
        let loaded = 0
        const load = async () => { loaded++; return null }
        assert.equal(await getOrLoad(raw, k, load), null)
        assert.equal(await getOrLoad(raw, k, load), null)
        assert.equal(loaded, 1, '第二次必须命中哨兵，不再打 loader')
      })
      await check('R4 逻辑过期真生效：先返旧值，重建后变新值', async () => {
        await raw.del(k)
        await raw.set(k, serializeEntry({ value: 'stale', expireAt: Date.now() - 1 }))
        let n = 0
        const load = async () => { n++; return 'fresh' + n }
        assert.equal(await getOrLoad(raw, k, load), 'stale')
        await new Promise((r) => setTimeout(r, 200))
        const again = await getOrLoad(raw, k, load)
        assert.equal(again, 'fresh1', '后台重建应已把新值写回')
      })
      await check('R5 invalidate 之后缓存真的没了', async () => {
        await invalidate(raw, k)
        assert.equal(await raw.get(k), null)
      })
    } finally {
      await raw.del(k, 'lock:' + k)
      raw.disconnect()
    }
  }

  // ⚠️ 提前退出守卫：error 回调里写 process.exit 会把验收【无声掐断】
  let summarized = false
  process.on('exit', (code) => {
    if (!summarized) {
      console.error('\n⚠️ 验收在打印总结之前就被退出了（exit code ' + code + '）。')
      console.error('   最常见原因：某个函数里调了 process.exit。')
      process.exitCode = 1
    }
  })

  ;(async () => {
    if (mode === 'all' || mode === 'contract') { await staticCheck(); await contractChecks() }
    if (mode === 'all' || mode === 'real') await realChecks()
    const fail = results.filter(([ok]) => !ok).length
    summarized = true
    console.log(`\n—— ${results.length - fail}/${results.length} 通过 ——`)
    process.exitCode = fail ? 1 : 0
  })()
}
