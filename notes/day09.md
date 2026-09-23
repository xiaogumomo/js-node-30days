# Day 9 — 2026-09-23（周三）

> **状态：待填写**　｜　任务书：[`day09-eventloop.md`](day09-eventloop.md)
> **今天分两段**：先补 3 项欠账（约 1 小时）→ 再进 Day 9 正式内容（事件循环，约 2.5 小时）
> **今天的目标**：把 9/21 那三条"不知道"**用自己的话讲清**，并让事件循环从"背顺序"变成"能解释为什么"

## 今日目标

**第一段：补欠账（约 1 小时）**
- [×] ① 三个 `recall-*.js` 凭记忆重写 → 跑判据（**curry 6/6 / debounce 4/4 / deepClone 4/4 / throttle 5/5**）
- [×] ① 附（推荐）：`debounce` 的 `immediate` 段按 leading + trailing 再写一遍（已在新重写稿里改对 ✔️）
- [×] ② 零提示题第 3 道 `flatOnce` + **自写判据**（判据 4/4；三种"拆一层"写法全对）
- [×] ③ 翻 `notes/ts-cheatsheet.md`（**全部完成**）

**第二段：事件循环（约 2.5 小时）**
- [×] ④ 9/21 那三条"不知道"补掉（`process.nextTick` / `setTimeout` 属于哪个队列 / 事件循环的"阶段"）
- [×] ⑤ `day09-event-loop.js`：4 个实验（**每个都先写预测**）
- [×] ⑥ 六个阶段的表 + 两个问题的答案
- [ ] ⑦ 日志 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `week1-language/recall-curry.js` / `recall-deepClone.js` / `recall-throttle.js` | 凭记忆重写（9/23 这轮） | ⬜ |
| `week1-language/day09-zerohint-03.js` | 零提示题第 3 道 `flatOnce` | ⬜ |
| `week1-language/day09-zerohint-03-verify.js` | **我自己写的判据** | ⬜ |
| `week1-language/day09-event-loop.js` | 4 个实验（预测 vs 实测） | ⬜ |

---

## ① 三个 recall 的实测

| 模块 | 结果 | 卡在哪 / 是"记混"还是"手滑" |
|---|---|---|
| `curry` | ✅ **6/6** | 无（收够→调用 / 不够→返回新函数继续收 + `arg.concat(args)` 累积，全对） |
| `debounce` | ✅ **4/4** | 无 —— **而且含新补的那条"delay 内第二次调用应被忽略"** → **昨天 `immediate` 那个教训吸收了** ✔️（昨天 3/4、今天 4/4） |
| `deepClone` | ❌ **2/4** | **`typeof x != "Object"`（大写 O）** —— `typeof` 返回的是**小写** `object`，所以这个判断**恒为真** → **整个函数退化成"原样返回"，一点都没克隆**（实测 `copy === src` 为 `true`）。<br>⚠️ **它不报错、静默失效** —— 只能靠判据发现（这次判据立功了）。**第 8 次字符级手滑**（前 7 次：`setTImeout` / `funciton` / `=+` / `throttleBySwich` / `cleaarTimeout` / 多余冒号 / …） |
| `throttle` | ⚠️ **4/5** | **路线 A（时间戳）完全正确**（`Date.now()` 比较 + `last = now` + `fn.apply`）；红的是 `throttleBySwitch` —— **第二条路线（开关 + 定时器）这次没写**。不是手滑，是**忘了这个模块有两套实现**（工具箱导出 `throttle` + `throttleBySwitch` 两个） |

> **AI 核实补记（9/23）**：`deepClone` 那个 `"Object"` **重新归类了** —— 不是"手滑"，而是**概念问题**（他把 `typeof` 的返回值当成了"类型名"，以为要写大写）。
> → 所以这条**不记进"字符级手滑"那一类**，而是记成一个**知识点**（已写进 `notes/ts-cheatsheet.md` 第六节"大写 vs 小写"）：
> **`typeof x` 的返回值永远是 8 个固定的小写字符串**（`'undefined' 'object' 'boolean' 'number' 'bigint' 'string' 'symbol' 'function'`）；而**大写开头的是"构造函数 / 内置类"**（`Object.keys` / `Array.isArray` / `Promise.all`）；**TS 标注类型用小写**（`number` / `object`），大写留给类名/接口名。
> **他说得对**：这次是"想错了"，不是"打错了" —— 这个区分很重要（两类问题的处理方式完全不同：概念错要讲清 + 记进清单；手滑只需"写完立刻跑"）。
>
> **改完之后的验收**（他把大小写改掉 + 补了 `throttleBySwitch`）：
> `curry` **6/6** ✅ ｜ `debounce` **4/4** ✅ ｜ `deepClone` **4/4** ✅ ｜ `throttle` **5/5** ✅ —— **四个模块全绿**。

