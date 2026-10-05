# Day 19 任务书（10/5 周日）：认证与授权 —— 注册 / 登录 / 保护路由 / 只能看自己的

> **日期**：2026-10-05（周日）　｜　**实际开始 08:25**（时间表按此排）　｜　**第 3 周 Day 3**
> **接昨天**：10/4 两块"不许砍"全绿（骨架 **7/7**、CRUD **9/9**）+ 全仓 **62/62**；④ 阅读四行 + 无权限实测也清了 ✓
> **今天的目标**：项目 2 加**认证**——注册 / 登录 / 任务接口全部要 token / **每个人只能看到自己的任务**
> **判据三份都已就位（AI 写 + 负向验证过）**：`auth.test.js`（**10 条**）+ 两份**回归**：`server.test.js`（7/7）、`tasks-crud.test.js`（9/9）

---

## 〇 开工前 3 分钟：产出物 + 为什么做它

| # | 产出物 | **为什么做它** | 验收 |
|---|---|---|---|
| 1 | `db/migrations/002_users.sql` | **迁移文件的第二次实战**：建 `users` 表 + 给 `tasks` 加"属于谁"的列 —— **库的结构变更也要进 git** | 文件进 git；服务启动能应用它 |
| 2 | `src/server.js` 里的小迁移执行器（~10 行）| 因为 `ALTER TABLE` **不能重复执行**（第二次启动会报 `duplicate column name`）→ 所以要记录"哪些迁移跑过了"。**这才是"迁移"的完整样子** | 重启两次不报错 |
| 3 | 注册 / 登录端点 | 账号体系的地基；**密码绝不明文入库**（哈希 = 加盐 + 慢哈希 + 不可逆）| `POST /auth/register` 201；`POST /auth/login` 200 + `{token}` |
| 4 | **给 5 条任务路由加鉴权** | 现在 `GET /tasks` 谁都能看 —— 这是**最典型的越权漏洞**；`userId` 隔离后，别人的数据一律 404 | 不带 token → **401**；带 → 正常 |
| 5 | `week3-backend/day19-auth-basics.js` | 哈希和 JWT 是**第一次上手**，必须先亲手各写一块 | 两个小 demo 各自跑通 |

> ⚠️ **启动标准**：做完"复习触点 ①②"（15 分钟）就算启动成功。

### 卡住时的第一步：先分类（心法第 1 条补充）

| 长什么样 | 处理 |
|---|---|
| **(a) 学过但取不出来**（`crypto.scryptSync`、`Buffer.from(x,'base64url')`、`ALTER TABLE`）| 只指路到你的材料/官网 → **合上重写** |
| **(b) 还没学过**（`crypto.createHmac`、JWT 签名、`timingSafeEqual`）| **直接问"它是什么/怎么用"** → 拿最小示范 → 自己写一块 |

**时间盒**：卡住 15 分钟必须换路子。**今天的计数单位**：判据从几条红变几条绿（目标：`0→10`、`0→7`、`0→9`）。

---

## 一 今天的时间表（按 08:25 排）

| 时段 | 干什么 | 计划 |
|---|---|---|
| **08:40–08:45** | 轮转复习 **`p-limit`**（间隔表 **D+3**）→ `node --test week2-runtime/day13-p-limit-verify.js` | 5 分 |
| **08:45–09:00** | **合上重写 `src/server.js`**（三阶法第 3 阶：从前天的 7/7 版本重写一遍；**判据现成**）| 15 分 |
| **09:00–09:20** | **读**（见 §二 的"阅读三件套"）| 20 分 |
| **09:20–09:50** | **拆块 ①**：`scrypt` 哈希 + 验证（`week3-backend/day19-auth-basics.js`）| 30 分 |
| **09:50–10:20** | **拆块 ②**：手写 JWT（sign / verify；"改一个字符就验不过"）| 30 分 |
| **10:20–10:45** | **拆块 ③**：迁移执行器 + `db/migrations/002_users.sql` | 25 分 |
| **10:45–12:30** | **拼装 A**：`register` + `login` → curl 通 | 105 分 |
| 12:30–13:20 | 午饭 + 离开屏幕（**不计时**）| — |
| **13:20–15:30** | **拼装 B**：5 条任务路由加鉴权 + **越权隔离** | 130 分 |
| **15:30–16:10** | **判据**：`auth.test.js` **10/10** + 回归 `server.test.js` **7/7**、`tasks-crud.test.js` **9/9** | 40 分 |
| **16:10–16:30** | 收尾：日志 + `node tools/sp-tasks.js today`（计划 vs 实际）+ `commit` + `push` | 20 分 |

**砍单顺序**（不够就从下往上）：① **refresh token / 登出**（计划里有，今天**先不做**，记欠账）→ ② RBAC（角色/权限矩阵）→ ③ JWT 过期时间调优 → ④ 探针里的 `?done=` 过滤。
**不许砍**：**auth 10/10** + **两份回归判据绿** + `002_users.sql` 进 git。

---

## 二 读（20 分钟，**阅读三件套** —— 心法第 11 条）

**① 读什么（就这 4 条编号）**：

1. **为什么密码要"哈希 + 盐"**（不是加密、更不是明文）—— 到底能挡住什么
2. **JWT 的三段结构**：`header.payload.signature` 各是什么；签名怎么算（HMAC-SHA256）
3. **为什么签名能防篡改**（改一个字符，签名就对不上）
4. **越权为什么返回 404 而不是 403**（403 会泄露"这条存在"）

