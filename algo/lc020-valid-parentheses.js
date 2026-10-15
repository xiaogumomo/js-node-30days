

/**
 * @param {string} s
 * @return {boolean}
 */

const PAIRS = {'}':'{',']':'[',')':'('};
const OPENERS = new Set(['{','[','(']);
var isValid = function(s) {//栈存的是开括号，o(n)
    let stack = [] ;


     for(let ch of s){
        if(OPENERS.has(ch)){
            stack.push(ch);
            continue;
        };
        if(stack.length === 0){
            return false ;
        }
        let top = stack.at(-1);
        if(PAIRS[ch] !== top) return false ;
        stack.pop();
     }

     if(stack.length !== 0){
        return false ;
     }

     return true ;
    

   
    
};

module.exports = { isValid};

if(require.main === module) {

     const cases = [
        ['()', true],
        ['', true],
        ['([)]', false], // ★ 这题的"牙"
        ['{[]}', true],
        ['(', false], 
        [')', false], 
        ['()[]{}', true],
        ['(]', false],
      ];
      for (const [s, want] of cases) {
        const got = isValid(s);
        console.log(`${got === want ? '✓' : '✗'} isValid(${JSON.stringify(s)}) = ${got}（期望 ${want}）`);
      }
    
}