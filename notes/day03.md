# Day 3 — 2026-09-13（周日）

> **状态：部分完成（约 52%）** —— 阅读和数组部分做完了，**四个裸写函数一个都没写成**
> 详细指引：[`day03-arrays.md`](day03-arrays.md)　｜　欠账登记见本文末
> 本文的「学会了什么」「卡在哪里」「探索 TODO」是你自己写的原文，**未做删改**；AI 的复核结论集中在专门的小节里。

## 今日目标（7 个产出物，全部要跑出实际输出）

- [x] 1. `week1-language/day02-scope.js` —— var/let 提升差异、三层作用域、循环里 var vs let
- [ ] 2. `week1-language/day02-debounce.js` —— 连调 5 次只执行 1 次；支持 `immediate`
- [ ] 3. `week1-language/day02-throttle.js` —— 两个版本（补执行 / 不补执行）
- [ ] 4. `week1-language/day02-curry.js` —— `fn.length` 判断收够，注释写清默认参数陷阱
- [ ] 5. `week1-language/day02-clone.js` —— 浅拷贝三种写法 + 手写深克隆 + `structuredClone` 对比（只做了浅拷贝一部分）
- [ ] 6. `week1-language/day03-array-methods.js` —— 9 项清单做了 7 项，第 7、8 项要重做
- [ ] 7. `week1-language/day03-leetcode.js` —— 2629 Function Composition，含复杂度分析
- [x] 学习欠账：箭头函数、rest/spread、作用域链/TDZ、var（4 节）
- [x] 日志 + commit + push

## 今日产出
| 文件 | 内容 |
|---|---|
| [`week1-language/day02-scope.js`](../week1-language/day02-scope.js) | 提升差异、三层嵌套作用域、循环里 `var` vs `let` + 闭包章任务若干 |
| [`week1-language/day03-array-methods.js`](../week1-language/day03-array-methods.js) | 数组与对象核心 9 项清单（7 项合格）+ `camelize`、`getMaxSubSum` 两个官方课后题 |
| [`week1-language/day02-clone.js`](../week1-language/day02-clone.js) | 对象浅拷贝尝试（未用嵌套对象，证明不了"只复制第一层"） |
| [`week1-language/day02-clone-array.js`](../week1-language/day02-clone-array.js) | 数组浅拷贝尝试 |
| [`week1-language/day02-debounce.js`](../week1-language/day02-debounce.js) | 只有一行需求注释，未开始 |

---

## 探索 TODO（非清单，不许插队）

> 冒出"想看看 xxx"的念头就写这里，**不许当场去查**。清单交付完再看。

1. async函数及其应用
2. cofirm游览器输入替换成适合node.js的readline.question() realine-sync.keyInYN()
3. for...of循环
4. step4.返回函数

**AI 补注：这四条都是计划内后几天或已覆盖的内容，所以"不许插队"这条纪律执行得对。** 各自的归属：

| 你的问题 | 在哪天正式解决 |
|---|---|
| 1. `async` 函数 | 计划 **Day 7（9/17）异步三件套**。你已经提前摸过（9/12 那个 `buyfood`/`eat` 例子写对了），到时候会补上"为什么" |
| 2. `confirm()` 在 Node 里的替代 | 计划 **Day 10（9/20）内置模块**。先给结论：`node:readline/promises` 的 `rl.question()` 是你 **9/12 自己找到**的那个正解（推荐）；`readline-sync` 是第三方包，不用装。另外 CLI 场景更常用的是 `process.argv`（命令行参数），Day 10 会讲 |
| 3. `for...of` | **你其实今天已经用过了** —— `getMaxSubSum` 里就是 `for (let item of arr)`，而且写对了。规则：`for...of` 拿**值**，`for...in` 拿**键**（数组用 `for...in` 会拿到字符串下标 `"0"`，这是坑） |
| 4. Step 4. 返回函数 | 计划 **Day 5（9/15）闭包收尾**。你写的 `sum(a)(b)`、`byField` 已经是它的应用了 |

---

## 学会了什么（你的原文）

1. ()=>{ }箭头函数中没有自己arguments及this
2. Array.from(str);可迭代对象（如字符串）转化成数组不过 Array.from(obj) 和 [...obj] 存在一个细微的差别：
   Array.from 适用于类数组对象也适用于可迭代对象。
   Spread 语法只适用于可迭代对象。
   因此，对于将一些"东西"转换为数组的任务，Array.from 往往更通用。
3. Object.assign(rest,ar1,..,arN);复制将ar1到arN中的属性复制到rest
4. 闭包的概念：指一个函数可以记住外部变量并访问这些变量。为什么？javascript自动会通过隐藏的[[enviroment]]属性记住创建甜蜜的位置所以他们可以访问外部变量。
5. arr.includes（）判断是否存在 true false
   arr.filter()筛选数组  不符合条件的删除（找全部）
   arr.map()转化每个元素  一人一个，改完回来
   arr.find（）找到第一个符合条件的元素  找到一个就停
   arr.reduce（）积累计算 一群人合成一个东西
   arr.sort() 排序，更改元素的顺序
   arr.sort("(a,b)=>a-b")中(a,b)=>a-b为sort的比较函数
