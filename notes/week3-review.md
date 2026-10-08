# 第 3 周复盘（2026-10-08）

> **§一 的数字是 AI 复跑出来的；§二 / §三 / §四 是 AI 起草的初稿**（照第 2 周复盘的先例），**§五 留给复盘 C**。
> **判定权在你**：不看"眼熟"，看**当场能不能合上材料说出来** —— 答得出 → 划掉；答不出 → 留下。
> ⚠️ **"脑袋空空"不等于"不会"**：今天 `dirSize` / `fetchWithRetry` 你也是"一个都想不起来"，实测 **10/10** 和 **8/8** ✓

---

## 一 周自测（闭卷重写）

| 模块 | 判据 | 结果 | 卡在哪 |
|---|---|---|---|
| `fetchWithRetry` | `node --test week2-runtime/day13-fetch-verify.js` | **8/8** ✓ | ① 签名漏了 `options` ② `setTimeout(controller.abort(),…)` 传了**调用结果** ③ `let = res`（静默）④ `HttpError(lastError)` 传错东西 |
| `dirSize` | `node --test week2-runtime/day10-dir-size-verify.js` | **10/10** ✓ | 全在 CLI 层：`report.json()`（不存在的方法）→ 掉进 catch → 退出码 1 + 文案撒谎 |
| （自写判据） | `week2-runtime/week3-self-test-verify.js` | **？待你确认** | 没做 → 记欠账 |

> **一句结论**：两个模块的**本体全对**，红的都在"接线 / CLI 层" → 这正是你的老族（接线 + 手滑），不是"没学会"✓

---

## 二 「还会的」（AI 起草，带本周实测证据）

| # | 内容 | 证据 |
|---|---|---|
| 1 | `dirSize` 的递归遍历（`walk` + `withFileTypes` + 相对路径 + 排序截断） | 今天闭卷重写 **10/10**（只错在 CLI 层） |
| 2 | `fetchWithRetry` 的重试/退避/超时（`await sleep(waitMs*2**(attempt-1))` + `AbortController` + `signal`） | 今天闭卷重写 **8/8**（退避与 signal 第一版就对） |
| 3 | `parseArgs` 框架（`args` / `options.<名>` / `type` 只能 string、boolean / `allowPositionals` / `values` + `positionals`） | 默写 + 自写判据 **3/3**（9/30、10/2） |
| 4 | 隔离测试"四步"写法（列表不含 + GET/PATCH/DELETE 各 404 + **自己 GET 仍 200**） | `edge-cases.test.js` **13/13**（10/7）+ 接手那一刻亲手抓到的假绿 |
| 5 | **判据的牙**：前提断言、借来的红不算、突变测试 | `mutation-check` **13/13**（10/7）；今天又亲手抓了三处"没牙" |
| 6 | **CI 闭环**：本机的绿 ≠ 云端的绿 | 10/8：CI 从 `failure`（exit 127）→ **`success`**，拼写错是**云端**抓到的 |
| 7 | `scrypt` + 盐 + `timingSafeEqual` 的用法 | 10/5 auth **10/10** + 10/6 单元测试 4 条 |

---

## 三 「忘了的」＝ 每日抽考池

> **用法（你的主意，很好）**：逐条打三档 —— ① **能当场说清 → 划掉** ／ ② **要翻材料才说得出 → 留池** ／ ③ **完全没印象 → 留池 + 排进轮转**。
> ⚠️ **别按"想不起来"一刀切**（今天两个模块就是反例 ✓）。

### A Web 框架（Fastify）

