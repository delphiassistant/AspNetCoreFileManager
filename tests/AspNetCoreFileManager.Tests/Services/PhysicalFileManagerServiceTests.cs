using AspNetCoreFileManager.Services;
using FluentAssertions;
using Xunit;

namespace AspNetCoreFileManager.Tests.Services;

public class PhysicalFileManagerServiceTests : IDisposable
{
    private readonly string _testRootPath;
    private readonly PhysicalFileManagerService _service;

    public PhysicalFileManagerServiceTests()
    {
        _testRootPath = Path.Combine(Path.GetTempPath(), $"FileManagerTests_{Guid.NewGuid()}");
        Directory.CreateDirectory(_testRootPath);
        _service = new PhysicalFileManagerService(_testRootPath);
    }

    public void Dispose()
    {
        if (Directory.Exists(_testRootPath))
        {
            Directory.Delete(_testRootPath, true);
        }
    }

    [Fact]
    public void GetFiles_ShouldReturnEmptyList_WhenDirectoryIsEmpty()
    {
        // Act
        var result = _service.GetFiles("/");

        // Assert
        result.Should().NotBeNull();
        result.Files.Should().NotBeNull();
        result.Files.Should().BeEmpty();
        result.Error.Should().BeNull();
    }

    [Fact]
    public void GetFiles_ShouldReturnFilesAndFolders_WhenDirectoryHasContent()
    {
        // Arrange
        Directory.CreateDirectory(Path.Combine(_testRootPath, "TestFolder"));
        File.WriteAllText(Path.Combine(_testRootPath, "test.txt"), "test content");

        // Act
        var result = _service.GetFiles("/");

        // Assert
        result.Files.Should().HaveCount(2);
        result.Files.Should().Contain(f => f.Name == "TestFolder" && !f.IsFile);
        result.Files.Should().Contain(f => f.Name == "test.txt" && f.IsFile);
    }

    [Fact]
    public void CreateFolder_ShouldCreateNewFolder()
    {
        // Act
        var result = _service.CreateFolder("/", "NewFolder");

        // Assert
        result.Error.Should().BeNull();
        result.Files.Should().HaveCount(1);
        result.Files[0].Name.Should().Be("NewFolder");
        result.Files[0].IsFile.Should().BeFalse();
        
        Directory.Exists(Path.Combine(_testRootPath, "NewFolder")).Should().BeTrue();
    }

    [Fact]
    public void CreateFolder_ShouldReturnError_WhenFolderExists()
    {
        // Arrange
        Directory.CreateDirectory(Path.Combine(_testRootPath, "ExistingFolder"));

        // Act
        var result = _service.CreateFolder("/", "ExistingFolder");

        // Assert
        result.Error.Should().NotBeNull();
        result.Error.Message.Should().Contain("already exists");
    }

    [Fact]
    public void Delete_ShouldDeleteFile()
    {
        // Arrange
        var filePath = Path.Combine(_testRootPath, "delete.txt");
        File.WriteAllText(filePath, "content");

        // Act
        var result = _service.Delete("/", new[] { "delete.txt" });

        // Assert
        result.Error.Should().BeNull();
        File.Exists(filePath).Should().BeFalse();
    }

    [Fact]
    public void Delete_ShouldDeleteFolder()
    {
        // Arrange
        var folderPath = Path.Combine(_testRootPath, "DeleteFolder");
        Directory.CreateDirectory(folderPath);

        // Act
        var result = _service.Delete("/", new[] { "DeleteFolder" });

        // Assert
        result.Error.Should().BeNull();
        Directory.Exists(folderPath).Should().BeFalse();
    }

    [Fact]
    public void Rename_ShouldRenameFile()
    {
        // Arrange
        var oldPath = Path.Combine(_testRootPath, "old.txt");
        File.WriteAllText(oldPath, "content");

        // Act
        var result = _service.Rename("/", "old.txt", "new.txt");

        // Assert
        result.Error.Should().BeNull();
        File.Exists(oldPath).Should().BeFalse();
        File.Exists(Path.Combine(_testRootPath, "new.txt")).Should().BeTrue();
    }

