# Day 10 — 2026-09-24（周四）

> **状态：待填写**　｜　任务书：[`day10-modules.md`](day10-modules.md)
> **第 2 周 Day 2**　｜　**接昨天**：Day 9 的"同步代码不跑完，事件循环一步都动不了"→ 今天用它理解"同步 vs 异步读目录"
> **今天的目标**：拿到一个**能跑出数字**的目录统计脚本，并说清"为什么用 `fs/promises` 而不是 `*Sync`"

## 今日目标

- [ ] ① 轮转复习（凭记忆 + 跑判据）
- [ ] ② 零提示题第 4 道 `groupBy` + **自写判据**
- [ ] ③ 阅读：`fs/promises` / `path` / `os` / `Buffer` / `process.argv` / `parseArgs`（3 行笔记）
- [ ] ④ 小实验：同步 vs 异步读目录（**接 Day 9**）
- [ ] ⑤ **主线** `week2-runtime/day10-dir-size.js`（`dirSize(dir)` + 命令行入口）
- [ ] ⑥ 判据 `day10-dir-size-verify.js` 跑绿
- [ ] ⑦ 日志 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `week2-runtime/day10-zerohint-04.js` | 零提示题 `groupBy` | ⬜ |
| `week2-runtime/day10-zerohint-04-verify.js` | **我自己写的判据** | ⬜ |
| `week2-runtime/day10-readdir.js` | 同步 vs 异步读目录 | ⬜ |
| `week2-runtime/day10-dir-size.js` | 目录大小报告（主线） | ⬜ |
| `week2-runtime/day10-dir-size-verify.js` | 判据（AI 写） | ⬜ |

---

## ① 轮转复习

| 模块 | 结果 | 卡在哪 |
|---|---|---|
| arrayUtils | 8/8（第一遍 4/8 → 第二遍 8/8） | 卡在：for...in 的下标是字符串 / 导出名 myfilter / 少写 arr. |
| | | |
| | | |

---

## ② 零提示题第 4 道：`groupBy`

| 项 | 记录 |
|---|---|
| 用了几分钟 | |
| 做出来了吗 | 没做对 —— 值要是数组，我写成了覆盖（每个键只剩最后一个元素）；第二遍已经 5/5 了 |
| **判据是我自己写的吗** | 是，4 条；改了 3 处（keyFn 传参、{1:[1]}、补两条）；负向验证 5 种改法都能红 |
| **有没有"先故意让它红一次"** | 已验证确认会红（那是AI独立跑的 5 种改法；我自己有没有做"先改坏一个字符） |
| **卡在哪一步** | 每个键的「值的起点」（[]） —— 靠 AI 提醒才想起 ?? 起点 是自己在 countChars 用过的（归检索失败） |

---

## ③ 阅读笔记（3 行）

1. `fs/promises` 和回调版的关系：
'fs/promises'返回的是promise 可用于async/await，代码清晰明了
回调版第一个参数手工传错误、嵌套一多起来就比较难纠错
fs/promise能跟await+try/catch还能用Promise.all组合
纠错成本较小，代码清晰

2. 为什么要用 `path.join` 拼路径：
path.join可以保证跨平台交流不会出现问题，相比于手写/，\能实现跨平台兼容。
不能手写反斜杠的理由例如C:\Users\new中\n会变成换行符，拼路径要么用\\要么用path.join。
3. `--top=3` 这类选项，`util.parseArgs` 的 `options` 怎么写：
const {parseArgs}=require("node:util");

const config ={
    options: {
        top:{
            type:'string'
        },
    },
};
node .js --top = 3

---

## ④ 小实验：同步 vs 异步读目录

| | 我的预测 | 实测 |
|---|---|---|
| 同步 `readdirSync` → `setTimeout(0)` 等多久 | 1ms|1ms |
| 异步 `readdir` → `setTimeout(0)` 等多久 |5ms | 7ms|

**1. 用 Day 9 的结论解释**（同步读目录时，事件循环在干嘛）：
事件循环处于停止的状态，因为同步代码还没有跑完，那么计时器一直处于过期的状态直到同步代码跑完进入事件循环的时候

