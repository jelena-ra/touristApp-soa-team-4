# Simple Tours Service Test Script
# Pre testiranje, pokreni Tours servis u novom terminalu:
# go run ./cmd/main.go

Write-Host "🧪 Tours Service Test Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# 1. Proveri da li MongoDB radi
Write-Host "`n1️⃣ Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = netstat -an | findstr :27017
if ($mongoRunning) {
    Write-Host "✅ MongoDB is running on port 27017" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB is not running! Please start MongoDB first." -ForegroundColor Red
    exit 1
}

# 2. Proveri da li Stakeholders radi
Write-Host "`n2️⃣ Checking Stakeholders service..." -ForegroundColor Yellow
$stakeholdersRunning = netstat -an | findstr :8081
if ($stakeholdersRunning) {
    Write-Host "✅ Stakeholders service is running on port 8081" -ForegroundColor Green
} else {
    Write-Host "❌ Stakeholders service is not running! Please start it first." -ForegroundColor Red
    exit 1
}

# 3. Proveri da li Tours radi
Write-Host "`n3️⃣ Checking Tours service..." -ForegroundColor Yellow
$toursRunning = netstat -an | findstr :8083
if ($toursRunning) {
    Write-Host "✅ Tours service is running on port 8083" -ForegroundColor Green
} else {
    Write-Host "❌ Tours service is not running!" -ForegroundColor Red
    Write-Host "Please run in another terminal: go run ./cmd/main.go" -ForegroundColor Yellow
    exit 1
}

# 4. Test gRPC connection
Write-Host "`n4️⃣ Testing gRPC connection..." -ForegroundColor Yellow
try {
    # Test sa go test klijentom
    $result = & go run test_client.go 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All tests passed successfully!" -ForegroundColor Green
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host "❌ Tests failed:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running tests: $_" -ForegroundColor Red
}

Write-Host "`n🎉 Test completed!" -ForegroundColor Green