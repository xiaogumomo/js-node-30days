# Day 8 — 2026-09-21（周一）

> **状态：待填写**　｜　任务书：[`day08-review.md`](day08-review.md)
> **今天被课切成三段**（9:00–11:50、13:30–16:50 上课）→ 课间读、放学做，主块 16:50 起
> **今天是周复盘日 = 测速点**：要重新算账 + 产出「还会的 / 忘了的」两张清单 —— **这两项不许省**

## 今日目标

**A 段（课间，不用电脑，约 50 分钟）**
- [×] 读《微任务（Microtask）》
- [ ] 读《Promise API》—— **顺延**（③ 一起补）
- [ ] （可选）纸上默写 5 个函数的签名 + 作用 + 一个坑 —— 未做

**B 段（放学后 16:50–20:30）**
- [×] ① **周自测（关掉 AI）**：a 轮转 3 模块 + b 零提示题第 2 道（**自己写判据**）+ c 口述 4 题
- [×] ② 微任务 vs 宏任务：**先预测、再跑**
- [ ] ③ `Promise.all` 家族：四个方法 + 对比表 —— **顺延**（时间不够，按砍单顺序砍）
- [ ] ④ ESM vs CJS：只读机制，写 4 行笔记 —— **顺延**（同上）
- [×] ⑤ **周复盘 + 算账** → `notes/week1-review.md`（AI 起草初稿，见该文件的算账结论）
- [ ] ⑥ 日志 + commit + push —— **待他提交**

> **AI 收尾核对（9/22 补）**：这一天的实际情况 —— **① ② ⑤ 做了，③ ④ 顺延，⑥ 待提交**；
> 另外两件**他自己以为做了、实际没做**的：**`notes/day08.md` 的「学会了什么」还是空的**（那是他写的栏目，AI 不代填）；**三个 `recall-*.js` 都还没补 `module.exports`**，所以三个模块的实测仍是 `0/6`、`0/4`、`0/5`（不是"改完变绿"，是"还没开始改"）。
> 砍单顺序按任务书写的是 ④ → ③，他砍的正是这两项 ✔️。

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `week1-language/recall-curry.js` / `recall-deepClone.js` / `recall-throttle.js` | 轮转复习的凭记忆重写 | ⚠️ **写了但还没改**（缺 `module.exports`；实测 0/6、0/4、0/5）→ 顺延 |
| `week1-language/day08-zerohint-02.js` | 零提示题第 2 道 `countChars` | ✅ **四个用例全对**（补上"累加起点"之后） |
| `week1-language/day08-zerohint-02-verify.js` | **我自己写的判据** | ✅ **4/4**（修掉了引号语法 + 单字符期望值） |
| `week1-language/day08-event-loop.js` | 预测 vs 实测 | ✅ **预测顺序 100% 正确**（顺序本身是靠 AI 得到的，已如实记账） |
| `week1-language/day08-promise-api.js` | `all` / `allSettled` / `race` / `any` 对比 | ⬜ **顺延** |
| `notes/week1-review.md` | 两张清单 + 算账表 | ✅ AI 起草 + 结论；「忘了的」22 条（他核对后可再改） |

---

## 周自测原始记录（今天最重要的一格，别精简）

### a. 轮转复习（凭记忆写，写完再跑脚手架）

> **AI 核实（9/21）**：三份文件都写了，而且**每份里都标了自己"忘了的地方"** —— 这个习惯很好，下面就是照那些标注 + 实测结果整理的。
> 测法：给他写的那三份补上 `module.exports`（临时副本，没动他的文件），再拿工具箱的测试判。

| 模块 | 实测 | **忘了什么**（据他的注释 + 实测代码） |
|---|---|---|
| `curry` | ❌ **2/6** | ① **收的东西记错了**：`curry(fn)` 收的是**要柯里化的函数**，他写成了 `arr`（数组），于是整题变成了"数组怎么拆" ② **参数要累积**（上次收的 + 这次收的合起来）—— 这一层完全没写出来 ③ 收够时要调用**那个函数**：`fn.apply(this, adj)`（他写的是 `arr.apply`） ④ 内层返回的函数**忘了 `return`**。<br>✅ 记住的部分：**骨架对了** —— "收够 → 调用；不够 → 返回一个新函数继续收"。 |
| `deepClone` | ❌ **1/4** | ① **类型判断的写法**："原始类型直接返回"的意图在，但写成了 `x !== 'object'`（跟**字符串**比），正确是 `typeof x !== 'object'` ② **数组分支要把递归结果接住**：他写了 `x.map(item => deepClone(item))` 但没 `return`，而且最后返回的是 `{}` → 数组会被克隆成对象 ③ **`for...in` 与 `for...of` 的区别**（他自己标了这条）：`for...in` 拿**键名**，`for...of` 拿**值**（可迭代对象） ④ `null` 漏了（`for...in null` 不报错、静默返回 `{}`）。<br>✅ 记住的部分：**递归的意图**在、**用 `for...in` 遍历对象的意图**在。 |
| `throttle` | ❌ **0/5** | ① 返回的那个函数**多收了一个 `fn` 参数** → 把外层的 `fn` **遮蔽**掉了（于是"调用原函数"这一步必然失败）② 时间到了之后要**调用**并把参数传下去（`fn.apply(this, args)`）—— 他写了单独一行的 `fn;`，什么都不会发生。<br>✅ 记住的部分：**路线 A 的时间戳比较完全正确**（`Date.now()` 比较 + `last = now` 更新），这是 throttle 的核心思路。 |

> **⚠️ 顺带查出一个更值得记的问题（AI 发现的）**：`p0-toolkit/test/throttle.test.js` **从 Day 6 起整份被注释掉了** —— `node --test` 会把"没有测试的文件"也算成 1 条通过，所以 `pnpm test` 一直显示全绿，**而 throttle 其实一条测试都没有**；我前面几轮引用的"22 条"里就有这条**幽灵测试**，我的复习脚手架也因此给过 throttle 一个**假绿（1/1）**。
> 已处理：① 把测试文件恢复（5 条，含他自己补的那条），在真实实现上实测 **5/5 通过** → 工具箱现在是 **26 条真测试**；② 给复习脚手架加了**防假绿守卫**（判据文件里 0 条 `test()` 就直接报"这个绿不算数"，退出码 1）。
> **要自己回忆一下**：当时是跑通了再注释掉的，还是因为它红了才注释掉的？（后者是个危险习惯：靠注释掉让测试变绿。）

### b. 零提示题第 2 道：`countChars`

| 项 | 记录 |
|---|---|
| 用了几分钟 | 限时内没做完 |
| 做出来了吗 | ❌ 没通过 —— **但离通过只差"一个分支"**（见下） |
| **判据（`...-verify.js`）是我自己写的吗** | ✅ 自己写了，而且用的是 `node:test`（比任务书要求的还正规）。**问题不在"没写"，在"断言是假的"** |
| **卡在哪一步**（他自己的原话） | ① **"不知道怎么将重复的对象累加"** ② **"不知道如何正确测试，没有好好读过 AI 写的测试"** |
| 有没有想过去问 AI | |