**2. 如果第 3 周的 API 服务在请求处理里用了 `readdirSync`，会发生什么**：
API会出现延迟响应的情况，虽然内部已经读取了，但是响应还需要等待一段时间。

---

## ⑤ 主线：`dirSize(dir)`

| 项 | 记录 |
|---|---|
| 最小版（不递归）跑出数字了吗 | |
| 递归 | |
| `--top` | |20分钟理解
| `--json` | |20分钟理解
| 目录不存在时友好报错 | |
| **今天最卡的一处** | |
| **放宽/绕过的地方**（有就写，说明为什么） | |

实测输出（贴一次真实运行结果）：

```
（把 `node week2-runtime/day10-dir-size.js .` 的输出贴在这里）
```

---

## 学会了什么

1.readfile("file.txt");读取file.txt的原始字节，并返回属于node.js的类型之一buffer，buffer专门用来表示二进制字节数据可以理解为带长度限制字节数组0到255的数字
readfile("file.txt","utf-8")意识是读取file.txt中的原始字节再通过utf-8将buffer类型解码成字符串
2.FileHandle类是fs.promises.open()方法的返回类型
FileHandle类型必须自己主动关闭不然打开的文件一直不关闭会一直运行直到报错打开文件太多的错误。
关闭的方法应该使用FileHandle.close();主动关闭。
3.path.sep常量：路径片段分割符/,\
path.delimiter 环境变量PATH中的路径分割符; ：
4.不同操作系统的文件该转化呢？
path.posix在windows中处理posix的文件
path.win32在posix中处理windows中的文件

5.path.join()用于拼接路径连接方式用平台分割符号
Windows用\,posix中用/
特点：会规范化路径（解析..和.）零长度片段会忽略
遇到非字符串会抛TypeError
备注：'..'是返回上一目录，'.'是当前目录

6.path.resolve()为解析绝对路径，意味着只要找到绝对路径，其他的机会被它抛弃
特点：从右往左检索 ，但输出还是从左往右
无参数时（path.resolve("")）直接输出当前目录的绝对路径（绝对路径的概念：从头到尾，根目录开始到此处，即从地球一直指引到自己所在的地方。相对路径：相对于当前目录下该文件的位置）
若其中都没有绝对路径则以当前工作目录的绝对路径为基准根据resolve中的内容延伸

7.path.parse()；拆解路径,root dir base ext name
root :根目录 
dir:文件位置
base : 文件名 扩展名（要加上.）
ext ： 扩展名
name： 文件名
path.format 则是反向组装，提供对象，根据对象生成路径字符串

8.path.basename提取路径最后一部分(尾部斜杠会被忽略)
path.dirname(path)去掉最后一部分的路径
path.dirname()与path.parse().dir仅在尾部有斜杠的地方不同，尾部有斜杠会导致parse会以为最后base为空导致dir为整个目录，而dirname则是会忽略尾部斜杠所以返回的与parse不同
例如：const p = '/home/user/dir/';

path.dirname(p);        // '/home/user'
path.parse(p).dir;      // '/home/user/dir'

同理path.basename()与path.parse().base在遇到尾部斜杠是不同

9.path.extname(path)
返回路径的扩展名包括.
如果path为目录路径（没有精准定位到文件）则返回""

10首先是os是node用途为操作系统信息
只返回信息不会修改系统

os.homedir()返回当前用户主目录的路径
返回类型为字符串
Linux/macOSt来自环境变量$HOME
WINDOWS则通常来自环境变量USERPROFILE或者HOMERIVE+HOMEPATH

os.platform();
显示node.js运行所在的操作平台
注意window返回的是win32

11.buffer主要是通过buffer.alloc()这个会初始化内存，更安全，Buffer.allocUnsafe()则是在原有数据上创建一个buffer，优点是创建速度更快，缺点是会包含旧数据，需要fill（）;writer（）覆盖旧数据


12.buffer.byteLength()作用是返回一个在一个制定编码下所占的字节数
而string.prototype.length返回的是字符数


13.process.argv 获取命令行参数
下标结构为[node可执行文件路径，脚本路径，用户自己写的参数]


现代node.js更推荐使用util.parseArgs
process.argv0:保存的是argv[0]的只读副本


