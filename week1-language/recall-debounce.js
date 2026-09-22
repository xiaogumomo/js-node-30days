

function debounce(fn,delay,immediate=false){
    let timer = 0 ;
    return function(...arg){
        if(timer){
            clearTimeout(timer)
        }

        if(immediate){
            return fn.apply(this,arg);
        }
        let result = 0;
        timer = setTimeout(()=>{result=fn.apply(this,arg);},delay);
        return result ;
    }
}


module .exports={debounce};