**② 读到什么程度就停**：每一条能**用自己的一句话**说出来（尤其第 2 条：**能自己在纸上写出签名公式**，写不出就还没懂）

**③ 不要点开**（负面清单）：refresh token 的完整协议 / RBAC 矩阵 / JWT 的 RSA·ES256 / session 存储方案对比 / OWASP 全表 → **那些是"能做就做"或明天** ✓

**④ 读完产出**：4 行笔记（**不抄文档**）+ **每读完一块，立刻去拆块 ①② 写一版** ✓

> **查不到就看我给的"起手式"**（§三 的示范那两段）—— 但**先自己写**，卡住再对照 ✓

---

## 三 做（契约 —— 判据照这个判）

### 0 今天的依赖决定：**零新依赖**

| 要什么 | 用什么 | 为什么 |
|---|---|---|
| 密码哈希 | **`node:crypto` 的 `scrypt`** | 和 bcrypt / argon2 **同类**（加盐 + 慢哈希 + 不可逆）；Node 内置 ✓ **不用装 native 模块**（Windows 上 bcrypt/argon2 常编译失败）|
| JWT | **手写 HS256**（`crypto.createHmac` + `base64url`）| ① 你的 ④ 阅读刚写过"依赖越少越好" ② **手写才真的懂 `header.payload.signature`**（面试会问）③ 一个库只值 20 行 |

### 1 迁移：`db/migrations/002_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT    NOT NULL UNIQUE,
  passwordHash TEXT    NOT NULL,
  createdAt    INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE tasks ADD COLUMN userId INTEGER;
```

⚠️ **`ALTER TABLE ... ADD COLUMN` 不能重复执行** → 所以需要**迁移执行器**（10 行）：

```js
function runMigrations(db) {                                    // ← 这是"迁移"的完整样子
  db.exec('CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, appliedAt INTEGER NOT NULL)');
  const done = new Set(db.prepare('SELECT name FROM _migrations').all().map((r) => r.name));
  for (const f of fs.readdirSync(MIG_DIR).filter((x) => x.endsWith('.sql')).sort()) {
    if (done.has(f)) continue;                                  // 跑过的跳过 ✓
    db.exec(fs.readFileSync(path.join(MIG_DIR, f), 'utf8'));
    db.prepare('INSERT INTO _migrations (name, appliedAt) VALUES (?, ?)').run(f, Date.now());
  }
}
```
（`001_init.sql` 保持不变 ✓ 第一次启动它会被记为"已应用" ✓）

### 2 端点契约

```
POST /auth/register  {"email":"…","password":"…"} → 201 + JSON（**返回体里不能有密码**）
                      邮箱已存在 → 409 / 400（靠 users.email 的 UNIQUE 约束挡，再翻译成 409）
POST /auth/login     {"email":"…","password":"…"} → 200 + {"token":"…"}
                      密码错 / 邮箱不存在 → 401（**都用 401**，别用 404 泄露"这个邮箱注册过"）
GET/POST/PATCH/DELETE /tasks…  → **必须带 `Authorization: Bearer <token>`**
                      · 不带 / token 乱码 → **401 + JSON**
                      · 带上 → 正常
**隔离**：所有查询都要带 `AND userId = ?`；别人的任务 → **404**（不是 403）
**JWT 密钥**：读 `process.env.JWT_SECRET`，**默认值自己定一个**（⚠️ 别每次启动随机生成 —— 那样"重启后旧 token 全失效"，判据的跨进程测试也会红）
```

### 3 三个"起手式"（拆块卡住时看，**别整段抄**）

```js
// ① 密码哈希（加盐 + 慢哈希；验证用 timingSafeEqual 防时序攻击）
const crypto = require('node:crypto');
function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${crypto.scryptSync(String(pw), salt, 32).toString('hex')}`;
}
// ② JWT 签名（HS256）—— header 和 payload 各自 base64url，再对 "head.body" 做 HMAC
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
// ③ 鉴权：从 Authorization: Bearer xxx 里取出 token → 验签 → 拿到 userId；失败就 401
```

### 4 跑

```bash
node --test projects/p2-task-api/test/auth.test.js        # 目标 10/10
node --test projects/p2-task-api/test/server.test.js      # 回归，目标 7/7
node --test projects/p2-task-api/test/tasks-crud.test.js  # 回归，目标 9/9
```

> ⚠️ **两份回归判据今天也改了**（AI 记账）：加了鉴权后，它们打 `/tasks` 时必须带 token —— 所以我在里面加了"先注册+登录拿 token"。**这不是你弄坏了它们**，是**契约变了、判据跟着变** ✓（这也是"测试"的价值：加了功能，老的不能坏）

---

## 四 四条提醒

1. **顺序**：`node --check` 在加代码之前；`git status` 在 `git add -A` 之前；**每写完一块跑一次**。
2. **判据的牙**：每条能说出"它在防哪种坏法"。今天最好的一条 = `01`（**自己去读库，确认密码没明文**）和 `07`（**越权**）。
3. **记账三行**（今天的固定格式）：**AI 给的** / **我自己写的** / **AI 帮我定位的** ← 最后这列今天目标 **≤ 3 处**（"报错第一行就写着"那种，先自己读）。
4. **安全底线**（今天第一次碰到"安全"这件事）：**密码不落明文、token 必须验签、别人的数据一律 404** —— 这三条不是"功能"，是**不能破的底线** ✓
