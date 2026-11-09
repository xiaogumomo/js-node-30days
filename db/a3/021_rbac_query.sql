


-- ① 张三【直接拥有】哪些角色？（不递归）
--    期望：admin
SELECT u.user_name ,r.role_name
FROM  users AS u
INNER JOIN user_roles AS ur ON ur.user_id = u.user_id
INNER JOIN roles AS r  ON ur.role_id = r.role_id
WHERE u.user_name = '张三';


-- ② 张三【直接拥有】哪些权限？（role_permissions 里 role_id 对应的）
--    期望：6 条（admin 的全部）
SELECT DISTINCT u.user_name , p.code  AS 权限名
FROM users AS u 
INNER JOIN user_roles AS ur ON ur.user_id = u.user_id
INNER JOIN roles AS r  ON ur.role_id = r.role_id
INNER JOIN role_permissions AS rp ON rp.role_id = r.role_id 
INNER JOIN permissions AS p ON p.permission_id  = rp.permission_id
WHERE u.user_id = 1 ;


-- ③ 李四（editor）【直接拥有】哪些权限？
--    期望：4 条（1,2,3,6）

SELECT u.user_name , p.code AS 权限名
FROM users AS u 
INNER JOIN user_roles AS ur ON ur.user_id = u.user_id
INNER JOIN roles AS r  ON ur.role_id = r.role_id
INNER JOIN role_permissions AS rp ON rp.role_id = r.role_id 
INNER JOIN permissions AS p ON p.permission_id  = rp.permission_id
WHERE u.user_id = 2 ;


-- ④ task:delete 这个权限，【哪些角色】有？【哪些用户】通过角色拿到了它？
--    期望：角色 admin + editor；用户：张三 + 李四

SELECT p.code AS 权限名, u.user_name AS 拥有者
FROM users AS u 
INNER JOIN user_roles AS ur ON ur.user_id = u.user_id
INNER JOIN roles AS r  ON ur.role_id = r.role_id
INNER JOIN role_permissions AS rp ON rp.role_id = r.role_id 
INNER JOIN permissions AS p ON p.permission_id  = rp.permission_id
WHERE p.code = 'task:delete' ;

-- ⑤ 有谁【同时拥有互斥角色】？（查 SSD 是否被违反）

SELECT u.user_name AS 违反者 , mer.role_a , mer.role_b 
FROM mutually_exclusive_roles AS mer 
INNER JOIN user_roles AS ua ON ua.role_id = mer.role_a 
INNER JOIN user_roles AS ub ON ub.role_id = mer.role_b
INNER JOIN users AS u ON u.user_id = ua.user_id AND u.user_id = ub.user_id ;
--    期望：0 行（我们没给人同时分配 editor 和 auditor）


-- ⑥ 【包含继承】地列出李四能用的所有权限
--    李四 = editor，editor 的父是 admin
--    所以李四实际能用：editor 的 4 条 + admin 的 6 条（去重）= 6 条


WITH RECURSIVE role_tree AS (
    SELECT r.role_id , r.parent_id
    FROM users AS u 
    INNER JOIN user_roles AS ur ON ur.user_id = u.user_id
    INNER JOIN roles AS r  ON ur.role_id = r.role_id
    WHERE u.user_id = 2 
    
    UNION ALL 
    
    SELECT r.role_id,r.parent_id 
    FROM roles AS r 
    INNER JOIN role_tree AS rt ON r.role_id  = rt.parent_id 

)

SELECT DISTINCT p.code  AS 有的权限
FROM role_tree rt 
INNER JOIN role_permissions AS rp ON rp.role_id = rt.role_id 
INNER JOIN permissions AS p ON p.permission_id = rp.permission_id ;





