

SELECT 19.99 :: float8 * 3 AS float , 19.99 :: numeric * 3 AS numeric ;


-- SELECT 1234567 :: numeric(8,2);


SELECT octet_length('ab'::char(5)) AS 字节数 ,length('ab'::char(5)) AS 字符数;

SELECT now() AS 带时区 , now() :: timestamp AS 不带时区;