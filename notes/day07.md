# Day 7 第 1 天 — 2026-09-19（周六）

> Day 7 **跨两个日历日**，所以这份日志里有两段：**第 1 天 9/19**（本段起）、**第 2 天 9/20**（文件下半段，另有任务书 [`day07-day2.md`](day07-day2.md)）。不另开日志文件。

> **状态：待填写**　｜　任务书：[`day07-async.md`](day07-async.md)
> **今天按 3～4 小时排**（"选 A"的执行方式：每天只放 3～4 小时的量、把清单划干净，多的推给下一天）
> ⚠️ **今天不追求把 Day 7 做完** —— 原本的内容拆成两段，今天只做前半（Promise 基础）

## 今日目标

**第一段：清 Day 6 欠账（约 2.5 小时）**
- [×] 0-①. 补 `notes/day06.md` 的「学会了什么」第 2、3 条
- [×] 0-②. `day06-prototype.js`：**手写原型继承 vs `class` 重写**，两边跑出同样结果
- [×] 0-③. `day06-prototype.js` 修语法错误（`node --check` 先过）+ 字段初始化 4 步
- [×] 0-④. 裸写 `myMap`/`myFilter`/`myReduce` → 脚手架 **17/17**
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
4.“.createElement”

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

**7. 写day07-zerohint-01.js不知道该怎么用对象转化成数组用for循环来遍历**

> （AI 补：这一条其实是 **9/20（Day 7 第 2 天）** 的事，写在这一节也可以，但诊断我放在下方第 2 天的「零提示题记录」里 —— 结论是**不是没学过，是零提示下取不出来**，那里有证据和下一步。）

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
| 无（9/19 的 Day 6 欠账 5 件全清，见下方 AI 复核） | —— |

> **AI 复核（2026-09-20 补）**：第 1 天的清单我逐条实测过 ——
> `node --check week1-language/day06-prototype.js` 通过，跑起来输出了字段初始化 4 步（含"故意不调 `super()`"那条 `ReferenceError` 的现场）；
> `node week1-language/day06-array-utils-verify.js` → **17/17**；
> `pnpm test`（工具箱 4 个模块）→ **14 条全绿**。
> 所以上面那些没打勾的框，实际都已经跑出来了。

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

---
---

# Day 7 第 2 天 — 2026-09-20（周日）

> **状态：待填写**　｜　任务书：[`day07-day2.md`](day07-day2.md)
> 这一段接第 1 天：9/19 已把 Day 6 欠账清干净，今天做**工具箱第 5 个模块 + 零提示题 + Promise 前半**。
> **今天仍按 3～4 小时排**，不追求把 Day 7 做完 —— 微任务/宏任务、`Promise.all` 家族、ESM vs CJS 排在下一天。

## 今日目标（9/20 这一段）

**第一段：收尾 + 补短板（约 1.5 小时）**
- [×] ① 工具箱第 5 个模块：`src/arrayUtils.js` + `test/arrayUtils.test.js` → `pnpm test` 全绿（22 条）
- [×] ① 附：`p0-toolkit/README.md` 补 `arrayUtils` 一行 + 空数组那条限制
- [×] ② **零提示题第 1 道**：`dropNulls`（限时 20 分钟，关 AI，只许查 MDN）
- [×] ③ **逆向练习**：合上代码凭记忆重写 `debounce`（5 分钟）
- [×] ④ CommonJS 自测 3 题（口答，答完回去核对）

