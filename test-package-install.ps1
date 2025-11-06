# Quick Test Script for NuGet Package Installation

# Create a temporary test project
$testDir = Join-Path $env:TEMP "FileManagerTest_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "`n=== Creating Test Project ===" -ForegroundColor Cyan
Write-Host "Location: $testDir`n" -ForegroundColor Yellow

New-Item -ItemType Directory -Path $testDir -Force | Out-Null
Set-Location $testDir

# Create new ASP.NET Core MVC project
Write-Host "Creating new ASP.NET Core MVC project..." -ForegroundColor Cyan
dotnet new mvc -n TestFileManager
Set-Location TestFileManager

# Install the package
Write-Host "`n=== Installing Package ===" -ForegroundColor Cyan
$packageSource = "C:\Projects\AspNetCoreFileManager\src\AspNetCoreFileManager\bin\Release"
dotnet add package Barnamenevis.Net.AspNetCoreFileManager --version 1.0.7 --source $packageSource

# Build the project (triggers file copy)
Write-Host "`n=== Building Project (triggers file copy) ===" -ForegroundColor Cyan
dotnet build

# Check if files were copied
Write-Host "`n=== Verifying File Copy ===" -ForegroundColor Green
$targetPath = "wwwroot\lib\aspnetcorefilemanager"

if (Test-Path $targetPath) {
    Write-Host "✓ Folder created: $targetPath" -ForegroundColor Green
    
    Write-Host "`nFiles copied:" -ForegroundColor Cyan
    Get-ChildItem $targetPath -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "")
        Write-Host "  ✓ $relativePath" -ForegroundColor White
    }
    
    # Count files
    $fileCount = (Get-ChildItem $targetPath -Recurse -File).Count
    Write-Host "`n✅ SUCCESS: $fileCount files copied to wwwroot\lib\aspnetcorefilemanager\" -ForegroundColor Green
    
    # Check for expected files
    Write-Host "`nChecking for expected files:" -ForegroundColor Cyan
    $expectedFiles = @(
        "css\filemanager.css",
        "js\filemanager.js",
        "js\filemanager-i18n.js",
        "locales\en.json",
        "locales\fa.json"
    )
    
    foreach ($file in $expectedFiles) {
        $filePath = Join-Path $targetPath $file
        if (Test-Path $filePath) {
            Write-Host "  ✓ $file" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $file (MISSING)" -ForegroundColor Red
        }
    }
    
} else {
    Write-Host "✗ FAILED: Folder not created at $targetPath" -ForegroundColor Red
    Write-Host "`nChecking build output for errors..." -ForegroundColor Yellow
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "Test project location: $(Get-Location)" -ForegroundColor Yellow
Write-Host "`nTo clean up, run: Remove-Item '$testDir' -Recurse -Force" -ForegroundColor Gray
