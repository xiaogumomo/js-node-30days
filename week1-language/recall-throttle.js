






// 但 throttle 有两条路，都能实现：

// 路线 A：比较时间戳。 记住"上次执行是几点"，每次调用时判断 现在 - 上次 >= interval。需要的 API 是 Date.now()（返回当前毫秒数）。
// 路线 B：开关 + 定时器。 用一个布尔变量当开关，执行时关掉，setTimeout 到点后再打开。


function throttle(fn,delay){
    let start ;
    let end = 0 ;

    
    return function(...arg){
        start = Date.now();
        if(start-end >= delay){
            end = start ;
            return fn.apply(this,arg);
        }

        
    }
}


function throttleBySwitch(fn,delay){
   
    let called = true

    return function(...arg){
        if(called){
            called = false ;
            setTimeout(()=>called =true ,delay);
            return fn.apply(this,arg);
        }
    }
    
}



module .exports={throttle,throttleBySwitch};