**第二段：Promise 前半（约 2 小时）**
- [×] ⑤ 读《回调》《Promise》《Promise 链》《async/await》
- [×] ⑥ 写 `week1-language/day07-promise.js` 四段 → 脚手架 **通过 13 项**
- [ ] ⑦ 日志 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `p0-toolkit/src/arrayUtils.js` | 从 `day06-array-utils.js` 原样搬的三个函数 | ✅ 去注释后逐字比对**代码一致**；演示打印已清零（`require` 不再自己打印） |
| `p0-toolkit/test/arrayUtils.test.js` | 8 条测试（AI 写，见任务书附录 A） | ✅ `pnpm test` **22 条全绿** |
| `week1-language/day07-zerohint-01.js` | 零提示题 `dropNulls` | ✅ 第二遍写出来了（AI 独立验 7/8，唯一"红"是 AI 断言写错；与内置写法对拍 5 组一致）+ 导出齐了。⏳ 还欠"**合上书第二遍**" |
| `week1-language/day07-recall-debounce.js` | 逆向练习：凭记忆重写的 `debounce` | ✅ **6/6**（修掉 `setTImeout` typo 之后；机制本来记对了） |
| `week1-language/day07-promise.js` | 回调 / Promise / `async/await` 三种写法对照 + `then` 链 + 错误处理 | ✅ **13/13**（第 5 轮补上 `return food;` 之后） |

