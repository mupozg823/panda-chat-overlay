@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"

set PORT=4173

:: 1차: Node.js 시도
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [Panda Chat Overlay] Node.js 서버로 시작합니다...
    echo http://127.0.0.1:%PORT%
    start "" "http://127.0.0.1:%PORT%"
    node scripts\serve.js %PORT%
    goto :eof
)

:: 2차: Python 시도
where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [Panda Chat Overlay] Python 서버로 시작합니다...
    echo http://127.0.0.1:%PORT%
    start "" "http://127.0.0.1:%PORT%"
    python -m http.server %PORT% --bind 127.0.0.1
    goto :eof
)

where python3 >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [Panda Chat Overlay] Python3 서버로 시작합니다...
    echo http://127.0.0.1:%PORT%
    start "" "http://127.0.0.1:%PORT%"
    python3 -m http.server %PORT% --bind 127.0.0.1
    goto :eof
)

:: 3차: 서버 없이 HTML 직접 열기
echo [Panda Chat Overlay] Node/Python이 없어 HTML을 직접 엽니다.
echo 대부분의 기능은 정상 동작하지만 일부 기능이 제한될 수 있습니다.
start "" "%~dp0overlay-settings.html"
