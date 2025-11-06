/**
 * FileManager Utility Methods
 * This is part 3 of the FileManager implementation
 */

(function (window) {
    'use strict';

    const FileManager = window.FileManager;

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

})(window);

