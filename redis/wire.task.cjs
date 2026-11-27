'use strict'
// ============================================================================
// REDIS-WIRE：把缓存接进"读/写入口"—— 隔离 / 影响面 / 定向失效
// 预计 35–45 分钟。这是 `cache.task.cjs` 之后的第二块，练的是"接线"不是"缓存本身"。
// ----------------------------------------------------------------------------
// 【作用】
//   缓存模块写对了，**接错了照样出事**：串数据（A 读到 B 的）、失效漏（读到旧值）、
//   失效过度（把别人的缓存放倒）。这一步练的就是这三个错怎么避免。
//
// 【为什么需要它】
//   `getOrLoad` 完全信任调用方传的 key。**key 起错 = 串数据，而且不报错。**
//   所以"key 怎么起"和"写完之后失效哪些 key"必须成为下意识动作。
//
// 【谁调它 / 什么时候调】
//   HTTP handler 调：读接口 → listTasks / getTask；写接口 → updateTaskTitle。
//   一个请求调一次，不循环调。
//
// 【交付规格】（只写这三个，其余不改）
//   listTasks(env, userId)                    -> Promise<Task[]>
//   getTask(env, userId, taskId)              -> Promise<Task|null>
//   updateTaskTitle(env, userId, taskId, title) -> Promise<Task|null>
//
//   env = { cache, db }（教师提供；db 是内存表，cache 是真 ioredis）
//   Task = { id, userId, title }
//
// 【三条硬要求】
//   1. **key 必须带 userId** —— 列表和详情都要。否则 A 的缓存会被 B 命中（串数据）。
//   2. **详情还必须校验归属** —— `db.getById(taskId)` 拿到的是"任何人的"任务，
//      必须比对 `task.userId === userId`，不匹配返回 null。**key 带 userId 只是第一道**。
//   4. ⭐ **所有 key 必须以 `wire:` 开头**（测试用独立命名空间）。
//      理由：验收脚本只能安全地清 `wire:*`；你的 key 若混进 `p2:*` 或 `lab:*`，
//      就会污染别的实验数据，也会让两次运行结果不一样（判据互相污染）。
//   3. **写完要定向失效**：只失效"这个用户的列表"和"这个任务的详情"，
//      **不许** 用 `keys()` 全扫、不许 `flushdb`、不许失效别人的 key。
//
// 【已学 API 的确切形状】
//   await getOrLoad(cache, key, loader, opts)   // loader: () => Promise<any>
//   await invalidate(cache, key)
//   env.db.listByUser(userId) -> Promise<Task[]>
//   env.db.getById(taskId)    -> Promise<Task|null>     // ⚠️ 不校验归属，任何人的都能拿到
//   env.db.updateTitle(taskId, title) -> Promise<Task|null>
// ============================================================================

const { getOrLoad, invalidate, SENTINEL } = require('./cache.task.cjs')





// TODO 1：列表（读入口）
async function listTasks(env, userId) {
   const {cache,db} =env ;
   const key = 'wire:list:' + userId ;
   const loader = ()=> db.listByUser(userId) ;
   return   getOrLoad(cache,key,loader);
}

// TODO 2：详情（读入口）—— 注意两条：key 带 userId + loader 里校验归属
async function getTask(env, userId, taskId) {
  const {cache,db} = env ;
  const key = 'wire:task:'+ userId + ':' + taskId ;
  const loader = async() => {
     const task = await db.getById(taskId);
     if(task === null ||task.userId !==  userId  ){
          return null ;
     }
     return task ;
  };
  return  getOrLoad(cache,key,loader) ;
}

// TODO 3：改标题（写入口）—— 改完 db，**定向**失效
async function updateTaskTitle(env, userId, taskId, title) {
    const {cache,db} = env ;
    const task = await db.getById(taskId);
    if(!task  || task.userId !== userId){
      return null ;
    }
    const update = await db.updateTitle(taskId,title);
    const listkey = 'wire:list:' +userId ;
    const taskkey = 'wire:task:'+userId +':' +taskId ;

    await invalidate(cache,listkey);
    await invalidate(cache,taskkey);
    return update ;

}

