# Day 18 — 2026-10-03（周六）

> **状态：待填写**　｜　任务书：[`day18-database.md`](day18-database.md)
> **假期第 4 天（8h+）**　｜　**第 3 周 Day 2**　｜　**今天两块**：上午补**昨天顺延的 Day 17 下午**（项目 2 骨架 → 7/7）；下午 **Day 18 数据库与 ORM**
> **接昨天**：10/2 完成第 2 周复盘的 **2a**（四份闭卷重写全绿 —— `dirSize` **10/10**、`fetch` **8/8**、`p-limit` **8/8**、你自写判据的 `parseArgs` **3/3**）+ 轮转 `curry` **6/6**；顺延到今天 = **Day 17 下午** + **2c 的 ④ 阅读 / 无权限实测**。

## 今日目标

- [ ] ① **Day 17 下午补完**：项目 2 骨架（`buildServer` + `/health` + `/tasks` + `/boom` + 404 JSON）→ 判据 **7/7**
- [ ] ② 包管理：`pnpm init --init-type commonjs` + `start`/`test` + `pnpm add fastify`
- [ ] ③ **Day 18 学 + 手写**：四个 SQL 实验（建表 / 事务 / 索引 / Postgres 差异）
- [ ] ④ **Day 18 做**：`tasks` 表 + CRUD（`node:sqlite`）→ 判据 `tasks-crud.test.js` **9/9**
- [ ] ⑤ 迁移/建表 SQL 进 git（`db/migrations/001_init.sql`）
- [ ] ⑥ （能做就做）Prisma 起步：用 `schema.prisma` 描述同一张表
- [ ] ⑦ （顺延的 2c）④ 阅读 + 无权限实测 —— **砍单时最先砍它们**
- [ ] ⑧ 日志 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `projects/p2-task-api/src/server.js` | 骨架 + CRUD（Day 17 + Day 18 两段）| ⬜ |
| `projects/p2-task-api/package.json` | `pnpm init --init-type commonjs` + scripts + `fastify` | ⬜ |
| `projects/p2-task-api/db/migrations/001_init.sql` | 建表 SQL（进 git）| ⬜ |
| `week3-backend/day18-sql-basics.js` | 四个 SQL 实验 | ⬜ |
| `projects/p2-task-api/test/server.test.js` | 判据（AI 写，✅ 就位；**10/3 已改成框架无关**）| ✅ |
| `projects/p2-task-api/test/tasks-crud.test.js` | 判据（AI 写，✅ 就位 + 负向验证：假库 `06` 红 / 真库 9/9）| ✅ |

---

## ① 补 Day 17 下午（项目 2 骨架 → 7/7）

| 项 | 记录 |
|---|---|
| 我选了哪个框架 + **为什么** | |
| ① 起服务 + `/health` 卡在哪 | |
| ② 路由 + 参数卡在哪 | |
| ③ 钩子（请求日志）卡在哪 | |
| ④ 统一错误处理（`setErrorHandler` + 404 JSON）卡在哪 | |
| `buildServer()` 为什么"不许自己 listen"（我的理解）| |
| `/boom` 为什么只注册在非 production | |
| 404 为什么必须是 JSON（不是 HTML）| |
| **判据结果**（目标 7/7）| |
| **最卡的一处** | |

**实测输出**：
```
（贴 node --test projects/p2-task-api/test/server.test.js 的结果）
```

## ② Day 18 学 + 手写：四个 SQL 实验（`week3-backend/day18-sql-basics.js`）

| # | 实验 | 我的预期 | 实际 | 记下的"为什么" |
|---|---|---|---|---|
| 1 | 建表（主键/NOT NULL/DEFAULT）+ 插 3 行 + 查出来 | | | |
| 2 | 事务：两条 `INSERT` 中间故意抛错 → `ROLLBACK` | | | |
| 3 | 索引：1 万行，建索引**前 / 后**两个耗时 | 前 ____ ms | 后 ____ ms | |
| 4 | Postgres vs SQLite 的 3 处差异（4 行笔记）| | | |

## ③ Day 18 做：`tasks` 表 + CRUD（判据 9/9）

| 项 | 记录 |
|---|---|
| `DB_FILE` 为什么要在 `buildServer()` **被调用时**读 | |
| 建表 SQL 为什么放文件、不硬编码在 js 里 | |
| 主键 / `NOT NULL` / `DEFAULT` 各挡掉一种什么坏数据 | |
| `PATCH` 之后为什么要**再 GET 一次**才算证明"落库了" | |
| **判据结果**（目标 9/9）| |
| **最卡的一处** | |

