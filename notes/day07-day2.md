# Day 7 第 2 天任务书：工具箱第 5 个模块 + 零提示题 + Promise 前半

> **日期**：2026-09-20（周日）　｜　**Day 7 跨两天的第 2 天**
> **按 3～4 小时排** —— "选 A"的走法：每天只放 3～4 小时的量、把清单划干净，多出来的推给下一天。
> **昨天（9/19）已经把 Day 6 欠账清干净了**：`day06-prototype.js` 语法通过并跑出字段初始化 4 步、`day06-array-utils-verify.js` **17/17**、工具箱 4 个模块 + 14 条测试全绿。今天从"最后一哆嗦"（搬进工具箱）接着走。
> **今天不追求把 Day 7 做完**：Day 7 后半（微任务 vs 宏任务、`Promise.all` 家族、ESM vs CJS）排在下一天。
> **对照计划**：`js-node-30day-plan.md` §四 第 1 周 Day 7

---

## 〇 开工前 5 分钟：把产出物抄在纸上

| # | 产出物 | 验收标准 | 谁写 |
|---|---|---|---|
| 1 | `p0-toolkit/src/arrayUtils.js` | 从 `day06-array-utils.js` **原样搬**（三个函数体一个字不改），只去掉演示用的 `console.log` | **你** |
| 2 | `p0-toolkit/test/arrayUtils.test.js` | 内容在**附录 A**，AI 已写好（上面已跑过：8/8 通过） | AI |
| 3 | `week1-language/day07-zerohint-01.js` | **零提示题**第 1 道：`dropNulls`，标准见 ② | **你（关掉 AI）** |
| 4 | `week1-language/day07-recall-debounce.js` | 逆向练习：合上代码凭记忆写 `debounce`，跑 `day07-recall-verify.js` | **你（不看源码）** |
| 5 | `week1-language/day07-promise.js` | 四段对照 + 导出四样，跑 `day07-promise-verify.js` → **通过 13 项** | **你** |
| 6 | 日志（`notes/day07.md` 的 9/20 段）+ commit + push | —— | **你** |

**今天的日志写在 `notes/day07.md` 里的「9/20（Day 7 第 2 天）」那一段**（Day 7 跨两天，日志就分了两段，不另开文件）。

---

## 一 时间表（从你开工那一刻起算）

| 时间 | 干什么 | 产出 |
|---|---|---|
| **0:00–0:40** | ① 工具箱第 5 个模块：搬运 + 建测试 + 跑两次验证 | 产出物 1、2 |
| **0:40–1:00** | ② 零提示题第 1 道（限时 20 分钟，关 AI，只许查 MDN） | 产出物 3 |
| 1:00–1:10 | 休息，不碰屏幕 | —— |
| **1:10–1:15** | ③ 逆向练习：凭记忆重写 `debounce`（5 分钟，不许翻源码） | 产出物 4 |
| **1:15–1:30** | ④ CommonJS 自测 3 题（口答，答完自己回去核对） | —— |
| **1:30–3:00** | ⑤-1 读《回调》《Promise》《Promise 链》《async/await》 | 阅读 |
| **3:00–4:00** | ⑤-2 写 `day07-promise.js`（四段）→ 跑脚手架 | 产出物 5 |
| **4:00–4:20** | 日志（两段都要填）+ commit + push | 产出物 6 |

**关键检查点：开工满 3 小时时** —— 如果那时候《async/await》还没读完，**今天只写第 1、2 段**（三种写法对照 + `then` 链），第 3、4 段顺延。这就是"选 A"：清单划干净比多做一点值钱。

---

## 二 0:00–4:20 任务详情

### ① 工具箱第 5 个模块（40 分钟）

**为什么昨天没搬**：昨天的任务书里写过原因 —— **不能为"还不存在的模块"提前写测试文件**。`node --test` 找不到模块是直接报错，会让工具箱那 14 条本来全绿的测试**当场变红**。所以顺序是你先搬、我再给测试。现在测试已经在附录 A 里等着了（我已经在你的实现上跑过 8/8，还故意改坏两处确认它真会红 —— 不是空测试）。

**三步：**

