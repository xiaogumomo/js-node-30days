#!/bin/bash
# db/a3/028_locks.sh —— 锁实测（脚本化双会话）
#
# 用法（Git Bash）：bash db/a3/028_locks.sh
#
# 三个实验：
#   1. FOR UPDATE 让别人等（测等待毫秒数）
#   2. SKIP LOCKED 让两个 worker 抢到不同的行
#   3. 没有索引时，FOR UPDATE 的锁范围扩大

Q() { docker exec pg-a3 psql -U app -d rbac -tAc "$1"; }
MS() { date +%s%3N; }

setup() {
  Q "DROP TABLE IF EXISTS jobs;
     CREATE TABLE jobs(id int PRIMARY KEY, status text, worker text, note text);
     INSERT INTO jobs SELECT i, 'pending', NULL, 'x' FROM generate_series(1,5) i;" > /dev/null
}

echo "═══ 实验 1：FOR UPDATE —— B 要等 A 提交 ═══"
setup
docker exec pg-a3 psql -U app -d rbac -tAc "
  BEGIN;
  SELECT '  [A] 锁住 id=' || id FROM jobs WHERE id = 1 FOR UPDATE;
  SELECT pg_sleep(3);
  COMMIT;
" 2>&1 | grep -v '^ *$' &
APID=$!
sleep 1
echo "  [B] 更新 id=1 ..."
S=$(MS); Q "UPDATE jobs SET worker='B' WHERE id=1" > /dev/null; E=$(MS)
echo "  [B] 等了 $((E-S)) ms（应该 ≈ 2000ms，因为 A 还持有 2 秒）"
wait $APID
echo ""

echo "═══ 实验 2：SKIP LOCKED —— 两个 worker 拿到不同的行 ═══"
setup
for w in W1 W2; do
  docker exec pg-a3 psql -U app -d rbac -tAc "
    BEGIN;
    SELECT '  [$w] 抢到 id=' || id FROM jobs
      WHERE status='pending' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;
    SELECT pg_sleep(2);
    COMMIT;
  " 2>&1 | grep -v '^ *$' &
  sleep 0.6
done
wait
echo "  ↑ 如果两个 worker 拿到【不同】的 id，说明 SKIP LOCKED 生效"
echo ""

echo "═══ 实验 3：无索引 → 锁范围扩大 ═══"
setup
echo "  [A] 用 note 列（无索引）加锁：WHERE note='x' FOR UPDATE"
docker exec pg-a3 psql -U app -d rbac -tAc "
  BEGIN;
  SELECT '  [A] 锁住的行 id=' || id FROM jobs WHERE note='x' FOR UPDATE;
  SELECT pg_sleep(3);
  COMMIT;
" 2>&1 | grep -v '^ *$' &
APID=$!
sleep 1
echo "  [B] 只想改 id=5（A 的 WHERE 条件里没提 id=5）"
S=$(MS); timeout 6 docker exec pg-a3 psql -U app -d rbac -tAc "UPDATE jobs SET worker='B5' WHERE id=5" > /dev/null 2>&1; E=$(MS)
echo "  [B] 等了 $((E-S)) ms（>1000ms 说明 id=5 也被连带锁住了）"
wait $APID
echo ""
echo "═══ 结束 ═══"
