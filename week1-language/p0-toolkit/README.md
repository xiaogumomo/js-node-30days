# p0-toolkit

JavaScript + Node.js 30 天计划第 1 周的工具函数库。四个面试高频手写题，自己实现 + 测试覆盖。

## 快速开始

**不需要安装任何依赖** —— 测试用的是 Node 内置的测试跑器（`node:test`）。

```powershell
cd week1-language/p0-toolkit
pnpm test          # 等价于 node --test
```

看每条用例的明细：

```powershell
node --test
```

## 函数清单

| 函数 | 作用 | 备注 |
|---|---|---|
| `debounce(fn, delay, immediate?)` | 防抖：连续触发只算最后一次 | `immediate: true` 是 leading + trailing（开头和末尾各执行一次） |
| `throttle(fn, interval)` | 节流：按频率放行 | 实现路线 A（比较时间戳），只开头触发 |
| `throttleBySwitch(fn, interval)` | 同上 | 实现路线 B（开关 + 定时器），与 A 行为一致 |
| `curry(fn)` | 柯里化：`f(a,b,c)` → `f(a)(b)(c)` | 用 `fn.length` 判断参数收够；注意包装过的函数 `length` 会变成 0 |
| `deepClone(value)` | 深克隆（递归） | 手写版，有限制，见下 |
| `myMap(arr, fn)` / `myFilter(arr, fn)` / `myReduce(arr, fn, init?)` | 数组三个方法的 polyfill（自己重写 `map` / `filter` / `reduce`） | `reduce` 不传初始值时以第一个元素为起点；边界情况见「已知限制」 |
## 已知限制


### 数组三个方法（`myMap` / `myFilter` / `myReduce`）

- **空数组 + 不传初始值**：内置 `[].reduce(f)` 会抛 `TypeError`，我们的实现返回 `undefined`。
- **稀疏数组**（`[1, , 3]`）：内置方法**跳过空位**，我们的实现把空位当成 `undefined` 传给回调 ——
  所以 `[1,,3].reduce((a,b)=>a+b,0)` 内置得 `4`，我们的得 `NaN`（`1 in` 结果也能看出差别）。


**结论**：手写版的价值在于"理解原理"（面试要求手写）；生产环境用 `structuredClone`——但它也不是万能的（函数和 class 原型它也处理不了，而 JSON 方式还会静默丢字段）。

另外两条实测行为：

- `debounce` 普通（trailing）模式下 `return` 的值永远是 `undefined` —— 此刻原函数还没执行。这是防抖本身的时间冲突，不是实现错误。
- `throttleBySwitch` 每次执行都会挂一个待触发的 `setTimeout`，会让 Node 进程多活 `interval` 毫秒；路线 A（时间戳）没有这个副作用。

手写深克隆处理不了下面这些。需要这些能力时，请改用 `structuredClone`：

| 情况 | 手写版 | `structuredClone` | `JSON.parse(JSON.stringify())` |
|---|---|---|---|
| 嵌套对象 / 数组 | ✅ | ✅ | ✅ |
| 循环引用 | ❌ `RangeError`（栈溢出） | ✅ | ❌ `TypeError` |
| `Date` | ❌ 退化成 `{}` | ✅ 保持 `Date` | ❌ 变成 ISO 字符串 |
| `Map` / `Set` / `RegExp` | ❌ 退化 | ✅ 保持原类型 | ❌ 退化 |
| 函数 | ❌ 退化成 `{}` | ❌ 抛 `DataCloneError` | ❌ 属性被静默丢弃 |
| class 实例的原型 | ❌ 丢失 | ❌ 也丢失 | ❌ 丢失 |

## 后续计划

- **Day 8**：整体转 TypeScript，开启 `strict: true`；测试从 `node --test` 换成 Vitest
- 继续补充：字符串 / 日期 / 数组工具函数
