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
| 1 | 建表（主键/NOT NULL/DEFAULT）+ 插 3 行 + 查出来 | |[
  [Object: null prototype] { id: 1, title: '写周报', done: 0 },
  [Object: null prototype] { id: 2, title: '看文档', done: 0 },
  [Object: null prototype] { id: 3, title: '跑步', done: 0 }
] | |
| 2 | 事务：两条 `INSERT` 中间故意抛错 → `ROLLBACK` | 错一个就回滚| 已回滚：故意炸
[
  [Object: null prototype] { id: 1, title: '写周报', done: 0 },
  [Object: null prototype] { id: 2, title: '看文档', done: 0 },
  [Object: null prototype] { id: 3, title: '跑步', done: 0 }
]| |
| 3 | 索引：1 万行，建索引**前 / 后**两个耗时 | 前 __0.76__ ms | 后 __0.18__ ms | |
| 4 | Postgres vs SQLite 的 3 处差异（4 行笔记）| | | |


事务小实验：把 COMMIT 和 ROLLBACK 都删掉 → 再跑 → 看条数是 3 还是 4？ 
我猜测的 3条   实际：4条
① 同一个连接里查 -> 1 条     ← 你看到 4 条就是这个
② 换个新连接再查 -> 0 条     ← 这才说明有没有落盘
因为BEGIN还开着，只是没有 COMMIT 和 ROLLBACK导致留在里面ins.run留在里面没有结算，一旦连接关将自动回滚，


索引输出
|  | 计划 | 耗时（仅供参考） |
| --- | --- | --- |
| 无索引 | SCAN tasks | 0.76 ms |
| 有索引 | SEARCH … USING INDEX idx_tasks_title (title=?) | 0.18 ms |
| 删掉索引 | 又变回 SCAN tasks | — |



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



17. 事务第一个用处：控制任务的并行性：
事务 = 一组操作要么全成功、要么全不发生；BEGIN 之后要靠 COMMIT 才落地



18. 事务"的第 2 个用处：不只是"要么都成功"，它也是性能工具


19. 
| 事项 | SQLite | Postgres | 一句话"为什么" |
| --- | --- | --- | --- |
| 自增主键 |  AUTOINCREMENT额外保证会严格大于该表中曾经出现过的最大 ID代价是 SQLite 需要额外维护一个 sqlite_sequence 表，有轻微性能开销 | SERIAL/IDENTITY SERIAL自动创建一个INTEGER列 关联一个序列（Sequence） 对象作为其默认值。 IDENTITY 如 id INT GENERATED ALWAAYS AS IDNTITY PRIMARY KEY | 使用语法的不同,实现方式不同 |
| 类型 | SQLite 只有五种存储类：NULL,INTEGER,REAL,TEXT,BLOB没有独立的布尔类型也没有精确的 DECIMAL 类型小数通常用 REAL（浮点数）存储，可能存在精度问题| PostgreSQL 拥有丰富且严格的数据类型系统，包括 BOOLEAN, DATE, TIMESTAMP, NUMERIC (精确小数), JSONB, ARRAY 等 数据库会强制执行类型检查。| 类型的种类丰富程度和类型检查的精细程度存在差异|
| 看执行计划 | EXPLAIN QUERY PLAN默认不执行，仅分析关注是否 **使用索引 ** 简洁文本，核心是 detail 列| EXPLAIN  默认不执行，需加 ANALYZE 选项才真实执行 详细的成本估算、行数估算和执行时间 树状结构，可输出为 TEXT, JSON, XML 等格式| 使用命令和返回的输出详细程度，PostgreSQL需要手动ANALYZE才能执行 |
| 并发于锁| 文件级锁+单写者模型。修改一个进程会影响整个数据库，其他操作必须等待 | MVCC多版本并发控制+行级锁 修改不用行的会话之间可以独立运行 | 只供一人使用和可以跟多人使用的区别（个人和企业级的区别） |

20. .run()返回的结果对象
受影响的行数changes lastInsertRowid最后插入行的id

