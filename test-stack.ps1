# Script de test pour vérifier que toute la stack fonctionne
Write-Host "=== Test de la Stack Docker Compose ===" -ForegroundColor Green

# Test 1: Vérifier que tous les conteneurs sont en cours d'exécution
Write-Host "`n1. Vérification de l'état des conteneurs..." -ForegroundColor Yellow
docker compose ps

# Test 2: Tester l'endpoint de santé du backend
Write-Host "`n2. Test de l'endpoint de santé du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET
    Write-Host "✓ Backend répond: $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "  Message: $($content.message)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Erreur backend: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Tester l'accès au frontend
Write-Host "`n3. Test de l'accès au frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET
    Write-Host "✓ Frontend répond: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur frontend: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Tester l'accès à pgAdmin
Write-Host "`n4. Test de l'accès à pgAdmin..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5050" -Method GET
    Write-Host "✓ pgAdmin répond: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur pgAdmin: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Tester la connexion à la base de données
Write-Host "`n5. Test de la connexion à la base de données..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/predictions" -Method GET
    Write-Host "✓ Base de données accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur base de données: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Résumé ===" -ForegroundColor Green
Write-Host "Frontend React: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend FastAPI: http://localhost:8000" -ForegroundColor Cyan
Write-Host "pgAdmin: http://localhost:5050" -ForegroundColor Cyan
Write-Host "PostgreSQL: localhost:5432" -ForegroundColor Cyan

Write-Host "`nPour se connecter à pgAdmin:" -ForegroundColor Yellow
Write-Host "- Email: admin@admin.com" -ForegroundColor White
Write-Host "- Password: admin_secure_password" -ForegroundColor White
Write-Host "- Serveur PostgreSQL:" -ForegroundColor White
Write-Host "  * Host: db" -ForegroundColor White
Write-Host "  * Port: 5432" -ForegroundColor White
Write-Host "  * Database: credit_dashboard" -ForegroundColor White
Write-Host "  * Username: postgres" -ForegroundColor White
Write-Host "  * Password: postgres" -ForegroundColor White
