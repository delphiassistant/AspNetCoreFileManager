# Migration Guide: v1.0.4 → v1.0.5

## Overview

Version 1.0.5 introduces a simplified JavaScript file structure. All FileManager JavaScript has been merged into a single file for better performance and easier maintenance.

## What Changed

### JavaScript Files

**Before (v1.0.4):**
```
wwwroot/lib/aspnetcorefilemanager/js/
├── filemanager.js          (core class)
├── filemanager-events.js   (event handlers)
├── filemanager-utils.js    (utilities)
├── filemanager-zip.js      (ZIP operations)
├── filemanager-destroy.js  (cleanup)
└── filemanager-i18n.js     (localization)
```

**After (v1.0.5):**
```
wwwroot/lib/aspnetcorefilemanager/js/
├── filemanager.js          (merged: core + events + utils + zip + destroy)
└── filemanager-i18n.js     (localization - kept separate)
```

## Migration Steps

### Step 1: Update _Layout.cshtml

**Old Code (Remove this):**
```html
<!-- File Manager JS - OLD -->
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-events.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-utils.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-zip.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-destroy.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-i18n.js"></script>
```

**New Code (Use this):**
```html
<!-- File Manager JS (Merged: core + events + utils + zip + destroy) -->
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>

<!-- Optional: Only if you need localization -->
<script src="~/lib/aspnetcorefilemanager/js/filemanager-i18n.js"></script>
```

### Step 2: Update NuGet Package

```bash
dotnet add package AspNetCoreFileManager --version 1.0.5
```

Or update in your `.csproj`:
```xml
<PackageReference Include="AspNetCoreFileManager" Version="1.0.5" />
```

### Step 3: Clean Old Files (Optional)

If you manually copied files, remove the old separate files:
```
wwwroot/lib/aspnetcorefilemanager/js/
- DELETE: filemanager-events.js
- DELETE: filemanager-utils.js
- DELETE: filemanager-zip.js
- DELETE: filemanager-destroy.js
- KEEP: filemanager.js (new merged version)
- KEEP: filemanager-i18n.js
```

### Step 4: Test Your Application

1. Build the project:
   ```bash
   dotnet build
   ```

2. Run the application:
   ```bash
   dotnet run
   ```

3. Verify all functionality works:
   - [ ] File upload
   - [ ] File download
   - [ ] Create folder
   - [ ] Delete files
   - [ ] ZIP operations
   - [ ] Localization (if using)

## Benefits of This Change

### Performance ⚡
- **6 HTTP requests → 2 HTTP requests** (or 1 if not using i18n)
- Faster page load times
- Better browser caching

### Developer Experience 🛠️
- Simpler `_Layout.cshtml` configuration
- Single file to manage
- Clear separation: core vs localization

### Maintenance 🔧
- Easier to update
- Less room for version mismatches
- Cleaner project structure

## No Code Changes Required

**Important:** Your existing JavaScript code does NOT need to change!

All APIs remain the same:
```javascript
// This still works exactly the same
const fm = new FileManager('#myElement', {
    path: '/',
    view: 'largeicons'
});

fm.on('success', function(e) {
    console.log('Success:', e);
});
```

## Localization Support

### Without Localization

If you DON'T need multi-language support:
```html
<!-- Just load this -->
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
```

### With Localization

If you DO need multi-language support:
```html
<!-- Load both files -->
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-i18n.js"></script>
```

Then in your code:
```javascript
(async function() {
    const fm = new FileManager('#myElement', {
        path: '/'
    });
    
    // Load locale
    await fm.initializeWithLocale('fa');  // or 'en'
})();
```

## Common Issues

### Issue 1: 404 Errors for Old JS Files

**Problem:** Console shows 404 errors for `filemanager-events.js`, etc.

**Solution:** You're loading the old files. Update your `_Layout.cshtml` as shown in Step 1.

### Issue 2: FileManager is undefined

**Problem:** JavaScript error: `FileManager is not defined`

**Solution:** Make sure `filemanager.js` loads before any code that uses it:
```html
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>

<!-- Your code using FileManager -->
<script>
    const fm = new FileManager('#myElement', { ... });
</script>
```

### Issue 3: Localization Not Working

**Problem:** File manager shows English even when using `initializeWithLocale('fa')`

**Solution:** Make sure you're loading `filemanager-i18n.js`:
```html
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-i18n.js"></script>
```

## Rollback (If Needed)

If you need to rollback to v1.0.4:

1. Downgrade package:
   ```bash
   dotnet add package AspNetCoreFileManager --version 1.0.4
   ```

2. Restore old `_Layout.cshtml` configuration (load all 6 JS files)

## Documentation Updates

All documentation has been updated to reflect the new structure:
- [README.md](../README.md)
- [README_FA.md](../README_FA.md) (Persian)
- [docs/README.md](../docs/README.md)
- [CHANGELOG.md](../CHANGELOG.md)

## Need Help?

- **GitHub Issues**: [Report a problem](https://github.com/delphiassistant/AspNetCoreFileManager/issues)
- **Documentation**: [Browse docs](../docs/README.md)
- **Examples**: Check the [Demo project](../samples/AspNetCoreFileManager.Demo/)

---

**Migration Summary:**
1. ✅ Update `_Layout.cshtml` (load only 2 files instead of 6)
2. ✅ Update NuGet package to v1.0.5
3. ✅ Test your application
4. ✅ Done! No code changes needed.

**Estimated migration time:** 5 minutes ⏱️
