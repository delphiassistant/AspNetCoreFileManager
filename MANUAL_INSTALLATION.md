# Manual Installation Guide

This guide explains how to install AspNetCoreFileManager **without using NuGet**, by manually copying files and setting up project references.

## When to Use Manual Installation

Use manual installation when:
- ✅ You want to customize the library files
- ✅ You're working in an environment without NuGet access
- ✅ You want to include the source code in your solution
- ✅ You're developing/debugging the library

## Prerequisites

- .NET 6.0, 7.0, 8.0, or 9.0 SDK
- ASP.NET Core project (MVC, Razor Pages, or Web API)
- Bootstrap 5 and Font Awesome 6 (via CDN or local)

---

## Step 1: Copy Static Files (CSS/JS)

### 1.1 Create Target Directory

Create the following folder structure in your project's `wwwroot`:

```
YourProject/
└── wwwroot/
    └── lib/
        └── aspnetcorefilemanager/
            ├── css/
            ├── js/
            └── locales/
```

**PowerShell:**
```powershell
cd YourProject\wwwroot
New-Item -ItemType Directory -Path "lib\aspnetcorefilemanager\css" -Force
New-Item -ItemType Directory -Path "lib\aspnetcorefilemanager\js" -Force
New-Item -ItemType Directory -Path "lib\aspnetcorefilemanager\locales" -Force
```

**Bash:**
```bash
cd YourProject/wwwroot
mkdir -p lib/aspnetcorefilemanager/css
mkdir -p lib/aspnetcorefilemanager/js
mkdir -p lib/aspnetcorefilemanager/locales
```

### 1.2 Copy Files

Copy files from the source repository:

**Source Location:**
```
AspNetCoreFileManager/
└── src/
    └── AspNetCoreFileManager/
        └── wwwroot/
            ├── css/
            │   └── filemanager.css
            ├── js/
            │   ├── filemanager.js
            │   └── filemanager-i18n.js
            └── locales/
                ├── en.json
                └── fa.json
```

**PowerShell Copy Command:**
```powershell
# Set source and target paths
$source = "C:\Path\To\AspNetCoreFileManager\src\AspNetCoreFileManager\wwwroot"
$target = "C:\Path\To\YourProject\wwwroot\lib\aspnetcorefilemanager"

# Copy CSS
Copy-Item "$source\css\filemanager.css" "$target\css\" -Force

# Copy JS
Copy-Item "$source\js\filemanager.js" "$target\js\" -Force
Copy-Item "$source\js\filemanager-i18n.js" "$target\js\" -Force

# Copy Locales
Copy-Item "$source\locales\en.json" "$target\locales\" -Force
Copy-Item "$source\locales\fa.json" "$target\locales\" -Force

Write-Host "✓ Files copied successfully!" -ForegroundColor Green
```

**Bash Copy Command:**
```bash
# Set source and target paths
SOURCE="/path/to/AspNetCoreFileManager/src/AspNetCoreFileManager/wwwroot"
TARGET="/path/to/YourProject/wwwroot/lib/aspnetcorefilemanager"

# Copy CSS
cp "$SOURCE/css/filemanager.css" "$TARGET/css/"

# Copy JS
cp "$SOURCE/js/filemanager.js" "$TARGET/js/"
cp "$SOURCE/js/filemanager-i18n.js" "$TARGET/js/"

# Copy Locales
cp "$SOURCE/locales/en.json" "$TARGET/locales/"
cp "$SOURCE/locales/fa.json" "$TARGET/locales/"

echo "✓ Files copied successfully!"
```

### 1.3 Verify Files

After copying, your structure should look like:

```
YourProject/
└── wwwroot/
    └── lib/
        └── aspnetcorefilemanager/
            ├── css/
            │   └── filemanager.css           ← ~30 KB
            ├── js/
            │   ├── filemanager.js            ← ~45 KB (merged: core + events + utils + zip)
            │   └── filemanager-i18n.js       ← ~5 KB (optional)
            └── locales/
                ├── en.json                   ← ~4 KB
                └── fa.json                   ← ~4 KB
```

---

## Step 2: Add Project Reference

### Option A: Project Reference (Recommended for Development)

If you have access to the source code:

