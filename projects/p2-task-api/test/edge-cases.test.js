
const fs = require('node:fs');
const os =require('node:os');
const path = require('node:path');
const assert = require("node:assert/strict");
const {DatabaseSync} = require("node:sqlite");
const {test,before,after} = require('node:test');//before after测试开始/结束后各执行一次
//os.tmpdir()造一个临时目录/tmp  mktempSync造一个独立的目录 比如/tmp/edge-a1b2c3

// ① 数据库隔离 —— 必须在 require server 之前
const lab =fs.mkdtempSync(path.join(os.tmpdir(),'edge-'));
process.env.DB_FILE =path.join(lab ,'tasks.db');
//


const {buildServer, hashPassword, verifyPassword, signJwt, verifyJwt }=require('../src/server.js');

//单元测试 测试各个函数是否能使用
test('hashPassword(“same”) 两次需要不相等 ',()=>{
    const stored1 =hashPassword('same');
    const stored2 = hashPassword('same');

    assert.notDeepEqual(stored1,stored2,'盐要生效！');

    
});


test('hashPassword(“same”) 存起来的串以scrypt$开头',()=>{
    const stored1 =hashPassword('same');
    const call =stored1.split('$');

    assert.deepEqual(call[0]+'$','scrypt$');
    
});

test('verifyPassword 对密码→ true,错一个字符 → false',()=>{
    const stored =hashPassword('same');
    assert.deepEqual(verifyPassword('same',stored),true,'对的密码要返回true');
    assert.deepEqual(verifyPassword('sam',stored),false,'错的密码要返回false'); 
});


test('signJwt({sub:7},60) → verifyJwt(...)拿回 sub===7 把中间一个字符改掉 → null；过期（ttlSec=-1）→ null',()=>{
    const token =signJwt({sub:7},60);
    const payload =  verifyJwt(token);
    const [h,p,s]=token.split('.');
     const i = Math.floor(s.length /2);
    const 修改 =`${h}.${p}.${s.slice(0,i)+(s[i]==='x'?'y':"x")+s.slice(i+1)}`;
    assert.notDeepEqual(修改,token);
    const payload修改 = verifyJwt(修改);

    assert.deepEqual(payload修改,null,'把中间一个字符改掉 → null');
    const token1 =signJwt({sub:7},-1);
    const 过期 =verifyJwt(token1);
    

    assert.deepEqual(payload.sub === 7 ,true ,'verifyJwt拿回的payload要完整');
    assert.deepEqual(过期,null,'过期的需要返回null');

});

// ② 起服务：整份文件只起一次

let app ;
let base ;

before(async()=>{
    app = buildServer();
    await  app.listen({port:0,host:`127.0.0.1`});
    base = `http://127.0.0.1:${app.server.address().port}`;

    
});

after(async()=>{
    app.server.closeAllConnections?.()//强制关闭所有活跃的http连接 ?.如果null或者undefined返回undefined跳过后面的操作（短路）
    await app.close();//优雅的关闭Fastify实例
})

// ③ 一个 fetch 帮手：拼地址 + 带头 + 带 body
const api =(p,{method='GET',body,token} = {})=>{
   return fetch(base+p,{
        method,
        headers:{
            ...(body !== undefined? {"content-type":'application/json'}:{}),
            ...(token?{authorization:`Bearer ${token}`}:{}),  
        },
        body:body !== undefined?JSON.stringify(body):undefined,

    });
    
}


//tokenOf(email)帮手： 注册
const pw = 'password123';
async function tokenOf(email){
    const r1 = await api("/auth/register",{ method:'POST', body:{ email, password: pw } });
    const r2 = await api("/auth/login",{ method:'POST', body:{ email, password: pw } });
    return (await r2.json()).token
}

// ④ 一条最小的集成测试的样子
test("'01 不带 token 打 /tasks → 401 + JSON",async()=>{
    const res = await api("/tasks");
    assert.equal(res.status,401);
    const body = await res.json();
    assert.ok(body&&typeof body === 'object');

});

test("02  乱码 token 401（含三段垃圾 'aaa.bbb.ccc' —— 这条会先红）",async()=>{
    const res = await api(`/tasks`,{token:'aaa.bbb.ccc'});
    assert.equal(res.status,401);
   

});



test("05 密码错与邮箱不存在 401 ",async()=>{
    const email = `iso-${Date.now()}@test.local`;
    const r1 = await api(`/auth/register`,{method:'POST',body:{email:email,password:pw}});
    const res1 =await api(`/auth/login`,{method:'POST',body:{email:email,password:pw}});
    const res2 = await api(`/auth/login`,{method:'POST',body:{email:`iso-${Date.now()}@test.local`,password:pw}});
    const res3 =await api(`/auth/login`,{method:'POST',body:{email:email,password:'password456'}});

   

    assert.deepEqual(res1.status,200,'密码邮箱正确肯定登录成功');
    assert.deepEqual(res2.status,401,'邮箱不存在401');
    assert.deepEqual(res3.status,401,'密码错误401');


});


