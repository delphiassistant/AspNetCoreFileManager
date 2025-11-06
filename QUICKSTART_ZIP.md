# ZIP Operations Quick Start

Quick reference guide for using ZIP compression and extraction features in ASP.NET Core File Manager.

## Create ZIP Archive

### From Toolbar
1. Select files/folders (single or multiple)
2. Click **Create ZIP** button (archive icon)
3. Enter archive name (e.g., `backup.zip`)
4. Click **Create ZIP**

### From Context Menu
1. Select files/folders
2. Right-click → **Create ZIP**
3. Enter archive name
4. Click **Create ZIP**

### Programmatically (C#)
```csharp
var result = fileManagerService.CreateZip(
    path: "/Documents",
    names: new[] { "file1.txt", "folder1" },
    zipName: "my-archive.zip"
);
```

## Extract ZIP Archive

### From Toolbar
1. Select ONE ZIP file
2. Click **Extract ZIP** button
3. Confirm extraction

### From Context Menu
1. Select ONE ZIP file
2. Right-click → **Extract ZIP**
3. Confirm extraction

### Programmatically (C#)
```csharp
var result = fileManagerService.ExtractZip(
    path: "/Documents",
    zipFileName: "archive.zip"
);
```

## Default Configuration

ZIP commands are included by default in:
- **Toolbar**: `['NewFolder', 'Upload', 'Delete', 'Download', 'Rename', 'Zip', 'Unzip', 'Refresh', 'View', 'Details']`
- **Context Menu**: `['Open', '|', 'Cut', 'Copy', 'Paste', 'Delete', 'Rename', '|', 'Zip', 'Unzip', '|', 'Details']`

## Customizing ZIP Commands

### Show only ZIP operations
```html
<file-manager id="zipManager"
             path="/"
             toolbar-items='["Zip", "Unzip", "Refresh"]'>
</file-manager>
```

### Remove ZIP from context menu
```javascript
var fm = new FileManager('#myFileManager', {
    contextMenuSettings: {
        items: ['Open', 'Delete', 'Rename', 'Details']
    }
});
```

## Important Notes

### Creating ZIP
- ✅ Can select multiple files and folders
- ✅ Folder contents included recursively
- ✅ `.zip` extension added automatically
- ❌ Error if ZIP with same name exists

### Extracting ZIP
- ✅ Creates folder with ZIP name (without .zip)
- ✅ Auto-renames if folder exists (e.g., `archive (1)`)
- ❌ Can only extract one ZIP at a time
- ❌ Must be a valid `.zip` file

## Icons Used

- **Create ZIP**: `fa-file-archive` (archive icon)
- **Extract ZIP**: `fa-file-zipper` (unzip icon)

Make sure Font Awesome is loaded in your layout!

## Full Documentation

For detailed information, examples, and troubleshooting:
- 📖 [ZIP Operations Documentation](docs/zip-operations.md)
- 📖 [API Reference](docs/api-reference.md)
- 📖 [Configuration Guide](docs/configuration.md)

