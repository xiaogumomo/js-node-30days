
const net = require('node:net');
const {encode, createDecoder} = require('./frame.js');

const clients = new Set();
function broadcast(msg,from){
    for(const socket of clients){
        if(socket === from) continue ;
        if(!socket.writable) continue ;
        socket.write(msg);
    }
    
}


const server = net.createServer((socket)=>{
    const feed = createDecoder((text)=>broadcast(encode(text),socket));
    clients.add(socket);
    console.log('广播给', clients.size - 1, '个客户端') ;
    console.log(`广播${socket.remoteAddress}${socket.remotePort}进来了`);
    socket.on('data',(msg)=>{
        feed(msg);
    });
    socket.on('close',()=>{
        clients.delete(socket);
        console.log(`广播${socket.remoteAddress}${socket.remotePort}走了`);    
    });
    socket.on('error',(err)=>{
        console.log('出错了',err.code);
        clients.delete(socket);
    })
});

server.on('error',(e)=>console.log('发生错误',e.code));

server.listen(9000,'127.0.0.1',()=>console.log('监听127.0.0.1:9000'));

