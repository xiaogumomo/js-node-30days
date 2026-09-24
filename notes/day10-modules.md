# Day 10 任务书：内置模块 → "统计目录大小并生成报告"的脚本

> **日期**：2026-09-24（周四）　｜　**第 2 周 Day 2**
> **按 3～4 小时排**（"选 A"：只放 3～4 小时的量、把清单划干净，多的推给下一天）
> **今天接昨天的哪条**：Day 9 的结论"**同步代码不跑完，事件循环一步都动不了**" —— 今天**用它来理解"同步 vs 异步读目录"**。
> **对照计划**：`js-node-30day-plan.md` §四 第 2 周 Day 10

---

## 〇 开工前 5 分钟：把产出物抄在纸上

| # | 产出物 | 验收标准 | 谁写 |
|---|---|---|---|
| 1 | 轮转复习（5 分钟） | `node week1-language/recall-verify.js` 轮到的模块跑到绿 | **你（凭记忆）** |
| 2 | `week2-runtime/day10-zerohint-04.js` | 零提示题第 4 道 `groupBy`（标准见 ②） | **你（零提示）** |
| 3 | `week2-runtime/day10-readdir.js` | 同步 vs 异步读目录的实测对比（预测/实测） | **你** |
| 4 | `week2-runtime/day10-dir-size.js` | **今天的主线**：导出 `dirSize(dir)` + 命令行入口 | **你** |
| 5 | `week2-runtime/day10-dir-size-verify.js` | 它的判据（造临时目录树 + 断言数字） | **AI 写**（等你的 `dirSize` 到位） |
| 6 | 日志 + commit + push | —— | **你** |

---

## 一 时间表（从开工起算，共约 3 小时 40 分）

| 时段 | 干什么 | 产出 |
|---|---|---|
| **0:00–0:05** | **① 轮转复习**（凭记忆重写 + 跑判据） | 1 |
| **0:05–0:30** | **② 零提示题第 4 道 `groupBy`** | 2 |
| **0:30–1:10** | **③ 阅读**：`fs/promises` / `path` / `os` / `Buffer` / `process.argv` / `util.parseArgs` | —— |
| **1:10–1:25** | **④ 小实验**：同步 vs 异步读目录（接 Day 9） | 3 |
| 1:25–1:35 | 休息 | —— |
| **1:35–3:05** | **⑤ 主线**：写 `day10-dir-size.js`（先跑通最小版，再加选项） | 4 |
| **3:05–3:25** | **⑥ 判据**：跟 AI 要 `day10-dir-size-verify.js` 跑验收 | 5 |
| **3:25–3:40** | **⑦ 日志 + commit + push** | 6 |

**关键检查点：1:35（休息结束时）。** 如果 ①②③④ 还没做完 → **先把它们做完再进 ⑤**（欠账会滚雪球），今天只做主线的最小版（不带 `--top` / `--json`）。

---

## 二 任务详情

### ① 轮转复习（5 分钟）

```powershell
node week1-language/recall-verify.js                 # 看今天轮到哪几个
node week1-language/recall-verify.js <模块名>          # 逐个跑
```

（工具已适配 `.ts`；四个函数写在一个文件里也没关系 —— 传第二个参数指定稿子路径即可。）

**规则**：合上源码凭记忆写；写成什么样都写下来；红了再看源码、**合上再写一遍**。

---

### ② 零提示题第 4 道（25 分钟，关掉 AI）

**题目：`groupBy(arr, keyFn)`** —— 把数组按 `keyFn` 的返回值分组，返回一个对象。

| 输入 | 期望输出 |
|---|---|
| `groupBy([{t:'a',v:1},{t:'b',v:2},{t:'a',v:3}], x => x.t)` | `{ a: [{t:'a',v:1},{t:'a',v:3}], b: [{t:'b',v:2}] }` |
| `groupBy([], x => x)` | `{}` |
| 只有一个元素 | `{ '键': [那个元素] }` |
| 原数组 | **不能改** |
| 返回值 | 必须是**新对象** |

