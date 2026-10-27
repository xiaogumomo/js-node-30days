

const net = require('node:net');

const client = net.connect(9000, '127.0.0.1', () => {   
  client.write('hello');
  client.write('world');                                
});

client.setEncoding('utf8');
client.on('data', (t) => console.log('回:', t));
client.on('close', () => console.log('客户端关闭'));
client.on('error', (e) => console.log('客户端错误:', e.code));