

// ★ 契约：
//   const { embed } = require('../src/embed.js');
//
//   await embed(texts, opts) -> { vectors, usage, cost, meta }
//     vectors: number[][]   与 texts **同序、同长**（第 i 条文本 → vectors[i]）
//     usage:   { promptTokens, totalTokens }   从响应 usage.prompt_tokens / total_tokens 映射
//     cost:    number        = estimateCost(usage, model, priceTable)
//     meta:    { model, status, latencyMs, attempts }   ← 来自公共层 requestJson
//
//   opts（全部可选）：
//     apiKey     默认 process.env.SILICONFLOW_API_KEY（没有 → 立刻抛错，信息里要点名 SILICONFLOW_API_KEY）
//     baseUrl    默认 process.env.EMBED_BASE_URL ?? 'https://api.siliconflow.cn/v1'
//     model      默认 process.env.EMBED_MODEL ?? 'BAAI/bge-m3'
//     timeoutMs / retries / backoffMs / logger   透传给 requestJson
//     priceTable 默认内置表（bge-m3 在硅基流动是免费档 → inPerM: 0；**以官网为准**）
//
//   行为：
//     **内部必须调 `src/http.js` 的 `requestJson`**（别再抄一套重试）→ 判据 08 就是守这条
//     请求：POST `${baseUrl}/embeddings`，头 authorization: Bearer <key>，体 { model, input: texts }
//     texts 为空数组 → 直接返回（**不发请求**）
//     texts 不是数组 / 含非字符串 → 抛 TypeError（**不发请求**）
//     **返回条数 ≠ 输入条数 → 抛错**；**各条维度不一致 → 抛错**（这两条防"静默对不齐"）

const {requestJson}= require('./http.js');
const {estimateCost}=require(`./llm.js`);

const DEFAULT_PRICE_TABLE ={

    'BAAI/bge-m3':{
      inPerM: 0,
      outPerM: 0,
   }
    
}
async  function embed(texts,opts={}){
    const {
        apiKey = process.env.SILICONFLOW_API_KEY,
        baseUrl = process.env.EMBED_BASE_URL ?? 'https://api.siliconflow.cn/v1',
        model = process.env.EMBED_MODEL ?? 'BAAI/bge-m3',
        timeoutMs,
        retries,
        backoffMs,
        logger,
        priceTable =DEFAULT_PRICE_TABLE,

    }= opts ;
    

    if(!apiKey){
        throw new Error(`需要SILICONFLOW_API_KEY`);
    }

    if(!Array.isArray(texts)){
        throw new TypeError(`texts为非数值`);
    }
    if(texts.some(item=>typeof item !== 'string')){
        throw new TypeError(`texts内含非字符串`);
        
    }
    if(texts.length === 0){
        return { 
        vectors: [], 
        usage: { 
            promptTokens: 0, totalTokens: 0 
        }, 
        cost: 0,
         meta: {  
            model, status:0, latencyMs:0,attempts:0,
        } 
        };
     }
    
    const url = `${baseUrl}/embeddings`;
    const res = await  requestJson(url,{
        method:'POST',
        headers:{
            'content-type' : 'application/json',
            'authorization': `Bearer ${apiKey}`,
        },
        body: {model,input:texts},
        timeoutMs,
        retries,
        backoffMs,
        logger,
        logFields: {model},
    })
       const data = res.data ;

    const rows = data.data;
    if(rows.length !== texts.length){
        throw new Error(`返回条数 ≠ 输入条数`);
    }
    for(let i of rows){
        if(rows[0].embedding.length !== i.embedding.length){
            throw new Error(`各条维度不一致`);
        }
    }

    let vectors =  [] ;
    for(let i of data.data){
        vectors.push(i.embedding);
    }//问ai的
    const {prompt_tokens:promptTokens,total_tokens:totalTokens,completion_tokens:completionTokens} =data.usage ;
    const usage = {
        promptTokens,
        totalTokens,
    }
    const usages ={
         promptTokens,
         completionTokens,
    }
    const cost =estimateCost(usages,model,priceTable) ;

    let meta = {
        model,
        status:res.status,
        latencyMs:res.latencyMs,
        attempts:res.attempts,
    }

    return {vectors,usage, cost,meta};
} 

module.exports = {embed,};