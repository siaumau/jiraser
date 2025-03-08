@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title Jira API 工具

REM 創建日誌目錄
if not exist logs mkdir logs

REM 設定日誌檔案名稱（包含日期和時間）
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set LOGFILE=logs\jira-tool-%TIMESTAMP%.log

REM 記錄啟動時間
echo [%date% %time%] Jira API 工具開始執行 > "%LOGFILE%"

:MAIN_MENU
cls
echo ===== Jira API 工具 =====
echo.
echo 請選擇操作:
echo [1] 安裝必要套件
echo [2] 啟動 Web 服務
echo [3] 執行範例查詢
echo [4] 查詢活躍的 Sprint
echo [5] 查詢特定 Sprint 中的問題
echo [6] 查詢特定問題的詳細資訊
echo [7] 檢查環境設定
echo [8] 查看日誌檔案
echo [0] 退出
echo.
echo 當前日誌檔案: %LOGFILE%
echo.
set /p choice=請輸入選項編號:

echo [%date% %time%] 用戶選擇選項: %choice% >> "%LOGFILE%"

if "%choice%"=="1" goto INSTALL_PACKAGES
if "%choice%"=="2" goto START_SERVER
if "%choice%"=="3" goto RUN_EXAMPLES
if "%choice%"=="4" goto ACTIVE_SPRINTS
if "%choice%"=="5" goto SPRINT_ISSUES
if "%choice%"=="6" goto ISSUE_DETAILS
if "%choice%"=="7" goto CHECK_ENV
if "%choice%"=="8" goto VIEW_LOGS
if "%choice%"=="0" goto EXIT
echo 無效的選項，請重新選擇。
echo [%date% %time%] 無效的選項: %choice% >> "%LOGFILE%"
timeout /t 2 >nul
goto MAIN_MENU

:INSTALL_PACKAGES
cls
echo ===== 安裝必要套件 =====
echo.
REM 檢查 Node.js 是否已安裝
echo [資訊] 檢查 Node.js 是否已安裝...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [錯誤] 未找到 Node.js。請先安裝 Node.js 後再運行此批次檔。
    echo 您可以從 https://nodejs.org/ 下載並安裝 Node.js。
    echo [%date% %time%] 錯誤: 未找到 Node.js >> "%LOGFILE%"
    pause
    goto MAIN_MENU
)

echo [資訊] 正在安裝必要的套件...
echo [%date% %time%] 開始安裝必要套件 >> "%LOGFILE%"
call npm install >> "%LOGFILE%" 2>&1
if %ERRORLEVEL% neq 0 (
    echo [錯誤] 安裝套件時出錯。請檢查網絡連接或套件配置。
    echo [%date% %time%] 錯誤: 安裝套件失敗，錯誤碼 %ERRORLEVEL% >> "%LOGFILE%"
    echo 詳細錯誤信息請查看日誌檔案: %LOGFILE%
    pause
    goto MAIN_MENU
)
echo [成功] 套件安裝完成。
echo [%date% %time%] 套件安裝完成 >> "%LOGFILE%"
pause
goto MAIN_MENU

:START_SERVER
cls
echo ===== 啟動 Web 服務 =====
echo.
echo [資訊] 正在啟動 Jira API 服務...
echo [資訊] 服務啟動後，您可以訪問 http://localhost:3000 使用網頁界面。
echo [資訊] 按 Ctrl+C 可以停止服務，然後按任意鍵返回主選單。
echo [資訊] 啟動日誌將記錄在: %LOGFILE%
echo.
echo [%date% %time%] 開始啟動 Jira API 服務 >> "%LOGFILE%"
call npm run server >> "%LOGFILE%" 2>&1
echo.
echo [%date% %time%] 服務已停止 >> "%LOGFILE%"
echo [資訊] 服務已停止。
echo [資訊] 完整日誌已保存至: %LOGFILE%
pause
goto MAIN_MENU

:RUN_EXAMPLES
cls
echo ===== 執行範例查詢 =====
echo.
echo [資訊] 正在執行範例查詢...
echo [%date% %time%] 開始執行範例查詢 >> "%LOGFILE%"
call npm run examples >> "%LOGFILE%" 2>&1
echo.
echo [%date% %time%] 範例查詢已完成 >> "%LOGFILE%"
echo [資訊] 範例查詢已完成。
echo [資訊] 完整日誌已保存至: %LOGFILE%
pause
goto MAIN_MENU

