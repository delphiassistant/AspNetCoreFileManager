# ASP.NET Core File Manager - Documentation

Welcome to the ASP.NET Core File Manager documentation!

## ?? Documentation Structure

### Getting Started
- [Main README](../README.md) - Project overview, installation, and quick start
- [Persian README](../README_FA.md) - نسخه فارسی مستندات
- [Migration Guide v1.0.5](MIGRATION_v1.0.5.md) - **NEW:** Upgrade from v1.0.4 to v1.0.5

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

## 📖 Usage Examples

### Basic Setup

```csharp
// In Program.cs
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");
builder.Services.AddFileManager(filesPath);
```

### Required Assets in _Layout.cshtml

```html
<head>
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- File Manager CSS -->
    <link href="~/lib/aspnetcorefilemanager/css/filemanager.css" rel="stylesheet">
</head>
<body>
    @RenderBody()
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- File Manager JS (Single merged file) -->
    <script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
    
    <!-- Optional: Localization support -->
    <script src="~/lib/aspnetcorefilemanager/js/filemanager-i18n.js"></script>
</body>
```

**Note:** The FileManager JavaScript is now a single merged file that includes:
- Core functionality
- Event handlers
- Utility methods
- ZIP operations
- Cleanup methods

The `filemanager-i18n.js` is kept separate and only needed if you want multi-language support.

### Tag Helper

```html
<file-manager 
    id="myFileManager" 
    path="/Documents" 
    view="details"
    enable-rtl="false">
</file-manager>
```

### JavaScript API

```javascript
var fm = new FileManager('#myElement', {
    path: '/',
    view: 'largeicons',
    allowDragAndDrop: true
});

fm.on('success', function(e) {
    console.log('Success:', e);
});
```

### Localization Example

```javascript
// Load with Persian locale
(async function() {
    const fm = new FileManager('#myElement', {
        path: '/',
        view: 'largeicons'
    });
    
    await fm.initializeWithLocale('fa');  // 'en' or 'fa'
})();
```

## ?? Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## ?? License

This project is licensed under the MIT License - see [LICENSE](../LICENSE).

---

Last updated: 2025-11-06
