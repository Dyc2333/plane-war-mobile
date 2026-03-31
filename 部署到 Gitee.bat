@echo off
chcp 65001 >nul
echo ========================================
echo    飞机大战手机端 - 部署到 Gitee
echo ========================================
echo.

set /p GITEE_USER="请输入你的 Gitee 用户名："
set /p REPO_NAME="请输入仓库名称 (默认 plane-war-mobile)："

if "%REPO_NAME%"=="" set REPO_NAME=plane-war-mobile

echo.
echo ========================================
echo 步骤 1: 请先在 Gitee 创建仓库
echo ========================================
echo 1. 访问 https://gitee.com
echo 2. 登录你的账号：%GITEE_USER%
echo 3. 创建新仓库：%REPO_NAME%
echo 4. 不要初始化 README
echo.
echo 创建完成后按任意键继续...
pause >nul

echo.
echo ========================================
echo 步骤 2: 配置远程仓库并推送
echo ========================================

cd /d "%~dp0"

REM 删除已存在的 remote
git remote remove origin 2>nul

REM 添加新的 remote
git remote add origin https://gitee.com/%GITEE_USER%/%REPO_NAME%.git

echo.
echo 正在推送代码到 Gitee...
echo 注意：如果提示需要密码，请输入你的 Gitee 密码
echo.

git push -u origin master

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ 推送成功！
    echo ========================================
    echo.
    echo 步骤 3: 开启 Gitee Pages
    echo.
    echo 1. 访问你的仓库：https://gitee.com/%GITEE_USER%/%REPO_NAME%
    echo 2. 点击 "设置" → "Pages"
    echo 3. 源分支选择 "master"，目录选择 "/root"
    echo 4. 点击保存
    echo.
    echo 部署成功后访问地址：
    echo https://%GITEE_USER%.gitee.io/%REPO_NAME%/
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ 推送失败
    echo ========================================
    echo 请检查：
    echo 1. Gitee 用户名是否正确
    echo 2. 仓库是否已创建
    echo 3. 网络连接是否正常
    echo.
)

pause
