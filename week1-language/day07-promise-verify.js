// ============================================================
// Day 7 验证脚手架：同一个任务的三种写法（回调 → Promise → async/await）
// 用法：node week1-language/day07-promise-verify.js
//       （可选）node week1-language/day07-promise-verify.js 别的路径.js
//
// 这是【测试脚本】（计划 §一：测试允许让 AI 写）。实现必须你自己写。
//
// 它读 week1-language/day07-promise.js，需要你的文件最后导出这四样：
//
//   orderByCallback(cb)   回调版：3 秒后调用 cb(null, '炒饭做好了')
//                         第一个参数留给错误（Node 的"错误优先"约定，没出错就传 null）
//   buyfood()             Promise 版：3 秒后 resolve('炒饭做好了')
//   eat()                 async 版：await buyfood()，整个函数的返回值就是 '炒饭做好了'
//   login(ok)             ok 为 true 时 resolve，否则 reject（第 4 段错误处理用）
//
//   module.exports = { orderByCallback, buyfood, eat, login };
//
// 本脚本分三部分：
//   【第 1 部分】6 组必过测试 —— 判对错
//   【第 2 部分】2 个观察项 —— 不判对错，只把"顺序"和"链"的真相打印出来给你看
//   【第 3 部分】1 个探针 —— 只记录你的 buyfood 实际等了多少毫秒
//
// ⚠️ 这个脚本一共要等二十几秒（要实现里好几处各等 3 秒），不是卡住了。
// ============================================================

'use strict';
const path = require('node:path');

const implPath = process.argv[2] || path.join(__dirname, 'day07-promise.js');
const shownPath = path.relative(process.cwd(), implPath) || implPath;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// 等一个 Promise，超时就抛错（免得实现里忘了 resolve 时整个脚本静默挂住）
const withTimeout = (p, ms, label) => Promise.race([
  Promise.resolve(p),
  sleep(ms).then(() => { throw new Error(label + '：等了 ' + ms + 'ms 还没动静'); }),
]);
// 观察区用：如果 buyfood() 没返回 Promise，也别让 .then 当场炸掉整个脚本
const asPromise = (v) => (v instanceof Promise
  ? v
  : Promise.reject(new Error('buyfood() 返回的不是 Promise：' + JSON.stringify(v))));

function hintAndExit(why, extra) {
  console.log('❌ ' + why);
  if (extra) console.log('   → ' + extra);
  console.log('');
  console.log('检查这几件事：');
  console.log('  1. ' + shownPath + ' 这个文件写了吗？');
  console.log('  2. 文件最后有没有加 module.exports = { orderByCallback, buyfood, eat, login };');
  console.log('  3. 四个导出名对得上吗（大小写一致）？');
  console.log('  4. 语法对不对：node --check ' + shownPath);
  process.exit(1);
}

let impl;
try {
  impl = require(implPath);
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    hintAndExit('读不到 ' + shownPath + '（文件还不存在？）');
  }
  if (err instanceof SyntaxError) {
    hintAndExit(shownPath + ' 有【语法错误】，整个文件都没法被加载进来。',
      '原始错误：' + err.message);
  }
  hintAndExit('加载 ' + shownPath + ' 时抛错了。', err.message);
}

const NAMES = ['orderByCallback', 'buyfood', 'eat', 'login'];
const missing = NAMES.filter((n) => typeof impl[n] !== 'function');
if (missing.length) {
  hintAndExit('这几个导出的不是函数：' + missing.join('、'),
    '要么没写 module.exports，要么名字写错了');
}
const { orderByCallback, buyfood, eat, login } = impl;

let pass = 0;
let fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + '　→ ' + detail); }
}

