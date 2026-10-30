    
    
    
    
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





var reverseList = function(arr) {

    let head = build(arr);
    let prev = null ;
    let cur = head ;
    while(cur){
        let next = cur.next ;
        cur.next = prev ;
        prev = cur ;
        cur = next ;
    }
    return toArray(prev) ;
};

console.log(reverseList([]));
console.log(reverseList([1]));
console.log(reverseList([1,2]));
console.log(reverseList([1,2,3,4,5]));
