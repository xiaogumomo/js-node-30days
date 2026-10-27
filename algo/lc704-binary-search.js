

// var search = function(nums, target) {//O(n)
//     let left = 0 ;
//     let right = nums.length - 1 ;
//     let res ;
    

//     while(left< right){
//         let l =  nums[left] ;
//         let r = nums[right] ;
//         if(target ===  l ){
//            return res = left ;
//         }
//         if(target === r){
//             return res = right ;
//         }
//         if(target < r){
//             right-- ;
//         }
//         if(target > left){
//             left ++ ;
//         }
//     }

//     if( res === undefined){
//         return -1;
//     }
    
// };



// var search = function(nums, target) {//O(log n)  空间O(1)  Java/C++里是防整数溢出的，但javascript中number是双精度所以不会
//     let left = 0 ;
//     let right = nums.length -1 ;
//     while(left<= right){
//         let mid = left + ((right -left)>>1);
//         if(nums[mid] === target) return mid;
//         else if(nums[mid] > target ) right = mid-1;
//         else  left= mid+1 ;
//     }

//     return - 1 ;
// };


// console.log(search([],1));
// console.log(search([5],5));
// console.log(search([5],1));
// console.log(search([1,2,3],1));
// console.log(search([1,2,3],3));
// -1
// 0
// -1
// 0
// 2



