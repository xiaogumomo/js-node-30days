

# p2-task-api(任务管理RESTAPI)

带认证的多用户任务管理接口（Fastify + ` node:sqlite`）;


## 装

   pnpm install --frozen-lockfile


## 跑
   node src/server.js   #默认3000 可用 PORT 覆盖
   PORT=3100 node src/server.js

## 测
   pnmp test                  # =node --test (13条edge-cases + 三份判据)
   node tools/mutation-check.js   #判据的牙：13种‘只改坏一处’的实现


## API（简表）

   POST /auth/register     {email,password}     -> 201
   POST /auth/login        {email,password}     -> 200{token}
   GET|POST|PATCH|DELETE/tasks[.../:id]         -> 需要 Authorization：Bearer <token>
   别人的任务一律404


## 已知限制
  
  数据层还是`node:sqlite`(未换 Postgres)
  容器里跑时 sqlite 数据**不持久** （换pg前别指望数据留着）
  没有优雅退出（收到SIGTERM直接死）
  `--json`选项类型该是`boolean`(现在是`string`,必须带值)
  