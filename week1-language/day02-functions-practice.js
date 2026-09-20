// ============================================================
// Day 2 练习：函数与作用域 —— 原始练习记录
// 日期：2026-09-12
// 来源：D:\code\2026\vs code\text_9_12.js（原样搬入仓库，正文未做任何改写）
//
// 今天的清单要求交付四个函数（debounce / throttle / curry / clone），实际交付 0 个。
// 这份文件里是当天真实做过的东西：
//   · Day 1 欠账：[] == false 的口语复述、ToPrimitive 的 hint 笔记
//   · 函数 / 函数表达式两章的示例与课后题（showMessage、checkAge、min、pow、ask 回调）
//   · 数组章练习（push/pop/shift/unshift、length 截断、at(-1)、矩阵、styles 题）  ← 这是 Day 3 的内容
//   · Promise / async-await 手写练习（含"第二遍复习"凭记忆重写）              ← 这是 Day 6 的内容
// 结论：产出量不小，但大部分落在清单之外。
//
// 保留原样（含空着的部分），作为"当天实际做了什么"的证据。
// 日评估见 notes/day02.md；接下来的日程调整见 js-node-30day-plan.md §四。
//
// 提醒：文件里的 prompt() / confirm() 是浏览器 API，在 Node 里会 ReferenceError；
//       你后来自己找到的 node:readline/promises 才是 Node 里的正解。
// ============================================================



// let user ={ name : " john " };
// console.log(user.name);

// const obj ={a:1};
// obj.a= 2 ;
// console.log(obj.a);

//[]==false 口语练习：要解决这个题，首先两边需要进行数字的转换，中括号数组部分首先转化成空字符串，因为是空字符串，数字转化成0，右边boolean型false默认转化成0，因为==不追求形式，返回值为true

//hint
//number
// let =number (obj);
// let n= +obj ;
// let delta = datel - date2 ;
// let greater =user1 > user2 ;//

//string
//let alert (obj);
//anotherObj[obj] = 123 ;

//default
//
//查找并调用三个对象方法
//obj[symbol.toprimitive](hint)
//obj[symbol.tostring()]    obj.valueof()

/* //obj[Symbol.toPrimitive]= function(hint){}
/* let arr= new Array();
let arr=[];


// let fruits = ["appele","orange","plum"];

 */

/* let fruits =["apple","orange","plum"];
console.log(fruits.length); */



// let fruits =["apple","orange","plum"];
// console.log(fruits);


/* let arr = ["apple",{name : "John"},true,function(){console.log("hello")}];
// console.log(arr[2]);
arr[3](); */


// let fruits =["apple","orange","plum"];
// console.log(fruits.at(-1));

//LIFO FIFO

/* let fruits =["apple","orange","plum"];
console.log(fruits.pop());
console.log(fruits); */

/* let fruits =["apple","orange"];
fruits.push("pear")
console.log(fruits);
fruits */

// let fruits =['apple','orange','pear'];
// console.log(fruits.shift());
// console.log(fruits);


// let fruits =['apple','orange','pear'];
// console.log(fruits);
// fruits.unshift('apple');
// console.log(fruits);

//pop  push shift unshift


// let arr = ['apple','orange','pear'];
// for (let i = 0;i<arr.length;i++){
//     console.log(arr[i]);
// }

// let arr=[1,2,3,4,5];
// arr.length=2;
// console.log (arr);
// arr.length =5;
// console.log(arr);
// arr.length=0;
// console.log (arr);

/* 
let arr=new Array(5);
console.log(arr.length);
console.log(arr[0]);

arr=new Array(5);
 */

/* let matrix =[
    [1,2,3],
    [4,5,6],
    [7,8,9]
];
console.log (matrix[1][1]);
 */

// let fruits=['Apples','Pear','Orange'];
// let shoppingCart= fruits;
// shoppingCart.push('Banana');
// console.log (fruits.length)//pop 最后的一个退回   push 最后一个添加  shift 首位一个退回 unshift 首位一个添加



