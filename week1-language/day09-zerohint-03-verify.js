 



 let test = require("node:test");
 let assert = require("node:assert/strict");
 const {flatOnce}=require("./day09-zerohint-03.js");


 test("[1, [2, 3], 4]验证：",()=>{
    assert.deepEqual(flatOnce([1,[2,3],4]),[1,2,3,4]);
 });

 test("[1, [2, [3]]]验证：",()=>{
   assert.deepEqual(flatOnce([1, [2, [3]]]),[1,2,[3]]);
 });

 test("[1,2]验证:",()=>{
    assert.deepEqual(flatOnce([1,2]),[1,2]);
 });

 test("[]验证：",()=>{
    assert.deepEqual(flatOnce([]),[]);
 });