**1. Clone or download the repository:**
```bash
git clone https://github.com/delphiassistant/AspNetCoreFileManager.git
```

**2. Add project reference to your `.csproj`:**

```xml
<ItemGroup>
  <ProjectReference Include="..\AspNetCoreFileManager\src\AspNetCoreFileManager\AspNetCoreFileManager.csproj" />
</ItemGroup>
```

**3. Build the solution:**
```bash
dotnet build
```

### Option B: DLL Reference (For Production)

If you only have the compiled DLL:

**1. Copy DLL files:**
```powershell
Copy-Item "AspNetCoreFileManager\src\AspNetCoreFileManager\bin\Release\net8.0\AspNetCoreFileManager.dll" "YourProject\lib\"
```

**2. Add reference in `.csproj`:**
```xml
<ItemGroup>
  <Reference Include="AspNetCoreFileManager">
    <HintPath>lib\AspNetCoreFileManager.dll</HintPath>
  </Reference>
</ItemGroup>
```

---

## Step 3: Register Services

In your `Program.cs`:

```csharp
using AspNetCoreFileManager.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add File Manager service
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

---

## Step 4: Add Required Assets to Layout

In `Views/Shared/_Layout.cshtml`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - Your App</title>
    
    <!-- Bootstrap 5 (required) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome 6 (required for icons) -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- File Manager CSS -->
    <link href="~/lib/aspnetcorefilemanager/css/filemanager.css" rel="stylesheet" />
</head>
<body>
    @RenderBody()
    
    <!-- Bootstrap JS (required) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- File Manager JS -->
    <script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
    
    <!-- Optional: Localization (only if you need multi-language support) -->
    <script src="~/lib/aspnetcorefilemanager/js/filemanager-i18n.js"></script>
    
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>
```

---

## Step 5: Add Tag Helper Import

In `Views/_ViewImports.cshtml`:

```csharp
@using YourProject
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
@addTagHelper *, AspNetCoreFileManager
```

---

## Step 6: Use in Your Views

### Basic Usage

```html
@page
@model IndexModel

<h1>File Manager</h1>

<file-manager id="myFileManager"
              path="/"
              ajax-url="/api/FileManager/FileOperations"
              upload-url="/api/FileManager/Upload"
              download-url="/api/FileManager/Download"
              get-image-url="/api/FileManager/GetImage">
</file-manager>

@section Scripts {
    <script>
        const fm = new FileManager('#myFileManager');
        fm.init();
    </script>
}
```

### With Localization (Persian Example)

```html
<file-manager id="persianFileManager"
              path="/"
              ajax-url="/api/FileManager/FileOperations"
              upload-url="/api/FileManager/Upload"
              download-url="/api/FileManager/Download"
              get-image-url="/api/FileManager/GetImage"
              dir="rtl">
</file-manager>

@section Scripts {
    <script>
    (async function() {
        const fm = new FileManager('#persianFileManager');
        await fm.initializeWithLocale('fa');
        fm.init();
    })();
    </script>
}
```

---

## Verification Checklist

After installation, verify everything works:

- [ ] CSS file loads (check Network tab in DevTools)
- [ ] JS files load (check Network tab)
- [ ] Locale files load (if using localization)
- [ ] File Manager renders on page
- [ ] Bootstrap styles applied
- [ ] Font Awesome icons visible
- [ ] Toolbar buttons appear
- [ ] Navigation pane shows folders
- [ ] Right-click shows context menu
- [ ] File operations work (create folder, upload, etc.)

---

## Troubleshooting

### Issue 1: CSS Not Loading

**Symptom:** File manager appears unstyled

**Check:**
```html
<!-- Verify path in _Layout.cshtml -->
<link href="~/lib/aspnetcorefilemanager/css/filemanager.css" rel="stylesheet" />
```

**Verify file exists:**
```
wwwroot/lib/aspnetcorefilemanager/css/filemanager.css
```

**Check browser DevTools:**
- Open F12 → Network tab
- Look for 404 errors
- Check file path

### Issue 2: JavaScript Errors

**Symptom:** Console shows "FileManager is not defined"

**Check script order:**
```html
<!-- Bootstrap MUST come before filemanager.js -->
<script src="...bootstrap.bundle.min.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
```

### Issue 3: Tag Helper Not Working

