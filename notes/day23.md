# Day 23 — 2026-10-09（周五）**复习日**

> **状态：填写中（12:30 改道）**　｜　任务书：[`day23-exec.md`](day23-exec.md)（原 `day23-review.md` 已作废）
> ⚠️ **10/10 检阅取消 → 复习日取消**：今天恢复 **Day 23 执行日**；宽扫 / 演示脚本 / 讲稿 / 彩排**取消、不算欠账**
> **下午**：抽 `src/db.js` → 优雅退出 SIGTERM → 轮转 `deepClone` + `countByExt` → 服务活体 → LeetCode → 收尾
> **判据**：三份回归 7/9/10 + 39/39 + 突变 13/13 ｜ 容器里看到优雅退出 ｜ 抽考 11 + 24

## 今日目标

- [x] ① docker 收尾：Postgres 第一次真跑（`compose ps` = Up + `psql` 回话）✓ 09:15
- [x] ② 讲解日 5 分钟："判据的牙"（欠账清掉）✓（超时 20 分钟）
- [x] ③ 三条基线复跑：27 / 18 / 39 ✓（输出在 §演示脚本 1）
- [x] ④ JWT 组第二遍默写 4/4 ✓（抓到并修掉一处**安全级**取反：改签名也能过）
- [x] ⑤ **主体 A：抽 `src/db.js`** → 三份回归 7/9/10 + 39/39 全绿；突变检查**预期 10/13**（M5/M6/M7 靶子搬家，见任务书）
- [x] ⑥ **主体 B：优雅退出（SIGTERM）** → 容器里 `docker stop` 看到日志
- [x] ⑦ **轮转**：`deepClone`（闭卷）+ `countByExt`（欠账）
- [x] ⑧ 服务活体：curl 全流程（`db.js` 的端到端验证）
- [x] ⑨ LeetCode 1 题（20 分钟硬停）
- [x] ⑩ 收尾：抽考 11 + 24 / 计划 vs 实际 / commit + push
- [x] ⑪ 补报一行：JWT 那遍**哪几块纯默、哪块瞄了**（出池判断用）
 const header = b64({alg:'HS256',typ:'JWT'}); alg看了一眼
  if(!same(parts[2],want)) （ai纠错了）

## 判据结果

| 判据 | 目标 | 实际 |
|---|---|---|
| `docker compose ps` | db = Up |db = up |
| 三条基线 | 27/27 + 18/18 + 39/39 |39/39 |
| JWT 默写 4 条 | 全过 |卡点 = 验签比较取反（手滑族，+12 分钟|
| demo curl 全流程 | 每步有预期输出 | |
| 讲稿 | 3 段出声讲完 |我的原版大纲 + 修正版（已在文件里） |
| 主体 A| 39/39 ✅| 突变 10/13 →（工具升级后）13/13；9 处重打错（3 处静默 + 5 处响 + 丢 ORDER BY id）；另有结构错"openDb() 放模块顶层"|
| 主体 B | 容器 js-node-30days-app-1| docker stop → 日志两行都在 ✓|
| 轮转 |deepClone 全绿；countByExt全绿|deepClone 全绿；countByExt 修后 8/8；bug = 累加器起点族第 5 次|
|服务活体：curl 全流程（`db.js` 的端到端验证）|粘贴注册 / 登录 / 建 / 查 / 越权 404 的实际输出正确 |??? = PowerShell 客户端未按 UTF-8 编码 body（静默、数据真坏）；服务端与库经 Node 复验正常；清理|
|LeetCode |二十分钟以内做完|65/65；74ms／7.78% = O(n²) → 明天写 O(n)|



## 演示脚本（明天直接用）

### 1 本机测试

