#!/bin/bash
# v3.47 部署重试 (SSH 频率防护窗口: 每 10 分钟一次稀疏重试, 最多 6 次)
# 传输成功后远端一次性完成: rollback tag -> load -> latest -> compose up -> 验证
TARBALL="/c/Users/DKX/AppData/Local/Temp/gvb-web-v347.tar.gz"

for i in 1 2 3 4 5 6; do
  echo "=== 第 $i 次尝试 $(date '+%T') ==="
  if scp -o ConnectTimeout=20 "$TARBALL" root@47.121.119.191:/tmp/gvb-web-v347.tar.gz; then
    echo "传输成功, 执行远端部署..."
    ssh -o ConnectTimeout=20 root@47.121.119.191 'set -e
      docker tag start-gvb-web:latest start-gvb-web:rollback-v348 2>/dev/null || true
      docker load < /tmp/gvb-web-v347.tar.gz
      docker tag start-gvb-web:v3.47 start-gvb-web:latest
      cd /opt/blog/deploy/start && docker compose up -d gvb-web
      sleep 3
      echo "== 容器状态 =="
      docker ps --filter name=gvb-web --format "{{.Names}} {{.Status}}"
      echo "== 新产物验证 =="
      curl -s http://127.0.0.1:8081/ | grep -o "index-[A-Za-z0-9_-]*\.js" | head -1
      rm -f /tmp/gvb-web-v347.tar.gz'
    echo "=== v3.47 部署完成 ==="
    exit 0
  fi
  [ "$i" -lt 6 ] && sleep 600
done
echo "=== 6 次均失败, SSH 仍被防护, 需人工检查宝塔面板 ==="
exit 1
