# Day 12 任务书：HTTP 与原生 `http` + **项目 1（批量文件整理 CLI）启动**

> **日期**：2026-09-26（周六）　｜　**第 2 周 Day 4**
> **按 3.5～4 小时排**（"选 A"：量排轻、清单划干净，多的推给下一天）
> **今天接昨天**：Day 11 用"流 + 背压"对付大文件；**今天起把学过的东西组装成一个真项目** ——
> 项目 1 的"移动大文件 + 进度显示"就是昨天那套流式处理的地基。
> **对照计划**：`js-node-30day-plan.md` §四 第 2 周 Day 12
> **⚠️ 昨天有欠账**（`day11-ndjson.js` 是 AI 帮着写的 + 内存实测没做）→ 见 ①，先清再进主线

---

## 〇 开工前 5 分钟：把产出物抄在纸上

| # | 产出物 | 验收标准 | 谁写 |
|---|---|---|---|
| 0a | `week2-runtime/day11-ndjson.js` **合上重写** | 整读版 + 流式版都跑通 → 判据 **10/10**（可查你自己的日志/MDN） | **你**（昨天那份是 AI 帮写的）|
| 0b | 日志里的**内存实测数字** | 整读 vs 流式的 `heapUsed` 峰值各一个数字 | **你** |
| 1 | 轮转复习 `curry` | `node week1-language/recall-verify.js curry` 跑到绿 | **你（凭记忆）** |
| 2 | `week2-runtime/day12-zerohint-06.js` | 零提示题第 6 道 `countByExt`（标准见 ④） | **你（零提示）** |
| 3 | `projects/p1-cli-organizer/README.md` | 简介 / 用法 / **分类规则表** / 设计说明 / 已知限制 | **你**（**先写它**）|
| 4 | `projects/p1-cli-organizer/src/cli.js` | **今天的主线**：`classify` + 干跑输出 + 安全（`--apply` 也不动文件） | **你** |
| 5 | `projects/p1-cli-organizer/test/cli.test.js` | 项目的判据（造临时目录 + 快照对比"文件没被移动"） | **AI 写**（✅ 已就位） |
| 6 | 日志 + commit + push | —— | **你** |

> **如果今天要上课/有事**：**⑥ 主线（README + 骨架）是最不可替代的**，宁可把 ③④⑤ 顺延，也别让"项目 1 启动日"空着。

---

## 一 时间表（从开工起算，共约 3 小时 45 分）

| 时段 | 干什么 | 产出 |
|---|---|---|
| **0:00–0:40** | **① 清欠账**：先修 3 处小尾巴 → **合上重写 `day11-ndjson.js`**（整读版 + 流式版）| 0a |
| **0:40–1:00** | **② 内存实测**：造 20 万行大文件 → 两个版本各量一次峰值 | 0b |
| **1:00–1:10** | **③ 轮转复习 `curry`**（5 分钟）+ 默写"流式逐行"模式（3 分钟）| 1 |
| **1:10–1:35** | **④ 零提示题第 6 道 `countByExt`** | 2 |
| **1:35–2:10** | **⑤ 阅读 HTTP**（请求-响应 / 报文 / 状态码 / `createServer`）| 4 行笔记 |
| 2:10–2:20 | 休息 | —— |
| **2:20–3:35** | **⑥ 主线：项目 1 启动**（**先写 README** → 再写 `src/cli.js`）| 3 4 |
| **3:35–3:55** | **⑦ 判据跑绿 + ⑧ 日志 + commit + push** | 5 6 |

**关键检查点：2:20（休息结束时）。** 如果 ①–⑤ 还没做完 → **先把 ① 做完**（昨天的欠账，会滚雪球），③④⑤ 里没做完的登记欠账、直接进 ⑥。

---

## 二 任务详情

### ① 清欠账：重写 `day11-ndjson.js`（40 分钟）

**先修 3 处小尾巴**（昨天 AI 指出来的）：
1. **第 19 行**（注释里的整读版）：`fsPromises.readFile(fileURLToPath,"utf8")` → 用 `file`（`fileURLToPath` 未定义）
2. main 的 catch：`console.log("文件为空")` → 带上**真实原因**（`err.code || err.message`）
3. 同一处补 **`process.exitCode = 1`**

