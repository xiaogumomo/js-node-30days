
DROP SCHEMA public CASCADE ;
CREATE SCHEMA public ;

CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY ,
    user_name TEXT NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email LIKE '%@%'),
    create_at TIMESTAMPTZ NOT NULL DEFAULT now()   
);


CREATE TABLE user_follows(
    follower_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ,
    followee_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ,
    PRIMARY KEY (follower_id , followee_id) 
);

CREATE TABLE boards(
    board_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    board_name TEXT NOT NULL UNIQUE  ,
    description TEXT 
);

CREATE TABLE posts (
    post_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY  ,
    title TEXT NOT NULL ,
    board_name TEXT NOT NULL REFERENCES boards(board_name) ON DELETE RESTRICT,
    user_id  BIGINT  REFERENCES users(user_id) ON DELETE SET NULL ,
    create_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE post_likes(
    user_id BIGINT NOT NULL REFERENCES users(user_id)ON DELETE CASCADE ,
    post_id BIGINT NOT NULL REFERENCES posts(post_id)ON DELETE CASCADE ,
    PRIMARY KEY (user_id,post_id)
);

CREATE TABLE comments (
    comment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY ,
    user_id  BIGINT  REFERENCES users(user_id) ON DELETE SET NULL  ,
    post_id BIGINT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    comment  TEXT NOT NULL ,
    create_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP 
    
);


INSERT INTO users(user_name,email) VALUES 
      ('张三','zhangsan@qq.com'),
      ('李四','lisi@qq.com'),
      ('王五','wangwu@qq.com');

INSERT INTO user_follows VALUES 
        (1,2),
        (1,3),
        (2,1);

INSERT INTO  boards(board_name,description) VALUES 
        ('娱乐天堂','跟世界各地的人交流的地方！');

INSERT INTO posts(title,board_name,user_id) VALUES 
       ('认识一下新朋友','娱乐天堂',1);
INSERT INTO post_likes VALUES 
       (2,1),
       (3,1);

INSERT INTO comments(user_id,post_id,comment) VALUES 
       (1,1,'你好'),
       (2,1,'你好,我叫李四');



SELECT * FROM users ;
SELECT * FROM user_follows ;
SELECT * FROM boards ;
SELECT * FROM posts ;
SELECT * FROM post_likes;
SELECT * FROM comments ;
