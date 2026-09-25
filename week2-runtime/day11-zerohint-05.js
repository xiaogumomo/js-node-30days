
// chunk(arr, size) —— 把数组按 size 切成一组一组。

// chunk([1,2,3,4,5], 2)	[[1,2],[3,4],[5]] ← 最后不足一组也要留下
// chunk([1,2,3,4], 2)	[[1,2],[3,4]]
// chunk([], 3)	[]
// chunk([1,2,3], 10)	[[1,2,3]] ← size 比长度还大
// 原数组	不能改


function chunk(arr,size){
    let result = arr;
    let out = [];
    if (size < 0 || !Number.isInteger(size)){
        throw new Error("size 必须是正整数")//如果size不是0或正整数直接抛错
    }else if(size == 0){//如果size为零直接返回原数组
       out.push(result);
       return out ;
    }
    if(result.length <= size){
        if(result.length !== 0){
           out.push(result);
           return out ;
        }
        return result;
    }
    for(let i=0;i<Math.ceil(result.length/size);i++){
        let arg = []; 
        for(let item = i*size ; item <(i+1)*size;item++){
            if(result[item]!=undefined){
            arg.push(result[item]);
            }

        }
        out.push(arg);
    }

    return out ;
    
}


//故意判红
//红在 chunk([1,2,3,4,5], 2)输出是否正确  [1,2,3], 10输出是否正确 

// function chunk(arr,size){
//     let result = arr;
//     let out = [];
//     if (size < 0 || !Number.isInteger(size)){
//         throw new Error("size 必须是正整数")//如果size不是0或正整数直接抛错
//     }else if(size == 0){//如果size为零直接返回原数组
//        out.push(result);
//        return out ;
//     }
//     if(result.length <= size){
//         if(result.length !== 0){
//            out.push(result);
//            return out ;
//         }
//         return result;
//     }
//     for(let i=0;i<Math.floor(result.length/size);i++){
//         let arg = []; 
//         for(let item = i*size ; item <(i+1)*size;item++){
//             if(result[item]!=undefined){
//             arg.push(result[item]);
//             }

//         }
//         out.push(arg);
//     }

//     return out ;
    
// }


module .exports = {chunk};
