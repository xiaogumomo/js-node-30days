# Day 13 — 2026-09-27（周日）

> **状态：待填写**　｜　任务书：[`day13-network-concurrency.md`](day13-network-concurrency.md)
> **第 2 周 Day 5**　｜　**接昨天**：README 里写了"为什么用异步 API" → 今天第一次真的**并发**做事（同时最多几个 / 超时 / 重试）
> **今天的目标**：① 清掉 Day 12 尾巴（`cli.js` + 提交）② 裸写**并发池** `pLimit(n)` ③ 给 `fetch` 加**超时 + 重试**
> **⚠️ 昨天还差最后一件**（`src/cli.js` 没写 + 没提交）→ 见 ①

## 今日目标

- [×] ① 清 Day 12 尾巴：`src/cli.js`（判据 9/9）+ README 5 处小改 + Day 12 日志 + **commit + push**
- [×] ② 轮转复习 `deepClone`
- [×] ③ 零提示题第 7 道 `once` + **自写判据**
- [×] ④ 阅读：`fetch` 的坑 / `AbortController` / `AbortSignal.timeout` / 指数退避
- [×] ⑤ **主线 A**：`day13-p-limit.js`（并发池）
- [×] ⑥ 主线 B：`day13-fetch.js`（超时 + 重试）
- [×] ⑦ 两份判据跑绿
- [×] ⑧ 日志 + commit + push

## 今日产出
| 文件 | 内容 | 状态 |
|---|---|---|
| `projects/p1-cli-organizer/src/cli.js` | 0a：`classify` + `main`（干跑安全）| ✅️ |
| `projects/p1-cli-organizer/README.md` | 0b：5 处小改 | ✅️ |
| `week1-language/recall-deepClone.js` | 轮转复习：凭记忆重写 | ✅️ |
| `week2-runtime/day13-zerohint-07.js` | 零提示题 `once` | ✅️ |
| `week2-runtime/day13-zerohint-07-verify.js` | **我自己写的判据** | ✅️ |
| `week2-runtime/day13-p-limit.js` | 并发池（主线 A）| ✅️|
| `week2-runtime/day13-fetch.js` | fetch 超时 + 重试（主线 B）| ✅️ |
| `week2-runtime/day13-p-limit-verify.js` | 判据（AI 写）| ✅️|
| `week2-runtime/day13-fetch-verify.js` | 判据（AI 写，会起本地 http server）|✅️ |

---

## ① 清 Day 12 尾巴

**0a `src/cli.js`**

| 项 | 记录 |
|---|---|
| 用表还是用四数组 + if？（最后选了哪个） | |选择直接一个对象表加for
| `classify` 一次跑绿，还是错在哪几个样本 | | 错在理解，遍历是在main（）而classify的作用仅仅是分类其中一个
| 判据结果（目标 9/9） | | 改了5到6次最后ai指出准确修改建议才9/9
| 汇总格式对不对（`共 N 个文件：images X、docs Y、videos Z、others W`）| |改了几次之后终于格式对了。一个问题是sorts中的后缀名判断中含有空格导致一直判断不成功 二是忘记获取数据的方式（readair+函数内path.join递归）三十不懂ai究竟让我怎么用for列出它所期望的，好在它列出代码我也看懂了是返回的files数组然后遍历打印
| 干跑/`--apply` 有没有动文件（判据 02/03）| | 没有动文件
| **卡在哪一处**（桥出来想 == 写下去不一样的地方）| |

**0b README 5 处小改**

| # | 改了吗 |
|---|---|
| 表格 `videos` 行补收尾 `\|`（工具点名第 22 行）| ✅️ |
| `readir` → `readdir` | ✅️ |
| `如何文件` → `任何` | ✅️ |
| 把"流式"从「为什么用异步 API」里删掉（异步 ≠ 流式）|✅️ |
| 已知限制写"递归" → 代码真的递归了吗 | ✅️ |

**Day 12 的日志 ⑥⑦⑧ 补完了吗 + 提交**

```powershell
git log --oneline -1     # 贴在这里（应该不再是 f6e6851）
git status -sb           # 贴在这里
```

---

## ② 轮转复习：`deepClone`

| 模块 | 结果 | 卡在哪 |
|---|---|---|
| deepClone | 自己修改后4/4全绿 | 没有卡在哪里 |
**这次的坑**（`typeof` 大小写？循环引用？）：
typeof 大小写又写大写了 循环没有问题，又出现了理解上的疑惑result[key] = deepClone(x[key]) 写成result[key] = deepClone(result[key]),已想通

---

## ③ 零提示题第 7 道：`once`

| 项 | 记录 |
|---|---|
| 用了几分钟 | | 10分钟
| 做出来了吗 | |没有做出来，靠ai辅助
| **判据是我自己写的吗** | |是我自己写的
| **有没有"先故意让它红一次"** | | 有
| `g` 抛错时算不算"执行过"（我定的 + 为什么）| 算执行过了，进入function已经让函数记住called=true 和result了，那么result之后会一直返回undefined | 
| 参数 / `this` 透传我定了什么 | 要透传|
| **卡在哪一步** | 不知道应该靠什么方式阻止后面的参数继续输入，通过问ai我知道了，需要设置一个像“called”的布尔类型开关通过判断语句来阻止输入，通过像result来返回第一次执行的结果|

---

## ④ 阅读笔记（4 行）

1. `fetch` 在什么情况下才 **reject**（服务器返 404/500 时呢？）：
fetch中只有在网络错误的时候才会reject 服务返404/500时也不会reject
2. 怎么把 `AbortController` 接到 `fetch`；`abort()` 之后抛的错 `err.name` 是什么：名为AbortError的DOMException
3. `AbortSignal.timeout(ms)` 能不能一行做超时： 可以
4. 指数退避为什么要"等一会儿 + 翻倍"：
因为指数退避解决的是“重试风暴”的问题，为了避免让服务器已经过载的时候继续施加压力。

