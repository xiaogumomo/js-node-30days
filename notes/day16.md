# Day 16 — 2026-09-30（周三）**收尾日**

> **状态：待填写**　｜　总表：[`vacation-week3.md`](vacation-week3.md)（假期 8 天的总安排）　｜　交付清单：[`day15-project1-delivery.md`](day15-project1-delivery.md) 三
> **假期第 1 天（8h+）**　｜　**今天不动新内容**：① 把项目 1 交付掉 ② 把第 2 周复盘做掉
> **接昨天**：9/29 只完成一半 —— 0a 日志 + `memoize`（4/4，提交 `b1601cf`）、0b 包管理（`package.json` + `pino`）；**`--apply` 进行中（4 通过 / 5 红）**、收尾/README/交付检查/复盘 未做。

## 今日目标

- [×] ① **`--apply` 收尾** → `apply.test.js` **9/9**，`cli.test.js` 保持 **9/9**
- [ ] ② 项目收尾四件：错误分类 / `MoveError` / `pino` 结构化日志 / 优雅退出（+ 兜底 handler）
- [ ] ③ README 三处对账 + 使用示例 + 依赖说明
- [ ] ④ **项目 1 交付检查 6 条** + `git tag p1-v1.0` + `git push --tags`
- [ ] ⑤ **第 2 周复盘**：周自测（自己写判据）+「还会的」「忘了的」两张清单 + **轮转表扩容** + 重算日期
- [ ] ⑥ 欠账登记里的第 6 条：④ 阅读（pnpm / semver / lockfile / audit，4 行）
- [ ] ⑦ `notes/day15.md` 的格子补齐 + 日志 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `projects/p1-cli-organizer/src/cli.js` | `--apply` 收尾（失败隔离 / 幂等 / 冲突策略）| ⬜ |
| `projects/p1-cli-organizer/src/cli.js` | 收尾：错误分类 + `MoveError` + `pino` + 退出处理 | ⬜ |
| `projects/p1-cli-organizer/README.md` | 四步流程 / 冲突策略 / 依赖说明 / 使用示例 | ⬜ |
| `notes/week2-review.md` | **第 2 周复盘**（周自测 + 两张清单）| ⬜ |
| `week1-language/recall-arrayUtils.js`（或当轮模块）| 轮转复习：**合上重写** | ⬜ |

---

## ① 项目 1 交付（上午，约 3 小时）

### 1a `--apply` 收尾（判据 `apply.test.js` → 9/9）

现在 4 通过 / 5 红。**按红的顺序一条条修**（判据的失败信息直接写着差在哪）：

```powershell
node --test projects/p1-cli-organizer/test/apply.test.js
```

契约四步**顺序不能反**：`mkdir -p <目标>/<分类>/` → **流式复制**（`createReadStream` + `pipeline` + `createWriteStream`）→ **校验**（size + sha256）→ **校验通过才 `unlink` 源**。
两条已知盲区（别高估那个绿）：`06` 是**看代码的合同检查**、`05` 是**规模冒烟**，都不证明"用了流"。

### 1b 收尾四件（项目 1 的"错误处理"部分）

| # | 做什么 | 判据 |
|---|---|---|
| 1 | **错误分类**：① 源目录读不了 ② 单个文件搬不动（保留源）③ 目标被占（mkdir 失败）→ 各给一句人话 + 非零退出码 | 三类各跑一次 |
| 2 | **`MoveError extends Error`**：带 `file` / `cause` 字段 → 报错**带文件名** | 手动触发一次 |
| 3 | **`pino`**：`console.log/error` → `logger.info/error`，日志带字段 `{ file, category, err }` | 日志里能按字段搜 |
| 4 | **优雅退出**：`process.on('SIGINT')` 打印"已搬 N 个；**正在复制的那一个不会丢**"再退出；`unhandledRejection`/`uncaughtException` 各挂一个兜底 | Ctrl+C 试一次 |

### 1c README + 交付检查

三处对账（删「`--apply` 还没实现」→ 四步流程；冲突策略；把"流式"和"异步"分开）+ 使用示例 + 依赖说明（只有 `pino`，为什么）。

**交付检查 6 条**（`day15-project1-delivery.md` 三）：`pnpm test` 全绿（9/9 + 9/9）／README 五要素／三类错误各实测／`node --inspect` 断点（跑不了就记账）／**`git tag -a p1-v1.0`** 并推送／干跑安全底线复验。

---

## ② 第 2 周复盘（下午，约 2 小时）——**今天不动新内容**

### 2a 周自测（**给需求 → 你自己写判据 → 你自己写实现**，45 分钟）

候选（挑 2–3 道，都是本周的东西）：

