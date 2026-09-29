# Day 15 任务书：**项目 1 交付日**（`--apply` + 收尾 + 交付检查）

> **日期**：2026-09-29（周二）　｜　**第 2 周 Day 7**（本周最后一天）
> **这天的性质**：**不是新章节日，是"把项目 1 做完并交付"的日子** —— 原计划的"错误处理与进程管理"**并进项目收尾**（做中学，内容不砍）。
> **9/28 下午有课** → 下面 0a–0e 是从 9/28 顺延过来的（账在 `notes/day14.md` 的「欠账登记」）。
> **周复盘顺延到 9/30**（独立一天：周自测 + 两张清单 + 重算日期 + 更新轮转表）。
> **今天的判据全都在**：`projects/p1-cli-organizer/test/cli.test.js`（9 条）+ `test/apply.test.js`（9 条）——AI 都负向验证过。

---

## 〇 开工前 5 分钟：把产出物抄在纸上

| # | 产出物 | 验收标准 | 谁写 |
|---|---|---|---|
| 0a | **只剩 `notes/day14.md` 全篇** + `memoize` 实现 + 记账 | 表格自检过 + **提交推送** | **你（课间就能做）** |
| 0b | `projects/p1-cli-organizer/package.json` | `pnpm init` + scripts；`pnpm pkg get type` 是 `undefined`（**CJS**）| **你** |
| 0c | **`src/cli.js` 的 `--apply`** | `node --test projects/p1-cli-organizer/test/apply.test.js` → **9/9** | **你**（判据 AI 写）|
| 0d | 项目收尾：错误分类 + `pino` 日志 + 优雅退出 | 三类错误场景各跑一次，报错带文件名、退出码非零 | **你** |
| 0e | README + 使用示例 | 三处对账 + 示例能照抄跑出预期输出 | **你** |
| 0f | **项目 1 交付检查** | 见 三 的清单，逐条打勾 + `git tag p1-v1.0` | **你** |
| 0g | 周自测（有时间就做，否则顺延 9/30）| **自己写判据** + 自己写实现 | **你** |

---

## 一 时间表（**按"能不能用电脑"切段**）

| 时段 | 干什么 | 产出 |
|---|---|---|
| **课间 / 上午（轻用电脑）** | **0a 清日志欠账** | 0a |
| **放学后 0:00–0:10** | **0b 包管理动手**（`pnpm init` 那 5 步）| 0b |
| **0:10–1:40** | **0c `--apply`：真的搬文件**（今天的产品）| 0c |
| 1:40–1:50 | 休息 | —— |
| **1:50–2:35** | **0d 项目收尾**（错误分类 / `pino` / 优雅退出）| 0d |
| **2:35–3:00** | **0e README + 使用示例** | 0e |
| **晚上（40 分钟）** | **0f 交付检查** + 0g 周自测（或顺延）| 0f 0g |
| **收尾 15 分钟** | 日志 + `git commit` + `push` | —— |

**砍单顺序**：0g 周自测 → 0d 的第 4、5 条 → 0e 的使用示例 → 0b 的 `add/remove/audit`（没网就跳）。
**不许砍**：**0a**（日志 + 提交，账不留就白干）、**0c**（`--apply` 9/9 —— 它是项目 1 的核心，"真的移动文件"）。

---

## 二 各项详情

### 0a 清日志欠账（30 分钟，**先做**）

**`notes/day13.md`（9/27 的 4 格）** —— ✅ **9/28 晚已补完并进提交 `7ec0ff8`**（AI 9/29 早上核对过：8 条勾选、产出状态列、⑤ 的实测输出真的贴了判据输出、欠账表三条真欠账）。**不用重做**。
（小瑕疵：勾选写成了 `- [×]`，中划线那个 `×`（U+00D7）在 Markdown 里**不会渲染成打勾框** → 下次用 `- [x]`（英文 x）就行。）

