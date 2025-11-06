# Contributing to ASP.NET Core File Manager

First off, thank you for considering contributing to ASP.NET Core File Manager! It's people like you that make this project better.

## Code of Conduct

This project and everyone participating in it is governed by a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [support@example.com].

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title** for the issue
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs** if possible
* **Include your environment details** (OS, .NET version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior** and **explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the C# coding style
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Development Process

### Setting Up Your Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/AspNetCoreFileManager.git
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-owner/AspNetCoreFileManager.git
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Building the Project

```bash
# Restore dependencies
dotnet restore

# Build the solution
dotnet build

# Run tests
dotnet test
```

### Running the Demo Application

```bash
cd samples/AspNetCoreFileManager.Demo
dotnet run
```

Then navigate to `https://localhost:5001` in your browser.

### Project Structure

```
AspNetCoreFileManager/
├── src/
│   └── AspNetCoreFileManager/      # Main library
├── samples/
│   └── AspNetCoreFileManager.Demo/ # Demo application
├── tests/
│   └── AspNetCoreFileManager.Tests/# Unit tests
└── docs/                           # Documentation
```

### Coding Standards

#### C# Code

* Follow [Microsoft's C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/inside-a-program/coding-conventions)
* Use meaningful variable and method names
* Add XML documentation comments to public APIs
* Keep methods small and focused
* Write unit tests for new functionality

#### JavaScript Code

* Use ES6+ syntax
* Follow consistent indentation (4 spaces)
* Add JSDoc comments for functions
* Use meaningful variable names
* Keep functions small and focused

#### CSS Code

* Use BEM naming convention
* Group related properties
* Add comments for complex sections
* Ensure responsive design
* Test in multiple browsers

### Testing

* Write unit tests for all new features
* Ensure all tests pass before submitting PR
* Aim for high code coverage
* Include integration tests where appropriate

### Documentation

* Update documentation for any changed functionality
* Add examples for new features
* Keep the README.md up to date
* Update CHANGELOG.md

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

Example:
```
Add file versioning support

- Implement version tracking for files
- Add version history UI component
- Update API to support version retrieval

Closes #123
```

### Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation
3. Update the CHANGELOG.md
4. The PR will be merged once you have the sign-off of at least one maintainer

## Style Guide

### Git Commit Messages

* Use the present tense
* Use the imperative mood
* First line should be 50 characters or less
* Reference issues and PRs in the body

### C# Style Guide

```csharp
// Good
public class FileManagerService : IFileManagerService
{
    private readonly string _rootPath;
    
    /// <summary>
    /// Gets files from the specified path
    /// </summary>
    /// <param name="path">The path to read from</param>
    /// <returns>List of files and folders</returns>
    public FileManagerResponse GetFiles(string path)
    {
        // Implementation
    }
}

// Bad
public class filemanagerservice:IFileManagerService {
private string rootPath;
public FileManagerResponse getFiles(string path){
// Implementation
}
}
```

### JavaScript Style Guide

```javascript
// Good
class FileManager {
    constructor(element, options = {}) {
        this.element = element;
        this.options = options;
    }
    
    /**
     * Loads files from the server
     * @param {string} path - The path to load
     */
    loadFiles(path) {
        // Implementation
    }
}

// Bad
class filemanager{
constructor(element,options){
this.element=element
this.options=options
}
loadFiles(path){
// Implementation
}
}
```

## Additional Notes

### Issue and Pull Request Labels

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `documentation` - Improvements or additions to documentation
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `question` - Further information is requested

## Recognition

Contributors will be recognized in:
* The README.md file
* Release notes
* The project website (if applicable)

## Questions?

Feel free to contact the maintainers if you have any questions. We're here to help!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

