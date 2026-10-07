# Day 21 — 2026-10-07（周三）

> **状态：待填写**　｜　任务书：[`day21-docker-ci.md`](day21-docker-ci.md)
> **实际开始 08:30**　｜　**第 3 周 Day 5**　｜　**今天**：容器化与 CI（**本机没 docker 版**：本地跑 CI 本体 + 容器化写成文本）
> **今天的"判据"**：`node tools/ci-preflight.js`（AI 写 + 负向验证：参照 28/28、5 个变体各红在对的条目）
> **⚠️ 诚实边界**：它**验不了** `docker build` / `compose up`（本机没 docker）→ 那一条进欠账，**别把绿当成"容器跑起来了"**
> **今天的路线（你选的）**：不装东西 —— 本地"CI 等价物"真跑 + 四个文本产物；**Postgres 换引擎挪 10/8**

## 今日目标

- [×] ⓪ **补 10/6 欠账**：`09/10/05/06/12` 五条测试 → `edge-cases.test.js` 全绿
- [×] ⓪ **补 10/6 欠账**：`node tools/mutation-check.js` **首跑**（拿到真分数，目标 ≥10）
- [×] ⓪ **补 10/6 欠账**：覆盖率 before / after（`--experimental-test-coverage`）
- [ ] ① 轮转复习 **`deepClone`**（排期表 10/7）→ 合上重写 + 判据
- [×] ② 读 3 条（CI 是什么 / Dockerfile 多阶段 / compose 怎么连库）→ **3 行笔记**
- [×] ③ **本地"CI 等价物"真跑一遍**（frozen 校验 → 真删一个包重装 → 仓库根 80 条 + 工具箱 27 条 + tsc）
- [×] ④ 写 `.github/workflows/ci.yml`
- [×] ⑤ 写 `Dockerfile`（多阶段）+ `.dockerignore`
- [×] ⑥ 写 `docker-compose.yml`（app + pg）
- [×] ⑦ `node tools/ci-preflight.js` → **0 条 ❌**
- [ ] ⑧ README「怎么跑」（本机能跑的那套命令）
- [×] ⑨ 收尾：日志 + 抽考 2 条 + `commit`（**网络通了就 push** → 让 CI 真跑一次）

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `projects/p2-task-api/test/edge-cases.test.js` | 补齐昨天的 5 条（09/10/05/06/12）|完成 |
| `.github/workflows/ci.yml` | CI：装依赖（三个包 frozen）+ 类型检查 + 全量判据 | 完成|
| `projects/p2-task-api/Dockerfile` + `.dockerignore` | 多阶段构建 | 完成|
| `docker-compose.yml` | app + postgres 一条命令起全套 | 完成|
| `tools/ci-preflight.js` | 判据（AI 写 + 负向验证）→ 用它给分 | AI 给 |
| （日志）本地 CI 实跑记录 + 覆盖率三列 | 真跑出来的数字 |完成 |

## 判据结果

| 判据 | 目标 | 实际 |
|---|---|---|
| `node --test test/edge-cases.test.js`（补完 5 条后） | 13 条全绿 |13/13 |
| `node tools/mutation-check.js` | **抓到 ≥ 10**（满分 13/13） | 
13/13 ｜ 13/13（先 12/13，补 142 行邮箱 @ → 13/13）|
| 仓库根 `node --test` | 80 条全绿 |  80/80 |
| 工具箱 `pnpm test` + `tsc --noEmit` | 27 条 / 零错 | 27/27 零错|
| **`node tools/ci-preflight.js`** | **0 条 ❌（28条检查）** |  28/28 |
| 覆盖率 line / branch / funcs | branch 应高于昨天的 77.59 | 98.22 / 88.73 / 95.45 |

**实测输出（贴真实的）**：
```
（mutation-check 的分数 + 漏网名单）
（本地 CI 等价物：三个包 frozen install 的输出 + 80 条 + 27 条 + tsc）
（ci-preflight 的 28 条 + 探针那几行）
（覆盖率三列）
```