**`notes/day14.md`（9/28 的账）← 今天要补的就是这个**：
1. 今日目标勾选 + 今日产出表状态
2. ① 清尾巴那格（`once` **5/5**、`p-limit` **8/8**、**两处都自己改对了**）
3. ② 轮转那格：`throttle` **5/5**（两条路线都复原、都导出）
4. ③ 零提示题那格：`memoize` 判据 4 条；**记账**：Map 版 / JSON 版两种键的实现是 **AI 给的**（走例外条款）；那两条"为什么"写清
5. ⑤⑥ 那两格：`p-limit` 重写的两个真 bug（`() => fn` 没调用、`push` 存 3 个元素）+ 你的 5 处自报遗忘；`fetch` 分块练的四块状态
6. **欠账登记**（今天的顺延项）：包管理动手 / 项目 `--apply` / README / 两份日志 → 全部记到 9/29
7. 明天第一件事：读 `notes/day15-project1-delivery.md`

```powershell
node tools/check-md-tables.js
git add -A
git commit -m "day14: log wrap-up + memoize (Map 版)"
git push
git ls-remote --heads origin main   # 和 git rev-parse HEAD 比 SHA
```

### 0b 包管理动手（10 分钟）—— ⚠️ **别碰 `type` 字段**

```powershell
cd projects/p1-cli-organizer
pnpm init
pnpm pkg set name="p1-cli-organizer" private=true description="批量文件整理 CLI（项目 1）"
pnpm pkg set scripts.test="node --test test/"
pnpm pkg get type        # ← 必须看到 undefined（= CJS）
pnpm test                # ← 现在应该是「3 通过 / 6 红」= --apply 的待办
pnpm add pino            # ← 第一个真依赖（0d 要用）；顺便看 lockfile 变了什么
pnpm audit
```

> ⚠️⚠️ **`type` 一旦写成 `"module"`，项目里所有 CJS 文件当场失效**（`require is not defined`），**而且报错会指向"某个函数没定义"**。**AI 实测**：`type: "module"` → 判据 `pass 0 / fail 1`；不写（或 `commonjs`）→ **9/9**。

### 0c `--apply`：真的搬文件（90 分钟）← **今天的产品**

**契约**（判据就照这个判，也是你要写进 README 的）：

```
node src/cli.js <源目录> [--target <目标目录>] [--verbose] [--apply]
```

- **不加 `--apply` = 干跑，一个文件都不许动**（连目录都不许建）—— `cli.test.js` 的 03 盯着。
- 加了 `--apply`，每个文件走**四步，顺序不能反**：
  1. `mkdir -p <目标>/<分类>/`（默认目标目录 = 源目录自己）
  2. **流式复制**：`createReadStream(src)` → `pipeline` → `createWriteStream(dest)`
  3. **校验**：两边 `stat.size` 相等 + `sha256` 相同（哈希也流式算）
  4. **校验通过才 `unlink(src)`** ← **顺序反了就可能丢文件**（判据 01/02 盯着）
- **任一步失败**：源文件必须原样还在、报错带文件名、退出码非零、**其余文件继续搬**。
- **幂等**：扫描时**跳过目标目录**（连跑两次不许套娃）。
- **重名冲突**：改名或跳过都行，**不许覆盖、不许丢**。

**拆解顺序**（一步一跑）：
1. 先写 `moveOne(srcPath, destDir)`：mkdir → 流式复制 → 校验 → 删源。指路到你自己的材料：`week2-runtime/day11-ndjson.js:187`（`createReadStream`）、`day11-make-big.js:12`（`createWriteStream`）；新 API 两个名字 —— `node:stream/promises` 的 **`pipeline`**、`node:crypto` 的 **`createHash('sha256')`**。
2. 接进 `main`（干跑那支**一行都别动**）
3. 失败隔离：`try/catch` 包在**每个文件**的搬家调用外面（catch 里要用的变量声明在 `try` 外面）
4. 幂等：扫到目标目录就 `continue`
5. 冲突策略 + 汇总行（干跑格式别动，`--apply` 另加一行）

**判据**：`node --test projects/p1-cli-organizer/test/apply.test.js` → **9/9**；顺手重跑 `cli.test.js` 保持 **9/9**。
**两条已知盲区**（别高估那个绿）：`06` 是**看代码的合同检查**（不是行为测试）、`05` 是**规模冒烟**（不证明"用了流"）；**"校验"只验到"失败时源文件还在"**这一层。

