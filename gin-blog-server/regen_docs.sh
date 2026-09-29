#!/bin/sh
# 重新生成 Swagger 文档 (与 swag_init.sh 相同), 提交生成结果
cd "$(dirname "$0")"
export PATH="$HOME/go/bin:$PATH"
export GOPROXY=https://goproxy.cn,direct
swag init -g ./cmd/main.go
