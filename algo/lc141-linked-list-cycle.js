
function ListNode(val,next= null){
    this.val = val ; this.next = next ;
}
function buildWithCycle(arr,pos = -1){
    if(!arr.length) return null ;
    const nodes = arr.map((v)=> new ListNode(v));
    for(let i = 0 ; i < nodes.length - 1 ; i++) nodes[i].next = nodes[i+1];
    if(pos>=0)nodes[nodes.length - 1].next = nodes[pos];
    return nodes[0] ;
}



var hasCycle = function(head) {//O(n)  
 
    let slow = head ;
    let fast = head ;
    
    while(fast && fast.next){
         slow = slow.next ;
         fast = fast.next.next ;
         if(slow === fast){
            return true ;
         }
    }

    return false ;
    
};

console.log(hasCycle(buildWithCycle([],-1)));
console.log(hasCycle(buildWithCycle([3,2,0,-4],1)));
console.log(hasCycle(buildWithCycle([1,2],0)));

