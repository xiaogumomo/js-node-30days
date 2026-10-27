

const net = require('node:net');

const server = net.createServer((socket) => {         
  console.log('新连接', socket.remoteAddress, socket.remotePort);
  socket.setEncoding('utf8');                          

  socket.on('data', (text) => {                         
    console.log('收到:', JSON.stringify(text));
    socket.write('echo: ' + text);                     
  });

  socket.on('end', () => console.log('对端说完了（半关闭）'));   
  socket.on('close', () => console.log('连接关闭'));             
  socket.on('error', (err) => console.log('连接出错:', err.code)); 
});

server.on('error', (err) => console.log('服务端错误:', err.code)); 

server.listen(9000, '127.0.0.1', () => console.log('监听 127.0.0.1:9000'));