-- cmd /c "docker exec -i pg-a3 psql -U app -d rbac -v ON_ERROR_STOP=1 < db\a3\026_explain_lab.sql"


EXPLAIN ANALYZE SELECT * FROM big_users WHERE age > 18 ;
-- Seq Scan 

EXPLAIN ANALYZE SELECT * FROM big_users WHERE age = 20 ;
-- Index Scan 

EXPLAIN ANALYZE SELECT * FROM big_users WHERE age = 20 AND name = 'name20' ;
-- Index Scan 
EXPLAIN ANALYZE SELECT age,name FROM big_users WHERE age = 20 AND name = 'name20' ;
-- Index Only Scan 

EXPLAIN ANALYZE SELECT count(*) FROM big_users ;
-- Seq Scan  实际Parallel Seq Scan 全局扫描代价太高所以用


DROP TABLE IF EXISTS small_tags ;
CREATE TABLE small_tags (age INT , tag TEXT );
INSERT INTO small_tags SELECT a , 'tag' || a FROM generate_series(18,77) AS a ;
ANALYZE small_tags ;

EXPLAIN ANALYZE SELECT count(*) FROM small_tags t JOIN big_users AS b ON b.age = t.age ;
-- Nested Loop  实际是Hash Join  loops = 3  

SET enable_nestloop = off ;
EXPLAIN ANALYZE SELECT count(*) FROM  small_tags AS t JOIN big_users AS b ON  b.age = t.age ;
RESET enable_nestloop ;
-- Hash Join



SET enable_nestloop = off ; SET enable_hashjoin = off ;
EXPLAIN ANALYZE SELECT count(*) FROM small_tags AS t JOIN big_users AS b ON b.age = t.age ;
RESET enable_nestloop ; RESET enable_hashjoin ;
-- Merge Join



DELETE FROM big_users WHERE random() < 0.5 ;
EXPLAIN SELECT * FROM big_users WHERE age = 20 ;


ANALYZE big_users ;
EXPLAIN SELECT * FROM big_users WHERE age = 20 ;





