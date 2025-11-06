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
            if (this config.enablePersistence) {
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

})(window);

