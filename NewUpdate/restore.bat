@echo off
:: Set MongoDB tools path
set MONGO_TOOLS_PATH="C:\Program Files\MongoDB\Tools\100\bin"

:: Get the latest backup directory (based on the latest date format)
for /f "delims=" %%i in ('dir /b /ad "D:\BackUp\MongoDB\" ^| sort /r') do (
    set "LATEST_BACKUP=%%i"
    goto :restore
)

:restore
if "%LATEST_BACKUP%"=="" (
    echo No backup found in D:\BackUp\MongoDB\
    pause
    exit /b
)

echo Restoring from backup: D:\BackUp\MongoDB\%LATEST_BACKUP%

:: Explicitly call mongorestore with full path
%MONGO_TOOLS_PATH%\mongorestore --dir "D:\BackUp\MongoDB\%LATEST_BACKUP%"

echo Restore completed.
pause
