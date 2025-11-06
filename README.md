# ASP.NET Core File Manager

A modern, full-featured file manager component for ASP.NET Core applications. Built from scratch without external dependencies, featuring a beautiful Bootstrap 5-based UI with comprehensive file management capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![.NET Version](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com/)

## ✨ Features

### Core Functionality
- ✅ **Full File Operations** - Create, rename, delete, copy, and move files and folders
- ✅ **File Upload** - Drag-and-drop support with progress tracking
- ✅ **File Download** - Download single files or multiple files as ZIP archive
- ✅ **ZIP Operations** - Create ZIP archives and extract ZIP files
- ✅ **Image Preview** - Built-in modal viewer for image files
- ✅ **Search** - Fast file and folder search with case-sensitive option
- ✅ **Breadcrumb Navigation** - Easy navigation through folder hierarchy

### UI Components
- ✅ **Toolbar** - Quick access to common operations
- ✅ **Navigation Pane** - Tree view of folder structure
- ✅ **Multiple Views** - Switch between Large Icons and Details view
- ✅ **Context Menu** - Right-click menu for quick actions
- ✅ **Sortable Columns** - Sort files by name, date, type, or size

### Advanced Features
- ✅ **Multi-Selection** - Select and operate on multiple files at once
- ✅ **State Persistence** - Remember view mode and path on page reload
- ✅ **RTL Support** - Full right-to-left layout for Arabic/Persian/Hebrew
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ✅ **Dark Mode** - Automatic dark mode support
- ✅ **Extensible** - Easy to customize and extend

## 📦 Installation

### Via NuGet Package Manager
```bash
Install-Package AspNetCoreFileManager
```

### Via .NET CLI
```bash
dotnet add package AspNetCoreFileManager
```

## 🚀 Quick Start

### 1. Configure in Program.cs

```csharp
using AspNetCoreFileManager.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Configure File Manager service
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");
builder.Services.AddFileManager(filesPath);

builder.Services.AddControllersWithViews();

var app = builder.Build();

app.UseStaticFiles();
app.UseRouting();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
```

### 2. Add Required Assets to Layout

```html
<!-- In your _Layout.cshtml -->
<head>
    <!-- Bootstrap 5 (required) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome (required for icons) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- File Manager CSS -->
    <link rel="stylesheet" href="~/lib/aspnetcorefilemanager/css/filemanager.css">
</head>

<body>
    <!-- Your content -->
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- File Manager JS - Load in this exact order! -->
    <script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
    <script src="~/lib/aspnetcorefilemanager/js/filemanager-utils.js"></script>
    <script src="~/lib/aspnetcorefilemanager/js/filemanager-zip.js"></script>
    <script src="~/lib/aspnetcorefilemanager/js/filemanager-events.js"></script>
</body>
```

### 3. Add to Your View

```html
<!-- Simple usage with Tag Helper -->
<file-manager id="myFileManager" path="/" view="largeicons"></file-manager>
```

That's it! You now have a fully functional file manager.

## 📖 Documentation

### Tag Helper Usage

The easiest way to use the file manager is with the Tag Helper:

```html
<file-manager 
    id="myFileManager" 
    path="/Documents" 
    view="details"
    height="600px"
    allow-drag-drop="true"
    allow-multi-selection="true"
    show-toolbar="true"
    show-navigation="true"
    show-context-menu="true"
    enable-persistence="true"
    enable-rtl="false">
</file-manager>
```

### JavaScript API Usage

For more control, you can create instances programmatically:

