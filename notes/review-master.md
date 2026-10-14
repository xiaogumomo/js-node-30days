# 复习总表（review-master）—— **全部学过的知识点 · 只有标题**

> **这张表是干什么的**：把至今**学过**的东西**全**列成标题，让你能**一小时内从头过一遍、回忆自测**。
>
> **三条规矩（你自己定的，我记住并执行）**：
> 1. **只收"学过的"** —— 你在课里练过、写过、判据测过的东西。**光听过/没教过的词不收**（像 "RESTful 设计规范"、"Redis/Kafka"、"缓存"、"容器化步骤详解" 这类**不算**），否则复习表就变成了"又学新东西" ✗
> 2. **每天收工时，有新内容就补进来**（由 AI 维护 ✓ 你只需要过表）
> 3. **每天 1 小时"全表回忆"是【你外加】的任务** —— **不许拿它挤掉 AI 布置的任务时长**（两码事）✓
>
> **怎么用**：从头往下看**名词**，**合上表**问自己"这是什么？我在哪用过？" ——
> **想不起来的，回访三处**（30 秒）：① 你自己的代码 ② 你自己的笔记 ③ 你自己的判据 → 还不行才问 AI ✓
>
> 标记：**★** = 今天（10/14）练过／**⚠** = 取不出来过（要重点过）

## A. JS 语言基础（第 1 周 ＋ 后续穿插）
- 变量与作用域（`let/const/var`、**TDZ**）
- 闭包
- `this` 的绑定（调用位置决定 / `apply`）
- 原型链 / `class` / 继承
- 箭头函数与 `this`
- 解构（改名 `:` / 默认值 `=` / rest）★
- 展开运算符（spread，对象摊进日志）★
- 模板字符串
- 可选链 `?.` 与空值合并 `??`
- **隐式全局**（漏声明）⚠
- `for...in` vs `for...of`（下标是字符串）
- 数组方法（`map/filter/reduce/sort/slice/splice`）
- 字符串与 Unicode（UTF-16 码元、emoji 切半）
- 可变性（`replace` 返回新值 / 引用）
- 浅拷贝 vs 深拷贝
- 错误类（`Error/TypeError` 子类、`err.status`）★
- TypeScript：类型剥离 / `tsc --noEmit` / strict / 递归返回类型 / `tsconfig`（`nodenext`）
- ESM vs CJS（`export` vs `module.exports` / 顶层 await 不支持）
- `package.json` 结构（`scripts` / `type` / `packageManager`）★

## B. 异步与运行时（第 2 周）
- **事件循环六阶段**（timer/pending/poll/check/close）⚠（抽考池）
- 微任务在两宏任务之间清空
- `setTimeout / setInterval / setImmediate`
- Promise（`then/catch` 链 / `Promise.all` / **永不结算的 promise**）
- `async/await`（**漏 await 的症状**）★×2
- 未处理拒绝（unhandled rejection）
- `AbortController` / `AbortSignal`（每次尝试新建）★
- `performance.now()` vs `Date.now()`
- 流（`createReadStream` / 管道 / 背压）
- `readFileSync` 返回 **Buffer**（要传 `'utf8'`）★
- **相对路径按 cwd 解析 / `__dirname` 拼**★
- `node:` 内置模块（fs/path/os/crypto/http/assert/test）

## C. 工具箱五件套 ＋ 常用工具（第 1–3 周，轮转表所在）
- `debounce`（leading/trailing；**早返回跳过状态设置**）⚠
- `throttle`
- `curry`（收够才执行 / 参数不串）
- `deepClone`（递归 / 环 / Map/Set）
- `arrayUtils`（flat/unique/chunk…）
- `once`、`p-limit`（票据兑现 / 并发上限）、`dirSize`
- `fetchWithRetry`（**重试循环的雏形**）
- `countByExt`（累加器起点）⚠
- `parseArgs` / `parseCliArgs`（默认值 / 类型 / 抛错）
- `base64url` 往返（对象→JSON→buffer→段→回）
- 累加器起点族（`?? 0` 的位置）⚠