> **AI 核实（9/23）**
> - **定位方式**：他把四个函数写在**一个文件**里（`week1-language/recall-curry,debounce,deepClone,throttle.js`，逗号文件名）→ 脚手架的默认路径是 `recall-<模块>.js`，**显式传第二个参数**就能判：
>   ```powershell
>   node week1-language/recall-verify.js curry     "week1-language/recall-curry,debounce,deepClone,throttle.js"
>   node week1-language/recall-verify.js debounce  "week1-language/recall-curry,debounce,deepClone,throttle.js"
>   node week1-language/recall-verify.js deepClone "week1-language/recall-curry,debounce,deepClone,throttle.js"
>   node week1-language/recall-verify.js throttle  "week1-language/recall-curry,debounce,deepClone,throttle.js"
>   ```
> （合并写在一个文件里没问题，工具支持传路径 ✔️）
> - **今天两处收获**：① `deepClone` 的 `"Object"` —— **静默失效**（不报错但整个函数没用），比昨天那个 `cleaarTimeout`（一跑就炸）更危险；② `throttle` 的路线 B 没写 —— **"记得有没有两条实现"** 这件事本身要进轮转表。
> - **要补的两处**：`deepClone` 改大小写（一个字符）+ `throttle` 补 `throttleBySwitch`（路线 B）。


> **⚠️ 昨天 `debounce` 的教训（写在这里提醒自己）**：**"能过判据"≠"和工具箱一致"** —— 昨天 `immediate` 的语义记混了（写成"每次都立刻执行"，设计是 leading + trailing），旧判据没覆盖到。
> → 今天每写完一个，多问一句：**"我这段是不是只是能跑，但语义和工具箱不一样？"**

---

## ② 零提示题第 3 道：`flatOnce`

| 项 | 记录 |
|---|---|
| 用了几分钟 | 超时（问了 AI 才写出 `Array.isArray` 和"拆一层"的写法） |
| 做出来了吗 | ✅ **最终完成了**（判据 4/4；三种"拆一层"写法全对）—— 最初那一版是"判据 4 条全红，但实现本身是对的" —— AI 用正确判据实测：4 个用例全过 + 原数组没被改 ✅ |
| **判据是我自己写的吗** | ✅ 自己写了 4 条，但 **assert 用错**（`assert.equal` 比数组 → 永远红）；另有函数名混用 |
| **我有没有"先故意让它红一次"** | ❌ 没做 —— 而这次正好说明：**判据"红了"不等于"红对了"**。"先让它红一次"的正确姿势是"**故意把实现改坏一个字符，看它红**"，而不是"它随便红了就算数" |
| **卡在哪一步（他的原话）** | ① `Array.isArray(item)` 这个判断写不出来，**问了 AI 才知道** ② **"怎么拆开一层"不会**（`.push` / `reduce`+`concat`）③ 整体上不问 AI 写不完整，**但框架是知道的**（先遍历 → 判断有没有套一层 → 有就拆） |

> **AI 确认（9/23 收尾）：这一格完成了 ✅**
> - 语法通过（`node --check`）；判据 **4/4 全绿**；实现逻辑正确、原数组不变。
> - **三种"拆一层"写法全对**（每种都跑了 3 个用例：`[1,[2,3],4]` / `[1,[2,[3]]]` 只拆一层 / `[]`）：
>   ① 嵌套 `for...of` + `push` ✅ ② `reduce` + `concat` ✅ ③ 展开 `result.push(...item)` + `else` ✅
>   （小瑕疵：① 和 ③ 的片段里没有 `return result` —— 作为"写法片段"没问题，真要放进函数记得返回；第 33 行的 `1.` 忘了写 `//`，它是合法数字字面量，能跑但没意义。）
> - **这一题的真实收获**：三处都不是"不会"—— ① `Array.isArray` 是"用过但取不出来"（第 3 次）② "拆一层"的三种姿势**都在已有材料里** ③ 累加器起点写错两次（`let result = 0` → 该 `[]`）。

