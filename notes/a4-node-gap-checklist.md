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
✅ `keyPrefix` —— **11/23 实测，结论与旧说法相反，见文末 §六**
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

---

## 五、返回形状实测表（2026-11-22 实测，ioredis 6.0.0 / Redis 7.4.12）

> **探针**：一次性脚本 `redis/_probe-shapes.js`（跑完已删），**40 条命令 × RESP2 / RESP3 各跑一遍**。
> ⭐ **结论先行：RESP2 与 RESP3 的返回形状【完全一致】**（40/40 无差异）—— ioredis 做了归一化，**换协议不用改代码**（形状层面）。
> ⚠️ 但"订阅连接能不能发普通命令"这类**行为**差别是真的（见 §11）。

### 1 键管理
| redis-cli | Node | 实测返回 |
|---|---|---|
| `SET k v EX 100 NX` | `r.set(k,v,'EX',100,'NX')` | `"OK"`；**已存在 → `null`** |
| `EXISTS k1 k2` | `r.exists(k1,k2)` | `1`（数字计数） |
| `TYPE k` | `r.type(k)` | `"string"` |
| `TTL k` | `r.ttl(k)` | **无过期 `-1` / 不存在 `-2`** |
| `OBJECT ENCODING k` | `r.object('ENCODING',k)` | `"embstr"` |
| `MEMORY USAGE k` | `r.memory('USAGE',k)` | `64` |
| `SCAN 0 MATCH p:k* COUNT 10` | `r.scan(0,'MATCH','p:k*','COUNT',10)` | **`["12",["p:k1"]]`** ← 游标是**字符串**，`'0'` 才结束 |
| `KEYS p:k*` | `r.keys('p:k*')` | `["p:k1"]` |

### 2 字符串
| `MGET k1 nope` | `r.mget(k1,nope)` | `["hello",null]` |
| `INCR k` | `r.incr(k)` | `1`（**数字**） |
| `INCRBYFLOAT k 1.5` | `r.incrbyfloat(k,1.5)` | **`"1.5"`（字符串）** |
| `GETRANGE k 0 0` | `r.getrange(k,0,0)` | `"h"` |
| `STRLEN k` | `r.strlen(k)` | `5` |

### 3 哈希
| `HGETALL k` | `r.hgetall(k)` | **对象** `{"a":"1","b":"2"}` |
| `HMGET k a zz` | `r.hmget(k,'a','zz')` | **数组** `["1",null]` |
| `HSCAN k 0` | `r.hscan(k,0)` | `["0",["a","1","b","2"]]` ← **扁平数组，不是对象** |
| `HINCRBY` | `r.hincrby(k,f,2)` | `2`（数字） |

### 4 列表
| `LPOP k` | `r.lpop(k)` | `"a"`（字符串） |
| `LPOP k 2` | `r.lpop(k,2)` | `["a","b"]`（**数组**） |
| `LRANGE` | `r.lrange(k,0,-1)` | `["d"]` |
| `BLPOP nolist 0.1` | `r.blpop(k,0.1)` | **超时 → `null`**；成功 → `[key, value]` |
| `LMOVE a b LEFT LEFT` | `r.lmove(a,b,'LEFT','LEFT')` | `"x"` |

### 5 集合
| `SMEMBERS` | `r.smembers(k)` | `["x","z"]`（顺序不保证） |
| `SISMEMBER` | `r.sismember(k,'x')` | **`1`，不是 `true`** |
| `SMISMEMBER k x y` | `r.smismember(k,'x','y')` | `[1,0]` |
| `SINTER a b` | `r.sinter(a,b)` | `["x"]` |
| `SINTERCARD 2 a b` | `r.sintercard(2,a,b)` | `1` |

### 6 有序集合
| `ZADD k NX 10 a` | `r.zadd(k,'NX',10,'a')` | `0`（NX 且已存在） |
| `ZRANGE 0 -1 WITHSCORES` | `r.zrange(k,0,-1,'WITHSCORES')` | **`["a","10","b","20"]`** ← 扁平 + 分数是**字符串** |
| `ZRANGE 5 15 BYSCORE` | `r.zrange(k,5,15,'BYSCORE')` | `["a"]` |
| `ZRANK` / `ZSCORE` | `r.zrank(k,'a')` / `r.zscore(k,'a')` | `0` / **`"10"`** |
| `ZPOPMIN` | `r.zpopmin(k)` | `["a","10"]` |