### 0d 项目收尾（45 分钟）—— 原"错误处理与进程管理"，做中学

1. **错误分类**：把失败分成三类，各给一句人话 + 非零退出码：① 源目录读不了 ② 单个文件搬不动（保留源）③ 目标被占（`mkdir` 失败）。
2. **自定义 Error 子类**：`class MoveError extends Error { constructor(file, cause) { … this.file = file } }` —— 让报错**带文件名**（你在 fetch 练习里写过 `HttpError`，同一个形状）。
3. **结构化日志**：`pnpm add pino` → `console.log/error` 换成 `logger.info/error`，日志里带**字段** `{ file, category, err }`。日志里回答一句：**结构化日志比 `console.log` 拼字符串好在哪**（提示：以后要按字段搜/统计）。
4. **优雅退出**：`process.on('SIGINT', …)`（Ctrl+C）→ 打印"已搬 N 个；**正在复制的那一个不会丢**"再退出。说清为什么它不会丢（**复制 + 校验通过才删源**）。
5. **兜底 handler**：`unhandledRejection` / `uncaughtException` 各挂一个，打印一句再退出 —— 顺便讲清**"这只是兜底，不是正常流程"**。
6. **三类错误场景各跑一次**（交付检查会点这个）。

### 0e README + 使用示例（25 分钟）

- 三处对账：删掉「`--apply` 还没实现」→ 换成四步流程 + 默认目标目录；冲突策略写清；把"流式"和"异步"分成两条。
- 加：一句话简介 / 安装（`pnpm install`）/ **用法示例 + 真实输出** / 设计说明（为什么用流）/ 已知限制 / **依赖说明**（只有 `pino` 一个，为什么）。
- `node tools/check-md-tables.js projects/p1-cli-organizer/README.md`

---

## 三 项目 1 交付检查（20 分钟，逐条打勾）

- [ ] `cd projects/p1-cli-organizer && pnpm test` **全绿**（`cli.test.js` 9/9 + `apply.test.js` 9/9）
- [ ] README 含：一句话简介、安装、用法示例、设计说明（为什么用流）、已知限制
- [ ] **至少处理了 3 类错误场景**（不存在 / 无权限 / 目标被占）—— 每条都有实测输出
- [ ] `node --inspect` 断点调试跑一遍（跑不了就如实记账）
- [ ] **打里程碑 tag**：`git tag -a p1-v1.0 -m "项目 1 交付：批量文件整理 CLI（干跑安全 + 流式复制 + 校验）"` → `git push --tags`
- [ ] 干跑安全仍然是底线：`node src/cli.js <目录>` **一个文件都不动**

---

## 四 周自测（0g，30 分钟，有时间就做；否则顺延 9/30）

**口径**（计划 §四 第 2 层）：**给需求 → 你自己写判据 → 你自己写实现**。判据只要求两件事：
① 跑起来有没有**你预期的输出** ② 能不能**数出行为**（次数 / 时序）。
候选题目（挑 1–2 道，都是本周的东西）：`parseArgs` 默写 / 目录大小统计（`dirSize` 重写）/ `p-limit` 的"一次只跑一个"最小版 / 把 `fetch` 封装整份重写（判据现成：`day13-fetch-verify.js` 8/8）。

---

## 五 三条通用提醒（**本周的账，不是"你慢"**）

1. **"票 vs 值"**（9/28 一天出现两次）：`fn` 要 `fn()` 才执行；`fetch(url)` 要 `await` 才是 Response；`sleep(ms)` 要 `await` 才是等待。
2. **接线三条**：`catch` 里要用的变量声明在 `try` 外面 / 每段每版用不同的名字 / **写完一个文件立刻 `node --check` + 跑一次**。
3. **判据的牙**：每条判据都要能说出"它在防哪种坏法"；"只执行一次 / 不重试"这类**必须数行为**；**先让它红一次**再信它的绿。
