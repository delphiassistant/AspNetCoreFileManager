# Troubleshooting Guide

This guide helps you resolve common issues with ASP.NET Core File Manager.

## JavaScript Errors

### Error: "Cannot read properties of undefined (reading 'map')"

**Symptom**: Console error when the file manager initializes.

**Cause**: Missing or incomplete configuration in the Tag Helper initialization.

**Solution**: The JavaScript files have been updated to handle missing configurations gracefully. Make sure you're using the latest version of the JavaScript files:
- `filemanager.js`
- `filemanager-events.js`
- `filemanager-utils.js`

If you copied the files manually, re-copy them from `src/AspNetCoreFileManager/wwwroot/` to your project's `wwwroot/lib/aspnetcorefilemanager/` directory.

### Error: "FileManager is not defined"

**Cause**: JavaScript files not loaded or loaded in wrong order.

**Solution**: Ensure scripts are loaded in this order:
```html
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-events.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-utils.js"></script>
```

## Asset Loading Issues

### CSS/JS Files Not Loading

**Symptoms**: 
- File manager appears unstyled
- Console shows 404 errors for assets

**Solutions**:

1. **Verify Static Files Middleware**:
```csharp
// In Program.cs
app.UseStaticFiles();
```

2. **Check File Paths**:
Ensure files exist in:
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

3. **Verify Path References** in `_Layout.cshtml`:
```html
<link rel="stylesheet" href="~/lib/aspnetcorefilemanager/css/filemanager.css">
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
```

### Bootstrap or Font Awesome Not Loading

**Symptoms**: 
- Icons missing
- Layout broken

**Solution**: Add CDN links or local copies:
```html
<!-- Bootstrap 5 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- Bootstrap JS (at end of body) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

## Tag Helper Issues

### Tag Helper Not Working

**Symptoms**: 
- `<file-manager>` tag appears as plain HTML
- No file manager rendered

**Solutions**:

1. **Add Tag Helper Import** in `_ViewImports.cshtml`:
```csharp
@addTagHelper *, AspNetCoreFileManager
```

2. **Verify Package Reference** in `.csproj`:
```xml
<ItemGroup>
  <ProjectReference Include="path\to\AspNetCoreFileManager.csproj" />
</ItemGroup>
```

3. **Rebuild the Solution**:
```bash
dotnet clean
dotnet build
```

## Backend Issues

### Files Directory Not Found

**Symptoms**: Errors about missing directory or path not found.

**Solution**: Directory is created automatically, but you can create it manually:
```csharp
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");
if (!Directory.Exists(filesPath))
{
    Directory.CreateDirectory(filesPath);
}
builder.Services.AddFileManager(filesPath);
```

### API Endpoints Returning 404

**Symptoms**: AJAX calls fail with 404 errors.

**Solutions**:

1. **Verify Controller Route**:
```csharp
[Route("api/[controller]")]
[ApiController]
public class FileManagerController : ControllerBase
```

2. **Check Endpoint URLs** in Tag Helper or JavaScript:
```html
<file-manager 
    ajax-url="/api/FileManager/FileOperations"
    upload-url="/api/FileManager/Upload"
    download-url="/api/FileManager/Download"
    get-image-url="/api/FileManager/GetImage">
</file-manager>
```

3. **Verify Routing** in `Program.cs`:
```csharp
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
```

### Service Not Registered

**Symptoms**: 
- `InvalidOperationException`: Unable to resolve service
- Dependency injection errors

**Solution**: Register service in `Program.cs`:
```csharp
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");
builder.Services.AddFileManager(filesPath);
```

## Modal Issues

### Modal Overlay Blocking Everything

**Symptoms**: After clicking a toolbar button (Upload, Rename, etc.), a dark overlay appears and blocks all interactions.

**Cause**: Old CSS had modal pointer events always enabled.

**Solution**: Update to latest CSS file. The modal now uses:
```css
.filemanager-modal {
    pointer-events: none;  /* Default: don't block clicks */
}
.filemanager-modal:not(.hidden) {
    pointer-events: auto;  /* Only active when visible */
}
```

If you still see this issue:
1. Clear browser cache (Ctrl+F5)
2. Verify you have the latest `filemanager.css`
3. Check browser console for CSS loading errors

## Upload Issues

### Upload Fails with Large Files

**Symptoms**: Upload fails for files larger than 30MB.

**Solution**: Increase request body size limits:

1. **In Program.cs**:
```csharp
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100MB
    options.ValueLengthLimit = int.MaxValue;
});
```

2. **For Kestrel** (appsettings.json):
```json
{
  "Kestrel": {
    "Limits": {
      "MaxRequestBodySize": 104857600
    }
  }
}
```

3. **For IIS** (web.config):
```xml
<system.webServer>
  <security>
    <requestFiltering>
      <requestLimits maxAllowedContentLength="104857600" />
    </requestFiltering>
  </security>
