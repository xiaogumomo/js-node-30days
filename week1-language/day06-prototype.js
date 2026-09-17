

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
    consturctor(name){
        this.speed =0;
        this.name=name;
    }
}
class Rabbit extends Animal{
    constructor(name,earlength){
    this speed = 0;
    this name = name;
    this earlength = earLength ;
    }
    
} 

let rabbit = new Rabbiit("white Rabbit",10);

}catch(error){
console.log(error.name); 
console.log(error.message);    
console.log(error.stack);    

}