**第 1 步：搬。** 新建 `p0-toolkit/src/arrayUtils.js`，把 `day06-array-utils.js` 里这三个函数**原样**贴过去（函数体一个字不改）：
`myMap` / `myFilter` / `myReduce`，文件最后一行保持 `module.exports = { myMap, myFilter, myReduce };`

⚠️ **演示用的 `console.log` 不要搬过去** —— 那些留在 `day06-array-utils.js` 里。
理由：`src/` 是**库代码**，别人 `require` 它的时候，它不该自己往屏幕上打印东西。这是库和脚本的分界线，不是洁癖。

**第 2 步：跑两次验证，别只跑一次。**

```powershell
node week1-language/day06-array-utils-verify.js   # ① 搬之前那份：目标 17/17
```
（只跑第二次的话，复制时手滑改坏的东西可能漏掉。）

**第 3 步：把附录 A 的测试建成 `p0-toolkit/test/arrayUtils.test.js`，然后：**

```powershell
cd week1-language/p0-toolkit
pnpm test          # ② 搬之后那份 + 新测试：目标全绿（14 + 8 = 22 条）
```

**顺手做（5 分钟）**：`p0-toolkit/README.md` 里加两处 ——
1. 「函数清单」表加一行：`myMap` / `myFilter` / `myReduce`
2. 「已知限制」补一条：**空数组 + 不传初始值时，我们的实现返回 `undefined`，内置 `reduce` 是抛 `TypeError`**
   （这是昨天脚手架的探针测出来的差别。面试问"你的 reduce 遇到空数组会怎样"要能答上来。）

---

### ② 零提示题第 1 道（20 分钟，关掉 AI）

> 这是**新加的每日环节**。原因写在 `notes/HANDOFF.md` 第七节：你问"我这种抄抄问问，真正有效果吗" —— 有效果（错误类型已经从"知识缺口"退到"手滑"了），但**缺一块：从来没有在完全没有提示的情况下，自己把一个问题拆成步骤**。而面试就是那个场景。
> 所以每天花 15–20 分钟补这一块。

**规则（就四条，别破例）：**

1. **只给题目 + 验收标准**。不给骨架、不给状态表、不给"先干嘛后干嘛"。
2. **关掉 AI 补全**，卡住**只许查 MDN 或 javascript.info**（数组/对象那几章），**不许问 AI**。
3. **限时 20 分钟**。到点没做出来就**停手**，把"我卡在哪一步"写进日志 —— **这一题的产出是"看清卡在哪"，不是"写出来"**。
4. **这道题不许问 AI 要答案**。如果你特别想接着想下去（超过 20 分钟也可以），那也只许问 **"我卡在哪一步"**，不许问"怎么写"。

**题目：`dropNulls(obj)`**

写一个函数 `dropNulls(obj)`：返回一个**新对象**，把原对象里**值为 `null`** 的键去掉，**其他值一律保留**。

**验收标准（这是你唯一的拐杖，照着它自己验）：**

| 输入 | 期望输出 |
|---|---|
| `{ a: 1, b: null, c: 0, d: '', e: false, f: undefined, g: 'x' }` | `{ a: 1, c: 0, d: '', e: false, f: undefined, g: 'x' }`（键的顺序保持原样） |
| `{}` | `{}` |
| `{ a: null, b: null }` | `{}` |
| 任意输入，调用之后 | 原对象**一个键都不能少**（`{ a: null }` 调完还是 `{ a: null }`） |
| 返回值 | 必须是**新对象**：`dropNulls(o) !== o` |

**写在哪：** `week1-language/day07-zerohint-01.js`
**接口：** 定义 `dropNulls`，文件最后 `module.exports = { dropNulls };`
**自测：** 文件里自己写至少 3 条 `console.log`，把上面表格里的情况跑一遍（能不能跑出来，是这一题"做完了"的标志）。

```powershell
node --check week1-language/day07-zerohint-01.js    # 老规矩：先过语法
node week1-language/day07-zerohint-01.js            # 再看输出
```

<details>
<summary>做完再点开：这道题为什么这么出</summary>

表里那几个 `0` / `''` / `false` / `undefined` 是故意放的陪练。

