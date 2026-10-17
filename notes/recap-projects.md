# 回访路线（四项目版）· 每个项目的"装配图"

> **和 `review-3tiers.md` 配对用**：那份是**口径**（A 档 37 条：能张口说三句），这份是**零件在哪**（打开文件就能对上）。
> **怎么用**：每个项目 10 分钟，**照顺序打开文件看那几行**；不背，只连索引。
> 行号 = 2026-10-16 核对过。p0 是练习文件集合，只按**区域**给（不逐文件列行号）。

---

## 一、p0 工具箱（第 1–2 周，`week1-language/` + `week2-runtime/`）

**是什么**：没有 src/ 的项目 —— 两周里**手写的语言基础工具 + 每一条都有判据**。它是"语言的健身房"，产出物是**一堆可复用的函数**。

| 区域 | 文件（`week1-language/`） | 学到的东西 |
|---|---|---|
| day02 | `day02-scope.js` / `day02-curry.js` / `day02-debounce.js` / `day02-throttle.js` | 作用域·闭包、curry、防抖节流 |
| day03–06 | `day03/04-array-methods.js`、`day06-prototype.js`、`day06-this.js`、`day02-clone.js`、`day06-array-utils.js` | 数组方法、原型链、`this`、深拷贝、工具集 |
| day07–09 | `day07-promise.js`、`day08-event-loop.js`、`day09-event-loop.js` | Promise、事件循环 |
| week2 | `week2-runtime/day10-dir-size.js`、`day11-ndjson.js`、`day13-fetch.js`、`day13-p-limit.js`、`day16-demo-moveOne.js` | fs/流、NDJSON、fetchWithRetry、并发上限、文件搬移 |
| **判据** | 每个 `*-verify.js` 就是判据（约 20 个文件） | 跑法：**仓库根 `node --test`**（自动发现，约 28 条来自这里） |
| 额外 | `week1-language/p0-toolkit/` | TS 类型检查（`tsc --noEmit`）|

**最值钱的设计点**：**"零提示重写"**（`*-zerohint-*.js` / `*-recall-*.js`）—— 合上参考自己写一遍，写不出才算没学会 ✓

⚠️ 这一块**不要逐文件背**：它的用途是"我知道这些工具我都手写过、判据在哪" ✓

---

## 二、p1 CLI 整理器（`projects/p1-cli-organizer/`，单文件）

**是什么**：一个命令行工具 —— **先干跑看计划，`--apply` 才真搬**，按扩展名分类到 `images/ docs/ videos/ others/`，搬完给汇总。

**数据流**：`node src/cli.js <目录> [--target x] [--apply] [--verbose]` → `main()` 解析参数 → `walk()` 递归收集 → （apply）逐个 `moveOne()` → 每步记日志 → 汇总行

| 看哪（`src/cli.js`） | 是什么 |
|---|---|
| `:13-20` `class MoveError` | **自定义错误类**，带 `file` 和 `code` |
| `:21-29` `HINTS` | 错误码 → 人话（`ENOSPC` 磁盘满 / `EACCES` 没权限 / `EEXIST` 撞名…） |
| `:31-35` `sorts` + `:40-49` `classify()` | **分类表**：`path.extname().toLowerCase()` 查表，查不到 → `others` |
| `:61-69` `filehash()` | `createHash('sha256')` + **流式**读（不把整个文件读进内存） |
| `:95-104` `resolvefilePath()` | **重名冲突**：`name(1).ext`、`name(2).ext`…（`while` 循环） |
| `:108-154` `moveOne()` | 一个文件的搬移全过程：`stat` 检查 → `mkdir -p` → **`pipeline` 流式复制** `:120` → **校验①大小** `:130` → **校验②sha256** `:139-148` → **最后才删源** `:150` |
| `:197` `if (path.resolve(targetRoot) === …) continue;` | 目标目录在源目录里面时**别递归进去**（防自己搬自己） |
| `:211` `if (values.apply)` | ★ **干跑 / 真搬的分界**：不传 `--apply` 只打印计划 `:249-255` |
| `:212-215` `SIGINT` 处理 | 中途 Ctrl+C：打印"已搬几个、正在复制的那个不会丢" |
| `:237` `process.exitCode = 1` | 有失败 → 退出码非零（**不 `process.exit`**，让流程走完） |
| `:269-270` | `require.main` 守卫 + `module.exports = { classify, moveOne }` |

