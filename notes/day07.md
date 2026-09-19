# Day 7 — 2026-09-19（周六）

> **状态：待填写**　｜　任务书：[`day07-async.md`](day07-async.md)
> **今天按 3～4 小时排**（"选 A"的执行方式：每天只放 3～4 小时的量、把清单划干净，多的推给下一天）
> ⚠️ **今天不追求把 Day 7 做完** —— 原本的内容拆成两段，今天只做前半（Promise 基础）

## 今日目标

**第一段：清 Day 6 欠账（约 2.5 小时）**
- [ ] 0-①. 补 `notes/day06.md` 的「学会了什么」第 2、3 条
- [ ] 0-②. `day06-prototype.js`：**手写原型继承 vs `class` 重写**，两边跑出同样结果
- [ ] 0-③. `day06-prototype.js` 修语法错误（`node --check` 先过）+ 字段初始化 4 步
- [ ] 0-④. 裸写 `myMap`/`myFilter`/`myReduce` → 脚手架 **17/17**
- [ ] 0-⑤. 搬进 `p0-toolkit/src/arrayUtils.js` + 测试 → `pnpm test` 全绿

**第二段：Day 7 前半（约 2 小时）**
- [ ] 1. CommonJS 自测（15 分钟，3 道题）
- [ ] 2. 读《回调》+《Promise》+《Promise 链》+《async/await》
- [ ] 3. `week1-language/day07-promise.js`：三种写法对照（回调 → Promise → `async/await`）
- [ ] 4. 日志 + commit + push

**今天不要求**（明天做）：微任务/宏任务、`Promise.all` 家族、ESM vs CJS、TypeScript

## 今日产出
| 文件 | 内容 |
|---|---|
| `week1-language/day06-prototype.js` | 手写原型继承 + `class` 重写 + 字段初始化顺序 |
| `week1-language/day06-array-utils.js` | `myMap` / `myFilter` / `myReduce` |
| `p0-toolkit/src/arrayUtils.js` | 搬进工具箱的版本 |
| `p0-toolkit/test/arrayUtils.test.js` | 它的测试 |
| `week1-language/day07-promise.js` | 回调 / Promise / `async/await` 三种写法对照 |

## 探索 TODO（非清单，不许插队）

> 已有归属：`process`（Node 里的输入输出）→ 待定；`Map` → 待定；`async` → **今天**。
1.写class中遇到Object.create不知道这个的用法
2.inNaN()判断是否为NAN
3.JSON.stringify 数变文字
JSON.parse 文字变数
## 学会了什么

1.[[HomeObject]]属性根据函数定义类或对象方法时候，它的属性即为定义的这个对象
2.JSON.stringify 把“值”变成“文本” JSON.parse把“文本”变为“值”。
3.!isNaN(x)判断字符串能不能转数字（还不太熟练，需要提醒复习）！isNaN(x)是不是有效数字的条件之一（还需要加typeof x === "number"）

## 卡在哪里

1.[[HomeObject]]关于super的知识：super的指向看定义位置，this（函数）的指向看调用者

> （以下 2–6 由 AI 按 9/19 的实际过程代笔，你明天看过觉得不对可以改）

**2. `myMap` 第一版 5 处 bug，但没有一处是"不会的概念"**

`i > arr.length`（符号反了）、`slice(0, length-1)`（丢了最后一个元素）、`fn()`（没传参）、往副本里写而不是建新数组、`return` 的位置 —— **全是手滑和不熟练，不是"不懂原理"**。
也就是说：这一块缺的是**熟练度**，而熟练度只能靠重复，讲一遍是没用的。

**3. `myFilter` 卡在一处真概念：`push` 什么**

第一版写成 `out.push(fn(arr[i], i, arr))` —— 把**回调的返回值**放进去了，而 filter 的回调返回的是 `true/false`，所以结果数组里全是 `true`。
**卡住的本质是没分清 map 和 filter 的分工**：map 的回调返回"新元素"，filter 的回调只返回"要不要"，**新数组里放的永远是原元素本身**。

**4. `myReduce` 卡在"累加在哪实现的"**

