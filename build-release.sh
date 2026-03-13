#!/bin/bash
# 배포용 ZIP 파일 생성 스크립트
cd "$(dirname "$0")"

VERSION="0.2.0"
RELEASE_NAME="panda-chat-overlay-v${VERSION}"
OUT_DIR="dist"

mkdir -p "$OUT_DIR"

# 기존 ZIP 제거
rm -f "${OUT_DIR}/${RELEASE_NAME}.zip"

# 배포에 포함할 파일만 ZIP으로 묶기
zip -r "${OUT_DIR}/${RELEASE_NAME}.zip" \
  "overlay-settings.html" \
  "overlay.css" \
  "index.html" \
  "start.bat" \
  "start.command" \
  "start.ps1" \
  "scripts/serve.js" \
  "package.json" \
  "assets/character_icon.png" \
  "assets/reference-chat.png" \
  "README.md" \
  -x "*.DS_Store" "*.log" "*_original*"

echo ""
echo "=== 배포 파일 생성 완료 ==="
echo "경로: ${OUT_DIR}/${RELEASE_NAME}.zip"
ls -lh "${OUT_DIR}/${RELEASE_NAME}.zip"
echo ""
echo "사용자 안내:"
echo "  - ZIP 압축 해제 후 start.bat(Win) / start.command(Mac) 더블클릭"
echo "  - Node/Python 없어도 overlay-settings.html 직접 열기 가능"
