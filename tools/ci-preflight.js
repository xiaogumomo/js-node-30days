#!/usr/bin/env node
// ============================================================
// tools/ci-preflight.js —— Day 21（10/7 容器化与 CI）的判据 · AI 写
//
// **它能验什么、不能验什么，先说清楚**（今天的诚实边界）：
//   ✅ 能验：四个文本产物**在不在**、**引用的路径/目录真的存在**、关键要素齐不齐
//           （workflow 有 `--frozen-lockfile` 吗 / Dockerfile 是多阶段吗 / compose 有 app+db 吗）
//   ❌ 不能验：`docker build` 到底能不能过、`docker compose up` 能不能起来
//           —— 本机没有 docker（10/7 实测）→ 这条**只能等有 docker 时补验**，记进日志欠账
//   ⚠️ 所以今天"绿"的含义 = **静态引用全部对得上**，不等于"容器真的跑起来了"。别自欺。
//
// 用法：
//   node tools/ci-preflight.js          # 跑全部检查
//   node tools/ci-preflight.js --list    # 只列检查项
//
// 为什么这类检查值得做：**`COPY` / `working-directory` 的路径写错是新手最常见的一类错，
//   而且它正好是本机能抓、不用 docker 就能抓的那种**（同"静默失效"族：路径写错不会有人告诉你）。
//
// 负向验证（10/7 实测：先写一份**参照产物**，再逐个"只坏一处"跑，每次都从参照还原）：
//   · 参照产物 → **25/25 全绿、退出码 0**（就是上面那 24 条 + Dockerfile 多出来的"dockerfile 在 context 里找得到"）
//   · `COPY src ./src` → `COPY srcc ./src` → 只红在"COPY 的源路径"✓
//   · workflow 去掉 `--frozen-lockfile` → 只红在那一条 ✓
//   · Dockerfile 删掉第二个阶段（含 CMD）→ 红在"多阶段"+"有 CMD"（删的时候把 CMD 也删了 → 报两条是对的）✓
//   · compose 删掉 `db:` 服务 → 红在"有 postgres 库服务"+"POSTGRES_*"✓
//   · `.dockerignore` 删掉 `node_modules` → 只红在那一条 ✓
//   · 还原后 → 0 条 ❌ ✓（**变体之间必须还原** —— 本工具第一次跑负向验证时忘了还原，结果"改坏的版本"被当成了参照，全盘皆红）
// ⚠️ 工具的**三个 bug 也是这么抓出来的**（写在这里，省下你重新踩）：① `.dockerignore` 要跟着**构建上下文**走，
//   不是一定在仓库根 ② `compose` 里的 `dockerfile:` 是**相对 `context:`** 的，不是相对仓库根
//   ③ `COPY --from=<阶段>` 的源在**镜像里**，不是上下文里的路径（不能拿去检查"文件存不存在"）
// ============================================================
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

const WF = path.join(ROOT, '.github', 'workflows', 'ci.yml');
const COMPOSE = path.join(ROOT, 'docker-compose.yml');

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');
const exists = (p) => fs.existsSync(p);

