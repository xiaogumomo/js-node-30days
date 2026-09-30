# Day 14 任务书：包管理与生态 + 项目 1 主体（真的搬文件：流式复制 + 校验）

> **日期**：2026-09-28（周一）　｜　**第 2 周 Day 6**　｜　**这份是 9/27（Day 13 期间）提前写好的**
> **接昨天**：9/27 Day 13 的 ①②③④ 做完了（轮转 `deepClone` 4/4、零提示题 `once` 5/5、`fetch` 阅读 4 条、`cli.js` 判据 **9/9**）；**⑤ `p-limit` 和 ⑥ `fetch` 都交了、都判「不合格」**（两份判据都是 8/8 全绿、实现是对的，但载重的部分是 AI 教的 → **都是 AI 辅助版**）。**两份的补法不一样**：`p-limit` 是"学过取不出来" → **合上重写**（0a）；`fetch` 是"今天第一次见" → **先分块练**（0b），整份重写排 Day 15/16。⑦⑧ 日志与提交当时没做。
> → **开工后的第一个小时是"清 Day 13 的尾巴"**（见 〇 / 一）。**0c（`once`）和 0a（`p-limit`）两道重写是同一族（闭包记状态 + 调度），挨着做。**
> **今天两节正课**：上午 **包管理与生态**；下午 **项目 1 主体** —— `--apply` **真的搬文件**（流式复制 + 校验）。这正好用上 Day 11 的流。
> **判据都就位了**（AI 9/27 提前备好 + 逐个负向验证过，见各自小节）：`day13-p-limit-verify.js`、`day13-fetch-verify.js`、`projects/p1-cli-organizer/test/apply.test.js`。

---

## 〇 开工前 5 分钟：把产出物抄在纸上

| # | 产出物 | 验收标准 | 谁写 |
|---|---|---|---|
| 0a | `week2-runtime/day13-p-limit.js` | **Day 13 主线 A**：裸写并发池 `pLimit(n)` → `node --test week2-runtime/day13-p-limit-verify.js` **8/8**。<br>⚠️ **9/27 那版判了「不合格」**（AI 教的两处组合技是题眼）→ **0a 现在是"合上重写第二遍"**，见 二 的 0a | **你（合上自己的文件）** |
| 0b | `week2-runtime/day13-fetch-practice.js` | Day 13 主线 B：**分块练**（4 个小练习，见 二 的 0b）→ **整份重写排 Day 15/16**（判据 `day13-fetch-verify.js` 8/8 现成）| **你** |
| 0c | `week2-runtime/day13-zerohint-07.js` | **合上重写一遍** `once` → 判据 **5/5**（9/27 那遍是问 AI 得到的）| **你（关掉 AI）** |
| 0d | `notes/day13.md` 的 ⑤⑥⑦ + `git commit` + `push` | 表格串列跑 `tools/check-md-tables.js` | **你** |
| 1 | `week1-language/recall-throttle.js` | 轮转复习：凭记忆重写 `throttle` → `node week1-language/recall-verify.js throttle` 到绿 | **你（凭记忆）** |
| 2 | `week2-runtime/day14-zerohint-08.js` + **你自己写的判据** | 零提示题第 8 道 `memoize`（标准见 三）| **你（零提示）** |
| 3 | `projects/p1-cli-organizer/package.json` | `pnpm` 建起来 + `pnpm test` 能跑判据 | **你** |
| 4 | `projects/p1-cli-organizer/src/cli.js`（加 `--apply`）| **今天主体**：真的搬文件 → `node --test projects/p1-cli-organizer/test/apply.test.js` **9/9** | **你**（判据 AI 写）|
| 5 | `projects/p1-cli-organizer/README.md` | 跟上代码：4 步搬家流程 + 冲突策略 + 已知限制 | **你** |
| 6 | 日志 `notes/day14.md` + commit + push | | **你** |

⚠️ **别把文件写错地方**（9/27 就是这么栽的）：判据里写死的路径是 `projects/p1-cli-organizer/src/cli.js`，**不是 `test/`**。

