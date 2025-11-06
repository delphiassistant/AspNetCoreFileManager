namespace AspNetCoreFileManager.Models;

/// <summary>
/// Represents the request model for file manager operations
/// </summary>
public class FileManagerRequest
{
    /// <summary>
    /// The action to perform (read, delete, copy, move, details, create, search, rename, etc.)
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// The current path in the file system
    /// </summary>
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// The target path for operations like copy/move
    /// </summary>
    public string? TargetPath { get; set; }

    /// <summary>
    /// Array of file/folder names to operate on
    /// </summary>
    public string[]? Names { get; set; }

    /// <summary>
    /// The new name for rename operations
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// The new name for rename operations
    /// </summary>
    public string? NewName { get; set; }

    /// <summary>
    /// Search string for search operations
    /// </summary>
    public string? SearchString { get; set; }

    /// <summary>
    /// Whether to show hidden items
    /// </summary>
    public bool ShowHiddenItems { get; set; }

    /// <summary>
    /// Whether search should be case sensitive
    /// </summary>
    public bool CaseSensitive { get; set; }

    /// <summary>
    /// Whether to show file extension
    /// </summary>
    public bool ShowFileExtension { get; set; } = true;

    /// <summary>
    /// Whether to rename files if they exist
    /// </summary>
    public string[]? RenameFiles { get; set; }

    /// <summary>
    /// Additional data for the request
    /// </summary>
    public FileManagerItem[]? Data { get; set; }

    /// <summary>
    /// Target data for copy/move operations
    /// </summary>
    public FileManagerItem? TargetData { get; set; }

    /// <summary>
    /// File ID for image preview
    /// </summary>
    public string? Id { get; set; }
}

