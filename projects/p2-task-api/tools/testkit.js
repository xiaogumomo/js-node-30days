// tools/testkit.js —— 判据用的"测试库"小工具（AI 写）
//
// 为什么放在 tools/ 而不是 test/：`test/` 下**任何** .js 都会被 `node --test` 当成测试文件
//   （见 HANDOFF §三 的"幽灵通过"），所以帮手文件必须住外面。
//
// 每个测试文件怎么用（三行）：
//   const { testDbUrl, resetTestDb } = require('../tools/testkit.js');
//   process.env.DB_URL = testDbUrl('auth');                     // ← 模块层先定下 URL（openDb 在【调用时】读它）
//   before(async () => { await resetTestDb('auth'); });          // ← 建库（幂等）+ 清表 → 干净起点
//
// 每个文件一个**独立库**（tasks_test_auth / _edge / _crud / _server）→ 文件之间互不干扰，
//   所以 `node --test` 并行跑也不会互相踩（不需要 --test-concurrency=1）。
const { Client } = require('pg');

const ADMIN_URL = process.env.ADMIN_DB_URL || 'postgres://app:secret@127.0.0.1:5432/tasks';
const HOST = process.env.PGHOST || '127.0.0.1';
const PORT = process.env.PGPORT || '5432';

const dbNameOf = (name) => `tasks_test_${name}`;

function testDbUrl(name) {
  return `postgres://app:secret@${HOST}:${PORT}/${dbNameOf(name)}`;
}

async function resetTestDb(name) {
  const target = dbNameOf(name);

  // ① 建库（缺就建；"已存在"是正常情况 —— pg 的 CREATE DATABASE 没有 IF NOT EXISTS，靠错误码判）
  const admin = new Client({ connectionString: ADMIN_URL });
  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE ${target}`);
  } catch (e) {
    if (e.code !== '42P04') throw e; // 42P04 = duplicate_database
  }
  await admin.end();

  // ② 清表 → 干净起点（迁移会在 openDb() 里重建）
  const c = new Client({ connectionString: testDbUrl(name) });
  await c.connect();
  await c.query('DROP TABLE IF EXISTS tasks, users CASCADE');
  await c.end();
}

module.exports = { testDbUrl, resetTestDb };
