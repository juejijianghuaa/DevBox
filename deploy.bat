@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set MSG=%*
if "%MSG%"=="" set MSG=update: %date% %time%

echo ========================================
echo   DevBox 一键打包与推送部署
echo ========================================
echo.

echo [1/3] 暂存所有改动...
git add .

echo [2/3] 提交改动: "%MSG%"...
git commit -m "%MSG%"

echo [3/3] 推送到远程 GitHub...
git push origin main

echo.
echo ========================================
echo   ✔ 代码已成功推送至 GitHub！
echo ========================================
echo.
