


CREATE TABLE bad_enrollment(
    student_id BIGINT ,
    student_name TEXT ,
    course_id BIGINT ,
    course_name TEXT ,
    teacher_name TEXT ,
    teacher_office TEXT,
    score INT ,
    PRIMARY KEY (student_id , course_id)
);

-- student_id -> student_name  是超码
-- course_id -> course_name  不是
-- student_id -> score  是超码
-- teacher_office -> teacher_name 不是 这个要看情况，如果一个老师一个办公室就是FD 
-- (student_id,course_id) -> student_name 是超码 
-- (student_id,course_id) -> course_name  是超码
-- (student_id,course_id) -> teacher_name 是超码
-- (student_id,course_id) -> teacher_office  是超码
-- (student_id,course_id) -> score  是超码
-- (student_id,course_id) -> student_name ,course_name ,teacher_name ,teacher_office ,score 是超码


-- 拆成三张表
-- 学生表students 主键为student_id 
-- 课程表courses 主键为 course_id 
-- 老师表teachers 主键为 teacher_id 

-- 违反了2NF  student_id -> student_name course_id -> course_name 这两条违反
-- 违反了3NF 传递依赖  (student_id,course_id) -> teacher_name->teacher_office 这条违反了
-- 不可能， 2NF 管的是复合主键的情况，而不管单主键，只有可能违反3NF 传递依赖






