


var minSubArrayLen = function(target, nums) {//O(n) O(1)
    let sum = 0 ;
    let min = Infinity ;
    let left = 0 ;
    for(let right= 0 ; right< nums.length ; right ++){
        //先累加，超过target后割一段（不知道割的边界，怎么割最好），正好相等跟min与right-left+1比小，更小的记录当前right和left用于之后返回
           
         sum += nums[right];
         while(sum >= target){
            min = Math.min(min,right-left + 1);
            sum -= nums [left];
            left++ ;
         }

    }

    return min === Infinity? 0 : min ;
 
}
    

console.log(minSubArrayLen(7, [2,3,1,2,4,3]));//2
console.log(minSubArrayLen(4,[1,4,4]))//1
console.log(minSubArrayLen(11,[1,1,1,1,1,1,1,1]))//0
console.log(minSubArrayLen(7,[8]))//1
