const {embed} = require("../src/embed.js");
const{chat} = require('../src/llm.js');


const DEFAULT_SYSTEM = '你是一个数据库管理助手，只根据数据库的内容回答，不要使用你自己的知识或常识，【资料】里没有的内容就直接打‘资料里没有’，不要随便捏造，回答必须标出依据的编号（如[2]）,找不到依据编号就回‘资料里没有’';

async function ask(question,{chunks,store,topK=3,embedOpts = {},chatOpts = {},systemPrompt = DEFAULT_SYSTEM}){
    const q = await embed([question],embedOpts);//vectors,usage, cost,meta
    const hits = store.search(q.vectors[0],topK);//  text : item.text ,index : item.index, score : cosineSimilarity(queryVector,item.vector),

    const 资料 = hits.map((c,i)=>(`[${i+1}]text为${c.text}`)).join(`\n\n`);
    const message = [
        {role : 'system' , content :systemPrompt },
        {role:'user',content:`【资料】里的内容为${资料}\n\n\n【问题】我所问的问题为${question}`},
    ]

    const res = await  chat(message,chatOpts);//text,usage,cost,meta
    const sources = hits.map((c,i)=>{
        return {score : c.score,index:c.index,start:chunks[c.index].start ,end:chunks[c.index].end}
    }) ;
    return {sources ,cost:res.cost+q.cost ,meta:res.meta ,answer:res.text}  ;
            
    
}


module.exports = {ask,DEFAULT_SYSTEM};

