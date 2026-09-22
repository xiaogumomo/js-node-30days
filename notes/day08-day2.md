# Day 8 第 2 天任务书：补 ③④ + TypeScript 入门（`p0-toolkit` 转 TS）

> **日期**：2026-09-22（周二）　｜　**Day 8 的第二天**（第一天 9/21：周自测 + 微任务 + 周复盘）
> **接 9/21 顺延下来的三件事**：三个 `recall-*.js` 的修改、③ `Promise.all` 家族、④ ESM vs CJS
> **今天的主线**：**TypeScript 入门 + `p0-toolkit` 转 TS**（Day 8 原本的内容）
> **今天的量**：约 3 小时 40 分（按"选 A"；昨天他填的是「要加压」，所以这一段的**复习环节从 3 个模块增到 4 个**，不再加新内容）
> **目标（他自己的原话）**：**"努力完成最好一次通过"** —— 每改完一个文件立刻跑一次判据，别攒到最后。

---

## 〇 今天的产物

| # | 产出物 | 验收标准 |
|---|---|---|
| 1 | `week1-language/recall-curry.js` / `recall-deepClone.js` / `recall-throttle.js` | **三个都补上 `module.exports`** + 按清单改对 → `recall-verify.js` 全绿 |
| 2 | `week1-language/day08-promise-api.js` | 四个方法各一个例子 + **对比表填实测结果** |
| 3 | 日志里 ESM vs CJS 的 **4 行笔记** | 4 行，写进 `notes/day08.md` 的「第 2 天」段 |
| 4 | `p0-toolkit/tsconfig.json` | `strict: true`、`noEmit: true`；`pnpm exec tsc --noEmit` 能跑 |
| 5 | `p0-toolkit/src/*.ts` + `test/*.test.ts` | **5 个模块转完，`pnpm test` 仍然 26 条全绿** |
| 6 | 轮转复习 4 个模块 + 日志 + commit | —— |

---

## 一 时间表（从开工起算，共约 3 小时 40 分）

| 时段 | 干什么 | 产出 |
|---|---|---|
| **0:00–0:20** | **① 三个 `recall-*.js` 改到全绿**（含补导出） | 1 |
| **0:20–0:45** | **② ③ `Promise.all` 家族**（四个方法 + 对比表） | 2 |
| **0:45–1:05** | **③ ④ ESM vs CJS**（只读机制 + 4 行笔记） | 3 |
| 1:05–1:15 | 休息 | —— |
| **1:15–3:15** | **④ TypeScript 入门 + `p0-toolkit` 转 TS**（主线，2 小时） | 4、5 |
| **3:15–3:35** | **⑤ 轮转复习 4 个模块**（今天增到 4 个） | —— |
| **3:35–3:50** | **⑥ 日志 + commit + push** | 6 |

**备用（提前做完才做）**：零提示题第 3 道 —— `flatOnce(arr)`：把嵌套数组**只拍平一层**（如 `[1,[2,[3]]]` → `[1,2,[3]]`），要求不改原数组。仍然只给题目 + 验收标准，卡点记日志。

---

## 二 任务详情

### ① 三个 `recall-*.js` 改到全绿（20 分钟）

**先补导出**（三份都缺，所以脚手架读不到）：

```js
module.exports = { curry };        // 各写各的：curry / deepClone / throttle
```

**要改什么，清单在 `notes/week1-review.md` 的 #1–#10**（就是照你代码里自己标的那几句整理的）：

| 模块 | 差什么（详见清单） |
|---|---|
| `curry` | 收的是**函数**不是数组；参数要**累积**；收够时调 `fn.apply(this, adj)`；内层要 `return` |
| `deepClone` | `typeof x !== 'object'`；数组分支 `return x.map(item => deepClone(item))`；`for...in` 拿键 / `for...of` 拿值；`null` 单独处理 |
| `throttle` | 返回的函数**别再多收一个 `fn`**；时间到了要**调用**并传参 `fn.apply(this, args)` |

**改完逐个跑**（写完一个跑一个，别攒着）：

```powershell
node week1-language/recall-verify.js curry
node week1-language/recall-verify.js deepClone
node week1-language/recall-verify.js throttle
```

> 规则照旧：**先别看 `p0-toolkit/src/*.js`**，跑红了再去看 —— 这个顺序别反。

---

### ② ③ `Promise.all` 家族（25 分钟）

