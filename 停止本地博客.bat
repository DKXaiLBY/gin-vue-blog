@echo off
chcp 65001 >nul
title 停止本地博客
cd /d D:\Projects\Personal\blog\deploy\start
docker compose stop
echo.
echo 本地博客已停止（数据都保留在硬盘上，下次启动还在）。
pause
