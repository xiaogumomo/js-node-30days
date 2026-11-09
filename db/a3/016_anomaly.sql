

DROP SCHEMA public CASCADE ;
CREATE SCHEMA public ;


CREATE TABLE bad_student_info (
    student_id BIGINT PRIMARY KEY ,
    student_name TEXT ,
    dept_name TEXT ,
    dept_building TEXT ,
    course_name TEXT 
);

INSERT INTO bad_student_info VALUES 
    (1,'张三','计算机系','计算机楼','数据库'),
    (2,'李四','计算机系','计算机楼','算法'),
    (3,'王五','数学系','理科楼','高数');


-- ① 插入异常：试着插入"物理系在物理楼"，但还没有学生
-- INSERT INTO  bad_student_info(dept_name,dept_building) VALUES ('物理系','物理楼');
-- ERROR: ERROR:  null value in column "student_id" of relation "bad_student_info" violates not-null constraint
-- 正确做法
INSERT INTO bad_student_info(student_id,dept_name,dept_building) VALUES (4,'物理系','物理楼');

-- ② 删除异常：删掉王五（数学系唯一的学生）
--    然后查：还能知道"数学系在哪个楼"吗
DELETE FROM bad_student_info WHERE student_name = '王五' ;
SELECT * FROM bad_student_info ;

--  student_id | student_name | dept_name | dept_building | course_name
-- ------------+--------------+-----------+---------------+-------------
--           1 | 张三         | 计算机系  | 计算机楼      | 数据库
--           2 | 李四         | 计算机系  | 计算机楼      | 算法
--           4 |              | 物理系    | 物理楼        |
-- (3 rows)
-- 数学系不知道了


-- ③ 更新异常：把"计算机楼"改名成"信息楼"，但只改张三那一行
UPDATE bad_student_info 
SET dept_building = '信息楼'
WHERE student_id = 1 ;

SELECT *
FROM bad_student_info ;


--  student_id | student_name | dept_name | dept_building | course_name
-- ------------+--------------+-----------+---------------+-------------
--           2 | 李四         | 计算机系  | 计算机楼      | 算法
--           4 |              | 物理系    | 物理楼        |
--           1 | 张三         | 计算机系  | 信息楼        | 数据库
-- (3 rows)
-- 