你 Day 4（`text = text || "empty"` 遇到 `f(0)` 出错）和 Day 7（`if(init)` 遇到 `init = 0` 走错分支）**两次**踩过同一个坑：**用真假值去判断"有没有传 / 是不是空"**。这道题的答案要求只有 `null` 被删 —— 如果 20 分钟里你又写出了 `if (obj[k])` 那种判断，那就是这个坑的第三次现身，正好抓个现行。

正确写法应该是 `if (value !== null) ...`（或者直接 `value === null` 就跳过）—— 判断"是不是 `null`"就老老实实跟 `null` 比。

</details>

---

### ③ 逆向练习（5 分钟，不许翻源码）

合上所有代码，**凭记忆**重写一个已经写好的函数。写不出来的地方，就是你真正不会的地方。

**这一周写什么：`debounce`**（Day 4 写的、工具箱里第一个模块）

- 写在 `week1-language/day07-recall-debounce.js`
- 接口：`debounce(fn, delay)`，文件最后 `module.exports = { debounce };`
- **中间不许打开** `p0-toolkit/src/debounce.js` 或 `day02-debounce.js`
- 写多少算多少，5 分钟到点就停

```powershell
node week1-language/day07-recall-verify.js
```

跑完**再**打开 `p0-toolkit/src/debounce.js` 对照差异 —— 这一步才是这 5 分钟的收获。
（没通过不算错，它只是把"你以为你会了"和"你真的会了"分开。）

**从今天起，逆向练习改成"轮转"**（写进计划 §七 心法第 9 条）：今天先写 `debounce`，明天起按
`node week1-language/recall-verify.js` 给出的轮转表换着来（`curry` → `deepClone` → `throttle` → `arrayUtils` → 循环），
判据直接用**工具箱自己那份测试**，不用另写脚手架。每周把新交付的东西加进轮转表。

---

### ④ CommonJS 自测 3 题（15 分钟）

计划里 Day 7 的 ① 是「CommonJS 基础」，**这一块你已经学完了**（证据在 `notes/day06.md`，你自己记了 `require` 的三个动作、`exports` 的坑、分享范围三层）。所以今天只花 15 分钟自测：**先自己口答（或写在日志里），答完再回去对 `notes/day06.md` 那一节**。

1. `require('./x.js')` 这一行执行时，Node 按顺序做了**哪三件事**？哪一件返回了你要的东西？
2. 模块里写 `exports = { a: 1 }`，外面 `require` 拿到的是空的；写 `module.exports = { a: 1 }` 就能拿到。**为什么？**（用"两个名字是不是指向同一个对象"来解释）
3. 两个文件各自 `require('./x.js')` 一次，`x.js` 里的 `console.log('我执行了')` 会打印**几次**？为什么？
   追问：如果换成**另一个进程**去 require 同一个 `x.js`，还能共享到同一个 `module.exports` 吗？这属于你记的"分享范围三层"里的哪一层？

**答出来就划掉，答不出来就回去补那一段**（不欠账，15 分钟能补完）。

---

### ⑤ Promise 前半（约 2 小时）

> 你 Day 5 探索 TODO 里那条 `async`，今天就是它的正式入口。

#### ⑤-1 阅读清单（今天只读这 4 节）

