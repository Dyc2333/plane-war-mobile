@echo off
chcp 65001 >nul
echo ========================================
echo    GitHub Pages 部署脚本
echo ========================================
echo.

echo 正在配置 GitHub 凭据...
echo.

:: 设置 Git 用户名和邮箱
git config --global user.name "289686387"
git config --global user.email "289686387@qq.com"

:: 创建凭据存储
echo 请输入你的 GitHub 密码:
set /p GITHUB_PASSWORD=

echo.
echo 正在推送到 GitHub...
echo.

:: 使用密码推送
cd /d "C:\Users\Administrator\IdeaProjects\claude-workspace\飞机大战手机端"

:: 使用 HTTPS 方式推送，包含密码
git push https://289686387:%GITHUB_PASSWORD%@github.com/289686387/plane-war-mobile.git master

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ 推送成功！
    echo ========================================
    echo.
    echo 下一步：
    echo 1. 访问 https://github.com/289686387/plane-war-mobile
    echo 2. 点击 Settings → Pages
    echo 3. 在 Source 中选择 Branch: main 或 master
    echo 4. 点击 Save
    echo.
    echo 部署成功后访问地址：
    echo https://289686387.github.io/plane-war-mobile/
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ 推送失败
    echo ========================================
    echo 请检查：
    echo 1. GitHub 用户名是否正确
    echo 2. 密码是否正确（可能需要使用 Personal Access Token）
    echo 3. 仓库是否已创建
    echo.
)

pause
