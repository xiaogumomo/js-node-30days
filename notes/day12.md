# Day 12 — 2026-09-26（周六）

> **状态：待填写**　｜　任务书：[`day12-http-project1.md`](day12-http-project1.md)
> **第 2 周 Day 4**　｜　**接昨天**：Day 11 用"流 + 背压"对付大文件 → **今天起把学过的东西组装成一个真项目**
> **今天的目标**：① 把昨天的 `day11-ndjson.js` **自己写一遍**（判据 10/10）② **项目 1 启动** —— 先写 README，再写出"干跑绝不动文件"的 CLI 骨架
> **⚠️ 昨天有欠账**（主线是 AI 帮写的 + 内存实测没做）→ 见 ①②

## 今日目标

- [ ] ① 清欠账：修 3 处小尾巴 + **合上重写** `day11-ndjson.js`（整读 + 流式）→ 10/10
- [ ] ② 内存实测（整读 vs 流式的 `heapUsed` 峰值）
- [ ] ③ 轮转复习 `curry` + 默写"流式逐行"模式
- [ ] ④ 零提示题第 6 道 `countByExt` + **自写判据**
- [ ] ⑤ 阅读 HTTP（4 行笔记）
- [ ] ⑥ **主线**：项目 1 启动（README + `src/cli.js` 骨架 + 干跑安全）
- [ ] ⑦ 判据 `test/cli.test.js` 跑绿
- [ ] ⑧ 日志 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `week2-runtime/day11-ndjson.js` | 0a：**合上重写**（整读版 + 流式版）| ⬜ |
| `week1-language/recall-curry.js` | 轮转复习：凭记忆重写 | ⬜ |
| `week2-runtime/day12-zerohint-06.js` | 零提示题 `countByExt` | ⬜ |
| `week2-runtime/day12-zerohint-06-verify.js` | **我自己写的判据** | ⬜ |
| `projects/p1-cli-organizer/README.md` | 项目 1 的说明书（**先写它**）| ⬜ |
| `projects/p1-cli-organizer/src/cli.js` | CLI 骨架（`classify` + 干跑）| ⬜ |
| `projects/p1-cli-organizer/test/cli.test.js` | 判据（AI 写）| ⬜ |

---

## ① 清欠账：重写 `day11-ndjson.js`

**先修 3 处小尾巴**

| 项 | 改了吗 |
|---|---|
| 第 19 行 `fileURLToPath` → `file` | ⬜ |
| catch 带上真实原因（`err.code \|\| err.message`）| ⬜ |
| catch 补 `process.exitCode = 1` | ⬜ |

**合上重写**（允许查自己的日志 / MDN / 你以前的 `dirSize`）

| 项 | 记录 |
|---|---|
| 整读版写出来了吗 | 写出来了 |
| 流式版写出来了吗 | 写出来了 |
| 两版输出**一模一样**（对过同一个文件） | 一模一样 |
| 判据结果（目标 10/10） | 第一次9/10 leftover写在循环里面导致增多行数（数据多读）；第二次10/10 |
| **卡在哪一步** | 没有卡住，只是回想耗时 |
| 昨天"我不会流式处理"，今天这一遍的感觉 | 框架、拼接、边界我都会，错的是"一块 vs 一整份"这个位置感。 |

---

## ② 内存实测

| | 峰值 `heapUsed` | 备注 |
|---|---|---|
| 整读版 |  | 整读版:{"lines":200000,"ok":200000,"bad":0,"bytes":22666670}；峰值≈18.2MB (起跑5.0->涨13.2) |
| 流式版 |  | 流式版:{"lines":200000,"ok":200000,"bad":0,"bytes":22666670}；峰值≈7.0MB (起跑5.0->涨2.0) |
| 大文件怎么造的（多少 MB / 多少行） | —— | 文件大小： 21.6 MB/200000行 |
| 起跑时的 `heapUsed` | （参考量级：13.1MB 文件 → 整读 22.8MB / 流式 8.3MB） | 21.6MB文件->整读版：峰值≈18.2MB 流式：峰值≈7.0MB |

