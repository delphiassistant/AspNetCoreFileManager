# NuGet Package Guide

Complete guide for creating and publishing the AspNetCoreFileManager NuGet package.

## Package Information

- **Package ID**: `AspNetCoreFileManager`
- **Version**: 1.0.3
- **Target Framework**: .NET 8.0
- **License**: MIT
- **Tags**: aspnetcore, filemanager, file-manager, mvc, razor, zip

## What's Included in the Package

### 1. Assemblies
- `AspNetCoreFileManager.dll` - Main library with all services, controllers, and tag helpers

### 2. Static Assets (Auto-copied to consumer project)
```
wwwroot/lib/aspnetcorefilemanager/
├── css/
│   └── filemanager.css
└── js/
    ├── filemanager.js
    ├── filemanager-utils.js
    ├── filemanager-zip.js
    └── filemanager-events.js
```

### 3. Build Targets
- `AspNetCoreFileManager.targets` - MSBuild targets that auto-copy static files during build

### 4. Documentation
- `README.md` - Included in package for NuGet.org display

## Building the Package

### Local Build

```bash
# Build and create package
dotnet build src/AspNetCoreFileManager/AspNetCoreFileManager.csproj --configuration Release

# Package will be created at:
# src/AspNetCoreFileManager/bin/Release/AspNetCoreFileManager.1.0.3.nupkg
```

### Manual Pack (if GeneratePackageOnBuild is disabled)

```bash
dotnet pack src/AspNetCoreFileManager/AspNetCoreFileManager.csproj --configuration Release
```

## Testing the Package Locally

### 1. Create Local NuGet Source

```bash
# Create a local directory for packages
mkdir C:\LocalNuGet

# Add as NuGet source
dotnet nuget add source C:\LocalNuGet --name "LocalPackages"
```

### 2. Copy Package to Local Source

```powershell
Copy-Item "src\AspNetCoreFileManager\bin\Release\AspNetCoreFileManager.1.0.3.nupkg" "C:\LocalNuGet\"
```

### 3. Install in Test Project

```bash
cd YourTestProject
dotnet add package AspNetCoreFileManager --version 1.0.3 --source "LocalPackages"
```

### 4. Verify Installation

After installation and build, verify these files exist in your test project:

```
YourTestProject/
└── wwwroot/
    └── lib/
        └── aspnetcorefilemanager/
            ├── css/
            │   └── filemanager.css
            └── js/
                ├── filemanager.js
                ├── filemanager-utils.js
                ├── filemanager-zip.js
                └── filemanager-events.js
```

Check build output for messages:
```
Copying AspNetCoreFileManager assets from: ...
Copying AspNetCoreFileManager assets to: C:\YourTestProject\wwwroot\lib\aspnetcorefilemanager
AspNetCoreFileManager assets copied successfully!
```

## Publishing to NuGet.org

### 1. Get API Key

1. Go to https://www.nuget.org
2. Sign in
3. Go to Account Settings > API Keys
4. Create new API key with:
   - Key Name: `AspNetCoreFileManager`
   - Package Owner: Your account
   - Scopes: Push new packages and package versions
   - Glob Pattern: `AspNetCoreFileManager`

### 2. Push Package

```bash
# Push to NuGet.org
dotnet nuget push "src\AspNetCoreFileManager\bin\Release\AspNetCoreFileManager.1.0.3.nupkg" `
  --api-key YOUR_API_KEY `
  --source https://api.nuget.org/v3/index.json
```

### 3. Verify Publication

1. Wait 5-10 minutes for indexing
2. Check https://www.nuget.org/packages/AspNetCoreFileManager/
3. Verify version 1.0.3 is listed
4. Check package details, dependencies, and README

## Package Configuration Details

### Project File Structure

The `.csproj` file includes these key elements:

```xml
<!-- Package metadata -->
<PropertyGroup>
  <GeneratePackageOnBuild>true</GeneratePackageOnBuild>
  <PackageId>AspNetCoreFileManager</PackageId>
  <Version>1.0.3</Version>
  <PackageReadmeFile>README.md</PackageReadmeFile>
  <EnableDefaultContentItems>false</EnableDefaultContentItems>
  <EnableDefaultCompileItems>false</EnableDefaultCompileItems>
</PropertyGroup>

<!-- Static assets -->
<ItemGroup>
  <Content Include="wwwroot\**\*.*">
    <Pack>true</Pack>
    <PackagePath>contentFiles\any\any\wwwroot\lib\aspnetcorefilemanager</PackagePath>
    <PackageCopyToOutput>true</PackageCopyToOutput>
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </Content>
</ItemGroup>

<!-- Build targets -->
<ItemGroup>
  <None Include="build\AspNetCoreFileManager.targets" Pack="true" PackagePath="build\" />
</ItemGroup>
```

### How Auto-Copy Works

1. **Package Installation**: When someone installs the package, NuGet extracts:
   - DLL to `bin/`
   - Static files to `contentFiles/any/any/wwwroot/lib/aspnetcorefilemanager/`
   - Build targets to `build/AspNetCoreFileManager.targets`