---

## ⑤ 主线 A：`day13-p-limit.js`

| 项 | 记录 |
|---|---|
| 最小版（一次只跑一个、按顺序出结果）|实现（ai帮我完成的） |
| 放开到"最多 n 个同时" | 实现（ai帮我完成的）|
| **最大同时数 ≤ n**（判据会查这个数）|实现（ai帮我完成的） |
| 结果顺序 = 传入顺序 |实现（ai帮我完成的） |
| **失败隔离**（一个失败不影响其他）| 实现（ai帮我完成的）|
| 排队不丢（超过 n 的确实都跑了）|实现（ai帮我完成的） |
| `n` 非法时我定的行为 + 为什么 |直接抛错，因为除了正整数外的根本没有意义 |
| **今天最卡的一处** |promise怎么实现完成一个任务之后再进行一个任务=>递归 |
| **放宽/绕过的地方**（有就写，说明为什么）|无 |

**实测输出（贴一次真实的）**：
✔ 00 模块能被 require，并导出 pLimit 函数 (1.3373ms)
✔ 01 pLimit(n) 返回函数；limit(taskFn) 返回 Promise（结果是 taskFn 的返回值） (0.4746ms)
✔ 02 同时最多 n 个（n=2 时 peak 必须正好是 2） (62.8565ms)
✔ 03 失败隔离：第 3 个任务失败，其他任务照样跑完 (45.8967ms)
✔ 04 排队不丢：超过 n 的任务都会被执行（10 个任务、n=3） (61.4567ms)
✔ 05 一个 limit 里混着"快慢不一样"的任务，也不会超过 n (92.3647ms)
✔ 06 模块能被 require 而没有副作用（不打印、不执行任务） (0.1947ms)

探针（只记录，不判错）：
  · pLimit(0) → 抛错：concurrency必须为正整数
  · pLimit(-1) → 抛错：concurrency必须为正整数
  · pLimit(1.5) → 抛错：concurrency必须为正整数
  · pLimit("2") → 抛错：concurrency必须为正整数
  · 4 个任务的耗时是 [60,40,20,1]ms（完成顺序会是 3,2,1,0）
    而 Promise.all 收上来的结果 = [0,1,2,3] ← 始终是【传入顺序】
  （所以"结果顺序"不用你操心：**Promise.all 按传入顺序收**；你只管并发和排队）
  （探针不判错：非法 n 是设计选择，记进日志就行）

✔ P 探针：非法 n / 完成顺序 vs 结果顺序（只记录，不判错） (62.6507ms)

判据覆盖面：00–06 共 7 条必过 + P 探针 1 条 = 本文件 8 条 test()。
（报绿之前看一眼上面的 pass 数：大半是 skipped、pass 只有个位数，那不是绿，是没跑起来。） 

```
（贴 `node --test week2-runtime/day13-p-limit-verify.js` 的结果，或你自己写的小 demo 输出）
```

---

## ⑥ 主线 B：`day13-fetch.js`

| 项 | 记录 |
|---|---|
| 200 → 不重试 | 实现（ai帮我完成的）|
| 500 → 重试到位（请求次数 = retries + 1）| 实现（ai帮我完成的）|
| 服务器不响应 → `timeoutMs` 后放弃 | |实现（ai帮我完成的）
| 前几次失败、后来成功 | 实现（ai帮我完成的）|
| 全失败 → 抛错（不是吞掉）|实现（ai帮我完成的） |
| 退避有没有真的等 | 实现（ai帮我完成的）|

---

## 学会了什么

1. 如何让函数只执行一次，安装执行一次装饰器once（）once设置一个控制函数执行的开关变量called和储存第一次执行结果的result

2.fetch()的基本用法 fetch(url，init)url发送一次GET请求返回一个Promise，resolve后得到Response对象
init 配置method 、 headers 、body 等
响应体解析方法esponse.json()、response.text()、response.blob()、response.formData()  这些方法也返回的是Promise 需要二次.then 或await

3. fetch的Promise行为
fetch中Promise只有在**网络故障时候**才返回**reject**，HTTP码404、500等错误不会导致Promise reject 
必须手动检查response.ok (等价response.status >= 200 && response.status < 300) 来判断请求是否成功
在**catch**中能捕获到的**错误类型**：TyepError （网络错误或CORS问题）
AbortError（请求被取消）

4. init 常用配置项的含义
method GET/POST/PUT/DELETE 请求方法
headers  {'Content-Type':'application/json'} 请求头
body   JSON.stringify(data)   请求体（POST/PUT 时使用）
mode   cors / no-cors / same-origin  跨域模式
credentials include/same-origin/omit  是否携带Cookie
cache    default /no -cache/reload  缓存策略
signal   AbortSignal 实例       用于取消请求
 默认credentials 为 same-origin  跨域携带Cookie 需显示设置credentials:'include'

5. Response 对象的关键属性
response.ok：布尔值，HTTP 状态码是否在 200-299 范围内

response.status：HTTP 状态码（如 200、404、500）

response.statusText：状态码对应的文本描述

response.headers：响应头（Headers 对象，注意 get() 方法获取）

6. “如果 fetch 不会因 404 reject，你怎么处理？”

网络层错误：由 catch 捕获（TypeError）

HTTP 错误：手动检查 response.ok，主动 throw new Error

业务错误：解析响应体后，根据后端返回的 code 或 message 字段判断

超时控制：fetch 本身不支持 timeout，需结合 AbortController 和 setTimeout 实现

7. 取消请求：AbortController