**一句话结论**（整读和流式差在哪、为什么）：
差在文件读取的方式。因为整读是直接把一本书拿出来，然后处理数据; 流式是一本书的一页一页开始翻，像水管一样一段一段流，数据是一段一段处理的
---

## ③ 轮转复习 `curry` + 默写

| 模块 | 结果 | 卡在哪 |
|---|---|---|
| curry |  | 6/6全绿；没有 |

**默写"流式逐行"模式**（写在纸上，然后抄进这里）：
const readstream = fs.createReadStream(file,{'encoding:utf-8'});
let leftover = "";
for await (const chunk of readstream){
    let text = leftover + chunk ;
    parts = text.split('\n');
    leftover = parts.pop();
    try{

    }catch{
        
    }
    
}
if(leftover.trim ()!== ''){
    try{
        JSON.parse(leftover);//字符串转JSON值
    }catch{
        
    }
}
```
（for await … / leftover / 切行 / 残行 …）
```

**默出来了吗**：⬜ 全对 ／ ⬜ 有卡住的地方：
有卡住的地方：忘记encoding该怎么拼了
---

## ④ 零提示题第 6 道：`countByExt`

| 项 | 记录 |
|---|---|
| 用了几分钟 | 30分钟 |
| 做出来了吗（五行验收表逐条对） | 做出来了 |
| **判据是我自己写的吗** | 是我自己写的 |
| **有没有"先故意让它红一次"**（改实现，不是改期望值） | 改了 result[key] = result[key]??0+1 ;（删除括号），红了 ✖ 测试['a.js','b.js','c.txt']是否可行 和 ✖ 测试没有扩展名的（'README' / 'Makefile'）是否可行 |
| **卡在哪一步** | 不会使用path.extname只能靠普通的if和for |
---

## ⑤ 阅读笔记（4 行）

1. HTTP 的"请求-响应"一句话说清：
由客户端发出请求，服务器接受请求后响应，一问一答。这种形式靠的是HTTP协议规定的消息格式。
2. 报文分几段（起始行 / 头 / 空行 / 体）：
起始行（描述响应的请求或响应的状态） 标头（请求头） 空行（分隔符） 主体（真正要传输的内容）
3. 状态码分类 + 4 个例子（200 / 301 / 404 / 500）：
100-199 信息响应
200-299 成功响应
300-399 重定向
400-499 客户端错误
500-599 服务器错误
200 ok 最标准的成功响应
201 Created 请求成功 并且创建了新资源 
301 Moved Permanently 资源永远移动到新位置 游览器会永远记住并自动跳转
404 Not Found 请求的资源不存在。最常见的原因是URL写错了
500 Internal Server Error 服务器内部错误
4. `http.createServer` 最小例子（抄一遍）：
const http = require("node:http");
const hostname = '127.0.0.1';
const port = 3000;
const server = http .createServer((req,res)=>{
    res.statusCode = 200 ;
    res.setHeader("Content-Type","text/plain");
    res.end("Hello,world!\n");
});
server.listen(port,hostname,()=>{
    console.log(`Server running at http://${hostname}:${port}/`);
});
---

## ⑥ 主线：项目 1 启动

**README（先写）**

| 五块 | 写了吗 |
|---|---|
| 一句话简介 + 怎么跑 | 对吖 |
| **分类规则表** | ✅️ |
| 设计说明（为什么默认干跑 / 为什么用表 / 为什么异步）| ✅️ |
| 已知限制（`--apply` 未实现 / 符号链接 / 同名冲突 / 进度显示）| ✅️ |

**`src/cli.js`**

| 项 | 记录 |
|---|---|
| `classify` 对 6 个名字给对分类 | |
| 干跑能打印计划 + 汇总 | |
| `--verbose` | |
| `--target`（只显示）| |
| **`--apply` 不动文件**（今天的安全底线）| |
| 目录不存在时友好报错 | |
| 空目录 → 汇总 0 | |
| **今天最卡的一处** | |
| **放宽/绕过的地方**（有就写，说明为什么）| |

