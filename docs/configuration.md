# Configuration Guide

This guide covers all configuration options for ASP.NET Core File Manager.

## Tag Helper Configuration

### Basic Attributes

```html
<file-manager 
    id="myFileManager"
    path="/Documents"
    view="largeicons"
    height="600px">
</file-manager>
```

### All Available Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | string | auto-generated | Unique identifier for the instance |
| `path` | string | "/" | Initial path to display |
| `view` | string | "largeicons" | View mode: "largeicons" or "details" |
| `height` | string | "600px" | Height of the file manager |
| `css-class` | string | null | Additional CSS classes |
| `ajax-url` | string | /api/FileManager/FileOperations | File operations endpoint |
| `upload-url` | string | /api/FileManager/Upload | Upload endpoint |
| `download-url` | string | /api/FileManager/Download | Download endpoint |
| `get-image-url` | string | /api/FileManager/GetImage | Image preview endpoint |
| `allow-drag-drop` | bool | true | Enable drag-and-drop upload |
| `allow-multi-selection` | bool | true | Allow multiple file selection |
| `show-file-extension` | bool | true | Show file extensions |
| `show-hidden-items` | bool | false | Show hidden files |
| `show-thumbnail` | bool | true | Show image thumbnails |
| `enable-persistence` | bool | false | Save state on page reload |
| `enable-rtl` | bool | false | Enable RTL layout |
| `show-toolbar` | bool | true | Show toolbar |
| `show-navigation` | bool | true | Show navigation pane |
| `show-context-menu` | bool | true | Show context menu |

## JavaScript Configuration

### Full Configuration Example

```javascript
var fileManager = new FileManager('#myElement', {
    // Basic settings
    path: '/Documents',
    view: 'largeicons',
    
    // Features
    allowDragAndDrop: true,
    allowMultiSelection: true,
    showFileExtension: true,
    showHiddenItems: false,
    showThumbnail: true,
    enablePersistence: false,
    enableRtl: false,
    
    // AJAX endpoints
    ajaxSettings: {
        url: '/api/FileManager/FileOperations',
        uploadUrl: '/api/FileManager/Upload',
        downloadUrl: '/api/FileManager/Download',
        getImageUrl: '/api/FileManager/GetImage'
    },
    
    // Toolbar configuration
    toolbarSettings: {
        visible: true,
        items: [
            'NewFolder',
            'Upload',
            'Delete',
            'Download',
            'Rename',
            'SortBy',
            'Refresh',
            'Selection',
            'View',
            'Details'
        ]
    },
    
    // Navigation pane configuration
    navigationPaneSettings: {
        visible: true,
        minWidth: '200px',
        maxWidth: '400px'
    },
    
    // Context menu configuration
    contextMenuSettings: {
        visible: true,
        items: [
            'Open',
            '|',
            'Cut',
            'Copy',
            'Paste',
            'Delete',
            'Rename',
            '|',
            'Details'
        ]
    },
    
    // Search configuration
    searchSettings: {
        allowSearchOnTyping: true,
        filterType: 'contains',
        ignoreCase: true
    }
});
```

## Backend Configuration

### Service Registration Options

#### Option 1: Physical File System (Default)

```csharp
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");
builder.Services.AddFileManager(filesPath);
```

#### Option 2: Custom Implementation

```csharp
builder.Services.AddFileManager<MyCustomFileManagerService>();
```

### Custom File Provider Example

```csharp
public class MyCustomFileManagerService : IFileManagerService
{
    private readonly string _rootPath;
    
    public MyCustomFileManagerService(IConfiguration configuration)
    {
        _rootPath = configuration["FileManager:RootPath"];
    }
    
    public FileManagerResponse GetFiles(string path, bool showHiddenItems = false, string[]? filter = null)
    {
        // Your custom implementation
        // Can use Azure Blob Storage, AWS S3, Database, etc.
    }
    
    // Implement other interface methods...
}
```

### Configuration from appsettings.json

```json
{
  "FileManager": {
    "RootPath": "C:\\Files",
    "MaxUploadSize": 104857600,
    "AllowedExtensions": [".jpg", ".png", ".pdf", ".docx"],
    "BlockedExtensions": [".exe", ".dll", ".bat"]
  }
}
```

Access in your service:

```csharp
public class ConfigurableFileManagerService : PhysicalFileManagerService
{
    public ConfigurableFileManagerService(IConfiguration configuration) 
        : base(configuration["FileManager:RootPath"])
    {
        MaxUploadSize = configuration.GetValue<long>("FileManager:MaxUploadSize");
        // Configure other properties...
    }
}
```

## Toolbar Customization

### Available Toolbar Items

- `NewFolder` - Create new folder button
- `Upload` - File upload button
- `Delete` - Delete selected items button
- `Download` - Download selected items button
- `Rename` - Rename selected item button
- `SortBy` - Sort options dropdown
- `Refresh` - Refresh current folder button
- `Selection` - Toggle selection mode button
- `View` - Toggle view mode button
- `Details` - Show details of selected items button

### Custom Toolbar Example

```javascript
toolbarSettings: {
    visible: true,
    items: [
        'NewFolder',
        '|',  // Separator
        'Upload',
        'Download',
        '|',
        'Refresh',
        'View'
    ]
}
```

## Context Menu Customization

### Available Menu Items

- `Open` - Open folder
- `Cut` - Cut selected items
- `Copy` - Copy selected items
- `Paste` - Paste clipboard items
- `Delete` - Delete selected items
- `Rename` - Rename selected item
- `Details` - Show item details

### Custom Context Menu Example

```javascript
contextMenuSettings: {
    visible: true,
    items: [
        'Open',
        '|',
        'Copy',
        'Paste',
        '|',
        'Delete',
        'Details'
    ]
}
```

## View Customization

### Large Icons View

```javascript
{
    view: 'largeicons',
    showThumbnail: true
}
```

### Details View

```javascript
{
    view: 'details',
    // Columns are automatically displayed
}
```

## RTL Configuration

For right-to-left languages:

```html
<file-manager enable-rtl="true"></file-manager>
```

Or in JavaScript:

```javascript
{
    enableRtl: true
}
```

## Persistence Configuration

Enable state persistence:

```html
<file-manager enable-persistence="true"></file-manager>
```

This will save:
- Current path
- View mode
- Selected items

The state is saved to browser's localStorage.

## Security Configuration

### Path Traversal Protection

The built-in `PhysicalFileManagerService` automatically prevents path traversal attacks. All paths are validated against the configured root path.

### Custom Security

Implement custom security in your file provider:

```csharp
public FileManagerResponse GetFiles(string path, bool showHiddenItems = false, string[]? filter = null)
{
    // Check user permissions
    if (!await _authService.CanAccessPath(User, path))
    {
        return CreateErrorResponse("403", "Access denied");
    }
    
    // Continue with normal operation...
}
```

## Performance Configuration

### File Size Limits

Configure in your web server (`web.config` for IIS or `appsettings.json`):

```json
{
  "Kestrel": {
    "Limits": {
      "MaxRequestBodySize": 104857600
    }
  }
}
```

### Timeout Configuration

```csharp
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600;
    options.ValueLengthLimit = int.MaxValue;
});
```

## Next Steps

- Learn about the [API Reference](api-reference.md)
- Check out [Examples](examples.md)
- Read about [Customization](customization.md)