</system.webServer>
```

### Drag-and-Drop Not Working

**Symptoms**: Cannot drag files to upload area.

**Solutions**:

1. Verify `allow-drag-drop="true"` is set
2. Check browser console for JavaScript errors
3. Ensure `filemanager-events.js` is loaded

## Permission Issues

### Access Denied Errors

**Symptoms**: "Access denied" or "Path traversal detected" errors.

**Cause**: Security protection against path traversal attacks.

**Solution**: Ensure you're accessing paths within the configured root directory. Don't use paths like `/../../../`.

### Cannot Delete/Rename Root Folder

**Symptoms**: Error when trying to modify root folder.

**Cause**: Built-in protection against root folder modification.

**Solution**: This is by design. Create subfolders within the root to organize files.

## Display Issues

### File Manager Too Small/Large

**Solution**: Set the height attribute:
```html
<file-manager height="800px"></file-manager>
```

Or use CSS:
```css
#myFileManager {
    height: 600px;
}
```

### Icons Not Showing

**Symptoms**: Boxes or missing icons instead of Font Awesome icons.

**Solution**: Ensure Font Awesome is loaded:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

### RTL Layout Not Working

**Solution**: Set the `enable-rtl` attribute:
```html
<file-manager enable-rtl="true"></file-manager>
```

## Performance Issues

### Slow Loading with Many Files

**Solutions**:

1. **Enable pagination** (future feature)
2. **Optimize file count** by organizing into subfolders
3. **Use lazy loading** for images

### Memory Issues

**Solution**: Increase memory limits if handling large files:
```csharp
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 524288000; // 500MB
});
```

## Browser-Specific Issues

### Works in Chrome but not Safari

**Solutions**:
1. Check browser console for specific errors
2. Verify ES6+ syntax compatibility
3. Test with latest browser version

### Mobile Browser Issues

**Solutions**:
1. Ensure responsive CSS is loaded
2. Test viewport meta tag:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## Debugging Tips

### Enable Verbose Logging

Add event handlers to debug:
```javascript
var fm = new FileManager('#myElement', options);

fm.on('success', function(e) {
    console.log('Success:', e);
});

fm.on('failure', function(e) {
    console.error('Failure:', e);
});
```

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for failed requests
4. Check request/response payloads

### Verify Backend Service

Test API endpoints directly:
```bash
curl -X POST https://localhost:5001/api/FileManager/FileOperations \
  -H "Content-Type: application/json" \
  -d '{"action":"read","path":"/"}'
```

## Getting Help

If none of these solutions work:

1. **Check the GitHub Issues**: https://github.com/yourusername/AspNetCoreFileManager/issues
2. **Review the Demo App**: See `samples/AspNetCoreFileManager.Demo/`
3. **Check Documentation**: See `docs/` folder
4. **Create a New Issue**: Provide:
   - Error message
   - Browser and version
   - ASP.NET Core version
   - Code snippets
   - Steps to reproduce

## Common Mistakes

### ❌ Don't Do This
```html
<!-- Wrong: Scripts in wrong order -->
<script src="~/lib/aspnetcorefilemanager/js/filemanager-events.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
```

### ✅ Do This
```html
<!-- Correct: filemanager.js must be first -->
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-events.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-utils.js"></script>
```

### ❌ Don't Do This
```csharp
// Wrong: Missing service registration
public class FileManagerController : ControllerBase
{
    // Will fail - service not registered
}
```

### ✅ Do This
```csharp
// Correct: Register service first
builder.Services.AddFileManager(filesPath);
```

---

**Still having issues?** Open a GitHub issue with details!

