# Day 4 — 2026-09-14（周一）

> **状态：待填写**　｜　详细指引：[`day04-timers.md`](day04-timers.md)
> 主题：**拆掉"无从下手"的墙 —— 定时器 + 装饰器 + 裸写 `debounce`**
> 今天故意排轻（核心约 3 小时）。**核心做完就算成功**，第二阶段的加量可选。

## 今日目标（必交 3 项 + 可选 2 项）

- [ ] 1. `week1-language/day02-debounce.js` —— `node week1-language/day04-debounce-verify.js` 通过 6 项
- [ ] 2. `week1-language/day03-array-methods.js` —— 补齐第 7 项（接住返回值 + `sort()` 对照）和第 8 项（`structuredClone` 换嵌套对象）
- [ ] 3. `notes/day04.md` + commit + push
- [ ] 阅读：《调度：setTimeout 和 setInterval》+《装饰器模式和转发，call/apply》
- [ ]（可选）4. `day02-clone.js` 手写深克隆
- [ ]（可选）5. `day02-curry.js`

## 探索 TODO（非清单，不许插队）

> 冒出"想看看 xxx"的念头就写这里，**不许当场去查**。清单交付完再看。
> 昨天登记过 4 条（`async`、`confirm` 的 Node 替代、`for...of`、Step 4 返回函数），归属见 [`day03.md`](day03.md)。

-

## 学会了什么

1.
2.
3.

## 卡在哪里

-

## 踩过的坑

-

## 欠账登记（如果今天没做完，按计划 §四 的规则写清楚）
| 欠什么 | 补在哪天 |
|---|---|
| （没欠账就写"无"） | |

## 明天第一件事（9/15，Day 5）
见计划 §四 第 1 周 Day 5 —— 主题是**四个函数收齐 + `p0-toolkit` 立项**：
写 `throttle` / `curry` / `clone` 深克隆（今天提前做掉就不用返工），把四个函数装进 `p0-toolkit`（JS 版），配 Vitest 先写 ≥6 个测试。

## 代码 / 命令备忘
```powershell
# 今天的核心命令：写完 debounce 就跑它
node week1-language/day04-debounce-verify.js

# 结果应该是：通过 6 项，失败 0 项（退出码 0）
echo $LASTEXITCODE

# 收尾
git add -A
git commit -m "day04: setTimeout + decorator chapter, write debounce"
git push
```
