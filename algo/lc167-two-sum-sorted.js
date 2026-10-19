




function   twoSum(numbers, target){//输入数组 和和 返回下标从1开始的对应数值刚好相加为target O(n) O(1)

    let left = 0 ;
    let right = numbers.length-1 ;
    
    while(left < right){
        if(numbers[right] + numbers[left] > target){
             right --;
        }else if(numbers[right] + numbers[left]  < target){
            left ++;
        }else{
        return [left+1,right+1] ; 
        }
    }
}


let n = [
    [[2,7,11,15], 9,[1,2]],
    [[2,3,4], 6,[1,3]],
    [[-1,0], -1,[1,2]],
    [[1,2],3,[1,2]]
];

for(let [numbers,target,result] of  n){
    console.log(`numbers为${numbers},target为${target}时，返回值为${twoSum(numbers, target)},应该为${result}`);
}



