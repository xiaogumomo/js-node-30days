# Day 24 — 2026-10-10（周六）**换数据库引擎：sqlite → Postgres**

> **状态：待填写**　｜　任务书：[`day24-postgres.md`](day24-postgres.md)
> **实际开始 __:__**　｜　**今天**：只排一道新主线 = 换引擎（四块）
> **判据（硬）**：① 迁移在 pg 跑通（`\d tasks` 看到列）② 39/39 全绿 ③ **连跑 3 遍都全绿** ④ 突变 13/13 ⑤ 服务活体在 **pg 上**重跑
> **规矩**：**一块一跑、绿了再动下一块**；搬家/改造类改动做**关键名字对账**（`DB_URL`／`$1`／`$2` 一字不差）

## 开场已知（AI 08:24 核过）

- ⚠️ **Docker 引擎没跑**（`dockerDesktopLinuxEngine` 连不上）→ 要先 `docker desktop start`，再 `docker compose up -d db`
- **`pg` 还没装**（正常，这是今天第一件事）
- 昨晚三条提交（`93144e0` refactor / `c52e29f` graceful shutdown / `6f5e969` day23 文档）**都已经 push** ✓
- 连接串：本机连 = `postgres://app:secret@localhost:5432/tasks`（**容器内**才用服务名 `db`）

## 今日目标

- [×] ① 探环境 ＋ 最小示范（`scratch/01-pg-connect.js` → `SELECT 1`）
- [×] ② **块1**：迁移文件改 pg 语法（`AUTOINCREMENT` → `GENERATED ALWAYS AS IDENTITY`）
- [×] ③ **块2**：`src/db.js` 换 `pg`（Pool ＋ 异步 ＋ `$1`）
- [×] ④ 块2 自测：增 / 删 / 改 / 查四条 SQL 各跑通一次
- [×] ⑤ **块3**：`buildServer()` async（或 `initDb()`）＋ 4 份判据同步 → **39/39**
- [×] ⑥ **块4**：测试隔离换成测试库/schema ＋ `server.test.js` 补 3 行 → **连跑 3 遍 39/39**
- [ ] ⑦ 服务活体：在 **Postgres 上**重跑 curl 全流程（建 / 查 / 隔离 404）
- [ ] ⑧ 突变检查 13/13（M5/M6/M7 走 `--impl2 src/db.js`）
- [ ] ⑨ 小账：README 对账 ／ 轮转 #11 ／ LC O(n) 两版 ／ `host:'0.0.0.0'` ／ "列表按 id 排序"断言
- [ ] ⑩ 收尾：抽考 ／ 日志 ／ 计划 vs 实际 ／ commit ＋ push

## 判据结果

| 判据 | 目标 | 实际 |
|---|---|---|
| 迁移在 pg 跑通 | `\d tasks` 看到三列 |已经看到了 |
| 三份回归 ＋ 仓库 | 7/9/10 ＋ 39/39 | 39/39|
| **连跑 3 遍** | 三遍都 39/39 | 三遍39/39|
| 突变检查 | 13/13 | 欠账|
| 服务活体（pg 上） | 建 / 查 / 隔离 404 |欠账 |
| 真库不再多出 `criteria-*` 用户 | 跑完仓库测试后总数不变 |欠账 |

## 产出物

| 文件 | 内容 | 状态 |
|---|---|---|
| `db/migrations/*.sql` | pg 语法 | 完成|
| `src/db.js` | 换 `pg` |完成 |
| 4 份判据（`test/*.test.js`） | 契约同步（`await buildServer()`） |完成 |
| `README.md` | 依赖（多了 `pg`）＋"数据不持久"那条重写 |欠账 |
| `algo/lc001-two-sum-hash.js` | O(n) 版（`{}` ＋ `Map` 各一版） | 欠账|

PS C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api> node scratch\01-pg-connect.js
SELECT 1 -> [ { ok: 1 } ]
version -> PostgreSQL 16.15 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit

## 卡点与教训（当天记）

| 卡在哪 | 性质 | 处理 |
|---|---|---|
|pnpm add pg 直连 npmjs 超时|环境（首次装依赖撞墙）	换 registry.npmmirror.co| ✓ 已解决；lockfile 只记哈希、不连累 CI ✓|
|连不上：（message 空）|	报错可读性|localhost → IPv4+IPv6 双解析 → AggregateError（message 天生为空）→ 根因是 Docker 没起；修法：catch 里打整个 e|
|转pg花了大量时间| 手滑+忘删 | ai指路删干净|
## 记账三列

- AI 给的：骨架（`01-pg-connect.js`）／今天的四块拆法／判据清单/上一轮两个完整示范 ＋ 这 12 条清单 ＋ "返回什么"那张表
- 我自己写的：重写后的 db.js 全文
- AI 帮我定位的：

## 时间账（收尾跑 `node tools/sp-tasks.js today`）

| 格 | 计划 | 实际 |
|---|---|---|
| 09:00 换源 + 装 pg + 连上 pg | 10 | **88**（环境三连：源不通 / Docker 没起 / `AggregateError` 空 message）|
| 10:50 块1 迁移语法 | 40 | **23** ✓（比计划快）|
| 11:30 块2 `db.js` 换 pg | 60 | **121** ✗（首次上手 + 三轮修正）|
| 14:40 块2 自测 | 20 | **20** ✓ |
| 15:00 块3 buildServer async + 判据同步 | 40 | **67** |
| 15:40 块4 测试隔离 + testkit | 60 | **35** ✓（比计划快一半）|
| 17:15 收尾 | 45 | 9（进行中）|
| **合计** | **275** | **363**（**净超时 ≈ 88 分钟**）|

> **归因**：超时**全部**集中在"**首次上手**（块2 第一版不知道 pg 怎么写）＋ **环境**（装 pg / Docker / 端口映射）"两处；而**块1 / 块4 都比计划快** ✓ —— **熟的东西快、生的东西慢**，这是正常曲线，不是能力问题 ✓

## 一句话日志

（学会了什么 ／ 卡在哪 ／ 明天第一件事）

学了什么：
| 查询类型 | 拿什么 |
| --- | --- |
| 列表（SELECT 可能多行） | r.rows.map(toTask) ← 数组 |
| 单行（SELECT … WHERE id = …） | toTask(r.rows[0]) |
| 写操作、要新行（INSERT / UPDATE） | SQL 末尾加 RETURNING … → toTask(r.rows[0]) |
| 写操作、要知道"动了几行"（DELETE） | r.rowCount（删到 0 行 = 不存在 → 路由给 404） |


卡在哪：
第一次触碰PostgresSQL 不知道具体写法
SQLite转PostgresSQL 时候SQLite很多没删干净，浪费很多时间

**明天第一件事（AI 排）**：把 `tools/mutation-check.js` 的**锚点从 sqlite 时代改成 pg 时代** ——
① M5/M6/M7 的 SQL 锚点现在要匹配 `userId = $2` 这一族（原来匹配 `AND userId = ?` ✗）
② M12 的锚点从 `.changes === 0` 改成 `n === 0`（DELETE 的返回变了）
→ 跑 `node tools/mutation-check.js`，**目标 13/13** —— 这是换引擎之后"判据的牙"第一次重新咬合。
