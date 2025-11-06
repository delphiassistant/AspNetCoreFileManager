/**
 * FileManager Internationalization (i18n)
 */

(function (window) {
    'use strict';

    const FileManager = window.FileManager;

    // Store loaded locales
    FileManager.locales = {};
    FileManager.currentLocale = 'en';

    /**
     * Load locale file
     */
    FileManager.loadLocale = async function(locale) {
        if (FileManager.locales[locale]) {
            return FileManager.locales[locale];
        }

        try {
            const response = await fetch(`/lib/aspnetcorefilemanager/locales/${locale}.json`);
            if (!response.ok) {
                console.warn(`Locale ${locale} not found, falling back to English`);
                return FileManager.locales['en'] || {};
            }
            
            const data = await response.json();
            FileManager.locales[locale] = data;
            return data;
        } catch (error) {
            console.error(`Error loading locale ${locale}:`, error);
            return FileManager.locales['en'] || {};
        }
    };

    /**
     * Set current locale
     */
    FileManager.setLocale = function(locale) {
        FileManager.currentLocale = locale;
    };

    /**
     * Get translation
     */
    FileManager.prototype.t = function(key, params) {
        const locale = FileManager.locales[FileManager.currentLocale] || FileManager.locales['en'] || {};
        
        // Navigate nested keys (e.g., 'toolbar.newFolder')
        const keys = key.split('.');
        let value = locale;
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                value = undefined;
                break;
            }
        }

        // If not found, return key itself
        if (value === undefined) {
            return key;
        }

        // Replace parameters {0}, {1}, etc
        if (params) {
            if (Array.isArray(params)) {
                params.forEach((param, index) => {
                    value = value.replace(`{${index}}`, param);
                });
            } else if (typeof params === 'object') {
                // Handle object parameters {0: value, 1: value}
                Object.keys(params).forEach(key => {
                    const regex = new RegExp(`\\{${key}\\}`, 'g');
                    value = value.replace(regex, params[key]);
                });
            }
        }

        return value;
    };

    /**
     * Initialize with locale
     */
    FileManager.prototype.initializeWithLocale = async function(locale) {
        await FileManager.loadLocale(locale);
        FileManager.setLocale(locale);
        
        // Store locale for later use
        this._currentLocale = locale;
        
        // Update document direction for RTL languages
        const isRTL = (locale === 'fa' || locale === 'ar' || locale === 'he');
        this.element.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        
        console.log('Locale set to:', locale, 'RTL:', isRTL, 'element dir:', this.element.getAttribute('dir'));
    };
    
    /**
     * Update direction after render
     */
    FileManager.prototype.updateDirection = function() {
        if (this._currentLocale) {
            const isRTL = (this._currentLocale === 'fa' || this._currentLocale === 'ar' || this._currentLocale === 'he');
            this.element.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
            console.log('Direction updated - locale:', this._currentLocale, 'dir:', this.element.getAttribute('dir'));
        }
    };

})(window);

