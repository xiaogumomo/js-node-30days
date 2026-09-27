# Day 13 — 2026-09-27（周日）

> **状态：待填写**　｜　任务书：[`day13-network-concurrency.md`](day13-network-concurrency.md)
> **第 2 周 Day 5**　｜　**接昨天**：README 里写了"为什么用异步 API" → 今天第一次真的**并发**做事（同时最多几个 / 超时 / 重试）
> **今天的目标**：① 清掉 Day 12 尾巴（`cli.js` + 提交）② 裸写**并发池** `pLimit(n)` ③ 给 `fetch` 加**超时 + 重试**
> **⚠️ 昨天还差最后一件**（`src/cli.js` 没写 + 没提交）→ 见 ①

## 今日目标

- [ ] ① 清 Day 12 尾巴：`src/cli.js`（判据 9/9）+ README 5 处小改 + Day 12 日志 + **commit + push**
- [ ] ② 轮转复习 `deepClone`
- [ ] ③ 零提示题第 7 道 `once` + **自写判据**
- [ ] ④ 阅读：`fetch` 的坑 / `AbortController` / `AbortSignal.timeout` / 指数退避
- [ ] ⑤ **主线 A**：`day13-p-limit.js`（并发池）
- [ ] ⑥ 主线 B：`day13-fetch.js`（超时 + 重试）
- [ ] ⑦ 两份判据跑绿
- [ ] ⑧ 日志 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `projects/p1-cli-organizer/src/cli.js` | 0a：`classify` + `main`（干跑安全）| ⬜ |
| `projects/p1-cli-organizer/README.md` | 0b：5 处小改 | ⬜ |
| `week1-language/recall-deepClone.js` | 轮转复习：凭记忆重写 | ⬜ |
| `week2-runtime/day13-zerohint-07.js` | 零提示题 `once` | ⬜ |
| `week2-runtime/day13-zerohint-07-verify.js` | **我自己写的判据** | ⬜ |
| `week2-runtime/day13-p-limit.js` | 并发池（主线 A）| ⬜ |
| `week2-runtime/day13-fetch.js` | fetch 超时 + 重试（主线 B）| ⬜ |
| `week2-runtime/day13-p-limit-verify.js` | 判据（AI 写）| ⬜ |
| `week2-runtime/day13-fetch-verify.js` | 判据（AI 写，会起本地 http server）| ⬜ |

---

## ① 清 Day 12 尾巴

**0a `src/cli.js`**

| 项 | 记录 |
|---|---|
| 用表还是用四数组 + if？（最后选了哪个） | |选择直接一个对象表加for
| `classify` 一次跑绿，还是错在哪几个样本 | | 错在理解，遍历是在main（）而classify的作用仅仅是分类其中一个
| 判据结果（目标 9/9） | | 改了5到6次最后ai指出准确修改建议才9/9
| 汇总格式对不对（`共 N 个文件：images X、docs Y、videos Z、others W`）| |改了几次之后终于格式对了。一个问题是sorts中的后缀名判断中含有空格导致一直判断不成功 二是忘记获取数据的方式（readair+函数内path.join递归）三十不懂ai究竟让我怎么用for列出它所期望的，好在它列出代码我也看懂了是返回的files数组然后遍历打印
| 干跑/`--apply` 有没有动文件（判据 02/03）| | 没有动文件
| **卡在哪一处**（桥出来想 == 写下去不一样的地方）| |

**0b README 5 处小改**

| # | 改了吗 |
|---|---|
| 表格 `videos` 行补收尾 `\|`（工具点名第 22 行）| ✅️ |
| `readir` → `readdir` | ✅️ |
| `如何文件` → `任何` | ✅️ |
| 把"流式"从「为什么用异步 API」里删掉（异步 ≠ 流式）|✅️ |
| 已知限制写"递归" → 代码真的递归了吗 | ✅️ |

**Day 12 的日志 ⑥⑦⑧ 补完了吗 + 提交**

```powershell
git log --oneline -1     # 贴在这里（应该不再是 f6e6851）
git status -sb           # 贴在这里
```

---

## ② 轮转复习：`deepClone`

