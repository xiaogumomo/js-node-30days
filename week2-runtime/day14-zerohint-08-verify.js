

const test = require('node:test');
const assert = require("node:assert/strict");
const {memoize} = require("./day14-zerohint-08.js");


test('同一个参数调两次的情况',()=>{
   
    let calls=0;
    const g =(x)=>{
        calls++;
       return x+1;
    }
   let f = memoize(g);
   let result = [f(1),f(1)];
   assert.deepEqual(calls,1);
   assert.deepEqual(result , [2,2]);

});


test("不同参数的情况",()=>{
    let calls = 0;
    const g = (x)=>{
        calls++;
        return x+1;
    }
    let f = memoize(g);
    let f1 =f(1);
    let f2 =f(2);
    let f3 =f(3);

    assert.deepEqual(calls,3);
    assert.deepEqual(f1,2);
    assert.deepEqual(f2,3);//启用f3后，f1，f2不变
    
});



test("原函数抛错的时候要抛出来，然后不再执行原函数",()=>{
    let calls = 0;
    let boom = memoize(()=>{
        calls++; throw new Error("炸了");
    });
    assert.throws(()=>
        boom(),/炸了/,'第一次错误要透传给调用方（不能吞掉）'
    );
    let second = boom();
    assert.deepEqual(calls,1,'抛错之后第二次就不能再执行了！');
    assert.equal(second,undefined,'返回抛错时第一次就结果，第一次没结果->undefined');

});



test('多个参数/参数是对象时候，则以多个参数为一组，对象则以整个对象为记录一组',()=>{
     
    let calls = 0;
    
    const g = (x,y)=>{
        calls++;
        return x+y;
    }
    let f = memoize(g);
    f(1,2);
    f(2,1);
    f(1,2);
    f(2,1);
    assert.deepEqual(calls,2,'多个参数多个参数要为一组，顺序也要一致');

    //测试对象
    let called = 0;
    let str={
        a : 1,
        b : 2,
    }
    let str1={
        a : 1,
        b : 2,
    }
    let str2={
        b : 2,
        a : 1,
    }
    const g1 = (str)=>{
        called++ ;
      return str.a+str.b;
    }
    let f1 = memoize(g1);
    f1(str);
    f1(str1);
    f1(str);
    f1(str1);
    f1(str2);
    assert.deepEqual(called,3,'不同对象一个对象要为一组，顺序也要一致');

    
})





