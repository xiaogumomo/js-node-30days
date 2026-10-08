# Day 22 — 2026-10-08（周四）

> **状态：待填写**　｜　任务书：[`day22-review-deploy.md`](day22-review-deploy.md)
> **实际开始 09:15**　｜　**第 3 周 Day 6（复盘日）**　｜　**今天**：第 3 周复盘 + 部署起步
> **⭐ 开场已知（AI 查明的）**：CI **真跑了**，红在第 5 步"装依赖" → 注解 `exit code 127`（命令找不到）→ 真因：**run 块里 `pnmp` 拼错**（22 / 26 行）→ 今天第一件事：修 + push + **看新 run**
> **今天的判据**：`node tools/ci-preflight.js`（29 条，新增"命令拼写"）+ **GitHub Actions 的真结论**
> **复盘日的规矩**：**不加新知识点**；产出是"判断"（会/不会、排哪天）

## 今日目标

- [ ] ① 轮转 3 个：`fetchWithRetry` ＋ `countByExt` ＋ **`deepClone`（10/7 欠的）**
- [ ] ② **修 CI**（`pnmp` → `pnpm`）→ `ci-preflight` **29/29** → commit + push
- [ ] ③ **看新 run 的结论** → 目标 **success**（红了继续修）
- [ ] ④ **复盘 A 周自测**：闭卷重写 2 个模块 + 自己写一份判据
- [ ] ⑤ **复盘 B**：两张清单清理 + 轮转表扩容
- [ ] ⑥ **复盘 C**：算账 + **重算结束日** + 三笔待定（Postgres / docker / 讲解日）
- [ ] ⑦ **部署前置清单**（六项：现状 / 要不要改 / 怎么验）
- [ ] ⑧ 二选一：真上线 Railway 或 Postgres 起步
- [ ] ⑨ 结算账：JWT 组分块默写（5 处）+ 讲解日（口述 1 条）+ README「怎么跑」+ **LeetCode 二选一**
- [ ] ⑩ 收尾：日志 + 抽考 2 条 + 计划 vs 实际 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `.github/workflows/ci.yml` | 修 `pnmp` 拼写 | |
| `notes/week3-review.md` | 第 3 周复盘（**新文件**）：周自测 + 两张清单 + 轮转表 + 结束日 | |
| （日志）部署前置清单 | 六项逐条 | |
| `projects/p2-task-api/README.md` | 「怎么跑」一节 | |

## 判据结果

| 判据 | 目标 | 实际 |
|---|---|---|
| `node tools/ci-preflight.js` | **29/29**（新增"命令拼写"） | |
| **GitHub Actions 最新 run** | **conclusion: success** | |
| 周自测（闭卷重写 2 个模块） | 判据全绿（`dirSize` 10/10、`fetchWithRetry` 8/8） | |
| 自写判据 | 跑起来有预期输出 + 能数出行为 | |

**实测输出**：
```
（ci-preflight 的 29 条）
（GitHub run 的 conclusion + 每一步的结论）
（周自测两个模块的 pass/fail）
```

## 复盘 A：周自测（闭卷重写）

| 题 | 重写进哪个文件 | 结果 | 卡在哪 |
|---|---|---|---|
| `dirSize` | `week2-runtime/day10-dir-size.js`（原位置覆盖）| | |
| `fetchWithRetry` | `week2-runtime/day13-fetch.js`（原位置覆盖）| | |
| （自己写的判据） | `week2-runtime/week3-self-test-verify.js` | | |

## 复盘 B：两张清单

**「还会的」**（每条要带**今天的**实测证据）：

| # | 内容 | 证据 |
|---|---|---|
| 1 | | |

**「忘了的」**（清理后 = 每日抽考池）：

| # | 内容 | 恢复动作（指到我的哪份材料）|
|---|---|---|
| 1 | | |

**轮转表扩容**（本周新增/要进表的）：

| # | 模块 | 怎么验 | 上次做过 |
|---|---|---|---|
| 1 | | | |

## 复盘 C：算账 + 重算结束日

| 项 | 数字 |
|---|---|
| 10/7 下午 6 格 | 计划 230 / 实际 240（+4%） |
| 10/7 上午 4 格 | 计划 105 / 实际 约 235（+130） |
| 10/6 合上重写那格 | 计划 105 / 实际 193 |
| 累计欠账 | 约 ? 天 |
| **结束日：10/17 → ?** | **（今天必须写结论）** |

**三笔待定**（今天定）：

| 笔 | 结论 |
|---|---|
| Postgres 换引擎排哪天 | |
| docker 装不装 | |
| 讲解日（欠账挂着） | **今天做掉**（口述 1 条）|

## 部署前置清单

| 项 | 现状 | 要不要改 / 怎么验 | 结论 |
|---|---|---|---|
| `PORT` 读环境变量 | ✓ 有 | 不用改 | |
| `NODE_ENV` | ✓ Dockerfile 里 | 不用改 | |
| 健康检查 `/health` | ✓ 有 | 不用改 | |
| **优雅退出 SIGTERM** | ✗ 没有 | Windows 收不到 → **本机验不了**，记账 | |
| **数据持久化** | ✗ sqlite 在容器里 → 重启就没 | **真上线的前置** | |
| 日志 | 有（钩子 + console） | 够用 | |

**平台结论**：railway 可连（301）／fly 连不上 → 选 ?　｜　决定：**真上线 / 先换 Postgres**：

## 学会了什么

（2–3 条；最好有一条是"CI 的绿和本机的绿差在哪"）

## 卡在哪里

（1–2 条，含"卡了多久"）

## 欠账登记

| 欠什么 | 补在哪天 |
|---|---|
| `docker build` / `compose up` 本机验不了 | 装 docker 之后 |
| Postgres 换引擎 | 复盘定的那天 |
| 12 处 TODO 的其余四组（scrypt 2 / 框架形状 3 / 数据 2 / auth 口述 1）| 第 4 周 |
| Eloquent/结构化日志、可观测 | 第 4 周 |

## 明天第一件事

1. **10/9**：按今天复盘定的顺序（部署后继 / Postgres 换引擎 / 第 4 周内容）
2. 开场照旧：轮转（按新轮转表）+ 合上重写今天最卡的一处

## 代码/命令备忘

```powershell
# ① 修 CI + 推
node tools/ci-preflight.js                    # 29/29
git add -A; git commit -m "ci: fix pnmp typo"; git push

# ② 看 GitHub 上的真结论（不用浏览器也行）
curl.exe -s "https://api.github.com/repos/xiaogumomo/js-node-30days/actions/runs?per_page=1"
# 逐步结论（哪一步红）：
#   curl.exe -s ".../actions/runs/<run_id>/jobs"

# ③ 周自测
node --test week2-runtime/day10-dir-size-verify.js
node --test week2-runtime/day13-fetch-verify.js

# ④ 收尾
node tools/check-md-tables.js
node tools/sp-tasks.js today
git add -A; git commit -m "day22: week3 review + deploy prep"; git push
```

## 计划 vs 实际

（收尾时填：`node tools/sp-tasks.js today` 的对比 + 一句结论）