---

## 一 时间表（从开工起算，约 5 小时 20 分；时间不够按底下的"砍单顺序"砍）

| 时段 | 干什么 | 产出 |
|---|---|---|
| **0:00–0:10** | **0c** `once` 合上重写（5 分钟能写完，本来就不该超）| 0c |
| **0:10–0:30** | **0a `p-limit` 合上重写（第二遍）** —— 9/27 那版是 AI 教的，**这一遍才算你的** | 0a |
| **0:30–0:50** | **0b `fetch` 分块练**（4 个小练习，见 二 的 0b）| 0b |
| **1:00–1:05** | **1 轮转复习 `throttle`** | 1 |
| **1:05–1:25** | **2 零提示题第 8 道 `memoize`**（关掉 AI）| 2 |
| 1:25–1:35 | 休息 | —— |
| **1:35–2:35** | **上午正课：包管理与生态**（读 + 动手建 `package.json`）| 3 + 4 行笔记 |
| 2:35–2:50 | 休息 | —— |
| **2:50–4:20** | **下午正课：项目 1 主体**（`--apply`：流式复制 + 校验）| 4 |
| **4:20–4:40** | README 跟上 + `notes/day13.md` ⑤⑥⑦ + **commit + push** | 0d 5 6 |
| 剩的时间 | 0b 没做完就补；补不了进欠账 | 0b |

**砍单顺序（从下往上砍，砍掉的进日志"欠账登记"）**：`fetch` 的第 ④ 块（分类设计）→ 零提示题的"第二遍" → 上午正课的动手项 →（**不许砍**）两道**重写**（`once` / `p-limit`）、项目 `--apply` 的判据、日志。

**⚠️ 今天的量偏大（表上约 5 小时 20 分，而你历史上的每一天都超时）→ 先认下"最小集"**（计划 §四「选 A」：宁可砍内容，也不许把清单摊薄）：

| 保底（不许砍） | 用时 | 可顺延（记账即可） |
|---|---|---|
| **0c** `once` 合上重写 → 5/5 | 10 分 | 0b `fetch` 分块练的第 ①②③ 块 |
| **0a** `p-limit` 合上重写（第二遍）→ 8/8 | 20 分 | 零提示题第 8 道 `memoize` |
| **0d** 补日志 4 格 + 提交 | 15 分 | 包管理的**阅读** 4 条（"动手"那步要留）|
| **项目 `--apply`** → `apply.test.js` 9/9 | 90 分 | 轮转复习（只有 5 分钟，尽量别砍）|
| **README 跟上代码**（3 处）| 20 分 | —— |
| **日志 + commit + push** | 15 分 | —— |
| **合计** | **约 2 小时 50 分** | |

**今天有一件事不许只做一半**：`--apply` 要**真的能搬**（明天 Day 15 晚上就是**项目 1 的交付检查**，见计划书 §四）。
**如果今天有课**：能切到课间做的只有"包管理阅读"和"零提示题"，其余都要电脑。


---

## 二 上半场：清 Day 13 的尾巴（别欠，约 1 小时 10 分）

### 0c `once` 合上重写（10 分钟）—— **那一遍才算你的**

昨天那道是**问 AI 做出来的**（日志里记着账）。现在**合上 `day13-zerohint-07.js`**，凭记忆重写一遍，然后：

```powershell
node --test week2-runtime/day13-zerohint-07-verify.js     # 目标 5/5
```

你的判据现在有 5 条（昨天只有 1 条，AI 复核时补厚了）：**数调用次数** / 第二次换参数也返回第一次的结果 / `this`+参数透传 / 抛错后不再执行（你定的规矩）/ 返回 `undefined` 也要只跑一次（防"用 `result === undefined` 当开关"）。
**它和 `p-limit` 是同一个动作**（闭包记住状态 + 调度），所以紧接着做 0a —— 这叫"同族题目紧挨着练"。

