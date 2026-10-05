

const crypto = require('node:crypto');


   //从串里把盐取出来再与用相同的盐重新算 比对

    // const [algo,saltHex,keyHex] = stored.split(`$`);

    // const again = crypto.scryptSync(密码,Buffer.from(saltHex,'hex'),32);
    
    // console.log('原密码再算一遍，相等吗？',crypto.timingSafeEqual(again,Buffer.from(keyHex,'hex')));

    // const bad = crypto.scryptSync('错密码',Buffer.from(salt,'hex'),32);
    // console.log("错密码算出来，相等吗:",crypto.timingSafeEqual(bad,Buffer.from(keyHex,'hex')));


    // const salt2 = crypto.randomBytes(16);

    // console.log('两次的串一样吗？',stored === `scrpt$${salt2.toString('hex')}$${crypto.scryptSync(密码,salt2,32).toString('hex')}` );
    

const 密码 = '我的密码123';
function hashPassword(pw){
     //造盐 
    const salt = crypto.randomBytes(16);//造16字节随机数返还一个BUFFER二进制
    // console.log('盐 hex：',salt.toString('hex'));//64个字符

    //造哈希
    const key = crypto.scryptSync(pw,salt,32);
    // console.log("哈希 hex:",key.toString('hex'));
    
    //进数据库的一段
    
    const stored =`scrypt$${salt.toString('hex')}$${key.toString('hex')}`;

    // console.log("要存的串：",stored.slice(0,50)+'...');


    return stored ;
}
function verifyPassword(pw,stored){

    const [algo,saltHex,keyHex] = stored.split("$") ;
    
    const again =  crypto.scryptSync(pw,Buffer.from(saltHex,'hex'),32);

    if(crypto.timingSafeEqual(again,Buffer.from(keyHex,'hex'))){
        return true;
    }

    return false;
    
}


// const password1 =hashPassword(密码);
// const password2 =hashPassword(密码);

// console.log('第一次哈希结果：',password1);
// console.log('第二次哈希结果：',password2);

// const 原密码 =verifyPassword(密码,password1);
// const 假密码 =verifyPassword("假密码",password1);
// console.log('原密码返回：',原密码);
// console.log('假密码返回：',假密码);


// const 改坏 = password1.slice(0,40)+(password1[40] === 'f'?'e':'f')+password1.slice(41);
// console.log('修改哈希后：',verifyPassword(密码,改坏));


// 块2  JWT

// const 秘钥 = 'dev-sercret-不可外传';

// //JSON对象转base64url字符串

// const b64 = (obj)=>Buffer.from(JSON.stringify(obj)).toString('base64url');


// //header部分+payload部分

// const header = b64({alg:'HS256',typ:'JWT'});
// const payload = b64({sub:1,email:'a@b.com',exp:Math.floor(Date.now()/1000)+3600});


// //前面部分signature 

// const sig = crypto.createHmac('sha256',秘钥).update(header+'.'+payload).digest('base64url');


// const token = `${header}.${payload}.${sig}`;
// console.log(`token =`,token);

// const parts = token . split(".");
// const same = (a,b)=> a.length === b.length && crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
// const want = crypto.createHmac('sha256',秘钥).update(parts[0]+'.'+parts[1]).digest('base64url');
// console.log(`①签名对的上吗     ：`,same(parts[2],want));
// //
// const 中间坏 =token.slice(0,40)+(token[40]==='x'?'y':'x')+token.slice(41);

// const p6 = 中间坏.split('.');
// console.log(`②改中间一位还过得去吗：`,same(p6[2],crypto.createHmac("sha256",秘钥).update(p6[0]+'.'+p6[1]).digest('base64url')));


// //换个秘钥签的 ->验不过去

// console.log('③换个秘钥还过得去吗 ： ',same(parts[2],crypto.createHmac('sha256','别的秘钥').update(parts[0]+'.'+parts[1]).digest('base64url')));

// //payload是可读的

// console.log(`④payload 谁都能解除来：`,JSON.parse(Buffer.from(parts[1],'base64url').toString()));

const 秘钥 = 'dev-secret-不可外传';


function signJwt(Payload,ttlSec = 3600){
    const b64 = (obj)=>  Buffer.from(JSON.stringify(obj)).toString('base64url');


    const header = b64 ({alg:'HS256',typ:'JWT'});
    Payload ={...Payload,exp: Math.floor(Date.now()/1000)+ttlSec} ;
   

    const payload = b64 (Payload);

    const sig = crypto.createHmac('sha256',秘钥).update(header+'.'+payload).digest('base64url');
    

    const token = `${header}.${payload}.${sig}`;

    return token ;
}

function verifyJwt(token){
    const parts = token.split('.');
    if(parts.length!== 3){
        return null ;
    }
    
    const same = (a,b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
    const want =  crypto.createHmac('sha256',秘钥).update(parts[0]+'.'+parts[1]).digest('base64url');
    const payload =  JSON.parse(Buffer.from(parts[1],'base64url').toString());
    if(payload.exp && Date.now()/1000>payload.exp) return null ;
    if(!same(parts[2],want)){
          return null ;

    
    }

      return payload ;
}


const t = signJwt({sub:1},60);
console.log(`1解得回对象吗`, verifyJwt(t));

const 改中间 =t.slice(0,40)+(t[40]==="x" ? "y" : "x") +t.slice(41);
console.log('2 改中间一位', verifyJwt(改中间));


const h = Buffer.from(JSON.stringify({alg:"HS256",typ :'JWT'})).toString('base64url');
const p = Buffer.from(JSON.stringify({sub:9})).toString('base64url');

const 别的 = `${h}.${p}.${crypto.createHmac('sha256','别的秘钥').update(h+'.'+p).digest('base64url')}`;
console.log('3别的秘钥签的',verifyJwt(别的));

console.log("4过期的 ",verifyJwt(signJwt({sub:1},-10)));