| 模块 | 结果 | 卡在哪 |
|---|---|---|
| deepClone | 自己修改后4/4全绿 | 没有卡在哪里 |
**这次的坑**（`typeof` 大小写？循环引用？）：
typeof 大小写又写大写了 循环没有问题，又出现了理解上的疑惑result[key] = deepClone(x[key]) 写成result[key] = deepClone(result[key]),已想通

---

## ③ 零提示题第 7 道：`once`

| 项 | 记录 |
|---|---|
| 用了几分钟 | | 10分钟
| 做出来了吗 | |没有做出来，靠ai辅助
| **判据是我自己写的吗** | |是我自己写的
| **有没有"先故意让它红一次"** | | 有
| `g` 抛错时算不算"执行过"（我定的 + 为什么）| 算执行过了，进入function已经让函数记住called=true 和result了，那么result之后会一直返回undefined | 
| 参数 / `this` 透传我定了什么 | 要透传|
| **卡在哪一步** | 不知道应该靠什么方式阻止后面的参数继续输入，通过问ai我知道了，需要设置一个像“called”的布尔类型开关通过判断语句来阻止输入，通过像result来返回第一次执行的结果|

---

## ④ 阅读笔记（4 行）

1. `fetch` 在什么情况下才 **reject**（服务器返 404/500 时呢？）：
2. 怎么把 `AbortController` 接到 `fetch`；`abort()` 之后抛的错 `err.name` 是什么：
3. `AbortSignal.timeout(ms)` 能不能一行做超时：
4. 指数退避为什么要"等一会儿 + 翻倍"：

---

## ⑤ 主线 A：`day13-p-limit.js`

| 项 | 记录 |
|---|---|
| 最小版（一次只跑一个、按顺序出结果）| |
| 放开到"最多 n 个同时" | |
| **最大同时数 ≤ n**（判据会查这个数）| |
| 结果顺序 = 传入顺序 | |
| **失败隔离**（一个失败不影响其他）| |
| 排队不丢（超过 n 的确实都跑了）| |
| `n` 非法时我定的行为 + 为什么 | |
| **今天最卡的一处** | |
| **放宽/绕过的地方**（有就写，说明为什么）| |

**实测输出（贴一次真实的）**：

```
（贴 `node --test week2-runtime/day13-p-limit-verify.js` 的结果，或你自己写的小 demo 输出）
```

---

## ⑥ 主线 B：`day13-fetch.js`

| 项 | 记录 |
|---|---|
| 200 → 不重试 | |
| 500 → 重试到位（请求次数 = retries + 1）| |
| 服务器不响应 → `timeoutMs` 后放弃 | |
| 前几次失败、后来成功 | |
| 全失败 → 抛错（不是吞掉）| |
| 退避有没有真的等 | |

---

## 学会了什么

1.

---

## AI 复核（① 清尾巴的核对 —— 这一段是 AI 补的，不是学生写的）

**他自述："我不是完全靠自己脑子写的，因为我翻阅了资料（`day10-dir-size.js` 里 `main()` 的写法）。"** → **查自己的历史代码是允许的**（HANDOFF 明写"允许查你自己的日志"），**而且"去找模板"这一步做对了**；问题在**抄完之后没对着契约/判据核对**。

### 1. 文件放错目录（第一件，判据根本找不到它）
他写在 `projects/p1-cli-organizer/test/cli.js` —— 应该在 **`src/cli.js`**（判据里写死的是 `../src/cli.js`）。实测判据输出："还没看到 projects/p1-cli-organizer/src/cli.js"。

### 2. ⚠️ 最大的问题：`classify` 的**职责**混了（实测）
| 契约 | 他写的 |
|---|---|
| `classify('photo.JPG')` → **`'images'`**（一个名字 → 一个分类名字符串）| `classify(['photo.JPG'])` → `{others:['photo.JPG']}`（**一个数组 → 一个分组对象**）|
| 一个名字进，一个字符串出 | `classify('photo.JPG')`（传字符串）→ `{others:['p','h','o','t','o','.','J','P','G']}` ← **把字符串当数组逐字符遍历了** |

→ "扫描目录 + 分组"不是 `classify` 的事，是 `main` 的事（用 `readdir`）。
→ 顺带一个判读点：**传参类型不对时 JS 不报错，而是顺着跑出荒谬结果**（字符串也有 `length` 和 `[i]`）—— 所以这类错**只能靠判据抓**。
→ 分类名还写成 `docx`（契约是 `docs`）。

