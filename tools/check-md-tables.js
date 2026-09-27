#!/usr/bin/env node
// Markdown 表格自检 —— 专治"格子数对不上"（写完日志跑一下，别等渲染出来才发现）
//
// 用法：
//   node tools/check-md-tables.js                # 默认检查 notes/*.md
//   node tools/check-md-tables.js notes/day12.md # 也可以指定文件
//
// 它检查三件事：
//   ① 每张表里，数据行的格子数 == 表头列数（**会忽略转义竖线 \|**）
//   ② 分隔行（|---|）后面有没有被塞进内容（那会让整张表串列）
//   ③ 表格有没有被 4 空格缩进（那会被渲染成代码块，不是表格）
//
// 退出码：发现问题 = 1，全干净 = 0（可以接进别的脚本）

const fs = require('node:fs');
const path = require('node:path');

const BACKSLASH = String.fromCharCode(92);
const ESCAPED = BACKSLASH + '|'; // 转义竖线：数格子时要先保护起来
const PROTECT = '\u0001';

const cells = (line) => line.split(ESCAPED).join(PROTECT).split('|').slice(1, -1);

// 判断一行是不是"分隔行"（只由 | - : 空格组成，且至少有一个 -）
const isSeparator = (line) => {
  const s = line.trim();
  return s.startsWith('|') && s.endsWith('|') && /^[|\-:\s]+$/.test(s) && s.includes('-');
};

function checkFile(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const problems = [];
  let cols = 0; // 当前表的列数（0 = 不在表里）
  let tableNo = 0;
  let startLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNo = i + 1;
    const head = raw.trimStart(); // 去掉前导空格：缩进的表格行也要能认出来
    const indent = raw.length - head.length;

    // 表格行 = "去掉缩进后以 | 开头"
    if (!head.startsWith('|')) {
      // 非表格行：空行/普通文字都算"离开表格"
      if (raw.trim() !== '') cols = 0;
      continue;
    }

    // ⚠️ 4 空格缩进 → 会被渲染成代码块，表格根本不显示（最容易踩，也最难看出来）
    if (indent >= 4) {
      problems.push({ lineNo, msg: `前面缩进了 ${indent} 个空格 → 会被当成代码块，表格不会显示`, text: raw });
      continue;
    }

    const line = head.trimEnd();

    if (isSeparator(line)) {
      cols = cells(line).length;
      tableNo += 1;
      startLine = lineNo - 1; // 表头在上面一行
      continue;
    }

    // 「看起来像分隔行但多了别的东西」—— 典型错误：内容写在 |---|---| 后面
    if (/^\|[-:|\s]*-[-:|\s]*\|/.test(line) && /[^\s|:\-]/.test(line)) {
      problems.push({
        lineNo,
        msg: '这一行像是「分隔行 |---|」后面又被塞了内容 → 整张表会串列（内容要单独起一行）',
        text: line,
      });
      continue;
    }

    if (cols === 0) {
      // ⚠️ 表格行的顺序是「表头 → 分隔行 → 数据行」，所以看到表头时 cols 还是 0。
      //    要【往后看一眼】：下一行是分隔行 → 这是表头，正常；否则才报"缺分隔行"。
      const next = (lines[i + 1] || '').trimStart().trimEnd();
      if (isSeparator(next)) continue; // 表头，合法
      problems.push({ lineNo, msg: '这行像是表格，但下面没有「分隔行 |---|」→ 不写它就不是表格', text: line });
      continue;
    }

    const got = cells(line).length;
    if (got !== cols) {
      problems.push({
        lineNo,
        msg: `格子数是 ${got}，但这张表（第 ${startLine} 行开始）是 ${cols} 列 → 多一格就添一个「 | 」，少一格就补一个空的「 | | 」`,
        text: line,
      });
    }
  }

  return problems;
}

function main() {
  const args = process.argv.slice(2);
  let files = args;
  if (files.length === 0) {
    const notes = path.join(process.cwd(), 'notes');
    files = fs.existsSync(notes)
      ? fs.readdirSync(notes).filter((f) => f.endsWith('.md')).map((f) => path.join(notes, f))
      : [];
    if (files.length === 0) {
      console.log('没找到要检查的文件。用法：node tools/check-md-tables.js [文件...]');
      process.exit(0);
    }
  }

  let total = 0;
  for (const f of files) {
    let problems = [];
    try {
      problems = checkFile(f);
    } catch (err) {
      console.log(`跳过 ${f}：${err.message}`);
      continue;
    }
    const shown = path.relative(process.cwd(), f) || f;
    if (problems.length === 0) {
      console.log(`✅ ${shown}`);
    } else {
      console.log(`❌ ${shown} —— ${problems.length} 处：`);
      for (const p of problems) {
        console.log(`   第 ${p.lineNo} 行：${p.msg}`);
        console.log(`      ${p.text.slice(0, 110)}`);
      }
    }
    total += problems.length;
  }

  console.log(total === 0 ? '\n全部表格都干净 ✅' : `\n共 ${total} 处要修（上面的行号就是 notes 文件里的行号）`);
  process.exit(total === 0 ? 0 : 1);
}

main();
