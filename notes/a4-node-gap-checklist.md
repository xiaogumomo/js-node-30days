# A4 · 「Redis 学过 / Node 没写过」对照清单

> **建立于 2026-11-21**（他要求："记日志前，核对一遍关于已学过 Redis 但 Node ioredis 还没有接触的地方"）
> **用途**：A4 全程 90% 时间在 `redis-cli` 里，Node 侧只写了约 20 个命令。这份表把缺口一次列清，**防"以为会了"**。
> **判据**：每一项补完 = ① `redis-cli` 写法 ② Node 写法 ③ **返回形状实测** ④ 一句"坑在哪"。**四条缺一不算。**

---

## 一、已经覆盖的（✓ 约 20 个命令）

| 来源 | 已给 Node 写法 |
|---|---|
| 11/20 最小客户端 | `set` `get` `incr` `hset` `hgetall` `del` `quit` |
| 11/20 Stream 全流程 | `xadd` `xgroup` `xreadgroup` `xack` `xpending` `xrange` `xtrim` |
| 11/20 连接层 | 4 种连接写法 / `(nil)→null` / 错误抛异常 / 返回形状 3 条 + `XPENDING` 特例 |
| 11/21 持久化 | `config()` `bgsave()` `bgrewriteaof()` `lastsave()` `info()` `save()` |
| 11/21 连接层（B） | `error`/`ready`/`end`/`reconnecting` 事件、`status` 六态、`retryStrategy`、`quit`/`disconnect`、6 个选项表 |

**覆盖比例：约 20 / 400+ 个命令 ≈ 5%。**

---

## 二、缺口（⬜ 按讲义分节）

### 1. 键管理与全局（2.1 / 2.7）
`KEYS` `SCAN` `DBSIZE` `EXISTS` `DEL` `UNLINK` `EXPIRE` `TTL` `PERSIST` `TYPE` `RENAME` `RANDOMKEY` `TOUCH` `SELECT` `FLUSHDB` `FLUSHALL` `OBJECT ENCODING` `MEMORY USAGE` `SWAPDB`

| 坑 | 说明 |
|---|---|
| **`SCAN` 游标循环** | 返回 **`[cursor, keys]`**，`cursor` 是**字符串**，`'0'` 才结束。⚠️ 待实测 |
| **`OBJECT ENCODING`** | 不是 `objectEncoding()`，是 **`redis.object('ENCODING', key)`** |
| **`MEMORY USAGE`** | 是 **`redis.memory('USAGE', key)`** |
| **`SELECT`** | ⚠️ **不要手敲**，用构造参数 `{ db: 2 }`。手敲在连接池里会串库 |

### 2. 字符串（2.2）
`SET` `GET` `MSET` `MGET` `INCR` `DECR` `DECRBY` `INCRBYFLOAT` `APPEND` `STRLEN` `SETRANGE` `GETRANGE` `SET NX/EX/PX/GET` `GETDEL` `GETEX`

| 坑 | 说明 |
|---|---|
| **`GET` 返回字符串，`INCR` 返回数字** | 已给（11/20） |
| **`MGET` 不存在的 key 返回 `null`** | 不是 `undefined`、也不是空串 |
| **`SET k v NX` 在 Node 里** | `redis.set(k, v, 'NX')`；带过期 `redis.set(k, v, 'EX', 10, 'NX')` |

### 3. 哈希（2.3）
`HSET` `HGET` `HMGET` `HGETALL` `HDEL` `HLEN` `HEXISTS` `HKEYS` `HVALS` `HINCRBY` `HSETNX` `HSCAN`

| 坑 | 说明 |
|---|---|
| **`HGETALL` 返回对象，`HMGET` 返回数组** | `{ a: '1' }` vs `['1', null]` |
| **`HSCAN` 返回扁平数组** | `[cursor, [f1, v1, f2, v2]]`，**不是对象**。⚠️ 待实测 |

### 4. 列表（2.4）+ 队列（1.4）
`RPUSH` `LPUSH` `LPOP` `RPOP` `LRANGE` `LINDEX` `LLEN` `LTRIM` `LINSERT` `LREM` `BLPOP` `BRPOP` `LMOVE` `BLMOVE`

| 坑 | 说明 |
|---|---|
| **`LPOP key 2` 带 count → 返回数组** | 不带 count → 返回字符串 |
| **`BLPOP` 返回 `[key, value]`** | **不是只有 value**；超时返回 **`null`** |
| **阻塞命令占住整条连接** | 生产里必须 `duplicate()` 一条专用连接 |
| **`BLMOVE` 参数顺序** | `BLMOVE src dst LEFT LEFT timeout`（含 timeout 在最后） |

### 5. 集合（2.5）
`SADD` `SREM` `SCARD` `SISMEMBER` `SMISMEMBER` `SMEMBERS` `SPOP` `SRANDMEMBER` `SINTER` `SUNION` `SDIFF` `SINTERSTORE` `SINTERCARD`

| 坑 | 说明 |
|---|---|
| **`SMEMBERS` 顺序不保证** | 不要依赖返回顺序 |

### 6. 有序集合（2.6）
`ZADD` `ZSCORE` `ZINCRBY` `ZCARD` `ZCOUNT` `ZRANGE`(`BYSCORE`/`REV`/`BYLEX`) `ZRANK` `ZREM` `ZREMRANGEBYSCORE` `ZPOPMIN` `ZINTERSTORE` `ZUNIONSTORE`

| 坑 | 说明 |
|---|---|
| ⭐ **`WITHSCORES` 返回扁平数组** | `[m1, s1, m2, s2]`，**分数是字符串**（`'85'`） |
| **`ZADD` 的 `NX/XX/GT/LT/CH/INCR`** | 全是位置参数：`redis.zadd(k, 'NX', score, member)` |
| **`ZRANGE ... BYSCORE`** | 位置参数照抄 `redis-cli`：`redis.zrange(k, min, max, 'BYSCORE', 'LIMIT', 0, 2)` |

