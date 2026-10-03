# Day 18 任务书（10/3 周六）：上午补项目 2 骨架（Day 17 顺延）+ 下午 数据库与 ORM

> **日期**：2026-10-03（周六）　｜　**假期第 4 天（8h+）**　｜　**第 3 周 Day 2**
> **今天有两块**：上午把**昨天顺延的 Day 17 下午**补完（项目 2 起骨架 → 判据 **7/7**）；下午走 **Day 18 正课**（数据库与 ORM → 项目 2 接上真库）
> **判据两份都已就位 + 负向验证过**：`projects/p2-task-api/test/server.test.js`（**7/7**）、`projects/p2-task-api/test/tasks-crud.test.js`（**8 必过 + 1 探针**）

---

## 〇 开工前 5 分钟：把产出物抄在纸上

> **每样都写清"为什么做它"** —— 说不清用途的那件，就是今天最容易砍错的。

| # | 产出物 | **为什么做它** | 验收标准 | 谁写 |
|---|---|---|---|---|
| 1 | `projects/p2-task-api/src/server.js`（骨架）| **地基**：第 19–22 天（认证 / 缓存 / 限流 / 部署）全往它上面挂 | `node --test projects/p2-task-api/test/server.test.js` → **7/7** | **你** |
| 2 | `projects/p2-task-api/package.json` | 第 **2 个真依赖** = 后端项目的起点；`start`/`test` 把"怎么跑"固定成入口（Day 21 的 CI 跑同一条）| `pnpm init --init-type commonjs` + scripts + `pnpm add fastify` | **你** |
| 3 | `db/migrations/001_init.sql`（或同类）| **"库的结构"也要进 git** —— 别人 clone 下来能重建出同一个库；面试会问"你的表结构怎么管理" | 建表 SQL 在文件里（不是硬编码在 js 里），服务启动时执行它 | **你** |
| 4 | `src/` 里的 CRUD（`node:sqlite`）| 项目 2 **真的能跑**的第一版：增删改查走真实数据库文件 | `node --test projects/p2-task-api/test/tasks-crud.test.js` → **9/9** | **你** |
| 5 | `week3-backend/day18-sql-basics.js` | 关系模型 / SQL / 事务 / 索引**必须先用手写一遍** —— 不然第 19 天的"测试数据库隔离"和第 21 天的缓存都是在背名词 | 四个小实验各自的输出记进日志（含**索引前后的两个数字**）| **你** |

> ⚠️ **启动标准就一条**：做完"复习触点 ①②"（10 分钟）就算启动成功。别一上来就想今天要干 8 小时。

### 卡住时的第一步：先分类，再决定"要不要继续想"（心法第 1 条补充）

| 长什么样 | 判断法 | 处理 |
|---|---|---|
| **(a) 学过、但取不出来**（例：`path.extname`、`.finally`、`fs.readdir` 的选项）| "我见过吗？材料里排过吗？" → **见过** | **不给答案**：只指路到你的材料 → **合上重写** |
| **(b) 还没学过**（例：`fastify.setErrorHandler`、`node:sqlite` 的 API、Prisma）| → **没见过** | **"想不出来"是正常的、也是正确的** → 直接问"它是什么 / 怎么用" → 拿到最小可跑示范 → **自己写一块** |

**时间盒**：卡住后只许自己想 **15 分钟**，到点必须换路子（查 MDN / **读判据的失败信息** / 看本任务书指路 / 问 AI —— 只问"指路 / 诊断 / 核对"）。
**今天的计数单位**：新写了几个函数 / **判据从几条红变几条绿**（今天有两个目标：`0→7` 和 `0→9`）/ 能讲清几个"为什么"。

---

## 一 时间表（8h+）

