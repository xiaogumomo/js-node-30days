

//我自己用的模式是遍历一次通过map集合，和它有的方法.has确定一串中有没有出现相同的，如果有就清空map和计数器，大于最大字符串就存入max（但这种模式过不了dvdf情况）
//什么信号：每个字符串都要判断想到遍历，需要储存字符串且要有判断字符串重复性想到map，需要计算最大字符串想到需要max和累加器j


// var lengthOfLongestSubstring = function(s) { //o(n) o(1)
//     const last = new Map();
//     let left = 0 ;
//     let max = 0;
//     for(let right = 0 ;right <s.length ; right++){
//         const c = s[right];
//         if(last.has(c)&&last.get(c)>=left){
//             left = last.get(c) + 1 ;
//         }
//         last.set(c,right);
//         max =Math.max(max,right - left + 1);
//     }
//     return max ;
// };

var lengthOfLongestSubstring = function(s) {

    const last = {};
    let left = 0;
    let max = 0 ;
    for(let right = 0 ;right<s.length ;right++){
        const c = s[right];
        if(last[c]!== undefined && last[c] >= left){
            left = last[c]+1 ;
        }
        last[c] = right ;
        max = Math.max(max,right-left+1);
    }

    return max ;




};
//1.因为左边界一旦后退，left将一直存在，
//2.首先是资源消耗问题，没有重复的还要重新遍历放入违背O（n）初衷，其次只是一个字符重复，重新划定边界让重复字符离开即可
//3.用于更新各个字符的所在位置，一旦有重复更新left到重复字符后，


console.log(lengthOfLongestSubstring('abcabcbb'));  // 3
console.log(lengthOfLongestSubstring('dvdf'));      // 3
console.log(lengthOfLongestSubstring('abba'));      // 2
console.log(lengthOfLongestSubstring('pwwkew'));    // 3
console.log(lengthOfLongestSubstring('tmmzuxt'));   // 5
console.log(lengthOfLongestSubstring(''));          // 0
console.log(lengthOfLongestSubstring(' '));         // 1
