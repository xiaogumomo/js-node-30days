


let test = require("node:test");
const assert = require("node:assert/strict");
let {groupBy}=require("./day10-zerohint-04");



test("确认groupBy([{t:'a',v:1},{t:'b',v:2},{t:'a',v:3}], x => x.t)	{ a: [{t:'a',v:1},{t:'a',v:3}], b: [{t:'b',v:2}] }是否可行：",()=>{
     
    const arr =[{t:'a',v:1},{t:'b',v:2},{t:'a',v:3}];
    assert.deepEqual(groupBy(arr,x=>x.t),{a:[{t:'a',v:1},{t:'a',v:3}], b:[{t:'b',v:2}]}	);
});

test("确认groupBy([], x => x)的情况",()=>{
    const arr = [];
    assert.deepEqual(groupBy(arr,x=>x),{});
});

test("确认只有只有一个元素的情况",()=>{
    const arr =[1];
    assert.deepEqual(groupBy(arr,x=>x),{1:[1]});
});

test("确认返回的是新对象和原数组不能改",()=>{
    const arr = [1];
    let result =groupBy(arr,x=>x+1);
    assert.deepEqual(arr,[1]);
    assert.notEqual(result,arr,"返回的应该是新对象，不是原数组");
});