### 3. 接线错误（AI 逐行，按"死在哪一步"排序）
| # | 位置 | 问题 | 后果 |
|---|---|---|---|
| 1 | 顶部 | **没 require `parseArgs`**（`node:util`）| 💥 实测 `ReferenceError: parseArgs is not defined` |
| 2 | 39–54 | **选项没包在 `options: {}` 里**（`target`/`apply`/`verbose` 直接放在顶层）| **静默**：三个选项全被忽略 → `--target`/`--apply`/`--verbose` 都不生效 |
| 3 | 39 | 解构名 `positional` → 应 `positionals` | `undefined[0]` → TypeError（被 catch 吃掉）|
| 4 | 13–15 | 扩展名数组**带尾随空格**（`.jpg ` / `.png ` / `.pdf ` …）| **静默**：实测 `['.jpg ','.jpeg '].includes('.jpg') === false` → 只有 `.gif`/`.mp4`/`.mov`/`.docx`/`.md` 能命中，其余全落 `others` |
| 5 | 45–48 | `apply` 默认 **`true`**（`verbose` 也是）| 契约要"**默认干跑**"；`--apply` 默认 true = "默认就真移动"。**这次没出事是因为 `apply` 在 main 里从没被用到**（侥幸）|
| 6 | 43 | `target` 默认 `'4'` | 无意义（该"给了才显示"）|
| 7 | 60–63 | `result[images]`（`images` 是**未定义变量**）| ReferenceError → main 从这里就崩（应 `result.images`）|
| 8 | 67 | catch 的模板串整段是**字面文本**，且 `catch` 没写 `(err)` | 打印乱码，看不到真原因 |
| 9 | 64 | 汇总**多了一堆引号** | 输出 `"共" 6"个文件：images" 2"...` → 判据 07 的正则匹配不上 |
| 10 | 23–30 | `groups` 定义在**循环体里**（靠块级函数提升才没炸）| 能跑但极难读；按昨天的设计，表 + 遍历该放**模块级** |
| 11 | main | **没有 `readdir`** / `--verbose` / `--target` / `--apply` 的处理 | 契约 02/03/04/05/07 全缺 |

**结论定性**：**不是"手滑"，是"职责没分清 + 接线没接上"** → 所以不该逐字打补丁，而要**先把 `classify` 按契约重写**（一个名字 → 一个分类名），再补 `main`。**11 处里 8 处是"一跑就现形"的**（`parseArgs is not defined` / `positional` / `result[images]` / 汇总格式…）—— 抄完模板后**跑一次 + 跑判据**，能当场抓掉大部分。

### 第 2 版（他把文件挪到 `src/cli.js` + 补了 `parseArgs` 之后）
**判据实测**：`00 ✅ / 06 ✅`（文件位置对了、导出对了、require 无副作用）、`03 ✅`（**但这是假绿**：它"没动文件"是因为它压根没跑起来）、`01 / 02 / 04 / 05 / 07 ✖`。
**仍存在的问题（AI 逐条）**：
1. `classify` 里 `path.extname(name[i])` → **`i` 未定义** → 实测 `ReferenceError: i is not defined`（从 `main` 搬过来时把 `[i]` 留下了）
2. 表里 `.pdf ` / `.txt ` **仍有尾随空格** → 静默漏
3. `toLocaleLowerCase()` → 应 `toLowerCase()`
4. **`option:` 拼错（应 `options:`）** → 实测：加 `--verbose` 直接抛 `ERR_PARSE_ARGS_UNKNOWN_OPTION: Unknown option '--verbose'`（这回是**响错的**，不是静默）
5. `apply` / `verbose` 默认仍是 `true` → 契约要 `false`（默认干跑）
6. `main` 里 `name` 是**目录字符串**却被当文件数组遍历 → 缺 `readdir`（他说"这块不太会" → 已教：**去他自己 `day10-dir-size.js` 的 `walk` 里看那 4 行**）
7. `result.images.length`：某类为空时是 `undefined` → 崩（应**四键初值 0 的计数对象** —— 就是他 `countByExt` 里那个动作）
8. 汇总行 `${docxs}` 拼错 + 一堆多余引号
9. catch 里 `${dir}` 未定义 → 在 catch 里再抛；`catch` 也没写 `(err)`

