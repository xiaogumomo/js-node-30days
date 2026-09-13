// ============================================================
// 产出物 6：day03-array-methods.js —— 数组与对象核心（9 项清单）
// 完成日期：2026-09-13（Day 3，今天完成度最高的一份）
// 来源：D:\code\2026\vs code\9.13\week1-language-day03-array-methods.js（原样搬入，未改写）
//
// 清单完成：9 项里 7 项合格
//   ✅ splice / slice / concat / forEach
//   ✅ find / findIndex / filter / map
//   ✅ reduce 三件事（求和、平均、用 reduce 累积成"计数对象"——这个写法很有水平）
//   ✅ sort 的坑（[10,9,100].sort() 得 [10,100,9]，再用比较函数修正）
//   ✅ flat(2) / flat(Infinity) / flatMap
//   ✅ Object.entries + Object.fromEntries
//   ✅ 实战：toSorted 按 age 排序且不改原数组 —— 这条写得对
//   ✅ 附加两个 javascript.info 课后题：camelize()（split+map+join 一行写完）、
//      getMaxSubSum()（最长子数组和 / Kadane 算法）—— 能独立写出来，逻辑能力没问题
//
// ⚠️ 2 项没达到效果（不是"没做"，是"做了但证明不了"）：
//   1. 不可变更新那段（原第 172–180 行）：arr.toSorted() / toReversed() / with() /
//      toSpliced() 都是**只调用、没接住返回值**，然后打印 arr。
//      四次都只打印原数组 [1,5,3,4]，看不出任何效果。
//      应写成：const sorted = arr.toSorted(); console.log(sorted); console.log(arr);
//      实测：sorted = [1,3,4,5]，arr 仍是 [1,5,3,4] —— 这才叫"证明原数组没变"。
//   2. structuredClone 那段（原第 184–192 行）：拷的是 {name, age} 这种**扁平**对象。
//      扁平对象用 {...obj} 也"看起来没影响"，所以证明不了"深"拷贝。
//      要换嵌套对象，如 {name:'John', address:{city:'NY'}}，改副本的 address.city
//      再打印原对象 —— 原对象也跟着变，才说明浅拷贝不够用。
//
// 另外两处（不影响结论，但顺手记下）：
//   · 原第 5 行 console.log(styles.shift) 少了括号，会打印函数本身而不是弹出的值
//     （该行被注释了，所以没造成后果）。
//   · 原第 4 行下标公式 Math.floor(styles.length-1)/2 我实测过，对奇数长度**结果正确**
//     （不是 bug），但括号位置很容易看错，建议写成 Math.floor((styles.length - 1) / 2)。
// ============================================================


// const styles=['Jazz','Blues'];
// styles.push('Rock-n-Roll');
// styles[Math.floor(styles.length-1)/2]="Classics";
// console.log(styles.shift);
// styles.unshift('RaP','Reggae');
// console.log(styles);


// function getMaxsubsum(arr){
//     let maxsum = 0;
//     let partialsum = 0;
//     for(let item of arr){
//         partialsum += item ;
//         maxsum=Math.max(maxsum,partialsum);
//         if(partialsum<0) partialsum =0;

//     }
//     return maxsum;
// }

// console.log(getMaxsubsum([-1, 2, 3, -9]));

// let arr = ["I", "study", "JavaScript"];
// arr.splice(-1,0,"complex", "language");
// console.log(arr);


// let arr = ["t", "e", "s", "t"];
// console.log(arr.slice(1,2));


// let arr=[1,2];

// console.log(arr.concat(1,2));

// const arr =[1,2,3];
// [1,2,3].forEach(console.log);


// let users = [
//   {id: 1, name: "John"},
//   {id: 2, name: "Pete"},
//   {id: 3, name: "Mary"}
// ];

// let user = users.findIndex(item=>item.id==2);
// console.log(user);


// let users = [
//   {id: 1, name: "John"},
//   {id: 2, name: "Pete"},
//   {id: 3, name: "Mary"}
// ];

// let user = users.find(item=>item.id==1);
// console.log(user);

// let users = [
//   {id: 1, name: "John"},
//   {id: 2, name: "Pete"},
//   {id: 3, name: "Mary"}
// ];

