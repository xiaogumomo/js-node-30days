

console.log("同步开始");
setTimeout(()=>{
    console.log("2setIimeout 0");},0);
Promise.resolve().then(()=>{
    console.log('3.promise.then');
});
process.nextTick(()=>console.log("4.nextTick"));
console.log("5.同步结束");
setTimeout(()=>console.log("6 setTimeout 0 (第二个)"),0);
Promise.resolve().then(()=>{
    console.log("7 promise.then(第二个)");
});
process.nextTick(()=>{
    console.log('8.nextTick(第二个)')
});
//1,5,4,8,3,7,2,6

//1.process.nextTick是Node.js特有的方法，目的是把一个回调函数放到nextTick的队列中，这个
//队列非常早，在代码执行完之后，事件循环继续之前（马上就是它）比setTimeout还有promise还要快。
//2.因为promise已经在微任务队列里已经跑完了，最后跑的才是属于setTimeout的timers队列
//3.在代码执行完毕后，其中的栈全部清空后，微任务开始执行
//对照实验
//会改变，因为javascript中代码会因为await而暂停运行直到promise输出