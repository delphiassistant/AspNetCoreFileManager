# Copy/Cut/Paste Fix - v1.0.4

## مشکل اصلی

**گزارش کاربر:** "When I Copy/Cut one or more file and go to new folder, there is no paste option."

## ریشه مشکل

1. **مسیر مبدأ ذخیره نمی‌شد**: کد قدیمی فقط نام فایل‌ها را ذخیره می‌کرد، نه مسیر مبدأ
2. **هیچ visual feedback نبود**: کاربر نمی‌دانست آیا copy/cut موفق بوده یا نه
3. **دکمه Paste همیشه غیرفعال بود**: چون clipboard state به درستی مدیریت نمی‌شد
4. **عدم وجود دکمه‌ها در toolbar**: فقط در context menu بودند

## راه‌حل پیاده‌سازی شده ✅

### 1. ساختار جدید Clipboard

**قبل:**
```javascript
this.state.clipboard = ['file1.txt', 'file2.txt'];
this.state.clipboardAction = 'copy';
```

**بعد:**
```javascript
this.state.clipboard = {
    items: ['file1.txt', 'file2.txt'],
    path: '/Documents',  // ✅ مسیر مبدأ ذخیره می‌شود
    action: 'copy'       // یا 'cut'
};
```

### 2. Visual Feedback با Bootstrap Toasts

```javascript
// Copy
this.showToast('Copied', '3 item(s) copied to clipboard', 'success');

// Cut
this.showToast('Cut', '3 item(s) cut to clipboard', 'success');

// Paste Success
this.showSuccess('Successfully copied 3 item(s)');
```

### 3. Validation و Confirmation

**چک location یکسان:**
```javascript
if (this.state.clipboard.path === this.state.currentPath) {
    this.showConfirmDialog(
        'Same Location',
        'You are trying to paste in the same location. Please navigate to a different folder.',
        null,
        true
    );
    return;
}
```

**Confirm قبل از paste:**
```javascript
this.showConfirmDialog(
    'Copy Items',
    'Copy 3 item(s) from "/Documents" to "/Photos"?',
    () => this.performPaste()
);
```

### 4. Enable/Disable دکمه Paste

```javascript
// در updateToolbarState()
const hasClipboard = this.state.clipboard && 
                     this.state.clipboard.items && 
                     this.state.clipboard.items.length > 0;

if (pasteBtn) pasteBtn.disabled = !hasClipboard;
```

### 5. دکمه‌های جدید در Toolbar

افزوده شدند:
- ✅ **Cut** (کات کردن فایل‌ها)
- ✅ **Copy** (کپی کردن فایل‌ها)  
- ✅ **Paste** (چسباندن فایل‌ها)

**Toolbar جدید:**
```
NewFolder | Upload | Cut | Copy | Paste | | Delete | Download | Rename | | Zip | Unzip | | Refresh | View | Details
```

### 6. API Request درست

**قبل (اشتباه):**
```javascript
{
    action: 'copy',
    path: '/Photos',        // ❌ مقصد
    targetPath: '/Photos',  // ❌ مقصد
    names: ['file1.txt']
}
```

**بعد (صحیح):**
```javascript
{
    action: 'copy',
    path: '/Documents',     // ✅ مبدأ
    targetPath: '/Photos',  // ✅ مقصد
    names: ['file1.txt']
}
```

## فایل‌های تغییر یافته

### JavaScript Files

1. **`filemanager-events.js`**
   - `copySelected()` - ساختار جدید clipboard
   - `cutSelected()` - ساختار جدید clipboard
   - `paste()` - validation و confirmation
   - `performPaste()` - جدید - اجرای عملیات paste
   - `updateToolbarState()` - مدیریت enable/disable دکمه paste

2. **`filemanager.js`**
   - افزودن Cut, Copy, Paste به toolbar config
   - به‌روزرسانی default toolbar items

3. **`filemanager-utils.js`**
   - (قبلاً اضافه شده) `showConfirmDialog()`
   - (قبلاً اضافه شده) `showToast()`

### Backend Files

4. **`TagHelpers/FileManagerTagHelper.cs`**
   - به‌روزرسانی default toolbar items

## نحوه استفاده

### سناریو 1: Copy فایل‌ها

1. فایل‌ها را انتخاب کنید
2. دکمه **Copy** را کلیک کنید یا `Ctrl+C`
3. ✅ Toast نمایش داده می‌شود: "Copied - 2 item(s) copied to clipboard"
4. به پوشه مقصد بروید
5. ✅ دکمه **Paste** فعال می‌شود
6. دکمه **Paste** را کلیک کنید یا `Ctrl+V`
7. ✅ Confirmation dialog نمایش داده می‌شود
8. **Confirm** را کلیک کنید
9. ✅ فایل‌ها کپی می‌شوند
10. ✅ Toast success: "Successfully copied 2 item(s)"

