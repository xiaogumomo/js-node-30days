



function debounce(fn,delay,immediate=false){
    let timer = null ;
    let result ;
    return function(...arg){
        if(timer){
            clearTimeout(timer);
        }

        if(immediate){
            let nowCall = !timer;
            if(nowCall){
                nowCall = false ;
                result = fn .apply(this ,arg);
            }
        }
        timer = setTimeout(()=>{timer=null;result = fn.apply(this,arg);},delay);
        return result ;
    }
}

module .exports ={debounce};