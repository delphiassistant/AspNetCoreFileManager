using AspNetCoreFileManager.Controllers;
using AspNetCoreFileManager.Models;
using AspNetCoreFileManager.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace AspNetCoreFileManager.Tests.Controllers;

public class FileManagerControllerTests
{
    private readonly Mock<IFileManagerService> _mockService;
    private readonly FileManagerController _controller;

    public FileManagerControllerTests()
    {
        _mockService = new Mock<IFileManagerService>();
        _controller = new FileManagerController(_mockService.Object);
    }

    [Fact]
    public void FileOperations_Read_ShouldReturnFiles()
    {
        // Arrange
        var request = new FileManagerRequest
        {
            Action = "read",
            Path = "/"
        };

        var response = new FileManagerResponse
        {
            Files = new List<FileManagerItem>
            {
                new FileManagerItem { Name = "test.txt", IsFile = true }
            }
        };

        _mockService.Setup(s => s.GetFiles("/", false, null))
            .Returns(response);

        // Act
        var result = _controller.FileOperations(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult.Value.Should().BeEquivalentTo(response);
    }

    [Fact]
    public void FileOperations_Create_ShouldCreateFolder()
    {
        // Arrange
        var request = new FileManagerRequest
        {
            Action = "create",
            Path = "/",
            Name = "NewFolder"
        };

        var response = new FileManagerResponse
        {
            Files = new List<FileManagerItem>
            {
                new FileManagerItem { Name = "NewFolder", IsFile = false }
            }
        };

        _mockService.Setup(s => s.CreateFolder("/", "NewFolder"))
            .Returns(response);

        // Act
        var result = _controller.FileOperations(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public void FileOperations_Delete_ShouldDeleteFiles()
    {
        // Arrange
        var request = new FileManagerRequest
        {
            Action = "delete",
            Path = "/",
            Names = new[] { "file1.txt", "file2.txt" }
        };

        var response = new FileManagerResponse
        {
            Files = new List<FileManagerItem>()
        };

        _mockService.Setup(s => s.Delete("/", request.Names))
            .Returns(response);

        // Act
        var result = _controller.FileOperations(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public void FileOperations_Rename_ShouldRenameFile()
    {
        // Arrange
        var request = new FileManagerRequest
        {
            Action = "rename",
            Path = "/",
            Name = "old.txt",
            NewName = "new.txt"
        };

        var response = new FileManagerResponse
        {
            Files = new List<FileManagerItem>
            {
                new FileManagerItem { Name = "new.txt", IsFile = true }
            }
        };

        _mockService.Setup(s => s.Rename("/", "old.txt", "new.txt", true))
            .Returns(response);

        // Act
        var result = _controller.FileOperations(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public void FileOperations_Search_ShouldSearchFiles()
    {
        // Arrange
        var request = new FileManagerRequest
        {
            Action = "search",
            Path = "/",
            SearchString = "test"
        };

        var response = new FileManagerResponse
        {
            Files = new List<FileManagerItem>
            {
                new FileManagerItem { Name = "test.txt", IsFile = true }
            }
        };

        _mockService.Setup(s => s.Search("/", "test", false, false))
            .Returns(response);

        // Act
        var result = _controller.FileOperations(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public void FileOperations_ShouldReturnError_WhenServiceReturnsError()
    {
        // Arrange
        var request = new FileManagerRequest
        {
            Action = "read",
            Path = "/"
        };

        var response = new FileManagerResponse
        {
            Error = new ErrorDetails
            {
                Code = "500",
                Message = "Internal server error"
            }
        };

        _mockService.Setup(s => s.GetFiles("/", false, null))
            .Returns(response);

        // Act
        var result = _controller.FileOperations(request);

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = result as ObjectResult;
        objectResult.StatusCode.Should().Be(500);
    }

    [Fact]
    public void FileOperations_ShouldBlockRootModification()
    {
        // Arrange
        var request = new FileManagerRequest
        {
            Action = "delete",
            Path = "",
            TargetPath = ""
        };

        // Act
        var result = _controller.FileOperations(request);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
        var badRequest = result as BadRequestObjectResult;
        var response = badRequest.Value as FileManagerResponse;
        response.Error.Message.Should().Contain("root folder");
    }

    [Fact]
    public void FileOperations_ShouldReturnBadRequest_ForUnknownAction()
    {
        // Arrange
        var request = new FileManagerRequest
        {
            Action = "unknown",
            Path = "/"
        };

        // Act
        var result = _controller.FileOperations(request);

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = result as ObjectResult;
        objectResult!.StatusCode.Should().Be(400);
        var response = objectResult.Value as FileManagerResponse;
        response.Should().NotBeNull();
        response!.Error.Should().NotBeNull();
        response.Error!.Message.Should().Contain("Unknown action");
    }

    [Fact]
    public void Download_ShouldReturnFile()
    {
        // Arrange
        var request = new FileManagerRequest
        {
            Path = "/",
            Names = new[] { "test.txt" }
        };

        var fileContent = new byte[] { 1, 2, 3 };
        _mockService.Setup(s => s.Download("/", request.Names, null))
            .Returns((fileContent, "test.txt", "text/plain"));

        // Act
        var result = _controller.Download(request);

        // Assert
        result.Should().BeOfType<FileContentResult>();
        var fileResult = result as FileContentResult;
        fileResult.FileContents.Should().BeEquivalentTo(fileContent);
        fileResult.FileDownloadName.Should().Be("test.txt");
        fileResult.ContentType.Should().Be("text/plain");
    }

    [Fact]
    public void GetImage_ShouldReturnImage()
    {
        // Arrange
        var request = new FileManagerRequest
        {
            Path = "/image.jpg"
        };

        var imageContent = new byte[] { 1, 2, 3 };
        _mockService.Setup(s => s.GetImage("/image.jpg", null))
            .Returns((imageContent, "image/jpeg"));

        // Act
        var result = _controller.GetImage(request);

        // Assert
        result.Should().BeOfType<FileContentResult>();
        var fileResult = result as FileContentResult;
        fileResult.FileContents.Should().BeEquivalentTo(imageContent);
        fileResult.ContentType.Should().Be("image/jpeg");
    }
}

