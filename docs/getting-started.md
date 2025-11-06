# Getting Started

This guide will help you get up and running with ASP.NET Core File Manager in minutes.

## Installation

### Using NuGet Package Manager

```bash
Install-Package AspNetCoreFileManager
```

### Using .NET CLI

```bash
dotnet add package AspNetCoreFileManager
```

## Basic Setup

### Step 1: Configure Services

Add the file manager service in your `Program.cs`:

```csharp
using AspNetCoreFileManager.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add MVC or Razor Pages
builder.Services.AddControllersWithViews();
// OR
builder.Services.AddRazorPages();

// Configure File Manager
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");
builder.Services.AddFileManager(filesPath);

var app = builder.Build();

// Configure middleware
app.UseStaticFiles();
app.UseRouting();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
```

### Step 2: Add Required Assets

Create or update your `_Layout.cshtml`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - My App</title>
    
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- File Manager CSS -->
    <link rel="stylesheet" href="~/lib/aspnetcorefilemanager/css/filemanager.css">
</head>
<body>
    @RenderBody()
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- File Manager JS -->
    <script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
    <script src="~/lib/aspnetcorefilemanager/js/filemanager-events.js"></script>
    <script src="~/lib/aspnetcorefilemanager/js/filemanager-utils.js"></script>
    
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>
```

### Step 3: Copy Static Files

Copy the file manager assets to your `wwwroot` directory:

```
wwwroot/
└── lib/
    └── aspnetcorefilemanager/
        ├── css/
        │   └── filemanager.css
        └── js/
            ├── filemanager.js
            ├── filemanager-events.js
            └── filemanager-utils.js
```

You can copy these from the NuGet package or build from source.

### Step 4: Add Tag Helper Import

Add to your `_ViewImports.cshtml`:

```csharp
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
@addTagHelper *, AspNetCoreFileManager
```

### Step 5: Use in Your View

Now you can use the file manager in any Razor view:

```html
@{
    ViewData["Title"] = "File Manager";
}

<h1>My File Manager</h1>

<file-manager id="myFileManager" path="/" view="largeicons"></file-manager>
```

## Verification

Run your application and navigate to the page with the file manager. You should see:

1. A toolbar with action buttons
2. A navigation pane with folder tree
3. The main file view area with breadcrumb navigation
4. Files and folders from your configured directory

## Next Steps

- Learn about [Configuration Options](configuration.md)
- Explore the [API Reference](api-reference.md)
- Check out [Examples](examples.md)
- Read about [Customization](customization.md)

## Troubleshooting

### Files Directory Not Found

If you get an error about the files directory:

```csharp
// The service automatically creates the directory, but you can also:
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");
if (!Directory.Exists(filesPath))
{
    Directory.CreateDirectory(filesPath);
}
builder.Services.AddFileManager(filesPath);
```

### Assets Not Loading

Make sure:
1. Static files middleware is enabled: `app.UseStaticFiles();`
2. Files are in the correct `wwwroot/lib/aspnetcorefilemanager/` directory
3. File paths in `_Layout.cshtml` match your directory structure

### Tag Helper Not Working

Verify:
1. Tag helper is imported in `_ViewImports.cshtml`
2. The file manager package is properly referenced in your project
3. You've added the `@addTagHelper *, AspNetCoreFileManager` directive

## Alternative: JavaScript-Only Setup

If you prefer not to use Tag Helpers:

```html
<div id="myFileManager"></div>

<script>
    var fm = new FileManager('#myFileManager', {
        path: '/',
        view: 'largeicons',
        ajaxSettings: {
            url: '/api/FileManager/FileOperations',
            uploadUrl: '/api/FileManager/Upload',
            downloadUrl: '/api/FileManager/Download',
            getImageUrl: '/api/FileManager/GetImage'
        }
    });
</script>
```

## Example Application

For a complete working example, check out the demo application included in the repository:

```
samples/AspNetCoreFileManager.Demo/
```

Run it with:

```bash
cd samples/AspNetCoreFileManager.Demo
dotnet run
```

Then navigate to `https://localhost:5001` to see the file manager in action.

