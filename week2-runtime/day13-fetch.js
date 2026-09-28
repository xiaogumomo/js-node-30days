
class HttpError extends Error {//在Error中加入Httperror错误
    constructor(status,message){
        super(message ?? `HTTP ${status}`);
        this.name ='HttpError';
        this.status = status ; 
    }
}
/**
 * @param {string} url
 * @param {object} options
 * @param {number} [options.retries=3]     最多重试次数（总请求次数 = retries + 1）
 * @param {number} [options.timeoutMs=5000] 单次请求超时
 * @param {number} [options.baseDelayMs=100] 退避基数
 * @param {object} [options.fetchOptions]   透传给 fetch 的其他配置（method/headers/body...）
 */




const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, options = {}) {
  const {
    retries = 3,
    timeoutMs = 5000,
    baseDelayMs = 100,
    ...fetchOptions
  } = options;

  if (!Number.isInteger(retries) || retries < 0) {
    throw new TypeError('retries 必须是非负整数');
  }
  if (timeoutMs <= 0) throw new TypeError('timeoutMs 必须 > 0');//防御性编程，参数写错立马报错

  let lastError;//作用：记住最后一次失败原因
  const totalAttempts = retries + 1;//定义的三次重试机会，一共3+1四次请求

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    // 第 k 次重试前等 baseDelayMs * 2^(k-1)；attempt=0 是首次，不等待 退避等待的实现代码
    if (attempt > 0) {
      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
    //定义一个异步任务取消协议和定时器，时间一到就主动abort停止
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    
    try {//发送请求并清除定时器
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,//signal作用用于取消请求，直接覆盖防止调用方传别的signal
      });
      clearTimeout(timer);//如果成功取消定时器，延时5s后触发定时器直接停止，白等

      const status = res.status;//将发生错误的状态码存入status

      // 成功：2xx → 直接返回，不重试
      if (status >= 200 && status < 300) {
        return res;
      }

      // 5xx → 可重试
      if (status >= 500) {
        lastError = new HttpError(status);
        continue;
      }

      // 其他（3xx/4xx 等）→ 不重试，直接抛
      throw new HttpError(status);
    } catch (err) {
      clearTimeout(timer);

      // 超时被 AbortController 掐掉 → 重试
      if (err.name === 'AbortError') {
        lastError = new Error(`请求超时（${timeoutMs}ms）`);
        lastError.name = 'TimeoutError';
        lastError.cause = err;
        continue;
      }

      // 4xx 等主动抛的 HttpError → 立即冒泡，不重试
      if (err instanceof HttpError) {
        throw err;
      }

      // 网络错误等 → 记录，进入下一次重试
      lastError = err;
    }
  }

  // 全部失败：抛最后一次错误
  if (lastError) throw lastError;
  throw new Error('fetchWithRetry: 未知错误');
}

module .exports = {fetchWithRetry};