| 时段 | 干什么 | 产出 |
|---|---|---|
| **0:00–0:10** | **复习触点 ①②**：轮转 **`dirSize`**（间隔表 **D+1 → 合上重写**）+ 不看材料讲"昨天那两个坑"（**拼错的选项静默失效** / **工具函数 `catch` 不重抛 = 吞错**）| —— |
| **0:10–1:00** | **3a 读** + **3d 装包**（**必须先后颠倒过来**：先 `pnpm init` + `pnpm add fastify`，不然 3c 写不了）| 2 |
| **1:00–2:00** | **3b 拆块**（4 个小 demo，每块自己写）| —— |
| **2:00–4:00** | **3c 拼装** → `src/server.js` → **判据 7/7** | 1 |
| 4:00–5:00 | 午饭 + 休息（**离开屏幕**）| —— |
| **5:00–6:00** | **Day 18 学 + 手写**(§三 1)：关系模型 / SQL 四件事 / 事务 / 索引（四个小实验）| 5 |
| **6:00–8:30** | **Day 18 做**(§三 2)：`tasks` 表 + CRUD 接进 `server.js` → **判据 9/9** | 3 4 |
| **8:30–9:00** | 收尾：日志 + `git commit` + 触点 ③（抽考 2 条 + 写"明天要考的那条"）| —— |

**砍单顺序**（时间不够就从下往上砍）：① 能做就做的 Prisma 起步 → ② `?done=` 过滤 → ③ 3b 的 ③（请求日志钩子）→ ④ 4 个 SQL 实验里的第 4 个（Postgres 差异）。
**不许砍**：**7/7**、**CRUD 判据 9/9**、**迁移/建表 SQL 进 git**。

---

## 二 上午：补 Day 17 下午 → 项目 2 骨架（判据 7/7）

### 3a 读（约 25 分钟）

| 读什么 | 抓住什么 |
|---|---|
| Fastify 官网 Getting Started / Routing / Hooks | `fastify()` 造实例、`fastify.get(path, handler)`、**handler 里 `return` 对象就自动变 JSON**、`listen({ port })` |
| Fastify 官网 Errors / `setErrorHandler` | 统一错误处理；为什么"一个 handler 抛错不能让进程崩" |
| Express 官网（对比着看）| 路由、中间件 `(req,res,next)`、**404/500 默认返回 HTML** → 这就是为什么 Fastify 默认更好用 |
| `notes/day12-http-project1.md` | 状态码语义（200/201/404/500）、`Content-Type`、为什么 API 一律 JSON |

**选哪个框架你自己定 + 写一句"为什么"**。判据**不挑框架**（三家的参照实现我都实测过 7/7，见下面的"AI 记账"）。

### 3d 装包（约 15 分钟，**放在写代码之前**）

```powershell
cd projects/p2-task-api
pnpm init --init-type commonjs          # ⚠️ 不带 --init-type 会写 type:module → CJS 文件全废（9/30 踩过）
pnpm pkg set name="p2-task-api" private=true description="任务管理 REST API（项目 2）"
pnpm pkg set scripts.test="node --test"
pnpm pkg set scripts.start="node src/server.js"
pnpm add fastify                        # 第 2 个真依赖 —— 写一句"为什么是它"
pnpm pkg get type                       # **没输出** = 没有 type 字段 = CJS ✅（pnpm 12 的行为；p1 也一样）
                                        # 更直白的验法：node -p "require('./package.json').type ?? '没有 type 字段 → CJS ✅'"
```

### 3b 拆块（60 分钟，**4 块，每块自己写小 demo**）

| # | 写什么 | 为什么拆这一块 |
|---|---|---|
| ① | 起服务 + 一条路由：`GET /health` → `{ ok: true }` | 先把"服务能起、能返回 JSON"跑通 |
| ② | 路由 + 参数：`GET /tasks`、`GET /tasks/:id`（先返回假数据）| 路由参数怎么取、返回数组/对象 |
| ③ | **钩子**：`onRequest` 里打一行请求日志（方法 + 路径）| 中间件的定位（Express 叫中间件，Fastify 叫钩子）|
| ④ | **统一错误处理**：`setErrorHandler` → 500 + JSON；**404 也要 JSON** | 判据的 `03`/`04` 盯的就是这个 |

### 3c 拼装（2 小时）→ 契约

