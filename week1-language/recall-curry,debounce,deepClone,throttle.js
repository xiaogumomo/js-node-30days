


function curry(fn){
    return function  collect(...arg){
        if(arg.length>=fn.length){
            return  fn.apply(this,arg);
        }
        return function nextcollect(...args){
            return collect.apply(this,arg.concat(args));
        }
    }
}

function debounce(fn,delay,immediate=false){
    let timer=0;
    let result =0 ;
    return function(...arg){
        if(timer){
            clearTimeout(timer);
        }
        let callNow ;
        if (immediate){
            callNow =!timer;
            if(callNow){
                result = fn.apply(this,arg);
            }
        }
        timer= setTimeout(()=>{timer=null;result=fn.apply(this,arg)},delay);
        return result;
    }
}

function deepClone(x){
    if (typeof x != "object"|| x === null){
        return x;
    }
    if (Array.isArray(x)){
        return x.map((item)=>deepClone(item));
    }
    let result = {};
    for(let key in x){
        result[key]=deepClone(x[key]);
        }
    return result;
}


function throttle(fn,interval){
    let now = 0;
    let last = 0 ;
    return function(...arg){
        now =Date.now();
        if(now-last>=interval){
            last = now;
            return fn.apply(this,arg);
        }
    }
}

function throttleBySwitch(fn,interval){
    let waiting = true;
    return function (...arg){
        if(waiting){
            waiting = false;
            setTimeout(()=>
                waiting = true,interval);
            return fn.apply(this,arg);
        }
    }
}




module.exports={throttle,deepClone,debounce,curry,throttleBySwitch};