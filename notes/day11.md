# Day 11 — 2026-09-25（周五）

> **状态：待填写**　｜　任务书：[`day11-streams.md`](day11-streams.md)
> **第 2 周 Day 3**　｜　**接昨天**：Day 10 证明了"同步会卡住事件循环"→ 今天再进一步：`readFile` 把整个文件读进内存，遇到大文件会怎样？**流就是为这件事存在的**
> **今天的目标**：拿到一个**能跑出数字**的流式 NDJSON 解析器，并用 `process.memoryUsage()` **实测**"整读 vs 流式"的内存差别
> **⚠️ 昨天两条欠账（0b / 0c）今天开场必须清** —— 那两条是你自己要求排进今天的

## 今日目标

- [ ] ① 开场清欠账：`parseArgs` 默写 + `main()` 合上重写
- [ ] ② 补做 Day 10 的 ④ 小实验（放大工作量版）
- [ ] ③ 轮转复习 `debounce`（凭记忆 + 跑判据）
- [ ] ④ 零提示题第 5 道 `chunk` + **自写判据**
- [ ] ⑤ 阅读：四种流 / `pipe` vs `pipeline` / 背压 / `Transform`（4 行笔记）
- [ ] ⑥ **主线** `week2-runtime/day11-ndjson.js`（整读版 → 流式版 + 内存实测）
- [ ] ⑦ 判据 `day11-ndjson-verify.js` 跑绿
- [ ] ⑧ 日志 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `week2-runtime/day10-dir-size.js`（的 `main()`） | 0b：`--top` / `--json` **自己重写**（昨天那份是 AI 给的） | ⬜ |
| `week2-runtime/day10-readdir.js` | 0c：④ 实验重做（放大工作量） | ⬜ |
| `week1-language/recall-debounce.js` | 轮转复习：凭记忆重写 | ⬜ |
| `week2-runtime/day11-zerohint-05.js` | 零提示题 `chunk` | ⬜ |
| `week2-runtime/day11-zerohint-05-verify.js` | **我自己写的判据** | ⬜ |
| `week2-runtime/day11-ndjson.js` | 大文件逐行 JSON 解析器（主线） | ⬜ |
| `week2-runtime/day11-ndjson-verify.js` | 判据（AI 写） | ⬜ |

---

## ① 开场清欠账

**0a 默写 `parseArgs` 框架**（盖住材料凭记忆写）

| 要默写的 | 我写的 |
|---|---|
| `args` 写什么 | |
| `options.<名字>` 的三要素 | |
| `type` 只能是哪两种 | |
| 为什么必须 `allowPositionals: true` | |
| 怎么取值（选项 / 位置参数） | |
| 为什么输出要分两条路 | |

**默写结果**：⬜ 全对 ／ ⬜ 有卡住的地方（写清哪一格）：
**没默出来的进「忘了的」清单了吗**：

**0b 合上重写 `day10-dir-size.js` 的 `main()`**

| 项 | 记录 |
|---|---|
| 我查了什么材料（允许查自己的日志/框架表/MDN） | 查了自己的日志，找到自己忘记的方法及其用法 |
| 用了多久 | 30分钟 |
| 跑没用过的坑（`--top=3` / `--json` / 不存在的目录） | 已跑 |
| 判据结果（目标 10/10） | 第一次出现7次笔误。第二次 在布尔类型添加了引号，导致抛错。 第三次10/10 |

**0c ④ 小实验重做**（放大工作量：大目录 或 反复读 N 遍；A/B 分两次跑，只比"定时器的等待"）

| | 我的预测 | 实测 |
|---|---|---|
| 同步版的**定时器等待** | 在跑3000个文件各跑20遍的情况下 20ms | 18ms |
| 异步版的**定时器等待** | 在跑3000个文件各跑20遍的情况下 1ms | 2ms |
| （参考量级）| —— | 同步 ≈ 同步循环耗时；异步要小一个量级 |

**为什么必须放大工作量**（一句话）：才能看到同步版和异步版的区别：一个需要等同步代码跑完再返回，一个直接立刻返回，不需要等待。
**Q2 补完**（Day 10 只答了一半）：如果第 3 周的 API 服务在请求处理里用了 `readdirSync`，会发生什么？

