
INSERT INTO students (name) VALUES ('王五');

SELECT student_id FROM students 
INTERSECT
SELECT student_id FROM enrollments;

SELECT student_id FROM students
EXCEPT 
SELECT student_id FROM enrollments ;

SELECT student_id FROM students 
UNION
SELECT student_id FROM enrollments ;

SELECT student_id FROM students
UNION ALL
SELECT student_id FROM enrollments ;

