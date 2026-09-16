# Day 6 — 2026-09-17（周四）

> **状态：待填写**　｜　任务书：[`day06-this-prototype.md`](day06-this-prototype.md)
> 主题：**`this` / 原型链 / `class`** + 数组三个方法的 polyfill
> ⚠️ **今天第一件事是收尾 Day 5**（约 30 分钟，见第二节）—— 按计划规则，欠账不清不动新章节。

## 今日目标

**必交**
- [ ] 0. Day 5 欠账 4 件（日志三节 / 一条 throttle 测试 / 三个自测题 / 读 4 个测试文件）
- [ ] 1. `week1-language/day06-this.js` —— 四种 `this` 绑定 + 箭头函数，输出对上对照表
- [ ] 2. `week1-language/day06-prototype.js` —— 手写原型继承 + `class` 重写 + 字段初始化顺序
- [ ] 3. `week1-language/day06-array-utils.js` —— `day06-array-utils-verify.js` **通过 17 项**
- [ ] 4. 工具箱新增第 5 个模块：`p0-toolkit/src/arrayUtils.js` + `test/arrayUtils.test.js`，`pnpm test` 全绿
- [ ] 5. 日志 + commit + push

**可选**
- [ ] 6. 英文 15 分钟 + AI 协作

## 今日产出
| 文件 | 内容 |
|---|---|
| `week1-language/day06-this.js` | 默认 / 隐式 / 显式 / `new` 四种绑定 + 箭头函数的 `this` |
| `week1-language/day06-prototype.js` | 原型链手写继承 vs `class` 重写 + 字段初始化顺序 |
| `week1-language/day06-array-utils.js` | `myMap` / `myFilter` / `myReduce` |
| `p0-toolkit/src/arrayUtils.js` | 搬进工具箱的版本 |
| `p0-toolkit/test/arrayUtils.test.js` | 它的测试 |

## 探索 TODO（非清单，不许插队）

> 已有归属：`Map` → 待定（写深克隆时撞到过）；`async` → **明天 Day 7**；CommonJS（`require`/`module.exports`）→ **明天 Day 7**。

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

## 明天第一件事（9/17，Day 7）
见计划 §四 第 1 周 Day 7 —— 主题是**异步三件套 + 模块系统**：
① **CommonJS 基础**（`module.exports` / `require` 的三个动作、缓存、`exports` 的坑）② 回调 → Promise → async/await 的演进动因、微任务 vs 宏任务、`Promise.all` 家族 ③ ESM vs CJS 的机制差异。

## 代码 / 命令备忘
```powershell
# 今天的核心命令
node week1-language/day06-array-utils-verify.js    # 目标：通过 17 项

# 工具箱的测试
cd week1-language/p0-toolkit
pnpm test        # 目标：tests 18+ / fail 0

# 收尾
git add -A
git commit -m "day06: this/prototype/class drills, add array polyfills"
git push
git status -sb   # 没有 ahead 就同步好了
```

## 14:40 检查点
如果 14:40 还没写完 `this` 的演示，就把原型链的阅读压到 30 分钟，**先保住 array polyfill 的裸写时段**。
