# Day 21 任务书（10/7 周三）：容器化与 CI —— **本机没 docker 版**

> **日期**：2026-10-07（周三）　｜　**第 3 周 Day 5**　｜　**实际开始 08:20**（时间表按此排）
> **接昨天**：10/6 你第一次自己写测试 —— `test/edge-cases.test.js` **8 条全绿** + **两处测试驱动的修复**（坏 JSON→400 / 乱码 token→401）+ 回归 10/10+7/7+9/9 + 仓库根 **80/80**；提交 `1da0992` 已推
> **⚠️ 今天的形态是"改过的"**：本机**没有 docker / docker compose / psql**（08:20 实测），而且 **GitHub 此刻连不上**（`git ls-remote` 报 `Connection was reset`；但昨天那次 push 是成功的，所以网上应该没问题，只是现在不通）
> → **你选的路线**：**不装东西** —— 把 CI 的**本体**在本地真跑一遍，容器化写成**文本产物**，Postgres 换引擎挪到 10/8（等 docker 或本地 pg）
> **今天的"判据"**：`node tools/ci-preflight.js`（AI 写 + 负向验证 25/25 / 5 个变体各红在对的条目）
> **⛔ 诚实边界**：这个判据**验不了 `docker build` / `compose up`** —— 那一条今天只能进欠账。**别把它的绿当成"容器跑起来了"。**

---

## 〇 今天的产出物 + 为什么做它

| # | 产出物 | **为什么做它** | 验收 |
|---|---|---|---|
| 0 | **补 10/6 欠账**：5 条测试 + `mutation-check` 首跑 + 覆盖率 | 昨天的边角账，15–45 分钟能清 | `edge-cases.test.js` 全绿 + `mutation-check` **真跑出分数** |
| 1 | **本地"CI 等价物"真跑一遍** | **CI 的本体 = "在干净环境里跑同一套命令"**。本机就能体验：删掉 `node_modules` 再装回来 —— 这一步能抓出"我们机器上碰巧能跑"的所有问题 | 三个包 `pnpm install --frozen-lockfile` 都过 + 仓库根 `node --test` 全绿 + `tsc --noEmit` 零错 |
| 2 | **`.github/workflows/ci.yml`** | 把"那一串命令"交给机器：push 就跑、跑在白纸一样的机器上。**它是"另一个人能不能跑我的项目"的机器版** | preflight 绿；网络恢复 push 后**真跑一次**看结果 |
| 3 | **`Dockerfile`（多阶段）+ `.dockerignore`** | 把"这个服务需要什么才能跑"写成可执行的说明书；多阶段 = 构建环境和运行环境分开（镜像不带编译工具） | preflight 绿（含 `COPY` 源路径、多阶段、CMD） |
| 4 | **`docker-compose.yml`（app + pg）** | 一条命令起"服务 + 数据库"两个容器 —— **这就是"环境一致性"** | preflight 绿（app + postgres + `POSTGRES_*`） |

**⛔ 不许砍**：① 补欠账（至少 `mutation-check` 要跑出真分数）② **本地 CI 等价物真跑一遍** ③ 四个文本产物 + preflight 绿 ④ 收尾提交。

### 卡住时的第一步：先分类

| 长什么样 | 处理 |
|---|---|
| **(a) 没写过 Dockerfile / workflow**（今天的全部主角）| 这是**首次上手** → 走"最小可跑（这里=最小可交）骨架 + 逐行读懂"，**别整份照抄**（昨天 193 分钟的教训） |
| **(b) 命令忘了**（`pnpm install` 的参数、`node --test`）| 查你自己昨天写的日志/任务书 |

**时间盒**：卡住 15 分钟换路子。**今天的计数单位**：preflight 的红条数（目标 0）。

---

## 一 今天的时间表（按 08:20 排）

> ⚠️ **08:25 定版**（我一度按"09:10 开始"排了表 —— 那是我**推断**的，`date` 实测是 08:2x，已重排）→ **以 SP 里的时段表为准**：补三条欠账 30+25+15 → 轮转 10 →（休）→ 读 3 条 45 → 本地 CI 真跑 60 →（午饭）→ ci.yml 45 → Dockerfile 45 → compose 45 → preflight 30 → README 45 → 收尾 30，**约 17:15 结束**。今天排得比昨天轻（7 小时），别再往前塞东西。

