# Day 24 任务书（10/10 周六）：**换数据库引擎 —— sqlite → Postgres**

> **日期**：2026-10-10（周六）　｜　**实际开始 __:__**　｜　**Day 24**
> **接昨天**：10/9 完成 —— docker 尾（**Postgres 第一次真跑** ✓）／数据层抽成 `src/db.js`（39/39 ＋ 突变 13/13）／优雅退出（容器内验证）／轮转两条 ／服务活体 ／LeetCode 首题（Two Sum 65/65）
> **为什么今天换引擎**：10/8 定的"Postgres 拆两步"——**装的那半 10/9 已完成**（容器真跑 ✓），剩的就是**要写代码的那半**，所以排在 docker 之后 = 今天 ✓
> **今天的判据（硬）**：① 迁移在 Postgres 里跑通（`\d tasks` 看得到表 ＋ 列）② **三份回归 7/9/10 ＋ 仓库 39/39 全绿**（= 换引擎没改对外行为）③ **连跑 3 遍都全绿**（换引擎后最容易翻车的其实是测试隔离）④ 突变检查 **13/13**（M5/M6/M7 仍命中 `--impl2`）⑤ 服务活体在 **Postgres 上**重跑（建 / 查 / 隔离 404）
> **今天的规矩**：**只排这一道新主线**（换引擎 ＋ 它的连带改动就够一整天）；**每改一块就跑判据**；**搬家/改造类改动沿用昨天的护栏——关键名字对账**（`db.js` 里 `DB_URL` / `$1` 这些，一字不差）

---

## 〇 今天的产出物

| # | 产出物 | 验收 |
|---|---|---|
| 1 | `db/migrations/*.sql` 改成 Postgres 语法 | 在 pg 里跑一遍不报错；`\d tasks` / `\d users` 看到列 |
| 2 | `src/db.js` 换成 `pg`（连接池 ＋ 异步 ＋ `$1` 占位符） | 增 / 删 / 改 / 查四条 SQL 各跑通一次 |
| 3 | `buildServer()` 的 async 落地（＋ 4 份判据同步） | `node --test` **39/39** |
| 4 | 测试隔离换成"测试库 / 独立 schema" | **连跑 3 遍 39/39** |
| 5 | 顺手清账：`server.test.js` 补隔离 3 行 | 跑完仓库测试后，真库里**不再多出** `criteria-*@test.local` 用户 |
| 6 | README 对账 | 依赖从"只有 fastify"改成含 `pg`；"容器里数据不持久"那条重写 |

---

## 一 开场：探环境 ＋ 最小示范（30 分钟，别跳）

```powershell
cd C:\Users\27971\.zcode\workspace\default\js-node-30days
docker compose ps                                                     # 判据：db = Up
docker compose exec db psql -U app -d tasks -c "select version();"    # 判据：PostgreSQL 16.x
cd projects\p2-task-api
pnpm add pg                                                           # 判据：装上了
```

**最小示范（先不碰 `server.js`）**：新建 `scratch/01-pg-connect.js` —— 用 `pg` 连上、跑一次 `SELECT 1`、把结果打出来。
→ **跑通就算这一步过**（它同时证明三件事：驱动装了 ✓ 网络通了 ✓ 用户名密码对 ✓）。

**骨架（形状我给，跑通和后面的改造是你的事）**：

```js
// scratch/01-pg-connect.js —— 最小示范：驱动 / 网络 / 认证 三件事一次验完
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DB_URL || 'postgres://app:secret@localhost:5432/tasks' });

(async () => {
  const one = await pool.query('SELECT 1 AS ok');   // ① 最便宜的一次往返
  console.log('SELECT 1 →', one.rows);
  const v = await pool.query('SELECT version()');    // ② 确认对面真的是 Postgres
  console.log('version →', v.rows[0].version);
  await pool.end();                                  // ③ 收尾：谁开的谁关（跟昨天的 onClose 同一个道理）
})().catch((e) => { console.error('连不上：', e.message); process.exit(1); });
```

**逐行说清**（能讲出来才算懂）：
- `new Pool({...})` = 造一个**连接池**（不是一条连接）：池自己管借出 / 归还 / 重连，`query()` 每次从池里借一条
- `await pool.query(...)` = **异步**（这就是为什么今天 `db.js` 整体要变异步的原因）
- `pool.end()` = 关闭池。**不收尾的话进程不会退出** —— 跟昨天"信号 / 优雅退出"是同一族的收尾问题
- `.catch` + `process.exit(1)` = 连不上时给**一句人话 + 非零退出码**（不是崩栈）

**记账**：骨架 = AI 给的；跑通 + 之后的改造 = 你。

⚠️ **连接串**：本机连 = `postgres://app:secret@localhost:5432/tasks`（**容器之间**互联才用服务名 `db`——compose 里 `app` 用的是 `db`，本机跑用 `localhost`，这里最容易搞混）。

---

## 二 主体：四块，一块一判据（从下往上砍）

### 块 1：迁移文件改 Postgres 语法（40 分钟）

- `INTEGER PRIMARY KEY AUTOINCREMENT` → **`id GENERATED ALWAYS AS IDENTITY PRIMARY KEY`**（pg 写法；`SERIAL` 也行，选一个并写下理由）
- ⚠️ **别顺手把 `done` 改成 `boolean`**：那会连带改 `toObj`、路由、判据 —— **保持 0/1，少改一处**（这是"控制改动面"，不是偷懒）
- 判据：手工在 pg 里把两个文件跑一遍 → `psql -U app -d tasks -c "\d tasks"`

### 块 2：`src/db.js` 换成 `pg`（60 分钟）

