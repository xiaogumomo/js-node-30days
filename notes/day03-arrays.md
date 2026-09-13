# Day 3 学习指引：补 Day 2 + 数组与对象

> **日期**：2026-09-13（周日）　**主题**：补 Day 2 + 数组与对象
> **对照计划**：`js-node-30day-plan.md` §四 第 1 周 Day 3
> **今天的性质**：两类任务混在一起——**还账**（Day 2 欠的 5 项）+ **新内容**（数组与对象核心）。还账必须最先做，因为作用域链卡着 Day 5 的 `this`/闭包。
> **时间基准**：现在 08:20 开工，排到 21:05 收工。

---

## 〇、开工前 10 分钟（08:20–08:30）：先把产出物清单抄在纸上

§七 心法第 6 条要求每个时段开始前写下产出物名字。今天全天 7 个产出物，先抄一遍：

| # | 产出物 | 验收标准（能跑出来才算数） |
|---|---|---|
| 1 | `week1-language/day02-scope.js` | 三段演示都有实际输出：`var` 得 `undefined` / `let` 抛 `ReferenceError`、三层作用域逐层打印、循环里 `var` vs `let` 输出不同 |
| 2 | `week1-language/day02-debounce.js` | 连调 5 次只执行 1 次；`immediate: true` 时第一次立刻执行 |
| 3 | `week1-language/day02-throttle.js` | 两个版本（补执行 / 不补执行）都能跑出输出 |
| 4 | `week1-language/day02-curry.js` | `curry(f)(1)(2)(3)` 收够了才调用；注释写清 `fn.length` 与默认参数的陷阱 |
| 5 | `week1-language/day02-clone.js` | 浅拷贝三种写法都**用代码证明**只复制第一层；手写深克隆处理 `null`；证明 `structuredClone` 能处理循环引用而手写版会栈溢出 |
| 6 | `week1-language/day03-array-methods.js` | 见第五节清单（9 项） |
| 7 | `week1-language/day03-leetcode.js` | 思路 + 时间复杂度 + 空间复杂度写进文件顶部注释 |

**写不出产出物名字的时段，就是最容易跑题的时段。** 昨天（Day 2）315 行练习、四个函数挂零，问题就出在这里——开写之前没定义"这一段要交出什么"。

### 额外准备：建一个 TODO 停车场

在 `notes/day03.md` 里先开一个 `## 探索 TODO（非清单，不许插队）` 小节。今天只要冒出"想看看 xxx"的念头，立刻写进那里，**不许当场去查**。收工后如果清单做完了，再去看。

---

## 一、今天的时间表

| 时间 | 干什么 | 产出物 |
|---|---|---|
| 08:20–08:30 | 抄产出物清单 + 建 TODO 停车场 | —— |
| **08:30–10:30** | **还账：Day 2 的学习欠账（4 节阅读 + 动手）** | 能口头回答 5 个问题 |
| **10:30–11:00** | **`day02-scope.js`** | 产出物 1 |
| 11:00–12:00 | 数组与对象核心（上）：数组章 + 方法章前半 | 产出物 6 上半 |
| 12:00–13:30 | 午休，不碰屏幕 | —— |
| 13:30–14:30 | 数组与对象核心（下）：转换类方法 + 不可变更新 | 产出物 6 完成 |
| **14:30–15:20** | **裸写① `debounce`（番茄钟 50）** | 产出物 2 |
| 15:20–15:30 | 休息 10 分钟 | —— |
| **15:30–16:20** | **裸写② `throttle`（50）** | 产出物 3 |
| 16:20–16:30 | 休息 | —— |
| **16:30–17:20** | **裸写③ `curry`（50）** | 产出物 4 |
| 17:20–17:30 | 休息 | —— |
| **17:30–18:20** | **裸写④ `clone`（50）** | 产出物 5 |
| 18:20–19:30 | 晚饭 / 休息 | —— |
| 19:30–20:00 | AI 协作：review + 出题 | 记下漏洞，自己改 |
| 20:00–20:30 | LeetCode 1 题 | 产出物 7 |
| 20:30–20:45 | 英文 15 分钟 | MDN 英文版 |
| 20:45–21:05 | 日志 3 行 → `notes/day03.md` + commit + push | commit |