React 组件卸载时防止内存泄漏：
```
const controller = new AbortController();
const signal = controller.signal;

fetch(url, { signal })
  .then(response => response.json())
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('请求已取消');
    }
  });

// 取消请求
controller.abort();
```
在 React 的 useEffect 中使用时，需要在 cleanup 函数中调用 controller.abort()，防止组件卸载后仍在更新状态。

8. CORS 跨域处理
 mode: 'cors' 允许遵守 CORS 的跨源请求（非简单请求需预检）
 mode: 'no-cors'  于简单请求（如图片等静态资源），但响应为 opaque 类型，无法访问数据


9.  Fetch vs Axios 对比（面试高频）
 对比维度	Fetch	Axios
来源	浏览器原生 API	第三方库
JSON 解析	需手动调用 .json()	自动解析
错误处理	仅网络错误 reject	网络错误 + HTTP 错误均 reject
超时	需手动实现	内置 timeout 配置
拦截器	不支持（需封装）	支持请求/响应拦截器
请求取消	AbortController	CancelToken / AbortController
浏览器兼容	现代浏览器原生支持	需引入库，兼容性更广
简单项目或希望减少依赖时用 fetch；复杂项目需要拦截器、超时、自动 JSON 解析时用 Axios

10. 流式响应与 ReadableStream（AI 应用相关加分项）
近年面试中，尤其涉及 AI 对话类项目，会考察流式数据处理能力：

通过 response.body.getReader() 获取 ReadableStream 的读取器

使用 TextDecoder 将二进制 chunk 解码为文本

配合 AbortController 实现用户中断流式输出

需处理粘包/半包问题（chunk 边界不一定是完整消息


11. AbortController  标准的异步任务取消协议
**AbortController**（控制器）**发号施令**，调用 abort() 方法触发取消操作
**AbortSignal**（信号） **负责传递消息**  一个只读对象 被传递给具体的异步任务
核心设计 **控制与信号的分离**  任务发起时  signal 传给异步 API 让任务监听终止信号 任意时机调用控制器的 abort() 方法即可统一终止所有绑定该信号的任务
任务执行者和任务终止者完全互不感知，彻底解决了传统方案需要透传实例、耦合业务逻辑的问题。
使用 AbortController 取消 fetch 请求的标准步骤为：创建 AbortController 实例 → 获取 signal 属性并传入 fetch 的选项 → 调用 abort() 方法取消请求。

12. AbortController 的 API 表面

controller.signal  AbortSignal（只读） 获取与控制器关联的信号对象
controller.abort(reason?)  方法  触发取消操作，可传入自定义原因


13. AbortSignal 的关键属性和事件
signal.aborted：布尔值，表示信号是否已被中止。初始为 false，调用 abort() 后变为 true
signal.reason：中止原因，默认为一个名为 AbortError 的 DOMException。可以自定义传入原因
signal.addEventListener('abort', callback)：监听中止事件。AbortSignal 继承自 EventTarget，因此支持事件监听。中止事件只会触发一次
```
const controller = new AbortController();
const signal = controller.signal;

signal.addEventListener('abort', () => {
  console.log('信号已中止，aborted:', signal.aborted); // true
});

controller.abort();
```
14. AbortError 的识别
请求被取消   fetch 返回的 Promise  名为 **AbortError** 的 **DOMException** 拒绝
catch 中需要通过 **error.name === 'AbortError'** 来识别取消操作


15. Node.js Fetch 的核心定位
 Undici 驱动  一个专为 Node.js 从零编写的高性能 HTTP/1.1 客户端

这意味着你可以在浏览器代码、Express 后端、Serverless 函数和 CLI 脚本中使用同一套基于 Promise 的 HTTP API，无需安装 node-fetch、axios 或 request

Node.js 环境**缺少**浏览器的 CORS 和 CSP 限制，请求可以发往任意服务器，同时也没有 XMLHttpRequest 的兼容包袱


16. 与浏览器 fetch 相同的要点依然适用：

fetch 返回的 Promise 仅在网络故障时 reject，HTTP 404/500 不会导致 reject，必须手动检查 response.ok

请求体需手动 JSON.stringify()，响应体需手动调用 .json() 解析

POST 请求需在 init 对象中设置 method、headers 和 body

这些与上一轮浏览器 Fetch 的知识点完全一致，在 Node.js 中同样适用


17. “Node.js 从哪个版本开始支持 fetch”

v18 开始默认全局可用，v21 转为稳定
可以通过 process.versions.undici 查看当前 Node 进程内置的 Undici 版本


18. Node.js 为 fetch 提供了一组浏览器兼容的全局类，可以直接使用：

FormData：浏览器兼容的 FormData 实现

File：浏览器兼容的 File 实现

Headers、Request、Response：Fetch 标准中的核心类

AbortController / AbortSignal：与浏览器完全一致的取消信号机制

19. 指数退避
必备配套策略：抖动（Jitter）
Full Jitter  	random(0, base * 2^n)	              随机性最大，AWS 推荐
Equal Jitter	base * 2^n / 2 + random(0, base * 2^n / 2)	保留一半确定性
Decorrelated Jitter	random(base, previous_delay * 3)	基于上次延迟的随机

20. 实践中的抖动比例计算出的退避时间上加上 ±10% 到 ±20% 的随机偏移
 
21. 应该重试的错误（临时性故障）：

网络层：连接重置、DNS 故障、socket 超时

HTTP 5xx：502 Bad Gateway、503 Service Unavailable、504 Gateway Timeout

429 Too Many Requests：速率限制，退避后再来
绝对不要重试的错误（请求本身的问题）：

400 Bad Request：请求格式错误

401 Unauthorized：凭据错误或过期

403 Forbidden：权限不足

422 Unprocessable Entity：验证失败
规则：当故障与服务器状态或网络有关时重试；当故障与请求本身有关时快速失败。

