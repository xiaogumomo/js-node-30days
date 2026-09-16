# Day 6 任务书：`this` / 原型链 / `class`

> **日期**：2026-09-17（周四）　**主题**：`this` 绑定 + 原型链 + `class` + 数组 polyfill
> **对照计划**：`js-node-30day-plan.md` §四 第 1 周 Day 6
> **今天的第一件事不是学新东西**：Day 5 还有约 30 分钟收尾（日志三节 + 一条测试 + 三个自测题 + 读测试文件）。**先补完再进新内容**——按你计划的规则，欠账不清不动新章节。

---

## 〇 开工前 5 分钟：把产出物抄在纸上

| # | 产出物 | 验收标准 |
|---|---|---|
| 0 | **Day 5 欠账 4 件**（见第二节） | 全部打勾（约 30 分钟） |
| 1 | `week1-language/day06-this.js` | 四种 `this` 绑定的演示跑出来，且能对上第三节的对照表 |
| 2 | `week1-language/day06-prototype.js` | 手写原型继承 + 用 `class` 重写 + 字段初始化顺序演示 |
| 3 | `week1-language/day06-array-utils.js` | `node week1-language/day06-array-utils-verify.js` → **通过 17 项，失败 0 项** |
| 4 | 工具箱新增第 5 个模块 | `p0-toolkit/src/arrayUtils.js` + `test/arrayUtils.test.js`，`pnpm test` 全绿 |
| 5 | 日志 + commit + push | —— |

---

## 一 时间表（从 10:30 起排）

| 时间 | 干什么 | 产出 |
|---|---|---|
| **10:30–11:00** | **Day 5 欠账收尾（4 件）** | 产出物 0 |
| 11:00–12:00 | 读《对象方法，"this"》+《深入理解箭头函数》+ 写 `day06-this.js` | 产出物 1 |
| 12:00–13:30 | 午休，不碰屏幕 | —— |
| 13:30–14:40 | 读《原型，继承》+《class 基本语法》+《类继承》+ 写 `day06-prototype.js` | 产出物 2 |
| 14:40–15:00 | 休息 | —— |
| **15:00–15:45** | **裸写 `myMap` / `myFilter` / `myReduce`** + 跑脚手架 | 产出物 3 |
| 15:45–16:30 | 搬进工具箱 + 写测试 | 产出物 4 |
| 16:30–17:00 | AI review + 英文 15 分钟 + 日志 + commit + push | 产出物 5 |

---

## 二 10:30–11:00 先收尾 Day 5（4 件，约 30 分钟）

- [ ] **① 补写 `notes/day05.md` 的三节**（`学会了什么` / `卡在哪里` / `踩过的坑`）—— 文件里已经预填了**素材清单**，照着展开写，5 分钟
- [ ] **② 自己加一条 `throttle` 测试** → 在 `p0-toolkit/test/throttle.test.js` 里测「`throttle` 首次调用立刻执行」
  - 提示：**不需要 `async`/`await`**（首次调用是同步执行的），照抄 `debounce.test.js` 里 immediate 那条的形状
  - 目标：`cd week1-language/p0-toolkit && pnpm test` → `tests 18 / pass 18`
- [ ] **③ 回答三个 CJS/Promise 自测题**（讲给 AI 听，讲不清就说明还没懂）
  - (a) 为什么 `day02-throttle.js` 里的 `let last = 0` 和 `day02-curry.js` 里的 `adj` 变量名不冲突？
  - (b) 测试文件为什么能 `require` 到 `debounce`？`require` 的三个动作分别是什么？
  - (c) `module.exports = { debounce }` 和 `exports = { debounce }` 有什么区别？为什么后者是空的？
- [ ] **④ 读一遍 `p0-toolkit/test/` 下的 4 个测试文件**（你计划的红线：不能逐行解释的代码不许留在仓库里）

---

## 三 11:00–12:00 `this`（产出物 1）

### 阅读（约 40 分钟）

