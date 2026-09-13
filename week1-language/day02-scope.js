// ============================================================
// 产出物 1：day02-scope.js —— var/let 提升差异、三层作用域、循环里 var vs let
// 完成日期：2026-09-13（Day 3，补 Day 2 的欠账）
// 来源：D:\code\2026\vs code\9.13\week1-language-day02-scope.js（原样搬入，未改写）
//
// 做完了什么：
//   · 提升差异：var 版本 + try/catch 捕获错误的框架写出来了
//   · 三层嵌套作用域：先写 A/B/C 三层，又改成 third() 里同时打印 a/b/c
//     —— 这个改法是对的，正好演示"由内向外逐层查找，找到就停"
//   · 循环 var vs let：两段 setTimeout 写了，但注释自己写明"这段 ai 帮助（原因看不懂
//     题目具体要我干什么）"，即当时没看懂题，属于照答案抄
//   · 额外做了闭包章的官方任务：sum(a)(b)、inBetween、inArray、byField、makeArmy
//     —— 其中 sum(a)(b) 就是柯里化的雏形，byField 是"返回比较函数"的高阶函数，
//        makeArmy 里的 let j=i 也是循环闭包的正确解法
//
// AI 复核发现的 2 个问题：
//   1. 整份文件全是注释，没跑过（第 3 次同类问题）。写完一定要 node 跑一遍。
//   2. 第 26–28 行 ask(...) 里两个箭头函数之间**少了逗号**：
//        ()=> {console.log('you agreed.');}
//        ()=>{console.log("you canceled the execution")}   ← 这里缺逗号
//      取消注释会直接 SyntaxError。这不是"写法差异"，是语法错误。
//
// 下一步：把这三段取消注释跑通，确认拿到的错误信息真的是
//   ReferenceError: Cannot access 'a' before initialization
// ============================================================


//week1-language/day02-scope.js` —— var/let 提升差异、三层作用域、循环里 var vs let


//用箭头函数重写
// 用箭头函数重写下面的函数表达式：

// function ask(question, yes, no) {
//   if (confirm(question)) yes();
//   else no();
// }

// ask(
//   "Do you agree?",
//   function() { alert("You agreed."); },
//   function() { alert("You canceled the execution."); }


// function ask(question ,yes, no){
//     if(confirm(question))yes();else no();

// }

// ask(
//     'Do you agree?',
//     ()=> {console.log ('you agreed.');}
//     ()=>{console.log("you canceled the execution")}
// )


//Math.max(arg1,arg2....,argn);返回参数最大值
//Object.assign(dest,src1,..,srcN)依次将属性从 src1..N 复制到 dest


// function showName(firstname,secondname,...titles){
//      console.log(firstname+" "+secondname);
//  console.log(titles[0]);
//  console.log(titles[1]);
// }

//  showName("Julius", "Caesar", "Consul", "Imperator");

// console.log('hello');

//闭包是指一个函数能记住其外部变量并访问这些变量。因为JavaScript中这些函数会自动通过他们隐藏的属性[[enviroment]]记住他们创建的位置，所以他们可以访问这些外部变量

//闭包 sum
// 重要程度: 4
// 编写一个像 sum(a)(b) = a+b 这样工作的 sum 函数。

// 是的，就是这种通过双括号的方式（并不是错误）。

// //function sum((a)(b)){
//     return a+b;

// }

// console.log(sum((1)(2)));//错误写法

// function sum(a){
//    return (b)=>{
//      return a+b;
//     }
// }
// console.log(sum(1)(2));

// let x=1;
// function func(){
  
//     console.log(x);
//     let x= 2;  
// }

// func();
//"死区"


// function inBetween(a,b){
//        return function x {
//         return x>=a&&x<=b;
//        }
// }

// function  inArray(arr){
//     return function(x){
//         return arr.includes(x);
//     }
// }

// let users = [
//   { name: "John", age: 20, surname: "Johnson" },
//   { name: "Pete", age: 18, surname: "Peterson" },
//   { name: "Ann", age: 19, surname: "Hathaway" }
// ];

// function byFieled(fieldname){
//     return (a,b)=>a[fieldname]>b[fieldname]?1:-1;

// }

// users.sort(byFieled('age'));
// console.log(users);

// function makeArmy(){
//     let shooters=[];
//     let i = 0 ;
//     while (i<10){
//         let j=i;
//         let shooter=()=>{
//             console.log(j);
//         }
//          shooters.push(shooter);
//         i++;
//     }
//     return shooters;

// }
// let army = makeArmy();
// army[0]();


//用 console.log 演示三件事（自己写，别让 AI 代笔）：

// 提升差异：同一个变量名，var 版本输出 undefined，let 版本抛 ReferenceError（用 try/catch 包住把错误信息打印出来）；
// 三层嵌套作用域：三层嵌套函数，每层打印一个变量，注释写清这个变量来自哪一层；
// 循环里的 var vs let：打印 3 次，看两次输出分别是什么。
// 半小时够用。写不出来说明第二节的第 4、5 个问题还没真懂，回去补。

// 提升差异：同一个变量名，var 版本输出 undefined，let 版本抛 ReferenceError（用 try/catch 包住把错误信息打印出来）；
//var与let的差异：1.块作用域 2.var声明的变量可以在声明前使用（全局作用域）


// try{
// function go(){
//     console.log(a);
//     var a=1;
// }

// go();


// }catch(err){
//     console.error({
//         name:err.name,
//         message:err.message,
//         stack: err.stack
    
//     });
// }

//三层嵌套作用域：三层嵌套函数，每层打印一个变量，注释写清这个变量来自哪一层；
// 作用分别为全局作用域 函数作用域 块作用域
// function A(){
//     const a=1;
//     console.log(a);//第一层变量
//     function B(){
//         const b = 2;
//         console.log(b);//第二层变量
//         function C(){
//             const c=3;
//             console.log(c);//第三层变量
        
//         }
//         C();

//     }
//         B();   
// }
// A();

//看ai后的优化版
// function first(){
//     const a="第一层";
//     function second(){
//         const b="第二层"
//         function third(){
//             const c="第三层";
//             console.log(a);//第一层变量
//             console.log(b);//第二层变量
//             console.log(c);//第三层变量

//         }
//         third();
//     }
    
//     second();
// }
// first();


//循环里的 var vs let：打印 3 次，看两次输出分别是什么。


//这段ai帮助（原因看不懂题目具体要我干什么）
//var 

// for (var i=0;i<3;i++){
// setTimeout(()=>{console.log(i);},1000); 
// }

// //let
// for (let i=0 ; i< 3 ;i++){
//     setTimeout(()=>{console.log(i);},1000);
// }