# js-node-30days

JavaScript + Node.js 30 天实习冲刺（2026-09-11 → 2026-10-14，32 个学习日）

> **日程已顺延 4 次**（详见 `js-node-30day-plan.md` §四「进度看板与再计划机制」），结束日 10/11 → 10/12 → 10/13 → **10/14**。原因包括前置章节缺失、以及 9/16 休息、9/18 停摆各 1 天。
>
> ⚠️ **计划里已写明：剩余内容 26.5 个内容日 vs 剩余日历 26 天，缺口 0.5 天**；如果保持现有负载，结束日会落到 11 月上旬。**已决定选 A（2026-09-18）：内容不动、日期跟着实际走。** 执行方式见计划 §四「第四次调整」：每天的负载压到 3～4 小时的量、把清单划干净，多出来的由日期吸收。（Day 4/5 是仅有的两个 100% 完成日，也正是仅有的两个被刻意排轻的日子。）

## 进度

| 周次 | 日期 | 主题 | 状态 |
|---|---|---|---|
| 第 1 周 | 9/11–9/20 | JavaScript 语言核心 + TypeScript 基础 | 🔄 进行中（Day 5 全绿；9/16 休息、9/18 停摆，Day 7 顺延到 9/19） |
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
| 5 | 9/15 | 剩下两个函数 + `p0-toolkit` 立项 | [日志](notes/day05.md) · [任务书](notes/day05-guide.md) · [手机版](notes/day05-phone.md) · [throttle 脚手架](week1-language/day05-throttle-verify.js) · [curry 脚手架](week1-language/day05-curry-verify.js) | ✅ 全绿（throttle 5/5、curry 12/12、工具箱 17/17） |
| 6 | 9/17 | `this` / 原型链 / `class` + 数组 polyfill | [日志](notes/day06.md) · [任务书](notes/day06-this-prototype.md) · [this 演示](week1-language/day06-this.js) · [原型练习](week1-language/day06-prototype.js) · [array polyfill 脚手架](week1-language/day06-array-utils-verify.js) | ⚠️ 约 50%（`this` 完成；原型只做了一半且有语法错误；polyfill 未开始） |
| — | 9/18 | ⚫ **停摆（有事）** | —— | ⚫ 整天未开工 |

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
