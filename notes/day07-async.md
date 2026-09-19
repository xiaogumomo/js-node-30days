# Day 7 任务书：清 Day 6 欠账 + 进入异步（Promise 前半）

> **日期**：2026-09-19（周六）
> **今天按 3～4 小时排** —— 这是「选 A」的执行方式：**每天只放 3～4 小时的量、把清单划干净**，多出来的内容推到下一天、由日期吸收。
> **今天不追求把 Day 7 做完。** Day 7 原本写的内容（异步三件套 + 模块系统）会拆成两段，今天只做前半。
> **对照计划**：`js-node-30day-plan.md` §四 第 1 周 Day 7

---

## 〇 开工前 5 分钟：把产出物抄在纸上

| # | 产出物 | 验收标准 |
|---|---|---|
| 0 | **Day 6 欠账 5 件**（见第二节） | 全部打勾（约 2.5 小时） |
| 1 | `week1-language/day06-prototype.js` | 语法通过 + **手写原型继承 vs `class` 重写，两边跑出同样结果** + 字段初始化 4 步 |
| 2 | `week1-language/day06-array-utils.js` | `day06-array-utils-verify.js` → **通过 17 项** |
| 3 | 工具箱第 5 个模块 | `p0-toolkit/src/arrayUtils.js` + 测试，`pnpm test` 全绿 |
| 4 | `week1-language/day07-promise.js` | 同一个任务的**三种写法对照**（回调 → Promise → `async/await`） |
| 5 | 日志 + commit + push | —— |

---

## 一 时间表（从 10:20 起排）

| 时间 | 干什么 | 产出 |
|---|---|---|
| **10:20–10:30** | 补 `notes/day06.md` 的「学会了什么」第 2、3 条 | 5 分钟的事，别忘 |
| **10:30–11:00** | 修 `day06-prototype.js` 语法 + **手写原型继承 vs `class` 重写** | 产出物 1 上半 |
| 11:00–11:30 | 字段初始化顺序 4 步演示 | 产出物 1 下半 |
| **11:30–12:20** | **裸写 `myMap` / `myFilter` / `myReduce`** + 跑脚手架 | 产出物 2 |
| 12:20–13:40 | 午休，不碰屏幕 | —— |
| **13:40–14:20** | 搬进工具箱 + 跑测试 | 产出物 3 |
| 14:20–14:35 | 休息 | —— |
| **14:35–15:00** | **① CommonJS 自测**（15 分钟）+ 开始 Day 7 阅读 | —— |
| **15:00–16:00** | 读《回调》+《Promise 》，写 `day07-promise.js` 第一段 | 产出物 4 |
| 16:00–16:20 | 日志 + commit + push | 产出物 5 |

**如果 16:00 还没到产出物 4，就停在那里**、登记欠账，明天接着做。这就是"选 A"的走法。

---

## 二 10:20–14:20 清 Day 6 欠账（5 件）

### ① 补 `notes/day06.md` 的「学会了什么」第 2、3 条（5 分钟）

第 1 条你写了并被核对过，**第 2、3 条还是空的**。素材就在同一份文件的「卡在哪里」和「AI 复核」两节里（两大根因、以及 `this` 的正确模型）。

### ② 完成产出物 2 缺的那一半（30 分钟）

任务书原话是「**先用原型手写一遍继承，再用 `class` 重写。两边都要能跑出同样的结果**」——`class` 部分你写了，**手写原型那半还没做**。

要写出这两段，并让它们输出一致：

```
手写版：  构造函数 + 往 prototype 上挂方法 + Object.create 接原型链
class 版： 同一个继承关系，用 extends / super 写
```

**验收**：两边都能 `new`、都能调用继承来的方法、`instanceof` 都为 `true`、输出一致。

### ③ 修 `day06-prototype.js` 的语法错误 + 补字段初始化 4 步（30 分钟）

**先跑这个**（它会直接告诉你第几行、哪个字符）：

```powershell
node --check week1-language/day06-prototype.js
```

要修的（我上次列过的）：

