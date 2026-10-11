


/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */

//[2,7,11,15]  9
//need = 7
//seen[2] = 0
// need = 2
// 0
var twoSum = function(nums, target) {//O(n)//3ms
    let seen = {} ;
    for(let i = 0 ; i < nums.length ; i++ ){
        let need =target - nums[i];
        if(Object.hasOwn(seen,need)){
              return [seen[need], i] ;
        }
        seen[nums[i]] = i ;

    }
};