:ACTIVE_SPRINTS
cls
echo ===== 查詢活躍的 Sprint =====
echo.
echo [資訊] 正在查詢活躍的 Sprint...
echo [%date% %time%] 開始查詢活躍的 Sprint >> "%LOGFILE%"
call npm run active-sprints >> "%LOGFILE%" 2>&1
echo.
echo [%date% %time%] 查詢活躍的 Sprint 已完成 >> "%LOGFILE%"
echo [資訊] 查詢已完成。
echo [資訊] 完整日誌已保存至: %LOGFILE%
pause
goto MAIN_MENU

:SPRINT_ISSUES
cls
echo ===== 查詢特定 Sprint 中的問題 =====
echo.
set /p sprint_name=請輸入 Sprint 名稱 (例如: Sprint 10):
echo [資訊] 正在查詢 %sprint_name% 中的問題...
echo [%date% %time%] 開始查詢 Sprint "%sprint_name%" 中的問題 >> "%LOGFILE%"
call npm run sprint-issues "%sprint_name%" >> "%LOGFILE%" 2>&1
echo.
echo [%date% %time%] 查詢 Sprint "%sprint_name%" 中的問題已完成 >> "%LOGFILE%"
echo [資訊] 查詢已完成。
echo [資訊] 完整日誌已保存至: %LOGFILE%
pause
goto MAIN_MENU

:ISSUE_DETAILS
cls
echo ===== 查詢特定問題的詳細資訊 =====
echo.
set /p issue_key=請輸入問題金鑰 (例如: TWIT-123):
echo [資訊] 正在查詢問題 %issue_key% 的詳細資訊...
echo [%date% %time%] 開始查詢問題 "%issue_key%" 的詳細資訊 >> "%LOGFILE%"
call npm run issue-details "%issue_key%" >> "%LOGFILE%" 2>&1
echo.
echo [%date% %time%] 查詢問題 "%issue_key%" 的詳細資訊已完成 >> "%LOGFILE%"
echo [資訊] 查詢已完成。
echo [資訊] 完整日誌已保存至: %LOGFILE%
pause
goto MAIN_MENU

:CHECK_ENV
cls
echo ===== 檢查環境設定 =====
echo.
echo [資訊] 檢查 .env 檔案...
echo [%date% %time%] 開始檢查環境設定 >> "%LOGFILE%"
if not exist .env (
    echo [警告] 未找到 .env 檔案。請確保您已正確設定環境變數。
    echo [%date% %time%] 警告: 未找到 .env 檔案 >> "%LOGFILE%"
) else (
    echo [成功] 找到 .env 檔案。
    echo [資訊] .env 檔案內容:
    type .env
    echo [%date% %time%] .env 檔案存在 >> "%LOGFILE%"
)
echo.
echo [資訊] Node.js 版本:
node -v
for /f "tokens=*" %%i in ('node -v') do (
    echo [%date% %time%] Node.js 版本: %%i >> "%LOGFILE%"
)
echo [資訊] npm 版本:
npm -v
for /f "tokens=*" %%i in ('npm -v') do (
    echo [%date% %time%] npm 版本: %%i >> "%LOGFILE%"
)
echo.
echo [%date% %time%] 環境檢查完成 >> "%LOGFILE%"
pause
goto MAIN_MENU

:VIEW_LOGS
cls
echo ===== 查看日誌檔案 =====
echo.
echo 日誌目錄中的檔案:
dir /b /o-d logs\*.log
echo.
set /p log_file=請輸入要查看的日誌檔案名稱 (直接按 Enter 查看當前日誌):

if "%log_file%"=="" (
    set log_to_view=%LOGFILE%
) else (
    set log_to_view=logs\%log_file%
)

if not exist "%log_to_view%" (
    echo [錯誤] 找不到指定的日誌檔案: %log_to_view%
    pause
    goto MAIN_MENU
)

echo.
echo ===== 日誌檔案內容: %log_to_view% =====
echo.
type "%log_to_view%"
echo.
echo ===== 日誌檔案結束 =====
echo.
pause
goto MAIN_MENU

:EXIT
cls
echo 感謝使用 Jira API 工具！
echo [%date% %time%] 用戶退出程式 >> "%LOGFILE%"
timeout /t 2 >nul
exit /b 0