## ① 读的 3 行（**不抄文档**）

1. CI 是什么（干净环境 / 冻结依赖 / 自动触发；`--frozen-lockfile` 为什么是"可重现"的关口）→持续集成 把代码合并到主干的时候，每次提交/合并请求都自动在另一台’干净机器‘下做一遍：拉代码、装依赖、构建、跑测试、做检查。
`--frozen-lockfile` 为什么是"可重现"的关口：--frozen-lockfile保证不同机器在相同依赖下运行代码，保证了“你这台机器上能跑的，别人那台也能跑”的依赖相同的前提条件
2. Dockerfile 多阶段（`AS builder` → `AS runner` + `COPY --from=`；不分的代价）→
builder：负责装工具、装依赖、编译、构建。
runner：负责运行，只拿构建产物和生产依赖。
COPY --from=builder /app/dist ./dist
是从builder阶段中把/app/dist 复制到该阶段
**不分的代价** ：多出许多你不需要的东西，比如工具链，旧的依赖，一些开发依赖，
源码和敏感文件，缓存和中间产物，镜像层历史
3. compose 怎么连库（`services` / `depends_on` / `POSTGRES_*`；**app 连 db 的主机名该写什么**）→ 
services 存容器，根据一个服务名中的定义创造容器（服务器名/主机名）
depends_on 控制启动顺序，在启动一个之前先让别的启动，不代表已经启动
POSTGRES_* 数据库的environment 是给Postgres 自己用的不是给应用用的

**app 连 db 的主机名该写什么**:db...

| 拆块 | 我写了什么 / 卡在哪 |
|---|---|
| ① ci.yml 的最小形态 |ai给我的代码，我只是理解加摘抄 |
| ② Dockerfile 的最小形态（只起一个 node 服务）|ai给我的代码，我只是理解加摘抄 |
| ③ compose 的 2 服务形态 | ai给我的代码，我只是理解加摘抄|

## ② 契约自查（先说一遍，判据照它判）

| 问题 | 我的回答 |
|---|---|
| **CI 那台机器上，第一步为什么是 `pnpm install --frozen-lockfile` 而不是 `pnpm install`？** | 保证依赖相同|
| **多阶段构建里，builder 阶段装的东西为什么 runner 阶段不一定要？** |要保证干净的环境，里面可能有测试，很多用不到的依赖，但可能runner只需要一个执行代码 |
| **app 容器里的代码要连 db 容器，地址里的"主机名"该写什么？**（为什么不是 `127.0.0.1`）|db:5432,127.0.0.1是回环地址，永远指向发出请求的那个容器自己 |
| **今天这个判据（ci-preflight）**能排除哪种坏法、**排除不掉哪种**？|能排除"引用路径写错 / 少 --frozen-lockfile / 单阶段 / 少 pg / 服务不同级"；排除不掉"docker build 到底过不过"（本机没 docker） |
| 昨天那 5 条测试里，哪一条最容易写成"假绿"？怎么防？ | 09 的第二条断言（数"列"不数"行"）+ 06 的邮箱（少 @ → 测的还是邮箱规则）|

## ③ 复习三触点

| 触点 | 内容 | 结果 |
|---|---|---|
| ① 开场 10 分钟：轮转 | **`deepClone`**（排期表 10/7）→ 合上重写 → `node week1-language/recall-verify.js deepClone` | |
| ② 主线前 2 分钟：讲昨天的 | 不看材料讲"10/6 最值钱的那条"：**假绿**（`/tasks/undefined` 那个 404 不是隔离，加了"前提断言"才真能挡）| |
| ③ 收尾 3 分钟：抽考 2 条 | 从抽考池（`notes/week2-review.md` §三）随机抽 2 条当场答 | |
| **明天开场要考的那条** | "--frozen-lockfile 的限定条件是什么" 或 "为什么 db: 缩进深一格就变成另一个东西"| |

