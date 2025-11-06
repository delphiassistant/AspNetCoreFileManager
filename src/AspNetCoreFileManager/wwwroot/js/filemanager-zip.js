/**
 * FileManager ZIP/UNZIP Operations
 */

(function (window) {
    'use strict';

    const FileManager = window.FileManager;

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

})(window);