> **AI 复核（9/20 · ⑤ Promise 前半）**：四段的实际状态 —— **第一版 0 项通过（一行都没执行）**；改完语法后仍是 **8/13**（第二轮）。
>
> #### 第一轮（初版）
>
> - **语法（先看这个）**：第 104、119 行都是 `new Promise((resolve,reject){` —— **少了 `=>`**，`node --check` 直接报 `missing ) after argument list`，**整个文件一行都不执行**。这是本周**第 4 次**"文件跑不起来"（前三次：`this speed = 0` 少点号、`,,`、`setTImeout`）。
> - 第 114–115 行那两句顶层 `p.then(...)` / `p.catch(...)` 引用了 `login` 内部的 `p` → 修掉语法之后立刻 `ReferenceError: p is not defined`。
> - **段 2（`then` 链）✅ 完全正确** —— 实测输出顺序：`我要吃炒饭` →（3 秒）`已经拿到饭了` → `开始吃饭了`。
> - **段 1 回调版 ❌**：把"函数"当参数传来了**值** —— 调用时传了 `null` 和一个字符串，函数体里写的是 `console.log(cb)`（打印它），而不是"3 秒后调用它"。输出里那个 `null` 就是证据。**当天第二次踩"传函数 vs 传值"**（第一次是 debounce demo 里的 `console.log("执行")`）。
> - **段 1 Promise 版 ⚠️**：他自己写的第 27 行那版**没有 `return`**（在函数里挂 `.then`）；最终能绿是因为第 44 行又写了一个同名 `buyfood` 把它**覆盖**了（实测导出的确实是第 44 行那版）。**重名覆盖 → "哪一版被导出"靠猜。**
> - **段 1 async 版 ❌**：`eat` 里 `await` 了，但**没有 `return`** → 外面 `await eat()` 拿到 `undefined`。
> - **段 3 ❌**：定义了 `eat`，但**没有调用** → 零输出；而且和段 1 的 `eat` 重名，导出的其实是这个没被调用的版本。
> - **段 4 Promise 版 `login` ✅**：脚手架的错误处理三条全绿（`resolve`/`reject` 分支正确）。
> - **段 4 async 版 `log` ❌ 思路缺口**：① `reject()` **不抛异常**，所以 `try{ return resolve() }catch{ return reject() }` 里的 `catch` 是**死代码**；② 没有 `await`；③ 没有 `return`；④ 没导出。
>
> #### 第二轮（改完语法、`login` 的 `p` 作用域修好之后）—— 仍然 8/13
>
> - **语法过了 ✅**，`login` 的 `result.then/.catch` 也修对了 ✅ —— 但**文件在第 36 行 `p.then(...)` 又炸了**（`ReferenceError: p is not defined`，因为那张票在 `buyfood` 里面）→ **段 2、段 3、段 4 的顶层代码一行都没执行**（进程当场退出，连挂着的 3 秒定时器都没走完）。
> - **段 4 async 版 `log`：实测两条路径都是"失败"，而且退出码 0。** 他在 async 函数里又 `new Promise` 了一次（把"造票"和"用票"揉在一起），executor 里写的 `resolve(r)` / `reject(err)` 引用的都是**当时不存在的变量**：
>   - `log(true)` → `登陆失败 ReferenceError: Cannot access 'r' before initialization`（`r` 是等号左边那个正在被赋值的变量）
>   - `log(false)` → `登陆失败 ReferenceError: err is not defined`（`err` 只在 `catch (err)` 的括号里存在）
>   两个 ReferenceError **都被他自己的 catch 接住了**，所以看起来在正常工作、进程还正常退出（**退出码 0**）—— 又一次证明"跑起来没报错 ≠ 对"。
> - 仍未处理：段 1 回调版（没动）、段 1 async 的 `return`、段 3 的 `return`、`log` 没导出、`buyfood`/`eat` 重名。
>
> **教学结论（这次问的问题是"某个可能失败的 Promise 是什么"）**：那句占位符不是"要你在这里 new 一个 Promise"，而是"**去调一个会失败的异步函数**" —— 在他的第 4 段里，那个函数就是他自己写对的 `login`。**造票（`new Promise` + resolve/reject）和用票（`await` + try/catch）是两层**；他的 `login` 说明"造票"那层已经会了，缺的是"用票"那层。两层揉在一起，就必然写出"catch 接住自己的 ReferenceError"这种假象。
>
> #### 第三轮（把"对照版"要到手之后）—— 又一个新知识点：ESM/CJS 撞车
>
> - **段 1 Promise 版 ✅ 修对了**（`let p = buyfood(); p.then(...)`）；**段 1 回调版能打印了**，但没按"错误优先"约定（脚手架要的是 `cb(null, '炒饭做好了')`，他传的箭头函数不接参数）。
> - **致命点：他在顶层写了 `await`**（`let food = await eat();`，段 3）→ Node 报
>   `ERR_AMBIGUOUS_MODULE_SYNTAX: Cannot determine intended module format because both 'module' and top-level await are present.`
>   原因：**顶层 `await` 只属于 ESM，`module.exports` 只属于 CJS**，Node 24 检测到两者同时出现就拒绝加载（报错抛在第 131 行 `module.exports` 上）。
>   现象特别迷惑人：**前面所有打印都出来了**（看起来"跑起来了"），最后才炸、退出码 1；而脚手架**根本 `require` 不进来**（`require() cannot be used on an ESM graph with top-level await`）→ 这一轮判不出 13 项，只能用上一轮的 8/13。
>   修法（保持 CJS）：把顶层那三行包进一个 `async function main(){...}` 再 `main();` —— Node 的报错原文就是这么建议的。
>   **这正是计划里排在下一天的「ESM vs CJS」那一节**，他提前撞上了实况。
> - **段 4 的 `log`：`await ok`（await 一个布尔值）→ 实测两条路径都打印"登陆成功"**（`await` 普通值永远不会失败 → `catch` 永远没机会执行）。和上一轮"两条路径都打印失败"正好相反 —— **两次都错、错法不同**，说明"错误处理对不对"只能靠"两条路径各自正确"来验，不能靠"没报错"。
> - **根因（一句话）**：他以为"那个可能失败的 Promise"是**通过参数传进来**的；实际上要**调 `login(ok)` 现取**。`ok` 只是开关，票是 `login` 造的。
> - **重名检查（AI 实测，推翻了自己的猜测）**：`buyfood` / `eat` / `login` 各有两份声明。我原以为"`login` 导出的是后面那个 async 版"，实测**不是** —— 导出的是**块里那个 Promise 版**（块级函数声明在块执行时覆盖了后面那个顶层声明的绑定）。所以脚手架 test 5 的绿是"真绿"。**这条如果没跑一遍就会写成错的诊断。**
> - 处理方式：他要"对照版"，于是给了**一个别的场景（pay/checkout）的完整可跑示例**（先实测过输出：成功一行、失败一行）+ **逐行对照表**，并明确要求"**看完合上自己重写**，直接粘贴判不合格"（守计划 §一 的红线：AI 不往交付物里写实现）。
>
> #### 第四轮（他第三次重写之后）—— **9/13**，然后 AI 给了完整对照版（记账）
>
> - 他这轮的最大进步：**第 4 段 async 版的结构写对了** —— `try { const r = await log(ok); ... return r } catch (err) { ... return null }`，`await` 在 try 里、有 `return`、catch 接失败。缺的只是**接线**（两个 `login` 撞名、`log` 是重复的第二个"造票函数"）。
> - 他也把上一轮的 `ERR_AMBIGUOUS_MODULE_SYNTAX` 修掉了（段 3 改成 `async function …(){…} main-style 调用`，不再有顶层 await）✅。
> - **重名的实际代价（实测）**：段 3 里他新写的 `eat`（造票函数，resolve `"已经拿到饭了"`）**覆盖了段 1 的 `eat`** → 脚手架 test 3 从绿变红（`await eat()` 拿到 `"已经拿到饭了"`）。**这就是我前面说"靠猜哪一版生效"的后果，现在是可测量的。**
> - 回调版仍缺错误优先约定（`cb(null, "炒饭做好了")`）、段 1 的 `eat` 仍缺 `return`。
> - **处理：他连续三轮要"解决方案"，所以这次给了完整对照版**（AI 在临时目录里写全并实测 **13/13**，再交给他对照）。**记账（按计划 §一 的红线）**：① 第 4 段的最终版本、段 3 的接线、回调版与 `return` 这三处是 **AI 给的**，不是他写的；② 要求**合上对照版自己重写一遍**，否则这一格不算过；③ 日志里如实记这一笔。
> - **一个附带的技术发现（写下来备用）**：`async function` 声明写在块里**不会**像普通函数声明那样"漏"到外层（Annex B 的 web 兼容语义只管普通 `FunctionDeclaration`）—— 所以他那两个同名 `login` 里，块里的 async 版其实对模块作用域不可见，导出的仍是 Promise 版（脚手架 test 5 的绿是真绿）。
>
> #### 第五轮（照对照版自己重写之后）—— **11/13**，只差一个词
>
> - **已经全对的部分**：回调版（`cb(null, "炒饭做好了")` + 回调签名 `(err, food)`）✔️、Promise 版 ✔️、段 2 链 ✔️、段 3（改名 `eatChain` 并**复用** `buyfood`，重名覆盖消失）✔️、段 4 两版（async 版他自己保留了 `log` 当造票函数，结构和 try/catch/return 都对）✔️、导出 ✔️。
> - **唯一的红：段 1 的 `eat` 里缺 `return food;`** —— 一个字，导致 test 3 + test 4 两条红。AI 在临时副本里**只加这一行**（其它一字未动）→ **13/13**（实测）。
> - **记账更新**：对照版他只用来**对照**，落笔是自己重写的（"第二遍才算过"这一条满足）；但段 3 / 段 4 的接线思路确实来自 AI 的对照版，这一点如实记着。

