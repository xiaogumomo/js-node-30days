
const http = require('node:http');

const server = http.createServer((req,res)=>{
    const url = new URL(req.url,'http://'+(req.headers.host || 'localhost'));
    console.log(req.method,url.pathname,url.searchParams.get('page'));

    let raw = '' ;
    req.on('data',(chunk)=>{raw += chunk ;});
    req.on('end',()=>{
        let body = {} ;
        try{
            body = raw ? JSON.parse(raw) : {} ;
        }catch{
            body = {bad : raw};
        }
        res.writeHead(200,{
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify({path:url.pathname,body}));
        
    });
});

 server.listen(9001,'127.0.0.1',()=> console.log('http://127.0.0.1:9001'));
 server.on('error',()=>console.log('server Error' ,e.code));