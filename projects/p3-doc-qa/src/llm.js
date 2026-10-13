const pino  = require('pino');
const DEFAULT_LOGGER= pino() ;
const {requestJson}= require('./http.js');

const DEFAULT_PRICE_TABLE={
    "deepseek-chat":{//as of 2026-10-12
        inPerM :0.02 ,
        outPerM: 4,
    },

}
  



async function chat(messages=[{role: 'user' , content: '用一句话解释什么是 RAG。'}],opts={}){
    
    const {
        priceTable = opts.priceTable ?? DEFAULT_PRICE_TABLE,
        retries=2,
        timeoutMs = 30000,
        backoffMs = 3000,
        logger = DEFAULT_LOGGER,
        model = process.env.LLM_MODEL??'deepseek-chat',
        apiKey=process.env.DEEPSEEK_API_KEY,
        baseUrl=process.env.LLM_BASE_URL??'https://api.deepseek.com', 
    }=opts;

    if(!apiKey){
        throw Error(`缺DEEPSEEK_API_KEY，看看.env中缺了没有`);
    }
    let url = `${baseUrl}/chat/completions`
    
    const res = await requestJson(url, { 
        method: 'POST',
        headers:{
            'content-type': 'application/json',
            'authorization': `Bearer ${apiKey}`,
        }, 
        body:JSON.stringify({ model, messages }), 
        timeoutMs, 
        retries,
        backoffMs,
        logger,
        logFields: { model },
    }) ;


    const data =res.data;
    const status = res.status ;
    const text =data.choices?.[0]?.message?.content;
    const {prompt_tokens:promptTokens,completion_tokens:completionTokens,...rest}= data.usage; //ai给我的
    const usage = {
    promptTokens,
    completionTokens,
    ...rest
    };
    const cost =estimateCost(usage, model, priceTable);
    const latencyMs =res.latencyMs;
    const meta ={
    model : model,
    status: status,
    latencyMs :  latencyMs,
    attempts : res.attempts,
    }
    logger.info({model, status, latencyMs, attempt:res.attempts},`成功返回了`);
    return{text,usage,cost,meta};


    
    
    
}
 function estimateCost(usage, model, priceTable){
   
    if(!(model in priceTable)){
        throw new Error(`价格表中没有这个模型:${model}`);
    }

   const fullinputcache =usage.promptTokens ?? 0;
   const  output = usage.completionTokens ?? 0;

    let inputcost =  fullinputcache* (priceTable[model].inPerM??0) /1e6;
    let outputcost = output * (priceTable[model].outPerM??0)/1e6;
    let cost = inputcost+ outputcost ;
  

    return cost ;
}


module.exports={chat,estimateCost};






         



// 根据现实高低峰来算的话
// const priceTable ={
//     "deepseek-flash":{//as of 2026-10-12
//         input :{
//             cacheHit:{offPeak:0.02 , peak:0.04},
//             cacheMiss :{ offPeak:0.02,peak:2.0}
//         },
//         output:{offPeak:4.0,peak:8.0}
        
//     },

// }
  




//    const start = new Date(`2026-10-12T09:00:00`).getHours;
//    const end = new Date(`2026-10-12T12:00:00`).getHours;
//    const start1 = new Date(`2026-10-12T14:00:00`).getHours;
//    const end1 = new Date(`2026-10-12T18:00:00`).getHours;
//    const now = new Date().getHours();


//    if(now  >=start && now <= end ){//关于如何限制时间的+如何计算价格我问ai的
//     inputcost = (cacheHit * priceTable[model].cacheHit.peak + cachemiss *priceTable[model].cachemiss.peak)/1_000_000 ;
//     outputcost = output * priceTable[model].output.peak/1_000_000  ;
//     return  inputcost+outputcost ;

    
//    }else if(now>= start1 && now <= end1){
//     inputcost = (cacheHit * priceTable[model].cacheHit.peak + cachemiss *priceTable[model].cachemiss.peak)/1_000_000  ;
//     outputcost = output * priceTable[model].output.peak /1_000_000 ;
//     return  inputcost+outputcost ;
       
//    }
    

//     inputcost = (cacheHit * priceTable[model].cacheHit.offpeak + cachemiss *priceTable[model].cachemiss.offpeak )/1_000_000 ;
//     outputcost = output * priceTable[model].output.offpeak /1_000_000 ;
//     return  inputcost+outputcost ;