### 0a `p-limit` **合上重写（第二遍）**（20 分钟）—— **这一遍才算你的**

**先说清楚 9/27 发生了什么**（完整记录在 `notes/day13.md` 的「AI 复核 ⑤」）：
- 9/27 那份**判据 8/8 全绿，实现是对的**；但**是 AI 教的**，你自评"**无法做到裸写**"，点名想不到的两处是 ① `queue.push({fn,resolve,reject})` + `queue.shift()` 解构（**队列里存"票据"**）② `Promise.resolve().then(()=>fn()).then(resolve,reject).finally(()=>{activeCount--; next()})`（**这条链 + 递归调度**）。
- 你自己也说"**这几处已经是这个代码最重要的部分了**" —— **同意**，所以判**不合格**（账记在日志里）。
- **归类：不是知识缺口，是"学过、没长在身上"** —— 这两处的零件都在**你自己的材料**里（不用补章节，见下）。

**这一遍的口径**（照 Day 10/11/12 那三次重写的老规矩）：

| 项 | 规矩 |
|---|---|
| 允许看 | **你自己的日志**（`notes/day07*.md`、`notes/day11*.md`）、**MDN**、`notes/ts-cheatsheet.md` 那一类查表材料 |
| 不许看 | **你自己那份 `week2-runtime/day13-p-limit.js`**（合上它）、也不许问 AI |
| 判据 | `node --test week2-runtime/day13-p-limit-verify.js` → 目标 **8/8**（现成的，一个字都不用改）|
| 产出 | 覆盖写回 `week2-runtime/day13-p-limit.js`（9/27 那版已经在 git 历史里，重写时对照得回来）|

> ⚠️ **先从"0c `once` 那次"学一条**（9/28 实测发现）：他重写 `once` 时，**上一版还留在同一个文件里当注释** → 新代码和旧版逻辑完全一样 → **那一遍就不算"关着写"**。
> **所以这一遍请先做一件事：把 `day13-p-limit.js` 清空**（只留题头），**从零写**；旧版想看就去 git：`git show 08cddb1:week2-runtime/day13-p-limit.js`。**不要在同一个文件里留旧版注释。**

**指路（只给"去哪儿找"，不给代码）**：
- **"票据"**：你自己写过 `week1-language/day07-promise.js:34` 的 `buyfood` —— 那里 `resolve` 是**交给别人**（定时器）、**过 3 秒才被调用**的。今天只要把"定时器"换成"队列 + 调度器"。
- **`.finally`**：`notes/day07-day2.md` 阅读表第 2 条**列过**它（`new Promise`、`then`/`catch`/`finally`），只是你从没用过。真正要想清楚的是那句"**无论成功还是失败都要执行**"——它对应判据 03 的"失败隔离"。
- **递归调度**：`next()` 在最后又去叫 `next()` —— 和你 `day10-dir-size.js` 里 `walk` 递归进子目录是**同一个形状**（"干完一件，看还有没有下一件"）。

**写完在日志里回答两个"为什么"**（机制层，答不出就是没长在身上）：
1. `activeCount--` 和 `next()` 为什么放在"无论成功失败都会执行"的那一支里？**只写在成功分支**会怎样？
2. 队列里为什么要**连 `resolve`/`reject` 一起存**？只存 `fn` 行不行？

**判据已就位**：`node --test week2-runtime/day13-p-limit-verify.js` → **8/8**（必过 7 + 探针 1）。它**靠任务自己记账**量并发（每个任务进出时 `running++/--`，记 `peak`），这个数骗不了人。
⚠️ **容易写错的两个方向**（判据会分别抓）：一上来把任务**全启动**（peak > n，不是并发池）/ 写成"**一次只跑一个**"（那是队列，不是并发池）。

**AI 9/27 重跑过负向验证**（判据必须先能红）：

