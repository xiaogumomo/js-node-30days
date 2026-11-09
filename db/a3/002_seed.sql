TRUNCATE students,courses,enrollments RESTART IDENTITY CASCADE ;
INSERT INTO students (name) VALUES('张三'),('李四');
INSERT INTO students AS s (name) VALUES ('王五')  ;
INSERT INTO courses (course_name) VALUES ('数据库'),('网络');
INSERT INTO enrollments (student_id,course_id,score) VALUES (1,1,88),(1,2,92),(2,1,NULL);

