# Day 26 — 2026-10-12（周一）**项目 3 Day 1：`llm.js` 客户端**

> **状态：填写完成**　｜　任务书：[`day26-llm-client.md`](day26-llm-client.md)
> **实际开始 _08_:_45_/收工 _20_:_30_:**　｜　**今天**：探 key → 第一通真调用 → 写 `src/llm.js`（超时/重试/日志/成本）
> **判据（硬）**：`node --test` **10/10** ＋ live 真调一次 ✓ ＋ 第一通真调用 200 ✓
> **规矩**：先写三行切法再动手；卡住 = 三行 + 判据 → 15 分钟；时间到 ≠ 要答案（看在不在推进）

## 开场已知（AI 08:30 核过）

- **连通性实测**：OpenAI ✗（000）/ Anthropic ✗（403）；DeepSeek / 智谱 / Moonshot / DashScope / SiliconFlow **全通**（401）→ 用国内家
- 环境变量里**没有** key；p3 脚手架 + 判据（10 + 1 条）已就位；判据已用参照实现验过牙（10/10 可满足 + 5 处突变各自红，参照已删）
- ⚠️ 仓库根 `node --test` 现在红 = 判据就是待办清单，不是环境坏了

## 今日目标

- [x] ① 探 key：有的填 `.env` / 没有的注册 + 拿 key（谁家：__deepseek__）
- [x] ② 第一通真调用跑通（`status: 200` + 中文 + usage）
- [x] ③ 写 `src/llm.js` → `node --test` 10/10
- [x] ④ live 真调一次 ✓
- [x] ⑤ 收尾：日志 / 时间账 / commit + push

## 我的切法（10:25 那格写，3–5 行，发 AI）

（先写什么函数、内部怎么分块、判据按什么顺序跑）

1.先写需要用到apikey，url，fetch请求体，输出响应字段   01判据先测对

2.判断是否apikey为undefined，别没有就开始fetch，没有就立刻throw 抛错没有DEEPSEEK_API_KEY   02判据先对

3.解构options  retries ， waitMs 将需要用到的变量确定
在进入重试循环的时候前先 fullretires =retries+1 为执行次数
res= fetch先{}不要写，直接写status=res.status后没写判断语句if( status >=500&&status<600) continue;  03判据1

4.写状态码400-499分支的时候特意if(status === 429)continue;  04 06判据

5.写controlled = new AbortControlled()  用setTimeout(()=>controlled.abort(),waitMs)  07判据

6.将data =await res.json() 返回数据日志 08

7.定义cost 用date.usage 算输出价格  09 10


## 判据结果

