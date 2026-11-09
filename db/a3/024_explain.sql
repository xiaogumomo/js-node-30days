
-- big_users: 10 万行，两个索引
--   - idx_big_email (email)
--   - idx_big_age_name (age, name)     ← 联合索引

EXPLAIN SELECT * FROM big_users WHERE email = 'user500@x.com' ;
-- Index Scan

EXPLAIN SELECT  email FROM big_users WHERE email = 'user500@x.com';
-- Index Only Scan

EXPLAIN SELECT * FROM big_users WHERE upper(email) = 'USER500@X.COM';
-- Seq Scan 

-- EXPLAIN SELECT * FROM big_users WHERE email = 12345 ;
-- Seq Scan 
-- 实际上是：ERROR:  operator does not exist: text = integer
-- LINE 1: EXPLAIN SELECT * FROM big_users WHERE email = 12345 ;

EXPLAIN SELECT * FROM big_users WHERE email LIKE '%500@%' ;
-- Seq Scan

EXPLAIN SELECT * FROM big_users WHERE name = 'name500' ;
-- Seq Scan 

EXPLAIN SELECT * FROM big_users WHERE age = 20 AND name = 'name20' ;
-- Index Scan 


EXPLAIN SELECT * FROM big_users WHERE age = 20 ;
--Seq Scan 实际上是  Bitmap Heap Scan



EXPLAIN SELECT * FROM big_users WHERE age = 20 AND id < 20 ;


EXPLAIN SELECT * FROM big_users WHERE age > 18 ;




EXPLAIN ANALYZE  SELECT * FROM big_users WHERE age = 20 ;


DELETE FROM  big_users WHERE id % 2= 0 ;
EXPLAIN SELECT * FROM big_users WHERE age = 20 ;
ANALYZE big_users ;
EXPLAIN SELECT * FROM big_users WHERE age = 20 ;