22. 幂等性：重试的前提
重试一个非幂等的请求（比如创建订单、扣款）是极其危险的。如果请求实际上已经成功，但响应超时了，客户端重试会导致重复创建、重复扣款
解决方法
只对幂等方法（GET、HEAD、PUT、DELETE）自动重试

对 POST 请求，使用幂等键（Idempotency Key），服务端通过唯一键去重

一个安全的重试策略应该是：指数退避 + 抖动 + 重试预算 + 幂等前提，四样缺一不可。



23. 尊重 Retry-After 头

对于 429 和 503 响应，服务端可能会在 Retry-After 头中指定建议的等待时间。如果你的退避计算出的时间短于 Retry-After，应该以 Retry-After 为准

24.  设置最大重试次数和退避上限
最大重试次数：建议 3-5 次，超过后让错误透出，不要无限沉默重试

退避上限（Cap）：避免延迟无限增长。例如，设置 30 秒为上限，超过后不再增加

25. 与 AbortController 的结合
在重试逻辑中，必须支持取消。如果用户主动取消了请求，不应该继续重试。同时，每次重试前应该新建一个 AbortController 实例，确保前一次失败的信号不会污染下一次请求


--- 

## AI 复核（① 清尾巴的核对 —— 这一段是 AI 补的，不是学生写的）

**他自述："我不是完全靠自己脑子写的，因为我翻阅了资料（`day10-dir-size.js` 里 `main()` 的写法）。"** → **查自己的历史代码是允许的**（HANDOFF 明写"允许查你自己的日志"），**而且"去找模板"这一步做对了**；问题在**抄完之后没对着契约/判据核对**。

### 1. 文件放错目录（第一件，判据根本找不到它）
他写在 `projects/p1-cli-organizer/test/cli.js` —— 应该在 **`src/cli.js`**（判据里写死的是 `../src/cli.js`）。实测判据输出："还没看到 projects/p1-cli-organizer/src/cli.js"。

### 2. ⚠️ 最大的问题：`classify` 的**职责**混了（实测）
| 契约 | 他写的 |
|---|---|
| `classify('photo.JPG')` → **`'images'`**（一个名字 → 一个分类名字符串）| `classify(['photo.JPG'])` → `{others:['photo.JPG']}`（**一个数组 → 一个分组对象**）|
| 一个名字进，一个字符串出 | `classify('photo.JPG')`（传字符串）→ `{others:['p','h','o','t','o','.','J','P','G']}` ← **把字符串当数组逐字符遍历了** |

→ "扫描目录 + 分组"不是 `classify` 的事，是 `main` 的事（用 `readdir`）。
→ 顺带一个判读点：**传参类型不对时 JS 不报错，而是顺着跑出荒谬结果**（字符串也有 `length` 和 `[i]`）—— 所以这类错**只能靠判据抓**。
→ 分类名还写成 `docx`（契约是 `docs`）。

### 3. 接线错误（AI 逐行，按"死在哪一步"排序）
| # | 位置 | 问题 | 后果 |
|---|---|---|---|
| 1 | 顶部 | **没 require `parseArgs`**（`node:util`）| 💥 实测 `ReferenceError: parseArgs is not defined` |
| 2 | 39–54 | **选项没包在 `options: {}` 里**（`target`/`apply`/`verbose` 直接放在顶层）| **静默**：三个选项全被忽略 → `--target`/`--apply`/`--verbose` 都不生效 |
| 3 | 39 | 解构名 `positional` → 应 `positionals` | `undefined[0]` → TypeError（被 catch 吃掉）|
| 4 | 13–15 | 扩展名数组**带尾随空格**（`.jpg ` / `.png ` / `.pdf ` …）| **静默**：实测 `['.jpg ','.jpeg '].includes('.jpg') === false` → 只有 `.gif`/`.mp4`/`.mov`/`.docx`/`.md` 能命中，其余全落 `others` |
| 5 | 45–48 | `apply` 默认 **`true`**（`verbose` 也是）| 契约要"**默认干跑**"；`--apply` 默认 true = "默认就真移动"。**这次没出事是因为 `apply` 在 main 里从没被用到**（侥幸）|
| 6 | 43 | `target` 默认 `'4'` | 无意义（该"给了才显示"）|
| 7 | 60–63 | `result[images]`（`images` 是**未定义变量**）| ReferenceError → main 从这里就崩（应 `result.images`）|
| 8 | 67 | catch 的模板串整段是**字面文本**，且 `catch` 没写 `(err)` | 打印乱码，看不到真原因 |
| 9 | 64 | 汇总**多了一堆引号** | 输出 `"共" 6"个文件：images" 2"...` → 判据 07 的正则匹配不上 |
| 10 | 23–30 | `groups` 定义在**循环体里**（靠块级函数提升才没炸）| 能跑但极难读；按昨天的设计，表 + 遍历该放**模块级** |
| 11 | main | **没有 `readdir`** / `--verbose` / `--target` / `--apply` 的处理 | 契约 02/03/04/05/07 全缺 |

**结论定性**：**不是"手滑"，是"职责没分清 + 接线没接上"** → 所以不该逐字打补丁，而要**先把 `classify` 按契约重写**（一个名字 → 一个分类名），再补 `main`。**11 处里 8 处是"一跑就现形"的**（`parseArgs is not defined` / `positional` / `result[images]` / 汇总格式…）—— 抄完模板后**跑一次 + 跑判据**，能当场抓掉大部分。