| 顺序 | 章节 | 要抓住的东西 | 时长 |
|---|---|---|---|
| 1 | [回调](https://zh.javascript.info/callbacks) | **为什么需要 Promise** —— 回调的痛点在哪（套娃、错误处理） | 20 min |
| 2 | [Promise](https://zh.javascript.info/promise-basics) | `new Promise`、`then` / `catch` / `finally`；顺手做官方任务「**基于 promise 的延时**」 | 40 min |
| 3 | [Promise 链](https://zh.javascript.info/promise-chaining) | 为什么 `.then` 要**返回** Promise、链怎么串起来 | 25 min |
| 4 | [async/await](https://zh.javascript.info/async-await) | 它就是 Promise 的**语法糖**、`try/catch` 怎么写 | 25 min |

**今天不读（顺延到明天）**：[微任务（Microtask）](https://zh.javascript.info/microtask-queue)（今天那个"同步代码和 `.then` 谁先跑"的谜底就在这一节）、[Promise API](https://zh.javascript.info/promise-api)、[使用 promise 进行错误处理](https://zh.javascript.info/promise-error-handling)。

#### ⑤-2 写 `week1-language/day07-promise.js`（四段）

用你 9/12 凭好奇写过的那个"炒饭"（`buyfood` / `eat`，现在还在 `day02-functions-practice.js` 里被注释着）—— 今天把它的三种写法**并排**写出来，让"演进"看得见。

**四段内容：**

| 段 | 写什么 |
|---|---|
| **第 1 段** | 同一个任务三遍：**回调版**（把函数当参数传进去，3 秒后调用它）→ **Promise 版**（`buyfood()` 返回 `new Promise`，用 `.then` 拿结果）→ **async 版**（`async function eat()` 里 `await buyfood()`）。三段要打印出**同样**的结果 |
| **第 2 段** | **`.then` 链**：点餐 → 等 3 秒拿到饭 → 吃饭，用 `.then` 一路串下去。重点体会**为什么能串** |
| **第 3 段** | 用 **`async/await` 改写同一条链**，对比"套娃"和"顺序写法"的观感差异 |
| **第 4 段** | **错误处理**：用你 9/12 那个 `login`（`resolve('登陆成功')` / `reject('登陆失败')`），两种接法对照 —— `.catch` 怎么接（Promise 版）、`try/catch` 怎么接（async 版） |

**接口约定（脚手架要读这几样，名字和签名必须对得上）：**

```js
orderByCallback(cb)   回调版：3 秒后调用 cb(null, '炒饭做好了')
                      （第一个参数留给错误 —— 这是 Node 的"错误优先回调"约定，没出错就传 null）
buyfood()             Promise 版：3 秒后 resolve('炒饭做好了')
eat()                 async 版：await buyfood()，函数返回值就是 '炒饭做好了'
login(ok)             ok 为 true → resolve('登陆成功')；否则 → reject（延迟多久随你，≥0.5 秒）
                      reject 里用 new Error('登陆失败') 或直接 '登陆失败' 都能被脚手架读到

module.exports = { orderByCallback, buyfood, eat, login };
```

**跑起来才算数**（心法第 7 条）：

```powershell
node week1-language/day07-promise.js            # 自己看三段对照的输出
node week1-language/day07-promise-verify.js     # 目标：通过 13 项（要等二十几秒，不是卡住）
```

脚手架最后有三个**观察项**（不判对错，只把真相打印给你看）：同步代码和 `.then` 谁先跑、链里"回调不 return"会怎样、你的 `buyfood` 实际等了多久。**跑完顺手把观察项里某个数字改一改再跑一次**，看结论会不会变 —— 这是验证"我真的看懂了"的最快办法。

**两个顺手做的小实验（加起来 5 分钟，别跳过）：**

1. **`try` 里忘了 `await`**：写一段
   ```js
   try { login(false); console.log('这句会跑'); }   // 故意不写 await
   catch (e) { console.log('接住了：', e); }        // 这一句永远不打印
   ```
   看到的现象是：`catch` **沉默**，同时 Node 会甩出一大段 `UnhandledPromiseRejection` 报错 —— **那是预期结果，不是你把文件写坏了**。结论：**忘了 `await`，错误就静默溜走**，最后以"没人接住的拒绝"形式炸掉进程。这条今天先记住，第 2 周的错误处理会正式讲。
2. **`await` 真的在等**：在 `eat()` 调用之后紧跟一行同步 `console.log`，看它和 `await` 之后的那行谁先出来。

---

## 三 今天的完成标准

- [ ] `p0-toolkit/src/arrayUtils.js` 到位（**原样搬**、无演示 `console.log`）
- [ ] `day06-array-utils-verify.js` **17/17**（搬之前那份）
- [ ] `p0-toolkit/test/arrayUtils.test.js` 到位，`pnpm test` **全绿**（22 条）
- [ ] `p0-toolkit/README.md` 补上 `arrayUtils` 一行 + 空数组那条限制
- [ ] 零提示题：`day07-zerohint-01.js` 写完**或**把卡点写进日志（两个都算完成，没有卡点才是没做）
- [ ] 逆向练习：`day07-recall-debounce.js` + 跑过一次 `day07-recall-verify.js`
- [ ] CommonJS 3 题答完（答不出的回去补了）
- [ ] `day07-promise.js`：`day07-promise-verify.js` **通过 13 项**
- [ ] 今天**至少一次** commit + push
- [ ] 日志 `notes/day07.md` 的 9/20 段：三节（学会了什么 / 卡在哪里 / 欠账登记）

---

## 四 如果时间不够：砍单顺序

**保底（这两条必须留）**

1. **工具箱第 5 个模块**（昨天的欠账，今天不清就又要顺延）；`pnpm test` 全绿
2. 日志 + commit + push

**可以顺延（登记进 `notes/day07.md` 的欠账表）**

3. `day07-promise.js` 的第 3、4 段（`async/await` 改写、错误处理）
4. CommonJS 的 15 分钟自测
5. 逆向练习（5 分钟，但它是"实感"的来源，**尽量别砍**）

**尽量别砍**：零提示题。它每天只花 20 分钟，补的是你问过的那件事（"我这种抄抄问问真正有效果吗"）里唯一缺的一块。

---

## 五 今天不碰什么

- **微任务 / 宏任务** —— 明天（今天观察 1 的谜底就留到那时）
- **`Promise.all` 家族** —— 明天
- **ESM / `type: module` / `exports` 字段** —— 明天
- **TypeScript / Vitest** —— Day 8
- **手写 `Promise`（A+ 规范那种）** —— 第 3 周之后再说

---

## 六 明天的锚点

今天做完 = Day 6 欠账的最后一哆嗦（工具箱第 5 个模块）+ Day 7 的「CommonJS 自测 + Promise 前半」。下一天接：

- **Day 7 后半**：微任务 vs 宏任务（把今天"观察 1"的谜底解开）、`Promise.all` 家族、ESM vs CJS 对比
- 然后才是 Day 8 原本的内容：**TypeScript 入门 + 周复盘 + 周自测**

⚠️ **周复盘是测速点** —— 会重新算一次账（累计欠账每满 1 天就按规则顺延结束日，见计划 §四）。所以今天"把清单划干净"比"多做一点"更有价值。

---

## 附录 A：`p0-toolkit/test/arrayUtils.test.js`（AI 写好了，搬完 `src` 再创建这个文件）

> 我已经在两处验证过：① 在你的实现上跑 → **8/8 通过**；② 故意把 `myFilter` 改成"push 回调的返回值"、把 `myMap` 的 `i < arr.length` 改成 `i <= arr.length` → **8/8 全红**。意思是这一组测试既不会冤枉你的实现，也不是空测试。

```js
// ============================================================
// 测试 arrayUtils（myMap / myFilter / myReduce）
//
// 【这组测试是 AI 写的】—— 计划 §一 允许："允许：让它写测试"。
// 内容就是从 day06-array-utils-verify.js 的 17 项搬过来的，换成 node:test 的写法。
//
// 【三条最值钱的断言】
//   assert.notEqual(out, src)      → 返回的是新数组，不是原数组
//   assert.deepEqual(src, [...])   → 改副本不碰原数组（这一条最常被写错）
//   myReduce([5], fn) 里 fn 一次都不该被调用 → "不传初始值时起点是第一个元素"的证据
//
// 【一个规范差异（探针的结论，不是 bug）】
//   内置 [].reduce(f) 遇到"空数组 + 没初始值"会抛 TypeError；我们的实现返回 undefined。
//   README 的「已知限制」可以把这一条补上 —— 面试被问到要能说出差别。
// ============================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const { myMap, myFilter, myReduce } = require('../src/arrayUtils.js');

test('myMap：每个元素过一遍回调，返回新数组，原数组不动', () => {
  const src = [1, 2, 3];
  const out = myMap(src, (x) => x * 2);
  assert.deepEqual(out, [2, 4, 6]);
  assert.notEqual(out, src, '返回的应该是新数组，不是原数组本身');
  assert.deepEqual(src, [1, 2, 3], '原数组被改了');
});

test('myMap：回调收到 (元素, 下标, 原数组)', () => {
  assert.deepEqual(myMap([10, 20], (el, i) => el + i), [10, 21]);

  let third = null;
  myMap([7], (el, i, arr) => { third = arr; return el; });
  assert.deepEqual(third, [7], '回调的第三个参数应该是原数组');
});

test('myFilter：留下回调返回"真"的元素，返回新数组', () => {
  const src = [1, 2, 3, 4];
  const out = myFilter(src, (x) => x % 2 === 0);
  assert.deepEqual(out, [2, 4]);
  assert.notEqual(out, src, '返回的应该是新数组');
  assert.deepEqual(src, [1, 2, 3, 4], '原数组被改了');
});

test('myFilter：筛选规则完全由回调决定，不能自己预设元素类型', () => {
  // 这一条防的是"在实现里自作主张加 typeof x === 'number'"那种写法
  const users = [{ n: 'a', age: 20 }, { n: 'b', age: 15 }];
  const adults = myFilter(users, (u) => u.age >= 18);
  assert.equal(adults.length, 1);
  assert.equal(adults[0].n, 'a');
  // 回调返回的不是"新元素"而是"要不要"：结果数组里放的必须是原元素本身
  assert.equal(adults[0], users[0], 'filter 的结果里应该还是原来那些元素');
});

test('myReduce：传了初始值', () => {
  assert.equal(myReduce([1, 2, 3], (s, x) => s + x, 10), 16);
  assert.equal(myReduce([], (s, x) => s + x, 0), 0);
  const users = [{ age: 20 }, { age: 15 }];
  assert.equal(myReduce(users, (s, u) => s + u.age, 0), 35);
});

test('myReduce：不传初始值时，起点是第一个元素（回调少跑一次）', () => {
  assert.equal(myReduce([1, 2, 3], (s, x) => s + x), 6);
  assert.equal(myReduce(['a', 'b'], (s, x) => s + x), 'ab');

  let calls = 0;
  const only = myReduce([5], () => { calls++; return 0; });
  assert.equal(only, 5, '只有一个元素时应该直接返回它');
  assert.equal(calls, 0, '只有一个元素时回调一次都不该被调用');
});

test('myReduce：回调收到 (累计值, 元素, 下标, 原数组)', () => {
  const seen = [];
  const src = [10, 20];
  const total = myReduce(src, (acc, el, i, arr) => {
    seen.push({ acc, el, i, arr });
    return acc + el;
  }, 0);
  assert.equal(total, 30);
  assert.equal(seen.length, 2);
  assert.deepEqual(seen.map((x) => x.i), [0, 1], '下标没传对');
  assert.equal(seen[1].acc, 10, '第二次收到的累计值应该是第一次的结果');
  assert.deepEqual(seen[0].arr, src, '第四个参数应该是原数组');
});

test('三个方法都不改原数组（对象数组也一样）', () => {
  const make = () => [{ n: 'a', age: 20 }, { n: 'b', age: 15 }];
  const forMap = make();
  myMap(forMap, (u) => u.n);
  assert.deepEqual(forMap, [{ n: 'a', age: 20 }, { n: 'b', age: 15 }]);

  const forFilter = make();
  myFilter(forFilter, (u) => u.age >= 18);
  assert.deepEqual(forFilter, [{ n: 'a', age: 20 }, { n: 'b', age: 15 }]);

  const forReduce = make();
  myReduce(forReduce, (s, u) => s + u.age, 0);
  assert.deepEqual(forReduce, [{ n: 'a', age: 20 }, { n: 'b', age: 15 }]);
});
```

---

## 收尾命令备忘

```powershell
# 今天的五条核心命令
node week1-language/day06-array-utils-verify.js     # 目标 17/17（搬之前那份）
node week1-language/day07-zerohint-01.js            # 零提示题自测输出
node week1-language/day07-recall-verify.js          # 逆向练习
node week1-language/day07-promise-verify.js         # 目标 13 项（等二十几秒）

cd week1-language/p0-toolkit
pnpm test                                          # 目标全绿（22 条）

# 收尾
cd ../..
git add -A
git commit -m "day07: move arrayUtils into p0-toolkit, first promise comparison"
git push
git status -sb   # 没有 ahead 就同步好了
```