| 参照实现 / 故意写坏的版本 | 判据结果 |
|---|---|
| 参照实现（正确）| **8/8 全绿** |
| 一上来全启动 | 红在 `02`（peak > n）、`05` |
| 一次只跑一个 | 红在 `02`（peak = 1 < n）、`05` |
| 超出的任务直接丢掉 | 红在 `02 03 04 05` |
| 一个任务失败就停摆 | **只**红在 `03`（失败隔离）|
| 跑了任务但不返回 Promise | 红在 `01 02 03 04` |

顺带**修掉了判据自己的一处毛病**（AI 记账）：探针里"非法 n"那 4 个用例原本会**把探针自己挂死**（`pLimit(0)` 让任务永远不结算）→ 探针变红，违反了"只记录不判错"。现在探针带超时，会把"挂住了"**记下来**。

### 0b `fetch`：**分块练**（20 分钟）—— **不要求整份重写**

**先说清楚 9/27 发生了什么**（完整记录在 `notes/day13.md` 的「AI 复核 ⑥」）：
- 9/27 那份 `day13-fetch.js` **判据 8/8 全绿**（探针：退避 `[102, 202]ms` 真的翻倍；超时那次服务器**看到**连接被掐断），**但整份是 AI 辅助的** —— 他自评"**今天刚学 fetch，自己独自完成肯定不可能**"，也要求判不合格 → **判不合格，账记了**。
- **但这一份和 `p-limit` 不是一类**：`p-limit` 是"学过、取不出来"（→ 合上重写）；`fetch` 是"**今天第一次见**"（`AbortController`/`signal`/`AbortError`/退避是 ④ 才读的，`HttpError` 子类全新）→ **整份"合上重写"不公平也测不出东西**，要先**分块亲手写**。

**分块练习**（写进 `week2-runtime/day13-fetch-practice.js`，每块 5–10 分钟，每块都要能跑出输出）：

| # | 写什么 | 为什么拆这一块 |
|---|---|---|
| ① | `fetchOnce(url, timeoutMs)`：用 **`AbortSignal.timeout(ms)`** 一行做超时 | 把"超时"故意做成**一行**，看清 `signal` 怎么接进 `fetch`（也看清：现成那份里 3 行能合成 1 行）|
| ② | 同样的事，但**手写** `AbortController` + `setTimeout(abort)` + `clearTimeout` | 手写一遍才知道 `signal` 不是魔法，`AbortSignal.timeout` 就是它的糖 |
| ③ | `retryFixed(url, times)`：**只重试**（固定等 50ms，用你写过的 `sleep`），不退避、不分类 | "重试循环"单独练 —— 这一块你**一定写得出来** |
| ④ | `HttpError extends Error` + **分类**（200 直接回 / 500 重试 / 404 不重试）| 这是**设计**不是 API；设计得靠自己定规则 + 说为什么才能长在身上 |

**判断自己练没练明白的两句话**（写进日志）：
1. fetch 在服务器返 500 时**不会 reject** → 那"要不要重试"的依据是什么？`res.ok` 和 `res.status` 各覆盖什么情况？
2. `abort()` 之后 fetch 抛的错 `err.name` 是什么？为什么靠它就能把"超时"和"别的网络错误"分开？

**整份重写排在 Day 15/16 开场**（不是今天）：判据 `node --test week2-runtime/day13-fetch-verify.js` → **8/8** 现成（它自己起本地 http server 真跑：`/ok`、`/always500`、`/failTwice`、`/slow600`）。
**AI 9/27 的负向验证**：参照实现 **8/8**；不重试 → 红在 `02 04`；不超时 → 红在 `03`；成功也重试 → 红在 `01 02 04 05`；全失败吞掉 → 红在 `02 03 05`。
**另外**：把"fetch 封装（最小版）"加进**第 3 周的轮转表**（判据现成，正好当复习）。

### 0d 补 `notes/day13.md` 的收尾格子 + commit（15 分钟）

⚠️ **9/27 收工时漏了 4 个格子**（AI 9/28 早上核对时发现：勾选 0 条、欠账表还是占位符）。**先补这 4 处**，再提交：