整个进程卡住，导致后面遇到的请求也全部延后，等价于整个程序退化成“一次只处理一个”的情况。所以告诉我们要同步处理多项任务必须要用异步操作
更准确的说法并发处理多项请求不能用*sync。
---

## ② 轮转复习：`debounce`

| 模块 | 结果 | 卡在哪 |
|---|---|---|
| debounce | 错一处 | 没有进计时器就return了导致callNow一直为true |

**这次的坑**（`immediate` 选项？"变量被先后赋值 ≠ 定时器被取消"？）：

---

## ③ 零提示题第 5 道：`chunk`

| 项 | 记录 |
|---|---|
| 用了几分钟 | 1个半小时 |
| 做出来了吗（四行验收表逐条对） | 做出来了 |
| **判据是我自己写的吗** | 是的 |
| **有没有"先故意让它红一次"** | 没有，因为出现了假绿需要进行修改。修改Math.ceil故意改成Math.floor，chunk([1,2,3,4,5], 2)输出是否正确  和[1,2,3], 10输出是否正确 判红 |
| `size` 不是正整数时我定的行为 + 为什么 | 为0时直接返回原数组，非正整数或零直接抛错，因为除了正整数外该函数没有能分组的对象也没有意义，直接退出函数节省缓存 |
| **卡在哪一步** | 没有 |

---

## ④ 阅读笔记（4 行）

1. 四种流各是什么（谁能读、谁能写）：
Readable 可读  数据来源的抽象 主要是在流中消费数据
在暂停模式必须主动通过调用read()读取数据块 想要进入流动模式必须加入data监听器，并通过pipe()调用  注:除非有消费机制存在，否则都是读

writable 可写  数据目的地的抽象，主要从流中写入数据
write() 

Duplex（双工流）可读可写 读写两侧各自维护独立的内部缓冲区，并允许两侧以不同速度独立操作

Transform 可读可写 Duplex的特殊形式，区别在于写入的数据会经过转化从读侧输出

2. `pipe` vs `pipeline` 的核心差别：
pipe只适用于Readable，是可读流上的方法，
pipeline则是stream独立工具函数适用于任意数量的流作为参数

pipe出错了不会自动向前传到后续的流，必须手动设置err事件
不会自动关闭和清理已打开的流资源
而pipeline则会

3. **背压**：消费者比生产者慢时，发生什么？

达到highWaterMark后会暂停从底层资源读取数据，write()进行写入的时候会返回false 会触发drain事件

后果：生产者如果不看write()返回的false  继续写=>内存一直涨
4. `Transform` 是干嘛的（一句话）：
将写入的数据经过转化后从读侧输出
---

## ⑤ 主线：`day11-ndjson.js`

| 项 | 记录 |
|---|---|
| 整读版（`readFile`）跑出四个数字了吗 | |
| 流式版（`createReadStream` + `readline`） | |
| 两个版本输出**一模一样**（同一个文件对过） | |
| 坏行不崩（计数不抛错） | |
| `bytes` 用的是字节不是字符 | |
| 文件不存在时友好报错 | |
| `--json`（可选） | |
| `Transform` 进阶版（可选） | |
| **内存实测：整读版 `heapUsed` 峰值** | |
| **内存实测：流式版 `heapUsed` 峰值** | |
| 大文件怎么造的（多少 MB / 多少行） | |
| **今天最卡的一处** | |
| **放宽/绕过的地方**（有就写，说明为什么） | |

**两个版本的输出（贴一次真实运行结果）**：

```
（把 `node week2-runtime/day11-ndjson.js 某个.ndjson` 的输出贴在这里）
```

**内存数字怎么量的**（写清方法：在哪采样、取的是哪个字段）：

---

## 学会了什么

1.process.exitCode = 1;   **process** 全局对象 ，它的属性exitCode为0时表示成功，非0时表示通用错误

2.require.main属性是入口模块
在dirSize练习中的if(require.main=== module)表示判断当前文件的模块是否为module（意思是当前文件就是被直接跑的一个）

3.fs.mkdtempSync创造临时的唯一目录

