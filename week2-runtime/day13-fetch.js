
class HttpError extends Error{
    constructor(status,message){
        super(message??`HTTP${status}`);
        this.name= HttpError;
        this.status = status ;
    }
}
//todo : sleep + new promise 写法不会写了
const sleep=(ms)=>new Promise((r)=>setTimeout(r,ms));

async function fetchWithRetry(url,options = {}){
     const {
        retries = 3,
        waitMs= 100,
        ...fetchOptions
    } = options ;

    let lastError;
    const totalAttempts = retries + 1;
    for(let attempt = 0 ; attempt < totalAttempts ; attempt++){
        if(attempt>0){
           await sleep(waitMs*2**(attempt-1));
        }
     let  res ;
     const controller = new AbortController();
     const timer = setTimeout(()=>controller.abort(),waitMs);
        try{
            res =  await fetch(url,{...fetchOptions,signal:controller.signal});
            
        }catch(err){
            clearTimeout(timer);
            lastError = err;
            continue;
        }

            clearTimeout(timer);
            const status =res.status;

            if(status>=200 && status < 300){
                return res;
            }

            if(status>=500){
                lastError = new HttpError(status);
                continue;
            }

            throw new HttpError(status);
    }

    if(lastError !== undefined)throw lastError;
    throw new Error('发生未知错误');
}



module.exports ={fetchWithRetry};
