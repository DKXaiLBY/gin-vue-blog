#!/bin/bash
# v3.51 部署稀疏重试 (SSH 频率防护: 10 分钟一次, 最多 4 次)
for i in 1 2 3 4; do
  echo "=== 第 $i 次尝试 $(date '+%T') ==="
  if bash "D:/Projects/Personal/blog/scripts/v351-deploy.sh" "D:/Projects/Personal/blog/deploy/tomato-download.html"; then
    echo "=== v3.51 部署成功 ==="
    exit 0
  fi
  [ "$i" -lt 4 ] && sleep 600
done
echo "=== 4 次均失败 ==="
exit 1
