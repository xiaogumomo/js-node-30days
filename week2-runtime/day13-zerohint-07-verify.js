

const test = require("node:test");
const assert = require("node:assert/strict");
const {once} =require("./day13-zerohint-07.js");


test("const f = once(g); f(1); f(2);执行情况",()=>{
    function g(i){
    let a = i ;
    return a ;
   }
    const f = once(g);
    const f1 = f(1);
    const f2 = f(2);
    assert.deepEqual(f1,f2);
});

test("检验是否只执行一次",()=>{
   
   let calls = 0;
    const g = ()=>{
        calls ++ ;
        return 42;
    };
    const f = once(g);
    f();
    f();
    f();
    const results = [f(),f(),f()];
    assert.deepEqual(calls,1);
    assert.deepEqual(results, [42, 42, 42], '每次都返回第一次的结果');

});

test("第一次调用时，this 和参数都透传给原函数",()=>{
    const seen = [];
    const obj = {
        name : '张三',
        fn : once(function(a,b){
            seen.push({thisName: this &&
                this.name,a,b});
                return a + b ;
        }),
    };


    const r = obj.fn(1,2);
    assert.equal(r,3,'结果应该是3');
    assert.deepEqual(seen[0],{thisName:"张三",a:1,b:2},'this和两个参数都要原样到原函数里');
});



test("第一次就抛错时：错误要抛出来，之后不要再执行原函数",()=>{
    let calls = 0 ;
    const boom = once(()=>{
        calls++ ; throw new Error("炸了");
    });
    assert.throws(()=>
        boom(),/炸了/,'第一次错误要透传给调用方(不能吞掉)'
    );
    assert.equal(calls,1,'第一次要真的执行了');

    const second = boom();
    assert.equal(calls,1,'抛错之后也不该再执行-这是我在注释里定的规矩');
    assert.equal(second,undefined,'返回“第一次的结果”，那次没结果->undefined');
});


test("第一次返回undefined的时候时候也只能跑一次（不能靠）结果是不是undefined当开关",()=>{
     let calls = 0;
     const nothing = once(()=>{
        calls++;
     });//不返回任何东西
     assert.equal(nothing(),undefined);
     assert.equal(nothing(),undefined);
     assert.equal(calls,1,'防用result当开关的判据');


});

