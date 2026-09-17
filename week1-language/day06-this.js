
// 第一题
// const user ={
//     name : "Ann",
//     hello(){
//      return this.name;
//     }
// }
// const f =user.hello ;
// console.log(f());
// console.log(user.hello();)
//1.undefined 因为this在普通函数调用时采用严格模式下为undefined，非严格模式我不太清楚希望你能简单的告诉我一下。
//2.Ann  对象的调用this调用点前面名字。


// const user = {
//   name: 'Ann',
//   hello() { console.log('this.name =', this.name); }
// };

// setTimeout(user.hello, 100);          // ① 100ms 后打印什么？
// setTimeout(() => user.hello(), 100);  // ② 100ms 后打印什么？

// }
// 1.抛错,因为普通函数相比于箭头函数而言，仅仅在自己作用域内找this，而hello作用域内没有指代this（没有let user = this ;这种说法）this为undefine的，因为你说的我这个文件是非严格，所以最后会抛错。
// 2.Ann，箭头函数本身没有this，会向外去找this，找到user。


// const obj = {
//   name: 'Ann',
//    f() { console.log('this.name =', this.name); }
// };
//1.
// obj.f();
// const f =obj.f ;
//2.

// f();

//3.

// f.call(
//     {name:'Bob'}
// )

//4.

//技巧一：往 this 上挂属性，看它是否出现在返回值上

// {function F() {
//   this.tag = '我挂在 this 上';     // 只往 this 上挂，不 return 任何东西
// }

// const inst = new F();
// console.log(inst.tag);             // '我挂在 this 上'
// console.log(inst instanceof F); // true
// }   
//技巧二（铁证）：把 this 存出来，和返回值直接比
// {let captured;                       // 先准备一个空盒子
// function F() { captured = this; }   // 构造函数里把 this 存进去
// const inst = new F();
// console.log(captured === inst);  // true ← 铁证：this 和返回值是同一个对象
// }

//5.

// setTimeout(obj.f, 100);         
// setTimeout(() => obj.f(), 100); 


// function curry(fn) {
//   return function collect(...adj) {
//     if (adj.length >= fn.length) return fn.apply(this, adj);   // ← 这里的 this 是谁？collect
//     return function agcollect(...nextadj) {
//       return collect.apply(this, adj.concat(nextadj));         // ← 这里呢？agcollect
//     }
//   }
// }

// {
// const obj = {
//   name: 'obj 的 name',

//   normal() {
//     const arrow = () => this.name;   // 箭头函数【定义在 normal 里面】
//     return arrow();
//   },

//   arrowProp: () => this.name,        // 箭头函数【定义在对象字面量里】
// };

// console.log(obj.normal());                              // ①
// console.log(obj.arrowProp());                           // ②
// console.log(obj.arrowProp.call({ name: 'call 进来的' }));// ③
// } 

// 1.①打印undefined,理由：return arrow（）；调用的点为函数，函数的this为全局变量，即return undefined
// ②'obj 的 name'理由 调用的点为箭头函数，而箭头函数调用的点为obj，这里的obj.name为obj 的 name
// ③'call 进来的'理由③中就等价于this.name.call({name: 'call 进来的'});call将this设定成了{name: 'call 进来的'}那么this.name为'call 进来的'


// 3. 箭头函数的 this 由【定义位置】决定，调用点改不动它


// const obj2 = {
//   name: 'obj2 的 name',
//   normal() {
//     const arrow = () => this.name;   // 定义在 normal 里面
//     return arrow();
//   },
//   arrowProp: () => this.name,        // 定义在对象字面量里（= 模块顶层）
// };

// console.log(obj2.normal());                                // 期望：'obj2 的 name'
// console.log(obj2.arrowProp());                             // 期望：undefined
// console.log(obj2.arrowProp.call({ name: 'call 进来的' }));  // 期望：undefined
// console.log(obj2.normal.call({ name: '也改不动' }));        // 期望：'也改不动' ← 对比项！



const obj = { name: 'Ann', hello() { return this.name; } };

const bound = obj.hello.bind({ name: 'Bob' });

console.log(bound());                          // ①
console.log(bound.call({ name: 'Carl' }));     // ②
console.log(obj.hello.call({ name: 'Dan' }));  // ③


// ①Bob bind修改this的指向，将其指向{name：'Bob'}
// ②Bob bind修改的指向不会改变
// ③Dan 拿原函数。用call指定原函数的this为 name: 'Dan' 
// ④ bound === obj.hello 是 true 还是 false？为什么？false.bind中会建立一个函数（bound function，它包含原函数与锁定的this）已经不是同一个对象了
// ⑤ 执行过 bind 之后，obj.hello 本身被改了吗？没有被改。只是this的指向变化
// bind 和 call 都能指定 this，那它们的差别到底在哪？
//bind造一个永远用这个this的函数，call则是调用函数将this


{// 4. bind vs call
const obj3 = { name: 'Ann', hello() { return this.name; } };
const bound = obj3.hello.bind({ name: 'Bob' });

console.log(bound());                              // 期望：Bob
console.log(bound.call({ name: 'Carl' }));         // 期望：Bob（bind 锁死）
console.log(obj3.hello.call({ name: 'Dan' }));     // 期望：Dan  ← 原函数没被 bind 影响
console.log(bound === obj3.hello);                 // 期望：false（bind 造了新函数）
}



function curry(fn) {
  return function collect(...adj) {
    if (adj.length >= fn.length) return fn.apply(this, adj);   // ← (a) 这个 this 是谁？
    return function agcollect(...nextadj) {
      return collect.apply(this, adj.concat(nextadj));         // ← (a) 这个呢？
    };
  };
}
const add3 = (a, b, c) => a + b + c;
console.log(curry(add3)(1)(2)(3));   // 6

// a) 两处 this 分别是谁？（你在文件末尾写的是 collect / agcollect——现在用第 1 题的模型重新判断：collect(1) 是"点号调用"还是"普通调用"？）
// (b) 既然这个 this 不是 add3 需要的东西，为什么 curry(add3)(1)(2)(3) 还是算出了 6？
// (c) 那什么情况下这个 this 会真的导致 bug？（提示：add3 是箭头函数，压根不用 this——那如果换成"需要 this 的函数"呢？）
// (a)都为全局变量globalName， 因为函数中的调用都是普通调用
// (b)curry的功能只是整合如将(1)(2)(3)整合成(1,2,3)的形式供add3使用，而其中的this仅仅在实现这个功能上充当一个数据传递的角色
// (c)1.add内部为普通函数且用了this这个情况 修法修法 —— 把 agcollect 改成箭头函数

