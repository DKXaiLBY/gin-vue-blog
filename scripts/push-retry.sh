#!/bin/bash
# 家宽阻断重试推送: 失败等 150s 再试, 最多 10 次 (handoff 陷阱 #8)
cd "D:/Projects/Personal/blog"
for i in 1 2 3 4 5 6 7 8 9 10; do
  if git push origin main --tags 2>/dev/null; then
    echo "push 成功 (第 $i 次尝试)"
    exit 0
  fi
  echo "第 $i 次失败, 等待 150s 重试..."
  sleep 150
done
echo "10 次均失败, 放弃本轮推送"
exit 1
