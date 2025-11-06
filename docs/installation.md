# Installation Guide

Complete guide for installing and configuring ASP.NET Core File Manager in your project.

## Table of Contents

1. [Installation Methods](#installation-methods)
2. [Basic Setup](#basic-setup)
3. [Asset Configuration](#asset-configuration)
4. [Troubleshooting](#troubleshooting)

## Installation Methods

### Method 1: NuGet Package (Recommended)

Install via Package Manager Console:
```powershell
Install-Package AspNetCoreFileManager
```

Or via .NET CLI:
```bash
dotnet add package AspNetCoreFileManager
```

**What happens automatically:**
- ✅ DLL is referenced
- ✅ CSS and JS files are copied to `wwwroot/lib/aspnetcorefilemanager/`
- ✅ Build targets run on every build

### Method 2: Manual Installation

1. Download the source code
2. Copy `src/AspNetCoreFileManager` to your solution
3. Add project reference:
   ```xml
   <ProjectReference Include="..\AspNetCoreFileManager\AspNetCoreFileManager.csproj" />
   ```

## Basic Setup

### 1. Configure Services (`Program.cs`)

```csharp
using AspNetCoreFileManager.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Configure File Manager service with root path
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");
builder.Services.AddFileManager(filesPath);

builder.Services.AddControllersWithViews();

var app = builder.Build();

// Ensure Files directory exists
if (!Directory.Exists(filesPath))
{
    Directory.CreateDirectory(filesPath);
}

app.UseStaticFiles();
app.UseRouting();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
```

### 2. Add Assets to Layout (`_Layout.cshtml` or `_ViewImports.cshtml`)

**Important: Load scripts in this exact order!**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - Your App</title>
    
    <!-- Bootstrap 5 (Required) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome 6 (Required for icons) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- File Manager CSS -->
    <link rel="stylesheet" href="~/lib/aspnetcorefilemanager/css/filemanager.css" />
</head>
<body>
    @RenderBody()
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- File Manager JS - IMPORTANT: Load in this exact order! -->
    <script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
    <script src="~/lib/aspnetcorefilemanager/js/filemanager-utils.js"></script>
    <script src="~/lib/aspnetcorefilemanager/js/filemanager-zip.js"></script>
    <script src="~/lib/aspnetcorefilemanager/js/filemanager-events.js"></script>
    
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>
```

### 3. Add Tag Helper (`_ViewImports.cshtml`)

```cshtml
@addTagHelper *, AspNetCoreFileManager
```

### 4. Use in Your View

```cshtml
@{
    ViewData["Title"] = "File Manager";
}

<h1>My Files</h1>

<file-manager id="myFileManager" 
             path="/" 
             view="largeicons">
</file-manager>
```

## Asset Configuration

### Verify Files Are Copied

After building your project, verify these files exist:

```
wwwroot/
└── lib/
    └── aspnetcorefilemanager/
        ├── css/
        │   └── filemanager.css
        └── js/
            ├── filemanager.js
            ├── filemanager-events.js
            ├── filemanager-utils.js
            └── filemanager-zip.js
```

### Using Local Bootstrap and Font Awesome

If you prefer not to use CDN:

**Option 1: LibMan**
```bash
# Install LibMan CLI
dotnet tool install -g Microsoft.Web.LibraryManager.Cli

# Add Bootstrap
libman install bootstrap@5.3.0 -p jsdelivr -d wwwroot/lib/bootstrap

# Add Font Awesome
libman install @fortawesome/fontawesome-free@6.4.0 -p jsdelivr -d wwwroot/lib/fontawesome
```

Then update your layout:
```html
<link href="~/lib/bootstrap/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="~/lib/fontawesome/css/all.min.css">
<script src="~/lib/bootstrap/js/bootstrap.bundle.min.js"></script>
```

**Option 2: NPM**
```bash
npm install bootstrap @fortawesome/fontawesome-free
```

## Script Loading Order Explained

The JavaScript files **must** be loaded in this specific order:

1. **`filemanager.js`** - Core FileManager class and initialization
2. **`filemanager-utils.js`** - Utility functions (modal handling, formatting, etc.)
3. **`filemanager-zip.js`** - ZIP operations (create/extract)
4. **`filemanager-events.js`** - Event handlers (clicks, drag-drop, etc.)

❌ **Wrong Order:**
```html
<!-- This will cause errors! -->
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-events.js"></script>  <!-- Too early! -->
<script src="~/lib/aspnetcorefilemanager/js/filemanager-zip.js"></script>
```

**Error you'll see:**
```
Uncaught TypeError: this.showCreateZipModal is not a function
Uncaught TypeError: this.extractZip is not a function
```

✅ **Correct Order:**
```html
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-utils.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-zip.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-events.js"></script>  <!-- Last! -->
```

## Troubleshooting

### Issue: CSS/JS Files Not Found (404)

**Symptom:** Browser shows 404 errors for `/lib/aspnetcorefilemanager/...`

**Solution 1:** Rebuild the project
```bash
dotnet clean
dotnet build
```

**Solution 2:** Manually copy files
```bash
# Copy CSS
xcopy /Y /I "node_modules\AspNetCoreFileManager\contentFiles\any\any\wwwroot\lib\aspnetcorefilemanager\css\*" "wwwroot\lib\aspnetcorefilemanager\css\"

# Copy JS
xcopy /Y /I "node_modules\AspNetCoreFileManager\contentFiles\any\any\wwwroot\lib\aspnetcorefilemanager\js\*" "wwwroot\lib\aspnetcorefilemanager\js\"
```

**Solution 3:** Check build output
Look for messages like:
```
Copying AspNetCoreFileManager assets to: C:\YourProject\wwwroot\lib\aspnetcorefilemanager
AspNetCoreFileManager assets copied successfully!
```

### Issue: "showCreateZipModal is not a function"

**Cause:** JavaScript files loaded in wrong order

**Solution:** Ensure `filemanager-zip.js` is loaded **before** `filemanager-events.js`

### Issue: Tag Helper Not Recognized

**Symptom:** `<file-manager>` shows as plain HTML

**Solution 1:** Add to `_ViewImports.cshtml`:
```cshtml
@addTagHelper *, AspNetCoreFileManager
```

**Solution 2:** Clear view cache:
```bash
dotnet clean
dotnet build
```

### Issue: Service Not Registered

**Symptom:** Error: "Unable to resolve service for type 'IFileManagerService'"

**Solution:** Add to `Program.cs`:
```csharp
builder.Services.AddFileManager("path/to/files");
```

### Issue: Files Directory Access Denied

**Symptom:** 403 Forbidden or UnauthorizedAccessException

**Solution:** Ensure the directory has proper permissions:
```csharp
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");

// Create with proper permissions
if (!Directory.Exists(filesPath))
{
    Directory.CreateDirectory(filesPath);
    // On Windows, permissions are usually inherited
    // On Linux/Mac, you may need to set permissions:
    // chmod -R 755 Files
}
```

## Advanced Configuration

### Custom File Storage Location

```csharp
// Multiple allowed paths
builder.Services.AddFileManager(
    rootPath: @"C:\CompanyFiles",
    allowedPaths: new[] { 
        @"C:\CompanyFiles",
        @"C:\SharedDocs",
        @"\\NetworkShare\Files"
    }
);
```

### Dependency Injection in Controllers

```csharp
public class HomeController : Controller
{
    private readonly IFileManagerService _fileManager;
    
    public HomeController(IFileManagerService fileManager)
    {
        _fileManager = fileManager;
    }
    
    public IActionResult Index()
    {
        var files = _fileManager.GetFiles("/");
        return View(files);
    }
}
```

## Minimal Setup Example

For a quick test, here's the absolute minimum:

**Program.cs:**
```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();
builder.Services.AddFileManager(Path.Combine(builder.Environment.ContentRootPath, "Files"));
var app = builder.Build();
app.UseStaticFiles();
app.UseRouting();
app.MapControllerRoute("default", "{controller=Home}/{action=Index}");
app.Run();
```

**_ViewImports.cshtml:**
```cshtml
@addTagHelper *, AspNetCoreFileManager
```

**Index.cshtml:**
```cshtml
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="~/lib/aspnetcorefilemanager/css/filemanager.css" />

<file-manager id="fm" path="/" view="largeicons"></file-manager>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-utils.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-zip.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-events.js"></script>
```

## Next Steps

- 📖 [Configuration Options](configuration.md)
- 📖 [ZIP Operations](zip-operations.md)
- 📖 [API Reference](api-reference.md)
- 📖 [Customization](customization.md)

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
3. Open an issue on GitHub with full error details

