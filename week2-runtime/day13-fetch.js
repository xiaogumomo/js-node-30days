
class HttpError extends Error{
    constructor(status,message){
        super(message??`HTTP${status}`);
        this.name = 'HttpError' ;
        this.status = status ;
    }
}


const sleep = (ms)=>new Promise((r)=>setTimeout(r,ms));

async function fetchWithRetry(url,options={}){
    const  {
        retries = 3,
        timeoutMs = 5000 ,
        baseDelayMs = 100 ,
        ...fetchOptions
    }= options;

    if(!Number.isInteger(retries)||retries < 0){
        throw new TypeError('retires 必须为正整数');
    }

    if(timeoutMs<=0){
        throw new TypeError('timeoutMs不能小于等于0');
    }
    
    let lastError ;
    let totalAttempts = retries + 1;
    
    
    for(let attempt = 0 ; attempt < totalAttempts ; attempt ++){
        if(attempt>0){
            await sleep(baseDelayMs *2**(attempt - 1));//忘记退避等待如何执行了
        }

        const controler = new AbortController();//忘记AbortController怎么拼了
        const timer = setTimeout(()=>controler.abort(),timeoutMs);
        
        try{
           const res =  await fetch(url,{...fetchOptions,signal:controler.signal});
           clearTimeout(timer);
           
           const status = res.status;//忘记fetch返回的Response对象具体有哪些了
           
           if(status>=200 && status <300){
            return res ;
           }

           if(status>=500){
            lastError = new HttpError(status);
            continue;
           }

           throw new HttpError(status);
        }catch(err){
            clearTimeout(timer);

            if(err.name ===  'AbortError'){
                lastError = new Error(`请求超时（${timeoutMs}ms）`);
                lastError.name = 'TimeoutError';
                continue ;
            }

            if(err.name === 'HttpError'){
                throw err ;
            }

            lastError = err ;
        }

    }


    if(lastError)throw lastError;
    throw new Error("发生未知错误");


}

module.exports ={fetchWithRetry};