test('06 注册校验：邮箱没 @ / 密码 5 位 → 400，且都没落库',async()=>{
    const email = `iso-${Date.now()}test.local`;
    const r1 = await api(`/auth/register`,{method:'POST',body:{email:email,password:pw}});
    const r2 = await api('/auth/register',{method:'POST',body:{email:`iso-${Date.now()}@test.local`,password:'12345'}});
    const login = await api(`/auth/login`,{method:'POST',body:{password:pw,email:email}});
    assert.deepEqual(login.status,401,'被拒的邮箱不能登陆（入不了库）');
    assert.deepEqual(r1.status,400,'没有@应该显示400');
    assert.deepEqual(r2.status,400,'密码不大于6位显示400');
   

});

test("08 畸形 JSON → 400（这条也会先红）",async()=>{
    const res = await fetch(base+'/auth/register',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:'{"email":}',
    });
    assert.equal(res.status,400);
    const alive =await fetch(base+'/health');
    assert.equal(alive.status,200,'一个坏请求不许把服务弄死');

});

test("09 空 title → 400 且列表不多一条 ",async()=>{
    const db = new DatabaseSync(process.env.DB_FILE);
    const 列 = db.prepare(`SELECT COUNT(*) AS n FROM tasks`).get().n;
    const token = await  tokenOf(`iso-${Date.now()}@test.local`) ;
    const POST = await  api(`/tasks`,{method:'POST',token:token,body:{title:" " , done:false}});
    const 列2 = db.prepare(`SELECT COUNT(*) AS n FROM tasks`).get().n;
    assert.deepEqual(POST.status,400,'标题为空应为400');
    assert.deepEqual(列2,列,'空title列表应该不变');

});

test("10  PATCH done 再 GET 确认+ 空 body 不改字段  ",async()=>{
    const res = await tokenOf(`iso-${Date.now()}@test.local`);
    const post = await api(`/tasks`,{method:'POST',token : res , body:{title: '测试',done:false}});
    const id =(await post.json()).id ;
    const patch = await api(`/tasks/${id}`,{method : 'PATCH',token:res,body:{done:true}});
    const GET = await api(`/tasks/${id}`,{method:'GET',token:res});
    const body =await GET.json();
    assert.deepEqual( body.done , true ,'确认done已经修改了');
    assert.deepEqual( body.title,'测试','空body不应该改');

    const before = await (await api (`/tasks/${id}`,{token:res})).json();
    const noop = await api(`/tasks/${id}`,{method:'PATCH',token:res,body:{}});
    assert.deepEqual(noop.status,200,'空 body 的 PATCH 应该 200');
    const after = await (await api(`/tasks/${id}`,{token:res})).json();
    assert.deepEqual(after,before,'空 body 不该改任何字段');

   

});

test("11 隔离（列表不含别人的 + GET/PATCH/DELETE 各一条 404） ",async()=>{
   const tokenA = await tokenOf(`iso-a-${Date.now()}@test.local`);
   const tokenB = await tokenOf(`iso-b-${Date.now()}@test.local`);
   const created =await api(`/tasks`,{method:'POST',token : tokenA,body:{title:'A的任务',done:false}});
   const tokenAid =(await created.json()).id;
   
   const GETa = await api(`/tasks/${tokenAid}`,{method:'GET',token: tokenA,});
   const GETb =await api(`/tasks/${tokenAid}`,{method:'GET',token: tokenB,});
   const PATCHb =await api(`/tasks/${tokenAid}`,{method:'PATCH',token: tokenB,});

   const DELETEb=await api(`/tasks/${tokenAid}`,{method:'DELETE',token: tokenB,});

  
   assert.deepEqual( GETa.status,200,'A自己GET返回200');
   assert.deepEqual(GETb.status,404,'GETb 写"B 看不到 A 的任务"');
   assert.deepEqual(PATCHb.status,404,'PATCHb 写"B 不能改 A 的任务');
   assert.deepEqual(DELETEb.status,404,'DELETEb 写"B 不能删 A 的任务');
   const listB = await(await api('/tasks',{token:tokenB})).json();
   assert.ok(!listB.some(t=>t.id === tokenAid),'B 的列表里不该出现 A 的任务')



});

test("12 DELETE 自己的 → 再 GET 404。",async()=>{
     const token = await tokenOf(`iso-${Date.now()}@.test.local`);
     const res = await api(`/tasks`,{method:'POST',token:token,body:{title:"测试",done:false}});
     const id = (await res.json()).id;
     const del = await api(`/tasks/${id}`,{method:"DELETE",token:token});
   
 
     assert.deepEqual(del.status,204,'delete自己的返回204');
    
     const del1 = await api(`/tasks/${id}`,{method:"DELETE",token:token});
     assert.deepEqual(del1.status,404,'删不存在的为404');
     
    const get = await api(`/tasks/${id}`,{method:'GET',token:token});
     assert.deepEqual(get.status,404,'再get为404');



});