| 判据 | 目标 | 实际 |
|---|---|---|
| `node --test`（01–10） | 10/10 | 10/10|
| live（`LLM_LIVE=1`） | ✓ | ✓ |
| demo 第一通真调用 | `status: 200` |status: 200` |

## 卡点与教训（当天记）

| 卡在哪 | 性质 | 处理 |
|---|---|---|
|切法格 80/20 超时 |刚接触 | 切法格 80/20 超时|
|waitMs 兼两职|旧代码的病复发|改为两个参数|
|.map 那段丢了 value|ai给的东西出错|重新写为精确版本|


## 记账三列（按新规矩：中间列要写"我怎么验证的"）

- **AI 给的**：脚手架（package.json / .env.example / README 骨架）／判据全文（10+1 条）／demo 示范／连通性探测／复习格安排/snake→camel 那段/日志示范
- **我自己写的**（＋我怎么验证的）：
1. chat() 主体：重试循环（retries + 1 次）、分支划分（5xx/429 → continue；其它 4xx → 立刻抛）、AbortController + timeoutMs 中止、performance.now() 计时、把网络错也包进重试（catch → continue）、请求体/头形状、错误信息含 DEEPSEEK_API_KEY、HttpError（带 status）
2. estimateCost()：两档价 + /1e6 + 未知模型抛错（纯函数）
3. usage 映射（解构重命名）、日志（每个出口一条 + 字段平铺 + logger 从 opts 注入）
4.  设计取舍：价目表本来想做"缓存命中/未命中 + 高峰/低谷"，按契约简化成两档、把丰富版注释保留在文件底部（这个取舍是你做的，值得记）
5. 我怎么验证的：node --test 10/10（多次跑）＋ live 真调 1/1（status:200 / latencyMs 813）＋ demo 第一通真调用 200 ＋ 自己注册拿 key 填 .env（并把 key 挡在 git 外）
- **AI 帮我定位的**：
1. apikey 检查写在解构之前 → TDZ ReferenceError
2. Headers 大写 H → 静默丢头；'authorzation' 拼错 → 静默
3. throw HttpError(...) 少 new；new HttpError(status) 与构造函数参数顺序不符
4. waitMs 漏改一行（ReferenceError）＋ waitMs 兼两职（退避/超时绑一起，day13 老毛病）
5. res 声明在 try{} 里 → 出作用域（ReferenceError）
6. let backoffMs = backoffMs…（自己遮自己 TDZ）→ 改成给 const 赋值（TypeError）—— 两次都"只在重试时炸"
7. priceTable 没解构 / DEFAULT_PRICE_TABLE 常量没跟着改名
8. 04 的抛错信息里没有模型名（正则匹配不上）
9. 日志打进真 logger、判据收不到（opts.logger 没解构）＋ 成功记录字段没平铺（塞进 meta 里）
10. estimateCost 里加日志（纯函数不该有副作用）＋ attempt = attempt + 1 改循环变量
11. 拼写/对调类：/chat/completion 少 s、retires、model/baseUrl 的 env 对调

## 时间账（收尾跑 `node tools/sp-tasks.js today`）

| 格 | 计划 | 实际 |
|---|---|---|
| |计划 370m | 实际 459mm|
  35m →   14m  [10/12] 20:35 收尾：日志 + 计划vs实际 + commit
  40m →   19m  [10/12] 17:10 复习格：轮转 curry + 抽考 2 条（上课回来先热身）
  40m →   13m  [10/12] 19:50 全量判据 + 修红 + live 真调一次
  50m →   44m  [10/12] 18:55 主体C：日志 + 成本（判据 08/09/10）
  55m →    2m  [10/12] 17:55 主体B：超时 + 重试（判据 03-07）
  45m →  198m  [10/12] 12:30 主体A：按 review 整改 → 判据 01/02 绿
  20m →   80m  [10/12] 10:25 排步骤：写你的切法发 AI + 读判据
  40m →   66m  [10/12] 9:40 第一通真调用：跑 demo + 读懂协议
  30m →    5m  [10/12] 9:05 探 key：定服务商 + 拿 key（含注册）
  15m →   17m  [10/12] 8:45 开场触点：轮转 debounce + 讲昨天
—— 今天：计划 370m / 实际 459m




⚠️ 主体B 只记了 2 分钟、活并进主体A 的 198m 里

## 复习格

| 触点 | 内容 | 结果 |
|---|---|---|
| 开场 15 分钟 | 轮转 `debounce`（合上重写 → `recall-verify.js debounce`）＋ 讲昨天（"部署成功 ≠ 部署的是最新代码"） | 轮转 debounce —— 第一遍 3/4（差 immediate 分支的早返回）要 AI 点一下才到 4/4→ 第二遍 4/4 ✓|
| 复习格 40 分钟 | 轮转 `curry`（合上重写 → `recall-verify.js curry`）＋ 抽考 2 条 |6/6  |
| 收尾抽考 ① | **退避怎么写**（week2-review §三 A3） | 会写了|
| 收尾抽考 ② | **索引：SCAN vs SEARCH 是什么、什么时候该建**（week3-review B #13） | 记账③|
注：抽考见末尾

教训：
debounce : 早返回跳过了 timer = setTimeout(...) → 第二次调用又被当第一次 → 立即重复执行。

**明天开场考**：超时 / 重试 / 日志 / 成本各防哪种坏法（合上材料说）。

## 一句话日志

（学会了什么 ／ 卡在哪 ／ 明天第一件事）


今天把主要任务完成了，虽然过程艰辛，但有实感。

## 抽考2条


① 退避怎么写（notes/week2-review.md §三 A 第 3 条） 写出"第 N 次重试前等多久"那行的算式；再用一句话说清两件事：

为什么按倍数涨？（固定值 / 线性涨会怎样）
重试间隔和超时这两个量分别管什么？（你今天在 waitMs 上把它们绑一起过，正好考这个）
② 索引：SCAN vs SEARCH（notes/week3-review.md B 组 #13 —— ③ 档，9/18 之后没碰过）

EXPLAIN QUERY PLAN 里这两个词分别表示什么？
建了索引之后，为什么会从 SCAN 变成 SEARCH？
补一句：什么情况下不该建索引？



①退避怎么写

waitMs *2 **(attempt-1) （attempt为请求次数-1，waitMs为等待初始值）

因为防止服务器在请求过多出现问题的时候，再同时接受请求导致服务器问题更加严重，作用是减轻服务器的压力
重试间隔管过多久才能重新重试
超时是固定时间服务器还是没有响应直接重试或者抛错


②索引

区别：
SCAN 只能逐行检查每一行中的age字段
SEARCH 则是创建索引后，会为这个列建一个B-Tree 再次执行相同查询时，通过检索快速定位符合条件的条目
造一个索引：
CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks(title)


什么时候不该用：因为索引的弊端会消耗额外的存储空间
很小的一个表时或者表需要频繁进行大量写入的时候
