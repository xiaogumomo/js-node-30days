# js-node-30days

JavaScript + Node.js 30 天实习冲刺（2026-09-11 → 2026-10-12，32 天）

> **日程已重排 2 次**（详见 `js-node-30day-plan.md` §四「进度看板与再计划机制」）。最近一次在 Day 3 结束时：补入两个缺失的前置章节（`setTimeout` 调度、装饰器与 call/apply），四个裸写函数拆成两天，结束日 10/11 → **10/12**。

## 进度

| 周次 | 日期 | 主题 | 状态 |
|---|---|---|---|
| 第 1 周 | 9/11–9/18 | JavaScript 语言核心 + TypeScript 基础 | 🔄 进行中（Day 4 已全绿，Day 5 进行中） |
| 第 2 周 | 9/18–9/24 | Node.js 运行时 + 异步与流 + 工程化 | ⬜ |
| 第 3 周 | 9/25–10/1 | 后端服务 + 数据库 + 测试 + 部署 | ⬜ |
| 第 4 周 | 10/2–10/8 | AI 应用开发（RAG） | ⬜ |
| 收尾 | 10/9–10/11 | 作品集 + 面试冲刺 | ⬜ |

## 每日进度

| Day | 日期 | 主题 | 产出 | 状态 |
|---|---|---|---|---|
| 1 | 9/11 | 环境 + 类型系统 | [日志](notes/day01.md) · [题面](notes/day01-types.md) · [错题本](notes/day01-mistakes.md) · [预测题作答](week1-language/day01-types-prediction.js) | ✅ |
| 2 | 9/12 | 函数与作用域 | [日志](notes/day02.md) · [学习指引](notes/day02-functions.md) · [练习记录](week1-language/day02-functions-practice.js) | ⚠️ 约 30%，阅读欠账已在 Day 3 清掉 |
| 3 | 9/13 | 补 Day 2 + 数组与对象 | [日志](notes/day03.md) · [学习指引](notes/day03-arrays.md) · [作用域练习](week1-language/day02-scope.js) · [数组方法](week1-language/day03-array-methods.js) · [浅拷贝](week1-language/day02-clone.js) · [数组浅拷贝](week1-language/day02-clone-array.js) | ⚠️ 约 52%，四个裸写函数转入 Day 4–5 |
| 4 | 9/14 | 定时器 + 装饰器 + 裸写 debounce + 深克隆 | [日志](notes/day04.md) · [学习指引](notes/day04-timers.md) · [debounce 脚手架](week1-language/day04-debounce-verify.js) · [深克隆脚手架](week1-language/day04-clone-verify.js) · [浅拷贝+深克隆](week1-language/day02-clone.js) · [递归章练习](week1-language/day04-clone-practice.js) | ✅ 全绿（debounce 6/6、数组 7/8 项、深克隆 17/17） |
| 5 | 9/15 | 剩下两个函数 + `p0-toolkit` 立项 | [日志](notes/day05.md) · [任务书](notes/day05-guide.md) · [手机版](notes/day05-phone.md) · [throttle 脚手架](week1-language/day05-throttle-verify.js) · [curry 脚手架](week1-language/day05-curry-verify.js) | 🔄 进行中 |

## 项目

| 项目 | 内容 | 状态 |
|---|---|---|
| p1-cli-organizer | 批量文件整理 CLI（Streams / 背压） | ⬜ |
| p2-task-api | 任务管理 REST API（Fastify + Postgres + Docker + CI） | ⬜ |
| p3-doc-qa | 文档问答服务（RAG + 流式输出） | ⬜ |

## 目录说明

```
week1-language/   第 1 周：JS 语言核心 + TS 练习
week2-runtime/    第 2 周：Node 运行时 / 异步 / 流
week3-backend/    第 3 周：后端服务 / 数据库 / 部署
week4-ai/         第 4 周：LLM / RAG / Agent
projects/         三个交付项目
notes/            每日学习日志（day01.md ... day31.md）
notes/assets/     日志配图，按天分目录（如 notes/assets/day01/）
notes/dayNN-mistakes.md  每日错题本（逐题记录 + 错因聚类 + 复练题）
```

## 日志

- [Day 1 — 2026-09-11](notes/day01.md) —— 环境搭建 + JS 类型系统，26 道预测题作答
  - 学习指引：[Day 1 学习指引：JS 类型系统](notes/day01-types.md)
  - 错题本：[Day 1 错题本](notes/day01-mistakes.md)（26 题：10 对 / 5 错 / 11 空白）
- [Day 2 — 2026-09-12](notes/day02.md) —— 函数与作用域（部分完成约 30%，欠账 0.7 天已并入 Day 3）
  - 学习指引：[Day 2 学习指引：函数与作用域](notes/day02-functions.md)
  - 当日练习：[day02-functions-practice.js](week1-language/day02-functions-practice.js)
- [Day 3 — 2026-09-13](notes/day03.md) —— 补 Day 2 + 数组与对象（部分完成约 52%，四个裸写函数转入 Day 4–5）
  - 学习指引：[Day 3 学习指引：补 Day 2 + 数组与对象](notes/day03-arrays.md)
  - 日志里保留了本人手写的「学会了什么」「卡在哪里」「探索 TODO」原文，AI 复核单独成节
- [Day 4 — 2026-09-14](notes/day04.md) —— 拆掉"无从下手"的墙：定时器 + 装饰器 + 裸写 debounce（✅ 全绿）
  - 学习指引：[Day 4 学习指引：定时器 + 装饰器 + 裸写 debounce](notes/day04-timers.md)
  - 验证脚手架（按计划 §一，"测试允许让 AI 写"，实现由本人写）：
    [debounce 验证脚手架](week1-language/day04-debounce-verify.js)（6/6 通过）、
    [深克隆验证脚手架](week1-language/day04-clone-verify.js)（17/17 通过 + 2 个局限探针）
  - 当日产出：[浅拷贝三种写法 + 手写深克隆](week1-language/day02-clone.js)、[递归章练习](week1-language/day04-clone-practice.js)
- [Day 5 — 2026-09-15](notes/day05.md) —— 剩下两个函数 + `p0-toolkit` 立项（进行中）
  - 任务书：[Day 5 任务书：throttle + curry + p0-toolkit 立项](notes/day05-guide.md)
  - 验证脚手架：[throttle](week1-language/day05-throttle-verify.js)（5 项 + 1 个 leading/trailing 探针）、
    [curry](week1-language/day05-curry-verify.js)（12 项 + 1 个 `fn.length` 陷阱探针）
  - 目标产出：[`week1-language/p0-toolkit/`](week1-language/) —— 第 1 周的第一个真实产出物，测试用 Node 内置的 `node --test`（零依赖，Vitest 排在 Day 8）