- **第 54 行 `this speed = 0;` 少了点号** ← 就是它让整个文件一行都不执行
- `consturctor` → `constructor`（拼错会让构造函数失效）
- `Rabbiit` → `Rabbit`；`earlength` / `earLength` 参数名要统一
- 派生类构造函数里**故意不调 `super()`**，看会抛什么错（这是要演示的东西，而且**这个错 `try/catch` 能抓到**——和语法错误不同）

然后补上**字段初始化顺序**的演示，输出应该是这 4 步：

```
1) Base 字段初始化
2) Base 构造函数体
3) Derived 字段初始化        ← 必须等 super() 返回，因为在那之前 this 还不存在
4) Derived 构造函数体（super 之后）
```

### ④ 裸写 `myMap` / `myFilter` / `myReduce`（50 分钟）

**关掉 AI 补全。** 需求在脚手架开头写着，另外三件事**先用 `node` 验证再写**：

1. 回调收到什么参数？`map`/`filter` 是 `(元素, 下标, 原数组)`；`reduce` 是 `(累计值, 元素, 下标, 原数组)`
2. `reduce` **不传初始值**时起点是什么？
3. 三个都不该改原数组

```powershell
node week1-language/day06-array-utils-verify.js     # 目标：通过 17 项
```

### ⑤ 搬进工具箱 + 跑测试（40 分钟）

```
p0-toolkit/src/arrayUtils.js       ← 从 day06-array-utils.js 【原样搬】（逻辑一个字不改）
p0-toolkit/test/arrayUtils.test.js ← 测试
```

```powershell
cd week1-language/p0-toolkit
pnpm test                          # 目标全绿（18 + 新增几条）
```

**⚠️ 关于测试文件谁写**：我可以给你写（属于你计划里允许的"AI 写测试"），**但要等你把 `src/arrayUtils.js` 放进去之后我再写** —— 现在提前写会让工具箱那 18 项已经绿了的测试**变红**（测试找不到模块就直接报错）。你到位了说一声。

**搬完跑两次验证，别只跑一次**：① `node week1-language/day06-array-utils-verify.js`（验证搬之前那份）② `pnpm test`（验证搬之后那份 + 新测试）。**只跑第二次的话，复制时手滑改坏的东西可能漏掉。**

---

## 三 14:35–15:00 Day 7 的 ①：CommonJS —— 你已经完成了，今天只自测

计划里 Day 7 的 ① 是「**CommonJS 基础**」（`module.exports` / `require` 的三个动作、缓存、`exports` 的坑）。**这一块你已经学完了** —— 证据在 `notes/day06.md` 里，你自己记录了：

- `require` 的三个动作（找到文件 / 执行一遍 / 返回 `module.exports`）
- `exports = {...}` 为什么不生效（分家）
- 分享范围的三层（同进程共享 / 跨进程重载 / 跨机器要发布）

所以今天只花 **15 分钟**：我给你出 3 道题口头答一遍，答得出来就划掉，答不出来就回去补那一段。

---

## 四 15:00–16:00 Day 7 的 ②：Promise 前半（今天只做这一半）

### 阅读清单（今天只读这 4 节）

