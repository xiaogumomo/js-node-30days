



// once(fn) —— 让一个函数只能真正执行一次，
// 之后再调用它就直接返回第一次的结果、不再执行原函数。


function once(fn){
    let result;
    let called = true ;
    

    return function(...arg){
        if(!called){
            return result ;
        }
        called =false ;
        result = fn.apply(this,arg);
        return result ;
        
    }
}


module .exports ={once};