### 第 2 版（他把文件挪到 `src/cli.js` + 补了 `parseArgs` 之后）
**判据实测**：`00 ✅ / 06 ✅`（文件位置对了、导出对了、require 无副作用）、`03 ✅`（**但这是假绿**：它"没动文件"是因为它压根没跑起来）、`01 / 02 / 04 / 05 / 07 ✖`。
**仍存在的问题（AI 逐条）**：
1. `classify` 里 `path.extname(name[i])` → **`i` 未定义** → 实测 `ReferenceError: i is not defined`（从 `main` 搬过来时把 `[i]` 留下了）
2. 表里 `.pdf ` / `.txt ` **仍有尾随空格** → 静默漏
3. `toLocaleLowerCase()` → 应 `toLowerCase()`
4. **`option:` 拼错（应 `options:`）** → 实测：加 `--verbose` 直接抛 `ERR_PARSE_ARGS_UNKNOWN_OPTION: Unknown option '--verbose'`（这回是**响错的**，不是静默）
5. `apply` / `verbose` 默认仍是 `true` → 契约要 `false`（默认干跑）
6. `main` 里 `name` 是**目录字符串**却被当文件数组遍历 → 缺 `readdir`（他说"这块不太会" → 已教：**去他自己 `day10-dir-size.js` 的 `walk` 里看那 4 行**）
7. `result.images.length`：某类为空时是 `undefined` → 崩（应**四键初值 0 的计数对象** —— 就是他 `countByExt` 里那个动作）
8. 汇总行 `${docxs}` 拼错 + 一堆多余引号
9. catch 里 `${dir}` 未定义 → 在 catch 里再抛；`catch` 也没写 `(err)`

**教法（三件"指路到他自己的代码"）**：`readdir` → 他 `day10-dir-size.js` 的 `walk`；计数对象 → 他 `countByExt` 的 `(result[key] ?? 0) + 1`；`--target`/`--verbose`/`--apply` → 新东西，给了各 1–3 行的用法骨架（`if (values.target)`、`if (values.apply) { … return; }`），没写他的 `main`。

### 第 3 版（他按上面的指路又改了一版）→ **AI 给了完整参照版**（走"连续多轮要解决方案 + 明确说想不出来"那条例外）

**他的第 3 版状态**：`classify` **✅ 完全对了**（13 个样本 AI 单独验过全过）、`sorts` 已移到模块级 ✅、`walk` 骨架（`readdir` + `isDirectory/isFile` + `path.join` + `relPath`）**结构对** ✅、`counts` 初值 ✅ —— **每一块都是他写的**。但仍有**一处致命 + 若干接线**：
- 💥 **第 66 行是全角分号 `；`（U+FF1B）** → `SyntaxError: Invalid or unexpected token` → **整份文件连 require 都进不去**（判据 `pass=1 fail=1`，8 条直接跳过）
- `counts[classify(entry[i].name)]`：`entry` 是**单个** Dirent（没有 `[i]`）
- `file.push({entry[i].name : "…"})`：无效的对象字面量（键不能是表达式）
- **定义了 `walk` 但从来没调用** → 一次都没扫
- `if (values.apply) {…return}` **写在循环里**（拿完目录第一件事就该判断，且 `return` 只退出 `walk`）
- `--target`/`--verbose` 用 `else if`（三者不是互斥的：`--target` 加一行、`--verbose` 管"每个文件那一行"、`--apply` 才是提前收工）
- catch 用**单引号**包 `${…}` → 不插值；`${names}` 变量名也对不上（外面叫 `name`）
- **缺"计划"输出 + 汇总**

**AI 的动作（记账）**：给了他**一份完整可跑的实现**（在**他的代码基础上**补接线：`classify`、`sorts`、`walk` 骨架、`counts` 初值**原样保留**）—— AI 实测 **判据 9/9 + 四个探针全对**。**条件**：① 记账（这份 `main` 的接线是 AI 补的）② **直接粘贴判不合格** ③ **要求他合上参照版自己重写一遍**，那一遍才算他的 ④ 抄完先跑一次判据确认 9/9。
**时间账（要记）**：这个 `cli.js` 从 Day 12 拖到今天、来回 3 版，**已经明显超时**；而根因是**"接线"这一族的老问题**（HANDOFF §三 已记：Day 7 五轮、Day 10 两版、今天是第 4 次同族返工）→ **Day 15 复盘要一起算**；今天**不允许**再在这里继续沉没，改完立刻转 `p-limit`。

### 第 4 版（他按第 3 版的逐行表改完）→ **只差 4 行**

他报"02 和 04 还不通过"。**实测发现 02 / 04 / 07 三个红是同一个根因**：

**① `dir` 的作用域（这是主因）**：`const dir = positionals[0] || '.'` 声明在 **`try` 块里面** → **块作用域**，`catch` 是另一个块 → **`catch` 里 `dir` 看不见** → `ReferenceError: dir is not defined` → **catch 自己抛了**（实测报错定位在 `src/cli.js:89` 的 `${dir}`）。后果：
- 02 红（退出码 1 + 没有任何"计划"输出）
- 04 红（打出调用栈 —— 因为 catch 自己崩了）
- 07 红（没有汇总行）
- **05 却过了**（空目录路径压根不进 catch）→ **说明这三个不是三个独立问题**

**② 另外两处（会在"扫到第一个文件"时崩 / 子目录一来就崩）**：
- `path.join(rel.entry.name)` → 应 `path.join(rel, entry.name)`（`rel` 是字符串，没有 `.entry`）
- `files.push({rel: relPth, category: classify(entry[i].name)})` → `relPth` **拼错**（应 `relPath`）+ `entry` **没有 `[i]`**（应 `entry.name`）

**AI 实测**：在**他的文件上只改这 4 行**（把 `dir` 提到 `try` 前 + 那两处）→ **判据 9/9 全绿**，四个探针也全对。
**通用教训（这一族）**：**`catch` 里要用到的变量，必须声明在 `try` 外面** —— 这属于"块作用域/接线"，不是手滑（和 Day 7 的 `p` 写到作用域外同类）。

