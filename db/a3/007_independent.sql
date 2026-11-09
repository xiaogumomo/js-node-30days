DROP SCHEMA public CASCADE ;
CREATE SCHEMA  public ;

CREATE TABLE books(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title  TEXT NOT NULL ,
    price NUMERIC(8,2) ,
    published_at TIMESTAMP DEFAULT NOT NULL TIMESTAMPTZ 
);

INSERT INTO books (title,price) VALUES ('百科全书',120),('数学大全',49),('十万个为什么',78),('小森林',NULL);

SELECT * FROM books ;
SELECT * FROM books WHERE price >50 ;
SELECT * FROM books WHERE price IS NULL;
SELECT * FROM books   ORDER BY price DESC NULLS LAST LIMIT 2 ;

