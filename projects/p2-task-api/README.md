
# p2-task-api(任务管理 REST API)

带认证的多用户任务管理接口（Fastify + pg / PostgreSQL）


## 装

   pnpm install --frozen-lockfile


## 跑

   # ① 先起数据库（端口映射在 127.0.0.1:5432）
   docker compose up -d db

   # ② 再起服务（默认 3000，可用 PORT 覆盖）
   node src/server.js
   PORT=3100 node src/server.js

   # 数据库连接串读 DB_URL，默认：
   #   postgres://app:secret@127.0.0.1:5432/tasks
   # （容器之间互联才用服务名 db —— compose 里 app 连的就是 db）


## 测

   pnpm test                       # = node --test（40 条：edge-cases + 三份判据）
   node tools/mutation-check.js    # 判据的牙：13 种"只改坏一处"的实现

   # ⚠️ 判据连的是【真库】：每个判据文件一个独立测试库（tasks_test_*，
   #    见 tools/testkit.js），跑测试前要先有 Postgres（docker compose up -d db）


## API（简表）

   POST /auth/register     {email,password}     -> 201 {id,email}
   POST /auth/login        {email,password}     -> 200 {token}
   GET|POST|PATCH|DELETE /tasks[.../:id]        -> 需要 Authorization：Bearer <token>

   别人的任务一律 404；非数字 id 也 404（不泄漏"存在性"）


## 已知限制

   迁移是手写简化版：够用，但没有版本号、没有回滚
   没有 refresh token / 登出 / 按角色的权限
   `?done=` 过滤还没做（判据探针里记着这件事）
