


var maxArea = function(height) { //输入数组，返回最大容量max O（n）O(1)
   //其次是O（n）要求，不能循环嵌套循环
   //没想到的一点：那边矮就移动哪边） 只有宽度变窄但是高度变高才有机会面积变大
    let max = 0 ;
    let min = 0 ;
    let left = 0;
    let right =height.length - 1 ;
      while(left<right){
        let l =  right - left  ;
        if(height[left]>height[right]){
            min = height[right];
            right -- ;
        }else{
            min = height[left];
            left ++ ;
        }
      
        let num = min * l ;
        if(num>max){
            max = num ;
        }
     
      }
      return max ;
};

const height = [
    [[1,8,6,2,5,4,8,3,7],49],
    [[1,1],1],
    [[1,7,8,1],7],
    [[5,3,2,1],4],
]

for(let [h,r] of height){
    console.log(`${h}的时候函数返回${maxArea(h)},实际${r}`);
}