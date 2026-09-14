# Day 4 学习指引：拆掉"无从下手"的墙 —— 定时器 + 装饰器 + 裸写 debounce

> **日期**：2026-09-14（周一）　**主题**：前置两章 + 裸写 `debounce`
> **对照计划**：`js-node-30day-plan.md` §四 第 1 周 Day 4
> **今天的设计意图**：昨天卡死的原因是 `setTimeout` 从没被教过。所以今天**故意排轻**（核心约 3 小时）——唯一目标是把"无从下手"这堵墙拆掉，把节奏找回来。**核心部分做完，今天就算成功**，第二阶段的加量是可选的。

---

## 〇、开工前 5 分钟：把今天的产出物抄在纸上

| # | 产出物 | 验收标准（跑出来才算数） |
|---|---|---|
| 1 | `week1-language/day02-debounce.js` | `node week1-language/day04-debounce-verify.js` 输出 **通过 6 项，失败 0 项** |
| 2 | `week1-language/day03-array-methods.js`（补第 7、8 项） | 第 7 项：`toSorted` 等四个方法都**接住返回值**，并打印原数组证明没变；第 8 项：`structuredClone` 换成**嵌套对象**，改副本后原对象不受影响 |
| 3 | `notes/day04.md` + commit + push | 日志 3 行，至少 1 次 commit |
| 4 |（可选）`week1-language/day02-clone.js` 深克隆 | 手写递归版能处理嵌套对象、数组、`null`；并证明它遇到循环引用会栈溢出 |
| 5 |（可选）`week1-language/day02-curry.js` | `curry(f)(1)(2)(3)` 收够才调用；注释写清 `fn.length` 陷阱 |

**第 1、2、3 项是今天的必交。第 4、5 项是第二阶段的加量，精力不够就直接跳过。**

---

## 一、时间表（从 08:10 起排）

| 时间 | 干什么 | 产出 |
|---|---|---|
| 08:10–08:20 | 抄产出物清单 + 看一遍 `notes/day03.md` 的错题 | —— |
| **08:20–09:00** | 读《调度：setTimeout 和 setInterval》+ 动手敲示例 | 能回答第二节的 4 个问题 |
| **09:00–09:50** | 读《装饰器模式和转发，call/apply》+ 官方任务「防抖装饰器」 | 先自己试 15 分钟，再看答案 |
| 09:50–10:00 | 休息 | —— |
| **10:00–10:40** | 重做数组清单第 7、8 项 | 产出物 2 |
| 10:40–11:00 | 休息 | —— |
| **11:00–12:00** | **关掉答案，裸写 `debounce`** + 跑验证脚手架 | 产出物 1 |
| 12:00–13:30 | 午休，不碰屏幕 | —— |
| **13:30–14:00** | 写 `notes/day04.md` 三行日志 + commit + push | 产出物 3 |
| —— | **核心部分到此结束。以下可选** | —— |
| 14:00–15:30 |（可选）修 `day02-clone.js` 的深克隆 | 产出物 4 |
| 15:30–17:00 |（可选）写 `curry`（Day 5 内容提前） | 产出物 5 |
| 17:00–17:30 |（可选）AI 协作：让 AI review 今天的代码 | 记下漏洞，自己改 |

> 14:00 收工是一个**完整的 Day 4**，不是半途而废。今天的目标是"干净地完成一次"，不是堆量。

---

## 二、08:20–09:00 读《调度：setTimeout 和 setInterval》

章节：<https://zh.javascript.info/settimeout-setinterval>（约 20 min 阅读 + 20 min 动手）

### 读的时候把这 4 个问题记在纸上

1. `setTimeout(func, delay, ...args)` **返回什么**？怎么取消它？（关键词：`clearTimeout`）
2. `setInterval` 有一个什么先天缺陷，导致官方推荐用**嵌套的 `setTimeout`** 代替它？
   （提示：如果函数自己执行的时间比间隔还长，会发生什么？）
3. `setTimeout(func, 0)` 是"立即执行"吗？它和"排在当前同步代码后面"是什么关系？
4. 官方任务「**setTimeout 会显示什么？**」——先自己写出输出顺序，再运行验证。

### 这一段的核心结论（读完自己核对一遍）

- `setTimeout` **返回一个 timer id**，把它存起来（通常用闭包保存）才能 `clearTimeout` 取消 —— **这正是 `debounce` 的骨架**。
- `setInterval` 会让回调"堆积"：如果回调执行耗时 > 间隔，下一次会紧接着来。**嵌套 `setTimeout`**（在回调里再排一次）能保证两次执行之间至少隔 `delay`。
- "零延时"**不等于**立即执行：同步代码永远先跑完，定时器排在后面。

