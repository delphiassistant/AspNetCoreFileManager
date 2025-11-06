# Quick Start Guide - ASP.NET Core File Manager

Get up and running in 5 minutes!

## Prerequisites

- .NET 8.0 SDK or higher
- Visual Studio 2022, VS Code, or Rider

## Step 1: Clone or Download

```bash
git clone https://github.com/yourusername/AspNetCoreFileManager.git
cd AspNetCoreFileManager
```

## Step 2: Build the Solution

```bash
dotnet build
```

## Step 3: Run the Demo

```bash
cd samples/AspNetCoreFileManager.Demo
dotnet run
```

Navigate to `https://localhost:5001` to see the file manager in action!

## Step 4: Integrate into Your Project

### Install the Package

```bash
dotnet add package AspNetCoreFileManager
```

### Configure in Program.cs

```csharp
using AspNetCoreFileManager.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

// Add File Manager
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");
builder.Services.AddFileManager(filesPath);

var app = builder.Build();

app.UseStaticFiles();
app.UseRouting();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
```

### Add to _ViewImports.cshtml

```csharp
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
@addTagHelper *, AspNetCoreFileManager
```

### Add Required Assets to _Layout.cshtml

```html
<head>
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
</body>
```

### Copy Static Files

Copy these files to your `wwwroot/lib/aspnetcorefilemanager/` directory:
- `css/filemanager.css`
- `js/filemanager.js`
- `js/filemanager-events.js`
- `js/filemanager-utils.js`

### Use in Your View

```html
@{
    ViewData["Title"] = "File Manager";
}

<h1>My File Manager</h1>

<file-manager id="myFileManager" path="/" view="largeicons"></file-manager>
```

## That's It! 🎉

You now have a fully functional file manager in your ASP.NET Core application.

## Next Steps

- Check out the [Demo Application](samples/AspNetCoreFileManager.Demo) for more examples
- Read the [Full Documentation](docs/README.md)
- Customize with [Configuration Options](docs/configuration.md)
- Explore the [API Reference](docs/api-reference.md)

## Common Configurations

### Minimal File Browser (No Toolbar)

```html
<file-manager 
    id="minimal" 
    show-toolbar="false" 
    show-navigation="false"
    show-context-menu="false">
</file-manager>
```

### RTL Support

```html
<file-manager id="rtl" enable-rtl="true"></file-manager>
```

### Persistent State

```html
<file-manager id="persistent" enable-persistence="true"></file-manager>
```

### Custom Starting Path

```html
<file-manager id="documents" path="/Documents" view="details"></file-manager>
```

## Troubleshooting

### Files Directory Not Found
The directory is created automatically, but you can create it manually:
```csharp
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");
Directory.CreateDirectory(filesPath);
builder.Services.AddFileManager(filesPath);
```

### Assets Not Loading
Make sure:
1. Static files middleware is enabled: `app.UseStaticFiles();`
2. Files are in `wwwroot/lib/aspnetcorefilemanager/`
3. Paths in `_Layout.cshtml` are correct

### Tag Helper Not Working
Verify you've added:
```csharp
@addTagHelper *, AspNetCoreFileManager
```
to your `_ViewImports.cshtml` file.

## Need Help?

- **Documentation**: See the `docs/` folder
- **Examples**: Check the demo application
- **Issues**: Report on GitHub
- **API Reference**: See [API docs](docs/api-reference.md)

---

Happy coding! 🚀

