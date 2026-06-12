Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Launching Google Chrome in Debugging Mode" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "WARNING: Closing all existing Chrome windows..." -ForegroundColor Yellow
Write-Host "Make sure you are completely logged into JustDial, Facebook, etc." -ForegroundColor Yellow
Write-Host "Do not close the Chrome window that opens." -ForegroundColor Yellow
Write-Host ""

taskkill /F /IM chrome.exe /T 2>$null
Start-Sleep -Seconds 2

Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9222"

Write-Host "Chrome launched successfully!" -ForegroundColor Green
Write-Host "You can now return to the Gomandap Scraper Admin Panel." -ForegroundColor Green
Start-Sleep -Seconds 5