14.fs.readdirSync(__dirname)
读取目录内容 同步版

__dirname :当前JS文件所在目录的绝对路径
fs.readdir()
读取目录内容 异步回调版



15.padStart()字符串开头填充字符，padStart(8,"0");意思是开头补8个0











---

## AI 复核（③ 阅读笔记 —— 这一段是 AI 补的，不是学生写的）

**总的看：准确率比前几天高。** 下面这些**逐条实测都对**：`path.join` 的三条特性（平台分隔符 / 规范化 `..` 与 `.` / 零长度片段忽略 / 传非字符串抛 `TypeError`）、`path.extname`、`os.homedir` + `os.platform()` 返回 `win32`、`alloc` vs `allocUnsafe`、`Buffer.byteLength('中文')=6` vs `'中文'.length=2`、`path.resolve('')` = 当前目录、`path.posix` / `path.win32` 是"用哪套规则处理"、还有"`dirname` 忽略尾斜杠"这半句。

### ⚠️ P0：第 3 条 `parseArgs` 的写法（会直接卡住 ⑤，已实测）

1. **`type: 'number'` 不合法** → 实测报错
   `TypeError: The "options.top.type" property must be ('string|boolean'). Received type string ('number')`
   → 只能写 `type: 'string'`，拿到的是**字符串**（实测 `typeof values.top === 'string'`），要自己 `Number(values.top)`。
2. **位置参数（你的目录）在默认 `strict` 下会抛错** → 实测
   `TypeError: Unexpected argument '.'. This command does not take positional arguments`
   → 必须加 `allowPositionals: true`；加完实测 `positionals=["."]`、`values={"top":"3"}`。
3. **`--top = 3`（`=` 两边带空格）不合法** → 实测 `TypeError: Unknown option '--top '`。写 `--top=3` 或 `--top 3`。
4. 还差一个 `args`：`parseArgs({ args: process.argv.slice(2), options: {...}, allowPositionals: true })`。

### ⚠️ P1：两处要更正

5. **"回调版性能好 / 要性能就用回调版" —— 这句不成立。**（✅ 学生已在笔记第 1 条里改掉，见上面现在的写法） `fs/promises` 和回调版**都是异步的、都不阻塞事件循环**，性能不是二者的分界；真正的差别在**写法与错误处理**：回调版靠第一个参数手工传错误、嵌套一多就难以收拾；promise 版能用 `await` + `try/catch`，还能用 `Promise.all` 这类组合子。
   ⚠️ **更要紧的是**：今天任务书那句目标问的是"**为什么用 `fs/promises` 而不是 `*Sync`**"，笔记里比的是"promise vs 回调"，**这一层没覆盖**。`*Sync` 的理由是"**同步版本会把事件循环卡住**"（Day 9 的结论）—— 这正是 ④ 要实测的东西。
6. **第 8 条那个例子写反了。** 实测 4 组输入（含多道尾斜杠、Windows 路径）：`path.dirname(p)` 与 `path.parse(p).dir` **永远相同**，`path.basename(p)` 与 `path.parse(p).base` 也相同 —— `path.parse('/home/user/dir/').dir` 实测是 `'/home/user'`，**不是** `'/home/user/dir'`。Node 的 `parse` 会先把尾斜杠规整掉，所以"parse 会以为 base 为空"这个推理不成立（"dirname 忽略尾斜杠"那半句对，但那是两者共同行为，不是差别）。

### P2：补三条对 ⑤ 直接有用的

7. **`process.argv` 的下标结构**（第 13 条只写了 `argv0`）：实测 = `[node 可执行文件路径, 脚本路径, 'a', 'b']` → **真正的参数从 `[2]` 开始** —— 这就是任务书里写 `process.argv[2]` 是目录的来由。
8. **不是所有 `fs` 都要手动 `close()`**（第 2 条只提了 FileHandle）：实测 `fs.promises.open()` 返回的才是 `FileHandle`（要自己 `close()`）；`readFile` / `readdir` / `stat` 是一把一利索，内部自己开关，**不用**手动关。
9. **手写反斜杠的硬理由**（呼应第 2 条）：实测 `'C:\Users\new'` 里的 `\n` 会变成**换行符**（那个字符串长度 10，中间真有一个换行）→ 拼 Windows 路径要么写 `\\`、要么就用 `path.join`。

