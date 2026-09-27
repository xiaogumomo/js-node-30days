# Day 13 任务书：网络请求与并发 → 裸写 `p-limit` + 给 `fetch` 加超时/重试

> **日期**：2026-09-27（周日）　｜　**第 2 周 Day 5**
> **按 3 小时 55 分排**（"选 A"：量排轻、清单划干净，多的推给下一天）
> **今天接昨天**：Day 12 的 README 里写了"为什么用异步 API"—— 今天第一次真的**并发**做事：**同时最多几个、超时怎么办、失败了要不要重试**。
> **对照计划**：`js-node-30day-plan.md` §四 第 2 周 Day 13
> **⚠️ 昨天还差最后一件**（`src/cli.js` 没写 + 没提交）→ 见 ①，**先清掉再进正课**。

---

## 〇 开工前 5 分钟：把产出物抄在纸上

| # | 产出物 | 验收标准 | 谁写 |
|---|---|---|---|
| 0a | `projects/p1-cli-organizer/src/cli.js` | `classify` + `main`（干跑安全）→ 判据 **9/9** | **你**（昨天想好的骨架）|
| 0b | `projects/p1-cli-organizer/README.md` 5 处小改 | 见 ①；表格那处用工具点名 | **你** |
| 1 | 轮转复习 `deepClone` | `node week1-language/recall-verify.js deepClone` 跑到绿 | **你（凭记忆）** |
| 2 | `week2-runtime/day13-zerohint-07.js` | 零提示题第 7 道 `once`（标准见 ④）| **你（零提示）** |
| 3 | `week2-runtime/day13-p-limit.js` | **今天主线 A**：裸写并发池 `pLimit(n)` | **你** |
| 4 | `week2-runtime/day13-p-limit-verify.js` | 它的判据 | **AI 写**（✅ 已就位）|
| 5 | `week2-runtime/day13-fetch.js` | 主线 B：`fetchWithRetry`（超时 + 重试）| **你** |
| 6 | `week2-runtime/day13-fetch-verify.js` | 它的判据（起本地 http server 真跑）| **AI 写**（✅ 已就位）|
| 7 | 日志 + commit + push | Day 12 的尾巴也一起进这次提交 | **你** |

---

## 一 时间表（从开工起算，共约 3 小时 55 分）

| 时段 | 干什么 | 产出 |
|---|---|---|
| **0:00–1:00** | **① 清 Day 12 尾巴**（`classify` + `main` → 9/9；README 小改；日志 ⑥⑦⑧；**commit + push**）| 0a 0b |
| **1:00–1:05** | **② 轮转复习 `deepClone`** | 1 |
| **1:05–1:30** | **③ 零提示题第 7 道 `once`** | 2 |
| **1:30–2:00** | **④ 阅读**：`fetch` 的坑 / `AbortController` / 指数退避 | 4 行笔记 |
| 2:00–2:10 | 休息 | —— |
| **2:10–3:10** | **⑤ 主线 A：裸写 `p-limit`** | 3 4 |
| **3:10–3:40** | **⑥ 主线 B：`fetch` 加超时 + 重试** | 5 6 |
| **3:40–3:55** | **⑦ 判据跑绿 + ⑧ 日志 + commit + push** | 7 |

**关键检查点：2:10（休息结束时）。** 如果 ① 还没完 → **继续清完它**（昨天的尾巴 + 提交是保底）；③④ 没做完就登记欠账，直接进 ⑤。

---

## 二 任务详情

### ① 清 Day 12 尾巴（60 分钟）—— **先清它，别欠**

**0a 写 `projects/p1-cli-organizer/src/cli.js`**（骨架你昨天已经想清了）：
- `classify(name)`：**表**（`[组名, [扩展名...]]` 或对象当表）+ `path.extname(name).toLowerCase()` + 循环外兜底 `'others'`
- `main()`：`parseArgs`（`--target` string / `--verbose` boolean / `--apply` boolean + **`allowPositionals: true`**）；
  **默认干跑 = 只打印**（`main` 里**不许出现** `rename` / `rm` / `unlink` / `mkdir`）；
  汇总固定格式：`共 N 个文件：images X、docs Y、videos Z、others W`（**顺序固定**，所以要一个四键计数对象）；
  目录不存在 → try/catch + 一句人话 + 非零退出码；`--apply` → 打印"还没实现" + `process.exitCode = 1`，**也不动文件**；
  CLI 入口包 `if (require.main === module)`；`module.exports = { classify }`