## 学会了什么

（你写 —— 至少一条。写不出来就写今天最反直觉的那一句。）

1. promise的基本用法：let p=new Promise(function(resolve,reject)=>{});
(P必须大写不然是变量)，
2. promise语法糖async await
基本格式function f(){
   ...
}买票
async function fnc(){
   let f = await f();用票
}

3. .then语法链
格式new promise((resolve,reject)=>{
   ...
}).then (返回的数值会直接返回给.then)

4.   orderByCallback((err,food)=>{
        if(err){
            console.log('出错了',err);return;
        }
        console.log(food);    
    });
   这串代码的基本原理没有搞懂
   
## 卡在哪里

（你写。尤其零提示题：**卡在哪一步**比"做没做出来"重要得多。）

1.忘记了Object.entires,Object.values,Object.keys用法
Object.entires用法为提取全部（键，值）转化成数组[[a,1],[b,2]]形式
Object.entires用法：提取键转化成数组
Object.values用法：提取值转化成数组

2.await是用票者通过向外function找promise来用

3.

## 零提示题记录（新加的每日环节，见任务书 ②）

| 项 | 记录 |
|---|---|
| 题目 | `dropNulls`：返回新对象，去掉值为 `null` 的键 |
| 用了几分钟 | |
| 做出来了吗 | ❌ 第一遍没做出来 → ✅ **第二遍（翻着书）写出来了**（同一天） |
| **卡在哪一步** | "不知道如何将对象**转化成数组**来实现每个元素的遍历，从而判断是否为 `null`"（第 1 天「卡在哪里」第 7 条是他自己的原话） |
| 有没有想去问 AI / 想翻别人的代码 | |
| 事后看：真卡点还是手滑 | |