### ⚠️ ④ 小实验：记进表里的两个数字**不是同一件事**，所以 A/B 没比出差别（附改法 + AI 实测数字）

**问题：两个数来自两条不同的打印。** 脚本里一句 `console.log("定时器等了", …)`、一句 `console.log("异步读完了", …)`：

- **"定时器等了"** = 事件循环被占了多久 ← **这才是 A/B 要比的东西，两行都该填它**
- **"异步读完了"** = `readdir` 自己跑完用了多久（线程池往返）← 和"定时器等多久"是两件事

AI 把它原样跑了 3 次：`定时器等了 1 / 1 / 1 ms`、`异步读完了 1 / 3 / 3 ms` —— **两个数都在 1–3ms 的噪声里，A 和 B 根本没区分开**。（其中一次"异步读完了"还先于"定时器等了"，那正好又是 Day 9 那条"`setTimeout` 的 1ms 是下限不是保证 + 谁先就绪谁先跑"。）

**根因：工作量太小。** `__dirname` 里只有几个文件，`readdirSync` 只花 0.x ms —— **阻塞 0.x ms 谁也看不出来**。Day 9 那个忙等实验能看出效果，是因为它一口气占了 300ms。

**改法（三条）**：① 放大工作量（换一个大目录，或把同样的读**反复做 N 遍**）；② **A 和 B 分两次跑**，两次都只看**定时器的等待**；③ 数字要差出一个量级才算证到。
AI 照这个改了一遍（临时目录造 **3000 个文件**、各读 **20 遍**）：

| | 同样的工作量 | **定时器等多久** |
|---|---|---|
| A 同步 `readdirSync` × 20 | 同步循环本身花了 **19ms** | **19ms** ← 同步代码占用的时间**原样加到**定时器上 |
| B 异步 `await readdir` × 20 | 异步循环总共 **22ms** | **2ms** ← 事件循环没被卡住 |

→ **同一件事、同样的耗时：同步版把事件循环按住了 19ms，异步版只让定时器等 2ms。** 这就是"为什么用 `fs/promises` 而不是 `*Sync`"的实证（今天任务书那句目标要的就是它）。

**Q1 答对了** ✅（"事件循环处于停止的状态……计时器一直处于过期的状态直到同步代码跑完"）—— 连"过期"这个词都用上了，很准。
**Q2 要补最关键的一半**：写的是"API 会出现延迟响应……响应还需要等待一段时间"—— 方向对，但漏了：卡住的**不是"这一个请求"，而是整个进程**。事件循环停摆的那 19ms 里，**所有其他请求（别人的、并发的）全都排在后面**，服务的并发能力退化成"一次只能处理一个"。这才是面试要的答案，也正是"别在请求处理里用 `*Sync`"的理由。

> 以上每条都在临时目录里跑过（`%TEMP%\notecheck\`、`%TEMP%\readdir-lab\`），不是凭记忆写的。

### ⚠️ ⑤ 主线：**判不合格** —— 学生自述"全部是问 AI 再自己写上去的"

**判定（AI 实测）**：`node --test week2-runtime/day10-dir-size-verify.js` → `pass=3 / fail=7`（必过 9 条里只过 1 条）。`dirSize('.')` 直接抛
`TypeError: The "path" argument must be of type string or an instance of Buffer or URL. Received an instance of Dirent`。

**记账（这是第 4 周面试要讲的那一段，所以要写清）**：这份实现**是问 AI 抄来的，不是他自己写的**。他同时如实报了两个原因：① 这些 API 没接触过 / 刚接触（`readdir`、`Dirent`、`stat`、`sort`+`slice` —— 和他 `## 卡在哪里` 里那 5 条完全对应）；② 自测题那么小的函数他都很难独立完成。
**AI 侧的动作**（走"什么时候可以给对照版"那个例外条款）：给一份**换场景的完整可跑示范**（`%TEMP%\demo-recent\demo-recent.js`：递归列出"最后修改的 N 个文件"，用同一套 API 但目标不同、**不含 `dirSize` 的答案形状**），并要求**合上示范自己重写一遍**；**直接粘贴判不合格**。