**判据怎么跑**：`cd projects/p1-cli-organizer && node --test` → **18/18**（`test/cli.test.js` + `test/apply.test.js`）
**最值钱的设计点**：**"复制完成 + 校验通过才删源"** —— 把一个"不可逆操作"做成"**失败也不丢文件**" ✓（判据 01 就是比对 sha256）

---

## 三、p2 任务 API（`projects/p2-task-api/`，两个源文件）

**是什么**：Fastify + Postgres 的 REST API：注册/登录（scrypt 哈希 + JWT）→ 任务的增删改查，**多用户隔离**。

**数据流**：请求 → `onRequest` 钩子（验 token）→ 路由 → `db.js` 的方法（带 `userId` 的 SQL）→ pg → 响应；错误 → `setErrorHandler` → JSON

| 看哪（`src/server.js`） | 是什么 |
|---|---|
| `:103` `await openDb()` | **在 `buildServer()` 里**开库（模块顶层不许有副作用）|
| `:109` `GET /health` | 健康检查 → `{"ok":true}`（部署判据就是它）|
| `:116` `GET /boom` | **故意抛错** —— 用来验"统一错误处理"（500 + JSON、进程不崩）|
| `:129` `app.addHook('onRequest', …)` | **认证钩子**：读 `authorization: Bearer <token>` → 验签 → 挂 `req.userId`；401 时回中文 JSON |
| `:133` `onClose → db.close()` | 优雅退出（→ `db.js:104` `pool.end()`）|
| `:138 / :144 / :156 / :164 / :177` | `GET /tasks` · `POST /tasks` · `GET /tasks/:id` · `PATCH /tasks/:id` · `DELETE /tasks/:id` |
| `:189 / :210` | `POST /auth/register` · `POST /auth/login` |
| `:238` | `app.listen({port: process.env.PORT\|\|3000, **host:'0.0.0.0'**})` ← 部署必有的那半 |

| 看哪（`src/db.js`） | 是什么 |
|---|---|
| `:14-22` `migrate()` | 迁移（见 `recap-deploy-db.md` 第二节）|
| `:33 / :43 / :54 / :63 / :74` | 五个任务方法 —— ★ **每个 SQL 都带 `WHERE userId = $n`**（隔离做在数据库层）|
| `:84 / :96` | 用户：建 + 查 |
| `:10-11` `toTask` / `toUser` | **行映射**（`Number(r.id)`、`!!r.done`、`passwordhash → passwordHash`）|
| `:104` `close: ()=>pool.end()` | 关池 |

**判据怎么跑**：`cd projects/p2-task-api && node --test` → **40/40**（4 个文件：auth / edge / crud / server；`tools/testkit.js` 给每个文件一个独立测试库）
**最值钱的设计点**：**隔离写在 SQL 的 `WHERE userId` 里**（不是"查出来再过滤"）→ 别人的 id 打过来天然 404 ✓ 加上**不外泄存在性**（别人的东西存在也说"没有"）✓

---

## 四、p3 文档问答（RAG，`projects/p3-doc-qa/`，六个模块）

**是什么**：给一份文档，提问，它**带出处**回答 —— 读文档 → 切块 → 向量化 → 入库 → 检索 → 组装 prompt → 回答 → 溯源。

**数据流（一条链，六个模块各管一段）**：