| # | 补什么 |
|---|---|
| 1 | **今日目标**那 8 个 `[ ]` 打勾（⑤⑥ 可以标"AI 辅助"）|
| 2 | **今日产出**表的状态列：`⬜` → `✅`（`p-limit` / `fetch` 两行注明"AI 辅助版"）|
| 3 | **⑤ 的「实测输出」**还是模板那句话 → 跑一次贴真实输出：`node --test week2-runtime/day13-p-limit-verify.js` |
| 4 | **欠账登记**表 → 填三条真欠账：`p-limit` 合上重写（今天开场）、`once` 合上重写（今天开场）、`fetch` 分块练 4 块（今天 0b）+ 整份重写（Day 15/16）|

⑤⑥ 那两张表你已经填过了（每行都写了"实现（ai帮我完成的）"—— 这个如实记法是对的）。

```powershell
node tools/check-md-tables.js           # 表格串列自检（写完日志就顺手跑）
git status -sb                          # ⚠️ 重点看：有没有多出不该提交的文件
git add -A
git commit -m "day13: log wrap-up + handoff status"
git push
git ls-remote --heads origin main       # 和 git rev-parse HEAD 比 SHA
```

⚠️ **`git add -A` 前扫一眼 `git status`**：9/27 `projects/p1-cli-organizer/test/cli.js` 就是这么被扫进去的（一份放错目录的实现，还让根目录的 `node --test` 多出一条**幽灵通过**）。
⚠️ **`notes/HANDOFF.md` 有两处是 AI 9/27 收工后改的**（⑧ 标成已完成 + 记上推送号 `08cddb1`）→ **一起提交掉**，不然交接文档里会留着"⑧ 未做"的过期状态。

---

## 三 两个每日环节（25 分钟，不占清单时间）

### 1 轮转复习 `throttle`（5 分钟）

```powershell
node week1-language/recall-verify.js            # 看轮转表，今天轮到 throttle
node week1-language/recall-verify.js throttle   # 判你的稿子
```

重写稿放 `week1-language/recall-throttle.js`。**忘了它"干什么"允许翻概念材料（任务书 / `p0-toolkit/README.md`），不许翻源码**；有红 → 打开源码对照后**合上再写一遍**。

### 2 零提示题第 8 道 `memoize`（20 分钟，**关掉 AI**）

**题目**：写一个 `memoize(fn)` —— 返回一个新函数；**相同参数**第二次调用时**不重新计算**，直接给上次的结果。

**验收标准（判据要你自己写，AI 只看你写的判据能不能红）**：

| 输入 | 期望 |
|---|---|
| 同一个参数调两次 | 原函数**只被调用 1 次**（⚠️ **数次数**，不能只看"返回值一样"）|
| 换一个参数 | 原函数再跑 1 次（不同参数不共用缓存）|
| 原函数抛错 | 你自己定：算不算"算过了"？写一句为什么，判据里有一条对应它 |
| 多个参数 / 参数是对象 | 你自己定"什么算同样的参数"，写一句为什么，判据里有一条对应它 |

规则：**卡住只许查 MDN / 书，不许问 AI**；限时 20 分钟，到点停手（**产出是"看清卡在哪"，不是"写出来"**）；判据写完**先故意把实现改坏一个字符**，确认它红了再信它的绿。
（`once` 昨天是问 AI 做完的，`p-limit` 今天要自己做 —— 这道 `memoize` 就是那个"同族再练一次"。）

---

## 四 上午正课：包管理与生态（60 分钟）

**读 4 条（30 分钟，边读边往日志写 4 行）**：