## D. CLI 与工程（p0 / p1）
- 退出码（`process.exitCode` vs `process.exit`；**库函数别管进程**）
- 干跑（dry-run）与 `--apply` 两阶段
- 错误分类（用户错 / 系统错 / 可重试）
- `pino` 结构化日志★
- 优雅退出（SIGTERM/SIGINT + `onClose` 关资源）
- 大文件 / 流式处理
- README 五要素与"对账"

## E. Web 框架与服务（p2）
- Fastify `buildServer()` 与 `listen` **分离**（`app.inject()`）
- 路由形状 + `req.params / query / body`
- 钩子 `onRequest`（生命周期扩展点）
- `setErrorHandler` + **信 `error.statusCode`**（4xx 原样 / 其余 500）
- 404 的 body 也要 JSON
- `PORT` 读环境变量 + 默认值 + **host `0.0.0.0`**
- `NODE_ENV` 分支
- 框架报错先读错误名（`FST_ERR_REOPENED_SERVER`）
- 服务活体验证（curl 走全流程）

## F. 数据库（p2）
- 表 / 列 / 主键 / 唯一约束（概念）
- **SQL 参数绑定**（`?` / `$1`，为什么不能拼 SQL）
- **索引**（`CREATE INDEX IF NOT EXISTS … ON 表(列)` / `SCAN` vs `SEARCH` / 何时不该建）⚠★
- 事务（`BEGIN/COMMIT/ROLLBACK` ＋ **"看得见不落盘"**）
- 迁移（版本化 / **只追加不改历史** / `IF NOT EXISTS`）★
- PG 方言（`IDENTITY` / `BIGINT` 宽度 / 标识符折小写）★
- 驱动差异（同步 sqlite → 异步 pg；`query()` + `rows/rowCount`）★
- **连接池 `Pool`**（为什么需要池）★⚠
- **SQLSTATE `err.code`**（`23505` / `22003` / `22P02`）
- 测试库隔离（每文件一个库 / `DROP … CASCADE` / `42P04` 幂等）
- 行映射（snake_case → 应用形状）

## G. 测试与质量（贯穿）
- `node:test` + `assert`（`deepEqual` / `throws` / `rejects`）
- **单元 vs 集成**（真 IO / 跨进程 / 用框架，占一即集成）⚠
- **假服务器 / 测试替身**（随机端口 / `closeAllConnections`）★
- **回归测试**（重构的安全网）★
- 冒烟测试 / 端到端 demo★
- **判据即契约**（表结构 / 参数名 / 抛错字样 / 日志字段）★
- **判据的牙**（一条条看；负向验证 = 参照实现 + 突变）★
- 四种假绿（含"加载类检查跟 skip 走""文件名/位置"）
- 突变测试（只改坏一处 / "借来的绿"不算）
- 库的契约：**要么返回结果、要么抛错**
- 边界的输入要能区分好坏实现（`overlap=0` 恰好对）★
- **"能过但不对"族**★
- **环境状态残留**（用完要清）★

## H. 容器与部署（第 3–4 周）
- **镜像 vs 容器**（多阶段构建）★
- `Dockerfile`（`CMD` exec 形式）
- `docker-compose`（服务名当主机名 / `depends_on` / 端口映射）★
- 镜像源 / 网络拦截（TLS 自签证书、换源）
- 容器内优雅退出验证（SIGTERM → 日志两行 / `Exited(0)` / `137`）
- **CI**（GitHub Actions / `--frozen-lockfile` / postgres service）
- **部署到 Railway**（构建→部署→域名 / `PORT` 由平台给 / 提交信息 = 部署的代码）★
- **环境变量与配置分离**（`.env` / `.env.example` / `--env-file` / gitignore）★
- 提交前自检（模板不留值 / key 不进 git）

## I. 认证与安全（p2）
- `scrypt` + 随机盐 + `timingSafeEqual`
- JWT HS256 手写（`createHmac` + `base64url`）
- **Bearer 认证头**（`Authorization`）★
- **401 → 404 → 200 的语义**（不泄漏"存在性"）
- key 不进代码 / 日志 / git★

