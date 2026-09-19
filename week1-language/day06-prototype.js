

console.log (typeof class A{}) ;



{
class Animal{
    constructor(name){
    this.name = name ;       
    }
    sayHI(){
        console.log(this.name);
    }

}

const a =new Animal("John");
console.log(a.__proto__===Animal.prototype);

console.log(Object.getPrototypeOf(a)===Animal.prototype);
}

//原型链顶端

let  animal  = {
     speak() {
   console.log("找到了");
     }
};

let  a ={
  __proto__: animal 
};
a.speak(); 

// class Base { baseField = (...); constructor() {...} }
// class Derived extends Base { 
//     derivedField = (...); 
//     constructor() { super(); ... 

//     } 
// }
// new Derived();
try{
class Animal{
    constructor(name){
        this.speed =0;
        this.name=name;
    }
}
class Rabbit extends Animal{
    constructor(name,earlength){
    this.speed = 0;
    this.name = name;
    this.earlength = earLength ;
    }
    
} 

let rabbit = new Rabbit("white Rabbit",10);

}catch(error){
console.log(error.name); 
console.log(error.message);    
console.log(error.stack);    

}



{
let animal ={
    eats : true
};
let rabbit ={
    speeds : 0 
};

rabbit.__proto__=animal;
console.log(rabbit.eats);
}
//运行先看自己作用域内有没有，再去找上层父辈
{let animal={
     eats : true
};
let rabbit ={
    speed : 0,
    eats : false 
};
rabbit.__proto__=animal;
console.log(rabbit.eats);


}

//class 版： 同一个继承关系，用 extends / super 写

{
    class animal{
       constructor(name){
        this.name = name ;
       } 
      eats(){
        console.log(false);
       }

     
    }

    class rabbits extends animal{
    
    }

    let rabbit = new rabbits("white rabbit");
    rabbit.eats();

}


//手写版
{

 //class 部分 在定义class Animal{},Animal.prototype的由来：javascript会创建Animal.prototype的对象作用为“方法仓库”
  function Animal(name){
    this.name = name ;
  }
  Animal.prototype.eats = function(){
    console.log(false);
  }
  //class Rabbit extends Animal部分
  function Rabbit(name){
    Animal.call(this,name);
  }
  Rabbit.prototype=Object.create(Animal.prototype);//将Animal与Rabbit通过[[prototype]]属性链接
  const rabbit = new Rabbit();//新建实例对象
  Rabbit.prototype.eats();
  
}

//字段初始化 4 步 + [[HomeObject]]
//1) Base 字段初始化
// 2) Base 构造函数体
// 3) Derived 字段初始化        ← 必须等 super() 返回，因为在那之前 this 还不存在
// 4) Derived 构造函数体（super 之后）
{//1.
    class Base{
        constructor(){
            console.log("1.Base 字段初始化")
        }
    }
   const base = new Base();

}

{//2.
   class Base{
    run(){
    console.log("2. Base 构造函数体");
    }
   }
   const base = new Base();
   base.run();
}
{//3.
      class Base{
        constructor(name){
            this.name = name;
        }
    }
    class Derived extends Base{
        derivedField = console.log('3.Derived 字段初始化');
    }
    const derived = new Derived();
    
}

{//4.
      class Base{
        constructor(name){
            this.name = name;
        }
    }
    class Derived extends Base{
        constructor(){
        super();
        console.log("4. Derived 构造函数体（super 之后）");
        }
    }
    const derived = new Derived();

}


//① 把子类的 derivedField 那行删掉 → 输出剩 3 行（第 3 行消失）

//② 把子类的整个 constructor 删掉 → 还是 4 行！因为会自动生成 constructor(...args) { super(...args); } —— 这正是你昨天写对的那条（"子类没有 constructor 时会自动调用 super"）✓

//③ 在子类构造函数里、super() 之前写 this.x = 1 → 抛错：


//①// 只关心"什么时候打印"，所以字段的值直接用 console.log 的返回值（undefined）

{
class Base {                                      // 父类
  baseField = console.log('1) 父类的字段初始化');

  constructor() {
    console.log('2) 父类的构造函数体');
  }
}

class Derived extends Base {                       // 子类
 
  constructor() {
    super();                                      // 必须调，否则下面不能用 this
    console.log('4) 子类的构造函数体（super 之后）');
  }
}

new Derived();
}
//②
// 只关心"什么时候打印"，所以字段的值直接用 console.log 的返回值（undefined）
{
  class Base {                                      // 父类
  baseField = console.log('1) 父类的字段初始化');

  constructor() {
    console.log('2) 父类的构造函数体');
  }
}

class Derived extends Base {                       // 子类
  derivedField = console.log('3) 子类的字段初始化');

  
                                              // 必须调，否则下面不能用 this
  derivedfield= console.log('4) 子类的构造函数体 （uper 之后）');
  }

new Derived();
}

//③

// 只关心"什么时候打印"，所以字段的值直接用 console.log 的返回值（undefined）
{
 
try{
 class Base {                                      // 父类
  baseField = console.log('1) 父类的字段初始化');

  constructor() {
    console.log('2) 父类的构造函数体');
  }
}
class Derived extends Base {                       // 子类
  derivedField = console.log('3) 子类的字段初始化');
 

  constructor() {
    this.name=1;
    super();                                      // 必须调，否则下面不能用 this
    console.log('4) 子类的构造函数体（super 之后）');
  }
}

new Derived();
   
}catch(error){
    console.log(error.name);
    console.log(error.message);
    console.log(error.stack);
    
}

}

// 1.子类构造函数体：第一行（super 之前）
// 2.父类构造函数体
// 3.子类字段初始化

{
try {

    class Derived  extends Base{ 
        constructor(){
            derivedField=console.log( "1.子类构造函数体：第一行（super 之前）"+this.name);
            super();
        
        }

    }
    class Base{
        basedField=console.log("2.父类构造函数体");

    }
    class Deriveds  extends Base{ 
    derivedField = console.log("3.子类字段初始化");
    }
   


}catch(error){
    console.log(error.name);
    console.log(error.message);
    console.log(error.stack);
}

}