> **AI 核实（9/21，逐项实测）**
>
> **他记的这两条卡点，都准确。**下面是实测出来的确切位置。
>
> **① 实现：循环对、只缺"第一次出现"那个分支。**
> 写对的部分 ✔️：`for...of` 遍历字符串（**这正是昨天 `dropNulls` 卡住的知识点，今天自己写出来了**）、返回新对象、`module.exports` 也加了。
> 第 7 行 `result[key] =+result[key]+1;` —— 三种写法实测对比：
>
> | 写法 | `countChars('aab')` |
> |---|---|
> | 他写的（`=+`） | `{ a: NaN, b: NaN }`（JSON 里显示成 `null`） |
> | **只把 `=+` 改成 `+=`** | **`{ a: NaN, b: NaN }` —— 还是 NaN**（`undefined + 1` 仍是 `NaN`） |
> | 补上起点：`(r[k] ?? 0) + 1` | `{ a: 2, b: 1 }` ✔️ |
>
> **所以缺的不是运算符，是"累加的起点"：第一次遇到一个字符时，旧值是 `undefined`，得先给它一个 0。**
> 这就是他自己那句话"不知道怎么将重复的对象累加"的确切含义 —— 而且**他早就用过这一招**：`myReduce` 里就是"取出旧值（`acc`）→ 算出新值 → 写回去"，Day 6 他还卡过同一个点（当时的记录："累加在两处合作 —— 回调算新值、`myReduce` 把返回值接回来"）。**对象版只是把 `acc` 换成了 `obj[key]`。**
>
> **② 判据：两个问题，第二个是今天最值钱的发现。**
> 1. 第 13 行 `funciton` 拼错 → `SyntaxError` → 整个判据文件一行不执行。**本周第 5 次"文件跑不起来"**（前四次：`this speed = 0` 少点号、`,,`、`setTImeout`、`new Promise(...){` 缺 `=>`）。
> 2. **`assert(result, {a:2,b:1})` 是假断言**：`assert(value, message)` 只检查 **value 是不是真值**，第二个参数是**报错时打印的文本**，不是期望值 → **它永远通过**。把拼写改对之后实测 **2/2 全绿**，而实现输出的是 `{a: NaN, b: NaN}`。
>    正确写法 `assert.deepEqual(result, {a:2, b:1})`（这条用法他在 `test/throttle.test.js` 头部**亲手抄过**）。换成 `deepEqual` 后（其它一字不动）**立刻变红**，报错直接印出 `+ actual: { a: NaN, b: NaN }` —— **看到这一行 3 秒就能改对**。
>    **所以"限时内没完成"的直接原因不是不会写，是判据没告诉他哪里错。**
> **用例只写了 2/4**：题目要求 `'aba'` / `'aaa'` / `''` / "只出现一次的字符值是 1"。缺的空串和单字符恰好最容易暴露 `NaN`。
>
> **③ 结论："绿"有三种假法**>
> | 假法 | 例子 | 症状 |
> |---|---|---|
> | **空判据** | `test/throttle.test.js` 整份被注释 | 0 条测试也算 1 条通过 |
> | **假断言** | `assert(result, {...})` | 实现全错也绿 |
> | **判据抄实现** | 9/20 把脚手架当测试文件 | 8 组压成 1 条，红了也不知道哪组 |
>
> **判据的价值全在"它能红"。** 以后写完判据：**先故意让它红一次**（把实现改坏一个字符），确认它抓得住，再信它的绿 —— 这条要写进心法。
>
> **第二次修改后（同日）**：**实现已经全对了 ✔️** —— 四个用例实测 `aba→{a:2,b:1}` / `aaa→{a:3}` / `''→{}` / `'a'→{a:1}` 全部符合验收标准。
> 他的写法是"先补起点、再 +1"两行（`if (result[key]==undefined) result[key]=(result[key]??0); result[key]+=1;`）—— 对的；顺带一个观察：`(result[key]??0)` 在那个分支里永远是 `0`（因为已经确认是 `undefined`），所以那句 `??0` 是空转，可以简化成一行 `result[key] = (result[key] ?? 0) + 1;`。**两种都对**，写哪种都行。
> **判据还差 3 处**（文件因此跑不起来）：
> 1. 第 19、25 行：测试名里**直接写了 `"`**（`test("测试""输出是否正确:"`）→ 语法错误。名字里别用引号即可（`test("测试空串输出是否正确:"`）。
> 2. 第 28 行：单字符用例的期望值写成了 `{}`，应该是 **`{a:1}`**。
> 修完实测：`node --test <判据文件>` → **`ℹ tests 4 / ℹ pass 4 / ℹ fail 0`**。
> **他问的两件事的答案**（"怎么输出 4/4"、"累计正确 4"）：**不用自己写汇总** —— `node:test` 自带；直接 `node <判据文件>` 或 `node --test <判据文件>` 都会打印 `ℹ pass 4`，退出码 0（有失败则非 0）。想要"通过 X 项"那种自定义一行，就得换成手写计数器的风格（`week1-language/day06-array-utils-verify.js` 顶部 8 行 + 结尾 `process.exit`）—— **两种都行，别混着写**。

### c. 口述 4 题（关 AI，讲出来或写下来）

| 题 | 讲得出来吗 | 卡在哪 / 补了哪一节 |
|---|---|---|
| 1. `this` 的四种绑定 + 箭头函数为什么例外 | ⚠️ **半对** | ✅ 对的："箭头函数没有自己的 this，向外寻找"；"看点号前面"这条规则也抓住了。❌ 要改 3 处：① **严格/非严格记不清**（实测：非严格下普通函数独立调用 = `globalThis`；严格模式才是 `undefined`）② **`arr.apply(this,arg)` 的 this 是括号里第一个参数**，不是点号前面的 `arr`（那是"被调的函数"）③ 说成"看所在的**对象作用域**" → 应该是"**看调用点**"（拆出来单独调用，this 就变了） |
| 2. 手写深克隆为什么处理不了循环引用 | ❌ 不会 | 要补：**循环引用是什么 → 为什么无限递归（栈溢出 `RangeError`）→ `structuredClone` 靠什么解决（"原对象 → 副本"的映射表）→ 手写版照修**。这个行为在 `p0-toolkit/README.md` 的「已知限制」表里就有现成一行 ✔️ |
| 3. 错误优先回调（`if (err) { ...; return; }`） | ❌ **讲错了** | 他把 `return` 理解成"**让函数有返回值**" —— 错。`return;` 在这里是"**提前打住**"：出错就处理掉并立刻退出，别让后面用坏数据的代码继续跑；它自己什么都不返回。（他提的"函数没有 return 时 `console.log(fn())` 是 undefined"这个观察**本身是对的**，但和这段代码要说明的事不是一回事。） |
| 4. 防抖和节流分别用在什么场景 | ❌ 不会 | 一句话区分：**防抖 = 等你不动了我再动**（搜索框输入联想、表单校验、resize 结束、按钮防连点）；**节流 = 你再急我也按我的节奏动**（滚动加载/滚动监听、鼠标轨迹、拖拽、给 API 限流） |

> **AI 核对（9/21，`this` 那几条是实测过的）**
>
> | 调用形式 | `this` 等于什么 |
> |---|---|
> | 普通函数独立调用 `f()` | **非严格（默认）：`globalThis`**；严格模式（`'use strict'`）：`undefined` |
> | 模块顶层（CJS） | `module.exports`（ESM 里是 `undefined`） |
> | 对象方法 `obj.m()` | **`obj`**（看点号前面） |
> | 把方法拆出来单独调用 | 回到第一行（非严格 `globalThis` / 严格 `undefined`）—— 这就是"this 丢了" |
> | `fn.call(x)` / `fn.apply(x, ...)` | **`x`（括号里第一个参数）** ← 他把这条记成了"点号前面的" |
> | `new F()` | 新建出来的那个实例 |
> | 箭头函数 | 没有自己的 this，取**定义位置**外层的 |
>
> **诊断更新（这条很重要）**：这 4 题里 2 题完全不会、1 题讲错、1 题半对 —— **说明"忘了的"不只是 API 细节，概念也讲不清**。
> 也就是说"**读懂（输入）**"和"**讲出来（输出）**"之间有一道断层：书读过、代码写过，但**用自己的话组织一遍**没做过。
> 这正是计划 §七 心法第 5 条那个"**讲解日**"要解决的事（第 2、4 周各挑一天，把当天学的东西讲给一个虚拟实习生听）—— 今天这 4 题就是它必要性的证据。这 4 条已进「忘了的」清单。

---

## 两张清单（周复盘的产物，也是**下周轮转表的输入**）

### 还会的

1.

### 忘了的

1.

---

## 学会了什么

