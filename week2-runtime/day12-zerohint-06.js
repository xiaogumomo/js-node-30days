

//countByExt(paths) —— 给一组文件路径（字符串数组），按扩展名统计各有几个。

//countByExt(['a.js','b.js','c.txt'])	{'.js': 2, '.txt': 1}
// countByExt([])	{}
// 没有扩展名的（'README' / 'Makefile'）	键是空字符串 ''（path.extname 就是这么返回的）：countByExt(['README']) → {'': 1}
// 大小写	原样算（'.JS' 和 '.js' 算两个键）—— 这是本题的规定，不是通用真理
// 原数组	不能改
const path = require("node:path");

function countByExt(paths){
    let result = {};
    let arr = [];
    for(let i =0 ; i <paths.length;i++){
        arr[i]=path.extname(paths[i]);
    }

    for(let key of arr){
        result[key] = (result[key]??0)+1 ;
    }
    return result ;
}



//故意红版
// function countByExt(paths){
//     let result = {};
//     let arr = [];
//     for(let i =0 ; i <paths.length;i++){
 //    arr[i]=path.extname(paths[i]);
//     
//     }

//     for(let key of arr){
//         result[key] = result[key]??0+1 ;
//     }
//     return result ;
// }

    module.exports ={countByExt};
