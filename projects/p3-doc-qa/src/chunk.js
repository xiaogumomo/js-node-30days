


//    step = size - overlap      // 下一块从"上一块的起点"往后挪这么多
//     从 start = 0 开始：
//       end = Math.min(start + size, text.length)
//       产出 { text: text.slice(start, end), index, start, end }
//       **若 end === text.length（这一块已经切到末尾）→ 停**（不再产出多余的"尾巴重叠块"）
//       否则 start += step，继续
//

//   ★ 边界：
//     空串 / 纯空白 → []
//     非字符串（null / 数字 / 数组…）→ 抛 TypeError
//     size 不是正整数 → 抛 Error
//     overlap 为负 或 overlap >= size → 抛 Error（overlap = 0 是**合法**的：不重叠）


// ★ 契约（你实现时必须对齐；判据照它写）：
//
//   const { chunkText } = require('../src/chunk.js');
//
//   chunkText(text, opts) -> [ { text, index, start, end } ]
//     opts: { size = 500, overlap = 50 }        // size/overlap 都以"字符"为单位
//     index: 第几块（0 起）                       // 下游打印/检索会用到
//     start / end: 这一块在【原文】里的下标区间（`end` 不含）—— **给 Day 3 的引用溯源留的**
//     text: 就是 text.slice(start, end)


function chunkText(text,opts={}){
    const {
       size =  500,
       overlap = 50,
    } =opts ;
    
    if(text.trim() === '' || text === ''){
       return text = [] ;
    }
    if(typeof text !== 'string'){
        throw new TypeError(`text应该为string类型`);
    }
    if(!(Number.isInteger(size)&& size>0)){
        throw new Error(`size必须为正整数`);
    }
    if(overlap<0 || overlap>=size){
        throw new Error(`overlap有问题！`);
    }


    let step =  size - overlap ;
    let index =  Math.floor(text.length/step);
    let result = [] ;

    for(let i = 0; i<= index ; i++){
        let start =  i * step ;
        let end = Math.min(start + size, text.length) ; 
    
        let texts = text.slice(start,end);
        result.push({text:texts,index:i,start,end});
        if(end === text.length ){
             break ;
        }

    }



    return result ;

}


module.exports = {chunkText} ;