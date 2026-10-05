# Day 19 — 2026-10-05（周日）

> **状态：待填写**　｜　任务书：[`day19-auth.md`](day19-auth.md)
> **实际开始 08:25**　｜　**第 3 周 Day 3**　｜　**今天**：认证与授权（注册 / 登录 / 保护路由 / 只看自己的）
> **判据三份都已就位 + 负向验证**：`auth.test.js` **10 条** ｜ `server.test.js` **7 条**（回归）｜ `tasks-crud.test.js` **9 条**（回归）

## 今日目标

- [×] ① 开场：轮转 `p-limit`（**D+3**）+ **合上重写 `src/server.js`**（判据 7/7 现成）
- [×] ② 读 4 条编号知识点（哈希+盐 / JWT 三段 / 签名防篡改 / 404 vs 403）→ **4 行笔记**
- [×] ③ 拆块 ①：`scrypt` 哈希 + 验证（`week3-backend/day19-auth-basics.js`）
- [×] ④ 拆块 ②：手写 JWT（sign / verify；"改一个字符就验不过"）
- [×] ⑤ 拆块 ③：迁移执行器 + `db/migrations/002_users.sql`
- [×] ⑥ 拼装 A：`register` + `login`（curl 通）
- [×] ⑦ 拼装 B：5 条任务路由加鉴权 + **越权隔离**（别人的一律 404）
- [×] ⑧ 判据：**auth 10/10** + 回归 **7/7**、**9/9**
- [×] ⑨ 收尾：日志 + `node tools/sp-tasks.js today` + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `projects/p2-task-api/db/migrations/002_users.sql` | `users` 表 + `tasks` 的 `userId` 列 | ✅ |
| `projects/p2-task-api/src/server.js` | 迁移执行器 + register/login + 鉴权 + 隔离 | ✅ |
| `week3-backend/day19-auth-basics.js` | `scrypt` 哈希 + 手写 JWT 两个 demo |✅ |
| `projects/p2-task-api/test/auth.test.js` | 判据（AI 写，10 条，✅ 负向验证 10/10）| ✅ |

## 判据结果

| 判据 | 目标 | 实际 |
|---|---|---|
| `auth.test.js` | **10/10** |10/10  |
| `server.test.js`（回归）| **7/7** |  7/7 |
| `tasks-crud.test.js`（回归）| **9/9** | 9/9 |

