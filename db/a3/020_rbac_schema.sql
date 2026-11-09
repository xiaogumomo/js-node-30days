-- cmd /c "docker exec -i pg-a3 psql -U app -d rbac -v ON_ERROR_STOP=1 < db\a3\020_rbac_schema.sql"


DROP SCHEMA public CASCADE;
CREATE SCHEMA public ;

CREATE TABLE users(
    user_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY ,
    user_name TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL CHECK(email LIKE '%@%'),
    password_hash VARCHAR(100) NOT NULL ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE roles (
    role_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY ,
    role_name TEXT NOT NULL UNIQUE ,
    parent_id BIGINT REFERENCES roles(role_id) ON DELETE SET NULL
);


CREATE TABLE permissions (
    permission_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY ,
    code  TEXT  NOT NULL UNIQUE ,
    description TEXT
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ,
    role_id BIGINT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE ,
    PRIMARY KEY (user_id ,role_id) 
);


CREATE TABLE role_permissions(
    role_id BIGINT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE ,
    PRIMARY KEY (role_id , permission_id)
);

CREATE TABLE mutually_exclusive_roles(
    role_a BIGINT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE CHECK(role_a < role_b)  ,
    role_b BIGINT NOT NULL REFERENCES roles(role_id)  ON DELETE CASCADE  ,
    PRIMARY KEY (role_a, role_b)
);



INSERT INTO users(user_name,email,password_hash) VALUES 
      ('张三','zhangsan@example.com',123),
      ('李四','lisi@example.com',123),
      ('王五','wangwu@example.com',123),
      ('赵六','zhaoliu@example.com',123);


INSERT INTO roles(role_name,parent_id) VALUES 
       ('admin',NULL),
       ('editor',1),
       ('viewer',2),
       ('auditor',NULL);


INSERT INTO permissions(code,description) VALUES  
       ('task:read','工作读'),
       ('task:write','工作写'),
       ('task:delete','工作删'),
       ('user:read','用户读'),
       ('user:ban','用户禁止'),
       ('report:read','报告阅读');


INSERT INTO mutually_exclusive_roles VALUES 
       (2,4);

INSERT INTO role_permissions VALUES  
       (1,1),
       (1,2),
       (1,3),
       (1,4),
       (1,5),
       (1,6),
       (2,1),
       (2,2),
       (2,3),
       (2,6),
       (3,1),
       (3,4),
       (3,6),
       (4,6);

INSERT INTO user_roles VALUES 
       (1,1),
       (2,2),
       (3,3),
       (4,4) ;       








SELECT * FROM users ;
SELECT * FROM roles ;
SELECT * FROM permissions ;
SELECT * FROM user_roles ;
SELECT * FROM role_permissions ;
SELECT * FROM mutually_exclusive_roles ;


-- INSERT INTO mutually_exclusive_roles VALUES 
--         (4,2) ;

-- SELECT COUNT(*) 
-- FROM mutually_exclusive_roles ;
-- ERROR:  new row for relation "mutually_exclusive_roles" violates check constraint "mutually_exclusive_roles_check"
-- DETAIL:  Failing row contains (4, 2).



INSERT INTO user_roles VALUES 
        (2,4) ;


INSERT INTO users(user_name,email,password_hash) VALUES 
     ('刘七','liuqi@example.com',123) ;


INSERT INTO roles(role_name,parent_id) VALUES 
        ('example' ,NULL) ;


    





