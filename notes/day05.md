# Day 5 — 2026-09-15（周二）

> **状态：✅ 三项产出物全部通过（`throttle` 5/5、`curry` 12/12、`p0-toolkit` 17/17）**
> 任务书：[`day05-guide.md`](day05-guide.md)　｜　手机版：[`day05-phone.md`](day05-phone.md)
> 主题：**`throttle` + `curry` + `p0-toolkit` 立项**
> ⚠️ 本文的「学会了什么 / 卡在哪里 / 踩过的坑」三节**待补**（今天被琐事打断，已顺延 Day 6）。其余小节由 AI 按实测结果填好。

## 今日目标（必交 5 项 + 顺手 1 项）

- [x] 1. `week1-language/day02-throttle.js` —— `day05-throttle-verify.js` **通过 5 项**（两条路线都通过）
- [x] 2. `week1-language/day02-curry.js` —— `day05-curry-verify.js` **通过 12 项**
- [x] 3. `week1-language/p0-toolkit/` —— `package.json` + `README.md` + `src/`（4 个函数）+ `test/`
- [x] 4. 在 `p0-toolkit/` 下 `pnpm test` 全绿（**17 个用例，退出码 0**）
- [x] 5. 日志 + commit + push
- [x] 顺手：`day02-debounce.js` 头部那句 `immediate` 语义补完
- [ ] ⏸ **顺延 Day 6**：自己加的那条 `throttle` 测试、CJS/Promise 三个自测题、上面标「待补」的三节

## 今日产出
| 文件 | 内容 |
|---|---|
| [`week1-language/day02-throttle.js`](../week1-language/day02-throttle.js) | 节流，**两条实现路线都通过**：`throttle`（路线 A，比较时间戳）+ `throttleBySwitch`（路线 B，开关 + 定时器） |
| [`week1-language/day02-curry.js`](../week1-language/day02-curry.js) | 柯里化（`fn.length` 判断收够 + `adj.concat(nextadj)` 累加参数） |
| [`week1-language/p0-toolkit/`](../week1-language/p0-toolkit) | **第 1 周的第一个真实产出物**：`package.json` + `README.md` + `src/`（4 个函数）+ `test/`（17 个用例） |
| [`week1-language/p0-toolkit/README.md`](../week1-language/p0-toolkit/README.md) | 含 5 节：简介 / 快速开始 / 函数清单 / **已知限制** / 后续计划 |
| [`week1-language/p0-toolkit/test/`](../week1-language/p0-toolkit/test) | `node:test` 写的 4 个测试文件（3 + 4 + 6 + 4 = 17 条用例） |

**`pnpm test` 实测输出**：`ℹ tests 17 / ℹ pass 17 / ℹ fail 0`，退出码 0。

## 探索 TODO（非清单，不许插队）

> 已有归属：`step4.返回函数` → **今天已划掉**；`this` 指向 → **明天（Day 6）**；`async` → **Day 7**。
> 今天新增一条：**`require` / `module.exports`（CommonJS）** —— 建工具库时已经在用了，但没学过原理。已确认 **Day 7** 补，见下方「AI 复核」第三节。

-

## 学会了什么（待补 —— 今天的素材）

> 明天照这几条展开写就行（5 分钟）：
> 1. **两条节流路线的区别**：路线 A 比较时间戳（无副作用）；路线 B 用开关 + 定时器（每次执行会挂一个待触发的 `setTimeout`，实测让 Node 进程多活 `interval` 毫秒）
> 2. **`curry` 的核心是"累加"**：`adj.concat(nextadj)` 这一行是全部秘密——把上一层攒的参数和这次收到的合并
> 3. **`fn.length` 的两个坑**：`(a, b = 2, c) => {}` 的 `length` 是 **1**（第一个默认参数之后的不计入）；包装函数会让 `length` 变成 **0**（所以对 `debounce` 过的函数做 `curry` 永远收不够）
> 4. **`node:test` 三件套**：`test()` 声明用例 / `assert` 断言 / 异步用例必须 `async` + `await`
> 5. **CJS 的钥匙**：Node 把每个文件包成 `(function (exports, require, module, __filename, __dirname) { ... })`

1.
2.
3.

## 卡在哪里（待补 —— 今天的素材）

> 今天的卡点很具体，写的时候对着来：
> 1. **`throttle` 路线 B 改了三次**：先是 `swich = false` 写在 `return` 之后（死代码）→ 再是 `return fn.apply` 跑到 `if` 外面（每次调用都执行）→ 最后才对。**同一个错误类型（代码放错位置）连续撞了三次。**
> 2. **`curry` 一开始没想通**：写了 `collect.apply` 调用自己（无限递归），且参数从没累加过；看不懂时需要看别人的代码才能推进
> 3. **`require` / `Promise` 是"会用不会讲"**：`module.exports` 写了 5 次都是照抄，机制不清楚

-

## 踩过的坑（待补 —— 今天的素材）

> 1. `setTimeout(this, interval)` —— `this` 不是函数，抛 `TypeError: The "callback" argument must be of type function`
> 2. `function (arg);` 少了函数体 → 语法错误，**整个文件都加载不了**（这是"脚手架读取不到"的第三种原因）
> 3. **同名函数声明两次，后面的覆盖前面的** —— 路线 A 和 B 都叫 `throttle`，导出的一直是坏的 B，改好的 A 从来没被测到
> 4. 测试**忘了 `await`** → `actual: 0, expected: 1`（断言太早，异步的事情还没发生）

-

