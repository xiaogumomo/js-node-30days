# 第 2 周复盘（2026-10-02）—— 测速点

> **§一 是你填的；§二 / §三 / §四 是 AI 起草的初稿**（照第 1 周复盘的先例：AI 起草 → 你核对）。
> **判定权在你**：不看"眼熟"，看**当场能不能合上材料答出来** —— 答得出 → 划掉；答不出 → 留下。
> ⚠️ "上次恢复过"不算（`week1-review.md` 里的恢复记录是 9/22 的）：**今天当场答出来才算**。

---

## 一 周自测（45 分钟；判据 = 有预期输出 + 数得出行为）

| 题 | 重写进哪个文件 | 我写的判据（预期输出 / 数什么）| 结果 | 卡在哪 |
|---|---|---|---|---|
| `parseArgs` 默写 | `week2-runtime/weekly-self-test.js` | 假装执行命令行：`verbose === true`、`positionals === ['a.txt','b.txt']`、给个不认识的选项该抛错 | try/catch 自己吞了错 → 2/3；**去掉后 3/3** | `type` 里没加引号 |
| `dirSize` 重写 | `week2-runtime/day10-dir-size.js`（原位覆盖）| 用现成判据：`node --test week2-runtime/day10-dir-size-verify.js` | 0 通过 / 2 红 / 8 跳 → 修完 **10/10** | 第 63 行一个笔误让整份文件不执行；卡在一些知识点忘记 |
| **`fetch` 整份重写** | `week2-runtime/day13-fetch.js`（原位覆盖）| 用现成判据：`node --test week2-runtime/day13-fetch-verify.js` | 3 通过 / 5 红 → 修完 **8/8** | 形状最像，红在 5 处接线/边界；卡在变量拼写（`AbortController` 等）忘记 |
| `p-limit` 重写 | `week2-runtime/day13-p-limit.js`（原位覆盖）| 用现成判据：`node --test week2-runtime/day13-p-limit-verify.js` | 2 通过 / 6 红 → 修完 **8/8** | 队列在、"票据兑现"那一环缺（忘了票据也要 `return new Promise`）|

> ⚠️ 重写的规矩（心法第 10 条）：**先全关着写完（哪怕到处留空）→ 再打开对照**；卡住的地方留一行 `// TODO: 卡在这` 继续往下写，别全删重来。
> 判据自己写的话：写完**先故意改坏一个字符，看它红**，红了才算数（#13）。

**AI 复核（10/2 收工，逐条重跑过）**：这四份**最终全绿** —— `dirSize` **10/10**、`fetch` **8/8**、`p-limit` **8/8**、你写的 `parseArgs` 判据 **3/3**（另加轮转 `curry` **6/6**）。三处对账：① "结果"列记的是**第一遍**的分数 —— 我加上了"→ 修完 z/z"，因为**"判据从红变绿"才是今天的成绩**；② `parseArgs` 那格的 "4/4" 我改成了 **3/3**（你的判据文件里是 3 条 `test()` —— 报数字前先对一下账）；③ 这三行原来是 **6 格**（结果列里塞了两段），被 `node tools/check-md-tables.js` 抓到 → 已并成一格。**以后写完日志跑一下这个工具。**

## 二 「还会的」清单（**6 条，每条都带实测证据**）

> **别一律按"不会"处理** —— 你今天的实测结果摆在那里。而且：**"脑袋空空"不等于"不会"** —— 回忆的感觉本来就是空的（心法第 9 条：复习靠**回想**，不靠"读起来顺"）。
> **但最后一条判的是你**：如果写着写着还要翻材料才敢下笔 → 把它移到「忘了的」。