21. 为什么pnpm能节省磁盘空间？
pnpm节省磁盘空间的关键在于它彻底改变了依赖的存储方式。
npm在安装依赖时，如果100个项目都用了同一个版本的包，磁盘上就会实实在在地保存100份该包的副本
pnpm采用了一种更聪明的内容可寻址存储（Content-Addressable Store） 方案
全局存储，只存一份 放在一个全局仓库 在磁盘上都只保存唯一一份
如果包有了新版本，pnpm也只会把修改过的文件加入仓库，而不是整个复制一遍
硬链接，不占额外空间 当项目需要某个依赖时，pnpm会从全局仓库创建一个硬链接（Hard Link） 到项目的node_modules目录中。硬链接就像一个 **“快捷方式”**，它让项目里的文件和全局仓库里的源文件指向磁盘上的同一个物理位置。因此，项目里的这个文件并不会额外占用磁盘空间，只是多了一个指向源文件的“入口”
什么是“幽灵依赖”？pnpm如何根除它？
幽灵依赖”指的是你的代码里使用了某个包，但这个包并没有在你项目的package.json文件中声明。
npm的做法（扁平化：把全部依赖全部上升到根目录上变为一层）：为了解决旧版依赖嵌套过深导致的路径过长问题，npm从v3开始会将依赖尽量“提升”到node_modules的根目录
产生的问题：这种“提升”是无差别的，它会把所有的依赖，包括你直接依赖的子依赖，都提升到顶层。结果就是，你的项目代码可以访问到这些本不属于你的、被提升上来的包，这就是“幽灵依赖
**风险**：一旦你的直接依赖升级，不再依赖那个被提升的包，你的代码就会突然报错，因为那个“幽灵”消失了

pnpm的解决方案（非扁平化结构）：
只有你项目package.json中明确声明的直接依赖，它们都是指向.pnpm目录的符号链接（Symlink）
而所有的传递依赖（即依赖的依赖）则被严格地放置在.pnpm这个隐藏目录中，并通过符号链接与各自的父依赖关联
这意味着，Node.js的模块解析机制无法向上遍历找到那些未被声明的包。你的代码只能访问到那些你明确声明过的依赖
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

- [×] ① 开场：轮转 `arrayUtils`（合上重写）+ 合上重写 10/3 的 scratch（只留一个 `listen`）
- [×] ② 读 Fastify **Errors**（只读 `setErrorHandler` 那段）+ demo：`onRequest` 钩子 + `setErrorHandler`
- [×] ③ **3c 拼装 → `src/server.js` → 判据 7/7**
- [×] ④ 四个 SQL 实验（`week3-backend/day18-sql-basics.js`）
- [×] ⑤ **`tasks` 表 + CRUD → 判据 9/9**
- [×] ⑥ 建表/迁移 SQL 进 git（`db/migrations/001_init.sql`）
- [×] ⑦ ④ 阅读四行 + 无权限实测（挂了 5 天的欠账；**砍单最先砍它**）
- [×] ⑧ 收尾：日志 + `node tools/sp-tasks.js today`（**计划 vs 实际**）+ `commit` + `push`



**⑦ 阅读四行**

1. pnpm 和 npm 最实质的差别（为什么省磁盘 / 幽灵依赖）：
pnpm的存储方式是当多个文件需要一个依赖的时候，pnpm将一个依赖存储到自己的中央仓库里，同时跟那些需要这个依赖的文件在全局仓库里建立硬链接，让文件共用一个依赖，同时在需要更新的依赖也只会替换一个在全局仓库的依赖。而不是复制多份
但npm就不一样，它会复制多份，每个需要一个依赖的复制一份，这就造成了大量的磁盘占用
2. `^1.2.3` / `~1.2.3` / `1.2.3` 各放行哪一档；`0.x.y` 特殊在哪：
^1.2.3 插入符号 允许允许次版本（minor）和补丁版本（patch） 升级，即 >=1.2.3 <2.0.0
~1.2.3 允许补丁版本（patch） 升级，即 >=1.2.3 <1.3.0。
1.2.3 只允许安装完全等于 1.2.3 的版本，不进行任何升级。

