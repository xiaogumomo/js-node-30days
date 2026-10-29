

const http = require('node:http');
const crypto =  require('node:crypto');

const session = new Map();
const emails = new Map();

function send(res,status){
    res.writeHead(status,{'Content-Type':'application/json ; charset=utf-8'});
    res.end(`${status}状态码错误`);
}
const server = http.createServer((req,res)=>{
     const url = new URL(req.url,'http://'+(req.headers.host ||  'localhost'));
     let raw = '';
     req.on('data',(c)=>{raw += c });
     req.on('end', ()=>{
        let body = {} ;
        try{
            body = raw ?  JSON.parse(raw) :{} ;
        }catch{ };
        if(url.pathname === '/api/register'){
                if(req.method !== 'POST') return send(res,405);
            
                if (!body.email || !body.password){
                    res.writeHead(400,{'Content-Type':'application/json; charset=utf-8'});
                    res.end(JSON.stringify({error:'缺字段'}));
                    return ;
                
                }
            
            
             
                if(emails.has(body.email)){
                    res.writeHead(409,{'Content-Type':'application/json ; charset=utf-8'});
                    res.end("email已存在");
                    return ;
                }
                emails.set(body.email,body.password);
                res.writeHead(201,{'Content-Type': 'application/json; charset=utf-8'});
                res.end(JSON.stringify({id:emails.size,email: body.email}));
                
                return ;
        }
        if(url.pathname === '/api/login'){

            if(req.method !== 'POST') return send(res,405);
            if(emails.get(body.email) !== body.password ){
                res.statusCode = 401 ;
                res.writeHead(401,{'Content-type':'application/json; charset=utf-8'});
                res.end(JSON.stringify({message:'用户名不存在或者密码错误'}));
                return ;
            } 
              const sid = crypto.randomBytes(32).toString('hex');
              session.set(sid,body.email);
              res.writeHead(200,{'Set-Cookie':`sid=${sid};HttpOnly;Path=/`}); 
              res.end(JSON.stringify({message:'登陆成功',data:body.email}));
              return ;
        }

        if(url.pathname === '/api/me'){
            if(req.method !== 'GET')return send(res,405);

    
                const Cookie = req.headers.cookie || '' ;
                const sid = Cookie
                .split(';')
                .map((s)=>s.trim())
                .find((s)=>s.startsWith('sid='))
                ?.slice(4);
                if(!sid || !session.has(sid)){
                    
                   res.writeHead(401,{'Content-type':'application/json; charset=utf-8'});
                   res.end(JSON.stringify({message:'没 Cookie / Cookie 无效'}));
                   return ;
            
                }
                res.writeHead(200,{'Content-type':'application/json; charset=utf-8'});
                res.end(JSON.stringify({message:'收到了',email:session.get(sid)}));
         
                return ;

        }

    
        
        return send(res,404);


     })
});

server.listen(9001,'127.0.0.1',()=>console.log('监听127.0.0.1：9001'));
server.on('error',(e)=>console.log('发生错误了',e.code));