**他的 5 个卡点（原话，全部成立，照实记）**：① 不知道读目录该用 `readdirSync` 还是 `readdir` ② `entry.isDirectory()` ③ Dirent 的判断方法（`isFile()` / `isDirectory()`）④ `stat` 的用法 ⑤ 忘了 `.sort` 排序再 `.slice` 取前五。
→ ①②③④ 是**真知识缺口**（今天第一次见，排期正常）；⑤ 是**检索失败**（Day 3 / Day 7 用过）。

**逐行验尸（9 处，按"代码实际死在哪一步"排序）**：

| # | 他写的 | 实际发生什么 | 该是什么 |
|---|---|---|---|
| 1 | `await dirSize(entry)` | 💥 就是上面那个 `Received an instance of Dirent` | 传 `path.join(dir, entry.name)` 拼好的**路径** |
| 2 | `return {...}` 写在 `for` **里面** | 循环只跑第一个 entry 就返回（修好 #1 也还是错） | `return` 挪到循环**外面** |
| 3 | `await stat(entries)` | 💥 `stat` 要**单个文件路径**，给整个数组会抛 | `await stat(fullPath)` |
| 4 | `else if(entry.isFile)` 少括号 | 拿到的是**函数本身**（永远真）—— 分支碰巧还对，但这是"忘了调用"的老毛病 | `entry.isFile()` |
| 5 | `{path: fileCount, size: stats.size}` | `path` 写成了数字、键名是 `size` | 契约要 `{ path: 相对路径, bytes: 字节数 }` |
| 6 | 返回 `{result, fileCount, files}` | 键名不符契约 | `{ totalBytes, fileCount, largest }` |
| 7 | 没有 `largest` | 契约要"按字节**降序** + 取**前 5**" | `.sort((a,b)=>b.bytes-a.bytes).slice(0,5)` |
| 8 | 没有命令行入口 | 判据 06 / 07 红 | `process.argv[2]` / `parseArgs` + `try/catch` 友好报错 + `if (require.main === module)` 守卫 |
| 9 | `await fs.readdirSync(...)` | 无害，但暴露混用两套 API（`readdirSync` 返回**数组**、不是 Promise） | 同步就 `readdirSync`（不 await）；异步就 `fsp.readdir`（await）|

**重写路线（四步，每步都必须能跑）**：最小版（只统计当前目录、不递归）→ 加递归 → 加 `--top` → 加 `--json` / 友好报错。每步都跑 `node --test week2-runtime/day10-dir-size-verify.js`，看红条从 7 条往下掉。
**一个降低难度的建议（已验证）**：内部递归用**闭包共享累加器**（`found` 放在最外层，递归往里 `push`），**别用"每层返回、父层合并"**（他就是死在这条路上 —— 父子层"报表形状"必须完全一致，极容易对不上）。

**⑤ 第二版（9/24 下午，照上面的"换场景示范"改的）—— 判据仍 `pass=3 / fail=7`，但性质完全变了**：
- **搬对的（今天真正的收获）**：`fsp.readdir(dir,{withFileTypes:true})` + `entry.isDirectory()` / **`entry.isFile()`（带括号）** / `path.join` 拼"绝对 + 相对"两条路径 / **递归传拼好的路径**（不再是 Dirent）/ `stat(fullPath)` / **闭包共享累加器** / `parseArgs`（`type:"string"` + `allowPositionals`）/ `try/catch` / `if (require.main === module)` —— **他今天那 4 个知识缺口（`readdir`、Dirent、`stat`、`sort`+`slice`）一次补齐**。
- **没接上的（真正要练的那一步）**：**示范是换场景的，他改了个名字、没换目标** —— 返回值还是示范的"数组"，排序字段还是 `mtimeMs`（任务的契约要按 **bytes** 降序），`totalBytes` / `fileCount` 两个累加器被整段删掉（**他第一版里反而有**），CLI 打的还是 mtime 列表、没有总字节数。
- **外加两处会直接崩的改名手滑**：`return found.slice(0,n)`（累加器已改名 `files`，这行没跟着改 → `ReferenceError: found is not defined`）、catch 里的 `conosole.log`（→ 错误路径自己再崩一次）。**两处都是一跑就现形。**
- **AI 实测**：再改 **7 处**（都是"他上一版有过的"或"契约要求的"）→ **10/10**（含 CLI 与友好报错），**没有第六处隐藏问题**。→ **结论：他离全绿很近，缺的是"把机制迁移到契约上"这一步，不是新知识。**

