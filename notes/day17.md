# Day 17 — 2026-10-02（周五）

> **状态：待填写**　｜　任务书：[`day17-web-framework.md`](day17-web-framework.md)
> **假期第 3 天（8h+）**　｜　**第 3 周 Day 1**　｜　⚠️ **10/1 的那天没做**（延期 +1 天，见计划 §八 第八次调整）
> **上午**：补**第 2 周复盘**（不动新内容）　｜　**下午**：**Web 框架** → 项目 2 起骨架
> **接昨天**：9/30 **项目 1 交付完成**（`tag p1-v1.0` → `b5f5414`，本地=远程，该提交 **18/18 全绿**）；剩下的顺延到今天上午。

## 今日目标

- [ ] ① **第 2 周复盘**：周自测（自己写判据）+「还会的」「忘了的」两张清单 + **轮转表扩容** + 重算日期
- [ ] ② ④ 阅读四行 + 无权限实测 + 补 `day15.md`/`day16.md` 日志 → **commit**
- [ ] ③ **项目 2 骨架**：`projects/p2-task-api/src/server.js`（`buildServer` + `/health` + `/tasks` + `/404 JSON` + `/boom → 500`）→ 判据 **7/7**
- [ ] ④ 包管理：`pnpm init --init-type commonjs` + `start`/`test` scripts + `pnpm add fastify`
- [ ] ⑤ 日志 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `notes/week2-review.md` | **第 2 周复盘**（两张清单 + 轮转表 + 重算日期）| ⬜ |
| `notes/day15.md` / `notes/day16.md` | 补齐昨天欠的日志格子 + 记账两行 | ⬜ |
| `projects/p2-task-api/package.json` | `pnpm init --init-type commonjs` + scripts + `fastify` | ⬜ |
| `projects/p2-task-api/src/server.js` | `buildServer()` + 4 个端点 + 统一错误处理 | ⬜ |
| `projects/p2-task-api/test/server.test.js` | 判据（AI 写，✅ 已就位 + 负向验证过）| ✅ |

---

## 10/1 复盘（零产出那天 —— 如实写；这是数据，不是审判）

> 补记：10/1 全天零产出，唯一痕迹是 `week2-runtime/weekly-self-test.js`（22 字节，只写了 `//parseArgs 默写`；10/2 改名去掉了文件名里的空格）。按计划 §八 第八次调整整体 +1 天，结束日 → **10/17**。

| 问题 | 我的回答 |
|---|---|
| 10/1 一天实际怎么过的（从起床说起，时间去哪了）| |
| 触发器：先"起床就玩游戏"，还是先"碰壁想逃"？两个都发生了的话，先后顺序是 | |
| "想逃"那一刻，具体在躲什么（怕写不出？怕又变成抄？怕又慢？）| |
| 停在 22 字节那一下：当时想做的第一步是什么？为什么停住 | |
| 今天防它的两条：① 第一步小到不可能失败（触点 ①② = 10 分钟）② 卡住 15 分钟就换路子 —— 够用吗？不够的话加什么 | |
| 一句话：下次同样的早上，我第一时间做什么 | |

---

## ① 第 2 周复盘

**1a 周自测（自己写判据 + 自己写实现）**

| 题 | 做出来了吗 | 判据是我写的吗 | 卡在哪 |
|---|---|---|---|
| `parseArgs` 默写 | | | |
| `dirSize` 重写 | | | |
| **`fetch` 整份重写**（欠账第 8 条，判据 8/8）| | | |
| `p-limit` 重写（先 `pLimit(1)` → 推广到 n；判据 8/8）| | | |

**1b 两张清单 + 轮转表 + 算账**

| 项 | 结果 |
|---|---|
| 「还会的」几条 | |
| 「忘了的」**清理前 → 清理后**条数（原 36 条）| |
| 轮转表扩容后有几个模块 | |
| 重算后的结束日 | |

**1c ④ 阅读四行**

1. pnpm 和 npm 最实质的差别（为什么省磁盘 / 幽灵依赖）：
2. `^1.2.3` / `~1.2.3` / `1.2.3` 各放行哪一档；`0.x.y` 特殊在哪：
3. lockfile 为什么必须提交（没有它会怎样）：
4. "依赖越少越好"用一个例子说清（`postinstall` / 供应链）：

**1d 无权限实测**（`node projects/p1-cli-organizer/src/cli.js "C:/Windows/System32/config"`）输出贴这里：

```
（贴真实输出）
```

---

## ② 项目 2：Web 框架 → 骨架

**2a 框架选择 + 拆块**

| 项 | 记录 |
|---|---|
| 我选了哪个框架（Fastify / Express）+ **为什么** | |
| ① 起服务 + `GET /health` 卡在哪 | |
| ② 路由 + 参数（`GET /tasks`、`/tasks/:id`）卡在哪 | |
| ③ 钩子（请求日志）卡在哪 | |
| ④ **统一错误处理**（`setErrorHandler` + 404 JSON）卡在哪 | |

**2b 契约 + 判据**

