

function throttle(fn,interval){//忘记掉函数格式和作用了
    let now = 0;
    let last = 0 ;
    return function(...arg){
        now = Date.now();
        if(now-last>=interval){
            last = now ;
            return fn.apply(this,arg);//忘记时间到位之后如何执行了
        }
    }
}


function throttleBySwitch(fn,interval){
    let waiting = true ;
    return function(...arg){
    if(waiting){
        waiting = false ; 
        setTimeout(()=>{
                waiting = true ;
            },interval);
        return fn.apply(this,arg);
    } 
    }
}


module.exports={throttle, throttleBySwitch};
