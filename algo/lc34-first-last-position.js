var searchRange = function(nums, target) {
    let left= 0 ;
    let right =  nums.length - 1 ;
    let mid =  0 ; 
    
    while(left <= right){
        mid = left +((right - left) >>1) ;
        if(nums[mid] >= target) {
            right = mid - 1 ;
        }
        else  left = mid + 1 ;
 
    }
    let fir = left ;
    left = 0 ;
    right = nums.length - 1;
    while(left<= right){
        mid = left+((right - left)>> 1);
        if(nums[mid]<= target ){
            left = mid + 1 ;
        }else right = mid - 1 ;
    }
    let fin = right
    if(fir > fin || nums [fir] !== target) return [-1,-1];

    return [fir,fin];
    
        
};



console.log(searchRange([5,7,7,8,8,10],8));
console.log(searchRange([5,7,7,8,8,10],6));
console.log(searchRange([],0));
console.log(searchRange([1],1));
console.log(searchRange([8,8,8],8));
console.log(searchRange([2,2],3));
console.log(searchRange([2,2],1));

// [ 3, 4 ]
// [ -1, -1 ]
// [ -1, -1 ]
// [ 0, 0 ]
// [ 0, 2 ]
// [ -1, -1 ]
// [ -1, -1 ]

