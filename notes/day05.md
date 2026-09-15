# Day 5 — 2026-09-15（周二）

> **状态：待填写**　｜　任务书：[`day05-guide.md`](day05-guide.md)
> 主题：**`throttle` + `curry` + `p0-toolkit` 立项**
> 今天的定位：不是学新知识，是把「接收一个函数、返回一个新函数」这个模式**用第三次和第四次**。

## 今日目标（必交 5 项 + 顺手 1 项）

- [ ] 1. `week1-language/day02-throttle.js` —— `day05-throttle-verify.js` 通过 5 项
- [ ] 2. `week1-language/day02-curry.js` —— `day05-curry-verify.js` 通过 12 项
- [ ] 3. `week1-language/p0-toolkit/` —— `package.json` + `README.md` + `src/`（4 个函数）+ `test/`
- [ ] 4. 在 `p0-toolkit/` 下 `pnpm test` 全绿（至少 6 个用例）
- [ ] 5. 日志 + commit + push
- [ ] 顺手：`day02-debounce.js` 头部那句 `immediate` 语义补完（5 分钟）

## 今日产出
| 文件 | 内容 |
|---|---|
| `week1-language/day02-throttle.js` | 节流（首次立刻执行，interval 内忽略）|
| `week1-language/day02-curry.js` | 柯里化（逐个传参 / 一次传多个）|
| `week1-language/p0-toolkit/package.json` | 工具库配置（`"test": "node --test"`）|
| `week1-language/p0-toolkit/README.md` | 简介 + 快速开始 + 函数清单 + **已知限制** + 后续计划 |
| `week1-language/p0-toolkit/src/*.js` | `debounce` / `throttle` / `curry` / `deepClone` |
| `week1-language/p0-toolkit/test/*.test.js` | 至少 6 个用例 |

## 探索 TODO（非清单，不许插队）

> 冒出"想看看 xxx"的念头就写这里，**不许当场去查**。清单交付完再看。
> 已有归属：`step4.返回函数` → **今天（闭包收尾）**；`Map` → 待定；`this` 指向 → **明天（Day 6）**；`async` → 后天（Day 7）。

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

## 明天第一件事（9/16，Day 6）
见计划 §四 第 1 周 Day 6 —— 主题是 **`this` / 原型链 / `class`**：
四种 `this` 绑定、箭头函数为何没有 `this`、`prototype` 与 `__proto__`、`class` 语法糖、继承与 `super`。
（顺带：今天 `throttle`/`curry` 里那些 `fn.apply(this, args)`，那个 `this` 到底是谁，明天有答案。）

## 代码 / 命令备忘
```powershell
# 今天的两条核心命令
node week1-language/day05-throttle-verify.js    # 目标：通过 5 项
node week1-language/day05-curry-verify.js       # 目标：通过 12 项

# 工具库的测试
cd week1-language/p0-toolkit
pnpm test        # 等于 node --test，自动找 test/ 下的 *.test.js

# 收尾
git add -A
git commit -m "day05: add throttle and curry, boot p0-toolkit"
git push
git status -sb   # 没有 ahead 就同步好了
```

## 14:40 检查点
如果 14:40 还没开始搭 `p0-toolkit`，就先放弃 `curry` 的"一次传多个参数"进阶要求，**保住工具库**——它是本周的产出物。
