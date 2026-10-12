const pino  = require('pino');
const DEFAULT_LOGGER= pino() ;



class HttpError extends Error{
    constructor(status,message){
        super(message??`HTTP${status}`);
        this.name = "HttpError";
        this.status = status ;
    }
}

const DEFAULT_PRICE_TABLE={
    "deepseek-chat":{//as of 2026-10-12
        inPerM :0.02 ,
        outPerM: 4,
    },

}
  


const sleep = (ms)=>new Promise((r)=>setTimeout(r,ms));

async function chat(messages=[{role: 'user' , content: '用一句话解释什么是 RAG。'}],opts={}){
    

    let lastError ;
    const {
        priceTable = opts.priceTable ?? DEFAULT_PRICE_TABLE,
        retries=2,
        timeoutMs = 30000,
        backoffMs = 3000,
        logger = DEFAULT_LOGGER,
        model = process.env.LLM_MODEL??'deepseek-chat',
        apiKey=process.env.DEEPSEEK_API_KEY,
        baseUrl=process.env.LLM_BASE_URL??'https://api.deepseek.com', 
        ...fetchOptions
    }=opts;

    if(!apiKey){
        throw Error(`缺DEEPSEEK_API_KEY，看看.env中缺了没有`);
    }

    let fullretires = retries + 1 ;
    
    for(let attempt = 0 ;attempt < fullretires ; attempt++){
        if(attempt > 0){
            await sleep(backoffMs*2**(attempt-1));
        }

        let start = performance.now();

        
        const controlled = new AbortController();
        const timer = setTimeout(()=>controlled.abort(),timeoutMs);
        let res ;

        try{

            res =  await fetch(`${baseUrl}/chat/completions`,{
                signal: controlled.signal,
                headers:{
                    'content-type': 'application/json',
                    'authorization': `Bearer ${apiKey}`,
                },
                body:JSON.stringify({ model, messages }),
                method:'POST',

            });
        }catch(err){

            clearTimeout(timer);
            lastError = err ;
            logger.error({err},`超时或者出现错误了`);
            continue;

        }

        clearTimeout(timer);

        const status = res.status ;
        if(status >= 200 && status<300){
           const data =await res.json();
           const text =data.choices?.[0]?.message?.content;
           const {prompt_tokens:promptTokens,completion_tokens:completionTokens,...rest}= data.usage; //ai给我的
           const usage = {
            promptTokens,
            completionTokens,
            ...rest
           };
           const cost =estimateCost(usage, model, priceTable);
           const latencyMs =performance.now()-start;
           const meta ={
            model : model,
            status: status,
            latencyMs :  latencyMs,
            attempts : attempt+1,
           }
           logger.info({model, status, latencyMs, attempt:attempt+1},`成功返回了`);
           return{text,usage,cost,meta};
        }
        if( status >=500 && status < 600){
            lastError = new HttpError(status);
            logger.warn({lastError},`遇到5xx了需要重试`);
            continue;
        }

        if(status >= 400 && status <500){
            if(status === 429){
                lastError=new HttpError(status);
                logger.warn({lastError},`遇到429了需要重试`);

                continue ;
            }
            logger.warn({err:new HttpError(status)},`遇到4xx(除429)了直接抛错`);
            throw new HttpError(status,`发生了不可重试的错误HTTP${status}`);
        }

        logger.warn({err:new HttpError(status)},`遇到其他错误了`);
        throw new HttpError(status);

    }
    if(lastError){
         logger.warn({err:new Error(`重复多次无效`)},`重复多次无效`);
         throw lastError;
    }
    
    logger.warn({err:new Error(`发生未知的错误`)},`遇到未知错误了`);
    throw new Error(`发生未知的错误`);

    
}
 function estimateCost(usage, model, priceTable){
   
    if(!(model in priceTable)){
        throw new Error(`价格表中没有这个模型:${model}`);
    }

   const fullinputcache =usage.promptTokens ?? 0;
   const  output = usage.completionTokens ?? 0;

    let inputcost =  fullinputcache* priceTable[model].inPerM /1e6;
    let outputcost = output * priceTable[model].outPerM /1e6;
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
