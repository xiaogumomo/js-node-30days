


function myMap(arr,fn){
    let result=[] ;

        for(let i = 0 ; i<arr.length ; i++){
            result[i]=fn(arr[i],i,arr);
        }
        
   return result ;

}




function myFilter(arr,fn){
    let result = [] ;

    for(let i = 0 ;i<arr.length ; i++){
        if(fn(arr[i],i,arr)){
            result.push(arr[i]);
        }
    }
    return result ;
}



function myReduce(arr,fn,initialValue){
     let start ;
     let acc;
    if(initialValue === undefined){
        start = 1;
        acc =arr[0];
    }else{
       
      start = 0; 
      acc=initialValue  ;
    }

    for(let i =start;i <arr.length ; i++){
        acc = fn(acc,arr[i],i,arr);
    }

    return acc ;
    
}
module .exports={myReduce, myFilter,myMap};