    [Fact]
    public void Rename_ShouldReturnError_WhenTargetExists()
    {
        // Arrange
        File.WriteAllText(Path.Combine(_testRootPath, "file1.txt"), "content1");
        File.WriteAllText(Path.Combine(_testRootPath, "file2.txt"), "content2");

        // Act
        var result = _service.Rename("/", "file1.txt", "file2.txt");

        // Assert
        result.Error.Should().NotBeNull();
        result.Error.Message.Should().Contain("already exists");
    }

    [Fact]
    public void Copy_ShouldCopyFile()
    {
        // Arrange
        var sourcePath = Path.Combine(_testRootPath, "source.txt");
        File.WriteAllText(sourcePath, "test content");
        
        var targetDir = Path.Combine(_testRootPath, "TargetDir");
        Directory.CreateDirectory(targetDir);

        // Act
        var result = _service.Copy("/", "/TargetDir", new[] { "source.txt" });

        // Assert
        result.Error.Should().BeNull();
        File.Exists(sourcePath).Should().BeTrue(); // Original should still exist
        File.Exists(Path.Combine(targetDir, "source.txt")).Should().BeTrue();
    }

    [Fact]
    public void Move_ShouldMoveFile()
    {
        // Arrange
        var sourcePath = Path.Combine(_testRootPath, "source.txt");
        File.WriteAllText(sourcePath, "test content");
        
        var targetDir = Path.Combine(_testRootPath, "TargetDir");
        Directory.CreateDirectory(targetDir);

        // Act
        var result = _service.Move("/", "/TargetDir", new[] { "source.txt" });

        // Assert
        result.Error.Should().BeNull();
        File.Exists(sourcePath).Should().BeFalse(); // Original should be gone
        File.Exists(Path.Combine(targetDir, "source.txt")).Should().BeTrue();
    }

    [Fact]
    public void Search_ShouldFindMatchingFiles()
    {
        // Arrange
        File.WriteAllText(Path.Combine(_testRootPath, "test1.txt"), "content");
        File.WriteAllText(Path.Combine(_testRootPath, "test2.txt"), "content");
        File.WriteAllText(Path.Combine(_testRootPath, "other.txt"), "content");

        // Act
        var result = _service.Search("/", "test");

        // Assert
        result.Error.Should().BeNull();
        result.Files.Should().HaveCount(2);
        result.Files.Should().Contain(f => f.Name == "test1.txt");
        result.Files.Should().Contain(f => f.Name == "test2.txt");
    }

    [Fact]
    public void Search_ShouldBeCaseSensitive_WhenSpecified()
    {
        // Arrange
        File.WriteAllText(Path.Combine(_testRootPath, "Test.txt"), "content");
        File.WriteAllText(Path.Combine(_testRootPath, "test.txt"), "content");

        // Act
        var result = _service.Search("/", "Test", caseSensitive: true);

        // Assert
        result.Error.Should().BeNull();
        result.Files.Should().HaveCount(1);
        result.Files[0].Name.Should().Be("Test.txt");
    }

    [Fact]
    public void GetDetails_ShouldReturnFileDetails()
    {
        // Arrange
        File.WriteAllText(Path.Combine(_testRootPath, "detail.txt"), "test content");

        // Act
        var result = _service.GetDetails("/", new[] { "detail.txt" });

        // Assert
        result.Error.Should().BeNull();
        result.Details.Should().NotBeNull();
        result.Details.Name.Should().Be("detail.txt");
        result.Details.Size.Should().NotBeNullOrEmpty();
        result.Details.Created.Should().NotBeNull();
        result.Details.Modified.Should().NotBeNull();
    }

    [Fact]
    public void GetDetails_ShouldReturnMultipleFilesSummary()
    {
        // Arrange
        File.WriteAllText(Path.Combine(_testRootPath, "file1.txt"), "content1");
        File.WriteAllText(Path.Combine(_testRootPath, "file2.txt"), "content2");

        // Act
        var result = _service.GetDetails("/", new[] { "file1.txt", "file2.txt" });

        // Assert
        result.Error.Should().BeNull();
        result.Details.Should().NotBeNull();
        result.Details.MultipleFiles.Should().BeTrue();
        result.Details.Names.Should().HaveCount(2);
    }

    [Fact]
    public void PathTraversal_ShouldBeBlocked()
    {
        // Act
        var result = _service.GetFiles("/../../../");

        // Assert
        result.Should().NotBeNull();
        result.Error.Should().NotBeNull();
        result.Error.Message.Should().Contain("Access denied");
    }
}

