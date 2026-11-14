-- 关于DO块的讲义里你只字未提，是我找资料的，这点注意，
DO $$
BEGIN 
   IF EXISTS (SELECT FROM  pg_catalog.pg_roles  WHERE rolname = 'rbac_reader') THEN 
        RAISE NOTICE 'Role "rbac_reader" already exists .Skipping ' ;
   ELSE 
        CREATE ROLE rbac_reader NOLOGIN ;
   END IF ;
END 
$$ ;   

DO $$
BEGIN 
   IF EXISTS (SELECT FROM  pg_catalog.pg_roles  WHERE rolname = 'rbac_writer') THEN 
        RAISE NOTICE 'Role "rbac_writer" already exists .Skipping ' ;
   ELSE     
        CREATE ROLE rbac_writer NOLOGIN ;
   END IF ;
END 
$$ ;   
-- DROP OWNED BY rbac_writer CASCADE ;
-- DROP OWNED BY rbac_reader CASCADE ;

-- DROP ROLE IF EXISTS  rbac_writer ;
-- DROP ROLE IF EXISTS  rbac_reader ;
-- CREATE ROLE rbac_reader NOLOGIN ;
-- CREATE ROLE rbac_writer NOLOGIN ;
-- 直接删干净更好，以免授权错了到最后还得重新删，免了这一步,但是第一次非常麻烦，最终还是选择了DO块



GRANT USAGE ON  SCHEMA public TO rbac_reader ;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rbac_reader ;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON  TABLES  TO rbac_reader ;



GRANT USAGE ON  SCHEMA public TO rbac_writer ;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rbac_writer ;
GRANT SELECT,USAGE ON ALL SEQUENCES IN SCHEMA public TO rbac_writer ;
GRANT INSERT,UPDATE,DELETE ON  ALL TABLES  IN SCHEMA public TO rbac_writer ;


ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON  TABLES TO rbac_writer ;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE,SELECT ON SEQUENCES  TO rbac_writer ;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT INSERT,UPDATE,DELETE ON  TABLES  TO rbac_writer ;

DROP ROLE IF EXISTS reader_zhang;
DROP ROLE IF EXISTS writer_li;
CREATE ROLE reader_zhang LOGIN;
CREATE ROLE writer_li LOGIN;
GRANT rbac_reader TO  reader_zhang ;
GRANT rbac_writer TO writer_li ;

SELECT has_schema_privilege('reader_zhang','public','USAGE');
-- SELECT has_schema_privilege('reader_zhang','public','INSERT');
-- ERROR:  unrecognized privilege type: "INSERT"
SELECT has_table_privilege('writer_li','users','INSERT');
-- SELECT has_table_privilege('writer_li','users','CREATE TABLE');
-- ERROR:  unrecognized privilege type: "CREATE TABLE"


SET ROLE reader_zhang ;
SELECT COUNT(*) FROM users ;
RESET ROLE ;
 
-- SET ROLE reader_zhang ;
-- DELETE FROM users WHERE user_id = 999 ;
-- RESET ROLE ;
-- ERROR:  permission denied for table users

SET ROLE writer_li ;
INSERT INTO  users(user_name,email,password_hash) VALUES ('小明','123@',123);


SET ROLE writer_li ;
CREATE TABLE zz(a int);
RESET ROLE ;
-- ERROR:  permission denied for schema public


 












