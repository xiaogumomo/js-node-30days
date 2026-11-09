


SELECT code ,
       CASE 
           WHEN code LIKE 'task:%' THEN  '任务'
           WHEN code LIKE 'user:%' THEN  '用户'
           WHEN code LIKE 'report:%' THEN '报表'
           ELSE '其他'
        END AS 分类
FROM permissions ;


SELECT date_trunc('month',created_at) AS 月份 ,COUNT(*) AS 人数
FROM users GROUP BY 1 ORDER BY 1 ;

SELECT code ,
        split_part(code,':',1) AS 对象,
        split_part (code,':',2) AS 操作
FROM permissions ;

INSERT INTO users (user_name , email , password_hash)
VALUES ('张三','zhangsan@example.com','newhash')
ON CONFLICT  (email) DO UPDATE 
     SET user_name = EXCLUDED.user_name ,
         password_hash = EXCLUDED.password_hash ;



WITH 用户的角色 AS (
    SELECT u.user_name , r.role_name 
    FROM users AS u 
    JOIN user_roles AS ur ON ur.user_id  = u.user_id 
    JOIN roles r ON r.role_id = ur.role_id 
),
角色的权限 AS (
    SELECT r.role_name , p.code 
    FROM  role_permissions AS rp
    JOIN roles AS r ON r.role_id = rp.role_id 
    JOIN permissions AS p ON p.permission_id = rp.permission_id 
)

SELECT * FROM 用户的角色 WHERE role_name = 'admin' ;