③ 抽考 2 条（我从池子里替你抽的）：
#1 拼错的选项会"静默失效" —— withFileType 少个 s 会怎样？你今天撞了三次同类，说说今天这三次是什么
属性中没有这个属性，默认不执行 withFileType默认还是false readdir还是返回文件名
今天撞的：1.写api加了花括号没有返回值 2.数行而不是数列，假绿，静默失败
3.NODE_ENV写成NODE_ENV不报错

#12 ESM / CJS 语法对照 —— 默写对照表（这条笔记是 AI 写的，你当时说"还没记住"）

| ESM | CJS |
|---|---|
|用多段export来导出|就用一段exports导出|
|export default导出主要文件|module.exports导出主要文件|
|require（）导入，哪处写都写|import..from导入，静态只允许顶层，只有动态import（）f返回Promise才能放在哪里都行|
|不支持顶层await|支持顶层await|
|export*from 全部导出|exports只能一个个列|
|import*as..from全部导入|require只能一个个列|
|加载方式异步|加载方式同步|
|顶层this为module.exports|顶层this为undefined|



## 每格结束写一句"到点了，我停在哪"

| 时段 | 到点了，我停在哪 |
|---|---|
| 08:30–09:00 补欠账：5 条测试 | 10  PATCH done 再 GET 确认+ 空 body 不改字段|
| 09:00–09:25 补欠账：mutation-check 首跑 | |
| 09:25–09:40 补欠账：覆盖率 | |
| 09:40–09:50 轮转 `deepClone` | |
| 10:20–11:05 读 3 条 | CI三要素与锁文件|
| 11:05–12:05 本地 CI 等价物 | |
| 13:00–13:45 写 ci.yml | 全部完成|
| 13:45–14:30 写 Dockerfile | 全部完成|
| 14:30–15:15 写 compose | 全部完成|
| 15:30–16:00 preflight 全绿 | 全部完成|
| 16:00–16:45 README「怎么跑」| 欠账|
| 16:45–17:15 收尾 | 全部完成|

## 记账（**三行**）

| 这一遍 | 记什么 |
|---|---|
| **AI 给的** | ① 任务书 ② `tools/ci-preflight.js`（25 条检查 + 负向验证：参照 25/25、5 个变体各红在对的条目）③ CI/多阶段/compose 的**指路**（官方指南）④ 三个拆块的最小骨架 ⑤ **今天为什么改路线**（本机没 docker 的证据：`docker --version` 的输出）|
| **我自己写的** | ① 补的 5 条测试 ② `.github/workflows/ci.yml` ③ `Dockerfile` + `.dockerignore` ④ `docker-compose.yml` ⑤ 本地 CI 实跑记录 |
| **AI 帮我定位的**（目标 **≤ 3 处**） | ① PowerShell 的 rm -rf ② tsc "没反应"=零错 ③ compose 的 db: 缩进（结构错、判据当时抓不到）|

## 本地 CI 等价物：真跑出来的记录（**今天最重要的一格**）

| 步骤 | 命令 | 结果 / 发现了什么 |
|---|---|---|
| frozen 校验（三个包） | `pnpm install --frozen-lockfile --dir …` |锁文件lockfile通过 |
| 真删一个包再装回 | `rm -rf projects/p2-task-api/node_modules` + 重装 |删完包的时候没有反应=>成功删除，装回后发现添加49个重新连接|
| 全量判据 | `node --test`（仓库根）| 80条全绿|
| 工具箱 | `pnpm --dir week1-language/p0-toolkit test` |27条绿 |
| 类型检查 | `pnpm --dir week1-language/p0-toolkit exec tsc --noEmit` | 没有反应=>零错（tsc 成功时不打任何东西；实测退出码 0）|

> **这一步的意义**：CI 那台机器就是"白纸"（没有你的 `node_modules`、没有 `data/*.db`、没有你改过的全局配置）
> → 本机这一遍跑通 = "别人拿到我的项目也能跑"的最近似证明。**跑出来的问题一律先记下来。**

**本地CI等价物发现的真问题**
| 发现 | 证据 | 处理 |
|---|---|---|
|三个包的 pnpm 版本不一致	|p2 装依赖时用 12.8.1，另两个 12.3.4	|ci.yml 里钉一个版本（pnpm/action-setup 的 version）|


