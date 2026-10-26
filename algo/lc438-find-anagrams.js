

// var findAnagrams = function(s, p) {//O(n) O(1)

//     let result = [];
//     let right = 0;
//     let leng = p.length ;
//     let arr = [...s] ;
//     const target = [...p].sort().join('');
    
//     for(let left = 0 ; left <  s.length - leng+1 ; left ++){
//         right =  left + leng ;
//         if(arr.slice(left,right).sort().join('') ===  target){
//             result.push(left);
//         }
//     }
//     return result ;
     
    
    
// };
var findAnagrams = function(s, p) {//O(n) O(1)

    let result = [] ;
    let arr = new Array(26).fill(0);
    let a = new Array(26).fill(0);
    const leng = p.length ;
    let right = 0 ;
    let left = 0;
    let n = s.length ;

    const same = () =>{
        for(let i = 0 ; i <26 ; i++) if(arr[i]!== a[i])return false;
        return true ;
    }
    for(let i = 0 ; i< p.length ; i++){
        arr[s.charCodeAt(i)-97]++;
        a[p.charCodeAt(i)-97]++;
    }
    if(same() ) result.push(0);
    for(let left = 1 ; left+ leng <=  n ; left++){
        right =left + leng -1;
        arr[s.charCodeAt(left-1)-97]--;
        arr[s.charCodeAt(right)-97]++;
        if(same()){
            result.push(left);
        }
    
    }
    return result ;
};