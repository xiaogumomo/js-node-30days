# Day 10 — 2026-09-24（周四）

> **状态：待填写**　｜　任务书：[`day10-modules.md`](day10-modules.md)
> **第 2 周 Day 2**　｜　**接昨天**：Day 9 的"同步代码不跑完，事件循环一步都动不了"→ 今天用它理解"同步 vs 异步读目录"
> **今天的目标**：拿到一个**能跑出数字**的目录统计脚本，并说清"为什么用 `fs/promises` 而不是 `*Sync`"

## 今日目标

- [ ] ① 轮转复习（凭记忆 + 跑判据）
- [ ] ② 零提示题第 4 道 `groupBy` + **自写判据**
- [ ] ③ 阅读：`fs/promises` / `path` / `os` / `Buffer` / `process.argv` / `parseArgs`（3 行笔记）
- [ ] ④ 小实验：同步 vs 异步读目录（**接 Day 9**）
- [ ] ⑤ **主线** `week2-runtime/day10-dir-size.js`（`dirSize(dir)` + 命令行入口）
- [ ] ⑥ 判据 `day10-dir-size-verify.js` 跑绿
- [ ] ⑦ 日志 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `week2-runtime/day10-zerohint-04.js` | 零提示题 `groupBy` | ⬜ |
| `week2-runtime/day10-zerohint-04-verify.js` | **我自己写的判据** | ⬜ |
| `week2-runtime/day10-readdir.js` | 同步 vs 异步读目录 | ⬜ |
| `week2-runtime/day10-dir-size.js` | 目录大小报告（主线） | ⬜ |
| `week2-runtime/day10-dir-size-verify.js` | 判据（AI 写） | ⬜ |

---

## ① 轮转复习

| 模块 | 结果 | 卡在哪 |
|---|---|---|
| | | |
| | | |

---

## ② 零提示题第 4 道：`groupBy`

| 项 | 记录 |
|---|---|
| 用了几分钟 | |
| 做出来了吗 | |
| **判据是我自己写的吗** | |
| **有没有"先故意让它红一次"** | |
| **卡在哪一步** | |

---

## ③ 阅读笔记（3 行）

1. `fs/promises` 和回调版的关系：
2. 为什么要用 `path.join` 拼路径：
3. `--top=3` 这类选项，`util.parseArgs` 的 `options` 怎么写：

---

## ④ 小实验：同步 vs 异步读目录

| | 我的预测 | 实测 |
|---|---|---|
| 同步 `readdirSync` → `setTimeout(0)` 等多久 | | |
| 异步 `readdir` → `setTimeout(0)` 等多久 | | |

**1. 用 Day 9 的结论解释**（同步读目录时，事件循环在干嘛）：

**2. 如果第 3 周的 API 服务在请求处理里用了 `readdirSync`，会发生什么**：

---

## ⑤ 主线：`dirSize(dir)`

| 项 | 记录 |
|---|---|
| 最小版（不递归）跑出数字了吗 | |
| 递归 | |
| `--top` | |
| `--json` | |
| 目录不存在时友好报错 | |
| **今天最卡的一处** | |
| **放宽/绕过的地方**（有就写，说明为什么） | |

实测输出（贴一次真实运行结果）：

```
（把 `node week2-runtime/day10-dir-size.js .` 的输出贴在这里）
```

---

## 学会了什么

1.

## 卡在哪里

1.

---

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| （没欠账就写"无"） | |

## 明天第一件事

1. **Day 11（9/25）= Streams 与背压**：四种流、`pipe` vs `pipeline`、用 `Transform` 写"大文件逐行 JSON 解析器"，并用 `process.memoryUsage()` **实测**内存占用对比
2. （如果今天有顺延）先把欠账清掉

## 代码 / 命令备忘

```powershell
# ① 轮转复习
node week1-language/recall-verify.js
node week1-language/recall-verify.js <模块名>

# ② 零提示题
node week2-runtime/day10-zerohint-04.js
node --test week2-runtime/day10-zerohint-04-verify.js

# ⑤ 主线
node week2-runtime/day10-dir-size.js .
node week2-runtime/day10-dir-size.js . --top=3
node week2-runtime/day10-dir-size.js 不存在的目录

# ⑥ 判据
node --test week2-runtime/day10-dir-size-verify.js

# 收尾
git add -A
git commit -m "day10: fs/promises builtins + dir size report (recursive, --top/--json)"
git push
git status -sb
```