**然后合上文件（包括注释！），凭记忆把两个 `summarize` 都写出来**：
- **整读版**：`readFile` 一次读进来 → 按 `\n` 切 → 逐行 `JSON.parse`
- **流式版**：`createReadStream` + 自己切行（`leftover` 拼接 + **循环结束后处理残行**）
- 两个版本**输出必须一模一样**（用同一个文件对一次）

**判据**（现成，跑绿才算过）：`node --test week2-runtime/day11-ndjson-verify.js` → **10/10**

> 允许查你自己的日志、`notes/ts-cheatsheet.md`、MDN、以及**你自己以前写的 `dirSize`**（Day 10 的递归/累加思路可以借鉴）。**不算默写，能独立写出来就算。**
> 💡 昨天那份跑绿了但你说了"我不会流式处理"—— **今天这一遍才是判据**。

### ② 内存实测（20 分钟）

1. **造大文件**：20 万行 NDJSON（约 13MB）。用**写流**造（`createWriteStream` + 循环 `write`），别一次拼个巨型字符串。
2. **量峰值**：写一个 10 行的小脚手架（不要改 `summarize` 的实现）：
   ```js
   const t = setInterval(() => { peak = Math.max(peak, process.memoryUsage().heapUsed); }, 5);
   const r = await summarize(bigFile);   // 跑完
   clearInterval(t);
   console.log('结果', r, '峰值 heapUsed ≈', (peak / 1024 / 1024).toFixed(1), 'MB');
   ```
3. **两个版本各跑一次**，把数字填进日志。
4. **参考量级**（AI 实测，同一个 13.1MB 文件）：整读版 **22.8MB** / 流式版 **8.3MB**（起跑都是 4.4MB）→ **整读 ∝ 文件大小，流式 ≈ 常数**。
5. 可选加分：给整读版加 `--max-old-space-size=64` 再配一个更大的文件 —— 它会挂，流式版照活。

### ③ 轮转复习 `curry` + 默写流式模式（10 分钟）

```powershell
node week1-language/recall-verify.js            # 看轮转表（昨天过了 debounce，今天轮到 curry）
node week1-language/recall-verify.js curry      # 跑验收（默认读 week1-language\recall-curry.js）
```

**规则**：合上源码凭记忆重写；红了再看源码、**合上再写一遍**。

**默写（3 分钟，写在纸上）**：**流式逐行** =
```
for await (const chunk of 流)  →  leftover 拼接  →  按 \n 切  →  最后一段留作 leftover  →  循环结束后处理残行
```
（写不出来就说明它还没长在身上，记进日志。）

### ④ 零提示题第 6 道（25 分钟，关掉 AI）

**题目：`countByExt(paths)`** —— 给一组文件路径（字符串数组），按扩展名统计各有几个。

| 输入 | 期望输出 |
|---|---|
| `countByExt(['a.js','b.js','c.txt'])` | `{'.js': 2, '.txt': 1}` |
| `countByExt([])` | `{}` |
| 没有扩展名的（`'README'` / `'Makefile'`）| 键是**空字符串** `''`（`path.extname` 就是这么返回的）：`countByExt(['README'])` → `{'': 1}` |
| 大小写 | **原样算**（`'.JS'` 和 `'.js'` 算两个键）—— 这是本题的规定，不是通用真理 |
| 原数组 | **不能改** |

**写在哪**：`week2-runtime/day12-zerohint-06.js`；接口 `module.exports = { countByExt };`
**判据自己写**：`week2-runtime/day12-zerohint-06-verify.js`（`node:test` + `assert.deepEqual`），**并且先故意把实现改坏一个字符，确认判据红，再改回来**。

> 💡 **一分钟后才看的提示**：外层攒**对象**、**每个键攒数字** —— 和 `countChars` 里那句 `result[key] = (result[key] ?? 0) + 1` 是**同一个动作**。要用 `path.extname`（你 Day 10 笔记第 9 条写过）。

### ⑤ 阅读 HTTP（35 分钟）