**干跑实测输出（贴一次真实运行结果）**：

```
（把 `node projects/p1-cli-organizer/src/cli.js .` 的输出贴在这里）
```

---

## 学会了什么

1.readline.createInterface({
    input : readstream.
    crlfDelay : Infinity,
});
功能 用readline创造一个按行读的接口，输入源是文件流readstream，换行兼容用infinity
2.realine.question(query,callback) query为显示的问题，callback为用户输入后按回车返回callback，callback的类型为string。

3.fs.createReadStream(...)一点点读取文件
fs.createWriteStream(...)一点点写文件
fs.createWriteStream中end()必须调用，不然流不会就结束
'finish'事件表示所有数据已经写完
'error'一定要监听，不然出错会让程序崩溃
fs.createWriteStream(path,[,options])  path 需要写入哪个文件
options 可选的对象


4.Math.ceil向上取整 Math.ceil(4.1)=5 
Math.floor 向下取整 Math.floor(4.9)=4
Math.random() 随机生成[0,1)的随机数

5.toISOString();生成新的转化成ISO格式的字符串

6.JSON.stringify(value,replacer,space)
value undefined、函数、Symbol不能传 ： 单独传会直接返回undefined，
对象传会被忽略  数组传会返回null
传BigInt会报错
传NaN 和 Infinity 变成 null

replacer 的作用过滤或修改属性，里面写数组则保留哪些，里面写函数则自己写判断
space作用 传入数字或字符串 来缩进（字符串前面按空格） 主要是美化


JSON.parse(text ，reviver) text必须是严格的字符串JSON形式(字符串必须用双引号，属性名也要用双引号，不能有注释，不能有尾随逗号，不能有undefined，函数,NaN，Infinity，BigInt) 
reviver 可选项，   **作用** 是否需要处理一下text然后返回


7.HTTP是一问一答的模型，客户端（游览器）发出请求，服务器收到请求并发出响应，客户端问，服务器答一问一答靠的是HTTP协议规定的消息格式.

8.一个网页靠的是多次请求、多次资源拼起来的

9.服务器不一定只有一台，客户端感知不到这些内部结构

10 代理是客户端和服务器之间的“中间人”
代理像快递中转站，它可能打开看看、缓存一份、或者转发到正确的目的地。

11.HTTP的性质
①简约的  HTTP人类能看懂
②可扩展的  HTTP标头是HTTP的万能插槽 ，缓存控制、认证、Cookie、跨域策略等等，全都是通过标头实现的。
③HTTP是无状态的。服务器天生脸盲，不知道每次请求是陌生人
利用HTTP标头的扩展性Cookie 让每次请求都能携带上下文信息，从而创造会话
Cookie是会员卡，HTTP通过Cookie知道你之前干了什么

12
HTTP与连接  HTTP本身不管理连接，连接是由底层TCP负责的
版本演进的核心目标是更快、更省、更可靠

13HTTP能控制什么？
HTTP能控制缓存
同源限制的放宽：通过HTTP标头能允许网站跨域访问
认证：通过www-Authenticate等标头保护界面，或用Cookie设置会话.
代理和隧道：通过代理服务器越过网络屏障
会话：用Cookie把多个请求关联起来。
这些都是标头实现的。标头是HTTP的控制器。

14.HTTP
方法+路径+版本是请求"三件套"，版本+状态码（请求成功还是失败）+状态信息（状态码的简短复述）是响应三件套

15.请求的完整流程：发TCP 发请求 收响应 关闭或者复用连接

16.消息分为四个部分  
①起始行  方法  请求目标（要操作的资源路径） HTTP版本
请求目标的四种形式：
原始形式/index.html?page=1 一个绝对路径+可选的查询字符串
绝对形式 完整URL 主要在使用代理时用
authority 域名 ： 端口号  例子： www.example.com:443
星号形式   就只是有一个 *号     例子 ：  OPTIIONS * HTTP/1.1

