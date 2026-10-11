# Day 25 — 2026-10-11（周日）**清账 + 部署起步**

> **状态：待填写**　｜　任务书：[`day25-deploy.md`](day25-deploy.md)
> **实际开始 __:__**　｜　**今天**：上午清账 8 笔 → 下午部署起步（Railway）
> **判据（硬）**：① **突变 13/13**（工具锚点换 pg 后）② 小账逐条打勾 ③ 部署：公网地址 `/health` → `{"ok":true}`（打不通就明确记账）
> **规矩**：清账日不用新知识点；一块一跑；每条都要有自己的判据输出

## 开场已知（AI 08:45 核过）

- 昨晚提交已推送 ✓（`9009425`）；**⚠️ 但 `docker-compose.yml` 有一处没提交**（db 的 `ports` 映射 —— 昨晚的提交清单是我漏列的，我的账）
- **Docker 引擎没跑** → 先 `docker desktop start` ＋ `docker compose up -d db`（判据：`psql` 回 `PostgreSQL 16.15`）
- 提交信息里 `$1` 被 PowerShell 吃掉变成了 `\`（`pg pool / \ params`）→ 以后 commit message 含 `$` 用**单引号** ✓

## 今日目标

- [x] ① **突变工具锚点换 pg**（M5/M6/M7 的 `$n`、M12 的 `n === 0`）→ **13/13**
- [x] ② 服务活体（精简）：B 的 token 读 A 的任务 → 404
- [x] ③ `:id` 非数字 → 404/400（现在 pg 回 500）
- [x] ④ 判据里的契约文字对账（`DB_FILE` → `DB_URL`）
- [x] ⑤ Fastify `host:'0.0.0.0'`（部署前置）
- [x] ⑥ 补"列表按 id 排序"断言
- [x] ⑦ README 对账（依赖 + pg / 数据持久化那条重写）
- [x] ⑧ 轮转 #11（事件循环）+ LC O(n) 两版（`{}` / `Map`）
- [x] ⑨ 部署：本机自检（`--build app` + `docker stop` 看到优雅退出）
- [x] ⑩ 部署：平台（Railway）→ 公网 `/health` ✓
- [x] ⑪ 收尾：日志 / 计划 vs 实际 / commit + push

## 判据结果

| 判据 | 目标 | 实际 |
|---|---|---|
| `node tools/mutation-check.js` | **13/13** | 13/13|
| 服务活体（B 读 A） | 404 |404 |
| `GET /tasks/abc` | 404/400（不是 500） |404/400 |
| `node --test`（改 host / 排序断言后） | 39/39 | 40/40|
| 本机容器自检 | app 起得来 + `docker stop` 两行日志 | docker stop` 两行日志|
| **线上** | `<域名>/health` → `{"ok":true}` | `{"ok":true}`|

## 卡点与教训（当天记）

| 卡在哪 | 性质 | 处理 |
|---|---|---|
|容器里连不上 npmjs|网络环境|镜像里改用 npmmirror|
|Railway不熟悉界面|刚开始|ai引导一步步部署|
|"部署成功≠最新代码"（ACTIVE 是 day24 → 502 → 空提交重部署 ✓）|细节问题|重新add+push|
| railway.app 已改名 railway.com |信息漏洞|改名重新进|
|502 = 边缘通了应用没应答 |细节问题|更新上传git云端仓库|

## 记账三列

- AI 给的：突变工具锚点改法 / npmmirror 那行 / 部署引导 / 三条新判据 / README 全文
- 我自己写的：处 id 守卫（req.params ✓）+ host + LC 两版
- AI 帮我定位的：req,params.id 那个逗号 ✓ / 注册的 info.id ✓ / [] 当表 ✓ / need 漏声明 ✓

## 时间账（收尾跑 `node tools/sp-tasks.js today`）

| 格 | 计划 | 实际 |
|---|---|---|
||计划 405m| 实际 220m|

（部署：Railway 平台操作（公网 /health）与部署自检：--build app + docker stop 看优雅退出时间记在一起了）
  45m →    3m  [10/11] 16:00 收尾：日志 + 计划vs实际 + commit + push
 120m →    0m  [10/11] 14:00 部署：Railway 平台操作（公网 /health）
  60m →   56m  [10/11] 13:00 部署自检：--build app + docker stop 看优雅退出
  60m →   70m  [10/11] 11:00 README 对账 ／ 轮转 11 ／ LC O(n) 两版
  20m →    8m  [10/11] 10:40 Fastify host 0.0.0.0 ／ 补列表排序断言
  30m →   49m  [10/11] 10:10 :id 非数字 → 404 ／ 判据契约文字 DB_FILE→DB_URL
  20m →   29m  [10/11] 09:50 服务活体（精简）：B 的 token 读 A 的任务 → 404
  50m →    5m  [10/11] 09:00 突变工具锚点换 pg（M5/M6/M7 的 $n、M12）→ 13/13
—— 今天：计划 405m / 实际 220m

## 一句话日志

（学会了什么 ／ 卡在哪 ／ 明天第一件事）

学会了什么：
| 场景 | 该回什么 | 为什么 |
| --- | --- | --- |
| 没带 token | 401 | 先验身份 |
| 带了 token，但 id 不是数字 / 记录不存在 / 不是你的 | 404 | 不泄漏"存在性" |
| 都对 | 200 | — |



## ① 轮转 #11

六个阶段名字 + 顺序
setTimeout/setInterval 属于哪个阶段？setImmediate 呢？
机制：为什么微任务是在两个宏任务之间跑的？（用自己的话 —— 要点是"一个宏任务执行完、在取下一个之前，微任务队列会被清空"✓）


timer阶段 setTimeout/setInterval回调
poding callback阶段 延迟I/O的回调
idle/prepare  node.js内部
poll阶段   处理I/O的回调
check callback  setImmediate的回调
close阶段   关闭事件的回调

保证每个微任务的连贯顺序，每个宏任务完成之后对应的微任务清空，防止被之后的宏任务插队，同时让异步代码行为可预测（异步代码按顺序进行）
