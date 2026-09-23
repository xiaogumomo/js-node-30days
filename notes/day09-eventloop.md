# Day 9 任务书：先补 3 项欠账 + Node 架构与事件循环

> **日期**：2026-09-23（周三）
> **按 3～4 小时排**（"选 A"：只放 3～4 小时的量、把清单划干净，多的推给下一天）
> **今天分两段**：**先补欠账（约 1 小时）**，再进 Day 9 的正式内容（约 2.5 小时）
> **对照计划**：`js-node-30day-plan.md` §四 第 2 周 Day 9

---

## 〇 开工前 5 分钟：把产出物抄在纸上

| # | 产出物 | 验收标准 | 谁写 |
|---|---|---|---|
| 1 | 三个 recall 重写稿（`recall-curry.js` / `recall-deepClone.js` / `recall-throttle.js`） | `recall-verify.js` 逐个跑到绿 | **你（凭记忆）** |
| 2 | `week1-language/day09-zerohint-03.js` | 零提示题第 3 道 `flatOnce`（标准见 ②） | **你（零提示）** |
| 3 | 读懂 `notes/ts-cheatsheet.md` | 能在里面找到"我上次卡住的那几个类型" | 你（15 分钟翻一遍） |
| 4 | `week1-language/day09-event-loop.js` | 4 个实验：**先写预测 → 再跑 → 把实测写在旁边** | **你** |
| 5 | 日志里"事件循环六阶段"的笔记 | 六阶段的名字 + 每个阶段干嘛（一句话） | **你** |
| 6 | 日志 + commit + push | —— | **你** |

---

## 一 时间表（从开工起算，共约 3 小时 40 分）

| 时段 | 干什么 | 产出 |
|---|---|---|
| **0:00–0:20** | **① 三个 recall 重写**（凭记忆，写完再跑判据） | 1 |
| **0:20–0:45** | **② 零提示题第 3 道 `flatOnce`** | 2 |
| **0:45–1:05** | **③ 翻一遍 `notes/ts-cheatsheet.md`**（15–20 分钟，对照你卡过的类型） | 3 |
| 1:05–1:15 | 休息 | —— |
| **1:15–1:35** | **④ 回到 9/21 的现场**：把你那天"不知道的三条"补掉 | —— |
| **1:35–2:45** | **⑤ 事件循环：4 个实验**（先预测、再跑） | 4 |
| **2:45–3:20** | **⑥ 六个阶段的笔记 + 读《Node.js 事件循环》** | 5 |
| **3:20–3:40** | **⑦ 日志 + commit + push** | 6 |

**关键检查点：1:15（欠账段结束时）。** 如果那时 ①②③ 还没做完 → **把它们做完再进 ⑤**（欠账不清就会滚雪球），今天只做事件循环的前两个实验、剩下的登记顺延。

---

## 二 任务详情

### ① 三个 recall 重写（20 分钟，凭记忆）

**规则**：合上源码，凭记忆写；写完再跑判据；**先别打开 `p0-toolkit/src/`**。

```powershell
node week1-language/recall-verify.js curry
node week1-language/recall-verify.js deepClone
node week1-language/recall-verify.js throttle
```

（工具昨天已适配 `.ts`，可以放心用。`debounce` 昨天做过了：1/3 → 修 typo → 3/4。）

**⚠️ 昨天 `debounce` 的教训要带上**：**"能过判据"≠"和工具箱一致"**。昨天它的 `immediate` 记混了语义（写成"每次都立刻执行"，而设计是 leading + trailing），**旧判据没覆盖到**，是新补的一条测试才抓到。
→ 所以今天写完时，**多问自己一句**："我这段是不是只是"能跑"，而语义和工具箱那份不一样？"

**顺手**（可选但推荐）：`debounce` 那份的 `immediate` 段按 **leading + trailing** 再写一遍（"第二遍才算过"）。

---

### ② 零提示题第 3 道（25 分钟，关掉 AI）

**题目：`flatOnce(arr)`** —— 把嵌套数组**只拍平一层**，返回一个新数组。

**需求（手写，不许用内置 `Array.prototype.flat`）**