1. **`curry` 的骨架**（收够 → `fn.apply(this, arg)`；不够 → 返回一个新函数继续收）—— 证据：今天闭卷重写 **6/6** ✅
2. **`parseArgs` 框架**（`args` / `options.<名>` / `type` 只能是 `'string'`|`'boolean'` / `allowPositionals` / 取 `values` + `positionals`）—— 证据：今天默写 + **你自己写的判据 3/3** ✅
3. **`p-limit` 的"队列 + 票据"**（`queue.push({fn,resolve,reject})` → `shift` → `Promise.resolve().then(()=>fn()).then(resolve,reject).finally(...)`）—— 证据：今天**第二轮**闭卷重写 **8/8** ✅（第一轮 2/8）
4. **`fetchWithRetry` 的重试循环骨架**（`for` 循环 + 退避 `base * 2 ** (attempt-1)` + `AbortController` + `clearTimeout` + 5xx 重试 / 4xx 立即抛 / `TimeoutError` 分类）—— 证据：**这个循环是你自己搭的**；8/8 之前剩下的 5 处都是接线/边界 ✅
5. **`dirSize` 的递归遍历骨架**（`walk(current, rel)` + `readdir(withFileTypes)` + 累加 `totalBytes`/`fileCount` + `sort` + `slice`）—— 证据：今天自己重写，**10/10**（只差一个字母）✅
6. **自己写判据**（`node:test` + `assert.deepEqual` + `assert.throws(/regex/)`）—— 证据：今天的 `weekly-self-test-verify.js` 是你的**第一份**判据：**3/3** ✅（第 1 周复盘里 #13 一直挂着"待做" —— **今天补上了**）

## 三 「忘了的」清单（36 条 → 清理 + 重排 = 每日抽考池）

> **这份表是 AI 起草的初稿**（你写的 4 行内容**没删**，并进了下面对应行的「恢复动作」）。
> **清理结果**：原 **36 条** → 划掉 **18 条**、合并 1 组（#13+#29）→ 保留 **17 条**；**+ 今天新抓的 4 条 = 抽考池 21 条**。
> （划掉的 18 条：#1–#12 那批 9/22 就全绿了，今天 `curry` 6/6 又确认一次；#20 #22 #25 #26 #27 9/22–9/23 恢复后反复用过；#28 你今天判据里就用对了。）

**A. 今天新抓到的（4 条 —— 优先级最高）**

| 新 # | 内容 | 恢复动作 |
|---|---|---|
| 1 | **拼错的选项会"静默失效"**：`withFileType`（少个 `s`）**不报错**，只是不起作用 → `readdir` 返回字符串数组 → 20 行之后才在 `path.join` 炸 | 查 `week2-runtime/day10-readdir.js`；拼写靠**工具**核对（编辑器补全 / 查自己写过的文件 / 跑一次看输出），别靠记性。口诀：**报错行号离得远，先怀疑"某个参数根本没生效"** |
| 2 | **工具函数里 `catch` 不重抛 = 吞错** | 契约是"要么返回结果、要么抛错"；错误统一在**边界**（CLI 入口 / 请求处理器）处理。你已把 `weekly-self-test.js` 的 try/catch 去掉 ✅ → 明天抽考时**讲一遍"为什么去掉才是对的"** |
| 3 | **退避怎么写**（`await sleep(baseDelayMs * 2 ** (attempt - 1))`）| `week2-runtime/day13-fetch-practice.js` + `notes/day13.md` |
| 4 | **`AbortController` 拼写 / `Response` 常用属性**（`status` / `json()` / `text()` / `headers`）| `notes/day13.md`；现场探：`console.log(Object.keys(res))` |

**B. 第 1 周遗留（清理后保留，17 条）**