**教法（三件"指路到他自己的代码"）**：`readdir` → 他 `day10-dir-size.js` 的 `walk`；计数对象 → 他 `countByExt` 的 `(result[key] ?? 0) + 1`；`--target`/`--verbose`/`--apply` → 新东西，给了各 1–3 行的用法骨架（`if (values.target)`、`if (values.apply) { … return; }`），没写他的 `main`。

### 第 3 版（他按上面的指路又改了一版）→ **AI 给了完整参照版**（走"连续多轮要解决方案 + 明确说想不出来"那条例外）

**他的第 3 版状态**：`classify` **✅ 完全对了**（13 个样本 AI 单独验过全过）、`sorts` 已移到模块级 ✅、`walk` 骨架（`readdir` + `isDirectory/isFile` + `path.join` + `relPath`）**结构对** ✅、`counts` 初值 ✅ —— **每一块都是他写的**。但仍有**一处致命 + 若干接线**：
- 💥 **第 66 行是全角分号 `；`（U+FF1B）** → `SyntaxError: Invalid or unexpected token` → **整份文件连 require 都进不去**（判据 `pass=1 fail=1`，8 条直接跳过）
- `counts[classify(entry[i].name)]`：`entry` 是**单个** Dirent（没有 `[i]`）
- `file.push({entry[i].name : "…"})`：无效的对象字面量（键不能是表达式）
- **定义了 `walk` 但从来没调用** → 一次都没扫
- `if (values.apply) {…return}` **写在循环里**（拿完目录第一件事就该判断，且 `return` 只退出 `walk`）
- `--target`/`--verbose` 用 `else if`（三者不是互斥的：`--target` 加一行、`--verbose` 管"每个文件那一行"、`--apply` 才是提前收工）
- catch 用**单引号**包 `${…}` → 不插值；`${names}` 变量名也对不上（外面叫 `name`）
- **缺"计划"输出 + 汇总**

**AI 的动作（记账）**：给了他**一份完整可跑的实现**（在**他的代码基础上**补接线：`classify`、`sorts`、`walk` 骨架、`counts` 初值**原样保留**）—— AI 实测 **判据 9/9 + 四个探针全对**。**条件**：① 记账（这份 `main` 的接线是 AI 补的）② **直接粘贴判不合格** ③ **要求他合上参照版自己重写一遍**，那一遍才算他的 ④ 抄完先跑一次判据确认 9/9。
**时间账（要记）**：这个 `cli.js` 从 Day 12 拖到今天、来回 3 版，**已经明显超时**；而根因是**"接线"这一族的老问题**（HANDOFF §三 已记：Day 7 五轮、Day 10 两版、今天是第 4 次同族返工）→ **Day 15 复盘要一起算**；今天**不允许**再在这里继续沉没，改完立刻转 `p-limit`。

### 第 4 版（他按第 3 版的逐行表改完）→ **只差 4 行**

他报"02 和 04 还不通过"。**实测发现 02 / 04 / 07 三个红是同一个根因**：

**① `dir` 的作用域（这是主因）**：`const dir = positionals[0] || '.'` 声明在 **`try` 块里面** → **块作用域**，`catch` 是另一个块 → **`catch` 里 `dir` 看不见** → `ReferenceError: dir is not defined` → **catch 自己抛了**（实测报错定位在 `src/cli.js:89` 的 `${dir}`）。后果：
- 02 红（退出码 1 + 没有任何"计划"输出）
- 04 红（打出调用栈 —— 因为 catch 自己崩了）
- 07 红（没有汇总行）
- **05 却过了**（空目录路径压根不进 catch）→ **说明这三个不是三个独立问题**

**② 另外两处（会在"扫到第一个文件"时崩 / 子目录一来就崩）**：
- `path.join(rel.entry.name)` → 应 `path.join(rel, entry.name)`（`rel` 是字符串，没有 `.entry`）
- `files.push({rel: relPth, category: classify(entry[i].name)})` → `relPth` **拼错**（应 `relPath`）+ `entry` **没有 `[i]`**（应 `entry.name`）

**AI 实测**：在**他的文件上只改这 4 行**（把 `dir` 提到 `try` 前 + 那两处）→ **判据 9/9 全绿**，四个探针也全对。
**通用教训（这一族）**：**`catch` 里要用到的变量，必须声明在 `try` 外面** —— 这属于"块作用域/接线"，不是手滑（和 Day 7 的 `p` 写到作用域外同类）。

