
//x
//判断语句如果大于2层=》开始拍平

//ai教的最简单的写法
// function faltOnce(arr){

//  return  arr.reduce((acc,cur)=>
//     acc.concat(cur),[]);

// }


//自己写的循环写法
function flatOnce(arr){
   let  result = [];
    for(let item of arr){
        if(Array.isArray(item)){
            for (let items of item){
                result.push(items);
            }
              
        }else{
        result.push(item);
        }
    }
    return result;
}



module.exports={flatOnce};
// 1.
// {
//  let result = [] ;
//   for(let i of arr){
//     if(Array.isArray(i)){
//         for(let item of i){
//             result.push(item);
//         }
//     }else{
//         result.push(i);
//     }
// }
// }
//2.
// reduce((acc , acu)=>acc.concat(acu),[]);


//3.

// { let result = [];
//     for(let item of  arr){
//     if(Array.isArray(item)){
//         result.push(...item);
//     }else{
//         result.push(item);    
//     }
   
//     }
//      return result;
// }