### 7. Bitmaps / HLL / GEO（3.5 / 3.6 / 3.8）
`SETBIT` `GETBIT` `BITCOUNT` `BITOP` `BITPOS` `PFADD` `PFCOUNT` `PFMERGE` `GEOADD` `GEOPOS` `GEODIST` `GEOSEARCH`

| 坑 | 说明 |
|---|---|
| **`SETBIT` 返回旧位值** | 数字 0/1，不是"成功" |
| **`BITOP AND dest s1 s2`** | 目标 key 在前，源在后 |
| ⭐ **`GEOSEARCH` 参数极多** | `FROMMEMBER`/`FROMLONLAT` + `BYRADIUS`/`BYBOX` + `ASC`/`DESC` + `COUNT` —— 最容易写错的一个 |

### 8. 慢查询（3.1）
`SLOWLOG GET/LEN/RESET` → `redis.slowlog('GET', 10)`
`slowlog-log-slower-than` → `redis.config('SET', 'slowlog-log-slower-than', 1000)`

### 9. Pipeline（3.3）★ **P0**
```js
const p = redis.pipeline();
p.set('a', 1).incr('b').get('c');
const res = await p.exec();     // 返回 [[err, result], [err, result], ...]
```

| 坑 | 说明 |
|---|---|
| ⭐ **`exec()` 不 throw** | 返回的每一项是 `[err, result]`，**要自己检查 `err`** |
| **和 `redis-cli -P 100` 的关系** | 11/18 实测 23 倍收益 → Node 里就是 `pipeline()` 一次往返 |

### 10. 事务与 Lua（3.4）★ **P0**
```js
const results = await redis.multi().set('a', 1).incr('b').exec();
await redis.watch('k');           // 乐观锁
const r = await redis.multi().set('k', 'v').exec();   // 被改过 → 返回 null
await redis.eval(script, 1, 'key', 'arg');
redis.defineCommand('mycmd', { numberOfKeys: 1, lua: '...' });
```

| 坑 | 说明 |
|---|---|
| ⭐ **`exec()` 返回 `null` = 被 `WATCH` 打断** | **不是空数组**，判空要写 `if (res === null)` |
| ⭐ **`WATCH` 必须和 `MULTI` 同一条连接** | 连接池里会失效 |
| **`multi().exec()` 的每项也是 `[err, result]`** | 对应"事务不回滚、只跳过那一条" |

### 11. 发布订阅（3.7）★ **P0**
```js
const sub = redis.duplicate();
await sub.subscribe('ch');
sub.on('message', (channel, message) => {});
sub.on('pmessage', (pattern, channel, message) => {});   // ← 三个参数
```

| 坑 | 说明 |
|---|---|
| ⭐ **订阅后连接进入 `subscriber` 模式** | **不能再发普通命令** → 必须 `duplicate()` |
| **`pmessage` 是 3 个参数** | `(pattern, channel, message)`，`message` 是第 3 个 |

### 12. Stream（4.1）—— 基本 ✓，缺两个
- ⬜ `XINFO STREAM` / `XINFO GROUPS` / `XINFO CONSUMERS`（看积压、看消费者）
- ⬜ `XAUTOCLAIM`（7.0，替代手写 `XPENDING` + `XCLAIM` 两段）

### 13. 持久化（第 5 章）—— ✅ 11/21 已覆盖

### 14. 连接层选项 —— 讲了，**没实操**
⬜ `maxRetriesPerRequest`（超了抛 `MaxRetriesPerRequestError`）
⬜ `enableOfflineQueue: false`（断线时命令立即 reject）
⬜ `keyPrefix`（对 `KEYS`/`SCAN` 返回值不去前缀；对 `EVAL` 的 KEYS 不生效）
⬜ `commandTimeout`（单条命令超时）

### 15. 更后面
⬜ `Redis.Cluster` / `Redis.Sentinel`（第 10 / 9 章之后）
⬜ `autoPipelining`（ioredis 6 的新特性，自动把并发的命令打包）
⬜ `Script` 类（`REDIS_SCRIPT` 封装，比 `defineCommand` 更细的控制）

---

## 三、优先级（明天怎么排）

| 级 | 内容 | 时间 | 为什么 |
|---|---|---|---|
| **P0** | **Pipeline + `multi()`/`watch()` + `eval()` + `subscribe()`+`duplicate()`** | 45′ | 四块全是"**学过命令但从没写过代码**"，而且 **11/29 缓存层全要用** |
| **P1** | **按节对照表 1–7** + 返回形状逐个实测 | 45′ | 这是他 11/20 要的"同一份笔记记两边" |
| **P2** | 连接层选项实操（`maxRetriesPerRequest`/`enableOfflineQueue`/`keyPrefix`）+ `XINFO`/`XAUTOCLAIM` | 30′ | 生产客户端必备 |
| **P3** | `Cluster` / `Sentinel` / `autoPipelining` | 排后 | 等第 9/10 章 |

---

## 四、怎么核（方法 > 结论）

1. **`node_modules/ioredis/built/*.d.ts`** —— 官方类型定义，**最可信**。
   例：`transaction.d.ts` 里才有 `pipeline()`/`multi()` 的签名（它们是 mixin 挂到原型上的，不在 `Redis.d.ts` → **别以为没有**）。
2. **实测**：`console.log(JSON.stringify(await redis.xxx(...)))` —— 他 11/20 自己发明的办法，对付嵌套返回最有效。
3. **规则（写给我的）**：凡是"**返回形状**"的表，**每一项都必须带"已实测"标记**，不许凭记忆写。
