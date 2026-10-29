#!/bin/bash
# v3.51 部署脚本: 传输镜像与番茄页 -> 服务器载入/重启/替换下载页 -> 远端验证
# 用法: bash scripts/v351-deploy.sh <tomato-download.html 路径>
set -e
HTML="$1"
[ -n "$HTML" ] && [ -f "$HTML" ] || { echo "HTML_PATH_MISSING"; exit 1; }
scp -o ConnectTimeout=20 /c/Users/DKX/AppData/Local/Temp/gvb-web-v351.tar.gz root@47.121.119.191:/tmp/gvb-web-v351.tar.gz
scp -o ConnectTimeout=20 "$HTML" root@47.121.119.191:/tmp/tomato-download.html
ssh -o ConnectTimeout=20 root@47.121.119.191 'set -e
cp /opt/tomato-server/public/download.html /opt/tomato-server/public/download.backup-v351.html 2>/dev/null || true
cp /tmp/tomato-download.html /opt/tomato-server/public/download.html
docker tag start-gvb-web:latest start-gvb-web:rollback-v350 2>/dev/null || true
docker load < /tmp/gvb-web-v351.tar.gz
docker tag start-gvb-web:v3.51 start-gvb-web:latest
cd /opt/blog/deploy/start && docker compose up -d --force-recreate gvb-web
sleep 3
rm -f /tmp/gvb-web-v351.tar.gz /tmp/tomato-download.html
curl -s -o /dev/null -w "tomato_page:%{http_code}\n" http://127.0.0.1:3000/download
curl -s -o /dev/null -w "cover_lovegirl:%{http_code}\n" http://127.0.0.1:8081/covers/lovegirl.svg
curl -s http://127.0.0.1:8081/ | grep -oE "index-[A-Za-z0-9_-]+\.js" | head -1'
echo DEPLOY_OK