**Symptom:** `<file-manager>` appears as plain HTML

**Check:**
1. Project reference added to `.csproj`
2. Tag helper import in `_ViewImports.cshtml`:
   ```csharp
   @addTagHelper *, AspNetCoreFileManager
   ```
3. Rebuild solution:
   ```bash
   dotnet clean
   dotnet build
   ```

### Issue 4: Service Not Found

**Symptom:** "Unable to resolve service IFileManagerService"

**Check:**
```csharp
// In Program.cs, BEFORE app.Build()
builder.Services.AddFileManager(filesPath);
```

### Issue 5: Icons Not Showing

**Symptom:** Square boxes instead of icons

**Check Font Awesome:**
```html
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
```

---

## Updating Files

When new versions are released:

### Update Script (PowerShell)

Create `update-filemanager.ps1`:

```powershell
# Configuration
$source = "C:\Path\To\AspNetCoreFileManager\src\AspNetCoreFileManager\wwwroot"
$target = "C:\Path\To\YourProject\wwwroot\lib\aspnetcorefilemanager"

Write-Host "Updating File Manager files..." -ForegroundColor Cyan

# Backup current files
$backup = "$target\_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $target $backup -Recurse -Force
Write-Host "✓ Backup created: $backup" -ForegroundColor Gray

# Copy new files
Copy-Item "$source\css\filemanager.css" "$target\css\" -Force
Copy-Item "$source\js\filemanager.js" "$target\js\" -Force
Copy-Item "$source\js\filemanager-i18n.js" "$target\js\" -Force
Copy-Item "$source\locales\*.json" "$target\locales\" -Force

Write-Host "✓ Files updated successfully!" -ForegroundColor Green
Write-Host "`nPlease test your application and hard refresh (Ctrl+F5)" -ForegroundColor Yellow
```

**Run:**
```powershell
.\update-filemanager.ps1
```

---

## Advantages of Manual Installation

### ✅ Pros
- Full control over files
- Easy to customize CSS/JS
- No NuGet dependency
- Can modify source code
- Good for learning/debugging

### ❌ Cons
- Manual updates required
- No automatic dependency resolution
- More setup steps
- Need to track changes manually

---

## Comparison: Manual vs NuGet

| Aspect | Manual Installation | NuGet Package |
|--------|-------------------|---------------|
| **Setup Time** | ~10 minutes | ~2 minutes |
| **Updates** | Manual copy | `dotnet update` |
| **Customization** | Easy | Harder |
| **Dependencies** | Manual | Automatic |
| **Production** | Not recommended | ✅ Recommended |
| **Development** | ✅ Good | Good |

---

## Production Deployment

For production, consider:

1. **Use NuGet Package** for easier updates
2. **Bundle and minify** CSS/JS files
3. **Use CDN** for Bootstrap and Font Awesome
4. **Enable caching** for static assets:

```csharp
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=604800");
    }
});
```

---

## Alternative: Git Submodule

For version control:

```bash
# Add as submodule
git submodule add https://github.com/delphiassistant/AspNetCoreFileManager.git lib/filemanager

# Update submodule
git submodule update --remote
```

---

## Getting Help

If you encounter issues:

1. **Check DevTools Console** (F12) for JavaScript errors
2. **Check Network Tab** for 404 errors
3. **Verify file paths** match the examples above
4. **Check GitHub Issues**: [Report problems](https://github.com/delphiassistant/AspNetCoreFileManager/issues)
5. **See TROUBLESHOOTING.md** for common issues

---

## Summary

**Manual Installation Steps:**
1. ✅ Copy CSS/JS/Locale files to `wwwroot/lib/aspnetcorefilemanager/`
2. ✅ Add project reference to `.csproj`
3. ✅ Register service in `Program.cs`
4. ✅ Add assets to `_Layout.cshtml`
5. ✅ Import tag helper in `_ViewImports.cshtml`
6. ✅ Use `<file-manager>` in views

**Total Time:** ~10-15 minutes

---

**Last Updated:** January 6, 2025  
**Version:** 1.0.7  
**Status:** ✅ Complete Guide

**For NuGet installation, see:** [VISUAL_STUDIO_INSTALLATION_GUIDE.md](VISUAL_STUDIO_INSTALLATION_GUIDE.md)
