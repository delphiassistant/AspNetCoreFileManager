# Localization Guide - راهنمای چند زبانه سازی

این راهنما نحوه استفاده از سیستم چند زبانه (i18n) در AspNetCoreFileManager را توضیح می‌دهد.

## فهرست

- [نصب](#نصب)
- [استفاده سریع](#استفاده-سریع)
- [زبان‌های پشتیبانی شده](#زبان‌های-پشتیبانی-شده)
- [ساختار فایل‌های Locale](#ساختار-فایل‌های-locale)
- [API Reference](#api-reference)
- [اضافه کردن زبان جدید](#اضافه-کردن-زبان-جدید)
- [RTL Support](#rtl-support)

---

## نصب

### مرحله 1: اضافه کردن Script

در فایل Layout یا View خود، فایل `filemanager-i18n.js` را اضافه کنید:

```html
<!-- File Manager Scripts - Load in order -->
<script src="~/lib/aspnetcorefilemanager/js/filemanager.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-utils.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-zip.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-events.js"></script>
<script src="~/lib/aspnetcorefilemanager/js/filemanager-i18n.js"></script>
```

### مرحله 2: اطمینان از وجود فایل‌های Locale

فایل‌های locale باید در مسیر زیر باشند:

```
wwwroot/
  └─ lib/
      └─ aspnetcorefilemanager/
          └─ locales/
              ├─ en.json    (English)
              ├─ fa.json    (Persian/Farsi)
              └─ ...
```

---

## استفاده سریع

### روش 1: با Tag Helper (ساده‌ترین)

```cshtml
<file-manager id="myFileManager"
              path="/"
              ajax-url="/api/FileManager/FileOperations"
              upload-url="/api/FileManager/Upload"
              download-url="/api/FileManager/Download"
              get-image-url="/api/FileManager/GetImage"
              locale="fa">
</file-manager>

<script>
(async function() {
    const fm = new FileManager('#myFileManager');
    await fm.initializeWithLocale('fa');
    fm.init();
})();
</script>
```

### روش 2: با JavaScript خالص

```html
<div id="fileManager"></div>

<script>
(async function() {
    const fileManager = new FileManager('#fileManager', {
        path: '/',
        ajaxSettings: {
            url: '/api/FileManager/FileOperations',
            uploadUrl: '/api/FileManager/Upload',
            downloadUrl: '/api/FileManager/Download',
            getImageUrl: '/api/FileManager/GetImage'
        }
    });
    
    // Load and set Persian locale
    await fileManager.initializeWithLocale('fa');
    
    // Initialize and render
    fileManager.init();
})();
</script>
```

### روش 3: تغییر زبان در Runtime

```javascript
const fm = new FileManager('#fileManager', { /* config */ });
fm.init();

// بعداً تغییر به فارسی
await FileManager.loadLocale('fa');
FileManager.setLocale('fa');
fm.render(); // Re-render با زبان جدید

// یا برگشت به انگلیسی
await FileManager.loadLocale('en');
FileManager.setLocale('en');
fm.render();
```

---

## زبان‌های پشتیبانی شده

### فعلی ✅

| زبان | Code | فایل | RTL | وضعیت |
|------|------|------|-----|-------|
| انگلیسی | `en` | `en.json` | ❌ | ✅ کامل |
| فارسی | `fa` | `fa.json` | ✅ | ✅ کامل |

### آینده 🚧

| زبان | Code | فایل | RTL | وضعیت |
|------|------|------|-----|-------|
| عربی | `ar` | `ar.json` | ✅ | 🚧 در دست توسعه |
| ترکی | `tr` | `tr.json` | ❌ | 📋 برنامه‌ریزی شده |
| اسپانیایی | `es` | `es.json` | ❌ | 📋 برنامه‌ریزی شده |

---

## ساختار فایل‌های Locale

### ساختار `en.json` و `fa.json`

```json
{
  "toolbar": {
    "newFolder": "New Folder",
    "upload": "Upload",
    "cut": "Cut",
    "copy": "Copy",
    "paste": "Paste",
    "delete": "Delete",
    "download": "Download",
    "rename": "Rename",
    "refresh": "Refresh",
    "view": "View",
    "selection": "Selection",
    "details": "Details",
    "zip": "Create ZIP",
    "unzip": "Extract ZIP"
  },
  "contextMenu": {
    "open": "Open",
    "cut": "Cut",
    "copy": "Copy",
    "paste": "Paste",
    "delete": "Delete",
    "rename": "Rename",
    "details": "Details",
    "zip": "Create ZIP",
    "unzip": "Extract ZIP"
  },
  "dialogs": {
    "newFolder": {
      "title": "Create New Folder",
      "label": "Folder Name:",
      "placeholder": "Enter folder name",
      "create": "Create",
      "cancel": "Cancel"
    },
    "rename": {
      "title": "Rename",
      "label": "New Name:",
      "placeholder": "Enter new name",
      "rename": "Rename",
      "cancel": "Cancel"
    },
    "upload": {
      "title": "Upload Files",
      "dragDrop": "Drag & drop files here or click to select",
      "selectFiles": "Select Files",
      "uploading": "Uploading...",
      "uploadSuccess": "Upload successful!",
      "close": "Close"
    },
    "delete": {
      "title": "Delete Confirmation",
      "messageSingle": "Are you sure you want to delete \"{0}\"?",
      "messageMultiple": "Are you sure you want to delete {0} items?",
      "delete": "Delete",
      "cancel": "Cancel"
    },
    "createZip": {
      "title": "Create ZIP Archive",
      "label": "ZIP File Name:",
      "placeholder": "Enter ZIP file name",
      "create": "Create",
      "cancel": "Cancel"
    },
    "extractZip": {
      "title": "Extract ZIP",
      "confirmSingle": "Extract \"{0}\" to current folder?",
      "confirmMultiple": "Extract {0} ZIP files to current folder?",
      "files": "Files: {0}",
      "extract": "Extract",
      "cancel": "Cancel"
    }
  },
  "messages": {
    "noSelection": "No Selection",
    "selectZipFiles": "Please select one or more ZIP files to extract.",
    "invalidSelection": "Invalid Selection",
    "onlyZipFiles": "Please select only ZIP files to extract. Some non-ZIP files are currently selected.",
    "copiedItems": "Copied {0} item(s) to clipboard",
    "cutItems": "Cut {0} item(s) to clipboard",
    "noFileSelected": "No files selected for ZIP creation.",
    "extractedSuccess": "Successfully extracted {0} file(s)",
    "extractedFailed": "Some extractions failed:\n{0}",
    "zipCreatedSuccess": "ZIP archive created successfully",
    "deleteSuccess": "Deleted successfully",
    "renameSuccess": "Renamed successfully",
    "uploadSuccess": "Files uploaded successfully",
    "error": "Error",
    "success": "Success"
  },
  "fileTypes": {
    "file": "File",
    "folder": "Folder",
    "image": "Image",
    "video": "Video",
    "audio": "Audio",
    "document": "Document",
    "archive": "Archive"
  },
  "view": {
    "largeIcons": "Large Icons",
    "details": "Details"
  }
}
```

### مثال `fa.json`

```json
{
  "toolbar": {
    "newFolder": "پوشه جدید",
    "upload": "آپلود",
    "cut": "برش",
    "copy": "کپی",
    "paste": "چسباندن",
    "delete": "حذف",
    "download": "دانلود",
    "rename": "تغییر نام",
    "refresh": "بارگذاری مجدد",
    "view": "نمایش",
    "selection": "انتخاب",
    "details": "جزئیات",
    "zip": "ساخت ZIP",
    "unzip": "استخراج ZIP"
  },
  ...
}
```

---

## API Reference

### Static Methods

#### `FileManager.loadLocale(locale)`

Load a locale file from server.

```javascript
await FileManager.loadLocale('fa');
// Loads: /lib/aspnetcorefilemanager/locales/fa.json
```

**Parameters:**
- `locale` (string): Locale code (e.g., 'en', 'fa', 'ar')

**Returns:** Promise<object> - Locale data

**Example:**
```javascript
const faData = await FileManager.loadLocale('fa');
console.log(faData.toolbar.newFolder); // "پوشه جدید"
```

#### `FileManager.setLocale(locale)`

Set current active locale.

```javascript
FileManager.setLocale('fa');
```

**Parameters:**
- `locale` (string): Locale code

**Returns:** void

---

### Instance Methods

#### `fm.t(key, params)`

Get translated string by key.

```javascript
fm.t('toolbar.newFolder');
// Returns: "New Folder" (if locale is 'en')
// Returns: "پوشه جدید" (if locale is 'fa')
```

**Parameters:**
- `key` (string): Dot-notation key (e.g., 'toolbar.newFolder')
- `params` (array, optional): Parameters for string interpolation

**Returns:** string

**Examples:**

```javascript
// Simple translation
fm.t('toolbar.upload');
// "Upload" or "آپلود"

// Nested key
fm.t('dialogs.newFolder.title');
// "Create New Folder" or "ساخت پوشه جدید"

// With parameters
fm.t('dialogs.delete.messageSingle', ['myfile.txt']);
// "Are you sure you want to delete "myfile.txt"?"
// "آیا از حذف "myfile.txt" مطمئن هستید؟"

fm.t('messages.copiedItems', [3]);
// "Copied 3 item(s) to clipboard"
// "3 مورد در کلیپ‌بورد کپی شد"
```

#### `fm.initializeWithLocale(locale)`

Initialize File Manager with specific locale (combines load and set).

```javascript
await fm.initializeWithLocale('fa');
```

**Parameters:**
- `locale` (string): Locale code

**Returns:** Promise<void>

**Side Effects:**
- Loads locale file
- Sets current locale
- Sets `dir="rtl"` for RTL languages (fa, ar, he)

---

## اضافه کردن زبان جدید

### مرحله 1: ساخت فایل Locale

فایل جدید در مسیر `wwwroot/lib/aspnetcorefilemanager/locales/` بسازید:

```
locales/
  ├─ en.json
  ├─ fa.json
  └─ ar.json    ← NEW
```

### مرحله 2: کپی کردن ساختار

فایل `en.json` را کپی کرده و translate کنید:

```json
{
  "toolbar": {
    "newFolder": "مجلد جديد",
    "upload": "تحميل",
    "cut": "قص",
    "copy": "نسخ",
    ...
  },
  ...
}
```

### مرحله 3: استفاده

```javascript
await fm.initializeWithLocale('ar');
fm.init();
```

### مرحله 4: اگر RTL است

در فایل `filemanager-i18n.js`:

```javascript
// Update document direction for RTL languages
if (locale === 'fa' || locale === 'ar' || locale === 'he' || locale === 'ur') {
    this.element.setAttribute('dir', 'rtl');
} else {
    this.element.setAttribute('dir', 'ltr');
}
```

---

## RTL Support

### زبان‌های RTL

زبان‌های زیر به صورت خودکار RTL می‌شوند:
- فارسی (`fa`)
- عربی (`ar`)
- عبری (`he`)

### مکانیزم RTL

وقتی locale یکی از زبان‌های RTL است:

1. `dir="rtl"` روی element file manager set می‌شود
2. CSS خودکار layout را reverse می‌کند
3. Text alignment به راست تغییر می‌کند

### تست RTL

```javascript
const fm = new FileManager('#fileManager', { /* config */ });
await fm.initializeWithLocale('fa');
fm.init();

console.log(fm.element.getAttribute('dir')); // "rtl"
```

---

## مثال‌های پیشرفته

### مثال 1: Locale Switcher

```html
<select id="localeSwitcher">
    <option value="en">English</option>
    <option value="fa">فارسی</option>
</select>

<div id="fileManager"></div>

<script>
const fm = new FileManager('#fileManager', { /* config */ });
await fm.initializeWithLocale('en');
fm.init();

document.getElementById('localeSwitcher').addEventListener('change', async (e) => {
    const locale = e.target.value;
    await FileManager.loadLocale(locale);
    FileManager.setLocale(locale);
    
    // Update direction
    if (locale === 'fa') {
        fm.element.setAttribute('dir', 'rtl');
    } else {
        fm.element.setAttribute('dir', 'ltr');
    }
    
    // Re-render
    fm.render();
});
</script>
```

### مثال 2: Fallback به English

```javascript
async function loadLocaleWithFallback(locale) {
    try {
        await FileManager.loadLocale(locale);
        FileManager.setLocale(locale);
    } catch (error) {
        console.warn(`Locale ${locale} not found, using English`);
        await FileManager.loadLocale('en');
        FileManager.setLocale('en');
    }
}

const fm = new FileManager('#fileManager', { /* config */ });
await loadLocaleWithFallback('fr'); // Falls back to 'en' if 'fr' not found
fm.init();
```

### مثال 3: Detect Browser Language

```javascript
function getBrowserLocale() {
    const lang = navigator.language || navigator.userLanguage;
    // 'en-US' => 'en', 'fa-IR' => 'fa'
    return lang.split('-')[0];
}

const fm = new FileManager('#fileManager', { /* config */ });
const locale = getBrowserLocale();
await fm.initializeWithLocale(locale);
fm.init();
```

---

## خطاهای رایج و حل آن‌ها

### خطا 1: `404 Not Found` برای locale file

**علت:** فایل locale در مسیر درست نیست

**حل:**
```
✅ درست: wwwroot/lib/aspnetcorefilemanager/locales/fa.json
❌ غلط: wwwroot/locales/fa.json
```

### خطا 2: UI به زبان جدید تغییر نمی‌کند

**علت:** فراموش کردن `render()` بعد از `setLocale()`

**حل:**
```javascript
await FileManager.loadLocale('fa');
FileManager.setLocale('fa');
fm.render(); // ← این خط ضروری است!
```

### خطا 3: RTL اعمال نمی‌شود

**علت:** `dir` attribute set نشده

**حل:**
```javascript
if (locale === 'fa') {
    fm.element.setAttribute('dir', 'rtl');
}
```

یا استفاده از `initializeWithLocale()` که خودکار این کار را انجام می‌دهد:
```javascript
await fm.initializeWithLocale('fa'); // ✅
```

---

## Performance Tips

### Tip 1: Pre-load Locales

```javascript
// Load multiple locales at once
await Promise.all([
    FileManager.loadLocale('en'),
    FileManager.loadLocale('fa')
]);

// Fast switch without loading
FileManager.setLocale('fa');
fm.render();
```

### Tip 2: Cache Locale Data

```javascript
// Locales are automatically cached in FileManager.locales
console.log(FileManager.locales);
// {
//   en: { toolbar: {...}, ... },
//   fa: { toolbar: {...}, ... }
// }
```

---

## پشتیبانی و مشارکت

### گزارش مشکل

اگر مشکلی با localization دارید:
1. Issue در GitHub باز کنید
2. Locale code و Browser info بدهید
3. Console errors را attach کنید

### مشارکت در ترجمه

برای اضافه کردن زبان جدید:
1. Fork کنید
2. فایل `locales/XX.json` بسازید
3. Pull Request ارسال کنید

---

**Version:** 1.0.4  
**Last Updated:** January 5, 2025

**Happy Localizing! 🌍**