主版本号为 0（0.y.z）表示初始开发阶段，任何东西都可能随时改变，公共 API 不应被视为稳定 **只能补丁更新**
 0.x.y 阶段的包，使用 ^ 等同于使用 ~
3. lockfile 为什么必须提交（没有它会怎样）：
因为它锁定了依赖树的精确状态
在 CI 和生产环境中安装更快：因为 pnpm-lock.yaml 已经记录了所有依赖的精确版本和下载地址，安装时可以跳过依赖解析这一耗时步骤，直接按图索骥下载
在开发、测试和生产环境间强制一致：提交锁文件能确保测试和生产环境中使用的包，与你开发时完全一致，消除了环境差异导致“在我机器上能跑”的问题
4. "依赖越少越好"用一个例子说清（`postinstall` / 供应链）：
现代前端应用高达 97% 的代码来自 npm 依赖开发者自己编写的独特代码仅占 3% 左右
这意味着，你项目里的绝大部分代码从未被你或你的团队读过，却拥有与你自己的代码完全相同的执行权限。
postinstall 是定义在 package.json 中的一个安装生命周期脚本
它的合法用途包括：

原生模块编译：如 node-sass 在安装时编译 C++ 绑定。

平台适配：根据操作系统下载对应的二进制文件。

代码生成：在安装后生成必要的客户端代码或配置
它的危险之处在于：它本质上是一段拥有完整执行权限的自动程序
恶意 postinstall 脚本可以：
窃取环境变量、.npmrc 中的 npm Token、云服务密钥、SSH 私钥等。
从远程服务器下载并执行二级恶意载荷，且可能故意禁用 TLS 验证以规避检测。
在 CI/CD 和云环境中故意跳过执行，专门针对开发者工作站进行入侵。

攻击者的核心目标是获取发布权限或诱骗你安装恶意代码。
1. 账户接管与凭证窃取（最主流）
2. 依赖混淆（Dependency Confusion）
3. 域名抢注（Typosquatting）
4. 维护者无心引入

**无权限实测**

node projects/p1-cli-organizer/src/cli.js "C:/Windows/System32/config"

PS C:\Users\27971\.zcode\workspace\default\js-node-30days> node    projects/p1-cli-organizer/src/cli.js "C:/Windows/System32/config"
源目录读取不了 C:/Windows/System32/config —— 没有权限



## 每格结束写一句"到点了，我停在哪"（心法第 11 条）

| 时段 | 到点了，我停在哪 |
|---|---|
| 10:00–10:05 轮转 `arrayUtils` | 停在myReduce|
| 10:05–10:20 重写 scratch | 全部完成|
| 10:20–10:50 读 Errors + demo | |
| 10:50–13:00 **拼装 → 7/7** |全部完成 |
| 13:50–14:50 四个 SQL 实验 |停在实验2刚结束 |
| 14:50–17:20 **CRUD → 9/9** | 停在块3修改|
| 17:20–17:55 收尾 |pnpm 和 npm 最实质的差别（为什么省磁盘 / 幽灵依赖） |


## 记账（**两面都记**）

| 这一遍 | 记什么 |
|---|---|
| **哪部分是 AI 给的** | exec vs prepare/run 的分工讲解 + 两个示范（块 1 骨架、块 3/4 的写法）|
| **我自己写了哪几块** | 5 条 handler 的装配、迁移文件、UPDATE/DELETE/校验、以及把 8 处 bug 一个个修掉|

### 记账·完整版（AI 补全，2026-10-04 收工 —— 你说"务必要完整"）

> 三列：**AI 给的**（示范 / 讲解 / 判据）/ **我自己写的**（实现主体）/ **AI 帮我定位的**（= "以后该我自己发现"的量）。
> 结论：**实现主体全是我的** —— 每一行能跑的业务代码都是我打的 ✓ 这符合计划 §一 的红线（"实现由学生写、测试可以由 AI 写"）。