## J. HTTP 与网络（贯穿）
- **状态码语义** ＋ 请求头 / 体 / 方法★
- **幂等**（重试的前提）★
- **超时 / 重试 / 指数退避 / 上限**★
- keep-alive 与"连接被掐"
- **环回 vs `0.0.0.0`**（host 绑定）
- 代理 / VPN 与证书拦截
- **通用探针法**（打目标路由 + 校准"不存在的路由"）★
- 零成本探活（空 body → 422 说明 key 有效）★

## K. AI / RAG（p3）
- **OpenAI 兼容协议**（chat 请求/响应形状 / `choices[0].message.content`）★
- **token 与 usage**（prompt/completion/total；缓存命中字段）
- **embedding**（文本→向量 / 2048 维 / 批量 / 返回条数校验）★
- **语义相似度**（余弦 / 除以模长 / 零向量定 0）★
- **切块 chunking**（size + overlap / 滑窗 / "切到末尾就停"）★
- **元数据**（`index / start / end`，为溯源服务）★
- **向量检索**（topK / 召回 / 阈值 / **向量不能用 B-tree 索引**）★
- **重排（rerank）**（概念；还没做）
- **引用溯源（provenance）**（`index` 回查 `start/end`）★
- **成本统计**（`priceTable` 按百万 token / 累计口径 / 免费额度）★
- LLM 客户端四件套（超时/重试/日志/成本）★
- **适配器**（`llm.js` 与 `embed.js` 同底层不同职责）★

## L. 元技能与工作方法
- **时间盒**（15 分钟 / 卡住先写三行 / 25 分钟阅读）
- **合上讲 3 句**（是什么 / 关键一步 / 取舍）★
- **术语卡**（我的动作 ↔ 行业叫法）＋ **回访自己的材料**★
- 阅读三件套（编号知识点 / 负面清单 / 紧跟 demo）
- **记账三列**（AI 给的 / 我写的+验证 / AI 定位的）
- **回访三处**（我的代码 → 我的笔记 → 我的判据 → 才问 AI）★
- 五种错误类型（含"首次上手""检索失败"）
- 五种假绿 / "假红"
- 先跑判据再看报错★
- "我写了 ≠ 它真生效"★
- 拆解"没头绪"：先分 **学过取不出来 / 还没学过**

## M. 术语 ↔ 区块 索引（**和 `terms-map.md` 一起复习**）

> 过某个区块时，顺手把右边那几个术语也回忆一遍 —— 知识（是什么）+ 术语（行业怎么叫）一起过 ✓
> （术语的详细配对在 `notes/terms-map.md`；这里是"哪个区块里藏着哪些术语"。）

| 复习区块 | 关联的术语（见 terms-map） |
|---|---|
| C 工具箱 | 纯函数 / DRY |
| D CLI 与工程 | **结构化日志** / **优雅退出（信号）** / **配置与代码分离** / 环境变量 |
| E Web 框架 | **状态码语义** / **请求头认证** / REST / 资源 / **可观测性** |
| F 数据库 | **参数绑定** / **索引** / **事务** / **迁移** / **方言** / **驱动** / **连接池** / **SQLSTATE 错误码** / **幂等写入** |
| G 测试与质量 | **回归测试** / **冒烟测试** / **测试替身** / **单元 vs 集成** / **测试即规格（判据即契约）** |
| H 容器与部署 | **容器化** / **编排** / **CI-CD** / **环境变量与配置分离** / **会话状态残留** / 部署与 PORT |
| I 认证与安全 | **请求头认证（Bearer）** / 401→404→200 的语义 / key 不进 git |
| J HTTP 与网络 | **超时 / 重试 / 指数退避 / 幂等** / **状态码语义** / **通用探针法** |
| K AI / RAG | **embedding** / **向量检索** / **语义相似度** / **切块（chunking）** / **召回** / **topK** / **重排** / **引用溯源** / **元数据** / **适配器** / **成本统计** |
| L 元技能 | 术语卡 / **判据的牙** / 假绿 / **回访三处** |
| A 语言基础 ／ B 异步与运行时 | （暂无单独术语 —— 这一层主要靠"说清机制"，见区块内的 ⚠ 条目） |
