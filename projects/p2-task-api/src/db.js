

const {DatabaseSync} = require('node:sqlite');
const path =require('node:path');
const fs = require('node:fs');


function openDb(){
    const dbFile = process.env.DB_FILE || path.join(__dirname,'..','data','tasks.db');
    fs.mkdirSync(path.dirname(dbFile),{recursive:true});
    const db = new DatabaseSync(dbFile);

    const  MIG_DIR =path.join(__dirname,'..','db','migrations');
    for(const f of ['001_init.sql','002_users.sql']){
        db.exec(fs.readFileSync(path.join(MIG_DIR,f),'utf8'));
    }
    
    const 列 =db.prepare(`PRAGMA table_info(tasks)`).all().map((c)=>c.name);

    if(!列.includes('userId')) db.exec(`ALTER TABLE tasks ADD COLUMN userId INTEGER`);

    const ins = db.prepare(`INSERT INTO tasks(title,done,userId)VALUES(?,?,?)`);
    const one = db.prepare(`SELECT id,title, done FROM tasks WHERE id =(?) AND userId = (?)`);
    const all = db.prepare(`SELECT id,title,done FROM tasks WHERE userId = ?`);
    const upd = db.prepare(`UPDATE tasks SET title = ? , done = ? WHERE id = ? AND userId = ?`);
    const toObj = (r)=>(r?{id:Number(r.id),title: (r.title),done: !!r.done }:null);
    const insertUser = db.prepare(`INSERT INTO users(email,passwordHash,createAt) VALUES (?,?,?)`)
    const userByEmail =db.prepare(`SELECT*FROM users WHERE email = ?`);
    const del = db.prepare(`DELETE FROM tasks WHERE id = ? AND userId = ?`);
    
    return {all,ins,one,upd,toObj,insertUser,userByEmail,del};
}   
module.exports ={openDb};