| 任务 | AI 给的 | 我自己写的 | AI 帮我定位的 |
|---|---|---|---|
| 轮转 `arrayUtils` | — | `myMap` / `myFilter` / `myReduce` 全篇（闭卷）| 3 条红的原因：`resut`/`reulst` 手滑、`myReduce` 的 `if(initialValue)`、循环没用上 `start` |
| scratch 重写 | 4 行的形状（`fastify()` / `app.get` / `return 对象` / `listen({port},cb)`）+ `:id`·`query` 示范 | `/tasks`、`PORT` + 默认值、真实端口日志、`:id` + `query` | `/tasks/:id` 少个 `s`（404）、`(res)`→`(req)`、`listen` 夹在路由中间 |
| **3c 拼装 → 7/7** | 两段式结构示范（`buildServer` 里 return / `require.main` 守卫）+ `/boom` 那 3 行 + `setErrorHandler` 形状 | 四条路由的搬运、`buildServer` 的组装、迁移文件、错误文案（"服务器开小差啦"）| **漏 `return app`**（判据"检测不到"）、`app` 放模块顶层、`process.exitCode(1)`、日志写死端口 |
| 四个 SQL 实验 | `node:sqlite` 五个动作的最小示范、四个实验的步骤 + 预期、"记计划别记耗时"、`IF NOT EXISTS` vs `DROP` | 四个实验**全部代码**；**自己补的第 4 条（并发与锁）**；**修正了 AI 关于 `EXPLAIN`/`ANALYZE` 的说法** | `table tasks already exists`（其实= 真落库的证据）、`close()` 之后 `database is not open`、`BFGIN` 拼写、`PLANSELECT`（少空格）|
| **CRUD → 9/9** | 块 1 骨架、`exec` vs `prepare/run` 的分工讲解、块 3/4 的写法、`!== undefined` 的答案 | 5 条 handler 的装配、`UPDATE`/`DELETE`、`title` 校验、迁移文件落地 | 8 处：`require('lab.db')`、缺 `path`/`fs`、两条重复的 `GET /tasks`、`dbFile` TDZ、`db` TDZ、`{ path }` 解构、`./db/.migration` 路径、`Number(r,id)` |
| 收尾 | 四行阅读的书单入口 + 负面清单、无权限实测的期望输出 | 四行笔记（自己的话）+ 无权限实测 | — |
| 判据本身 | 两份判据（7 条 + 9 条）+ 负向验证；**今天还修了判据两处**（框架兼容 bug、误导文案）| — | — |

**从明天起的固定三行**：`AI 帮我定位的` 这一列 = "**以后该我自己发现**"的量。
今天 **15+ 处**里，**6 处是"报错第一行就写着"**（`FST_ERR_REOPENED_SERVER` / `PLANSELECT` / `Cannot access 'db'` / `database is not open` / `Cannot find module` / `table already exists`）→ "先读第一行"你今天练了 4 次 ✓
**明天目标：这一列 ≤ 3 处。**



##  计划 vs 实际

  15m →    3m  [10/4] 17:40-17:55 收尾：日志 + today + commit + push
  20m →   40m  [10/4] 17:20-17:40 ④ 阅读四行 + 无权限实测
 150m →  165m  [10/4] 14:50-17:20 tasks 表 + CRUD → 判据 9/9
  60m →  132m  [10/4] 13:50-14:50 四个 SQL 实验
  50m →    1m  [10/4] 13:00-13:50 午饭 + 离开屏幕
 130m →   28m  [10/4] 10:50-13:00 3c 拼装 → src/server.js → 判据 7/7
  15m →   30m  [10/4] 10:35-10:50 demo：onRequest 钩子 + setErrorHandler
  15m →    0m  [10/4] 10:20-10:35 读 Fastify Errors（只读 setErrorHandler）+ 对照 Express 笔记
  15m →   23m  [10/4] 10:05-10:20 合上重写 10/3 的 scratch（只留一个 listen）
   5m →   23m  [10/4] 10:00-10:05 轮转 arrayUtils（合上重写）
—— 今天：计划 475m / 实际 444m