**frozen 校验（三个包）**
pnpm install --frozen-lockfile --dir week1-language/p0-toolkit

✓ Lockfile passes supply-chain policies (verified 14d ago) 通过锁文件检查（上次验证14天前）
Lockfile is up to date, resolution step is skipped （lockfile是最新的）
Already up to date （已经是最新的不需要再安装）
Update available! 12.3.4 → 12.9.1.     pnmp有更新
Changelog: https://pnpm.io/v/12.9.1   更新变更日志
To update, run: Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression  如果需要更新，运行这个命令
Done in 4.2s using pnpm v12.3.4 完成，耗时 4.2 秒，使用的 pnpm 版本是 12.3.4。


pnpm install --frozen-lockfile --dir projects/p2-task-api

✓ Lockfile passes supply-chain policies (verified 3d ago)
Lockfile is up to date, resolution step is skipped
Done in 39ms using pnpm v12.8.1



pnpm install --frozen-lockfile --dir projects/p1-cli-organizer

✓ Lockfile passes supply-chain policies (verified 8d ago)
Lockfile is up to date, resolution step is skipped
Already up to date
Done in 103ms using pnpm v12.3.4


rm -rf projects/p2-task-api/node_modules

Remove-Item : 找不到与参数名称“rf”匹配的参数。
所在位置 行:1 字符: 4
+ rm -rf projects/p2-task-api/node_modules
+    ~~~
    + CategoryInfo          : InvalidArgument: (:) [Remove-Item]，ParameterBindingException
    + FullyQualifiedErrorId : NamedParameterNotFound,Microsoft.PowerShell.Commands.RemoveItemCommand
（ PowerShell 的 rm 不是 bash 的 rm，**rm** 在 PowerShell 里是 **Remove-Item** 的别名）




✓ Lockfile passes supply-chain policies (verified 3d ago) 通过检查
Lockfile is up to date, resolution step is skipped  Lockfile为最新版
Packages are hard linked from the content-addressable store to the virtual store. 包正在从内存寻址储存硬链接到虚拟储存，从pnmp中的全局仓库中硬链接到当前项目的仓包库，依依赖树组织
  Content-addressable store is at: C:\Users\27971\AppData\Local\pnpm\store\v11 全局仓库在 Windows 用户目录下，版本 v11。
  Virtual store is at:             node_modules/.pnpm 当前项目的虚拟存储在 node_modules/.pnpm
Packages: +49 本次要添加 49 个包
+++++++++++++++++++++++++++++++++++++++++++++++++ 进度条
Progress: resolved 49, reused 49, downloaded 0, added 49, done
resolved解析出49个包
reused 复用本地49个包
downloaded 下载包的数量为0
added 49 往虚拟store添加49个链接
done 完成
dependencies:   表示这是 package.json 里的 dependencies
+ fastify 5.12.5  （你项目里明确要的 fastify，版本 5.12.5，已经装好了。）

Done in 452ms using pnpm v12.8.1

downloaded 0, reused 49 ← 因为你本机有 pnpm 的全局 store（C:\Users\...\pnpm\store\v11） 
CI 那台是白纸 → 它会真的 downloaded 49（从网络拉）→ 这就是 CI 比本机慢的原因之一 ✓（CI每次运行都要重新拉）





## 学会了什么

（写 2–3 条；最好有一条是"CI 的绿排除了什么、排除了不掉什么"）

1. CI = Continuous Integration，持续集成
CI 解决 不要等别人拉下来才发现问题，而是每次提交都自动验证
cl 每次开一个虚拟机保证 ： 干净环境 + 冻结依赖（每次装的是同一个依赖） + 自动触发
CI 的干净环境 + 固定 Node 版本 + 容器 接近 “你这台机器上能跑的，别人那台也能跑
容器是指 Docker/OCL 镜像作为统一运行环境 跑同一个镜像里的Node和系统依赖.

