

function myReduce(arr,fn,initialValue){
    let start ;
    let acc = 0 ;
    if(initialValue === undefined){
        start = 1 ;
        acc = arr[0];
    }else{
        start = 0 ;
        acc = initialValue ;
    }

    for(let i = start ; i < arr.length ; i++){
        acc = fn(acc,arr[i],i,arr);
    }  

    return acc ;
}


function myMap(arr,fn){
    let acc = [];
    for(let i =0 ; i<arr.length ; i++){
        acc.push(fn(arr[i],i,arr));
    }
    
    return acc ;
}

function myFilter(arr,fn){
    let acc = [] ;
    for(let i = 0 ; i< arr.length ; i ++){
        if(fn(arr[i],i,arr)){
            acc.push(arr[i]);
        }
    }

    return acc ;
}

module .exports = {myMap,myFilter,myReduce};