



const {DatabaseSync} =require('node:sqlite');

const db = new DatabaseSync('lab.db');


// 建表 + 插入三行 + 查出来
db.exec(`DROP TABLE IF EXISTS tasks`);
db.exec(`CREATE TABLE tasks(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    title TEXT NOT NULL, 
    done INTEGER NOT NULL DEFAULT 0
)`);

const ins = db.prepare('INSERT INTO tasks (title) Values (?)');//INSERT INTO tasks
ins.run('写周报');

ins.run('看文档');
ins.run("跑步");


//事务


db.exec('BEGIN');

try{
    ins.run('第一条：正常');
    db.exec('COMMIT');

}catch(err){
    db.exec('ROLLBACK');//必须全部成功，滚回去
    console.log(`已回滚：${err.message}`);
}
console.log(db.prepare('SELECT * FROM tasks').all());




const q = 'SELECT* FROM tasks WHERE title = ?';
const plan = ()=> db.prepare(`EXPLAIN QUERY PLAN ` + q).all()[0].detail;
const time = ()=>{
    const t = performance.now();
   db.prepare(q).all(`task-9999`);
   return (performance.now()-t).toFixed(2);
}

db.exec('BEGIN');
for(let i = 0 ;i<10000;i++) ins.run('task-'+i);
db.exec('COMMIT');


console.log(`建索引前 计划：${plan()}|耗时${time()}ms`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks(title)`);//exec执行SQL 操作为如果没有索引在tasks中建一个索引
console.log(`建索引后 计划：:${plan()}|耗时：${time()}ms`);

db.exec('DROP INDEX IF EXISTS idx_tasks_title');
// A. 把索引删掉，计划会变回去吗？
console.log(`删索引后 计划：${plan()}`);
// B. 查一个"没建索引的列"（done 上可没索引）：

console.log(db.prepare('EXPLAIN QUERY PLAN SELECT * FROM tasks WHERE done = 0').all()[0].detail);




db.close();