| 顺序 | 章节 | 覆盖 | 时长 |
|---|---|---|---|
| 1 | [回调](https://zh.javascript.info/callbacks) | **为什么需要 Promise** —— 回调的痛点在哪 | 20 min |
| 2 | [Promise](https://zh.javascript.info/promise-basics) | `new Promise`、`then` / `catch` / `finally`；顺手做任务「**基于 promise 的延时**」 | 40 min |
| 3 | [Promise 链](https://zh.javascript.info/promise-chaining) | 为什么 `.then` 要返回 Promise、链式调用怎么串 | 30 min |
| 4 | [async/await](https://zh.javascript.info/async-await) | 它就是 Promise 的**语法糖**、`try/catch` 怎么写 | 30 min |

**今天不读（顺延到明天）**：

- [微任务（Microtask）](https://zh.javascript.info/microtask-queue) —— 微任务 vs 宏任务
- [Promise API](https://zh.javascript.info/promise-api) —— `Promise.all` / `allSettled` / `race` / `any`
- [使用 promise 进行错误处理](https://zh.javascript.info/promise-error-handling)

（你 Day 5 的探索 TODO 里那条 `async`，今天就是它的正式入口。）

### `day07-promise.js` 要写什么（四段）

**第 1 段：同一个任务，三种写法对照。** 任务就用你 9/12 那个"炒饭"（已经写过一版，今天补齐另外两种）：

```
回调版      buyfood(callback)  —— 把函数当参数传进去，3 秒后调用它
Promise 版  buyfood() 返回 new Promise，用 .then 拿结果
async 版    async function eat() { const food = await buyfood(); }
```

**三段要打印出同样的结果**，并排放在文件里——**这样"演进"才看得见**。

**第 2 段：`then` 链。** 把三步依次化（比如"点餐 → 等 3 秒拿到饭 → 吃饭"），用 `.then` 一路串下去。重点体会：**为什么能串**（`.then` 返回的还是 Promise）。

**第 3 段：用 `async/await` 改写同一个链。** 对比一下"套娃"和"顺序写法"的观感差异。

**第 4 段：错误处理。** 用你 9/12 写过的 `login` 例子（`resolve('登陆成功')` / `reject('登陆失败')`），对比：

- `.catch` 怎么接（Promise 版）
- `try/catch` 怎么接（`async/await` 版）

**跑起来才算数**（心法第 7 条）：`node week1-language/day07-promise.js`

---

## 五 今天的完成标准

- [ ] `notes/day06.md` 的「学会了什么」第 2、3 条补完
- [ ] `day06-prototype.js`：**语法通过**，手写原型继承与 `class` 重写两边输出一致，字段初始化 4 步输出正确
- [ ] `day06-array-utils-verify.js` → **17/17**
- [ ] `p0-toolkit/src/arrayUtils.js` + 测试到位，`pnpm test` 全绿
- [ ] `day07-promise.js`：三种写法对照能跑出同样结果
- [ ] 今天**至少一次** commit + push
- [ ] 日志 `notes/day07.md` 三行

**只要上面这些"跑出来"了，今天就合格** —— 不要求把 Day 7 做完。

---

## 六 如果时间不够：砍单顺序

**保底**

1. **Day 6 欠账全部清掉**（尤其 `day06-prototype.js` 的语法错误 —— 那是个"整个文件不执行"级别的坑，留着比任何欠账都麻烦）
2. 日志 + commit + push

**可以顺延（登记进 `notes/day07.md` 的欠账表）**

3. `day07-promise.js` 的第 3、4 段（`async/await` 改写、错误处理）
4. 工具箱的 `arrayUtils` 模块（先让脚手架 17/17，搬运放到明天）
5. CommonJS 的 15 分钟自测

**关键检查点 14:20**：如果那时 Day 6 欠账还没清完，**就今天只清欠账**、Day 7 的内容整段顺延。**这不是失败，这就是"选 A"的走法**——内容不丢，日期承担。

---

## 七 今天不碰什么

- **微任务 / 宏任务、`Promise.all` 家族** —— 明天（Day 7 后半）
- **ESM / `type: module` / `exports` 字段** —— Day 8
- **TypeScript / Vitest** —— Day 8
- **手写 `Promise`（A+ 规范那种）** —— 那是面试深挖题，第 3 周之后再说

---

## 八 明天的锚点

今天做完 = Day 7 的 ① + ② 前半。明天（9/20，Day 8）接：

- Day 7 后半：**微任务 vs 宏任务**、`Promise.all` 家族、ESM vs CJS 对比
- 然后才是 Day 8 原本的内容：**TypeScript 入门 + 周复盘 + 周自测**

**⚠️ 注意**：明天的周复盘是**测速点** —— 会重新算一次账（累计欠账每满 1 天就按规则顺延结束日）。所以今天"把清单划干净"比"多做一点"更有价值。