| 题 | 需求 | 判据怎么看 |
|---|---|---|
| `parseArgs` 默写 | 写一个接受 `--target <目录>` / `--verbose` / `--apply` 的命令行解析 | 有没有 `allowPositionals`、`type` 只能 `string`/`boolean` |
| `dirSize` 重写 | 统计目录总字节 + `--top=3` | 数字对不对 + 路径相对 |
| **`fetchWithRetry` 整份重写** | 超时 + 重试 + 退避（**这是欠账第 8 条，正好今天清**）| 判据现成：`day13-fetch-verify.js` **8/8** |
| `p-limit` 的最小版 | 一次只跑一个的队列（`pLimit(1)`）| 判据现成：`day13-p-limit-verify.js` |

### 2b 两张清单（45 分钟）→ `notes/week2-review.md`

- **「还会的」**：第 2 周交付过的东西里，哪些现在闭着眼能写出来
- **「忘了的」**：**把第 1 周那 36 条清理 + 重排**（划掉已恢复的、合并重复的、剩下的编号重排）→ 这张表就是**每日抽考池**（收尾抽 2 条）
- **轮转表扩容**：第 1 周 5 个模块 + 本周产出（`once` / `p-limit` / `fetchWithRetry` / `dirSize` / `cli.js` 的 `main` / `countByExt`）
- **算账**：这一周"主线由 AI 收尾"发生了 2 次（9/27 `p-limit`+`fetch`、9/28-29 `--apply` 拖 2 天）；「忘了的」22 → 36 条 → **把这两笔写成"第 3 周的排法依据"**（每天只排一道新主线）

### 2c ④ 阅读补上（20 分钟）

pnpm 和 npm 的实质差别（为什么省磁盘 / 幽灵依赖）／语义化版本（`^` `~` 精确；`0.x` 特殊）／lockfile 为什么必须提交／"依赖越少越好"举一个例子（`postinstall` / 供应链）。写进日志 ④ 那四行。

---

## ③ 复习三触点（今天开始跑起来）

| 触点 | 内容 | 结果 |
|---|---|---|
| ① 开场 5 分钟：轮转 | `node week1-language/recall-verify.js`（今天轮到谁 → **合上重写**）| |
| ② 主线前 2 分钟：讲昨天的 | 不看材料讲"9/28 那天的 `p-limit` 两个真 bug + 为什么" | |
| ③ 收尾 3 分钟：抽考 2 条 | 从「忘了的」清单随机抽 2 条当场答 | |
| **明天开场要考的那条** | （写下来）| |

---

## 记账（**两面都记**）

| 这一遍 | 记什么 |
|---|---|
| **哪部分是 AI 给的** |safeUnlink / filehash / exists / resolvefilePath /this.code = cause?.code/ cause /code.message 的修改/优雅退出部分|
| **我自己写了哪几块** | moveOne的整体骨架，判断语句，stat提取元信息|

---

## 学会了什么

1.fs.access判断是否存在文件 返回resolve和reject放在try catch判断
2.hash.update 放入搅拌机操作
hash.digest 结果的操作
3.promie 版promise.all的写法  const [] = await Promise.all([
])；
4.require('pino');加载pino日志库
pino({base:undefined});base: undefined 去掉 pid/hostname，实测输出更干净

5.断点面板里那两个勾，勾上第二个「在抛出捕获的异常时暂停」（你的错误都被 catch 了，所以是"捕获的异常"那一档）→ 然后跑一个会失败的命令（比如目标里放个文件占住 images）→ DevTools 会直接停在 throw 那一行，你就能看到：在哪一步炸的、当时 err 是什么、调用栈是谁调的。

---

## 卡在哪里

1.不知道while循环可以失败条件直接退出，直接用{neme，ext}对象形式取出parse
2.卡在不知道fsp.access的方法
3.

---

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| （没欠账就写"无"） | |

## 明天第一件事

1. **10/1（周四）= 第 3 周 Day 17：Web 框架**（Fastify vs Express、路由、中间件/钩子、请求校验、统一错误处理）→ 当天任务书 + 判据由 AI 开工前给；项目部分 = 项目 2 起骨架（`GET /health` + 一条真实路由）
2. 顺手：欠账第 8 条（`fetch` 整份重写）如果今天没做，10/1 收尾补
3. （如果今天有顺延）先把欠账清掉

## 代码 / 命令备忘

```powershell
# 项目
cd projects/p1-cli-organizer
pnpm test                                          # 目标 9/9 + 9/9 全绿
node --test test/apply.test.js                     # 只看 --apply 那 9 条
node src/cli.js <某个临时目录>                      # 干跑（一个文件都不许动）
node src/cli.js <某个临时目录> --apply --verbose    # 真搬

# 交付
node tools/check-md-tables.js
git tag -a p1-v1.0 -m "项目 1 交付：批量文件整理 CLI（干跑安全 + 流式复制 + 校验）"
git push --tags

# 复习
node week1-language/recall-verify.js
node week1-language/recall-verify.js <今天轮到的模块>

# 收尾
git add -A && git commit -m "day16: project1 delivered (tag p1-v1.0) + week2 review" && git push
git ls-remote --heads origin main
```
