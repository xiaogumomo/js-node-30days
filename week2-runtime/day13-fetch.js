
class  HttpError extends Error{
    constructor(status, message){
        super(message??`Http${status}`);
        this.name = 'HttpError';
        this.status = status ;
    }
}

sleep = (ms)=>new Promise((r)=>setTimeout(r,ms));


async function  fetchWithRetry(url,opts={}){

    const {
        retries = 2 ,
        backoffMs = 300,
        waitMs = 100,
        ...fetchOptions
    }=opts ;
    let lastError ;
    let fullretries = retries + 1 ; 
    let timer ;
    let res ;

    for(let attempt = 0 ; attempt < fullretries ; attempt++){
        
        if(attempt>0){
            sleep(backoffMs*2**(attempt-1));
        }
        
        let controlled = new AbortController();
        timer = setTimeout(()=>controlled.abort(),waitMs);
        try{
            res = await fetch(url,{signal:controlled.signal});
        }catch(err){
            clearTimeout(timer);
            lastError = err ;
            continue;
        }

        clearTimeout(timer) ;

        const status = res.status ;
        

        if(status>=200 && status < 300){
            return res ;
        }

        if(status>=500 &&status <600){
            lastError = new HttpError(status);
            continue;
        }

        lastError = new HttpError(status) ;
    }

    if(lastError) throw lastError ;
    throw new Error(`发生未知错误`);
    
}

module .exports = {fetchWithRetry};