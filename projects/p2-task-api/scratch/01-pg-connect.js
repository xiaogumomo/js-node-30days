
//驱动 / 网络 / 认证 三件事一次验完




const {Pool} = require('pg');
//connectIONString 是要连接的数据库的URL
const pool =new Pool({connectionString:process.env.DB_URL|| 'postgres://app:secret@localhost:5432/tasks'});

(async()=> {const one =await pool.query(`SELECT 1 AS ok`)//直接返回一个ok列名 内容的数值为1的列

console.log(`SELECT 1 ->`,one.rows); //one中的rows属性 显示列名ok的

const v = await pool.query(`SELECT version()`);

console.log(`version ->`,v.rows[0].version);

await pool.end();

})().catch((e) =>{
    console.error('连不上：',e);
    process.exit(1);
})



