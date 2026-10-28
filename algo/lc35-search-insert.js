

var searchInsert = function(nums, target) {
    
    let left = 0 ;
    let right = nums.length - 1 ;
    let mid = 0 ;
    

    while(left<= right){
        mid = left + ((right - left)>> 1) ;
       if(nums [mid]=== target) return mid ;
       else if(nums[mid] >target ) right = mid -1 ;
       else left = mid + 1;
    }
     if(nums[mid]>target){
        return mid ;
     }else{
        return mid + 1 ;
     }
};


console.log(searchInsert( [1,3,5,6],5 ));
console.log(searchInsert( [1,3,5,6],2 ));
console.log(searchInsert( [1,3,5,6],7  ));
console.log(searchInsert( [1,3,5,6],0 ));
console.log(searchInsert([1],0));
// 2
// 1
// 4
// 0
// 0