#!/bin/bash
# v3.51.1 构建脚本 (无本机 Docker 版)
# 背景: 本机 Docker Desktop 安装损坏(缺 docker-desktop.iso), 镜像改在服务器上基于线上现有镜像增量打包。
# 本脚本负责: 前端产物 + 后端 linux 二进制在本地编译 -> 特征校验 -> 组装部署包
# 之后用一条连接把部署包传上去并执行:
#   tar -czf - --owner=0 --group=0 -C <输出目录>/pkg . | ssh root@<server> \
#     'mkdir -p /opt/blog/deploy/v3511 && tar -xzf - -C /opt/blog/deploy/v3511 && bash /opt/blog/deploy/v3511/deploy.sh <ENTRY>'
# 用法: bash scripts/v3511-build.sh [输出目录]   (默认 /d/Projects/Personal/blog-server-ops/v3511)
set -e
cd "$(dirname "$0")/.."
export PATH="$PATH:/c/Users/DKX/AppData/Local/Programs/go/bin"
OUT="${1:-/d/Projects/Personal/blog-server-ops/v3511}"

# ---------- 前端 ----------
(cd gin-blog-front && ~/.local/bin/pnpm build)
rm -rf deploy/build/web/dist_blog
mkdir -p deploy/build/web/dist_blog
cp -r gin-blog-front/dist/. deploy/build/web/dist_blog/
# 正向: v3.51 的两项功能必须还在
grep -rl "项目详情" deploy/build/web/dist_blog/assets/*.js > /dev/null || { echo "DETAIL_MODAL_MISSING"; exit 1; }
grep -rl "二维码生成失败" deploy/build/web/dist_blog/assets/*.js > /dev/null || { echo "RACE_FIX_MISSING"; exit 1; }
# 反向: 番茄内容不得出现在产物里 (只查项目名与封面路径; 裸 "tomato" 会误中图形库颜色表里的 TOMATO 色)
if grep -rl "番茄专注" deploy/build/web/dist_blog/assets/ > /dev/null; then
  echo "TOMATO_STILL_IN_DIST"; grep -rl "番茄专注" deploy/build/web/dist_blog/assets/ | head -5; exit 1
fi
if grep -rl "covers/tomato" deploy/build/web/dist_blog/assets/ > /dev/null; then
  echo "TOMATO_COVER_REF_IN_DIST"; exit 1
fi
[ ! -e deploy/build/web/dist_blog/covers/tomato.svg ] || { echo "TOMATO_COVER_EXISTS"; exit 1; }
ENTRY=$(grep -oE "index-[A-Za-z0-9_-]+\.js" deploy/build/web/dist_blog/index.html | head -1)
[ -n "$ENTRY" ] || { echo "ENTRY_NOT_FOUND"; exit 1; }

# ---------- 后端 (与 Dockerfile 同样在 ./cmd 下构建, 目标 linux/amd64 静态二进制) ----------
rm -rf "$OUT/pkg"
mkdir -p "$OUT/pkg/web/dist_blog" "$OUT/pkg/server"
(cd gin-blog-server && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 GOPROXY=https://goproxy.cn,direct \
  go build -trimpath -ldflags="-s -w" -o "$OUT/pkg/server/server" ./cmd)
grep -q "LoveGirl、SparkKeeper、本博客" "$OUT/pkg/server/server" || { echo "SERVER_PROMPT_NOT_UPDATED"; exit 1; }
if grep -q "番茄专注" "$OUT/pkg/server/server"; then echo "TOMATO_STILL_IN_SERVER"; exit 1; fi

# ---------- 组装部署包 ----------
cp -r deploy/build/web/dist_blog/. "$OUT/pkg/web/dist_blog/"
cp deploy/build/web/Dockerfile.overlay "$OUT/pkg/web/Dockerfile"
cp deploy/build/server/Dockerfile.overlay "$OUT/pkg/server/Dockerfile"
cp scripts/v3511-remote-deploy.sh "$OUT/pkg/deploy.sh"

echo "server binary: $(stat -c %s "$OUT/pkg/server/server") bytes"
echo "package: $(du -sh "$OUT/pkg" | cut -f1)"
echo "ENTRY=$ENTRY"
echo "BUILD_OK"
