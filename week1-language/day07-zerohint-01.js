

// 规则（就四条，别破例）：

// 只给题目 + 验收标准。不给骨架、不给状态表、不给"先干嘛后干嘛"。
// 关掉 AI 补全，卡住只许查 MDN 或 javascript.info（数组/对象那几章），不许问 AI。
// 限时 20 分钟。到点没做出来就停手，把"我卡在哪一步"写进日志 —— 这一题的产出是"看清卡在哪"，不是"写出来"。
// 这道题不许问 AI 要答案。如果你特别想接着想下去（超过 20 分钟也可以），那也只许问 "我卡在哪一步"，不许问"怎么写"。
// 题目：dropNulls(obj)

// 写一个函数 dropNulls(obj)：返回一个新对象，把原对象里值为 null 的键去掉，其他值一律保留。

// 1.新建一个对象
// 2.进入判断语句判断是否为null。
// 3.不是null的话用out[key]=obj[key]填入
//
// 4.输出out
function dropNulls(obj){ 
    let out = {} ;
    let objs = Object.keys(obj);
    for(let key of objs){
        if(obj[key] !== null ){
            out[key]=obj[key];
        }
    }
    
    return out ;
}
{
let names ={ a: 1, b: null, c: 0, d: '', e: false, f: undefined, g: 'x' };

console.log(dropNulls(names));
}
{let names ={};

console.log(dropNulls(names));}
{
    let names ={a: null, b: null};

console.log(dropNulls(names));

console.log(dropNulls(names)!== names);
}


module.exports = { dropNulls };