```
（粘贴 node --test 的 39/39 输出，或截图）

✔ myMap：每个元素过一遍回调，返回新数组，原数组不动 (2.1373ms)
✔ myMap：回调收到 (元素, 下标, 原数组) (0.2473ms)
✔ myFilter：留下回调返回"真"的元素，返回新数组 (0.2761ms)
✔ myFilter：筛选规则完全由回调决定，不能自己预设元素类型 (0.2456ms)
✔ myReduce：传了初始值 (0.3149ms)
✔ myReduce：不传初始值时，起点是第一个元素（回调少跑一次） (0.2624ms)
✔ myReduce：回调收到 (累计值, 元素, 下标, 原数组) (0.264ms)
✔ 三个方法都不改原数组（对象数组也一样） (0.4222ms)
✔ 逐个传参：c(1)(2)(3) 得到 6 (1.2532ms)
✔ 一次传够：c(1, 2, 3) 得到 6 (0.1766ms)
✔ 一次传多个也要支持：c(1,2)(3) 和 c(1)(2,3) (0.1604ms)
✔ 未收够时返回的仍然是一个函数 (0.15ms)
✔ 柯里化后的函数能复用，不串参数（最值钱的一条） (0.188ms)
✔ 两个柯里化函数之间互不干扰 (0.1776ms)
✔ 连调 5 次只执行 1 次 (122.8516ms)
✔ delay 没到就再次调用，会重新计时 (156.5856ms)
✔ immediate: true 第一次立刻执行（这一条不用等） (0.2925ms)
✔ immediate: true 时，delay 内的第二次调用应被忽略（leading + trailing 语义） (205.5153ms)
✔ 嵌套对象：改副本的深层属性，原对象不受影响 (0.766ms)
✔ 数组（含嵌套数组、数组里的对象） (0.1796ms)
✔ null 必须保持 null（不能变成空对象） (0.1227ms)
✔ 原始类型原样返回 (0.0926ms)
✔ throttle：interval 内多次调用只执行 1 次 (184.727ms)
✔ throttle：过了 interval 再调用能再次执行 (284.2133ms)
✔ throttle：调用时的参数会透传 (124.3626ms)
✔ throttleBySwitch：另一条实现路线（开关 + 定时器）行为一致 (187.0389ms)
✔ throttle：首次调用时将立刻执行 (0.2845ms)
ℹ tests 27
ℹ suites 0
ℹ pass 27
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 925.3086

✔ 00 模块能被 require，并导出 classify 函数 (0.9411ms)
✔ 01 --apply 真的搬：源目录清空、目标按分类就位、每个文件的 sha256 与原来一致 (119.6593ms)
✔ 02 重名冲突：两个子目录里的同名文件，一个都不许丢 (115.3454ms)
✔ 03 建目录失败时：那一类的源文件原地不动、别的类照常搬、退出码非零 (104.1563ms)
✔ 04 幂等：连跑两次，第二次不许把已经搬好的文件再搬一层（目标在源目录里面） (182.0327ms)

探针（只记录，不判错）：
  · --verbose 输出了 7 行：
      {"level":30,"time":1791511398932,"file":"note.txt","category":"docs","msg":"搬运成功"}
      {"level":30,"time":1791511398934,"file":"photo.jpg","category":"images","msg":"搬运成功"}
      共 2 个文件,共计搬了2个文件，失败了0个文件
      目标目录：C:\Users\27971\AppData\Local\Temp\p1-apply-lab-lLA7Fa\p1\dst
        计划：note.txt → docs/  （C:\Users\27971\AppData\Local\Temp\p1-apply-lab-lLA7Fa\p1\src\note.txt）
        计划：photo.jpg → images/  （C:\Users\27971\AppData\Local\Temp\p1-apply-lab-lLA7Fa\p1\src\photo.jpg）
      共 2 个文件：images 1、docs 1、videos 0、others 0
  · 不加 --verbose 的汇总：共 0 个文件,共计搬了0个文件，失败了0个文件 | 目标目录：C:\Users\27971\AppData\Local\Temp\p1-apply-lab-lLA7Fa\p1\dst2 | 共 0 个文件：images 0、docs 0、videos 0、others 0
  · 撞名（两个 same.txt）之后，目标 docs/ 里是：docs\same(1).txt、docs\same.txt
    源里还剩：（空）　退出码 0
  · 搬完之后源目录里还剩：a（空目录，留着也没错）
  （探针不判错：冲突策略、空目录留不留都是设计选择 —— 记进日志就行）


判据覆盖面：00–07 共 8 条必过 + P 探针 1 条 = 本文件 9 条 test()。
（报绿之前看一眼上面的 pass 数：大半是 skipped、pass 只有个位数，那不是绿，是没跑起来。）
    · 06 是**看代码的合同检查**、05 是**规模冒烟** —— 两条都不证明"用了流"，详见文件顶部说明。
✔ 05 大文件（24MB）搬得动、字节一模一样（规模冒烟 —— 不证明"用了流"） (241.3978ms)
✔ 06 合同检查（**看代码**）：用流式复制，没有把整个文件读成一个字符串 (1.0201ms)
✔ 07 模块能被 require 而没有副作用（不打印、不搬文件） (0.1536ms)
✔ P 探针：--verbose 长什么样 / 冲突策略 / 汇总行 / 空目录留不留（只记录，不判错） (409.062ms)

探针（只记录，不判错；fixture = C:\Users\27971\AppData\Local\Temp\p1-cli-verify-3gyVgs\inbox，跑完会删）：
  · --verbose（退出码 0）：✅ 输出比默认更长
  · --target：✅ 输出里出现了目标目录；目标目录没被创建 ✅
  · 无参数（退出码 0）：✅ 有提示：计划：.gitkeep → others/
  · 子目录：**递归了**（子目录里的文件也列出来了） ← 今天没规定，两种都行；**写进 README 的「已知限制」或设计说明**
  （探针不判错：--verbose / --target / 用法提示 属砍单顺序里可以顺延的，欠了要登记进日志）


判据覆盖面：00–07 共 8 条必过 + P 探针 1 条 = 本文件 9 条 test()。
（报绿之前看一眼上面的 pass 数：大半是 skipped、pass 只有个位数，那不是绿，是没跑起来。）
✔ 00 src/cli.js 能被 require，并导出 classify 函数 (1.0091ms)
✔ 01 classify：分类规则（含大写、含没有扩展名的） (0.7702ms)
✔ 02 干跑：打印计划 + 汇总 + 【文件一个都没动】 (96.1521ms)
✔ 03 底线两条：干跑给 `--target` 也不许动（连目录都不建）；`--apply` 要么真搬、要么明说没实现 (209.8211ms)
✔ 04 源目录不存在：一句人话 + 非零退出码（不是崩栈） (85.5856ms)
✔ 05 空目录：汇总 0，不报错 (89.7007ms)
✔ 06 模块能被 require 而不会顺手把 CLI 入口跑起来 (0.1581ms)
✔ 07 汇总行的四个分类都出现（顺序固定：images、docs、videos、others） (85.0497ms)
✔ P 探针：--verbose / --target / 无参数 / 子目录（只记录，不判错） (461.789ms)
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1426.4698

✔ 00 模块能被加载，并导出 buildServer 函数 (13.2821ms)
2026-10-09T02:03:47.523ZPOST/auth/register
✔ 01 注册 → 201，而且**密码没有明文落库 / 没有回给客户端** (87.7933ms)
2026-10-09T02:03:47.580ZPOST/auth/register
2026-10-09T02:03:47.626ZPOST/auth/register
✔ 02 同一个邮箱注册两次 → 409/400（不是 201、更不能 500） (110.0032ms)
2026-10-09T02:03:47.691ZPOST/auth/register
2026-10-09T02:03:47.747ZPOST/auth/login
✔ 03 登录成功 → 200 + 非空 token (101.5512ms)
2026-10-09T02:03:47.789ZPOST/auth/register
2026-10-09T02:03:47.829ZPOST/auth/login
2026-10-09T02:03:47.877ZPOST/auth/login
✔ 04 密码错 / 没这个邮箱 → 401 (91.0916ms)
2026-10-09T02:03:47.880ZGET/tasks
✔ 05 不带 token 访问 /tasks → 401 + JSON (3.2049ms)
2026-10-09T02:03:47.885ZPOST/auth/register
2026-10-09T02:03:47.935ZPOST/auth/login
2026-10-09T02:03:47.976ZGET/tasks
✔ 06 带 token 访问 /tasks → 200 + 数组 (95.0828ms)
2026-10-09T02:03:47.979ZPOST/auth/register
2026-10-09T02:03:48.017ZPOST/auth/login
2026-10-09T02:03:48.052ZPOST/auth/register
2026-10-09T02:03:48.089ZPOST/auth/login
2026-10-09T02:03:48.122ZPOST/tasks
2026-10-09T02:03:48.127ZGET/tasks
2026-10-09T02:03:48.128ZGET/tasks/1
2026-10-09T02:03:48.130ZPATCH/tasks/1
2026-10-09T02:03:48.131ZDELETE/tasks/1
✔ 07 **隔离**：A 的任务，B 看不到、也改不到（一律 404） (154.7401ms)
2026-10-09T02:03:48.133ZGET/tasks

探针（只记录，不判错）：
✔ 08 乱码 / 伪造的 token → 401（不能 500） (1.2384ms)
2026-10-09T02:03:48.135ZPOST/auth/register
2026-10-09T02:03:48.173ZPOST/auth/login
  · token 分成 3 段（标准 JWT 是 3 段：header.payload.signature）
  · token 头部：{"alg":"HS256","typ":"JWT"}（看 alg，比如 HS256）
  · users 表里那一行长这样：{"id":1,"email":"reg-1791511427488-923023@test.local","passwordHash":"scrypt$32d6dc3c11d8939caeec6fc072dabf3a$728245bed372b235183a3b2e9904d04a2b1bd91f0a2dd04f87
  · 看起来像哈希吗：像 ✓
  · 迁移目录：db/migrations
  （探针不判错：哈希算法、token 格式、列名怎么起，都是设计选择 —— 记进日志就行）


判据覆盖面：00–08 共 9 条必过 + P 探针 1 条 = 本文件 10 条 test()。
（报绿之前看一眼上面的 pass 数：大半是 skipped，那不是绿，是没跑起来。）
✔ P 探针：token 结构 / 库里那条哈希长什么样 / 迁移文件（只记录，不判错） (79.5929ms)
✔ hashPassword(“same”) 两次需要不相等  (80.376ms)
✔ hashPassword(“same”) 存起来的串以scrypt$开头 (33.8235ms)
✔ verifyPassword 对密码→ true,错一个字符 → false (109.7564ms)
✔ signJwt({sub:7},60) → verifyJwt(...)拿回 sub===7 把中间一个字符改掉 → null；过期（ttlSec=-1）→ null (1.1414ms)
2026-10-09T02:03:47.612ZGET/tasks
✔ '01 不带 token 打 /tasks → 401 + JSON (45.7304ms)
2026-10-09T02:03:47.633ZGET/tasks
✔ 02  乱码 token 401（含三段垃圾 'aaa.bbb.ccc' —— 这条会先红） (4.696ms)
2026-10-09T02:03:47.638ZPOST/auth/register
2026-10-09T02:03:47.696ZPOST/auth/login
2026-10-09T02:03:47.747ZPOST/auth/login
2026-10-09T02:03:47.749ZPOST/auth/login
✔ 05 密码错与邮箱不存在 401  (153.6254ms)
2026-10-09T02:03:47.790ZPOST/auth/register
2026-10-09T02:03:47.791ZPOST/auth/register
2026-10-09T02:03:47.793ZPOST/auth/login
✔ 06 注册校验：邮箱没 @ / 密码 5 位 → 400，且都没落库 (5.3863ms)
2026-10-09T02:03:47.795ZPOST/auth/register
💥 FastifyError: Body is not valid JSON but content-type is set to 'application/json'
    at Parser.defaultJsonParser [as fn] (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\content-type-parser.js:331:12)
    at IncomingMessage.onEnd (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\content-type-parser.js:311:27)
    at IncomingMessage.emit (node:events:514:28)
    at endReadableNT (node:internal/streams/readable:1764:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
  code: 'FST_ERR_CTP_INVALID_JSON_BODY',
  statusCode: 400
}
2026-10-09T02:03:47.800ZGET/health
✔ 08 畸形 JSON → 400（这条也会先红） (7.2674ms)
2026-10-09T02:03:47.807ZPOST/auth/register
2026-10-09T02:03:47.846ZPOST/auth/login
2026-10-09T02:03:47.884ZPOST/tasks
✔ 09 空 title → 400 且列表不多一条  (83.8947ms)
2026-10-09T02:03:47.886ZPOST/auth/register
2026-10-09T02:03:47.935ZPOST/auth/login
2026-10-09T02:03:47.972ZPOST/tasks
2026-10-09T02:03:47.977ZPATCH/tasks/1
2026-10-09T02:03:47.981ZGET/tasks/1
2026-10-09T02:03:47.983ZGET/tasks/1
2026-10-09T02:03:47.985ZPATCH/tasks/1
2026-10-09T02:03:47.986ZGET/tasks/1
✔ 10  PATCH done 再 GET 确认+ 空 body 不改字段   (101.9515ms)
2026-10-09T02:03:47.988ZPOST/auth/register
2026-10-09T02:03:48.027ZPOST/auth/login
2026-10-09T02:03:48.062ZPOST/auth/register
2026-10-09T02:03:48.100ZPOST/auth/login
2026-10-09T02:03:48.135ZPOST/tasks
2026-10-09T02:03:48.140ZGET/tasks/2
2026-10-09T02:03:48.141ZGET/tasks/2
2026-10-09T02:03:48.141ZPATCH/tasks/2
2026-10-09T02:03:48.142ZDELETE/tasks/2
2026-10-09T02:03:48.143ZGET/tasks
✔ 11 隔离（列表不含别人的 + GET/PATCH/DELETE 各一条 404）  (156.6164ms)
2026-10-09T02:03:48.145ZPOST/auth/register
2026-10-09T02:03:48.183ZPOST/auth/login
2026-10-09T02:03:48.220ZPOST/tasks
2026-10-09T02:03:48.224ZDELETE/tasks/3
2026-10-09T02:03:48.227ZDELETE/tasks/3
2026-10-09T02:03:48.228ZGET/tasks/3
✔ 12 DELETE 自己的 → 再 GET 404。 (84.5085ms)
2026-10-09T02:03:47.510ZPOST/auth/register
2026-10-09T02:03:47.564ZPOST/auth/login
✔ 00 模块能被加载，并导出 buildServer 函数 (152.0615ms)
2026-10-09T02:03:47.624ZGET/health
✔ 01 GET /health → 200 + JSON {"ok":true} (5.6611ms)
2026-10-09T02:03:47.629ZGET/tasks
✔ 02 GET /tasks → 200 + JSON 数组（今天返回空数组就行） (4.1128ms)
2026-10-09T02:03:47.632ZGET/%E8%BF%99%E4%B8%AA%E8%B7%AF%E7%94%B1%E4%B8%8D%E5%AD%98%E5%9C%A8
✔ 03 未知路径 → 404，且**body 是 JSON**（不是 HTML 错误页） (2.8643ms)
2026-10-09T02:03:47.635ZGET/boom
💥 Error: boom
    at Object.<anonymous> (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\src\server.js:114:20)
    at preHandlerCallbackInner (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:203:24)
    at preHandlerCallback (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:168:5)
    at validationCompleted (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:158:5)
    at preValidationCallback (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:135:5)
    at handler (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:105:7)
    at Object.handleRequest (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:36:5)
    at runPreParsing (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\route.js:661:19)
    at next (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\hooks.js:236:9)
    at handleResolve (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\hooks.js:253:7)
2026-10-09T02:03:47.637ZGET/health
✔ 04 统一错误处理：/boom 抛错 → 500 + JSON，而且**进程不许崩** (4.4423ms)

探针（只记录，不判错）：
✔ 05 直接运行 src/server.js 真的能起起来（读 PORT，能访问 /health） (551.9492ms)
2026-10-09T02:03:48.192ZGET/health
  · GET /health 的响应头：{"connection":"keep-alive","content-length":"11","content-type":"application/json; charset=utf-8","date":"Fri, 09 Oct 2026 02:03:48 GMT","keep-alive":"timeout=72"}
2026-10-09T02:03:48.194ZGET/nope
  · 404 的 content-type = application/json; charset=utf-8，body = {"message":"Route GET:/nope not found","error":"Not Found","statusCode":404}
2026-10-09T02:03:48.196ZGET/boom
💥 Error: boom
    at Object.<anonymous> (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\src\server.js:114:20)
    at preHandlerCallbackInner (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:203:24)
    at preHandlerCallback (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:168:5)
    at validationCompleted (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:158:5)
    at preValidationCallback (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:135:5)
    at handler (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:105:7)
    at Object.handleRequest (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\handle-request.js:36:5)
    at runPreParsing (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\route.js:661:19)
    at next (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\hooks.js:236:9)
    at handleResolve (C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api\node_modules\.pnpm\fastify@5.12.5\node_modules\fastify\lib\hooks.js:253:7)
  · 500 的 content-type = application/json; charset=utf-8，body = {"error":"服务器开小差啦"}
2026-10-09T02:03:48.197ZGET/health
  · 一次 /health 往返耗时 ≈ 1ms
  （探针不判错：响应头里多什么字段、404 的文案怎么写，都是设计选择 —— 记进日志就行）


判据覆盖面：00–05 共 6 条必过 + P 探针 1 条 = 本文件 7 条 test()。
（报绿之前看一眼上面的 pass 数：大半是 skipped，那不是绿，是没跑起来。）
✔ P 探针：响应头 / 404 的 body / 启动耗时（只记录，不判错） (8.2197ms)
2026-10-09T02:03:47.540ZPOST/auth/register
2026-10-09T02:03:47.599ZPOST/auth/login
✔ 00 模块能被加载，并导出 buildServer 函数 (158.5828ms)
2026-10-09T02:03:47.657ZPOST/tasks
✔ 01 POST /tasks → 201 + JSON，且返回非空 id (11.3693ms)
2026-10-09T02:03:47.668ZPOST/tasks
2026-10-09T02:03:47.675ZGET/tasks
✔ 02 GET /tasks → 200 + JSON 数组，且里面能找到刚创建的那条 (15.1336ms)
2026-10-09T02:03:47.683ZPOST/tasks
2026-10-09T02:03:47.691ZGET/tasks/3
2026-10-09T02:03:47.694ZGET/tasks/999999
✔ 03 GET /tasks/:id → 200 + 那条；不存在的 id → 404 + JSON (17.4701ms)
2026-10-09T02:03:47.701ZPOST/tasks
2026-10-09T02:03:47.711ZPATCH/tasks/4
2026-10-09T02:03:47.719ZGET/tasks/4
✔ 04 PATCH /tasks/:id 改字段 → 200 + 新值（再 GET 确认已落库） (23.4226ms)
2026-10-09T02:03:47.723ZPOST/tasks
2026-10-09T02:03:47.729ZDELETE/tasks/5
2026-10-09T02:03:47.734ZGET/tasks/5
✔ 05 DELETE /tasks/:id → 200/204；再 GET → 404 (15.8307ms)
✔ 06 跨进程持久化：换个进程起同一个 DB_FILE，数据还在（防"内存数组假数据库"） (806.3687ms)
2026-10-09T02:03:48.545ZPOST/tasks

探针（只记录，不判错）：
  · 建表/迁移相关文件：db/migrations
✔ 07 POST /tasks 不带 title → 400/422 + JSON（校验真的生效） (2.3876ms)
2026-10-09T02:03:48.548ZGET/tasks
  · GET /tasks 的响应头：{"content-type":"application/json; charset=utf-8"}
2026-10-09T02:03:48.549ZGET/tasks?done=true
  · GET /tasks?done=true → 200，数组 5 条（可选功能：过滤还没做也没关系，记进日志就行）
2026-10-09T02:03:48.550ZGET/health
  · 一次 /health 往返耗时 ≈ 0ms
  （探针不判错：用什么 ORM、表怎么建、错误文案怎么写，都是设计选择 —— 记进日志就行）


判据覆盖面：00–07 共 8 条必过 + P 探针 1 条 = 本文件 9 条 test()。
（报绿之前看一眼上面的 pass 数：大半是 skipped，那不是绿，是没跑起来。）
✔ P 探针：建表/迁移文件 / ?done= 过滤 / 响应头 / 耗时（只记录，不判错） (4.4007ms)
ℹ tests 39
ℹ suites 0
ℹ pass 39
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1705.1958
```

