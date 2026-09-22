

function curry(fn){

     return function  collect(...arg){
        if(arg.length >= fn.length){
            return fn.apply(this,arg);
        }
         return function  accollect(...args){
         return collect.apply(this,arg.concat(args));//忘了的部分：用什么方式分开数组含数组的形式（例如：[1,[1,2]]）
        }
    }    
    
}

module.exports={curry};