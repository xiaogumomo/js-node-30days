


//
// 这层是今天"抽公共层"的产物：`llm.js` 和 `embed.js` 都调它。
// 它是**最底下那层**，所以它的判据也最"底层" —— 走的全是假服务器，不花钱。
//
// ★ 契约：
//   const { requestJson } = require('../src/http.js');
//
//   await requestJson(url, opts) -> { data, status, latencyMs, attempts }
//     data: 2xx 响应体 JSON.parse 后的对象
//     status: 成功那次的 HTTP 码；latencyMs: 这次尝试耗的毫秒；attempts: 一共试了几次
//
//   opts（全部可选）：
//     method      默认 'POST'
//     headers     默认 {}
//     body        对象 → 自动 JSON.stringify；字符串 → 原样发；undefined → 不带 body
//     timeoutMs   默认 30000（**每次尝试各自计时**）
//     retries     默认 2（= 首次之后再试几次；总次数 = retries + 1）
//     backoffMs   默认 200（退避基数：第 n 次重试前等 backoffMs * 2^(n-2)）
//     logger      默认 pino；形状 .info(obj, msg) / .warn(obj, msg)
//     logFields   默认 {} —— ★ 调用方补充的字段，**合并进每条日志记录**
//                 （llm.js 传 { model }，于是 http 记的每条都带 model → 判据 08 才认）
//
//   行为：
//     2xx → 解 JSON 返回；**body 不是合法 JSON → 抛错**（别静默返回 undefined）
//     网络错 / 超时 / 429 / 5xx → 退避重试，到上限抛最后一个错误（HttpError，带 .status）
//     其它 4xx → **不重试**，立即抛（err.status = 状态码）
//     日志：**每次尝试一条**（成功 info、失败含重试中 warn），
//           字段至少 { status, latencyMs, attempt }，外加 logFields 里的字段
// ============================================================


const pino = require('pino');
const DEFAULT_LOGGER = pino() ;

class HttpError extends Error{
    constructor(status,message){
        super(message??`Http${status}`);
        this.name ='HttpError';
        this.status=status ;
    }
}

const sleep = (ms)=>new Promise((r)=>setTimeout(r,ms));

async function requestJson(url, opts={}){

    const {
        method = opts.method ??'POST',
        headers = opts.headers ?? {} ,
        timeoutMs = opts.timeoutMs ?? 30000 ,
        retries = opts.retries ??2 ,
        backoffMs = opts.backoffMs ??200 ,
        logger = DEFAULT_LOGGER,
        logFields = opts.logFields ?? {},
        body = opts.body ?? undefined ,
        
    }=opts ;


    let lastError;
    let fullattempts =  retries + 1 ;
    let res ;
    let start ;
    let end ;
    let timer;

    
    
    for(let attempt = 0 ; attempt < fullattempts ; attempt++){
        if(attempt>0){
            await sleep(backoffMs * 2 **(attempt-1));
        }
        const controlled = new AbortController();
        timer = setTimeout(()=>controlled.abort(),timeoutMs);
        try{


           start  = performance.now();
          if(!body){
            res = await fetch(url,{
            method,
            headers,
            signal:controlled.signal,
          });
          } else if(typeof body === 'object'){
            res = await fetch(url,{
            method,
            headers,
            body: JSON.stringify(body),
            signal:controlled.signal,
          }); 
          }else{ 
            res = await fetch(url,{
            method,
            headers,
            body,
            signal:controlled.signal,
             });
          }

       


        }catch(err){
            clearTimeout(timer);
            lastError = err ;
            logger.warn({...logFields,err},`超时或出现其他问题，准备重试`);
            continue;
            
        }
          clearTimeout(timer);

    const status =  res.status ;

    if(status >= 200 && status < 300){
        const text = await res.text() ;
        const data = JSON.parse(text);
        end =performance.now() ;
        let latencyMs = end-start ;
        logger.info({...logFields,data,status,latencyMs, attempt:attempt+1},`成功返回了`);
        return {
            data ,
            status,
            latencyMs,
            attempts:attempt+1,
        }
        
    }

    if(status >=400 && status < 500){
        if(status === 429){
            logger.warn({...logFields,status},`429错误重试`);
            continue ;
        }

        logger.error({...logFields,status},`4xx取消重试`);
        throw new HttpError(status);
    }

    if(status >= 500 && status < 600){
        logger.warn({...logFields,status},`服务器错误`);
        lastError = new HttpError(status);
        continue;
    }
     

    lastError = new HttpError(status);
    logger.warn({...logFields,status},`发生其他状态码错误`);
    throw new HttpError(status);


        
    }

    if(lastError){
        logger.warn({...logFields,lastError},`重试多次仍未响应`);
        throw lastError;
    }

    logger.warn({...logFields,err:new Error(`发生未知错误`)},`未知错误`);
    throw new Error(`发生未知错误`);
}


module.exports={requestJson};