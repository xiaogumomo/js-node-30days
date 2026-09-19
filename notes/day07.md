# Day 7 — 2026-09-19（周六）

> **状态：待填写**　｜　任务书：[`day07-async.md`](day07-async.md)
> **今天按 3～4 小时排**（"选 A"的执行方式：每天只放 3～4 小时的量、把清单划干净，多的推给下一天）
> ⚠️ **今天不追求把 Day 7 做完** —— 原本的内容拆成两段，今天只做前半（Promise 基础）

## 今日目标

**第一段：清 Day 6 欠账（约 2.5 小时）**
- [ ] 0-①. 补 `notes/day06.md` 的「学会了什么」第 2、3 条
- [ ] 0-②. `day06-prototype.js`：**手写原型继承 vs `class` 重写**，两边跑出同样结果
- [ ] 0-③. `day06-prototype.js` 修语法错误（`node --check` 先过）+ 字段初始化 4 步
- [ ] 0-④. 裸写 `myMap`/`myFilter`/`myReduce` → 脚手架 **17/17**
- [ ] 0-⑤. 搬进 `p0-toolkit/src/arrayUtils.js` + 测试 → `pnpm test` 全绿

**第二段：Day 7 前半（约 2 小时）**
- [ ] 1. CommonJS 自测（15 分钟，3 道题）
- [ ] 2. 读《回调》+《Promise》+《Promise 链》+《async/await》
- [ ] 3. `week1-language/day07-promise.js`：三种写法对照（回调 → Promise → `async/await`）
- [ ] 4. 日志 + commit + push

**今天不要求**（明天做）：微任务/宏任务、`Promise.all` 家族、ESM vs CJS、TypeScript

## 今日产出
| 文件 | 内容 |
|---|---|
| `week1-language/day06-prototype.js` | 手写原型继承 + `class` 重写 + 字段初始化顺序 |
| `week1-language/day06-array-utils.js` | `myMap` / `myFilter` / `myReduce` |
| `p0-toolkit/src/arrayUtils.js` | 搬进工具箱的版本 |
| `p0-toolkit/test/arrayUtils.test.js` | 它的测试 |
| `week1-language/day07-promise.js` | 回调 / Promise / `async/await` 三种写法对照 |

## 探索 TODO（非清单，不许插队）

> 已有归属：`process`（Node 里的输入输出）→ 待定；`Map` → 待定；`async` → **今天**。

-

## 学会了什么

1.
2.
3.

## 卡在哪里

-

## 踩过的坑

-

## 欠账登记（按计划 §四 的规则）
| 欠什么 | 补在哪天 |
|---|---|
| （没欠账就写"无"） | |

## 明天第一件事（9/20，Day 8）
1. 先把今天的欠账清掉
2. **Day 7 后半**：微任务 vs 宏任务、`Promise.all` 家族、ESM vs CJS 对比
3. 然后才是 Day 8 原本的内容：**TypeScript 入门 + 周复盘 + 周自测**
   ⚠️ **周复盘是测速点**：会重新算账，累计欠账每满 1 天就按规则顺延结束日

## 代码 / 命令备忘
```powershell
# 今天的四条核心命令
node --check week1-language/day06-prototype.js      # 先过语法
node week1-language/day06-array-utils-verify.js     # 目标 17/17
node week1-language/day07-promise.js                # 三种写法对照

cd week1-language/p0-toolkit
pnpm test                                          # 目标全绿

# 收尾
git add -A
git commit -m "day07: clear day06 debt, add array polyfills, first promises"
git push
git status -sb   # 没有 ahead 就同步好了
```

## 14:20 检查点
如果 Day 6 欠账还没清完，**今天就只清欠账**、Day 7 的内容整段顺延。
**这不是失败，这就是"选 A"的走法** —— 内容不丢，日期承担。
