# Day 5 任务书：剩下两个函数 + `p0-toolkit` 立项

> **日期**：2026-09-15（周二）　**主题**：`throttle` + `curry` + `p0-toolkit` 立项
> **对照计划**：`js-node-30day-plan.md` §四 第 1 周 Day 5
> **今天的定位**：**不是学新知识，是把一个模式用三次。** `debounce` 昨天已经拿下了，`throttle` 和 `curry` 是**同一个模式**（接收一个函数、返回一个新函数）的另外两次应用。今天最后一段是第 1 周的产出物开始成型。

---

## 〇 开工前 10 分钟：把产出物抄在纸上

| # | 产出物 | 验收标准（跑出来才算数） |
|---|---|---|
| 1 | `week1-language/day02-throttle.js` | `node week1-language/day05-throttle-verify.js` → **通过 5 项，失败 0 项** |
| 2 | `week1-language/day02-curry.js` | `node week1-language/day05-curry-verify.js` → **通过 12 项，失败 0 项** |
| 3 | `week1-language/p0-toolkit/` 目录 | 结构见第六节：`package.json` + `README.md` + `src/` 四个函数 + `test/` 测试 |
| 4 | 工具库跑得起来 | 在 `p0-toolkit/` 下敲 `pnpm test` → 全绿、退出码 0 |
| 5 | `day02-debounce.js` 头部那句 `immediate` 语义 | 一句话写完（`TODO` 消掉） |
| 6 | 日志 + commit + push | 三行日志，至少 1 次 commit |

**第 1、2、3、4、6 是今天的必交。第 5 项只要 5 分钟，顺手做掉。**

---

## 一 时间表（从 09:40 起排）

| 时间 | 干什么 | 产出 |
|---|---|---|
| 09:40–10:00 | 抄清单 + 还两个小尾巴（`immediate` 语义、闭包收尾 15 分钟） | 产出物 5 |
| **10:00–11:00** | **裸写 `throttle`**（番茄钟 50）+ 跑脚手架 | 产出物 1 |
| 11:00–11:15 | 休息 | —— |
| **11:15–12:15** | **裸写 `curry`**（50）+ 跑脚手架 | 产出物 2 |
| 12:15–13:30 | 午休，不碰屏幕 | —— |
| **13:30–14:40** | **`p0-toolkit` 立项 第 1 段**：目录 + `package.json` + 搬函数 + README | 产出物 3 |
| 14:40–14:50 | 休息 | —— |
| **14:50–16:10** | **`p0-toolkit` 立项 第 2 段**：写测试 + `pnpm test` 修到全绿 | 产出物 4 |
| 16:10–16:40 | AI 协作：review + 出题 | 记下漏洞，自己改 |
| 16:40–17:00 | 英文 15 分钟 + 日志 + commit + push | 产出物 6 |

**两个裸写时段都关掉 AI 补全。** 这是 §一 原则第 4 条那次"每周至少 2 次裸写训练"。

---

## 二 09:40–10:00 先还两个小尾巴

### ① 补上 `day02-debounce.js` 头部的 `immediate` 语义（5 分钟）

文件头部有一行：

```
//     TODO(你补一句话)：我的 immediate 语义是 ______，因为 ______。
```

昨天实测出来的是：你的 `immediate: true` 是"**开头 + 末尾各执行一次**"（leading + trailing）。把这句话写进去，再补一句你为什么选它。**这不是形式主义**——面试官问"你的 `immediate` 是什么语义"，你要能立刻答出来，而不是回去翻代码。

### ② 闭包收尾（15 分钟，只补原理）

**你在 Day 3 已经把闭包章的任务做完了**（`sum(a)(b)`、`inBetween`、`inArray`、`byField`、`makeArmy`），所以今天不用重做，只把两节读一遍：

