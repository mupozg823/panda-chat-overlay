#!/bin/bash
cd "$(dirname "$0")"

PORT="${PORT:-4173}"

open_browser() {
    (sleep 1; open "http://127.0.0.1:${PORT}") >/dev/null 2>&1 &
}

# 1차: Node.js
if command -v node >/dev/null 2>&1; then
    echo "[Panda Chat Overlay] Node.js 서버로 시작합니다..."
    echo "http://127.0.0.1:${PORT}"
    open_browser
    exec node scripts/serve.js "${PORT}"
fi

# 2차: Python3
if command -v python3 >/dev/null 2>&1; then
    echo "[Panda Chat Overlay] Python3 서버로 시작합니다..."
    echo "http://127.0.0.1:${PORT}"
    open_browser
    exec python3 -m http.server "${PORT}" --bind 127.0.0.1
fi

# 3차: Python2
if command -v python >/dev/null 2>&1; then
    echo "[Panda Chat Overlay] Python 서버로 시작합니다..."
    echo "http://127.0.0.1:${PORT}"
    open_browser
    exec python -m http.server "${PORT}" --bind 127.0.0.1 2>/dev/null || \
    exec python -m SimpleHTTPServer "${PORT}"
fi

# 4차: HTML 직접 열기
echo "[Panda Chat Overlay] Node/Python이 없어 HTML을 직접 엽니다."
echo "대부분의 기능은 정상 동작하지만 일부 기능이 제한될 수 있습니다."
open "overlay-settings.html"
