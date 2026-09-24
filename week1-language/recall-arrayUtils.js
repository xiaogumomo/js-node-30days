


function myMap1(arr,fn){
    let out = [] ;
     for(let i = 0; i<arr.length;i++){
       out.push(fn(arr[item],item ,arr));
     }
     return out ;
}


// console.log(myMap([10,20],(el,i,arr)=>{
//     console.log("输出为：",el,i,arr);return el *2;
// }));


function myReduce1(arr,fn,init){
    let acc=0 ;
    let start = 0;
    if(init === undefined){
        acc =arr[0];
        start = 1 ;
    }else{
        acc=init;
        start = 0 ;
    }
    for(let i=start;i<arr.length;i++){
        acc = fn(acc,arr[i],i,arr);
    }
    return acc;
}

// console.log(myReduce([10,20],(acc,el,i,arr)=>{
//     console.log('输出为：',acc,el,i,arr);return el*2;
// },0));

function myFilter1(arr,fn){
    let out = [];
    for(let i=0;i<arr.length;i++){
        if(fn(arr[i],i,arr)){
            out.push(arr[i]);
        }
    }
    return out ;
}

// console.log(myfilter([10,20],(el,i,arr)=>{
//     console.log("输出为：",el,i,arr);el*2;return true;
// }));


function myMap(arr,fn){
    let out = [];
    for(let i=0;i<arr.length;i++){
        out.push(fn(arr[i],i,arr));
    }
    return out ;
}


function myFilter(arr,fn){
    let out = [];
    for(let i = 0 ;i<arr.length;i++){
        if(fn(arr[i],i,arr)){
            out.push(arr[i]);
        }
    }
    return out ;
}


function myReduce(arr,fn,init){
    let acc = 0 ;
    let start = 0 ;
    if(init === undefined){
        acc =arr[0];
        start = 1 ;
    }else{
        acc = init ; 
        start = 0 ;
    }

    for(let i = start ; i<arr.length ;i++){
        acc=fn(acc,arr[i],i,arr);
    }

    return acc ;
}


 
module .exports ={myMap,myReduce,myFilter};