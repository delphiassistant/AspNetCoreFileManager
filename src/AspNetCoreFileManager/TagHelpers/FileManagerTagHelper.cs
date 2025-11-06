using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Text;

namespace AspNetCoreFileManager.TagHelpers;

/// <summary>
/// Tag helper for rendering the file manager component
/// Usage: <file-manager id="myFileManager" path="/files" />
/// </summary>
[HtmlTargetElement("file-manager")]
public class FileManagerTagHelper : TagHelper
{
    /// <summary>
    /// The ID of the file manager element
    /// </summary>
    [HtmlAttributeName("id")]
    public string? Id { get; set; }

    /// <summary>
    /// The initial path to display
    /// </summary>
    [HtmlAttributeName("path")]
    public string Path { get; set; } = "/";

    /// <summary>
    /// The initial view mode (largeicons or details)
    /// </summary>
    [HtmlAttributeName("view")]
    public string View { get; set; } = "largeicons";

    /// <summary>
    /// The URL for file operations
    /// </summary>
    [HtmlAttributeName("ajax-url")]
    public string AjaxUrl { get; set; } = "/api/FileManager/FileOperations";

    /// <summary>
    /// The URL for file uploads
    /// </summary>
    [HtmlAttributeName("upload-url")]
    public string UploadUrl { get; set; } = "/api/FileManager/Upload";

    /// <summary>
    /// The URL for file downloads
    /// </summary>
    [HtmlAttributeName("download-url")]
    public string DownloadUrl { get; set; } = "/api/FileManager/Download";

    /// <summary>
    /// The URL for getting images
    /// </summary>
    [HtmlAttributeName("get-image-url")]
    public string GetImageUrl { get; set; } = "/api/FileManager/GetImage";

    /// <summary>
    /// Whether to allow drag and drop
    /// </summary>
    [HtmlAttributeName("allow-drag-drop")]
    public bool AllowDragAndDrop { get; set; } = true;

    /// <summary>
    /// Whether to allow multiple selection
    /// </summary>
    [HtmlAttributeName("allow-multi-selection")]
    public bool AllowMultiSelection { get; set; } = true;

    /// <summary>
    /// Whether to show file extensions
    /// </summary>
    [HtmlAttributeName("show-file-extension")]
    public bool ShowFileExtension { get; set; } = true;

    /// <summary>
    /// Whether to show hidden items
    /// </summary>
    [HtmlAttributeName("show-hidden-items")]
    public bool ShowHiddenItems { get; set; } = false;

    /// <summary>
    /// Whether to show thumbnails
    /// </summary>
    [HtmlAttributeName("show-thumbnail")]
    public bool ShowThumbnail { get; set; } = true;

    /// <summary>
    /// Whether to enable persistence
    /// </summary>
    [HtmlAttributeName("enable-persistence")]
    public bool EnablePersistence { get; set; } = false;

    /// <summary>
    /// Whether to enable RTL mode
    /// </summary>
    [HtmlAttributeName("enable-rtl")]
    public bool EnableRtl { get; set; } = false;

    /// <summary>
    /// Whether to show the toolbar
    /// </summary>
    [HtmlAttributeName("show-toolbar")]
    public bool ShowToolbar { get; set; } = true;

    /// <summary>
    /// Whether to show the navigation pane
    /// </summary>
    [HtmlAttributeName("show-navigation")]
    public bool ShowNavigation { get; set; } = true;

    /// <summary>
    /// Whether to show the context menu
    /// </summary>
    [HtmlAttributeName("show-context-menu")]
    public bool ShowContextMenu { get; set; } = true;

    /// <summary>
    /// Height of the file manager
    /// </summary>
    [HtmlAttributeName("height")]
    public string Height { get; set; } = "600px";

    /// <summary>
    /// Additional CSS classes
    /// </summary>
    [HtmlAttributeName("css-class")]
    public string? CssClass { get; set; }

    /// <summary>
    /// Enable dark mode theme
    /// </summary>
    [HtmlAttributeName("dark-mode")]
    public bool DarkMode { get; set; } = false;

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "div";
        output.TagMode = TagMode.StartTagAndEndTag;

        var elementId = Id ?? $"filemanager_{Guid.NewGuid():N}";
        
