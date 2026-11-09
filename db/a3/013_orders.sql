

DROP SCHEMA public CASCADE ;
CREATE SCHEMA public;


CREATE TABLE customers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL ,
    email TEXT NOT NULL UNIQUE 
);

CREATE TABLE orders (
     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY ,
     customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE ,
     amount NUMERIC(12,2),
     status TEXT NOT NULL DEFAULT 'pending' ,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now() 
);

INSERT INTO customers (name,email) VALUES 
    ('张三','zhang@x.com'),
    ('李四','li@x.com'),
    ('王五','wang@x.com');


INSERT INTO orders (customer_id,amount,status) VALUES 
    (1,100.00,'paid'),
    (1,250.00,'paid'),
    (2,NULL ,'pending'),
    (2, 80.00,'paid');



-- ①
SELECT  o.id, o.amount, c.name
FROM orders AS o
INNER JOIN customers AS c ON c.id = o.customer_id ; 
-- ②
SELECT c.name 
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
WHERE o.customer_id IS NULL ;
-- ③
SELECT o.customer_id , COUNT(*) AS 订单数 ,SUM(amount) AS 订单总额
FROM orders AS o 
GROUP BY o.customer_id ;

SELECT c.name ,COUNT(*) AS 订单数 , SUM(amount) AS 订单总额 
FROM customers AS c
INNER JOIN orders AS o ON o.customer_id = c.id 
GROUP BY c.name 
ORDER BY c.name ;

-- ④

SELECT c.name ,COUNT(*) AS 订单数 , SUM(amount) AS 订单总额 
FROM customers AS c
INNER JOIN orders AS o ON o.customer_id = c.id 
GROUP BY c.name 
HAVING COUNT(*) >= 2 
ORDER BY c.name ;

-- ⑤

SELECT id 
FROM orders AS o 
WHERE o.amount > (
    SELECT AVG(amount)
    FROM orders 
);

-- ⑥

SELECT id,COALESCE(amount,0.00) AS 金额
from orders ;

-- ⑦

SELECT customer_id , AVG(amount) AS 每个客户平均订单金额
FROM orders 
GROUP BY customer_id ;

-- ⑧

SELECT c.name
FROM (
    SELECT o.customer_id ,AVG(amount) AS avg_amount
    FROM  orders AS o
    GROUP BY customer_id 
    HAVING AVG(amount) >100 
) AS t 
INNER JOIN  customers AS c  ON c.id = t.customer_id ;

-- ⑨

SELECT id
FROM orders 
WHERE status = 'paid' AND amount > 90 ;


-- ⑩

SELECT o.status , COUNT(*) AS 订单数
FROM orders AS o
GROUP BY o.status ;



