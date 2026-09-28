



// once(fn) —— 让一个函数只能真正执行一次，
// 之后再调用它就直接返回第一次的结果、不再执行原函数。

// function once(fn){
//     let result ;
//     let called = false ;
//     return function(...args){//g 抛错时算不算"执行过"：算执行过了，进入function已经让函数记住called=true 和result了
//         if(!called){
//             called = true ;
//             result = fn.apply(this,args);
//         }
//         return result;//参数 / this 要不要透传：要透传
       
//     }
// }

//故意红版
// function once(fn){
//     let result ;
//     let called = false ;
//     return function(...args){
//         if(!called){
//             called = true ;
//             result = fn.call(this,args);
//         }
//        return result;
       
//     }
// }


// module .exports ={once};




function once(fn){
    let result ; 
    let called = false ;
    return function(...arg){
        if(!called){
            called = true ;
            result = fn.apply(this,arg);
        }
        return result ;
    }
}

module .exports = {once};