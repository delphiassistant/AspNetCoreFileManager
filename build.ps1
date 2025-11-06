# ASP.NET Core File Manager Build Script
# This script builds the project, runs tests, and creates NuGet package

param(
    [string]$Configuration = "Release",
    [string]$Version = "1.0.0"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "ASP.NET Core File Manager Build Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
dotnet clean -c $Configuration
if ($LASTEXITCODE -ne 0) {
    Write-Host "Clean failed!" -ForegroundColor Red
    exit 1
}

# Restore dependencies
Write-Host ""
Write-Host "Restoring dependencies..." -ForegroundColor Yellow
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "Restore failed!" -ForegroundColor Red
    exit 1
}

# Build solution
Write-Host ""
Write-Host "Building solution..." -ForegroundColor Yellow
dotnet build -c $Configuration --no-restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Run tests
Write-Host ""
Write-Host "Running tests..." -ForegroundColor Yellow
dotnet test -c $Configuration --no-build --verbosity normal
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests failed!" -ForegroundColor Red
    exit 1
}

# Create NuGet package
Write-Host ""
Write-Host "Creating NuGet package..." -ForegroundColor Yellow
dotnet pack src/AspNetCoreFileManager/AspNetCoreFileManager.csproj -c $Configuration --no-build -o ./artifacts -p:PackageVersion=$Version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Package creation failed!" -ForegroundColor Red
    exit 1
}

# Success
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "NuGet package created in ./artifacts/" -ForegroundColor Green
Write-Host "Version: $Version" -ForegroundColor Green