### ③ 零提示题第 7 道 `once`（AI 复核 + 记账）

**他主动报的账**：**"我是靠 ai 辅助完成的**，因为我关于**执行完成后如何保存数据**的细节／该如何实现还不懂，通过询问之后现在懂了，**需要之后规划上为我记下这一账**。"
**他在日志 ③ 填的"卡在哪一步"很准**："**不知道应该靠什么方式阻止后面的参数继续输入**……通过问 ai 我知道需要设置一个像 `called` 的布尔开关，通过判断语句来阻止，用 `result` 返回第一次执行的结果。"

**实现：✅ 对的**（AI 逐条核）：`called` 标志 + 保存 `result` + `fn.apply(this, args)` 透传；两个设计选择（抛错算不算执行过 / this 与参数透传）**都在注释里写明了**。
**归类：检索失败（不是知识缺口）** —— 他要的那个"**开关**"就是他自己写过的东西：`debounce` 里的 `timer`、`curry` 里的闭包累积参数；**而且今天主线 `p-limit` 的核心正是同一个动作**（闭包记状态 + 队列）→ **不需要额外补课，`p-limit` 就是这道题的第二次练习**。

**⚠️ 他的判据：只有 1 条，而且实测"抓不住坏实现"**（AI 用变体验证）：
| 实现 | f(1) | f(2) | 他的判据结果 |
|---|---|---|---|
| 他的正确版 | 1 | 1 | ✅ 绿 |
| **坏版（每次都真跑 `g`，只是返回第一次的结果）** | 1 | 1 | **✅ 绿（看不出问题！）** |

→ **根因：判据没有"数调用次数"** —— "只执行一次"最直接的证据是 `let calls = 0; …; assert.equal(calls, 1)`，而不是只看"返回值相同"。
→ 另外：注释里声明的两条设计选择（抛错算执行过、this/参数透传）**判据里一条都没有** → 应各补一条（**"注释里写了设计选择，判据里就必须有一条对应它"**）。
→ 建议补到 5 条：① **数调用次数** ② 第二次参数不同也返回第一次的结果 ③ 第一次的 this/参数透传 ④ 抛错的函数按他定的规则（第一次抛错后**不再重试**）⑤ 包一个**返回 `undefined`** 的函数（这条抓的是"用 `result === undefined` 当标志"的写法 —— 他用了 `called` ✅ 所以能过）。

**记账（按他要求记）**：
- 这一道**算"问 AI 得到的"**（日志 ③ 已写"没有做出来，靠 ai 辅助"）✅
- **条件**：要**合上重写一遍**（那一遍才算他的）—— 可今天做（5 分钟），也可顺延；建议**把它当 `p-limit` 的热身**。
- 计划侧：**Day 15 周复盘**把"**怎么用闭包记住状态**"归到「忘了的」清单（该族第 4 次出现：`debounce` 的 `timer` → `curry` 的累积 → `groupBy` 的 `?? []` → 今天的 `called`）。

---

## 卡在哪里

1.

---

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| （没欠账就写"无"） | |

## 明天第一件事

1. **Day 14（9/28 一）= 包管理与生态 + 项目 1 主体实现**：上午 npm/pnpm 差异、语义化版本、lockfile、workspace、`npm audit`、依赖为什么越少越好；下午**项目 1 主体**（文件扫描 → 分类 → 移动：**流式复制 + 校验**），用 `pnpm` 管理
2. （如果今天有顺延）先把欠账清掉

## 代码 / 命令备忘

```powershell
# ① 清 Day 12 尾巴
node --test projects/p1-cli-organizer/test/cli.test.js
node tools/check-md-tables.js projects/p1-cli-organizer/README.md

# ② 轮转复习
node week1-language/recall-verify.js deepClone

# ③ 零提示题
node --test week2-runtime/day13-zerohint-07-verify.js

# ⑤⑥ 主线
node --test week2-runtime/day13-p-limit-verify.js
node --test week2-runtime/day13-fetch-verify.js

# 收尾
git add -A
git commit -m "day13: concurrency pool (p-limit) + fetch timeout/retry"
git push
git status -sb
```
