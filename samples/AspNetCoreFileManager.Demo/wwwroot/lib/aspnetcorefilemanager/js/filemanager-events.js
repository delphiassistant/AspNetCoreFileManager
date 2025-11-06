/**
 * FileManager Event Handlers and AJAX Methods
 * This is part 2 of the FileManager implementation
 */

(function (window) {
    'use strict';

    const FileManager = window.FileManager;

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

})(window);

