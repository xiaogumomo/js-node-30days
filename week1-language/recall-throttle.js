

// function throttle(fn,interval){//忘记掉函数格式和作用了
//     let now = 0;
//     let last = 0 ;
//     return function(...arg){
//         now = Date.now();
//         if(now-last>=interval){
//             last = now ;
//             return fn.apply(this,arg);//忘记时间到位之后如何执行了
//         }
//     }
// }


// function throttleBySwitch(fn,interval){
//     let waiting = true ;
//     return function(...arg){
//     if(waiting){
//         waiting = false ; 
//         setTimeout(()=>{
//                 waiting = true ;
//             },interval);
//         return fn.apply(this,arg);
//     } 
//     }
// }


// module.exports={throttle, throttleBySwitch};






// 但 throttle 有两条路，都能实现：

// 路线 A：比较时间戳。 记住"上次执行是几点"，每次调用时判断 现在 - 上次 >= interval。需要的 API 是 Date.now()（返回当前毫秒数）。
// 路线 B：开关 + 定时器。 用一个布尔变量当开关，执行时关掉，setTimeout 到点后再打开。


function throttle(fn,interval){
    let now ;
    let last = 0;
    
    return function(...arg){
        now = Date.now();
        if(now-last >= interval){
            last = now ;
            return fn.apply(this,arg);
        }
    }
}



function throttleBySwitch(fn,interval){
    let waiting = true ;
    return function(...arg){
        if(waiting){
            waiting = false ;
            setTimeout(()=>{waiting =true;},interval);
            return fn.apply(this,arg);        
        
        }
    }
}

module .exports ={throttle,throttleBySwitch};


