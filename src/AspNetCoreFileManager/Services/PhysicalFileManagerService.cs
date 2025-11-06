using System.IO.Compression;
using System.Text;
using AspNetCoreFileManager.Models;
using Microsoft.AspNetCore.Http;

namespace AspNetCoreFileManager.Services;

/// <summary>
/// Physical file system implementation of the file manager service
/// </summary>
public class PhysicalFileManagerService : IFileManagerService
{
    private readonly string _rootPath;
    private readonly string[] _imageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp" };

    public PhysicalFileManagerService(string rootPath)
    {
        if (string.IsNullOrEmpty(rootPath))
            throw new ArgumentException("Root path cannot be null or empty", nameof(rootPath));

        _rootPath = Path.GetFullPath(rootPath);

        // Create root directory if it doesn't exist
        if (!Directory.Exists(_rootPath))
        {
            Directory.CreateDirectory(_rootPath);
        }
    }

    public FileManagerResponse GetFiles(string path, bool showHiddenItems = false, string[]? filter = null)
    {
        try
        {
            var fullPath = GetFullPath(path);
            ValidatePath(fullPath);

            var response = new FileManagerResponse
            {
                Files = new List<FileManagerItem>()
            };

            // Get current directory info
            var dirInfo = new DirectoryInfo(fullPath);
            response.Cwd = CreateFileManagerItem(dirInfo, path);

            // Get all directories
            var directories = dirInfo.GetDirectories();
            foreach (var dir in directories)
            {
                if (!showHiddenItems && (dir.Attributes & FileAttributes.Hidden) == FileAttributes.Hidden)
                    continue;

                response.Files.Add(CreateFileManagerItem(dir, path));
            }

            // Get all files
            var files = dirInfo.GetFiles();
            foreach (var file in files)
            {
                if (!showHiddenItems && (file.Attributes & FileAttributes.Hidden) == FileAttributes.Hidden)
                    continue;

                response.Files.Add(CreateFileManagerItem(file, path));
            }

            return response;
        }
        catch (Exception ex)
        {
            return CreateErrorResponse("500", $"Error reading files: {ex.Message}");
        }
    }

    public FileManagerResponse CreateFolder(string path, string name)
    {
        try
        {
            var fullPath = GetFullPath(Path.Combine(path, name));
            ValidatePath(fullPath);

            if (Directory.Exists(fullPath))
            {
                return CreateErrorResponse("400", $"A folder with the name '{name}' already exists.");
            }

            Directory.CreateDirectory(fullPath);

            var dirInfo = new DirectoryInfo(fullPath);
            return new FileManagerResponse
            {
                Files = new List<FileManagerItem> { CreateFileManagerItem(dirInfo, path) }
            };
        }
        catch (Exception ex)
        {
            return CreateErrorResponse("500", $"Error creating folder: {ex.Message}");
        }
    }

    public FileManagerResponse Delete(string path, string[] names)
    {
        try
        {
            var deletedFiles = new List<FileManagerItem>();

            foreach (var name in names)
            {
                var fullPath = GetFullPath(Path.Combine(path, name));
                ValidatePath(fullPath);

                if (Directory.Exists(fullPath))
                {
                    var dirInfo = new DirectoryInfo(fullPath);
                    deletedFiles.Add(CreateFileManagerItem(dirInfo, path));
                    Directory.Delete(fullPath, true);
                }
                else if (File.Exists(fullPath))
                {
                    var fileInfo = new FileInfo(fullPath);
                    deletedFiles.Add(CreateFileManagerItem(fileInfo, path));
                    File.Delete(fullPath);
                }
            }

            return new FileManagerResponse
            {
                Files = deletedFiles
            };
        }
        catch (Exception ex)
        {
            return CreateErrorResponse("500", $"Error deleting items: {ex.Message}");
        }
    }

    public FileManagerResponse Rename(string path, string oldName, string newName, bool showFileExtension = true)
    {
        try
        {
            var oldPath = GetFullPath(Path.Combine(path, oldName));
            var newPath = GetFullPath(Path.Combine(path, newName));
            ValidatePath(oldPath);
            ValidatePath(newPath);

            if (Directory.Exists(oldPath))
            {
                if (Directory.Exists(newPath))
                {
                    return CreateErrorResponse("400", $"A folder with the name '{newName}' already exists.");
                }
                Directory.Move(oldPath, newPath);
                var dirInfo = new DirectoryInfo(newPath);
                return new FileManagerResponse
                {
                    Files = new List<FileManagerItem> { CreateFileManagerItem(dirInfo, path) }
                };
            }
            else if (File.Exists(oldPath))
            {
                if (File.Exists(newPath))
                {
                    return CreateErrorResponse("400", $"A file with the name '{newName}' already exists.");
                }
                File.Move(oldPath, newPath);
                var fileInfo = new FileInfo(newPath);
                return new FileManagerResponse
                {
                    Files = new List<FileManagerItem> { CreateFileManagerItem(fileInfo, path) }
                };
            }

            return CreateErrorResponse("404", $"Item '{oldName}' not found.");
        }
        catch (Exception ex)
        {
            return CreateErrorResponse("500", $"Error renaming item: {ex.Message}");
        }
    }