**⑤ 第三轮（收尾）：他自己改完了 —— 必过 9 条全绿 ✅**
- 第 1 处 `const totalBytes` → `let`（`const` 不能 `+=`，一跑就 `TypeError: Assignment to constant variable`）；第 2 处**目录分支把两套累加风格混在一起**（文件分支用闭包 ✅、目录分支却 `sub.totalBytes` 去合并 —— 而 `walk` 没有 `return`）→ 目录分支并成一行 `await walk(fullPath, relPath);`。**这是他在同一个坑里第二次摔倒**（上一版是 `sub.result`）。
- 结果：`pass=10 / fail=0`（必过 9 条全绿），CLI 出数字、友好报错不带栈。
- **剩下两条探针没做**：`--top=3` 与 `--json` —— 他的 CLI 选项名是 `--n`（契约要求 `--top`），且 `parseArgs` 的 `strict` 对不认识的选项**直接抛未捕获的错**（`--top=3` 退出码 1 + 一堆栈）。
- **这两项的完整 `main()` 由 AI 给出**（走"连续多轮要对照版 + 他明确说'我真不知道该怎么写，以后再遇到也写不出来'"那条**例外条款**）。**条件已写明**：① **记账** —— 这段 `main()` 是 AI 给的，`dirSize` 是他自己写的；② **直接粘贴判不合格**；③ **必须合上重写一遍**，替换后跑判据 + 三个命令全绿才算法他的；④ **用自己的话答框架的三个问题**（`options` 三要素 / 为什么必须 `allowPositionals` / `--json` 模式为什么不能混人话），答不出就是抄的。
- **AI 实测**：他的 `dirSize` 一行不动、只换 `main()` → **`pass=10 / fail=0` 且三条探针全绿**（`--top=3` 真生效、`--json` 能被 `JSON.parse`）。
- **记忆动作（针对"以后再遇到也写不出来"）**：这份 `parseArgs` 框架建议**用默写**而不是重读 —— 明天开场 5 分钟默写"框架表"（`args` / `options.type` 只能 string|boolean / `allowPositionals` / `values` vs `positionals` / 输出分支），再加一个 `--verbose` 选项自测；**若默写不出来就进「忘了的」清单，Day 15 复盘时考**。

---

## 卡在哪里

1.写dirSize主线的时候，读取目标内容不知道应该用fs.readdirSync和readdir来写
2.entry.isDirectory()判断是否为目录
3.Dirent的中类的判断方法不知道例如entry.isFile()
entry.isDirectory()
4.用不来以及不知道stat的用法
5.忘记了数组方法通过.sort先排列再.slice返回一个前五的数组

---

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| （没欠账就写"无"） | |

## 明天第一件事

1. **Day 11（9/25）= Streams 与背压**：四种流、`pipe` vs `pipeline`、用 `Transform` 写"大文件逐行 JSON 解析器"，并用 `process.memoryUsage()` **实测**内存占用对比
2. （如果今天有顺延）先把欠账清掉

## 代码 / 命令备忘

```powershell
# ① 轮转复习
node week1-language/recall-verify.js
node week1-language/recall-verify.js <模块名>

# ② 零提示题
node week2-runtime/day10-zerohint-04.js
node --test week2-runtime/day10-zerohint-04-verify.js

# ⑤ 主线
node week2-runtime/day10-dir-size.js .
node week2-runtime/day10-dir-size.js . --top=3
node week2-runtime/day10-dir-size.js 不存在的目录

# ⑥ 判据
node --test week2-runtime/day10-dir-size-verify.js

# 收尾
git add -A
git commit -m "day10: fs/promises builtins + dir size report (recursive, --top/--json)"
git push
git status -sb
```
