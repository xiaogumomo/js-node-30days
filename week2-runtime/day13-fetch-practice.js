
const fs = require('node:fs/promises');
//fetchOnce(url, timeoutMs)：用 AbortSignal.timeout(ms) 一行做超时
{
async function fetchOnce(url,timeoutMs){
    const controller = new AbortController();
   try{
    const res = await fetch(url ,{
        signal : AbortSignal.timeout(timeoutMs)
       
    });
    return res ;
   }catch(err){
    if(err.name === 'TimeoutError'){
       throw new Error('请求超时');
    }
   }
}
}
//同样的事，但手写 AbortController + setTimeout(abort) + clearTimeout
{
async function fetchOce(url,timeoutMs){
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(),timeoutMs);
    try{
        const res = await fetch(url,{
            signal : controller.signal ,
        })
        res.finally(()=>{
            clearTimeout(timer);
        });
        return res;
    }catch(err){
        if(err.name === 'AbortError'){
            throw new Error('请求超时');
        }
    }   

    
}

}


{
    async function retryFixed(url,options){
       const sleep=(ms)=>new Promise((r)=>setTimeout(r,ms));
       const {
        retries = 3,
        waitMs = 50,
        ...fetchOptions
       }=options ;
       let lastError ;
       const totalAttempts = retires + 1;
       for(let attempt = 0 ; attempt< totalAttempts ; attempt ++){
        try{
             await sleep(waitMs);
        const res = await fetch(url,{
            ...fetchOptions,
        });
        return res
        }catch(err){
            lastError = err;
            continue ;
        }
       }
       if(lastError) throw lastError;
        throw new Error('fetchWithRetry: 未知错误');

    }


}




// HttpError extends Error + 分类（200 直接回 / 500 重试 / 404 不重试）
{
class HttpError extends Error{
    constructor(status,message){
        super(message??`Http${status}`);
        this.name = 'HttpError' ;
        this.status = status ;
    }
}
async function  fetchWithRetry(url){
    const {
        retries= 3 ,
        ...fetchOptions
    }=options ;
    let lastError ;

    for(let attempt = 0 ; attempt < retires+1 ;attempt++){
            const res = await fetch(url);
            const status = res.status;
            if(status>= 200 && status < 300){
                return res ;
            }
            if(status>= 500){
                lastError = new HttpError(status);
                continue;
            }
            throw new HttpError(status);
   }
    if(lastError) throw lastError;
        throw new Error('fetchWithRetry: 未知错误');
}




}