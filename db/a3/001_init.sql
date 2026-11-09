
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

CREATE TABLE students(
    student_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY ,
    name TEXT NOT NULL 
);

CREATE TABLE courses(
    course_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY ,
    course_name TEXT NOT NULL 
);

CREATE TABLE enrollments(
     student_id BIGINT NOT NULL  REFERENCES students(student_id),
     course_id BIGINT NOT NULL REFERENCES courses(course_id),
     score INT ,
     PRIMARY KEY (student_id , course_id)
     
);