> **AI 核实（9/23 续）—— 改完之后：实现 + 判据全绿 ✅，三种"拆一层"两对一错**
>
> **全绿了**：`node --test day09-zerohint-03-verify.js` → **4/4**（函数名统一成 `flatOnce` ✔️、`let result = []` ✔️、`Array.isArray(item)` 去掉 `==true` ✔️、判据换成了 `assert.deepEqual` ✔️）。
>
> **他在 `module.exports` 下面凭记忆写的三种"拆一层"（实测）**：
>
> | 写法 | 实测结果 | 问题 |
> |---|---|---|
> | ① 嵌套循环 + push | 💥 `TypeError: result.push is not a function` | `let result = 0`（该是 `[]`）；**而且缺"拆"的逻辑**（没有 `Array.isArray` 判断 + 内层循环，只是把元素复制一遍） |
> | ② `reduce` + `concat` | ✅ `[1,2,3,4]` | **完全正确** —— `concat` 对"单个元素"和"数组"都成立（数组会被展开），所以**一行就够**，不需要 if/else |
> | ③ 展开版 `push(...item)` | ❌ `[1,2,3,[2,3],4]` | **`result.push(item)` 忘了放进 `else`** → 数组元素被 push **两次**（展开的内容一次 + 数组本身一次）；同 `let result = 0` |
> | ③ 的修法（push(item) 进 else） | ✅ `[1,2,3,4]` | —— |
>
> **⚠️ 一个反复出现的族（第 3 次）：累加器的"起点/类型"**
> - `countChars`：`+r[k]+1` 缺"第一次出现时给 0"的起点
> - `myReduce`：`acc` 的初值从哪来
> - 今天：**两次**写成 `let result = 0`，而这里要攒的是**数组** → 该写 `let result = []`
> → **口诀：写累加器之前先问一句"我在攒什么？"**（攒数组 → `[]`；攒数字 → `0`）
>
> **待补（1 分钟）**：把 ① 补成真正的"拆一层"版（加判断 + 内层循环）、③ 把 `push(item)` 放进 `else` —— 三种写法都写出**正确版**，才算真的挂上钩。

> **AI 核实（9/23）—— 三个问题，三个不同的性质**
>
> **① 他报的 `flatOnce is not a function`：函数名拼错（`faltOnce`，t/l 颠倒）**
> - 模块导出的是 `faltOnce`（`module.exports={faltOnce}`），而判据 `require` 的是 `flatOnce` → `undefined`。
> - **而且判据里两个名字混着用**：第 1/3/4 条写 `flatOnce`（→ `TypeError: flatOnce is not a function`）、第 2 条写 `faltOnce`（**没 import 它** → `ReferenceError: faltOnce is not defined`）。
> - **改法**：函数名 + `module.exports` + 判据里的名字**统一成题目要求的 `flatOnce`**（共 3 处）。
>
> **② 判据里更严重的错：`assert.equal` 比数组会永远红**
> ```js
> assert.equal(flatOnce([1,[2,3],4]), [1,2,3,4]);   // ❌ 永远失败
> ```
> `assert.equal` 用的是 **`===`（比"是不是同一个引用"）**，两个内容相同的数组**永远不相等**。实测报错原文：`Values have same structure but are not reference-equal`。
> → 必须用 **`assert.deepEqual(实际, 期望)`**（比"内容相等"）。
> **⚠️ 这跟 9/21 那次是同一个知识点的两面**：上次 `assert(result, {…})` → **假绿**（永远通过）；这次 `assert.equal(数组, 数组)` → **假红**（永远失败）。**两次都是 assert 家族的用法没记准** → 已进「忘了的」清单。
>
> **③ 实现本身 ✅ 是对的**（他自己"初步测试证明没问题"的判断准确）：遍历 + `Array.isArray` 判断 + 内层再遍历 `push` —— 逻辑正确、原数组不变。
> 两处小改进（不影响逻辑）：`result = []` **没声明** → 隐式**全局变量**（严格模式下会直接抛错，也让函数不可重入）→ 写 `const result = []`；`Array.isArray(item)==true` 的 `==true` 是冗余的。
>
> **④ 他说"掌握得很差"的三条 —— 诊断（重要）**
> - **`Array.isArray` "想不起来"**：但**他刚在 `recall-curry,debounce,deepClone,throttle.js` 的 `deepClone` 里写过它、判据还跑绿了** → 这是**"用过了、零提示下取不出来"的第 3 次**（前两次：`dropNulls` 的 `Object.keys`、`countChars` 的累加起点）。
> - **"拆一层不会"**：三种写法**都在他已有材料里** —— 嵌套 `for...of` + `push`（**这次自己写出来了**）、`reduce` + `concat`（`myReduce` + `day03-array-methods.js`）、展开运算符 `push(...item)`（Day 3/4 的 spread）。
> - **他的自我判断准确**："框架我知道，但不问 AI 写不完整" —— **框架在、API 名与写法取不出来**。
> → **处理**：不重读概念，**把"拆一层"的三种写法各凭记忆写一遍**（3 分钟，同一文件注释里），把"取不出来"变成"取得出来"。
>
> **记账**：这次的 `Array.isArray` 与"拆一层"写法**有 AI 帮助**（框架与循环结构是他自己写的）。