② 请求标头  结构 ：不区分大小写的字符串+ 冒号 +值
整个标头占一行
通用标头  适用于整个消息    例子： Via
请求标头  修改请求提供更多上下文   例子： User-Agent
表示标头  描述主题数据的格式和标码（仅有主体时存在） 例子：  Content-Type 


③主体
不是所有请求都要主体
**获取资源的请求****不需要**主体

**发送数据的请求**通常**有**主体


17.HTTP响应
①起始行（状态行）  协议版本+状态码（三位数字表示请求成功还是失败）+状态文本（帮助人理解）  例子 HTTP/1.1 404 NOT Found
②标头
响应的标头结构跟请求相同
通用标头   适用于整个消息   例子 via
响应标头   提供关于服务器的额外信息  例子 Vary Accept-Ranges
表示标头   描述主体数据的格式和编码（仅在有主体时存在）  Content-Type

③主体
不是所有响应都有主体
201（Created）或204（No Content）的响应通常没有主体
分为三类
已知长度的单一资源主体  content-Type 和Content-Length定义
未知长度的单一资源主体：通过Transfer-Encoding:chunked使用分块编码
多资源主体：由多部分组成，比较少见

18
为什么要HTTP/2帧？

**HTTP/1.x**的**缺点**明显：标头不会压缩，两个消息之间的标头通常非常相似会导致连接的重复传输  无法多路复用

HTTP/2作用是将HTTP/1.x消息分成帧，嵌入到流（stream）
数据帧与标头帧分离 导致可以让标头压缩
多个流组在一起，导致可以多路复用

19.状态码本质 三位数字 告诉你请求的结果
100-199 信息响应 请求收到了
200-299 成功响应 请求成功了
300-399 重定向   还需要再做一部才能完成
400-499 客户端错误  你发来的请求有问题
500-599 服务器错误  我这边处理出问题了


100 continue   服务器告诉客户端我收到请求的开头了，你可以继续发剩余部分
通常发大请求之前问客户端愿不愿意接收
101 Switching Protocols 客户端要求升级协议时，服务器同意并切换
必须掌握：
200 ok   最标准的成功响应。  GET表示资源已返回  POST/PUT表示操作结果在响应体中
201 Created 请求成功，并且创建了新资源 。通常在POST请求后返回。
204 No Content  请求成功，但没有响应体 常用于DELETE操作成功后，服务器不需要返回任何内容
了解即可：
202 Accepted 请求收到但尚未处理，用于异步或批处理场景
206 Partial Content 部分内容 用于断点续传或范围请求
必须掌握：
301 Moved Permanently ：资源永久移动到新位置 包含Location标头指明新URL
302 Found 临时重定向 资源暂时在新位置 与301区别 游览器不会永远记住这个跳转
304 NOT Modified 资源没有变化，可以直接使用游览器缓存，这个状态码是缓存优化的核心
了解即可；
303 See Other 客户端应该用GET方法去获取另外一个URL
307 Temporary Redurect ： 临时重定向 但**不允许**把POR改成GET
注：302在实际使用中游览器可能把POST改成GET，307明确不允许

必须掌握：
400 Bad Request 客户端请求有语法错误，服务器无法理解 比如格式错误的JSON
401 Unauthorized 未认证     请求没有提供有效的身份凭证或凭证无效。必须配合
www-Authenticate标头一起使用
403 Forbidden  已认证但无权限 收到请求但拒绝提供服务
404 NOT Found 请求的资源不存在 最常见的是URL写错了

了解即可
405 Method Not Allowed 请求方法不被允许 
408 Request Timeout  服务器等待客户端发送请求超时

必须掌握
500 Internal Server Error 服务器内部错误 这是一个兜底状态码
表示服务器遇到了不可预期的错误，无法完成请求
502 Bad Geteway  网关或代理服务器从上游服务器收到了无效响应。通常说明后端服务挂了或没有正确响应
503 Service Unavailable  服务器暂时无法处理请求 通常是因为维护或过载
临时的