```
projects/p2-task-api/
  src/server.js    导出 buildServer() —— **不许自己 listen**（谁调用谁决定端口）
                   直接运行它（node src/server.js）时才监听 → 端口读 process.env.PORT，默认 3000
  端点（今天先不接数据库）：
    GET /health   → 200 + JSON {"ok":true}
    GET /tasks    → 200 + JSON []（空数组，下午接上真库）
    GET /boom     → 故意抛错（**只在非 production 注册**）→ 500 + JSON，且**进程不许崩**
    未知路径       → 404 + **JSON**（不是 HTML 错误页）
```

**跑**：`node --test projects/p2-task-api/test/server.test.js` → **7/7**

> **⚠️ 判据今天自己也修了（AI 记账，免得你以为是你的问题）**：`server.test.js` 原来写的是
> `s.listen(0, '127.0.0.1', cb)` + `s.address().port` —— **那只在纯 `node:http` 上成立**（当时参照实现正好是它，所以没暴露）。
> **实测：Fastify 直接抛 `Cannot create property 'host' on number '0'`**（它只吃 `listen({ port, host })` 这种对象写法），
> Express 的 `app.listen()` 返回的也是**新建的 http.Server**、不是 `app`。
> → 已改成**框架无关**（listen 用 options 对象；端口从 `s.server?.address() ?? s.address()` 取），
> **三家参照实现（node:http / Fastify / Express）都实测 7/7**。所以放心用 Fastify。

---

## 三 下午：Day 18 = 数据库与 ORM（项目 2 接上真库）

### 0 先说清今天的**数据库路径**（环境实测 + 我的判断）

**环境实测**：这台机器上 **没有 Docker、没有 `psql`、5432 端口没有服务** → **今天装不了 Postgres**（装它还要下载安装包 + 起服务 + 设密码，按这两天的节奏会把 7/7 挤掉）。

**所以今天的路径**：
- **用 `node:sqlite`（Node 24 内置，零依赖）** 把整条链路跑通：建表 → 迁移文件 → CRUD → 判据 9/9。
  → 理由三条：① **计划里 Day 18 的验收本来就是"能对真实数据库增删改查；迁移文件进 git"，没写引擎**；② 零安装 = 零失败模式（今天最贵的是时间）；③ **SQL 语法和"表/主键/索引/事务"这套概念，SQLite 和 Postgres 是同一套**（差异只有 3 处，见 5:00 的第 4 个实验）。
  → 顺带一个收获：**"Node 24 自带 SQLite" 本身就是"依赖越少越好"的活例子**（复习触点里那条 ④ 阅读的答案）。
- **Postgres 放到 Day 21（容器化）**：那天本来就讲 Docker + `docker-compose`，用 `compose` 把 `pg` 拉起来是最自然的时机；届时换过来只要改连接方式和 3 处 SQL 方言。
- **Prisma 移到"能做就做"**（见下）：它今天不是必需，而且现在有版本坑（见 ⚠️）。

### 1 学 + 手写（60 分钟）→ `week3-backend/day18-sql-basics.js`

**四个小实验，每个都要有"我预期的输出 vs 实际输出"**：

| # | 做什么 | 要抓住的"为什么" |
|---|---|---|
| 1 | 建一张表（`id` 主键自增、`title` 非空、`done` 默认 0）+ 插 3 行 + 查出来 | **关系模型**：表 = 行 × 列；**主键**唯一标识一行；`NOT NULL` / `DEFAULT` 是**数据库层的校验**（比 js 里校验更靠得住，因为它对"绕过 API 直接写库"也生效）|
| 2 | **事务**：`BEGIN` → 两条 `INSERT` → 中间故意抛错 → `ROLLBACK` → 查一下：**一行都没进** | **要么都成功、要么都不发生** —— 这就是"转账不能只扣不加"的那件事 |
| 3 | **索引**：插 10000 行 → 记一个 `WHERE title = ?` 的耗时 → **建索引** → 再记一次 | **索引是用"写入变慢 + 占空间"换"查询变快"**；两个数字都要记进日志（这就是"看一次索引效果"）|
| 4 | 读：Postgres 和 SQLite 的 **3 处差异**（`SERIAL` vs `AUTOINCREMENT`、`TIMESTAMPTZ`、`EXPLAIN ANALYZE` vs `EXPLAIN QUERY PLAN`）| 记成日志里的 4 行笔记（这是"Postgres 基础 SQL"那一项，今天用对照的方式提前见一次）|

