

SELECT course_name FROM courses ;
SELECT * FROM enrollments WHERE score >= 90 ;
SELECT students.name ,courses.course_name ,enrollments.score
FROM  enrollments, courses ,students
WHERE students.student_id = 1 AND  enrollments.student_id = students.student_id AND enrollments.course_id = courses.course_id;
SELECT * FROM enrollments WHERE score IS NULL ;
SELECT * FROM students WHERE name LIKE '张%' ;