- 判据：`node --test projects/p1-cli-organizer/test/cli.test.js` → **9 条全绿**（02/03 会**快照对比**目录里的文件有没有被动过）

**0b README 5 处小改**：
1. **表格 `videos` 行缺收尾 `|`** —— `node tools/check-md-tables.js projects/p1-cli-organizer/README.md` 会点名第 22 行（缺了会串列）
2. `readir` → **`readdir`**
3. `不会移动如何文件` → **任何**
4. **把"流式"从「为什么用异步 API」那条里删掉**：`readdir`/`stat` 是"**异步不阻塞**"（Day 10 实测：同步版让定时器多等 18ms）；"**流式**"是 Day 11 的 `createReadStream`（省内存，整读 18.2MB vs 流式 7.0MB）—— **两件事，别混**（面试会追这条）
5. 已知限制写了"**递归**" → 那 `cli.js` 就得**真的递归子目录**（判据的探针会记录，两种都行，但**文档与代码必须一致**）

**然后 commit + push**（Day 12 的日志也一起补完）：

```powershell
git add -A
git commit -m "day12: http basics + project 1 kickoff (dry-run safe cli, README, table checker)"
git push
git status -sb
```

### ② 轮转复习 `deepClone`（5 分钟）

```powershell
node week1-language/recall-verify.js deepClone      # 默认读 week1-language\recall-deepClone.js
```

**规则**：合上源码凭记忆重写；红了再看源码、**合上再写一遍**。
> 提醒：`deepClone` 有两处你以前卡过 —— **`typeof x != "Object"` 大小写**（那次的教训是"判断类型不能用 `typeof` 蒙"）和 **循环引用**（`a.self = a` 会让手写版爆栈；靠"原对象 → 副本的映射表"解决）。

### ③ 零提示题第 7 道（25 分钟，关掉 AI）

**题目：`once(fn)`** —— 让一个函数**只能真正执行一次**，之后再调用它就直接返回第一次的结果、不再执行原函数。

| 输入 | 期望 |
|---|---|
| `const f = once(g); f(1); f(2);` | `g` **只被调用 1 次**（第一次，参数是 `1`）|
| `f(2)` 的返回值 | = 第一次的返回值（不重新算）|
| 只有一个函数被包过 | 每个 `f()` 都返回同一个值 |
| `g` 抛错时算不算"执行过" | **自己定**，在实现旁写一句为什么（判据只记录不判错）|
| 参数 / `this` 要不要透传 | **自己定**，写一句（提示：`fn.apply(this, arg)` 你写过）|

**写在哪**：`week2-runtime/day13-zerohint-07.js`；接口 `module.exports = { once };`
**判据自己写**：`week2-runtime/day13-zerohint-07-verify.js`（`node:test` + `assert`），**并且先故意把实现改坏一个字符、确认判据红，再改回来**。

> 💡 **一分钟后才看的提示**：它和 `debounce` / `curry` 是**同一族工具** —— **用一个闭包变量记住状态 + 返回一个新函数**（你 Day 4 学过"装饰器"那一章，`spy` / `delay` 就是这种；而且 `debounce` 里的 `timer` 就是这个"记住状态的变量"）。
> 为什么今天考它：**你今天封装重试时，一个"只执行一次"的守卫会直接用到**。

### ④ 阅读（30 分钟）