### ③ 零提示题第 7 道 `once`（AI 复核 + 记账）

**他主动报的账**：**"我是靠 ai 辅助完成的**，因为我关于**执行完成后如何保存数据**的细节／该如何实现还不懂，通过询问之后现在懂了，**需要之后规划上为我记下这一账**。"
**他在日志 ③ 填的"卡在哪一步"很准**："**不知道应该靠什么方式阻止后面的参数继续输入**……通过问 ai 我知道需要设置一个像 `called` 的布尔开关，通过判断语句来阻止，用 `result` 返回第一次执行的结果。"

**实现：✅ 对的**（AI 逐条核）：`called` 标志 + 保存 `result` + `fn.apply(this, args)` 透传；两个设计选择（抛错算不算执行过 / this 与参数透传）**都在注释里写明了**。
**归类：检索失败（不是知识缺口）** —— 他要的那个"**开关**"就是他自己写过的东西：`debounce` 里的 `timer`、`curry` 里的闭包累积参数；**而且今天主线 `p-limit` 的核心正是同一个动作**（闭包记状态 + 队列）→ **不需要额外补课，`p-limit` 就是这道题的第二次练习**。

**⚠️ 他的判据：只有 1 条，而且实测"抓不住坏实现"**（AI 用变体验证）：
| 实现 | f(1) | f(2) | 他的判据结果 |
|---|---|---|---|
| 他的正确版 | 1 | 1 | ✅ 绿 |
| **坏版（每次都真跑 `g`，只是返回第一次的结果）** | 1 | 1 | **✅ 绿（看不出问题！）** |

→ **根因：判据没有"数调用次数"** —— "只执行一次"最直接的证据是 `let calls = 0; …; assert.equal(calls, 1)`，而不是只看"返回值相同"。
→ 另外：注释里声明的两条设计选择（抛错算执行过、this/参数透传）**判据里一条都没有** → 应各补一条（**"注释里写了设计选择，判据里就必须有一条对应它"**）。
→ 建议补到 5 条：① **数调用次数** ② 第二次参数不同也返回第一次的结果 ③ 第一次的 this/参数透传 ④ 抛错的函数按他定的规则（第一次抛错后**不再重试**）⑤ 包一个**返回 `undefined`** 的函数（这条抓的是"用 `result === undefined` 当标志"的写法 —— 他用了 `called` ✅ 所以能过）。

**记账（按他要求记）**：
- 这一道**算"问 AI 得到的"**（日志 ③ 已写"没有做出来，靠 ai 辅助"）✅
- **条件**：要**合上重写一遍**（那一遍才算他的）—— 可今天做（5 分钟），也可顺延；建议**把它当 `p-limit` 的热身**。
- 计划侧：**Day 15 周复盘**把"**怎么用闭包记住状态**"归到「忘了的」清单（该族第 4 次出现：`debounce` 的 `timer` → `curry` 的累积 → `groupBy` 的 `?? []` → 今天的 `called`）。

### ④ ⚠️ 一个假的"9/9"：`cli.js` 不在 `src/` 里（AI 补充，9/27 实测）

> 这一条是 AI 补的（学生当时停在 ④ 阅读，没参与）。写在这里是因为它**推翻了 ①「清 Day 12 尾巴」那一格的结论**。

**现象**：AI 按 HANDOFF 的规矩"重述旧问题前先重跑"，跑 `node --test projects/p1-cli-organizer/test/cli.test.js` → **`pass=1 fail=1 skipped=7`**，红的那条写着"还没看到 `src/cli.js`"。
**根因**：实现躺在 **`projects/p1-cli-organizer/test/cli.js`**（`src/` 是空目录），而判据里写死的是 `../src/cli.js`；那份错位的文件还被 `git add -A` 扫进了 `80ce96e` —— **所以"① 清尾巴"其实只完成了一半**：代码写出来了、判据也**真的绿过**（AI 当时在 `src/` 上验的），但**位置不对，换台机器 `git clone` 下来根本跑不起来**。
**处理**：① 复制回契约位置 `projects/p1-cli-organizer/src/cli.js`（**逐字节同一份**，`cmp` 比对过）→ 判据回到 **9/9** ✅；② 那份错位的移走（内容不会丢：`src/` 里是同一份、git 历史里也有；要取回：`git checkout HEAD -- projects/p1-cli-organizer/test/cli.js`）。
**顺带逮到一条"幽灵测试"**：`test/cli.js` 这个文件名**会被根目录的 `node --test` 当成测试文件发现**（`test/` 下**任意 `.js`** 都在发现范围内），而它里面 **0 条 `test()`** → 被算成 **1 条通过**。实测：移走前根目录 **46 条**（含这个幽灵）、移走后 **45 条**（= 工具箱 27 + `cli.test.js` 9 + `apply.test.js` 9）。
**归纳**：这是"假绿"的**第 5 种**（前四种见 HANDOFF §三），根因和"接线"族**同一个**（位置/连接没对上）—— **不是能力问题**。
**规矩（给下一个会话）**：① **`test/` 只放 `*.test.js`**，实现一律进 `src/`；② 报"全绿 / 几条"之前**先对账**（27 + 各判据文件条数）；③ **别人（或上一份文档）说"昨天已经 9/9"时，先自己跑一遍再引用**。

**同日 AI 另外做的（给 Day 14 铺路，都在 9/27 完成）**：`p-limit` / `fetch` 两份判据**重跑负向验证**（并修掉 `p-limit` 探针会自己挂死的 bug）、新写 **`test/apply.test.js`**（9 条；7 个变体 + 两种冲突策略都验过）、补掉 `cli.test.js` 里会过期的 03、备好 **Day 14 的任务书与日志模板**。明细见 `notes/day14.md` 的「AI 复核」。