| # | 知识点 | 住哪 | 打哪档 |
|---|---|---|---|
| 1 | `buildServer()` 为什么**不许自己 listen** | 【你的笔记】`notes/day20.md` §①第 3 条（第 60 行：你写了“构建和启动要分离…抢 3000…app.inject”） | ②，原则上构建和启动要分离，在buildServer中listen将变得不可控，无法控制它的开关，如果遇到多个文件而且需要listen，同时运行会遇到抢3000的问题，app.inject将不要listen但仍然会执行|
| 2 | 路由形状 + `req.params` / `req.query` / `req.body` | 【你的笔记】`notes/day20.md` §①第 3 条 ＋【代码】`projects/p2-task-api/scratch/01-health.js` |②，req.params 取tasks/:id 中的id的值（不用：）req.query取url中？后面的部分 req.body在没有中间件的时候为undefined req.body就是客户端发出请求塞在请求体里的数据|
| 3 | `onRequest` 钩子 | 【代码】`src/server.js:120`（`app.addHook("onRequest")`） |②钩子hooks就是生命周期的扩展点，里面塞功能 onRequest Hook 在请求还未解析的钩子,preParsing Hook在解析请求体之前触发 preValidation Hook Schema验证前的钩子（req.body已经有了） |
| 4 | 统一错误处理：`setErrorHandler` + **要信错误自带的 `statusCode`（4xx 原样、其余 500）** | 【代码】`src/server.js:113`（你 10/6 改的 `error.statusCode ?? 500`）＋【你的日志】`notes/day20.md` 的“两个真 bug” | ②setErrorHandler自定义错误，有未知错误一律按这个来|
| 5 | 404 的 body 也要 JSON（框架默认给 HTML） | 【代码】`src/server.js` 的 `setErrorHandler` 段；【AI 任务书】`notes/day17-web-framework.md`（⚠️ AI 写的） | ③|
| 6 | `PORT` 读环境变量 + 默认值 + **启动日志打真实端口** | 【代码】`src/server.js` 末尾 ＋【你的日志】`notes/day20.md` §③ 抽考 #22 |②要给默认值是因为一旦不给就会默认随机端口，将变得不可控（从代码中看不出究竟是什么端口）url格式 协议://主机:端口/路径?查询字符串#哈希|
| 7 | `app.inject()`：不 listen 也能测 | 【你的笔记】`notes/day20.md` §①第 3 条最后一句（app.inject） | ②|
| 8 | `NODE_ENV` 分支（生产不注册 `/boom`） | 【代码】`src/server.js:109` ＋【HANDOFF §三】“静默失效”族里的 `NOOE_ENV` 那格 | ②|

### B 数据库（`node:sqlite`）

