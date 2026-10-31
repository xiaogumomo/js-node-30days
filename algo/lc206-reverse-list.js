    
    
    
    
function ListNode(val,next = null){
    this.val = val ;
    this.next = next ;
}

function build(arr) {
    let head = null ;
    for( let i =arr.length - 1 ; i>=0 ; i--) head =new ListNode(arr[i],head);
    return head ;
}

function toArray(head){
    const out = [];
    for(let p = head ; p ; p = p.next) out.push(p.val);
    return out ;
}





var reverseList = function(head) {
    let prev = null ;
    let cur = head ;
    while(cur){
         next = cur.next ;
        cur.next = prev ;
        prev = cur ;
        cur = next ;
    }
    return prev ;
};

console.log(toArray(reverseList(build([]))));
console.log(toArray(reverseList(build([1]))));
console.log(toArray(reverseList(build([1,2]))));
console.log(toArray(reverseList(build([1,2,3,4,5]))));



