/**
 * Menu Enhancement — Akron Health Hub
 * Lightweight DOM enhancements for the menu overlay.
 * Only runs when the modal is detected as open.
 */
(function () {
    'use strict';

    // Icon mapping for menu items
    var MENU_ICONS = {
        'services': '�',
        'contact': '�',
        'library': '📚',
        'help': '❓'
    };

    var debounceTimer = null;

    /**
     * Get the current organization name from the hotspot title
     */
    function getOrgName() {
        var titleEl = document.getElementById('title-ctn');
        if (titleEl && titleEl.textContent) {
            return titleEl.textContent.trim();
        }
        return null;
    }

    /**
     * Add icon to a menu link element
     */
    function addIconToLink(link) {
        if (link.querySelector('.ahh-menu-icon')) return;

        var text = (link.textContent || '').trim().toLowerCase();

        for (var key in MENU_ICONS) {
            if (text.indexOf(key) !== -1) {
                var iconSpan = document.createElement('span');
                iconSpan.className = 'ahh-menu-icon';
                iconSpan.textContent = MENU_ICONS[key];
                iconSpan.setAttribute('aria-hidden', 'true');
                link.insertBefore(iconSpan, link.firstChild);
                break;
            }
        }
    }

    /**
     * Enhance the menu content when the modal opens
     */
    function enhanceMenu() {
        var menuContent = document.querySelector('.menu-content');
        if (!menuContent || menuContent.dataset.enhanced) return;

        menuContent.dataset.enhanced = 'true';

        // Add organization name subtitle
        var menuTitle = menuContent.querySelector('.menu-title');
        if (menuTitle && !menuContent.querySelector('.ahh-menu-org-name')) {
            var orgName = getOrgName();
            if (orgName) {
                var subtitle = document.createElement('p');
                subtitle.className = 'ahh-menu-org-name';
                subtitle.textContent = orgName;
                menuTitle.parentNode.insertBefore(subtitle, menuTitle.nextSibling);
            }
        }

        // Add icons to all menu links
        var links = menuContent.querySelectorAll('a[class^="menu-item"]');
        for (var i = 0; i < links.length; i++) {
            addIconToLink(links[i]);
        }

        // Add divider between navigation-menu and media-menu
        var navMenu = menuContent.querySelector('.navigation-menu');
        var mediaMenu = menuContent.querySelector('.media-menu');
        if (navMenu && mediaMenu && !menuContent.querySelector('.ahh-menu-divider')) {
            var divider = document.createElement('div');
            divider.className = 'ahh-menu-divider';
            mediaMenu.parentNode.insertBefore(divider, mediaMenu);
        }
    }

    /**
   * Debounced check — only runs if the overlay is currently visible
   */
    function debouncedCheck() {
        if (debounceTimer) return;
        debounceTimer = setTimeout(function () {
            debounceTimer = null;
            if (document.querySelector('.ReactModal__Overlay')) {
                enhanceMenu();
            }
            // Inject 360 badge on tour page
            inject360Badge();
        }, 150);
    }

    /**
     * Inject a 360° badge on the tour/hotspot page
     */
    var badgeInjected = false;

    function inject360Badge() {
        if (badgeInjected) return;
        var container = document.getElementById('container');
        var canvas = document.getElementById('canvas');
        if (!container || !canvas) return;
        if (container.querySelector('.ahh-360-badge')) return;

        badgeInjected = true;

        var badge = document.createElement('div');
        badge.className = 'ahh-360-badge';

        // 360 icon SVG
        badge.innerHTML =
            '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>' +
            '<path d="M15.5 11c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>' +
            '</svg>' +
            '<span>Drag to view 360°</span>';

        container.appendChild(badge);

        // Remove badge after animation completes (5s total: 0.5s in + 4s visible + 0.5s out)
        setTimeout(function () {
            if (badge.parentNode) badge.parentNode.removeChild(badge);
        }, 5000);
    }

    /**
     * Start observing — only watches #root for modal changes
     */
    function startObserver() {
        var root = document.getElementById('root');
        if (!root) return;

        var observer = new MutationObserver(function () {
            debouncedCheck();
        });

        observer.observe(root, {
            childList: true,
            subtree: true
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserver);
    } else {
        startObserver();
    }

    // Re-try on SPA navigation
    var origPushMenu = history.pushState;
    history.pushState = function () {
        origPushMenu.apply(this, arguments);
        badgeInjected = false;
        setTimeout(function () { inject360Badge(); }, 600);
    };

    window.addEventListener('popstate', function () {
        badgeInjected = false;
        setTimeout(function () { inject360Badge(); }, 600);
    });
})();
