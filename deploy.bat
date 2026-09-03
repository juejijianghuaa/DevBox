@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set MSG=%*
if "%MSG%"=="" set MSG=update: %date% %time%

echo ========================================
echo   DevBox 一键打包、推送 GitHub 并发布 Cloudflare
echo ========================================
echo.

echo [1/4] 暂存所有改动...
git add .

echo [2/4] 提交版本: "%MSG%"...
git commit -m "%MSG%"

echo [3/4] 推送到 GitHub...
git push origin main

echo [4/4] 编译并部署到 Cloudflare Pages...
call pnpm build
call npx wrangler pages deploy out --project-name devbox --commit-dirty=true

echo.
echo ========================================
echo   🎉 全流程完成！
echo   公网访问地址: https://devbox-e1z.pages.dev
echo ========================================
echo.