    public FileManagerResponse Copy(string path, string targetPath, string[] names, string[]? renameFiles = null, FileManagerItem? targetData = null)
    {
        try
        {
            var copiedFiles = new List<FileManagerItem>();

            foreach (var name in names)
            {
                var sourcePath = GetFullPath(Path.Combine(path, name));
                var destPath = GetFullPath(Path.Combine(targetPath, name));
                ValidatePath(sourcePath);
                ValidatePath(destPath);

                if (Directory.Exists(sourcePath))
                {
                    CopyDirectory(sourcePath, destPath);
                    var dirInfo = new DirectoryInfo(destPath);
                    copiedFiles.Add(CreateFileManagerItem(dirInfo, targetPath));
                }
                else if (File.Exists(sourcePath))
                {
                    File.Copy(sourcePath, destPath, false);
                    var fileInfo = new FileInfo(destPath);
                    copiedFiles.Add(CreateFileManagerItem(fileInfo, targetPath));
                }
            }

            return new FileManagerResponse
            {
                Files = copiedFiles
            };
        }
        catch (Exception ex)
        {
            return CreateErrorResponse("500", $"Error copying items: {ex.Message}");
        }
    }

    public FileManagerResponse Move(string path, string targetPath, string[] names, string[]? renameFiles = null, FileManagerItem? targetData = null)
    {
        try
        {
            var movedFiles = new List<FileManagerItem>();

            foreach (var name in names)
            {
                var sourcePath = GetFullPath(Path.Combine(path, name));
                var destPath = GetFullPath(Path.Combine(targetPath, name));
                ValidatePath(sourcePath);
                ValidatePath(destPath);

                if (Directory.Exists(sourcePath))
                {
                    Directory.Move(sourcePath, destPath);
                    var dirInfo = new DirectoryInfo(destPath);
                    movedFiles.Add(CreateFileManagerItem(dirInfo, targetPath));
                }
                else if (File.Exists(sourcePath))
                {
                    File.Move(sourcePath, destPath, false);
                    var fileInfo = new FileInfo(destPath);
                    movedFiles.Add(CreateFileManagerItem(fileInfo, targetPath));
                }
            }

            return new FileManagerResponse
            {
                Files = movedFiles
            };
        }
        catch (Exception ex)
        {
            return CreateErrorResponse("500", $"Error moving items: {ex.Message}");
        }
    }

    public FileManagerResponse GetDetails(string path, string[]? names = null, FileManagerItem[]? data = null)
    {
        try
        {
            if (names == null || names.Length == 0)
            {
                return CreateErrorResponse("400", "No items specified for details.");
            }

            if (names.Length == 1)
            {
                var fullPath = GetFullPath(Path.Combine(path, names[0]));
                ValidatePath(fullPath);

                FileDetails details;
                if (Directory.Exists(fullPath))
                {
                    var dirInfo = new DirectoryInfo(fullPath);
                    details = new FileDetails
                    {
                        Name = dirInfo.Name,
                        Location = path,
                        Size = GetDirectorySize(dirInfo),
                        Created = dirInfo.CreationTime,
                        Modified = dirInfo.LastWriteTime,
                        MultipleFiles = false
                    };
                }
                else if (File.Exists(fullPath))
                {
                    var fileInfo = new FileInfo(fullPath);
                    details = new FileDetails
                    {
                        Name = fileInfo.Name,
                        Location = path,
                        Size = FormatFileSize(fileInfo.Length),
                        Created = fileInfo.CreationTime,
                        Modified = fileInfo.LastWriteTime,
                        MultipleFiles = false
                    };
                }
                else
                {
                    return CreateErrorResponse("404", $"Item '{names[0]}' not found.");
                }

                return new FileManagerResponse { Details = details };
            }
            else
            {
                // Multiple files selected
                long totalSize = 0;
                foreach (var name in names)
                {
                    var fullPath = GetFullPath(Path.Combine(path, name));
                    ValidatePath(fullPath);

                    if (Directory.Exists(fullPath))
                    {
                        var dirInfo = new DirectoryInfo(fullPath);
                        totalSize += GetDirectorySizeInBytes(dirInfo);
                    }
                    else if (File.Exists(fullPath))
                    {
                        var fileInfo = new FileInfo(fullPath);
                        totalSize += fileInfo.Length;
                    }
                }

                var details = new FileDetails
                {
                    Name = $"{names.Length} items",
                    Location = path,
                    Size = FormatFileSize(totalSize),
                    MultipleFiles = true,
                    Names = names.ToList()
                };

                return new FileManagerResponse { Details = details };
            }
        }
        catch (Exception ex)
        {
            return CreateErrorResponse("500", $"Error getting details: {ex.Message}");
        }
    }