1.微任务队列是在代码运行完之后才进行，timers队列则排在微任务队列之后，不管是.then还是await都还处在微任务队列中，原先的运行顺序不会变
2.for..in遍历的是对象的键（属性名），for...of遍历的是对象的值，for..in用对象的键但更推荐用Object.entires，Object.values,Object.keys。
3.promise的四个API，promise.all是全部promise遍历一遍，但一旦有一个reject直接会让这个promise.all会显示reject，其他resolve会被忽略
promise.allSetter也是全部promise遍历输出一遍（不论resolve还是reject）全部Setter后显示status:fulfilled或者rejected，
promise.race,等待第一个setter的就退出（谁快谁就输出谁）
promise.any只等待第一个resolve（fulfilled）的，并将其返回，全部都是reject会输出AggregateError一个错误对象。（备注：这里还不梳理，需要即可复习）
4.

## 卡在哪里

1.不知道怎么将重复的对象累加
2.不知道如何正确测试，没有好好读过ai写的测试

---

## ② 微任务 vs 宏任务：预测 vs 实测

| 顺序位置 | 我预测的是 | 实测的是 |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |
| 6 | | |
| 7 | | |
| 8 | | |

> **AI 核对（9/21，实测）**
>
> **✅ 他预测的顺序 100% 正确。** 他写的是 `1,5,4,8,3,7,2,6`；实测输出：
> `同步开始 → 5.同步结束 → 4.nextTick → 8.nextTick(第二个) → 3.promise.then → 7 promise.then(第二个) → 2 setTimeout 0 → 6 setTimeout 0 (第二个)`
> 一字不差。**但要注意：这个顺序是他靠 AI 得出的**（他主动说明了），所以**不算已掌握** —— 已进「忘了的」清单。
>
> **三个问题的核对：**
> 1. 「为什么 `nextTick` 比 `promise.then` 还早」→ 他的答案**基本正确**（"nextTick 队列非常早，在代码执行完之后、事件循环继续之前，比 setTimeout 和 promise 都快"）—— 但**同样是靠 AI 拿到的**，不算已掌握。
> 2. 「为什么两个 `setTimeout(...,0)` 中间没有插进 `promise.then`」→ ✅ **答对了**（"promise 已经在微任务队列里跑完了，最后跑的才是 setTimeout 的 timers 队列"）。这条可以说成"**微任务先于宏任务**"，就够了。
> 3. 「微任务队列什么时候被清空」→ ⚠️ 他说"不确定"，答的是"代码执行完毕后、栈清空后，微任务开始执行"。**这个说法在主脚本这一场景下是对的，但不够通用**：准确说法是"**每执行完一个宏任务（包括主脚本本身），就把微任务队列清空，然后才进下一个宏任务**"。
>
> **⚠️ 对照实验（`.then` → `await`）答错了**：他答"会改变，因为代码会因 await 暂停直到 promise 输出"。
> **实测：相对顺序完全不变。**
> ```
> A（用 .then）： A1 同步 → A5 同步结束 → A3 nextTick → A2 then 之后 → A4 setTimeout
> B（用 await）： B1 同步 → B5 同步结束 → B3 nextTick → B2 await 之后 → B4 setTimeout
> ```
> 他的**机制**理解是对的（`await` 后面的代码确实会"暂停、延后执行"），错在没意识到**延后到哪里**才算数：`await` 是 `.then` 的语法糖，延后到的**还是微任务队列**（同一个档位）→ 所以相对顺序不变。
>
> **📌 他明确要求记住的"不知道"（原话）：**
> 1. **不知道 `process.nextTick` 是什么，还有 nextTick 队列的概念**
> 2. **不知道 `setTimeout` 属于 timers 队列、是最慢的队列**（← 这条说法本身要纠正，见下）
> 3. **不知道"事件函数"是什么**
> 4. **"问题一和顺序是我靠 AI 解决的"**；**"第三个问题我不确定"**
>
> **⚠️ 这四条里有三条不是他的问题，是"排期把它排在了后面"**：`process.nextTick`、事件循环的阶段、各阶段队列 —— 这些属于 **Day 9「Node 架构与事件循环」**（计划里写的是"事件循环六个阶段、`process.nextTick` 优先级、libuv 线程池"），而 Day 7 的任务书就直接拿 `process.nextTick` 做预测题了。
> **处理**：保留这次"提前见一次"（间隔重复有好处），但 Day 9 正式讲时要**回到今天这个现场**；同时把这条记进书单缺口表（第 7 个缺口）。
> 另外"**setTimeout 是最慢的**"这个说法要改：宏任务之间没有统一的"最慢"，准确记两条 —— ① **微任务永远先于宏任务**；② **`setTimeout(fn, 0)` 不是"立刻"，而是"至少 0ms 后进 timers 阶段"，不能插进当前这轮**。
> （打印文案里的 `2setIimeout` 拼错了，无伤，下次顺手改。）

**三个问题（用我自己的话）：**
1. 为什么 `nextTick` 比 `promise.then` 还早？
2. 为什么两个 `setTimeout(..., 0)` 中间没有插进 `promise.then`？
3. 一句话：微任务队列在什么时候被清空？

**对照实验（把 `.then` 换成 `await`）结论：**

---

## ③ `Promise.all` 家族对比表（填**实测**结果）

| 方法 | 全部成功时拿到什么 | 有一个失败时会怎样 | 什么时候用它 |
|---|---|---|---|
| `Promise.all` | 返回所有 resolve 的**数组**，顺序和传入一致 ✔️ | 其他 Promise **继续执行**，但 `Promise.all` **立刻**以那个原因拒绝（他的原话）✔️ | **"缺一个就不做"**：全都必须成功才继续。· 项目 2 任务详情页：同时查"任务 + 标签 + 评论"三张表，少一个页面就残缺 · 项目 1：先把 10 个文件全部读进来再统一分类。他写的是"发布不同时间异步任务时，需要他们全部成功才能继续下一步"—— 方向对；**但这条是他问 AI 的，标注为不算掌握** |
| `Promise.allSettled` | `{status:'fulfilled', value:…}` 形式 ✔️ | 失败那项变成 `{status:'rejected', reason:…}` ✔️（**它本身不会拒绝**） | **"全都要，但允许部分失败"** —— 用它是为了**统计每个的成败**，不是为了"查找错误"。· **项目 2 的 `/health` 端点**（第 3 周就要写）：同时探"数据库 + Redis + LLM API"，要的是**每一个**的状态 · 项目 3：给 100 个文档批量生成 embedding，失败的挑出来重试。他写的"同时进行所有异步任务并查找其中错误" —— 把"**查找错误**"换成"**统计成败**"更准 |
| `Promise.race` | 返回**最快 settle** 的那个（resolve 或 error 都算）✔️ | 最先 settle 的若是失败 → race **也失败** ✔️（他写"不管有没有失败，只看执行的快慢"，准确） | **最主要的用法：给请求加超时**（`fetch` 自己没有超时）：`Promise.race([fetch(url), new Promise((_, rej) => setTimeout(() => rej('超时'), 3000))])` · 项目 3 每个 LLM 调用都要加超时 · 另一用法：多个镜像源，谁先响应就用谁。他填的是"不知道什么时候用它" → 答案就是**超时哨兵** |
| `Promise.any` | 只返回**第一个 fulfilled** 的 ✔️（中间那些失败忽略） | 一个失败不影响；**全部失败**才报错，原因是 `AggregateError` ✔️ | **"只要有一个成功就算成功"**：· 多个 LLM 服务商容灾（OpenAI / Claude / 本地），谁先成功用谁 · 多个镜像源下载同一个文件，A 挂了 B 成功就行。他填的是"不知道什么时候用它" → 答案是**容灾 / 多源** |

> **AI 补的"什么时候用"（9/22；`all` 和 `any` 他自己标注了是问 AI 的 → 进「忘了的」清单）**