6. var 与 let 区别：①var不受块作用域影响，而let受
   ②var声明的变量能在声明语句前使用，而let不能
   ③IIFE (function(){...})
7. try catch结构
   ```
   try{ }catch(error){ console.log(error.messsage) }
   ```
8. arr.splice（start，end，elem1） 对数组的进行添加，删除和插入元素。
9. arr.slice（start，end） 复制原数组的副本arr
10. arr.forRach(function(item,index,array){});
    允许数组中每个元素运行一个函数（数组元素名，元素在数组中的位置，整个数组）
11. arr.concat 创建一个新数组，包含其他数组和其他项的值
12. arr.indexof/arr.lastindexof 区别一个从左往右，lastIndex从右往左精准定位数组中要找的数值
    arr.includes与arr.indexof都是使用严格相等===比较
    方法 includes 可以正确的处理 NaN
    （原文照引：`arr.indexOf(NaN)` 得 -1，`arr.includes(NaN)` 得 true）
13. arr.reverse 颠倒数组
14. arr.split（字符串中的分割方式）将字符串分割成数组
    （调用空参数 eg. arr.split("") 会将字符串分割成字母数组）
15. arr.reduceRight与reduce类型，但是从右往左开始计算
16. Array.isArray能做到typeof做不到的判断数组
    eg Array.isArray([]) //true
17. 除sort（自动排列）外都支持thisArg

### AI 复核：你的笔记里有 4 处细节要修正

整体评价：**17 条里有 13 条完全准确**，包括几条容易被忽略的好点——第 2 条 `Array.from` vs spread 的区别、第 12 条 `includes` 处理 `NaN` 而 `indexOf` 不行、第 16 条 `Array.isArray` 补 `typeof` 的短板，这些是书上的边角信息，你抓住了。

下面 4 处是"记住了结论，但机制差一点"：

| # | 你写的 | 精确说法 |
|---|---|---|
| 6③ | 把 `IIFE` 归进"`var` 与 `let` 的区别" | IIFE 不是 var/let 的区别。它是 **`let` 出现之前**用来"人工制造块作用域"的老手段（`(function(){...})()`）。现在有了 `let`，IIFE 基本只剩"避免污染全局"这一个用途。归类到 var/let 区别里会让你在面试时讲错因果 |
| 8 | `arr.splice(start, end, elem1)` | `splice` 的第二个参数是**删除几个**（`deleteCount`），**不是结束下标**；而 `slice(start, end)` 的第二个参数才是结束下标（且不含 end）。这是最经典的一对混淆点，务必分清 |
| 12 | `includes` 和 `indexOf` "都使用严格相等 ===" | 准确说：`indexOf` 用 `===`，`includes` 用 **SameValueZero**——两者唯一的差别就是 `NaN`（`===` 认为 `NaN !== NaN`，SameValueZero 认为相等）。你已经记下了这个现象，把机制补上就完整了 |
| 14 | 把 `split` 列在 `arr.` 下面 | `split` 是**字符串的方法**（`String.prototype.split`），不是数组方法。它之所以容易记混，是因为它**返回**数组，而且和 `arr.join()` 互为逆操作（`"a-b".split("-")` ↔ `["a","b"].join("-")`） |

另外两处小笔误（不影响理解，顺手记）：第 3 条 `Object.assign` 的目标对象书上叫 `dest`（你写 `rest`，容易和"rest 参数"混）；第 7 条 `error.messsage` 三个 s，是 `error.message`。

---

## 卡在哪里（你的原文）

1. spread语法与rest参数中...变量的区分
2. var与let关于块作用域中的细节部分（遇到setTimeout等情况下，变量i的for循环下var采用全局作用域而let采用每个单独的i，每次循环创造一个单独的i

### AI 补注

**你第 1 条那个困惑，一句话就能解决：`...` 是同一个符号，位置决定含义。**

```
函数【定义】的参数位置   →  rest（收集）   function f(...args) { }        // args 是数组
解构【左侧】            →  rest（收集）   const [a, ...rest] = [1,2,3]
函数【调用】的参数位置   →  spread（展开） f(...args)
数组/对象【字面量】里    →  spread（展开） [...arr]  { ...obj }
解构【右侧】            →  spread（展开） const arr2 = [...arr]
```

口诀：**"收集"出现在"接收方"（定义参数、解构左边），"展开"出现在"提供方"（调用、字面量）**。你昨天写的 `function showName(firstname, secondname, ...titles)` 是收集，`[...arr]` 是展开——同一个符号，两种方向。

**你第 2 条的理解是对的**，补一个精确说法：`var i` 只有一个变量（循环结束是 3），所有回调共享它；`let i` 每次迭代创建一个**新的绑定**并复制当前值，所以三个回调各自拿到 0、1、2。这个机制来自规范里的"per-iteration environment"。

### 但今天真正卡住的地方在这一条

**四个裸写函数一个都没写成，其中 `debounce` 是"看不懂要求、无从下手"。**

