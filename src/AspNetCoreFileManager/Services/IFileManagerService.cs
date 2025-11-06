using AspNetCoreFileManager.Models;
using Microsoft.AspNetCore.Http;

namespace AspNetCoreFileManager.Services;

/// <summary>
/// Interface for file manager operations
/// </summary>
public interface IFileManagerService
{
    /// <summary>
    /// Gets files and folders from the specified path
    /// </summary>
    FileManagerResponse GetFiles(string path, bool showHiddenItems = false, string[]? filter = null);

    /// <summary>
    /// Creates a new folder
    /// </summary>
    FileManagerResponse CreateFolder(string path, string name);

    /// <summary>
    /// Deletes files or folders
    /// </summary>
    FileManagerResponse Delete(string path, string[] names);

    /// <summary>
    /// Renames a file or folder
    /// </summary>
    FileManagerResponse Rename(string path, string oldName, string newName, bool showFileExtension = true);

    /// <summary>
    /// Copies files or folders
    /// </summary>
    FileManagerResponse Copy(string path, string targetPath, string[] names, string[]? renameFiles = null, FileManagerItem? targetData = null);

    /// <summary>
    /// Moves files or folders
    /// </summary>
    FileManagerResponse Move(string path, string targetPath, string[] names, string[]? renameFiles = null, FileManagerItem? targetData = null);

    /// <summary>
    /// Gets details of files or folders
    /// </summary>
    FileManagerResponse GetDetails(string path, string[]? names = null, FileManagerItem[]? data = null);

    /// <summary>
    /// Searches for files and folders
    /// </summary>
    FileManagerResponse Search(string path, string searchString, bool showHiddenItems = false, bool caseSensitive = false);

    /// <summary>
    /// Uploads files
    /// </summary>
    FileManagerResponse Upload(string path, IFormFileCollection files, string action = "save");

    /// <summary>
    /// Downloads files
    /// </summary>
    (byte[] FileContent, string FileName, string ContentType) Download(string path, string[]? names = null, FileManagerItem[]? data = null);

    /// <summary>
    /// Gets an image for preview
    /// </summary>
    (byte[] FileContent, string ContentType) GetImage(string path, string? id = null);

    /// <summary>
    /// Creates a ZIP archive from selected files
    /// </summary>
    FileManagerResponse CreateZip(string path, string[] names, string zipName);

    /// <summary>
    /// Extracts a ZIP archive
    /// </summary>
    FileManagerResponse ExtractZip(string path, string zipFileName, string? targetPath = null);
}