---

## ③ TS 类型速查表：我卡过的类型

> **AI 核实（9/23）**：他说"已看好"（15–20 分钟）→ **记为「认读完成」**。
> ⚠️ 但任务书里这一格要的是两半：**① 圈出卡过的类型 ② 用自己的话写一句"什么时候用它"**。
> **第二半没做**（表格空着）—— 而**那一半才是这一格的价值**："读一遍"是认读，"写一句"才是回想（这正是这几天反复验证的那件事：认读很顺，回想才暴露空档）。
>
> **① 我卡过的类型 —— 第一列由 AI 从 9/22 的日志里填（有据可查）**：

| 我圈出来的写法 | 我用自己的话写的"什么时候用它" |
|---|---|
| `Record<string, any>`（deepClone 的 `clone2` / `result`） | 定义对象类型，其中明确对象的键为“字符串类型”，对象的值为任意类型 |
| `ReturnType<typeof setTimeout>`（debounce 的 `timer`） | 返回setTimeout的类型，这样就能写成timer=setTimeout而且不报错了 |
| `(...args: any[]) => any`（`curry` / `debounce` 的 `fn`） | 定义函数的导入类型，可以进入函数的类型为任意 |
| `{ age: number }`（arrayUtils 测试里的 `u`） | 定义数值类型 |
| `T \| null`（`timer` 可能还没有值） | 要么是T要么是null，想要赋值null的写法（确保T为空） |

> **AI 核对他的 5 条（9/23）—— 2 条对、2 条半对、1 条理解偏了**
>
> | 写法 | 他的说法 | 判定 |
> |---|---|---|
> | `Record<string, any>` | "定义对象类型，键为字符串、值为任意" | ✅ **对** —— 再补一句它**解决的问题**：能按**任意字符串键取放**（`obj[key]`），这就是 `clone2[key] = …` 需要它的原因 |
> | `ReturnType<typeof setTimeout>` | "返回 setTimeout 的类型，这样就能写成 `timer=setTimeout` 不报错" | ✅ **对** —— 再补一句**为什么不直接写 `number`**：浏览器里 `setTimeout` 返回**数字**、Node 里返回**对象** → 用 `ReturnType<typeof …>` 两边通用 |
> | `(...args: any[]) => any` | "定义函数的**导入**类型，可以进入函数的类型为任意" | ⚠️ **半对**：参数是"**一个函数**" ✔️，但"导入类型"这个说法不对（"导入"是 `import` 那个词）→ 读作"**这个参数本身是个函数：收任意参数、返回任意值**" |
> | `{ age: number }` | "定义**数值类型**" | ❌ **理解偏了**：它不是数值类型（数值类型是 `number`），而是**对象类型 / 形状** —— "**一个对象，要有 `age` 这一列、值填数字**"。<br>**实测反证**：`let a: { age: number } = 1;` → `TS2322: Type 'number' is not assignable to type '{ age: number; }'`（**如果它是数值类型，`1` 就该能赋进去**） |
> | `T \| null` | "要么是 T 要么是 null，想赋值 null 的写法（**确保 T 为空**）" | ⚠️ **半对**：前半 ✔️；"**确保 T 为空**"不对 —— 它是"**允许为 null**"（**放宽**），不是"确保是 null"。<br>**实测**：`let t: string \| null = '字符串'; t = null; t = '再一个字符串';` **全部合法**（最后打印"再一个字符串"）→ 它的含义是"**值要么是 T、要么是 null**"，用之前要判一下（这就是 `if (timer)` 存在的原因） |
>
> **总评**：5 条 = 2 对 + 2 半对 + 1 偏 —— **错的两条都在"术语 / 方向"，不在"完全不知道"**。跟他这一周的整体画像一致：**概念在、精确表述取不出来**（所以"用自己的话写一句"这件事本身就该多练）。

