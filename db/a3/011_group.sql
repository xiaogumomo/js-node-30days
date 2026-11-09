


SELECT student_id ,COUNT(*) AS 课程数
FROM enrollments 
GROUP BY  student_id ;


SELECT course_id , AVG(score) AS 平均分 
FROM enrollments 
GROUP BY course_id ;


SELECT student_id 
FROM enrollments
GROUP BY  student_id
HAVING COUNT(*) >= 1 ; 

SELECT course_id , AVG(score) AS 平均分
FROM enrollments
WHERE score IS NOT NULL 
GROUP BY course_id ;

SELECT course_id, AVG(score) AS 有成绩的平均分, SUM(score)/COUNT(*) AS 总人数的平均分,COUNT(*) AS 这门课的总人数 , COUNT(score) AS 这门课的有成绩人数
FROM enrollments
GROUP BY course_id ;