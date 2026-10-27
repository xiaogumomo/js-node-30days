

function encode(text){
    const body = Buffer.from(text,'utf8');
    const head = Buffer.alloc(4);
    head.writeUInt32BE(body.length,0);
    return Buffer.concat([head,body]);

}

function createDecoder(onMessage){
    let buf = Buffer.alloc(0);
    return function feed(chunk){
        buf = Buffer.concat([buf,chunk]);
        while(true){
            if(buf.length < 4 ) return  ;
            const len  = buf.readUInt32BE(0);
            if(len > 1024*1024)  throw new Error('消息过长:' + len);
            if(buf.length < len+ 4 ) return  ;
            const body = buf.subarray(4,4+len);
            buf = buf.subarray(4+len);
            onMessage(body.toString('utf8'));
            
        }
    }
}

module.exports = {createDecoder,encode};