| 需求的问法 | 用哪个 |
|---|---|
| "全都要成功，一个失败就整体失败" | `all` |
| "全都要，但要统计每个的成败" | `allSettled` |
| "给一个请求加超时" | `race` |
| "多个服务，只要有一个成功就行" | `any` |
| **`race` vs `any`（必问）** | **race 是"谁先 settle"（成功或失败都可能赢）；any 是"谁先成功"（失败的不算）** —— 口诀：**失败也得算数 → `race`；失败可以忽略 → `any`** |

> ⚠️ 实测细节、以及"哪几个实验其实没证明结论"写在下面 **Day 8 第 2 天的 ②** 那一节。

---

## ④ ESM vs CJS：4 行笔记

1.语法差异：导出上ESM采用多个export 导出 但只有一个export default默认导出
默认导出的命名可以随意改变运用。CJS中仅可以通过module.exports导出;导入上ESM通过import...from'./..'导入，CJS中通过const adj = require("./...");导入，区别是import分为静态import和动态import，静态只能写在模块顶部，动态import可以按需调用但返回值是promise，而CJS中require是函数，可以在任意位置随时调用；
重命名导入方式上ESM采用语法import a as x form './'而CJS采用const{a：x}=requir("./..");方式改；重命名导出中，ESM采用export a as x 而CJS采用module.exports.x = a;再导出方面，ESM 为 export {a} form './..'而CJS需要手动的require再exports；全部再导出ESM采用export * from './..'而CJS需要手动；动态导入，ESM则需要动态import而CJS则用require即可。
2.import（）返回的是promise，而require属于函数
3.CJS。 不会变
4.源文件中传出的版本过高

> **⚠️ 记账（他主动说明的原话）**："这些内容我还没有记住，只是笔记靠 ai 等等途径自己写写理解一下。"
> → **四条笔记一律按"AI 辅助写的、不算掌握"处理**，已进「忘了的」清单。正式实操在第 2 周（项目里会真的用 ESM）。
> **AI 核对（9/22）**
>
> **第 1 条（语法差异）—— 基本正确 ✔️，而且内容比他自己以为的多。**
> 写对的：ESM 多个 `export` + 一个 `export default`、默认导出导入时可任意命名、CJS 用 `module.exports` / `require`、**静态 `import` 只能写顶层而 `require` 可任意位置调用**、动态 `import()` 返回 Promise、重命名导入/导出、再导出（`export {a} from …` 与 `export * from …`）。
> **三处要修**：
> 1. **语法细节**：重命名导入是 `import { a as x } from './m.js'`（**要花括号**）；重命名导出是 `export { a as x }`（**也要花括号**）。他写的是 `import a as x` / `export a as x`。
> 2. "CJS 中**仅**可以通过 `module.exports` 导出" → **不精确**：`exports.x = 1` 也行（`exports` 就是 `module.exports` 的别名）；但 **`exports = {...}` 不行**（会把别名切断）—— **这正是他 Day 6 记过的那个坑**，这里正好接上。
> 3. 笔记里有个**全角冒号**（`{a：x}`）—— 中文输入法的字符，写代码时会直接报错，顺手留意。
>
> **第 2 条（`import()` 返回 Promise、`require` 是函数）—— ✅ 对**，这正是"动态 vs 同步"的分界。
>
> **第 3 条（`p0-toolkit` 现在用哪套？转 TS 之后变不变？）—— ✅ 答对了：CJS，不会变。**
> 而且这正是今天的实测结论：Node 24 的类型剥离让 `.ts` 文件继续走 CJS + `node --test`，**不需要为了 TS 改用 ESM，也不需要 Vitest**。
>
> **第 4 条（用一句话解释 `ERR_AMBIGUOUS_MODULE_SYNTAX`）—— ❌ 没答对**，他写的是"源文件中传出的版本过高"。
> **正确答案**：**同一个文件里既有 CJS 的 `module.exports`、又有只有 ESM 才支持的顶层 `await`** → Node **判断不出这个文件属于哪套模块系统**，于是拒绝加载（报错原文就是 "both 'module' and top-level await are present"）。
> **修法二选一**（Node 报错里也这么写）：① 当 CJS 用 → 把顶层 `await` 包进 `async` 函数里再调用；② 当 ESM 用 → 把 `module.exports` 改成 `export`。
> **为什么"顶层 await 只属于 ESM"**：CJS 的 `require` 是**同步**的（拿到就是结果，没有"等待"的余地）；ESM 的模块加载本身就是**异步**的（要先等依赖图就绪），所以它才允许顶层 await。

---

## ⑤ 周复盘：算账

| 项 | 天数 |
|---|---|
| 9/18 那次算的缺口 | 0.5 |
| 9/19–9/20 两个日历日消耗掉的内容 | 1.0 |
| 新增缺口 | +1.0 |
| **累计缺口（截至 9/21 开工）** | **约 1.5 天** |
| 按规则顺延后的结束日 | 10/14 → **10/15**（我核对过：是 / 否） |是

**结论（要不要加压）：**要

**昨天那条观察（`day07-promise.js` 花了 5 轮，大部分是流程返工）我的看法：**大部分是自己细节上的问题，还需要自己跑跑测试一下，努力完成最好一次通过

---

## 欠账登记（按计划 §四 的规则）

> **AI 核实填写（9/22 收尾）** —— 今天清单 9 项里：**① ② ⑤ 完成**（含零提示题 4/4 判据）、**③ ④ 按砍单顺序顺延**、**⑥ 待提交**；另有两件"以为做了其实没做"。

| 欠什么 | 补在哪天 |
|---|---|
| **三个 `recall-*.js` 还没改**：三份都缺 `module.exports`，实测仍是 **0/6、0/4、0/5**（"轮转复习"只做了一半 —— 写了但没闭环） | **下一段开工第一件事**（15 分钟：补导出 + 按清单改） |
| **③ `Promise.all` 家族**（30 分钟） | 下一段（紧跟最前面） |
| **④ ESM vs CJS**（20 分钟，只读 + 4 行笔记） | 下一段（入口就是 9/20 撞的那个 `ERR_AMBIGUOUS_MODULE_SYNTAX`） |
| 「学会了什么」栏还没填（**不是欠账，是日志提交前要补的**，那一栏是他自己写的） | 提交前 |
| （**不是欠账，是既定日程**）TypeScript 入门 + `p0-toolkit` 转 TS —— Day 8 原本的内容 | 下一段主线 |

**累计欠账（截至 9/22 开工）：约 1.8 天** → 按规则顺延，**结束日 10/15 → 10/16**（详见 `notes/week1-review.md` 的算账表）。

## 明天第一件事

1. **先把三个 `recall-*.js` 改完**（15 分钟，`node week1-language/recall-verify.js <模块>` 跑到全绿）
2. **③ `Promise.all` 家族 + ④ ESM vs CJS**（50 分钟）
3. **TypeScript 入门 + `p0-toolkit` 转 TS**（主线，约 2 小时）
4. 「忘了的」清单里挑出的轮转项（见 `notes/week1-review.md` 结论）

## 代码 / 命令备忘

```powershell
# 轮转复习（凭记忆写完再跑）
node week1-language/recall-verify.js curry
node week1-language/recall-verify.js deepClone
node week1-language/recall-verify.js throttle

# 今天的产出物
node week1-language/day08-zerohint-02.js
node week1-language/day08-zerohint-02-verify.js      # 这个是我自己写的判据
node week1-language/day08-event-loop.js
node week1-language/day08-promise-api.js

# 收尾
git add -A
git commit -m "day08: event loop + promise api, week1 review (recap + recall lists)"
git push
git status -sb
```

---
---

# Day 8 第 2 天 — 2026-09-22（周二）

> **状态：待填写**　｜　任务书：[`day08-day2.md`](day08-day2.md)
> 接 9/21 顺延下来的三件事（三个 `recall-*.js` 的修改、③ `Promise.all` 家族、④ ESM vs CJS）+ 今天的主线 **TypeScript 入门 + `p0-toolkit` 转 TS**
> **目标（我自己的原话）**："努力完成最好一次通过" —— 每改完一个文件立刻跑一次判据，别攒到最后

