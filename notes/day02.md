# Day 2 — 2026-09-12（周六）

> **状态：部分完成（约 30%）** —— 清单上的四个裸写函数一个都没开始
> 详细指引：[`day02-functions.md`](day02-functions.md)　｜　欠账登记见本文末

## 今日目标
- [x] 复习：还 Day 1 的债（错题本 P0 三项 + 12 道变式题）
- [x] 学：函数声明 / 函数表达式、默认参数
- [ ] 学：箭头函数、rest/spread　→ 欠
- [ ] 学：作用域链、暂时性死区（TDZ）　→ 欠
- [ ] 裸写：防抖（支持 `immediate`）　→ 欠
- [ ] 裸写：节流　→ 欠
- [ ] 裸写：柯里化　→ 欠
- [ ] 裸写：浅拷贝 vs 深克隆（手写 vs `structuredClone` 对比）　→ 欠
- [ ] LeetCode 1 题　→ 欠
- [x] commit + push
- [ ] 英文 15 分钟

## 今日产出
| 文件 | 内容 |
|---|---|
| [`week1-language/day02-functions-practice.js`](../week1-language/day02-functions-practice.js) | 当天全部练习，315 行（绝大部分是注释）。含 Day 1 欠账、函数/表达式两章的示例与课后题、数组章练习、Promise/async 手写练习 |

## 实际情况：产出量不小，但大部分是清单外的

当天写了 315 行练习，量不算小。按内容归类：

| 内容 | 属于哪天 | 状态 |
|---|---|---|
| `[] == false` 口语复述、ToPrimitive 的 hint 笔记 | Day 1 欠账 | ✅ 该做的，完成 |
| 函数 / 函数表达式两章示例与课后题（`showMessage`、`checkAge`、`min`、`pow`、`ask` 回调） | Day 2 | ✅ 该做的，完成 |
| 数组章练习（`push/pop/shift/unshift`、`length` 截断、`at(-1)`、矩阵、`styles` 课后题） | **Day 3** | ⚠️ 提前做了，但属插队 |
| Promise / async-await 手写练习（含"第二遍复习"凭记忆重写） | **Day 6** | ⚠️ 提前做了，但属插队 |
| 箭头函数、rest/spread、作用域链、TDZ | Day 2 | ❌ 没碰 |
| `debounce` / `throttle` / `curry` / `clone` 四个裸写函数 | Day 2 | ❌ 没碰（全文 grep 结果均为 0） |

**结论：主要问题不是时间不够，是清单外的内容插队。** 计划 §七 已新增心法第 6 条专门治这件事。

## 学会了什么
1. 函数与函数表达式两章读完，两章的课后题都动手做了：`checkAge` 用三元和 `||` 各写一遍、`min`、`pow` 用循环和 `**` 各写一遍。
2. `[] == false` 能完整口述了——"两边都要转成数字：`[]` 先转空字符串、空字符串再转 `0`，右边 `false` 默认转 `0`，`==` 不追求形式所以返回 `true`"。这正是 Day 1 错题本里点名要口述的那道题。
3. 自己找到了 Node 里替代浏览器 `prompt()` 的正解：`node:readline/promises`。这个直觉是对的，保留。
4. 有"第二遍复习"的意识：Promise 那段手写了两遍，第二遍是凭记忆重写——这正是 §二 作息模板里 07:30 复习段的做法，值得保持。

## 卡在哪里
- **时间掌控**（你自己的判断）。具体成因是清单外章节插队，见上面的归因表。
- **主题越界但没落地**：数组和 Promise 都提前摸了，但停留在"看过、抄过"，没到"能裸写"的程度。Day 3 要考的数组核心方法（`map/filter/reduce/sort/flat/Object.entries`）目前仍是空白，等于提前摸的那部分只省下很少的时间。

## 踩过的坑
- **浏览器 API 又出现了**：`confirm()`（`checkAge` 题）和 `prompt()`（`sumInput` 题）在 Node 里都不存在，会直接 `ReferenceError`。你随后自己找到 `node:readline/promises`，这条坑算半解决。以后凡是想敲 `alert` / `confirm` / `prompt`，先问一句"Node 里对应的是什么"。
- **315 行全是注释，`node` 跑起来零输出**。Day 1 的同一件事又发生了一次：写完没跑，就没有"预测 → 验证 → 解释差异"里的验证那一步。
- `styles` 课后题里把 `"Rock-n-Roll"` 打成了 `"Roc-n-Roll"`（少个 k）。小拼写本身无害，但"逐字核对示例"的习惯要养——面试白板上写错变量名是要扣分的。

## 欠账登记（按计划 §四 的规则）
| 欠什么 | 补在哪天 |
|---|---|
| 箭头函数、rest/spread（2 节） | 9/13（Day 3）上午 |
| 作用域链、TDZ（闭包章前半 + `var` 章） | 9/13（Day 3）上午 |
| `day02-scope.js` | 9/13（Day 3）上午 |
| 裸写 `debounce` / `throttle` / `curry` / `clone` | 9/13（Day 3）下午 |
| LeetCode 1 题 | 9/13（Day 3） |

合计约 **0.7 天**，已压进第 1 周，**结束日不变（10/11）**。规则见计划 §四「进度看板与再计划机制」。

## 明天第一件事（9/13，Day 3）
主题：**补 Day 2 + 数组与对象**——见计划 §四 第 1 周 Day 3 那一行。（逐时段的详细安排明天再排。）

## 代码 / 命令备忘
```powershell
# 边写边跑
node --watch week1-language/day02-scope.js

# 验证防抖：连调 5 次，应当只打印 1 次
# 收尾
git add -A
git commit -m "day02: ..."
git push
```
