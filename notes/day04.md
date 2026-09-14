# Day 4 — 2026-09-14（周一）

> **状态：✅ 三项产出物全部合格（第一个全绿的日子）**　｜　详细指引：[`day04-timers.md`](day04-timers.md)
> 主题：**拆掉"无从下手"的墙 —— 定时器 + 装饰器 + 裸写 `debounce`**
> 今天故意排轻（核心约 3 小时）。核心做完了，第二阶段的加量没做（可选，不影响合格）。

## 今日目标（必交 3 项 + 可选 2 项）

- [x] 1. `week1-language/day02-debounce.js` —— `node week1-language/day04-debounce-verify.js` 通过 6 项
- [x] 2. `week1-language/day04-array-methods.js` —— 补齐第 7 项（接住返回值 + `sort()` 对照）和第 8 项（`structuredClone` 换嵌套对象）
- [x] 3. `notes/day04.md` + commit + push
- [x] 阅读：《调度：setTimeout 和 setInterval》+《装饰器模式和转发，call/apply》
- [ ]（可选）4. `day02-clone.js` 手写深克隆
- [ ]（可选）5. `day02-curry.js`

## 探索 TODO（非清单，不许插队）

> 冒出"想看看 xxx"的念头就写这里，**不许当场去查**。清单交付完再看。
> 昨天登记过 4 条（`async`、`confirm` 的 Node 替代、`for...of`、Step 4 返回函数），归属见 [`day03.md`](day03.md)。

1. `new Map()` 及其应用（`Map` 是内置构造函数，注意大写 M；`new map()` 会报 `ReferenceError`）
2. `this` 具体指向谁 —— **这就是 Day 6 的正式主题**，等两天就讲

## 学会了什么（你的原文）

1. func.call(context,arg1,arg2)
2. 深刻学习装饰器模式，并研究相关代码：

```js
function work(a, b) {
  console.log(a + b);
} //原始函数，接受两个参数，然后输出它们的和

function spy(func) {          //func 传进来的原函数
  function wrapper(...args) { //...args是rest参数（收集传入的所有参数，组成数组）多个参数=>一个数组
    wrapper.calls.push(args); //填入数值到wrapper的calls属性中（ai完整版：将本次调用收到的参数数组args保存到wrapped.calls数组中）
    return func.apply(this, args); //使用当前wrapper的this作为func的this，并把args数组展开为func的参数调用原函数
  }
  wrapper.calls = []; //给Wrapper创建个空数组属性，用来记录之后每次调用的参数
  return wrapper;
}
work = spy(work);

work(1, 2);
work(4, 5);

for (let args of work.calls) {
  console.log("call:" + args.join()); //将work中calls属性数组传入args中再用join合并成字符串
}
```

3. func.apply(context, arg) —— context（this）改变 func 中的函数，arg 调用存入函数中的参数（以数组的形式）给函数
4. `setTimeout(fn, delay, ...arg)`：fn 想要执行的函数，delay 响应时间，...arg 想要传入执行函数或代码的参数
   停止延时用 `clearTimeout(timeId)`；
   `setInterval(fn, delay, ...arg)`：相比 `setTimeout()` 持续触发，隔 delay 时间触发一次；setTimeout 更加精准
   停止延时用 `clearInterval(timerId)`；

## 卡在哪里（你的原文）

1. func() 这种形式其实跟 this 一样功能指代某个函数，但是每次看到还是一头雾水
2. Map 及其的一些功能（.set），需要自己去问下 ai
3. this 的调用问题，分辨不出 this 到底指代谁

## 踩过的坑

1. **`clearTimeout` 里的 T 必须大写**（写成 `cleartimeout` 会 `ReferenceError`）。更值得记的是它的暴露方式：**第一次调用不报错、第二次才报**——因为第一次调用先把 `timer` 赋了值，第二次进来才走到 `clearTimeout` 那一行。这就是验证脚手架要"连调 5 次"而不是"调 1 次"的原因。
2. **`JSON.parse(JSON.stringify(x))` 这条路走不通的地方**：遇到**循环引用**会抛 `TypeError: Converting circular structure to JSON`。不用 `try/catch` 接住的话，**它会中断整个脚本**，后面的代码一行都跑不到。注意这里不是"这行代码写错了"，而是"这条路线本身不支持循环引用"——而 `structuredClone` 支持。
3. （AI 补一条）**文件写在仓库目录外面，Git 完全看不见**。代码写在 `D:\code\2026\vs code\9.14\`，仓库却在 `C:\Users\27971\.zcode\workspace\default\js-node-30days\`——`git status` 不是"没显示"，是那个文件对 Git 根本不存在。以后直接在仓库里写代码。

## 欠账登记（如果今天没做完，按计划 §四 的规则写清楚）
| 欠什么 | 补在哪天 |
|---|---|
| `day02-debounce.js` 头部 `immediate` 语义那一句话（`TODO` 还空着） | 9/15（Day 5） |
| 可选产出物 4（`clone` 深克隆）、5（`curry`） | 9/15（Day 5） |

## 明天第一件事（9/15，Day 5）
见计划 §四 第 1 周 Day 5 —— 主题是**四个函数收齐 + `p0-toolkit` 立项**：
写 `throttle` / `curry` / `clone` 深克隆（今天提前做掉就不用返工），把四个函数装进 `p0-toolkit`（JS 版），配 Vitest 先写 ≥6 个测试。

## 代码 / 命令备忘
```powershell
# 今天的核心命令：写完 debounce 就跑它
node week1-language/day04-debounce-verify.js
# 结果：通过 6 项，失败 0 项（退出码 0）

