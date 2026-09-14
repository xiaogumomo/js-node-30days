// ============================================================
// 产出物：day02-debounce.js —— 防抖（支持 immediate 选项）
// 完成日期：2026-09-14（Day 4）
// 来源：D:\code\2026\vs code\9.14\day04-timers-practice.js 里的 debounce 段
//       （原样搬入，未改写任何逻辑）
// 今天《调度》章的 printNumbers 两版、《装饰器》章的 spy / delay 任务，
// 原样保留在同目录的 day04-timers-practice.js 里。
//
// 实测行为（2026-09-14，Node v24.21.0）：
//   · 普通模式：连调 5 次只执行 1 次；delay 内再次调用会重新计时        ✓
//   · immediate: true：第一次立刻执行，delay 内的后续调用被忽略          ✓
//   · 参数透传：用 ...arg 收集 + fn.apply(this, arg)                    ✓
//   · 【待你确认】immediate: true 时实际是"开头 + 末尾各执行一次"
//     （leading + trailing）。实测：调用后执行 1 次，等 delay 过去后又执行
//     1 次，共 2 次。这不是 bug，是设计选择（lodash 用 leading / trailing
//     两个选项控制）。
//     TODO(你补一句话)：我的 immediate 语义是 ______，因为 ______。
//   · 【设计局限，不是实现错误】普通（trailing）模式下 return result 永远是
//     undefined —— 此刻函数还没执行，result 还是空的。这是防抖本身的
//     时间冲突，面试时能主动讲清是加分项。
//
// 验证：node week1-language/day04-debounce-verify.js
//       期望输出"通过 6 项，失败 0 项"
// 注意：最后那行 module.exports 是测试能读到它的关键，删掉就会变成
//       "导出的 debounce 不是函数"。
// ============================================================

function debounce(fn,delay,immediate=false){
let timer=null;
let result;
return function(...arg) {
    if(timer){
    clearTimeout(timer);
}

if(immediate){
    let callNow=!timer;
    timer=setTimeout(()=>{timer=null},delay);
    if(callNow){
        result=fn.apply(this,arg);
    }
    
}
timer=setTimeout(()=>{result=fn.apply(this,arg);},delay);

return result;
}
}

module.exports = { debounce };
