

// curry(函数 f)：
//   返回一个新函数 collect，collect 负责：
//     ① 把这次收到的参数收起来
//     ② 判断"收够了没"—— 够 → 调用 f，把结果返回
//     ③ 不够 → 返回一个新函数，下次再收到参数时继续走①
//写之前需要解决的问题
//怎么收？  fn.apply    或  fn.call






function curry(fn:(...args:any[])=>any){
    
    return function  collect(this:unknown,...adj:any[]){
        if (adj.length >=fn.length){
        return fn.apply(this,adj);
    }
        return function agcollect(this:unknown,...nextadj:any[]){
        return collect.apply(this,adj.concat(nextadj));
       }

    }


}

module.exports = { curry };