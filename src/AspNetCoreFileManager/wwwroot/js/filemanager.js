/**
 * AspNetCoreFileManager - A full-featured file manager component
 * @version 1.0.0
 */

(function (window) {
    'use strict';

    /**
     * FileManager class
     */
    class FileManager {
        constructor(element, options = {}) {
            this.element = typeof element === 'string' ? document.querySelector(element) : element;
            if (!this.element) {
                throw new Error('FileManager: Invalid element provided');
            }

            // Default configuration
            this.config = {
                ajaxSettings: {
                    url: '/api/FileManager/FileOperations',
                    uploadUrl: '/api/FileManager/Upload',
                    downloadUrl: '/api/FileManager/Download',
                    getImageUrl: '/api/FileManager/GetImage'
                },
                path: '/',
                view: 'largeicons', // 'largeicons' or 'details'
                allowDragAndDrop: true,
                allowMultiSelection: true,
                showFileExtension: true,
                showHiddenItems: false,
                showThumbnail: true,
                enablePersistence: false,
                enableRtl: false,
                contextMenuSettings: {
                    visible: true,
                    items: ['Open', '|', 'Cut', 'Copy', 'Paste', 'Delete', 'Rename', '|', 'Details']
                },
                navigationPaneSettings: {
                    visible: true,
                    minWidth: '200px',
                    maxWidth: '400px'
                },
                toolbarSettings: {
                    visible: true,
                    items: ['NewFolder', 'Upload', 'Delete', 'Download', 'Rename', 'SortBy', 'Refresh', 'Selection', 'View', 'Details']
                },
                searchSettings: {
                    allowSearchOnTyping: true,
                    filterType: 'contains',
                    ignoreCase: true
                },
                ...options
            };

            // State management
            this.state = {
                currentPath: this.config.path,
                selectedItems: [],
                files: [],
                cwd: null,
                view: this.config.view,
                clipboard: null,
                clipboardAction: null, // 'cut' or 'copy'
                searchQuery: '',
                sortBy: 'name',
                sortOrder: 'ascending'
            };

            // Event handlers storage
            this.eventHandlers = {};

            // Load persisted state if enabled
            if (this.config.enablePersistence) {
                this.loadPersistedState();
            }

            // Initialize the file manager
            this.init();
        }

        /**
         * Initialize the file manager
         */
        init() {
            this.element.classList.add('filemanager');
            
            if (this.config.enableRtl) {
                this.element.classList.add('rtl');
            }

        this.render();
        this.attachEventListeners();
        
        // Load files after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.loadFiles(this.state.currentPath);
        }, 0);
    }

        /**
         * Get localized text with fallback (defined early for use in render)
         */
        tWithFallback(key, fallback, params) {
            if (!this.t || !FileManager.locales || Object.keys(FileManager.locales).length === 0) {
                return fallback;
            }
            const translated = this.t(key, params);
            return (translated && translated !== key) ? translated : fallback;
        }

        /**
         * Render the file manager UI
         */
        render() {
            const html = `
                <div class="filemanager-container">
                    ${this.config.toolbarSettings.visible ? this.renderToolbar() : ''}
                    <div class="filemanager-content">
                        ${this.config.navigationPaneSettings.visible ? this.renderNavigationPane() : ''}
                        <div class="filemanager-main">
                            ${this.renderBreadcrumb()}
                            ${this.renderSearchBar()}
                            <div class="filemanager-view ${this.state.view}">
                                <div class="filemanager-items"></div>
                            </div>
                        </div>
                    </div>
                </div>
                ${this.config.contextMenuSettings.visible ? this.renderContextMenu() : ''}
                ${this.renderModals()}
            `;

            this.element.innerHTML = html;
        }

    /**
     * Render the toolbar
     */
    renderToolbar() {
        if (!this.config.toolbarSettings || !this.config.toolbarSettings.visible) {
            return '';
        }

        // Use default items if not specified
        const defaultItems = ['NewFolder', 'Upload', 'Cut', 'Copy', 'Paste', '|', 'Delete', 'Download', 'Rename', '|', 'Zip', 'Unzip', '|', 'Refresh', 'View', 'Details'];
        const itemsList = this.config.toolbarSettings.items || defaultItems;
        
        const items = itemsList.map(item => {
                if (item === '|') return '<div class="toolbar-separator"></div>';
                
                const itemConfig = {
                    NewFolder: { icon: 'fa-folder-plus', titleKey: 'toolbar.newFolder', title: 'New Folder', id: 'new-folder' },
                    Upload: { icon: 'fa-upload', titleKey: 'toolbar.upload', title: 'Upload', id: 'upload' },
                    Cut: { icon: 'fa-cut', titleKey: 'toolbar.cut', title: 'Cut', id: 'cut' },
                    Copy: { icon: 'fa-copy', titleKey: 'toolbar.copy', title: 'Copy', id: 'copy' },
                    Paste: { icon: 'fa-paste', titleKey: 'toolbar.paste', title: 'Paste', id: 'paste' },
                    Delete: { icon: 'fa-trash', titleKey: 'toolbar.delete', title: 'Delete', id: 'delete' },
                    Download: { icon: 'fa-download', titleKey: 'toolbar.download', title: 'Download', id: 'download' },
                    Rename: { icon: 'fa-edit', titleKey: 'toolbar.rename', title: 'Rename', id: 'rename' },
                    Zip: { icon: 'fa-file-archive', titleKey: 'toolbar.zip', title: 'Create ZIP', id: 'zip' },
                    Unzip: { icon: 'fa-file-zipper', titleKey: 'toolbar.unzip', title: 'Extract ZIP', id: 'unzip' },
                    SortBy: { icon: 'fa-sort', titleKey: 'toolbar.sortBy', title: 'Sort By', id: 'sortby', dropdown: true },
                    Refresh: { icon: 'fa-sync', titleKey: 'toolbar.refresh', title: 'Refresh', id: 'refresh' },
                    Selection: { icon: 'fa-check-square', titleKey: 'toolbar.selection', title: 'Selection', id: 'selection' },
                    View: { icon: 'fa-th', titleKey: 'toolbar.view', title: 'View', id: 'view', dropdown: true },
                    Details: { icon: 'fa-info-circle', titleKey: 'toolbar.details', title: 'Details', id: 'details' }
                };

                const config = itemConfig[item];
                if (!config) return '';

                // Get translated title (use titleKey if available and locale is loaded)
                let title = config.title;
                if (config.titleKey && this.t && FileManager.locales && Object.keys(FileManager.locales).length > 0) {
                    const translated = this.t(config.titleKey);
                    // Only use translation if it's not the key itself (meaning translation was found)
                    if (translated !== config.titleKey) {
                        title = translated;
                    }
                }

                // These buttons should be disabled by default (require selection)
                const requiresSelection = ['cut', 'copy', 'delete', 'download', 'rename', 'details', 'zip', 'unzip'];
                const requiresClipboard = ['paste'];
                const disabled = requiresSelection.includes(config.id) || requiresClipboard.includes(config.id);

                // Special handling for View dropdown
                if (config.id === 'view') {
                    let largeIconsText = 'Large Icons';
                    let detailsText = 'Details';
                    
                    if (this.t && FileManager.locales && Object.keys(FileManager.locales).length > 0) {
                        const largeIconsTranslated = this.t('view.largeIcons');
                        const detailsTranslated = this.t('view.details');
                        if (largeIconsTranslated !== 'view.largeIcons') largeIconsText = largeIconsTranslated;
                        if (detailsTranslated !== 'view.details') detailsText = detailsTranslated;
                    }
                    
                    return `
                        <div class="toolbar-dropdown">
                            <button class="toolbar-button" data-action="${config.id}" title="${title}">
                                <i class="fa ${config.icon}"></i>
                                <span class="toolbar-text">${title}</span>
                                <i class="fa fa-caret-down"></i>
                            </button>
                            <div class="toolbar-dropdown-menu hidden">
                                <button class="dropdown-item" data-view="largeicons">
                                    <i class="fa fa-th-large"></i>
                                    <span>${largeIconsText}</span>
                                </button>
                                <button class="dropdown-item" data-view="details">
                                    <i class="fa fa-list"></i>
                                    <span>${detailsText}</span>
                                </button>
                            </div>
                        </div>
                    `;
                }

                return `
                    <button class="toolbar-button" data-action="${config.id}" title="${title}" ${disabled ? 'disabled' : ''}>
                        <i class="fa ${config.icon}"></i>
                        <span class="toolbar-text">${title}</span>
                        ${config.dropdown ? '<i class="fa fa-caret-down"></i>' : ''}
                    </button>
                `;
            }).join('');

            return `
                <div class="filemanager-toolbar">
                    ${items}
                </div>
            `;
        }

        /**
         * Render the navigation pane
         */
        renderNavigationPane() {
            let foldersText = 'Folders';
            let filesText = 'Files';
            
            if (this.t && FileManager.locales && Object.keys(FileManager.locales).length > 0) {
                const foldersTranslated = this.t('navigation.folders');
                const filesTranslated = this.t('navigation.files');
                if (foldersTranslated !== 'navigation.folders') foldersText = foldersTranslated;
                if (filesTranslated !== 'navigation.files') filesText = filesTranslated;
            }
            
            return `
                <div class="filemanager-navigation" style="min-width: ${this.config.navigationPaneSettings.minWidth}; max-width: ${this.config.navigationPaneSettings.maxWidth}">
                    <div class="navigation-header">
                        <i class="fa fa-folder"></i>
                        <span>${foldersText}</span>
                    </div>
                    <div class="navigation-tree">
                        <div class="tree-item active" data-path="/">
                            <i class="fa fa-folder-open"></i>
                            <span>${filesText}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Render the breadcrumb
         */
        renderBreadcrumb() {
            let homeText = 'Home';
            
            if (this.t && FileManager.locales && Object.keys(FileManager.locales).length > 0) {
                const homeTranslated = this.t('breadcrumb.home');
                if (homeTranslated !== 'breadcrumb.home') homeText = homeTranslated;
            }
            
            const pathParts = this.state.currentPath.split('/').filter(p => p);
            const breadcrumbItems = [
                `<li class="breadcrumb-item" data-path="/"><i class="fa fa-home"></i> ${homeText}</li>`
            ];

            let currentPath = '';
            pathParts.forEach((part, index) => {
                currentPath += '/' + part;
                const isLast = index === pathParts.length - 1;
                breadcrumbItems.push(`
                    <li class="breadcrumb-item ${isLast ? 'active' : ''}" data-path="${currentPath}">
                        ${part}
                    </li>
                `);
            });

            return `
                <nav class="filemanager-breadcrumb">
                    <ol class="breadcrumb">
                        ${breadcrumbItems.join('')}
                    </ol>
                </nav>
            `;
        }

        /**
         * Render the search bar
         */
        renderSearchBar() {
            return `
                <div class="filemanager-search">
                    <i class="fa fa-search"></i>
                    <input type="text" class="search-input" placeholder="Search files and folders..." value="${this.state.searchQuery}">
                    <button class="search-clear ${this.state.searchQuery ? '' : 'hidden'}">
                        <i class="fa fa-times"></i>
                    </button>
                </div>
            `;
        }

    /**
     * Render the context menu
     */
    renderContextMenu() {
        if (!this.config.contextMenuSettings || !this.config.contextMenuSettings.visible) {
            return '';
        }

        // Use default items if not specified
        const defaultItems = ['Open', '|', 'Cut', 'Copy', 'Paste', 'Delete', 'Rename', '|', 'Zip', 'Unzip', '|', 'Details'];
        const itemsList = this.config.contextMenuSettings.items || defaultItems;
        
        const items = itemsList.map(item => {
                if (item === '|') return '<div class="context-menu-separator"></div>';
                
                const itemConfig = {
                    Open: { icon: 'fa-folder-open', textKey: 'contextMenu.open', text: 'Open' },
                    Cut: { icon: 'fa-cut', textKey: 'contextMenu.cut', text: 'Cut' },
                    Copy: { icon: 'fa-copy', textKey: 'contextMenu.copy', text: 'Copy' },
                    Paste: { icon: 'fa-paste', textKey: 'contextMenu.paste', text: 'Paste' },
                    Delete: { icon: 'fa-trash', textKey: 'contextMenu.delete', text: 'Delete' },
                    Rename: { icon: 'fa-edit', textKey: 'contextMenu.rename', text: 'Rename' },
                    Zip: { icon: 'fa-file-archive', textKey: 'contextMenu.zip', text: 'Create ZIP' },
                    Unzip: { icon: 'fa-file-zipper', textKey: 'contextMenu.unzip', text: 'Extract ZIP' },
                    Details: { icon: 'fa-info-circle', textKey: 'contextMenu.details', text: 'Details' }
                };

                const config = itemConfig[item];
                if (!config) return '';

                // Get translated text
                let text = config.text;
                if (config.textKey && this.t && FileManager.locales && Object.keys(FileManager.locales).length > 0) {
                    const translated = this.t(config.textKey);
                    if (translated !== config.textKey) {
                        text = translated;
                    }
                }

                return `
                    <div class="context-menu-item" data-action="${item.toLowerCase()}">
                        <i class="fa ${config.icon}"></i>
                        <span>${text}</span>
                    </div>
                `;
            }).join('');

            return `
                <div class="filemanager-context-menu hidden">
                    ${items}
                </div>
            `;
        }

        /**
         * Render modals
         */
        renderModals() {
            return `
                <!-- Image Preview Modal -->
                <div class="filemanager-modal hidden" id="image-preview-modal">
                    <div class="modal-backdrop"></div>
                    <div class="modal-content image-preview">
                        <button class="modal-close"><i class="fa fa-times"></i></button>
                        <img src="" alt="Preview">
                    </div>
                </div>

                <!-- New Folder Modal -->
                <div class="filemanager-modal hidden" id="new-folder-modal">
                    <div class="modal-backdrop"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${this.tWithFallback ? this.tWithFallback('modal.createFolder.title', 'Create New Folder') : 'Create New Folder'}</h3>
                            <button class="modal-close"><i class="fa fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <input type="text" class="form-control" id="new-folder-name" placeholder="${this.tWithFallback ? this.tWithFallback('modal.createFolder.placeholder', 'Folder name') : 'Folder name'}">
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-dismiss="modal">${this.tWithFallback ? this.tWithFallback('modal.createFolder.cancel', 'Cancel') : 'Cancel'}</button>
                            <button class="btn btn-primary" id="create-folder-btn">${this.tWithFallback ? this.tWithFallback('modal.createFolder.create', 'Create') : 'Create'}</button>
                        </div>
                    </div>
                </div>

                <!-- Rename Modal -->
                <div class="filemanager-modal hidden" id="rename-modal">
                    <div class="modal-backdrop"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${this.tWithFallback ? this.tWithFallback('modal.rename.title', 'Rename') : 'Rename'}</h3>
                            <button class="modal-close"><i class="fa fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <input type="text" class="form-control" id="rename-input" placeholder="${this.tWithFallback ? this.tWithFallback('modal.rename.placeholder', 'New name') : 'New name'}">
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-dismiss="modal">${this.tWithFallback ? this.tWithFallback('modal.rename.cancel', 'Cancel') : 'Cancel'}</button>
                            <button class="btn btn-primary" id="rename-btn">${this.tWithFallback ? this.tWithFallback('modal.rename.rename', 'Rename') : 'Rename'}</button>
                        </div>
                    </div>
                </div>

                <!-- Create ZIP Modal -->
                <div class="filemanager-modal hidden" id="create-zip-modal">
                    <div class="modal-backdrop"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${this.tWithFallback ? this.tWithFallback('modal.createZip.title', 'Create ZIP Archive') : 'Create ZIP Archive'}</h3>
                            <button class="modal-close"><i class="fa fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <input type="text" class="form-control" id="zip-name-input" placeholder="${this.tWithFallback ? this.tWithFallback('modal.createZip.placeholder', 'archive.zip') : 'archive.zip'}">
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-dismiss="modal">${this.tWithFallback ? this.tWithFallback('modal.createZip.cancel', 'Cancel') : 'Cancel'}</button>
                            <button class="btn btn-primary" id="create-zip-btn">${this.tWithFallback ? this.tWithFallback('modal.createZip.create', 'Create ZIP') : 'Create ZIP'}</button>
                        </div>
                    </div>
                </div>

                <!-- Details Modal -->
                <div class="filemanager-modal hidden" id="details-modal">
                    <div class="modal-backdrop"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Details</h3>
                            <button class="modal-close"><i class="fa fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div id="details-content"></div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>

                <!-- Upload Modal -->
                <div class="filemanager-modal hidden" id="upload-modal">
                    <div class="modal-backdrop"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${this.tWithFallback ? this.tWithFallback('modal.upload.title', 'Upload Files') : 'Upload Files'}</h3>
                            <button class="modal-close"><i class="fa fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="upload-area">
                                <i class="fa fa-cloud-upload-alt"></i>
                                <p>${this.tWithFallback ? this.tWithFallback('modal.upload.dragDrop', 'Drag and drop files here or click to browse') : 'Drag and drop files here or click to browse'}</p>
                                <input type="file" id="file-upload-input" multiple hidden>
                                <button class="btn btn-primary" id="browse-files-btn">${this.tWithFallback ? this.tWithFallback('modal.upload.browseFiles', 'Browse Files') : 'Browse Files'}</button>
                            </div>
                            <div class="upload-list hidden">
                                <h4>${this.tWithFallback ? this.tWithFallback('modal.upload.filesToUpload', 'Files to upload:') : 'Files to upload:'}</h4>
                                <div id="upload-files-list"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-dismiss="modal">${this.tWithFallback ? this.tWithFallback('modal.upload.cancel', 'Cancel') : 'Cancel'}</button>
                            <button class="btn btn-primary hidden" id="upload-files-btn">${this.tWithFallback ? this.tWithFallback('modal.upload.upload', 'Upload') : 'Upload'}</button>
                        </div>
                    </div>
                </div>

                <!-- Loading Overlay -->
                <div class="filemanager-loading hidden">
                    <div class="spinner"></div>
                    <span>${this.tWithFallback ? this.tWithFallback('loading.message', 'Loading...') : 'Loading...'}</span>
                </div>
            `;
        }

        /**
         * Render file items
         */
        renderItems() {
            const container = this.element.querySelector('.filemanager-items');
            if (!container) return;

            if (this.state.files.length === 0) {
                container.innerHTML = `
                    <div class="empty-folder">
                        <i class="fa fa-folder-open"></i>
                        <p>This folder is empty</p>
                    </div>
                `;
                return;
            }

            if (this.state.view === 'largeicons') {
                this.renderLargeIconsView(container);
            } else {
                this.renderDetailsView(container);
            }
        }

        /**
         * Render large icons view
         */
        renderLargeIconsView(container) {
            const html = this.state.files.map(file => {
                const isSelected = this.state.selectedItems.some(item => item.Name === file.name);
                const icon = this.getFileIcon(file);
                
                return `
                    <div class="file-item ${isSelected ? 'selected' : ''}" data-name="${file.name}" data-is-file="${file.isFile}">
                        <div class="file-checkbox">
                            <input type="checkbox" ${isSelected ? 'checked' : ''}>
                        </div>
                        <div class="file-icon">
                            ${icon}
                        </div>
                        <div class="file-name" title="${file.name}">${file.name}</div>
                    </div>
                `;
            }).join('');

            container.innerHTML = html;
        }

        /**
         * Render details view
         */
        renderDetailsView(container) {
            const html = `
                <table class="file-table">
                    <thead>
                        <tr>
                            <th class="checkbox-col">
                                <input type="checkbox" id="select-all">
                            </th>
                            <th class="sortable" data-sort="name">
                                Name
                                <i class="fa fa-sort"></i>
                            </th>
                            <th class="sortable" data-sort="dateModified">
                                Date Modified
                                <i class="fa fa-sort"></i>
                            </th>
                            <th class="sortable" data-sort="type">
                                Type
                                <i class="fa fa-sort"></i>
                            </th>
                            <th class="sortable" data-sort="size">
                                Size
                                <i class="fa fa-sort"></i>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.state.files.map(file => {
                            const isSelected = this.state.selectedItems.some(item => item.Name === file.name);
                            const icon = this.getFileIcon(file);
                            
                            return `
                                <tr class="file-row ${isSelected ? 'selected' : ''}" data-name="${file.name}" data-is-file="${file.isFile}">
                                    <td class="checkbox-col">
                                        <input type="checkbox" ${isSelected ? 'checked' : ''}>
                                    </td>
                                    <td class="file-name-col">
                                        ${icon}
                                        <span>${file.name}</span>
                                    </td>
                                    <td>${this.formatDate(file.dateModified)}</td>
                                    <td>${file.type}</td>
                                    <td>${file.isFile ? this.formatFileSize(file.size) : '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;

            container.innerHTML = html;
        }

        /**
         * Get file icon based on type
         */
        getFileIcon(file) {
            if (!file.isFile) {
                return '<i class="fa fa-folder file-icon-large"></i>';
            }

            const ext = file.type.toLowerCase();
            const iconMap = {
                // Images
                'jpg': 'fa-file-image',
                'jpeg': 'fa-file-image',
                'png': 'fa-file-image',
                'gif': 'fa-file-image',
                'svg': 'fa-file-image',
                'bmp': 'fa-file-image',
                'webp': 'fa-file-image',
                // Documents
                'pdf': 'fa-file-pdf',
                'doc': 'fa-file-word',
                'docx': 'fa-file-word',
                'xls': 'fa-file-excel',
                'xlsx': 'fa-file-excel',
                'ppt': 'fa-file-powerpoint',
                'pptx': 'fa-file-powerpoint',
                'txt': 'fa-file-alt',
                // Code
                'html': 'fa-file-code',
                'css': 'fa-file-code',
                'js': 'fa-file-code',
                'json': 'fa-file-code',
                'xml': 'fa-file-code',
                'cs': 'fa-file-code',
                'java': 'fa-file-code',
                'py': 'fa-file-code',
                // Archives
                'zip': 'fa-file-archive',
                'rar': 'fa-file-archive',
                '7z': 'fa-file-archive',
                'tar': 'fa-file-archive',
                'gz': 'fa-file-archive',
                // Audio
                'mp3': 'fa-file-audio',
                'wav': 'fa-file-audio',
                'ogg': 'fa-file-audio',
                // Video
                'mp4': 'fa-file-video',
                'avi': 'fa-file-video',
                'mov': 'fa-file-video',
                'wmv': 'fa-file-video'
            };

            const iconClass = iconMap[ext] || 'fa-file';
            return `<i class="fa ${iconClass} file-icon-large"></i>`;
        }

        /**
         * Format file size
         */
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }

        /**
         * Format date
         */
        formatDate(date) {
            const d = new Date(date);
            return d.toLocaleString();
        }

        /**
         * Continue with event listeners and AJAX methods...
         * (This is part 1 of filemanager.js - will continue in next file)
         */

        // ... (continued in next part)
    }

    // Export to window
    window.FileManager = FileManager;



    // ============================================
    // filemanager-events.js content
    // ============================================
/**
     * Attach event listeners
     */
    FileManager.prototype.attachEventListeners = function() {
        // Prevent duplicate listeners
        if (this._listenersAttached) {
            return;
        }
        this._listenersAttached = true;
        
        // Store reference for cleanup
        if (!this._eventHandlers) {
            this._eventHandlers = [];
        }
        
        // Toolbar events handler
        const toolbarClickHandler = (e) => {
            const toolbarBtn = e.target.closest('.toolbar-button');
            if (toolbarBtn) {
                const action = toolbarBtn.dataset.action;
                
                // Handle View dropdown toggle
                if (action === 'view') {
                    e.stopPropagation();
                    const dropdown = toolbarBtn.closest('.toolbar-dropdown');
                    const menu = dropdown?.querySelector('.toolbar-dropdown-menu');
                    if (menu) {
                        menu.classList.toggle('hidden');
                    }
                    return;
                }
                
                this.handleToolbarAction(action);
            }
            
            // Handle view dropdown items
            const dropdownItem = e.target.closest('.dropdown-item[data-view]');
            if (dropdownItem) {
                const view = dropdownItem.dataset.view;
                this.changeView(view);
                // Hide dropdown
                const menu = dropdownItem.closest('.toolbar-dropdown-menu');
                if (menu) menu.classList.add('hidden');
            }
        };
        
        this.element.addEventListener('click', toolbarClickHandler);
        this._eventHandlers.push({ element: this.element, type: 'click', handler: toolbarClickHandler });
        
        // Close dropdown when clicking outside
        const closeDropdownHandler = (e) => {
            // Don't close if clicking on a toolbar button (let toolbarClickHandler handle it)
            if (e.target.closest('.toolbar-button')) {
                return;
            }
            
            // Check if clicking inside this file manager instance
            const clickedFilemanager = e.target.closest('.filemanager');
            if (!clickedFilemanager || clickedFilemanager !== this.element) {
                return; // Different or no file manager instance
            }
            
            // Close dropdown if clicking outside the dropdown menu
            if (!e.target.closest('.toolbar-dropdown-menu')) {
                const dropdowns = this.element.querySelectorAll('.toolbar-dropdown-menu');
                dropdowns.forEach(menu => menu.classList.add('hidden'));
            }
        };
        
        document.addEventListener('click', closeDropdownHandler);
        this._eventHandlers.push({ element: document, type: 'click', handler: closeDropdownHandler });

        // File item click events
        this.element.addEventListener('click', (e) => {
            const fileItem = e.target.closest('.file-item, .file-row');
            if (fileItem && !e.target.closest('.file-checkbox input')) {
                this.handleItemClick(fileItem, e);
            }
        });

        // File item double click
        this.element.addEventListener('dblclick', (e) => {
            const fileItem = e.target.closest('.file-item, .file-row');
            if (fileItem) {
                this.handleItemDoubleClick(fileItem);
            }
        });

        // Checkbox events
        this.element.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.file-checkbox, .checkbox-col')) {
                const fileItem = e.target.closest('.file-item, .file-row');
                if (fileItem) {
                    this.handleCheckboxChange(fileItem, e.target.checked);
                }
            }
        });

        // Select all checkbox
        this.element.addEventListener('change', (e) => {
            if (e.target.id === 'select-all') {
                this.handleSelectAll(e.target.checked);
            }
        });

        // Context menu
        this.element.addEventListener('contextmenu', (e) => {
            const fileItem = e.target.closest('.file-item, .file-row');
            if (fileItem || e.target.closest('.filemanager-items')) {
                e.preventDefault();
                this.showContextMenu(e.clientX, e.clientY, fileItem);
            }
        });

        // Context menu item click
        this.element.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.context-menu-item');
            if (menuItem) {
                const action = menuItem.dataset.action;
                this.handleContextMenuAction(action);
                this.hideContextMenu();
            }
        });

        // Hide context menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filemanager-context-menu')) {
                this.hideContextMenu();
            }
        });

        // Breadcrumb navigation
        this.element.addEventListener('click', (e) => {
            const breadcrumbItem = e.target.closest('.breadcrumb-item');
            if (breadcrumbItem && !breadcrumbItem.classList.contains('active')) {
                const path = breadcrumbItem.dataset.path;
                this.navigateTo(path);
            }
        });

        // Search
        const searchInput = this.element.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Search clear
        const searchClear = this.element.querySelector('.search-clear');
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // Modal close buttons and backdrop clicks
        this.element.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close') || e.target.closest('[data-dismiss="modal"]')) {
                const modal = e.target.closest('.filemanager-modal');
                if (modal) {
                    this.hideModal(modal);
                }
            }
            
            // Close modal when clicking backdrop
            if (e.target.classList.contains('modal-backdrop')) {
                const modal = e.target.closest('.filemanager-modal');
                if (modal) {
                    this.hideModal(modal);
                }
            }
        });

        // Modal buttons - use event delegation to handle dynamically rendered content
        const modalClickHandler = (e) => {
            // Browse files button
            if (e.target.closest('#browse-files-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const fileInput = this.element.querySelector('#file-upload-input');
                if (fileInput) {
                    fileInput.click();
                }
                return;
            }
            
            // Create folder button
            if (e.target.closest('#create-folder-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.createFolder();
                return;
            }
            
            // Rename button
            if (e.target.closest('#rename-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.performRename();
                return;
            }
            
            // Upload files button
            if (e.target.closest('#upload-files-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.performUpload();
                return;
            }
            
            // Create ZIP button
            if (e.target.closest('#create-zip-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.createZipArchive();
                return;
            }
        };
        
        this.element.addEventListener('click', modalClickHandler);
        this._eventHandlers.push({ element: this.element, type: 'click', handler: modalClickHandler });

        const fileUploadInput = this.element.querySelector('#file-upload-input');
        if (fileUploadInput) {
            const fileUploadHandler = (e) => {
                this.handleFileSelection(e.target.files);
            };
            fileUploadInput.addEventListener('change', fileUploadHandler);
            this._eventHandlers.push({ element: fileUploadInput, type: 'change', handler: fileUploadHandler });
        } else {
            console.warn('File upload input NOT found in DOM');
        }


        // Drag and drop
        if (this.config.allowDragAndDrop) {
            this.setupDragAndDrop();
        }

        // Sortable columns
        this.element.addEventListener('click', (e) => {
            const sortableCol = e.target.closest('.sortable');
            if (sortableCol) {
                this.handleSort(sortableCol.dataset.sort);
            }
        });
    };

    /**
     * Handle toolbar actions
     */
    FileManager.prototype.handleToolbarAction = function(action) {
        switch (action) {
            case 'new-folder':
                this.showNewFolderModal();
                break;
            case 'upload':
                this.showUploadModal();
                break;
            case 'cut':
                this.cutSelected();
                break;
            case 'copy':
                this.copySelected();
                break;
            case 'paste':
                this.paste();
                break;
            case 'delete':
                this.deleteSelected();
                break;
            case 'download':
                this.downloadSelected();
                break;
            case 'rename':
                this.showRenameModal();
                break;
            case 'zip':
                this.showCreateZipModal();
                break;
            case 'unzip':
                this.extractZip();
                break;
            case 'refresh':
                this.refresh();
                break;
            case 'view':
                this.toggleView();
                break;
            case 'details':
                this.showDetails();
                break;
            case 'selection':
                this.toggleSelection();
                break;
        }
    };

    /**
     * Handle context menu actions
     */
    FileManager.prototype.handleContextMenuAction = function(action) {
        switch (action) {
            case 'open':
                if (this.state.selectedItems.length === 1) {
                    const item = this.state.selectedItems[0];
                    if (!item.IsFile) {
                        this.navigateTo(this.state.currentPath + '/' + item.Name);
                    }
                }
                break;
            case 'cut':
                this.cutSelected();
                break;
            case 'copy':
                this.copySelected();
                break;
            case 'paste':
                this.paste();
                break;
            case 'delete':
                this.deleteSelected();
                break;
            case 'rename':
                this.showRenameModal();
                break;
            case 'zip':
                this.showCreateZipModal();
                break;
            case 'unzip':
                this.extractZip();
                break;
            case 'details':
                this.showDetails();
                break;
        }
    };

    /**
     * Handle item click
     */
    FileManager.prototype.handleItemClick = function(fileItem, event) {
        if (!this.config.allowMultiSelection || (!event.ctrlKey && !event.metaKey)) {
            this.clearSelection();
        }

        fileItem.classList.toggle('selected');
        this.updateSelectedItems();
    };

    /**
     * Handle item double click
     */
    FileManager.prototype.handleItemDoubleClick = function(fileItem) {
        const name = fileItem.dataset.name;
        const isFile = fileItem.dataset.isFile === 'true';

        if (isFile) {
            // Check if it's an image
            const file = this.state.files.find(f => f.name === name);
            if (file && this.isImage(file.type)) {
                this.showImagePreview(this.state.currentPath + '/' + name);
            }
        } else {
            // Navigate to folder
            this.navigateTo(this.state.currentPath + '/' + name);
        }
    };

    /**
     * Handle checkbox change
     */
    FileManager.prototype.handleCheckboxChange = function(fileItem, checked) {
        if (checked) {
            fileItem.classList.add('selected');
        } else {
            fileItem.classList.remove('selected');
        }
        this.updateSelectedItems();
    };

    /**
     * Handle select all
     */
    FileManager.prototype.handleSelectAll = function(checked) {
        const fileItems = this.element.querySelectorAll('.file-item, .file-row');
        fileItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = checked;
                if (checked) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            }
        });
        this.updateSelectedItems();
    };

    /**
     * Update selected items
     */
    FileManager.prototype.updateSelectedItems = function() {
        const selectedElements = this.element.querySelectorAll('.file-item.selected, .file-row.selected');
        this.state.selectedItems = Array.from(selectedElements).map(el => {
            const name = el.dataset.name;
            const file = this.state.files.find(f => f.name === name);
            return {
                Name: name,
                IsFile: el.dataset.isFile === 'true',
                ...file
            };
        });

        // Update toolbar buttons state
        this.updateToolbarState();
    };

    /**
     * Update toolbar state
     */
    FileManager.prototype.updateToolbarState = function() {
        const hasSelection = this.state.selectedItems.length > 0;
        const singleSelection = this.state.selectedItems.length === 1;
        
        // Check if one or more ZIP files are selected (and only ZIP files)
        const hasZipFiles = hasSelection && this.state.selectedItems.length > 0;
        const onlyZipFiles = hasSelection && this.state.selectedItems.every(item => 
            item.IsFile && (item.type || '').toLowerCase().includes('zip')
        );
        const singleZipFile = singleSelection && this.state.selectedItems[0].IsFile &&
            (this.state.selectedItems[0].type || '').toLowerCase().includes('zip');

        // Check if clipboard has items
        const hasClipboard = this.state.clipboard && this.state.clipboard.items && this.state.clipboard.items.length > 0;

        const deleteBtn = this.element.querySelector('[data-action="delete"]');
        const downloadBtn = this.element.querySelector('[data-action="download"]');
        const renameBtn = this.element.querySelector('[data-action="rename"]');
        const detailsBtn = this.element.querySelector('[data-action="details"]');
        const zipBtn = this.element.querySelector('[data-action="zip"]');
        const unzipBtn = this.element.querySelector('[data-action="unzip"]');
        const cutBtn = this.element.querySelector('[data-action="cut"]');
        const copyBtn = this.element.querySelector('[data-action="copy"]');
        const pasteBtn = this.element.querySelector('[data-action="paste"]');

        if (deleteBtn) deleteBtn.disabled = !hasSelection;
        if (downloadBtn) downloadBtn.disabled = !hasSelection;
        if (renameBtn) renameBtn.disabled = !singleSelection;
        if (detailsBtn) detailsBtn.disabled = !hasSelection;
        if (zipBtn) zipBtn.disabled = !hasSelection;
        if (cutBtn) cutBtn.disabled = !hasSelection;
        if (copyBtn) copyBtn.disabled = !hasSelection;
        // Unzip: enabled only when one or more ZIP files selected (and NO non-ZIP files)
        if (unzipBtn) unzipBtn.disabled = !onlyZipFiles;
        // Paste: enabled only when clipboard has items
        if (pasteBtn) pasteBtn.disabled = !hasClipboard;
    };

    /**
     * Clear selection
     */
    FileManager.prototype.clearSelection = function() {
        const selectedItems = this.element.querySelectorAll('.file-item.selected, .file-row.selected');
        selectedItems.forEach(item => {
            item.classList.remove('selected');
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
        });
        this.state.selectedItems = [];
        this.updateToolbarState();
    };

    /**
     * Load files from server
     */
    FileManager.prototype.loadFiles = function(path, isSearch = false) {
        this.showLoading();

        const requestData = {
            action: 'read',
            path: path,
            showHiddenItems: this.config.showHiddenItems
        };

    this.ajax(this.config.ajaxSettings.url, 'POST', requestData)
        .then(response => {
            if (response.error || response.Error) {
                const error = response.error || response.Error;
                this.showError(error.message || error.Message);
                return;
            }

            // Normalize the response to handle different property casings
            const files = response.files || response.Files || [];
            const cwd = response.cwd || response.Cwd || null;
            
            // Convert to lowercase property names for consistency
            this.state.files = files.map(file => ({
                name: file.name || file.Name || '',
                size: file.size || file.Size || 0,
                isFile: file.isFile !== undefined ? file.isFile : (file.IsFile !== undefined ? file.IsFile : false),
                dateModified: file.dateModified || file.DateModified || new Date(),
                dateCreated: file.dateCreated || file.DateCreated || new Date(),
                type: file.type || file.Type || '',
                hasChild: file.hasChild !== undefined ? file.hasChild : (file.HasChild !== undefined ? file.HasChild : false),
                filterPath: file.filterPath || file.FilterPath || ''
            }));
            
            this.state.cwd = cwd;
            
            if (!isSearch) {
                this.state.currentPath = path;
            }

            this.renderItems();
            this.updateBreadcrumb();
            this.hideLoading();

            // Trigger success event
            this.trigger('success', { response });
        })
            .catch(error => {
                this.showError(error.message);
                this.hideLoading();
                this.trigger('failure', { error });
            });
    };

    /**
     * Navigate to path
     */
    FileManager.prototype.navigateTo = function(path) {
        this.clearSelection();
        this.loadFiles(path);
    };

    /**
     * Refresh current folder
     */
    FileManager.prototype.refresh = function() {
        this.loadFiles(this.state.currentPath);
    };

    /**
     * Create folder
     */
    FileManager.prototype.createFolder = function() {
        const input = this.element.querySelector('#new-folder-name');
        const folderName = input.value.trim();

        if (!folderName) {
            this.showConfirmDialog(
                this.tWithFallback('messages.validationError', 'Validation Error'),
                this.tWithFallback('messages.enterFolderName', 'Please enter a folder name'),
                null,
                true
            );
            return;
        }

        this.showLoading();

        const requestData = {
            action: 'create',
            path: this.state.currentPath,
            name: folderName
        };

        this.ajax(this.config.ajaxSettings.url, 'POST', requestData)
            .then(response => {
                if (response.error) {
                    this.showError(response.error.message);
                    return;
                }

                this.hideModal(this.element.querySelector('#new-folder-modal'));
                input.value = '';
                this.refresh();
                this.trigger('success', { response });
            })
            .catch(error => {
                this.showError(error.message);
                this.hideLoading();
            });
    };

    /**
     * Delete selected items
     */
    FileManager.prototype.deleteSelected = function() {
        if (this.state.selectedItems.length === 0) {
            this.showConfirmDialog(
                this.tWithFallback('messages.noSelection', 'No Selection'),
                this.tWithFallback('messages.selectItemsToDelete', 'Please select items to delete'),
                null,
                true
            );
            return;
        }

        const confirmMsg = this.tWithFallback(
            'messages.confirmDeleteMsg',
            'Are you sure you want to delete {0} item(s)?',
            { 0: this.state.selectedItems.length }
        );
        
        this.showConfirmDialog(
            this.tWithFallback('messages.confirmDelete', 'Confirm Delete'),
            confirmMsg,
            () => {
                this.performDelete();
            }
        );
    };

    /**
     * Perform delete operation
     */
    FileManager.prototype.performDelete = function() {

        this.showLoading();

        const names = this.state.selectedItems.map(item => item.Name);
        const requestData = {
            action: 'delete',
            path: this.state.currentPath,
            names: names
        };

        this.ajax(this.config.ajaxSettings.url, 'POST', requestData)
            .then(response => {
                if (response.error) {
                    this.showError(response.error.message);
                    return;
                }

                this.clearSelection();
                this.refresh();
                this.trigger('success', { response });
            })
            .catch(error => {
                this.showError(error.message);
                this.hideLoading();
            });
    };

    /**
     * Rename selected item
     */
    FileManager.prototype.performRename = function() {
        if (this.state.selectedItems.length !== 1) {
            return;
        }

        const input = this.element.querySelector('#rename-input');
        const newName = input.value.trim();

        if (!newName) {
            this.showConfirmDialog(
                this.tWithFallback('messages.validationError', 'Validation Error'),
                this.tWithFallback('messages.enterNewName', 'Please enter a new name'),
                null,
                true
            );
            return;
        }

        this.showLoading();

        const oldName = this.state.selectedItems[0].Name;
        const requestData = {
            action: 'rename',
            path: this.state.currentPath,
            name: oldName,
            newName: newName,
            showFileExtension: this.config.showFileExtension
        };

        this.ajax(this.config.ajaxSettings.url, 'POST', requestData)
            .then(response => {
                if (response.error) {
                    this.showError(response.error.message);
                    return;
                }

                this.hideModal(this.element.querySelector('#rename-modal'));
                this.clearSelection();
                this.refresh();
                this.trigger('success', { response });
            })
            .catch(error => {
                this.showError(error.message);
                this.hideLoading();
            });
    };

    /**
     * Copy selected items
     */
    FileManager.prototype.copySelected = function() {
        if (this.state.selectedItems.length === 0) {
            this.showConfirmDialog(
                this.tWithFallback('messages.noSelection', 'No Selection'),
                this.tWithFallback('messages.selectItemsToCopy', 'Please select one or more items to copy.'),
                null,
                true // Info only
            );
            return;
        }

        this.state.clipboard = {
            items: this.state.selectedItems.map(item => item.Name),
            path: this.state.currentPath,
            action: 'copy'
        };
        
        const title = this.tWithFallback('toast.copied', 'Copied');
        const message = this.tWithFallback('toast.copiedMessage', '{0} item(s) copied to clipboard', { 0: this.state.clipboard.items.length });
        this.showToast(title, message, 'success');
        this.updateToolbarState();
    };

    /**
     * Cut selected items
     */
    FileManager.prototype.cutSelected = function() {
        if (this.state.selectedItems.length === 0) {
            this.showConfirmDialog(
                this.tWithFallback('messages.noSelection', 'No Selection'),
                this.tWithFallback('messages.selectItemsToCut', 'Please select one or more items to cut.'),
                null,
                true // Info only
            );
            return;
        }

        this.state.clipboard = {
            items: this.state.selectedItems.map(item => item.Name),
            path: this.state.currentPath,
            action: 'cut'
        };
        
        const title = this.tWithFallback('toast.cut', 'Cut');
        const message = this.tWithFallback('toast.cutMessage', '{0} item(s) cut to clipboard', { 0: this.state.clipboard.items.length });
        this.showToast(title, message, 'success');
        this.updateToolbarState();
    };

    /**
     * Paste clipboard items
     */
    FileManager.prototype.paste = function() {
        if (!this.state.clipboard || !this.state.clipboard.items || this.state.clipboard.items.length === 0) {
            this.showConfirmDialog(
                this.tWithFallback('messages.clipboardEmpty', 'Clipboard Empty'),
                this.tWithFallback('messages.clipboardEmptyDesc', 'No items in clipboard. Please copy or cut some items first.'),
                null,
                true // Info only
            );
            return;
        }

        // Check if trying to paste in the same location
        if (this.state.clipboard.path === this.state.currentPath) {
            this.showConfirmDialog(
                this.tWithFallback('messages.sameLocation', 'Same Location'),
                this.tWithFallback('messages.sameLocationDesc', 'You are trying to paste in the same location. Please navigate to a different folder.'),
                null,
                true // Info only
            );
            return;
        }

        const action = this.state.clipboard.action === 'cut' ? 'move' : 'copy';
        const actionLabel = this.state.clipboard.action === 'cut' 
            ? this.tWithFallback('messages.confirmMove', 'Move Items')
            : this.tWithFallback('messages.confirmCopy', 'Copy Items');
        
        const confirmMsgKey = this.state.clipboard.action === 'cut' ? 'messages.confirmMoveMsg' : 'messages.confirmCopyMsg';
        const confirmMsgFallback = this.state.clipboard.action === 'cut'
            ? 'Move {0} item(s) from "{1}" to "{2}"?'
            : 'Copy {0} item(s) from "{1}" to "{2}"?';
        
        const confirmMsg = this.tWithFallback(
            confirmMsgKey,
            confirmMsgFallback,
            { 0: this.state.clipboard.items.length, 1: this.state.clipboard.path, 2: this.state.currentPath }
        );
        
        this.showConfirmDialog(
            actionLabel,
            confirmMsg,
            () => this.performPaste()
        );
    };

    /**
     * Perform paste operation
     */
    FileManager.prototype.performPaste = function() {
        this.showLoading();

        const requestData = {
            action: this.state.clipboard.action === 'cut' ? 'move' : 'copy',
            path: this.state.clipboard.path,
            targetPath: this.state.currentPath,
            names: this.state.clipboard.items
        };

        this.ajax(this.config.ajaxSettings.url, 'POST', requestData)
            .then(response => {
                if (response.error || response.Error) {
                    const error = response.error || response.Error;
                    this.showError(error.message || error.Message);
                    return;
                }

                const action = this.state.clipboard.action === 'cut' ? 'moved' : 'copied';
                this.showSuccess(`Successfully ${action} ${this.state.clipboard.items.length} item(s)`);

                // Clear clipboard after cut (move)
                if (this.state.clipboard.action === 'cut') {
                    this.state.clipboard = null;
                }

                this.updateToolbarState();
                this.refresh();
                this.trigger('success', { response });
            })
            .catch(error => {
                this.showError(error.message);
            })
            .finally(() => {
                this.hideLoading();
            });
    };

    /**
     * Download selected items
     */
    FileManager.prototype.downloadSelected = function() {
        if (this.state.selectedItems.length === 0) {
            return;
        }

        const names = this.state.selectedItems.map(item => item.Name);
        const requestData = {
            action: 'download',
            path: this.state.currentPath,
            names: names,
            data: this.state.selectedItems
        };

        // Use fetch to download
        fetch(this.config.ajaxSettings.downloadUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Download failed');
            }
            return response.blob();
        })
        .then(blob => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            // Get filename from Content-Disposition header or use default
            const filename = names.length === 1 ? names[0] : 'download.zip';
            a.download = filename;
            
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            this.showError('Download failed: ' + error.message);
        });
    };

    /**
     * Upload files
     */
    FileManager.prototype.performUpload = function() {
        const fileInput = this.element.querySelector('#file-upload-input');
        const files = fileInput.files;

        if (files.length === 0) {
            return;
        }

        // Hide the upload modal first
        const uploadModal = this.element.querySelector('#upload-modal');
        this.hideModal(uploadModal);
        
        // Then show loading
        this.showLoading();

        const formData = new FormData();
        formData.append('path', this.state.currentPath);
        formData.append('action', 'save');

        for (let i = 0; i < files.length; i++) {
            formData.append('uploadFiles', files[i]);
        }

        this.ajaxUpload(this.config.ajaxSettings.uploadUrl, formData)
            .then(response => {
                if (response.error) {
                    this.showError(response.error.message);
                    this.hideLoading();
                    return;
                }

                fileInput.value = '';
                this.hideLoading();
                this.refresh();
                this.trigger('success', { response });
            })
            .catch(error => {
                this.showError(error.message);
                this.hideLoading();
            });
    };

    /**
     * Handle file selection for upload
     */
    FileManager.prototype.handleFileSelection = function(files) {
        const filesList = this.element.querySelector('#upload-files-list');
        const uploadList = this.element.querySelector('.upload-list');
        const uploadBtn = this.element.querySelector('#upload-files-btn');

        if (files.length === 0) {
            uploadList?.classList.add('hidden');
            uploadBtn?.classList.add('hidden');
            return;
        }

        const html = Array.from(files).map(file => `
            <div class="upload-file-item">
                <i class="fa fa-file"></i>
                <span>${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
            </div>
        `).join('');

        if (filesList) {
            filesList.innerHTML = html;
        }
        if (uploadList) {
            uploadList.classList.remove('hidden');
        }
        if (uploadBtn) {
            uploadBtn.classList.remove('hidden');
        }
    };

    /**
     * Handle search
     */
    FileManager.prototype.handleSearch = function(query) {
        this.state.searchQuery = query;

        const searchClear = this.element.querySelector('.search-clear');
        if (query) {
            searchClear.classList.remove('hidden');
        } else {
            searchClear.classList.add('hidden');
            this.refresh();
            return;
        }

        if (this.config.searchSettings.allowSearchOnTyping) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        }
    };

    /**
     * Perform search
     */
    FileManager.prototype.performSearch = function(query) {
        this.showLoading();

        const requestData = {
            action: 'search',
            path: this.state.currentPath,
            searchString: query,
            showHiddenItems: this.config.showHiddenItems,
            caseSensitive: !this.config.searchSettings.ignoreCase
        };

        this.ajax(this.config.ajaxSettings.url, 'POST', requestData)
            .then(response => {
                if (response.error) {
                    this.showError(response.error.message);
                    return;
                }

                this.state.files = response.files || [];
                this.renderItems();
                this.hideLoading();
                this.trigger('success', { response });
            })
            .catch(error => {
                this.showError(error.message);
                this.hideLoading();
            });
    };

    /**
     * Clear search
     */
    FileManager.prototype.clearSearch = function() {
        const searchInput = this.element.querySelector('.search-input');
        searchInput.value = '';
        this.state.searchQuery = '';
        this.element.querySelector('.search-clear').classList.add('hidden');
        this.refresh();
    };

    /**
     * Show details
     */
    FileManager.prototype.showDetails = function() {
        if (this.state.selectedItems.length === 0) {
            return;
        }

        this.showLoading();

        const names = this.state.selectedItems.map(item => item.Name);
        const requestData = {
            action: 'details',
            path: this.state.currentPath,
            names: names,
            data: this.state.selectedItems
        };

        this.ajax(this.config.ajaxSettings.url, 'POST', requestData)
            .then(response => {
                if (response.error) {
                    this.showError(response.error.message);
                    return;
                }

                this.showDetailsModal(response.details);
                this.hideLoading();
            })
            .catch(error => {
                this.showError(error.message);
                this.hideLoading();
            });
    };

    /**
     * Continue in next file...
     */

    // ============================================
    // filemanager-utils.js content
    // ============================================
/**
     * Show modal
     */
    FileManager.prototype.showModal = function(modal) {
        if (typeof modal === 'string') {
            modal = this.element.querySelector(modal);
        }
        if (modal) {
            modal.classList.remove('hidden');
        }
    };

    /**
     * Hide modal
     */
    FileManager.prototype.hideModal = function(modal) {
        if (typeof modal === 'string') {
            modal = this.element.querySelector(modal);
        }
        if (modal) {
            modal.classList.add('hidden');
        }
    };

    /**
     * Show new folder modal
     */
    FileManager.prototype.showNewFolderModal = function() {
        this.showModal('#new-folder-modal');
        const input = this.element.querySelector('#new-folder-name');
        if (input) {
            input.focus();
        }
    };

    /**
     * Show rename modal
     */
    FileManager.prototype.showRenameModal = function() {
        if (this.state.selectedItems.length !== 1) {
            this.showConfirmDialog(
                this.tWithFallback('messages.invalidSelection', 'Invalid Selection'),
                this.tWithFallback('messages.selectSingleItemRename', 'Please select a single item to rename'),
                null,
                true
            );
            return;
        }

        const item = this.state.selectedItems[0];
        const input = this.element.querySelector('#rename-input');
        if (input) {
            input.value = item.Name;
        }

        this.showModal('#rename-modal');
        if (input) {
            input.focus();
            input.select();
        }
    };

    /**
     * Show upload modal
     */
    FileManager.prototype.showUploadModal = function() {
        this.showModal('#upload-modal');
        
        // Reset upload area
        const fileInput = this.element.querySelector('#file-upload-input');
        if (fileInput) {
            fileInput.value = '';
            
            // Remove any existing change listeners to avoid duplicates
            const oldHandler = fileInput._fmChangeHandler;
            if (oldHandler) {
                fileInput.removeEventListener('change', oldHandler);
            }
            
            // Attach new change listener
            const changeHandler = (e) => {
                this.handleFileSelection(e.target.files);
            };
            
            fileInput.addEventListener('change', changeHandler);
            fileInput._fmChangeHandler = changeHandler; // Store for cleanup
        }
        
        const uploadList = this.element.querySelector('.upload-list');
        if (uploadList) {
            uploadList.classList.add('hidden');
        }
        const uploadBtn = this.element.querySelector('#upload-files-btn');
        if (uploadBtn) {
            uploadBtn.classList.add('hidden');
        }
    };

    /**
     * Show details modal
     */
    FileManager.prototype.showDetailsModal = function(details) {
        const content = this.element.querySelector('#details-content');
        if (!content) return;

        let html = '<table class="details-table">';
        
        if (details.multipleFiles) {
            html += `
                <tr><td><strong>Items:</strong></td><td>${details.name}</td></tr>
                <tr><td><strong>Location:</strong></td><td>${details.location}</td></tr>
                <tr><td><strong>Total Size:</strong></td><td>${details.size}</td></tr>
            `;
        } else {
            html += `
                <tr><td><strong>Name:</strong></td><td>${details.name}</td></tr>
                <tr><td><strong>Location:</strong></td><td>${details.location}</td></tr>
                <tr><td><strong>Size:</strong></td><td>${details.size}</td></tr>
                <tr><td><strong>Created:</strong></td><td>${new Date(details.created).toLocaleString()}</td></tr>
                <tr><td><strong>Modified:</strong></td><td>${new Date(details.modified).toLocaleString()}</td></tr>
            `;
        }

        html += '</table>';
        content.innerHTML = html;

        this.showModal('#details-modal');
    };

    /**
     * Show image preview
     */
    FileManager.prototype.showImagePreview = function(path) {
        this.showLoading();

        const requestData = {
            path: path
        };

        this.ajax(this.config.ajaxSettings.getImageUrl, 'POST', requestData, { responseType: 'blob' })
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const modal = this.element.querySelector('#image-preview-modal');
                const img = modal.querySelector('img');
                
                img.src = url;
                this.showModal(modal);
                this.hideLoading();

                // Clean up blob URL when modal is closed
                const closeHandler = () => {
                    URL.revokeObjectURL(url);
                    modal.removeEventListener('click', closeHandler);
                };
                
                modal.addEventListener('click', (e) => {
                    if (e.target.closest('.modal-close') || e.target.classList.contains('modal-backdrop')) {
                        closeHandler();
                    }
                });
            })
            .catch(error => {
                this.showError('Failed to load image: ' + error.message);
                this.hideLoading();
            });
    };

    /**
     * Toggle view
     */
    FileManager.prototype.toggleView = function() {
        this.state.view = this.state.view === 'largeicons' ? 'details' : 'largeicons';
        this.changeView(this.state.view);
    };

    /**
     * Change view to specific mode
     */
    FileManager.prototype.changeView = function(viewMode) {
        this.state.view = viewMode;
        
        const viewContainer = this.element.querySelector('.filemanager-view');
        if (viewContainer) {
            viewContainer.className = `filemanager-view ${this.state.view}`;
        }

        this.renderItems();
        this.persistState();
    };

    /**
     * Toggle selection mode
     */
    FileManager.prototype.toggleSelection = function() {
        const fileItems = this.element.querySelectorAll('.file-item, .file-row');
        fileItems.forEach(item => {
            const checkbox = item.querySelector('.file-checkbox input, .checkbox-col input');
            if (checkbox) {
                checkbox.style.display = checkbox.style.display === 'none' ? '' : 'none';
            }
        });
    };

    /**
     * Handle sort
     */
    FileManager.prototype.handleSort = function(sortBy) {
        if (this.state.sortBy === sortBy) {
            this.state.sortOrder = this.state.sortOrder === 'ascending' ? 'descending' : 'ascending';
        } else {
            this.state.sortBy = sortBy;
            this.state.sortOrder = 'ascending';
        }

        this.sortFiles();
        this.renderItems();
    };

    /**
     * Sort files
     */
    FileManager.prototype.sortFiles = function() {
        const multiplier = this.state.sortOrder === 'ascending' ? 1 : -1;

        this.state.files.sort((a, b) => {
            // Folders first
            if (!a.isFile && b.isFile) return -1;
            if (a.isFile && !b.isFile) return 1;

            let comparison = 0;
            switch (this.state.sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'dateModified':
                    comparison = new Date(a.dateModified) - new Date(b.dateModified);
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
                case 'size':
                    comparison = a.size - b.size;
                    break;
            }

            return comparison * multiplier;
        });
    };

    /**
     * Update breadcrumb
     */
    FileManager.prototype.updateBreadcrumb = function() {
        const breadcrumb = this.element.querySelector('.filemanager-breadcrumb');
        if (breadcrumb) {
            breadcrumb.outerHTML = this.renderBreadcrumb();
        }
    };

    /**
     * Setup drag and drop
     */
    FileManager.prototype.setupDragAndDrop = function() {
        const uploadArea = this.element.querySelector('.upload-area');
        const fileManagerItems = this.element.querySelector('.filemanager-items');

        if (uploadArea) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                uploadArea.addEventListener(eventName, () => {
                    uploadArea.classList.add('dragover');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, () => {
                    uploadArea.classList.remove('dragover');
                }, false);
            });

            uploadArea.addEventListener('drop', (e) => {
                const files = e.dataTransfer.files;
                this.handleFileSelection(files);
                const fileInput = this.element.querySelector('#file-upload-input');
                if (fileInput) {
                    fileInput.files = files;
                }
            }, false);
        }

        if (fileManagerItems) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                fileManagerItems.addEventListener(eventName, preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                fileManagerItems.addEventListener(eventName, () => {
                    fileManagerItems.classList.add('dragover');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                fileManagerItems.addEventListener(eventName, () => {
                    fileManagerItems.classList.remove('dragover');
                }, false);
            });

            fileManagerItems.addEventListener('drop', (e) => {
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.uploadDroppedFiles(files);
                }
            }, false);
        }

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    /**
     * Upload dropped files
     */
    FileManager.prototype.uploadDroppedFiles = function(files) {
        this.showLoading();

        const formData = new FormData();
        formData.append('path', this.state.currentPath);
        formData.append('action', 'save');

        for (let i = 0; i < files.length; i++) {
            formData.append('uploadFiles', files[i]);
        }

        this.ajaxUpload(this.config.ajaxSettings.uploadUrl, formData)
            .then(response => {
                if (response.error) {
                    this.showError(response.error.message);
                    return;
                }

                this.refresh();
                this.trigger('success', { response });
            })
            .catch(error => {
                this.showError(error.message);
                this.hideLoading();
            });
    };

    /**
     * Show context menu
     */
    FileManager.prototype.showContextMenu = function(x, y, fileItem) {
        const contextMenu = this.element.querySelector('.filemanager-context-menu');
        if (!contextMenu) return;

        // If clicking on empty space and no selection, select nothing
        if (!fileItem && this.state.selectedItems.length === 0) {
            return;
        }

        // If clicking on an item that's not selected, select only that item
        if (fileItem && !fileItem.classList.contains('selected')) {
            this.clearSelection();
            fileItem.classList.add('selected');
            this.updateSelectedItems();
        }

        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.classList.remove('hidden');

        // Enable/disable menu items based on selection
        const hasSelection = this.state.selectedItems.length > 0;
        const hasClipboard = this.state.clipboard && this.state.clipboard.length > 0;

        const menuItems = contextMenu.querySelectorAll('.context-menu-item');
        menuItems.forEach(item => {
            const action = item.dataset.action;
            
            if (['cut', 'copy', 'delete', 'rename', 'details', 'open'].includes(action)) {
                item.classList.toggle('disabled', !hasSelection);
            }
            
            if (action === 'paste') {
                item.classList.toggle('disabled', !hasClipboard);
            }

            if (action === 'open') {
                const singleFolder = hasSelection && 
                                    this.state.selectedItems.length === 1 && 
                                    !this.state.selectedItems[0].IsFile;
                item.classList.toggle('disabled', !singleFolder);
            }
        });
    };

    /**
     * Hide context menu
     */
    FileManager.prototype.hideContextMenu = function() {
        const contextMenu = this.element.querySelector('.filemanager-context-menu');
        if (contextMenu) {
            contextMenu.classList.add('hidden');
        }
    };

    /**
     * Show loading
     */
    FileManager.prototype.showLoading = function() {
        const loading = this.element.querySelector('.filemanager-loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    };

    /**
     * Hide loading
     */
    FileManager.prototype.hideLoading = function() {
        const loading = this.element.querySelector('.filemanager-loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    };

    /**
     * Show error
     */
    FileManager.prototype.showError = function(message) {
        this.showToast(message, 'error');
    };

    /**
     * Check if file is an image
     */
    FileManager.prototype.isImage = function(type) {
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        return imageTypes.includes(type.toLowerCase());
    };

    /**
     * AJAX request helper
     */
    FileManager.prototype.ajax = function(url, method, data, options = {}) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url, true);

            if (options.responseType) {
                xhr.responseType = options.responseType;
            } else {
                xhr.setRequestHeader('Content-Type', 'application/json');
            }

            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    if (options.responseType === 'blob') {
                        resolve(xhr.response);
                    } else {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            resolve(response);
                        } catch (e) {
                            reject(new Error('Invalid JSON response'));
                        }
                    }
                } else {
                    reject(new Error(`HTTP Error: ${xhr.status}`));
                }
            };

            xhr.onerror = function() {
                reject(new Error('Network error'));
            };

            if (options.responseType) {
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send(JSON.stringify(data));
            }
        });
    };

    /**
     * AJAX upload helper
     */
    FileManager.prototype.ajaxUpload = function(url, formData) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);

            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`HTTP Error: ${xhr.status}`));
                }
            };

            xhr.onerror = function() {
                reject(new Error('Network error'));
            };

            xhr.send(formData);
        });
    };

    /**
     * Event system
     */
    FileManager.prototype.on = function(eventName, handler) {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(handler);
    };

    FileManager.prototype.trigger = function(eventName, data) {
        if (this.eventHandlers[eventName]) {
            this.eventHandlers[eventName].forEach(handler => {
                handler.call(this, data);
            });
        }
    };

    /**
     * Persistence
     */
    FileManager.prototype.persistState = function() {
        if (!this.config.enablePersistence) return;

        const state = {
            currentPath: this.state.currentPath,
            view: this.state.view,
            selectedItems: this.state.selectedItems.map(item => item.Name)
        };

        localStorage.setItem('filemanager-state', JSON.stringify(state));
    };

    FileManager.prototype.loadPersistedState = function() {
        const stateJson = localStorage.getItem('filemanager-state');
        if (stateJson) {
            try {
                const state = JSON.parse(stateJson);
                this.state.currentPath = state.currentPath || this.config.path;
                this.state.view = state.view || this.config.view;
            } catch (e) {
                // Invalid state, ignore
            }
        }
    };

    /**
     * Public API methods
     */
    FileManager.prototype.refreshFiles = function() {
        this.refresh();
    };

    FileManager.prototype.getSelectedItems = function() {
        return this.state.selectedItems;
    };

    FileManager.prototype.getCurrentPath = function() {
        return this.state.currentPath;
    };

    FileManager.prototype.destroy = function() {
        // Clean up event listeners and remove from DOM
        this.element.innerHTML = '';
        this.element.classList.remove('filemanager');
    };

    /**
     * Show Bootstrap confirm dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {function} onConfirm - Callback when confirmed
     * @param {boolean} infoOnly - If true, only shows OK button (no cancel)
     */
    /**
     * Get localized text with fallback
     */
    FileManager.prototype.tWithFallback = function(key, fallback, params) {
        if (!this.t || !FileManager.locales || Object.keys(FileManager.locales).length === 0) {
            return fallback;
        }
        const translated = this.t(key, params);
        return (translated && translated !== key) ? translated : fallback;
    };

    FileManager.prototype.showConfirmDialog = function(title, message, onConfirm, infoOnly = false) {
        // Remove existing dialog if any
        const existing = document.getElementById('fm-confirm-dialog');
        if (existing) existing.remove();

        // Get localized button texts
        const cancelText = this.tWithFallback('dialog.cancel', 'Cancel');
        const confirmText = this.tWithFallback('dialog.confirm', 'Confirm');
        const okText = this.tWithFallback('dialog.ok', 'OK');

        // Check if RTL
        const isRTL = this.element && this.element.getAttribute('dir') === 'rtl';
        const dirAttr = isRTL ? ' dir="rtl"' : '';

        // Create modal HTML
        const modalHtml = `
            <div class="modal fade" id="fm-confirm-dialog" tabindex="-1" aria-labelledby="fmConfirmLabel" aria-hidden="true"${dirAttr}>
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="fmConfirmLabel">${this.escapeHtml(title)}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${this.escapeHtml(message).replace(/\n/g, '<br>')}
                        </div>
                        <div class="modal-footer">
                            ${infoOnly ? '' : `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>`}
                            <button type="button" class="btn btn-primary" id="fm-confirm-btn">${infoOnly ? okText : confirmText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Get modal element
        const modalElement = document.getElementById('fm-confirm-dialog');
        const confirmBtn = document.getElementById('fm-confirm-btn');

        // Create Bootstrap modal
        const modal = new bootstrap.Modal(modalElement);

        // Handle confirm button
        confirmBtn.addEventListener('click', () => {
            modal.hide();
            if (onConfirm && !infoOnly) {
                onConfirm();
            }
        });

        // Clean up after modal is hidden
        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
        });

        // Show modal
        modal.show();
    };

    /**
     * Show success message using Bootstrap toast/alert
     */
    FileManager.prototype.showSuccess = function(message) {
        this.showToast('Success', message, 'success');
    };

    /**
     * Show toast notification
     */
    FileManager.prototype.showToast = function(title, message, type = 'info') {
        // Remove existing toast if any
        const existing = document.getElementById('fm-toast');
        if (existing) existing.remove();

        const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-primary';

        // Check if RTL
        const isRTL = this.element && this.element.getAttribute('dir') === 'rtl';
        const dirAttr = isRTL ? ' dir="rtl"' : '';
        const positionClass = isRTL ? 'start-0' : 'end-0';
        
        // In LTR: title at start (left), close at end (right) - use me-auto on title
        // In RTL: title at start (right), close at end (left) - use ms-auto on title
        const titleClass = isRTL ? 'ms-auto' : 'me-auto';
        // In RTL: remove left margin on close button to align it to the edge
        const closeClass = isRTL ? 'ms-0' : '';

        const toastHtml = `
            <div class="position-fixed bottom-0 ${positionClass} p-3" style="z-index: 11000;">
                <div id="fm-toast" class="toast ${bgClass} text-white" role="alert" aria-live="assertive" aria-atomic="true"${dirAttr}>
                    <div class="toast-header ${bgClass} text-white">
                        <strong class="${titleClass}">${this.escapeHtml(title)}</strong>
                        <button type="button" class="btn-close btn-close-white ${closeClass}" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                        ${this.escapeHtml(message)}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById('fm-toast').closest('.position-fixed').querySelector('.toast');
        const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
        
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.closest('.position-fixed').remove();
        });

        toast.show();
    };

    /**
     * Escape HTML to prevent XSS
     */
    FileManager.prototype.escapeHtml = function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // ============================================
    // filemanager-zip.js content
    // ============================================
/**
     * Show create ZIP modal
     */
    FileManager.prototype.showCreateZipModal = function() {
        if (this.state.selectedItems.length === 0) {
            this.showConfirmDialog(
                this.tWithFallback('messages.noSelection', 'No Selection'),
                this.tWithFallback('messages.selectItemsForZip', 'Please select one or more files or folders to create a ZIP archive.'),
                null,
                true // Info only
            );
            return;
        }

        const input = this.element.querySelector('#zip-name-input');
        if (input) {
            input.value = 'archive.zip';
        }

        this.showModal('#create-zip-modal');
        if (input) {
            input.focus();
            input.select();
        }
    };

    /**
     * Create ZIP archive
     */
    FileManager.prototype.createZipArchive = function() {
        if (this.state.selectedItems.length === 0) {
            return;
        }

        const input = this.element.querySelector('#zip-name-input');
        let zipName = input.value.trim();

        if (!zipName) {
            this.showConfirmDialog(
                this.tWithFallback('messages.validationError', 'Validation Error'),
                this.tWithFallback('messages.enterZipName', 'Please enter a name for the ZIP archive'),
                null,
                true
            );
            return;
        }

        // Ensure .zip extension
        if (!zipName.endsWith('.zip')) {
            zipName += '.zip';
        }

        this.showLoading();

        const names = this.state.selectedItems.map(item => item.Name);
        const requestData = {
            action: 'zip',
            path: this.state.currentPath,
            names: names,
            name: zipName
        };

        this.ajax(this.config.ajaxSettings.url, 'POST', requestData)
            .then(response => {
                if (response.error || response.Error) {
                    const error = response.error || response.Error;
                    this.showError(error.message || error.Message);
                    return;
                }

                this.hideModal(this.element.querySelector('#create-zip-modal'));
                this.clearSelection();
                this.refresh();
                this.trigger('success', { response });
            })
            .catch(error => {
                this.showError(error.message);
                this.hideLoading();
            });
    };

    /**
     * Extract ZIP archive(s)
     */
    FileManager.prototype.extractZip = function() {
        if (this.state.selectedItems.length === 0) {
            this.showConfirmDialog(
                this.tWithFallback('messages.noSelection', 'No Selection'),
                this.tWithFallback('messages.selectZipFiles', 'Please select one or more ZIP files to extract.'),
                null,
                true // Info only
            );
            return;
        }

        // Check if all selected items are ZIP files
        const nonZipFiles = this.state.selectedItems.filter(item => 
            !item.IsFile || !(item.type || '').toLowerCase().includes('zip')
        );

        if (nonZipFiles.length > 0) {
            this.showConfirmDialog(
                this.tWithFallback('messages.invalidSelection', 'Invalid Selection'),
                this.tWithFallback('messages.nonZipFiles', 'Please select only ZIP files to extract. Some non-ZIP files are currently selected.'),
                null,
                true // Info only
            );
            return;
        }

        const zipFiles = this.state.selectedItems;
        const fileNames = zipFiles.map(f => f.Name).join(', ');
        
        const confirmMsgKey = zipFiles.length === 1 ? 'messages.confirmExtractSingle' : 'messages.confirmExtractMultiple';
        const confirmMsgFallback = zipFiles.length === 1
            ? 'Extract "{0}" to the current folder?'
            : 'Extract {0} ZIP files to the current folder?\n\nFiles: {1}';
        
        const confirmMsg = zipFiles.length === 1
            ? this.tWithFallback(confirmMsgKey, confirmMsgFallback, { 0: zipFiles[0].Name })
            : this.tWithFallback(confirmMsgKey, confirmMsgFallback, { 0: zipFiles.length, 1: fileNames });

        this.showConfirmDialog(
            this.tWithFallback('messages.confirmExtractZip', 'Extract ZIP'),
            confirmMsg,
            () => this.performExtractZip(zipFiles)
        );
    };

    /**
     * Perform ZIP extraction
     */
    FileManager.prototype.performExtractZip = function(zipFiles) {
        this.showLoading();

        // Extract each ZIP file sequentially
        const extractPromises = zipFiles.map(item => {
            const requestData = {
                action: 'unzip',
                path: this.state.currentPath,
                name: item.Name
            };
            return this.ajax(this.config.ajaxSettings.url, 'POST', requestData);
        });

        Promise.all(extractPromises)
            .then(responses => {
                const errors = responses.filter(r => r.error || r.Error);
                if (errors.length > 0) {
                    const errorMsgs = errors.map(e => (e.error || e.Error).message || (e.error || e.Error).Message).join('\n');
                    this.showError('Some extractions failed:\n' + errorMsgs);
                } else {
                    this.showSuccess(`Successfully extracted ${zipFiles.length} file(s)`);
                }
                this.clearSelection();
                this.refresh();
            })
            .catch(error => {
                this.showError(error.message);
            })
            .finally(() => {
                this.hideLoading();
            });
    };

    /**
     * Check if file is a ZIP archive
     */
    FileManager.prototype.isZipFile = function(fileName) {
        return fileName.toLowerCase().endsWith('.zip');
    };

    // ============================================
    // filemanager-destroy.js content
    // ============================================
/**
     * Destroy the file manager and cleanup all event listeners
     */
    FileManager.prototype.destroy = function() {
        // Remove all event listeners that were tracked
        if (this._eventHandlers && this._eventHandlers.length > 0) {
            this._eventHandlers.forEach(handler => {
                handler.element.removeEventListener(handler.type, handler.handler);
            });
            this._eventHandlers = [];
        }
        
        // Reset listener flag so new instance can attach listeners
        this._listenersAttached = false;
        
        // Clear the element content
        if (this.element) {
            this.element.innerHTML = '';
            this.element.classList.remove('filemanager', 'rtl');
        }
        
        // Clear state
        this.state = {
            currentPath: '/',
            selectedItems: [],
            clipboard: null,
            view: 'largeicons'
        };
    };

})(window);
