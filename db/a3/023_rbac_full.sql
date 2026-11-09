
-- cmd /c "docker exec -i pg-a3 psql -U app -d rbac -v ON_ERROR_STOP=1 < db\a3\023_rbac_full.sql"

DROP VIEW IF EXISTS user_effective_permissions ;
CREATE VIEW user_effective_permissions AS 
WITH RECURSIVE role_tree AS (
     SELECT ur.user_id , r.role_id , r.parent_id 
     FROM user_roles AS ur 
     JOIN roles AS r ON r.role_id = ur.role_id 
     
     UNION ALL 

     SELECT rt.user_id ,r.role_id,r.parent_id 
     FROM roles r 
     INNER JOIN role_tree  AS rt ON r.role_id = rt.parent_id 
)

SELECT DISTINCT rt.user_id ,rp.permission_id,p.code 
FROM role_tree AS rt 
INNER JOIN  role_permissions AS rp ON rp.role_id = rt.role_id 
INNER JOIN permissions AS p ON p.permission_id = rp.permission_id ;



-- ① 李四（user_id=2）能用的所有权限（含继承）
--    期望：6 条（editor 4 + admin 6 去重）
SELECT uep.code AS 权限
FROM user_effective_permissions  AS uep 
WHERE uep.user_id = 2 ;

-- ② ⭐ 判定：李四能不能 task:delete？
--    期望：true（因为 editor 继承了 admin 的 task:delete）
--    提示：用 EXISTS 或 COUNT(*) > 0
SELECT EXISTS (
    SELECT uep.code 
    FROM user_effective_permissions AS uep 
    WHERE uep.user_id = 2 AND uep.code = 'task:delete'
) AS has_delete_task ;

-- ③ 判定：王五（viewer, user_id=3）能不能 task:delete？
--    期望：false
SELECT EXISTS (
    SELECT uep.code 
    FROM user_effective_permissions AS uep 
    WHERE uep.user_id = 3 AND  uep.code = 'task:delete'
) AS has_delete_task ;
-- 这里是你搞错了吧，viewer是继承的editor而editor继承 的是admin所以应该用task:delete 递归会直接找的admin

-- ④ 哪个用户能 task:delete？（反查，含继承）
SELECT u.user_name AS has_delete_name 
FROM user_effective_permissions AS uep 
JOIN  users AS u  ON u.user_id = uep.user_id 
WHERE uep.code = 'task:delete' ;


-- ⑤ SSD 违规检查（沿用你昨天的写法）

SELECT u.user_name AS 违规者 
FROM mutually_exclusive_roles AS mer 
JOIN user_roles AS ua ON mer.role_a = ua.role_id 
JOIN user_roles AS ub ON mer.role_b = ub.role_id 
JOIN users AS u ON ua.user_id = u. user_id AND ub.user_id = u.user_id ;

-- ⑥ 没有分配任何角色的用户（孤儿检查）
--    提示：LEFT JOIN + IS NULL
-- 期望：刘七一个人
SELECT u.user_name AS 没分配者
FROM users AS u
LEFT JOIN user_roles AS ur  ON ur.user_id = u.user_id 
WHERE ur.role_id IS NULL ;

-- ⑦ 没有任何权限的角色（空角色检查 —— 管理员配错了会这样）
-- 期望example

SELECT r.role_name AS 没权限的角色 
FROM roles AS r 
LEFT JOIN role_permissions AS rp  ON rp.role_id  = r.role_id 
WHERE rp.permission_id IS NULL ; 