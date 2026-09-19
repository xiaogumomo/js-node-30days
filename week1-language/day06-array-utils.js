

// {
//     let arr=[10,20];
//     arr.map((...a)=>console.log(a));//[ 10, 0, [ 10, 20 ] ]
//                                     //[ 20, 1, [ 10, 20 ] ]
//     arr.filter((...a)=>{console.log(a);return true;});//[ 10, 0, [ 10, 20 ] ]
//                                                       //[ 20, 1, [ 10, 20 ] ]
//     arr.reduce((...a)=>{console.log(a);return a[0];},0);//[ 0, 10, 0, [ 10, 20 ] ]
//                                                         //[ 0, 20, 1, [ 10, 20 ] ]
// }


// {
//    console.log([1,2,3].reduce((s,x)=>s+x));
//    console.log([5].reduce((s,x)=>s+x));
//    try{
//     console.log([].reduce((s,x)=>s+x))
//    }catch(error){
//     console.log(error.message);
//    }

// }



//     function myMap(arr,fn){
//         let newarr = arr.slice();
//        for(let i=0;i<=arr.length;i++){
//         newarr[i]=fn(arr[i],i,arr);
//        }
//        return newarr;
//     }
//  out = myMap([10,20],(el,i,arr)=>{
//     console.log("回调收到：",el,i,JSON.stringify(arr));
//     return el *2;
// });
// console.log("myMap返回：",JSON.stringify(out));   



function myMap(arr,fn){
    let out = [];
    for(let i = 0 ; i<arr.length;i++){
        out.push (fn(arr[i],i,arr));
    }
    return out ;
}
console.log(myMap([10,20],(el,i,arr)=>{console.log("回调收到：",el,i,JSON.stringify(arr));
    return el *2 ;
}));


    function myFilter(arr,fn){
      //filter原数组方法是根据fn条件找出所有符合条件的元素放入新数组中
      //步骤
      //1.创建一个新数组
      let out = [];
      //2.进入for循环：判断是否为真数
      for(let i=0 ; i < arr.length ; i++){
           if( fn(arr[i],i,arr)){
             //3.判断是否为符合条件的
             //4.如果是,那么push放入数组
                out.push(arr[i]);
           }
         }
              //5.返回新数组
              return out ;

    }
    console.log(myFilter([10,20],(el,i,arr)=>{console.log("回调收到：",el,i,JSON.stringify(arr));
    return true;
    }));
    


    function myReduce(arr,fn,init){
        //reduce原数组方法是根据fn来对每个元素处理，并在其中推送累计值
        //需要变量；1.存储数据的变量 acc 2.循环中需要用到的i 
        //步骤
        //1.创建累计的变量acc 需要初始值init
        let acc = init ;
        let start = 0 ;
        //2.进入for循环：acc = fn（el，i，arr）；
        
        if(init === undefined){
      
            acc=arr[0];
            start=1;
        }else{
            acc= init;
            start =0;
        }
        for(let i=start;i<arr.length;i++){
            acc = fn(acc,arr[i],i,arr);
        }
    
        //3.返回acc

        return acc ;
    }

    console.log(myReduce([10,20],(acc,el,i,arr)=>{
        console.log("回调收到：",acc,el,i,JSON.stringify(arr));
        return acc + el;

    },0));


    console.log(myReduce([10,20],(s,x)=>s+x,0));
    console.log(myReduce([10,20,30],(s,x)=>s+x));
    console.log(myReduce([5],(s,x)=>s+x));
    console.log(myReduce([],(s,x)=>s+x,0));





module.exports={myMap,myFilter,myReduce};