| 顺序 | 读什么 | 抓住什么 |
|---|---|---|
| 1 | [MDN《使用 Fetch》](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch) | `fetch(url)` 返回什么；`res.ok` / `res.status`；**⚠️ 关键坑：服务器返 404/500 时 `fetch` 会 reject 吗？** |
| 2 | [MDN《AbortController》](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController) | `controller.signal` 怎么接到 `fetch`；`abort()` 之后 fetch 抛什么错（`err.name` 是什么）|
| 3 | [Node《Global fetch》](https://nodejs.org/api/globals.html#fetch) | Node 里 `fetch` 就是 undici；**`AbortSignal.timeout(ms)`** 这一行能不能直接做超时 |
| 4 | 指数退避（指数退避 = exponential backoff） | 为什么失败要**等一会儿**再重试？为什么等的时间要**翻倍**？（提示：如果所有客户端同时重试会怎样）|

**产出**：日志里 4 行笔记（① fetch 在什么情况下 reject ② 怎么接 AbortController ③ `AbortSignal.timeout` ④ 指数退避为什么"翻倍"）。

### ⑤ 主线 A：裸写 `p-limit`（60 分钟）

**目标**：写一个**并发池** —— 「同时最多跑 n 个任务，多的排队」。

**为什么「裸写」**：npm 上的 `p-limit` 就是 ~30 行。你要的是**那个思路**（队列 + 计数 + 谁空出来就叫下一个），而不是背 API。

**接口（判据要用，名字必须对齐）**：

```js
// week2-runtime/day13-p-limit.js
function pLimit(concurrency) { ... }        // 返回一个 limit 函数
module.exports = { pLimit };

// 用法：
const limit = pLimit(2);
const results = await Promise.all(
  items.map((x) => limit(() => doSomething(x)))   // 注意：传的是【函数】，不是已经开始的 Promise
);
```

**要满足的行为（判据按这 4 条必过 + 1 条探针）**：
1. `pLimit(n)` 返回一个函数 `limit(taskFn)`，**它返回 Promise**（结果 = `taskFn()` 的返回值）
2. **同时在跑的任务数正好等于 n**（判据会用计数器看"最大同时数"：**大于 n = 一上来全启动了**；**只有 1 = 你写成了队列、不是并发池**）
3. **一个任务失败不影响其他任务**：那个任务对应的 promise reject，**但其他任务照样跑完**
4. **超过 n 的任务是"排队"，不是被丢掉**（判据会数"总共跑了几个"）
5. （**这条判据只做探针、不判错**）**"结果顺序"**：`Promise.all` 拿到的顺序**天生就是传入顺序** —— 这条不用你操心，判据会打印出来给你看清"**完成顺序 ≠ 结果顺序**"

**设计选择（自己定，写一句为什么，判据只记录不判错）**：`n` 是 0 / 负数 / 小数 / 非数字时怎么办？

**做法建议（每加一步跑一次判据）**：先让它"一次只跑一个、按顺序出结果"→ 再放开到"最多 n 个同时"→ 最后处理"失败隔离"。

> 💡 `Promise` 你 Day 7 学过；这里**不需要新 API**。核心就是你写过很多次的"**闭包记状态**" + 一个**队列数组**。

### ⑥ 主线 B：给 `fetch` 加超时 + 重试（30 分钟，时间不够就顺延）

**接口**：

```js
// week2-runtime/day13-fetch.js
async function fetchWithRetry(url, { retries = 2, timeoutMs = 1000, baseDelayMs = 50 } = {}) { ... }
module.exports = { fetchWithRetry };
```

**要满足的行为（判据会起一个本地 http server 真跑）**：
1. 成功（200）→ **直接返回 `Response`**，**不重试**
2. 失败（500）→ **重试**，最多重试 `retries` 次（= 总请求次数 `retries + 1`）
3. **服务器一直不响应** → `timeoutMs` 之后**放弃这次**（用 `AbortController` 掐掉请求）
4. 前几次失败、后来成功 → 最终**成功返回**（并且判据会数到"请求了几次"）
5. 全部失败 → **抛出最后一次的错误**（别把错误吞掉变成 `undefined`）
6. **退避**：第 k 次重试前等 `baseDelayMs * 2 ** (k - 1)`（判据用时间差粗查"是不是真的等了"）

**⚠️ 一个坑（阅读第 1 条会告诉你）**：`fetch` 只在**网络层失败**时 reject，**服务器返回 500 时它不 reject** —— 所以"要不要重试"必须自己看 `res.ok` / `res.status`。

### ⑦ 判据（15 分钟）—— ✅ **两份都已就位**

```powershell
node --test week2-runtime/day13-p-limit-verify.js
node --test week2-runtime/day13-fetch-verify.js     # 它会自己起一个本地 http server（跑完关掉）
```

| 文件 | 必过 / 探针 |
|---|---|
| `day13-p-limit-verify.js` | 必过 7 条：返回 Promise / **最大同时数正好 = n** / **失败隔离** / **排队不丢** / 模块无副作用…；探针：非法 `n`、完成顺序 vs 结果顺序 |
| `day13-fetch-verify.js` | 必过：200 不重试 / 500 重试到位 / **超时能掐掉** / 最终成功 / 全失败要抛错；探针：退避时长、`--json` |

红的每一条都会写出**差在哪、可能是什么原因**（例如"最大同时数到了 5，但 n 是 2 → 你是不是把任务一开始就全启动了？"）。

### ⑧ 日志 + commit（15 分钟）

```powershell
git add -A
git commit -m "day13: concurrency pool (p-limit) + fetch timeout/retry"
git push
git status -sb
```

---

## 三 今天的完成标准

- [ ] **0a** `src/cli.js` 写完 → 判据 **9/9**（干跑/`--apply` 都不动文件）
- [ ] **0b** README 5 处小改（含表格那处）
- [ ] **Day 12 的日志 ⑥⑦⑧ 补完 + commit + push**（HEAD 已经不是 Day 11 那个 `f6e6851`）
- [ ] `deepClone` 轮转复习跑过
- [ ] `day13-zerohint-07.js` + **自写判据**（含"先让它红一次"）
- [ ] 4 行阅读笔记（含"fetch 什么时候才 reject"）
- [ ] `day13-p-limit.js`：**最大同时数 ≤ n** + 顺序 + 失败隔离 + 排队不丢
- [ ] `day13-fetch.js`：200 不重试 / 500 重试 / **超时被掐掉** / 全失败要抛错
- [ ] 两份判据跑绿
- [ ] 日志 + commit + push

---

## 四 如果时间不够：砍单顺序

**保底（别砍）**

1. **① 清 Day 12 尾巴 + 提交**（欠账滚雪球，而且今天的进度是明天的基础）
2. **⑤ 主线 A `p-limit`**（今天的核心）
3. **⑧ 日志 + commit**
4. **② 轮转复习**（5 分钟）

**可以顺延（登记进欠账表）**

5. **⑥ 主线 B `fetch` 封装**（判据已就位，Day 14 开场补也一样）
6. ③ 零提示题
7. ④ 阅读的第 3、4 条
8. 退避时长的精确实现（先"每次固定等 50ms"能过功能，翻倍逻辑明天补）

**关键**：**"同时最多 n 个"这一条比"重试几次都对"重要得多** —— p-limit 是今天的核心，fetch 封装是它的应用。

---

## 五 今天不碰什么

- **项目 1 的 `--apply`**（真移动文件在 Day 14）
- **HTTP 服务端**（昨天只读了文档，今天也不写 server）
- **TS 进阶** → 卡住就查 `notes/ts-cheatsheet.md`
- **探索 TODO 停车场** → 不许插队

---

## 六 明天的锚点

**Day 14（9/28 一）= 包管理与生态 + 项目 1 主体实现**：
- 上午：npm/pnpm 差异、语义化版本、lockfile、workspace、`npm audit`、依赖为什么越少越好
- 下午：**项目 1 主体** —— 文件扫描 → 分类规则 → 移动（**流式复制 + 校验**，正好用上 Day 11 的流）；用 `pnpm` 管理
- 今天写的 `p-limit` / `fetchWithRetry` 会在 Day 16 起的项目 2（API 服务）里直接用上