| 输入 | 期望输出 |
|---|---|
| `[1, [2, 3], 4]` | `[1, 2, 3, 4]` |
| `[1, [2, [3]]]` | `[1, 2, [3]]` ← **只拍一层**，里面那层要留着 |
| `[1, 2]` | `[1, 2]` |
| `[]` | `[]` |
| 原数组 | **不能改**（`[1,[2]]` 调完还是 `[1,[2]]`） |
| 返回值 | 必须是**新数组** |

**写在哪**：`week1-language/day09-zerohint-03.js`；接口 `module.exports = { flatOnce };`

**判据自己写**（延续前天的练法）：`week1-language/day09-zerohint-03-verify.js` —— 用 `node:test`，把上面 5 种情况各写一条，**并且先故意让它红一次**（比如把实现改坏一个字符），确认它抓得住，再信它的绿。

**规则照旧**：限时 25 分钟；卡住只许查 MDN / 书；到点没做完就停手，把"卡在哪一步"写进日志。

---

### ③ 翻一遍 TS 类型速查表（15–20 分钟）

`notes/ts-cheatsheet.md` —— 昨天你说"TS 类型表示法不知道，用不了 any 就卡住"，那张表就是把这两天遇到过的写法集中列了一遍。

**做法**：对照表，**把你昨天卡住的那几个圈出来**（`Record<string,any>` / `ReturnType<typeof setTimeout>` / `(...args:any[])=>any` / `{age:number}` / `T|null`），在旁边用你自己的话写一句"什么时候用它" —— 写不出来就说明还没落地。

---

### ④ 回到 9/21 的现场（20 分钟）—— 你那天明确说的三条"不知道"

那天的预测题你**顺序全对**，但自己标注了三条"不知道"，而且**顺序是问 AI 得到的**。今天正式补掉：

1. **`process.nextTick` 是什么？**
   Node 特有；把回调放进一条**独立队列**，在"当前同步代码跑完、事件循环继续之前"清掉。
   顺序记这一行：**同步代码 → nextTick 队列 → promise 微任务队列 → 下一轮事件循环**。
   ⚠️ 面试坑：**递归 `process.nextTick` 会饿死事件循环**（永远清不完，进不了 timers）。
2. **`setTimeout` 属于哪个队列？**
   它的回调在 **timers 阶段**。**别记"它最慢"**（宏任务之间没有统一快慢），记两条：① **微任务永远先于宏任务**；② **`setTimeout(fn,0)` 不是"立刻"**，是"至少 0ms 后进 timers 阶段、插不进当前这轮"。
3. **"事件函数"是什么？**
   你想说的应该是"**事件循环的阶段（phase）**以及每个阶段排队的回调"。见 ⑥。

**做完这件事的自检**：合上材料，用自己的话把这三条各讲一句 —— 讲不顺的再回去看。

---

### ⑤ 事件循环：4 个实验（70 分钟）—— **每个都先写预测**

新建 `week1-language/day09-event-loop.js`。**每个实验都这样做**：先在注释里写下你**预测的输出顺序** → 再跑 → 把**实测**写在预测旁边（不一致的地方标出来）。

**实验 1：`setImmediate` vs `setTimeout(fn, 0)`，在主模块里**
```js
setTimeout(() => console.log('A setTimeout 0'), 0);
setImmediate(() => console.log('B setImmediate'));
```
预测：____ → 实测：____
（**跑 3 次**看会不会变 —— 这两个在主模块里的先后**理论上不保证**，和进程启动耗时有关系。想清楚：为什么不保证？）

**实验 2：把它们放进一个 I/O 回调里（这才是重点）**
```js
const fs = require('node:fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('A setTimeout 0'), 0);
  setImmediate(() => console.log('B setImmediate'));
});
```
预测：____ → 实测：____（跑 3 次）
（这里和实验 1 不一样了 —— 跑完请用**你自己的话**解释"为什么这次是确定的"。）

**实验 3：微任务 vs 宏任务（复习 9/21 那题，这次自己推）**
```js
console.log('1 同步');
setTimeout(() => console.log('2 setTimeout'), 0);
Promise.resolve().then(() => console.log('3 then'));
process.nextTick(() => console.log('4 nextTick'));
console.log('5 同步结束');
```
预测：____ → 实测：____（**这次不许问 AI**）