        output.Attributes.SetAttribute("id", elementId);
        
        // Build CSS classes
        var cssClasses = new List<string>();
        if (!string.IsNullOrEmpty(CssClass))
        {
            cssClasses.Add(CssClass);
        }
        if (DarkMode)
        {
            cssClasses.Add("dark-mode");
        }
        
        if (cssClasses.Count > 0)
        {
            output.Attributes.SetAttribute("class", string.Join(" ", cssClasses));
        }

        // Generate the initialization script
        var script = GenerateInitializationScript(elementId);

        output.PostElement.AppendHtml(script);
    }

    private string GenerateInitializationScript(string elementId)
    {
        var config = new StringBuilder();
        config.AppendLine("<script>");
        config.AppendLine($"(function() {{");
        config.AppendLine($"    var options = {{");
        config.AppendLine($"        path: '{EscapeJavaScript(Path)}',");
        config.AppendLine($"        view: '{EscapeJavaScript(View)}',");
        config.AppendLine($"        allowDragAndDrop: {AllowDragAndDrop.ToString().ToLower()},");
        config.AppendLine($"        allowMultiSelection: {AllowMultiSelection.ToString().ToLower()},");
        config.AppendLine($"        showFileExtension: {ShowFileExtension.ToString().ToLower()},");
        config.AppendLine($"        showHiddenItems: {ShowHiddenItems.ToString().ToLower()},");
        config.AppendLine($"        showThumbnail: {ShowThumbnail.ToString().ToLower()},");
        config.AppendLine($"        enablePersistence: {EnablePersistence.ToString().ToLower()},");
        config.AppendLine($"        enableRtl: {EnableRtl.ToString().ToLower()},");
        config.AppendLine($"        ajaxSettings: {{");
        config.AppendLine($"            url: '{EscapeJavaScript(AjaxUrl)}',");
        config.AppendLine($"            uploadUrl: '{EscapeJavaScript(UploadUrl)}',");
        config.AppendLine($"            downloadUrl: '{EscapeJavaScript(DownloadUrl)}',");
        config.AppendLine($"            getImageUrl: '{EscapeJavaScript(GetImageUrl)}'");
        config.AppendLine($"        }},");
            config.AppendLine($"        toolbarSettings: {{");
            config.AppendLine($"            visible: {ShowToolbar.ToString().ToLower()},");
            config.AppendLine($"            items: ['NewFolder', 'Upload', 'Cut', 'Copy', 'Paste', '|', 'Delete', 'Download', 'Rename', '|', 'Zip', 'Unzip', '|', 'Refresh', 'View', 'Details']");
            config.AppendLine($"        }},");
        config.AppendLine($"        navigationPaneSettings: {{");
        config.AppendLine($"            visible: {ShowNavigation.ToString().ToLower()}");
        config.AppendLine($"        }},");
            config.AppendLine($"        contextMenuSettings: {{");
            config.AppendLine($"            visible: {ShowContextMenu.ToString().ToLower()},");
            config.AppendLine($"            items: ['Open', '|', 'Cut', 'Copy', 'Paste', 'Delete', 'Rename', '|', 'Zip', 'Unzip', '|', 'Details']");
            config.AppendLine($"        }}");
        config.AppendLine($"    }};");
        config.AppendLine();
        config.AppendLine($"    if (document.readyState === 'loading') {{");
        config.AppendLine($"        document.addEventListener('DOMContentLoaded', function() {{");
        config.AppendLine($"            new FileManager('#{elementId}', options);");
        config.AppendLine($"        }});");
        config.AppendLine($"    }} else {{");
        config.AppendLine($"        new FileManager('#{elementId}', options);");
        config.AppendLine($"    }}");
        config.AppendLine($"}})();");
        config.AppendLine("</script>");

        // Add inline style for height if specified
        if (!string.IsNullOrEmpty(Height))
        {
            config.Insert(0, $"<style>#{elementId} {{ height: {Height}; }}</style>");
        }

        return config.ToString();
    }

    private string EscapeJavaScript(string input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;

        return input
            .Replace("\\", "\\\\")
            .Replace("'", "\\'")
            .Replace("\"", "\\\"")
            .Replace("\n", "\\n")
            .Replace("\r", "\\r");
    }
}

