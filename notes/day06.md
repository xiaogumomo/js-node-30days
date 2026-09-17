# Day 6 — 2026-09-17（周四）

> **状态：🔄 进行中（Day 5 欠账已全部清掉）**　｜　任务书：[`day06-this-prototype.md`](day06-this-prototype.md)
> 主题：**`this` / 原型链 / `class`** + 数组三个方法的 polyfill
> ⚠️ **今天第一件事是收尾 Day 5**（约 20 分钟，见下方记录）—— 按计划规则，欠账不清不动新章节。

## 今日目标

**必交**
- [x] 0. Day 5 欠账 3 件（一条 throttle 测试 / 三个自测题 / 读 4 个测试文件）—— 日志三节已于 9/16 补完

- [ ] 1. `week1-language/day06-this.js` —— 四种 `this` 绑定 + 箭头函数，输出对上对照表
- [ ] 2. `week1-language/day06-prototype.js` —— 手写原型继承 + `class` 重写 + 字段初始化顺序
- [ ] 3. `week1-language/day06-array-utils.js` —— `day06-array-utils-verify.js` **通过 17 项**
- [ ] 4. 工具箱新增第 5 个模块：`p0-toolkit/src/arrayUtils.js` + `test/arrayUtils.test.js`，`pnpm test` 全绿
- [ ] 5. 日志 + commit + push

**可选**
- [ ] 6. 英文 15 分钟 + AI 协作

## Day 5 欠账收尾记录（✅ 全部完成，08:30–10:40）

> 按规则「欠账不清不动新章节」，今天开头先把 Day 5 的尾巴收干净。

| # | 欠账 | 状态 | 结果 |
|---|---|---|---|
| ① | 在 `p0-toolkit/test/throttle.test.js` 加一条测试 | ✅ 已加 | 第一版**没通过**（`actual: 0, expected: 1`）—— 漏了 `fn();`，只造了函数没调用它；还多传了一个没用的第三个参数 `true`（那是 `debounce` 的 `immediate`，`throttle` 没有这个选项） |
| ② | 三个 CJS/Promise 自测题 | ✅ 已答 | 见下方「CJS 自测题记录」 |
| ③ | 读 `p0-toolkit/test/` 的 4 个测试文件 | ✅ 已读 | 还在 `throttle.test.js` 里自己加了逐行注释 |

### CJS 自测题记录（我的答案 + 修正）

**（a）为什么 `day02-throttle.js` 的 `let last = 0` 和 `day02-curry.js` 的 `adj` 不冲突？**

> 我的答案方向对（"不在同一个函数作用域里"），但**术语说反了** —— 我写了"在全局作用域里"。
> 正确的是：它们**不在**全局作用域，**正因为如此**才不冲突；如果真在全局，反而会互相覆盖。
> **正确说法**：Node 把每个文件包成一个函数（wrapper），`throttle` 和 `curry` 在两个不同的 wrapper 里；`last` / `adj` 又各在自己的函数作用域里。**两层隔离，同名也不会碰到。**

**（b）测试文件为什么能 require 到 `debounce`？`require` 的三个动作？**

> 前半对 ✓（"`module.exports` 把 `debounce` 暴露出来给别的文件用"）。
> **后半答错了问题** —— 我答的是"测试文件里那三行 require 各拿了什么"（那个也答对了），而问的是 `require('./day02-debounce.js')` **这一句内部**做的三件事。
> **正确说法**：① **找到文件**（`./` 相对"写 require 的那个文件"）② **执行它一遍**（顶层代码全跑）③ **返回它的 `module.exports`**。
> 由此追问出的新知识：**分享范围有多大**（见下）。

**（c）`module.exports = {debounce}` 和 `exports = {debounce}` 的区别？**

> ✅ **完全答对**，三步因果全串对了：初始指向同一对象 → 真正被导出的是 `module.exports` → `exports = {...}` 让它指向**新对象**、两个变量"分家"、`module.exports` 还是 `{}` → require 拿到空；而 `exports.debounce = ...` 是给**共享的那个对象**加属性，有效。

### 追问「分享范围有多大」的答案（三层）

| 层次 | 范围 | 实测 |
|---|---|---|
| 同一个 Node 进程 | 能 require 到该**路径**的代码；多次 require 拿到的是**同一个对象**（缓存） | c1 累加到 3，c2 再读是 4 |
| 换一个 Node 进程 | **重新加载一份**，互不共享 | 新进程从 1 开始 |
| 跨机器 / 给别人 | 必须显式发布：推 GitHub，或 `npm publish` | `module.exports` 本身不上传任何东西 |

- **路径就是边界**：换个目录 `require('./counter.js')` 直接报 `Cannot find module`
- `node_modules` 能被随便 require，是因为 Node 会**沿目录向上找** —— 这就是 npm 把"别人的代码"变成"你项目里的模块"的机制
- **`p0-toolkit/package.json` 里的 `"private": true`** 就是用来**防止误发布**的（防止分享范围一不小心扩到全世界）

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

## 明天第一件事（9/18，Day 7）
见计划 §四 第 1 周 Day 7 —— 主题是**异步三件套 + 模块系统**：
① **CommonJS 基础**（`module.exports` / `require` 的三个动作、缓存、`exports` 的坑）② 回调 → Promise → async/await 的演进动因、微任务 vs 宏任务、`Promise.all` 家族 ③ ESM vs CJS 的机制差异。

## 代码 / 命令备忘
```powershell
# 今天的核心命令
node week1-language/day06-array-utils-verify.js    # 目标：通过 17 项

# 工具箱的测试
cd week1-language/p0-toolkit
pnpm test        # 目标：tests 18 / fail 0

# 收尾
git add -A
git commit -m "day06: this/prototype/class drills, add array polyfills"
git push
git status -sb   # 没有 ahead 就同步好了
```

## 10:10 检查点
如果 10:10 还没写完 `this` 的演示，就把原型链的阅读压到 30 分钟，**先保住 array polyfill 的裸写时段**。