> **2 分钟的补法（推荐，盖住表做）**：把上面 5 个写法**默写出来**（不许看表），再各写一句"什么时候用它"。
> 写不出来的那几个 → 就是还没落地的 → 圈起来，明天轮转时再看一次。
> （`notes/ts-cheatsheet.md` 第五节自己也说了："遇到一次查一次，查三次以上自然就记住了" —— 而**默写**比"再查一次"快得多。）

---

## ④ 9/21 那三条"不知道"——用我自己的话讲一遍

**1. `process.nextTick` 是什么？**
将process放入独立队列中执行，并在下一个时间循环开始前，当前代码跑完的时候清掉。顺序：同步代码->独立队列->promise微任务->timers宏任务->事件循环继续
递归process.nextTick会饿死事件循环

**2. `setTimeout` 的回调在哪个阶段？为什么不能记"它最慢"？**
在timers阶段，属于宏任务，
不能记的原因：宏任务之间没有统一的先后，只有阶段的不同，谁前谁后看到期时间和所处阶段

**3. "事件循环的阶段"是什么？（六个阶段的名字按顺序）**
1.timers（定时器）执行setTimeout和setInterval的回调
2.pending callbacks(待定回调)执行某些系统操作（TCP错误）的回调。
3.idle,prepare(闲置，准备)node.js内部使用
4.poll（轮询）：负责检索新的I/O事件并执行相关回调
5.check（检查）：执行setTimmediate的回调
6.close callbacks（关闭回调）：执行socket.on("close",...)等关闭回调。

---

## ⑤ 事件循环：4 个实验（预测 vs 实测）

| 实验 | 我的预测 | 实测 | 一致？ |
|---|---|---|---|
| 1. 主模块里 `setTimeout(0)` vs `setImmediate` | | | |setTimmediate要快于setTimout(0);2次输出“B setImmediate”快于“AsetTimeout 0”一次“AsetTimeout 0”快于“B setImmediate”而且是位于首次.|不一致|
| 2. **I/O 回调里** `setTimeout(0)` vs `setImmediate` | | | |setTimeout(0)慢于setImmediate|etTimeout(0)慢于setImmediate|一致
| 3. 同步 → `nextTick` → `then` → `setTimeout` | | | | 顺序为15432 |1.同步5.同步结束4.nextTick3then2setTimeout|一致
| 4. 同步 I/O 会把 `setTimeout(0)` 推迟多久 | | | |
4.a301ms以后4.b1ms|300ms以后 1ms以后|一致
**实验 2 要能解释**（用我自己的话）：为什么在 I/O 回调里 `setImmediate` 一定先？
因为在事件循环中check阶段先于timers阶段，先进行setImmediate回调后才能继续下一个阶段

**实验 4 的一句话结论**：

> （你写你自己的版本；下面是 AI 给的"目的"说明与参考写法）
这个对照验证了，同步代码如果没有跑完是不会进行事件循环的这会导致异步中的计时器到期了却迟迟没有返回，所以要提醒我们等待的这种经常要异步交给计时器和promise，这样才能让程序正常，没有太大延迟的运行