了解即可 
504 Gateway Timeout 网关等待上游服务器响应超时





---

## AI 复核（① 重写的核对 —— 这一段是 AI 补的，不是学生写的）

**他自述"两种方法全绿"。AI 核实的结果：一半对、一半只在"单块小文件"上对；而且交上来的文件现在跑不起来。**

### 1. 提交状态：文件当前**不可运行**
两版都被注释掉了，活着的只有 3 行 `require` + `if (require.main === module) main()` + `module.exports = { summarize }` →
`ReferenceError: summarize is not defined`（require 时就炸）→ 判据 `pass=1 / fail=1 / skipped=7`。
**（推论：他是靠"切换注释"分别跑两版验证的，但最后把**两版都**注释掉了。）**

### 2. 整读版 ✅ 对的
`stat.size` 取字节、`readFile(file,'utf-8')`、`split('\n')`、空行 `trim()` 跳过、`try/catch` 计数、`bad = lines - ok` —— 逻辑与契约一致。

### 3. 流式版 ⚠️ **单块对、多块错**（AI 实测）
| 文件 | 结果 | 期望 |
|---|---|---|
| 小文件（36 字节，**1 块**）| `{lines:4, ok:3, bad:1}` | 同左 ✅ |
| 大文件（1.11MB，**多块**）| `{lines:120014, ok:90003, bad:30011}` | `{lines:120000, ok:90000, bad:30000}` ❌ **多算 14 行** |

**根因（一句话）**：`if (leftover.trim() !== "") { lines++ ... }` 这一块**缩进在 `for await (const chunk ...)` 循环【里面】**（8 空格）→ **每收到一块**就把"这一块的半截行"当成一整行计数并解析。它必须在**循环外面**，整份文件只处理一次。
**为什么小文件看不出来**：小文件只有一块 → 块尾就是文件尾 → 位置放错也恰好只执行一次。**这就是"小文件全绿"骗过他的地方。**

### 4. ⚠️ 判据的盲区（AI 的错，已补）
原 fixture 只有 101 字节 = **单块** → **根本考不出**上面那个 bug；判据当时给了 9/9（9 条）却漏掉一个真错。
→ 新增 **08「大文件（多块）也要数对」**（fixture > 64KB，会被切成多块）。
→ **而且新 fixture 我第一版也写错了**：每行定长 37 字节、块边界恰好落在换行上 → 每块 `leftover` 都是空的 → 依然考不出来（实测 3 块全对）。改成**行长不等**（`{"id":N,"pad":"..."}`，pad 长度随 i 变）才真正考出来。
→ **判据现在会自检它的 fixture**：先确认"块尾确实出现过半截行"，否则报"这份 fixture 有问题，换一份再来考"。
→ 实测：正确写法（残行处理在循环外）**08 绿**；他的写法 **08 红**，诊断直接点名"残行处理写在了 chunk 循环里面 → 每块多一笔"。

### 5. 记账（准确版）
**今天这份是他自己重写的**（不是 AI 给的）：两版结构、整读版逻辑、流式的 `leftover + chunk` 与 `parts.pop()` 都对；**唯一错的是"残行处理的位置"**。记账写成：
> **"Day 12 的 `day11-ndjson.js` 是我自己重写的；单块小文件两种写法都过，多块大文件上我把残行处理放在了 chunk 循环里 → 多算（判据 08 抓到）。"**

⚠️ **但别再说"我不会流式处理"这种一刀切的话** —— 昨天那句我照录了；今天这一遍证明**框架、拼接、边界你都写对了**，错的只是"一块 vs 一整份"的位置感。**这条比昨天那句准确。**

### 6. 要他改的两件事
1. **把文件改回"能跑"**：留**一个** `summarize` 活着（建议流式版）；整读版**改名 `summarizeWhole`** → 两个都能 require，② 的内存实测正好各跑一次。（**同名会互相覆盖**，Day 7 踩过。）
2. **`leftover` 那块从 `for await` 里挪到外面**（整份文件只处理一次）。
然后 `node --test week2-runtime/day11-ndjson-verify.js` → **目标 10/10**（9 条必过 + 1 条探针）。