| # | 读什么 | 抓住什么 |
|---|---|---|
| 1 | [pnpm 官网 "Motivation" / "pnpm vs npm"](https://pnpm.io/motivation) | 内容寻址存储 + 硬链接**为什么省磁盘**；**幽灵依赖**（phantom dependency）是什么、npm 为什么会让你用它 |
| 2 | [npm docs 语义化版本](https://docs.npmjs.com/about-semantic-versioning) | `^1.2.3` / `~1.2.3` / `1.2.3` 各放行哪一档升级；**为什么 `0.x.y` 是特例** |
| 3 | [pnpm `pnpm-lock.yaml`](https://pnpm.io/settings#lockfile) / npm 的 lockfile 文档 | lockfile 是干什么的、**为什么必须提交进 Git**、没有它会怎样（同一份 `package.json` 装出两套依赖）|
| 4 | [npm audit 文档](https://docs.npmjs.com/cli/v10/commands/npm-audit) + 任意一篇"为什么依赖越少越好" | 一个依赖 = 多少你没读过的代码；`postinstall` 脚本能干什么；**供应链攻击**是怎么进来的 |

**动手 5 步（30 分钟，必须有能跑的东西）**：

```powershell
cd projects/p1-cli-organizer
pnpm init                       # 建 package.json
pnpm pkg set name="p1-cli-organizer" private=true description="批量文件整理 CLI（项目 1）"
pnpm pkg set scripts.test="node --test"              # ⚠️ 不要带路径（见下）
pnpm pkg get type               # ← ⚠️ 为了看清：type 是 undefined（= CJS），不是 "module"
pnpm test                       # ← 今天要亲眼看到"判据 = 待办清单"（apply 那 6 条红）
pnpm add -D picocolors          # 故意装一个小依赖：看 package.json / pnpm-lock.yaml 各多了什么
pnpm remove picocolors          # 再删掉：看 lockfile 又变回去（顺手体会"依赖最小化"）
pnpm audit                      # 读一遍输出（0 vulnerabilities 也要会读）
pnpm list --depth=0             # 现在到底装了什么
```

> ⚠️⚠️ **今天最可能炸的一处：`package.json` 的 `type` 字段。**
> 这个项目**全是 CommonJS**（`require` / `module.exports` —— `src/cli.js` 和两个 `.test.js` 都是）。
> **`type` 一旦写成 `"module"`，这些文件全部当场失效**（`require is not defined`），判据一条都跑不起来，**而报错会指向"某个函数没定义"，看不出真因在 package.json**。
> ✅ **正确做法：不写 `type`（删掉），或显式写 `"type": "commonjs"`** —— 参照 `week1-language/p0-toolkit/package.json`（它压根没有 `type` 字段）。
> 写完**立刻验一次**：`pnpm test` 应该是"3 通过 / 6 红（`--apply` 待办）"；若变成 `require is not defined` 一类，先回去看 `pnpm pkg get type`。

**写进日志的 4 行**（不要抄文档）：① pnpm 和 npm 最实质的差别是什么；② 你在 `package.json` 里为什么这么写（`private` / `test` script / **为什么不写 `type`**）；③ lockfile 变化前后你看到了什么；④ "幽灵依赖"用一个例子说清（`pnpm add -D picocolors` 之后，能不能 `require` 一个没写进 `package.json` 的包？）。

> ⚠️ **`pnpm init` 之后 `pnpm test` 会红**（`apply.test.js` 的 6 条）—— **这是设计如此，判据就是待办清单**，不是环境坏了。等你写完 `--apply` 它会变绿。
> 仓库根的 `node --test` 现在一共 **45 条**（工具箱 27 + 项目 18），红 6 条全是 `--apply` 的待办。
> **没网也能做**：把 `add / remove / audit` 三步划掉，只做 `init` + `pkg set` + `pnpm test` + `pnpm list`（其余顺延，记账）。

---

## 五 下午正课：项目 1 主体 —— `--apply` 真的搬文件（90 分钟）

### 5.1 契约（判据就照这个判，也是你要写进 README 的）

```
node src/cli.js <源目录> [--target <目标目录>] [--verbose] [--apply]
```

⚠️ **只有这三个选项**（`--target` string / `--verbose` boolean / `--apply` boolean）—— **不要新增 `--dry-run`**：这个工具的契约是"**默认就是干跑**"，加了这个 flag 会和判据的选项契约打架。（计划书 §四 Day 15 那行写着"`--dry-run` 模式"，那是旧措辞，别照它加。)

- **不加 `--apply` = 干跑，一个文件都不许动**（连目录都不许建）—— 这条判据已经盯着了（`cli.test.js` 的 03）。
- **加了 `--apply`**，每个文件走**四步，顺序不能反**：
  1. `mkdir -p <目标>/<分类>/`（递归建目录；默认目标目录 = 源目录自己）
  2. **流式复制**：`createReadStream(src)` → `pipeline` → `createWriteStream(dest)`
  3. **校验**：两边 `stat.size` 相等 + `sha256` 相同（哈希也要**流式**算）
  4. **校验通过才 `unlink(src)`** ← **顺序反了就可能丢文件**，今天判据 01/02 就在盯这个
- **任何一步失败**：**源文件必须原样还在**、报错要带文件名、退出码非零、**其余文件继续搬**（失败隔离 —— 和 `p-limit` 是同一件事）。
- **幂等**：扫描时**跳过目标目录**。连跑两次不许"套娃"（`_out/images/photo.jpg` 不能变成 `_out/images/images/photo.jpg`）。
- **重名冲突**（README「已知限制」里你自己写的那条）：两个子目录里的 `photo.jpg` 撞在一起 —— **改名**（`photo (1).jpg`）或**跳过并报一声**，**两种都行**，但不许覆盖、不许丢。

### 5.2 拆解顺序（按这个顺序写，一步一跑）

1. **先写一个函数搬一个文件**（今天真正的新东西就这 10 来行）：`moveOne(srcPath, destDir)` = mkdir → 流式复制 → 校验 → 删源 → 返回新路径。
   - 指路到你**自己写过的代码**：`week2-runtime/day11-ndjson.js:187`（`createReadStream`）、`week2-runtime/day11-make-big.js:12`（`createWriteStream`）。
   - 新 API 只有两个名字，去查文档别猜：`node:stream/promises` 的 **`pipeline`**（它替你接好背压和错误传播）、`node:crypto` 的 **`createHash('sha256')`**（它是个 Transform，能直接放进 `pipeline`）。
   - **写完立刻跑**：`node --check src/cli.js`，再拿你自己造的一个小文件手动搬一次（心法第 7 条）。
2. **接进 `main`**：`--apply` 走搬家分支，干跑分支**一行都不许改**（它已经 9/9 了，别碰坏）。
3. **失败隔离**：`try/catch` 要包在**每个文件的搬家调用**外面（不是整个循环外面），catch 里累计 `failed`，最后 `process.exitCode = 1`。
   ⚠️ **catch 里要用到的变量，声明在 `try` 外面**（昨天 `dir` 那条老教训）。
4. **幂等**：扫描到目录时，如果它就是目标目录 → `continue`。
5. **冲突**：定一种策略 + 写进 README。
6. **汇总行**：干跑那行格式别动（判据 07 认它），`--apply` 时**另加**一行（搬了几个 / 跳过几个 / 失败几个 —— 格式自定，判据不看这行、只看磁盘上的文件）。

### 5.3 判据：`node --test projects/p1-cli-organizer/test/apply.test.js` → 9/9

**AI 9/27 的负向验证**（判据必须能红，红了还得红在对的那条）：

| 故意写坏的版本（只坏一处）| 判据结果 |
|---|---|
| 参照实现（正确：流式 + 校验 + 改名 + 跳过目标目录 + 失败隔离）| **9/9 全绿** |
| 复制用整份 `readFile`（不流式）| 红在 `06` |
| 撞名直接覆盖 | **只**红在 `02` |
| 不跳过目标目录 | **只**红在 `04`（套娃）|
| 一个失败就中断全部 | **只**红在 `03`（失败隔离）|
| 先删源再复制 | 红在 `01 02 04 05`（丢文件）|
| 流式但**不校验** | **全绿 ⚠️（这是判据的已知盲区）** |

**换一种冲突策略也验过**：改成"撞名就跳过"→ **9/9 全绿**（判据不偏向任何一种策略，它只看"内容还都在不在"）。

⚠️ **两条实话（AI 写进判据注释里的，别被骗）**：
1. **`06` 不是行为测试，是"看代码的合同检查"**（有没有 `createReadStream`/`createWriteStream`、有没有整份 `readFile`）。**本来的打算是用 `--max-old-space-size` + 大文件卡住"整份读进内存"的实现 —— 卡不住**：AI 实测 64MB / 128MB 的文件在 16MB / 8MB 上限下**照样跑通**（V8 的大对象空间不认这个上限），只有 256MB 才崩。所以那条路放弃了，**"真的用了流"这件事的牙在 AI 读代码复核，不在判据里**。
2. **`05`（24MB 大文件）只是规模冒烟**（搬得动、sha256 不差）—— **不证明**用了流。
   同理，**"校验"这一步判据只能验到"失败时源文件还在"**这一层（`03`）；"复制出来的字节被静默改坏"要真的写坏一次才能造，造不出来 —— 那部分的依据是：你的代码 + 日志里你写的做法 + AI 复核。

### 5.4 README 要跟着改的 3 处（**文档与代码要对账**）

1. 删掉「`--apply` 还没实现（Day 14 做）」→ 换成**四步流程**（mkdir → 流式复制 → 校验 → 删源）+ **默认目标目录是什么**。
2. 「已知限制」里的**文件名冲突**：写清你选了哪种策略、为什么。
3. 「为什么用 `readdir`/`stat` 异步 API」那段现在是**两件事混在一起**（异步 ≠ 流式）—— 分成两条：**异步不阻塞** + **流式省内存**（今天正好有 `apply` 的复制当例子）。
   跑一下 `node tools/check-md-tables.js projects/p1-cli-organizer/README.md`。

---

## 六 今天必须记住的三条（通用教训，不是"你今天慢"）

1. **"接线"族第 4 次了**（Day 7 五轮 → Day 10 两版 → Day 13 `cli.js` 四版 → 今天要盯住）：**卡住的原因多半不是"没学会"，是接线**。三条零成本自查：
   - **`catch` 里要用到的变量，声明在 `try` 外面**（昨天 `dir` 那条：一次报 3 条红，其实是同一个根因）
   - **每段/每版用不同的函数名**，别靠"最后声明的生效"（Day 7 两个 `login` 撞名）
   - **写完一个文件立刻 `node --check` + 跑一次** —— 昨天 11 处接线错里 8 处"一跑就现形"
2. **判据的"牙"要盯着**（昨天连中两枪）：① 你的 `once` 判据**没数调用次数** → 坏实现照样全绿；② 你**把最关键的断言注释掉** → 另一个坏实现 5/5 全绿。
   规矩：**每条判据都要能说出"它在防哪种坏法"**（说不出 → 多半是多余的）；**"只执行一次 / 不重试"这种必须数行为**（`assert.equal(calls, 1)`）；**绝对不许靠注释掉断言让它变绿**。
3. **项目 1 的底线是"不丢文件"**：**先复制 → 校验通过 → 再删源**。今天所有判据里最重的两条（`01` 内容 sha256 一致、`02` 撞名不丢）盯的就是这个。

---

## 七 收尾（15 分钟）

```powershell
node tools/check-md-tables.js
node --test projects/p1-cli-organizer/test/apply.test.js   # 9/9
node --test projects/p1-cli-organizer/test/cli.test.js     # 9/9（干跑那条底线别碰坏）
cd week1-language/p0-toolkit && pnpm test                  # 27 条基线，别被今天改坏
cd ../../ && git status -sb && git add -A && git commit -m "day14: pnpm setup + project1 --apply (streaming copy + verify)"
git push
```

**日志里要填**：⑤⑥（p-limit / fetch 的实测输出）、项目那两张表（搬家四步各卡在哪、冲突策略为什么这么定）、**记账**（哪些行是 AI 给的）、欠账登记（`fetch` 顺延 / 零提示题第二遍）。