4.fs.writeFileSync 同步版本的写入，文件不存在就创建，存在就覆盖原来的内容

5.fs.rmSync同步删除文件和目录的方法

6.在零提示题中复习了flat用法 flat(Infinity);全部拆开

7.stream 流 是node.js用于处理流式数据的抽象接口
缓冲区：每个流都有内部缓冲区，highWaterMark是缓冲的阈值

8.pipe()stream流中自动处理背压
写流write()返回false的情况，表示缓冲区已满，应该停止写入
到达highWaterMark时候暂停从底层资源读取数据

9.
Object Mode 对象模式 默认为false 流只处理字符串、Buffer 、TypedArray、
DataView (javascript中的内置构造函数/类,用于按任意偏移和指定字节序读写二进制数据)
TypedArray 是类型化数组的统称按固定元素类型读写ArrayBuffer "同质二进制数组"
具有性能好访问直观的特点

10
Readable  数据来源的抽象，从流中消费数据的作用
两种读取模式 
流动模式 自动读取并通过data时间提供 要切换此模式需要 ：添加data监听器 调用pipe() 
暂停模式 必须通过显式调用read()读取数据块   所有流初始都是暂停模式
Readable.on("事件名"，"事件")  例子 Readable.on("data",callback)意思是发生data事件时立刻调用callback
事件名中分类："data"一发生就触发，
"end"事件发生后触发，
"error"发生错误时触发



11.Writable 数据目的地的抽象 从流中写入数据
writable.write(chunk,[,encoding][,callback])   chunk必填，需要写入的数据 普通流中可以写入string ，Buffer , Uint8Array typeArray DateView,在ObjectMode：true中才可以填入数字对象
encoding和callback可选 encoding只有在字符串时候有效，写入的编码类型
callback写入完成后的回调，不保证数据到最终目的地、
write返回值为布尔类型  写入失败（流满了）则会返回false
核心事件（用于on once）
'drain' 流满时候触发
 'finish'出现end()等所有数据被底层处理完了才触发
  'error' 发生错误时候触发
'close' 流关闭时触发

12 Duplex （双工流） 读写两侧 各自维护独立的内部缓冲区
与Transform 的关系Transform 是Duplex的子类
区别在Transform读写存在转化


13Transform（转化流）
通过push()输出转化后的数据
默认暂停，被pipe或添加data/readable事件监听器后才会开始处理数据


14.stream.pipeline 的用法
pipe出错了不会自动向前传到后续的流，必须手动设置err事件
不会自动关闭和清理已打开的流资源

pipeline(source,tranform1,destination,callback)回调版
pipeline(source,tranform1,destination) promise版

15.fs.readFile(path,encoding,callback)
node.js 最传统的文件读取方式
fs.readFileSync 同步版
fs=require("node:fs/promises")
fs.createReadStream(path,options)

options的参数{
   encoding 绝对输出类型（Buffer还是字符串）默认是null
   start end 读从start开始end 的部分 包含start end   
   highWaterMark 控制内存缓冲区的大小 普通流的大小默认16 kib  createReadStream返回的默认是64kib
   autoClose 自动关闭 默认为true（布尔值）触发error或err是否自动关闭
   fd 文件描述符 直接使用一个已打开的文件描述符，如果填写fd ，path会被忽略 open事件也不会触发
   flags 文件打开标志  默认r（只读）    其他如  a（追加）w（写入）
   emitClose 被销毁时候是否发出close事件   布尔值 返回true 
   mode 文件模式权限  设置文件权限
}

16.trim 





## AI 复核（⑤ 主线 + 今日记账 —— 这一段是 AI 补的，不是学生写的）

**判定：不合格**（学生自己先说"这个任务是我让 AI 辅助我完成的，请把我判定为不合格"）。

**记账（按他本人的更正写，比 AI 的判断更准）**：
> **"我不会流式处理 —— 这份是 AI 帮我一起写的，我只是输入了关键词让它帮我写出了这个代码，所以这边你还是得给我记账上'我不会流式处理'，只是看懂了代码在干嘛而已。"**

