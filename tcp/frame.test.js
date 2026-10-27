

const {encode,createDecoder} = require('./frame.js');


{
    const data  = encode('hello');
    const got = [] ;
    const feed = createDecoder((s)=>got.push(s));
    for(let i = 0 ; i < data.length ; i++ ){
      feed(data.subarray(i,i+1));
    }
    console.log('测1',JSON.stringify(got),got.length === 1 && got[0] === 'hello' ? '√':'×');
}


{
    const big = Buffer.concat([encode('a'),encode('bb'),encode("ccc")]);
    const got = [] ;
    createDecoder((s) => got.push(s))(big);
    console.log('测2',JSON.stringify(got),JSON.stringify(got)=== '["a","bb","ccc"]' ? '√':'×');
}


{
    const m1 = encode('first'),m2 = encode('second');
    const all = Buffer.concat([m1,m2]);
    const got = [] ;
    const feed = createDecoder((s)=>got.push(s));
    feed(all.subarray(0,3));
    feed(all.subarray(3,m1.length + 2));
    feed(all.subarray(m1.length+ 2));
    console.log('测3',JSON.stringify(got),JSON.stringify(got) === '["first","second"]'? '√':'×');
}


{
    const zh = encode('你好世界');
    const got = [];
    const feed = createDecoder((s)=>got.push(s));
    for(let i = 0 ; i < zh.length ; i ++) feed(zh.subarray(i,i+1));
    console.log('测4',JSON.stringify(got),got[0] === '你好世界' ? '√': '×');
}