



function debounce(fn,delay,immediate){
    let timer = null ;
    let result = 0 ;
    return function(...arg){
        if(timer){  
            clearTimeout(timer);
        }
        if(immediate){
            let callNow = !timer ;
            if(callNow){
                 result = fn.apply(this,arg);
            }
        }
        timer = setTimeout(()=>{timer=null ;result= fn.apply(this,arg);},delay);
        return result ;
    }
}

module .exports = {debounce};