**实测输出（贴一次真实的）**：
```
（贴三份判据的 pass / fail）
  `auth.test.js`
✔ 00 模块能被加载，并导出 buildServer 函数 (10.2977ms)
2026-10-05T09:24:25.175ZPOST/auth/register
✔ 01 注册 → 201，而且**密码没有明文落库 / 没有回给客户端** (78.0311ms)
2026-10-05T09:24:25.225ZPOST/auth/register
2026-10-05T09:24:25.266ZPOST/auth/register
✔ 02 同一个邮箱注册两次 → 409/400（不是 201、更不能 500） (78.9581ms)
2026-10-05T09:24:25.304ZPOST/auth/register
2026-10-05T09:24:25.347ZPOST/auth/login
✔ 03 登录成功 → 200 + 非空 token (81.9401ms)
2026-10-05T09:24:25.386ZPOST/auth/register
2026-10-05T09:24:25.424ZPOST/auth/login
2026-10-05T09:24:25.461ZPOST/auth/login
✔ 04 密码错 / 没这个邮箱 → 401 (78.9945ms)
2026-10-05T09:24:25.465ZGET/tasks
✔ 05 不带 token 访问 /tasks → 401 + JSON (4.3672ms)
2026-10-05T09:24:25.470ZPOST/auth/register
2026-10-05T09:24:25.510ZPOST/auth/login
2026-10-05T09:24:25.547ZGET/tasks
✔ 06 带 token 访问 /tasks → 200 + 数组 (79.3561ms)
2026-10-05T09:24:25.549ZPOST/auth/register
2026-10-05T09:24:25.587ZPOST/auth/login
2026-10-05T09:24:25.622ZPOST/auth/register
2026-10-05T09:24:25.660ZPOST/auth/login
2026-10-05T09:24:25.694ZPOST/tasks
2026-10-05T09:24:25.699ZGET/tasks
2026-10-05T09:24:25.701ZGET/tasks/1
2026-10-05T09:24:25.703ZPATCH/tasks/1
2026-10-05T09:24:25.705ZDELETE/tasks/1
✔ 07 **隔离**：A 的任务，B 看不到、也改不到（一律 404） (157.6264ms)
2026-10-05T09:24:25.707ZGET/tasks
✔ 08 乱码 / 伪造的 token → 401（不能 500） (1.8056ms)

探针（只记录，不判错）：
2026-10-05T09:24:25.709ZPOST/auth/register
2026-10-05T09:24:25.748ZPOST/auth/login
  · token 分成 3 段（标准 JWT 是 3 段：header.payload.signature）
  · token 头部：{"alg":"HS256","typ":"JWT"}（看 alg，比如 HS256）
  · users 表里那一行长这样：{"id":1,"email":"reg-1791192265145-199385@test.local","passwordHash":"scrypt$29b0dad42f0344136144a6129688176a$465960fac81be728bca4a175244464df3470bf01e334890c5d  
  · 看起来像哈希吗：像 ✓
  · 迁移目录：db/migrations
  （探针不判错：哈希算法、token 格式、列名怎么起，都是设计选择 —— 记进日志就行）

✔ P 探针：token 结构 / 库里那条哈希长什么样 / 迁移文件（只记录，不判错） (78.2326ms)

判据覆盖面：00–08 共 9 条必过 + P 探针 1 条 = 本文件 10 条 test()。
（报绿之前看一眼上面的 pass 数：大半是 skipped，那不是绿，是没跑起来。）
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 880.9487

`server.test.js`

2026-10-05T09:31:13.129ZPOST/auth/register
2026-10-05T09:31:13.180ZPOST/auth/login
✔ 00 模块能被加载，并导出 buildServer 函数 (127.1512ms)
2026-10-05T09:31:13.221ZGET/health
✔ 01 GET /health → 200 + JSON {"ok":true} (4.2233ms)
2026-10-05T09:31:13.224ZGET/tasks
✔ 02 GET /tasks → 200 + JSON 数组（今天返回空数组就行） (3.2188ms)
2026-10-05T09:31:13.228ZGET/%E8%BF%99%E4%B8%AA%E8%B7%AF%E7%94%B1%E4%B8%8D%E5%AD%98%E5%9C%A8    
✔ 03 未知路径 → 404，且**body 是 JSON**（不是 HTML 错误页） (2.8278ms)
2026-10-05T09:31:13.232ZGET/boom
💥 Error: boom
    at Object.<anonymous> (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\src\server.js:109:20)
    at preHandlerCallbackInner (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:203:24)
    at preHandlerCallback (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:168:5)    
    at validationCompleted (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:158:5)   
    at preValidationCallback (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:135:5) 
    at handler (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:105:7)
    at Object.handleRequest (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:36:5)   
    at runPreParsing (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\route.js:661:19)
    at next (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\hooks.js:236:9)
    at handleResolve (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\hooks.js:253:7)
2026-10-05T09:31:13.237ZGET/health
✔ 04 统一错误处理：/boom 抛错 → 500 + JSON，而且**进程不许崩** (8.4567ms)
✔ 05 直接运行 src/server.js 真的能起起来（读 PORT，能访问 /health） (275.6466ms)

探针（只记录，不判错）：
2026-10-05T09:31:13.517ZGET/health
  · GET /health 的响应头：{"connection":"keep-alive","content-length":"11","content-type":"application/json; charset=utf-8","date":"Mon, 05 Oct 2026 09:31:13 GMT","keep-alive":"timeout=72"} 
2026-10-05T09:31:13.520ZGET/nope
  · 404 的 content-type = application/json; charset=utf-8，body = {"message":"Route GET:/nope not found","error":"Not Found","statusCode":404}
2026-10-05T09:31:13.522ZGET/boom
💥 Error: boom
    at Object.<anonymous> (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\src\server.js:109:20)
    at preHandlerCallbackInner (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:203:24)
    at preHandlerCallback (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:168:5)    
    at validationCompleted (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:158:5)   
    at preValidationCallback (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:135:5) 
    at handler (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:105:7)
    at Object.handleRequest (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:36:5)   
    at runPreParsing (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\route.js:661:19)
    at next (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\hooks.js:236:9)
    at handleResolve (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\hooks.js:253:7)
  · 500 的 content-type = application/json; charset=utf-8，body = {"error":"服务器开小差啦"}   
2026-10-05T09:31:13.525ZGET/health
  · 一次 /health 往返耗时 ≈ 1ms
  （探针不判错：响应头里多什么字段、404 的文案怎么写，都是设计选择 —— 记进日志就行）

✔ P 探针：响应头 / 404 的 body / 启动耗时（只记录，不判错） (11.6731ms)

判据覆盖面：00–05 共 6 条必过 + P 探针 1 条 = 本文件 7 条 test()。
（报绿之前看一眼上面的 pass 数：大半是 skipped，那不是绿，是没跑起来。）
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 538.1499


`tasks-crud.test.js`

tasks-crud.test.js
2026-10-05T09:31:49.229ZPOST/auth/register
2026-10-05T09:31:49.278ZPOST/auth/login
✔ 00 模块能被加载，并导出 buildServer 函数 (125.1359ms)
2026-10-05T09:31:49.321ZPOST/tasks
✔ 01 POST /tasks → 201 + JSON，且返回非空 id (6.8532ms)
2026-10-05T09:31:49.327ZPOST/tasks
2026-10-05T09:31:49.331ZGET/tasks
✔ 02 GET /tasks → 200 + JSON 数组，且里面能找到刚创建的那条 (7.7033ms)
2026-10-05T09:31:49.335ZPOST/tasks
2026-10-05T09:31:49.342ZGET/tasks/3
2026-10-05T09:31:49.346ZGET/tasks/999999
✔ 03 GET /tasks/:id → 200 + 那条；不存在的 id → 404 + JSON (13.9843ms)
2026-10-05T09:31:49.350ZPOST/tasks
2026-10-05T09:31:49.357ZPATCH/tasks/4
2026-10-05T09:31:49.362ZGET/tasks/4
✔ 04 PATCH /tasks/:id 改字段 → 200 + 新值（再 GET 确认已落库） (15.6579ms)
2026-10-05T09:31:49.365ZPOST/tasks
2026-10-05T09:31:49.369ZDELETE/tasks/5
2026-10-05T09:31:49.374ZGET/tasks/5
✔ 05 DELETE /tasks/:id → 200/204；再 GET → 404 (12.5151ms)
✔ 06 跨进程持久化：换个进程起同一个 DB_FILE，数据还在（防"内存数组假数据库"） (823.7673ms)
2026-10-05T09:31:50.202ZPOST/tasks
✔ 07 POST /tasks 不带 title → 400/422 + JSON（校验真的生效） (2.2288ms)

探针（只记录，不判错）：
  · 建表/迁移相关文件：db/migrations
2026-10-05T09:31:50.205ZGET/tasks
  · GET /tasks 的响应头：{"content-type":"application/json; charset=utf-8"}
2026-10-05T09:31:50.208ZGET/tasks?done=true
  · GET /tasks?done=true → 200，数组 5 条（可选功能：过滤还没做也没关系，记进日志就行）        
2026-10-05T09:31:50.211ZGET/health
  · 一次 /health 往返耗时 ≈ 2ms
  （探针不判错：用什么 ORM、表怎么建、错误文案怎么写，都是设计选择 —— 记进日志就行）

✔ P 探针：建表/迁移文件 / ?done= 过滤 / 响应头 / 耗时（只记录，不判错） (10.2266ms)

判据覆盖面：00–07 共 8 条必过 + P 探针 1 条 = 本文件 9 条 test()。
（报绿之前看一眼上面的 pass 数：大半是 skipped，那不是绿，是没跑起来。）
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1227.8885


```

