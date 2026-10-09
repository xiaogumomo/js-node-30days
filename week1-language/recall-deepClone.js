



function deepClone(x){
    if(typeof x !== 'object' || x === null){
        return x ;
    }

    if(Array.isArray(x)){
        return x.map((item)=>deepClone(item));
    }

    let result = {};
    for(const key in x){
        result[key] = deepClone(x[key]);
    }
    return result ;
}

module .exports = {deepClone};