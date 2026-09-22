

function deepClone(x){
    if(x === null || typeof x !== 'object' ){//忘记了该如何筛选数字，数组和字符串了（这个是偷看了）
        return x;
    }
    if(Array.isArray(x)){
        return  x.map(item=>deepClone(item));//忘记了如何用递归返回继续筛选了
    }
    let result = {};
    for(let key in x){//忘记for..in与for..of的区别：forin是遍历对象的键，for of是遍历的对象的值
        result[key]=deepClone(x[key]);
    }
        return result;

}

module.exports={deepClone};