### ② 内存实测脚本（AI 复核，9/26）

**他把脚本拆成 `week2-runtime/day11-make-big.js` 后，库文件 `day11-ndjson.js` 判据回到 `pass=10 / fail=0` ✅** —— ①里那处修改立住了。

**脚本报错（他报的"第 6 行"）真相**：`ERR_AMBIGUOUS_MODULE_SYNTAX`。**错误指着第 6 行的 `require`，真因在第 39 行的顶层 `await`**（Node 先按 CJS 解析失败 → 回退当 ESM 再试 → ESM 里没有 `require`，于是报错落在 require 那行）。**判读口诀：先看错误名，别信行号。**
**修法**：把顶层那几行包进 `async function main(){…}` 再 `main();`（Node 的报错原文里就写着这句："wrap await in an async function"）。**这个坑 9/20–21 在 `day07-promise.js` 出现过一次**（当时只记在 AI 的长期档案里、**没落进项目文档**）→ 现已补进 `notes/HANDOFF.md` §三 薄弱点表（连同"`await` 漏写"那一条）。

**脚本里另有 5 处**（AI 逐行清单）：① 第 293 行 `createlargeNDJSON` 少一个大写 `L`（真名 `createLargeNDJSON`）② 第 280 行 `ws.write(obj)` 要写**字符串** `line` ③ 第 283/285 行 `ws.end()` 与 `await finished(ws)` **写在 `for` 里**（第二次 `write` 会报 `ERR_STREAM_WRITE_AFTER_END`）④ 第 275 行 `Math.floor()` 不传参 = `NaN`（JSON 里静默变 `null`）⑤ 第 39 行 `summarize` **没导入**、且第 36 行 `createLargeNDJSON(file)` **漏 `await`**（造文件和测量会并发跑）。另：第 11 行默认 `totalLines=20000` → 任务书要 **20 万**。

### ③ 轮转复习 `curry` ✅ / ④ 零提示题 `countByExt`（AI 复核，9/26）

- **`curry` 6/6 全绿 ✅**（`node week1-language/recall-verify.js curry`）。他还在草稿里把忘过的那句用注释标了出来（"忘了的部分：用什么方式分开数组含数组的形式"）—— 那次是靠 `arg.concat(args)` 解决的，**这次取出来了**。
- **`countByExt` 的判据 5/5 绿，但那是"例子级"的绿** —— 他的实现有**两类根因**：
  1. **硬编码**：`if (paths[i]=="README"||paths[i]=='Makefile')` → 只会认题目里这两个；**换成 `LICENSE` / `Dockerfile` / `sub/a` 就变 `{'.undefined':1}`**（`split('.')[1]` 拿到 `undefined`）。
  2. **`split('.')` + `arg[1]`**：只看第 2 段 → `'archive.tar.gz'` 给 `.tar`（应 `.gz`）、`'dir.x/a.js'` 给 `.x/a`（应 `.js`）、`'.gitignore'` 给 `.gitignore`（**`path.extname` 给 `''`**）。
  **他的 5 条判据全部由题目里的例子构成**（`a.js`/`README`/`Makefile`），所以**抓不到这两类** —— 和 Day 10 那次"`recentFiles` 克隆"、`groupBy` 的"期望值照着实现写"是**同一族：照例子/照实现，而不是照规则**。
