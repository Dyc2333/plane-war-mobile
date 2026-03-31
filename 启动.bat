@echo off
chcp 65001 >nul
echo ========================================
echo    飞机大战手机端 - 快速启动
echo ========================================
echo.
echo 正在启动本地服务器...
echo.
echo 请在手机浏览器访问：
echo http://127.0.0.1:8000
echo.
echo 或者在同一局域网的其他设备访问：
echo http://[你的电脑 IP]:8000
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

python -m http.server 8000

pause