### ⑤ 主线 `p-limit`（AI 复核 + 记账 + **判定：不合格** —— 学生自己要求的）

**判据实测：8/8 全绿**（必过 7 + 探针 1）。探针记录：`pLimit(0)` / `-1` / `1.5` / `"2"` 四种非法输入**都抛 `TypeError`**（他自己定的行为，一致）。**实现是对的**，这一点先说清楚。

**他主动报的账（原话）**："是靠 ai 辅助我完成的，我只是看懂理解了，**无法做到裸写的水平**，想不到代码中所写的（也是 ai 教我的）`queue.push({fn,resolve,reject})` 和 `const {fn,resolve,reject} = queue.shift()`，想不到 `Promise.resolve().then(()=>fn()).then(resolve,reject).finally(()=>{activeCount--;next()})` 这种 promise 实现递归，**其他的没有什么问题，但这几处已经是这个代码最重要的部分了，请给我判不合格吧。**"

**逐条核"哪部分是谁的"**（判"哪部分是谁写的"**只能问本人**，这条他自己报得很准）：

| 这份代码里的东西 | 谁想的 | 判读 |
|---|---|---|
| 非法 `n` 的守卫（`Number.isInteger` + `< 1` → `TypeError`）| **他** | 是设计选择；探针 4 个用例行为一致 ✅ |
| `queue` 数组 + `activeCount` 计数 | **他** | "攒数组 / 攒数字"那族他早就会 |
| `next()` 的两个退出条件（名额满 / 队列空）| **他** | 调度器的骨架，他写对了 |
| `limit(fn)` 返回 `new Promise(...)` 并把 `fn` 入队 | **他**（骨架）| —— |
| **队列里连 `resolve`/`reject` 一起存、之后兑现**（"票据"）| **AI 教的** | ❌ 载重处之一 |
| **`Promise.resolve().then(()=>fn()).then(resolve,reject).finally(...)` 这条链** | **AI 教的** | ❌ 载重处之二 |

**判定：不合格**（他说得对，也符合项目规矩）—— 这道题的**题眼就是"空出一个名额就叫下一个"**，而那张"票"和这条链正是题眼本身。**抄到的不算他的那遍。**

**归类：不是知识缺口，是"学过、没长在身上"（检索失败族）**（HANDOFF §五的判据：① 排过没有？② 学过之后有没有留下"能跑的东西"？）—— 两处的零件**都在他自己的材料里**：
- **"票"**：他自己写过 `week1-language/day07-promise.js:34` 的 `buyfood` —— `return new Promise((resolve) => { setTimeout(() => resolve("炒饭做好了"), 3000) })`。**动作一模一样**（把 `resolve` 交给别人、由别人在合适的时机调用），只把"定时器"换成"队列 + 调度器"。
- **`.finally`**：`notes/day07-day2.md` 的阅读表第 2 条**明确列了** `then` / `catch` / **`finally`**，还配了官方任务「基于 promise 的延时」→ **排过、但没留下能跑的东西**（全仓库 `.finally(` 只出现在今天这一份里）→ **所以这不是书单缺口，不需要补章节**。
- 这一族**第 5 次**出现：`debounce` 的 `timer` → `curry` 的累积参数 → `groupBy` 的 `?? []` → `once` 的 `called` → 今天 `p-limit` 的"队列 + 票据"。

**处理（照"检索失败"的规矩：不重讲概念、不重给代码，只指路 + 第二遍 + 隔天同类题）**：
1. **合上重写一遍**，那一遍才算他的。**排期：Day 14 开场第一件**（和 `once` 的重写并排 —— 两道是同一族）。
   **口径**：合上 `day13-p-limit.js`，**允许查他自己的日志 / MDN**，不许看自己那份文件；判据现成 → `node --test week2-runtime/day13-p-limit-verify.js`，目标 **8/8**。
   ⚠️ **今天 ⑦⑧ 那一步（提交）先做** —— 让这份 AI 辅助版进 git 历史，重写时才有对照，账也留得住。
2. **重写后在日志里回答两个"为什么"**（机制层，不是背答案）：
   - `activeCount--` 和 `next()` 为什么放在**"无论成功失败都会执行"**的那一支里？**只写在成功分支**会怎样？（提示：去问判据 03 "失败隔离"那一条）
   - 队列里为什么要**连 `resolve`/`reject` 一起存**？只存 `fn` 行不行？（提示：`limit(fn)` 必须在**还没轮到它**的时候就返回东西给调用方）
3. **Day 15 周复盘**：把"**闭包记状态 + 调度**"这一族正式归进「忘了的」清单（第 5 次出现）。

**要记的一条（对他的）**：他**主动**报"这是 AI 教的、我做不到裸写、请判不合格" —— 这正是计划书附录 D 自检里那句"**能说清我的代码里哪部分是 AI 帮我写的**"的实证，也是这个项目里最难得的一条习惯。**"不合格"是对这道题的，不是对他的。**


### ⑥ 主线 B `fetch`（AI 复核 + 记账 + **判定：不合格，但归类与 ⑤ 不同**）

**判据实测：8/8 全绿**（必过 7 + 探针 1）。探针还记到两件真东西：**退避间隔 `[102, 202]ms`**（真的在翻倍 ✅）、**超时那一次服务器"看到"了请求被掐断** ✅（说明 `abort()` 是真把请求掐了，不是"客户端提前返回、请求还在服务器上跑"）。

**他主动报的账（原话）**："已完成并全绿，和前面一个任务一样是靠 ai 辅助完成的，**我因为今天刚学 fetch，如果让我自己独自完成就肯定是不可能的**，请把这个给我判定为不合格。"

**记账（这份文件里 AI 给的设计元素，逐项记 —— 免得以后分不清）**：

