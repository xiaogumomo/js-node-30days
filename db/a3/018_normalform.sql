

-- -- R1(student_id, name, dept)        候选码 = {student_id}
-- FD: student_id → name, dept

-- 1.只有一个候选码student_id 
-- 2.主属性 student_id 
-- 非主属性 name,dept
-- 3.非平凡FD 
-- student_id -> name,dept 
-- 4.因为只依赖单主键，跳过2NF
-- 一个名字对应多个项目，不能决定一行，不违反 3NF
-- 所有FD 左边均为超键， 不违反BCNF



-- R2(student_id, course_id, score)  候选码 = {student_id, course_id}
-- FD: (student_id, course_id) → score

-- 1.只有候选键{student_id,course_id}
-- 2.主属性 student_id course_id 
-- 非主属性 score 
-- 3. 非平凡FD 
-- student_id ,course_id -> score 
-- 4.无部分依赖，一个学生有多个课程，多个课程有不同成绩
-- 无传递依赖，score决定不了任何行
-- 左边为复合主键，符合BCNF



-- R3(student_id, course_id, student_name, score)   候选码 = {student_id, course_id}
-- FD: student_id → student_name
--     (student_id, course_id) → score

-- 1. 候选码 只有 （student_id,course_id）
-- 2.主属性 为 student_id course_id 
-- 非主属性为 student_name score 
-- 3.非平凡FD 
-- student_id -> student_name 
-- student_id , course_id -> score 
-- 4.复合主键为student_id ,course_id ,却只用student_id 就能决定student_name 违反2NF 
-- 下面为子集，也一定违规了

-- R4(emp_id, emp_name, dept_name, dept_office)     候选码 = {emp_id}
-- FD: emp_id → emp_name, dept_name
    -- dept_name → dept_office

-- 1.只有一个候选码 emp_id 
-- 2.主属性为 emp_id 
-- 非主属性为 emp_name dept_office  dept_name 
-- 3.非平凡FD 
-- emp_id -> emp_name,dept_name 
-- dept_name -> dept_office 
-- 4.只有一个主键，不是复合主键 肯定符合2NF
-- emp_id -> dept_name -> dept_office dept_name不是主属性，违反了3NF
-- 违反了3NF 也肯定违反BCNF