| 顺序 | 读什么 | 抓住什么 |
|---|---|---|
| 1 | [MDN《HTTP 概述》](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview) | 客户端/服务器、**请求-响应**模型（一句话说清）|
| 2 | [MDN《HTTP 消息》](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Messages) | 报文分几段（**起始行 / 头 / 空行 / 体**）|
| 3 | [MDN《HTTP 状态码》](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status) | 1xx–5xx 各记**一个**例子（200 / 301 / 404 / 500 各是什么场景）|
| 4 | [Node《HTTP》](https://nodejs.org/api/http.html) 开头那个最小例子 | `http.createServer` 长什么样、`res.end()` 干嘛 |

**产出**：日志里 4 行笔记（① 请求-响应一句话 ② 报文几段 ③ 状态码分类 + 4 个例子 ④ `createServer` 最小例子抄一遍）。

### ⑥ 主线：项目 1 启动（75 分钟）—— **先写 README，再写代码**

**目录**：`projects/p1-cli-organizer/`（已存在，空的）

```
projects/p1-cli-organizer/
  README.md          ← 先写这个
  src/cli.js         ← 今天的代码
  test/cli.test.js   ← 判据（AI 写，已就位）
```

**接口（判据要用，名字必须对齐）**：

```js
// src/cli.js 要导出（供判据直接查分类规则）
function classify(fileName) { ... }   // 返回 'images' | 'docs' | 'videos' | 'others'
module.exports = { classify };

// 同时作为命令行脚本能直接跑：
//   node projects/p1-cli-organizer/src/cli.js <源目录> [--target <目录>] [--verbose] [--apply]
```

**分类规则（照抄进 README 的表格，不区分大小写）**：

| 分类 | 扩展名 |
|---|---|
| `images` | `.jpg` `.jpeg` `.png` `.gif` |
| `docs` | `.pdf` `.docx` `.txt` `.md` |
| `videos` | `.mp4` `.mov` |
| `others` | **其余全部，包括没有扩展名的**（如 `README`）|

**行为要求（7 条）**：

1. **默认就是干跑**：不加 `--apply` → **只打印计划，一个文件都不许动**（判据会**快照对比**确认没有新建/删除/改名/移动）
2. `--apply` **今天还没实现**：打印一句"`--apply` 还没实现（Day 14 做）" + `process.exitCode = 1`；**同样不许动文件**
3. 干跑输出：每个文件一行 `计划：<文件名> → <分类>/`；`--verbose` 时额外打完整路径和字节数
4. 末尾汇总一行（顺序固定）：`共 N 个文件：images 2、docs 1、videos 0、others 1`
5. 源目录不存在 → **友好报错**（一句话，不是栈）+ 非零退出码；**空目录 → 汇总 0，不报错**
6. CLI 入口包进 `if (require.main === module)`
7. `--target <目录>` 只解析并**显示**（`目标目录：xxx`），**今天不创建它**

**README 必须有的五块**：
1. 一句话简介　2. 怎么跑（3 条示例命令）　3. **分类规则表**（上面那张）
4. **设计说明**：① 为什么默认干跑（安全，误操作可回滚）② 为什么用"扩展名 → 目录"的表（可扩展）③ 为什么用 `readdir` / `stat` 这类异步 API（Day 10/11 学的：不卡事件循环）
5. **已知限制**：`--apply` 还没实现；不处理符号链接；同名文件冲突还没有方案；进度显示还没做

**做法建议（用最小版起步，每加一步跑一次判据）**：
先让 `classify` 对 6 个名字给对分类 → 再让 CLI 列出文件名 + 汇总 → 再加 `--verbose` / `--target` → 最后确认 `--apply` **不动文件**。

**跑起来才算数**：
```powershell
node projects/p1-cli-organizer/src/cli.js .                      # 干跑，打印计划 + 汇总
node projects/p1-cli-organizer/src/cli.js . --verbose            # 更详细
node projects/p1-cli-organizer/src/cli.js 不存在的目录            # 期望：友好报错
node projects/p1-cli-organizer/src/cli.js . --apply               # 期望：说明还没实现 + 不动文件
```

### ⑦ 判据（20 分钟）—— ✅ **已就位，直接跑**

```powershell
node --test projects/p1-cli-organizer/test/cli.test.js
```

它在系统临时目录造一棵小目录树（**6 个文件**：`photo.JPG`（大写）/ `pic.png` / `note.txt` / `report.pdf` / `clip.mp4` / `README`（没有扩展名）；**子目录放在探针里**），断言：

| 条目 | 判什么 |
|---|---|
| 00 | `src/cli.js` 能 require、导出 `classify` |
| 01 | 分类规则：各扩展名、**大写 `.JPG`**、**没有扩展名的 `README`** → `others`（13 个样本）|
| 02 | **干跑**：退出码 0 + 输出里有 6 个文件名 + 汇总数字对 + **快照对比（文件一个都没动）** |
| 03 | **`--apply` 不动文件**（今天没实现，但也不许动）+ 明确说明"还没实现" |
| 04 | 目录不存在 → 一句人话 + **非零退出码**（不是崩栈）|
| 05 | 空目录 → 退出码 0 + 汇总里有 0 |
| 06 | 模块能被 require 而不会顺手把 CLI 跑起来 |
| 07 | 汇总行的四个分类都在，且按 `images → docs → videos → others` 排 |
| P | 探针（只记录不判错）：`--verbose` / `--target` / 无参数用法 / **子目录要不要递归**（今天没规定，两种都行 —— 但要写进 README）|

> **判据已做负向验证**（AI，9/25 晚）：参照实现 **9/9 全绿**（`cli.test.js` 共 9 条：必过 8 + 探针 1）；9 个"只坏一处"的变体各自红在对的条目 —— 其中两个最关键的是 **"干跑却动了文件"→ 02 红** 和 **"`--apply` 动了文件"→ 03 红**，都会明确打出"⚠️ 干跑却动了文件！这个目录在做计划的时候应该是只读的"。

> 老规矩：跑绿之前先看 `ℹ pass` 那个数，末尾会打印本文件有几条 `test()`。

### ⑧ 日志 + commit（20 分钟）

```powershell
git add -A
git commit -m "day12: http basics + project 1 kickoff (cli skeleton, dry-run safe, README first)"
git push
git status -sb
```

---

## 三 今天的完成标准

- [ ] `day11-ndjson.js` **合上重写**（整读 + 流式），判据 **10/10**（新增 08「多块文件」检查）
- [ ] 内存实测（整读 vs 流式两个 `heapUsed` 峰值）填进日志
- [ ] `curry` 轮转复习跑过（绿了打勾，红了写清红在哪）
- [ ] `day12-zerohint-06.js` + **自写判据**（含"先让它红一次"）
- [ ] HTTP 4 行笔记
- [ ] `projects/p1-cli-organizer/README.md`（五块都齐，含**分类规则表**）
- [ ] `src/cli.js`：`classify` 规则对 + 干跑能出计划 + `--apply` **不动文件** + 目录不存在友好报错
- [ ] 判据 `test/cli.test.js` 跑绿
- [ ] 日志 + commit + push

---

## 四 如果时间不够：砍单顺序

**保底（别砍）**

1. **① 重写 `day11-ndjson.js`**（昨天的欠账，判据 10/10）
2. **⑥ 主线的"README + `classify` + 干跑打印"**（项目 1 启动日的核心）
3. **⑧ 日志 + commit**
4. **③ 轮转复习**（5 分钟）

**可以顺延（登记进欠账表）**

5. ② 内存实测（或只量流式版一个数字，对比留到 Day 13）
6. ④ 零提示题
7. ⑤ 阅读的第 3、4 条
8. `--verbose` / `--target` 的细节、`--help` 用法提示

**关键**：**先让"干跑能打印计划且绝不动文件"成立**，比"分类规则漂亮/参数齐全"重要得多 —— 这是项目 1 的安全底线。

---

## 五 今天不碰什么

- **真移动文件**（Day 14 才做 `--apply`）
- **HTTP 服务 / 接口**：今天只读文档，不写服务（Day 13 起）
- **TS 进阶** → 卡住就查 `notes/ts-cheatsheet.md`
- **探索 TODO 停车场** → 不许插队

---

## 六 明天的锚点

**Day 13（9/27 日）= 网络请求与并发**：`fetch`（undici）、超时、`AbortController`、重试策略（指数退避）、并发控制 →
**裸写 `p-limit`（并发池）** + 给 `fetch` 加超时 + 自动重试 + 日志封装。
项目 1 会在 Day 14 接上"真的移动文件（流式复制 + 校验）"。
