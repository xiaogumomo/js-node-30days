# 回访路线：容器与部署 + 数据库迁移

> **这份怎么用**：不要"背"，**照顺序打开每个文件、看指定那几行** —— 这就是"回访三处"的第①处（我自己的代码）。
> 走一遍约 20 分钟；走完你就会发现：不是没学过，是**碎片没连到文件上**。
> 行号都是 2026-10-16 核对过的（`文件:行号` 都能直接跳）。

---

## 一、容器与部署（8 步）

### 1. 镜像怎么造的 → `projects/p2-task-api/Dockerfile`（两阶段）

| 看哪 | 是什么 |
|---|---|
| `:5` `FROM node:24-alpine AS builder` | **构建阶段**：专门用来装依赖 |
| `:9` `COPY package.json pnpm-lock.yaml ./` | **先拷依赖清单再装** → 依赖没变时这一层走缓存 |
| `:11` `RUN corepack enable && COREPACK_NPM_REGISTRY=… && pnpm config set registry … && pnpm install --frozen-lockfile` | **换源那两处就是它**（10/11 卡在 corepack 下载 pnpm 时的自签证书/超时，最后靠换源解决） |
| `:16` `FROM node:24-alpine AS runner` | **运行阶段**：只带运行需要的东西（镜像更小） |
| `:19-23` `ENV NODE_ENV=production` / `COPY --from=builder /app/node_modules` / `COPY src` / `COPY db` | ⚠️ **`COPY db` 不能少** —— 迁移 SQL 在 `db/migrations/` 里，不拷进去容器起不来 |
| `:25-27` `mkdir -p /app/data && chown -R node:node` / `USER node` | **不用 root 跑**（权限小、安全） |
| `:31` `CMD ["node","src/server.js"]` | **exec 形式**（不是 `CMD node src/server.js`，那样会多一层 shell、信号转发会丢） |

### 2. 服务怎么起 → `docker-compose.yml`（两个服务）

- `:4` `app`：`:6` `build.context: projects/p2-task-api`（**上下文 = 那个目录**，compose 在那里找 Dockerfile）、`:9` `ports "3000:3000"`（宿主机:容器）、`:14` `DB_URL: postgres://app:secret@db:5432/tasks` ← **`db` 是服务名，被解析成容器名**（这就是容器间怎么互相找到）、`:15` `PORT: 3000`、`:16` `depends_on: [db]`
- `:20` `db`：`:23` `image: postgres:16-alpine`、`:25` `ports '127.0.0.1:5432:5432'` ← **只映射到本机**（10/10 那天才补的）、`:29-31` `POSTGRES_USER/PASSWORD/DB`、`:33` `volumes: pgdata:/var/lib/postgresql/data` ← **命名卷 = 容器删了数据还在**

### 3. 别把垃圾塞进镜像 → `projects/p2-task-api/.dockerignore`
`node_modules` / `data` / `*.db` / `*.db-journal` / `.git`

### 4. 本机跑一遍（四步，每步带判据）
```bash
docker compose up -d db                                  # ① 起库
docker compose exec db psql -U app -d tasks -c "select version();"   # ② 能看到 PostgreSQL 16.15
docker compose up -d --build app                         # ③ 构建 + 起服务
curl http://127.0.0.1:3000/health                        # ④ 期望 {"ok":true}
```
⚠️ **④ 能通的前提**：`src/server.js:238` 那行写了 **`host:'0.0.0.0'`** —— 不写就只监听容器内部，宿主 `curl` 报 **exit 52**（10/9 就是栽在这）

### 5. 优雅退出怎么验 → `src/server.js:133`
`:133` `app.addHook('onClose', async () => await db.close())` → `src/db.js:104` `close: ()=>pool.end()`
```bash
docker compose stop app        # 期望：日志两行（[shutdown]收到SIGTERM… / 已关闭）+ 容器 Exited (0)
```

