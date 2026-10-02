


function curry(fn){
    return function collect(...arg){
        if(arg.length >= fn.length){
            return fn.apply(this,arg);
        }

        return function(...args){
            return  collect.apply(this,arg.concat(args));
        }
    }
}


module .exports = {curry};