## ① 读的 4 行（**不抄文档**）+ 拆块记录

1. 为什么密码要"哈希 + 盐"：哈希无法反推，破解者无法通过哈希反推获得原密码
但有彩虹表和和相同密码哈希相同的问题存在。哈希仍然不安全。所以需要盐（salt）
随机生成一段数据，每个用户不同，盐不是加密只是让相同密码的哈希不同，导致彩虹表的失效
挡暴力枚举靠的是慢哈希scrypt/bcrypt 故意算的慢，反复迭代+吃内存
2. JWT 三段结构 + **签名公式（自己写一遍）**：
JWT header.payload.signature  签名公式: 签名公式：signature = HMAC-SHA256( base64url(header) + "." + base64url(payload) , 秘钥 )
3. 为什么改一个字符就验不过：因为修改一个字符对应的哈希不同，导致系统重新计算前两段哈希与签名一比对发现不匹配，取消修改 ，重算必须要秘钥
4. 越权为什么用 404 不用 403：
403会讲实话，而404只是装傻，403会明确告诉入侵者自己没有权限访问，他则会尝试用别的途径入侵，而404则是资源不存在，所以越权采用404会让入侵者分不清究竟是权限不够还是没有资源

| 拆块 | 卡在哪 / 我写了什么 |
|---|---|
| ① `scrypt` 哈希 | scrypt的具体运用crypto.randomBytes，crypto.scryptSync的运用不熟|
| ② 手写 JWT | 数值转化，从buffer到json又到对象，被绕晕了|
| ③ 迁移执行器 | 整份是ai帮我完成的，而且是简化版|

