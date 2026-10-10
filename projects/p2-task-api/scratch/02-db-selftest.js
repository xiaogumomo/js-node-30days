// scratch/02-db-selftest.js —— 块2 自测：七条操作各跑一次（真库真表）
// 跑法：cd projects/p2-task-api && node scratch/02-db-selftest.js
const { openDb } = require('../src/db');

let failed = 0;
const check = (label, ok, got, want) => {
  console.log(`${ok ? '✅' : '❌'} ${label}   实得=${JSON.stringify(got)}${ok ? '' : '   期望=' + JSON.stringify(want)}`);
  if (!ok) failed++;
};

(async () => {
  const db = await openDb();
  const stamp = Date.now();
  const mail = `selftest-${stamp}@t.local`;

  // ── 用户两条 ───────────────────────────────
  const u = await db.createUser(mail, 'scrypt$fake', stamp);
  check('createUser 返回的 id 是真数字（不是 NaN）', !!(u && Number.isInteger(u.id)), u, { id: '整数', email: mail });
  const f = await db.findUserByEmail(mail);
  check('findUserByEmail 拿回同一条', !!(f && f.id === u.id), f, { id: u.id });
  check('findUserByEmail 的 passwordHash 映射对', !!(f && f.passwordHash === 'scrypt$fake'), f && f.passwordHash, 'scrypt$fake');
  check('没这个邮箱 → null', (await db.findUserByEmail('nope-' + stamp + '@t.local')) === null);

  // ── 任务五条 ───────────────────────────────
  const t1 = await db.createTask('第一条', 0, u.id);
  check('createTask 返回真 id + title', !!(t1 && Number.isInteger(t1.id) && t1.title === '第一条'), t1, { id: '整数', title: '第一条', done: false });
  const t2 = await db.createTask('第二条', 0, u.id);
  const list = await db.listTasks(u.id);
  check('listTasks 是数组、2 条、按 id 升序', Array.isArray(list) && list.length === 2 && list[0].id < list[1].id, list, '两条、升序');
  check('findTask 自己的拿得到', (await db.findTask(t1.id, u.id))?.title === '第一条');
  check('findTask 别人的 → null（隔离）', (await db.findTask(t1.id, 99999999)) === null);
  const upd = await db.updateTask('改过了', 1, t1.id, u.id);
  check('updateTask 返回新值', !!(upd && upd.title === '改过了' && upd.done === true), upd, { title: '改过了', done: true });
  check('updateTask 别人的 → null（隔离）', (await db.updateTask('x', 0, t1.id, 99999999)) === null);
  check('deleteTask 删到 1 行', (await db.deleteTask(t2.id, u.id)) === 1);
  check('deleteTask 再删 → 0 行', (await db.deleteTask(t2.id, u.id)) === 0);
  check('deleteTask 别人的 → 0 行（隔离）', (await db.deleteTask(t1.id, 99999999)) === 0);
  const after = await db.listTasks(u.id);
  check('删完只剩 1 条', after.length === 1 && after[0].id === t1.id, after.length, 1);

  console.log(failed ? `\n❌ ${failed} 条没过` : '\n✅ 七条操作全部通过');
  if (typeof db.close === 'function') {
    await db.close();
  } else {
    console.log('（db.close 还没写 —— 这里直接退出；块3 补 close + onClose）');
  }
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('❌ 自测自己挂了（说明 db.js 里还有会抛错的地方）：');
  console.error(e);
  process.exit(1);
});
