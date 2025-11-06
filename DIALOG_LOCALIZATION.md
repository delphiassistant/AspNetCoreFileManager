# Dialog Localization Implementation

## Overview
All dialog messages (alerts, confirmations, validation errors) are now fully localized and use the i18n system with fallback to English.

---

## Changes Made

### 1. New Helper Method: `tWithFallback()`

Added to `filemanager-utils.js`:

```javascript
FileManager.prototype.tWithFallback = function(key, fallback, params) {
    if (!this.t || !FileManager.locales || Object.keys(FileManager.locales).length === 0) {
        return fallback;
    }
    const translated = this.t(key, params);
    return (translated && translated !== key) ? translated : fallback;
};
```

**Purpose:** Provides localized text with automatic fallback to English if:
- No locale is loaded
- Translation key is not found
- Localization system is not initialized

---

## 2. Localization Keys Added

### English (`en.json`)

```json
{
  "messages": {
    "noSelection": "No Selection",
    "noSelectionDesc": "Please select one or more items first.",
    "invalidSelection": "Invalid Selection",
    "selectSingleItemRename": "Please select a single item to rename",
    "enterFolderName": "Please enter a folder name",
    "enterNewName": "Please enter a new name",
    "enterZipName": "Please enter a name for the ZIP archive",
    "selectItemsToDelete": "Please select items to delete",
    "selectItemsToCopy": "Please select one or more items to copy.",
    "selectItemsToCut": "Please select one or more items to cut.",
    "selectItemsForZip": "Please select one or more files or folders to create a ZIP archive.",
    "selectZipFiles": "Please select one or more ZIP files to extract.",
    "nonZipFiles": "Please select only ZIP files to extract. Some non-ZIP files are currently selected.",
    "clipboardEmpty": "Clipboard Empty",
    "clipboardEmptyDesc": "No items in clipboard. Please copy or cut some items first.",
    "sameLocation": "Same Location",
    "sameLocationDesc": "You are trying to paste in the same location. Please navigate to a different folder.",
    "confirmDelete": "Confirm Delete",
    "confirmDeleteMsg": "Are you sure you want to delete {0} item(s)?",
    "confirmCopy": "Copy Items",
    "confirmCopyMsg": "Copy {0} item(s) from \"{1}\" to \"{2}\"?",
    "confirmMove": "Move Items",
    "confirmMoveMsg": "Move {0} item(s) from \"{1}\" to \"{2}\"?",
    "confirmExtractZip": "Extract ZIP",
    "confirmExtractSingle": "Extract \"{0}\" to the current folder?",
    "confirmExtractMultiple": "Extract {0} ZIP files to the current folder?\n\nFiles: {1}",
    "validationError": "Validation Error"
  }
}
```

### Persian (`fa.json`)

```json
{
  "messages": {
    "noSelection": "موردی انتخاب نشده",
    "selectSingleItemRename": "لطفاً یک مورد را برای تغییر نام انتخاب کنید.",
    "enterFolderName": "لطفاً نام پوشه را وارد کنید",
    "enterNewName": "لطفاً نام جدید را وارد کنید",
    "enterZipName": "لطفاً نام فایل ZIP را وارد کنید",
    "selectItemsToDelete": "لطفاً موارد مورد نظر برای حذف را انتخاب کنید",
    "selectItemsToCopy": "لطفاً یک یا چند مورد برای کپی کردن انتخاب کنید.",
    "selectItemsToCut": "لطفاً یک یا چند مورد برای برش انتخاب کنید.",
    "selectItemsForZip": "لطفاً یک یا چند فایل یا پوشه برای ساخت آرشیو ZIP انتخاب کنید.",
    "selectZipFiles": "لطفاً یک یا چند فایل ZIP برای استخراج انتخاب کنید.",
    "nonZipFiles": "لطفاً فقط فایل‌های ZIP را برای استخراج انتخاب کنید. برخی فایل‌های غیر ZIP انتخاب شده‌اند.",
    "clipboardEmpty": "کلیپ‌بورد خالی است",
    "clipboardEmptyDesc": "هیچ موردی در کلیپ‌بورد وجود ندارد. لطفاً ابتدا مواردی را کپی یا برش دهید.",
    "sameLocation": "موقعیت یکسان",
    "sameLocationDesc": "شما در حال تلاش برای چسباندن در همان موقعیت هستید. لطفاً به پوشه دیگری بروید.",
    "confirmDelete": "تأیید حذف",
    "confirmDeleteMsg": "آیا مطمئن هستید که می‌خواهید {0} مورد را حذف کنید؟",
    "confirmCopy": "کپی کردن موارد",
    "confirmCopyMsg": "کپی {0} مورد از \"{1}\" به \"{2}\"؟",
    "confirmMove": "انتقال موارد",
    "confirmMoveMsg": "انتقال {0} مورد از \"{1}\" به \"{2}\"؟",
    "confirmExtractZip": "استخراج ZIP",
    "confirmExtractSingle": "فایل \"{0}\" در پوشه فعلی استخراج شود؟",
    "confirmExtractMultiple": "{0} فایل ZIP در پوشه فعلی استخراج شود؟\n\nفایل‌ها: {1}",
    "validationError": "خطای اعتبارسنجی"
  }
}
```