## ② 契约自查（判据照它判，先自己说一遍）

| 问题 | 我的回答 |
|---|---|
| 密码为什么不能明文入库？**哈希和加密的区别**是什么 |一旦被入侵者窃取信息，他们的账号便被随意登陆。区别在可逆性，哈希不可逆，一旦转化为哈希不能还原，即上了个指纹，上完之后不能变回数据，而加密则是上了一个锁，解锁机即还原数据 |
| token 为什么必须**验签**（不验签会怎样）| 确保没有数据没有被篡改。不验签可以让入侵者随意篡改数据，内容的真实性将无法保证|
| 为什么所有查询都要带 `AND userId = ?` |加一重保证，不经要看id也要看userID，确保每组数据的独立性 |
| 别人的任务为什么返回 **404 而不是 403** | 保密，403就是明确告诉入侵者我是没有权限，而404没有资源让入侵者不清楚到底是有资源没权限还是没资源，更加费时费力|
| `JWT_SECRET` 为什么**不能每次启动随机生成** | 秘钥必须确定，一旦修改之前签发的所有 token 全部验不过 ✗（所有用户突然被登出）；而且多进程/多实例（你的判据 06 跨进程持久化 就是"起两个进程"的场景）彼此验不过对方的 token ✓ 密钥是"能不能验签"的根，不是"能不能改数据"的根|
| 迁移为什么要记录"跑过哪些"（不记录会怎样）| 迁移文件里的语句不一定能重复执行（`ALTER TABLE ADD COLUMN` 第二次就报 duplicate）→ 不记录就会每次启动重跑 → 炸；所以要有账本（`_migrations`）记"跑过哪些"，下次跳过。类比：打卡签到表|

## ③ 复习三触点

| 触点 | 内容 | 结果 |
|---|---|---|
| ① 开场 5 分钟：轮转 | **`p-limit`**（间隔表 **D+3**）→ `node --test week2-runtime/day13-p-limit-verify.js` |8/8 |
| ② 主线前 2 分钟：讲昨天的 | 不看材料讲"10/4 最值钱的两个坑"：**`exec` vs `prepare/run` 的分工** / **未提交的事务"看得见但不落盘"** | 未做|
| ③ 收尾 3 分钟：抽考 2 条 | 从抽考池（**22 条**，`notes/week2-review.md` §三）随机抽 2 条当场答 | 未做|
| **明天开场要考的那条** | （写下来）| |

## 每格结束写一句"到点了，我停在哪"

| 时段 | 到点了，我停在哪 |
|---|---|
| 08:40–09:00 开场（轮转 + 合上重写）| 停在定义函数|
| 09:00–09:20 读 4 条 | 停在 JWT 三段结构 + **签名公式（自己写一遍）*|
| 09:20–09:50 拆块 ① `scrypt` |停在转化函数的过程，和小问题修改 |
| 09:50–10:20 拆块 ② JWT | 停在换对象的问题上了还有关于ttlSec运用|
| 10:20–10:45 拆块 ③ 迁移执行器 |全部完成但是简易版 |
| 10:45–12:30 拼装 A（register / login）|停在POST /auth/login |
| 13:20–15:30 拼装 B（鉴权 + 隔离）| 全部完成|
| 15:30–16:30 判据 + 收尾 | 停在记录到点了我停在哪|

## 记账（**三行**）

| 这一遍 | 记什么 |
|---|---|
| **AI 给的** | 	① scrypt 的 5 步示范 + Buffer.from(…,'base64url') 的「往返图」 ② JWT 的 5 步示范 + "签名≠加密 / 过期检查归 verifyJwt" 的讲解 ③ 迁移简化版的形状（PRAGMA table_info 先查再改）④ 两份回归判据改成"先注册+登录拿 token" ⑤ 三份判据（10+7+9 条）+ 负向验证|
| **我自己写的** | ① 端到端两个 demo（day19-auth-basics.js：哈希 / JWT 函数 + 4 条验收）② 002_users.sql ③ src/server.js 的 register / login / 鉴权 / 隔离（5 条路由）+ auth() 帮手 ④ 全部调试与修错|
| **AI 帮我定位的**（今天目标 **≤ 3 处**）| creatAt / uesrId×2（第 2 次变成表别名 → 越权）/ 秘钥·JWT_SECRET 的作用域 / Number(a,b) 括号 / all.run().all() / GET /tasks 少参数 / PATCH 用 req.body.userId（安全级）/ err 拼错 / ! 优先级 / payload 返回方向反了（安全级）/ JSON.stringify 双打包。原因：scrypt / JWT 都是首次上手（拆块② 133m vs 计划 30m）→ 关键是"第二遍"（明天合上重写）|

