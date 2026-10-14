
const fs = require('node:fs');
const {chunkText} = require('../src/chunk.js');
const {embed} = require("../src/embed.js");
const{cosineSimilarity,createStore } = require('../src/store.js');
const path = require('node:path');
const{requestJson} = require(`../src/http.js`);
const{estimateCost} = require('../src/llm.js');
const{chat} = require('../src/llm.js');
async function demo(){

    //读文件

const notes = fs.readFileSync(path.join(__dirname,'..','..','..','notes','day26.md'),'utf-8');

//切块

const  chunk =  chunkText(notes);
console.log(`============切块demo测试============`);
console.log(`切了${chunk.length}块`);
console.log(`第一块的前几十个字有：${chunk[0].text.slice(0,40)}`);
for(let i = 0 ; i < chunk.length ; i ++ ){
    console.log(`在下标为${i}的时候，它的start为${chunk[i].start},它的end为${chunk[i].end}`);
}
//向量化


const embeded =await embed(chunk.map((c)=>c.text));

console.log(`============向量化demo测试============`);

console.log(`一共拿到${embeded.vectors.length}个向量`);

console.log(`返回的embedding有${embeded.vectors[0].length}维`)


console.log(`这次花了有${embeded.cost}块钱`);
//入库

const s = createStore();
let chunks = [];
for(let i = 0 ; i < chunk.length ; i ++){
    chunks.push({...chunk[i],vector:embeded.vectors[i]})
}
const up = s.upsert(chunks);
console.log(`入库${up}条`);
console.log(`size拼起来的有${s.size()}个`);

// 5. 查（用文档里的话问）
console.log(`============查（用文档里的话问）============`);

const queryVector = await embed([`我的切法（10:25 那格写，3–5 行，发 AI）有哪些`]);

const hits = s.search(queryVector.vectors[0],3);
for(let i of hits){
const c = chunk[i.index];
console.log(`${i.score.toFixed(3)}  [块${i.index},它的text为:${i.text.slice(0,40)}]它的start = ${c.start}，end = ${c.end}`);
}

console.log(`============对照（文档里没有的问题）============`);
const query = await embed([`西湖在哪里`]);

const results = s.search(query.vectors[0],3);
for(let i of results){
const c = chunk[i.index];
console.log(`${i.score.toFixed(3)}  [块${i.index},它的text为:${i.text.slice(0,40)}]它的start = ${c.start}，end = ${c.end}`);
}

}



async function ask(question,{chunks,store,topK = 3}){
  const q = await embed([question]); //vectors,usage, cost,meta
  const hits = store.search(q.vectors[0],topK);//text,index,score
  
  const 资料 = hits.map((h,i)=>`[${i+1}]${h.text}`).join(`\n\n`);
  const message = [
    {role:'system' ,content :'你只根据【资料】回答：资料里没有就说“资料里灭有”。'},
    {role: 'user',content: `【资料】\n${资料}\n\n【问题】\n${question}` },
  ]

  const r = await chat(message) ;//text,usage,cost,meta

  const sources  = hits.map((h)=>{
      const c = chunks[h.index] ;
      return {index:h.index,score:Number(h.score.toFixed(3)),start:c.start,end:c.end};
  });

  return {answer:r.text, cost : r.cost+q.cost ,sources,meta:r.meta};

}


async function main(){
    const notes =  fs.readFileSync(path.join(__dirname,'..','..','..','notes','day26.md',),'utf-8');
    const chunks = chunkText(notes,{size:500,overloap:50});//text ,index,start,end
    const vec = await embed(chunks.map((c)=>c.text));
    const store = createStore();
    store.upsert(chunks.map((c,i)=>({...c,vector:vec.vectors[i]})));
    console.log(`\n[库建好]${store.size()}块 · ${vec.vectors[0].length}维 · 入库花费${vec.cost}元\n`);
    

    for(const question of ['判据结果那栏要回填什么？','西湖在哪里']){
        const r  = await ask(question , {chunks,store});//answer,cost,sources,meta(model,status,latencyMs,attempts)
        console.log(`【问题】${question}`);
        console.log(`【回答】${String(r.answer||'').slice(0,140)}`);
        console.log(`【来源】${r.sources.map((s)=>`[块${s.index}] ${s.score} 原文:${s.start}-${s.end}`).join(`     `)}`);
        console.log(`【花费】${r.cost}元（embed+chat 两笔相加）\n`);
    }

}


main().catch((err)=>{
    console.error('炸了',err);
    process.exit(1);
});