- [变量作用域，闭包](https://zh.javascript.info/closure) 的 **Step 4. 返回函数** 和 **垃圾收集** 两节

读完回答一个问题（面试高频）：

> **为什么闭包里的变量不会被垃圾回收？** `makeArmy()` 返回之后，它的局部变量本来该被回收，为什么 `army[0]()` 还能打印出 `j`？

顺便说一句：你的探索 TODO 里登记的「**step4.返回函数**」，今天可以划掉了。

---

## 三 10:00–11:00 裸写 `throttle`（产出物 1）

**规则：关掉 AI 补全。想不起来查 MDN，不查 AI。**

### 需求

```js
throttle(fn, interval)
```

- **首次调用立刻执行**（这点和 `debounce` 相反）
- `interval` 毫秒内的后续调用被**忽略**
- 过了 `interval` 之后再调用，可以再次执行
- 调用时的参数要透传给原函数

### 和 `debounce` 的区别（一句话记住）

| | 你等什么 | 特点 |
|---|---|---|
| `debounce` 防抖 | **等你停手** | 连续触发只算最后一次 |
| `throttle` 节流 | **按频率放行** | 连续触发期间也保证每隔 `interval` 执行一次 |

`debounce` 是"你安静了 500ms 我才动"，`throttle` 是"再密集我也每 500ms 动一次"。

### 两条实现路线（自己想清楚选哪条）

`debounce` 你必须用 `setTimeout` 保存 `timer`。**但 `throttle` 有两条路，都能实现**：

- **路线 A：比较时间戳。** 记住"上次执行是几点"，每次调用时判断 `现在 - 上次 >= interval`。需要的 API 是 `Date.now()`（返回当前毫秒数）。
- **路线 B：开关 + 定时器。** 用一个布尔变量当开关，执行时关掉，`setTimeout` 到点后再打开。

两条路都行，选一条你自己讲得清的。**建议先想路线 A**——它更短，而且不需要处理"定时器还没到点又来了新调用"的纠缠。

### 写完之后

```powershell
node week1-language/day05-throttle-verify.js
```

目标：**通过 5 项，失败 0 项**。然后看最后那段**行为探针**——它会告诉你，你的实现属于"只开头触发"还是"开头 + 末尾都触发"。**两种都是合法设计，但你必须把选择写进注释。**

---

## 四 11:15–12:15 裸写 `curry`（产出物 2）

### 需求

```js
curry(fn)
```

把 `f(a, b, c)` 变成能逐个传参的形式：

```js
const add3 = (a, b, c) => a + b + c;
curry(add3)(1)(2)(3)    // 6
curry(add3)(1, 2)(3)    // 6   ← 一次传多个也要支持
curry(add3)(1, 2, 3)    // 6   ← 一次传够直接执行
```

### 骨架（和 `debounce` 是同一个模式）

```
curry(函数 f)：
  返回一个新函数 collect，collect 负责：
    ① 把这次收到的参数收起来
    ② 判断"收够了没"—— 够 → 调用 f，把结果返回
    ③ 不够 → 返回一个新函数，下次再收到参数时继续走①
```

**看第 ③ 步**：不够的时候返回的又是"一个新函数"。这就是"自相似"——你昨天写 `deepClone` 时见过同一个形状。

**和 `debounce` 的共同点一句话**：都是"接收一个函数、返回一个新函数"。区别只在**新函数内部记什么**：`debounce` 记 `timer`，`curry` 记"已经收到的参数"。

### 两个必须想清楚的点

1. **"收够了没"怎么判断？** 用 `fn.length`。
2. **参数存在哪？** 这是最容易翻车的地方 —— 想想这个场景：`const c = curry(add3); c(1)(2)(3); c(4)(5)(6);`。**如果 `args` 数组是共用的，第二次就会带上第一次的参数。** 脚手架的测试 4、测试 5 专门抓这个。

### 写完之后

```powershell
node week1-language/day05-curry-verify.js
```

目标：**通过 12 项，失败 0 项**。然后仔细读最后那段**陷阱探针**，它会把 `fn.length` 的两个坑摆在你面前：

- `(a, b = 2, c) => {}` 的 `length` 是 **1**（第一个默认参数之后的都不计入）→ 所以 `curry` 会在只收到 1 个参数时就误判为"收够了"
- **包装函数会让 `length` 变成 0** → 所以对被 `debounce`/`throttle` 包装过的函数做 `curry`，会**永远收不够**

第二条正是你 Day 4 读的《装饰器模式和转发》里「**装饰器和函数属性**」那一节讲的东西——今天撞上了，这就是那一节为什么值得看。

---

## 五 13:30–16:10 `p0-toolkit` 立项（产出物 3、4）

这是**第 1 周的第一个真实产出物**。计划 §四 里写的是"用 JS 立项，Day 8 转 TS"。

### 第 1 段（13:30–14:40）：搭骨架 + 搬函数

**目录结构**（在 `week1-language/` 下新建 `p0-toolkit/`）：

```
week1-language/p0-toolkit/
  package.json
  README.md
  src/
    debounce.js        ← 从 day02-debounce.js 搬过来（实现 + module.exports）
    throttle.js        ← 今天写的
    curry.js           ← 今天写的
    deepClone.js       ← 从 day02-clone.js 搬过来
  test/
    debounce.test.js
    throttle.test.js
    curry.test.js
    deepClone.test.js
```

**`package.json` 内容**（配置可以直接用这份，实现要自己写）：

```json
{
  "name": "p0-toolkit",
  "version": "0.1.0",
  "private": true,
  "description": "30 天计划第 1 周的工具函数库（JS 版，Day 8 转 TS）",
  "scripts": {
    "test": "node --test"
  }
}
```

三个要点：
- **不要写 `"type"` 字段** —— 不写就是默认 CommonJS，你现在的 `module.exports` / `require` 才能正常工作（ESM 是 Day 8 的内容）
- **`"private": true`** —— 防止手滑 `pnpm publish` 发到公开仓库
- **`"test": "node --test"`** —— 这样 `pnpm test` 就等于 `node --test`

**为什么先用 `node --test` 而不是 Vitest？** 两个原因：

1. `node --test` 是 **Node 内置的，零依赖**——不用装任何包，不用等网络，今天立刻能跑（你的网络这两天一直在抽风）
2. 计划 §四 里 **Vitest 本来就排在 Day 8**（那天配 `tsconfig.json` + `tsx` + Vitest）。今天先用手边就有的工具把"测试"这件事跑通，Day 8 再换成 Vitest——那时你已经知道测试跑器在干什么了，换起来只是换语法

**搬函数时的三个注意点**：

- 一个文件只放一个函数，各自 `module.exports = { 函数名 }`
- 库文件**不要在顶层 `console.log`**（Day 4 学到的）：`debounce.js` 里不要留演示代码；`day02-clone.js` 里那种演示要留在原文件或挪进 `test/`
- `deepClone` 的「已知限制」注释要一起搬过去 —— 那是 README 的素材
- `day02-debounce.js` / `day02-clone.js` 里的**练习版保留**，工具库是"干净版"，两边都留着（plan §一 的"先裸写，再让 AI 评审"就是这个意思）

**`README.md` 要含这 5 节**（计划 §五 验收标准第 3 条）：

1. 一句话简介
2. 快速开始（怎么装、怎么跑测试）
3. 函数清单（4 个函数各一行作用）
4. **已知限制** ← 从 `deepClone` 的注释搬过来（循环引用会栈溢出、`Date`/`Map`/`Set` 退化成 `{}`、函数和 class 原型处理不了；顺便写清 `structuredClone` 也不是万能的）
5. 后续计划（Day 8 转 TS + Vitest）

### 第 2 段（14:50–16:10）：写测试 + 跑绿

**`node:test` 的语法（你第一次用，先看这个模板）：**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { debounce } = require('../src/debounce.js');

test('连调 5 次只执行 1 次', () => {
  let calls = 0;
  const fn = debounce(() => { calls++; }, 50);
  for (let i = 0; i < 5; i++) fn();
  assert.equal(calls, 1);
});

test('异步的测试要 async', async () => {
  await new Promise((r) => setTimeout(r, 100));
  assert.ok(true);
});
```

你其实已经会写测试了——**你写的两个脚手架就是测试**，只是用了 `console.log` 自己数。现在换成标准的 `test()` + `assert`，就是"把脚手架的检查项改成官方格式"。

**至少要有的用例（凑够 6 个轻松，建议写满 10 个）：**

| 测试文件 | 用例 |
|---|---|
| `debounce.test.js` | ① 连调 5 次只执行 1 次 ② `immediate: true` 第一次立刻执行 |
| `throttle.test.js` | ③ `interval` 内多次调用只执行 1 次 ④ 过了 `interval` 能再次执行 |
| `curry.test.js` | ⑤ 逐个传参 `c(1)(2)(3)` ⑥ 一次传够 `c(1,2,3)` ⑦ 柯里化后的函数能复用（不串参数） |
| `deepClone.test.js` | ⑧ 嵌套对象改副本不影响原对象 ⑨ `null` 保持 `null` ⑩ 数组（含嵌套数组） |

**跑测试的规则**：

```powershell
cd week1-language/p0-toolkit
pnpm test
```

`node --test` 会自动在你的项目目录里找测试文件。我实测过的**发现规则**：

- `test/xxx.test.js` ✅ 会被找到
- `src/xxx.js` ✅ **不会**被当成测试（这是对的）
- 根目录 `xxx.test.js` ✅ 也会被找到

所以规矩很简单：**实现放 `src/`，测试放 `test/` 且文件名以 `.test.js` 结尾。**

---

## 六 16:10–17:00 AI 协作 + 收尾

**AI 协作三个动作**：

1. **让 AI review 今天代码**——"这是我的 `throttle` 实现，请指出我漏掉的边界条件，**不要给我重写**"
2. **让 AI 出 3 道题**——"出 3 道关于 `throttle`/`curry` 和 `fn.length` 的题，一次一题，等我回答再给下一题"
3. **让 AI 指出今天最含糊的概念**

红线：不许让 AI 直接写整个函数。它给的写法先反问"这个 API 在当前 Node LTS 里还在吗？"

**收尾**：

```powershell
cd C:\Users\27971\.zcode\workspace\default\js-node-30days
git status
git add -A
git status
git commit -m "day05: add throttle and curry, boot p0-toolkit"
git push
git status -sb      # 没有 [ahead 1] 就是同步好了
```

---

## 七 今天的完成标准

- [ ] `day05-throttle-verify.js` → **通过 5 项，失败 0 项**
- [ ] `day05-curry-verify.js` → **通过 12 项，失败 0 项**
- [ ] 两个实现都在文件头部写清了**设计选择**（`throttle` 的 leading/trailing、`curry` 的 `fn.length` 局限）
- [ ] `p0-toolkit/` 目录结构完整，`src/` 下 4 个函数文件都在
- [ ] `pnpm test` 全绿，退出码 0，**至少 6 个用例**
- [ ] `README.md` 含「已知限制」一节（4 条以上）
- [ ] `day02-debounce.js` 的 `TODO` 消掉了
- [ ] 能口头回答："为什么闭包里的变量不会被回收？"
- [ ] 日志 + commit + push

---

## 八 如果时间不够：砍单顺序

**保底（今天必须发生）**

1. `throttle` 脚手架 5/5 —— 绝不砍，它是"一个模式用三次"的第二课
2. `curry` 脚手架 12/12 —— 绝不砍
3. `p0-toolkit` **目录 + `package.json` + 至少 6 个用例 + `pnpm test` 全绿** —— 这是第 1 周的产出物，绝不能只搭个空目录
4. 日志 + commit + push —— §二 每日必交

**可以顺延（要登记进 `notes/day05.md` 的欠账表）**

5. `README.md` 的完整版（先写 3 行占位，Day 8 再补全）
6. 闭包收尾的 15 分钟阅读（Day 3 已做过任务，所以最不重要）
7. AI 协作的第 3 个动作

**关键检查点 14:40**：如果 14:40 还没开始搭 `p0-toolkit`，就把 `curry` 的"进阶传参"（一次传多个）先放弃、保住工具库。**工具库是本周的产出物，优先级高于单个函数写得多漂亮。**

---

## 九 今天不碰什么

- **`this`、原型链、`class`** —— Day 6
- **异步三件套（`Promise` / `async`）** —— Day 7（你探索 TODO 里那条 `async` 在这里解决）
- **ESM / `type: module` / `exports` 字段** —— Day 8。今天 `package.json` 里**不要**写 `"type"`
- **TypeScript** —— Day 8
- **Vitest** —— Day 8（今天用 Node 内置的 `node --test`）

---

## 十 明天（Day 6）会用到今天的什么

Day 6 主题：**`this` / 原型链 / `class`**

你探索 TODO 里登记的「`this` 具体指向谁」会在那天解决。而且今天写的 `throttle`/`curry` 里都有 `fn.apply(this, args)` 这样的写法——**那个 `this` 到底是谁，明天就有答案了**。这也是为什么今天不用纠结它，照抄 `apply(this, ...)` 就行。
