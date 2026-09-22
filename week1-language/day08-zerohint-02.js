

function countChars(str){

    let result = {} ;
    
   for(let key of str){
        
    result[key]=(result[key]??0)+1;
  
  

   }

   return result ;
}
console.log(countChars('aab'));


module.exports={countChars};