> 你昨天卡住的地方就是这一章。读完回来再看 `debounce` 的需求，应该会有"原来是这个"的感觉。

---

## 三、09:00–09:50 读《装饰器模式和转发，call/apply》

章节：<https://zh.javascript.info/call-apply-decorators>（约 30 min + 官方任务 20 min）

### 读法（重要，别直接翻答案）

1. 先读正文：`透明缓存` → `func.call` → `传递多个参数` → `func.apply` → `借用一种方法` → **`装饰器和函数属性`**。
2. 读到「任务」时，**先自己做「防抖装饰器」15 分钟**，写不出来再看答案。
3. **看完答案不算完成。** 昨天的教训是"照答案抄 = 没学会"。今天的完成标准是：**关掉答案，自己默写一遍，并通过验证脚手架。**
4. 看完答案时，重点看一件事：**它把 `timer` 存在哪个作用域上？**（这就是你昨天问的"为什么 timer 要在闭包外层"）

### 这一章和你已经会的东西的关系

**装饰器 = 接收一个函数、返回一个新函数。** 这个模式你早就用过了，只是没人告诉你名字：

| 你已经写过的 | 是什么 |
|---|---|
| `sum(a) { return (b) => a + b }` | 返回函数的函数（柯里化的雏形） |
| `byField(fieldname) { return (a,b) => ... }` | 返回比较函数的"函数工厂" |
| `inBetween(a,b) { return (x) => ... }` | 返回筛选函数 |
| `makeArmy()` | 返回函数数组 |

**`debounce` / `throttle` / `curry` 都只是它的三个应用。** 所以今天写的其实是一个模式，不是三个新东西。

### 两个要留意的点

- **`call` vs `apply`**：都是"指定 `this` 去调用"，区别只是参数怎么传（`func.call(ctx, a, b)` vs `func.apply(ctx, [a, b])`）。包装函数会把原来的 `this` 弄丢，所以要转发。
- **`装饰器和函数属性` 是这一章最容易被跳过、但今天最该看的一节**：包装之后，原函数的属性（比如 `length`、`name`）会**丢**。这一点直接关系到明天 `curry` 里 `fn.length` 的陷阱——今天先留个印象，明天会用到。

---

## 四、10:00–10:40 重做数组清单第 7、8 项

昨天这两项"做了但证明不了"，今天补上。文件：`week1-language/day03-array-methods.js`。

### 第 7 项：不可更新演示要"接住返回值"

昨天你写的是：

```js
let arr = [1,5,3,4];
arr.toSorted();          // ← 结果被丢掉了
console.log(arr);        // 四次都打印原数组，看不出任何效果
```

今天改成（四个方法 `toSorted` / `toReversed` / `with` / `toSpliced` 每个都这样写）：

```js
const arr = [1,5,3,4];
const sorted = arr.toSorted();
console.log('新数组:', sorted);   // [1,3,4,5]
console.log('原数组:', arr);      // [1,5,3,4] ← 没变，这才叫证明
```

**并且加一组对照**：同样用 `sort()`（原位方法）跑一遍，打印原数组 —— 你会看到原数组**被改了**。这一对照就是"为什么不可变更新更安全"的证据。

### 第 8 项：`structuredClone` 要换成嵌套对象

昨天的对象是 `{name:'John', age:18}`，太扁了 —— 扁平对象用 `{...obj}` 也能"看起来没影响"，证明不了"深"。

今天写一组**三连对比**（这是深浅拷贝最锋利的一刀）：

```js
const nested = { name: 'John', address: { city: 'NY' } };

// ① 展开运算符（浅拷贝）：改副本的嵌套属性
const shallow = { ...nested };
shallow.address.city = 'LA';
console.log('① 浅拷贝后原对象:', nested.address.city);   // 'LA' ← 原对象被改了！

// ② structuredClone（深拷贝）：同样改副本的嵌套属性
const deep = structuredClone(nested);
deep.address.city = 'SH';
console.log('② 深拷贝后原对象:', nested.address.city);   // 'SH'（上一步已改成 LA，这里应该保持不变）
```

③ 再加一条：`JSON.parse(JSON.stringify(x))` 遇到**循环引用**会抛 `TypeError`，而 `structuredClone` 能正常处理 —— 昨天我实测过，可以自己复现。

---

## 五、11:00–12:00 关掉答案，裸写 `debounce`

**规则：关掉所有 AI 补全，关掉官方答案。写不出来就查 MDN 的 `setTimeout` 页面，不查 AI。**

### 需求

