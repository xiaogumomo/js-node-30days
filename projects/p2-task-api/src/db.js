


const path =require('node:path');
const fs = require('node:fs');
const {Pool} = require('pg');



const toTask = (r)=>(r?{id:Number(r.id),title: r.title ,done: !!r.done } : null );
const toUser = (r)=>(r?{ id : Number(r.id),email: r.email , passwordHash : r.passwordhash}: null );


async function migrate(pool){
    const dir = path.join(__dirname,'..','db','migrations');
    
    for(const f of ['001_init.sql','002_users.sql','003_users_createAt_bigint.sql']){
        const sql = fs.readFileSync(path.join(dir,f),'utf8');
        await pool.query(sql);
    }
    await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS userId INTEGER `);
}

async function openDb(){
  const pool = new Pool({
    connectionString:process.env.DB_URL || 'postgres://app:secret@127.0.0.1:5432/tasks',
  });

  await migrate(pool);
  return{

  
  createTask :async(title,done,userId)=>{
    const r = await pool.query(
        `INSERT INTO tasks(title,done,userId) 
        VALUES ($1,$2,$3) 
        RETURNING id,title,done`,
        [title,done,userId]
    );
    return  toTask(r.rows[0]);
  },

  findTask :async (id,userId)=>{
    const r = await pool.query(
         `SELECT id ,title,done 
         FROM tasks 
         WHERE id =$1 AND userId =$2`,
         [id,userId],
    );
        return toTask(r.rows[0]);
  },


  listTasks: async(userId)=>{
    const r = await pool.query(
        `SELECT id,title,done FROM tasks 
        WHERE userId = $1 ORDER by id`,
        [userId]
    )
        return r.rows.map(toTask);
  },

  updateTask: async(title,done,id,userId)=>{
    const r = await pool.query(
        `UPDATE tasks 
        SET title = $1, done = $2 
        WHERE id = $3 AND userId = $4
        RETURNING id,title,done`,
        [title,done,id,userId]
    );
        return toTask(r.rows[0]);
  },
  
  deleteTask: async(id,userId)=>{
    const r = await pool.query(
        `DELETE FROM tasks 
        WHERE id = $1 AND userId = $2`,
        [id,userId]
    );
    
        return r.rowCount;
  },

  createUser:  async(email,passwordHash,createAt)=>{
    const r = await pool.query(
        `INSERT INTO 
        users(email,passwordHash,createAt) 
        VALUES ($1,$2,$3)
        RETURNING id,email`,
        [email,passwordHash,createAt]
    );
        return toUser(r.rows[0]);
  },


  findUserByEmail: async(email)=>{
    const r = await pool.query(
       `SELECT*FROM users 
       WHERE email = $1`,
       [email]
    );
        return toUser(r.rows[0]);
  },
  close: ()=>pool.end()


  }
   
}   
module.exports ={openDb};