### 2 做（2.5 小时）→ 契约（判据照这个判）

```
projects/p2-task-api/
  db/migrations/001_init.sql     建表 SQL 写在这里（CREATE TABLE IF NOT EXISTS …），服务启动时执行它
                                 → 为什么：库的结构也要进 git，别人 clone 下来能重建同一个库
  src/server.js                  buildServer()：
                                 · **数据库文件路径读 process.env.DB_FILE（默认 data/tasks.db）**
                                   ⚠️ 在 buildServer() 被调用时读，**不许在模块顶层就 open**（那是模块副作用）
                                   为什么：判据靠换 DB_FILE 用临时库测；这和 Day 17 的"不许自己 listen"是同一个道理
                                 · 端点（全部返回 JSON）：
    POST   /tasks        body {"title":"…","done"?:false} → 201 + JSON，带**非空 id**
    GET    /tasks        → 200 + 数组（真从库里读）
    GET    /tasks/:id    → 200；**不存在 → 404 + JSON**
    PATCH  /tasks/:id    → 200 + 更新后的对象；不存在 → 404 + JSON
    DELETE /tasks/:id    → 204（无 body）或 200；不存在 → 404 + JSON
    title 缺失/为空       → 400 / 422 + JSON
  data/tasks.db                  真实数据文件 → **加进 .gitignore**（数据库文件不进 git；进的是建表 SQL）
```

**跑**：`node --test projects/p2-task-api/test/tasks-crud.test.js` → **9/9**（8 必过 + 1 探针）

> **这份判据里最要紧的一条是 `06 跨进程持久化`**：创建一条 → **杀掉进程** → **换个进程起同一个 `DB_FILE`** → 数据还在。
> 它专门防"**用内存数组假装数据库**"—— 我实测过：假库那份实现 `01–05` 全绿、只有 `06` 红；真 `node:sqlite` 那份 **9/9**。
> 所以这条红了不是判据刁难你，是它在替你验"真的落库了"。

### 3 能做就做（30 分钟，**砍单第一个砍它**）：Prisma 起步

只做一件事：**把同一张 `tasks` 表用 `schema.prisma` 描述一遍**，和你的 `001_init.sql` 对照着看（"同一件事的两种写法"）。**不用它重写 CRUD。**

```powershell
cd projects/p2-task-api
pnpm add -D prisma@7.10.0 && pnpm add @prisma/client@7.10.0   # ⚠️ 必须钉版本，见下
pnpm exec prisma init --datasource-provider sqlite
```

> ⚠️ **版本坑（今天实测）**：`pnpm add prisma` 现在会装到 **`8.0.0-rc.19`（RC 版！）**（`prisma` 的 `latest` 标签指向 RC），而 `@prisma/client` 的 `latest` 是 `7.10.0` —— **两者对不上，会报一堆莫名其妙的错**。所以要**成对钉版本**（上面那样）。

---

## 四 今天的四个提醒（都是从这两天的账里长出来的）

1. **顺序**：装包在写代码**之前**；`node --check` 在"往文件里加东西"**之前**；`git status` 在 `git add -A` **之前**。
2. **判据的牙**：开工前先读判据（它就是需求的精确版）；每条能说出"它在防哪种坏法"（今天最好的一条 = `06`）。
3. **记账两行**：日志里既写"哪部分是 AI 给的"，也写"**我自己写了哪几块**"（焦虑靠证据治）。
4. **问 AI 的四种问法**：指路 / 诊断 / 核对 ✅；**别要"写给我"**。拿到帮助后的必做动作：**看 30 秒 → 合上 → 自己写 → 对照**。
