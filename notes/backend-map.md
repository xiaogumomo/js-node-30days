# 后端地图 —— 行业里"后端"有哪些部分 · 我在哪

> 起因：10/16 晚他问"我是否已经把后端部分都基本学过了？”
> **答案**：不是"全学过了"，而是——**你已经独立交付过一个"单体后端服务"的完整生命周期**（写 → 测 → 容器化 → CI → 云上跑）。
> 这是后端的**主干** ✓；缺的是三类：**深度块**（缓存/队列）· **运维面**（Linux/Nginx/监控）· **规模化**（微服务/性能）。
> 标记：✅ 做过且有证据 ／ ◐ 碰过但不完整 ／ ❌ 没接触

## 一、语言与运行时
| 块 | 我 | 在哪 / 说明 |
|---|---|---|
| JS / Node 运行时 | ✅ | 30 天全在 Node 上（`week1-language` / `week2-runtime`）|
| 事件循环 / 异步 | ✅ | `day08/09-event-loop.js`；`async/await`、未处理拒绝 |
| TypeScript | ◐ | 只做过 p0 的类型剥离 + `tsc --noEmit` |
| 其他语言（Java/Go/Python）| ❌ | 不必现在补 —— 校招后端的"语言"是分叉路，你已选 Node 这条 |

## 二、Web 框架与 API 层
| 块 | 我 | 在哪 |
|---|---|---|
| HTTP 服务与路由 | ✅ | `projects/p2-task-api/src/server.js`（11 条路由）|
| 中间件 / 钩子 | ✅ | `server.js:129` `onRequest`（认证钩子）|
| 统一错误处理 | ✅ | `server.js:116` `/boom` 就是为它准备的 |
| 请求校验 | ✅ | `POST /tasks` 空 title → 400（判据 09）|
| REST 风格 | ✅ | 资源 + 方法 + 状态码（`GET/POST/PATCH/DELETE /tasks/:id`）|
| 认证与鉴权 | ◐ | **JWT + scrypt 哈希 ✅**；**refresh token / 登出 / RBAC ❌**（早已记为欠账）|
| API 版本 / 分页 / 限流 | ❌ | 没做过 —— 校招常问"怎么做分页/限流"，属于要能说清的 |

## 三、数据层
| 块 | 我 | 在哪 |
|---|---|---|
| 关系库 + SQL | ✅ | PostgreSQL：迁移 / 事务 / 索引 / `$1` 参数绑定 |
| 连接池 | ✅ | `src/db.js:25` `new Pool(...)` |
| 行映射 / 数据形状 | ✅ | `db.js:10-11` `toTask` / `toUser` |
| 查询优化 / 执行计划 | ◐ | 看过 `SCAN` vs `SEARCH`（索引那题），没做过真优化 |
| ORM | ❌ | 用的是驱动 `pg`（**这不算 ORM** —— 面试别混）|
| NoSQL（Mongo 等）| ❌ | 没接触 |
| **缓存（Redis）** | ❌ | **最大的实用缺口**（JD 里就点名了）|

## 四、缓存 / 队列 / 搜索（"深度块"）
| 块 | 我 | 说明 |
|---|---|---|
| 缓存（Redis：缓存/会话/计数器）| ❌ | 补课 0.5–1 天：能说清"缓存什么、过期策略、穿透/雪崩"|
| 消息队列（Kafka / RabbitMQ）| ❌ | 0.5 天：能说清"为什么要削峰/解耦"、起一个 demo |
| 搜索引擎（ES）| ❌ | 不在 JD 硬要求里，先不管 |

## 五、并发 / 异步 / 任务
| 块 | 我 | 在哪 |
|---|---|---|
| 异步与并发控制 | ✅ | `week2-runtime/day13-p-limit.js`（并发上限）|
| 后台任务 / 定时任务 | ❌ | 没做过（worker / cron）|
| 流式处理 | ✅ | p1 的 `pipeline` 流式复制；NDJSON（`day11-ndjson.js`）|

## 六、可靠性 / 弹性（★ 这块你比多数应届生强）
| 块 | 我 | 在哪 |
|---|---|---|
| 超时 / 重试 / 指数退避 | ✅ | `src/http.js` `requestJson` |
| 幂等 | ✅ | 概念 + 判据（重试的前提）|
| 优雅退出 | ✅ | `server.js:133` `onClose → pool.end()`；容器里真验过 |
| 健康检查 | ✅ | `GET /health` → `{"ok":true}`（本机 + 云端都验过）|
| 结构化日志 | ✅ | pino（含"日志里不许出现 key"的判据）|
| 错误分类 | ✅ | 用户错 / 系统错 / 可重试（p1 的 `HINTS` + `MoveError`）|
| 熔断 / 降级 / 限流 | ❌ | 没做过（能说清即可）|

