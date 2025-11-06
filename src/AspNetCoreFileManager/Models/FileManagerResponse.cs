namespace AspNetCoreFileManager.Models;

/// <summary>
/// Represents the response from file manager operations
/// </summary>
public class FileManagerResponse
{
    /// <summary>
    /// Current working directory information
    /// </summary>
    public FileManagerItem? Cwd { get; set; }

    /// <summary>
    /// List of files and folders
    /// </summary>
    public List<FileManagerItem>? Files { get; set; }

    /// <summary>
    /// Error information if the operation failed
    /// </summary>
    public ErrorDetails? Error { get; set; }

    /// <summary>
    /// Details about the operation result
    /// </summary>
    public FileDetails? Details { get; set; }
}

/// <summary>
/// Represents error details
/// </summary>
public class ErrorDetails
{
    /// <summary>
    /// Error code
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Error message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// List of files that caused errors
    /// </summary>
    public List<string>? FileExists { get; set; }
}

/// <summary>
/// Represents file details for the details operation
/// </summary>
public class FileDetails
{
    /// <summary>
    /// Name of the file/folder
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Location/path of the item
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// Size of the item
    /// </summary>
    public string? Size { get; set; }

    /// <summary>
    /// Creation date
    /// </summary>
    public DateTime? Created { get; set; }

    /// <summary>
    /// Modified date
    /// </summary>
    public DateTime? Modified { get; set; }

    /// <summary>
    /// Whether multiple items are selected
    /// </summary>
    public bool MultipleFiles { get; set; }

    /// <summary>
    /// Names of selected items
    /// </summary>
    public List<string>? Names { get; set; }
}

