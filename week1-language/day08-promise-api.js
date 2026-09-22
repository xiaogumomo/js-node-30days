

Promise.all([
      new Promise(resolve=>resolve(1)),
      new Promise((resolve,reject)=>setTimeout(()=>reject("发生错误"),1000)),
      new Promise(resolve=>resolve(2))]).catch(console.log).then(console.log);//如果出现error其他resolve会被忽略


Promise.all([
      new Promise(resolve=>resolve(1)),
      new Promise((resolve,reject)=>setTimeout(()=>reject("发生错误"),1000)),
      new Promise(resolve=>resolve(2))]).then(console.log).catch(console.log);


Promise.allSettled([
    new Promise(resolve=>resolve(1)),
    new Promise((resolve,reject)=>reject("错误")),
    new Promise(resolve=>resolve(2))
]    
).then(console.log);



Promise.race([
    new Promise(resolve=>setTimeout(()=>resolve(1),1000)),
    new Promise((resolve,reject)=>setTimeout(()=>reject("错误"),2000)),
    new Promise(resolve=>setTimeout(()=>resolve(4),500))
]).then(console.log);//演示谁快谁就返回，其他被忽略

Promise.any([
    new Promise(resolve=>setTimeout(()=>resolve(1),2000)),
    new Promise((resolve,reject)=>setTimeout(()=>reject("错误"),500)),
    new Promise(resolve=>setTimeout(()=>(resolve(3)),1000))
]).then(console.log);//演示的是只执行fulfilled属性的


Promise.all([
    new Promise((resolve,reject)=>setTimeout(()=>reject('失败'),500)),
    new Promise(resolve=>setTimeout(()=>{
        resolve(1);console.log("慢的resolve");
    },2000))
]).catch(console.log).then(console.log);


Promise.any([
    new Promise((resolve,reject)=>reject("拒绝1")),
    new Promise((resolve,reject)=>reject("拒绝2"))
]).then(console.log).catch(console.log);



Promise.race([
    new Promise((resolve,reject)=>setTimeout(reject("错误"),500)),
    new Promise(resolve=>setTimeout(resolve(1),1000))
    ]).then(console.log).catch(console.log);

