namespace AspNetCoreFileManager.Models;

/// <summary>
/// Represents a file or folder in the file manager
/// </summary>
public class FileManagerItem
{
    /// <summary>
    /// Name of the file or folder
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Size in bytes
    /// </summary>
    public long Size { get; set; }

    /// <summary>
    /// Whether this is a file (false for folders)
    /// </summary>
    public bool IsFile { get; set; }

    /// <summary>
    /// Date when the item was created
    /// </summary>
    public DateTime DateCreated { get; set; }

    /// <summary>
    /// Date when the item was last modified
    /// </summary>
    public DateTime DateModified { get; set; }

    /// <summary>
    /// Type of the item (file extension or "Folder")
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Whether the item has child items (for folders)
    /// </summary>
    public bool HasChild { get; set; }

    /// <summary>
    /// Filter path (full path relative to root)
    /// </summary>
    public string FilterPath { get; set; } = string.Empty;

    /// <summary>
    /// Unique identifier for the item
    /// </summary>
    public string? Id { get; set; }

    /// <summary>
    /// Parent ID for hierarchical structure
    /// </summary>
    public string? ParentId { get; set; }

    /// <summary>
    /// Icon CSS class for the item
    /// </summary>
    public string? IconClass { get; set; }

    /// <summary>
    /// Permission information
    /// </summary>
    public FileManagerPermission? Permission { get; set; }
}

/// <summary>
/// Represents permissions for a file or folder
/// </summary>
public class FileManagerPermission
{
    public bool Read { get; set; } = true;
    public bool Write { get; set; } = true;
    public bool Copy { get; set; } = true;
    public bool Download { get; set; } = true;
    public bool Upload { get; set; } = true;
    public bool Message { get; set; } = true;
}

