Write-Host "=== Test de la Stack Docker Compose ===" -ForegroundColor Green

Write-Host "`n1. État des conteneurs:" -ForegroundColor Yellow
docker compose ps

Write-Host "`n2. Test Backend:" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET
Write-Host "Backend Status: $($response.StatusCode)" -ForegroundColor Green

Write-Host "`n3. Test Frontend:" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET
Write-Host "Frontend Status: $($response.StatusCode)" -ForegroundColor Green

Write-Host "`n4. Test pgAdmin:" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:5050" -Method GET
Write-Host "pgAdmin Status: $($response.StatusCode)" -ForegroundColor Green

Write-Host "`n=== Accès aux services ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "pgAdmin: http://localhost:5050" -ForegroundColor Cyan