**实测输出**：
```
（贴 node --test projects/p2-task-api/test/tasks-crud.test.js 的结果；
  再贴一次 node src/server.js 起来后手工 POST /tasks 再 GET /tasks 的输出）
```

## ④ 复习三触点

| 触点 | 内容 | 结果 |
|---|---|---|
| ① 开场 5 分钟：轮转 | 今天轮到 **`dirSize`**（间隔表 **D+1** → **合上重写**）→ `node --test week2-runtime/day10-dir-size-verify.js` | |
| ② 主线前 2 分钟：讲昨天的 | 不看材料讲"10/2 那两个坑"：**拼错的选项静默失效** / **工具函数 `catch` 不重抛 = 吞错** | |
| ③ 收尾 3 分钟：抽考 2 条 | 从新抽考池（21 条，见 `notes/week2-review.md` §三）随机抽 2 条当场答 | |
| **明天开场要考的那条** | （写下来）| |

---

## 记账（**两面都记**）

| 这一遍 | 记什么 |
|---|---|
| **哪部分是 AI 给的** |这 4 行的形状（fastify() / app.get(路径, handler) / return 对象 / listen({port}, cb)） |
| **我自己写了哪几块** | |

---

## 学会了什么

1. const fastify = require('fastify')({logger:true});创造一个Fastify实例

2. fastify.get(path,[options],handler)
fastify.get(路径，可选配置对象，处理函数); 
可配置对象的是属性
options:{
    schema   请求验证和响应序列化
    preHandler 处理函数前执行
    onRequest 请求前（更早的钩子）
    preValidation 验证前钩子
    preSerialization 序列化前的钩子
    onsend   发送响应前的钩子
    onResponse 响应发送后的钩子
    config 自定义配置可通过request.routeOptions.config读取
    logLevel 配置等级
    exposeHeadRoutes GET是否自动生成HEAD路由，默认true
    constraints 路由约束 如version、host
}

3. fastify.listen(options,[callback]);
fastify.listen(options.(err,address)=>{
  
})端口占用权限不足等 会传入err address 启动成功返回address地址字符串
options:{
  port 监听端口  
  host 监听主机地址  'localhost' '0.0.0.0' '::' 
  backlog  TCP连接等待队列的最大长度
  exclusive  是否独占端口，用于 cluster 模式
  ipv60nly 	是否仅监听 IPv6
  path  Unix socket 路径，如 /tmp/app.sock
  listenTextResolve  自定义启动日志文本
}

4. fastify.register(plugin,[options]);  

plugin 插件 可以是函数或者模块
以插件函数签名 module.exports = function(fastify,options,done);
以async函数作为插件则不需要done回调函数

options:{
  prefix 为插件内注册的所有路由添加统一前缀
  logLevel 设置该插件内所有路由的日志级别
  logSerializers 设置该插件内日志的自定义序列化器
}
核心特性：封装(Encapsulation)
每次调用 register()，Fastify 都会创建一个新的作用域（scope）
在插件内通过 fastify.decorate() 添加的属性，不会影响父级作用域，只对当前插件及其子插件可见。

5. Routing：定义应用的端点
速记声明：fastify.get('/path', handler)、fastify.post(...)

完整声明 fastify.route(options)适合需要配置多个选项（如 schema、hooks）的复杂路由。

6.fastify.route(options) 是 Fastify 注册路由的底层完整写法

配置的属性有
method HTTP 方法，如 'GET'、'POST'，也可以是数组。
url 路由路径，别名 path
schema 核心特性，用于请求和响应的验证与序列化。以定义 body、querystring、params、response 等部分的 JSON Schema，这能带来 10-20% 的性能提升。
handler：请求处理函数。

7. URL 参数与通配符
命名参数 :参数名 定义 /example/:userId 通过request.params获取
Hooks（钩子） 你能在应用或请求/响应生命周期的特定时刻插入自定义逻辑
是实现认证、日志、数据转换等功能的强大工具。

8. fastify.addHook('hookName', handler)注册钩子
Hooks是请求生命周期或应用生命周期中插入的自定义逻辑
生命周期是http清秀进入Fastify到最终把响应发出。这中间经历的固定阶段序列
钩子就是能在这种固定的流水线前后中插入自己的代码


