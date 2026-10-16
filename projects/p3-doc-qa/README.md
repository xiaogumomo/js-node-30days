# p3-doc-qa —— 文档问答服务（RAG）

> 项目 3（Day 26–30，2026/10/12–10/16）。给一堆文档，提问，它带**引用来源**回答，并且**每一步的花费算得出来**。


## 状态

| 天 | 日期 | 内容 | 状态 |
|---|---|---|---|
| Day 1 | 10/12 | `llm.js` 客户端：超时 / 重试 / 日志 / 成本 | 完成 |
| Day 2 | 10/13 | 切块策略 + 向量化入库 | 完成 |
| Day 3 | 10/14 | 检索 + Prompt 组装 + 引用溯源 |完成 |
| Day 4 | 10/15 | 完整链路（上传 → 回答） |完成 |
| Day 5 | 10/16 | 收尾：评估集 / 局限 / 文档 / 部署（待定） | 完成|

## 怎么跑

```powershell
# 1. 装依赖
pnpm install

# 2. 配 key（复制 .env.example 成 .env 填真值）
# 3. 第一通真调用（验收：打印出 status: 200 + 一段中文回答）
node --env-file=.env scratch/01-first-call.js
```

## 怎么测

```powershell
node --test                                     # 假服务器判据（不花一分钱、不看网络脸色）
$env:LLM_LIVE='1'; node --env-file=.env --test test/llm.live.test.js   # 真调用一次（唯一一条花钱的）
```

## 目录

```
src/
http.js 公共层 / llm.js / embed.js / chunk.js / store.js / ask.js   实现脚本  
test/
 ask.test.js/ chunk.test.js/embed.live.test.js/embed.test.js /http.test.js/llm.live.test.js/llm.test.js/store.test.js   测试脚本
scratch/
 01-first-call.js/02-logger-demo.js /03-rag-demo.js/04-ask-reference.js/05-retrieval-exp.js/  实验 / 一次性脚本
```

## 安全底线

- **key 只进 `.env`**（已被仓库根 `.gitignore` 挡住）——不许进代码 / 日志 / git 历史 / 截图。
- 日志里出现 key 本体 = 判据 08 会红（安全级）。

## 已知限制 / 局限


 【问题局限】"较难的问题会答'资料里没有' ，因为问法的用词和原文不一样，相似度低，正确的块可能排不进 top3"（"打错"听起来像答错内容；你实测到的是该答的拒答）


【调用费用问题】一次问答要两笔调用：① embed 问题（很便宜）② chat 生成（花钱的那一笔）→ 比'直接问模型'贵一倍，换来的是能给出处"（embedding 不是大模型 —— 它是把文字变坐标，不生成内容 ✓ 这条明天可能被问到）