- **⚠️ 这题正好是"检索失败"的典型**：`path.extname` 他 **Day 10 自己记过**（`notes/day10.md`「学会了什么」第 9 条："返回路径的扩展名包括`.`；如果 path 为目录路径则返回 `''`"）→ **材料在、取不出来** → 按规矩：**不讲概念、不给代码，只指路 + 要求"合上重写第二遍"**。
- **给下一位会话的判据口径**：这一题的验收要加**规则级例子**（`LICENSE` / `Dockerfile` / `archive.tar.gz` / `dir.x/a.js` / `.gitignore` / `sub/a`），否则"硬编码 + split"能拿满分。
- **✅ 第二遍（他看完自己 Day 10 的笔记后做的）：`path.extname` 替换成功、判据 6/6 绿**，AI 复核规则级例子**全部通过**（`['LICENSE']→{'':1}`、`['Dockerfile']→{'':1}`、`['sub/a']→{'':1}`、`['archive.tar.gz']→{'.gz':1}`、`['dir.x/a.js']→{'.js':1}`、`['.gitignore']→{'':1}`、大小写原样、空数组、原数组没改）→ **现在是"照规则"的实现，不是"照例子"的了** ✅
  ⚠️ **但他只补了 1 条规则级判据**（`.gitignore`）—— 今天够用，但**作为回归防线太薄**：以后若有人改回 `split` 版，`LICENSE` / `archive.tar.gz` / `dir.x/a.js` 仍会漏过判据。**建议再补 3 行**（这也正是"判据要覆盖规则"那课的收尾动作）。

**AI 实测的内存数字（供对照，他自己的数字才要填进日志）**：同一份 **21.6MB / 20 万行**、两个版本各起独立进程 —— 整读版峰值 `heapUsed` **21.9MB**（起跑 11.0 → 涨 10.8）、流式版 **6.9MB**（起跑 4.9 → 涨 2.0）；**两版结果完全一致**（`{lines:200000, ok:200000, bad:0, bytes:22666670}`）。`heapUsed` 是每 5ms 采样的峰值、会有波动 —— **看量级关系，别看小数点**。

**⚠️ 他第一次跑出来的数字是反的**（流式 **82.4MB** > 整读 21.8MB，且流式"起跑 70.8MB"）—— **根因不是实现，是测量方法**：
**两个版本挤在同一个进程里连续量** → 第一个跑完的垃圾**还没被 GC 回收**，第二个的"起跑"就带着它 → 结论完全反过来。
**AI 复现**（同一份 7.8MB / 8 万行文件）：
| 量法 | 整读版 | 流式版 |
|---|---|---|
| 同一进程连续量（他的）| 峰值 11.8MB（起跑 8.7 → 涨 3.1）| 峰值 **34.4MB**（起跑 **25.9** → 涨 8.5）← 反了 |
| 分开两个进程 | 峰值 8.5MB（起跑 4.8 → 涨 3.8）| 峰值 **6.3MB**（起跑 4.8 → 涨 1.5）✅ |

**规矩：量内存必须"一个版本一个进程"**（或 `node --expose-gc` + 每次测量前 `global.gc()`）。**看"起跑"那一列就能判断有没有被污染**（正常的起跑是几 MB）。

---

## 卡在哪里

1.

---

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| （没欠账就写"无"） | |

## 明天第一件事

1. **Day 13（9/27 日）= 网络请求与并发**：`fetch`（undici）、超时、`AbortController`、重试策略（指数退避）、并发控制 → **裸写 `p-limit`（并发池）** + 给 `fetch` 加超时 + 自动重试 + 日志封装
2. （如果今天有顺延）先把欠账清掉

## 代码 / 命令备忘

```powershell
# ① 清欠账（重写后跑绿）
node --test week2-runtime/day11-ndjson-verify.js

# ③ 轮转复习
node week1-language/recall-verify.js
node week1-language/recall-verify.js curry

# ④ 零提示题
node --test week2-runtime/day12-zerohint-06-verify.js

# ⑥ 主线
node projects/p1-cli-organizer/src/cli.js .
node projects/p1-cli-organizer/src/cli.js . --verbose
node projects/p1-cli-organizer/src/cli.js 不存在的目录
node projects/p1-cli-organizer/src/cli.js . --apply

# ⑦ 判据
node --test projects/p1-cli-organizer/test/cli.test.js

# 收尾
git add -A
git commit -m "day12: http basics + project 1 kickoff (cli skeleton, dry-run safe, README first)"
git push
git status -sb
```