## 欠账登记（按计划 §四 的规则）
| 欠什么 | 补在哪天 |
|---|---|
| 在 `p0-toolkit/test/throttle.test.js` 自己加一条用例（测 `throttle` 首次调用立刻执行，不用 `async`）→ 跑出 `tests 18 / pass 18` | 9/16（Day 6）上午 |
| CJS/Promise 三个自测题（见文末） | 9/16（Day 6）上午 |
| 本文「学会了什么 / 卡在哪里 / 踩过的坑」三节 | 9/16（Day 6）上午 |
| 读 `p0-toolkit/test/` 的 4 个测试文件（红线要求：不能逐行解释的代码不许留在仓库里） | 9/16（Day 6）上午 |

合计约 **30 分钟**，**不动结束日**（10/12）。不够 1 天，按规则不需要顺延。

## 明天第一件事（9/16，Day 6）
1. **先花 30 分钟收尾上面的欠账**（一条测试 + 三道自测题 + 日志三节 + 读测试文件）
2. 然后进 Day 6 主题：**`this` / 原型链 / `class`**
   - 四种 `this` 绑定、箭头函数为何没有 `this`、`prototype` 与 `__proto__`、`class` 语法糖、继承与 `super`
   - 顺带：今天 `throttle`/`curry` 里的 `fn.apply(this, args)`，那个 `this` 到底是谁——**明天有答案**
   - 还有今天撞到的 `setTimeout(this, ...)` 报错，明天也会讲透

## 代码 / 命令备忘
```powershell
# 今天的四条核心命令
node week1-language/day05-throttle-verify.js    # 通过 5 项
node week1-language/day05-curry-verify.js       # 通过 12 项

# 工具库的测试
cd week1-language/p0-toolkit
pnpm test        # 等价于 node --test，自动找 test/ 下的 *.test.js

# 收尾
git add -A
git commit -m "day05: add throttle and curry, bootstrap p0-toolkit"
git push
git status -sb   # 没有 ahead 就同步好了
```

---

## AI 复核

### 一、三项产出物，全部实测通过

| 产出物 | 结果 | 实现要点 |
|---|---|---|
| `throttle` | ✅ 5/5 ×2 条路线 | 路线 A 用 `now - last >= interval` 比较时间戳；路线 B 用开关 + `setTimeout` 重新打开 |
| `curry` | ✅ 12/12 | `adj.concat(nextadj)` 累加参数；`fn.apply(this, adj)` 在收够时调用 |
| `p0-toolkit` | ✅ 17/17，退出码 0 | 4 个测试文件，`node --test`（零依赖，Vitest 排在 Day 8） |

**最值得记的一条**：`throttle` 路线 B 的第三次修改才通过，而三次错的是**同一个类型** —— **代码放错了位置**（`return` 之后 / `if` 外面）。这类错误不报错、只是行为不对，读代码极容易滑过去。**对付办法：先写状态表，再写代码**——表里"什么都不做"的那几行，就是判断代码有没有放错位置的标尺。

### 二、今天新增的一条技能线：`node:test`

`test()` / `assert` / 异步用例要 `await` —— 这三件事你已经会了**手工版**（脚手架就是自己数 pass/fail + 自己 `process.exit`）。今天只是换成了标准写法：

| 手工版（你的脚手架） | 标准版（`node:test`） |
|---|---|
| `console.log('✅ ...')` | `test('...', () => {})` |
| 自己维护 `pass`/`fail` | 内置 `ℹ pass N / ℹ fail N` |
| `process.exit(fail === 0 ? 0 : 1)` | 内置（CI 就靠这个退出码） |
| 忘了 `await` → 自己打印的数字不对 | 忘了 `await` → `actual: 0, expected: 1` |

### 三、今天暴露的一个计划缺口（第三次同一类）

建工具库时写了 **5 次 `module.exports`**、测试文件里全是 `require`，但**这些从没被教过**——计划里 Day 7 排的是"ESM vs CJS 的**差异**"，从没排过"CJS **本身**怎么用"。

**已经在用的东西却是没学过的**，这跟 `setTimeout`（Day 3 卡死的原因）、递归（Day 4）是同一类缺口。已改计划：
- Day 7 加了「**① CommonJS 基础**」这一条
- §四 的「已补的书单漏洞」清单里加了 CommonJS，并标为最典型的一条

**规律（值得背下来）**：书单是按"知识点"排的，很容易漏掉"工具性章节"（调度、装饰器、递归、模块机制）。**以后凡是卡在"这个 API / 语法我没见过"，先怀疑书单，而不是怀疑自己。**

### 四、CJS / Promise 三个自测题（顺延 Day 6，答案由你自己讲一遍）

1. 为什么 `day02-throttle.js` 里的 `let last = 0` 和 `day02-curry.js` 里的 `adj` **变量名不冲突**？
2. 你的测试文件**为什么能拿到** `debounce`？`require` 的三个动作分别是什么？
3. `module.exports = { debounce }` 和 `exports = { debounce }` **有什么区别**？为什么后者 require 回来是空的？

（三条的答案都写在今天聊天记录里；讲不出来就把那条发我，我重新拆。）

### 五、今天最该夸的一件事

**你在"会用但不会讲"的时候主动喊了停。** "我还是需要这部分的了解学习的，但要熟练运用还差的远" —— 这句话比做出 17/17 的测试更有价值：**知道自己哪块是空的，是能补上的前提。** 很多人会在这个阶段假装懂了，然后到面试现场才发现讲不出来。
