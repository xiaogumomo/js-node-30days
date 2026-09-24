



//定义一个对象out={}；

//for(let i ; i<length;i++)遍历数组
//设定out的起点为[]
//out[keyFn(arr[i])]=arr[i];
//return out ;
function groupBy(arr,keyFn){

    let out = {};
    for(let i=0;i<arr.length;i++){
        const name = keyFn(arr[i]);
       if(out[name]=== undefined){
        out[name]=[];
       }
       out[name].push (arr[i]);
    }
    return out ;
    
}

// console.log("新对象为：",groupBy([{t:'a',v:1},{t:'b',v:2},{t:'a',v:3}],x=>x.t));
// console .log ("新对象为：",groupBy([],x=>x));


module .exports ={groupBy};