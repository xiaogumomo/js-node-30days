#!/usr/bin/env node
// ============================================================
// tcp/chat-server.verify.js —— 聊天服务器判据（AI 写，他跑）
//
// **v2（2026-10-27）**：协议升级为【4 字节大端长度 + UTF-8 正文】，
//   本判据同步使用 frame.js 的 encode / createDecoder 说话。
//   （v1 是裸文本，协议一变判据必须跟着变 —— 判据就是契约。）
//
// 用法：node tcp/chat-server.verify.js
// 前提：同目录下有 chat-server.js + frame.js，监听 127.0.0.1:PORT（默认 9000）
//
// 设计说明：
//   · 不规定消息格式 —— 只断言"某条解码出来的消息里【包含】A 发的内容"
//   · 不管回不回显给自己 —— 那是你的设计决定
//   · 真的起子进程 + 真的连 3 个 socket
// ============================================================
'use strict';
const net = require('node:net');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { encode, createDecoder } = require('./frame.js');

const PORT = Number(process.env.PORT || 9000);
const results = [];
function ok(name, cond, extra) {
  results.push([cond, name]);
  console.log(`${cond ? '✓' : '✗'} ${name}${extra ? '  — ' + extra : ''}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 连一个客户端；收到的字节用 createDecoder 解成消息数组 s.msgs
function connect() {
  return new Promise((res, rej) => {
    const s = net.connect(PORT, '127.0.0.1', () => res(s));
    s.msgs = [];
    const feed = createDecoder((t) => s.msgs.push(t)); // 每条连接一个解码器
    s.on('data', (chunk) => feed(chunk));              // 原始字节直接喂（不 setEncoding）
    s.on('error', rej);
  });
}
const has = (s, kw) => s.msgs.some((m) => m.includes(kw));

(async () => {
  const srv = spawn(process.execPath, [path.join(__dirname, 'chat-server.js')], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let out = '';
  srv.stdout.on('data', (d) => (out += d));
  srv.stderr.on('data', (d) => (out += d));

  await sleep(900);

  let a, b, c;
  try {
    a = await connect();
    ok('1 服务能启动、能连上', true);
    b = await connect();
    c = await connect();
    await sleep(200);

    a.write(encode('hello-from-A'));       // ← v2：带长度头
    await sleep(400);
    ok('2 B 收到 A 的消息', has(b, 'hello-from-A'), JSON.stringify(b.msgs.slice(-2)));
    ok('3 C 收到 A 的消息', has(c, 'hello-from-A'));

    b.destroy();
    await sleep(400);

    a.write(encode('after-B-left'));
    await sleep(400);
    ok('4 B 掉线后，C 仍能收到 A 的消息', has(c, 'after-B-left'));
    ok('5 B 掉线后，服务端进程没崩', srv.exitCode === null, 'exitCode=' + srv.exitCode);

    a.destroy();
    c.destroy();
    await sleep(200);
    ok('6 客户端全部断开后，服务端仍活着', srv.exitCode === null);
  } catch (e) {
    ok('运行阶段出错', false, e.code || e.message);
  } finally {
    srv.kill();
  }

  const pass = results.filter((r) => r[0]).length;
  console.log(`\n${pass}/${results.length} 通过`);
  if (pass !== results.length) {
    console.log('--- 服务端输出（出问题时看这里）---\n' + out);
    process.exitCode = 1;
  }
})();