2. **Build Time**: The `.targets` file runs automatically:
   ```xml
   <Target Name="CopyAspNetCoreFileManagerAssets" BeforeTargets="Build">
     <!-- Copies from package location to wwwroot/lib/aspnetcorefilemanager/ -->
   </Target>
   ```

3. **Result**: CSS/JS files are in `wwwroot/` and served by static files middleware

## Consumer Usage

After installing the package, consumers need to:

### 1. Add Service Registration

```csharp
builder.Services.AddFileManager("path/to/files");
```

### 2. Add Tag Helper Import

```cshtml
@addTagHelper *, AspNetCoreFileManager
```

### 3. Include Assets in Layout

```html
<!-- CSS -->
<link rel="stylesheet" href="~/lib/aspnetcorefilemanager/css/filemanager.css" />

<!-- JS - In this exact order! -->
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-utils.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-zip.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-events.js"></script>
```

### 4. Use in Views

```html
<file-manager id="myFileManager" path="/" view="largeicons"></file-manager>
```

## Troubleshooting Package Issues

### Files Not Copied

**Problem**: CSS/JS files not in `wwwroot/lib/aspnetcorefilemanager/`

**Solutions**:
1. Rebuild the project: `dotnet clean && dotnet build`
2. Check build output for "Copying AspNetCoreFileManager assets" messages
3. Manually verify package contents:
   ```bash
   # Extract .nupkg (it's a ZIP file)
   Expand-Archive AspNetCoreFileManager.1.0.3.nupkg -DestinationPath ./extracted
   # Check contents
   ls ./extracted/contentFiles/any/any/wwwroot/lib/aspnetcorefilemanager/
   ```

### Build Targets Not Running

**Problem**: No "Copying AspNetCoreFileManager assets" message in build output

**Solutions**:
1. Verify `build/AspNetCoreFileManager.targets` exists in package
2. Check package is properly installed (not just referenced)
3. Try clearing NuGet cache:
   ```bash
   dotnet nuget locals all --clear
   dotnet restore
   ```

### JavaScript Errors

**Problem**: `showCreateZipModal is not a function`

**Solution**: Ensure scripts are loaded in correct order (see Consumer Usage above)

## Version History

### 1.0.3 (Current)
- Added ZIP operations (create/extract)
- Updated toolbar and context menu with ZIP commands
- Added `filemanager-zip.js`
- Fixed script loading order documentation

### 1.0.2
- Fixed modal overlay blocking page
- Fixed download 415 error
- Fixed file item vertical stretch
- Changed layout from Grid to Flexbox

### 1.0.1
- Made dark mode opt-in
- Fixed JavaScript initialization errors
- Added dark mode documentation

### 1.0.0
- Initial release
- File manager with all basic operations
- Upload/download support
- Image preview
- RTL support

## Package Size

Approximate sizes:
- DLL: ~50-100 KB
- CSS: ~30 KB
- JS (total): ~50 KB
- **Total Package**: ~150-200 KB

## Dependencies

### Runtime Dependencies
- `Microsoft.AspNetCore.App` (Framework reference)
- `System.IO.Compression` >= 4.3.0

### Consumer Requirements
- .NET 8.0 or higher
- ASP.NET Core MVC or Razor Pages
- Bootstrap 5 (via CDN or local)
- Font Awesome 6 (via CDN or local)

## Support and Resources

- **Documentation**: https://github.com/yourusername/AspNetCoreFileManager
- **Issues**: https://github.com/yourusername/AspNetCoreFileManager/issues
- **NuGet**: https://www.nuget.org/packages/AspNetCoreFileManager/
- **License**: MIT

## Quality Checklist

Before publishing a new version:

- [ ] All tests pass
- [ ] Build succeeds with no errors
- [ ] Package builds successfully
- [ ] Tested in a clean project
- [ ] Static files auto-copy on build
- [ ] All features work correctly
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version number incremented
- [ ] README.md reflects current features

## Release Process

1. **Update Version**:
   ```xml
   <Version>1.0.4</Version>
   ```

2. **Update CHANGELOG.md**:
   ```markdown
   ## [1.0.4] - 2025-01-XX
   ### Added
   - New feature...
   ```

3. **Build and Test**:
   ```bash
   dotnet clean
   dotnet build --configuration Release
   dotnet test
   ```

4. **Test Package Locally**:
   - Copy to local NuGet source
   - Install in test project
   - Verify all features work

5. **Push to NuGet.org**:
   ```bash
   dotnet nuget push ...
   ```

6. **Create GitHub Release**:
   - Tag: `v1.0.4`
   - Title: "Release 1.0.4"
   - Description: Copy from CHANGELOG.md

7. **Announce**:
   - Update README badges if needed
   - Tweet/post about new version
   - Update documentation site

---

**Last Updated**: January 5, 2025  
**Package Version**: 1.0.3  
**Build**: ✅ Success

