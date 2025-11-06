# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2025-01-05

### Added
- **Persian Localization System**: Complete i18n support with `filemanager-i18n.js`
- `locales/en.json` and `locales/fa.json` for English and Persian translations
- Persian Localization demo page showing full RTL support
- **View Dropdown with Sub-menu**: View button now opens dropdown with "Large Icons" and "Details" options
- Automatic RTL direction for Persian, Arabic, and Hebrew languages
- **Toolbar Buttons Disabled by Default**: Buttons requiring selection start disabled
- Translation API: `fm.t(key, params)` for accessing locale strings
- `initializeWithLocale(locale)` method for easy locale initialization

### Fixed
- **Copy/Paste Bug**: Now correctly stores source path with clipboard items
- Paste button now properly enables/disables based on clipboard state
- Copy/Cut operations now show success notifications
- Fixed API request structure (correct source and target paths)

### Changed
- **Toolbar Button States**: Cut, Copy, Delete, Download, Rename, Details, Zip, Unzip now start disabled
- **View Button**: Changed from toggle to dropdown with sub-menu items
- Clipboard now stores full context (items, source path, action)
- Enhanced `updateToolbarState()` to manage button states based on selection
- Improved user feedback with Toast notifications
- Default toolbar now includes Cut, Copy, Paste buttons

### Technical Details
- New clipboard structure: `{ items: [], path: '', action: '' }`
- `performPaste()` method for executing paste operations
- Proper source/target path handling in requests
- Bootstrap modals and toasts for all user interactions
- Locale loader with fallback to English
- Dropdown click-outside handler for better UX
- CSS for `.toolbar-dropdown` and `.toolbar-dropdown-menu`

## [1.0.3.1] - 2025-01-05

### Fixed
- **ZIP Operation Validation**: Added proper validation in controller for ZIP operations
- **Extract ZIP Button**: Now only enabled when ZIP files are selected
- Better error messages when no files selected for ZIP creation
- Button state management for ZIP operations based on file type
- Improved validation in `extractZip` to prevent extracting non-ZIP files

### Changed
- "Extract ZIP" button now disabled when non-ZIP files are selected
- Added visual feedback (disabled state) for unavailable operations
- Enhanced toolbar state management to check file types
- Better user experience with clear enable/disable states

## [1.0.3] - 2025-01-05

### Added
- **ZIP Operations**: Create ZIP archives from selected files and folders
- **Unzip Support**: Extract ZIP files to current folder
- New toolbar commands: "Create ZIP" and "Extract ZIP"
- New context menu items for ZIP operations
- Recursive folder compression in ZIP archives
- Smart naming to prevent conflicts when extracting
- Comprehensive ZIP operations documentation (docs/zip-operations.md)

### Technical Details
- Backend: `CreateZip` and `ExtractZip` methods in `IFileManagerService`
- Frontend: `filemanager-zip.js` module for ZIP UI interactions
- Controller: `zip` and `unzip` actions in FileManagerController
- Tag Helper: Updated default toolbar and context menu items to include ZIP commands

## [1.0.2] - 2025-01-05

### Fixed
- **Modal overlay blocking page**: Modal now uses display:none/flex instead of pointer-events
- **Download 415 error**: Changed download to use fetch API with proper content-type headers
- **File item vertical stretch**: Changed from CSS Grid to Flexbox layout for file items
- Added `[Consumes]` attribute to Download endpoint to accept JSON requests
- Modal backdrop click now properly closes modals

### Changed
- Download now uses modern fetch API instead of form submission
- Modal visibility managed purely through CSS display property
- File items now use fixed width (120px) and min-height (140px) for consistent card layout
- Flexbox layout with align-content: flex-start prevents vertical stretching

### Technical Details
- Modal uses `display: none` (hidden) and `display: flex` (shown) - no pointer-events manipulation
- Download creates blob and programmatic download link
- File items layout: `display: flex`, `flex-wrap: wrap`, `width: 120px`, `flex-shrink: 0`
- Backdrop click listener added to close modals

## [1.0.1] - 2025-01-05

### Fixed
- **Dark mode now opt-in**: Removed automatic dark mode based on system preferences
- File manager now displays in light mode by default for all users
- Improved dark mode color palette for better contrast and readability
- Fixed JavaScript error: "Cannot read properties of undefined (reading 'map')"
- Added proper handling for missing configuration in Tag Helper initialization
- Added response normalization to handle both PascalCase and camelCase API responses

### Added
- `dark-mode` attribute for Tag Helper to explicitly enable dark mode
- Comprehensive dark mode documentation (docs/dark-mode.md)
- Dark mode troubleshooting guide (DARK_MODE_FIX.md)
- Better CSS class management in Tag Helper

### Changed
- Dark mode is now class-based (`.filemanager.dark-mode`) instead of media query-based
- Improved dark mode colors: `#1e1e1e` background, `#e0e0e0` text (previously `#212529` and `#f8f9fa`)
- JavaScript files now handle missing configuration arrays gracefully
- Added proper null checks and default values in JavaScript initialization

### Migration Guide
If you were using the old version:
- File manager will now show light mode by default
- To enable dark mode: Add `dark-mode="true"` to the Tag Helper
- Or add the `dark-mode` CSS class manually
- See [DARK_MODE_FIX.md](DARK_MODE_FIX.md) for full migration guide

## [1.0.0] - 2025-01-01

### Added
- Initial release of ASP.NET Core File Manager
- Full file and folder operations (create, read, update, delete)
- File upload with drag-and-drop support
- File download (single and multiple as ZIP)
- Image preview with modal viewer
- Search functionality with case-sensitive option
- Breadcrumb navigation
- Toolbar with quick actions
- Navigation pane with folder tree
- Multiple view modes (Large Icons and Details)
- Context menu for quick operations
- Sortable columns in details view
- Multi-selection with checkboxes
- State persistence across page reloads
- RTL (Right-to-Left) layout support
- Responsive design for all devices
- Bootstrap 5 integration
- Font Awesome icons
- Tag Helper for easy integration
- JavaScript API for programmatic control
- Extensible architecture with custom file providers
- Comprehensive documentation
- Demo application with examples
- Unit tests and integration tests

### Features

#### Backend
- `PhysicalFileManagerService` for local file system operations
- `IFileManagerService` interface for custom implementations
- `FileManagerController` for API endpoints
- Path traversal protection
- Error handling and validation
- ZIP archive creation for multi-file downloads

#### Frontend
- Modern, responsive UI
- Drag-and-drop file upload
- Image preview
- File and folder operations
- Search with real-time filtering
- Multiple view modes
- Context menu
- Keyboard shortcuts
- Loading indicators
- Error messages

#### Configuration
- Easy service registration
- Tag Helper with comprehensive attributes
- JavaScript API with event system
- Customizable toolbar
- Customizable context menu
- Customizable navigation pane

### Documentation
- Getting Started guide
- Configuration guide
- API Reference
- Examples
- Troubleshooting guide

### Testing
- Unit tests for services
- Integration tests for controllers
- Test coverage for core functionality

## [Unreleased]

### Planned
- Azure Blob Storage provider
- AWS S3 provider
- File versioning
- File sharing and permissions
- Bulk operations with progress tracking
- Extended file preview support (PDF, Office documents)
- Video player integration
- Audio player integration
- Advanced search with filters
- File thumbnails generation
- Keyboard navigation enhancements

