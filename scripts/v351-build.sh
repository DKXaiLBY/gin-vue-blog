#!/bin/bash
# v3.51 构建脚本: 前台产物重建 + 特征验证 + docker 镜像构建
set -e
cd "$(dirname "$0")/../gin-blog-front"
~/.local/bin/pnpm build
cd ..
rm -rf deploy/build/web/dist_blog
mkdir -p deploy/build/web/dist_blog
cp -r gin-blog-front/dist/. deploy/build/web/dist_blog/
# 特征验证: 详情弹窗与二维码竞态修复都必须在产物里
grep -rl "项目详情" deploy/build/web/dist_blog/assets/*.js > /dev/null || { echo "DETAIL_MODAL_MISSING"; exit 1; }
grep -rl "二维码生成失败" deploy/build/web/dist_blog/assets/*.js > /dev/null || { echo "RACE_FIX_MISSING"; exit 1; }
docker build -q -t start-gvb-web:v3.51 -t start-gvb-web:latest deploy/build/web
docker save start-gvb-web:v3.51 | gzip > /c/Users/DKX/AppData/Local/Temp/gvb-web-v351.tar.gz
echo BUILD_OK