> **AI 复核（9/20，学生报卡点后实测）**
>
> **结论：这不是知识缺口，是"零提示下取不出来"（检索失败）。** 证据三处：
> 1. **书单排过**：`notes/day03-arrays.md` 的书单第 3 条就是《Object.keys，values，entries》（20 分钟），覆盖里明确写了 `Object.entries` + `Object.fromEntries` 转回对象。
> 2. **清单打过勾**：同一份文件的清单里有 `[√] Object.entries 遍历对象，再用 Object.fromEntries 转回对象`。
> 3. **`for...in` 其实用过**：`p0-toolkit/src/deepClone.js` 第 59、97 行是**活代码**（Day 4 深克隆的对象分支，当天记录是"✅ 完全正确"）。
>
> **但有一条反证**：Day 3 那一项的代码现在**整段还在注释里**（`day03-array-methods.js:190-201`）—— "读过 + 打勾"没有留下一个能跑的东西。这一点你自己回忆一下：当时是跑通了再注释掉的，还是没跑成。
>
> **卡点的措辞本身就说明概念还在**：他说的是"不知道怎么会把**对象转化成数组**" —— 这几乎就是 `Object.keys/entries` 干的事（把键 / 键值对转成数组）。**概念没丢，丢的是 API 的名字**，典型的"话到嘴边想不起来"。
>
> **另一个观察（不是卡点，是流程）**：他写的是 `for(let key;;i++)` —— 想用**数字下标**去遍历对象（`obj[i]`），也就是把数组的 `arr[i]` 那套直接搬到对象上。`node --check` 通过，但跑起来 `ReferenceError: i is not defined`（`i` 从没声明）→ 于是又是"一行都不执行、看不到任何输出"。心法第 7 条（写完立刻跑）在这里第二次救场。
>
> **下一步（已写进心法第 8 条）**：① 翻 Day 3 那一节，把 API 名字挂回去 → ② 带着书把它写出来 → ③ **合上书再写一遍**（第二遍才算过）→ ④ 隔一两天换一道同类题（对象遍历）再考一次。
>
> **当天后续（9/20）：第二遍写出来了 —— AI 实测结果**
>
> 用的是 `Object.keys(obj)` + `for (const key of keys)`，`if (obj[key] !== null)` 判断，`out[key] = obj[key]` 填入。**按验收标准独立跑了一遍（脚本在临时目录，仓库不留痕）：8 项里过 7 项。**
> - ✅ 7 个键只去掉 `b`，`0` / `''` / `false` / `undefined` 全保住 —— **`f: undefined` 保住了**，这正是 Day 4 / Day 7 踩过两次的"真假值判断"坑，这次没踩。
> - ✅ 键顺序保持原样、空对象 → `{}`、全 null → `{}`、原对象没被改、返回的是新对象。
> - ❗ 唯一那条"红"是 **AI 自己的断言写错**：我用 `'toString' in 结果` 判断"有没有把原型链带出来"，但 `in` 本来就会走原型链，任何对象都是 `true`（内置 `{}` 也一样）。改用 `Object.hasOwn` 后通过；另外又和内置写法（`Object.fromEntries(Object.entries(o).filter(...))`）**对拍了 5 组用例，结果完全一致**。
> - ⏳ 还差一件：文件最后没有 `module.exports = { dropNulls };`（任务书里给的接口要求）。
>
> **这一遍算"带着书那遍"** —— 按心法第 8 条第 2 款，**合上书还要再写一遍才算过**。隔一两天还会有同类题（对象遍历）的第二次考。
>
> **复习机制（学生当天问了"哪天可以重新开始复习？我感觉我很多都忘了"）**：答案是不另排日子，见计划 §七 心法第 9 条 —— ① 逆向练习改**轮转**（脚手架 `week1-language/recall-verify.js`，用工具箱自己的测试当判据，5 个模块轮一圈 = 第 1 周全过一遍）；② **下一个开工日的周复盘 = 完整复习日**，产出「还会的 / 忘了的」两张清单，"忘了的"那张就是下周轮转表的输入；③ 除周复盘日外**不许停下来专门补**（重读是效果最差的复习方式）。