**实验 4：同步代码会不会阻塞事件循环（用数字说话）**
```js
const t0 = Date.now();
setTimeout(() => console.log('A 定时器实际等了', Date.now() - t0, 'ms'), 0);
while (Date.now() - t0 < 300) { /* 空转 300ms，模拟同步的重活 */ }
```
预测：那个 `setTimeout(0)` 会等到什么时候才打印？____ → 实测：____
再做一个**异步对照**：把忙等换成"异步等 300ms"，看定时器还会不会被推迟。
（把忙等换成 `fs.readFileSync` 读一个**大文件**效果一样，只是没这么夸张 —— 见文末附录。）

> **附录：AI 实测的参照数字（做完实验再看，别有心理暗示）**
>
> | 实验 | 实测（Node v24.21.0，本机） |
> |---|---|
> | 1. 主模块：`setTimeout(0)` vs `setImmediate` | 跑 3 次都是 **B（setImmediate）先** |
> | 2. I/O 回调里 | 跑 3 次都是 **B（setImmediate）先** —— 这个和 1 不一样的地方才是重点 |
> | 3. 同步 / `nextTick` / `then` / `setTimeout` | `1 → 5 → 4 → 3 → 2` |
> | 4a. 忙等 300ms | 定时器等到 **302ms** 才打印 |
> | 4b. 同步读 50MB 文件 | 定时器等 **21ms**（异步读同一个文件只等 **1ms**） |

---

### ⑥ 六个阶段的笔记（35 分钟）

读：Node 官方文档 [《The Node.js Event Loop》](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)（或中文站同名页面）。

**产出**：在日志里写一张小表 —— **六个阶段 + 每个阶段"干什么"一句话**：

```
timers → pending callbacks → idle/prepare → poll → check(setImmediate) → close callbacks
```

要能回答的两个问题（写在表下面）：
1. **poll 阶段**为什么会"卡住等 I/O"？
2. **微任务队列**是在"阶段的哪个位置"被清空的？（提示：**每执行完一个宏任务就清一次**）

---

### ⑦ 日志 + commit（20 分钟）

日志写在 `notes/day09.md`（今天的日志文件，模板已建好）。

```powershell
git add -A
git commit -m "day09: node event loop experiments + ts cheatsheet + zerohint flatOnce"
git push
git status -sb
```

---

## 三 今天的完成标准

- [ ] 三个 `recall-*.js` 跑判据（绿了就打勾；**红了也写清红在哪**）
- [ ] `day09-zerohint-03.js` + **自写判据**（含"先让它红一次"）
- [ ] `notes/ts-cheatsheet.md` 上圈出你卡过的类型 + 自己写一句"什么时候用"
- [ ] 9/21 那三条"不知道"，能用**自己的话**各讲一句
- [ ] `day09-event-loop.js`：4 个实验，**每个都有"预测 vs 实测"**
- [ ] 日志里六个阶段的表 + 两个问题的答案
- [ ] 日志 + commit + push

---

## 四 如果时间不够：砍单顺序

**保底**

1. **① 三个 recall**（20 分钟，是"取出来"的训练，别砍）
2. **④ 9/21 那三条"不知道"**（20 分钟，那三条是硬缺口）
3. 日志 + commit

**可以顺延（登记进欠账表）**

4. ⑥ 六阶段笔记的"读官方文档"部分（表可以先凭实验印象写）
5. ⑤ 的实验 4（同步 I/O 阻塞）
6. ② 零提示题
7. ③ TS 类型表

**注意**：⑤ 的**实验 2**（I/O 回调里 `setImmediate` 先于 `setTimeout`）**尽量别砍** —— 它是理解"阶段"的唯一实证，也是最常被面试问到的那个。

---

## 五 今天不碰什么

- **本周的 TypeScript 进阶**（泛型 / interface / 类型体操）→ 用到再查 `ts-cheatsheet.md`
- **Streams / HTTP**（Day 11–12）
- **LeetCode**（第 2 周挑一天启动）
- **探索 TODO 停车场**（`Map` / `process`）→ 不许插队

---

## 六 明天的锚点

**Day 10（9/24）= 内置模块**：`fs/promises`、`path`、`os`、`url`、`Buffer`、`process.argv/env` vs `util.parseArgs` → 产出"统计目录大小并生成报告"的脚本。
（今天的事件循环知识，明天会用在"同步 vs 异步读目录"的对比上。）