**裸写时段（14:30–18:20）关掉所有 AI 补全。** 这是 §一 原则第 4 条那次"每周至少 2 次裸写训练"之一。

---

## 二、08:30–10:30 还账：Day 2 的学习欠账（120 分钟）

| 顺序 | 章节 | 覆盖 | 时长 |
|---|---|---|---|
| 1 | [箭头函数，基础知识](https://zh.javascript.info/arrow-functions-basics) | 简写形式、单表达式隐式 `return` | 20 min |
| 2 | [Rest 参数与 Spread 语法](https://zh.javascript.info/rest-parameters-spread) | `...args` 收集、`...arr` 展开、`arguments` 为什么别用 | 30 min |
| 3 | [变量作用域，闭包](https://zh.javascript.info/closure) | **只读前半**：代码块 → 嵌套函数 → 词法环境（Step 1–3）→ 垃圾收集 | 50 min |
| 4 | [var](https://zh.javascript.info/var) | `var` vs `let` 的差异、为什么现在只用 `let`/`const` | 20 min |

### 读完整段后，合上书回答这 5 个问题

1. 箭头函数和普通函数的区别——今天只需说清 3 条：**没有自己的 `this`、没有 `arguments`、不能用 `new`**。
2. 昨天你亲手写了 `text = text || "empty"`。它和默认参数 `function f(text = "empty")` 有什么区别？**提示：想想 `f(0)` 和 `f("")` 会怎样**——一个用 `||` 兜底、一个用默认参数，结果会不同。这条是面试常问的陷阱。
3. `...args` 收上来的是什么？`arguments` 为什么不要用了？（原文：`arguments` "不是数组，不支持数组方法，不能调用 `arguments.map(...)`"）
4. **作用域链**：内部函数找变量是由内向外逐层找，**找到就停**。javascript.info 不用"作用域链"这个词，它的说法是"先搜索内部词法环境，再搜索外部环境，以此类推直到全局"——两个说法都要认识。
5. **暂时性死区（TDZ）**：`let`/`const` 声明的变量，从代码块开始到声明语句执行之前访问，会抛 `ReferenceError: Cannot access 'x' before initialization`，**不是**返回 `undefined`。

> javascript.info 那章末尾有个练习叫「变量可见吗？」，正好考这三件事，做完再往下。

---

## 三、10:30–11:00 写 `week1-language/day02-scope.js`

用 `console.log` 演示三件事（自己写，别让 AI 代笔）：

- **提升差异**：同一个变量名，`var` 版本输出 `undefined`，`let` 版本抛 `ReferenceError`（用 `try/catch` 包住把错误信息打印出来）；
- **三层嵌套作用域**：三层嵌套函数，每层打印一个变量，注释写清这个变量来自哪一层；
- **循环里的 `var` vs `let`**：打印 3 次，看两次输出分别是什么。

半小时够用。写不出来说明第二节的第 4、5 个问题还没真懂，回去补。

---

## 四、11:00–12:00 + 13:30–14:30 数组与对象核心（120 分钟）

### 阅读清单

| 顺序 | 章节 | 覆盖 | 时长 |
|---|---|---|---|
| 1 | [数组](https://zh.javascript.info/array) | **快速过**（你昨天已经摸过 `push/pop/length/at/矩阵`），重点补 `toString` 小节 | 20 min |
| 2 | [数组方法](https://zh.javascript.info/array-methods) | 主章：`splice/slice/concat/forEach`、搜索类 `indexOf/includes/find/findIndex/filter`、转换类 `map/sort/reverse/split/join/reduce/reduceRight`、`Array.isArray` | 60 min |
| 3 | [Object.keys，values，entries](https://zh.javascript.info/keys-values-entries) | `Object.keys/values/entries` + `Object.fromEntries` 反向转回对象 | 20 min |
| 4 | MDN 补充（**第 2 章没覆盖，必须自己补**）：[`flat`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)、[`toSorted`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)、[`structuredClone`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/structuredClone) | `flat/flatMap`、ES2023 的非侵入式方法、深拷贝 | 20 min |

### 下面这些输出我在 Node v24 上实跑验证过，你写完对照

| 写法 | 实际输出 | 要点 |
|---|---|---|
| `[3,1,2].toSorted()` | `[1,2,3]` | **原数组不变**（非侵入式） |
| `[3,1,2].sort()` | `[1,2,3]` | **原数组被改**（原位排序） |
| `[3,1,2].toReversed()` | `[2,1,3]` | 原数组不变 |
| `[3,1,2].with(0, 99)` | `[99,1,2]` | 原数组不变 |
| `[3,1,2].toSpliced(0,1)` | `[1,2]` | 原数组不变 |
| `[10,9,100].sort()` | `[10,100,9]` | **坑！默认按字符串比大小** |
| `[10,9,100].sort((x,y)=>x-y)` | `[9,10,100]` | 数字排序必须传比较函数 |
| `[1,[2,[3,[4]]]].flat(2)` | `[1,2,3,[4]]` | 只拍平 2 层，还剩一层嵌套 |
| `[1,[2,[3,[4]]]].flat(Infinity)` | `[1,2,3,4]` | 全拍平 |
| `[1,2,3].flatMap(x=>[x,x*10])` | `[1,10,2,20,3,30]` | 先 map 再 flat(1) |
| `Object.entries({a:1,b:2})` | `[["a",1],["b",2]]` | 配合 `Object.fromEntries` 能转回去 |
| `[1,2,3,4].reduce((s,x)=>s+x, 0)` | `10` | 别忘了给初始值 |
| `structuredClone` 深拷贝嵌套对象 | 改副本不影响原对象 | 对比 `JSON.parse(JSON.stringify(x))`：**遇循环引用直接抛 `TypeError`** |

> **`sort()` 那个坑值得单独说**：`[10,9,100].sort()` 得到 `[10,100,9]`，因为它把元素转成字符串再比。这条是高频面试题，务必能解释。

### `week1-language/day03-array-methods.js` 清单（9 项，全部要 `console.log` 出结果）

- [ ] `map` / `filter` / `find` / `findIndex` 各写一个 demo
- [ ] `reduce` 做三件事：求和、求平均、把数组转成对象（用 `reduce` 累积 + `Object.fromEntries` 各写一遍）
- [ ] 复现 `sort` 的坑：打印 `[10,9,100].sort()` 得到 `[10,100,9]`，再用比较函数修正成 `[9,10,100]`
- [ ] `flat(2)` 打印出 `[1,2,3,[4]]`，再 `flat(Infinity)` 打印出 `[1,2,3,4]`
- [ ] `flatMap` 一个实际用途（比如给每个元素生成两条记录）
- [ ] `Object.entries` 遍历对象，再用 `Object.fromEntries` 转回对象
- [ ] **不可变更新模式**：`toSorted` / `toReversed` / `with` / `toSpliced` 各写一遍，**每组前后都打印原数组，证明原数组没变**
- [ ] `structuredClone` 深拷贝嵌套对象，改副本后打印原对象证明未受影响
- [ ] **实战**：把 `[{name, age}, ...]` 按 `age` 排序，**不修改原数组**（不可变更新的真实用法；后面写 React / Redux 和任何"状态"都是这套）

> **为什么今天专门练"不可变更新"**：§六 面试题库里"深浅拷贝"是高频点；而且 `toSorted` 这类 ES2023 方法只有较新的 Node 才有——以后再看到 `sort()`，先问自己一句"我是不是把调用方的数组改了"。
>
> 注意：**"裸写 `map/filter/reduce` 的 polyfill" 不在今天**，已挪到 Day 4 和 `p0-toolkit` 立项一起做。

---

## 五、14:30–18:20 裸写四个函数（今天最高价值的一段）

规则：关掉所有 AI 补全；先写完、跑起来、看到输出，再回头检查边界。写不出来查 MDN，不查 AI。

### ① `day02-debounce.js`

需求：`debounce(fn, delay, immediate = false)`

- [ ] 连续调用 5 次，`fn` 只执行 1 次（在最后一次调用之后等 `delay` 毫秒）
- [ ] `immediate: true`：第一次调用立刻执行，之后 `delay` 内的调用被忽略
- [ ] 想清楚"`immediate` 模式下返回什么"，把约定写进注释
- [ ] 用 `setTimeout` + 闭包保存 `timer`
- [ ] **能回答**：为什么 `timer` 必须放在闭包外层，不能写在 `debounce` 返回的函数内部？

> 这是 §四 Day 7 周自测的原题（"手写一个 `debounce`，要求支持 `immediate` 选项"），今天写扎实，Day 7 不返工。

### ② `day02-throttle.js`

需求：`throttle(fn, interval)`

- [ ] `interval` 内多次调用只执行一次
- [ ] **写两遍**："最后一次调用不补执行"和"最后一次补执行"各一个版本，注释写清取舍
- [ ] 能回答：防抖和节流分别在什么场景用？（搜索框输入 / 滚动加载 / 拖拽）

### ③ `day02-curry.js`

需求：`curry(fn)`，把 `f(a,b,c)` 变成 `f(a)(b)(c)`

- [ ] 支持任意参数个数：用 `fn.length` 判断参数收够了没有
- [ ] 边收边攒，收够了才真正调用
- [ ] **陷阱题**：`fn.length` 对"带默认参数的函数"返回什么？默认参数**之后**的参数不计入 `length`。想清楚 `curry((a, b = 2, c) => {})` 会怎样，写进注释
- [ ] 顺手写一个 `compose`（今天 LeetCode 要用）

### ④ `day02-clone.js`

- [ ] **浅拷贝三种写法**：`{...obj}` / `Object.assign({}, obj)` / 手写 `for...in`，并**用代码证明**它们只复制第一层
- [ ] **手写深克隆**（递归），必须处理：嵌套对象、数组、`null`（`typeof null === 'object'` 的坑，Day 1 Q1 在这里复活）
- [ ] **和 `structuredClone()` 对比**：手写版少处理了什么？（`Date`、`Map`、`Set`、**循环引用**、函数）
- [ ] 用一段代码证明：`structuredClone` 处理循环引用正常返回，手写版栈溢出
- [ ] **把局限写进注释**——这段注释明天直接进 `p0-toolkit` 的 README「已知限制」

---

## 六、19:30–20:00 AI 协作

1. **让 AI review 代码**——正确问法："这是我的 `debounce` 实现，请指出我漏掉的边界条件，**不要给我重写**。"
2. **让 AI 出 3 道题**——"出 3 道关于作用域链、TDZ 和数组方法（含 `sort` 的坑）的题，一次一题，由易到难，等我回答再给下一题和解析。"
3. **让 AI 指出今天最含糊的概念**并追问。

红线：不许让 AI 直接写整个函数再粘贴。它给的写法先反问"这个 API 在当前 Node LTS 里还在吗？"

AI 指出的问题**自己动手改完**再 commit。

---

## 七、20:00–20:30 LeetCode 1 题

**主选：[2629. Function Composition](https://leetcode.com/problems/function-composition/)（easy）**——正好用上今天写的 `compose`。`compose([x=>x+1, x=>x*x, x=>2*x])(4)` 得 `65`（从右往左算）。

**备选**：2666. Allow One Function Call（rest 参数）/ 2703. Return Length of Arguments Passed（rest 参数）/ 2620. Counter（闭包，给 Day 4 预热）。

**要求**：关掉 AI；文件顶部注释写清**思路 + 时间复杂度 + 空间复杂度**。

---

## 八、20:30–21:05 英文 + 日志 + commit

- 20:30–20:45 英文 15 分钟（MDN 英文版：把地址里的 `/zh-CN/` 去掉。今天可以读 `Array.prototype.toSorted` 的英文页）
- 20:45–21:05 写 `notes/day03.md` 三行日志，然后：

```powershell
node --watch week1-language/day02-debounce.js
git add -A
git commit -m "day03: catch up day02, add array/immutable drills"
git push
```

---

## 九、今天的完成标准

- [ ] 7 个产出物**全部能跑出实际输出**（不是"写完了"，是"跑过了"）
- [ ] 能口头回答第二节的 5 个问题（尤其 `||` 兜底 vs 默认参数、TDZ 抛什么错）
- [ ] 能解释 `[10,9,100].sort()` 为什么是 `[10,100,9]`
- [ ] 能说清 `sort()` 和 `toSorted()` 的区别，以及为什么后者更安全
- [ ] `day02-clone.js` 里手写深克隆的局限写进了注释
- [ ] LeetCode 1 题含复杂度分析
- [ ] 「探索 TODO」里的东西**要么没碰，要么在清单交付完之后才碰**
- [ ] `notes/day03.md` 三行日志 + 至少 1 次 commit 并 push

---

## 十、如果时间不够：砍单顺序（提前定好，别在晚上慌）

昨天的教训是"到点了才发现做不完，然后跑题"。今天提前定好顺序，晚上照着执行，**不要临时起意加班到凌晨**。

**保底（无论如何今天要发生）**

1. 四个裸写函数（产出物 2–5）——绝不砍，面试必考 + 明天 `p0-toolkit` 的核心
2. 作用域链 / TDZ + `day02-scope.js`（产出物 1）——绝不砍，Day 5 的 `this`/闭包依赖它
3. 日志 + commit + push —— §二 每日必交，绝不砍

**可以顺延到 Day 4 早上（必须登记进 `notes/day03.md` 的欠账表）**

4. 箭头函数 + rest/spread 的阅读（只在你到 10:30 还没读完时才顺延）
5. LeetCode 1 题
6. AI 协作的第 3 个动作

**压缩但不砍**：英文 15 min → 压到 10 min，只读一页 MDN。

> **关键检查点 14:30**：如果 14:30 你还没开始写四个函数，今天就注定欠账。那时正确的决定**不是**熬夜硬撑，而是立刻把"数组与对象核心"顺延到 Day 4 早上，登记欠账，保住四个函数。这样明天损失最小。

---

## 十一、今天不碰什么（明确禁止插队）

昨天 315 行练习里，一大半是 Day 3 和 Day 6 的内容。今天提前划出禁区：

- **`this`、原型链、`class`** —— Day 5，今天不碰
- **闭包的深水区**（"Step 4. 返回函数"以及之后的闭包任务、"Counter 是独立的吗？"）—— Day 4，今天只读作用域/词法环境那部分
- **Promise / async-await / 事件循环** —— Day 6。你昨天已经提前摸过了，今天**不许再摸**
- **TypeScript** —— Day 7

想探索的，写进 `notes/day03.md` 的「探索 TODO（非清单，不许插队）」，清单交付完再看。

---

## 十二、明天（Day 4）会用到今天的什么

- Day 4 主题：**数组与对象收尾 + `p0-toolkit` 立项**——裸写 `map/filter/reduce` 的 polyfill，然后把今天写的四个函数装进 `p0-toolkit`（JS 版）配 Vitest，先写 ≥8 个测试
- 所以今天四个函数的**注释和局限必须写清楚**，明天直接进仓库，不用重读代码
