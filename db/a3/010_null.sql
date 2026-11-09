



SELECT 'AND' AS 类型, * FROM enrollments WHERE score <> 88 AND student_id =2 ;


SELECT 'OR' AS 类型 , * FROM enrollments WHERe score <> 88 OR student_id = 2 ;


SELECT COUNT(*) AS 行数, COUNT(score) AS 有成绩的 , SUM(score) AS 总分 , AVG(score) AS 平均 FROM enrollments ;




SELECT SUM(score) / COUNT(*) AS 按总人数平均 FROM enrollments ;


SELECT NULL = NULL AS 普通等于  , NULL IS NOT DISTINCT FROM NULL AS "NULL安全等于";