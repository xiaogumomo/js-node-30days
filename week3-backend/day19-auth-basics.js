const crypto = require("node:crypto");
//① exp 怎么算
function signJwt(payload,ttlsec=3000){

payload = {...payload,exp:Math.floor(Date.now()/1000 )+ttlsec}

//b64
const b64 =(i)=>Buffer.from(JSON.stringify(i)).toString("base64url");
//header
const header =b64({alg:'HS256',typ:'JWT'});
// ④ Hmac

//
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-初始秘钥';
const Payload = b64(payload);
hmac = crypto.createHmac('sha256',JWT_SECRET).update(header+'.'+payload).digest('base64url');

const token =`${header}.${Payload}.${hmac}`;
return token ;
}

// ⑤ verify 流程
function verifyJwt(token){
const parts =token.split('.');
if(parts.length !== 3){
    return null ;
}


const same = (a,b)=>a.length === b.length && crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
const want = crypto.createHmac('sha256',JWT_SECRET).update(parts[0]+'.'+parts[1]).digest('base64url');
try{
    const  payload = JSON.parse(Buffer.from(parts[1],'base64url').toString());
    if(payload.exp &&Date.now()/1000>payload.exp){
        return null;
    }
    if(!same(parts[2],want)){
        return null ;
    }
    return payload ;
    
}catch(err){
    return null ;
}


}

