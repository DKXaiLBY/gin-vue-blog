#!/bin/bash
# v3.49 服务器侧证书签发脚本 (lbyaidkx.top)
# 在服务器上以 root 执行: bash /tmp/server-install-cert.sh
set -e

echo "== 1. 获取 acme.sh (Gitee 镜像, get.acme.sh 被墙) =="
if [ ! -f /root/.acme.sh/acme.sh ]; then
  cd /opt
  [ -d acme.sh ] || git clone --depth 1 https://gitee.com/neilpang/acme.sh.git
  cd acme.sh
  sh acme.sh --install --home /root/.acme.sh -m dkxailby@lbyaidkx.top 2>&1 | tail -3
else
  echo "acme.sh 已安装, 跳过"
fi
ACME=/root/.acme.sh/acme.sh

echo "== 2. webroot 验证目录 =="
mkdir -p /www/wwwroot/well-known/lbyaidkx.top

echo "== 3. 签发证书 (Let's Encrypt, HTTP-01, 双域名) =="
$ACME --issue --webroot /www/wwwroot/well-known/lbyaidkx.top \
  -d lbyaidkx.top -d www.lbyaidkx.top 2>&1 | tail -8

echo "== 4. 安装证书到稳定路径 + 自动续期后 reload nginx =="
mkdir -p /www/server/ssl/lbyaidkx.top
$ACME --install-cert -d lbyaidkx.top -d www.lbyaidkx.top \
  --fullchain-file /www/server/ssl/lbyaidkx.top/fullchain.pem \
  --key-file /www/server/ssl/lbyaidkx.top/key.pem \
  --reloadcmd "nginx -s reload" 2>&1 | tail -3

echo "== 5. 结果 =="
ls -la /www/server/ssl/lbyaidkx.top/
openssl x509 -in /www/server/ssl/lbyaidkx.top/fullchain.pem -noout -subject -dates
