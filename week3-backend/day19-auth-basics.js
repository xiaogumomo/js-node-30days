
const crypto = require('node:crypto');

const test = require("node:test");
const assert = require('node:assert/strict');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-初始秘钥'
function signJwt(payload,ttlsec=3000){
     const b64 = (item)=> Buffer.from(JSON.stringify(item)).toString("base64url");
     const header = b64({alg:'HS256',typ:'JWT'});
     payload = b64({...payload,exp:Math.floor(Date.now()/1000)+ttlsec});
     
     const has = crypto.createHmac('sha256',JWT_SECRET).update(header+'.'+payload).digest('base64url');
     
     const token = `${header}.${payload}.${has}`;

     return token ;

    
}


function verifyJwt(token){
    const parts = token.split('.');
    if(parts.length !== 3){
        return null ;
    }

    const want =  crypto.createHmac('sha256',JWT_SECRET).update(parts[0]+'.'+parts[1]).digest('base64url');
    const same = (a,b)=>a.length === b.length && crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));

    try{
    const payload = JSON.parse(Buffer.from(parts[1],'base64url').toString());
        if(payload.exp && Math.floor(Date.now()/1000) > payload.exp){
            return null ;
        }
        if(!same(parts[2],want)){
            return null ;
        }

        return payload ;
    }catch{
        return null ;
    }

    
}


test("过期应该输出null",()=>{
    const token = signJwt({sub:'5'},-10);
    const payload = verifyJwt(token);
    
    assert.deepEqual(payload,null);
});


test('变更jwt后应该输出null',()=>{
    const  token = signJwt({sub:'5'},3000);

    const [h,p,sig] = token.split('.');
    const i = Math.floor(sig.length/2);
    const tokens =`${h}.${p}.${sig.slice(0,i)+(sig[i]==='x'?'y':'x')+sig.slice(i+1)}`;
    const payload = verifyJwt(tokens);
    
    assert.deepEqual(payload,null);
});


test('正常return应该为payload就不应该是null了',()=>{
    const token = signJwt({sub:'5'},3000);
    const parts = token.split('.');
    const payload=verifyJwt(token);

    assert.notEqual(payload,null);
   
});


test('aaa.bbb.ccc的token拒绝',()=>{
    const token = `aaa.bbb.ccc`;
    const payload = verifyJwt(token);
    assert.deepEqual(payload,null);
    
})



