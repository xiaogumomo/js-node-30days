# TS 类型速查表（Day 9 补，起因是 9/22 的卡点）

> **他 9/22 的原话**："TS 中很多类型的表示方法不知道，一旦用不了 any 就卡住"
> → 卡的是**类型语法的词汇量**，不是逻辑。所以把转 TS 那天遇到过的写法**集中列一遍**，每行一句"什么时候用它"。
> **用法**：写类型卡住时先来这里查，查不到就用 `any` 顶上（并记一句为什么）。

## 一、最常打交道的（你这两天都见过）

| 写法 | 读作 | 什么时候用它 | 你见过的地方 |
|---|---|---|---|
| `number` / `string` / `boolean` | 基本类型 | 标参数、返回值、变量 | 到处 |
| `number[]`（等价 `Array<number>`） | **数字数组** | 一组同类值 | `myMap(arr:number[], …)` |
| `{ age: number }` | **对象类型**：对象"长得像这样" | 描述一个对象参数 | arrayUtils 测试里 `u:{age:number}` |
| `Record<string, any>` | 键是 `string`、值是 `any` 的**对象** | 当"字典 / 累加器"用 —— 需要 `obj[key]` 这样按任意字符串键取放 | `deepClone` 里的 `clone2` / `result` |
| `(...args: any[]) => any` | **函数类型**：收任意参数、返回任意值 | 参数**本身是个函数**（装饰器 / 包装器） | `curry(fn:…)`、`debounce(fn:…)` |

## 二、变量的类型（声明时标）

| 写法 | 读作 | 什么时候用它 | 你见过的地方 |
|---|---|---|---|
| `ReturnType<typeof setTimeout>` | "`setTimeout` 返回值的类型" | 存定时器句柄 —— **浏览器与 Node 返回值不同**，所以用这个写法两边通用 | `let timer: ReturnType<typeof setTimeout> \| null = null` |
| `T \| null` | "要么是 T，要么是 null" | 值**可能还没有**（比如 timer 一开始没有） | `timer` |
| `let x: any` | 关掉类型检查 | 实在推不出来、今天也不追精确（**放宽要记一句为什么**） | `let result: any` |
| `let x: unknown` | "更安全的 `any`"：用之前必须先收窄 | 接收**外部来的**数据（以后用） | — |
| `: void` | 没有返回值 | 明确"这个函数不返回东西"（回调常见） | — |

## 三、几个"本该知道"的小语法

| 写法 | 意思 |
|---|---|
| `init?: number` | **可选参数 / 可选属性**（可以没有）——`?` 就在名字后面 |
| `arr: number[] = []` | 声明时顺便给初始值 |
| `typeof x !== 'object'` | 运行时判断（**同时也是类型守卫**：判断之后 TS 会自动"收窄"x 的类型） |
| `Array.isArray(x)` | 专门判"是不是数组"（同样是类型守卫） |
| `function f(x: any): any { }` | 参数类型 + **返回类型**（冒号后面那个） |
| `: any` 写在返回类型上 | **递归函数推不出来时必须手写**（报 `TS7023` / `TS7024` 时就是它） |

## 四、还没学、但知道"有这个东西"就够（第 3 周再上）

| 写法 | 干什么用 |
|---|---|
| `interface X { … }` / `type X = { … }` | 给对象类型**起个名字**，多处复用时不用重复写 |
| `<T>` 泛型 | "这个类型先留空，用的时候再填"——`function curry<T extends (...a:any[])=>any>(fn: T)` |
| `as` 断言 | 强行告诉 TS"就按这个类型算"（**少用**，用多了等于关检查） |
| `enum` / `readonly` / `satisfies` | 以后遇到再查 |

## 五、一条实操建议（比背表有用）

**写不出来的时候，先把标注删掉，鼠标悬停在变量上** —— VS Code 会显示它**推出来**的类型，照着抄就行。
（`let x = {…}` 这种，TS 自己推出来的类型往往比手写更准。）

> 这张表也进「忘了的」清单的复习循环：**遇到一次查一次，查三次以上自然就记住了**。

---

## 六、大写 vs 小写（9/23 他问："类型都是小写的吗？"）

**不是"类型都小写"，而是三个不同的世界 —— 分清就不容易错了：**

| 世界 | 大小写 | 例子 | 说明 |
|---|---|---|---|
| **`typeof x` 的返回值** | **全小写（8 个固定字符串）** | `'undefined'` `'object'` `'boolean'` `'number'` `'bigint'` `'string'` `'symbol'` `'function'` | 这是 `typeof` 这个**操作符**的定义 —— 它返回的是**字符串**，不是"类型名"。⚠️ 著名坑：`typeof null === 'object'` |
| **构造函数 / 内置类（能被调用、能 `new` 的对象）** | **首字母大写** | `Object`（`Object.keys`）、`Array`（`Array.isArray`）、`Number`（`Number.isNaN`）、`Promise`（`Promise.all`）、`Date`、`Map`、`Set`、`RegExp`、`Error` | 它们是**值**，不是 `typeof` 的结果 |
| **TS 的类型标注** | **小写** | `number` `string` `boolean` `object` `any` `unknown` | 大写留给**类名 / 接口名**（`class User`、`Date`、`Promise<T>`） |

**TS 里大小写真的不一样**（实测报错原文，TS 自己都在劝你）：
```
Type 'Number' is not assignable to type 'number'.
  'number' is a primitive, but 'Number' is a wrapper object. Prefer using 'number' when possible.
```
→ **标类型一律用小写**；用 `Number` / `String` / `Boolean` / `Object` 做标注是**要避免的**（它们是"包装对象"，不是原始类型）。

**口诀**：`typeof` 的结果 → **全小写**；能 `new` / 能调用的 → **大写**；TS 标注类型 → **小写**。

> **⚠️ 表格里的 `\|` 是「转义」，不是笔误**（9/23 他问）：
> Markdown **表格**用 `|` 当**列分隔符** —— 所以单元格里想显示一个真正的竖线，必须写 **`\|`**。
> **反引号保护不了它**（实测）：`` `T | null` `` 写在表格里，那一行会被**拆成两个单元格**，反引号也断成 `` `T `` 和 `` null` ``。
> 渲染出来看到的是 **`T | null`**（`\` 不会显示）。
> **规则**：表格里 → 写 `\|`；表格外（正文 / 代码块 / 列表）→ 直接写 `|` 就行。
