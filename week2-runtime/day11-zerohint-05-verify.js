

const test = require("node:test");
const assert = require("node:assert/strict");
const {chunk}=require("./day11-zerohint-05.js");



test("chunk([1,2,3,4,5], 2)输出是否正确",()=>{
    assert.deepEqual(chunk([1,2,3,4,5], 2),[[1,2],[3,4],[5]]);
 });

test("[1,2,3,4], 2输出是否正确",()=>{
    assert.deepEqual(chunk([1,2,3,4], 2),[[1,2],[3,4]]);
});
test("[], 3输出是否正确",()=>{
    assert.deepEqual(chunk([], 3),[]);
});
test("[1,2,3], 10输出是否正确",()=>{
    assert.deepEqual(chunk([1,2,3], 10),[[1,2,3]]);
});
test("原数组是否改变",()=>{
    let arr = [1,2,3];
    let arg = chunk(arr,1);
    assert.deepEqual(arr, [1, 2, 3]);
    assert.notEqual(arg,arr,"返回的应该是新数组");
})

//