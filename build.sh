#!/bin/bash
# ASP.NET Core File Manager Build Script (Linux/Mac)
# This script builds the project, runs tests, and creates NuGet package

CONFIGURATION="${1:-Release}"
VERSION="${2:-1.0.0}"

echo "================================================"
echo "ASP.NET Core File Manager Build Script"
echo "================================================"
echo ""

# Clean previous builds
echo "Cleaning previous builds..."
dotnet clean -c $CONFIGURATION
if [ $? -ne 0 ]; then
    echo "Clean failed!"
    exit 1
fi

# Restore dependencies
echo ""
echo "Restoring dependencies..."
dotnet restore
if [ $? -ne 0 ]; then
    echo "Restore failed!"
    exit 1
fi

# Build solution
echo ""
echo "Building solution..."
dotnet build -c $CONFIGURATION --no-restore
if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

# Run tests
echo ""
echo "Running tests..."
dotnet test -c $CONFIGURATION --no-build --verbosity normal
if [ $? -ne 0 ]; then
    echo "Tests failed!"
    exit 1
fi

# Create NuGet package
echo ""
echo "Creating NuGet package..."
dotnet pack src/AspNetCoreFileManager/AspNetCoreFileManager.csproj -c $CONFIGURATION --no-build -o ./artifacts -p:PackageVersion=$VERSION
if [ $? -ne 0 ]; then
    echo "Package creation failed!"
    exit 1
fi

# Success
echo ""
echo "================================================"
echo "Build completed successfully!"
echo "================================================"
echo ""
echo "NuGet package created in ./artifacts/"
echo "Version: $VERSION"

