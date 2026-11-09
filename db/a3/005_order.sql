

SELECT * FROM enrollments ORDER BY score DESC;
SELECT * FROM enrollments ORDER BY score DESC NULLS LAST ;
SELECT * FROM students ORDER BY name ;
SELECT * FROM enrollments ORDER BY student_id,course_id LIMIT 1 ;
SELECT DISTINCT score FROM enrollments ;
SELECT DISTINCT student_id,course_id FROM enrollments ;