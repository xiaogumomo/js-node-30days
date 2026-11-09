


SELECT score 
FROM enrollments
WHERE score > (
    SELECT AVG(score) 
    FROM  enrollments 
);

SELECT name 
FROM students 
WHERE student_id IN (
    SELECT e.student_id 
    FROM enrollments AS e 
    INNER JOIN courses AS c ON c.course_id = e.course_id 
    WHERE c.course_name = '数据库'
);

SELECT name 
FROM students AS s
WHERE EXISTS (
    SELECT 1
    FROM enrollments AS e
    WHERE e.student_id = s.student_id 
);

SELECT name 
FROM students  AS s
WHERE NOT EXISTS (
    SELECT 1
    FROM enrollments AS e 
    WHERE e.student_id = s.student_id
);


SELECT t.avg_scor
FROM (
    SELECT student_id , AVG(score) AS avg_scor
    FROM enrollments 
    GROUP BY  student_id 
) AS t
WHERE t.avg_scor > 85 ;
