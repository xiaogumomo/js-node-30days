
const fs = require('node:fs');
const {chunkText} = require('../src/chunk.js');
const {embed} = require("../src/embed.js");
const{cosineSimilarity,createStore } = require('../src/store.js');
const path = require('node:path');
const{requestJson} = require(`../src/http.js`);
const{estimateCost} = require('../src/llm.js');
const{chat} = require('../src/llm.js');




async function ask(question,{chunks,store,topK=3,embedOpts = {},chatOpts = {}}){
    const q = await embed([question],embedOpts);//vectors,usage, cost,meta
    const hits = store.search(q.vectors[0],topK);//  text : item.text ,index : item.index, score : cosineSimilarity(queryVector,item.vector),

    const 资料 = hits.map((c,i)=>(`[${i+1}]text为${c.text}`)).join(`\n\n`);
    const message = [
        {role : 'system' , content : '你是一个数据库管理助手，只根据数据库的内容回答，不要使用你自己的知识或常识，【资料】里没有的内容就直接打‘资料里没有’，不要随便捏造，回答必须标出依据的编号（如[2]）,找不到依据编号就回‘资料里没有'},
        {role:'user',content:`【资料】里的内容为${资料}\n\n\n【问题】我所问的问题为${question}`},
    ]

    const res = await  chat(message,chatOpts);//text,usage,cost,meta
    const sources = hits.map((c,i)=>{
        return {score : c.score,index:c.index,start:chunks[c.index].start ,end:chunks[c.index].end}
    }) ;
    return {sources ,cost:res.cost+q.cost ,meta:res.meta ,answer:res.text}  ;
            
    
}


async function main(){

    const notes =  fs.readFileSync(path.join(__dirname,'..','..','..','notes','day26.md'),'utf-8');
    const chunks = chunkText(notes,{size: 500 ,overlap:50});//text:texts,index:i,start,end
    const store = createStore() ;
    const vec = await embed(chunks.map((c)=>c.text));
    const up =store.upsert(chunks.map((c,i)=>({...c,vector:vec.vectors[i]}))) ;
    console.log(`\n\n库建好${store.size()}块，${vec.vectors[0].length}维，入场花费${vec.cost}元`);
    
    for(const question of ['判据结果那栏要回填什么？', '西湖在哪里']){
        const r = await ask(question,{chunks,store}) ;
        console.log(`【问题】${question}`);
        console.log(`【回答】${r.answer}`);
        console.log(`【来源】${r.sources.map((c)=>(`【块${c.index}】${c.score}文本范围在${c.start}-${c.end}`)).join('    ')}`);
    }
    

    
}

module.exports = {ask};





main().catch((err)=>{
    console.error('炸了',err);
    process.exit(1);
});