```javascript
var fileManager = new FileManager('#myElement', {
    path: '/Documents',
    view: 'largeicons',
    allowDragAndDrop: true,
    allowMultiSelection: true,
    showFileExtension: true,
    showHiddenItems: false,
    enablePersistence: true,
    enableRtl: false,
    ajaxSettings: {
        url: '/api/FileManager/FileOperations',
        uploadUrl: '/api/FileManager/Upload',
        downloadUrl: '/api/FileManager/Download',
        getImageUrl: '/api/FileManager/GetImage'
    },
    toolbarSettings: {
        visible: true,
        items: ['NewFolder', 'Upload', 'Delete', 'Download', 'Rename', 'Refresh', 'View', 'Details']
    },
    navigationPaneSettings: {
        visible: true,
        minWidth: '200px',
        maxWidth: '400px'
    },
    contextMenuSettings: {
        visible: true,
        items: ['Open', '|', 'Cut', 'Copy', 'Paste', 'Delete', 'Rename', '|', 'Details']
    }
});

// Event handlers
fileManager.on('success', function(e) {
    console.log('Operation succeeded:', e);
});

fileManager.on('failure', function(e) {
    console.error('Operation failed:', e);
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `path` | string | "/" | Initial path to display |
| `view` | string | "largeicons" | View mode: "largeicons" or "details" |
| `allowDragAndDrop` | bool | true | Enable drag-and-drop upload |
| `allowMultiSelection` | bool | true | Allow multiple file selection |
| `showFileExtension` | bool | true | Show file extensions |
| `showHiddenItems` | bool | false | Show hidden files |
| `showThumbnail` | bool | true | Show image thumbnails |
| `enablePersistence` | bool | false | Save state on reload |
| `enableRtl` | bool | false | Enable RTL layout |

See the [full API reference](docs/API.md) for all options.

## 🎨 Customization

### Custom Styling

You can override the default styles by adding your own CSS:

```css
/* Custom toolbar background */
.filemanager-toolbar {
    background-color: #your-color;
}

/* Custom file item hover color */
.file-item:hover {
    background-color: #your-color;
}
```

### Custom File Provider

Implement your own file provider for cloud storage or database:

```csharp
public class AzureBlobFileManagerService : IFileManagerService
{
    // Implement all interface methods
    // Use Azure Blob Storage instead of physical file system
    
    public FileManagerResponse GetFiles(string path, bool showHiddenItems = false, string[]? filter = null)
    {
        // Your Azure Blob Storage implementation
    }
    
    // ... other methods
}

// Register in Program.cs
builder.Services.AddFileManager<AzureBlobFileManagerService>();
```

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🧪 Running Tests

```bash
dotnet test
```

## 🎯 Examples

### Example 1: Minimal File Browser

```html
<file-manager 
    id="minimal" 
    show-toolbar="false" 
    show-navigation="false"
    show-context-menu="false">
</file-manager>
```

### Example 2: RTL File Manager

```html
<file-manager 
    id="rtl" 
    enable-rtl="true" 
    path="/">
</file-manager>
```

### Example 3: Persistent File Manager

```html
<file-manager 
    id="persistent" 
    enable-persistence="true" 
    path="/Documents">
</file-manager>
```

## 📂 Project Structure

```
AspNetCoreFileManager/
├── src/
│   └── AspNetCoreFileManager/          # Main library
│       ├── Controllers/                # API controllers
│       ├── Models/                     # Data models
│       ├── Services/                   # Business logic
│       ├── TagHelpers/                 # Tag helper implementation
│       ├── Extensions/                 # Service extensions
│       └── wwwroot/                    # Static assets
│           ├── css/                    # Stylesheets
│           └── js/                     # JavaScript files
├── samples/
│   └── AspNetCoreFileManager.Demo/     # Demo application
├── tests/
│   └── AspNetCoreFileManager.Tests/    # Unit tests
├── docs/                               # Documentation
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ASP.NET Core 8.0
- UI design inspired by modern file managers
- Icons by Font Awesome
- Styling with Bootstrap 5

## 📞 Support

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/delphiassistant/AspNetCoreFileManager/issues)
- 📖 Documentation: [Full Documentation](docs/README.md)

## 🗺️ Roadmap

- [ ] Azure Blob Storage provider
- [ ] AWS S3 provider
- [ ] File versioning
- [ ] File sharing and permissions
- [ ] Bulk operations progress bar
- [ ] File preview for more types (PDF, Office docs)
- [ ] Video player integration
- [ ] Audio player integration

---

Made with ❤️ for the ASP.NET Core community

