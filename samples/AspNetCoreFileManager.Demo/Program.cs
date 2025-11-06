using AspNetCoreFileManager.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllersWithViews();

// Configure File Manager service
var filesPath = Path.Combine(builder.Environment.ContentRootPath, "Files");
builder.Services.AddFileManager(filesPath);

var app = builder.Build();

// Configure the HTTP request pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Ensure Files directory exists with some sample structure
EnsureFileStructure(filesPath);

app.Run();

static void EnsureFileStructure(string rootPath)
{
    if (!Directory.Exists(rootPath))
    {
        Directory.CreateDirectory(rootPath);
        
        // Create sample folders
        Directory.CreateDirectory(Path.Combine(rootPath, "Documents"));
        Directory.CreateDirectory(Path.Combine(rootPath, "Pictures"));
        Directory.CreateDirectory(Path.Combine(rootPath, "Music"));
        Directory.CreateDirectory(Path.Combine(rootPath, "Videos"));
        Directory.CreateDirectory(Path.Combine(rootPath, "Downloads"));
        
        // Create a nested structure
        Directory.CreateDirectory(Path.Combine(rootPath, "Documents", "Work"));
        Directory.CreateDirectory(Path.Combine(rootPath, "Documents", "Personal"));
        Directory.CreateDirectory(Path.Combine(rootPath, "Pictures", "Vacation"));
        Directory.CreateDirectory(Path.Combine(rootPath, "Pictures", "Family"));
        
        // Create some sample text files
        File.WriteAllText(
            Path.Combine(rootPath, "README.txt"),
            "Welcome to ASP.NET Core File Manager Demo!\n\nThis is a sample file structure to demonstrate the file manager capabilities."
        );
        
        File.WriteAllText(
            Path.Combine(rootPath, "Documents", "sample.txt"),
            "This is a sample document file."
        );
        
        File.WriteAllText(
            Path.Combine(rootPath, "Documents", "Work", "notes.txt"),
            "Work notes and reminders."
        );
    }
}