2. --frozen-lockfile 凭什么保证依赖一致
严格按照lockfile （记录精确版本、下载地址、完整性哈希） 采购清单来做
一旦不同lockfile 直接不执行，保证了每台机子都是相同依赖

--frozen-lockfile保证在相同 lockfile、相同包管理器版本、相同运行时版本、相同操作系统/架构、相同环境变量和外部服务的前提下，依赖安装结果一致。


3. 常见的Dockerfile

| 命令 | 解释 |
|---|---|
|FROM node:20   | 用node：20干净系统当底料|
|WORKDIR /app | 工作目录在/app 后面的命令都在这里执行|
|COPY . .      | 要执行的代码|
|RUN npm install  | 安装依赖|
|RUN npm run build| 构建，生成 dist|
|CMD ["node", "dist/main.js"]| 默认启动命令|
 


 # ---------- 构建阶段 ----------
```FROM node:20 AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
```

# ---------- 运行阶段 ----------
```FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

USER node
CMD ["node", "dist/main.js"]
```

**builder**：负责装工具、装依赖、编译、构建。

**runner**：负责运行，只拿构建产物和生产依赖。

COPY --from=builder /app/dist ./dist
意思是：从 builder 这个阶段里，把 /app/dist 复制到当前阶段。
**只复制你指定的文件，其他东西都不进最终镜像**。

4.  没分阶段的话，镜像里到底多了什么？
构建工具链、开发依赖、源码和敏感文件、缓存和中间产物、镜像层历史、旧版本依赖、更大的基础镜像

5. 多阶段最终镜像里有什么？
node:20-slim 基础镜像
生产依赖 node_modules
COPY --from=builder /app/dist ./dist 复制过来的构建产物
ENV、USER、CMD 等运行配置；
其他你显式复制的东西


6.
```services:
  db:
    ...
  app:
    ...
```

services 镜像表
db 服务名 也是DNS主机名 (Compose叫服务名，对应一个**容器**)
对数据库:
```db:
  image: postgres:16
  environment:
    POSTGRES_USER: appuser
    POSTGRES_PASSWORD: secret
    POSTGRES_DB: appdb
```
environment 就是往容器里注入环境变量
对数据库:
**POSTGRES_USER**：创建超级用户 appuser；
**POSTGRES_PASSWORD**：设置密码 secret；
**POSTGRES_DB**：初始化时创建一个数据库 appdb。

**POSTGRES_*** 是给数据库的“开店设置”：店名、老板、密码。

对应用：
```app:
  environment:
    DATABASE_URL: postgres://appuser:secret@db:5432/appdb
```
postgres://用户名:密码@主机:端口/数据库名
**DATABASE_URL**是给 app 的“客户地址”：去哪家店、报什么名字、进哪个房间。


**depends_on**：谁先启动
depends_on 只保证容器启动顺序，不保证数据库已经准备好接受连接
```app:
  depends_on:
    - db
```
意思是启动app前需要先启动db


**volumes**：数据库的“保险柜”

```services:
  db:
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```
这里有两层：

pgdata 是一个命名卷；

它被挂载到容器里的 /var/lib/postgresql/data，也就是 Postgres 存数据的地方。

db如果被删除了 pgdate也存着它的数据

容器（db）就像一个临时租客，随时可能被赶走。
卷（pgdate）就像一个保险柜，租客走了，保险柜还在。
下次新租客来了，打开保险柜，数据还在。

只有**docker compose down -v**才会连卷一起删


| 类型 | 写法 | 适合 |
|---|---|---|
|命名卷	|pgdata:/var/lib/postgresql/data	|生产、数据库|
|绑定挂载|	./pgdata:/var/lib/postgresql/data|	开发、看文件|
|匿名卷	|/var/lib/postgresql/data	|不推荐，难管理|


完整线路

浏览器 http://localhost:3000/users 假设
  → localhost:3000   本地访问3000
  → app 容器:3000   compose把请求给app
  → process.env.DATABASE_URL app代码读process.env.DATABASE_URL
  → db:5432   app读到后想db主机发起连接
  → Compose DNS  Compose内置的DNS把db解析成db的IP
  → db 容器:5432   连接到达db 5432端口
  → Postgres 数据目录  Postgres 校验用户名 appuser、密码 secret、数据库 appdb → 校验通过返回数据
  → pgdata 卷  存储数据到卷中


