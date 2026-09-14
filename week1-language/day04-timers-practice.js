

// 编写一个函数 printNumbers(from, to)，使其每秒输出一个数字，数字从 from 开始，到 to 结束。

// 使用以下两种方法来实现。

// 使用 setInterval。
// 使用嵌套的 setTimeout。


//使用 setInterval：
// function printNumbers(from , to){
    
//     let current =from;

//     let timerId = setInterval(function(){
//         console.log(current);
//         if(current==to){
//             clearInterval(timerId);
//         }
//         current ++;

//     },1000);
// }

// printNumbers(1,5);


//使用嵌套的 setTimeout：
// function printNumbers(from,to){
//     let current =from ;

//     setTimeout(function go(){
//         console.log(current);
//         if(current<to){
//             setTimeout(go,1000);
//         }
//         current++;
//     },1000);
// }
// printNumbers(5,10);

function work(a,b){
   console.log(a+b);
}//原始函数，接受两个参数，然后输出它们的和

// function spy(func){//func 传进来的原函数
//     function wrapper(...args){//...args是rest参数（收集传入的所有参数，组成数组）多个参数=>一个数组
//         wrapper.calls.push(args);//填入数值到wrapper的calls属性中（ai完整版：将本次调用收到的参数数组args保存到wrapped.calls数组中）
//         return func.apply(this,args);//使用当前wrapper的this作为func的this，并把args数组展开为func的参数调用原函数

//     }
//     wrapper.calls=[];//给Wrapper创建个空数组属性，用来记录之后每次调用的参数

//     return wrapper;
// }
// work = spy (work);

// work(1,2);
// work(4,5);

// for (let args of work.calls){
//     console.log("call:"+args.join());//将work中calls属性数组传入args中再用join合并成字符串
// }


// function f(x){
//     console.log(x);
    
// }

// function delay(f,ms){
//    return function(){
//     setTimeout(()=>f.apply(this,arguments),ms);
//    }
// }

// let f1000= delay(f,1000);
// f1000('text');



// function sayHi(){
  
//      console.log(this.name);

// }

// let user = { name: "John" };
// let admin = { name: "Admin" };

// sayHi.call(user);


// function debounce(func,ms){
//     let timeout;
//     return function(){
//         clearTimeout(timeout);
//         timeout = setTimeout(()=>func.apply(this,arguments),ms);
//     } 
    
// }

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



    
    
  


