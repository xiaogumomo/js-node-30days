# Day 5 — 2026-09-15（周二）

> **状态：✅ 三项产出物全部通过（`throttle` 5/5、`curry` 12/12、`p0-toolkit` 17/17）**
> 任务书：[`day05-guide.md`](day05-guide.md)　｜　手机版：[`day05-phone.md`](day05-phone.md)
> 主题：**`throttle` + `curry` + `p0-toolkit` 立项**
> 📝 本文的「学会了什么」由你写（AI 只做核对与补全）、「卡在哪里 / 踩过的坑」按你要求由 AI 依素材代笔。其余小节为实测记录。

## 今日目标（必交 5 项 + 顺手 1 项）

- [x] 1. `week1-language/day02-throttle.js` —— `day05-throttle-verify.js` **通过 5 项**（两条路线都通过）
- [x] 2. `week1-language/day02-curry.js` —— `day05-curry-verify.js` **通过 12 项**
- [x] 3. `week1-language/p0-toolkit/` —— `package.json` + `README.md` + `src/`（4 个函数）+ `test/`
- [x] 4. 在 `p0-toolkit/` 下 `pnpm test` 全绿（**17 个用例，退出码 0**）
- [x] 5. 日志 + commit + push
- [x] 顺手：`day02-debounce.js` 头部那句 `immediate` 语义补完
- [ ] ⏸ **顺延 Day 6**：自己加的那条 `throttle` 测试、CJS/Promise 三个自测题、读 4 个测试文件

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

> 已有归属：`step4.返回函数` → **已划掉**；`this` 指向 → **Day 6**；`async` → **Day 7**。
> 新增一条：**`require` / `module.exports`（CommonJS）** —— 建工具库时已经在用了，但没学过原理。已确认 **Day 7** 补，见下方「AI 复核」第三节。

-

## 学会了什么

**1. 两条节流路线的区别（你写的）**

> 比较时间戳采用两个变量 last 和 now 控制，，不断变化的 now（用时间 Date.now() 保证不断变化），用 now-last 必大于 interval 的判断语句判断保证间隔"interval"秒，第一次迅速执行的情况为初始值 last 期初设为 0 保证 now-last 必大于 interval，之后将 now 的值赋予 last，第二次及之后不断更新 now 的取值，探测 now-last 必大于 interval 的判断语句能否成立。路线 B 采用开关被计时器控制的手法，通过 setTimeout 控制开关等于 true 的时间确定大于 interval 时，才进入判断语句。两者区别是有无计时器。

**✅ 这一段最值钱的是这句：「初始值 last 设为 0 保证 now-last 必大于 interval」** —— 你抓到了路线 A 能"首次立刻执行"的**真正机关**。这不是背来的，是你读代码读出来的。

**⚠️ 两处要修正：**

- `now-last 必大于 interval` → 代码里是 `>=`（**大于等于**），不是"大于"。差别在边界上：正好等于 `interval` 时会执行。
- 「路线 B：通过 `setTimeout` 控制开关等于 true 的时间确定大于 interval 时，才进入判断语句」→ 因果关系绕晕了。精确说法：**`setTimeout` 在 `interval` 之后把开关恢复成 `true`；而开关是 `true` 时才会进入 `if` 分支执行 `fn`。** `setTimeout` 的职责只有"重新打开开关"这一件事。
- 「两者区别是有无计时器」✅ 对，但可以补一句**后果**：没有计时器 → 无副作用；有计时器 → 每次执行都会留下一个待触发的 `setTimeout`，**实测让 Node 进程多活 `interval` 毫秒**。

**2. `curry` 的核心（你写的）**

> `adj.concat(nextadj)` 这一行是全部秘密——把上一层攒的参数和这次收到的合并。concat 是合并并返回一个新数组，不要忘记了。

**✅ 你补的那半句「concat 返回一个新数组，不要忘记了」非常关键**，而且你可能还没意识到它有多关键：

> **正因为 `concat` 每次都返回新数组（不改原数组），每个柯里化函数才持有自己那份参数副本 —— 这正是脚手架测试 4「复用不串参数」能通过的原因。** 如果 `concat` 是原地修改的，第二次 `c(4)(5)(6)` 就会带上第一次的 `1,2,3`，算出 18 而不是 15。

（小笔误：`dj` → `adj`；`arr.concat` 里的变量名是 `adj` 不是 `arr`。）

**3. `fn.length` 的两个坑**

- `(a, b, c) => {}` 的 `length` 是 **3**
- `(a, b = 2, c) => {}` 的 `length` 是 **1** —— 第一个默认参数**之后**的参数都不计入
- `(...args) => {}` 的 `length` 是 **0** —— rest 参数不计入
- **推论**：包装函数（`debounce`/`throttle` 返回的那个 `function (...arg) {}`）的 `length` 是 **0**，所以**对"被包装过的函数"做 `curry`，会永远收不够、永远返回函数**

**4. `node:test` 三件套 + 一条铁律**

- `test('描述', 函数)` 声明用例 / `assert.equal(实际, 期望)` 断言 / 退出码由跑器自动设
- **铁律：异步的事必须等。** 涉及 `debounce`/`throttle` 的断言要写成 `async` 并先 `await sleep(...)`；`curry`/`deepClone` 是纯同步，不用等。忘了会看到 `actual: 0, expected: 1`
- 你已经在做的事（脚手架自己数 pass/fail + `process.exit`）就是这些的手工版 —— 今天只是换成了标准写法

