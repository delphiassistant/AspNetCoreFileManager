# AspNetCoreFileManager - File Manager برای ASP.NET Core

یک کامپوننت کامل و قدرتمند برای مدیریت فایل در ASP.NET Core با پشتیبانی از RTL و چند زبانه.

## ویژگی‌های اصلی ✨

### مدیریت فایل و پوشه 📁
- ✅ **ایجاد پوشه جدید** با validation کامل
- ✅ **آپلود فایل** با Drag & Drop
- ✅ **دانلود فایل** (تکی یا چندتایی به صورت ZIP)
- ✅ **حذف فایل/پوشه** با تأیید
- ✅ **تغییر نام** با تشخیص خودکار extension
- ✅ **جستجو** در فایل‌ها و پوشه‌ها
- ✅ **مرتب‌سازی** براساس نام، تاریخ، اندازه، نوع
- ✅ **فیلتر** براساس نوع فایل

### عملیات ZIP 🗜️
- ✅ **ساخت ZIP** از فایل‌ها و پوشه‌های انتخاب شده
- ✅ **استخراج ZIP** با تشخیص خودکار conflict
- ✅ **پشتیبانی از چند فایل** - ساخت و استخراج چند ZIP همزمان
- ✅ **Validation** - فقط فایل‌های ZIP قابل استخراج

### Copy/Cut/Paste 📋
- ✅ **کپی** فایل‌ها و پوشه‌ها
- ✅ **Cut (برش)** برای move کردن
- ✅ **Paste** در مقصد جدید
- ✅ **Clipboard** با persistence در navigation
- ✅ **Smart Validation** - جلوگیری از paste در مکان مبدأ

### نمایش و UI 🎨
- ✅ **Large Icons View** - نمایش آیکون‌های بزرگ
- ✅ **Details View** - نمایش جزئیات در جدول
- ✅ **View Dropdown** با sub-menu برای تغییر نمای نمایش
- ✅ **Dark Mode** (opt-in با `dark-mode` attribute)
- ✅ **Responsive Design** - کاملاً responsive با Bootstrap 5
- ✅ **RTL Support** - پشتیبانی کامل از راست به چپ

### چند زبانه (i18n) 🌍
- ✅ **انگلیسی** (`en.json`)
- ✅ **فارسی** (`fa.json`) با RTL خودکار
- ✅ **سیستم Locale** با قابلیت extend شدن
- ✅ **تغییر زبان در Runtime** بدون reload
- ✅ **Fallback** خودکار به انگلیسی

### تجربه کاربری 💡
- ✅ **Bootstrap Modals** - هیچ `alert()` یا `confirm()` سنتی
- ✅ **Toast Notifications** - بازخورد واضح برای عملیات
- ✅ **دکمه‌های غیرفعال** - buttons بدون selection غیرفعال
- ✅ **Context Menu** کامل با راست کلیک
- ✅ **Breadcrumb Navigation** - مسیر فعلی
- ✅ **پیش‌نمایش تصویر** - مشاهده عکس‌ها

### توسعه‌دهنده محور 🛠️
- ✅ **Tag Helper** برای Razor Pages/MVC
- ✅ **API RESTful** - endpoint های استاندارد
- ✅ **Repository Pattern** - معماری تمیز
- ✅ **Dependency Injection** - IoC با .NET Core
- ✅ **Fully Testable** - Unit و Integration Tests
- ✅ **NuGet Package** با auto-copy assets

---

## نصب سریع 🚀

### مرحله 1: نصب از NuGet

```bash
dotnet add package AspNetCoreFileManager
```

### مرحله 2: ثبت Services

در `Program.cs`:

```csharp
using AspNetCoreFileManager.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add File Manager services
builder.Services.AddFileManager(options =>
{
    options.RootFolder = Path.Combine(Directory.GetCurrentDirectory(), "Files");
    options.MaxUploadSize = 10 * 1024 * 1024; // 10 MB
    options.AllowedExtensions = new[] { ".jpg", ".png", ".pdf", ".zip" };
});

var app = builder.Build();
app.MapControllers();
app.Run();
```

### مرحله 3: اضافه کردن Assets به Layout

در `_Layout.cshtml`:

```html
<head>
    <!-- Bootstrap 5 (required) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome (required for icons) -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- File Manager CSS -->
    <link href="~/lib/aspnetcorefilemanager/css/filemanager.css" rel="stylesheet">
</head>
<body>
    @RenderBody()
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- File Manager JS (Merged: core + events + utils + zip + destroy) -->
    <script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
    
    <!-- اختیاری: اگر چند زبانه می‌خواهید -->
    <script src="~/lib/aspnetcorefilemanager/js/filemanager-i18n.js"></script>
    
    @await RenderSectionAsync("Scripts", required: false)
</body>
```

### مرحله 4: استفاده در View

#### روش 1: با Tag Helper (ساده)