async function main() {
  // ---------------------------------------------------------------
  console.log('\n=== 测试 1：回调版（orderByCallback）===');
  let callbackFood = null;
  {
    const t0 = Date.now();
    let firedAt = null;
    let args = null;

    const done = new Promise((resolve) => {
      orderByCallback((...a) => { firedAt = Date.now() - t0; args = a; resolve(); });
    });
    try {
      await withTimeout(done, 8000, '回调版的回调一直没被调用');
    } catch (e) {
      check('回调版：3 秒后调用回调', false, e.message);
    }

    if (args !== null) {
      callbackFood = args[1];
      check('回调不是同步触发的（等了一会儿才来）', firedAt >= 2000,
        '回调只等了 ' + firedAt + 'ms 就来了 —— 现在还没到货呢');
      check('回调的第一个参数是 null（错误优先：没出错就传 null）', args[0] === null,
        '第一个参数收到的是 ' + JSON.stringify(args[0]) + '（约定：第一个参数留给错误，成功时传 null）');
      check('回调的第二个参数是 "炒饭做好了"', args[1] === '炒饭做好了',
        '第二个参数收到的是 ' + JSON.stringify(args[1]));
    }
  }

  // ---------------------------------------------------------------
  console.log('\n=== 测试 2：Promise 版（buyfood）===');
  let promiseFood = null;
  {
    const t0 = Date.now();
    const p = buyfood();
    check('buyfood() 返回的是一个 Promise（不是等着被卡住）', p instanceof Promise,
      '返回的是 ' + Object.prototype.toString.call(p) + '，不是 Promise');

    if (p instanceof Promise) {
      try {
        promiseFood = await withTimeout(p, 8000, 'buyfood() 一直没 resolve');
        check('await 之后拿到 "炒饭做好了"', promiseFood === '炒饭做好了',
          '拿到的是 ' + JSON.stringify(promiseFood));
        check('确实是过一会儿才好的（不是立刻）', Date.now() - t0 >= 2000,
          '只等了 ' + (Date.now() - t0) + 'ms');
      } catch (e) {
        check('await buyfood() 能拿到结果', false, e.message);
      }
    }
  }

  // ---------------------------------------------------------------
  console.log('\n=== 测试 3：async 版（eat）===');
  let asyncFood = null;
  {
    const returned = eat();
    check('eat() 的返回值也是 Promise（async 函数永远返回 Promise，哪怕你 return 的是字符串）',
      returned instanceof Promise,
      '返回的是 ' + typeof returned + ' —— async 函数里 return "炒饭做好了"，外面拿到的是包着它的 Promise');

    if (returned instanceof Promise) {
      try {
        asyncFood = await withTimeout(returned, 8000, 'eat() 一直没 resolve');
        check('await eat() 拿到 "炒饭做好了"', asyncFood === '炒饭做好了',
          '拿到的是 ' + JSON.stringify(asyncFood));
      } catch (e) {
        check('await eat() 能拿到结果', false, e.message);
      }
    }
  }

  // ---------------------------------------------------------------
  console.log('\n=== 测试 4：三种写法的结果必须一模一样 ===');
  {
    const all = [['回调版', callbackFood], ['Promise 版', promiseFood], ['async 版', asyncFood]];
    const shown = all.map(([k, v]) => k + '=' + JSON.stringify(v)).join('  ');
    check('三次拿到的都是同一个字符串',
      callbackFood === '炒饭做好了' && promiseFood === callbackFood && asyncFood === callbackFood,
      shown);
  }

  // ---------------------------------------------------------------
  console.log('\n=== 测试 5：错误处理 —— .catch 接 reject ===');
  {
    let okResult = null;
    let failResult = null;
    let failErr = null;

    try {
      okResult = await withTimeout(login(true), 8000, 'login(true) 一直没动静');
    } catch (e) {
      check('login(true) 成功时有结果', false, e.message);
    }
    check('login(true) → "登陆成功"', okResult === '登陆成功',
      '拿到的是 ' + JSON.stringify(okResult));

    // reject 走 .catch：注意 .catch 返回的也是 Promise，所以能继续 await
    // （先确认 login 真的返回 Promise —— 不然下面 .then 会当场炸掉，把测试 6 也连累掉）
    const raw = login(false);
    if (!(raw instanceof Promise)) {
      check('login(false) 返回的是一个 Promise', false,
        '返回的是 ' + typeof raw + '：' + JSON.stringify(raw)
        + '（login 要 return new Promise(...)，不是直接 return 结果）');
    } else {
      const handled = raw
        .then((v) => { okResult = '居然成功了：' + JSON.stringify(v); return null; })
        .catch((err) => { failErr = err; return null; });
      try {
        await withTimeout(handled, 8000, 'login(false) 一直没动静（既没 resolve 也没 reject？）');
      } catch (e) {
        check('login(false) 会 reject', false, e.message);
      }

      if (failErr !== null) {
        failResult = (failErr && failErr.message) ? failErr.message : String(failErr);
        check('login(false) 被 .catch 接住，内容能读出来', failResult === '登陆失败',
          '.catch 收到的是 ' + JSON.stringify(failResult)
          + '（用 reject(new Error("登陆失败")) 或 reject("登陆失败") 都能被这里读到）');
        check('成功和失败不会串台（成功那条没被 reject 污染）', okResult === '登陆成功',
          'login(true) 的结果变成了 ' + JSON.stringify(okResult));
      } else if (failErr === null) {
        check('login(false) 走的是失败分支（不是默默成功）', false,
          '它没有 reject —— 失败分支没走到，.catch 自然什么也接不到');
      }
    }
  }

  // ---------------------------------------------------------------
  console.log('\n=== 测试 6：async/await 版的错误处理（try/catch 接 reject）===');
  {
    let caught = null;
    try {
      const v = await withTimeout(login(false), 8000, 'login(false) 一直没动静');
      check('await login(false) 应该在 try 里抛出', false,
        '没有抛错，反而拿到了 ' + JSON.stringify(v));
    } catch (e) {
      caught = e;
    }
    if (caught !== null) {
      const msg = (caught && caught.message) ? caught.message : String(caught);
      check('await 的 reject 能被 try/catch 接住', msg === '登陆失败',
        'catch 到的是 ' + JSON.stringify(msg));
    }
  }

  // ---------------------------------------------------------------
  console.log('\n\n=== 观察项（不判对错，只是把真相打印给你看）===');

  console.log('【观察 1】同步代码和 .then 谁先跑？');
  {
    const order = [];
    asPromise(buyfood()).then(() => order.push('A：.then 里的（异步，排队等）'))
      .catch(() => order.push('（buyfood 没成功，这条观察做不了）'));
    order.push('B：调用之后紧跟着的同步代码（先跑）');
    await withTimeout(buyfood(), 8000, 'buyfood() 一直没 resolve').catch(() => {});
    console.log('  实测顺序：' + order.map((s, i) => (i + 1) + '. ' + s).join('   |   '));
    console.log('  → .then 的时机**不能**靠"它写在前面"来判断：它一定排在当前这段同步代码之后。');
    console.log('    （原因明天讲：微任务。今天先记住"then 是排队的，不是立刻的"。）');
  }

  console.log('\n【观察 2】链里"回调不 return"会怎样？');
  {
    try {
      const noReturn = await asPromise(buyfood()).then(() => { /* 故意不 return */ })
        .then((v) => v);
      const withReturn = await asPromise(buyfood()).then(() => '加了葱花').then((v) => v);
      console.log('  不 return → 下一个 .then 收到 ' + JSON.stringify(noReturn));
      console.log('  return "加了葱花" → 下一个 .then 收到 ' + JSON.stringify(withReturn));
      console.log('  → .then 的回调**返回什么**，下一个 .then 就收到什么；不 return 就是 undefined。');
      console.log('    这就是"链能串起来"的原理：.then 自己返回的还是 Promise。');
    } catch (e) {
      console.log('  （这条没做成：' + e.message + '）');
    }
  }

  console.log('\n【探针】你的 buyfood 实际等了多久？（不判对错，只记录）');
  {
    const t0 = Date.now();
    try { await withTimeout(buyfood(), 8000, '没动静'); } catch { /* ignore */ }
    console.log('  实测 ' + (Date.now() - t0) + 'ms');
  }

  console.log('\n---------------- 结果 ----------------');
  console.log('必过测试：通过 ' + pass + ' 项，失败 ' + fail + ' 项');
  if (fail === 0) {
    console.log('🎉 全绿。日志里那条「三种写法对照」可以打勾了。');
    console.log('   别急着走：顺手把上面两个观察项各改一个数字再跑一次，看结论会不会变。');
  } else {
    console.log('还有失败项 —— 括号里通常写着"实际得到了什么"。');
    console.log('如果是"回调第一个参数"那条：回去看 Node 的错误优先约定，改成传 null。');
  }
  return sleep(50).then(() => process.exit(fail === 0 ? 0 : 1));
}

// 兜底：万一实现里有 Promise 永远不 settle，别让脚本静默挂死
const watchdog = setTimeout(() => {
  console.log('\n⏱️ 已经 90 秒了还没跑完 —— 上面最后一项大概一直在等。');
  console.log('   最常见的原因：某个 Promise 忘了 resolve / reject。');
  process.exit(1);
}, 90000);

main().catch((e) => {
  clearTimeout(watchdog);
  console.log('\n💥 你的实现在跑到一半抛错了：' + (e && e.message ? e.message : e));
  const loc = (e && e.stack ? e.stack : '').split('\n').find((l) => l.includes('day07-promise.js'));
  if (loc) console.log('   出错位置：' + loc.trim().replace(/^at /, ''));
  console.log('   常见的几个原因：');
  console.log('     ① API 名字拼错（Promise / resolve / reject 的大小写）');
  console.log('     ② 变量名拼错，或者用了没声明的变量');
  console.log('     ③ reject 了却没有 .catch / try-catch 接住（会以"没人接住的拒绝"炸掉）');
  console.log('   → 改完先单独跑一次：node --check week1-language/day07-promise.js');
  process.exitCode = 1;
});