### 7 Bitmaps / HLL / GEO
| `SETBIT k 7 1` | `r.setbit(k,7,1)` | **`0` = 原来的位值**（不是成功） |
| `GETBIT` / `BITCOUNT` | `r.getbit(k,7)` / `r.bitcount(k)` | `1` / `1` |
| `PFADD k u1 u2` | `r.pfadd(k,'u1','u2')` | `1`（**1=基数有变化**） |
| `PFCOUNT` | `r.pfcount(k)` | `2` |
| `GEOADD k 116.40 39.90 bj` | `r.geoadd(k,116.40,39.90,'bj')` | `1` |
| `GEOSEARCH ...` | `r.call('GEOSEARCH',...)`（参数太多，用 `call`） | `["bj"]` |
| `GEODIST` | `r.geodist(k,'bj','bj')` | **`"0.0000"`**（字符串） |

**四条贯穿全表的规律**：
1. **计数/位值/长度 → 数字**（`EXISTS` `STRLEN` `SISMEMBER` `SETBIT` `PFADD`）
2. **浮点数一律字符串**（`INCRBYFLOAT` `ZSCORE` `GEODIST`）
3. **`WITHSCORES` / `HSCAN` 都是扁平数组**，不是对象/嵌套
4. **`nil` → `null`，`(empty array)` → `[]`，但"参数太多别硬凑"的命令用 `r.call(...)` 照抄 CLI**

---

## 六、⭐ `keyPrefix` 的三个不对称（2026-11-23 实测，**推翻旧说法**）

> 旧说法（我写的）：「`KEYS`/`SCAN` 返回值不去前缀；`EVAL` 的 `KEYS[]` 不生效」——**前半对、后半错**。

| 场景 | 加不加前缀 | 返回的键 | 结论 |
|---|---|---|---|
| `set('pf:a')` / `get('pf:a')` | **加** | — | 正常 |
| **`keys('pf:*')` / `scan(0,'MATCH','pf:*')`** | ⚠️ **不加** | — | **匹配不到**（真键是 `p2:dev:pf:*`），返回 `[]` |
| `keys('p2:dev:pf:*')`（自己写全名） | 不再加 | ⚠️ **带前缀** | 实测 `["p2:dev:pf:a"]`，要自己 `.slice(len)` 剥 |
| **`eval(script, 1, 'pf:a')`** | ⚠️ **加** | — | 实测能取到值 |
| `eval(script, 1, 'p2:dev:pf:a')` | **又加一次** → `p2:dev:p2:dev:pf:a` | — | **拿到 `null`** |

**背这一句**：
> **`keyPrefix` 只认"数据键"：`KEYS`/`SCAN` 的 `MATCH` 模式不算键（不加），`EVAL` 的 `KEYS[]` 算键（加）。所有返回的键都带前缀，要自己剥。**

**其余选项实测（同日）**：

| 选项 | 真实行为 | 证据 |
|---|---|---|
| `maxRetriesPerRequest: 1` | 超过就抛 | `MaxRetriesPerRequestError: Reached the max retries per request limit (which is 1)` |
| `enableOfflineQueue: false` | 断线时**立刻 reject** | `Connection is closed.` |
| `commandTimeout: 60` | **客户端主动放弃**，不等服务端 | `Command timed out (69ms)`（`BLPOP 5` 只花了 69ms） |

**`XINFO` / `XAUTOCLAIM` 形状（实测，全是扁平数组）**：

```
XINFO STREAM    → ["length",2,"radix-tree-keys",1,…,"entries-added",2]
XINFO GROUPS    → [["name","g1","consumers",0,"pending",0,"last-delivered-id","0-0","entries-read",null,"lag",3]]
XINFO CONSUMERS → [["name","c1","pending",1,"idle",2,"inactive",2]]
XAUTOCLAIM      → ["0-0", [["<id>",["f","v1"]]], []]    ← 三元组：下次游标 / 认领到的 / 已删除的
```