| 时段 | 干什么 | 计划 |
|---|---|---|
| **08:25–08:55** | **补欠账 ①**：把 `09 空 title` / `10 PATCH done` / `05 密码错` / `06 注册校验` / `12 DELETE` 五条集成测试写了 | 30 分 |
| **08:55–09:20** | **补欠账 ②**：`cd projects/p2-task-api && node tools/mutation-check.js` → **首跑拿分数**（漏网用 `--only Mx` 补） | 25 分 |
| **09:20–09:35** | **补欠账 ③**：覆盖率 before/after（`node --test --experimental-test-coverage`）→ 记三列 | 15 分 |
| **09:35–09:45** | 轮转复习 **`deepClone`**（排期表 10/7）→ 合上重写 + 判据 | 10 分 |
| 09:45–10:15 | 休息（离开屏幕） | 30 分 |
| **10:15–11:00** | **读**（§二 阅读三件套：CI 是什么 / Dockerfile 多阶段 / compose） | 45 分 |
| **11:00–12:00** | **本地"CI 等价物"真跑**（§三.1：先 frozen 校验 → 再真删一个装回来 → 全量） | 60 分 |
| 12:00–13:00 | 午饭 + 离开屏幕 | — |
| **13:00–13:45** | **写 `.github/workflows/ci.yml`**（§三.2 契约） | 45 分 |
| **13:45–14:30** | **写 `Dockerfile`（多阶段）+ `.dockerignore`**（§三.3） | 45 分 |
| **14:30–15:15** | **写 `docker-compose.yml`（app + pg）**（§三.4） | 45 分 |
| 15:15–15:30 | 休息 | 15 分 |
| **15:30–16:00** | **跑判据**：`node tools/ci-preflight.js` → 修到**全绿** | 30 分 |
| **16:00–16:45** | 留存：把"怎么跑"写进 README（本机能跑的那套命令）+ 昨天日志没填的格子 | 45 分 |
| **16:45–17:15** | 收尾：日志 + 抽考 2 条 + `commit`（**网络通了就 push** → 让 CI 真跑一次） | 30 分 |

**砍单顺序**（不够就从下往上）：① README 那 45 分钟 → 压成"抄一遍命令"（15 分钟）→ ② compose 的 healthcheck / 初始化 SQL → ③ workflow 的 pnpm 缓存 → ④ preflight 的探针部分**不用管**（它只记录不判错）。**不许砍**：本地 CI 真跑 + 四个产物 + preflight 绿 + 提交。

---

## 二 读（45 分钟，**阅读三件套** —— 心法第 11 条）

**① 读什么（就这 3 条编号 —— 今天三条都长，别贪多）**：

1. **CI 到底是什么**：为什么必须"干净环境 + 冻结依赖 + 自动触发"；`--frozen-lockfile` 凭什么能保证"你这台机器上能跑的，别人那台也能跑"
   → 读到能做：**说出"CI 那台机器上，第一步为什么是 `pnpm install --frozen-lockfile` 而不是 `pnpm install`"**
2. **Dockerfile 的多阶段构建**（`FROM ... AS builder` → `FROM ... AS runner` + `COPY --from=builder`）：为什么要分两个阶段、没分的话镜像里多了什么
   → 读到能做：**说出"builder 阶段装的东西，为什么 runner 阶段不一定要"**，并且能指出你那份 Dockerfile 里**哪一行是"从上一阶段拿东西"**
3. **compose 怎么把"服务 + 数据库"连起来**：`services:` / `depends_on` / `environment`（`POSTGRES_*` 与 app 的连接串）/ 卷
   → 读到能做：**说出 app 容器里的代码要连到 db 容器，地址里的"主机名"该写什么**（提示：不是你本机的 `127.0.0.1` —— 这是容器网络的第一课）

**② 读到什么程度就停**：每条能**用自己一句话**说出来（尤其第 3 条那个"主机名"）

**③ 不要点开**（负面清单，今天点了就跑偏）：
- k8s / Swarm / 编排进阶
- Dockerfile 的 buildkit 高级语法（`--mount=type=cache`）—— 第 4 周再说
- GitHub Actions 的矩阵构建 / 复用 workflow / 自建 runner
- 多架构镜像（arm64/amd64）、镜像瘦身技巧（distroless/alpine vs slim 之争）
- Compose v1 vs v2 的历史（你已经用 v2 语法）

**④ 读完产出**：**3 行笔记** + 每读完一条**立刻去写对应的那个文件**（第 2 条 → Dockerfile；第 3 条 → compose）。