### 2 服务活体（curl 全流程）

```
（粘贴注册 / 登录 / 建 / 查 / 越权 404 的实际输出）

PS C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api> $base = 'http://127.0.0.1:3000'
>> Invoke-RestMethod "$base/health"

  ok
  --
True

PS C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api> $e1 = "a$(Get-Random)@demo.local"
PS C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api> Invoke-RestMethod -Method Post "$base/auth/register" -ContentType 'application/json' -Body "{`"email`":`"$e1`",`"password`":`"secret123`"}" | Out-Null
PS C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api> $t1 = (Invoke-RestMethod -Method Post "$base/auth/login" -ContentType 'application/json' -Body "{`"email`":`"$e1`",`"password`":`"secret123`"}").token
PS C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api> $h1 = @{ Authorization = "Bearer $t1" }
PS C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api> $task = Invoke-RestMethod -Method Post "$base/tasks" -Headers $h1 -ContentType 'application/json' -Body '{"title":"第一条"}'
PS C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api> $task

id title  done
-- -----  ----
 1 ???   False


PS C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api> Invoke-RestMethod "$base/tasks" -Headers $h1

id title  done
-- -----  ----
 1 ???   False


PS C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api> $e1 = "a$(Get-Random)@demo.local"                                   # 邮箱带随机数，重复跑不会 409
>> Invoke-RestMethod -Method Post "$base/auth/register" -ContentType 'application/json' -Body "{`"email`":`"$e1`",`"password`":`"secret123`"}" | Out-Null
>> $t1 = (Invoke-RestMethod -Method Post "$base/auth/login" -ContentType 'application/json' -Body "{`"email`":`"$e1`",`"password`":`"secret123`"}").token
>> $h1 = @{ Authorization = "Bearer $t1" }
>>
>> $task = Invoke-RestMethod -Method Post "$base/tasks" -Headers $h1 -ContentType 'application/json' -Body '{"title":"第一条"}'
>> $task                                                               # 期望 id/title/done
>> Invoke-RestMethod "$base/tasks" -Headers $h1

id title  done
-- -----  ----
 2 ???   False
 2 ???   False


PS C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p2-task-api> $e2 = "b$(Get-Random)@demo.local"
>> Invoke-RestMethod -Method Post "$base/auth/register" -ContentType 'application/json' -Body "{`"email`":`"$e2`",`"password`":`"secret123`"}" | Out-Null
>> $t2 = (Invoke-RestMethod -Method Post "$base/auth/login" -ContentType 'application/json' -Body "{`"email`":`"$e2`",`"password`":`"secret123`"}").token
>> try {
>>   Invoke-RestMethod "$base/tasks/$($task.id)" -Headers @{ Authorization = "Bearer $t2" }
>>   '? B 读到了 A 的任务（越权！）'
>> } catch { "? B 被拒：" + $_.Exception.Message }
✓ B 被拒：远程服务器返回错误: (404) 未找到。
```

### 3 云端 CI

- 仓库：https://github.com/xiaogumomo/js-node-30days
- 最近一次 success：`5861767`（19s）

### 4 三个项目在哪（明天被问"在哪"就打开这张表）

| 项目 | 路径（相对仓库根） | 一条命令 |
|---|---|---|
| p0 工具箱 | `week1-language/p0-toolkit/` | `pnpm test` → 27 |
| p1 CLI | `projects/p1-cli-organizer/` | `node --test` → 18 |
| p2 API | `projects/p2-task-api/` | `node --test` → 39；`node src/server.js` |

### 5 数字速查（明天可能被用到）

| 数 | 值 |
|---|---|
| 仓库整体测试 | 85/85 |
| 三个项目 | 27 + 18 + 39 |
| CI | `5861767` success，19s |
| 突变检查 | 13/13 |
| 覆盖率（最新） | line 98.22 / branch 88.73 / funcs 95.45 |
| 提交数 | 58 次（9/14 起） |




## 抽考

| # | 题 | 结果 | 记账 |
|---|---|---|---|
| 11 | 事件循环六阶段 | | |
| 24 | 看得见 ≠ 落盘 | | |


事件循环六个阶段

timer阶段   setTimeout/setInterval回调
poding callback  接收I/O 延迟回调
idle/prepare  node.js内部
poll   接收I/O回调并返回
check  setImmediate 的回调
close callback  关闭事件的回调
为什么"微任务"是在两个宏任务之间跑的？
首先微任务是在每次执行完一次回调就清一次，
为了保证不拖到下一个事件循环开始，影响同步代码，

看得见 ≠ 落盘
BEGIN 事务 看得见是因为连接开着数据还处于待结算的状态（需要COMMIT和ROLLBACK）才能落地，换个连接之后，在该连接处就看不到数据了，因为在前一个连接数据还没有落地，新连接只看已落地的数据和该连接待结算的数据，看不到别的连接还没落地待结算的数据


## 记账三列

- AI 给的：搬哪几行 / 包成什么形状 / 三个坑 / 工具那处修复/"谁开的谁关 / onClose 挂载点 / 入口骨架修正 / CMD 形式的知识 / 第 9 处差异"
- 我自己写的：db.js 全文 + server.js 的两处改动/handler 本体和日志文案/讲解稿
- AI 帮我定位的：js 扩展名那处、ORDER BY id、模块顶层那处

## 时间账（计划 vs 实际，收尾跑 `node tools/sp-tasks.js today`）

| 格 | 计划 | 实际 | 
|---|---|---|
| | 计划 335m |计划 335m  |

（**LC 少计**）
讲解日 21/10（+11）   JWT 68/40（+28）   主体A 87/75（+12）   主体B 38/30（+8）
轮转 39/45（−6）      活体 24/30（−6）   docker 9/20（−11）
基线 0/20（没计时）   LC 3/20（**少计了** —— 你实际花了 23 分钟）

## 给明天的准备清单

- [ ] 演示三件套（本机测试 / 服务活体 / CI 页）已就绪
- [ ] 3×3 讲稿出声讲过一遍
- [ ] 数字速查表填好
- [ ] （明早 15 分钟）彩排没答上的追问再看一遍

## 一句话日志

（今天学会了什么 / 卡在哪 / 明天第一件事）
Map数组的一些用法

卡在 db.js自己写导致手滑很多，
重写jwt时候，少！


## 判据有牙 讲解日


我自己讲的：
判据有牙就是判据必须能自己讲清究竟是防什么的，不能明确的话应该当这个判据是没有用或者意义不大的。就比如我代码中出现uersId404假绿，其实测试代码本身输入就是undefined，导致的404是测试代码的问题，检查原代码没问题才发现的， 所以所这种假绿是很难发现的，后来将usersId改为id时才能真正防住测试需要防住的地方（测试代码没问题），我认为这个判断有牙能力是很重要的，让你以较少的测试防住大部分的问题，提升效率的同时又保证高分支覆盖率（关于"借来的红不算"（基线就红的测试不算它抓到）
一条测试里两条断言、有一条是空的（PRAGMA table_(tasks) 恒成立那条）的例子我举不出来，需要你看了之后给我这个问题的完整版）。


示例 1 修正版：/tasks/undefined 的 404 假绿（照着讲版）
什么坏法：越权——A 能读到 B 的任务（隔离条件失效或被删）。 怎么露馅：隔离测试断言"B 访问 A 的任务 → 404"，跑出来真的是 404，测试是绿的。但 404 有两个来源：① 记录压根不存在 ② 被隔离挡住。那次是 ① ——URL 里的 id 变量取错了来源，实际请求打到了 /tasks/undefined。它绿，是因为它什么都没测。 证据（这一步才是"牙"的证明）：把隔离条件删掉（制造一次真越权）→ 这条测试照样绿 ✗。 后来怎么防：加前提断言——"A 先 GET 自己的任务 → 必须 200"。先证明"记录真的存在、token 真的有效"，之后 404 才只剩一个解释 = 被挡住。

示例 2 完整版："借来的红不算"
什么坏法：判据自己没牙，却被别的坏东西弄红了，看起来像"抓到了"。 场景（10/6 负向验证实测）：突变检查器的判分逻辑是"把实现改坏一处 → 测试红 = 抓到"。那次拿"没修 bug 的实现"跑参照判据：基线自己就有 4 条红。这时某些突变让判据变红——但那红可能来自基线那 4 条，跟这个突变没关系 = 借来的红。 怎么防：判分前先证明基线全绿——只有"从全绿变红"才算抓到。 一句话："先证明它本来是绿的，它变红才有意义"（跟前提断言是同一个思想：让"红"只有一种解释）。

示例 3 完整版："两条断言，有一条是空的"
什么坏法：一条测试里有多条断言，有的有牙、有的是"永远成立"的摆设 → "有没有牙"要一条一条断言地看，不是一句测试地看。 场景（10/7）：09 空 title 这条测试有两条断言——① 坏输入 → 400（有牙 ✓：实测把实现改成"空 title 也收下"，它真红了）；② "列表不能多出一条"（空的 ✗：它查的是 PRAGMA table_(tasks)——少个 info 的坏语句；prepare 不报错、.all() 返回空数组 → 两边都是 0，恒成立。就算把 table_info 写对，数的也是列不是行，仍然不是想测的东西）。 露馅手法：逐条做负向验证——把坏法做出来，看这一条断言的走向；不变 = 没牙。 附带一个新形态（进"静默失效"族）：写坏的 SQL 伪语句不报错，只返回空。