```cshtml
@addTagHelper *, AspNetCoreFileManager

<file-manager id="myFileManager"
              path="/"
              ajax-url="/api/FileManager/FileOperations"
              upload-url="/api/FileManager/Upload"
              download-url="/api/FileManager/Download"
              get-image-url="/api/FileManager/GetImage">
</file-manager>

@section Scripts {
    <script>
        const fm = new FileManager('#myFileManager');
        fm.init();
    </script>
}
```

#### روش 2: با JavaScript خالص

```cshtml
<div id="fileManager"></div>

@section Scripts {
    <script>
        const fileManager = new FileManager('#fileManager', {
            path: '/',
            ajaxSettings: {
                url: '/api/FileManager/FileOperations',
                uploadUrl: '/api/FileManager/Upload',
                downloadUrl: '/api/FileManager/Download',
                getImageUrl: '/api/FileManager/GetImage'
            },
            view: 'largeicons', // یا 'details'
            allowMultiSelection: true,
            showHiddenItems: false
        });
        
        fileManager.init();
    </script>
}
```

---

## استفاده با فارسی 🇮🇷

### روش 1: با i18n

```cshtml
<div id="persianFileManager"></div>

@section Scripts {
    <script>
    (async function() {
        const fm = new FileManager('#persianFileManager', {
            path: '/',
            ajaxSettings: {
                url: '/api/FileManager/FileOperations',
                uploadUrl: '/api/FileManager/Upload',
                downloadUrl: '/api/FileManager/Download',
                getImageUrl: '/api/FileManager/GetImage'
            }
        });
        
        // Load Persian locale
        await fm.initializeWithLocale('fa');
        
        // Initialize and render
        fm.init();
    })();
    </script>
}
```

### روش 2: با Tag Helper

```cshtml
<file-manager id="myFileManager"
              path="/"
              ajax-url="/api/FileManager/FileOperations"
              upload-url="/api/FileManager/Upload"
              download-url="/api/FileManager/Download"
              get-image-url="/api/FileManager/GetImage"
              dir="rtl">
</file-manager>

@section Scripts {
    <script>
    (async function() {
        const fm = new FileManager('#myFileManager');
        await fm.initializeWithLocale('fa');
        fm.init();
    })();
    </script>
}
```

---

## تنظیمات پیشرفته ⚙️

### با Dark Mode

```cshtml
<file-manager id="myFileManager"
              path="/"
              ajax-url="/api/FileManager/FileOperations"
              upload-url="/api/FileManager/Upload"
              download-url="/api/FileManager/Download"
              get-image-url="/api/FileManager/GetImage"
              dark-mode="true">
</file-manager>
```

### تنظیمات Toolbar

```javascript
const fm = new FileManager('#fileManager', {
    path: '/',
    ajaxSettings: { /* ... */ },
    toolbarSettings: {
        visible: true,
        items: ['NewFolder', 'Upload', 'Cut', 'Copy', 'Paste', 'Delete', 
                'Download', 'Rename', 'Refresh', 'View', 'Details', 'Zip', 'Unzip']
    }
});
```

### تنظیمات Context Menu

```javascript
const fm = new FileManager('#fileManager', {
    path: '/',
    ajaxSettings: { /* ... */ },
    contextMenuSettings: {
        visible: true,
        items: ['Open', '|', 'Cut', 'Copy', 'Paste', '|', 'Delete', 'Rename', 
                '|', 'Zip', 'Unzip', '|', 'Details']
    }
});
```

### فیلتر نوع فایل

```csharp
builder.Services.AddFileManager(options =>
{
    options.AllowedExtensions = new[] 
    { 
        // Images
        ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg",
        
        // Documents
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt",
        
        // Archives
        ".zip", ".rar", ".7z",
        
        // Code
        ".cs", ".js", ".html", ".css", ".json"
    };
});
```

---

## ویژگی‌های نسخه 1.0.4 🎉

### ✅ چند زبانه (i18n)
- پشتیبانی کامل از فارسی و انگلیسی
- فایل‌های locale: `en.json`, `fa.json`
- RTL خودکار برای فارسی
- تغییر زبان در runtime

### ✅ View Dropdown
- دکمه View اکنون dropdown است
- گزینه‌های "Large Icons" و "Details"
- آیکون‌های مناسب
- کلیک خارج از dropdown آن را می‌بندد

### ✅ دکمه‌های غیرفعال پیش‌فرض
- Cut, Copy, Delete, Download, Rename, Details, Zip, Unzip غیرفعال
- فقط با انتخاب فایل/پوشه فعال می‌شوند
- Paste فقط با clipboard فعال می‌شود

### ✅ Paste در Context Menu
- راست کلیک روی folder مقصد
- Paste اگر clipboard دارای آیتم باشد فعال است

---

## دموها 📺

در پروژه demo، صفحات زیر موجود است:

1. **Basic Usage** - استفاده ساده
2. **Custom Configuration** - تنظیمات پیشرفته
3. **RTL Support** - نمایش RTL
4. **Persian Localization** - UI کاملاً فارسی ✨ NEW
5. **Multiple Instances** - چند instance همزمان
6. **API Reference** - مستندات API

---

## ساختار پروژه 📂

```
AspNetCoreFileManager/
├─ src/
│  └─ AspNetCoreFileManager/
│     ├─ Controllers/
│     │  └─ FileManagerController.cs
│     ├─ Services/
│     │  ├─ IFileManagerService.cs
│     │  └─ PhysicalFileManagerService.cs
│     ├─ Models/
│     │  ├─ FileManagerRequest.cs
│     │  └─ FileManagerResponse.cs
│     ├─ TagHelpers/
│     │  └─ FileManagerTagHelper.cs
│     └─ wwwroot/
│        ├─ css/
│        │  └─ filemanager.css
│        ├─ js/
│        │  ├─ filemanager.js           ← تک فایل merged شامل همه قابلیت‌ها
│        │  └─ filemanager-i18n.js      ← اختیاری برای چند زبانه
│        └─ locales/
│           ├─ en.json  ← ترجمه انگلیسی
│           └─ fa.json  ← ترجمه فارسی
├─ tests/
│  └─ AspNetCoreFileManager.Tests/
└─ samples/
   └─ AspNetCoreFileManager.Demo/
```

---

## API Endpoints 🔌

### FileOperations (POST)

```
POST /api/FileManager/FileOperations
Content-Type: application/json

{
  "action": "read|create|delete|rename|copy|move|search|zip|unzip",
  "path": "/folder",
  "name": "file.txt",
  "names": ["file1.txt", "file2.txt"],
  ...
}
```

### Upload (POST)

```
POST /api/FileManager/Upload
Content-Type: multipart/form-data

path: /folder
file: [binary]
```

### Download (POST)

```
POST /api/FileManager/Download
Content-Type: application/json

{
  "path": "/folder",
  "names": ["file1.txt", "file2.txt"]
}
```

### GetImage (GET)

```
GET /api/FileManager/GetImage?path=/images/photo.jpg
```

---

## تست‌ها 🧪

### اجرای تست‌ها

```bash
# All tests
dotnet test

# با Coverage
dotnet test /p:CollectCoverage=true /p:CoverageReportsDirectory=./coverage

# فقط Unit Tests
dotnet test --filter Category=Unit

# فقط Integration Tests
dotnet test --filter Category=Integration
```

---

## Build و Package 📦

### Build

```bash
dotnet build AspNetCoreFileManager.sln --configuration Release
```

### ساخت NuGet Package

```bash
dotnet pack src/AspNetCoreFileManager/AspNetCoreFileManager.csproj --configuration Release
```

Package در مسیر زیر ساخته می‌شود:
```
src/AspNetCoreFileManager/bin/Release/AspNetCoreFileManager.1.0.4.nupkg
```

---

## مستندات 📚

### فایل‌های مستندات

- **README.md** - راهنمای اصلی (انگلیسی)
- **README_FA.md** - این فایل (فارسی)
- **VERSION_1.0.4_COMPLETE.md** - خلاصه نسخه 1.0.4
- **LOCALIZATION_GUIDE.md** - راهنمای کامل چند زبانه
- **CHANGELOG.md** - تاریخچه تغییرات
- **docs/** - مستندات کامل

### راهنماهای سریع

- **QUICKSTART.md** - شروع سریع
- **QUICKSTART_ZIP.md** - راهنمای ZIP
- **NUGET_PACKAGE_GUIDE.md** - راهنماهای NuGet

---

## مشارکت 🤝

برای مشارکت:

1. **Fork** کنید
2. **Branch** جدید بسازید: `git checkout -b feature/AmazingFeature`
3. **Commit** کنید: `git commit -m 'Add some AmazingFeature'`
4. **Push** کنید: `git push origin feature/AmazingFeature`
5. **Pull Request** باز کنید

---

## لایسنس 📄

این پروژه تحت لایسنس **MIT** منتشر شده است.

---

## پشتیبانی 💬

- **GitHub Issues**: [گزارش مشکل](https://github.com/yourusername/AspNetCoreFileManager/issues)
- **Email**: your.email@example.com
- **Discussions**: [بحث و گفتگو](https://github.com/yourusername/AspNetCoreFileManager/discussions)

---

## نویسندگان ✍️

- **Your Name** - توسعه‌دهنده اصلی

---

## تشکر 🙏

از تمام کسانی که در این پروژه مشارکت کردند، تشکر می‌کنیم!

---

**Version:** 1.0.4  
**Release Date:** January 5, 2025  
**Status:** ✅ Production Ready

**با تشکر از استفاده شما! 🎉**