**5. CJS 的钥匙（知道了，但还没自己讲一遍）**

> Node 把每个 `.js` 文件包成一个函数来执行：
> `(function (exports, require, module, __filename, __dirname) { ...你的代码... })`

这一条解释了：为什么各文件里的变量不冲突（各自的局部变量）、为什么能直接用 `require`/`module`（它们是参数）、为什么 `module.exports` 是出口（它就是那个参数）。

（三个自测题**还没答**，顺延 Day 6 —— 讲不出来就说明还停在"知道"而不是"懂"。）

## 卡在哪里

**1. `throttle` 路线 B 改了三次，而三次错的是同一个类型：代码放错位置。**

| 第几次 | 错在哪 | 症状 |
|---|---|---|
| 第 1 次 | `swich = false` 写在 `return` 之后 | 死代码 → 开关永远开着 → 每次调用都执行 |
| 第 2 次 | `return fn.apply(...)` 跑到 `if` **外面** | 每次调用都执行（同上，但原因不同） |
| 第 3 次 | 才对 | 三条规则全落进 `if` 分支里 |

这类错误**不报错、只是行为不对**，读代码极容易滑过去。**对付办法：先写状态表再写代码**——表里"什么都不做"的那几行，就是判断代码有没有放错位置的标尺。

**2. `curry` 一开始完全没头绪。**

写了 `collect.apply(this, adj)`（调用自己是无限递归），而且**参数从来没有累加过**。当时看不懂，是看了"把上一层攒的参数和这次收到的合并"这句提示才想通的。

**3. `require` / `Promise` 是"会用不会讲"。**

`module.exports` 写了 5 次全是照抄一行；Promise 是 9/12 凭好奇写的（`buyfood`/`eat`），机制不清楚。已确认 Day 7 补 —— **能主动承认这一点，比假装懂强得多。**

## 踩过的坑

1. **`setTimeout(this, interval)`** —— `setTimeout` 的第一个参数必须是**函数**，而 `this` 是"调用时的接收者"，普通调用时它是全局对象，**不是函数**，于是抛 `TypeError: The "callback" argument must be of type function`。
2. **`function (arg);`** —— 函数表达式少了函数体。这是**语法错误**，而语法错误的后果是**整个文件都加载不了**，所以报错看起来像"读取不到"。这是"脚手架读取不到"的**第三种**原因（前两种：没写 `module.exports`、代码还在注释里）。
3. **同名函数声明两次，后面的覆盖前面的** —— 路线 A 和 B 都叫 `throttle`，所以 `module.exports` 导出的**一直是坏的 B**，而改好的 A 从来没被测到。**这个坑最隐蔽**：不是代码错了，是你以为在测 A，其实在测 B。
   > 教训：改完一个函数**立刻跑一遍脚手架**；两条实现路线要用不同名字。
4. **测试忘了 `await`** —— 断言太早，事情还没发生。看到 `actual: 0, expected: 1` 就该想到这一条。

## 欠账登记（按计划 §四 的规则）
| 欠什么 | 补在哪天 |
|---|---|
| ~~在 `p0-toolkit/test/throttle.test.js` 自己加一条用例（测 `throttle` 首次调用立刻执行，不用 `async`）~~ | ✅ 已加（9/17；第一版漏了 `fn();`，已定位，见 [`day06.md`](day06.md)） |
| ~~CJS/Promise 三个自测题~~ | ✅ 已答（9/17；(c) 完全正确，(a) 术语说反了，(b) 答错问题 —— 全部记录在 [`day06.md`](day06.md)） |
| ~~读 `p0-toolkit/test/` 的 4 个测试文件~~（红线要求：不能逐行解释的代码不许留在仓库里） | ✅ 已读（9/17） |
| ~~本文「学会了什么 / 卡在哪里 / 踩过的坑」三节~~ | ✅ 已完成 |

合计约 **20 分钟**，**不动结束日**（10/13）。不够 1 天，按规则不需要顺延。**实际于 9/17 上午全部清完。**

## 明天第一件事（9/16，Day 6）
1. **先花 20 分钟收尾上面的欠账**（一条测试 + 三道自测题 + 读测试文件）
2. 然后进 Day 6 主题：**`this` / 原型链 / `class`** —— 详细任务书见 [`day06-this-prototype.md`](day06-this-prototype.md)

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

**最值得记的一条**：`throttle` 路线 B 的第三次修改才通过，而三次错的是**同一个类型** —— **代码放错了位置**（`return` 之后 / `if` 外面）。这类错误不报错、只是行为不对，读代码极容易滑过去。**对付办法：先写状态表，再写代码。**

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

### 五、对「学会了什么」的核对结论

17 项素材里你写了 2 项，但**这 2 项的质量都超过"照抄提示"**：

- 第 1 项你写出了 `last = 0` 这个机关的**原理**（不是背的）
- 第 2 项你自己补的「`concat` 返回新数组」正好指向"复用不串参数"能通过的根因 —— 这是**从实现推导出测试行为**，比反过来难

**换句话说：你缺的从来不是理解力，是"把理解写下来"的习惯。** 今天这两行就是证据。

### 六、今天最该夸的一件事

**你在"会用但不会讲"的时候主动喊了停。** "我还是需要这部分的了解学习的，但要熟练运用还差的远" —— 这句话比做出 17/17 的测试更有价值：**知道自己哪块是空的，是能补上的前提。** 很多人会在这个阶段假装懂了，然后到面试现场才发现讲不出来。