# 数组那份直接跑，看输出
node week1-language/day04-array-methods.js

# 收尾（今天第一次自己 commit）
cd C:\Users\27971\.zcode\workspace\default\js-node-30days
git status
git add -A
git commit -m "day04: verify debounce with the harness, close the array redo"
git push
git status -sb   # 没有 ahead 就同步好了
```

---

## AI 复核（最终版）

**实跑复核**：`node week1-language/day04-debounce-verify.js` 与 `node week1-language/day04-array-methods.js`（Node v24.21.0，2026-09-14）——**三项产出物全部合格，脚本退出码 0**。

| 项 | 结论 | 实跑证据 |
|---|---|---|
| 产出物 1 `debounce` | ✅ 合格 | 脚手架 6/6 通过（连调 5 次只执行 1 次、delay 重置、`immediate`、参数透传） |
| 第 7 项 不可更新 | ✅ 合格 | 四个非原位方法的原数组始终 `[1,5,3,4]`；`sort()` 对照显示原数组被改成 `[1,3,4,5]`；`arr.sort() === arr` → `true`、`arr.toSorted() === arr` → `false` |
| 第 8 项 `structuredClone` | ✅ 合格 | ①②各用独立对象后，"深拷贝改副本不影响原对象"一眼可见 |
| 第 ③ 段 循环引用 | ✅ 合格 | `try/catch` 接住错误，两行输出并排：`structuredClone` 成功 / `TypeError: Converting circular structure to JSON` |

### 笔记里 3 处要精修

| # | 你的原文 | 精确说法 |
|---|---|---|
| 3 | `apply(context, arg)`："context 改变 func 中的函数，arg 调用存入函数中的参数" | `apply` 和 `call` 做的是**同一件事**（指定 `this` 并调用），**唯一区别是参数怎么传**：`call` 逐个列（`fn.call(ctx, 1, 2)`），`apply` 用数组（`fn.apply(ctx, [1, 2])`）。记忆法：**A**pply = **A**rray（数组），**C**all = **C**omma（逗号）。另外 `this` 不是"改变函数"，它只设定这次调用里 `this` 指向谁——函数本身没变 |
| 4 | "setTimeout 更加精准" | 精准的不是 `setTimeout` 本身，而是**嵌套的 `setTimeout`**（在回调里再排一次）。因为它在每次执行**完之后**才排下一次，两次执行之间**至少**隔 `delay`；而 `setInterval` 是"每隔 `delay` 触发一次"，回调耗时超过 `delay` 时调用会**堆积**。官方正是推荐用嵌套 `setTimeout` 替代 `setInterval` |
| 卡在哪 1 | "func() 跟 this 一样功能指代某个函数" | `func` 回答"执行哪段代码"，`this` 回答"以谁的身份执行"——**两者是独立的两个问题**。`func.call(user)` 里，`func` 决定跑什么，`user` 决定站在谁的位置上跑 |

### 一条结构性建议

**「卡在哪里」和「探索 TODO」现在有两项重复**（`Map`、`this` 都出现了）。建议分工：

- **卡在哪里** = 诊断："我现在最没底的是什么"
- **探索 TODO** = 行动计划："我打算去哪天解决它"

按这个分工，`Map` 和 `this` 留在探索 TODO 就够了，"卡在哪里"可以只留最核心的那一条。

### 顺带记下今天的进步

从 Day 3 的"四个裸写函数挂零、被一个没教过的 API 卡死"，到今天的**三项全部合格、脚本退出码 0、还主动把 5 个可选打磨全改了**——尤其第 ③ 段从"把出错的行注释掉"进化成"用 `try/catch` 接住并打印真实报错"。这个动作在工程上的意义是：**手里攥着证据，而不是把证据藏起来**。
