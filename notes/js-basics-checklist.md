# JS 基础 · 完整清单（第 1 遍）— 2026-10-21 核对

> **为什么有这张表**：他说"关于 JS 部分我还是有点不放心，就这么点内容吗？"→ 核对后发现：我按"**概念机制**"排了 7 块，但"**工具层**"（函数/数组/字符串/Object/Error/Map）**默认"用过"就没系统讲** ✗ —— 这是真实的缺口，补上 ✓
> **验收四条**（每块都要）：① 能跑（示例/判据）② 合上讲 5 分钟 ③ 一图一表 ④ 能答 2 个追问

## 一、已过（14 块 ✓）

| # | 块 | 时间 |
|---|---|---|
| 1 | 类型与值（8 种类型 / 假值 / NaN / ±0 / 浮点精度）| 10/20 ✓ |
| 2 | 变量·作用域·提升·块作用域 | 10/21 ✓ |
| 3 | 闭包（捕获的是绑定 / IIFE / 模块模式）| 10/18 ✓ |
| 4 | this 与对象（五种绑定 / 箭头 / 属性描述符）| 10/18 ✓ |
| 5 | 原型·行为委托·class | 10/19 ✓ |
| 6 | 事件循环 · 异步 · Promise（**含"写"部分 A–D**）| 10/22 ✓ |
| 7 | **正则**（`^ $` / 字符类 / 量词 / 贪婪 vs 惰性 / `g`·`i` / `replace` 回调 / `lastIndex`）| 10/22 ✓ |
| 8 | **函数**（参数 / 箭头 vs 普通 / 纯函数·副作用 / 高阶 / `bind` 柯里化 / 递归 / IoC / `compose`）| 10/23 ✓ |
| 9 | **数组方法**（`map/filter/reduce` 初值 / `sort` 比较器 —— 默认按字符串，**前缀规则** / `slice` vs `splice` / `forEach` 不能 break / `find`·`findIndex` / `flat`）| 10/23 ✓ |
| 10 | **字符串方法**（码元 vs 码点 / `slice` vs `substring` / `replace` 只换第一个 / `split`·`join` / `padStart` / `trim` 去不掉 `\u200b`）| 10/23 ✓ |
| 11 | **Object 工具**（键顺序三档 / `keys`·`entries`·`fromEntries` / `assign` vs 展开 = 浅 / `freeze`·`seal`·`preventExtensions` / `defineProperty` 默认全 false / `hasOwn` vs `in` / `Object.is` / `create(null)` / 计算键 `['__proto__']`）| 10/24 ✓（`deepFreeze` 里 `for...in` 待换成 `Reflect.ownKeys`）|
| 11b | **JSON 序列化**（`stringify` 丢什么 / `NaN→null` / `BigInt`·循环引用 → TypeError / `toJSON` / `replacer` 两形态 / `reviver` / JSON 法深拷贝 6 处丢失 / `structuredClone`）| 10/24 ✓ |

| 12 | **错误处理**（`finally` 的 return 吞异常 / `class X extends Error` 必须手设 `this.name` / `cause` 保留根因 / 错误分类 4 类 / `err.code` vs message）| 10/24 ✓ |
| 13 | **Map / Set / WeakMap**（键按 SameValueZero、认引用 / Map 纯插入序 vs 对象整数键升序 / `size` 是属性 / WeakMap 不可迭代·无 size / 私有数据）| 10/24 ✓ |

## 二、待补（0 块 ⬜ —— 第 1 遍已收官）

| 项 | 状态 |
|---|---|
| **JS 基础第 1 遍（14 块 + JSON）** | **2026-10-24 全部走完 ✓**（08:21–18:26，实际 553 分钟）|
| 总回访 | 13/14（`Number('0b101')` 一次没答对 → 留待明日短测）|

## 三、只到 L3（知道存在；用到再查，**不排课**）

| 块 | 一句话 |
|---|---|
| 模块化（CJS vs ESM）| 你天天用 CJS；`import/export` 的静态分析、顶层 await 属于 ESM 专题 |
| 生成器 / 迭代器 / `for await` | `function*` + `yield`；可迭代协议（`Symbol.iterator`）→ 异步流里再用 |
| Date / Intl | 日期与时区坑；格式化用 `Intl` |
| 严格模式 | `'use strict'` 的差异（现在模块/class 内默认严格）|
| V8 实现（hidden class / inline cache / GC 细节）| 性能话题，L4 |
| 正则的高级特性（后行断言 / 命名捕获）| 用到再查 |

## 四、明确**不**属于 JS 基础（别的专题管）

| 块 | 归哪 |
|---|---|
| 连接池 / SQL / 事务 / 索引 | 数据库专题（A3 RBAC / A4 Redis）|
| Redis / Mongo / 消息队列 | 中间件（A4 / B1 / B2）|
| CI / Docker / 部署 | 工程专题（已做过 ✓）|
| HTTP / TCP / 状态码 | 协议专题（A2，10/25 起）|
| DOM / 事件 / 浏览器 API | 前端（3–4 月）|
| 性能优化 / 内存分析 | L4 |

## 五、排期（10/22–10/24 三天把 JS 基础第 1 遍收掉）

| 天 | 块 | 大约 |
|---|---|---|
| **10/22** | 异步写部分（6b）+ 正则（7）| ✓ |
| **10/23** | 函数 A–D（8）+ 数组（9）+ 字符串（10）| ✓ |
| **10/24** | Object 工具（11）+ 错误处理（12）+ Map/Set/WeakMap（13）+ **第 1 遍总回访** | 6h（周六全天）|

→ 之后 **10/25 起进 A2 协议**（TCP/UDP + HTTP，主计划原样 ✓）