## 今日目标

- [×] ① 三个 `recall-*.js` 改到全绿（**含补 `module.exports`**）
- [×] ② ③ `Promise.all` 家族 + 对比表（填**实测**）
- [×] ③ ④ ESM vs CJS（只读 + 4 行笔记）
- [×] ④ **TypeScript 入门 + `p0-toolkit` 转 TS**（主线，2 小时）
- [×] ⑤ 轮转复习 **4 个模块**（加压的落点）
- [ ] ⑥ 日志 + commit + push
- [ ] （备用）零提示题第 3 道 `flatOnce` —— 提前做完才做

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `week1-language/recall-curry.js` / `recall-deepClone.js` / `recall-throttle.js` | 补导出 + 按「忘了的」#1–#10 改对 | ⬜ |
| `week1-language/day08-promise-api.js` | `all` / `allSettled` / `race` / `any` 对比 | ⬜ |
| `p0-toolkit/tsconfig.json` | `strict: true` + `noEmit: true` | ⬜ |
| `p0-toolkit/src/*.ts` + `test/*.test.ts` | 5 个模块转完，**26 条仍全绿** | ⬜ |

---

## ① 三个 recall 的实测（改完填）

| 模块 | 改前（9/21 实测） | 改后 | 这次卡在哪 / 记进清单第几条 |
|---|---|---|---|
| `curry` | 0/6 | ✅ **6/6** | 一次过（清单 #1–#4 一起恢复了：收的是函数、参数累积、`fn.apply(this, adj)`、内层 `return`） |
| `deepClone` | 0/4 | ✅ **4/4** | 一次过（清单 #5–#8：`typeof x !== 'object'`、`return x.map(...)`、`for...in` / `for...of`、`null` 单独处理） |
| `throttle` | 0/5（**逻辑也错**） | ⏳ **4/5** → 改掉一个字母就 **5/5** | 卡的不是逻辑，是**导出名拼错**：`throttleBySwich` 少一个 `t`，而测试文件解构的是 `throttleBySwitch` → 那个函数是 `undefined` → 报 `TypeError: throttleBySwitch is not a function` → 5 条里红 1 条。**名字改对就是 5/5**（AI 实测：只改这一个字母、其它一字不动）。对应清单 **#9 #10** —— 逻辑两条都对（路线 A 时间戳 + 路线 B 开关）。 |

> **⚠️ 本轮暴露的习惯问题：第 4 次字符级手滑** —— `setTImeout`（9/20）→ `funciton`（9/21）→ `=+` 当成 `+=`（9/21）→ `throttleBySwich`（9/22）。
> 四次全是"**少一个/错一个字符**"，而且**每次都在函数名或 API 名上**：第一次让整个函数炸、第二次让整个判据文件不执行、第三次把判据变成假绿、第四次让 1/5 红。
> **对策两条**：① **写完立刻跑**（心法第 7 条）—— 四次里有三次一跑就现形；② **导出名要和测试文件的解构名逐字对齐**。
> 顺带：`recall-verify.js` 已升级 —— 失败时会**打印报错原文**（`TypeError: ... is not a function`）+ **对比"测试要的导出名 vs 你导出的名字"**，疑似拼错直接点名（`要 throttleBySwitch，你写的是 throttleBySwich（差 1 个字符）`）。

---

## ② `Promise.all` 家族对比表（填**实测**结果）

> **AI 核实（9/22，跑的是他的 `day08-promise-api.js`）**：他的**结论是对的** —— "遇到 reject 时，其他会继续执行，但 `Promise.all` 会立刻以那个原因拒绝"。
> 但**这份实验只证明了四分之一**，下面把"证明了什么 / 没证明什么"分开写（这比结论本身更值钱）。

| 方法 | 全部成功时拿到什么 | 有一个失败时会怎样 | 什么时候用它 |
|---|---|---|---|
| `Promise.all` | 结果**数组**，顺序和传入一致 | **立刻**以第一个拒绝的原因拒绝，不等其他（其他照旧跑完，**结果被丢掉**）<br>⚠️ 这份实验**没证明"立刻"**（见下）；而且它第 2 个 `all` **没加 `.catch`** → **未处理的拒绝把进程干掉了**（退出码 1） | （他填） |
| `Promise.allSettled` | 对象数组：`[{status:'fulfilled',value:1},{status:'rejected',reason:'错误'},{status:'fulfilled',value:2}]`（**实测原样打印出来了** ✅） | **不会拒绝** —— 那几项变成 `{status:'rejected', reason}` ✅ | （他填） |
| `Promise.race` | **最先 settle 的那个**（成功或失败都算）—— 实测打印 `4`（500ms 那个赢）✅ | 最先 settle 的若是**失败** → race **拒绝**<br>⚠️ **他没测**（实验里三个全是成功） | （他填） |
| `Promise.any` | **最先 fulfilled 的那个**（忽略中间那些失败） | 全都失败 → 拒绝，原因是 **`AggregateError`**（把所有失败原因装在一起）<br>⚠️ **他没测**；而且**这次的 `any` 结果压根没打印出来** —— 它的 resolve 在第 1000ms，崩溃也在 1000ms，**被未处理的拒绝抢先掐掉了** | （他填） |

**顺手实验：`Promise.all` 里一个失败时，其他几个还会继续跑完吗？**
> 他的结论：**会继续跑**。**结论正确，但这份代码里没有证据** —— 那几个 Promise 里没有任何打印，所以"继续跑"是**推出来的**，不是看到的。

**⚠️ 要补的四个小实验（每个 3 行，这才是"把结论变成证据"）**

1. **先修掉崩溃**：给第 9–12 行那个 `Promise.all` 加 `.catch(console.log)`（或删掉那一段）。**不修的话，它会把后面所有还没跑完的实验一起掐掉**（`any` 就是这么被吃掉的）。
2. **证明 `all` 是"立刻"、不等其他**：`Promise.all([reject@500ms, resolve@2000ms])` + 在 catch 里打印**时间戳** → 应该在 **500ms 左右**就拒绝，而不是 2000ms。
3. **证明"其他继续跑"**：在慢的那个 Promise 里加 `console.log('慢的那个还在跑')` → 你会亲眼看到它在 `all` 已经拒绝之后**仍然打印**。
4. **补两个"谁先失败"的边界**（面试高频）：
   - `Promise.race([reject@100, resolve@500])` → race **拒绝**（不是等那个成功的）
   - `Promise.any([reject, reject])` → 拒绝，**原因是一个 `AggregateError`**（`console.log` 出来看结构）


---

## ③ 补充实测（9/22 第二版）—— 他的新实验：**两个会挡住观察的问题**

