

var isPalindrome = function(s) {//输入字符串，返回boolean O(n) O(1)
    if(s.trim().length === 0){
        return true ;
    }
    s =s.replace(/[^a-zA-Z0-9]/g,'');
    s =s.toLowerCase(); 
    let ss = s.split('');
    let left = 0;
    let right = ss.length-1;
    while(left<right){
     if(ss[left]!==ss[right]){
         return false;
     }
     left++;
     right--;
    }
    return true ;

    
};