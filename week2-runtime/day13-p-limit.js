
// 写一个并发池 —— 「同时最多跑 n 个任务，多的排队」。


// 并发n个任务 超出n个任务等待

// 判断语句 是否有n个任务  有就继续 没有等待
//有 实现方式  promise.

function pLimit(n){
  if(!Number.isInteger(n)|| n < 1){
    throw new Error('n必须为正整数');
  }

  let queue = [];
  let activeCount = 0 ;

  
  const next=()=>{
    if(activeCount >= n|| queue.length === 0){
      return;
    }
    const {fn, resolve,reject} = queue.shift();
    activeCount++;
    
    Promise.resolve()
    .then(()=>fn())
    .then(resolve,reject)
    .finally(()=>{
      activeCount--;
      next();
    })
    
  }


  const limit = (fn)=>{
    return new Promise((resolve,reject)=>{
        queue.push({fn,resolve,reject});
        next();
    });
  }

  return limit;

  
}


module.exports ={pLimit};