```js
debounce(fn, delay, immediate = false)
```

- 连续调用多次，`fn` 只在最后一次调用之后等 `delay` 毫秒执行 1 次
- `delay` 没到就再次调用 → **重新计时**
- `immediate: true` → 第一次调用立刻执行，之后 `delay` 内的调用被忽略
- 想清楚"`immediate` 模式下返回什么"，把约定写进注释

### 写完之后：跑验证脚手架

```powershell
node week1-language/day04-debounce-verify.js
```

目标输出：**通过 6 项，失败 0 项**。这个脚手架我写好了（按计划 §一，"测试允许让 AI 写"），它会自己喊 5 次、数原函数执行了几次，也会测 `immediate` 和参数透传。

它需要你的文件做两件事：

1. 用 `function debounce(...)` 或 `const debounce = ...` 定义；
2. 文件最后加一行 `module.exports = { debounce };`
   （`module.exports` / `require` 是 CommonJS 的写法，**Day 7 会正式讲**，今天照抄这一行就行 —— 你 9/12 写过的 `require('node:readline/promises')` 就是同一套东西）

如果脚手架报"读不到你的实现"，先检查这两件事，再看代码逻辑。

### 三条自检（比脚手架更重要）

1. `timer` 变量存在**哪一层**？为什么不能写在返回的那个函数**里面**？（这题面试会问）
2. `immediate` 模式下，你怎么判断"这是第一次调用"？
3. 你用了 `fn()` 还是 `fn.apply(...)` / `fn(...args)`？如果原函数需要参数，你的实现能透传吗？（脚手架用例 4 会测）

---

## 六、第二阶段（可选，14:00 之后，按精力决定）

### 产出物 4（可选）：修 `day02-clone.js` 的深克隆

昨天浅拷贝的三处问题（`console.log=` 赋值、重复 `let clone`、`for...in` 不是拷贝）在 `notes/day03.md` 里。今天顺手做掉深克隆：

- 手写递归版 `deepClone(obj)`，必须处理：嵌套对象、**数组**、`null`（`typeof null === 'object'` 的坑，Day 1 的 Q1 复活）
- 证明它遇到**循环引用**会栈溢出，而 `structuredClone` 不会
- **把局限写进注释** —— 这段注释明天直接进 `p0-toolkit` 的 README

### 产出物 5（可选）：写 `curry`（Day 5 内容提前）

为什么可以提前：`curry` 和 `debounce` 是**同一个模式**（接收函数、返回新函数），今天读完装饰器那一章正是最热的时候。

- `curry(fn)`：`f(a,b,c)` → `f(a)(b)(c)`
- 用 `fn.length` 判断参数收够了没有
- **陷阱题**：昨天说的"装饰器会让 `fn.length` 丢失"在这里生效 —— `curry` 里拿到的如果是**被包装过**的函数，`fn.length` 可能是 0。想清楚这点并写进注释

---

## 七、今天的完成标准

**必交（这 4 条全打勾，Day 4 就算成功）**

- [ ] 第二节的 4 个问题能口头回答（`setTimeout` 返回什么、`setInterval` 的缺陷、"零延时"的真相、任务题的输出顺序）
- [ ] `day04-debounce-verify.js` 输出 **通过 6 项，失败 0 项**
- [ ] 数组第 7 项：四个不可变方法都接住返回值 + `sort()` 的对照，两组都打印了原数组
- [ ] 数组第 8 项：`structuredClone` 换成嵌套对象，三连对比写出来了
- [ ] `notes/day04.md` 三行日志 + commit + push

**加分（可选）**

- [ ] 手写深克隆能处理嵌套对象/数组/`null`，且证明了循环引用会栈溢出
- [ ] `curry` 写出来，注释里写清 `fn.length` 陷阱

---

## 八、今天不碰什么

- **`this`、原型链、`class`** —— Day 6
- **Promise / async-await / 事件循环** —— Day 7（你的探索 TODO 第 1 条在这里解决）
- **ESM/CJS 的原理** —— Day 7。今天只照抄 `module.exports` 那一行
- **TypeScript** —— Day 8

想探索的，写进 `notes/day04.md` 的「探索 TODO（非清单，不许插队）」。

---

## 九、明天（Day 5）会用到今天的什么

Day 5 主题：**四个函数收齐 + `p0-toolkit` 立项**
- 写 `throttle` / `curry` / `clone` 深克隆（如果今天没提前做）
- 把四个函数装进 `p0-toolkit`（JS 版），配 Vitest 先写 ≥6 个测试

所以今天写的 `debounce` 请把**注释和局限写清楚**——明天它直接进工具库。
