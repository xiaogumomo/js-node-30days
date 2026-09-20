



//同一个任务三遍：回调版（把函数当参数传进去，3 秒后调用它）
// → Promise 版（buyfood() 返回 new Promise，用 .then 拿结果）
// → async 版（async function eat() 里 await buyfood()）
// 。三段要打印出同样的结果

//第一段
//回调版



    
   function orderByCallback(cb){
     console.log("我要吃炒饭");
     console.log('正在做炒饭');
     setTimeout(()=>cb(null,"炒饭做好了"),3000);

   }
    orderByCallback((err,food)=>{
        if(err){
            console.log('出错了',err);return;
        }
        console.log(food);    
    });
   


  
    function buyfood(){

    return new Promise((resolve)=>{
        setTimeout(()=>{resolve("炒饭做好了");},3000);
    });
    }
     console.log("我要吃炒饭");
     console.log("正在做炒饭");
     let p = buyfood();
     p.then(data=>console.log(data));

   

    async function eat(){
        console.log("我要吃炒饭");
        let food = await buyfood();
        console.log(food);
        console.log("正在做炒饭");
        return food ;

    }
    //eat();


//第二段

new Promise((resolve)=>{
    resolve("我要吃炒饭");
}).then(function(result){
    console.log(result);
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve("已经拿到饭了");
        },3000);
    });
})
.then(function(result){
    console.log(result);
    return Promise.resolve("开始吃饭了");
}).then(function(result){
    console.log(result);
});



//第三段



async function eatChain(){
    console.log("我要吃炒饭");
    let food = await buyfood() ;
    console.log(food);
    console.log("可以开始吃了");
}
   eatChain();
    

//第 4 段


//Promise 版
{
function login(ok){
    let p = new Promise((resolve,reject)=>{
        if(ok){
            resolve("登陆成功");
        }else{
            reject('登陆失败');
        }
        
    });
    return  p ;
}
let result=login(true);
result.then(data=>console.log(data));
result.catch(error=>console.log(error));
}

//async 版







    async function loginAsync(ok){
         try{
            let r = await login(ok);
            console.log("登陆成功",r);
            return r;
            
        }catch(err){
            console.log("登陆失败",err);
            return null;
        }
    }
     loginAsync(true);
     loginAsync(false);





module.exports={orderByCallback,buyfood,eat,login};