---

## 三 做（契约 —— 判据 `tools/ci-preflight.js` 照这个判）

### 1 本地"CI 等价物"：**今天最真的一件事**（60 分钟）

CI 的本体就是这串命令。本机跑一遍 = 你亲身经历"那台白纸机器"：

```bash
# ① 先做"不删"的冻结校验（快；能过说明 lockfile 和 package.json 是一致的）
pnpm install --frozen-lockfile --dir week1-language/p0-toolkit
pnpm install --frozen-lockfile --dir projects/p2-task-api
pnpm install --frozen-lockfile --dir projects/p1-cli-organizer

# ② 再挑一个**真删掉**，装回来 —— 这才是"干净环境"
rm -rf projects/p2-task-api/node_modules
pnpm install --frozen-lockfile --dir projects/p2-task-api

# ③ 全量判据 + 类型检查（CI 里就这几条）
node --test                                         # 仓库根：应 80 条全绿
pnpm --dir week1-language/p0-toolkit test           # 工具箱 27 条
pnpm --dir week1-language/p0-toolkit exec tsc --noEmit
```

⚠️ **注意 `--frozen-lockfile` 的意义**：lockfile 与 `package.json` 不一致时它会**直接失败**（而不是悄悄装一份新的）→ 这就是"可重现"。
⚠️ **这一步真会发现问题**（这就是它的价值）：比如某个包没被写进 `package.json`、某条判据依赖你本机的残留状态、某个测试打了真库。
**真跑出来的问题 → 记进日志**（不管修不修，先记）。

### 2 `.github/workflows/ci.yml`（必备要素 = preflight 的检查项）

- `on:`（push / pull_request）
- `actions/checkout` + `actions/setup-node`（**node-version: 24**，和本机一致 —— 不一致就会出现"本地绿 CI 红"）
- 装 pnpm（`pnpm/action-setup` 或 `corepack enable`）
- **`pnpm install --frozen-lockfile`**（三个包各一次；`--dir` / `working-directory` 引用的路径必须真的存在）
- 至少一条跑测试的命令（`node --test`）
- 可选：`tsc --noEmit`

### 3 `Dockerfile`（多阶段）+ `.dockerignore`

- **放哪你定**（`projects/p2-task-api/Dockerfile` 更合理 —— 构建上下文就是那个目录）；**`.dockerignore` 要跟它放一起**
- ≥2 个 `FROM`（`AS builder` / `AS runner`）；`WORKDIR`；`CMD` 或 `ENTRYPOINT`
- **每个 `COPY` 的源路径都要在上下文里真的存在**（`COPY srcc ./src` 这种拼错，preflight 会红 —— 而且**只有本机也能抓**）
- `.dockerignore` 至少要有：`node_modules` / `.git` / `*.db`
- ⚠️ 不要从构建上下文拷 `node_modules`（要在镜像里重装；要拷也只能 `COPY --from=<阶段>`）

### 4 `docker-compose.yml`（app + db）

- `services:` 里一个 app（用你的 Dockerfile build）+ 一个 **postgres 库**
- 库服务要有 `POSTGRES_USER/PASSWORD/DB`（镜像靠它们初始化）
- app 的 `environment` 里给出连库地址；`depends_on`
- `build.context` / `dockerfile` 路径要存在（**`dockerfile:` 是相对 `context:` 的**）

### 5 跑判据

```bash
node tools/ci-preflight.js      # 目标：0 条 ❌
```

它只记录不判错的部分（探针）：端口映射、镜像 tag、有没有 healthcheck、wait 脚本 —— 都是设计选择，**红不了**，但日志里值得记一句。

---

## 四 四条提醒

1. **顺序**：`node --check` 在加代码之前；`git status` 在 `git add -A` 之前；**每写完一块跑一次**。
2. **"绿"要说得出它排除了什么**：今天 preflight 的绿 = "静态引用都对得上"，**它排除不掉"容器起不来"** —— 所以日志里必须写一句"本机没能验 build/compose"。
3. **记账三行**：AI 给的（任务书 / `ci-preflight.js` + 负向验证 / CI 概念的指路 / 最小骨架）/ 我自己写的（四个文本产物 + 本地 CI 实跑记录）/ AI 帮我定位的（目标 ≤ 3 处）。
4. **网络**：`git push` 一次不通就**别硬试**（记一笔"网络不通"），本地提交照样做 —— CI 那一步等网络恢复。
