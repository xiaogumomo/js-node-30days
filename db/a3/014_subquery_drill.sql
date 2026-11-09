

-- ①
SELECT id ,amount
FROM orders 
WHERE amount > (
    SELECT MIN(amount) 
    FROM orders 
);


-- ②

SELECT id 
FROM orders 
WHERE amount = (
    SELECT MAX(amount)
    FROM orders 
);

-- ③ //被ai纠错改回来的

SELECT c.name ,(
    SELECT COUNT(*)
    FROM orders AS o 
    WHERE o.customer_id = c.id 
) AS 订单数
FROM customers AS c  ;

-- ④

SELECT o.customer_id,o.amount 
FROM orders AS o 
WHERE o.amount > (
    SELECT SUM(amount)/COUNT(*)
    FROM (
        SELECT orders.amount 
        FROM orders 
        INNER JOIN customers AS c ON c.id = orders.customer_id
        WHERE c.name = '李四'
    )
);


-- ⑤

SELECT c.name
FROM customers AS c 
LEFT JOIN orders AS o ON o.customer_id = c.id 
WHERE c.id IN (o.customer_id) 
GROUP BY c.id ;

SELECT c.name 
FROM customers AS c
WHERE c.id IN (
    SELECT o.customer_id
    FROM orders AS o 
    WHERE o.customer_id = c.id 
);

-- ⑥

SELECT c.name 
FROM customers AS c 
WHERE EXISTS (
    SELECT o.customer_id 
    FROM orders AS o 
    WHERE o.customer_id = c.id 
);

-- ⑦

SELECT c.name 
FROM customers AS c 
WHERE  NOT EXISTS (
    SELECT o.customer_id
    FROM orders AS o 
    WHERE o.customer_id = c.id 
) ;


-- ⑧ 

SELECT * 
FROM customers 
WHERE id NOT IN (
    SELECT NULLIF(customer_id , 1)
    FROM orders 
);


-- ⑨

SELECT t.customer_id ,t.sum_amount AS 订单总额
FROM (
    SELECT o.customer_id,SUM(amount) AS sum_amount
    FROM orders  AS o
    GROUP BY o.customer_id
) AS t 
WHERE t.sum_amount > 200 
ORDER BY t.customer_id ;


-- ⑩

SELECT a.总额平均值
FROM (
    SELECT AVG(sum_amount) AS 总额平均值
    FROM (
        SELECT o.id  ,SUM(amount) AS sum_amount 
        FROM orders AS o 
        GROUP BY o.id 
    ) AS s
) AS a ;


-- 11

SELECT t.name,t.平均订单金额
FROM (
    SELECT c.name ,AVG(amount) AS 平均订单金额
    FROM customers AS c 
    INNER JOIN  orders AS o ON o.customer_id = c.id 
    GROUP BY c.name 
) AS t 
ORDER BY t.平均订单金额 DESC ;

-- 12


SELECT name,amount
FROM customers AS c 
INNER JOIN orders AS o  ON o.customer_id = c.id 
WHERE amount = (
    SELECT Max(amount) 
    FROM orders 
    WHERE c.id = orders.customer_id 
);