7. PowerShell 里 rm / ls / cat / cp 全是别名，参数跟 bash 不一样 

## 卡在哪里

（写 1–2 条，含"卡了多久"）
1. PowerShell 的 rm 
2. compose 的缩进 
3.  阅读 25→115 分钟 

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| **`docker build` / `docker compose up` 本机没法验**（没 docker）→ 四个产物只过了静态检查 | 装好 docker / 有网络后在 CI 上补验 |
| **CI 在 GitHub 上真跑一次**（网络此刻不通；push 成功过一次） | 网络恢复后（`git push` → 看 Actions） |
| **Postgres 换引擎**（本机没 psql 也没 docker，起不了 pg） | 10/8 或装好 docker 之后 |
| 12 处 TODO 的分块默写（JWT 5 / scrypt 2 / 框架形状 3 / 数据 2 / auth 口述 1）| 10/8 复盘日 |
| 讲解日（心法 5） | 10/8 |
| LeetCode：**10/7 必须二选一**（做 1 题 or 明确记为放弃）| 今天收尾前 |
|README「怎么跑」|明天|
|轮转 deepClone|明天开场|

## 明天第一件事

1. **10/8（周四）= 第 3 周复盘 + 部署起步**（按假期总表；复盘日要**重算结束日**）
2. 开场照旧：轮转 **`fetchWithRetry` ＋ `countByExt`**（复盘日可多抽 1–2 个，`week2-review.md` §四 排期表）
3. ⚠️ 复盘时按规则核三笔：今天是否要顺延结束日、Postgres 挪哪天、docker 装不装

## 代码/命令备忘

```bash
# ① 补欠账
cd projects/p2-task-api
node --test test/edge-cases.test.js          # 补完 5 条后应 13 条全绿
node tools/mutation-check.js                 # 首跑拿分数（漏网用 --only M5）
node --test --experimental-test-coverage     # 覆盖率三列

# ② 本地"CI 等价物"（CI 那台机器干的就是这一串）
pnpm install --frozen-lockfile --dir week1-language/p0-toolkit
pnpm install --frozen-lockfile --dir projects/p2-task-api
pnpm install --frozen-lockfile --dir projects/p1-cli-organizer
rm -rf projects/p2-task-api/node_modules && pnpm install --frozen-lockfile --dir projects/p2-task-api
cd ../.. && node --test
pnpm --dir week1-language/p0-toolkit test && pnpm --dir week1-language/p0-toolkit exec tsc --noEmit

# ③ 判据
node tools/ci-preflight.js                   # 目标 0 条 ❌

# ④ 收尾
node tools/check-md-tables.js
git add -A && git commit -m "day21: CI workflow + Dockerfile/compose (static-verified) + local CI run"
git push                                     # 不通就别硬试，记一笔
```

## 计划 vs 实际

（收尾时填：`node tools/sp-tasks.js today` 的对比表 + 一句结论）

  30m →   44m  [10/7] 17:30 收尾：日志 + 抽考 + commit（网络通则 push）
  30m →    0m  [10/7] 17:00 跑 ci-preflight → 修到 0 条红
  40m →   48m  [10/7] 16:20 写 docker-compose.yml（app + pg）
  40m →   60m  [10/7] 15:40 写 Dockerfile（多阶段）+ .dockerignore
  40m →   50m  [10/7] 14:45 写 .github/workflows/ci.yml
  50m →   38m  [10/7] 13:55 本地 CI 等价物真跑（frozen→删包重装→全量）边跑边记
—— 今天：计划 230m / 实际 240m
## 第三次"判据自己没牙、被真文件抓出来" 


① mutation-check 的 M11/M13 形态太窄
② 06 那条被邮箱规则挡住的漏网 
③ 这次 compose 的结构。 