> **AI 核实（跑的是他更新后的 `day08-promise-api.js`）**
>
> **① 文件现在几乎什么都没打印出来。** 第 43 行 `Promise.any([reject, reject]).then(console.log)` **是同步拒绝、又没有 `.catch`** → 未处理拒绝在**第一轮微任务结束后**就把进程干掉了 → **后面所有实验（第 24 行的 `race`、第 30 行的 `any`、他新加的第 50 行 `race`）全都没跑**。实测只剩两行输出：`慢的resolve` + `allSettled` 的数组。
> 崩 溃时 Node 打印的 `[AggregateError: All promises were rejected] { [errors]: ['拒绝1', '拒绝2'] }` —— **那是"崩溃的输出"，不是"观察到的结果"**。
> **这是"未处理的拒绝"第 3 次**（9/20 忘了 `await`、9/21 第一个 `all` 没 catch、9/22 这次）。**修法**：`.catch(console.log)`，或 `.then(console.log, console.log)`（两个参数）。
>
> **② 第 39 行那行写错了，"慢的"其实一点都不慢**：
> `new Promise(resolve => setTimeout(resolve(console.log("慢的resolve"), 2000)))` —— `resolve(...)` 被当成了 `setTimeout` 的**参数**，于是：
>  ① `console.log` 在**加载时立刻打印**（所以它是输出的第一行）；
>  ② `resolve` 被**立刻调用**（这个 Promise 立刻兑现，根本不慢）；
>  ③ `setTimeout` 收到的回调是 `undefined` —— Node 24 里**不报错、静默**，**不看时序根本发现不了**。
> → 所以**这个实验没有证明"其他还在跑"**。正确形态：`new Promise(resolve => setTimeout(() => resolve(1), 2000))`，`console.log` 写在那个箭头函数里。
>
> **③ 结论**：他这轮的"实测"里，**`allSettled` 的数组形状**和**`race`（成功那个赢）**是上一版就打印过的真结果；这一版新加的四个实验**全部没产出可观察的证据**（两个被崩溃吃掉、一个被写错、一个压根没跑到）。
> **又一个模式（第 2 次）：未处理的拒绝**。9/20 那个"忘了 `await`"的实验是第一次，这次是第二次 —— 只是这次它**掐掉了他自己的实验**。
> 规则一句话：**写异步实验时，每个可能失败的 Promise 都要有 `.catch`，否则 Node 会当场结束进程**（`ERR_UNHANDLED_REJECTION`，退出码 1）。

---

## ③ ESM vs CJS：4 行笔记

> **这四条笔记写在上面「第 1 天的 ④」里**（第 261–267 行附近）—— 两处同名是历史原因：任务在 9/21 排，笔记在 9/22 补。
> 直接去上面那一节看，含 AI 逐条核对（第 1 条基本对、第 4 条要重写）。

---

## ④ TypeScript 入门 + `p0-toolkit` 转 TS

| 项 | 记录 |
|---|---|
| 转了哪几个模块（顺序） | `curry` → `throttle` → `debounce` → `deepClone` → `arrayUtils`；**共 10 个文件**（5 个 `src/*.ts` + 5 个 `test/*.test.ts`） |
| `pnpm test` 结果 | ✅ **26 条全绿**（`ℹ tests 26 / pass 26 / fail 0`） |
| `pnpm exec tsc --noEmit` 结果 | ✅ **零报错**（这次是真的 —— 10 个文件全在 `include` 里了） |
| **哪里放宽了类型**（`any` / `unknown`）、为什么 | ① 包装器的参数与回调：`(...arg:any[])=>any`、`(item:any):any`（包装器本来就不该限制被包装的函数）② 对象累加器：`Record<string,any>`（`clone2` / `result`，要能按任意字符串键取放）③ `let result:any`（装 `fn` 的返回值）④ 测试里的 `seen:any[]` / `src:any[]`（故意混类型的数组）。**统一理由：先把"形状"跑通，不追类型体操**（今日验收标准） |
| `strict` 下最意外的一条报错 | `TS7023/TS7024`：**递归函数（含"递归藏在回调里"）推不出返回类型 → 必须显式写**（`function deepClone(x:any): any`）。实测：纯自递归 `return f(x)` 反而不报；`return x.map(i => f(i))` 才报 —— 因为"间接"引用自己 |
| 今天最反直觉的一条 | **（你填）** |

> **AI 核实（9/23，`test/arrayUtils.test.ts` 的两类错误）**
> - **第 1 类（手滑）**：第 59 行 `... => s + u.age:, 0)` —— **多打了一个冒号** → `TS1005: ',' expected` / `TS1135`。删掉即可。（第 6 次字符级手滑，形态是"多打一个符号"。）
> - **第 2 类（真正要学的：类型标得太窄）** —— 删掉冒号后还剩 4 条，**同一个根因**：
>   ① `u:number` 但 `u` 是**对象** `{age:number}`（`users = [{age:20},{age:15}]`）→ `u.age` 报 `TS2339: Property 'age' does not exist on type 'number'`；
>   ② `const seen:number[] = []` 但往里 `push` 的是**对象** `{acc,el,i,arr}` → `TS2345` + 后续 `x.i`/`x.acc`/`x.arr` 全报"不存在"。
> - **规律（值得记）**：**容器标了什么类型就只能放什么类型；参数标了什么类型就只能按那个类型用。** 标窄了 → 满屏"XX 不存在"。
> - **怎么判断该标什么**：① **看调用处传进来的是什么**（最可靠）② 推不动就用 `any`（今日允许，但标准确的更值钱）③ 去掉标注后把鼠标悬停在变量上，看 VS Code 推出来的类型，照着抄。
> - **外加一处**：第 19 行 require 路径还是 `../src/arrayUtils.js` → 必须改成 `.ts`（否则运行时 `Cannot find module`）。
> - **实测（临时副本）**：改完这四处 → `tsc` 零报错 + **8/8 测试全绿** ✅。
> - **剩下的**：`test/deepClone.test.js`、`test/throttle.test.js` 还没改名/改路径（`src` 那两个已转好）→ 整个工具箱现在只剩这两处 `Cannot find module`。

> **TS 语法卡片（9/22）：`fn: (...arg: any[]) => any` 怎么读 + 那个 `...` 不能少**
> - 读法：`参数名: 类型`，而**类型本身可以是"函数类型"**，函数类型写成 `(参数列表) => 返回类型`。
>   所以这句 = "`fn` 是一个接收**任意个**参数、返回**任意值**的函数"。
> - **`...` 是关键**：`(...arg: any[]) => any`（任意个参数）≠ `(arg: any[]) => any`（**一个**参数，且必须是数组）。
>   实测反例：用 `(arg: any[]) => any` 去接 `(a, b) => a + b` → 报 `TS2345 ... Target signature provides too few arguments`。
> - **四种等价写法都实测通过**：① 直接写 ② 参数名随便起（`...args`）③ 抽成类型别名 `type AnyFn = (...arg: any[]) => any` ④ 泛型版 `function curry<T extends (...args: any[]) => any>(fn: T)`。
> - **今天先用 `any` 就够**（今日验收 = "能开 `strict` 并修完报错"，不追类型体操）；泛型版留到第 3 周以后。
> - 和已有知识对照：内部 `collect(this:unknown, ...adj:any[])` 里的 `...adj:any[]` 与这里的 `...arg:any[]` 是**同一套语法**，只是一个用在"函数参数上"、一个用在"函数类型里"。

> **TS 小规则卡片（9/22，实测过的最小例子）—— "什么时候必须写返回类型？"**
>
> 报错原文：`TS7023/TS7024: ... implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.`
> **意思**：TS 默认会**从 `return` 推断**返回类型；但当"推断它"必须绕回它自己（循环引用）时，就推不出来 → **要你显式写**。
>
> | 情况（实测） | 要不要写返回类型 |
> |---|---|
> | `function f1(x:any){ return x; }` | ❌ 不用（从 `return x` 推出 `any`） |
> | `function f2(x:any){ return f2(x); }`（纯自递归） | ❌ **也不用**（TS 把它当 `any`，不报错） |
> | 像 `deepClone`：递归**藏在 `.map` 的回调里** | ✅ **要**（TS7023 + TS7024 一起报） |
> | 像 `curry`：递归在内部函数里，另一条 return 是 `fn.apply(...)` | ❌ 不用 |
>
> **所以判据不是"是不是递归"，而是"TS 能不能把推断落地"。** 报错里的 **"directly or indirectly"** 就是为 `deepClone` 这种写的 —— 它不是直接 `return deepClone(...)`（直接），而是 `return x.map(i => deepClone(i))`（**间接**：夹在一个也需要被推断的回调里）。
>
> **断环的位置随便哪一处都行（实测）**：只给外层 `function deepClone(x:any): any` ✔️ 或只给箭头 `(i:any): any => ...` ✔️ —— 两种改法都能让报错消失。
> **实用记忆法**：遇到 `TS7023 / TS7024`，**就在报错指的那一行加 `: any`**（行号列号是精确的）。