| 章节 | 覆盖 |
|---|---|
| [对象方法，"this"](https://zh.javascript.info/object-methods) | 方法中的 `this`、"`this` 不受限制"、**箭头函数没有自己的 `this`** |
| [深入理解箭头函数](https://zh.javascript.info/arrow-functions) | 箭头函数没有 `this` / 没有 `arguments` / 不能 `new` / 与 `bind` 的区别 |

### 一句话规则（背下来）

> **`this` 由"调用点的写法"决定，不由"函数在哪定义"决定。**
> **唯一例外是箭头函数** —— 它没有自己的 `this`，永远取定义处外层的那个。

### 四种绑定 + 实测对照表

写 `day06-this.js`，把这四种都演示一遍，输出要能对上这张表（**这张表是我实测的，不是书上抄的**）：

| 调用写法 | `this` 是谁 | 实测输出 |
|---|---|---|
| `f()` 普通调用 | 非严格：全局对象；严格：`undefined` | `globalThis` / `undefined` |
| `obj.f()` | `obj` | `obj` |
| `f.call(x)` / `f.apply(x)` / `f.bind(x)()` | `x` | `obj` |
| `new F()` | 新造出来的那个对象 | `new 出来的` |

**一个容易搞错的细节**：严格与否看**函数自己**有没有 `'use strict'`，**不看谁调用它**。实测：

```
非严格函数 sloppy()    → globalThis
严格函数   strictFn()  → undefined      ← 差别只在函数自己那一行声明
```

### 箭头函数（实测）

| 检查点 | 结果 |
|---|---|
| 箭头函数里的 `this` | 取定义处外层的，**`call` 改不动它** |
| 普通方法被"偷走"再调 | `stolen.call({name:"别人"})` → `别人`（普通方法的 `this` 能被 `call` 改） |
| 箭头函数有 `arguments` 吗 | **没有** —— 访问到的是外层的。你 9/12 写过 `()=>f.apply(this, arguments)`，那里的 `arguments` 就是外层的 |

### 必须回答的问题：你自己代码里那个 `this` 到底是谁

```js
function curry(fn) {
  return function collect(...adj) {
    if (adj.length >= fn.length) return fn.apply(this, adj);   // ← 这里的 this 是谁？
    return function agcollect(...nextadj) {
      return collect.apply(this, adj.concat(nextadj));         // ← 这里呢？
    }
  }
}
```

**提示**：`curry(add3)(1)(2)(3)` 里，`collect(1)` 是**普通调用**（不是 `obj.collect(1)`），所以按上面第一行——它是 `globalThis`（非严格）或 `undefined`（严格）。

**再问一层**：`agcollect` 是个普通函数（有自己的 `this`），而它被调用时也是普通调用……那 `collect.apply(this, ...)` 转发过去的到底是什么？

**最后一问（关键）**：既然 `this` 是 `globalThis`，**为什么你的 `curry(add3)(1)(2)(3)` 还是算出了 6？**
（答案藏在 `add3` 的定义里。想通了，你就明白 `apply` 存在的意义了。）

---

## 四 13:30–14:40 原型链 + `class`（产出物 2）

### 阅读（约 50 分钟）

| 章节 | 覆盖 |
|---|---|
| [原型，继承](https://zh.javascript.info/prototype-inheritance) | `prototype`、`__proto__`、原型链查找规则 |
| [class 基本语法](https://zh.javascript.info/class) | `class` 语法糖、`constructor`、类字段、`this` |
| [类继承](https://zh.javascript.info/class-inheritance) | `extends`、`super`、方法重写、**字段初始化顺序** |

### 要演示的 + 实测对照表

写 `day06-prototype.js`，输出对上这张表：

| 检查点 | 实测结果 |
|---|---|
| `typeof class A {}` | `'function'` ← **Day 1 的 Q7 答案**，这就是"class 是语法糖"的证据 |
| `a.__proto__ === Animal.prototype` | `true` |
| `Object.getPrototypeOf(a) === Animal.prototype` | `true`（**推荐用这个**，`__proto__` 是历史遗留，面试时用 `getPrototypeOf` 更专业） |
| 原型链顶端 | `a` → `Animal.prototype` → `Object.prototype` → `null` |
| `a.speak()` 能找到方法吗 | 能找到 —— 这就是"原型链查找"：对象上没有，就往 `__proto__` 上找 |

### 字段初始化顺序（实测，派生类）

```js
class Base { baseField = (...); constructor() {...} }
class Derived extends Base { derivedField = (...); constructor() { super(); ... } }
new Derived();
```

实测输出顺序：

```
1) Base 字段初始化
2) Base 构造函数体
3) Derived 字段初始化
4) Derived 构造函数体（super 之后）
```

**为什么是这个顺序**（面试会问）：派生类的字段初始化必须等 `super()` **返回之后** —— 因为在那之前 `this` 还不存在，没有对象可以挂字段。所以是"基类整个走完 → 才轮到派生类自己的字段 → 然后才是派生类构造函数剩下的部分"。

**顺便验证一件事**：在派生类构造函数里，`super()` 之前访问 `this` 会发生什么？（自己试，会抛错——这是"派生类必须先调 super"的原因）

### 手写 vs `class`

计划里的要求是：**先用原型手写一遍继承，再用 `class` 重写**。两边都要能跑出同样的结果。

`class` 版本就是语法糖，等价于"构造函数 + 往 `prototype` 上挂方法 + 用 `Object.create` 接上原型链"。**你手写完一遍，再看 `class` 版本，就会明白那句"class 是语法糖"到底是什么意思。**

---

## 五 15:00–15:45 数组三个方法的 polyfill（产出物 3）

### 需求

```js
myMap(arr, fn)            // 返回新数组：每个元素经过 fn 处理
myFilter(arr, fn)         // 返回新数组：只留 fn 返回真值的元素
myReduce(arr, fn, init)   // 返回累计值；init 可以不传
```

### 写之前想清楚三件事（都是内置方法的行为，**可以先用 `node` 验证**）

1. **回调收到什么参数？**
   - `map` / `filter`：`(元素, 下标, 原数组)`
   - `reduce`：`(累计值, 元素, 下标, 原数组)`
2. **`reduce` 的初始值不传时，起点是什么？**（先自己猜，再用 `node` 验证）
3. **三个方法都不该改动原数组** —— 这是"纯函数"的表现，也是它们和 `sort`/`splice` 的分界线（你 Day 4 学过这对区别）

### 写完跑脚手架

```powershell
node week1-language/day06-array-utils-verify.js
```

目标：**通过 17 项，失败 0 项**。最后有个**边界探针**，会给你看 `reduce` 在"空数组 + 不传初始值"时的规范做法（内置是**抛错**，不是返回 `undefined`）。

### 15:45–16:30 搬进工具箱（产出物 4）

```
p0-toolkit/
  src/arrayUtils.js            ← 搬过去 + module.exports
  test/arrayUtils.test.js      ← 写测试（照抄现有测试文件的形状）
```

**一个面试加分项**：**绝对不要往 `Array.prototype` 上加方法**（比如 `Array.prototype.myMap = ...`）。给内置原型加东西叫"污染内置原型"，会让所有人的数组都多出一个属性——这是公认的反面教材。所以工具箱里导出的是**接收数组当参数的函数**（`myMap(arr, fn)`），不是改原型。

写测试时注意：**这三个函数是纯同步的，不需要 `async`/`await`**（回想 Day 5 那张表：只有涉及定时器的才要等）。

---

## 六 今天的完成标准

- [ ] Day 5 欠账 4 件全部打勾
- [ ] `day06-this.js` 输出能对上四种绑定的对照表，且能回答"那个 `this` 是谁"
- [ ] `day06-prototype.js` 手写版 + `class` 版都能跑出同样结果，字段初始化顺序 4 步输出正确
- [ ] `day06-array-utils-verify.js` → **17/17**
- [ ] `p0-toolkit` 新增 `src/arrayUtils.js` + `test/arrayUtils.test.js`，`pnpm test` 全绿
- [ ] 能口头回答："`this` 由什么决定？箭头函数的 `this` 为什么不听话？"
- [ ] 能口头回答："`class` 是语法糖，糖在哪？"
- [ ] 日志 + commit + push

---

## 七 如果时间不够：砍单顺序

**保底**

1. **Day 5 欠账 4 件** —— 绝不砍（按规则，欠账不清不动新章节）
2. `this` 的四种绑定 + 那个问题 —— 绝不砍，它是今天最容易在面试里被问倒的一块
3. `myMap` / `myFilter` / `myReduce` 脚手架 **17/17** —— 绝不砍
4. 日志 + commit + push

**可以顺延（登记进 `notes/day06.md` 的欠账表）**

5. `day06-prototype.js` 的 `class` 重写部分（先只做原型版，`class` 版挪到明天早上）
6. 工具箱的 `arrayUtils` 模块 + 测试（先只跑通脚手架，搬运放到明天）
7. 英文 15 分钟、AI 协作的第 3 个动作

**关键检查点 14:40**：如果那时 `this` 还没写完演示，就把原型链那一章的阅读压到 30 分钟、先保住 array polyfill 的裸写时段。

---

## 八 今天不碰什么

- **异步三件套（`Promise` / `async`）/ 微任务宏任务** —— **明天（Day 7）**，连 CommonJS 基础一起讲
- **ESM / `type: module` / `exports` 字段** —— Day 8
- **TypeScript / Vitest** —— Day 8
- **`instanceof`、原生原型、Mixin、私有字段** —— 今天的 `class` 章节里属于"扩展阅读"，时间不够就跳，第 2 周遇到再补

---

## 九 明天的锚点

Day 7 主题：**异步三件套 + 模块系统**，包括：

- **① CommonJS 基础**（`module.exports` / `require` 的三个动作 / 缓存 / `exports` 的坑）—— 今天你已经在用了，明天补原理
- ② 回调 → Promise → async/await 的演进动因、微任务 vs 宏任务、`Promise.all` 家族
- ③ ESM vs CJS 的机制差异

所以今天写 `arrayUtils.js` 时，那个 `module.exports` 你**继续照抄**就行——**明天你会知道它每一行在干什么。**
