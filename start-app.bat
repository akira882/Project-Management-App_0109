@echo off
title 電気工事業務アプリ - 起動中...
cd /d "%~dp0"
echo.
echo ========================================
echo   電気工事業務管理アプリ
echo   起動しています...
echo ========================================
echo.

REM Webアプリのディレクトリに移動
cd apps\web

REM 開発サーバーを起動
echo アプリを起動中です。しばらくお待ちください...
echo.
start http://localhost:3000
pnpm dev

pause