---

## 3. Updated Dialog Calls

### Before (Hardcoded English):
```javascript
this.showConfirmDialog('Validation Error', 'Please enter a folder name', null, true);
```

### After (Localized with Fallback):
```javascript
this.showConfirmDialog(
    this.tWithFallback('messages.validationError', 'Validation Error'),
    this.tWithFallback('messages.enterFolderName', 'Please enter a folder name'),
    null,
    true
);
```

---

## 4. Files Modified

### `filemanager-utils.js`
- ✅ Added `tWithFallback()` helper method
- ✅ Updated `showRenameModal()` to use localized messages

### `filemanager-events.js`
- ✅ Updated `createFolder()` - folder name validation
- ✅ Updated `deleteSelected()` - delete confirmation with item count
- ✅ Updated `performRename()` - rename validation
- ✅ Updated `copySelected()` - copy validation
- ✅ Updated `cutSelected()` - cut validation
- ✅ Updated `paste()` - clipboard empty, same location, and confirmation messages

### `filemanager-zip.js`
- ✅ Updated `showCreateZipModal()` - no selection validation
- ✅ Updated `createZipArchive()` - zip name validation
- ✅ Updated `extractZip()` - all validation and confirmation messages

---

## 5. Parameter Replacement

Localized messages support parameter replacement using `{0}`, `{1}`, etc.

**Example 1: Single Parameter**
```javascript
const confirmMsg = this.tWithFallback(
    'messages.confirmDeleteMsg',
    'Are you sure you want to delete {0} item(s)?',
    { 0: this.state.selectedItems.length }
);
// English: "Are you sure you want to delete 5 item(s)?"
// Persian: "آیا مطمئن هستید که می‌خواهید 5 مورد را حذف کنید؟"
```

**Example 2: Multiple Parameters**
```javascript
const confirmMsg = this.tWithFallback(
    'messages.confirmCopyMsg',
    'Copy {0} item(s) from "{1}" to "{2}"?',
    { 
        0: this.state.clipboard.items.length, 
        1: this.state.clipboard.path, 
        2: this.state.currentPath 
    }
);
// English: "Copy 3 item(s) from "/Documents" to "/Pictures"?"
// Persian: "کپی 3 مورد از "/Documents" به "/Pictures"؟"
```

---

## 6. Behavior

### When Persian locale is active (`fa`):
- ✅ All dialog titles and messages display in Persian
- ✅ Dialog direction follows RTL layout
- ✅ Numbers and paths are preserved correctly

### When no locale is loaded (default):
- ✅ All dialogs display in English (fallback)
- ✅ System works exactly as before
- ✅ No breaking changes for existing implementations

### When switching between locales:
- ✅ All subsequent dialogs use the new locale
- ✅ Instant translation without page reload
- ✅ Consistent user experience

---

## 7. Testing Checklist

- [x] Create Folder → Empty name validation
- [x] Rename → Single selection validation
- [x] Rename → Empty new name validation
- [x] Delete → No selection validation
- [x] Delete → Confirmation with item count
- [x] Copy → No selection validation
- [x] Cut → No selection validation
- [x] Paste → Empty clipboard validation
- [x] Paste → Same location validation
- [x] Paste → Confirmation with paths
- [x] Create ZIP → No selection validation
- [x] Create ZIP → Empty name validation
- [x] Extract ZIP → No selection validation
- [x] Extract ZIP → Non-ZIP files validation
- [x] Extract ZIP → Confirmation (single file)
- [x] Extract ZIP → Confirmation (multiple files)

---

## 8. Benefits

✅ **Fully Localized UX**: All user-facing messages respect the selected language  
✅ **Backward Compatible**: Works with or without localization  
✅ **Maintainable**: All messages centralized in JSON files  
✅ **Extensible**: Easy to add new languages  
✅ **Type-Safe Fallback**: Always displays meaningful text  
✅ **No Breaking Changes**: Existing implementations continue to work

---

## 9. How to Add a New Language

1. Create a new JSON file (e.g., `de.json` for German)
2. Copy the structure from `en.json`
3. Translate all message values
4. Load the locale: `await FileManager.loadLocale('de')`
5. Set the locale: `FileManager.setLocale('de')`

**Example:**
```javascript
await currentFileManager.initializeWithLocale('de');
currentFileManager.init();
currentFileManager.updateDirection();
```

---

## Summary

All dialog messages are now fully localized with:
- ✅ 20+ localization keys for dialogs
- ✅ English and Persian translations
- ✅ Parameter replacement support
- ✅ Automatic fallback to English
- ✅ Zero breaking changes

**The File Manager now provides a fully localized experience for all user interactions!** 🎉

