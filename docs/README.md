# ASP.NET Core File Manager - Documentation

Welcome to the ASP.NET Core File Manager documentation!

## ?? Documentation Structure

### Getting Started
- [Main README](../README.md) - Project overview, installation, and quick start
- [Persian README](../README_FA.md) - ‰”ŒÂ ›«—”Ì „” ‰œ« 

### Guides
- [Localization Guide](guides/LOCALIZATION.md) - How to add support for new languages
- [NuGet Package Guide](guides/NUGET_PACKAGE.md) - Publishing and versioning

### Features
- [ZIP Operations](features/ZIP_OPERATIONS.md) - Creating and extracting ZIP files

### Reference
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- [Changelog](../CHANGELOG.md) - Version history and changes

### Archive
- [Version 1.0.2 Fixes](archive/v1.0.2-fixes.md)
- [Version 1.0.3.1 Fixes](archive/v1.0.3.1-fixes.md)
- [Version 1.0.4 Release](archive/v1.0.4-release.md)

## ?? Quick Links

- [GitHub Repository](https://github.com/delphiassistant/AspNetCoreFileManager)
- [Report Issues](https://github.com/delphiassistant/AspNetCoreFileManager/issues)
- [NuGet Package](https://www.nuget.org/packages/AspNetCoreFileManager)

## ?? Usage Examples

### Basic Setup

``csharp
// In Program.cs
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");
builder.Services.AddFileManager(filesPath);
``

### Tag Helper

``html
<file-manager 
    id="myFileManager" 
    path="/Documents" 
    view="details"
    enable-rtl="false">
</file-manager>
``

### JavaScript API

``javascript
var fm = new FileManager('#myElement', {
    path: '/',
    view: 'largeicons',
    allowDragAndDrop: true
});

fm.on('success', function(e) {
    console.log('Success:', e);
});
``

## ?? Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## ?? License

This project is licensed under the MIT License - see [LICENSE](../LICENSE).

---

Last updated: 2025-11-06
