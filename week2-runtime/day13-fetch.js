
class HttpError extends Error{
    constructor(status,message){
        super(message??`HTTP${status}`);
        this.name= HttpError;
        this.status = status ;
    }
}
//todo : sleep + new promise 写法不会写了
const sleep=(ms)=>new Promise((r)=>setTimeout(r,ms));

async function fetchWithRetry(url){
     const {
        retries = 3,
        waitMs= 500,
        ...fetchOptions
    } = options ;

    const lastError;
    const totalAttempts = retries + 1;
    for(let attempt = 0 ; attempt < totalAttempts ; attempt++){
        if(attempt>0){
            sleep(waitMs*2**(attempt-1));
        }
     const ac = new AbortController();
     const timer = setTimeout(ac.abort(),waitMs)
        try{
            fetch(url)
        }catch(err){
            
        }
    }
}



module.exports ={fetchWithRetry};
