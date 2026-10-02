const { test } = require('node:test');
const assert = require('node:assert');
const { parseCliArgs } = require('./weekly-self-test');




 test('values.verbose === true测试',()=>{
     const {values} = parseCliArgs(["--verbose"]);
     assert.deepEqual(values.verbose,true);
});

test('positionals位置变量测试',()=>{
    const {positionals}=parseCliArgs(['a.txt','b.txt']);
    assert.deepEqual(positionals,['a.txt','b.txt']);
});

test('给不认识的选项抛错',()=>{
    assert.throws(()=>parseCliArgs(['--nope']),
         /Unknown option/i
   );
});