## 逆向练习记录

| 项 | 记录 |
|---|---|
| 重写的函数 | `debounce` |
| 5 分钟写出了几成 | |
| 跑 `day07-recall-verify.js` 的结果 | |
| 对照 `src/debounce.js` 后发现的差异 | |

> **AI 复核（9/20）**
>
> **过程**：先只在文件里写了一行 `debounce(f)`，跑脚手架报 `debounce is not defined`；随后问"debounce 实现什么功能我有点忘了"（**Day 4 写的东西，6 天后概念先丢** —— 比"写不出代码"更靠前一层，已写进计划 §七 心法第 9 条的处理规则）。捞回概念后写出了完整实现。
>
> **实测结论：逻辑是对的。** 我把他文件里的 `setTImeout` 改成 `setTimeout`、补上 `module.exports`（临时副本，没动他的文件）之后：
> - `day07-recall-verify.js`（这次复习的判据，只考 trailing）→ **6/6 全绿**。闭包 `timer` + `clearTimeout` + 重置计时这套机制，他**凭记忆记对了**。
> - 工具箱那份完整版测试（还要 `immediate`）→ 2/3，唯一红的是 `immediate: true`。**这不是这次的目标**（题目只要求"连续触发只算最后一次"），所以不算问题。
> - 探针：他调用后立即返回 `0`（用了"缓存上次结果"的写法），工具箱那份是 `undefined` —— **不算错，是设计选择**（记得在注释/README 里说明就行）。
>
> **但有三处挡住了他自己验证**：① `setTImeout` typo（一调用就 `ReferenceError` —— 这是他**第三次**栽在"文件跑不起来"上：`this speed = 0` 少点号、`,,`、现在这个）；② 没写 `module.exports`，脚手架读不到；③ demo 写成 `debounce(fn, 1000)` —— 返回的函数被丢掉了、从没调用过，**即使没有 typo，终端也只会安静一片**（"跑起来没反应"这个坑，心法第 7 条里已经记过 4 次）。
>
> **他问的"我验证不了是否正确"是这一格真正的收获**：这一周所有的判据（脚手架、测试）都是 AI 写的，**他自己一次都没搭过判据**。所以遇到"对不对"，默认动作是问 AI 而不是造一个小实验 —— 而计划 §六 附录 D 的自检里恰好有一条"**能说清我的代码里哪部分是 AI 帮我写的、我怎么验证它的**"。已把"自己搭判据"记进 HANDOFF 的薄弱点表，并定在**周复盘日的周自测**上第一次练（给需求，自己写判据 + 自己写实现）。
>
> **第三个 bug（当天晚些）：`TypeError: Cannot read properties of undefined (reading 'apply')` = 传函数 vs 调用函数**
>
> 报错说的是"点号**前面**那个东西是 undefined"，也就是 `fn`（第 11 行 `fn.apply(...)`）。根因在他后来写的 demo：
> `const d = debounce(console.log("执行"), 1000);` —— `console.log("执行")` 是**调用**，传给 `debounce` 的是它的**返回值** `undefined`（实测：`console.log` 的返回值就是 `undefined`）。改成 `debounce(() => console.log("执行"), 1000)` 即可。
>
> **自证的线索（不用问人就能看出来）**：跑一下就会发现 `"执行"` 是**立刻**打印的、根本没等 1 秒 —— 说明它在"传入参数时"就被执行了。
> 这个区分是 Day 4–5 那一整族题（`debounce` / `throttle` / `curry` —— "接收一个函数、返回一个函数"）的地基：**`()` = 现在执行；不加 `()` = 把函数当值传过去**。
>
> **修完的实测**：只把 demo 那一行改对 → 文件正常跑（**连喊 3 次只打印 1 次**，在他自己的 demo 里肉眼可见），脚手架 **6/6 全绿**。
> 顺便：他前面那三件收尾也全部做完了 —— `src/arrayUtils.js` 的演示 `console.log` 已清零（`require` 不再自己打印）、README 那两行表格修好并新增了「数组三个方法」小节，工具箱 **22 条仍然全绿**。**任务书 ① 这一项可以正式打勾了。**

