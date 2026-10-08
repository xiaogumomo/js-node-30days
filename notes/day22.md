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
| `node tools/ci-preflight.js` | **29/29**（新增"命令拼写"） | ci-preflight 29/29|
| **GitHub Actions 最新 run** | **conclusion: success** | GitHub run 5861767 → success（19s，全步 ✅|
| 周自测（闭卷重写 2 个模块） | 判据全绿（`dirSize` 10/10、`fetchWithRetry` 8/8） | dirSize 10/10 fetchWithRetry 8/8|
| 自写判据 | 跑起来有预期输出 + 能数出行为 | 欠账|

**实测输出**：
```
（ci-preflight 的 29 条）
（GitHub run 的 conclusion + 每一步的结论）
（周自测两个模块的 pass/fail）
```

## 复盘 A：周自测（闭卷重写）

| 题 | 重写进哪个文件 | 结果 | 卡在哪 |
|---|---|---|---|
| `dirSize` | `week2-runtime/day10-dir-size.js`（原位置覆盖）|10/10 | ``report.json()`|
| `fetchWithRetry` | `week2-runtime/day13-fetch.js`（原位置覆盖）| 8/8|options 漏参数 ＋ setTimeout 传调用结果） |
| （自己写的判据） | `week2-runtime/week3-self-test-verify.js` |未写 |欠账 |

## 复盘 B：两张清单

**「还会的」**（每条要带**今天的**实测证据）：

| # | 内容 | 证据 |
|---|---|---|
| 1 | dirSize 递归遍历| 10/10|
| 2 | fetchWithRetry 重试+退避+超时| 8/8|
| 3 | arseArgs 框架 |默写 + 自写判据都过过 ✓|
| 4 | 隔离测试那四步 | 列表不含 + 三个动作各 404 + A 自己 200|


**「忘了的」**（清理后 = 每日抽考池）：

| # | 内容 | 恢复动作（指到我的哪份材料）|
|---|---|---|
| 1 | mutation-check| |

**轮转表扩容**（本周新增/要进表的）：

| # | 模块 | 怎么验 | 上次做过 |
|---|---|---|---|
| 1 | `buildServer` 服务骨架 | `node --test projects/p2-task-api/test/server.test.js` | 10/6 重写 |
| 2 | `hashPassword` / `verifyPassword` | `node --test projects/p2-task-api/test/auth.test.js` | 10/5 |
| 3 | `signJwt` / `verifyJwt` | 同上 | 10/5 |
| 4 | base64url 往返 | 笔记 `notes/day19.md`「学会了什么」第 2 条 | 10/5 |
| 5 | `mutation-check` 的"突变"思路 | `node tools/mutation-check.js --list` | 10/7 |
| 6 | `ci-preflight` | `node tools/ci-preflight.js` | 10/8 |
## 复盘 C：算账 + 重算结束日

| 项 | 数字 |
|---|---|
| 10/7 下午 6 格 | 计划 230 / 实际 240（+4%） |
| 10/7 上午 4 格 | 计划 105 / 实际 约 235（+130） |
| 10/6 合上重写那格 | 计划 105 / 实际 193 |
| 累计欠账 | 约 ? 天 |
| **结束日：10/17 → 10/19** | **（今天必须写结论）** |

**三笔待定**（今天定）：

| 笔 | 结论 |
|---|---|
| Postgres 换引擎排哪天 |  docker 已装 |
| docker 装不装 | Postgres 拆两步 |
| 讲解日（欠账挂着） | 讲解日已做|

## 部署前置清单

| 项 | 现状 | 要不要改 / 怎么验 | 结论 |
|---|---|---|---|
| `PORT` 读环境变量 | ✓ 有 | 不用改 | 不改|
| `NODE_ENV` | ✓ Dockerfile 里 | 不用改 | 不改|
| 健康检查 `/health` | ✓ 有 | 不用改 |不改 |
| **优雅退出 SIGTERM** | ✗ 没有 | Windows 收不到 → **本机验不了**，记账 |**10/9 写这 5 行 + 在容器里真验**  |
| **数据持久化** | ✗ sqlite 在容器里 → 重启就没 | `docker compose up db` → 数据落卷| **10/9 用 pg 容器验**（换引擎第一步）|
| 日志 | 有（钩子 + console） | 够用 |  **不改**（分级/结构化 → 第 4 周）|

**平台结论**：railway 可连／fly 连不上　｜　决定：**真上线选 Railway**：
**真上线的时机**：**放在 Postgres 之后**（容器里 sqlite 数据不持久 → 上去也是"能访问但数据会丢"✓）

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




① 抽考 2 条（我抽的，都久没碰）：
     #11 事件循环六阶段 + poll 为什么"卡住等 I/O"
     #24「看得见 ≠ 落盘」：BEGIN 后没 COMMIT，为什么同连接查得到、换连接查不到


11.
timers setTimeout 和setInterval的到期回调
pending callbacks  上一圈IO的回调 上一圈没办完的事这一圈补办
idle/prepare  node.js内部 用不到
poll   执行I/O的回调 没有就等待
check   setImmediate 的回调
close callback 阶段  执行关闭时间的回调 关门清理现场的回调
微任务每执行完一个回调就清
因为要节省内存，如果后面阶段有任务优先进行后面阶段，如果没有就停住，减少内存的白白消耗
24.
没COMMIT等于数据还在结算过程中，需要COMMIT或者ROLLBACK 结算才能落地，换连接之后，如果连接关闭数据自动滚回，自然就查不到了

