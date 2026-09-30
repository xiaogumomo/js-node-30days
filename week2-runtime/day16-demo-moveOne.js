// day16-demo-moveOne.js —— **只用来单独验 `moveOne` 这一块**（不是判据；判据是 projects/p1-cli-organizer/test/apply.test.js）
//
// 跑法：node week2-runtime/day16-demo-moveOne.js
//
// 为什么要它：`moveOne` 和 `main` 的接线如果一起改，报错会混在一起（"一次报多条红先怀疑同一条根因"）。
// 先让这一块单独跑通，再去接 main。
//
// ⚠️ 造的所有东西都在**系统临时目录**里，跑完删掉 —— **绝不在仓库里造测试数据**。

const fs = require('node:fs');          // 同步版 fs：造 fixture 最省事
const os = require('node:os');          // os.tmpdir()
const path = require('node:path');
const { createHash } = require('node:crypto');
const {moveOne} = require('../projects/p1-cli-organizer/src/cli.js');

// ── ① 造一棵"一次性"的小树 ─────────────────────────────────────
const lab = fs.mkdtempSync(path.join(os.tmpdir(), 'p1-demo-'));   // 名字唯一，每次跑都是新目录
const srcDir = path.join(lab, 'src');
const destDir = path.join(lab, 'dest');
fs.mkdirSync(srcDir, { recursive: true });
fs.writeFileSync(path.join(srcDir, 'a.txt'), 'hello');
fs.writeFileSync(path.join(srcDir, 'b.txt'), 'world');

const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const before = fs.readdirSync(srcDir).map((n) => `${n}(${fs.statSync(path.join(srcDir, n)).size}B)`);
const aHashBefore = sha(path.join(srcDir, 'a.txt'));

(async () => {
  // ── ② TODO（你写）：搬一个文件，然后自己检查三件事 ──────────────
  //    提示：先让 cli.js 能 require 到 moveOne —— 临时把它加进 module.exports
  //    （`module.exports = { classify, moveOne }`；判据只要求 classify 在，多导出一个不影响）
  //
  //    const moved = await moveOne(path.join(srcDir, 'a.txt'), destDir);
  //
  //    然后检查：
  //      · 源目录里 a.txt 没了
  //      · destDir 里有 a.txt，且 sha 和上面记的 aHashBefore 一样
  //      · moved 就是目标路径
  const moved = await moveOne(path.join(srcDir, 'a.txt'), destDir);
  // ── ③ 打印出来自己看（跑之前 / 跑之后对比）─────────────────────
  console.log('跑之前 src :', before);
  console.log('a.txt 的 sha:', aHashBefore.slice(0, 16) + '…');
  console.log('跑之后 src :', fs.readdirSync(srcDir));
  console.log('跑之后 dest:', fs.existsSync(destDir) ? fs.readdirSync(destDir) : '（还没有 dest 目录）');
  if (fs.existsSync(path.join(destDir, 'a.txt'))) {
    console.log('目标里 a.txt 的 sha:', sha(path.join(destDir, 'a.txt')).slice(0, 16) + '…');
  }

  // ── ④ 失败分支（第二遍再做）：让"校验不过"，看源文件还在不在 ──────
  //    做法：把 dest/b.txt 造成一个"内容被截断的同名文件"（先写 'wor' 而不是 'world'），
  //    再搬 b.txt → 期望：抛错 + dest 里那个坏副本被清掉 + **源 b.txt 还在**

  fs.rmSync(lab, { recursive: true, force: true });   // 收尾：删掉整棵临时树
})();
