


// 写一个 memoize(fn) —— 返回一个新函数；
// 相同参数第二次调用时不重新计算，直接给上次的结果



// function   memoize(fn){
//     let result= {} ;
//     let rem ={};
//     return function(...arg){
//         if(rem[args]==1){
//             return result[args] ;
//         }
//         rem[args] = rem[args] ?? 1;
//         result[args] = fn.apply(this,arg);
//         return result[args];
//     }
// }

// module .exports={memoize};




//Ai 给的map版


// const VALUE = Symbol('value');
// function memoize(fn){
//     const root = new Map();
//     return function(...arg){
//         let node =root ;
//         for(const a of arg){
//             if(!node.has(a)){
//                 node.set(a,new Map());
//             }
//                 node=node.get(a);//这串代码中的关键，将map对象一层一层保住用于判断是否重复
            
//         }
//         if(node.has(VALUE))return node.get(VALUE);//这个
//         node.set(VALUE,undefined);
//         const value = fn.apply(this,arg);
//         node.set(VALUE,value);
//         return value ;

//     }
// }
// module .exports={memoize};


//Ai 给的JSON版

//自己的判据会三绿一红  第 4 条要改成"内容相同（且属性顺序相同）算同一组"，期望值变 2
//已知限制： 循环会炸



function memoize(fn){
    const cache = new Map();
    return function(...arg){
        const key = JSON.stringify(arg);
        if(cache.has(key))return cache.get(key);
        cache.set(key,undefined);
        const value =fn.apply(this,arg);
        cache.set(key,value);
        return value;
    }
}


module. exports = {memoize};