对照清单（左＝旧，右＝新），**一条一条对**：

| 现在（sqlite） | 换成（pg） |
|---|---|
| `new DatabaseSync(file)` | `new Pool({ connectionString: process.env.DB_URL })` |
| `db.exec(sql)` | `await pool.query(sql)` |
| `db.prepare(...).run/get/all(参数)` | `await pool.query(sql, [参数])` → `result.rows` |
| 占位符 `?` | **`$1` / `$2`**（**这条最容易被手滑漏掉**——漏了就是静默错） |
| `info.lastInsertRowid` | `INSERT ... RETURNING id` → `result.rows[0].id` |
| `info.changes` | `result.rowCount` |
| `PRAGMA table_info(tasks)` | `information_schema.columns`（或 `SELECT to_regclass('tasks')`） |

- 判据：**先用一个临时脚本把四条 SQL 各跑通**（增 / 删 / 改 / 查），**再**去改 `server.js`（不要两边同时动）

### 块 3：`buildServer()` 的 async（40 分钟｜**今天最关键的一格**）

连接和迁移都变异步了，所以 `buildServer()` 的**契约要变**。两个方案，开工时**二选一并写下理由**：

- **方案 A**：`buildServer()` 变 `async` → 判据里 `const app = await buildServer()`（改动最直白）
- **方案 B**：`buildServer()` 保持同步，另加 `await initDb()`（入口和判据各调一次）→ 要小心"谁先谁后"

⚠️ **契约变了，判据必须跟着改**（4 份测试文件里的调用点）——这是**正当的**同步修改，但要在提交信息里写明"契约变更"。
判据：`node --test` → **39/39**（这一步不过，今天不许往下走）

### 块 4：测试隔离换成"测试库"（60 分钟）

`mkdtempSync` + `DB_FILE` 那套是 **sqlite 专用**的，现在失效了。换成：

- 连**同一个 Postgres**，但用**独立 schema**（或专用库 `tasks_test`）
- 每个测试文件在 `before` 里 `DROP TABLE IF EXISTS tasks, users CASCADE` ＋ 重跑迁移 → **保证干净起点**
- 判据：**连跑 3 遍 `node --test`，三遍都 39/39**（防"第二遍被第一遍的数据污染"）
- ⚠️ 顺手把 **`server.test.js` 的隔离**补上（昨天抓到的账：它一直在往真库塞 `criteria-*@test.local` 用户，已积 24 个）

---

## 三 小账（主体做完再挑；砍单顺序从下往上）

1. README 对账（依赖多了 `pg`；"容器里数据不持久"那条要重写）
2. **轮转 #11 恢复**（事件循环：① `setTimeout/setInterval` → **timers**、`setImmediate` → **check** ② 微任务为什么在两个宏任务之间清空——**用自己的话讲一遍**："一个宏任务执行完、在取下一个之前，微任务队列会被清空，这样 Promise 回调不必等到下一轮"）
3. **LC O(n) 重写**：Two Sum 先用 `{}`、再用 `Map` **各写一版**（各自的复杂度写注释；对比提交后的 ms）
4. Fastify `host:'0.0.0.0'`（容器/线上必须；本机不影响）
5. 给判据补一条"**列表按 id 排序**"断言（昨天丢 `ORDER BY id` 时，没有一条测试发现）

**⛔ 不许砍**：块 1–块 4 ＋ **39/39 连跑 3 遍** ＋ **服务活体在 pg 上重跑** ＋ 收尾提交。

---

## 四 时间表（09:00 起，按实际顺延）

| 时段 | 干什么 | 计划 |
|---|---|---|
| 09:00–09:30 | 探环境 ＋ 最小示范（连上 pg、`SELECT 1`） | 30 分 |
| 09:30–10:10 | **块 1** 迁移文件改 pg 语法 | 40 分 |
| 10:10–11:10 | **块 2** `db.js` 换 `pg` | 60 分 |
| 11:10–11:40 | 块 2 自测（四条 SQL 各跑一次） | 30 分 |
| 11:40–12:20 | **块 3** `buildServer()` async ＋ 判据同步 | 40 分 |
| 12:20–13:20 | 午饭 ＋ 离开屏幕 | — |
| 13:20–14:20 | **块 4** 测试隔离（＋ `server.test.js` 补 3 行） | 60 分 |
| 14:20–15:00 | 服务活体（**在 Postgres 上**重跑 curl 全流程） | 40 分 |
| 15:00–15:20 | 突变检查 13/13 | 20 分 |
| 15:20–16:20 | 小账（从 1 往上挑） | 60 分 |
| 16:20–17:05 | 收尾：日志 ＋ 计划 vs 实际 ＋ commit ＋ push | 45 分 |

**砍单顺序**：① 小账全砍 → ② 服务活体压成"只跑一条越权 404" → ③ 突变检查挪明天。
（**块 1–4 一格都不许砍**——今天只要把这四块做完就是成功的一天。）

---

## 五 开工前要确认的三件事（30 秒）

1. `docker compose ps` → **db 是 Up**（不是的话：`docker compose up -d db`）
2. `pnpm add pg` 能不能装上（网络不稳就先记账、换 `npm i pg` 试）
3. pg 里的 `tasks` 库存在吗（compose 的 `POSTGRES_DB: tasks` 会自动建 ✓，`\l` 看一眼）

> **一句提醒**：今天最容易翻车的不是 `pg` 的 API，而是**"改动面失控"**——迁移语法、`db.js`、`buildServer()` 契约、4 份判据、测试隔离，五处会连着动。**一块一跑，绿了再动下一块**；任何一刻 39/39 红了，就回到上一块的状态，别叠着改。
