# Day 5 手机版（9/15｜12:28 起）

> 完整版：<https://github.com/xiaogumomo/js-node-30days/blob/main/notes/day05-guide.md>
> 这个版本是给"手机上、带不了电脑"的时候看的。**课上只做"读和想"，不写代码。**

---

## 一. 现在到出门（12:28–13:30）：两件事

**① 修好 throttle（10 分钟）**

- [ ] 文件里有**两个同名的 `function throttle`**，后面的覆盖前面的 → 脚手架测的一直是路线 B
- [ ] 让路线 B 改名：`throttleBySwitch`；`module.exports = { throttle, throttleBySwitch }`
- [ ] `node week1-language/day05-throttle-verify.js` → 目标 **5/5**
- 路线 B 先**放着**（标个 TODO）。它不阻塞交付，路线 A 已经证明了你会这条路

**② 写 curry（60 分钟）**

- [ ] `day02-curry.js` + `module.exports = { curry }`
- [ ] `node week1-language/day05-curry-verify.js` → 目标 **12/12**

---

## 二. 课上（13:30–16:50）：只做"读和想"

带不了电脑，但这 4 件事用手机就能做，而且都是今天/明天的核心：

**① 读两节，回答一个问题**

《变量作用域，闭包》的 **Step 4. 返回函数** 和 **垃圾收集**：
<https://zh.javascript.info/closure>

> **为什么闭包里的变量不会被垃圾回收？**
> 答：`makeArmy()` 的**执行上下文**被弹出了，但它创建的**词法环境**是堆上的对象；返回的函数内部有 `[[Environment]]` 指向它。你持有 `army[0]` → 函数活着 → 词法环境活着 → 变量活着。
> **关键词：可达性（reachability）**——垃圾回收看的是"从根出发还可达吗"，不是"函数有没有返回"。

**② 用嘴说出 curry 的骨架（不写代码）**

```
curry(函数 f)：返回一个新函数
  ① 把这次收到的参数收起来
  ② 收够了没？（看 fn.length）
  ③ 够了 → 调用 f，返回结果
     不够 → 返回一个新函数，下次继续走 ①
```

**③ 用脑子过一遍 throttle 路线 B 的状态表**

| 时刻 | 第几次调用 | 进入时开关 | 该发生什么 | 离开时开关 |
|---|---|---|---|---|
| t=0 | 第 1 次 | 开 | 关开关 + 排"interval 后开开关"的定时器 + 执行 fn | 关 |
| t=10 | 第 2 次 | 关 | **什么都不做** | 关 |
| t=20 | 第 3 次 | 关 | **什么都不做** | 关 |
| t=80 | 定时器回调 | —— | **只做一件事：打开开关** | 开 |

想一想：为什么"什么都不做"那两行是最容易写错的地方？（提示：`return fn.apply(...)` 一旦写在 `if` 外面，就等于每行都执行）

**④ 背下这个区别（面试会问）**

| | 你等什么 | 一句话 |
|---|---|---|
| `debounce` | 等你**停手** | "你安静 500ms 我才动" |
| `throttle` | 按**频率**放行 | "再密集我也每 500ms 动一次" |

---

## 三. 晚上（16:50 起）：`p0-toolkit` 立项

**目标**：第 1 周的第一个真实产出物。**用 Node 内置的 `node --test`，不装 Vitest**（Vitest 排在 Day 8，你的网络这两天也不稳）。

**目录结构**（`week1-language/p0-toolkit/`）：

```
package.json
README.md
src/    debounce.js  throttle.js  curry.js  deepClone.js
test/   debounce.test.js  throttle.test.js  curry.test.js  deepClone.test.js
```

**`package.json`**：

```json
{
  "name": "p0-toolkit",
  "version": "0.1.0",
  "private": true,
  "description": "30 天计划第 1 周的工具函数库（JS 版，Day 8 转 TS）",
  "scripts": { "test": "node --test" }
}
```

- **不要写 `"type"` 字段**（不写就是 CommonJS，你的 `module.exports` 才能用）
- `private: true` 防止手滑发布

**晚上时间表**

| 时间 | 干什么 |
|---|---|
| 16:50–17:40 | 回家 + 晚饭 |
| 17:40–19:00 | 第 1 段：目录 + `package.json` + 搬 4 个函数 + README |
| 19:00–19:10 | 休息 |
| 19:10–20:40 | 第 2 段：写测试（≥6 个）+ `pnpm test` 修到全绿 |
| 20:40–21:10 | 补 README（含「已知限制」）+ AI review |
| 21:10–21:30 | 日志 + commit + push |

**测试用例清单（够 6 个，建议写满 10 个）**

| 文件 | 用例 |
|---|---|
| `debounce.test.js` | ① 连调 5 次只执行 1 次 ② `immediate` 第一次立刻执行 |
| `throttle.test.js` | ③ interval 内只执行 1 次 ④ 过了 interval 能再执行 |
| `curry.test.js` | ⑤ `c(1)(2)(3)` ⑥ `c(1,2,3)` ⑦ 复用不串参数 |
| `deepClone.test.js` | ⑧ 嵌套对象 ⑨ `null` 保持 `null` ⑩ 数组 |

**`node:test` 语法**：

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { debounce } = require('../src/debounce.js');

test('连调 5 次只执行 1 次', () => {
  let calls = 0;
  const fn = debounce(() => { calls++; }, 50);
  for (let i = 0; i < 5; i++) fn();
  assert.equal(calls, 1);
});
```

**搬运规则**：实现放 `src/`，测试放 `test/` 并以 `.test.js` 结尾（`src/` 不会被当测试）。库文件**不要在顶层 `console.log`**。

---

## 四. 如果晚上来不及：砍单顺序

**保底**
1. `curry` 12/12
2. `p0-toolkit` **目录 + package.json + ≥6 用例 + `pnpm test` 全绿**（不能只搭空目录）
3. 日志 + commit + push

**可顺延（登记进 `notes/day05.md`）**
4. README 完整版（先 3 行占位）
5. throttle 路线 B
6. AI 协作的第 3 个动作

---

## 五. 明天的锚点

Day 6 主题：**`this` / 原型链 / `class`**。

今天 `throttle`/`curry` 里的 `fn.apply(this, args)`，那个 `this` 到底是谁——**明天有答案**。今天照抄就行，不用纠结。

（顺带：路线 B 里 `setTimeout(this, ...)` 之所以报错，就是因为普通调用时 `this` 是全局对象、**不是函数**。这个坑明天会讲透。）
