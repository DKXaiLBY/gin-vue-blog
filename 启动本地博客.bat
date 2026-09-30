@echo off
chcp 65001 >nul
title 启动本地博客
echo ============================================
echo   启动本地博客（Docker 全栈）
echo ============================================
echo.
echo [1/3] 启动 Docker Desktop...
start "" "C:\Users\DKX\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"

echo [2/3] 等待 Docker 引擎就绪（首次约 30~60 秒）...
:wait
docker info >nul 2>&1 && goto ready
timeout /t 5 /nobreak >nul
goto wait

:ready
echo [3/3] 拉起博客四件套（nginx + 后端 + MySQL + Redis）...
cd /d D:\Projects\Personal\blog\deploy\start
docker compose up -d

echo.
echo ============================================
echo   本地博客已启动:  http://localhost/
echo   本地管理后台:    http://localhost/admin/
echo   关闭方式: 双击 停止本地博客.bat
echo ============================================
start http://localhost/
pause
