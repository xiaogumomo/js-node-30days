


// 写一个 memoize(fn) —— 返回一个新函数；
// 相同参数第二次调用时不重新计算，直接给上次的结果



function   memoize(fn){
    let result= {} ;
    let rem ={};
    return function(...arg){
        if(rem[args]==1){
            return result[args] ;
        }
        rem[args] = rem[args] ?? 1;
        result[args] = fn.apply(this,arg);
        return result[args];
    }
}

module .exports={memoize};