9. Fastify 的错误处理遵循“全有或全无”的原则
返回一个通用的 500 Internal Server Error 响应
setErrorHandler 是自定义错误处理的核心，用于设置一个在任何地方发生错误时都会被调用的函数。
fastify.setErrorHandler(function (error, request, reply) {
  // 在这里处理错误
})
Fastify 的错误处理器是完全封装的
如果你在某个插件内部调用 setErrorHandler，那么它只会对该插件及其子插件上下文中的路由生效
当多个错误处理器存在时，错误会被路由到错误封装上下文中最近（最具体）的那个处理器。
reply.send(data) 的行为
错误处理器中调用 reply.send 与在普通路由处理器中一样，会触发 preSerialization 生命周期钩子，对象会被序列化。
抛出错误会向上传递：如果在自定义错误处理器中抛出新的错误，将会调用父级的错误处理器
onError 钩子：onError 钩子只会对第一个被抛出的错误触发一次
错误不会被重复触发：Fastify 内部会监控错误的调用，避免在回复阶段（路由处理器之后）抛出的错误导致无限循环
注意捕获范围：setErrorHandler 不会捕获 onResponse 钩子中抛出的异常，因为此时响应已经发送给客户端了
@fastify/create-error 来创建具有特定代码和状态码的自定义错误


10. app.METHOD(PATH, HANDLER) 
  app 是 Express 实例，METHOD 是小写的 HTTP 方法，PATH 是服务器上的路径，HANDLER 是匹配时执行的函数。

11. app.all()
  某个路径的所有 HTTP 方法加载相同的处理逻辑

12. 一个路由可以传入多个处理函数作为参数
必须在函数中调用 **next()** 将控制权传递给下一个处理函数

13. 中间件（Middleware）：Express 的灵魂

中间件函数能够访问请求对象 req、响应对象 res 以及下一个中间件函数 next
 中间件能做什么
中间件可以执行任意代码、修改 req 和 res 对象、终止请求-响应周期，或者调用 next() 将控制权交给下一个中间件
如果当前中间件**没有**终止请求-响应周期，**必须调用 next()**，否则请求会被挂
起
应用级中间件
 app 对象，使用 app.use() 或 app.METHOD() 加载
 路由级中间件  绑定到 express.Router()
14. next() 的进阶用法
 next('route')：跳过当前路由中剩余的中间件函数，将控制权传递给下一条路由
 next('router')：跳过当前路由实例中剩余的中间件函数，将控制权交回给路由实例
 next(err)：将错误传递给错误处理中间件。

15. 404 / 500 默认返回 HTML：错误处理机制
404 处理：**不是错误**的"错误"

404 响应不是错误的结果 错误处理中间件不会捕获它们。404 只是表示所有中间件和路由都执行完了，但没有任何一个响应了请求
 处理方式：在所有路由和中间件的最底部（即最后）添加一个中间件

500 错误处理：错误处理中间件

当路由或中间件中发生错误时，Express 会触发错误处理中间件
NODE_ENV 环境变量来决定返回什么。

开发环境 (NODE_ENV=development)：返回包含完整堆栈跟踪的 HTML 页面，方便调试
生产环境 (NODE_ENV=production)：只返回简单的 "Internal Server Error" 文本，不泄露内部细节


16. Express 默认以 HTML 形式返回错误，是因为它最初是为构建网页应用而设计的
如果你在构建 REST API，通常希望返回 JSON 格式的错误，这时就需要自定义错误处理中间件来覆盖默认行为。
---

## 卡在哪里

1.

---

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| **Day 17 下午的 3c 拼装** → `src/server.js` → 判据 **7/7** | **10/4 上午（必做）** |
| **Day 18 的数据库**：4 个 SQL 实验 + `tasks` 表 + CRUD → 判据 **9/9** | **10/4 下午（必做）** |
| ④ 阅读四行 + 无权限实测（挂了 4 天）| 10/4 收尾前（15 分钟；**砍单最先砍它**）|
| `day15.md` / `day16.md` 的日志格子 + 记账两行 | 10/4 收尾 |
| Prisma 起步 | **记账：不做** —— 推迟到 Day 21（容器化）时一起 |
| **Day 19（测试）** | 10/4 → **10/5** |

## 明天第一件事