/* 创建一个数组 styles，里面存储有 “Jazz” 和 “Blues”。
将 “Rock-n-Roll” 从数组末端添加进去。
用 “Classics” 替换掉数组最中间的元素。查找数组最中间的元素的代码应该适用于任何奇数长度的数组。
去掉数组的第一个值并显示它。
在数组前面添加 Rap 和 Reggae。 */
// let styles = ['Jazz','Blues'];
// styles.push("Roc-n-Roll");
// console.log(styles);
// styles[Math.floor((styles.length-1)/2)]="Classics";
// console.log(styles);
// console.log(styles.shift());
// styles.unshift('Rap','Reggae');
// console.log(styles);

/* let arr=['a','b'];
arr.push(function(){console.log(this);
});//push 在最后添加，
arr[2]();//arr=['a','b',function()];arr[2]()=fanction()=>a,b,
 */


/* 输入数字求和
重要程度: 4
写出函数 sumInput()，要求如下：

使用 prompt 向用户索要值，并存在数组中。
当用户输入了非数字、空字符串或者点击“取消”按钮的时候，问询结束。
计算并返回数组所有项之和。
P.S. 0 是有效的数字，不要因为是 0 就停止问询。 */

/* const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  const name = await rl.question('请输入你的名字: ');
  console.log(`你好，${name}`);

  rl.close();
}

main();
 */


/*  function suminput(){
    let number=[];
    while (true){
        let value =prompt ("A number please?",0)
        
    }
}  */



/*     let p =new Promise((resolve,reject)
    =>{resolve("任务完成");});
    p.then((result)=>{console.log(result);}); */


// 开始点餐
// （等待3秒）
// 炒饭做好了
// 开始吃饭

//setTimeout(()=>{},time );


function buyfood(){
    return new Promise
    (resolve=>
    {
        setTimeout(
            ()=>{resolve("炒饭做好了");},3000
        );
    });
}


async function eat(){
    console.log('开始点餐');
    const food = await buyfood();
    console.log (food);
    console.log("开始吃饭了");


}
eat();



// function showMessage(){
//     console.log("hello everyone");

// }
// showMessage();

/* function showMessage(){
    let message = "hello everyone";
    console.log(message);
}
showMessage(); */

/* let userName='john';
function showMessage(){
    let message = "hello , "+ userName;
    console.log(message);

}
showMessage(); */

// function showMessage(from,text){
//     console.log(from+':'+text);
// }
// showMessage('Ann','Hello');

// function showMessage(text){
//     if (text === undefined){
//         text='empty message';
//     }
//     console.log(text);
// }
// showMessage();


// function showMessage(text){
//     text=text||"empty";
//     console.log (text);
// }
// showMessage();

//第二遍复习
// 开始点餐
// （等待3秒）
// 炒饭做好了
// 开始吃饭


// function buyfood(){
//     return new Promise(resolve=>{
//     setTimeout(()=>{resolve("炒饭做好了");},3000);
//     });
// }

// async function eat(){
//     console.log("开始点餐");
//     const food = await buyfood();
//     console.log (food);
//     console.log("开始吃饭");
// }
// eat();

// console.log(typeof /x/);

// function checkage(age){
//     return (age>18)?true:confirm ('Do you have your parents permission to access this page?');
// }
// function checkage(age){
//     return (age>18)||confirm ('Did parents allow you?');
// }


// function min(a,b){
//     if(a>b)
//     {
//         return a;
//     }
//     else{
//     return b;

//     }
// }

// function pow(x,n){
//     return x**n;
// }

// function pow(x,n){
//     let result = x;
//     for(let i= 1;i <  n;i++){
//         result *= x;
//     }
//     return result;
// }
// console.log (pow(2,3));


// function ask(question,yes,no){
//     if(confirm(question)//只有在游览器里适用)yes()
//         else no();
// }
// function showok(){
//     console.log("you agreed");
// }
// function showCancel(){
//     console.log("You canceled the execution.");
// }

// ask("Do you agree?",showok,showCancel);

