// ============================================================
// 产出物 5：day02-clone.js —— 浅拷贝三种写法 + 手写深克隆 + structuredClone 对比
// 状态：只做了"浅拷贝三种写法"的一部分，深克隆未开始
// 完成日期：2026-09-13（Day 3）
// 来源：D:\code\2026\vs code\9.13\day02-clone.js（原样搬入，未改写）
//
// 做完了什么：
//   · {...abj} 展开拷贝写了，并用 clone===abj 判断"是不是同一个对象" —— 思路正确
//     （对象是引用类型，=== 比地址，所以结果是 false，正是你要的证据）
//
// AI 复核发现的 3 个问题：
//   1. for...in 的写法不是拷贝：
//        for (let clone in abj) { console.log(clone === abj); }
//      for...in 拿到的是**键名**（字符串 "name"），所以 clone 是 "name"，不是新对象。
//      手写 for...in 浅拷贝的正确形态是：
//        const clone = {};
//        for (const key in abj) { clone[key] = abj[key]; }
//   2. 第 9 行 `let clone = Object.assign({},abj)` 和第 6 行的 `let clone` **重复声明**。
//      同一作用域里 let 不能声明两次，取消注释会 SyntaxError。
//   3. 最关键的一条：三个写法都用 `{name:"John"}` 这种**扁平**对象，
//      而扁平对象证明不了"只复制第一层"—— 改副本属性时原对象当然不变。
//      必须用嵌套对象，比如 {name:'John', address:{city:'NY'}}：
//        const copy = {...nested};
//        copy.address.city = 'LA';
//        console.log(nested.address.city);   // 实测输出 'LA' —— 原对象被改了！
//      这一行输出才是"浅拷贝只复制第一层"的证据。
//
// 下一步：改用嵌套对象重做三种写法；然后手写递归深克隆
// （记得处理 null —— typeof null === 'object' 这个坑在 Day 1 的 Q1 里出现过）。
// ============================================================


//浅拷贝三种写法：{...obj} /Object.assign({}, obj)/for...in，并用代码证明它们只复制第一层
// let abj={
//     name : "John" 
// };
// let clone={...abj};
// console.log(clone);
// console.log(clone===abj);
// let clone = Object.assign({},abj);
// console.log(clone===abj);

// for(let clone in abj){
//     console.log(clone===abj);
// }