1. **开场 15 分钟**：① 轮转 `arrayUtils`（`node week1-language/recall-verify.js arrayUtils`）② **合上重写 10/3 那份 `scratch/01-health.js`**（起服务 + `/health` + `/tasks` + `/tasks/:id` + `PORT`，**只留一个 `listen`**）→ 起服务后 curl 三条验收
2. **上午（必做）**：**3c 拼装** → `src/server.js`（`buildServer()` **不许自己 listen**；直接运行才监听、读 `PORT`；4 个端点：`/health`、`/tasks`、`/boom`、未知路径 404 都要 JSON）→ **`node --test projects/p2-task-api/test/server.test.js` = 7/7**
3. **下午（必做）**：4 个 SQL 实验（`week3-backend/day18-sql-basics.js`）→ `db/migrations/001_init.sql` + `tasks` 表 + CRUD（`node:sqlite`）→ **`node --test projects/p2-task-api/test/tasks-crud.test.js` = 9/9**
4. **收尾**：④ 阅读四行 + 无权限实测 → 日志 + `git commit` + `push`
5. **时间表照新的"阅读三件套"走**（计划 §七 **心法第 11 条**）：每段 25 分钟 + **到点写一句"我停在哪"**
6. ⚠️ 今天这两块（**7/7** 和 **9/9**）**不许砍**；Day 19（测试）顺延到 **10/5**

## 代码/命令备忘

```powershell
# ① 复习
node --test week2-runtime/day10-dir-size-verify.js      # 轮转 dirSize（D+1）

# ② 项目 2（上午：骨架）
cd projects/p2-task-api
pnpm init --init-type commonjs
pnpm pkg set scripts.test="node --test"
pnpm pkg set scripts.start="node src/server.js"
pnpm add fastify
pnpm pkg get type                                       # 没输出 = 没有 type 字段 = CJS ✅
node -p "require('./package.json').type ?? 'CJS ✅'"     # 更直白的验法
node --test test/server.test.js                         # 目标 7/7
node src/server.js                                      # 起服务（PORT=3000）

# ③ 数据库（下午）
node week3-backend/day18-sql-basics.js                  # 四个 SQL 实验
node --test test/tasks-crud.test.js                     # 目标 9/9
# 手工试一次（另开一个终端）：
#   curl -X POST http://127.0.0.1:3000/tasks -H "content-type: application/json" -d "{\"title\":\"试试\"}"
#   curl http://127.0.0.1:3000/tasks

# 收尾
node tools/check-md-tables.js
git status -sb
git add -A && git commit -m "day18: p2 skeleton 7/7 + sqlite tasks CRUD 9/9 + migrations" && git push
git ls-remote --heads origin main
```

---

# Day 18 第 2 天 — 2026-10-04（周日）

> 任务书：[`day18-day2.md`](day18-day2.md)　｜　**实际开始 09:50**（比原计划迟）→ 时间表**按实际时间重排**，结束晚点没关系
> 今天两块（**都不许砍**）：**3c 拼装 → 判据 7/7**　+　**数据库 → `tasks` 表 + CRUD → 判据 9/9**

## 今日目标（第 2 天）

- [ ] ① 开场：轮转 `arrayUtils`（合上重写）+ 合上重写 10/3 的 scratch（只留一个 `listen`）
- [ ] ② 读 Fastify **Errors**（只读 `setErrorHandler` 那段）+ demo：`onRequest` 钩子 + `setErrorHandler`
- [ ] ③ **3c 拼装 → `src/server.js` → 判据 7/7**
- [ ] ④ 四个 SQL 实验（`week3-backend/day18-sql-basics.js`）
- [ ] ⑤ **`tasks` 表 + CRUD → 判据 9/9**
- [ ] ⑥ 建表/迁移 SQL 进 git（`db/migrations/001_init.sql`）
- [ ] ⑦ ④ 阅读四行 + 无权限实测（挂了 5 天的欠账；**砍单最先砍它**）
- [ ] ⑧ 收尾：日志 + `node tools/sp-tasks.js today`（**计划 vs 实际**）+ `commit` + `push`

## 每格结束写一句"到点了，我停在哪"（心法第 11 条）

| 时段 | 到点了，我停在哪 |
|---|---|
| 10:00–10:05 轮转 `arrayUtils` | |
| 10:05–10:20 重写 scratch | |
| 10:20–10:50 读 Errors + demo | |
| 10:50–13:00 **拼装 → 7/7** | |
| 13:50–14:50 四个 SQL 实验 | |
| 14:50–17:20 **CRUD → 9/9** | |
| 17:20–17:55 收尾 | |