> **📌 实验 4 的目的（AI 答他"这个实验到底在证明什么"）**
>
> **他的理解：「证明同步代码执行过程中，事件循环仍在继续」—— 正好说反了。**
>
> **正确的结论是：同步代码执行期间，事件循环"停摆"（被占住、一步都动不了）** —— 所有本该发生的回调（到期的定时器、I/O 回调）都得**排在它后面**。
>
> **对照设计（这才是 4.a / 4.b 成对出现的原因）**：
>
> | | 这 300ms 里主线程的状态 | `setTimeout(0)` 实际等了 | 说明 |
> |---|---|---|---|
> | **4.a 忙等** `while(...)` | **被占住**（同步代码没跑完） | **300ms**（被推迟） | 事件循环要等同步代码跑完，才能进 timers 阶段 |
> | **4.b 异步等** `setTimeout(...)` / `await` | **空着**（控制权交回了事件循环） | **1ms**（照常） | 只把"等待"登记给定时器，主线程立刻交还 |
>
> → **同样等 300ms，一个把定时器推迟了 300ms、一个完全没影响** —— 差别**唯一来源**就是"这 300ms 里主线程有没有被占住"。
>
> **一句话结论（参考写法，你自己改写一版）**：
> > **同步代码不跑完，事件循环一步都动不了** —— 所以"同步的重活"会把所有**已经到期**的回调一起推迟；而把等待写成**异步**（交给定时器 / Promise），事件循环照常跑，其他回调不受影响。
>
> **这条的实用价值**：① 解释了 Node 里为什么**不能用同步 I/O / 超长循环**（会卡死整个服务）；② 解释了你**实验 1** 那个"意外"（忙等让 0ms 定时器**过期** → 一进 timers 阶段就被跑掉 → 反超了 `setImmediate`）。


---

## ⑥ 事件循环六个阶段

| 顺序 | 阶段 | 干什么（一句话） |
|---|---|---|
| 1 | timers | |执行setTimeout和setInterval的回调
| 2 | pending callbacks | |执行某些系统操作比如（TCP错误）的回调
| 3 | idle / prepare | |node.JS内部使用
| 4 | poll | |检索新的I/O事件并执行相关回调
| 5 | check（`setImmediate`） | |执行setImmediate的回调
| 6 | close callbacks | |执行socket on（"close",...）等关闭回调

**两个问题：**
1. poll 阶段为什么会"卡住等 I/O"？
没有计时器 也没有setImmediate要处理时，目的是为了不空转省CPU

2. 微任务队列是在"阶段的哪个位置"被清空的？
每执行完一个回调清一次
---

