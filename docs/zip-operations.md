# ZIP Operations

The ASP.NET Core File Manager provides built-in support for creating ZIP archives from selected files and extracting ZIP files.

## Features

- **Create ZIP Archive**: Compress selected files and folders into a ZIP archive
- **Extract ZIP**: Extract ZIP archives to the current folder
- **Toolbar Integration**: ZIP and Unzip commands in the toolbar
- **Context Menu Integration**: Right-click to create or extract ZIP files
- **Recursive Folder Compression**: Automatically includes all subfolder contents
- **Smart Naming**: Prevents name conflicts when extracting

## Creating ZIP Archives

### Using the Toolbar

1. Select one or more files or folders
2. Click the **Create ZIP** button in the toolbar
3. Enter a name for the ZIP archive (`.zip` extension is optional)
4. Click **Create ZIP**

The ZIP archive will be created in the current folder.

### Using the Context Menu

1. Select one or more files or folders
2. Right-click to open the context menu
3. Select **Create ZIP**
4. Enter a name for the ZIP archive
5. Click **Create ZIP**

### Programmatically

```csharp
var response = fileManagerService.CreateZip(
    path: "/Documents",
    names: new[] { "file1.txt", "folder1", "image.png" },
    zipName: "my-archive.zip"
);

if (response.Error != null)
{
    // Handle error
    Console.WriteLine(response.Error.Message);
}
else
{
    // ZIP created successfully
    var zipFile = response.Files[0];
    Console.WriteLine($"Created: {zipFile.Name}");
}
```

## Extracting ZIP Archives

### Using the Toolbar

1. Select a ZIP file (exactly one)
2. Click the **Extract ZIP** button in the toolbar
3. Confirm the extraction

The contents will be extracted to a new folder with the same name as the ZIP file (without `.zip`).

### Using the Context Menu

1. Select a ZIP file (exactly one)
2. Right-click to open the context menu
3. Select **Extract ZIP**
4. Confirm the extraction

### Programmatically

```csharp
var response = fileManagerService.ExtractZip(
    path: "/Documents",
    zipFileName: "archive.zip",
    targetPath: null  // null = extract to current folder
);

if (response.Error != null)
{
    // Handle error
    Console.WriteLine(response.Error.Message);
}
else
{
    // ZIP extracted successfully
    var extractedFolder = response.Files[0];
    Console.WriteLine($"Extracted to: {extractedFolder.Name}");
}
```

## Behavior Details

### Creating ZIP Archives

- **Multiple Selection**: You can select multiple files and folders
- **Folder Contents**: When a folder is selected, all its contents (including subfolders) are included
- **Name Conflicts**: If a ZIP file with the same name already exists, an error is returned
- **Automatic Extension**: If you don't include `.zip` in the name, it's automatically added
- **Path Preservation**: Folder structures are preserved in the ZIP archive

### Extracting ZIP Archives

- **Single Selection**: You can only extract one ZIP file at a time
- **Target Folder**: Contents are extracted to a folder named after the ZIP file (without `.zip`)
- **Name Conflicts**: If a folder with the extraction name exists, a number is appended (e.g., `archive (1)`)
- **Validation**: Only `.zip` files can be extracted

## Configuration

ZIP operations are available by default in the toolbar and context menu. You can customize which commands appear:

### Toolbar Configuration

```csharp
<file-manager id="myFileManager"
             path="/"
             toolbar-items='["NewFolder", "Upload", "Delete", "Download", "Zip", "Unzip", "Refresh"]'>
</file-manager>
```

### Context Menu Configuration

```html
<script>
var fileManager = new FileManager('#myFileManager', {
    path: '/',
    contextMenuSettings: {
        visible: true,
        items: ['Open', '|', 'Cut', 'Copy', 'Paste', '|', 'Zip', 'Unzip', '|', 'Delete', 'Rename', '|', 'Details']
    }
});
</script>
```

## API Reference

### IFileManagerService.CreateZip

Creates a ZIP archive from selected files and folders.

**Parameters:**
- `path` (string): The current directory path
- `names` (string[]): Array of file/folder names to include in the ZIP
- `zipName` (string): Name for the ZIP archive

**Returns:** `FileManagerResponse` containing the created ZIP file information or error details

### IFileManagerService.ExtractZip

Extracts a ZIP archive to the current or specified folder.

**Parameters:**
- `path` (string): The current directory path
- `zipFileName` (string): Name of the ZIP file to extract
- `targetPath` (string, optional): Target extraction path (defaults to current path)

**Returns:** `FileManagerResponse` containing the extracted folder information or error details

## Error Handling

Common errors you may encounter:

| Error Code | Message | Solution |
|------------|---------|----------|
| 400 | A file with the name 'X' already exists | Choose a different name or delete the existing file |
| 400 | File is not a ZIP archive | Ensure you're selecting a valid `.zip` file |
| 404 | ZIP file 'X' not found | Verify the file exists and hasn't been moved/deleted |
| 500 | Error creating ZIP archive | Check file permissions and disk space |
| 500 | Error extracting ZIP archive | Verify the ZIP file isn't corrupted and you have write permissions |

## JavaScript Events

You can listen for ZIP operation events:

```javascript
var fileManager = new FileManager('#myFileManager', {
    path: '/',
    success: function(args) {
        if (args.response.Files) {
            console.log('Operation completed successfully');
        }
    },
    failure: function(args) {
        if (args.error) {
            console.error('Operation failed:', args.error.message);
        }
    }
});
```

## Security Considerations

1. **Path Traversal**: The service validates all paths to prevent directory traversal attacks
2. **File Permissions**: Operations respect the underlying file system permissions
3. **Root Folder Protection**: The root folder cannot be modified or included in operations
4. **Size Limits**: Consider implementing size limits for ZIP operations in production
5. **Allowed Paths**: Use the `AllowedPaths` configuration to restrict which directories can be accessed

## Example Use Cases

### Backup Selected Files

```csharp
// User selects important files
var backup = fileManagerService.CreateZip(
    path: "/Documents/Important",
    names: new[] { "report.pdf", "data.xlsx", "notes.txt" },
    zipName: $"backup-{DateTime.Now:yyyy-MM-dd}.zip"
);
```

### Extract Uploaded Archive

```csharp
// After user uploads a ZIP file
var result = fileManagerService.ExtractZip(
    path: "/Uploads",
    zipFileName: "project-files.zip"
);
```

### Download Multiple Files

```csharp
// Create temporary ZIP for download
var zip = fileManagerService.CreateZip(
    path: "/Shared",
    names: selectedFiles,
    zipName: "download.zip"
);

// Use the download endpoint to send to user
```

## Browser Compatibility

ZIP operations are supported in all modern browsers:

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## Performance Tips

1. **Large Files**: Creating ZIPs with large files may take time. Consider implementing progress indicators.
2. **Many Files**: Compressing folders with thousands of files can be slow. Consider warning users.
3. **Async Operations**: ZIP operations run synchronously. For production, consider using background tasks for large operations.

## Next Steps

- Learn about [File Operations](file-operations.md)
- Explore [Upload and Download](upload-download.md)
- Review [API Reference](api-reference.md)