## 学会了什么

1.jwl header.payload.signature
header JSON 描述jwl什么算法签名"alg"类型"typ"
payload 放内容 claims

signature 签名 校验（哈希）防篡改
内容header +payload +秘钥


2.往外送（你在 signJwt 里做的）
  对象 {sub:1,exp:…}
      │ JSON.stringify     ← 打包
      ▼
  JSON 文本  '{"sub":1,…}'
      │ Buffer.from(文本).toString('base64url')   ← 编码（编码时**只给内容**）
      ▼
  那一段字符串  eyJzdWIiOjEsImV4cCI6…
  ══════════════════════════════════════════════
  那一段字符串  eyJzdWIiOjEsImV4cCI6…             ← parts[1] 就是它
      │ Buffer.from(段, 'base64url')              ← 解码（解码时**要给 'base64url'**）
      ▼
  二进制 <Buffer 7b 22 73 75 62 …>
      │ .toString()                              ← 按 UTF-8 读成文本
      ▼
  JSON 文本  '{"sub":1,…}'
      │ JSON.parse                               ← 开包
      ▼
  对象 {sub:1,exp:…}   ← 现在才能用 payload.exp ✓
往里收（你在 verifyJwt 里要做的）
往里收：Buffer.from(段,'base64url') → 得到二进制 → .toString() → 得到 JSON 文本 → JSON.parse() → 对象
## 卡在哪里

1.uesrId 变成表别名 → 越权

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| refresh token / 登出（计划里有，今天先不做）|补在第 4 周（10/9 之后） |
| RBAC（角色 / 权限矩阵）| 10/7 复盘时定|

## 明天第一件事

1. **10/6（周一）= 第 3 周 Day 20：测试**（测试金字塔 / 单元 vs 集成 / 测 HTTP / **测试数据库隔离策略** / 覆盖率的意义与陷阱）→ 给项目 2 的关键路径补测试
   > 计划里写的是 "Vitest / supertest" —— **本项目不加这两个依赖**：Node 内置 `node:test` + `fetch` 打真服务就够了（和现有判据同一套写法）
2. 开场：三阶法第 3 阶（**合上重写今天的 `server.js`**）+ 轮转 **`once`**（间隔表 **D+7** 到期）

## 代码/命令备忘

```powershell
# ① 复习 + 重写
node --test week2-runtime/day13-p-limit-verify.js      # 轮转 p-limit（D+3）
node --test projects/p2-task-api/test/server.test.js   # 合上重写后的验收（7/7）

# ② 今天
node week3-backend/day19-auth-basics.js                            # 两个 demo（哈希 / JWT）
node --test projects/p2-task-api/test/auth.test.js                 # 目标 10/10
node --test projects/p2-task-api/test/server.test.js               # 回归 7/7
node --test projects/p2-task-api/test/tasks-crud.test.js           # 回归 9/9

# 手工试一次（另开终端）
#   curl -X POST http://127.0.0.1:3000/auth/register -H "content-type: application/json" -d "{\"email\":\"me@x.com\",\"password\":\"123456\"}"
#   curl -X POST http://127.0.0.1:3000/auth/login    -H "content-type: application/json" -d "{\"email\":\"me@x.com\",\"password\":\"123456\"}"
#   curl http://127.0.0.1:3000/tasks                                   # 期望 401
#   curl http://127.0.0.1:3000/tasks -H "authorization: Bearer <token>" # 期望 200

# 收尾
node tools/check-md-tables.js
node tools/sp-tasks.js today
git add -A && git commit -m "day19: auth (scrypt + JWT + per-user isolation) 10/10, regressions 7/7+9/9" && git push
```


## 计划 vs 实际

总计：计划 420 分钟 / 实际 412 分钟 ✓（98% 准，比昨天的 4% 误差还稳 ✓）
但内部差异很有信息量：拆块② JWT 实际 133m（计划 30） vs 拼装 B 实际 53m（计划 130）
→ 一句结论（排期硬数据）："首次上手"的块要按 2–3 倍留时间；"拼装"在有示范之后比预估快得多 ✓

