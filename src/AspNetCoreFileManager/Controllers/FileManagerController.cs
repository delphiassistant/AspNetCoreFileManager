using AspNetCoreFileManager.Models;
using AspNetCoreFileManager.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AspNetCoreFileManager.Controllers;

/// <summary>
/// API Controller for file manager operations
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class FileManagerController : ControllerBase
{
    private readonly IFileManagerService _fileManagerService;

    public FileManagerController(IFileManagerService fileManagerService)
    {
        _fileManagerService = fileManagerService;
    }

    /// <summary>
    /// Handles all file manager operations (read, delete, rename, copy, move, search, create, details)
    /// </summary>
    [HttpPost("FileOperations")]
    public IActionResult FileOperations([FromBody] FileManagerRequest request)
    {
        try
        {
            // Validate root folder modifications
            if ((request.Action == "delete" || request.Action == "rename") &&
                string.IsNullOrEmpty(request.Path) && string.IsNullOrEmpty(request.TargetPath ?? ""))
            {
                return BadRequest(new FileManagerResponse
                {
                    Error = new ErrorDetails
                    {
                        Code = "401",
                        Message = "Restricted to modify the root folder."
                    }
                });
            }

            // Validate ZIP operations (removed to let service handle validation)

            FileManagerResponse response = request.Action switch
            {
                "read" => _fileManagerService.GetFiles(request.Path, request.ShowHiddenItems),
                "delete" => _fileManagerService.Delete(request.Path, request.Names ?? Array.Empty<string>()),
                "copy" => _fileManagerService.Copy(request.Path, request.TargetPath ?? "", request.Names ?? Array.Empty<string>(), request.RenameFiles, request.TargetData),
                "move" => _fileManagerService.Move(request.Path, request.TargetPath ?? "", request.Names ?? Array.Empty<string>(), request.RenameFiles, request.TargetData),
                "details" => _fileManagerService.GetDetails(request.Path, request.Names, request.Data),
                "create" => _fileManagerService.CreateFolder(request.Path, request.Name ?? "New Folder"),
                "search" => _fileManagerService.Search(request.Path, request.SearchString ?? "", request.ShowHiddenItems, request.CaseSensitive),
                "rename" => _fileManagerService.Rename(request.Path, request.Name ?? "", request.NewName ?? "", request.ShowFileExtension),
                "zip" => _fileManagerService.CreateZip(request.Path, request.Names ?? Array.Empty<string>(), request.Name ?? "archive.zip"),
                "unzip" => _fileManagerService.ExtractZip(request.Path, request.Name ?? "", request.TargetPath),
                _ => new FileManagerResponse
                {
                    Error = new ErrorDetails
                    {
                        Code = "400",
                        Message = $"Unknown action: {request.Action}"
                    }
                }
            };

            if (response.Error != null)
            {
                return StatusCode(int.Parse(response.Error.Code), response);
            }

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new FileManagerResponse
            {
                Error = new ErrorDetails
                {
                    Code = "500",
                    Message = ex.Message
                }
            });
        }
    }

    /// <summary>
    /// Handles file uploads
    /// </summary>
    [HttpPost("Upload")]
    public IActionResult Upload([FromForm] string path, [FromForm] string action = "save")
    {
        try
        {
            var files = Request.Form.Files;
            if (files.Count == 0)
            {
                return BadRequest(new FileManagerResponse
                {
                    Error = new ErrorDetails
                    {
                        Code = "400",
                        Message = "No files uploaded."
                    }
                });
            }

            var response = _fileManagerService.Upload(path, files, action);

            if (response.Error != null)
            {
                return StatusCode(int.Parse(response.Error.Code), response);
            }

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new FileManagerResponse
            {
                Error = new ErrorDetails
                {
                    Code = "500",
                    Message = ex.Message
                }
            });
        }
    }

    /// <summary>
    /// Handles file downloads
    /// </summary>
    [HttpPost("Download")]
    [Consumes("application/json", "application/x-www-form-urlencoded", "multipart/form-data")]
    public IActionResult Download([FromBody] FileManagerRequest request)
    {
        try
        {
            var (fileContent, fileName, contentType) = _fileManagerService.Download(
                request.Path,
                request.Names,
                request.Data
            );

            return File(fileContent, contentType, fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new FileManagerResponse
            {
                Error = new ErrorDetails
                {
                    Code = "500",
                    Message = ex.Message
                }
            });
        }
    }

    /// <summary>
    /// Gets an image for preview
    /// </summary>
    [HttpPost("GetImage")]
    public IActionResult GetImage([FromBody] FileManagerRequest request)
    {
        try
        {
            var (fileContent, contentType) = _fileManagerService.GetImage(request.Path, request.Id);
            return File(fileContent, contentType);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new FileManagerResponse
            {
                Error = new ErrorDetails
                {
                    Code = "500",
                    Message = ex.Message
                }
            });
        }
    }
}

