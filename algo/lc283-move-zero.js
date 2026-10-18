

/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var moveZeroes = function(nums) { //维护的是非零数值的顺序，指针指数组的下标//O(n) O(1)
       let slow = 0;
   for(let fast = 0; fast < nums.length; fast++){
     if(nums[fast]!== 0){
        nums[slow] =nums[fast];
        slow ++ ;
     }
   }
   
   for(let i = slow ; i < nums.length ; i++){
    nums[i] = 0 ;
   }
    
};