| 项 | 记录 |
|---|---|
| `buildServer()` 为什么"不许自己 listen"（我的理解）| |
| `/boom` 为什么只注册在非 production | |
| 404 为什么必须是 JSON（不是 HTML）| |
| **判据结果**（目标 7/7）| |
| **今天最卡的一处** | |

**实测输出（贴一次真实的）**：

```
（贴 node --test projects/p2-task-api/test/server.test.js 的结果；
  再贴一次 node src/server.js 起来后 curl / fetch /health 的输出）
```

---

## ③ 复习三触点

| 触点 | 内容 | 结果 |
|---|---|---|
| ① 开场 5 分钟：轮转 | **今天轮到 `curry`** → 写到 `week1-language/recall-curry.js` → `node week1-language/recall-verify.js curry` | |
| ② 主线前 2 分钟：讲昨天的 | 不看材料讲"项目 1 交付时踩的 4 个错"（`process.exit` 在循环里 / `HINTS` 作用域 / pino 写在成功分支 / `debugger listening` 抄进代码）| |
| ③ 收尾 3 分钟：抽考 2 条 | 从「忘了的」清单随机抽 2 条当场答 | |
| **明天开场要考的那条** | （写下来）| |

---

## 记账（**两面都记**）

| 这一遍 | 记什么 |
|---|---|
| **哪部分是 AI 给的** | |
| **我自己写了哪几块** | |

---

## 学会了什么

1.

---

## 卡在哪里

1.忘记退避等待如何执行了
2.忘记AbortController怎么拼了
3.忘记fetch返回的Response对象具体有哪些了
4.忘记转化成数字了
5.忘记先判断是否为机器人了和判断机器人后输出为什么忘了
6.忘记JOSN.stringify(values,replacer,space)格式
7.忘记padstart的含义：目标字符串长度，如果不够用空格代替
8.没有正常throw err 用process.code非零代表出现错误
---

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| **2c 的 ④ 阅读**（pnpm / 语义化版本 / lockfile / `npm audit` 四行，入口在 `notes/day14-packages-project1.md` 的书单表）| 10/3（砍单时**最先砍它**）|
| 2c 的无权限实测（2 分钟；命令与预期输出在任务书 0c）| 10/3 |
| **Day 17 下午全部**：3a 读 → 装包 → 3b 拆 4 块 → 3c `server.js` → **判据 7/7** | **10/3 上午**（先做它，再进 Day 18）|
| `day15.md` / `day16.md` 的日志格子 + 记账两行 | 10/3 收尾（15 分钟）|
| 今天（10/2）的 `server.js` 那一格是空的 → 三阶法第 3 阶（合上重写）顺延到 10/4 | 10/4 开场 |

## 明天第一件事

1. **开场 10 分钟（小到不可能失败）**：① 轮转 `dirSize`（间隔表 **D+1** → **合上重写**，判据 `node --test week2-runtime/day10-dir-size-verify.js`）② 不看材料讲"今天的两个坑"（**拼错的选项静默失效** / **工具函数 `catch` 不重抛 = 吞错**）
2. **上午：把顺延的 Day 17 下午做完** —— 项目 2 骨架：3a 读（Fastify 路由 / 钩子 / 统一错误处理）→ **先装包**（`pnpm init --init-type commonjs` + `pnpm add fastify`）→ 3b 拆 4 块 → 3c 拼 `server.js` → **判据 7/7**
3. **下午：Day 18（数据库与 ORM）** —— 关系模型 / 索引 / 事务 / Postgres 基础 SQL / Prisma 起步 → 项目 2 接真库（`tasks` 表 + CRUD）
4. 时间不够就按砍单顺序：④ 阅读 → 无权限实测 → 3b③ 钩子 → 日志格子；**不许砍**：`server.js` 能跑（7/7）

## 代码/命令备忘

```powershell
# ① 复盘
node week1-language/recall-verify.js                     # 看轮转表（今天轮到 curry）
node week1-language/recall-verify.js curry               # 重写后验收
node --test week2-runtime/day10-dir-size-verify.js       # dirSize 重写（目标 10/10）
node --test week2-runtime/day13-fetch-verify.js          # fetch 整份重写（8/8）
node --test week2-runtime/day13-p-limit-verify.js        # p-limit 重写（8/8）
node projects/p1-cli-organizer/src/cli.js "C:/Windows/System32/config"   # 无权限实测（预期：没有权限 + 退出码 1）

# ② 项目 2
cd projects/p2-task-api
pnpm init --init-type commonjs
pnpm pkg set scripts.test="node --test"
pnpm pkg set scripts.start="node src/server.js"
pnpm add fastify
pnpm pkg get type                                        # undefined = CJS ✅
node --test test/server.test.js                          # 目标 7/7
node src/server.js                                       # 起服务（PORT=3000）

# 收尾
node tools/check-md-tables.js
git add -A && git commit -m "day17: week2 review + project2 skeleton (fastify, 7/7)" && git push
git ls-remote --heads origin main
```