⚠️ **AI 侧要记一笔自己的错**：我一开始从"代码跑对了"推出"流式思路是他做的"，**这是过度推断**（和我 9/23 自己写下的"别把'背下来了'当成'懂了'"是同一条教训）。**判"哪部分是谁写的"只能问本人，不能从代码风格猜。** 他这个主动纠正的行为值得表扬 —— 正是第 4 周附录 D 要的"能说清我哪部分是 AI 帮的"。

### 这版的问题（AI 实测：只改 2 处 → 判据 9/9）

| 行 | 原来 | 改成 | 影响 |
|---|---|---|---|
| 1 | `require("node:fs/promises")` | `require("node:fs")` | **一处修好 5 条判据**（01/02/03/04/06）—— `createReadStream` 不在 promises 那套上（实测 `typeof fsp.createReadStream === 'undefined'`），`stat` 继续用第 3 行的 `fsPromises` |
| 89–98 | `main` 没有 try/catch | 包 try/catch | 05（别崩栈）|

改完实测 `pass=9 fail=0` ✅。**还剩 3 处小尾巴**：
- **第 19 行**（注释里的整读版）`fsPromises.readFile(fileURLToPath,"utf8")` → 要用 `file`（`fileURLToPath` 未定义）—— **不做这一步就跑不了"整读版 vs 流式版"的内存对比**，也就是今天目标的后一半
- main 的 catch 里 `console.log("文件为空")`：消息不准（常见是文件不存在），且**没打印错误原因**（用 `err.code || err.message`）
- catch 里补 **`process.exitCode = 1`**（任务书要求 6；判据的探针已经提示过"退出码是 0，建议非 0"）

### 内存实测（今天没做；参考数字来自 AI 实测）

方法：`setInterval` 每 5ms 采一次 `process.memoryUsage().heapUsed` 取最大值（**外部量，不用改实现**）。同一个 13.1MB / 20 万行文件：

| 版本 | 结果 | 峰值 `heapUsed` |
|---|---|---|
| 整读版（对照） | `{lines:200000, ok:200000, bad:0, bytes:13777780}` | **22.8 MB**（起跑 4.4 → 涨 ~18MB）|
| 流式版 | 完全一样 | **8.3 MB**（起跑 4.4 → 涨 ~4MB）|

→ 整读版多出来的内存 **∝ 文件大小**（约 1.4×），流式版 **≈ 常数**。

### 重写安排（**他本人要求挪到明天早上，AI 已同意**）

原话："今天的重写任务就放过我吗，明天早上让我重写一遍。" → **同意**，已写进 `notes/HANDOFF.md` §六 的「Day 12 开场必做」。要重写的是**整读版 + 流式版两个 `summarize`**（不是只改那 2 处接线）；判据现成，目标 9/9。

**今天的账（两条）**：① 内存实测没做 ② `--json` / `Transform` 进阶版顺延。

---

## 卡在哪里

1.不知道如何跳过空行  if(!line.trim()) return ;
2.fs.stat获取文件或目录的详细元数据

---

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| （没欠账就写"无"） | |

## 明天第一件事

1. **Day 12（9/26 六）= HTTP 与原生 `http`**，并且是**项目 1（批量文件整理 CLI）的启动日**：上午 HTTP 基础 + `http.createServer`；下午项目 1 需求分析、命令行参数设计（`--dry-run` / `--verbose`）、目录结构规划，**先写 README 再写代码**
2. （如果今天有顺延）先把欠账清掉

## 代码 / 命令备忘

```powershell
# ① 0b：昨天的判据（重写 main() 之后要跑绿）
node --test week2-runtime/day10-dir-size-verify.js

# ③ 轮转复习
node week1-language/recall-verify.js
node week1-language/recall-verify.js debounce

# ④ 零提示题
node --test week2-runtime/day11-zerohint-05-verify.js

# ⑥ 主线
node week2-runtime/day11-ndjson.js 某个.ndjson
node week2-runtime/day11-ndjson.js 某个.ndjson --json
node week2-runtime/day11-ndjson.js 不存在的文件

# ⑦ 判据
node --test week2-runtime/day11-ndjson-verify.js

# 收尾
git add -A
git commit -m "day11: streams + backpressure, ndjson line parser (streaming vs readFile)"
git push
git status -sb
```