> **⚠️ AI 纠错（9/22，重要）**：我前面那条说"**debounce 的 immediate bug 仍在**" —— **是错的，我道歉。**
>
> **真相（实测 4 个场景）**：他后来自己把第 41 行补成了 `timer=setTimeout(()=>{timer=null},delay);`（原来是个从没被调用的箭头函数）→ **bug 已经消除**。
> 我把他现在的版本和"标准版"（`timer = null` 挪进 trailing 回调）在同一组场景下对比：**A 单次+间隔后再调 / B 窗口内再调 / C 连续三次 / D 三次都在窗口内** —— **两者的输出完全一致**。
>
> **我错在哪**：`timer = setTimeout(...)` 被赋值第二次，**只改变"变量指向谁"，并不会取消"已经排好的那个定时器"** —— 第一个定时器照样按时触发、照样执行 `timer = null`。所以第 47 行的"覆盖"是**无害**的。
> 我上次的推理错在把"变量被覆盖"当成了"定时器被取消"（取消要靠 `clearTimeout`）。**更严重的流程错误**：那个"bug 仍在"的结论是**沿用旧版本的测量（当时第 41 行确实是那个空箭头函数）**，**我没有重测就复述了** —— 这正好又是今天在学的"**判据要覆盖到你说的那件事**"的实例，而且这次是 AI 犯的。
>
> **顺带留下的设计观察（不是 bug）**：他的 `timer` 一个变量同时当"trailing 定时器句柄"和"冷却标记"，并且会留下**不再被引用的孤儿冷却定时器**（它们仍会触发）。行为上没测出问题，但**很难推理**（我为了搞清它触发了哪些定时器做了好几轮实验）。要讲给别人听时，**"一个定时器到点做两件事"的那版更好讲** —— 变量语义只有一种：**timer 非空 = 冷却中**。

> **AI 核实（9/22，deepClone 收尾 + debounce 的 immediate bug）**
>
> **① deepClone 剩下的两条 —— 都是"递归函数推不出返回类型"**
> ```
> src/deepClone.ts(88,10): error TS7023: 'deepClone' implicitly has return type 'any' because it
>     does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.
> src/deepClone.ts(94,22): error TS7024: 同上（内层箭头函数）
> ```
> **关键词是 "is referenced directly or indirectly in one of its return expressions" = 递归。**
> TS 能从 `return` 推断普通函数的返回类型，但**递归函数推不出来**（要推 `deepClone` 的返回类型，得先知道 `deepClone` 的返回类型 → 循环）→ **必须显式写**：
> `function deepClone(x:any): any {` + `return x.map((item:any): any => deepClone(item));`
>
> **② debounce 的 immediate bug：`timer` 一个变量干两份活，互相打架**
> - 第 41 行 `timer=setTimeout(()=>{timer=null},delay)`（"冷却"定时器）被**第 47 行**的 trailing 定时器**覆盖** → 归零那步**永远不执行** → `timer` 回不到 `null`。
> - 而 `let callNow = !timer` 就是靠"timer 是 null"判断"这是一次全新调用" → 于是 **immediate 只在进程里第一次调用时生效**（第 2 行的实测数据：第1次=1、等完=2、间隔后再调还是 2 ❌）。
> - **修法（两处）**：删掉那个被覆盖的冷却定时器，**把 `timer = null` 挪进 trailing 的回调里** —— 让同一个定时器到点时**同时**做"归零 + 执行"两件事。
> - **实测（改后）**：`第1次=1 | 等完=2 | 间隔后再调=3 ✅`，且原有 3 条 debounce 测试仍全绿。
> - **记账**：这次的两行修法是 **AI 给的**（同 9/22 `day07-promise.js` 那次）→ 要求他能自己讲清"为什么 `timer` 必须归零"，讲不出就是抄的。
> - **判据先行**：他先自己补一条"间隔之后再调用 → 应该立刻执行"的测试，看它红，再改实现。
>
> **③ 一个自我纠错（AI）**：我上一条说"好消息：类型活儿全干完了"是**错的** —— `tsc --noEmit` 只检查 `include` 里的 `*.ts`，**未转换的 `.js` 文件根本不参与**，所以那个"零报错"只代表"已转的 4 个 src 文件没类型错"。**这又是一次"假绿"：判据的覆盖面决定绿的含金量。**

> **AI 核实（9/22，定位一个"伪装成源码错误"的配置错误）**
>
> **症状**：`pnpm exec tsc` 报 `trailing characters at line 15 column 1`，看起来像 `src/arrayUtils.ts` 的错。
> **真根因**：**`p0-toolkit/package.json` 里被追加了一段半截内容** —— 文件是"合法 JSON + 尾部垃圾"：
> ```
> （1–13 行是完整的 package.json，第 13 行的 } 已经结束了 JSON）
> 第 15 行开始："scripts": { "test": ..., "typecheck": ... }   ← 多余内容
> ```
> `JSON.parse` 的原话：`Unexpected non-whitespace character after JSON at position 255 (line 15 column 1)` —— 和工具报的 "trailing characters at line 15 column 1" 是同一件事。
> **为什么杀伤面这么大**：`package.json` 是所有工具都要读的（`pnpm` / `tsc` / Node 模块解析）→ 它坏了，`pnpm add`、`pnpm exec tsc` 全部报同一个错；而报错里提到的文件名会让人**误以为是那个源文件的问题**。
> **同一个错误的第 2 次**：之前他还在 `src/` 里新建过同样内容的 `src/package.json`（已删），那次让**5 个测试文件一起红**（`Invalid package config`）。
> **教训（要记进心法）**：**JSON 文件只能有一个顶层 `{ }`；往末尾追加任何东西会让整个文件失效**。要加脚本/字段，只能往**已有的 `{}` 里面**加 —— 不是"新建一个文件"，也不是"追加到末尾"。
> **修完后的实测**（把他现在的文件拷到临时目录 + 修好 package.json）：`tsc --noEmit` **退出码 0、零报错**；说明**他的类型注解活儿其实已经全部做完了**（`debounce.ts` 的 `timer` / `result` 两处类型已按建议改好，两个测试文件的 require 路径也改成 `.ts` 了）。
> **还剩一件**：`debounce.ts` 第 41 行那个 `immediate` 的逻辑 bug（类型修好 ≠ 逻辑修好）—— 建议顺序仍是"先补判据 → 看它红 → 再改实现"。

> **AI 核实（9/22，第一次转 TS 的示范）**
> - **他已完成**：`src/curry.js` → `src/curry.ts`、`test/curry.test.js` → `test/curry.test.ts`（改名）、`pnpm add -D typescript`（装好）。
> - **还缺**：`@types/node`（不装的话 `require` / `module` 报 `Cannot find name`）、`tsconfig.json`、类型注解。
> - **⚠️ 任务书里那份 `tsconfig.json` 在 TS 7 上是错的**（`moduleResolution: "node"` 已被删除 → `TS5108`）→ 已在任务书里按实测改成 `module: "nodenext"` + `allowImportingTsExtensions` + `types: ["node"]`。
> - **记账（按计划 §一 红线）**：`curry` 这一份是 **AI 陪他走了一遍示范**（第一次接触 TS 的操作流程），其余 4 个模块（`throttle` / `debounce` / `deepClone` / `arrayUtils`）**由他自己转**。
> - **示范后的实测结果**（在临时副本上跑的，没动仓库）：`tsc --noEmit` **零报错** + `node --test` **26 条全绿** —— 证明"只转一个模块"是可行的增量做法。

---

## ⑤ 轮转复习（4 个模块）