一开始以为"累加是 `myReduce` 干的"。实际是**两处合作**：回调里的 `return acc + el` **算出**新值，`myReduce` 里的 `acc = fn(...)` **把返回值接回来**。缺一不可 —— 回调不 `return` → `acc` 变 `undefined`；`myReduce` 不赋值回 `acc` → `acc` 永远不变。

**5. `if(init)` —— 踩了 Day 4 同一个坑**

想判断"有没有传 `init`"，写成了 `if(init)`。但 `init = 0` 时 `if(0)` 是**假** → 走错分支。**正确用 `init === undefined`。**
这和 Day 4 的 `text = text || "empty"`（`f(0)` 会出错）是**同一个坑**：凡是判断"有没有传 / 是不是空"，都不能用真假值。

**6. 两天时间花在"低级错误"上（这条最值得记）**

`day06-prototype.js` 的语法错误（`this speed = 0` 少点号）**跨了两个会话**；`day06-array-utils.js` 又撞上一个两个连续逗号（`,,`）。
**这些不是"学习困难"，是"改完没先 `node --check`"的流程缺失。** 更要紧的是：它们会**伪装成"我学得慢"** —— 那两天的时间不是花在"没学会"上，是花在"文件根本没跑起来"上。

## 踩过的坑

> （本节由 AI 按实际过程代笔）

**1. `console.log("x", , y)` —— 两个连续逗号**

`f(a, , b)` 在 JS 里是**语法错误**（`SyntaxError: Unexpected token ','`）。杀伤半径是**整个文件**：一行都不执行。我因此看不到任何输出，白白困惑了一轮。

**2. `this speed = 0;` 少了点号**

这是"语法错误是**文件级**的"最好的例证：一个字符错，**整份文件从第一行起都不执行** —— 上面写好的所有演示（`typeof class`、`__proto__`、`找到了`）全都从没跑过。

**3. 类体里给未声明变量赋值会抛错**（`derivedField = ...`）

**`class { }` 里面的代码自动是严格模式**（不管文件有没有写 `'use strict'`），而严格模式**不允许隐式创建全局变量** → 抛 `ReferenceError: derivedField is not defined`。
实测对比：普通函数里 `未声明变量 = 1` **不抛错**（会创建全局变量）；**类体里同一件事直接抛错**。

**4. `arr(i)` —— 把数组当函数调用**

`arr` 是数组，`arr(i)` 是"调用它" → `TypeError: arr is not a function`。取元素要用 **`arr[i]`**（方括号）。

**5. 把"只处理数字"的过滤条件写进了 `myFilter`**

我加了 `typeof arr[i] === 'number'`，它会让 **`myFilter(users, u => u.age >= 18)` 这种对象数组全被跳过** → 结果空数组。
**`filter` 的筛选规则完全由回调决定，不能自己预设元素类型。**
（注意：`typeof x === 'number' && !isNaN(x)` 这个写法**本身是对的** —— 它是"判断 x 是不是一个真数字"的标准写法。**错的是"用在了 filter 里"**，不是写法错。）


## 欠账登记（按计划 §四 的规则）
| 欠什么 | 补在哪天 |
|---|---|
| （没欠账就写"无"） | |

## 明天第一件事（9/20，Day 8）
1. 先把今天的欠账清掉
2. **Day 7 后半**：微任务 vs 宏任务、`Promise.all` 家族、ESM vs CJS 对比
3. 然后才是 Day 8 原本的内容：**TypeScript 入门 + 周复盘 + 周自测**
   ⚠️ **周复盘是测速点**：会重新算账，累计欠账每满 1 天就按规则顺延结束日

## 代码 / 命令备忘
```powershell
# 今天的四条核心命令
node --check week1-language/day06-prototype.js      # 先过语法
node week1-language/day06-array-utils-verify.js     # 目标 17/17
node week1-language/day07-promise.js                # 三种写法对照

cd week1-language/p0-toolkit
pnpm test                                          # 目标全绿

# 收尾
git add -A
git commit -m "day07: clear day06 debt, add array polyfills, first promises"
git push
git status -sb   # 没有 ahead 就同步好了
```

## 14:20 检查点
如果 Day 6 欠账还没清完，**今天就只清欠账**、Day 7 的内容整段顺延。
**这不是失败，这就是"选 A"的走法** —— 内容不丢，日期承担。
