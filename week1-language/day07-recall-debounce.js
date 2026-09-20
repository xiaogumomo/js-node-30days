

function debounce(fn,delay){

  let timer = null;
  let result = 0;
  return function(...arg){
    if(timer){
        clearTimeout(timer);
    } 
     timer  = setTimeout(()=>{result=fn.apply(this,arg);},delay);

     return result;
  }
}

const d =debounce(()=>{console.log("执行");},1000);
for(let i = 0 ; i<3;i++){
  d();
}
   
    module.exports={debounce};