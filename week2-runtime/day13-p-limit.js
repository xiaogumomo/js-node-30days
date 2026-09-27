
// 写一个并发池 —— 「同时最多跑 n 个任务，多的排队」。


// 并发n个任务 超出n个任务等待

// 判断语句 是否有n个任务  有就继续 没有等待
//有 实现方式  promise.



function pLimit(concurrency){
  if(!Number.isInteger(concurrency)||concurrency < 1){//直接判断是不是整数和是不是负数，把所有不是正整数的全部抛错，因为没有意义
    throw new TypeError ('concurrency 必须是正整数') ;
  }
  const queue = [] ;
  let activeCount = 0 ;


  const next = () =>{
    if(activeCount >= concurrency||queue.length === 0) return ;
    
    const{fn ,resolve,reject}=queue.shift();
    activeCount ++ ;
    Promise.resolve()
    .then(()=>fn())
    .then(resolve,reject)
    .finally(()=>{
        activeCount--;
        next();
    });
   
  }

  const limit = (fn) =>{
    return new Promise((resolve,reject)=>{
        queue.push({fn,resolve,reject});
        next();
    })
  }
   return limit ;


}

module .exports ={pLimit};