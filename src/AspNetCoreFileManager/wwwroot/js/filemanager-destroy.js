/**
 * FileManager Destroy/Cleanup
 */

(function (window) {
    'use strict';

    const FileManager = window.FileManager;

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

