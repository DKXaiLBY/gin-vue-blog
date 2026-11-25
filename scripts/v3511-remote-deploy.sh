#!/bin/bash
# v3.51.1 远端部署脚本 (由 scripts/v3511-build.sh 打进部署包, 在服务器上执行)
# 做法: 基于容器当前镜像做增量打包(前台替换静态资源, 后端替换二进制) -> 打回滚标签 -> 切换 -> 验证
# 验证不过自动回滚到旧镜像。不改 compose 文件和 .env.secrets, 所以 AI 密钥等环境映射原样保留。
# 用法: bash deploy.sh <预期入口 js 文件名>
set -u
say() { echo "== $* =="; }
PKG=/opt/blog/deploy/v3511
EXPECT_IDX="${1:?usage: deploy.sh <expected entry js>}"

cd /opt/blog/deploy/start || { echo "ABORT: compose dir missing"; exit 2; }
say "0. preflight"
WEB_CUR=$(docker inspect -f '{{.Image}}' gvb-web 2>/dev/null) || { echo "ABORT: gvb-web container missing"; exit 2; }
SRV_CUR=$(docker inspect -f '{{.Image}}' gvb-server 2>/dev/null) || { echo "ABORT: gvb-server container missing"; exit 2; }
[ -f "$PKG/web/dist_blog/index.html" ] && [ -f "$PKG/server/server" ] || { echo "ABORT: package incomplete"; exit 2; }
PACKED_IDX=$(grep -oE "index-[A-Za-z0-9_-]+\.js" "$PKG/web/dist_blog/index.html" | head -1)
[ "$PACKED_IDX" = "$EXPECT_IDX" ] || { echo "ABORT: packaged entry ($PACKED_IDX) != expected ($EXPECT_IDX)"; exit 2; }
echo "web image in use: ${WEB_CUR:0:19} | server image in use: ${SRV_CUR:0:19} | entry: $PACKED_IDX"

say "1. rollback tags"
docker tag "$WEB_CUR" start-gvb-web:rollback-v351
docker tag "$SRV_CUR" start-gvb-server:rollback-v351
echo "tagged: start-gvb-web:rollback-v351, start-gvb-server:rollback-v351"
# 构建文件的 FROM 不能直接写 64 位镜像 ID, 先给当前镜像起个名字
docker tag "$WEB_CUR" start-gvb-web:overlay-base
docker tag "$SRV_CUR" start-gvb-server:overlay-base

say "2. build overlay images"
docker build -q --build-arg BASE=start-gvb-web:overlay-base -f "$PKG/web/Dockerfile" -t start-gvb-web:v3.51.1 "$PKG/web" > /dev/null || { echo "ABORT: web build failed"; exit 3; }
docker build -q --build-arg BASE=start-gvb-server:overlay-base -f "$PKG/server/Dockerfile" -t start-gvb-server:v3.51.1 "$PKG/server" > /dev/null || { echo "ABORT: server build failed"; exit 3; }
echo "built: $(docker images --format '{{.Repository}}:{{.Tag}} {{.Size}}' | grep -E '^start-gvb-(web|server):v3\.51\.1' | tr '\n' ' ')"

say "3. switch"
docker tag start-gvb-web:v3.51.1 start-gvb-web:latest
docker tag start-gvb-server:v3.51.1 start-gvb-server:latest
docker compose up -d --no-build --no-deps --force-recreate gvb-web gvb-server 2>&1 | tail -4

say "4. verify"
ok=0
for i in $(seq 1 12); do
  sleep 3
  web=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:8081/)
  idx=$(curl -s --max-time 5 http://127.0.0.1:8081/ | grep -oE "index-[A-Za-z0-9_-]+\.js" | head -1)
  srv=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:8765/api/front/status)
  st=$(docker inspect -f '{{.State.Status}}' gvb-server 2>/dev/null)
  echo "t=$((i*3))s web=$web entry=$idx status_api=$srv server=$st"
  if [ "$web" = "200" ] && [ "$idx" = "$EXPECT_IDX" ] && [ "$srv" = "200" ] && [ "$st" = "running" ]; then ok=1; break; fi
done

if [ "$ok" != "1" ]; then
  say "ROLLBACK"
  docker logs --tail 15 gvb-server 2>&1
  docker tag start-gvb-web:rollback-v351 start-gvb-web:latest
  docker tag start-gvb-server:rollback-v351 start-gvb-server:latest
  docker compose up -d --no-build --no-deps --force-recreate gvb-web gvb-server 2>&1 | tail -3
  sleep 10
  echo "after rollback: web=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:8081/) status_api=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:8765/api/front/status)"
  echo "DEPLOY_ROLLED_BACK"
  exit 4
fi

say "5. post checks"
# 前台对不存在的路径会回首页(SPA 兜底), 所以已删除的封面仍返回 200, 看类型是不是图片才准
echo "tomato cover -> $(curl -s -o /dev/null -w '%{http_code} %{content_type}' --max-time 5 http://127.0.0.1:8081/covers/tomato.svg) (expect text/html: file removed)"
echo "admin page   -> $(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:8081/admin/) (expect 200)"
echo "project list -> $(curl -s --max-time 8 http://127.0.0.1:8765/api/front/project/list)"
echo "ai check     -> $(curl -s --max-time 40 -X POST -H 'Content-Type: application/json' -d '{"question":"你有番茄专注这个项目吗"}' http://127.0.0.1:8765/api/front/ai/chat)"
echo "DEPLOY_OK"
