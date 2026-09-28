# Day 15 — 2026-09-29（周二）

> **状态：待填写**（9/28 晚提前写好的模板）　｜　任务书：[`day15-project1-delivery.md`](day15-project1-delivery.md)
> **第 2 周 Day 7（本周最后一天）**　｜　**这天的性质**：把**项目 1 做完并交付**（不是新章节日；原"错误处理"并进项目收尾）
> **接昨天**：9/28 只完成了一半（下午有课）—— `once` **5/5** ✅、**`p-limit` 8/8** ✅、轮转 `throttle` **5/5** ✅、零提示题 `memoize` 判据闭环 ✅、`fetch` 分块练写完并评审；**顺延过来的**：日志欠账、包管理动手、**项目 `--apply`**、README。

## 今日目标

- [ ] ① 清日志欠账：`notes/day13.md` 的 4 格 + `notes/day14.md` 全篇 + **commit + push**
- [ ] ② 包管理动手：`package.json`（`pnpm init` + scripts + `pkg get type` + `pnpm test`）
- [ ] ③ **项目 1 `--apply`：真的搬文件**（流式复制 + 校验 + 失败隔离 + 幂等 + 冲突策略）→ 判据 **9/9**
- [ ] ④ 项目收尾：错误分类 + `MoveError` + `pino` 日志 + 优雅退出 + 兜底 handler
- [ ] ⑤ README 三处对账 + 使用示例
- [ ] ⑥ **项目 1 交付检查**（6 条）+ `git tag p1-v1.0`
- [ ] ⑦ 周自测（自己写判据；没时间就顺延 9/30）
- [ ] ⑧ 日志 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `notes/day13.md` / `notes/day14.md` | 日志欠账（9/27 + 9/28 两天的格子）| ⬜ |
| `projects/p1-cli-organizer/package.json` | `pnpm init` + `test` script +（`pino`）| ⬜ |
| `projects/p1-cli-organizer/src/cli.js` | **`--apply`：搬家四步 + 失败隔离 + 幂等 + 冲突策略** | ⬜ |
| `projects/p1-cli-organizer/README.md` | 四步流程 / 冲突策略 / 依赖说明 / 使用示例 | ⬜ |
| `week2-runtime/day15-zerohint-09.js`（若做周自测）| 周自测题 + **自写判据** | ⬜ |
| `projects/p1-cli-organizer/test/apply.test.js` | 判据（AI 写，✅ 已就位 + 负向验证过）| ✅ |

---

## ① 清日志欠账

**`notes/day13.md`（9/27 的 4 格）**

| # | 补什么 | 好了吗 |
|---|---|---|
| 1 | 今日目标 8 个复选框 | |
| 2 | 今日产出表状态列（⑤⑥ 标"AI 辅助"）| |
| 3 | ⑤ 的「实测输出」贴真实输出 | |
| 4 | 欠账登记表 | |

**`notes/day14.md`（9/28 的格子）**

| # | 补什么 | 好了吗 |
|---|---|---|
| 1 | 今日目标 + 今日产出状态 | |
| 2 | ① `once` **5/5** / `p-limit` **8/8**（两处都自己改对）| |
| 3 | ② 轮转 `throttle` **5/5** | |
| 4 | ③ 零提示题 `memoize` + **记账**（Map/JSON 两版是 AI 给的）| |
| 5 | ⑤⑥ `p-limit` 的两个真 bug + `fetch` 分块练四块状态 | |
| 6 | 欠账登记（顺延 4 项）+ 明天第一件事 | |

```powershell
node tools/check-md-tables.js
git add -A && git commit -m "day13+14: log wrap-up + once/p-limit rewrites (5/5, 8/8) + memoize criteria" && git push
```

---

## ② 包管理动手

| 项 | 记录 |
|---|---|
| `pnpm pkg get type` 是 `undefined` 吗（= CJS）| |
| `pnpm test` 几条通过 / 几条红（红的是待办还是坏了）| |
| `pnpm add pino` 之后 `package.json` / `pnpm-lock.yaml` 各多了什么 | |
| `pnpm audit` 输出怎么读 | |

---

## ③ 项目 1 `--apply`（今天的产品）

| 项 | 记录 |
|---|---|
| 四步的顺序（mkdir → ? → ? → ?）| |
| 流式复制用的什么 API | |
| 校验比了什么 | |
| **为什么"删源"必须在校验之后** | |
| 失败隔离（`try/catch` 包在哪一层）| |
| 幂等（怎么跳过目标目录的）| |
| 重名冲突：选了哪种策略 + 为什么 | |
| **判据结果**（`apply.test.js` 目标 9/9；`cli.test.js` 保持 9/9）| |
| **最卡的一处** | |

**实测输出（贴一次真实的）**：

```
（贴 node --test projects/p1-cli-organizer/test/apply.test.js 的结果；
  再贴一次干跑 vs 真搬的输出对比）
```

---

## ④ 项目收尾（错误处理 / 日志 / 优雅退出）

| 项 | 记录 |
|---|---|
| 三类错误各是什么 / 各自的报错长什么样 | |
| `MoveError` 里放了什么字段（为什么报错要带文件名）| |
| **结构化日志比 `console.log` 好在哪**（一句）| |
| Ctrl+C 时打印什么 / **为什么正在复制的那一个不会丢** | |
| `unhandledRejection` 这种兜底为什么"不是正常流程" | |

---

## ⑤ README + 示例

| 项 | 记录 |
|---|---|
| 三处对账都改了吗 | |
| 使用示例照着抄能跑出预期输出吗 | |
| 依赖说明（只有 `pino`，为什么）| |

---

## ⑥ 项目 1 交付检查

- [ ] `pnpm test` 全绿（9/9 + 9/9）
- [ ] README 五要素齐（简介 / 安装 / 用法 / 设计说明 / 已知限制）
- [ ] 三类错误场景都实测过
- [ ] `node --inspect` 断点跑过（或记账）
- [ ] `git tag p1-v1.0` 打了并推送
- [ ] 干跑安全底线复验（`node src/cli.js <目录>` 不动文件）

---

## 学会了什么

1.

---

## AI 复核（9/29 现场 —— 这一段是 AI 补的）

> 待填：每项的实测结果、记账（哪几行是 AI 给的）、以及当天发现的新坑。

---

## 卡在哪里

1.

---

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| （没欠账就写"无"） | |

## 明天第一件事

1. **9/30（周三）= 第 2 周周复盘 + 第 3 周启动**：周自测（自己写判据）+「还会的」「忘了的」两张清单 + 更新轮转表（把本周产出加进去）+ **重算日期（确认结束日，现为 10/17）**
2. （如果今天有顺延）先把欠账清掉

## 代码 / 命令备忘

```powershell
# ① 日志欠账 + 提交
node tools/check-md-tables.js
git add -A && git commit -m "day13+14: log wrap-up" && git push

# ② 包管理
cd projects/p1-cli-organizer
pnpm init
pnpm pkg set scripts.test="node --test test/"
pnpm pkg get type          # 必须是 undefined
pnpm test                  # 3 通过 / 6 红（= --apply 待办）
pnpm add pino

# ③④⑤ 项目
node --test projects/p1-cli-organizer/test/cli.test.js     # 9/9（干跑底线）
node --test projects/p1-cli-organizer/test/apply.test.js   # 9/9（真的搬 + 不丢）
node tools/check-md-tables.js projects/p1-cli-organizer/README.md

# ⑥ 交付
git tag -a p1-v1.0 -m "项目 1 交付：批量文件整理 CLI（干跑安全 + 流式复制 + 校验）"
git push --tags
```
