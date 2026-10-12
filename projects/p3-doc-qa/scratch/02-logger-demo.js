'use strict';
// ============================================================
// scratch/02-logger-demo.js —— "日志写在哪、写成什么样"的换场景示范
//
// 场景：给手机号发短信（故意跟 llm.js 无关，你只借"形状"）
// 跑法：node scratch/02-logger-demo.js      （零依赖、不用 key、不用 --env-file）
//
// 只教三件事：
//   ① logger 从哪来  → opts.logger ?? 默认值（正式代码里默认用 pino）
//   ② 一行日志什么样  → logger.info({ 字段… }, '一句话')
//   ③ 写在哪 / 什么不该写 → 每个"尝试的出口"各一条；敏感值不许进日志
// ============================================================

// 默认 logger：示范里用 console（形状和 pino 完全一样：.info(obj, msg) / .warn(obj, msg)）
// 正式代码（llm.js）里这一行换成：require('pino')({ name: 'llm' })
const DEFAULT_LOGGER = console;

// 假网关：前两次失败、第三次成功（模拟"抖"）
async function fakeGateway(phone, attempt) {
  await new Promise((r) => setTimeout(r, 5));
  return attempt >= 3;
}

async function notify(phone, opts = {}) {
  const {
    logger = DEFAULT_LOGGER, // ★① 默认值在这里：调用方传了就覆盖，没传就用默认
    maxTries = 3,
  } = opts;

  for (let attempt = 1; attempt <= maxTries; attempt++) {
    const t0 = performance.now();
    const ok = await fakeGateway(phone, attempt);
    const latencyMs = Math.round(performance.now() - t0);

    if (ok) {
      // ★② 成功的出口：一条 info。字段在前（机器能读/能过滤）、消息在后（人读）
      logger.info({ phone, attempt, latencyMs }, '短信发送成功');
      return { ok: true, attempt };
    }

    // ★③ 失败的出口也要一条（级别 warn）—— 这样"抖过几次"从日志里看得出来
    logger.warn({ phone, attempt, latencyMs, reason: 'gateway 5xx' }, '短信发送失败，准备重试');
  }

  throw new Error(`发给 ${phone} 的短信 ${maxTries} 次都没成功`);
}

// ---------- 两种跑法 ----------
(async () => {
  console.log('--- 跑法 1：不给 logger → 用默认的（真跑时日志打到终端） ---');
  await notify('138-0000-0000');

  console.log('\n--- 跑法 2：注入假 logger —— 判据就是这么"接住"日志再断言的 ---');
  const records = [];
  const fake = {
    info: (obj, msg) => records.push({ level: 'info', obj, msg }),
    warn: (obj, msg) => records.push({ level: 'warn', obj, msg }),
  };
  await notify('139-0000-0000', { logger: fake });
  console.log(`接住了 ${records.length} 条：`);
  for (const r of records) {
    console.log(`  ${r.level}  ${r.msg}   (attempt=${r.obj.attempt}, ${r.obj.latencyMs}ms)`);
  }

  console.log('\n--- 反例：千万别把整个 opts 丢进日志 ---');
  const optsWithKey = { apiKey: 'sk-super-secret', logger: fake };
  console.log('  ❌ logger.info(optsWithKey)  → 日志里就出现了 key：', optsWithKey.apiKey);
  console.log('  ✅ 只挑该出现的字段写：{ phone, attempt, latencyMs }');
})();
