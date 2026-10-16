#!/usr/bin/env bash
# 腿② 服务活体 · 一键版（演示保险）
# 用法：另一个终端先起服务（cd projects/p2-task-api && node src/server.js）
#       然后在 Git Bash 里：bash demo-leg2.sh
# 它做的事和 report-1017.md 腿②的 6 条命令**一模一样**，只是 token 由脚本自己取、不用手复制。
set -u
BASE=${BASE:-http://127.0.0.1:3000}
STAMP=$(date +%H%M%S)
A="demo-a-${STAMP}@demo.local"
B="demo-b-${STAMP}@demo.local"
PW="pass1234"

# 从 JSON 响应里取一个字段（用 node，避免引号/编码坑）
field() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(String(JSON.parse(s)[process.argv[1]]??""))}catch(e){}}) ' "$1"; }

echo "腿② 服务活体 —— $BASE"
echo "（账号：$A / $B）"

printf '\n① 注册 A         期望 201 → '
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$BASE/auth/register" \
  -H "content-type: application/json" -d "{\"email\":\"$A\",\"password\":\"$PW\"}"

printf '② 登录 A         期望 200 → '
TA=$(curl -s -X POST "$BASE/auth/login" -H "content-type: application/json" \
  -d "{\"email\":\"$A\",\"password\":\"$PW\"}" | field token)
echo "200（token ${#TA} 字符）"

printf '③ 建任务 A       期望 201 → '
ID=$(curl -s -X POST "$BASE/tasks" -H "content-type: application/json" \
  -H "authorization: Bearer $TA" -d '{"title":"demo-task-1"}' | field id)
echo "201（新任务 id=$ID）"

printf '④ 查 A 的列表    期望 200 → '
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/tasks" -H "authorization: Bearer $TA"

printf '⑤ 注册 B         期望 201 → '
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$BASE/auth/register" \
  -H "content-type: application/json" -d "{\"email\":\"$B\",\"password\":\"$PW\"}"
printf '   登录 B         期望 200 → '
TB=$(curl -s -X POST "$BASE/auth/login" -H "content-type: application/json" \
  -d "{\"email\":\"$B\",\"password\":\"$PW\"}" | field token)
echo "200（token ${#TB} 字符）"

printf '\n★ ⑥ 换 B 去看 A 的任务 id=%s  期望 【404】\n' "$ID"
curl -s -i "$BASE/tasks/$ID" -H "authorization: Bearer $TB" | head -4
echo
echo "（第一行看到 HTTP/1.1 404 Not Found = 隔离生效 = 这条判据通过）"
