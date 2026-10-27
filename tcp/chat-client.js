#!/usr/bin/env node
// ============================================================
// tcp/chat-client.js —— 手测用的交互客户端（**AI 给的工具，不是你的交付物**）
//
// 协议 v2：4 字节大端长度 + UTF-8 正文（与 frame.js 配套）
// 用法（开三个终端）：
//     node tcp/chat-client.js A
//     node tcp/chat-client.js B
//     node tcp/chat-client.js C
//   输入文字回车发送；输入 exit 退出。
//
// 三条关键规则（socket 与 stdin 的 encoding 是反的，容易搞错）：
//   · socket 走【二进制协议】→ **不能** setEncoding，data 给的是 Buffer
//   · stdin 是【人打的字】   → **要** setEncoding('utf8')，data 给字符串
//   · 所有 write 出去的东西都要先 encode()
// ============================================================
'use strict';
const net = require('node:net');
const { encode, createDecoder } = require('./frame.js');

const name = process.argv[2] || 'guest';
const PORT = Number(process.env.PORT || 9000);

const socket = net.connect(PORT, '127.0.0.1', () => {
  console.log(`[${name}] 已连上 ${PORT}。输入内容回车发送，exit 退出。`);
  socket.write(encode(`[${name}] 进来了\n`)); // encode 不能漏
});

// 每条连接一个解码器，只建一次（建在 data 里会把残余丢掉）
const feed = createDecoder((text) => process.stdout.write('◀ ' + text));
socket.on('data', (chunk) => feed(chunk)); // 原始 Buffer 直接喂

socket.on('close', () => {
  console.log('连接已关闭');
  process.exit(0);
});
socket.on('error', (e) => {
  console.log('连接出错:', e.code);
  process.exit(1);
});

process.stdin.setEncoding('utf8'); // stdin 要 utf8（与 socket 相反）
process.stdin.on('data', (line) => {
  const text = line.trim();
  if (!text) return;
  if (text === 'exit') {
    socket.write(encode(`[${name}] 走了\n`));
    socket.end(); // 半关闭：发 FIN
    return;
  }
  socket.write(encode(`[${name}] ${text}\n`));
});
