# StudyOS — start both frontend and backend
# Usage: .\start.ps1

Write-Host "Starting StudyOS..." -ForegroundColor Cyan

# Check for .env in api
if (-not (Test-Path "apps\api\.env")) {
    if (Test-Path "apps\api\.env.example") {
        Copy-Item "apps\api\.env.example" "apps\api\.env"
        Write-Host "Created apps/api/.env from example — add your ANTHROPIC_API_KEY" -ForegroundColor Yellow
    }
}

# Start API in background
$api = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\api'; npm run dev" -PassThru -WindowStyle Normal

# Start web dev server
Write-Host "API started (PID $($api.Id)). Starting web..." -ForegroundColor Green
Set-Location apps\web
npm run dev
