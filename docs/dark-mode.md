# Dark Mode Support

The ASP.NET Core File Manager includes optional dark mode support.

## How to Enable Dark Mode

### Option 1: Tag Helper Attribute (Recommended)

```html
<file-manager id="myFileManager" dark-mode="true"></file-manager>
```

### Option 2: CSS Class

Add the `dark-mode` class directly:

```html
<file-manager id="myFileManager" css-class="dark-mode"></file-manager>
```

### Option 3: JavaScript

Add the class programmatically:

```javascript
document.querySelector('#myFileManager').classList.add('dark-mode');
```

## Important Notes

### ✅ Dark Mode is Opt-In

**Dark mode is disabled by default.** The file manager will always display in light mode unless you explicitly enable it using one of the methods above.

This change was made because:
- The previous `@media (prefers-color-scheme: dark)` implementation was automatically applying dark mode based on system preferences
- This caused unexpected dark backgrounds even when users wanted light mode
- Now you have full control over when dark mode is used

### Previous Behavior (Removed)

The old CSS used a media query that automatically detected system preferences:

```css
/* OLD - Removed */
@media (prefers-color-scheme: dark) {
    .filemanager {
        background-color: #212529; /* Would apply automatically */
    }
}
```

### New Behavior (Current)

Dark mode is now class-based and explicit:

```css
/* NEW - Current */
.filemanager.dark-mode {
    background-color: #1e1e1e; /* Only applies when class is present */
}
```

## Dark Mode Colors

The dark mode theme uses carefully chosen colors for optimal readability:

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | `#fff` | `#1e1e1e` |
| Text | `#212529` | `#e0e0e0` |
| Borders | `#dee2e6` | `#3d3d3d` |
| Toolbar | `#f8f9fa` | `#2d2d2d` |
| Buttons | `#fff` | `#3d3d3d` |
| Hover | `#e9ecef` | `#4d4d4d` |
| Selected | `#cfe2ff` | `#1a3a52` |

## Examples

### Basic Dark Mode

```html
<file-manager 
    id="darkFileManager" 
    dark-mode="true"
    path="/">
</file-manager>
```

### Dark Mode with RTL

```html
<file-manager 
    id="darkRtlFileManager" 
    dark-mode="true"
    enable-rtl="true"
    path="/">
</file-manager>
```

### Toggle Dark Mode with JavaScript

```html
<button onclick="toggleDarkMode()">Toggle Dark Mode</button>

<file-manager id="myFileManager" path="/"></file-manager>

<script>
function toggleDarkMode() {
    const fm = document.querySelector('#myFileManager');
    fm.classList.toggle('dark-mode');
}
</script>
```

### Dynamic Dark Mode Based on System Preferences (Advanced)

If you want to respect system preferences but still have manual control:

```html
<file-manager id="myFileManager" path="/"></file-manager>

<script>
    // Check system preference on load
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.querySelector('#myFileManager').classList.add('dark-mode');
    }
    
    // Listen for changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const fm = document.querySelector('#myFileManager');
        if (e.matches) {
            fm.classList.add('dark-mode');
        } else {
            fm.classList.remove('dark-mode');
        }
    });
</script>
```

## Browser Compatibility

Dark mode works in all modern browsers:
- ✅ Chrome 76+
- ✅ Firefox 67+
- ✅ Safari 12.1+
- ✅ Edge 79+

## Troubleshooting

### Dark Mode Not Applying

**Problem**: File manager still shows light mode even with `dark-mode="true"`

**Solutions**:
1. Clear browser cache (Ctrl+F5)
2. Verify the CSS file is the latest version
3. Check browser DevTools to ensure the `dark-mode` class is on the element
4. Verify CSS file is loaded correctly

### Colors Look Wrong

**Problem**: Some elements don't match the dark theme

**Solution**: Make sure you're using the latest `filemanager.css` file. The dark mode was improved to fix color inconsistencies.

### Light Text on Light Background

**Problem**: After the fix, if you see light text on light background

**Solution**: This was the bug! Make sure you have the updated CSS file where dark mode is class-based, not media query-based.

## Customizing Dark Mode Colors

You can override dark mode colors with custom CSS:

```css
.filemanager.dark-mode {
    background-color: #your-bg-color;
    color: #your-text-color;
}

.filemanager.dark-mode .filemanager-toolbar {
    background-color: #your-toolbar-color;
}

/* Add more overrides as needed */
```

Place this CSS after the file manager CSS:

```html
<link rel="stylesheet" href="~/lib/aspnetcorefilemanager/css/filemanager.css">
<link rel="stylesheet" href="~/css/custom-dark-mode.css">
```

## Migration Guide

If you were using the old auto-dark-mode version:

### Before (Automatic)
```html
<!-- Dark mode would apply automatically based on system preferences -->
<file-manager id="myFileManager"></file-manager>
```

### After (Explicit)
```html
<!-- Now you must explicitly enable dark mode -->
<file-manager id="myFileManager" dark-mode="true"></file-manager>
```

If you want the automatic behavior back, use the JavaScript approach shown in the "Dynamic Dark Mode" example above.

## See Also

- [Configuration Guide](configuration.md)
- [Customization Guide](customization.md)
- [Troubleshooting](../TROUBLESHOOTING.md)