| 新 # | 内容（原 #）| 恢复动作 |
|---|---|---|
| 5 | `this` 严格/非严格：独立调用时非严格 = `globalThis`，严格 = `undefined`（#14）| 口述一遍 |
| 6 | `call` / `apply` 的 this = **括号里第一个参数**（#15）| 口述 |
| 7 | 循环引用为什么让手写深克隆爆栈（`RangeError`）+ `structuredClone` 的映射表（#16）| `p0-toolkit/README.md` 的「已知限制」 |
| 8 | `return;` 是"提前打住"，不是"提供返回值"（#17）| 口述 |
| 9 | 防抖 vs 节流的**场景**区分（#18）| "防抖 = 等你不动再动；节流 = 你再急也按我的节奏动"（轮转重写 `debounce`/`throttle` 时顺手考） |
| 10 | `process.nextTick` / nextTick 队列（#19）| `notes/day09.md`。**你的复述**："node 延迟执行的一种手段；nextTick 队列是事件循环里最急的队列" —— 基本对，补一句：**它比 Promise 微任务还急** |
| 11 | 事件循环六阶段 + 各阶段队列（#21）| ⚠️ 与 Day 9 实测"**能完整背出六阶段**"**对不上** → **明天 30 秒抽考定去留**（说出六阶段 + poll 为什么等 I/O） |
| 12 | ESM / CJS 语法对照（`export` / `export default` / `import { a as x }` ↔ `module.exports` / `require`）（#23）| `notes/day08.md`；**默写对照表**（这条的笔记是 AI 写的，你当时就说"还没记住"） |
| 13 | **判据必须能"红"**（把实现改坏一个字符，看它红）—— 原 **#13 + #29 合并** | 对你今天写的 3 条 `test()` 做一次"改坏一个字符"（5 分钟，明天开场）|
| 14 | `ERR_AMBIGUOUS_MODULE_SYNTAX`（#24）| **你的复述**："又有顶层 `await` 又有 `module.exports`，即占了 ESM 又占了 CJS，node 不知你用的哪种格式，所以报错" —— 对！**差最后一句"修法"**：当 CJS 就把顶层 `await` 包进 `async function`；当 ESM 就把 `module.exports` 换成 `export` |
| 15 | `Array.isArray`（第 3 次"用过但零提示取不出"）（#30）| `deepClone` 那节；口诀：`typeof` 判不出数组、`null` 也是 `'object'` → 一律 `Array.isArray` |
| 16 | "只拆一层"的三种姿势（#31）| 嵌套 `for`+`push` / `reduce`+`concat` / `push(...item)`，同一个注释块里各写一遍 |
| 17 | `{ age: number }` 是「形状」，不是「数值类型」（#32）| `notes/ts-cheatsheet.md` |
| 18 | `T \| null` 是「允许为 null」（放宽），不是「确保为 null」（#33）| `notes/ts-cheatsheet.md` |
| 19 | 宏任务之间没有统一先后（#34）| `notes/day09.md`（`setImmediate` 在 I/O 回调里早于 `setTimeout(0)`）|
| 20 | poll 阶段为什么"卡住等 I/O"（#35）| `notes/day09.md` |
| 21 | 微任务的清空时机（#36）| `notes/day09.md`：**每执行完一个宏任务回调就清一次**（不是"只在阶段之间"） |
| 22 | **`process.env.PORT` 的读法 + 默认值**（env 读出来是**字符串** → `Number(x) \|\| 3000`）+ 启动日志要用**真实端口** —— 10/4 合上重写 scratch 时**这两处都丢了**（实测缺口，不是猜的）| 你 10/3 那份：`git show HEAD:projects/p2-task-api/scratch/01-health.js` |
| — | 附带：**"静默失效"再 +1 次**（10/4 把 `/tasks/:id` 写成 `/task/:id` → 不报错、只是 404）| 见上面第 1 条 |

> 抽考池 **22 条**：每天收尾抽 **2 条**；连续两次答不出的 → 进轮转表重写。

## 四 轮转表扩容 + 间隔表 + 算账 + 重算日期

**轮转表（11 个模块，一天一个，开场 5 分钟）**：

