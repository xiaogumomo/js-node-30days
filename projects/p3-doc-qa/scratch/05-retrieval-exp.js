
const {ask,DEFAULT_SYSTEM} = require('../src/ask.js');
const fs = require('node:fs');
const path = require('node:path');
const {chunkText} = require('../src/chunk.js');
const{createStore} = require('../src/store.js');
const{embed} = require('../src/embed.js');

async function askAndLog(question, {store,chunks, systemPrompt,label,notes,锚点}){
    const r = await ask(question,{store,chunks,systemPrompt});
    let  块号 = null ;
    if(锚点){
        const qPos = notes.indexOf(锚点);
        if(qPos<0){
            throw new Error(`这段文字不在文件里--是不是抄错了或者多了空格？`);
        }
         块号 = chunks.findIndex((c)=> qPos >= c.start && qPos < c.end) ;
         if(块号 === -1) throw new Error(`位置${qPos}没有落在任何块里`);
    }
    const 块号显示 = 块号 === null ? '—' : 块号 + 1;
    const top1显示 = r.sources[0].index + 1;
    const 排名显示 = 排名 === null ? '—' : (排名 === -1 ? '未进top3' : 排名 + 1);
    const row = `【${label}】\n\n\n【top1分数】${r.sources[0].score} 【top1块号】${top1显示}【块号】${块号显示} 【块排名】${排名显示} \n\n\n【答案】${String(r.answer).slice(0,60)}\n\n【花费】${r.cost}\n\n【命中块】${r.sources.map((s) => s.index + 1).join(',')}`;

    return {row,...r,question,块号};

}

module.exports={askAndLog};
async function main(){
const notes =  fs.readFileSync(path.join(__dirname,'..','..','..','notes','day26.md'),'utf-8');
const chunks = [
    [1000,100],
    [500,50],
    [200,20],
]
const questions = [
    { name:'Q1',question :'判据结果那栏要回填什么？',锚点:'判据结果'},
    { name: 'Q2',question: '退避怎么写（notes/week2-review.md §三 A 第 3 条） 写出"第 N 次重试前等多久"那行的算式；再用一句话说清两件事', 锚点: '退避怎么写（notes/week2-review.md §三 A 第 3 条） 写出"第 N 次重试前等多久"那行的算式；再用一句话说清两件事' },
    { name: 'Q3',question: '西湖在哪里', 锚点: null  },
]; 
const system = [
    ['A','你是一个数据库管理助手，需要根据数据库的内容回答，【资料】里没有的内容就直接打’资料里没有‘，不要随便捏造'],
    ['B',DEFAULT_SYSTEM],
    ['C',`${DEFAULT_SYSTEM}回答不超过3句，只答所问`]
] ;

for(const[size,overlap] of chunks){
    const chunk = chunkText(notes,{size,overlap});//text,index,start,end
    const vec = await embed(chunk.map((c)=>c.text));//vectors,usage, cost,meta
    const store = createStore() ;
    store.upsert(chunk.map((c,i)=>({...c,vector:vec.vectors[i]})));


    for(const q of questions){
       
           for(const [id,systemPrompt] of system){
                for(const 遍 of [1,2]){
                    const label = `${size}/${overlap}·${id}·${遍}`;
                    const r = await askAndLog(q.question,{store,chunks:chunk,label,锚点:q.锚点,systemPrompt,notes});
                    console.log(r.row);
                }
           }

    }
    
}
}

main().catch((err)=>{
    console.error('炸了',err);
    process.exit(1);
})