module.exports = { listTasks, getTask, updateTaskTitle }

// ============================================================================
// 以下为教师验收，无须修改。
// ============================================================================
if (require.main === module) {
  const assert = require('node:assert/strict')
  const { Redis } = require('ioredis')

  const results = []
  async function check(label, fn) {
    try { await fn(); results.push([true, label]); console.log(`PASS ${label}`) }
    catch (e) { results.push([false, label]); console.error(`FAIL ${label}\n     ${e.message}`) }
  }

  // 内存版 DB（每次新建，互不影响）
  function makeDb() {
    const rows = [
      { id: 't1', userId: 'u1', title: 'u1 的周报' },
      { id: 't2', userId: 'u1', title: 'u1 的牛奶' },
      { id: 't3', userId: 'u2', title: 'u2 的秘密任务' },
    ]
    let calls = 0
    return {
      rows,
      get calls() { return calls },
      api: {
        async listByUser(userId) {
          calls++
          return rows.filter((t) => t.userId === userId).map((t) => ({ ...t }))
        },
        async getById(taskId) {
          calls++
          const t = rows.find((x) => x.id === taskId)
          return t ? { ...t } : null
        },
        async updateTitle(taskId, title) {
          calls++
          const t = rows.find((x) => x.id === taskId)
          if (!t) return null
          t.title = title
          return { ...t }
        },
      },
    }
  }

  ;(async () => {
    const cache = new Redis({ host: '127.0.0.1', port: 6379 })
    if (cache.status !== 'ready') await new Promise((r) => cache.once('ready', r))
    const cleanup = async () => {
      const keys = await cache.keys('wire:*')
      if (keys.length) await cache.del(...keys)
    }

    await check('W1 列表命中：第二次不打 DB', async () => {
      await cleanup()
      const d = makeDb()
      const env = { cache, db: d.api }
      const a = await listTasks(env, 'u1')
      assert.equal(a.length, 2)
      const before = d.calls
      const b = await listTasks(env, 'u1')
      assert.equal(
        Array.isArray(b) ? b.length : String(b).slice(0, 20),
        2,
        `第二次返回的不是 Task[]（类型 ${typeof b}，内容 ${String(b).slice(0, 30)}）—— 常见原因：手写缓存时没序列化/少 await`
      )
      assert.equal(d.calls, before, `第二次又打了 DB（calls ${before} → ${d.calls}）—— 没命中缓存`)
    })

    await check('W2 跨用户隔离：u1/u2 各查各的', async () => {
      await cleanup()
      const d = makeDb()
      const env = { cache, db: d.api }
      const a = await listTasks(env, 'u1')
      const b = await listTasks(env, 'u2')
      assert.deepEqual(a.map((t) => t.id).sort(), ['t1', 't2'])
      assert.deepEqual(b.map((t) => t.id), ['t3'])
    })

    await check('W3 详情防串：u2 拿 u1 的 taskId 必须拿不到', async () => {
      await cleanup()
      const d = makeDb()
      const env = { cache, db: d.api }
      const own = await getTask(env, 'u1', 't1')
      assert.ok(own && own.title === 'u1 的周报', 'u1 应该能拿到自己的 t1')
      const stolen = await getTask(env, 'u2', 't1')
      assert.equal(stolen, null, '⚠️ 串数据！u2 拿到了 u1 的任务')
    })

    await check('W4 u2 的空结果不许覆盖 u1 的缓存', async () => {
      await cleanup()
      const d = makeDb()
      const env = { cache, db: d.api }
      await getTask(env, 'u1', 't1')                 // 让 u1 的缓存是热的
      await getTask(env, 'u2', 't1')                 // u2 查同 id（应得 null）
      const again = await getTask(env, 'u1', 't1')
      assert.ok(
        again && again.title === 'u1 的周报',
        again === null
          ? '读回来是 null —— 常见原因：loader 里忘了 return（返回 undefined 会被当成"查不到"）'
          : again && typeof again === 'string'
            ? `读回来是字符串 ${JSON.stringify(again)} —— 说明你 set 的时候没序列化`
            : 'u1 的缓存内容不对（被 u2 的请求覆盖，或格式错）'
      )
    })

    await check('W5 写后列表失效：改标题能看到新值', async () => {
      await cleanup()
      const d = makeDb()
      const env = { cache, db: d.api }
      await listTasks(env, 'u1')
      await updateTaskTitle(env, 'u1', 't1', '改过的标题')
      const after = await listTasks(env, 'u1')
      const t1 = after.find((t) => t.id === 't1')
      assert.equal(t1.title, '改过的标题', '列表还是旧值 —— 写后没失效列表')
    })

    await check('W6 写后详情失效：详情能看到新值', async () => {
      await cleanup()
      const d = makeDb()
      const env = { cache, db: d.api }
      await getTask(env, 'u1', 't1')
      await updateTaskTitle(env, 'u1', 't1', '第二次改')
      const again = await getTask(env, 'u1', 't1')
      assert.equal(again.title, '第二次改', '详情还是旧值 —— 写后没失效详情')
    })

    await check('W7 失效不过度：改 u1 不该放倒 u2 的缓存', async () => {
      await cleanup()
      const d = makeDb()
      const env = { cache, db: d.api }
      await getTask(env, 'u2', 't3')                 // u2 缓存热起来
      await updateTaskTitle(env, 'u1', 't1', '只改 u1')
      const afterWrite = d.calls                     // 写操作自己会打一次 DB，从这之后算
      await getTask(env, 'u2', 't3')                 // 应命中，不打 DB
      assert.equal(d.calls, afterWrite, '改 u1 把 u2 的缓存也放倒了 —— 失效范围过大')
    })

    await check('W9 跨用户写必须被拒，且 DB 不许被改（含正向对照）', async () => {
      await cleanup()
      const d = makeDb()
      const env = { cache, db: d.api }
      // ① 正向对照：u1 改自己的必须【成功】—— 否则"拒绝"没有意义（什么都不做也能过负向）
      const ok = await updateTaskTitle(env, 'u1', 't1', 'u1 自己改的')
      assert.ok(ok && ok.title === 'u1 自己改的', '正向对照失败：u1 改自己的任务都没成功')
      // ② 负向：u2 改 u1 的必须被拒，且数据不许再变
      const r = await updateTaskTitle(env, 'u2', 't1', 'u2 想改 u1 的')
      assert.equal(r, null, 'u2 改 u1 的任务应该返回 null')
      const row = d.rows.find((t) => t.id === 't1')
      assert.equal(row.title, 'u1 自己改的', '⚠️ 被拒之前就动了数据（或正向那次没改成）')
    })

    await check('W8 不许全库操作（静态检查）', async () => {
      const fs = require('node:fs')
      const src = fs.readFileSync(__filename, 'utf8')
      // 只扫【学生实现的三个函数】，并剔掉注释（否则说明文字里的词会误报）
      const region = src.slice(src.indexOf("require('./cache.task.cjs')"), src.indexOf('module.exports'))
      const code = region.replace(/\/\/.*$/gm, '')
      const banned = ['.keys(', '.flushdb', '.flushall', '.scan(']
      const hit = banned.filter((k) => code.includes(k))
      assert.deepEqual(hit, [], `产物里出现全库操作：${hit.join(', ')}`)
      assert.ok(code.includes('wire:'), '所有 key 必须以 `wire:` 开头（测试隔离，见硬要求 4）')
    })

    await cleanup()
    cache.disconnect()
    const fail = results.filter(([ok]) => !ok).length
    console.log(`\n—— ${results.length - fail}/${results.length} 通过 ——`)
    process.exitCode = fail ? 1 : 0
  })()
}
