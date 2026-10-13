


// 这是今天"内存数组"那条选型的落地：能放向量、能按"最像"查回来。
// 换 pgvector 时，**只要这两个接口不变**，调用方一行都不用改。
//
// ★ 契约：
//   const { createStore, cosineSimilarity } = require('../src/store.js');
//
//   cosineSimilarity(a, b) -> number          // 单独导出的【纯函数】
//     余弦 = (a·b) / (|a| · |b|)
//     ★ 任一向量是**零向量**（模长为 0）→ 返回 0（**不许 NaN、不许抛**）
//     两向量长度不一致 → 抛 Error
//
//   createStore() -> { upsert(items), search(queryVector, topK), size() }
//     items: [{ text, index, start, end, vector }]     // 就是 chunk + embedding 拼起来
//     upsert(items) -> number     写进去几条；**追加**（不去重）
//       元素缺 text 或 vector 不是数组 → 抛 TypeError（别把垃圾静默入进去）
//     search(queryVector, topK = 3) -> [{ text, index, score }]，**按 score 降序**
//       空库 → []；topK 大于库大小 → 返回全部（不抛）
//     size() -> number
//     ★ 每个实例**独立**（一个 upsert 了，另一个的 size() 不受影响）


function cosineSimilarity(a,b){
    
    
     function dot(a,b){//算a·b
        let sum = 0 ;
        for(let i = 0 ; i<a.length ; i++){
            sum += a[i]*b[i];
        }
        return sum ;
     }
     
     function norm(v){ //算模长
        let sum = 0 ;
        for(let i = 0 ; i< v.length ; i ++){
            sum += v[i] * v[i];
        }
        return Math.sqrt(sum);
     }

     if(a.length !== b.length){
        throw new Error(`两个向量必须相等长度`);
     }

     if(norm(a) === 0 || norm(b) === 0){
        return 0 ;
     }


     let  cos = dot(a,b) / (norm(a)*norm(b));

     return cos ;

}


function createStore(){

    const items = [] ;

 

    return {

    upsert(newItems){
    for(let i of newItems){
        if(i.text=== undefined){
            throw new TypeError(`缺text`);
        }
        if(!Array.isArray(i.vector)){
            throw new TypeError(`vector不是数组`);
        }
    }
 
    items.push(...newItems);
    return  newItems.length ;

    },

    search(queryVector,topK = 3){
        const scored = items.map((item)=>({
            text : item.text ,
            index : item.index,
            score : cosineSimilarity(queryVector,item.vector),
        }));

        let result =scored.sort((a,b)=>b.score - a.score).slice(0,topK);
        return result ;
        
    },

    size(){
        return items.length ;
    },
         
    }
    
}


module.exports = {cosineSimilarity,createStore};
