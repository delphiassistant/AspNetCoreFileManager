using AspNetCoreFileManager.Services;
using Microsoft.Extensions.DependencyInjection;

namespace AspNetCoreFileManager.Extensions;

/// <summary>
/// Extension methods for registering file manager services
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds the file manager service to the service collection
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <param name="rootPath">The root path for file operations</param>
    /// <returns>The service collection</returns>
    public static IServiceCollection AddFileManager(this IServiceCollection services, string rootPath)
    {
        services.AddSingleton<IFileManagerService>(sp => new PhysicalFileManagerService(rootPath));
        return services;
    }

    /// <summary>
    /// Adds the file manager service to the service collection with a custom implementation
    /// </summary>
    /// <typeparam name="TImplementation">The implementation type</typeparam>
    /// <param name="services">The service collection</param>
    /// <returns>The service collection</returns>
    public static IServiceCollection AddFileManager<TImplementation>(this IServiceCollection services)
        where TImplementation : class, IFileManagerService
    {
        services.AddSingleton<IFileManagerService, TImplementation>();
        return services;
    }
}