| 模块 | 结果 | 想不起来的 |
|---|---|---|
| 模块 | 结果 | 想不起来的 |
|---|---|---|
| 模块 | 结果 | 想不起来的 |
|---|---|---|
| `debounce` | ⚠️ **重写出来了**（9/23 重建了 `recall-debounce.js`）：工具箱判据 **1/3** → 修掉 typo → **3/4**（补上"delay 内第二次应被忽略"这条判据之后；补之前是 3/3 的假绿） | ① **`cleaarTimeout` 拼错**（第 7 次字符级手滑）② `immediate` 的语义记成了另一种（见下） |
| `curry` | ⚠️ 9/22 已改成 **6/6**；今天只是**转 TS 时看了一遍源码**（认读，不是回想） | 无 |
| `deepClone` | ⚠️ 9/22 已改成 **4/4**；同上（认读） | 无 |
| `throttle` | ⚠️ 9/22 已改成 **5/5**；同上（认读） | 无 |

> **AI 判定（9/23，回答他"这份 recall 到底对还是错"）**
>
> **① 按这道题的核心目标（trailing 防抖机制）→ ✅ 正确。** 闭包存 timer → 有 timer 就取消 → 重设 → 到点执行：连喊 5 次只执行 1 次 ✔️、delay 内再调会重新计时 ✔️、参数跟最新那次 ✔️、能重复使用 ✔️。
>
> **② 按"和工具箱那份完整版一致"→ ❌ 有一处不对，而且不小**：他的 `immediate` 分支写成
> ```js
> if(immediate){ return fn.apply(this,arg); }   // 每次都直接执行，且永远不设 trailing timer
> ```
> 后果：**`immediate = true` 时这个函数退化成"直接调用原函数"—— 防抖完全失效**（timer 永不被赋值 → `clearTimeout` 那步永不触发 → 每次都执行）。工具箱 / 他 Day 4 的设计是 **leading + trailing**。
>
> | 实测（delay=80，连喊两次） | 连喊两次后立刻 | 等到 delay 后 |
> |---|---|---|
> | 他的 recall 稿 | **2** | 2 |
> | 工具箱的设计 | **1** | 2 |
>
> **③ 能"达到效果"吗 → ✅ 能，而且这次效果特别好**：轮转复习的作用不是"证明你会"，而是"**暴露不会的地方**"。这 5 分钟暴露了两处：`cleaarTimeout`（第 7 次手滑）+ **`immediate` 语义记混**（**认读发现不了** —— 转 TS 时"看过"这份代码，却没发现它和工具箱不一样）。
>
> **④ AI 补了自己判据的漏洞（测试是我的活）**：新增"`immediate: true` 时，delay 内的第二次调用应被忽略（leading + trailing 语义）"这条测试。实测：工具箱实现 **27/27 全绿** ✔️；他的 recall 稿 → **3/4，红的正是这一条** ✔️。**这是"判据覆盖不到"的第 3 次现身，而且这次漏的是我自己写的测试。**
>
> **⑤ 要不要改这份 recall 稿**：**不用改**（它是复习稿，不是交付物）；但「忘了的」清单加了第 27 条。要统一记法的话，明天那三格轮转之后，把 `immediate` 那段按 leading + trailing 再写一遍（那才是"第二遍才算过"）。

> **AI 核实（9/23）：这次 debounce 的"回想"真做了（是重写，不是认读）—— 结果是"逻辑基本在，细节两处漏"。**
> **① 第 7 次字符级手滑**：`cleaarTimeout`（多一个 `a`）→ **第 2 次调用直接 `ReferenceError`** → 工具箱判据 1/3。**修掉这一个字母 → 3/3**（实测）。
> **② 比 typo 更值得说的：`immediate` 的语义记成了另一种。** 实测对比（delay=80，连喊两次）：
>
> | | 连喊两次后**立刻** | 等到 trailing 之后 |
> |---|---|---|
> | 他的 recall 稿（`if(immediate) return fn.apply(...)`） | **2**（每次都放行） | 2（**没有** trailing） |
> | 工具箱的设计（leading + trailing） | **1**（只第一次） | 2（delay 内忽略后续 + 末尾补一次） |
>
> **而工具箱的判据抓不到这个差异** —— 它那条 immediate 测试只断言"第一次立刻执行"（`fn(); assert.equal(calls,1)`），**没测"delay 内的第二次调用应该被忽略"** ✔️ 又一个"判据覆盖不到"的实例。
> **要他自己判断**：这是"记成了另一种语义"还是"手滑"？—— 如果是记错了，那正好说明**这 5 分钟的"回想"暴露了认读发现不了的缺口**（这正是轮转复习存在的理由）。

---

> **📌 接住他今天的卡点 #1（9/23）**："**TS 中很多类型的表示方法不知道，一旦用不了 any 就卡住**"
> —— 这是一条很有价值的自诊断：**卡的是"类型语法的词汇量"，不是逻辑**。
> 处理（已排进欠账表）：下一段给一张 **"TS 类型快查表"（20–30 分钟）**，把今天遇到过的写法集中列一遍 ——
> `number[]` / `{age:number}` / `Record<string,any>` / `(...args:any[])=>any` / `ReturnType<typeof setTimeout>` / `T | null` / `any` vs `unknown`，
> 每行一句"什么时候用它"。**目的是从"遇到一个学一个"变成"有一张表可查"**。
> （顺带记账：今天 AI 这边做了 ① `curry` 的转 TS 走查示范 ② 修好了 `recall-verify.js` 适配 `.ts`（工具箱转 TS 把它弄坏了）③ AI 自己犯了两个错并被日志记录：误报"bug 仍在"、编辑日志时复制出重复标题。）

## 学会了什么

1.转TS中Record<string,any>意思是命名为对象类型，其中它的键为字符串类型，值为任意
2.ReturnType<type setTimeout>|null=null意思为让变量变为可以被setTimeout返回的类型并赋予它初始值null
3.ESM与CJS的区别：import export 与 exports与require（内容太多需要明天再复习）
4.promise四个方法：promise.all有一个错就reject,promise.allsettle返回所有，不论对错,promise.race不论对错，谁快谁返回.promise.any对一个就行

## 卡在哪里

1.TS中很多类型的表示方法不知道，一旦用不了any就卡住
2.手滑小错误的修改
3.对于知识点的理解花了一段时间

---

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| 欠什么 | 补在哪天 |
|---|---|
| **⑥ commit + push** | **现在**（他马上提交） |
| **⑤ 轮转复习的"回想"部分 —— 还剩 `curry` / `deepClone` / `throttle` 三格**（`debounce` 今天已做） | **明天** |
| 零提示题第 3 道 `flatOnce` | **明天** |
| （不是欠账，是给下一段的安排）**"TS 类型快查表" 20–30 分钟** —— 他 9/22 的卡点 #1 是"TS 中很多类型的表示方法不知道"，属**资料缺口**（今天全靠遇到一个学一个） | 下一段 |
| ~~`recall-debounce.js` 重建~~ | ✅ 9/23 已完成 |
| （不是欠账，是给下一段的安排）**"TS 类型快查表" 20–30 分钟** —— 他今天的卡点 #1 是"TS 中很多类型的表示方法不知道"，这是**资料缺口**（今天全靠遇到一个学一个） | 下一段 |

## 明天第一件事

1. **Day 9（9/23）= Node 架构与事件循环**，而且**先回到 9/21 的现场**：`day08-event-loop.js` 的 8 个标记顺序 + 我答错的那个 `.then` vs `await` 对照实验 + 我明确说的三条"不知道"（`process.nextTick`、`setTimeout` 属于 timers 队列、事件循环的"阶段"）

## 代码 / 命令备忘

```powershell
# ① 轮转复习（改完再跑）
node week1-language/recall-verify.js curry
node week1-language/recall-verify.js deepClone
node week1-language/recall-verify.js throttle
node week1-language/recall-verify.js debounce

# ② Promise API
node week1-language/day08-promise-api.js

# ④ 工具箱转 TS
cd week1-language/p0-toolkit
pnpm add -D typescript
pnpm test
pnpm exec tsc --noEmit

# 收尾
git add -A
git commit -m "day08: promise api + esm/cjs notes, p0-toolkit to TypeScript"
git push
git status -sb
```