// ── Dockerfile / .dockerignore 放哪由你定 → 工具自己找 ─────────
// 顺序：compose 里 `build.dockerfile` 指的 → 仓库根 Dockerfile → `projects/*/Dockerfile`
const dc0 = read(COMPOSE);
let DOCKERFILE = null;
{
  const m = /dockerfile:\s*['"]?([^\s'"]+)/.exec(dc0);
  const cands = [];
  if (m) {
    const ctx = /context:\s*['"]?([^\s'"]+)/.exec(dc0);
    if (ctx) cands.push(path.resolve(ROOT, ctx[1], m[1]));
    cands.push(path.resolve(ROOT, m[1]));
  }
  cands.push(path.join(ROOT, 'Dockerfile'));
  for (const d of ['projects', 'week1-language', 'week2-runtime', 'week3-backend']) {
    const base = path.join(ROOT, d);
    if (!fs.existsSync(base)) continue;
    for (const sub of fs.readdirSync(base)) cands.push(path.join(base, sub, 'Dockerfile'));
  }
  DOCKERFILE = cands.find((p) => exists(p)) || path.join(ROOT, 'Dockerfile');
}
// .dockerignore 跟着【构建上下文】走（一般就在 Dockerfile 旁边）
const DOCKERIGNORE = [path.join(path.dirname(DOCKERFILE), '.dockerignore'), path.join(ROOT, '.dockerignore')].find((p) => exists(p)) || path.join(ROOT, '.dockerignore');

// ── 检查项 ───────────────────────────────────────────────────
const results = [];
const record = (name, ok, detail) => results.push({ name, ok, detail });

if (process.argv.includes('--list')) {
  console.log('检查项：文件在不在 / workflow 关键要素 + 路径 / Dockerfile 多阶段 + COPY 源 / .dockerignore / compose app+db');
  process.exit(0);
}

// ── 1. 四个产物在不在 ────────────────────────────────────────
const files = [
  ['.github/workflows/ci.yml', WF],
  ['Dockerfile（工具自己找的）', DOCKERFILE],
  ['.dockerignore', DOCKERIGNORE],
  ['docker-compose.yml', COMPOSE],
];
for (const [label, p] of files) record(`文件存在：${label}`, exists(p), exists(p) ? `在 ${rel(p)}` : `还没写（找的是 ${rel(p)}）`);

const wf = read(WF);
const df = read(DOCKERFILE);
const di = read(DOCKERIGNORE);
const dc = read(COMPOSE);

// ── 2. workflow ─────────────────────────────────────────────
if (!wf) {
  record('workflow：关键要素', false, '文件不在，跳过');
} else {
  record('workflow：有 actions/checkout', /uses:\s*actions\/checkout/.test(wf));
  record('workflow：有 actions/setup-node', /uses:\s*actions\/setup-node/.test(wf));
  record(
    'workflow：装了 pnpm（corepack 或 pnpm/action-setup 都算）',
    /pnpm\/action-setup/.test(wf) || /corepack\s+(enable|prepare)/.test(wf)
  );
  record(
    'workflow：node 版本写了 24（和本机一致）',
    /node-version:\s*['"]?24/.test(wf),
    /node-version:\s*['"]?24/.test(wf) ? '' : '写 24：本机是 v24.21.0，CI 上版本不一致会出现"本地绿 CI 红"'
  );
  record(
    'workflow：用了 --frozen-lockfile（冻结依赖 = CI 的标配）',
    /--frozen-lockfile/.test(wf),
    /--frozen-lockfile/.test(wf) ? '' : '没有它，CI 会"悄悄"按 package.json 装一份新依赖 → 不可重现'
  );
  record('workflow：至少一条跑测试的命令（node --test / pnpm test）', /node\s+--test|pnpm(\s+-C\s+\S+)?\s+test/.test(wf));
  record('workflow：有触发条件（on: push / pull_request）', /^on:|^\s{0,2}on:/m.test(wf));

  // ⚠️ 10/8 实测：CI **真跑**时红在"装依赖"那一步 —— 注解只给 `exit code 127`（command not found），
  //    真因是 run 块里 `pnmp install` 拼错（`pnmp/action-setup` 那行改了，run 块里没改）。
  //    "路径存在 / 关键要素"这类检查**抓不到拼写** → 专门补一条：常见拼错点名。
  const typoRe = /\b(pnmp|pnm|npmp|pnp|pnpm\w*)\b(?=\s+(?:install|exec|run|add|test))/g;
  const typos = [...wf.matchAll(typoRe)].map((m) => m[1]).filter((t) => t !== 'pnpm');
  record(
    'workflow：命令拼写（run 块里的 pnpm / pnpm exec 之类）',
    typos.length === 0,
    typos.length
      ? `发现疑似拼错：${[...new Set(typos)].join('、')}\n     → CI 上会是 exit 127（command not found），而**注解只会说"exit 127"**，不会告诉你拼错了`
      : ''
  );

  // 引用的本地路径真的存在吗（working-directory / --dir / -C）
  const dirs = new Set();
  for (const m of wf.matchAll(/working-directory:\s*['"]?([^\s'"]+)/g)) dirs.add(m[1]);
  for (const m of wf.matchAll(/--dir[= ]\s*['"]?([^\s'"]+)/g)) dirs.add(m[1]);
  for (const m of wf.matchAll(/pnpm\s+-C\s+(\S+)/g)) dirs.add(m[1]);
  const bad = [...dirs].filter((d) => !exists(path.join(ROOT, d)));
  record(
    `workflow：引用的目录都存在（找到 ${dirs.size} 个）`,
    bad.length === 0,
    bad.length ? `这些目录不存在：${bad.join('、')}` : [...dirs].join('、') || '（没写 working-directory / --dir，那就在仓库根跑）'
  );
}

// ── 3. Dockerfile ───────────────────────────────────────────
if (!df) {
  record('Dockerfile：关键要素', false, '文件不在，跳过');
} else {
  const froms = [...df.matchAll(/^FROM\s+(\S+)(?:\s+AS\s+(\S+))?/gim)];
  record(
    `Dockerfile：多阶段（≥2 个 FROM，现在 ${froms.length} 个）`,
    froms.length >= 2,
    froms.map((f) => f[1] + (f[2] ? ` AS ${f[2]}` : '')).join(' ｜ ')
  );
  record('Dockerfile：有 WORKDIR', /^WORKDIR\s+/im.test(df));
  record('Dockerfile：有 CMD 或 ENTRYPOINT', /^(CMD|ENTRYPOINT)\s+/im.test(df));
  record(
    'Dockerfile：没有从【构建上下文】拷 node_modules',
    !/^COPY\s+(?!--from=).*node_modules/im.test(df),
    /^COPY\s+(?!--from=).*node_modules/im.test(df)
      ? 'node_modules 要在镜像里（重新）装，不能从本机拷；要拷也只能 `COPY --from=<阶段>`'
      : ''
  );

  // 每个 COPY 的"源"在【构建上下文】里存在吗 —— 这条最能抓错，也是本机能抓的
  // ⚠️ 两处容易搞错（本工具自己踩过）：① `COPY --from=xxx /app/a ./a` 的源在**镜像里**，不是上下文 → 整条跳过
  //   ② 构建上下文**不一定是仓库根**（Dockerfile 放在项目目录里时，上下文就是那个目录）→ 候选上下文都试一遍
  const candidates = new Set([ROOT, path.dirname(DOCKERFILE)]);
  for (const m of dc.matchAll(/context:\s*['"]?([^\s'"]+)/g)) candidates.add(path.join(ROOT, m[1]));
  const copyLines = df.split('\n').filter((l) => /^COPY\s/i.test(l.trim()) && !/--from=/.test(l));
  const copies = copyLines.map((l) => l.trim().match(/^COPY\s+(?:--\S+\s+)*(\S+)/)?.[1]).filter(Boolean);
  const missing = [];
  for (const src of copies) {
    const probe = src.includes('*') ? src.slice(0, src.indexOf('*')) : src;   // 通配的只查前缀目录
    const okHere = [...candidates].some((c) => exists(path.join(c, probe)));
    if (!okHere) missing.push(src);
  }
  record(
    `Dockerfile：COPY 的源路径都存在（${copies.length} 条，上下文候选 ${candidates.size} 个）`,
    missing.length === 0,
    missing.length
      ? `这些源在候选上下文里都找不到：${missing.join('、')}\n     候选：${[...candidates].map(rel).join('、')}`
      : copies.join('、')
  );
}

// ── 4. .dockerignore ────────────────────────────────────────
if (!di) {
  record('.dockerignore：关键要素', false, '文件不在，跳过');
} else {
  const must = [
    ['node_modules', /(^|\n)\s*\**\/?node_modules/],
    ['.git', /(^|\n)\s*\**\/?\.git/],
    ['*.db（别把开发库打进镜像）', /(^|\n)\s*\**\/?\*?\.db/],
  ];
  for (const [label, re] of must) record(`.dockerignore：含 ${label}`, re.test(di));
}

// ── 5. docker-compose.yml ───────────────────────────────────
if (!dc) {
  record('compose：关键要素', false, '文件不在，跳过');
} else {
  const hasServices = /^services:/m.test(dc);
  record('compose：有 services:', hasServices);
  record('compose：有一个 postgres 库服务', /postgres/i.test(dc) && /image:\s*\S*postgres/.test(dc));
  record(
    'compose：库服务带了 POSTGRES_* 环境变量',
    /POSTGRES_(USER|PASSWORD|DB)/.test(dc),
    /POSTGRES_(USER|PASSWORD|DB)/.test(dc) ? '' : 'postgres 镜像靠这几个变量初始化（不给就用默认值，主机会连不上）'
  );
  record(
    'compose：app 用 depends_on 指向库（只保证启动顺序，不保证就绪）',
    /depends_on/.test(dc),
    /depends_on/.test(dc) ? '' : '契约里有它：写成 depends_on:\\n  - db'
  );

  // ⚠️ 10/7 实测踩到：`db:` 被缩进到 `app:` **里面**了 —— YAML 语法没错、意思全错（服务只剩一个）
  //    光看"有没有 postgres 镜像 / POSTGRES_*"是抓不到的 → 必须查【结构】：服务名必须同级
  const KNOWN_SERVICES = new Set(['app', 'db', 'api', 'web', 'server', 'postgres', 'pg', 'redis', 'cache', 'nginx', 'worker']);
  const lines = dc.split(/\r?\n/);
  const svcIdx = lines.findIndex((l) => /^services:\s*$/.test(l));
  if (svcIdx >= 0) {
    let si = -1;
    for (let i = svcIdx + 1; i < lines.length; i++) {
      const m = /^(\s+)([A-Za-z0-9_.-]+):\s*(#.*)?$/.exec(lines[i]);
      if (m) {
        si = m[1].length;
        break;
      }
    }
    const top = [];
    const nested = [];
    if (si > 0) {
      for (let i = svcIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim() || line.trim().startsWith('#')) continue;
        const m = /^(\s*)([A-Za-z0-9_.-]+):/.exec(line);
        if (!m) continue;
        const ind = m[1].length;
        if (ind < si) break;
        if (ind === si) top.push(m[2]);
        else if (KNOWN_SERVICES.has(m[2])) nested.push(m[2]);
      }
    }
    record(
      `compose：services 下至少两个服务（现在 ${top.length} 个：${top.join('、') || '无'}）`,
      top.length >= 2,
      top.length >= 2 ? '' : '这个项目要 app + db 两个（缩进决定谁是谁的兄弟）'
    );
    record(
      'compose：服务名都在同一级（没有谁被嵌进别人的身体里）',
      nested.length === 0,
      nested.length
        ? `这些看着是服务名，但缩进在别的服务【里面】：${nested.join('、')}\n     → YAML 语法没错，但它变成上一个服务的一个子键了 → 那服务根本不存在`
        : ''
    );
  }
  // ⚠️ `dockerfile:` 是相对 `context:` 的（不是仓库根）—— 本工具自己踩过一次
  const ctxs = [...dc.matchAll(/context:\s*['"]?([^\s'"]+)/g)].map((m) => m[1]);
  const dfs = [...dc.matchAll(/dockerfile:\s*['"]?([^\s'"]+)/g)].map((m) => m[1]);
  const ctxPaths = [...ctxs, ''].map((c) => path.join(ROOT, c));
  const badCtx = ctxs.filter((c) => !exists(path.join(ROOT, c)));
  const badDf = dfs.filter((f) => !ctxPaths.some((c) => exists(path.join(c, f))));
  record(
    `compose：context 目录存在（${ctxs.length} 个）`,
    badCtx.length === 0,
    badCtx.length ? `不存在的 context：${badCtx.join('、')}` : ctxs.join('、')
  );
  record(
    `compose：dockerfile 在某个 context 里找得到（${dfs.length} 条）`,
    badDf.length === 0,
    badDf.length ? `找不到：${badDf.join('、')}（dockerfile 是相对 context 的）` : dfs.join('、')
  );
  // 探针（只记录，不判错）：设计选择
  console.log('\n探针（只记录，不判错）：');
  console.log(`  · app 服务怎么连库（看 environment 里的 DATABASE_URL/DB_HOST）：${(dc.match(/[A-Z_]*DATABASE_URL|DB_HOST|PGHOST/g) || ['（没写）']).join('、')}`);
  console.log(`  · 有没有 depends_on：${/depends_on/.test(dc) ? '有' : '没有（没有的话 app 可能比库先起 → 真跑时偶发失败）'}`);
  console.log(`  · 有没有健康检查/等待脚本：${/healthcheck|wait-on|pg_isready/i.test(dc) ? '有' : '没有'}`);
  console.log('  （探针只记录：端口映射、卷名、镜像 tag 怎么选都是设计选择）\n');
}

// ── 汇总 ────────────────────────────────────────────────────
const pass = results.filter((r) => r.ok).length;
console.log(`\n── 静态检查（${pass}/${results.length}）────────────────────────`);
for (const r of results) {
  console.log(`${r.ok ? '✅' : '❌'} ${r.name}${r.detail ? `\n     ${r.detail}` : ''}`);
}
const groupOf = (n) =>
  n.startsWith('workflow') ? 'workflow' : n.startsWith('Dockerfile') ? 'Dockerfile' : n.startsWith('.dockerignore') ? '.dockerignore' : n.startsWith('compose') ? 'compose' : '产物';
const tally = {};
for (const r of results) tally[groupOf(r.name)] = (tally[groupOf(r.name)] || 0) + 1;
console.log(
  `\n覆盖面：${results.length} 条检查 = ` +
    Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(' + ') +
    `。\n⚠️ 它【验不了】docker build / compose up（本机没 docker）—— 那一条记进日志欠账，别把这里的绿当成"容器跑起来了"。`
);
process.exit(pass === results.length ? 0 : 1);
