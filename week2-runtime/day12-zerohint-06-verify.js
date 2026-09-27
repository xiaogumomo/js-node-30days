
const test = require ("node:test");
const assert = require ("node:assert/strict");
const {countByExt} =require("./day12-zerohint-06.js");

//countByExt(['a.js','b.js','c.txt'])	{'.js': 2, '.txt': 1}
// countByExt([])	{}
// 没有扩展名的（'README' / 'Makefile'）	键是空字符串 ''（path.extname 就是这么返回的）：countByExt(['README']) → {'': 1}
// 大小写	原样算（'.JS' 和 '.js' 算两个键）—— 这是本题的规定，不是通用真理
// 原数组	不能改

test("测试['a.js','b.js','c.txt']是否可行",()=>{
    assert.deepEqual(countByExt(['a.js','b.js','c.txt']),{'.js': 2, '.txt': 1});
});

test("测试[]是否可行",()=>{
    assert.deepEqual(countByExt([]),{});
});


test("测试没有扩展名的（'README' / 'Makefile'）是否可行",()=>{
    assert.deepEqual(countByExt(['README' ,'Makefile']),{'':2});
});

test("测试大小写分辨是否可行",()=>{
    assert.deepEqual(countByExt(['a.js','b.JS']),{".js":1,".JS":1});
});

test("测试原数组是否改变",()=>{
    let arr = ['a.js','b.txt','c.js'];
    let arg = countByExt(arr);
    assert.deepEqual(arr,['a.js','b.txt','c.js']);
    assert.notEqual(arg,arr,"返回值应该是新数组");
});


test("countByExt(['LICENSE'])  测试是否会红",()=>{
    assert.deepEqual(countByExt(['LICENSE'])  ,{'':1} );
});

test("countByExt(['archive.tar.gz'])测试是否会红",()=>{
    assert.deepEqual(countByExt(['archive.tar.gz']) ,{'.gz':1} );
});

test("countByExt(['dir.x/a.js'])  测试是否会红",()=>{
    assert.deepEqual(countByExt(['dir.x/a.js']),{'.js':1} );
});