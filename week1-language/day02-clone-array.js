// ============================================================
// 产出物 5 的支线：数组浅拷贝尝试（原文件名 week1-language-day02-clone.js）
// 完成日期：2026-09-13（Day 3）
// 来源：D:\code\2026\vs code\9.13\week1-language-day02-clone.js（原样搬入，未改写）
//
// 做完了什么：想到用 [...arr] 展开复制数组，再用 arr === arrCopy 判断是不是同一个数组
// —— 思路是对的，数组是引用类型，== / === 比的是地址，所以结果应为 false。
//
// ⚠️ 但有一个会"静默毁掉整个文件"的错误：
//     console.log=[arr==arrCopy];      ← 等号写成了赋值，不是函数调用
//   `console.log = [...]` 是合法语句（给 console 的属性重新赋值），所以**不会报错**，
//   但它把 console.log 换成了一个数组。实测后果：这一行之后的**任何** console.log(...)
//   都会抛 `TypeError: console.log is not a function`，而报错位置在别处，非常难查。
//   正确写法：console.log(arr === arrCopy);
//
// 另外 arr.push(4) 之后要打印 arrCopy 才能证明"副本没被影响"，
// 但两行都写成了 console.log=[arrCopy]（同样是赋值错误），所以什么也证明不了。
//
// 教训：`=` 和 `()` 只差一个字符，一个是赋值、一个是调用。写完先 node 跑一遍，
// 这类错误一跑就暴露 —— 前提是你真的跑了。
// ============================================================


//浅拷贝1
// let arr= [1,2,3];
// let arrCopy=[...arr];
// console.log=[arr==arrCopy];
// console.log=[arr===arrCopy];
// arr.push(4);//复习：at获取最后一个元素at（-1） pop push shifit unshift
// console.log=[arrCopy];
// console.log=[arrCopy];