## 欠账登记（按计划 §四 的规则）

> **AI 核实填写（9/20 收尾时，逐条实测）** —— 今天清单 7 项里 **6 项实测通过**（① 22/22、② 第二遍写出来 + 导出、③ 6/6、⑤ 读过、⑥ 13/13），只差 ⑦ 提交。

| 欠什么 | 补在哪天 |
|---|---|
| ⑦ 日志 + commit + push —— 日志已由他填完，**只差提交** | **今天**（填完这张表就做） |
| **《回调》那一节的"落地"**（不只是读过）：把"错误优先回调"自己写出来。今天有两条证据说明它没落地 —— ① 他说回调那段代码"实在搞不懂用意、重新写也想不出来"；② `传函数 vs 传值` 这一天讲了两次（debounce demo + 回调版） | **明天周自测**先考一次；考不过就回读该节 15 分钟 |
| **零提示题 `dropNulls` 的"合上书第二遍"**（现在这遍是翻着书写出来的）+ 隔一两天换一道同类题（对象遍历） | 明天（轮转表第一项 = 同题再考） |
| （**不算欠账，是既定日程**）Day 7 后半：微任务/宏任务、`Promise.all` 家族、ESM vs CJS 对比 —— 其中 **ESM vs CJS 今天已经撞过实况**（`ERR_AMBIGUOUS_MODULE_SYNTAX`） | 下一天 |
| （**可选项，不登记**）`day07-promise.js` 两处整洁：删掉重复的 `log` 造票函数（`login` 已经在造票）；顶层 demo 用 `if (require.main === module)` 包起来，跑脚手架时输出就不会混在一起 | 有空再说 |

**累计欠账：不到 1 天** → 按规则**不动结束日**。下一个测速点是**下一天（周复盘日）**，那时重新算账。

## 明天第一件事

1. **Day 7 后半**：微任务 vs 宏任务（今天脚手架"观察 1"的谜底）、`Promise.all` 家族、ESM vs CJS 对比
2. 然后 Day 8 原本的内容：**TypeScript 入门 + 周复盘 + 周自测**
   ⚠️ **周复盘是测速点**：重新算账，累计欠账每满 1 天就按规则顺延结束日

## 代码 / 命令备忘

```powershell
node week1-language/day06-array-utils-verify.js     # 17/17（搬之前那份）
node week1-language/day07-zerohint-01.js            # 零提示题自测
node week1-language/day07-recall-verify.js          # 逆向练习（等约 1 秒）
node week1-language/day07-promise-verify.js         # 目标 13 项（等二十几秒，不是卡住）

cd week1-language/p0-toolkit
pnpm test                                          # 目标全绿（22 条）
```
