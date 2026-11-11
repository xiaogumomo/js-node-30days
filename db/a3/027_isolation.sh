#!/bin/bash
# db/a3/027_isolation.sh —— 隔离级别实测（脚本化双会话，避免手开窗口留僵尸事务）
#
# 用法（在 Git Bash 里跑）：bash db/a3/027_isolation.sh
#
# 设计说明：
#   · 会话 A 用 psql 后台进程跑，事务里【读 → pg_sleep(3) → 再读】
#   · 会话 B 在 A 睡的那 3 秒里改数据并提交
#   · 对比 RC 和 RR 下两次读的结果
#   · pg_sleep 用来"占住时间窗"，不是为了慢

Q() { docker exec pg-a3 psql -U app -d rbac -tAc "$1"; }

reset_table() {
  Q "DROP TABLE IF EXISTS accounts;
     CREATE TABLE accounts(id int PRIMARY KEY, balance numeric NOT NULL);
     INSERT INTO accounts VALUES (1, 100);" > /dev/null
}

run_case() {
  local iso="$1" newval="$2"
  docker exec pg-a3 psql -U app -d rbac -tAc "
    BEGIN ISOLATION LEVEL $iso;
    SELECT '  A 第一次读 id=1 的余额: ' || balance FROM accounts WHERE id=1;
    SELECT pg_sleep(3);
    SELECT '  A 第二次读 id=1 的余额: ' || balance FROM accounts WHERE id=1;
    COMMIT;
  " 2>&1 | grep -v '^ *$' &
  local apid=$!
  sleep 1
  echo "  [会话B] 把余额改成 $newval 并提交"
  Q "UPDATE accounts SET balance = $newval WHERE id=1" > /dev/null
  wait $apid
}

reset_table
echo "═══ 实验 1：READ COMMITTED（PG 默认）═══"
run_case "READ COMMITTED" 999
echo ""

reset_table
echo "═══ 实验 2：REPEATABLE READ（PG 的快照隔离）═══"
run_case "REPEATABLE READ" 888
echo ""

# ── 幻读：范围查询两次，中间插一行 ──
reset_table
echo "═══ 实验 3：RC 下的幻读（范围查询两次，中间 INSERT 一行）═══"
docker exec pg-a3 psql -U app -d rbac -tAc "
  BEGIN ISOLATION LEVEL READ COMMITTED;
  SELECT '  A 第一次 COUNT: ' || count(*) FROM accounts;
  SELECT pg_sleep(3);
  SELECT '  A 第二次 COUNT: ' || count(*) FROM accounts;
  COMMIT;
" 2>&1 | grep -v '^ *$' &
apid=$!
sleep 1
echo "  [会话B] 插入一行 id=2"
Q "INSERT INTO accounts VALUES (2, 50)" > /dev/null
wait $apid
echo ""

reset_table
echo "═══ 实验 4：RR 下的幻读（同样操作）═══"
docker exec pg-a3 psql -U app -d rbac -tAc "
  BEGIN ISOLATION LEVEL REPEATABLE READ;
  SELECT '  A 第一次 COUNT: ' || count(*) FROM accounts;
  SELECT pg_sleep(3);
  SELECT '  A 第二次 COUNT: ' || count(*) FROM accounts;
  COMMIT;
" 2>&1 | grep -v '^ *$' &
apid=$!
sleep 1
echo "  [会话B] 插入一行 id=2"
Q "INSERT INTO accounts VALUES (2, 50)" > /dev/null
wait $apid
echo ""
echo "═══ 结束 ═══"