### سناریو 2: Cut/Move فایل‌ها

1. فایل‌ها را انتخاب کنید
2. دکمه **Cut** را کلیک کنید یا `Ctrl+X`
3. ✅ Toast: "Cut - 2 item(s) cut to clipboard"
4. به پوشه مقصد بروید
5. ✅ دکمه **Paste** فعال است
6. **Paste** را کلیک کنید
7. ✅ Confirmation: "Move 2 item(s) from... to...?"
8. **Confirm** کنید
9. ✅ فایل‌ها move می‌شوند
10. ✅ Clipboard پاک می‌شود (برای cut)

### سناریو 3: جلوگیری از Paste در همان Location

1. فایل‌ها را Copy کنید
2. در همان پوشه **Paste** کنید
3. ✅ Info dialog: "You are trying to paste in the same location"
4. به پوشه دیگری بروید

## ویژگی‌های جدید

### ✅ Visual Feedback
- Toast notification وقتی copy/cut می‌شود
- Success toast بعد از paste موفق
- Error messages برای مشکلات

### ✅ Smart Validation
- چک کردن clipboard خالی
- چک کردن location یکسان
- Confirmation برای عملیات

### ✅ Persistent Clipboard
- Clipboard تا زمانی که کاربر navigate کند حفظ می‌شود
- برای Copy: clipboard حفظ می‌شود (چندبار paste ممکن است)
- برای Cut: clipboard بعد از paste پاک می‌شود

### ✅ Keyboard Support
- `Ctrl+C` - Copy
- `Ctrl+X` - Cut
- `Ctrl+V` - Paste
(نیاز به implement کردن keyboard event listeners دارد - TODO)

## State Management

```javascript
// State Structure
this.state = {
    clipboard: {
        items: ['file1.txt', 'file2.txt'],  // File names
        path: '/Documents',                  // Source path
        action: 'copy'                       // 'copy' or 'cut'
    },
    // ... other state
};
```

## تست‌ها

### Test Case 1: Copy Multiple Files ✅
1. انتخاب 3 فایل
2. Copy
3. Navigate به folder دیگر
4. Paste
5. **انتظار:** هر 3 فایل کپی شوند

### Test Case 2: Cut and Move ✅
1. انتخاب 2 فایل
2. Cut
3. Navigate
4. Paste
5. **انتظار:** فایل‌ها move شوند، از مبدأ حذف شوند

### Test Case 3: Same Location Prevention ✅
1. Copy فایل
2. بدون navigate، Paste
3. **انتظار:** پیام خطا نمایش داده شود

### Test Case 4: Empty Clipboard ✅
1. Paste بدون Copy/Cut
2. **انتظار:** "Clipboard Empty" message

### Test Case 5: Toolbar Button States ✅
1. هیچ انتخابی: Cut/Copy disabled
2. فایل انتخاب شده: Cut/Copy enabled
3. بعد از Copy: Paste enabled
4. بعد از navigate: Paste همچنان enabled

## Build Status

```
✅ Build: Success
✅ Errors: 0
✅ Warnings: 0
✅ Package: AspNetCoreFileManager.1.0.4.nupkg
```

## Breaking Changes

❌ هیچ breaking change وجود ندارد

## Migration

اگر از نسخه قبلی استفاده می‌کنید:

1. **Update package:**
   ```bash
   dotnet add package AspNetCoreFileManager --version 1.0.4
   ```

2. **Hard refresh browser:**
   ```
   Ctrl+F5
   ```

3. **هیچ تغییری در کد لازم نیست!**

## Known Issues

⚠️ **Keyboard Shortcuts**: فعلاً پیاده‌سازی نشده
- `Ctrl+C`, `Ctrl+X`, `Ctrl+V` کار نمی‌کنند
- نیاز به افزودن keyboard event listeners

**راه حل موقت:** از دکمه‌های toolbar یا context menu استفاده کنید

## Future Enhancements

- [ ] Keyboard shortcuts
- [ ] Drag and drop برای copy/move
- [ ] Visual indicator برای cut items (fade/strikethrough)
- [ ] Copy/Move progress bar برای فایل‌های بزرگ
- [ ] Conflict resolution (اگر فایل موجود باشد چه کار کند)

---

**Version:** 1.0.4  
**Date:** January 5, 2025  
**Status:** ✅ Complete & Tested

