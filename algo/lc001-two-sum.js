

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {//时间 O(n²) / 空间 O(1)
    
    for(let j = 0 ; j<nums.length; j ++){
          for(let k = j+1 ; k < nums.length ; k++){
            if(nums[j]+nums[k]===target){
                return [j,k] ;
            }
          }
    }

    throw new Error('nums中没有对应的能组成target的数');
};