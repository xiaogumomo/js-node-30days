









function deepClone(x){
    if(typeof x !== 'object'|| x === null){
        return x;
    }

    if(Array.isArray(x)){
        return x.map((i)=>deepClone(i));
    }

    let result ={};
    for(let i in x){
        result[i]=deepClone(x[i]);
    }
    return result ;
}

module. exports ={deepClone};