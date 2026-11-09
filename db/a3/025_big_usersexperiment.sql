

DROP TABLE IF EXISTS big_users ;

CREATE TABLE big_users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY ,
    email TEXT ,
    name TEXT ,
    age INT  ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

INSERT INTO big_users (email,name, age) 
SELECT 'user'|| i || '@x.com','name' ||  i , (i % 60) + 18 FROM generate_series (1,1000000) i ;
CREATE INDEX idx_age_name ON big_users (age,name);


ANALYZE big_users ;


EXPLAIN ANALYZE  SELECT *FROM big_users WHERE age = 20 ;
DELETE FROM big_users WHERE random() < 0.6 ;

EXPLAIN SELECT * FROM big_users WHERE age = 20 ;

ANALYZE big_users ;
EXPLAIN SELECT * FROM big_users WHERE age = 20 ;


SET max_parallel_workers_per_gather = 0 ;
EXPLAIN ANALYZE SELECT * FROM big_users WHERE age = 20 ;
RESET max_parallel_workers_per_gather ;