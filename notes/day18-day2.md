# Day 18 第 2 天 任务书（10/4 周日）：补完项目 2 骨架（7/7）+ 接上数据库（9/9）

> **这是同一天的第 2 个任务书**（Day 7 那次跨了两天的先例：任务书另开一个文件、日志往同一个文件里加一段）
> **实际开始时间：09:50**（比原计划 08:30 迟）→ 今天的时间表**按实际时间重排**了（见 §一），**结束晚一点没关系**（学生 10/4 明确说了）
> **今天只干两件事**（都是 **不许砍** 的）：① 上午：**3c 拼装 → `src/server.js` → 判据 7/7**；② 下午：**数据库 → `tasks` 表 + CRUD → 判据 9/9**
> **详细契约、四个 SQL 实验的做法、负面清单**：都在昨天的任务书 [`day18-database.md`](day18-database.md) 里，**今天不重复**，只给"按钟点排的时段表 + 开工指令"

---

## 〇 三条开场纪律

1. **启动标准**：做完 §一 的前两格（轮转 `arrayUtils` + 合上重写昨天的 scratch，共 20 分钟）就算启动成功。
2. **阅读三件套**（计划 §七 **心法第 11 条**，10/3 刚加的）：读什么（编号知识点）/ 读到**能做 X** 就停（+ 不要点开的负面清单）/ 读完立刻一个 10 分钟 demo。
3. **每格结束在 `notes/day18.md` 写一句**"到点了，我停在哪：___"（让"叫停"变成可查的动作）。

## 一 今天的时间表（按 09:50 重排）

| 时段 | 干什么 | 计划 |
|---|---|---|
| **10:00–10:05** | 轮转复习：`arrayUtils`（**合上重写**）→ `node week1-language/recall-verify.js arrayUtils` | 5 分 |
| **10:05–10:20** | **合上重写 10/3 的 scratch**（起服务 + `/health` + `/tasks` + `/tasks/:id` + `PORT`，**只留一个 `listen`**）→ 起服务后 curl 三条 | 15 分 |
| **10:20–10:35** | 读：Fastify **Errors** 那页（只读 `setErrorHandler` 那段；**对照你昨天整理的 Express 404/500 笔记**）| 15 分 |
| **10:35–10:50** | demo：`onRequest` 钩子 + `setErrorHandler`（块 ③④）| 15 分 |
| **10:50–13:00** | **3c 拼装 → `src/server.js`** → `node --test projects/p2-task-api/test/server.test.js` → **7/7** | 130 分 |
| 13:00–13:50 | 午饭 + **离开屏幕** | 50 分 |
| **13:50–14:50** | 四个 SQL 实验 → `week3-backend/day18-sql-basics.js` | 60 分 |
| **14:50–17:20** | `db/migrations/001_init.sql` + `tasks` 表 + CRUD → `node --test projects/p2-task-api/test/tasks-crud.test.js` → **9/9** | 150 分 |
| **17:20–17:40** | ④ 阅读四行 + 无权限实测（**挂了 5 天的欠账**）| 20 分 |
| **17:40–17:55** | 收尾：日志 + `node tools/sp-tasks.js today`（**计划 vs 实际**）+ `git commit` + `push` | 15 分 |

**砍单顺序**（时间不够就从下往上砍）：① ④ 阅读四行 + 无权限实测 → ② 第 4 个 SQL 实验（Postgres 差异）→ ③ 块③ 的钩子（请求日志）→ ④ `?done=` 过滤。
**不许砍**：**7/7**、**9/9**、**建表/迁移 SQL 进 git**。

## 二 上午：3c 拼装（契约细节见 `day18-database.md` §二）

**契约（判据照它判）**：

```
src/server.js  导出 buildServer() —— **不许自己 listen**（谁调用谁决定端口）
               直接运行（node src/server.js）时才监听 → 读 process.env.PORT，默认 3000
  GET /health  → 200 + JSON {"ok":true}
  GET /tasks   → 200 + JSON []（今天还是空数组；下午接上真库）
  GET /boom    → 故意抛错（只在非 production 注册）→ 500 + JSON，且**进程不许崩**
  未知路径      → 404 + JSON
```

**跑**：`node --test projects/p2-task-api/test/server.test.js` → **7/7**

> ⚠️ 两条昨天/今天已经验证过的事实，别再纠结：
> ① 判据**已经改成框架无关**了（Fastify 放心用；node:http / Fastify / Express 三家参照实现都实测 7/7）；
> ② **Fastify 的 `listen` 只吃对象**（`listen({port})`）；**一个实例只 listen 一次**（你撞过 `FST_ERR_REOPENED_SERVER`）。

## 三 下午：数据库（做法/实验清单见 `day18-database.md` §三）

- **路径定案**（10/3 环境实测：没有 Docker、没有 `psql`）→ 今天用 **`node:sqlite`（Node 24 内置，零依赖）**；Postgres 放到 **Day 21（容器化，docker-compose 带 pg）**。
- **四个 SQL 实验**（建表 / 事务 ROLLBACK / 索引前后两个耗时 / Postgres 差异 4 行）。
- **CRUD 契约**（判据照它判）：
  `POST /tasks` 201+id ｜ `GET /tasks` 200 数组 ｜ `GET /tasks/:id` 200 / **404 JSON** ｜ `PATCH /tasks/:id` 200 / 404 ｜ `DELETE /tasks/:id` 204或200 / 404 ｜ `title` 缺失 → 400/422；**`DB_FILE` 在 `buildServer()` 调用时读**（默认 `data/tasks.db`）；建表 SQL 写在 `db/migrations/001_init.sql`。
- **跑**：`node --test projects/p2-task-api/test/tasks-crud.test.js` → **9/9**

> **`06 跨进程持久化` 是这份判据里最要紧的一条**：建一条 → **杀掉进程** → **换个进程起同一个 `DB_FILE`** → 数据还在。
> 实测过：**假内存数组**的实现 `01–05` 全绿、只有 `06` 红；真 `node:sqlite` 那份 **9/9**。
> 所以 `06` 红了不是刁难你，是它在替你验"**真的落库了**"。

## 四 四条提醒

1. **顺序**：`node --check` 在"往文件里加东西"之前；`git status` 在 `git add -A` 之前；**装包/建库在这些之前**（包昨天已装好）。
2. **判据的牙**：每条能说出"它在防哪种坏法"（今天最好的一条 = `06`）。
3. **记账两行**：哪部分是 AI 给的 / **我自己写了哪几块**。
4. **问 AI 只问"指路 / 诊断 / 核对"**；拿到帮助后的必做动作：看 30 秒 → 合上 → 自己写 → 对照。