> **AI 核对（9/23）—— ④⑤⑥ 逐条**
>
> #### ④ 三条"不知道"
>
> | 题 | 判定 | 要修的 |
> |---|---|---|
> | 1. `process.nextTick` | ✅ **基本对** | 术语：是"把**回调函数**放进独立队列"，不是"把 process 放进去"。顺序写对了（**同步 → nextTick 队列 → promise 微任务 → 才进事件循环，且事件循环从 timers 开始**）。**漏了那个面试坑**：递归 `process.nextTick` 会**饿死事件循环** |
> | 2. `setTimeout` 在哪个阶段 / 为什么不能说"它最慢" | ⚠️ **前半对，理由错了** | "在 timers 阶段、属于宏任务" ✔️。但"**宏任务必须等微任务处理完**"讲的是**微任务 vs 宏任务**的关系，**不是"宏任务之间"的排序规则**。正确理由：**宏任务之间没有统一先后** —— 它们在事件循环的**不同阶段**（timers / poll / check…），谁先谁后取决于**到期时间**与**所处阶段**（铁证：**I/O 回调里 `setImmediate` 早于 `setTimeout(0)`**，两个都是宏任务）。另外"0ms 后返回"要改成：**`setTimeout(fn,0)` = "最早下一个 timers 阶段、且至少 0ms 后"，插不进当前这一轮** |
> | 3. 六个阶段 | ⚠️ **名字与职责基本对，但顺序错，而且和 ⑥ 自相矛盾** | ④ 里把 `timers` 排到**第 6**；⑥ 的表排的是**第 1** ✔️ —— **正解是 ⑥ 那个**。同一个知识点两处答案不同 → 说明 ④ 是"凭印象写"、⑥ 是"照着填" → **"填对了但没记住"正是要盯的** |
>
> #### ⑤ 四个实验
>
> | 实验 | 判定 | 说明 |
> |---|---|---|
> | 1. 主模块 | ✅ **观察对了（3 次里 2 次 B 先、1 次 A 先），而且抓到了真原因** | 那次 A 先**就是你自己那个 300ms 忙等造成的** —— AI 实测三组对照：不加忙等 → **B 先**；加 300ms 忙等 → **A 先**；只加异步读文件 → **B 先**。机制：**忙等占住主线程 → 0ms 定时器已过期 → 事件循环一进 timers 阶段就先跑它** |
> | 2. I/O 回调里 | ✅ **一致，答对**（解释也对："check 阶段先于 timers 阶段"） | —— |
> | 3. 微任务顺序 | ✅ **一致，而且这次是自己推的**（没问 AI）：`1 → 5 → 4 → 3 → 2` | —— |
> | 4. 同步阻塞 | ⚠️ 标了"不一致"，其实**是一致**的 | 预测"301ms 以后" vs 实测"300ms" = 同一结论（差 1ms 是保守估计）。⚠️ **4.b 的数字没填进表**：实测 **1ms** —— **300 : 1 这个对比才是 4.b 存在的意义**，补进去 |
>
> #### ⑥ 六阶段表 + 两个问题
>
> - **六阶段表 ✅**：顺序对（`timers → pending → idle/prepare → poll → check → close`）、职责也对。
> - **问题 1（poll 为什么"卡住等 I/O"）⚠️ 没说到点上**：真正的原因是 —— 当"**没有到期的定时器、也没有 `setImmediate` 待处理**"时，事件循环就**停在 poll 阶段等 I/O 事件**（不空转、省 CPU）；有 I/O 就立刻处理，有定时器到期就绕回 timers。他写的是"需要检索到 I/O 才能继续" —— **等于用问题解释问题**。
> - **问题 2（微任务在哪清空）⚠️ 半对**："在阶段之间清空"接近；但**"必须在 timers 阶段前结束"是错的**。正解：**每执行完一个回调（一个宏任务）就清空一次微任务，不只在阶段之间**。
>   **实测证据**（AI 跑的）：同一个 timers 阶段里排两个定时器，第一个回调里排一个 `Promise.then` → 输出 `timer1 开始 → timer1 结束 → micro → timer2` —— **微任务插在两个定时器回调之间** ✔️
>
> **✅ 他改完之后（9/23）：5 处全改对了**
> - ④-1 补了"递归 `process.nextTick` 会饿死事件循环"
> - ④-2 改成"**宏任务之间没有统一先后，只有阶段的不同，谁前谁后看到期时间和所处阶段**" ✔️（完全正确）
> - ④-3 的顺序改成 `timers` 第 1（和 ⑥ 一致了）✔️
> - ⑤ 表补上 **4.b = 1ms**，并把 ④ 的状态改成"一致" ✔️
> - ⑥-1 改成"没有计时器、也没有 `setImmediate` 要处理时……**为了不空转、省 CPU**" ✔️（正确）；⑥-2 改成"**每执行完一个回调清一次**" ✔️
>> **总评**：**"事实层"（六阶段、职责、实验观察）基本都对**；**"机制层"三处没说到点上**（④-2 的理由、⑥-1 的 poll、⑥-2 的清空时机）—— 跟这一周的整体画像一致：**"是什么"记住了，"为什么"还在长**。

---

## 学会了什么

1.知道了事件循环的六个阶段
2.知道了TS中的一些常用类型以及复习了昨天有关TS类型
3.

## 卡在哪里

1.0提示写代码中关于功能的实现，需要什么代码卡住，无法从已有知识提取

---

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| （没欠账就写"无"） | |

## 明天第一件事

1. **Day 10（9/24）= 内置模块**：`fs/promises`、`path`、`os`、`url`、`Buffer`、`process.argv/env` vs `util.parseArgs` → 产出"统计目录大小并生成报告"的脚本
2. （如果今天有顺延）先把欠账清掉

## 代码 / 命令备忘

```powershell
# ① 三个 recall（凭记忆写完再跑）
node week1-language/recall-verify.js curry
node week1-language/recall-verify.js deepClone
node week1-language/recall-verify.js throttle

# ② 零提示题
node week1-language/day09-zerohint-03.js
node --test week1-language/day09-zerohint-03-verify.js

# ⑤ 事件循环实验
node week1-language/day09-event-loop.js

# 收尾
git add -A
git commit -m "day09: node event loop experiments + ts cheatsheet + zerohint flatOnce"
git push
git status -sb
```