新建 `week1-language/day08-promise-api.js`：四个方法各写一个**最小**例子，**并且造一个"其中有一个会失败"的场景**（数组里混一个 `Promise.reject('x')` 就行），把这张表**用实测结果**填满：

| 方法 | 全部成功时拿到什么 | 有**一个**失败时会怎样 | 什么时候用它 |
|---|---|---|---|
| `Promise.all` | | | |
| `Promise.allSettled` | | | |
| `Promise.race` | | | |
| `Promise.any` | | | |

**顺手一个实验**：`Promise.all` 里一个失败时，其他几个 Promise **还会不会继续跑完**？（打印出来看）—— 这是面试常问的细节。

---

### ③ ④ ESM vs CJS（20 分钟，只读机制）

**入口就是 9/20 你撞的那个现场**：

```
ERR_AMBIGUOUS_MODULE_SYNTAX: Cannot determine intended module format
because both 'module' and top-level await are present.
```

读：javascript.info [《模块 (Module) 简介》](https://zh.javascript.info/modules-intro) + [《导出和导入》](https://zh.javascript.info/import-export)（快读）。

然后在日志的「第 2 天」段写 **4 行笔记**：
1. 两套的语法差别（`module.exports` / `require` ↔ `export` / `import`）
2. 为什么"顶层 `await` 只属于 ESM"
3. `p0-toolkit` 现在用哪套？④ 转完 TS 之后还是哪套？
4. 昨天那个报错，**用一句话解释给面试官听**

---

### ④ TypeScript 入门 + `p0-toolkit` 转 TS（2 小时）—— 今天的主线

#### 先说一条**我实测过的环境结论**（能省你半小时）

计划里原本写着"测试从 `node --test` 换成 Vitest"—— **今天实测下来不需要**：

| 实测项 | 结果 |
|---|---|
| `node 文件.ts` 能不能直接跑？ | ✅ 能（Node 24 自带类型剥离） |
| `node --test` 会不会自动发现 `*.test.ts`？ | ✅ 会 |
| 能不能 `require('../src/a.ts')`？ | ✅ 能 |

→ **工具箱转 TS 之后继续用 `node --test`，一条测试都不用改**（把 `require` 路径里的 `.js` 改成 `.ts` 就行）。
**Vitest 挪到第 3 周**（项目 2 的时候再上，那时才真的需要它）。**计划书里这一条已经改掉。**

#### 步骤

**第 1 步：装 typescript **和 @types/node**，建 `tsconfig.json`**（10 分钟）

```powershell
cd week1-language/p0-toolkit
pnpm add -D typescript @types/node
```

> ⚠️ **`@types/node` 必须装**：不装的话 `require` / `module` 会报 `Cannot find name 'require'`（TS 不知道 Node 的那些全局是什么）。

`tsconfig.json`（**按实测修正过的版本**，见下面的坑）：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

> ⚠️ **两个坑（2026-09-22 实测踩到）**：
> 1. 现在 `pnpm add -D typescript` 装到的是 **TypeScript 7.0.2**，它**删掉了 `moduleResolution: "node"`**（报 `TS5108: Option 'moduleResolution=node10' has been removed`）→ 改成上面这种 **`module: "nodenext"`**（它会自己带出正确的解析方式）；
> 2. `types: ["node"]` 要写上，配合 `@types/node` 才能认识 `require` / `module`（TS 7 的报错原文也会提示这一句）。

**第 2 步：`package.json` 加两个脚本**（2 分钟）

```json
"scripts": {
  "test": "node --test",
  "typecheck": "tsc --noEmit"
}
```

**第 3 步：一个模块一个模块地转**（这是今天的主体，约 1 小时 40 分）

顺序按"最简单 → 最复杂"：`curry` → `throttle` → `debounce` → `deepClone` → `arrayUtils`。

每个模块做三件事：
1. `src/x.js` → `src/x.ts`
2. 给**参数和返回值**加类型（`function curry<T>(fn: (...args: any[]) => T)` 这种先跑通，别追求高级类型体操）
3. `test/x.test.js` → `test/x.test.ts`，并把 `require('../src/x.js')` 改成 `require('../src/x.ts')`

**每转完一个立刻跑一次**（这就是"一次通过"的执行方式）：

```powershell
pnpm test          # 期望：26 条里转过的那些仍然全绿
pnpm exec tsc --noEmit    # 期望：只有"还没转的文件"相关的报错
```

**第 4 步：全部转完，最后跑一次两个命令**（5 分钟）

```powershell
pnpm test && pnpm exec tsc --noEmit
```

**验收**：`node --test` **26 条全绿** + `tsc --noEmit` **零报错**。

> **⚠️ 别追类型体操**：今天的目的是"能开 `strict` 并修完报错"（计划 §四 里写的就是这一条），不是把类型写到完美。遇到难写的地方，`any` 或 `unknown` + 一行注释说明"这里先放宽"，比卡一小时划算 —— **但要在日志里记下"哪里我放宽了、为什么"**（第 4 周面试要讲取舍）。

---

### ⑤ 轮转复习 4 个模块（20 分钟）

今天从 3 个增到 4 个（这是"要加压"的落点：**加压加在复习上，不加新内容**）。

```powershell
node week1-language/recall-verify.js debounce
node week1-language/recall-verify.js curry
node week1-language/recall-verify.js deepClone
node week1-language/recall-verify.js throttle
```

（`debounce` 你昨天已经改对过，今天再来的目的是确认"隔一天还写得出来"。）

**规则**：判据文件 0 条测试时会报"这个绿不算数"；有红 → 打开源码对照 → **合上再写一遍**。

---

### ⑥ 日志 + commit（15 分钟）

日志写在 **`notes/day08.md` 的「Day 8 第 2 天」段**（同一份日志加分段，不另开文件）。
**「学会了什么」一定要填**（昨天那栏空着 —— 那是你自己的栏目）。

```powershell
git add -A
git commit -m "day08: promise api + esm/cjs notes, p0-toolkit to TypeScript"
git push
git status -sb
```

---

## 三 今天的完成标准

- [ ] 三个 `recall-*.js` **全绿**（含补上 `module.exports`）
- [ ] `day08-promise-api.js` 跑起来，对比表**填的是实测**
- [ ] ESM vs CJS 4 行笔记写进日志
- [ ] `p0-toolkit` **5 个模块全转 `.ts`**，`pnpm test` **26 条全绿**
- [ ] `pnpm exec tsc --noEmit` **零报错**（放宽的地方在日志里说明）
- [ ] 轮转复习 4 个模块跑过
- [ ] 日志（含「学会了什么」）+ commit + push

---

## 四 如果时间不够：砍单顺序

**保底**

1. **① 三个 `recall-*.js` 改到全绿**（15 分钟，这是昨天欠的，且直接对着「忘了的」清单前 10 条）
2. **④ `p0-toolkit` 转 TS 的主干**（至少转完 `curry` + `throttle` + `debounce` 三个，跑绿）
3. 日志 + commit

**可以顺延（按这个顺序砍，从下往上）**

4. ⑤ 轮转复习（但**它是加压的落点，尽量别砍**）
5. ③ ④ ESM vs CJS 笔记
6. ② ③ `Promise.all` 家族

**注意**：`tsc --noEmit` 的报错如果多到修不完，**允许留到明天**（登记欠账），但 `pnpm test` 的 26 条**必须绿**。

---

## 五 今天不碰什么

- **Vitest**（实测不需要，挪到第 3 周）
- **事件循环六阶段、`process.nextTick` 的正式讲解** → 那是 Day 9（9/23）的内容，那天会**回到昨天那个现场**
- **手写 Promise / 类型体操 / LeetCode** → 都不在今天

---

## 六 下一段的锚点

**Day 9（9/23）= Node 架构与事件循环**，而且要**先回到昨天 9/21 的现场**：
`day08-event-loop.js` 的 8 个标记顺序 + 你答错的那个 `.then` vs `await` 对照实验 + 你明确说的三条"不知道"（`process.nextTick` 是什么、`setTimeout` 属于 timers 队列、事件循环的"阶段"）。

---

## 附：他自己提的一条要求（已采纳）

> "我想通过不断的错误回忆起自己忘的知识点，你只需要在不断的测试中发现我的问题并提醒我立刻看看复习即可。"

**落实方式（写进计划 §七 心法第 9 条）**：
- **轮转表保覆盖面**（防止"你没遇到的错永远暴露不了"）
- **"发现即提醒"保即时性**：每次核对发现问题，我**当场指到"材料位置 + 「忘了的」清单编号"**，你立刻回看并在清单上打勾
- ⚠️ 但"发现问题"这件事**最终要长在你自己身上** —— **"写完判据先故意让它红一次"就是那个开关**（清单 #13）。面试和真实工作里没人替你发现。