// let user = users.filter(item=>item.id<3);
// console.log(user);

// let lengths =["Bilbo", "Gandalf", "Nazgul"].map(item=>item.length);
// console.log(lengths);


//arr.sort arr.splice arr.slice arr.filter arr.split

// function camelize(str){
//     return str
//     .split("-").map((word,index)=>index==0?word:word[0].toUpperCase()+word.slice(1)).join('');


// }
// console.log(camelize("background-color"));

//console.log([3,1,2].toSorted());
//console.log([3,1,2].sort());
//console.log([3,1,2].toReversed());
//console.log([3,1,2].with(0,99));
//console.log([3,1,2].toSpliced(0,1));
//console.log([10,9,100].sort());
//console.log([10,9,100].sort((x,y)=>x-y));
// console.log([1,[2,[3,[4]]]].flat(2));//[1,2,3,[4]]
// console.log([1,[2,[3,[4]]]].flat(Infinity));

//console.log([1,2,3].flatMap(x=>[[x,x*10]]));
//console.log(Object.entries({a:1,b:2}));
//console.log([1,2,3,4].reduce((s,x)=>s+x,0));

//map / filter / find / findIndex 各写一个 demo

//map
// let arr =[1,2,3,4];
// console.log(arr.map((x,y)=>y>1?x*2:x ));

//filter 取出所有符合要求的数

// let arr = [1,2,3,4];
// console.log(arr.filter((x)=>x>2));
// console.log(arr);

//find 找到一个符合要求的数值

// let arr=[1,2,3,4];
// console.log(arr.find((x)=>x>2));
// console.log(arr);

//findindex 找到符合数值的下标
// let arr = [1,2,3,4];
// console.log(arr.findIndex((x)=>x>2));
// console.log(arr);

//reduce 做三件事：求和、求平均、把数组转成对象
//求和
// let arr=[1,2,3,4];
// console.log(arr.reduce(((x,y)=>x+y),0));

//求平均
// let arr =[1,2,3,4];
// let avg= arr.reduce(((x,y)=>x+y),0)/arr.length;
// console.log(avg);


//把数值转化为对象//记录出现次数
// let arr = [1,2,2,3,3,3];
// let count = arr.reduce((obj,num)=>{
//     obj[num]=(obj[num]||0)+1;
//     return obj ;},{});
// console.log(count);

//复现 sort 的坑：打印[10,9,100].sort() 得到 [10,100,9]，再用比较函数修正成 [9,10,100]

// let arr=[10,9,100];
// console.log(arr.sort());
// console.log(arr.sort((a,b)=>a-b));


//flat(2) 打印出 [1,2,3,[4]]，再flat(Infinity) 打印出 [1,2,3,4]

// console.log([1,[2,[3,[4]]]].flat(2));

// console.log([1,[2,[3,[4]]]].flat(Infinity));

//flatMap 一个实际用途（比如给每个元素生成两条记录）

// const arr=[1,2,3,4];
// console.log(arr.flatMap((x)=>[x,x*2]));

//Object.entries 遍历对象，再用Object.fromEntries 转回对象


// let user ={
//     name : "Jahn",
//     age : 18 
// }

// let value = Object.entries(user);
// console.log(value);

// let users= Object.fromEntries(value);
// console.log(users);

//不可变更新模式：toSorted /toReversed / with / toSpliced 各写一遍，每组前后都打印原数组，证明原数组没变

// let arr= [1,5,3,4];
// arr.toSorted();
// console.log(arr);
// arr.toReversed();
// console.log(arr);
// arr.with(0,99);
// console.log(arr);
// arr.toSpliced(0,1);
// console.log(arr);

//structuredClone 深拷贝嵌套对象，改副本后打印原对象证明未受影响
    
// const original ={
//     name : 'John',
//     age : 18
// }

// let clone = structuredClone(original);
// clone.name =  "Jack";
// console.log(original);
// console.log(clone);


//实战：把 [{name, age}, ...] 按 age排序，不修改原数组（不可变更新的真实用法)

// let original =[{name:'Jack',age:9},{name:'Bob',age:30},{name:'John',age:21}];
// clone=original.toSorted((a,b)=>a.age-b.age);
// console.log(original);
// console.log(clone);





