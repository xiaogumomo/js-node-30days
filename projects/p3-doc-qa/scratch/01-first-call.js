'use strict';
// ============================================================
// scratch/01-first-call.js —— 项目 3 的"第一通真调用"（AI 给的完整示范）
//
// 用途：让你**看一眼真实的 LLM API 长什么样** —— 这是"全新 API 第一遍"，
//       所以给你完整的（按 10/12 的规矩：只有第一遍才给全）。
//
// 跑法（在 projects/p3-doc-qa 里）：
//   1. 复制 .env.example 成 .env，填上你的 key
//   2. node --env-file=.env scratch/01-first-call.js
//
// 验收（跑通长这样）：
//   status: 200
//   回答: （一段中文）
//   用量: { prompt_tokens: 数字, completion_tokens: 数字, ... }
//
// ⚠️ 看完之后：llm.js 里**不许**直接复制这段 —— 合上它自己写。
//    （协议细节记不清时可以查官方文档 —— 查文档是正当技能，不是作弊）
// ============================================================

async function main() {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    console.error('缺 DEEPSEEK_API_KEY —— 检查 .env 里填了没有、以及跑的时候带没带 --env-file=.env');
    process.exit(1);
  }

  const baseUrl = 'https://api.deepseek.com'; // 各家"OpenAI 兼容"接口的 baseURL 都长这样，只换域名
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json', // 我发的 body 是 JSON
      authorization: `Bearer ${key}`, // key 放请求头里，不是放 body / URL（放 URL 会进日志）
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: '用一句话解释什么是 RAG。' }],
      // 真实产品里还有 temperature / max_tokens 这类参数，今天先不碰
    }),
  });

  console.log('status:', res.status);

  if (!res.ok) {
    // 出错时接口通常也会回一个 JSON 说明原因 —— 打印出来，别只看状态码
    const errText = await res.text();
    console.error('请求失败，服务端说：', errText.slice(0, 500));
    process.exit(1);
  }

  const data = await res.json();
  // 这个形状值得记牢：答案藏在 choices 数组的第一条的 message.content 里
  console.log('回答:', data.choices?.[0]?.message?.content);
  // usage = 这一次调用的 token 用量 —— 后面"成本统计"就是拿它 × 价格算的
  console.log('用量:', data.usage);
  console.log(Object.keys(data));  
  console.log(JSON.stringify(data, null, 2)); 
}

main().catch((err) => {
  console.error('炸了：', err);
  process.exit(1);
});