**写在哪**：`week2-runtime/day10-zerohint-04.js`；接口 `module.exports = { groupBy };`
**判据自己写**：`week2-runtime/day10-zerohint-04-verify.js`（`node:test` + **`assert.deepEqual`**），**并且先故意把实现改坏一个字符**，确认判据红，再改回来。

> 💡 **一分钟后才看的提示**：这题的累加器有两层起点 —— 外层是对象（`{}`）、**每个键的值是数组**（第一次出现的键要先建一个 `[]`）。
> 这正是你前两天踩过的"**累加器起点/类型**"那一族（`let result = 0` 那次）—— 先自己写，写不出来再看这句。

---

### ③ 阅读（40 分钟）

| 顺序 | 读什么 | 抓住什么 |
|---|---|---|
| 1 | [Node 文档：《File system》](https://nodejs.org/api/fs.html) 的 **Promise API** 那一段（`fs/promises`） | `readFile` / `readdir` / `stat` 都有 `fs.promises` 版本；**为什么现在都用 promise 版** |
| 2 | [《Path》](https://nodejs.org/api/path.html) | `path.join` / `path.resolve` / `path.basename` / `path.extname`；**为什么不能自己用 `+ '/' +` 拼路径** |
| 3 | [《OS》](https://nodejs.org/api/os.html) | `os.homedir()` / `os.tmpdir()` / `os.platform()`（写跨平台脚本会用到） |
| 4 | [《Buffer》](https://nodejs.org/api/buffer.html) 开头 + `Buffer.byteLength` | **字节数 ≠ 字符数**（中文一个字符 3 字节）—— 统计文件大小要用字节 |
| 5 | [《Process》](https://nodejs.org/api/process.html) 的 `process.argv` / `process.env` | 命令行参数从哪来 |
| 6 | [《Util》的 `parseArgs`](https://nodejs.org/api/util.html#utilparseargsconfig) | **Node 内置的参数解析**（不用装 `commander`/`yargs`） |

**产出**：日志里 3 行笔记 —— ① `fs/promises` 和回调版的关系 ② 为什么用 `path.join` ③ `--top=3` 这种选项用 `parseArgs` 怎么配 `options`。

---

### ④ 小实验：同步 vs 异步读目录（15 分钟）—— **接 Day 9**

```js
// week2-runtime/day10-readdir.js
const fs = require('node:fs');
const t0 = Date.now();
setTimeout(() => console.log('定时器等了', Date.now() - t0, 'ms'), 0);

// A：同步读目录（卡住事件循环）
fs.readdirSync(__dirname);
// B：异步读目录（交还控制权）
fs.readdir(__dirname, () => console.log('异步读完了', Date.now() - t0, 'ms'));
```

**要回答的**（写进日志）：
1. **先预测**：A 和 B 两种情况下，那个 `setTimeout(0)` 各会等多久？为什么？
2. 用 Day 9 的结论解释：**同步读目录时，事件循环在干嘛？**
3. 如果一个 Node 服务（比如你第 3 周的 API）在请求处理里用了 `readdirSync`，会发生什么？

---

### ⑤ 主线：`week2-runtime/day10-dir-size.js`（90 分钟）

**目标**：统计一个目录的总大小，并生成一份报告。

**接口（判据要用，名字必须对齐）**：

```js
// 导出一个函数，供判据直接调用
async function dirSize(dir) { ... }
module.exports = { dirSize };

// 同时作为命令行脚本能直接跑：
//   node week2-runtime/day10-dir-size.js <目录>
```

**`dirSize(dir)` 要返回**（形状固定，判据按这个断言）：

```js
{
  totalBytes: 12345,          // 该目录下所有文件的字节数之和（含子目录，递归）
  fileCount: 7,               // 文件个数（不算目录）
  largest: [                  // 最大的几个文件，按字节从大到小
    { path: 'sub/big.txt', bytes: 9999 },
    ...
  ]
}
```

**要求**：
1. **递归**遍历子目录（用 `fs.promises.readdir(dir, { withFileTypes: true })` 或 `stat` 判断文件/目录）
2. **用 `path.join` 拼路径**（不要手写 `'/'`）
3. **大小用字节**（`stat.size` 就是字节数；别用字符串长度）
4. `largest` 默认取**前 5 个**（命令行可用 `--top=3` 改）
5. **命令行入口**：`process.argv[2]` 是目录；还能 `--json` 输出 JSON
6. **目录不存在**要**友好报错**（打出人能看懂的一句话，而不是崩一堆栈）—— 用 `try/catch` 包住

**跑起来才算数**：
```powershell
node week2-runtime/day10-dir-size.js .                          # 当前目录
node week2-runtime/day10-dir-size.js .. --top=3                 # 上一层，只列 3 个
node week2-runtime/day10-dir-size.js 不存在的目录                 # 期望：友好报错
```

**做法建议（先跑通最小版）**：先让"只统计当前目录（不递归）"跑出数字 → 再加递归 → 再加 `--top` → 最后加 `--json`。**每加一步跑一次。**

---

### ⑥ 判据（20 分钟）

跟 AI 说"`dirSize` 到位了"→ 它会写 `week2-runtime/day10-dir-size-verify.js`：**自己造一棵已知大小的临时目录树**（比如 10/20/30 字节三个文件），断言 `totalBytes` / `fileCount` / `largest` 对得上，再加几个探针（空目录、不存在的目录）。

**先自己写两个用例也不是不行**（今天零提示题刚练过判据）—— 那就自己先写，再让 AI 补。

---

### ⑦ 日志 + commit（15 分钟）

```powershell
git add -A
git commit -m "day10: fs/promises builtins + dir size report (recursive, --top/--json)"
git push
git status -sb
```

---

## 三 今天的完成标准

- [ ] 轮转复习跑过（绿了打勾，红了写清红在哪）
- [ ] `day10-zerohint-04.js` + **自写判据**（含"先让它红一次"）
- [ ] 日志里 3 行阅读笔记 + 小实验的 3 个回答
- [ ] `day10-dir-size.js`：`dirSize(dir)` 形状对（`totalBytes` / `fileCount` / `largest`）+ 命令行能跑 + 目录不存在时友好报错
- [ ] 判据（AI 写的或自己写的）跑绿
- [ ] 日志 + commit + push

---

## 四 如果时间不够：砍单顺序

**保底**

1. **⑤ 主线的最小版**（不递归、只统计当前目录 → 有数字出来）
2. **⑦ 日志 + commit**
3. ① 轮转复习（5 分钟，别砍）

**可以顺延（登记进欠账表）**

4. `--json` / `--top` 选项
5. ⑥ 判据（先让主线跑出数字更重要）
6. ③ 阅读的 4–6 条（`Buffer` / `process.env` / `parseArgs`）
7. ② 零提示题

**关键**：**先有数字，再谈选项** —— "能跑出总大小"比"参数齐全"重要得多。

---

## 五 今天不碰什么

- **Streams / 背压**（Day 11）
- **HTTP / 项目 1**（Day 12 起）
- **TS 进阶**（泛型等）→ 卡住就查 `notes/ts-cheatsheet.md`
- **探索 TODO 停车场** → 不许插队

---

## 六 明天的锚点

**Day 11（9/25）= Streams 与背压**：四种流、`pipe` vs `pipeline`、为什么大文件要用流 → 产出"大文件逐行 JSON 解析器"，并用 `process.memoryUsage()` **实测**内存占用对比（今天这份"统计目录大小"里如果读了整个文件，明天正好对比"流式读"的差别）。
