
//为什么闭包里的变量不会被垃圾回收？ makeArmy() 返回之后，它的局部变量本来该被回收，为什么 army[0]() 还能打印出 j？
//最终结论
// 因词法环境没有被清除或破坏，army[0]()与外界的作用域链还存在，即函数中的[environment]属性存在，即返回值仍旧保存
//makeArmy() 的执行上下文确实被弹出了，但它创建的词法环境是堆上的对象；返回的那个函数内部有
//[[Environment]] 指向它。你持有 army[0] → 函数活着 → 它指向的词法环境活着 → 里面的变量活着.垃圾回收

// 但 throttle 有两条路，都能实现：

// 路线 A：比较时间戳。 记住"上次执行是几点"，每次调用时判断 现在 - 上次 >= interval。需要的 API 是 Date.now()（返回当前毫秒数）。
// 路线 B：开关 + 定时器。 用一个布尔变量当开关，执行时关掉，setTimeout 到点后再打开。

//路线A


function throttle(fn:(...arg:any[])=>any, interval:number){
    let last =0;
    let now = 0;
    return function(this:unknown,...args:any){

    now = Date.now();
     if(now-last>=interval){
        last= now;
         return fn.apply(this,args);
     }
    
    }
}

//路线B


function throttleBySwitch(this:unknown,fn:(...arg:any[])=>any, interval:number){
   let waiting = true ;
    return function(this:unknown,...args:any){
     if(waiting){
        waiting =false;
        setTimeout(()=>{waiting=true;},interval);
        return fn.apply(this,args);
     }
    
    }
}



 module.exports = { throttle,throttleBySwitch };

