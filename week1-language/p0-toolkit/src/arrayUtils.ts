


function myMap(arr:number[],fn:(...arg:any[])=>any){
    let out = [];
    for(let i = 0 ; i<arr.length;i++){
        out.push (fn(arr[i],i,arr));
    }
    return out ;
}



    function myFilter(arr:number[],fn:(...arg:any[])=>any){
      let out :number[]=[];
      for(let i:number=0 ; i < arr.length ; i++){
           if( fn(arr[i],i,arr)){
                out.push(arr[i]);
           }
         }
           return out ;

    }


    function myReduce(arr:number[],fn:(...arg:any[])=>any,init:number){

        let acc = init ;
        let start = 0 ;
  
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
        return acc ;
    }



   


module.exports={myMap,myFilter,myReduce};