```
读 md 文件
  → chunk.js  chunkText(text,{size,overlap}) → [{text,index,start,end}]
  → embed.js  embed(texts) → {vectors,usage,cost,meta}
  → store.js  createStore().upsert([...块+vector])
  ── 提问 ──
  → embed.js  embed([问题])               ← 只 embed 问题（块入库时已算过）
  → store.js  search(向量, topK) → [{text,index,score}]（按分降序）
  → ask.js    贴编号 [1][2][3] → 组 messages → chat.js 回答
  → ask.js    用 index 回查 chunks → sources{index,score,start,end}
```

| 看哪 | 是什么 |
|---|---|
| `src/http.js` | **公共层** `requestJson`：超时 / 重试（429·5xx·网络错）/ 日志 / `logFields` 合并（契约写在文件头）|
| `src/llm.js:5` | `DEFAULT_PRICE_TABLE`（`:10` 那行是 `glm-4-flash` 备用源）→ `:16` `chat(messages,opts)` → `:74` `estimateCost` |
| `src/embed.js` | `embed(texts,opts)`：批量、返回条数校验、维度校验、空数组不发请求（契约在文件头）|
| `src/chunk.js:19-27` | 契约（`size=500/overlap=50`、`index`、`start/end` **给溯源留的**）|
| `src/chunk.js:36-47` | 四条守卫（空串→`[]`、非字符串→`TypeError`、size、overlap）|
| `src/chunk.js:50-64` | 滑窗：`step = size - overlap`、`end = Math.min(start+size, len)`、**切到末尾就停** |
| `src/store.js:25` | `cosineSimilarity`（除以模长、零向量→0）|
| `src/store.js:60-99` | `createStore()`（闭包工厂：`items` 在函数体内 → 实例互相独立）→ `:83` `search` 降序取 topK |
| `src/ask.js:5` | `DEFAULT_SYSTEM`（system 措辞，唯一来源）|
| `src/ask.js:11` | ★ **贴编号那行**：`hits.map((c,i)=>\`[${i+1}]text为${c.text}\`)`（编号是**我们**贴的）|
| `src/ask.js:13-14` | `messages = [system, user]`（【资料】+【问题】）|
| `src/ask.js:18-19` | ★ **溯源那行**：`chunks[c.index].start / end` |
| `src/ask.js:21` | `return { sources, cost: res.cost+q.cost, meta, answer }`（**两笔成本相加**）|

**判据怎么跑**：
```bash
cd projects/p3-doc-qa && node --test        # 50 过 / 4 跳过（8 个文件，6 个模块 + ask）
$env:LLM_LIVE='1'; node --env-file=.env --test test/llm.live.test.js   # 真调一条（跑完 Remove-Item Env:LLM_LIVE）
```
**最值钱的设计点**：**`ask.js` 自己不碰网络** —— 它只把四个模块串起来（收 `store`/`chunks`、透传 `embedOpts`/`chatOpts`）→ 所以判据能用**假服务器**测整条链，不花钱、不看网络脸色 ✓

---

## 五、四个项目的"一句话"（口播用，和 `report-1017.md` 的 3×3 一致）

| 项目 | 一句话 |
|---|---|
| p0 | 两周手写的语言基础工具箱 + 每条都有判据（零提示重写）|
| p1 | 命令行整理器：**先干跑、`--apply` 才动文件**，复制校验通过才删源 |
| p2 | 任务 API：注册/登录 + 增删改查，**隔离写在 SQL 的 `WHERE userId` 里** |
| p3 | 文档问答：切块→向量→检索→**带出处回答**，六个模块各管一段 |

## 六、走完之后的动作

1. 每个项目给自己**一句话**（不用抄上面的，用你自己的词）
2. 答不出的条目 → 抄进 `notes/review-unknowns.md`（只抄名字）
3. **不背** —— 这份是"零件在哪"；要背的是 `review-3tiers.md` 里 **A 档那 37 条** ✓