## 七、测试与质量（★★ 你最强的一块，是真的稀缺）
| 块 | 我 | 在哪 |
|---|---|---|
| 单元 / 集成 / 回归 | ✅ | 136 条判据；仓库根一条命令可复验 |
| 测试替身（假服务器）| ✅ | p3 的 8 个判据文件全走假服务器 |
| 判据即契约 / 判据的牙 | ✅ | 反向验证（参照实现 + 故意改坏）|
| 端到端 / 冒烟 | ✅ | `scratch/03-rag-demo.js`、服务活体 curl 全流程 |
| 覆盖率 / 契约测试 | ❌ | 没做过（不是硬要求）|
| **一次自己设计的测量实验** | ✅★ | 54 次检索实验 + 拒答阈值 —— **这个比多做两个 CRUD 值钱** |

## 八、部署 / 运维（DevOps）
| 块 | 我 | 在哪 |
|---|---|---|
| Docker / compose | ✅ | `Dockerfile`（多阶段 + 非 root）+ `docker-compose.yml` |
| CI | ✅ | `.github/workflows/ci.yml`（今天还修好了"红 3 天"）|
| 配置与代码分离 | ✅ | `.env` / `.env.example` / 平台变量 |
| 云平台部署 | ✅ | Railway（根目录 / 变量 / `Generate Domain`）|
| **Linux 服务器** | ❌ | 只会 Git Bash/PowerShell；**没上过真 Linux** |
| **Nginx** | ❌ | 没接触（反向代理 / 静态资源 / 负载均衡）|
| K8s | ❌ | 没接触（校招一般不要求，知道概念即可）|
| 监控告警（Prometheus/Grafana）| ❌ | 没接触 |
| 可观测性 | ◐ | 结构化日志 ✅；**链路追踪 ❌** |

## 九、安全
| 块 | 我 | 在哪 |
|---|---|---|
| 密码存储 | ✅ | scrypt + 随机盐 + `timingSafeEqual` |
| 认证令牌 | ✅ | 手写 JWT HS256 |
| SQL 注入 | ✅ | 参数绑定（`$1`），从不拼 SQL |
| 越权 / 数据隔离 | ✅ | `WHERE userId` + 404 不外泄存在性 |
| 密钥管理 | ✅ | key 只进 `.env`，不许进代码/日志/git |
| XSS / CSRF / OWASP | ❌ | 没接触（前端起来后会碰到）|

## 十、架构与协作
| 块 | 我 | 说明 |
|---|---|---|
| 模块化 / 抽象分层 | ✅ | p3 的六模块（http 公共层 / 适配器 / 串线层）|
| 接口契约 | ✅★ | "要么返回结果要么抛错"、契约写在文件头 |
| MVC / 分层架构 | ◐ | 事实上分了层，但没按行业名词说过 |
| 微服务 / gRPC / 网关 | ❌ | 没接触（校招：知道概念 + 说清取舍即可）|
| Git 协作（PR / Code Review）| ◐ | Git 熟练，但**单人开发，没有 PR/评审经验** |

---

## 结论（三句话）

1. **主干✅**：你独立交付过一个单体后端的**完整生命周期**（写 → 判据 → 容器 → CI → 云上跑）—— 这条链很多应届生没有。
2. **缺的是"横向深度块 + 运维面"**：**Redis / Kafka / Nginx / Linux / 监控**（前四个 JD 点名）+ 缓存与分页限流的基本功。
3. **不缺"学新块的能力"**：这一周你已经证明过 —— 一天上手栈、查出并修好 CI、今天又把部署链捋顺。**缺的块都是"接上去"，不是"从头来"。**

→ 正好对上 `plan-next-8weeks.md` 第 2 段（11/03 起）：**先 Redis → 再 Nginx → Linux → 监控，Kafka 排最后**（校招出现频率的顺序）。




1， JAVASCRIPT基础： 基本数据类型， 初始化，  函数闭包； （ JavaScript权威指南 你不知道的JavaScript），  TypeScript程序设计   至少看2遍

2. Node.js 网络协议: 
（1）  TCP 和 UDP 协议， 长连接实时通信 TCP有向连接  UDP无向连接， 做一个简单的 server, client的demo  服务端监听， 客户端请求， 要求最简单的demo [简单的一个聊天服务器]
 (2)  HTTP 和 HTTPS 协议， HTTP 是基于 TCP 的应用层协议，采用请求-响应模型，广泛用于 Web 开发。  做一个最简单的web服务器   登陆请求。
 （3） 新兴协议：SSE 和 Streamable HTTP； SSE 是一种单向通信协议，适用于实时推送消息：

 3. 数据库
（1） 关系型数据库： Mysql, PostgreSQL; 关系型数据库（Relational Database）基于 1970 年 Edgar Codd 提出的关系模型，通过“表（Table）”存储结构化数据，每个表由行（记录）和列（字段）组成，并通过主键、外键建立表间关联。 有哪几种关联关系。 做一个RBAC权限管理系统

(2) nOsql: mongodb, clickhouse

4. Redis学习

5. 消息队列， 用 Redis做一个消息队列服务， 其他的消息队列了解。


AI 相关
langchain, langgrap  pi-mono
https://github.com/langchain-ai/langchainjs
官方文档： https://docs.langchain.com/
https://github.com/earendil-works/pi      Agent 框架
https://github.com/deepseek-ai/deepseek-harness
找工作： Agent开发