| # | 模块 | 怎么验（判据）| 上次做过 |
|---|---|---|---|
| 1 | `debounce` | `node week1-language/recall-verify.js debounce` | 9/30 ✅ 4/4 |
| 2 | `curry` | 同上 | **10/2 ✅ 6/6** |
| 3 | `deepClone` | 同上 | 9/27 |
| 4 | `throttle` | 同上 | 9/28 |
| 5 | `arrayUtils` | 同上 | **9/24（最久没碰）** |
| 6 | `once` | `node --test week2-runtime/day13-zerohint-07-verify.js` | 9/27 交付；D+1（9/28）✅ 5/5 |
| 7 | `p-limit` | `node --test week2-runtime/day13-p-limit-verify.js` | **10/2 ✅ 8/8** |
| 8 | `fetchWithRetry` | `node --test week2-runtime/day13-fetch-verify.js` | **10/2 ✅ 8/8** |
| 9 | `dirSize` | `node --test week2-runtime/day10-dir-size-verify.js` | **10/2 ✅ 10/10** |
| 10 | `cli.js` 的 `main` | `node --test projects/p1-cli-organizer/test/cli.test.js` | 9/27 写、9/30 交付 |
| 11 | `countByExt` | `node --test week2-runtime/day12-zerohint-06-verify.js` | 9/26 |

**排期（AI 排的，你可以改）** —— 一天一个；撞上"间隔表到期"就优先那一个：

| 日期 | 轮转这一个 | 备注 |
|---|---|---|
| 10/3（Day 18）| `dirSize` | 今天的重写 → **D+1**（开场**合上重写 / 讲**）|
| 10/4 | `arrayUtils` | 最久没碰（9/24）|
| 10/5 | `p-limit` | 今天重写 → **D+3** |
| 10/6 | `once` | **D+7** 到期 |
| 10/7 | `deepClone` | 9/27 后没再碰 |
| 10/8（第 3 周复盘）| `fetchWithRetry` ＋ `countByExt` | 复盘日可多抽 1–2 个 |
| 10/9 | `throttle` | 9/28 后没再碰 |
| 10/10 | `cli.js` 的 `main` | |
| 10/11 | `debounce` | |
| 10/12 | `curry` | |
| 10/13 | `countByExt` | 一轮 11 天走完，之后每 2 周一次 |

**间隔表（D0 → D+1 → D+3 → D+7）**：

| 模块 | 交付 / 重写日 | D+1 | D+3 | D+7 |
|---|---|---|---|---|
| `once` | 9/27 | 9/28 ✅ | 9/30（漏）| **10/6** |
| `dirSize` | **10/2（今天重写 10/10）** | **10/3** | **10/5** | **10/9** |
| `fetchWithRetry` | **10/2** | **10/3** | **10/5** | **10/9** |
| `p-limit` | **10/2** | **10/3** | **10/5** | **10/9** |
| `cli.js` 的 `main` | 9/27 | 9/28 | 9/30 | 10/4（过期 → 并入轮转 10/10）|
| `countByExt` | 9/26 | 9/27 | 9/29 | 10/3（过期 → 并入轮转 10/13）|

> 规则：**到期的那条优先**（10/3 开场 = `dirSize`，它同时是 D+1）。**过期的不补拍** —— 直接并进轮转。

**算账**（数据现成，直接抄）：
- `cli.js` 改了 **4 版**；9/27–9/28 **两道主线都由 AI 收尾**；「忘了的」 **22 → 36 条** → 三笔账都指向同一个排法：**每天只排一道新主线 + 每天留 1h 留存**。
- **今天的账**：上午/白天的 2a 花了约 5 小时（4 份闭卷重写 + 1 份自写判据 + 把红修绿）；原定的 **2c（④阅读 / 无权限实测）** 和**下午的 Day 17（项目 2 骨架 7/7）顺延到 10/3** → 记进 `day17.md` 的欠账登记，**10/7 第 3 周复盘时一起核**。
- **重算日期**：结束日 **10/17**（第八次调整已整体 +1）→ 10/7 第 3 周复盘时再核。
