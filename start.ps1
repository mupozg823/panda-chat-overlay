$ErrorActionPreference = "SilentlyContinue"
Set-Location $PSScriptRoot
$Port = 4173

# 1차: Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "[Panda Chat Overlay] Node.js 서버로 시작합니다..." -ForegroundColor Cyan
    Write-Host "http://127.0.0.1:$Port"
    Start-Process "http://127.0.0.1:$Port"
    node scripts/serve.js $Port
    exit
}

# 2차: Python
$py = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" }
      elseif (Get-Command python -ErrorAction SilentlyContinue) { "python" }
      else { $null }

if ($py) {
    Write-Host "[Panda Chat Overlay] Python 서버로 시작합니다..." -ForegroundColor Cyan
    Write-Host "http://127.0.0.1:$Port"
    Start-Process "http://127.0.0.1:$Port"
    & $py -m http.server $Port --bind 127.0.0.1
    exit
}

# 3차: HTML 직접 열기
Write-Host "[Panda Chat Overlay] Node/Python이 없어 HTML을 직접 엽니다." -ForegroundColor Yellow
Start-Process (Join-Path $PSScriptRoot "overlay-settings.html")
