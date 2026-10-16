/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {//O(n)  空间O（1）
    let lowest  = prices[0];
    let best ;
    if(!prices.length) return 0;
    
    for(let  p of prices){
        if( best=== undefined||max < (p-lowest)){
           best = p - lowest ;
        }
        if(lowest > p){
            lowest = p ;
        }
        
    }


    
    return max ;
    
};


module .exports = {maxProfit} ;

if(require.main === module) {
    let prices = [
        [[7,1,5,3,6,4],5],
        [[7,6,4,3,1],0],
        [[1],0],
        [[2,4,1],2],
    ]
    for(let [p,result] of prices){
        console.log(`${maxProfit(p)}，结果应该是${result}`);
    }
}