

const test = require("node:test");
const assert =require('node:assert/strict');
const {countChars} = require("./day08-zerohint-02");


test("测试aba输出是否正确：",function(){
    let result ;
    result = countChars("aba");
    assert.deepEqual(result,{a:2,b:1});
});
test("测试aaa输出是否正确:",function(){
    let result ;
    result = countChars("aaa");
    assert.deepEqual(result,{a:3});
    
});
test("测试空输出是否正确:",function(){
    let result ;
    result = countChars("");
    assert.deepEqual(result,{});
    
});
test("测试a输出是否正确:",function(){
    let result ;
    result = countChars("a");
    assert.deepEqual(result,{a:1});
    
});