    public FileManagerResponse Search(string path, string searchString, bool showHiddenItems = false, bool caseSensitive = false)
    {
        try
        {
            var fullPath = GetFullPath(path);
            ValidatePath(fullPath);

            var response = new FileManagerResponse
            {
                Files = new List<FileManagerItem>()
            };

            var comparison = caseSensitive ? StringComparison.Ordinal : StringComparison.OrdinalIgnoreCase;
            SearchDirectory(fullPath, searchString, comparison, showHiddenItems, response.Files, path);

            return response;
        }
        catch (Exception ex)
        {
            return CreateErrorResponse("500", $"Error searching: {ex.Message}");
        }
    }

    public FileManagerResponse Upload(string path, IFormFileCollection files, string action = "save")
    {
        try
        {
            var uploadedFiles = new List<FileManagerItem>();
            var fullPath = GetFullPath(path);
            ValidatePath(fullPath);

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var fileName = Path.GetFileName(file.FileName);
                    var filePath = Path.Combine(fullPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        file.CopyTo(stream);
                    }

                    var fileInfo = new FileInfo(filePath);
                    uploadedFiles.Add(CreateFileManagerItem(fileInfo, path));
                }
            }

            return new FileManagerResponse
            {
                Files = uploadedFiles
            };
        }
        catch (Exception ex)
        {
            return CreateErrorResponse("500", $"Error uploading files: {ex.Message}");
        }
    }

    public (byte[] FileContent, string FileName, string ContentType) Download(string path, string[]? names = null, FileManagerItem[]? data = null)
    {
        try
        {
            if (names == null || names.Length == 0)
            {
                throw new ArgumentException("No files specified for download.");
            }

            if (names.Length == 1)
            {
                // Single file download
                var fullPath = GetFullPath(Path.Combine(path, names[0]));
                ValidatePath(fullPath);

                if (File.Exists(fullPath))
                {
                    var fileContent = File.ReadAllBytes(fullPath);
                    var contentType = GetContentType(fullPath);
                    return (fileContent, names[0], contentType);
                }
                else if (Directory.Exists(fullPath))
                {
                    // Download folder as zip
                    return CreateZipArchive(fullPath, names[0]);
                }

                throw new FileNotFoundException($"File or folder '{names[0]}' not found.");
            }
            else
            {
                // Multiple files - create zip
                var fullPath = GetFullPath(path);
                ValidatePath(fullPath);
                return CreateZipArchive(fullPath, "download.zip", names);
            }
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Error downloading files: {ex.Message}", ex);
        }
    }

    public (byte[] FileContent, string ContentType) GetImage(string path, string? id = null)
    {
        try
        {
            var fullPath = GetFullPath(path);
            ValidatePath(fullPath);

            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException($"Image file not found: {path}");
            }

            var extension = Path.GetExtension(fullPath).ToLowerInvariant();
            if (!_imageExtensions.Contains(extension))
            {
                throw new InvalidOperationException($"File is not a supported image type: {extension}");
            }

            var fileContent = File.ReadAllBytes(fullPath);
            var contentType = GetContentType(fullPath);

            return (fileContent, contentType);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Error getting image: {ex.Message}", ex);
        }
    }

    #region Helper Methods

    private string GetFullPath(string relativePath)
    {
        var normalizedPath = relativePath.Replace('/', Path.DirectorySeparatorChar);
        normalizedPath = normalizedPath.TrimStart(Path.DirectorySeparatorChar);
        return Path.GetFullPath(Path.Combine(_rootPath, normalizedPath));
    }

    private void ValidatePath(string fullPath)
    {
        if (!fullPath.StartsWith(_rootPath, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Access denied. Path traversal detected.");
        }
    }

    private FileManagerItem CreateFileManagerItem(FileSystemInfo info, string filterPath)
    {
        var isDirectory = info is DirectoryInfo;
        var item = new FileManagerItem
        {
            Name = info.Name,
            Size = isDirectory ? 0 : ((FileInfo)info).Length,
            IsFile = !isDirectory,
            DateCreated = info.CreationTime,
            DateModified = info.LastWriteTime,
            Type = isDirectory ? "Folder" : Path.GetExtension(info.Name).TrimStart('.'),
            HasChild = isDirectory && ((DirectoryInfo)info).GetFileSystemInfos().Length > 0,
            FilterPath = filterPath,
            Id = Guid.NewGuid().ToString(),
            Permission = new FileManagerPermission()
        };

        return item;
    }

    private FileManagerResponse CreateErrorResponse(string code, string message)
    {
        return new FileManagerResponse
        {
            Error = new ErrorDetails
            {
                Code = code,
                Message = message
            }
        };
    }

    private void CopyDirectory(string sourceDir, string destDir)
    {
        Directory.CreateDirectory(destDir);

        foreach (var file in Directory.GetFiles(sourceDir))
        {
            var destFile = Path.Combine(destDir, Path.GetFileName(file));
            File.Copy(file, destFile);
        }

        foreach (var dir in Directory.GetDirectories(sourceDir))
        {
            var destSubDir = Path.Combine(destDir, Path.GetFileName(dir));
            CopyDirectory(dir, destSubDir);
        }
    }

    private void SearchDirectory(string directory, string searchString, StringComparison comparison, bool showHiddenItems, List<FileManagerItem> results, string filterPath)
    {
        try
        {
            var dirInfo = new DirectoryInfo(directory);

            foreach (var dir in dirInfo.GetDirectories())
            {
                if (!showHiddenItems && (dir.Attributes & FileAttributes.Hidden) == FileAttributes.Hidden)
                    continue;

                if (dir.Name.Contains(searchString, comparison))
                {
                    results.Add(CreateFileManagerItem(dir, filterPath));
                }

                SearchDirectory(dir.FullName, searchString, comparison, showHiddenItems, results, filterPath);
            }

            foreach (var file in dirInfo.GetFiles())
            {
                if (!showHiddenItems && (file.Attributes & FileAttributes.Hidden) == FileAttributes.Hidden)
                    continue;

                if (file.Name.Contains(searchString, comparison))
                {
                    results.Add(CreateFileManagerItem(file, filterPath));
                }
            }
        }
        catch
        {
            // Skip directories we can't access
        }
    }

    private long GetDirectorySizeInBytes(DirectoryInfo dirInfo)
    {
        long size = 0;
        try
        {
            foreach (var file in dirInfo.GetFiles())
            {
                size += file.Length;
            }

            foreach (var dir in dirInfo.GetDirectories())
            {
                size += GetDirectorySizeInBytes(dir);
            }
        }
        catch
        {
            // Skip directories we can't access
        }

        return size;
    }

    private string GetDirectorySize(DirectoryInfo dirInfo)
    {
        return FormatFileSize(GetDirectorySizeInBytes(dirInfo));
    }

    private string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len /= 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }

    private (byte[] FileContent, string FileName, string ContentType) CreateZipArchive(string sourcePath, string zipFileName, string[]? fileNames = null)
    {
        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
        {
            if (fileNames == null)
            {
                // Add entire directory
                AddDirectoryToZip(archive, sourcePath, "");
            }
            else
            {
                // Add specific files
                foreach (var fileName in fileNames)
                {
                    var fullPath = Path.Combine(sourcePath, fileName);
                    if (File.Exists(fullPath))
                    {
                        archive.CreateEntryFromFile(fullPath, fileName);
                    }
                    else if (Directory.Exists(fullPath))
                    {
                        AddDirectoryToZip(archive, fullPath, fileName);
                    }
                }
            }
        }

        return (memoryStream.ToArray(), zipFileName.EndsWith(".zip") ? zipFileName : $"{zipFileName}.zip", "application/zip");
    }

    private void AddDirectoryToZip(ZipArchive archive, string sourceDir, string entryName)
    {
        var files = Directory.GetFiles(sourceDir);
        foreach (var file in files)
        {
            var fileName = Path.GetFileName(file);
            var entryPath = string.IsNullOrEmpty(entryName) ? fileName : $"{entryName}/{fileName}";
            archive.CreateEntryFromFile(file, entryPath);
        }

        var directories = Directory.GetDirectories(sourceDir);
        foreach (var directory in directories)
        {
            var dirName = Path.GetFileName(directory);
            var dirEntryPath = string.IsNullOrEmpty(entryName) ? dirName : $"{entryName}/{dirName}";
            AddDirectoryToZip(archive, directory, dirEntryPath);
        }
    }

    private string GetContentType(string path)
    {
        var extension = Path.GetExtension(path).ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".bmp" => "image/bmp",
            ".svg" => "image/svg+xml",
            ".webp" => "image/webp",
            ".pdf" => "application/pdf",
            ".txt" => "text/plain",
            ".html" or ".htm" => "text/html",
            ".css" => "text/css",
            ".js" => "application/javascript",
            ".json" => "application/json",
            ".xml" => "application/xml",
            ".zip" => "application/zip",
            _ => "application/octet-stream"
        };
    }

    public FileManagerResponse CreateZip(string path, string[] names, string zipName)
    {
        try
        {
            var fullPath = GetFullPath(path);
            ValidatePath(fullPath);

            if (!zipName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
            {
                zipName += ".zip";
            }

            var zipPath = Path.Combine(fullPath, zipName);

            // Check if zip already exists
            if (File.Exists(zipPath))
            {
                return CreateErrorResponse("400", $"A file with the name '{zipName}' already exists.");
            }

            using (var archive = ZipFile.Open(zipPath, ZipArchiveMode.Create))
            {
                foreach (var name in names)
                {
                    var itemPath = Path.Combine(fullPath, name);
                    ValidatePath(itemPath);

                    if (File.Exists(itemPath))
                    {
                        archive.CreateEntryFromFile(itemPath, name);
                    }
                    else if (Directory.Exists(itemPath))
                    {
                        AddDirectoryToZipArchive(archive, itemPath, name);
                    }
                }
            }

            var fileInfo = new FileInfo(zipPath);
            return new FileManagerResponse
            {
                Files = new List<FileManagerItem> { CreateFileManagerItem(fileInfo, path) }
            };
        }
        catch (Exception ex)
        {
            return CreateErrorResponse("500", $"Error creating ZIP archive: {ex.Message}");
        }
    }

    public FileManagerResponse ExtractZip(string path, string zipFileName, string? targetPath = null)
    {
        try
        {
            var zipPath = GetFullPath(Path.Combine(path, zipFileName));
            ValidatePath(zipPath);

            if (!File.Exists(zipPath))
            {
                return CreateErrorResponse("404", $"ZIP file '{zipFileName}' not found.");
            }

            if (!zipFileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
            {
                return CreateErrorResponse("400", "File is not a ZIP archive.");
            }

            // Extract to same folder or specified target
            var extractPath = string.IsNullOrEmpty(targetPath) 
                ? GetFullPath(path) 
                : GetFullPath(targetPath);
            
            ValidatePath(extractPath);

            // Create a folder with the zip name (without .zip)
            var folderName = Path.GetFileNameWithoutExtension(zipFileName);
            var extractToPath = Path.Combine(extractPath, folderName);

            // If folder exists, add a number
            var counter = 1;
            var originalPath = extractToPath;
            while (Directory.Exists(extractToPath))
            {
                extractToPath = $"{originalPath} ({counter})";
                counter++;
            }

            Directory.CreateDirectory(extractToPath);

            // Extract the ZIP
            ZipFile.ExtractToDirectory(zipPath, extractToPath);

            var dirInfo = new DirectoryInfo(extractToPath);
            return new FileManagerResponse
            {
                Files = new List<FileManagerItem> { CreateFileManagerItem(dirInfo, path) }
            };
        }
        catch (Exception ex)
        {
            return CreateErrorResponse("500", $"Error extracting ZIP archive: {ex.Message}");
        }
    }

    private void AddDirectoryToZipArchive(ZipArchive archive, string sourceDir, string entryName)
    {
        var files = Directory.GetFiles(sourceDir);
        foreach (var file in files)
        {
            var fileName = Path.GetFileName(file);
            var entryPath = $"{entryName}/{fileName}";
            archive.CreateEntryFromFile(file, entryPath);
        }

        var directories = Directory.GetDirectories(sourceDir);
        foreach (var directory in directories)
        {
            var dirName = Path.GetFileName(directory);
            var dirEntryPath = $"{entryName}/{dirName}";
            AddDirectoryToZipArchive(archive, directory, dirEntryPath);
        }
    }

    #endregion
}

