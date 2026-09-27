// Day 13 判据 A：验收 week2-runtime/day13-p-limit.js（AI 写）
//
// 跑法：node --test week2-runtime/day13-p-limit-verify.js
//
// 结构照项目惯例分两档：
//   · 必过（判对错）—— 返回 Promise / **最大同时数 == n** / 失败隔离 / 排队不丢 / 模块能被 require
//   · 探针（只记录不判错）—— 非法 n / **完成顺序 ≠ 结果顺序**（这一条由 Promise.all 保证，给你看清用）
//
// 判据用"任务自己记账"的方式量并发：每个任务进入时 running++、退出时 running--，
// 记录 peak（同时最多几个）—— 这个数骗不了人。

const { test, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SCRIPT = path.join(__dirname, 'day13-p-limit.js');

// ─────────────────────────────────────────────────────────────
// 0. 先探：require 你的文件会不会把入口跑起来 / 炸掉
// ─────────────────────────────────────────────────────────────
const scriptExists = fs.existsSync(SCRIPT);
if (!scriptExists) {
  console.log('\n⚠️ 还没看到 week2-runtime/day13-p-limit.js —— 这份判据是拿来验收它的。\n   先写出最小版（一次只跑一个、能出结果就行），再回来跑。\n');
}

const probe = scriptExists
  ? spawnSync(process.execPath, ['-e', `require(${JSON.stringify(SCRIPT)})`], { encoding: 'utf8', timeout: 20000 })
  : { status: 0, stdout: '' };
const probeOut = `${probe.stdout || ''}${probe.stderr || ''}`;

let guardProblem = false;
let probeCrash = null;
if (scriptExists) {
  if (/SyntaxError|ReferenceError|TypeError|Cannot find module|ERR_MODULE_NOT_FOUND/.test(probeOut)) {
    const lines = probeOut.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    const err = lines.find((l) => /^(SyntaxError|ReferenceError|TypeError|Error|Cannot find module|ERR_)/.test(l));
    probeCrash = (err || lines[lines.length - 1] || '（没抓到具体错误行）').slice(0, 200);
  } else if (probe.status !== 0 || probeOut.trim() !== '') {
    guardProblem = true;
  }
}

let pLimit = null;
let loadError = null;
if (scriptExists && !guardProblem && !probeCrash) {
  try {
    ({ pLimit } = require(SCRIPT));
  } catch (err) {
    loadError = err;
  }
}

const ok = typeof pLimit === 'function';
const skip = ok ? false : '先修好模块导出/入口，再跑这条';

function moduleTrouble() {
  if (!scriptExists) return '还没看到 week2-runtime/day13-p-limit.js —— 先把最小版写出来';
  if (probeCrash) return `你的文件在 require 的时候就炸了：${probeCrash}\n    → 先 node --check week2-runtime/day13-p-limit.js 看语法`;
  if (guardProblem) return 'require 你的文件时有东西被打印/执行了（模块不该有副作用）';
  if (loadError) return `require 你的文件时报错：${loadError.message}`;
  return 'module.exports 里没有 pLimit（契约：module.exports = { pLimit }）';
}

if (!ok && scriptExists) console.log(`\n⚠️ 没能加载你的 pLimit —— 下面除了 00/06 之外全部跳过。\n   原因：${moduleTrouble().split('\n')[0]}\n`);

after(() => {
  console.log(
    '\n判据覆盖面：00–06 共 7 条必过 + P 探针 1 条 = 本文件 8 条 test()。\n' +
      '（报绿之前看一眼上面的 pass 数：大半是 skipped、pass 只有个位数，那不是绿，是没跑起来。）'
  );
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 等所有任务结算，但最多等 waitMs —— 防止"有任务永远不结算"把判据自己挂死。
 * 返回 null 表示**超时**（= 有 promise 既没 resolve 也没 reject）。
 */
async function settleWithin(tasks, waitMs) {
  return Promise.race([Promise.allSettled(tasks), sleep(waitMs).then(() => null)]);
}

const NEVER_SETTLED_MSG =
  '等任务结算超时了（2 秒）—— 说明**有任务的 promise 一直挂着**：既没 resolve 也没 reject。\n' +
  '   最常见的原因：某个任务失败后你把队列停下来了 → 剩下的任务既没跑、也没给调用方任何交代。\n' +
  '   （"失败隔离"要的就是：失败的那个 reject，**其他照跑**）';

/** 跑一批任务，顺便量"同时最多几个在跑" */
async function runBatch({ n, count, taskMs = 10, failAt = -1 }) {
  const limit = pLimit(n);
  let running = 0;
  let peak = 0;
  let started = 0;
  const finished = [];

  const tasks = Array.from({ length: count }, (_, i) =>
    limit(async () => {
      started++;
      running++;
      peak = Math.max(peak, running);
      await sleep(taskMs);
      running--;
      if (i === failAt) throw new Error('第 ' + i + ' 个任务故意失败');
      finished.push(i);
      return i;
    })
  );
  // ⚠️ 用 allSettled + 超时：一个失败不能让判据自己先炸（那正是要测的"失败隔离"）；
  //    有任务永远不结算时，也要能明确报出来，而不是让 test runner 超时（那样只会报成 cancelled，看不出原因）
  const settled = await settleWithin(tasks, 2000);
  return { settled, peak, started, finished };
}

// ─────────────────────────────────────────────────────────────
// 必过项
// ─────────────────────────────────────────────────────────────
test('00 模块能被 require，并导出 pLimit 函数', () => {
  assert.strictEqual(typeof pLimit, 'function', moduleTrouble());
});

test('01 pLimit(n) 返回函数；limit(taskFn) 返回 Promise（结果是 taskFn 的返回值）', { skip }, async () => {
  const limit = pLimit(2);
  assert.strictEqual(typeof limit, 'function', 'pLimit(n) 应该返回一个函数（那个 limit）');
  const p = limit(() => 42);
  assert.ok(p && typeof p.then === 'function', 'limit(taskFn) 要返回 Promise（后面要靠 Promise.all 收结果）');
  const v = await p;
  assert.strictEqual(v, 42, 'Promise 的结果应该是 taskFn 的返回值');
});

test('02 同时最多 n 个（n=2 时 peak 必须正好是 2）', { skip, timeout: 10000 }, async () => {
  const { peak, started, settled } = await runBatch({ n: 2, count: 8, taskMs: 15 });
  assert.ok(settled, NEVER_SETTLED_MSG);
  assert.ok(started === 8, `8 个任务都该跑（实际起了 ${started} 个）`);
  if (peak > 2) {
    assert.fail(
      `最大同时数到了 ${peak}，但 n = 2 → 你是不是把任务一上来就全启动了？\n` +
        '   （要点：**不是先开始再排队**，而是"空出一个名额才叫下一个"）'
    );
  }
  if (peak < 2) {
    assert.fail(
      `最大同时数只有 ${peak}（n = 2）→ 你写成了"一次只跑一个"，那是**队列**、不是**并发池**。\n` +
        '   提示：一开始就该把前 n 个任务都启动起来'
    );
  }
});

test('03 失败隔离：第 3 个任务失败，其他任务照样跑完', { skip, timeout: 10000 }, async () => {
  const { settled, started } = await runBatch({ n: 2, count: 6, taskMs: 10, failAt: 2 });
  assert.ok(settled, NEVER_SETTLED_MSG);
  const rejected = settled.filter((s) => s.status === 'rejected').length;
  const fulfilled = settled.filter((s) => s.status === 'fulfilled').length;
  assert.strictEqual(started, 6, `6 个任务都该被启动（实际 ${started} 个 —— 一个失败不该让队列停摆）`);
  assert.strictEqual(rejected, 1, `应该只有 1 个 reject，实际 ${rejected} 个`);
  assert.strictEqual(
    fulfilled,
    5,
    `剩下 5 个应该都成功跑完（实际 ${fulfilled} 个）—— 一个任务失败不能拖累别人`
  );
});

test('04 排队不丢：超过 n 的任务都会被执行（10 个任务、n=3）', { skip, timeout: 10000 }, async () => {
  const { started, settled } = await runBatch({ n: 3, count: 10, taskMs: 5 });
  assert.ok(settled, NEVER_SETTLED_MSG);
  assert.strictEqual(started, 10, `10 个任务都该跑到（实际 ${started} 个）`);
  assert.strictEqual(
    settled.filter((s) => s.status === 'fulfilled').length,
    10,
    '10 个都该成功'
  );
});

test('05 一个 limit 里混着"快慢不一样"的任务，也不会超过 n', { skip, timeout: 10000 }, async () => {
  // 慢任务先来：如果不按"空名额"调度，容易写成"等一批全完再下一批"（那是分批不是并发池）
  const limit = pLimit(3);
  let running = 0;
  let peak = 0;
  const tasks = [80, 10, 10, 10, 10, 10].map((ms) =>
    limit(async () => {
      running++;
      peak = Math.max(peak, running);
      await sleep(ms);
      running--;
    })
  );
  const settled5 = await settleWithin(tasks, 2000);
  assert.ok(settled5, NEVER_SETTLED_MSG);
  assert.ok(peak <= 3, `最大同时数是 ${peak}，超过了 n = 3`);
  assert.ok(
    peak === 3,
    `最大同时数只有 ${peak}（n = 3）：慢任务占着名额时，空出来的名额应该马上给下一个任务（"分批等全部完成"不是并发池）`
  );
});

test('06 模块能被 require 而没有副作用（不打印、不执行任务）', () => {
  assert.ok(!guardProblem, moduleTrouble() + `\n    （实测：require 它时退出码 ${probe.status}，输出：${JSON.stringify(probeOut.trim().slice(0, 200))}）`);
});

// ─────────────────────────────────────────────────────────────
// 探针（只记录，不判错）
// ─────────────────────────────────────────────────────────────
test('P 探针：非法 n / 完成顺序 vs 结果顺序（只记录，不判错）', { skip, timeout: 10000 }, async () => {
  console.log('\n探针（只记录，不判错）：');

  // P1 非法 n
  // ⚠️ 探针**不许把自己挂死**：n=0 / n=-1 时"一个都不跑"是合法设计选择，
  //    但那样 limit() 的 promise 永远不结算 —— 要把它**记下来**（挂住了），不能让整条探针卡到超时。
  //    （2026-09-27 实测抓到的：参照实现 pLimit(0) 挂住 → 探针变红，违反了"只记录不判错"。）
  for (const bad of [0, -1, 1.5, '2']) {
    const label = `  · pLimit(${JSON.stringify(bad)})`;
    try {
      const limit = pLimit(bad);
      const outcome = await Promise.race([
        limit(() => 'ok').then(
          (v) => ({ kind: 'ok', v }),
          (e) => ({ kind: 'err', e })
        ),
        new Promise((r) => setTimeout(() => r({ kind: 'hang' }), 200)),
      ]);
      if (outcome.kind === 'ok') {
        console.log(`${label} → 没抛错，跑出来：${JSON.stringify(outcome.v)}`);
      } else if (outcome.kind === 'err') {
        console.log(`${label} → 没抛错，但 limit() 的 promise 被 reject：${outcome.e.message}`);
      } else {
        console.log(`${label} → 没抛错，但任务**一直没结算**（挂住了）—— 合法选择，代价是调用方一直等`);
      }
    } catch (err) {
      console.log(`${label} → 抛错：${err.message.slice(0, 60)}`);
    }
  }

  // P2 完成顺序 vs 结果顺序（结果顺序由 Promise.all 保证，这里给你看清差别）
  // ⚠️ 同样不许挂死：有任务不结算时（例如超过 n 的任务被丢掉）Promise.all 会永远等下去 → 用带超时的等待。
  const limit = pLimit(3);
  const tasks = [60, 40, 20, 1].map((ms, i) =>
    limit(async () => {
      await sleep(ms);
      return i;
    })
  );
  const settled = await settleWithin(tasks, 2000);
  if (!settled) {
    console.log('  · 4 个任务里有**没结算**的（Promise.all 会一直等）→ 这条看不了：先修上面 04 那条');
  } else {
    const results = settled.map((s) => (s.status === 'fulfilled' ? s.value : `✖${s.reason && s.reason.message}`));
    console.log('  · 4 个任务的耗时是 [60,40,20,1]ms（完成顺序会是 3,2,1,0）');
    console.log(`    而 Promise.all 收上来的结果 = ${JSON.stringify(results)} ← 始终是【传入顺序】`);
    console.log('  （所以"结果顺序"不用你操心：**Promise.all 按传入顺序收**；你只管并发和排队）');
  }

  console.log('  （探针不判错：非法 n 是设计选择，记进日志就行）\n');
});
