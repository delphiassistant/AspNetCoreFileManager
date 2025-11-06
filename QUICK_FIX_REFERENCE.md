# Quick Fix Reference Card

## 🔧 Issues Fixed in v1.0.1

### Issue #1: Unwanted Dark Mode
**Problem**: File manager appeared dark even in light mode  
**Cause**: CSS media query `@media (prefers-color-scheme: dark)` applied automatically  
**Fix**: Changed to opt-in class-based dark mode  

### Issue #2: JavaScript Error
**Problem**: `Cannot read properties of undefined (reading 'map')`  
**Cause**: Tag Helper didn't populate toolbar/contextMenu items array  
**Fix**: Added null checks and default empty arrays  

## 🚀 Quick Actions

### To Get Light Mode (Default)
```html
<!-- Just use normally - light mode is default -->
<file-manager id="myFileManager" path="/"></file-manager>
```
**Result**: Clean white/light background ✅

### To Enable Dark Mode
```html
<!-- Add dark-mode attribute -->
<file-manager id="myFileManager" path="/" dark-mode="true"></file-manager>
```
**Result**: Properly themed dark interface 🌙

### To Update Your Project
```bash
# 1. Copy new CSS file
cp src/AspNetCoreFileManager/wwwroot/css/filemanager.css \
   wwwroot/lib/aspnetcorefilemanager/css/

# 2. Copy new JS files
cp src/AspNetCoreFileManager/wwwroot/js/*.js \
   wwwroot/lib/aspnetcorefilemanager/js/

# 3. Clear cache and reload
# Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
```

## 📋 Checklist

After updating, verify:

- [ ] File manager shows light background by default
- [ ] No JavaScript errors in console
- [ ] Files and folders display correctly
- [ ] All operations work (upload, download, rename, etc.)
- [ ] Dark mode works when `dark-mode="true"` is set
- [ ] Toolbar and context menu appear correctly

## 🆘 Quick Troubleshooting

| Symptom | Solution |
|---------|----------|
| Still showing dark background | Clear browser cache (Ctrl+F5) |
| JavaScript errors | Copy all 3 JS files: filemanager.js, filemanager-events.js, filemanager-utils.js |
| Toolbar missing | Ensure latest filemanager.js is loaded |
| CSS not updating | Hard refresh (Ctrl+Shift+R) or check DevTools Network tab |

## 📖 Full Documentation

- **Dark Mode Guide**: [docs/dark-mode.md](docs/dark-mode.md)
- **Detailed Fix Info**: [DARK_MODE_FIX.md](DARK_MODE_FIX.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

## 💡 Key Takeaway

**Before**: Dark mode was automatic (bad)  
**After**: Dark mode is opt-in (good)

Default is now light mode for everyone! 🌞

