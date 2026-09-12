// ============================================================
// Day 1 练习：类型系统 26 道"表达式结果预测"题 —— 原始作答记录
// 日期：2026-09-11
// 来源：D:\code\2026\vs code\text_9_11.js（原样搬入仓库，保留当时的作答）
//
// 说明：本文件刻意保留原始答案（包括空着的题），这是"我当时怎么想的"的证据。
//       正确答案、错因分析、补课清单见 notes/day01-mistakes.md
//       题面与标准答案见 notes/day01-types.md
//
// 提交前删掉的一行：VS Code 自动补全误加的 const { cloneElement } = require("react");
// ============================================================

//alert( Boolean("0") ); // true
//alert( Boolean(" ") ); // 空格，也是 true（任何非空字符串都是 true）

//let x = 1 ;
//x = - x ;
//alert ( x ) ;

//alert( '1' + 2 ); // "12"
//alert( 2 + '1' ); // "21" 有字符转字符

// 转化非数字
//alert( +true ); // 1
//alert( +"" );   // 0
//alert ( + true ) ;// 1
//alert ( + false  );// 0

//let apple = " 2 ";
//let orange = " 3 ";
//alert (apple +orange);//"23"

//let apple =" 2 " ;
//let orange =" 3 " ;
//alert ( +apple + +orange ) ;// 5

//+= /= -= *= %=
//+= *= /= -= %=

//let counter = 1 ;
//counter++;
//alert (counter) ;// 2

//let counter = 1 ;
//counter -- ;
//alert ( counter ) ; // 0

//+= -= *= %= /= alert

//所在的行是后置形式 //counter++，它同样对 counter 做加法，但是返回的是 旧值（做加法之前的值）。因此 alert 显示的是 1。
//如果自增/自减的值不会被使用，那么两者形式没有区别：
//let a =(1+2,3+4);
//alert (a);7

//!= == >=

//let user = { name : "John"} ;
//let user = { name : "john" , age : 30 } ;
//let clone = {}
//;
//for(let key in user ) { clone[key] = user [key]

//}

//Object.assign

//let user = {name : " john " };
//let permissions1 = { conview : true};
//let permissions2 = { condedit : true};
//Object.assign （user , permissions1, permissions2 ）;
//alert (user.name)
/* let user = { name : "john" , age: 30 };
let clone = { };
// object.keys(user).foreach(key=>{clone[key]=user[key]});
 */

//习题

/* Q1.  typeof null                        → _object_____
Q2.  typeof undefined                   → ___undfined___
Q3.  typeof NaN                         → ______
Q4.  typeof function(){}                → ______
Q5.  typeof []                          → ______
Q6.  typeof 10n                         → ______
Q7.  typeof class {}                    → ______
Q8.  typeof typeof 1                    → ____string__

Q9.  '5' + 2                            → ____"52"_
Q10. '5' - 2                            → ______
Q11. true + 1                           → ______1
Q12. [] + []                            → ______
Q13. [] + {}                            → ______
Q14. [1,2] + [3]                        → ______[1,2,3]
Q15. 1 + 2 + '3'                        → ______"123"
Q16. '3' + 2 + 1                        → ______"321"

Q17. null == undefined                  → _____true_
Q18. null === undefined                 → ______false
Q19. NaN == NaN                         → ______ture
Q20. '' == 0                            → ______false
Q21. [] == false                        → ______
Q22. [] === false                       → ______

Q23. let a = {n:1}; let b = a; b.n = 2;
     问 a.n                              → ___2___

Q24. let x = 1; let y = x; y = 2;
     问 x                                → ____1__

Q25. new Number(1) === 1                → _____false_

Q26. const obj = {a:1}; obj.a = 2;
     这行合法吗？obj.a 是多少             → ______ */


// ============================================================
// 下一步（自己动手写，别让 AI 代笔 —— 见 js-node-30day-plan.md 的 AI 使用红线）
//
// TODO 1. 把上面 26 题改写成能跑的文件：用 console.log 打印，不要用 alert
//         （alert 是浏览器 API，Node 里会 ReferenceError）
// TODO 2. node 跑一遍，把"我猜的"和"实际输出"并排列出来，对不上的当场查为什么
// TODO 3. 重点把 [] == false 的完整链路（[] → '' → 0）自己讲一遍
// ============================================================