| # | 知识点 | 住哪 | 打哪档 |
|---|---|---|---|
| 9 | `exec` vs `prepare` 的分工（**exec 不收参数、`?` 静默变 NULL**）+ `run/get/all` 各拿回什么 | 【你的日志】`notes/day18.md` §② 实验表 ＋【你的笔记】`notes/day20.md` 「学会了什么」第 2 条 |①exec与prpare的区别在于要不要放参数，exec放参数静默null  run/get/all` 各拿回什么：②db.get拿回一个对象或者undefined，db.run拿回的是元数据，db.all返回对象数组|
| 10 | `changes` / `lastInsertRowid` | 【代码】`src/server.js` 的 DELETE 段（`info.changes === 0`）＋ POST 段（`lastInsertRowid`） |② |
| 11 | 迁移：`CREATE TABLE IF NOT EXISTS` + **`ALTER TABLE ADD COLUMN` 不能重复** → `PRAGMA table_info` 先查再改 | 【代码】`src/server.js:141-146` ＋【你的日志】`notes/day19.md` §② 契约自查最后一行 |② |
| 12 | 事务：BEGIN / COMMIT / ROLLBACK + **"看得见不落盘"（换连接 / 换进程再看）** | 【你的日志】`notes/day18.md` 的“事务小实验”＋`notes/day20.md` 抽考 #24 的补记 |①BEGIN事务一旦没有OMMIT+ROLLBACK数据还在待结算的状态，断了连接自动回退 |
| 13 | 索引：`SCAN` vs `SEARCH`（0.76ms → 0.18ms） | 【你的日志】`notes/day18.md` 「索引输出」表（SCAN 0.76 / SEARCH 0.18） | ③CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks(title)造一个SEARCH，有没有索引的区别：查询速度|
| 14 | 为什么参数必须用 `?` 绑定、不能拼 SQL | 【代码】`src/server.js:150`（`prepare("INSERT … VALUES(?,?,?)")`） |②拼SQL是把值当成SQL代码的一部分拼进去 |

### C 认证与授权

| # | 知识点 | 住哪 | 打哪档 |
|---|---|---|---|
| 15 | 哈希 vs 加密 vs 明文（不可逆 / 盐的作用 / 慢哈希挡暴力枚举） | 【你的日志】`notes/day19.md` §①第 1 条 |② |
| 16 | `scryptSync` + `randomBytes` 盐 + `timingSafeEqual` | 【代码】`src/server.js:11-41`（`hashPassword` / `verifyPassword`） | ①|
| 17 | JWT 三段 + **HS256 签名公式（自己写得出）** | 【你的日志】`notes/day19.md` §①第 2 条 ＋「学会了什么」第 2 条（那张打包/开包往返图） | ②|
| 18 | 验签为什么能防篡改（改一个字符就不过） | 【你的日志】`notes/day19.md` §①第 3 条 | ①改字符，系统会重新算签名，一旦签名对不上，取消修改|
| 19 | `exp` 过期检查 | 【代码】`src/server.js:84`（`payload.exp && Date.now()/1000 > payload.exp`） |② |
| 20 | **"我是谁"只能来自验签过的 token**（绝不从 `req.body` 取） | 【你的日志】`notes/day19.md` §② 契约自查第 2 行 ＋【HANDOFF §三】10/5 安全课 | ②防止数据被篡改，保证数据的真实性|
| 21 | 隔离：`AND userId = ?` + 越权一律 **404 不是 403** | 【你的日志】`notes/day19.md` §①第 4 条 ＋【代码】`src/server.js` 里的 `AND userId = ?` |①增大入侵者搜索难度|
| 22 | `JWT_SECRET` 为什么不能每次随机 | 【你的日志】`notes/day19.md` §② 契约自查最后一行（JWT_SECRET 那题） |①一旦修改，所有 已保存的token将不能访问 |

### D 测试

| # | 知识点 | 住哪 | 打哪档 |
|---|---|---|---|
| 23 | 测试金字塔 + 为什么"冰淇淋筒"是反模式 | 【你的笔记】`notes/day20.md` 「学会了什么」第 3 条（你自己画的那张金字塔） | ①E2E 集成 单元 冰淇淋筒模式E2E测试数量多费时且面向整个系统，找bug难，对开发者反而降了兴致|
| 24 | 单元 vs 集成的分界线（跨进程 / 真 IO / 用框架，一个"是"就是集成） | 【你的笔记】`notes/day20.md` §①第 2 条 ＋「学会了什么」第 7 条 | ②|
| 25 | 测 HTTP：为什么"起真服务 + `fetch`"比 mock 值 | 【你的笔记】`notes/day20.md` §①第 3 条 |①mock会静默许多的问题，而对于fetch它是真的把http方法过了一遍 |
| 26 | `node:test` 的 `test` / `before` / `after` + `assert` 的用法 | 【代码】`test/edge-cases.test.js:6`（你自己写的那句注释） | ①before测试开启前运行一遍，after测试结束之后运行一遍|
| 27 | **测试库隔离**：`mkdtempSync` + `DB_FILE`（写在 require 之前） | 【代码】`test/edge-cases.test.js:10-11`（`mkdtempSync` + `DB_FILE`） |①防止原数据库干扰测试，防止修改原数据库 |
| 28 | `fetch` 的 body **只能读一次**（`res.clone()` 或先读进变量） | 【代码】`test/edge-cases.test.js` 的 10 那一条（你改成 `const body = await GET.json()` 的地方） |①如果要多次用要直接赋值给一个变量 |
| 29 | 覆盖率三列怎么读 + **行覆盖 ≠ 行为覆盖** | 【你的日志】`notes/day21.md` 里的覆盖率三列（98.22 / 88.73 / 95.45） |② Statements 语句覆盖率 Branches 分支覆盖率 Funcitons 函数覆盖率分支覆盖率最重要|
| 30 | **判据的牙**：前提断言 / "借来的红不算" / 突变测试的思路 | 【工具】`projects/p2-task-api/tools/mutation-check.js` 的文件头（三条诚实规则就写在那儿）＋【HANDOFF §三】“判据的牙”那行 | ③|
| 31 | 单元测试**挡不住"接线坏了"**（M3–M12 全是接线类突变） | 【命令】`node tools/mutation-check.js --list`（M3–M12 全是接线类，跑一次就看得到） | ③|

### E CI / 容器化 / 部署

| # | 知识点 | 住哪 | 打哪档 |
|---|---|---|---|
| 32 | CI = 干净环境 + 冻结依赖 + 自动触发（为什么三者缺一不可） | 【你的笔记】`notes/day21.md` §①第 1 条 ＋「学会了什么」第 1 条 |②有这三个支柱才能保证CI在可重复可信持续地验证每一次集成|
| 33 | `--frozen-lockfile` 的**限定条件**（lockfile / 包管理器版本 / 运行时 / OS 架构 / 环境变量） | 【你的笔记】`notes/day21.md` 「学会了什么」第 2 条（你自己写的那句限定条件） | ②|
| 34 | GitHub Actions workflow 的结构 + 缩进 + **命令拼写**（拼错 → exit 127） | 【文件】`.github/workflows/ci.yml` ＋【判据】`tools/ci-preflight.js` 第 29 条检查（命令拼写） | ②|
| 35 | `node-version` 必须和本机一致（不然"本地绿云端红"） | 【文件】`.github/workflows/ci.yml:13`（`node-version`） |② |
| 36 | `pnpm/action-setup` 钉版本（三个包版本不一致的坑） | 【文件】`.github/workflows/ci.yml:15-17` ＋【证据】`notes/day21.md` 里三个包的安装输出（12.8.1 vs 12.3.4） | ②换了个更新的 pnpm，同一份 lockfile 可能被重新解释|
| 37 | 本机"CI 等价物"：删 `node_modules` 重装 + store 冷热（`downloaded 0` vs 云端真下载） | 【你的日志】`notes/day21.md` 的实跑记录（`downloaded 0, reused 49` 那两行） | |
| 38 | 多阶段 Dockerfile（builder / runner + `COPY --from=`）+ 不分的代价 | 【文件】`projects/p2-task-api/Dockerfile` ＋【你的笔记】`notes/day21.md` 「学会了什么」第 3–5 条 | |
| 39 | `.dockerignore` 的作用（减小构建上下文 + 防手滑） | 【文件】`projects/p2-task-api/.dockerignore` |② |
| 40 | compose：服务名 = DNS 主机名 / `depends_on` **不保证就绪** / `POSTGRES_*` 给谁用 / volumes | 【文件】`docker-compose.yml` ＋【你的笔记】`notes/day21.md` 「学会了什么」第 6 条（服务名/DNS、depends_on、POSTGRES_*、volumes 全在里面） |② |
| 41 | 部署前置：PORT / NODE_ENV / health / **优雅退出 SIGTERM** / **数据持久化** | 【任务书】`notes/day22-review-deploy.md` §三.3 的清单（⚠️ AI 写的）＋【日志】`notes/day22.md` 的清单表 |② |
| 42 | **本机的绿 ≠ 云端的绿** | 【你的日志】`notes/day21.md` 的实跑记录 ＋ 今天两次 run 的对照（failure → success） | ②|

### F 工程习惯（本周长出来的）

| # | 知识点 | 住哪 | 打哪档 |
|---|---|---|---|
| 43 | PowerShell vs bash（`rm -rf` 报错 / `tsc --noEmit` 零错 = 零输出） | 【HANDOFF §九】＋【你的日志】`notes/day21.md` 「学会了什么」第 7 条 | ②|
| 44 | `pnpm dlx <工具>` 手拉一个来验（`js-yaml` 验 YAML 并给出行列） | 【命令】`pnpm dlx js-yaml .github/workflows/ci.yml`（今天早上跑的那次，它给出行列 8:12） |③ |
| 45 | 拼写族的两种表现：**静默失效** vs **exit 127**（判据要能抓拼写） | 【判据】`tools/ci-preflight.js` 第 29 条（“命令拼写”）＋【HANDOFF §三】“静默失效”族 | ②|
| 46 | `git ls-remote` 问远程（别信本地缓存） | 【HANDOFF §九】“判断推送成功”那两条命令 |② |

---

## 四 轮转表扩容 + 间隔表

### 轮转表（11 → 17 个）

| # | 模块 | 怎么验 | 上次做过 |
|---|---|---|---|
| 1 | `debounce` | 【你的笔记】`notes/day20.md` §①第 3 条（第 60 行：你写了“构建和启动要分离…抢 3000…app.inject”） | 9/30 |
| 2 | `curry` | 【你的笔记】`notes/day20.md` §①第 3 条 ＋【代码】`projects/p2-task-api/scratch/01-health.js` | 10/2 |
| 3 | `deepClone` | 【代码】`src/server.js:120`（`app.addHook("onRequest")`） | **9/27（欠：10/7 没做）** |
| 4 | `throttle` | 【代码】`src/server.js:113`（你 10/6 改的 `error.statusCode ?? 500`）＋【你的日志】`notes/day20.md` 的“两个真 bug” | 9/28 |
| 5 | `arrayUtils` | 【代码】`src/server.js` 的 `setErrorHandler` 段；【AI 任务书】`notes/day17-web-framework.md`（⚠️ AI 写的） | 10/4 |
| 6 | `once` | 【代码】`src/server.js` 末尾 ＋【你的日志】`notes/day20.md` §③ 抽考 #22 | **10/6 ✓** |
| 7 | `p-limit` | 【你的笔记】`notes/day20.md` §①第 3 条最后一句（app.inject） | **10/5 ✓** |
| 8 | `fetchWithRetry` | 【代码】`src/server.js:109` ＋【HANDOFF §三】“静默失效”族里的 `NOOE_ENV` 那格 | **10/8 ✓（今天）** |
| 9 | `dirSize` | 【你的日志】`notes/day18.md` §② 实验表 ＋【你的笔记】`notes/day20.md` 「学会了什么」第 2 条 | **10/8 ✓（今天）** |
| 10 | `cli.js` 的 `main` | 【代码】`src/server.js` 的 DELETE 段（`info.changes === 0`）＋ POST 段（`lastInsertRowid`） | 9/30 |
| 11 | `countByExt` | 【代码】`src/server.js:141-146` ＋【你的日志】`notes/day19.md` §② 契约自查最后一行 | 9/27 |
| 12 | **`buildServer` 服务骨架**（第 3 周新增） | 【你的日志】`notes/day18.md` 的“事务小实验”＋`notes/day20.md` 抽考 #24 的补记 | 10/2 骨架 → 10/6 重写 |
| 13 | **`hashPassword` / `verifyPassword`** | 【你的日志】`notes/day18.md` 「索引输出」表（SCAN 0.76 / SEARCH 0.18） | 10/5 |
| 14 | **`signJwt` / `verifyJwt`** | 【代码】`src/server.js:150`（`prepare("INSERT … VALUES(?,?,?)")`） | 10/5 |
| 15 | **base64url 往返**（对象 → JSON → buffer → 段 → 回） | 【你的日志】`notes/day19.md` §①第 1 条 | 10/5 |
| 16 | **突变测试的思路**（"只改坏一处"再看判据有没有牙） | 【代码】`src/server.js:11-41`（`hashPassword` / `verifyPassword`） | 10/7 |
| 17 | **`ci-preflight` 的检查思路**（静态引用能不能对得上） | 【你的日志】`notes/day19.md` §①第 2 条 ＋「学会了什么」第 2 条（那张打包/开包往返图） | 10/8 |

### 间隔表（**日期 = git 里的真实记录** ✓）

| 模块 | 交付 / 重写日 | D+1 | D+3 | D+7 |
|---|---|---|---|---|
| `once` | 9/27 | 9/28 ✓ | （漏） | **10/6 ✓** |
| `p-limit` | 10/2 | 10/3 | **10/5 ✓** | 10/9 |
| `fetchWithRetry` | 10/2 | 10/3 | 10/5 | **10/8 ✓（今天）** |
| `dirSize` | 10/2（10/3 周自测重写） | 10/4 | 10/6 | **10/8 ✓（今天）** |
| `countByExt` | 9/26 | 9/27 | 过期 | → 并进轮转（10/13） |
| `cli.js` 的 `main` | 9/30 | 10/4 | 10/7 | 10/14 |
| `server.js`（第 3 周） | 10/2 骨架 → 10/4 CRUD → 10/5 auth → **10/6 重写** → 10/7 修复 | 10/7 ✓ | **10/9** | 10/13 |
| `edge-cases.test.js` | 10/6 首版 → 10/7 补全 | **10/8 ✓（今天复核 13/13）** | 10/10 | 10/14 |
| `ci.yml` | 10/7 → 10/8 修 | **10/9** | 10/11 | 10/15 |
| `Dockerfile` / `compose` | 10/7 | **10/8（今天没排 ↷ → 明天）** | 10/10 | 10/14 |
| 三个工具（`mutation-check` / `ci-preflight` / `sp-tasks`） | 10/6 / 10/7 | — | — | 每次复盘各重跑一次 ✓ |

> **规则照旧**：**到期的那条优先**；**过期的不补拍**（直接并进轮转）✓

---

## 五 算账 + 重算结束日

- **超时账**（只算有时间记录的格子）：
  - 10/6：合上重写 +88（193 vs 105）｜读 +20（45 vs 25）｜拼装测试 +110（约 180 vs 70）→ **+218**
  - 10/7：上午 +130（5 条测试 110 vs 30 ＋ 读 100 vs 25）｜下午 +10 → **+140**
  - 10/8：轮转 −3 ｜修 CI −6 ｜复盘A +21 ｜复盘B +80 → **+95**
  - **合计 ≈ 453 分钟 ≈ 7.5 小时 ≈ 1 个工作日**
- **内容账**：Postgres 换引擎 1 天 ＋（12 处默写 / 讲解日 / README / 轮转）≈ 0.5–1 天 → **≈ 1.5–2 天**
- **结论：结束日 10/17 → 10/19（+2）**
- **三笔待定**：
  - docker：已装（**WSL2 待启用**：要管理员 + 重启）
  - Postgres：拆两步 —— "装"= 零工作（走 `docker compose up -d db`）；"换引擎"要写代码 → 排 docker 之后


② 内容账（真正"没做"的东西）

| 欠什么 | 量 |
| --- | --- |
| Postgres 换引擎（原定 10/7 → 挪 10/8 → 今天也没做） | 1 天 |
| 12 处 TODO 的分块默写（JWT 5 / scrypt 2 / 框架形状 3 / 数据 2 / auth 口述 1） | 半天 |
| 讲解日 ｜ README「怎么跑」｜ 轮转 deepClone+countByExt | 半天 |
| docker build/compose up 本机验不了（环境欠账，非他的时间账） | — |




## 讲解日（10/8）：判据的牙
（我的讲述）
判据的牙 = 看一个判据能不能说出它防的是什么、排除了什么坏法；说不出 → 这个绿是假的。
比如我写的 06：它本意是测邮箱和密码的错误，结果"密码"那条里邮箱少了 @ → 先报了 @ 的错 →
密码长度被忽视了，本质是**没测到**（处于没有测试的状态）→ 那"密码长度"这条规则以后真出问题，判据就抓不到。
（AI 复核，10/8）
① 更准的说法：是**那条断言**没牙，不是**整个判据**没牙 —— 同一句里的 `400` 断言真抓到了 M8 ✓
② 加一句可操作的：**牙不是读出来的，是"把实现改坏一处、看它红不红"试出来的**
   （这次就是 `--only M10` 试出来的 ✓）
③ 第三种形态（今天也见过）：**"借来的红"** —— 基线本来就红的测试，不算它抓到突变 ✓