### 6. 云端 CI → `.github/workflows/ci.yml`
`services: postgres`（把库暴露在 runner 的 localhost）→ 装依赖（p0/p2/p1/**p3**，p3 是 10/16 才补的）→ `tsc --noEmit`（p0）→ **仓库根 `node --test`**（自动发现所有 `*.test.js`）

### 7. 部署到 Railway（平台事实）
- 根目录入口 = **Source Repo 下的 `Add Root Directory`** → 填 `projects/p2-task-api`
- 变量在 **服务级 Variables** 里配：`DB_URL = ${{Postgres.DATABASE_URL}}`
- `Settings → Networking → Public networking → Generate Domain` → 判据 `curl https://<域名>/health` = `{"ok":true}`
- ⚠️ **口诀：部署成功 ≠ 部署的是最新代码** —— 看部署的**提交信息**（502 `Application failed to respond` 那次就是平台跑着旧代码）

### 8. 10/16 那次：CI 连红 3 天
真因 = 新项目 p3 的依赖没进 `ci.yml` → 仓库根 `node --test` 扫到 `p3/test/*.test.js` → `require('pino')` 崩 → 4 个文件整份加载失败 → `fail 4`
修法 = 加一行 `pnpm install --frozen-lockfile --dir projects/p3-doc-qa`
教训 = **CI 配好只是开始，"有人看"才算护栏**；看红要先分"判据失败"还是"判据没跑起来"

---

## 二、数据库迁移（6 块）

### 1. 迁移文件长什么样 → `projects/p2-task-api/db/migrations/`
- `001_init.sql:3` `CREATE TABLE IF NOT EXISTS tasks( id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0 )`
  → **`GENERATED ALWAYS AS IDENTITY` 这行就是 10/10 从 `AUTOINCREMENT`（sqlite 写法）换过来的**
- `002_users.sql:4` `CREATE TABLE IF NOT EXISTS users(…)`
- `003_users_createAt_bigint.sql` → 因为 **`Date.now()` 超过 pg `INTEGER` 的 32 位范围** → 报 **`22003`** → 把 `createAt` 改成 `BIGINT`（**迁移只追加、不改已经跑过的文件**）

### 2. 谁执行迁移 → `src/db.js:14-22` `migrate(pool)`
```
:17  按顺序读三个 .sql 文件（写死的数组）
:19  await pool.query(sql)
:21  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS userId INTEGER
```
⚠️ **诚实的说法（面试能直接用）**：我们的迁移器**不做版本表**，靠的是**每条 SQL 都幂等**（`IF NOT EXISTS` …）+ **每次启动按序执行**；
更严格的做法是"**版本表**记录已跑过哪些"（跑过就跳过）—— 两种的共同底线都是"**重跑安全**"。

### 3. 谁调它 → `src/server.js`
`:9` `require('./db.js')` → `:103` `const db = await openDb()`（**在 `buildServer()` 里**，模块顶层不许有副作用）→ `:133` 挂 `onClose`

### 4. 测试怎么隔离 → `tools/testkit.js`
`:19` 库名 = `tasks_test_<名字>`（每份判据一个独立库）→ `:25` `resetTestDb()`（建库 + 清表）→ `:34` **`42P04` = 库已存在**（pg 的 `CREATE DATABASE` 没有 `IF NOT EXISTS`，靠错误码判）

### 5. 换引擎那次动了四块（10/10 sqlite → Postgres）
① 迁移语法（`AUTOINCREMENT` → `IDENTITY`）② **驱动**（`?`→`$1`、`.all/.get/.run` → 一个 `query()`、`lastInsertRowid` → `RETURNING id`、`changes` → `rowCount`）③ `buildServer` 变 **async** ④ 测试隔离换成测试库

### 6. 证据（判据 / 脚本）
- p2 `node --test` **40/40**（含"**跨进程持久化**"那条 —— 专防"内存数组假库"）
- `scratch/02-db-selftest.js` **13 条**（含三条隔离检查）
- 真库污染检查（不再多出 `criteria-*@test.local` 用户）

---

## 三、走完之后该做的

1. 把这张表里的**条目名**对照 `review-master.md` 的 H/F 区打勾（认得就够，不用背）
2. 任何一条**你都答不出**的 → 抄进 `notes/review-unknowns.md`（只抄名字）
3. 这一份**不背** —— 它的作用是"**知道去哪个文件看**"，这本身就是 A 档之外的要求

---

## 四、那张"Docker 完整工作流"列表 vs 我实际走的路线

（起因：10/16 晚看到一份 AI 给的 9 步清单，觉得"大部分没做过" → **其实是两条不同的路线**）

| # | 教科书版（**手动镜像路线**） | 我这条（**平台 / compose 路线**） | 我做过吗 |
|---|---|---|---|
| 1 | 写代码 | 写代码 | ✅ |
| 2 | 写 Dockerfile | `projects/p2-task-api/Dockerfile`（**多阶段 + 非 root + CMD exec 形式**） | ✅ |
| 3 | `docker build` | `docker compose up -d --build app`（compose 背后就是 build） | ✅ |
| 4 | `docker tag` 打标签 | 平台/本地都不需要我打 | ❌ **不需要** |
| 5 | `docker push` 推到镜像仓库 | 没有自建 registry | ❌ **不需要** |
| 6 | 服务器 `docker pull` | **Railway 从 Git 构建**，拉取由平台做 | ❌ 平台代劳 |
| 7 | `docker run` 启动容器 | 本地 `compose up`；云端平台起容器 | ❌ 命令层没手敲（compose 代劳） |
| 8 | 端口 / 环境变量 / 卷 / 网络 | ✅ **全做过**：`ports "3000:3000"`、`DB_URL`、`pgdata` 命名卷、**`db` 服务名当主机名** | ✅ |
| 9 | Nginx / **Compose** / K8s | ✅ **Compose 做过**；Nginx / K8s 没做过 | 部分 |

**结论**：9 步里我真做过 **5 步**（1/2/3/8/9-Compose）；**没做的 4 步全在"镜像仓库"那一环** —— 因为走的是**平台路线**（构建与发布托管给 Railway）✓

**而且我做过的那部分更难**：教科书清单里**一个字都没提** —— 多阶段构建 / 非 root 用户 / 命名卷 / 服务名网络 / 优雅退出验证 —— 这些我全有 ✓

**面试口径（这条能直接背）**：

> "我走的是**平台化路线**：Dockerfile + compose 本地跑通，部署交给 Railway（从 Git 构建）。
> **手动的镜像路线我也知道**：`docker build -t <名字>:<tag>` → `docker push` 到 registry → 服务器 `docker pull` → `docker run -d -p 3000:3000 -e DB_URL=…`。
> 这个项目里不需要自己维护镜像仓库，所以那几步没做 —— **不是不会，是分工不同**。"

**术语补 3 个（只要求"认得"，不要求动手）**：**镜像仓库（registry）** / **标签（tag）** / **Docker Hub vs 私有 registry** ✓

**规矩（今天第二次同类）**：看到 AI 给的"完整工作流 / 标准做法"清单，**先问一句"这是哪条路线、我的项目走的是哪条"** —— 教科书版常常不是项目实际走的那条 ✓（上一次是"迁移版本表"那条：我也猜错了）
