# Day 2 — 2026-09-12（周六）

> **状态：待填写**（今天的详细指引见 [`day02-functions.md`](day02-functions.md)）

## 今日目标
- [ ] 复习：还 Day 1 的债（错题本 P0 三项 + 12 道变式题 ≥10/12）
- [ ] 学：函数声明 / 表达式 / 箭头函数差异、默认参数、rest/spread
- [ ] 学：作用域链、暂时性死区（TDZ）
- [ ] 裸写：防抖（支持 `immediate`）、节流、柯里化
- [ ] 裸写：浅拷贝 vs 深克隆（手写 vs `structuredClone` 对比）
- [ ] LeetCode 1 题（含复杂度分析）+ 英文 15 分钟
- [ ] commit + push

## 今日产出
| 文件 | 内容 |
|---|---|
| [`week1-language/day02-scope.js`](../week1-language/day02-scope.js) | 提升差异 / 三层嵌套作用域 / 循环里的 `var` vs `let` |
| [`week1-language/day02-debounce.js`](../week1-language/day02-debounce.js) | 防抖，支持 `immediate` |
| [`week1-language/day02-throttle.js`](../week1-language/day02-throttle.js) | 节流，两个版本（补执行 / 不补执行） |
| [`week1-language/day02-curry.js`](../week1-language/day02-curry.js) | 柯里化 + `compose` |
| [`week1-language/day02-clone.js`](../week1-language/day02-clone.js) | 浅拷贝三种写法 + 手写深克隆 + `structuredClone` 对比 |
| [`week1-language/day02-leetcode.js`](../week1-language/day02-leetcode.js) | LeetCode 1 题 |

（上面的文件名如果实际不一样，改成实际的——这份表是给你打的草稿。）

## 学会了什么
1.
2.
3.

## 卡在哪里
-

## 踩过的坑
- （今天新踩的坑写这里。Day 1 的三条：Node 里没有 `alert`、编辑器自动补全误插 `import`、练习文件全是注释没验证）

## 明天第一件事（9/13，Day 3）
- 主题：数组与对象（`map/filter/reduce/...`、不可变更新模式）
- 额外任务：**周复盘** `notes/week1-review.md` + 启动周末小项目 **`p0-toolkit`**（把今天写的四个函数搬进去，配 Vitest 测试）

## 代码 / 命令备忘
```powershell
# 边写边跑（改一次自动重跑）
node --watch week1-language/day02-debounce.js

# 验证防抖：连调 5 次，应当只打印 1 次
# 今天的 commit
git add -A
git commit -m "day02: ..."
git push
```