归因（重要，**这不是能力问题**）：防抖 = `setTimeout`（计时）+ 返回包装函数（闭包）。拆开看：

- **闭包那半你已经会了** —— 今天写的 `sum(a)(b)`、`byField`、`makeArmy` 全是"返回一个函数"；
- **`setTimeout` 那半 —— 三天的书单里从来没有出现过这一章。**

也就是说，你被一个**没教过的 API** 卡住了。javascript.info 官方那一章《装饰器模式和转发，call/apply》里的任务就叫**「防抖装饰器」和「节流装饰器」**——官方本来就有，只是计划书单没排进去。**这是计划的漏洞，不是你的问题。** 已修：计划 Day 4 最前面插入这两章。

另一个自我检查：**Day 3 指引里定的"14:30 检查点"没有被执行**。当时的预案是"如果 14:30 还没开始写四个函数，就把数组部分顺延到 Day 4、先保住四个函数"。结果是四个函数挂零、数组也没全部做完。下次遇到检查点，按预案执行，别硬扛。

---

## 踩过的坑（AI 复核时逐个实测确认）

1. **`console.log=[arr==arrCopy]` —— 等号写成了赋值。** 今天最危险的一个。
   `console.log = [...]` 是**合法语句**（给 `console` 的属性重新赋值），所以**不报错**，但它把 `console.log` 换成了数组。实测后果：这一行之后的**任何** `console.log(...)` 都会抛 `TypeError: console.log is not a function`，而报错位置在别处，极难查。
   正确写法：`console.log(arr === arrCopy);`
2. **同一作用域里 `let clone` 声明了两次**（`day02-clone.js` 第 6、9 行）。取消注释直接 `SyntaxError`。
3. **`for (let clone in abj)` 不是拷贝**：`for...in` 拿到的是**键名**（字符串 `"name"`），所以 `clone` 是字符串不是新对象。手写浅拷贝的正确形态：
   ```js
   const clone = {};
   for (const key in abj) { clone[key] = abj[key]; }
   ```
4. **扁平对象证明不了"只复制第一层"**（今天三处都是这个问题）。实测：
   ```js
   const nested = {name:'John', address:{city:'NY'}};
   const copy = {...nested};
   copy.address.city = 'LA';
   console.log(nested.address.city);   // 输出 'LA' —— 原对象被改了！
   ```
   必须是这种**嵌套对象**，改副本后原对象跟着变，才叫证据。
5. **不可更新那段"做了但证明不了"**：`arr.toSorted()` / `toReversed()` / `with()` / `toSpliced()` 都是**只调用、没接住返回值**，然后打印 `arr`，四次都只打印原数组，看不出任何效果。要写成 `const sorted = arr.toSorted(); console.log(sorted); console.log(arr);`（实测 `sorted = [1,3,4,5]`，`arr` 仍是 `[1,5,3,4]`）。
6. **`day02-scope.js` 第 26–28 行，两个箭头函数之间少了逗号**，取消注释会 `SyntaxError`。这不是"写法差异"，是语法错误。
7. **整份 `day02-scope.js` 全是注释，没跑过**（第 3 次同类问题）。写完一定要 `node` 跑一遍。
8. 顺手记一条**不是错**的：`Math.floor(styles.length-1)/2` 我实测过，对奇数长度**结果正确**（不是 bug），但括号位置容易看错，建议写成 `Math.floor((styles.length - 1) / 2)`。另 `console.log(styles.shift)` 少了括号会打印函数本身（该行被注释了，没造成后果）。

---

## 欠账登记（按计划 §四 的规则）
| 欠什么 | 补在哪天 |
|---|---|
| 裸写 `debounce`（支持 `immediate`） | 9/14（Day 4） |
| 裸写 `throttle`、`curry`、`clone` 深克隆 | 9/15（Day 5） |
| 数组清单第 7、8 项重做（`toSorted` 要接住返回值、`structuredClone` 换嵌套对象） | 9/14（Day 4） |
| LeetCode 1 题 | 第 1 周暂不做，从第 2 周起恢复每天 1 题 |

合计约 **0.7 天**。计划已做「第二次重排」：**结束日从 10/11 顺延到 10/12**，第 2–4 周整体后移 1 天。规则见计划 §四「进度看板与再计划机制」。

## 明天第一件事（9/14，Day 4）
主题：**拆掉"无从下手"的墙 —— 前置两章 + 裸写 `debounce`**
1. 读《调度：setTimeout 和 setInterval》+《装饰器模式和转发，call/apply》（官方任务就叫「防抖装饰器」）
2. 重做数组清单第 7、8 项
3. 关掉答案，自己裸写 `day02-debounce.js`

（Day 4 故意排得比平时轻——目的是把"无从下手"这堵墙拆掉。如果顺利，把 Day 5 的 `curry` 提前做。）

## 代码 / 命令备忘
```powershell
# 五个文件都入库了，但全是注释，一行都不执行
node week1-language/day02-scope.js        # 无输出 = 都是注释

# 收尾
git add -A
git commit -m "day03: array methods, scope drills, log the debounce blocker"
git push
```