| # | 文件里的东西 | 性质 |
|---|---|---|
| 1 | `class HttpError extends Error`（带 `status`、`name` 的自定义错误子类）| **全新**（今天第一次出现）|
| 2 | `AbortController` + `setTimeout(() => controller.abort(), timeoutMs)` + `clearTimeout` | 今天 ④ 阅读第 2 条，**第一次动手** |
| 3 | 退避 `baseDelayMs * 2 ** (attempt - 1)`（首次不等待）| 今天 ④ 阅读第 4 条，**第一次动手**（零件是他写过的 `sleep`）|
| 4 | **错误/状态分类**（2xx 直接返回 / 5xx 记错后重试 / 4xx 不重试直接抛 / `AbortError` 算超时后重试 / 其他网络错重试）| **这是这份代码真正的"设计"**，AI 给的 |
| 5 | `lastError` 兜底（全失败抛最后一次错误，不把 undefined 抛出去）| AI 给的 |
| 6 | 参数校验（`retries` 非负整数、`timeoutMs > 0`）| 看着像他的风格，但**按他报的账整份都记 AI 辅助**；具体哪几块他自己能写，等他填 ⑥ 那张表 + 做完底下的小练习才知道 |

（**规矩**：判"哪部分是谁写的"只能问本人，不能从代码风格猜。）

**判定：不合格** —— 和 ⑤ 一样，AI 写的不能算他的那遍。**但归类不同，处理方式也就不该一样**：

| | ⑤ `p-limit` | ⑥ `fetch` |
|---|---|---|
| 卡点性质 | **检索失败**：零件都在**他自己的材料**里（`buyfood` 的"票"、`day07-day2.md` 排过的 `.finally`），只是取不出来 | **今天第一次见**：`AbortController` / `signal` / `AbortError` / 退避**是今天 ④ 才读的**，`HttpError` 子类**全新** |
| 该怎么补 | **合上重写**（不讲概念、不重给代码）| **不能整份"合上重写"**（那不公平，也测不出东西）→ **先分块亲手写**，再**隔一天**合上重写整份 |
| 排期 | Day 14 开场（20 分钟）| 分块练习 **Day 14 的 0b 时段（20 分钟）**；**整份重写排到 Day 15/16 开场**（`fetch` 在 9/27 任务书里本来就写着"可顺延"）|

**分块练习（每块 5–10 分钟，都在 `week2-runtime/day13-fetch-practice.js` 里留一个能跑的东西）**：

| # | 写什么 | 为什么拆这一块 |
|---|---|---|
| ① | `fetchOnce(url, timeoutMs)`：用 **`AbortSignal.timeout(ms)`** 一行做超时 | 先把"超时"故意做成**一行**，看清 `signal` 是怎么接进 `fetch` 的（也顺便看清：现成那份里 3 行可以合成 1 行）|
| ② | 同上，但**手写** `AbortController` + `setTimeout(abort)` + `clearTimeout` | 手写一遍才知道 `signal` 不是魔法；`AbortSignal.timeout` 就是它的语法糖 |
| ③ | `retryFixed(url, times)`：**只重试**（固定等 50ms，用他写过的 `sleep`），不退避、不分类 | 把"重试循环"单独拎出来练 —— 这一块他一定写得出来 |
| ④ | `HttpError extends Error` + **分类**（200 直接回 / 500 重试 / 404 不重试）| 这是**设计**不是 API；设计要靠"自己定规则 + 说为什么"才能长在身上 |

**另外**：把"**fetch 封装（最小版）**"**加进第 3 周的轮转表**（判据 `day13-fetch-verify.js` 现成，正好当复习）。

**重写后在日志里回答两个"为什么"**（机制层）：
1. fetch 在服务器返 500 时**不会 reject** → 那"要不要重试"的依据是什么？`res.ok` 和 `res.status` 各覆盖什么情况？
2. `abort()` 之后 fetch 抛的错 `err.name` 是什么？为什么**靠它**就能把"超时"和"其他网络错误"分开？（探针实测：服务器那边**看到**了连接被掐断）

**顺带一条要记进计划侧的账**：⑤（`p-limit`，**零新 API、纯组合**）他卡在**组合取不出来**；⑥（`fetch`，**全是新 API**）他卡在**首次上手**。**两种卡点要的介入方式完全不同** —— 这正是计划书 §一 那笔"每天新 API 的密度"的又一笔实证。

---

## 卡在哪里

1.fetch的真实运用
2.promise的真实应用+递归
3.不知道该如何通过闭包实现只执行一次函数
4.

---

## 欠账登记（按计划 §四 的规则）

| 欠什么 | 补在哪天 |
|---|---|
| fetch分块练习 |9/28 day14|
|  once重写  | 9/28 day14|
|  P-limit重写 | 9/28 day14 |


## 明天第一件事

1. **Day 14（9/28 一）= 包管理与生态 + 项目 1 主体实现**：上午 npm/pnpm 差异、语义化版本、lockfile、workspace、`npm audit`、依赖为什么越少越好；下午**项目 1 主体**（文件扫描 → 分类 → 移动：**流式复制 + 校验**），用 `pnpm` 管理
2. （如果今天有顺延）先把欠账清掉

## 代码 / 命令备忘

```powershell
# ① 清 Day 12 尾巴
node --test projects/p1-cli-organizer/test/cli.test.js
node tools/check-md-tables.js projects/p1-cli-organizer/README.md

# ② 轮转复习
node week1-language/recall-verify.js deepClone

# ③ 零提示题
node --test week2-runtime/day13-zerohint-07-verify.js

# ⑤⑥ 主线
node --test week2-runtime/day13-p-limit-verify.js
node --test week2-runtime/day13-fetch-verify.js

# 收尾
git add -A
git commit -m "day13: concurrency pool (p-limit) + fetch timeout/retry"
git push
git status -sb
```
