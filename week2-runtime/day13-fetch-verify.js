// Day 13 判据 B：验收 week2-runtime/day13-fetch.js（AI 写）
//
// 跑法：node --test week2-runtime/day13-fetch-verify.js
//
// 它会**自己起一个本地 http server**（随机端口，跑完关掉），四种情况真跑一遍：
//   /ok          200（永远成功）        → 不该重试
//   /always500   500（永远失败）        → 该重试 retries 次后抛错
//   /failTwice   500、500、200          → 该重试到成功
//   /slow600     600ms 才回            → timeoutMs=100 时该被掐掉
//
// 必过：不重试成功 / 失败重试到位 / **超时能在 timeoutMs 左右返回** / 最终成功 / 全失败要抛错 / 模块能被 require
// 探针：退避间隔 / 服务器有没有看到请求被中断（只记录不判错）

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawnSync } = require('node:child_process');

const SCRIPT = path.join(__dirname, 'day13-fetch.js');

// ── 0. 加载检查 ───────────────────────────────────────────────
const scriptExists = fs.existsSync(SCRIPT);
if (!scriptExists) {
  console.log('\n⚠️ 还没看到 week2-runtime/day13-fetch.js —— 这份判据是拿来验收它的。\n');
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

let fetchWithRetry = null;
let loadError = null;
if (scriptExists && !guardProblem && !probeCrash) {
  try {
    ({ fetchWithRetry } = require(SCRIPT));
  } catch (err) {
    loadError = err;
  }
}
const ok = typeof fetchWithRetry === 'function';
const skip = ok ? false : '先修好模块导出/入口，再跑这条';

function moduleTrouble() {
  if (!scriptExists) return '还没看到 week2-runtime/day13-fetch.js —— 先写出最小版';
  if (probeCrash) return `你的文件在 require 的时候就炸了：${probeCrash}\n    → 先 node --check week2-runtime/day13-fetch.js`;
  if (guardProblem) return 'require 你的文件时有东西被打印/执行了（模块不该有副作用）';
  if (loadError) return `require 你的文件时报错：${loadError.message}`;
  return 'module.exports 里没有 fetchWithRetry（契约：module.exports = { fetchWithRetry }）';
}
if (!ok && scriptExists) console.log(`\n⚠️ 没能加载你的 fetchWithRetry —— 除了 00/06 之外全部跳过。\n   原因：${moduleTrouble().split('\n')[0]}\n`);

// ── 1. 本地测试服务器 ─────────────────────────────────────────
const hits = {}; // 每个路径被请求了几次
const times = {}; // 每个路径每次请求的时刻
const aborted = {}; // 每次请求"发出去之后没写完就断了"的次数
let failTwiceCount = 0;
let server;
let base;

before(async () => {
  server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    hits[url] = (hits[url] || 0) + 1;
    (times[url] = times[url] || []).push(Date.now());
    res.on('close', () => {
      if (!res.writableFinished) aborted[url] = (aborted[url] || 0) + 1;
    });

    if (url === '/ok') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{"ok":true}');
    } else if (url === '/always500') {
      res.writeHead(500);
      res.end('boom');
    } else if (url === '/failTwice') {
      failTwiceCount += 1;
      if (failTwiceCount <= 2) {
        res.writeHead(500);
        res.end('boom again');
      } else {
        res.writeHead(200);
        res.end('{"ok":true}');
      }
    } else if (url === '/slow600') {
      setTimeout(() => {
        if (!res.writableEnded) {
          res.writeHead(200);
          res.end('终于回来了');
        }
      }, 600);
    } else {
      res.writeHead(404);
      res.end('nope');
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections?.();
  await new Promise((r) => server.close(r));
  console.log(
    '\n判据覆盖面：00–06 共 7 条必过 + P 探针 1 条 = 本文件 8 条 test()。\n' +
      '（报绿之前看一眼上面的 pass 数：大半是 skipped，那不是绿，是没跑起来。）'
  );
});

const hit = (p) => hits[p] || 0;

// ── 必过项 ────────────────────────────────────────────────────
test('00 模块能被 require，并导出 fetchWithRetry 函数', () => {
  assert.strictEqual(typeof fetchWithRetry, 'function', moduleTrouble());
});

test('01 成功（200）时不重试：请求次数必须正好 1', { skip, timeout: 15000 }, async () => {
  const beforeHits = hit('/ok');
  const res = await fetchWithRetry(base + '/ok');
  assert.ok(res && typeof res === 'object', '要返回 fetch 的响应对象');
  assert.strictEqual(res.status, 200, `响应状态应该是 200，实际 ${res && res.status}`);
  const used = hit('/ok') - beforeHits;
  assert.strictEqual(used, 1, `成功时不该重试 —— 服务器收到了 ${used} 次请求（期望 1 次）`);
});

test('02 一直 500 时会重试到位：请求次数 = retries + 1，然后抛错', { skip, timeout: 20000 }, async () => {
  const beforeHits = hit('/always500');
  let threw = null;
  try {
    await fetchWithRetry(base + '/always500', { retries: 2, timeoutMs: 2000, baseDelayMs: 20 });
  } catch (err) {
    threw = err;
  }
  const used = hit('/always500') - beforeHits;
  assert.ok(threw, '服务器一直 500，最后应该抛错（不能把结果吞掉）');
  assert.strictEqual(
    used,
    3,
    `retries=2 表示"总共请求 3 次"（首次 + 2 次重试），实际 ${used} 次。` +
      '\n   ⚠️ 提醒：fetch 在服务器返 500 时**不会** reject —— 要不要重试得自己看 res.ok / res.status'
  );
});

test('03 超时：服务器 600ms 才回、timeoutMs=100 → 应该在 100ms 左右就放弃', { skip, timeout: 15000 }, async () => {
  const t0 = Date.now();
  let threw = null;
  try {
    await fetchWithRetry(base + '/slow600', { retries: 0, timeoutMs: 100, baseDelayMs: 10 });
  } catch (err) {
    threw = err;
  }
  const elapsed = Date.now() - t0;
  assert.ok(threw, '超时应该抛错（不能一直等下去）');
  if (elapsed > 400) {
    assert.fail(
      `这次调用花了 ${elapsed}ms —— 说明**没有真的超时**（服务器 600ms 才回，timeoutMs 是 100）。` +
        '\n   提示：用 AbortController（或 AbortSignal.timeout）把请求掐掉，而不是干等'
    );
  }
});

test('04 前两次 500、第三次 200 → 最终成功', { skip, timeout: 20000 }, async () => {
  const beforeHits = hit('/failTwice');
  const res = await fetchWithRetry(base + '/failTwice', { retries: 3, timeoutMs: 2000, baseDelayMs: 20 });
  assert.strictEqual(res.status, 200, `应该重试到成功（实际状态 ${res && res.status}）`);
  const used = hit('/failTwice') - beforeHits;
  assert.strictEqual(used, 3, `前两次失败、第三次成功 → 应该请求 3 次，实际 ${used} 次`);
});

test('05 全失败时抛出的错误是"真错误"，不是 undefined', { skip, timeout: 20000 }, async () => {
  let threw = null;
  try {
    await fetchWithRetry(base + '/always500', { retries: 0, timeoutMs: 2000, baseDelayMs: 10 });
  } catch (err) {
    threw = err;
  }
  assert.ok(threw, '应该抛错');
  assert.ok(
    threw.name || threw.message,
    '抛出来的东西要带 name 或 message（别把一个空对象/undefined 抛出去，调用方没法判断）'
  );
});

test('06 模块能被 require 而没有副作用', () => {
  assert.ok(!guardProblem, moduleTrouble() + `\n    （实测：require 它时退出码 ${probe.status}，输出：${JSON.stringify(probeOut.trim().slice(0, 200))}）`);
});

// ── 探针 ──────────────────────────────────────────────────────
test('P 探针：退避间隔 / 请求有没有被真的掐断（只记录，不判错）', { skip, timeout: 25000 }, async () => {
  console.log('\n探针（只记录，不判错）：');

  // P1 退避：看第 1→2 次、第 2→3 次请求之间隔了多久
  try {
    const before = hit('/always500');
    const t0 = Date.now();
    try {
      await fetchWithRetry(base + '/always500', { retries: 2, timeoutMs: 1500, baseDelayMs: 100 });
    } catch {
      /* 预期抛错 */
    }
    const seq = (times['/always500'] || []).slice(before);
    const gaps = seq.slice(1).map((t, i) => t - seq[i]);
    console.log(`  · 重试间隔（baseDelayMs=100，指数退避应是 100ms、200ms）：${JSON.stringify(gaps)}ms`);
    console.log(`    ${gaps.length >= 2 && gaps[1] > gaps[0] * 1.4 ? '✅ 看起来在翻倍' : '⚠️ 没看出翻倍（可能每次固定等待，或没等待）'}`);
  } catch (err) {
    console.log(`  · 退避探针自己出错 — ${err.message}`);
  }

  // P2 超时那次，服务器有没有看到"连接被掐断"
  try {
    const before = aborted['/slow600'] || 0;
    try {
      await fetchWithRetry(base + '/slow600', { retries: 0, timeoutMs: 100, baseDelayMs: 10 });
    } catch {
      /* 预期抛错 */
    }
    await new Promise((r) => setTimeout(r, 700)); // 等服务器那边把 600ms 走完
    const sawAbort = (aborted['/slow600'] || 0) > before;
    console.log(
      `  · 超时那一次，服务器${sawAbort ? '**看到**了请求被中断 ✅（说明真的 abort 了）' : '没看到中断（客户端提前返回了，但请求还在服务器上跑 —— 功能上够用，但不是最干净的写法）'}`
    );
  } catch (err) {
    console.log(`  · 中断探针自己出错 — ${err.message}`);
  }

  console.log('  （探针不判错：退避的精确翻倍、以及"必须 abort"都不算错，记进日志就行）\n');
});
