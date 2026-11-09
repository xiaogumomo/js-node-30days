

-- ①

SELECT s.name ,c.course_name
FROM enrollments AS e 
INNER JOIN  students As s ON s.student_id = e.student_id
INNER JOIN  courses AS c ON c.course_id = e.course_id 
WHERE e.student_id =1 ;
-- ②


SELECT s.name, e.score
FROM  students AS s
LEFT JOIN  enrollments AS e ON s.student_id=e.student_id ;




-- ③

SELECT student_id FROM students
WHERE student_id NOT IN (SELECT student_id FROM enrollments) ;

SELECT student_id FROM students
WHERE student_id NOT IN (SELECT student_id FROM enrollments WHERE student_id IS NOT NULL);

SELECT student_id FROM students 
WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = students.student_id);

SELECT student_id FROM students WHERE student_id NOT IN (1,2,NULL) ;



-- ④

SELECT s.name ,c.course_name,COALESCE(e.score::text,'未出分') AS 成绩
FROM enrollments AS e 
INNER JOIN  students AS s  ON s.student_id =e.student_id 
INNER JOIN  courses AS c ON c.course_id = e.course_id ;







