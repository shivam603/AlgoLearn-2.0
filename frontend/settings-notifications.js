/**
 * AlgoLearn — Unified Settings Hub & Notification Center
 * - Universal Settings Modal: Theme Bar, Account Session (Login/Logout), Audio, Hints, Speed, Monaco IDE Tools, Cache Tools.
 * - Universal Notification Center: Slide-over Drawer with unread badges, filter tabs, read tracking, and feature deep-links.
 * - Automatic navbar integration & global keyboard shortcuts.
 */

(function () {
    'use strict';

    // Do not run on the login/authentication gateway page
    if (typeof window !== 'undefined' && window.location && window.location.pathname.toLowerCase().endsWith('login.html')) {
        return;
    }

    // ==========================================
    // 1. Initial Mock / Seed Notifications
    // ==========================================
    const DEFAULT_NOTIFICATIONS = [
        {
            id: 'notif-codelab-2',
            title: 'Universal CodeLab 2.0 Live Debugger',
            message: 'Write and debug arbitrary custom code in Python, Java, C++, C, and JavaScript inside isolated Docker containers with live memory tracing!',
            category: 'features',
            time: 'Just now',
            timestamp: Date.now(),
            read: false,
            icon: 'bi-cpu-fill text-sky-400',
            badge: 'NEW FEATURE',
            badgeClass: 'bg-primary text-white',
            link: 'codelab.html',
            linkText: 'Launch CodeLab Studio'
        },
        {
            id: 'notif-cyberpunk-theme',
            title: 'Cyberpunk Neon Theme Available',
            message: 'Enjoy ultra-high contrast dark mode with sci-fi HUD accents and glowing brand typography in the new Theme Bar inside Settings.',
            category: 'system',
            time: '15m ago',
            timestamp: Date.now() - 15 * 60 * 1000,
            read: false,
            icon: 'bi-palette-fill text-warning',
            badge: 'THEME',
            badgeClass: 'bg-warning text-dark',
            action: 'openSettings',
            linkText: 'Open Theme Settings'
        },
        {
            id: 'notif-dsa-challenge',
            title: 'Daily DSA Challenge: Linked List Reversal',
            message: 'Test your understanding of pointers and node mutations. Reverse a singly linked list in linear time.',
            category: 'challenges',
            time: '2h ago',
            timestamp: Date.now() - 2 * 60 * 60 * 1000,
            read: false,
            icon: 'bi-trophy-fill text-success',
            badge: 'CHALLENGE',
            badgeClass: 'bg-success text-white',
            link: 'practice.html',
            linkText: 'Solve Problem'
        },
        {
            id: 'notif-docker-sandbox',
            title: 'Multi-Language Container Sandbox Active',
            message: 'Docker runtime verified with OpenJDK 17, GCC/G++, Python 3, and Node.js for high-speed sandboxed live code tracing.',
            category: 'system',
            time: '1d ago',
            timestamp: Date.now() - 24 * 60 * 60 * 1000,
            read: true,
            icon: 'bi-shield-check text-info',
            badge: 'SECURITY',
            badgeClass: 'bg-info text-dark',
            link: 'codelab.html',
            linkText: 'View Sandbox'
        }
    ];

    // ==========================================
    // 2. Notification Center Controller
    // ==========================================
    const AlgoNotifications = {
        items: [],
        currentFilter: 'all',

        init() {
            this.load();
            this.injectDrawerHtml();
            this.updateBadge();
            this.bindEvents();
        },

        load() {
            try {
                const stored = localStorage.getItem('algolearn_notifications');
                if (stored) {
                    this.items = JSON.parse(stored);
                } else {
                    this.items = [...DEFAULT_NOTIFICATIONS];
                    this.save();
                }
            } catch (e) {
                this.items = [...DEFAULT_NOTIFICATIONS];
            }
        },

        save() {
            try {
                localStorage.setItem('algolearn_notifications', JSON.stringify(this.items));
            } catch (e) {}
        },

        getUnreadCount() {
            return this.items.filter(item => !item.read).length;
        },

        updateBadge() {
            const count = this.getUnreadCount();
            document.querySelectorAll('.notification-badge-dot, .notification-badge-count').forEach(el => {
                if (count > 0) {
                    el.classList.remove('d-none');
                    if (el.classList.contains('notification-badge-count')) {
                        el.textContent = count > 9 ? '9+' : String(count);
                    }
                } else {
                    el.classList.add('d-none');
                }
            });

            const drawerBadge = document.getElementById('notif-unread-count-badge');
            if (drawerBadge) {
                if (count > 0) {
                    drawerBadge.textContent = `${count} New`;
                    drawerBadge.classList.remove('d-none');
                } else {
                    drawerBadge.textContent = 'All Caught Up';
                    drawerBadge.classList.add('bg-secondary');
                    drawerBadge.classList.remove('bg-primary');
                }
            }
        },

        injectDrawerHtml() {
            if (document.getElementById('algolearn-notification-drawer')) return;

            // Backdrop
            const backdrop = document.createElement('div');
            backdrop.id = 'algolearn-notification-backdrop';
            backdrop.className = 'algolearn-drawer-overlay notif-drawer-backdrop';
            backdrop.style.display = 'none';
            document.body.appendChild(backdrop);

            // Drawer
            const drawer = document.createElement('aside');
            drawer.id = 'algolearn-notification-drawer';
            drawer.className = 'algolearn-notification-drawer';
            drawer.style.display = 'none';
            drawer.setAttribute('aria-label', 'Notification Center');

            drawer.innerHTML = `
                <div class="notif-drawer-header">
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-bell-fill text-sky-400 fs-5"></i>
                        <span class="fw-bold fs-6 text-white">Notifications</span>
                        <span class="badge bg-primary rounded-pill small" id="notif-unread-count-badge">0 New</span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-2" id="notif-btn-mark-all" title="Mark all as read" style="font-size:0.72rem; height:24px;">
                            <i class="bi bi-check2-all me-1"></i> Read All
                        </button>
                        <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-2" id="notif-btn-clear" title="Clear notifications" style="font-size:0.72rem; height:24px;">
                            <i class="bi bi-trash3"></i>
                        </button>
                        <button type="button" class="drawer-close-btn" id="notif-btn-close" aria-label="Close Notifications">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>

                <div class="notif-filter-bar">
                    <button type="button" class="notif-filter-btn active" data-filter="all">All</button>
                    <button type="button" class="notif-filter-btn" data-filter="features">Features</button>
                    <button type="button" class="notif-filter-btn" data-filter="challenges">Challenges</button>
                    <button type="button" class="notif-filter-btn" data-filter="system">System</button>
                </div>

                <div class="notif-drawer-body" id="notif-drawer-body">
                    <!-- Notifications rendered dynamically -->
                </div>
            `;

            document.body.appendChild(drawer);
            this.renderList();
        },

        renderList() {
            const body = document.getElementById('notif-drawer-body');
            if (!body) return;

            let filtered = this.items;
            if (this.currentFilter !== 'all') {
                filtered = this.items.filter(item => item.category === this.currentFilter);
            }

            if (filtered.length === 0) {
                body.innerHTML = `
                    <div class="text-center py-5 px-3 text-muted">
                        <i class="bi bi-bell-slash display-5 d-block mb-3 opacity-50"></i>
                        <h6 class="text-white fw-bold mb-1">No Notifications</h6>
                        <p class="small mb-0">You're all caught up! New algorithm challenges and updates will appear here.</p>
                    </div>
                `;
                return;
            }

            let html = '';
            filtered.forEach(item => {
                const unreadClass = item.read ? '' : 'unread';
                const unreadDot = item.read ? '' : '<span class="notif-unread-dot" title="Unread"></span>';

                let actionHtml = '';
                if (item.link) {
                    actionHtml = `<a href="${item.link}" class="btn btn-xs btn-outline-info py-0 px-2 notif-action-btn" style="font-size:0.72rem;">${item.linkText || 'Open'} <i class="bi bi-arrow-right ms-1"></i></a>`;
                } else if (item.action === 'openSettings') {
                    actionHtml = `<button type="button" class="btn btn-xs btn-outline-info py-0 px-2 notif-action-btn" onclick="AlgoSettings.open()" style="font-size:0.72rem;">${item.linkText || 'Open Settings'}</button>`;
                }

                html += `
                    <div class="notif-item ${unreadClass}" data-id="${item.id}">
                        <div class="d-flex align-items-start gap-3">
                            <div class="notif-icon-box">
                                <i class="bi ${item.icon || 'bi-info-circle-fill'}"></i>
                            </div>
                            <div class="flex-grow-1 min-w-0">
                                <div class="d-flex align-items-center justify-content-between gap-2 mb-1">
                                    <div class="d-flex align-items-center gap-1 flex-wrap">
                                        <span class="badge ${item.badgeClass || 'bg-secondary'} notif-badge">${item.badge || 'UPDATE'}</span>
                                        <span class="notif-time text-muted">${item.time}</span>
                                    </div>
                                    ${unreadDot}
                                </div>
                                <h6 class="notif-title mb-1">${item.title}</h6>
                                <p class="notif-desc mb-2">${item.message}</p>
                                <div class="d-flex align-items-center justify-content-between mt-2">
                                    ${actionHtml}
                                    <button type="button" class="btn btn-xs btn-link text-muted p-0 text-decoration-none notif-dismiss-btn" data-id="${item.id}" title="Mark as read" style="font-size:0.72rem;">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            body.innerHTML = html;

            // Bind item click to mark read
            body.querySelectorAll('.notif-item').forEach(el => {
                el.addEventListener('click', (e) => {
                    if (e.target.closest('.notif-action-btn')) return;
                    const id = el.getAttribute('data-id');
                    AlgoNotifications.markAsRead(id);
                });
            });

            body.querySelectorAll('.notif-dismiss-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    AlgoNotifications.markAsRead(id);
                });
            });
        },

        markAsRead(id) {
            const item = this.items.find(x => x.id === id);
            if (item && !item.read) {
                item.read = true;
                this.save();
                this.renderList();
                this.updateBadge();
            }
        },

        markAllRead() {
            this.items.forEach(x => { x.read = true; });
            this.save();
            this.renderList();
            this.updateBadge();
        },

        clearAll() {
            this.items = [];
            this.save();
            this.renderList();
            this.updateBadge();
        },

        open() {
            const drawer = document.getElementById('algolearn-notification-drawer');
            const backdrop = document.getElementById('algolearn-notification-backdrop');
            if (drawer && backdrop) {
                this.renderList();
                this.updateBadge();
                drawer.style.display = 'flex';
                backdrop.style.display = 'block';
                // Trigger transition next tick
                requestAnimationFrame(() => {
                    drawer.classList.add('open');
                    backdrop.classList.add('active');
                });
                document.body.style.overflow = 'hidden';
            }
        },

        close() {
            const drawer = document.getElementById('algolearn-notification-drawer');
            const backdrop = document.getElementById('algolearn-notification-backdrop');
            if (drawer && backdrop) {
                drawer.classList.remove('open');
                backdrop.classList.remove('active');
                setTimeout(() => {
                    if (!drawer.classList.contains('open')) {
                        drawer.style.display = 'none';
                        backdrop.style.display = 'none';
                    }
                }, 300);
                document.body.style.overflow = '';
            }
        },

        toggle() {
            const drawer = document.getElementById('algolearn-notification-drawer');
            if (drawer && drawer.classList.contains('open')) {
                this.close();
            } else {
                this.open();
            }
        },

        bindEvents() {
            // Filter buttons
            document.addEventListener('click', (e) => {
                const filterBtn = e.target.closest('.notif-filter-btn');
                if (filterBtn) {
                    document.querySelectorAll('.notif-filter-btn').forEach(b => b.classList.remove('active'));
                    filterBtn.classList.add('active');
                    this.currentFilter = filterBtn.getAttribute('data-filter') || 'all';
                    this.renderList();
                }

                // Close / Backdrop buttons
                if (e.target.closest('#notif-btn-close, #algolearn-notification-backdrop')) {
                    this.close();
                }

                if (e.target.closest('#notif-btn-mark-all')) {
                    this.markAllRead();
                }

                if (e.target.closest('#notif-btn-clear')) {
                    this.clearAll();
                }

                // Global Notification Trigger
                if (e.target.closest('.btn-open-notifications, #nav-btn-notifications, .nav-notification-trigger')) {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }
    };

    // ==========================================
    // 3. Settings Hub Controller
    // ==========================================
    const AlgoSettings = {
        init() {
            this.injectModalHtml();
            this.bindEvents();
            this.syncPreferencesUI();
        },

        injectModalHtml() {
            if (document.getElementById('algolearn-settings-modal')) return;

            // Backdrop
            const backdrop = document.createElement('div');
            backdrop.id = 'algolearn-settings-backdrop';
            backdrop.className = 'algolearn-modal-backdrop';
            backdrop.style.display = 'none';
            document.body.appendChild(backdrop);

            // Modal
            const modal = document.createElement('div');
            modal.id = 'algolearn-settings-modal';
            modal.className = 'algolearn-settings-modal';
            modal.style.display = 'none';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-label', 'AlgoLearn Settings & Preferences');

            modal.innerHTML = `
                <div class="settings-modal-dialog">
                    <div class="settings-modal-content">
                        <!-- Header -->
                        <div class="settings-modal-header">
                            <div class="d-flex align-items-center gap-2">
                                <div class="settings-header-icon">
                                    <i class="bi bi-gear-wide-connected text-sky-400 fs-4"></i>
                                </div>
                                <div>
                                    <h5 class="mb-0 text-white fw-bold">AlgoLearn Settings & Studio Hub</h5>
                                    <span class="text-muted small">Personalize your theme, account, audio & workspace tools</span>
                                </div>
                            </div>
                            <button type="button" class="drawer-close-btn" id="settings-btn-close" aria-label="Close Settings">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <!-- Body (Scrollable) -->
                        <div class="settings-modal-body">
                            <!-- 1. THEME & APPEARANCE BAR -->
                            <div class="settings-section">
                                <div class="settings-section-title">
                                    <i class="bi bi-palette-fill text-sky-400"></i>
                                    <span>Theme & Workspace Appearance</span>
                                </div>
                                <div class="settings-theme-bar">
                                    <!-- Light Theme Card -->
                                    <div class="settings-theme-card" data-theme-choice="sky">
                                        <div class="theme-card-preview theme-preview-sky">
                                            <div class="preview-swatch-bar">
                                                <span class="swatch-dot bg-primary"></span>
                                                <span class="swatch-dot bg-info"></span>
                                                <span class="swatch-dot bg-light"></span>
                                            </div>
                                        </div>
                                        <div class="theme-card-info">
                                            <div class="theme-card-name"><i class="bi bi-sun-fill text-warning me-1"></i> Light Mode</div>
                                            <div class="theme-card-desc">Crisp white & sky-blue daytime aesthetic</div>
                                        </div>
                                        <div class="theme-card-check"><i class="bi bi-check-circle-fill"></i></div>
                                    </div>

                                    <!-- Midnight Dark Theme Card -->
                                    <div class="settings-theme-card" data-theme-choice="dark">
                                        <div class="theme-card-preview theme-preview-dark">
                                            <div class="preview-swatch-bar">
                                                <span class="swatch-dot" style="background:#0f172a;"></span>
                                                <span class="swatch-dot" style="background:#38bdf8;"></span>
                                                <span class="swatch-dot" style="background:#1e293b;"></span>
                                            </div>
                                        </div>
                                        <div class="theme-card-info">
                                            <div class="theme-card-name"><i class="bi bi-moon-stars-fill text-info me-1"></i> Midnight Dark</div>
                                            <div class="theme-card-desc">Deep slate-blue eye comfort for late night coding</div>
                                        </div>
                                        <div class="theme-card-check"><i class="bi bi-check-circle-fill"></i></div>
                                    </div>

                                    <!-- Cyberpunk Neon Theme Card -->
                                    <div class="settings-theme-card" data-theme-choice="cyberpunk">
                                        <div class="theme-card-preview theme-preview-cyberpunk">
                                            <div class="preview-swatch-bar">
                                                <span class="swatch-dot" style="background:#00f0ff;"></span>
                                                <span class="swatch-dot" style="background:#00ffaa;"></span>
                                                <span class="swatch-dot" style="background:#ff007f;"></span>
                                            </div>
                                        </div>
                                        <div class="theme-card-info">
                                            <div class="theme-card-name"><i class="bi bi-cpu-fill text-success me-1"></i> Cyberpunk Neon</div>
                                            <div class="theme-card-desc">High-contrast sci-fi HUD with radiant neon glow</div>
                                        </div>
                                        <div class="theme-card-check"><i class="bi bi-check-circle-fill"></i></div>
                                    </div>
                                </div>

                                <div class="mt-3 p-3 rounded d-flex align-items-center justify-content-between" style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(56, 189, 248, 0.15);">
                                    <div>
                                        <span class="fw-semibold text-white small d-block">Ambient Backdrop Glow</span>
                                        <span class="text-muted" style="font-size:0.75rem;">Enable subtle cinematic gradient ambient light behind the hero and studio</span>
                                    </div>
                                    <div class="form-check form-switch mb-0">
                                        <input class="form-check-input" type="checkbox" id="settings-chk-ambient" checked>
                                    </div>
                                </div>
                            </div>

                            <!-- 2. LOGIN & LOGOUT SETUP (AUTHENTICATION SESSION) -->
                            <div class="settings-section">
                                <div class="settings-section-title">
                                    <i class="bi bi-person-badge-fill text-sky-400"></i>
                                    <span>Account & Session Authentication</span>
                                </div>
                                <div id="settings-auth-container" class="settings-auth-container">
                                    <!-- Rendered dynamically depending on logged in vs logged out -->
                                </div>
                            </div>

                            <!-- 3. INTERACTIVE AUDIO & PEDAGOGICAL TOOLS -->
                            <div class="settings-section">
                                <div class="settings-section-title">
                                    <i class="bi bi-sliders text-sky-400"></i>
                                    <span>Interaction & Educational Tools</span>
                                </div>
                                <div class="settings-tools-grid">
                                    <!-- Audio Synthesis -->
                                    <div class="settings-tool-row">
                                        <div class="settings-tool-text">
                                            <span class="tool-label"><i class="bi bi-volume-up-fill text-warning me-1"></i> UI Sound Synthesis</span>
                                            <span class="tool-sub">Play soft procedural audio chimes on step changes, swaps & completions</span>
                                        </div>
                                        <div class="form-check form-switch mb-0">
                                            <input class="form-check-input" type="checkbox" id="settings-chk-audio">
                                        </div>
                                    </div>

                                    <!-- Algorithm Hints -->
                                    <div class="settings-tool-row">
                                        <div class="settings-tool-text">
                                            <span class="tool-label"><i class="bi bi-lightbulb-fill text-info me-1"></i> Pedagogical Hints & Guidance</span>
                                            <span class="tool-sub">Display step-by-step explanatory insights during algorithm execution</span>
                                        </div>
                                        <div class="form-check form-switch mb-0">
                                            <input class="form-check-input" type="checkbox" id="settings-chk-hints">
                                        </div>
                                    </div>

                                    <!-- Default Visualization Speed -->
                                    <div class="settings-tool-row">
                                        <div class="settings-tool-text">
                                            <span class="tool-label"><i class="bi bi-speedometer2 text-success me-1"></i> Default Execution Speed</span>
                                            <span class="tool-sub">Target step delay for visualizers & live debugging tracing</span>
                                        </div>
                                        <div class="btn-group btn-group-sm" role="group" id="settings-speed-group">
                                            <button type="button" class="btn btn-outline-secondary" data-speed="150">Turbo (150ms)</button>
                                            <button type="button" class="btn btn-outline-secondary active" data-speed="350">Normal (350ms)</button>
                                            <button type="button" class="btn btn-outline-secondary" data-speed="700">Slow (700ms)</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 4. CODELAB IDE & EDITOR TOOLS -->
                            <div class="settings-section">
                                <div class="settings-section-title">
                                    <i class="bi bi-code-square text-sky-400"></i>
                                    <span>CodeLab Live IDE Preferences</span>
                                </div>
                                <div class="settings-tools-grid">
                                    <!-- Monaco Font Size -->
                                    <div class="settings-tool-row">
                                        <div class="settings-tool-text">
                                            <span class="tool-label"><i class="bi bi-type me-1 text-sky-400"></i> Editor Font Size</span>
                                            <span class="tool-sub">Monaco code typography scaling</span>
                                        </div>
                                        <select id="settings-select-fontsize" class="form-select form-select-sm bg-dark text-white border-secondary" style="width:110px;">
                                            <option value="12">12 px</option>
                                            <option value="13" selected>13 px (Default)</option>
                                            <option value="14">14 px</option>
                                            <option value="16">16 px</option>
                                        </select>
                                    </div>

                                    <!-- Word Wrap Default -->
                                    <div class="settings-tool-row">
                                        <div class="settings-tool-text">
                                            <span class="tool-label"><i class="bi bi-text-wrap me-1 text-sky-400"></i> Default Word Wrap</span>
                                            <span class="tool-sub">Automatically wrap code lines to prevent horizontal scrolling</span>
                                        </div>
                                        <div class="form-check form-switch mb-0">
                                            <input class="form-check-input" type="checkbox" id="settings-chk-wordwrap" checked>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 5. SYSTEM UTILITIES, CACHE & SHORTCUTS -->
                            <div class="settings-section mb-0">
                                <div class="settings-section-title">
                                    <i class="bi bi-tools text-sky-400"></i>
                                    <span>System Utilities & Diagnostics</span>
                                </div>
                                <div class="p-3 rounded mb-3" style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(56, 189, 248, 0.15);">
                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                        <span class="small fw-semibold text-white">Docker Debugger Sandbox</span>
                                        <span class="badge bg-success bg-opacity-75 text-white"><i class="bi bi-check-circle me-1"></i> Running & Isolated</span>
                                    </div>
                                    <p class="small text-muted mb-0" style="font-size:0.75rem;">
                                        Python 3.12, OpenJDK 17, GCC/G++ 13, and Node.js active with strict container memory limits.
                                    </p>
                                </div>

                                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                    <button type="button" class="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1" id="settings-btn-shortcuts">
                                        <i class="bi bi-keyboard"></i> Keyboard Shortcuts
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" id="settings-btn-clearcache">
                                        <i class="bi bi-arrow-counterclockwise"></i> Reset Code & Preferences
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="settings-modal-footer">
                            <span class="text-muted small" style="font-size:0.75rem;">AlgoLearn 2.0 • Studio Engine</span>
                            <button type="button" class="btn btn-sm btn-sky px-4" id="settings-btn-done">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            this.renderAuthCard();
        },

        renderAuthCard() {
            const container = document.getElementById('settings-auth-container');
            if (!container) return;

            const token = localStorage.getItem('algolearn_token');
            let user = null;
            try {
                const uStr = localStorage.getItem('algolearn_user');
                if (uStr) user = JSON.parse(uStr);
            } catch (e) {}

            if (token) {
                // Logged In State
                const userName = (user && user.name) ? user.name : 'Developer';
                const userEmail = (user && user.email) ? user.email : 'developer@algolearn.io';
                const avatar = (user && user.avatar) ? user.avatar : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userName)}`;
                const provider = (user && user.provider) ? user.provider.toUpperCase() : 'VERIFIED';

                container.innerHTML = `
                    <div class="settings-user-card p-3 rounded" style="background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(56, 189, 248, 0.35);">
                        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div class="d-flex align-items-center gap-3">
                                <div class="position-relative">
                                    <img src="${avatar}" alt="Avatar" class="rounded-circle" style="width: 48px; height: 48px; object-fit: cover; border: 2px solid #38bdf8;">
                                    <span class="position-absolute bottom-0 end-0 p-1 bg-success border border-dark rounded-circle" title="Online"></span>
                                </div>
                                <div>
                                    <div class="d-flex align-items-center gap-2">
                                        <h6 class="mb-0 text-white fw-bold">${userName}</h6>
                                        <span class="badge bg-primary bg-opacity-75 small">${provider}</span>
                                    </div>
                                    <span class="text-muted small">${userEmail}</span>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" id="settings-action-logout">
                                    <i class="bi bi-box-arrow-right"></i> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                container.querySelector('#settings-action-logout')?.addEventListener('click', () => {
                    this.logoutUser();
                });
            } else {
                // Guest / Logged Out State
                container.innerHTML = `
                    <div class="settings-guest-card p-3 rounded" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(51, 65, 85, 0.6);">
                        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div class="d-flex align-items-center gap-3">
                                <div class="settings-guest-avatar">
                                    <i class="bi bi-person-circle fs-2 text-muted"></i>
                                </div>
                                <div>
                                    <div class="d-flex align-items-center gap-2">
                                        <h6 class="mb-0 text-white fw-bold">Guest Developer</h6>
                                        <span class="badge bg-secondary small">UNAUTHENTICATED</span>
                                    </div>
                                    <span class="text-muted small">Sign in to save your algorithm practice progress and custom code across sessions.</span>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <a href="login.html" class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 px-3">
                                    <i class="bi bi-box-arrow-in-right"></i> Sign In / Register
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }
        },

        logoutUser() {
            localStorage.removeItem('algolearn_token');
            localStorage.removeItem('algolearn_user');

            // Update UI across page
            this.renderAuthCard();

            // Update any navbars on the page
            document.querySelectorAll('#nav-auth-logged-in, #codelab-auth-profile').forEach(el => el.classList.add('d-none'));
            document.querySelectorAll('#nav-btn-signin').forEach(el => el.classList.remove('d-none'));

            // Show friendly notification
            if (typeof window.showAlert === 'function') {
                window.showAlert('Signed out successfully.', 'info');
            } else {
                const toast = document.createElement('div');
                toast.className = 'position-fixed bottom-0 end-0 p-3';
                toast.style.zIndex = '99999';
                toast.innerHTML = `<div class="toast show align-items-center text-white bg-dark border-info p-2 rounded shadow"><div class="d-flex"><div class="toast-body"><i class="bi bi-info-circle text-info me-2"></i>Signed out successfully.</div></div></div>`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2500);
            }
        },

        syncPreferencesUI() {
            // 1. Theme cards active state
            const currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('algolearn_theme') || 'sky';
            document.querySelectorAll('.settings-theme-card').forEach(card => {
                const choice = card.getAttribute('data-theme-choice');
                if (choice === currentTheme) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });

            // 2. Audio toggle
            const audioChk = document.getElementById('settings-chk-audio');
            if (audioChk) {
                audioChk.checked = localStorage.getItem('algolearn_sound_enabled') === 'true';
            }

            // 3. Hints toggle
            const hintsChk = document.getElementById('settings-chk-hints');
            if (hintsChk) {
                hintsChk.checked = localStorage.getItem('algolearn_hints_enabled') !== 'false';
            }

            // 4. Default speed
            const currentSpeed = localStorage.getItem('algolearn_default_speed') || '350';
            document.querySelectorAll('#settings-speed-group button').forEach(btn => {
                if (btn.getAttribute('data-speed') === currentSpeed) {
                    btn.classList.add('active', 'btn-sky');
                    btn.classList.remove('btn-outline-secondary');
                } else {
                    btn.classList.remove('active', 'btn-sky');
                    btn.classList.add('btn-outline-secondary');
                }
            });

            // 5. Monaco Font Size
            const fontSizeSelect = document.getElementById('settings-select-fontsize');
            if (fontSizeSelect) {
                fontSizeSelect.value = localStorage.getItem('algolearn_monaco_fontsize') || '13';
            }

            // 6. Word Wrap
            const wrapChk = document.getElementById('settings-chk-wordwrap');
            if (wrapChk) {
                wrapChk.checked = localStorage.getItem('algolearn_monaco_wordwrap') !== 'false';
            }
        },

        open() {
            const modal = document.getElementById('algolearn-settings-modal');
            const backdrop = document.getElementById('algolearn-settings-backdrop');
            if (modal && backdrop) {
                this.renderAuthCard();
                this.syncPreferencesUI();
                modal.style.display = 'flex';
                backdrop.style.display = 'block';
                requestAnimationFrame(() => {
                    modal.classList.add('show');
                    backdrop.classList.add('show');
                });
                document.body.style.overflow = 'hidden';
            }
        },

        close() {
            const modal = document.getElementById('algolearn-settings-modal');
            const backdrop = document.getElementById('algolearn-settings-backdrop');
            if (modal && backdrop) {
                modal.classList.remove('show');
                backdrop.classList.remove('show');
                setTimeout(() => {
                    if (!modal.classList.contains('show')) {
                        modal.style.display = 'none';
                        backdrop.style.display = 'none';
                    }
                }, 300);
                document.body.style.overflow = '';
            }
        },

        toggle() {
            const modal = document.getElementById('algolearn-settings-modal');
            if (modal && modal.classList.contains('show')) {
                this.close();
            } else {
                this.open();
            }
        },

        bindEvents() {
            // Theme Card click listener
            document.addEventListener('click', (e) => {
                const card = e.target.closest('.settings-theme-card');
                if (card) {
                    const themeChoice = card.getAttribute('data-theme-choice');
                    if (window.AlgoTheme && typeof window.AlgoTheme.setTheme === 'function') {
                        window.AlgoTheme.setTheme(themeChoice);
                    } else {
                        document.documentElement.setAttribute('data-theme', themeChoice);
                        localStorage.setItem('algolearn_theme', themeChoice);
                    }
                    this.syncPreferencesUI();
                }

                // Close / Backdrop buttons
                if (e.target.closest('#settings-btn-close, #settings-btn-done, #algolearn-settings-backdrop')) {
                    this.close();
                }

                // Global Settings Trigger
                if (e.target.closest('.btn-open-settings, #nav-btn-settings, .nav-settings-trigger')) {
                    e.preventDefault();
                    this.toggle();
                }

                // Speed buttons
                const speedBtn = e.target.closest('#settings-speed-group button');
                if (speedBtn) {
                    const speed = speedBtn.getAttribute('data-speed');
                    localStorage.setItem('algolearn_default_speed', speed);
                    if (window.CodeLabApp) {
                        window.CodeLabApp.stepDelay = parseInt(speed, 10);
                        const slider = document.getElementById('exec-speed-slider');
                        if (slider) slider.value = speed;
                        const label = document.getElementById('speed-ms-label');
                        if (label) label.textContent = `${speed}ms`;
                    }
                    this.syncPreferencesUI();
                }

                // Clear Cache button
                if (e.target.closest('#settings-btn-clearcache')) {
                    if (confirm('Are you sure you want to clear saved custom code snippets and reset preferences to defaults?')) {
                        localStorage.removeItem('algolearn_saved_code');
                        localStorage.removeItem('algolearn_default_speed');
                        localStorage.removeItem('algolearn_monaco_fontsize');
                        localStorage.removeItem('algolearn_monaco_wordwrap');
                        this.syncPreferencesUI();
                        alert('Custom snippets and preferences have been reset.');
                    }
                }

                // Keyboard Shortcuts button
                if (e.target.closest('#settings-btn-shortcuts')) {
                    AlgoSettings.showShortcutsModal();
                }
            });

            // Audio checkbox
            document.getElementById('settings-chk-audio')?.addEventListener('change', (e) => {
                localStorage.setItem('algolearn_sound_enabled', e.target.checked ? 'true' : 'false');
            });

            // Hints checkbox
            document.getElementById('settings-chk-hints')?.addEventListener('change', (e) => {
                localStorage.setItem('algolearn_hints_enabled', e.target.checked ? 'true' : 'false');
            });

            // Ambient glow checkbox
            document.getElementById('settings-chk-ambient')?.addEventListener('change', (e) => {
                document.body.classList.toggle('no-ambient-glow', !e.target.checked);
            });

            // Monaco font size
            document.getElementById('settings-select-fontsize')?.addEventListener('change', (e) => {
                const sz = parseInt(e.target.value, 10);
                localStorage.setItem('algolearn_monaco_fontsize', String(sz));
                if (window.CodeLabApp && window.CodeLabApp.editor) {
                    window.CodeLabApp.editor.updateOptions({ fontSize: sz });
                }
            });

            // Monaco word wrap
            document.getElementById('settings-chk-wordwrap')?.addEventListener('change', (e) => {
                const wrapVal = e.target.checked ? 'on' : 'off';
                localStorage.setItem('algolearn_monaco_wordwrap', e.target.checked ? 'true' : 'false');
                if (window.CodeLabApp && window.CodeLabApp.editor) {
                    window.CodeLabApp.editor.updateOptions({ wordWrap: wrapVal });
                }
            });
        },

        showShortcutsModal() {
            let existing = document.getElementById('algolearn-shortcuts-dialog');
            if (existing) existing.remove();

            const d = document.createElement('div');
            d.id = 'algolearn-shortcuts-dialog';
            d.className = 'algolearn-settings-modal show';
            d.style.zIndex = '100010';
            d.innerHTML = `
                <div class="settings-modal-dialog" style="max-width:520px;">
                    <div class="settings-modal-content">
                        <div class="settings-modal-header">
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi bi-keyboard text-sky-400 fs-4"></i>
                                <h6 class="mb-0 text-white fw-bold">AlgoLearn Keyboard Shortcuts</h6>
                            </div>
                            <button type="button" class="drawer-close-btn" onclick="document.getElementById('algolearn-shortcuts-dialog').remove()"><i class="bi bi-x-lg"></i></button>
                        </div>
                        <div class="settings-modal-body p-3">
                            <table class="table table-dark table-sm mb-0 font-monospace small">
                                <tbody>
                                    <tr><td><kbd>[</kbd></td><td>Toggle Left Functions Drawer</td></tr>
                                    <tr><td><kbd>Ctrl</kbd> + <kbd>K</kbd></td><td>Search Algorithms & Pages</td></tr>
                                    <tr><td><kbd>Shift</kbd> + <kbd>S</kbd></td><td>Open Studio Settings Hub</td></tr>
                                    <tr><td><kbd>Shift</kbd> + <kbd>N</kbd></td><td>Open Notification Center</td></tr>
                                    <tr><td><kbd>F10</kbd></td><td>Step Over in CodeLab Debugger</td></tr>
                                    <tr><td><kbd>F11</kbd></td><td>Step Into in CodeLab Debugger</td></tr>
                                    <tr><td><kbd>F8</kbd></td><td>Continue Execution Trace</td></tr>
                                    <tr><td><kbd>Esc</kbd></td><td>Close any Drawer / Modal</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="settings-modal-footer">
                            <button type="button" class="btn btn-sm btn-sky w-100" onclick="document.getElementById('algolearn-shortcuts-dialog').remove()">Got it</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(d);
        }
    };

    // ==========================================
    // 4. Global Keyboard Shortcuts Listener
    // ==========================================
    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        // Shift + S = Settings
        if (e.shiftKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            AlgoSettings.toggle();
        }
        // Shift + N = Notifications
        else if (e.shiftKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            AlgoNotifications.toggle();
        }
        // Esc = Close
        else if (e.key === 'Escape') {
            AlgoSettings.close();
            AlgoNotifications.close();
        }
    });

    // ==========================================
    // 5. Universal Profile Bar & Menu Controller
    // ==========================================
    const AlgoProfile = {
        user: null,

        init() {
            this.loadUser();
            this.mountProfileBar();
            this.bindGlobalEvents();
        },

        loadUser() {
            try {
                const storedUser = localStorage.getItem('algolearn_user');
                if (storedUser) {
                    this.user = JSON.parse(storedUser);
                }
            } catch (e) {
                this.user = null;
            }

            const token = localStorage.getItem('algolearn_token');
            if (token) {
                fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(r => r.json())
                .then(data => {
                    if (data && data.success && data.user) {
                        this.user = data.user;
                        localStorage.setItem('algolearn_user', JSON.stringify(data.user));
                        this.updateAllProfileBars();
                    } else if (data && data.error) {
                        // Token expired or invalid
                        localStorage.removeItem('algolearn_token');
                        localStorage.removeItem('algolearn_user');
                        this.user = null;
                        this.updateAllProfileBars();
                    }
                })
                .catch(() => {});
            }
        },

        getUserData() {
            const token = localStorage.getItem('algolearn_token');
            const isLoggedIn = !!(token && this.user);
            const username = this.user ? (this.user.username || this.user.fullName || 'User') : 'Developer';
            const fullName = this.user ? (this.user.fullName || this.user.username || 'Developer') : 'Welcome Explorer';
            const email = this.user ? (this.user.email || '@' + username) : 'Sign in to sync your progress';
            const avatarUrl = (this.user && this.user.avatarUrl) 
                ? this.user.avatarUrl 
                : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`;
            return { isLoggedIn, username, fullName, email, avatarUrl };
        },

        mountProfileBar() {
            const targets = document.querySelectorAll('.top-navbar-right, .codelab-navbar .d-flex.align-items-center.gap-2');
            targets.forEach(right => {
                let profileWrap = right.querySelector('.navbar-profile-wrap');
                if (!profileWrap) {
                    profileWrap = document.createElement('div');
                    profileWrap.className = 'navbar-profile-wrap position-relative';
                    profileWrap.id = 'navbar-profile-root';
                    // ALWAYS append to the very end so it sits at the FAR RIGHT UPPER CORNER
                    right.appendChild(profileWrap);
                } else {
                    // Ensure it is the last child in the container at the far right
                    if (right.lastElementChild !== profileWrap) {
                        right.appendChild(profileWrap);
                    }
                }

                // Position notification bell immediately before profileWrap on the far right
                const notifBtn = right.querySelector('.btn-open-notifications, #nav-btn-notifications');
                if (notifBtn && notifBtn.nextElementSibling !== profileWrap) {
                    right.insertBefore(notifBtn, profileWrap);
                }

                this.renderProfileHtml(profileWrap);
            });
        },

        renderProfileHtml(profileWrap) {
            const { isLoggedIn, username, fullName, email, avatarUrl } = this.getUserData();
            const currentTheme = (window.AlgoTheme && window.AlgoTheme.currentTheme) || localStorage.getItem('algolearn_theme') || 'sky';
            const themeLabels = { sky: 'Light Mode', dark: 'Midnight Dark', cyberpunk: 'Cyberpunk Neon' };

            profileWrap.innerHTML = `
                <button type="button" class="navbar-profile-pill d-inline-flex align-items-center gap-2" id="nav-profile-toggle-btn" aria-expanded="false" title="Account, Theme & Studio Hub">
                    <div class="profile-avatar-circle">
                        <img src="${avatarUrl}" alt="${username}" class="profile-avatar-img">
                        <span class="profile-status-dot ${isLoggedIn ? 'online' : 'guest'}"></span>
                    </div>
                    <span class="profile-pill-username text-truncate">${username}</span>
                    <i class="bi bi-chevron-down profile-pill-chevron"></i>
                </button>

                <!-- Profile Dropdown Menu -->
                <div class="navbar-profile-dropdown" style="display: none;">
                    <!-- User Info Card -->
                    <div class="profile-dropdown-header">
                        <div class="d-flex align-items-center gap-3">
                            <div class="profile-avatar-circle large">
                                <img src="${avatarUrl}" alt="${username}" class="profile-avatar-img">
                                <span class="profile-status-dot large ${isLoggedIn ? 'online' : 'guest'}"></span>
                            </div>
                            <div class="profile-header-info text-truncate">
                                <div class="d-flex align-items-center gap-1">
                                    <span class="profile-dropdown-name fw-bold">${fullName}</span>
                                    ${isLoggedIn ? '<i class="bi bi-patch-check-fill text-sky-400" title="Verified Learner"></i>' : ''}
                                </div>
                                <span class="profile-dropdown-email small text-truncate d-block">${email}</span>
                                <div class="mt-1">
                                    <span class="badge ${isLoggedIn ? 'badge-sky' : 'bg-secondary-subtle text-secondary'} rounded-pill" style="font-size: 0.68rem;">
                                        ${isLoggedIn ? '⚡ Pro Learner' : '👤 Guest Explorer'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Theme Switcher Segment -->
                    <div class="profile-dropdown-theme-sec">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <span class="profile-sec-label small fw-semibold">
                                <i class="bi bi-palette-fill me-1 text-sky-400"></i> Theme
                            </span>
                            <span class="badge bg-secondary-subtle text-secondary small profile-current-theme-badge">
                                ${themeLabels[currentTheme] || currentTheme}
                            </span>
                        </div>
                        <div class="profile-theme-pills-row">
                            <button type="button" class="profile-theme-btn ${currentTheme === 'sky' ? 'active' : ''}" data-theme-target="sky" title="Light Sky Theme">
                                <i class="bi bi-sun-fill text-warning"></i>
                                <span>Light</span>
                            </button>
                            <button type="button" class="profile-theme-btn ${currentTheme === 'dark' ? 'active' : ''}" data-theme-target="dark" title="Midnight Dark Theme">
                                <i class="bi bi-moon-stars-fill text-info"></i>
                                <span>Dark</span>
                            </button>
                            <button type="button" class="profile-theme-btn ${currentTheme === 'cyberpunk' ? 'active' : ''}" data-theme-target="cyberpunk" title="Cyberpunk Neon Theme">
                                <i class="bi bi-cpu-fill text-success"></i>
                                <span>Neon</span>
                            </button>
                        </div>
                    </div>

                    <div class="dropdown-divider-subtle"></div>

                    <!-- Quick Tools & Navigation Links -->
                    <div class="profile-dropdown-links">
                        <button type="button" class="profile-dropdown-item btn-profile-open-settings">
                            <div class="profile-item-icon-box"><i class="bi bi-gear-fill text-sky-400"></i></div>
                            <div class="d-flex flex-column text-start">
                                <span class="fw-semibold">Studio Settings</span>
                                <span class="small text-muted-custom">Preferences, Audio & Tools</span>
                            </div>
                            <kbd class="small text-muted ms-auto">Shift+S</kbd>
                        </button>

                        <button type="button" class="profile-dropdown-item btn-profile-open-notifs">
                            <div class="profile-item-icon-box"><i class="bi bi-bell-fill text-warning"></i></div>
                            <div class="d-flex flex-column text-start">
                                <span class="fw-semibold">Notification Center</span>
                                <span class="small text-muted-custom">Alerts & Daily Challenges</span>
                            </div>
                            <span class="badge bg-danger rounded-pill ms-auto notification-badge-count d-none">0</span>
                        </button>

                        <a href="codelab.html" class="profile-dropdown-item">
                            <div class="profile-item-icon-box"><i class="bi bi-code-slash text-success"></i></div>
                            <div class="d-flex flex-column text-start">
                                <span class="fw-semibold">CodeLab Studio</span>
                                <span class="small text-muted-custom">Live IDE & Debugger</span>
                            </div>
                            <span class="badge bg-primary-subtle text-primary rounded-pill ms-auto" style="font-size:0.68rem;">Live</span>
                        </a>

                        <a href="visualize.html" class="profile-dropdown-item">
                            <div class="profile-item-icon-box"><i class="bi bi-play-circle-fill text-info"></i></div>
                            <div class="d-flex flex-column text-start">
                                <span class="fw-semibold">All Visualizers</span>
                                <span class="small text-muted-custom">12+ Sorting, Graphs & Trees</span>
                            </div>
                        </a>
                    </div>

                    <div class="dropdown-divider-subtle"></div>

                    <!-- Session Action Button -->
                    <div class="profile-dropdown-footer">
                        ${isLoggedIn ? `
                            <button type="button" class="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 btn-profile-logout">
                                <i class="bi bi-box-arrow-right"></i>
                                <span>Sign Out (${username})</span>
                            </button>
                        ` : `
                            <a href="login.html" class="btn btn-sky btn-sm w-100 d-flex align-items-center justify-content-center gap-2">
                                <i class="bi bi-box-arrow-in-right"></i>
                                <span>Sign In / Create Account</span>
                            </a>
                        `}
                    </div>
                </div>
            `;

            this.bindDropdownEvents(profileWrap);
        },

        bindDropdownEvents(profileWrap) {
            const toggleBtn = profileWrap.querySelector('#nav-profile-toggle-btn');
            const dropdown = profileWrap.querySelector('.navbar-profile-dropdown');
            if (!toggleBtn || !dropdown) return;

            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const willOpen = dropdown.style.display === 'none';
                this.closeAllDropdowns();
                if (willOpen) {
                    dropdown.style.display = 'block';
                    toggleBtn.classList.add('active');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    AlgoNotifications.updateBadge();
                }
            });

            // Theme buttons inside dropdown
            dropdown.querySelectorAll('.profile-theme-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const targetTheme = btn.getAttribute('data-theme-target');
                    if (window.AlgoTheme && targetTheme) {
                        window.AlgoTheme.setTheme(targetTheme);
                    }
                });
            });

            // Settings button
            const settingsBtn = dropdown.querySelector('.btn-profile-open-settings');
            if (settingsBtn) {
                settingsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.closeAllDropdowns();
                    AlgoSettings.open();
                });
            }

            // Notifications button
            const notifBtn = dropdown.querySelector('.btn-profile-open-notifs');
            if (notifBtn) {
                notifBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.closeAllDropdowns();
                    AlgoNotifications.open();
                });
            }

            // Logout button
            const logoutBtn = dropdown.querySelector('.btn-profile-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const token = localStorage.getItem('algolearn_token');
                    fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ token })
                    }).finally(() => {
                        localStorage.removeItem('algolearn_token');
                        localStorage.removeItem('algolearn_user');
                        window.location.reload();
                    });
                });
            }
        },

        closeAllDropdowns() {
            document.querySelectorAll('.navbar-profile-dropdown').forEach(d => {
                d.style.display = 'none';
            });
            document.querySelectorAll('#nav-profile-toggle-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-expanded', 'false');
            });
        },

        bindGlobalEvents() {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.navbar-profile-wrap')) {
                    this.closeAllDropdowns();
                }
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAllDropdowns();
                }
            });
        },

        updateAllProfileBars() {
            document.querySelectorAll('.navbar-profile-wrap').forEach(wrap => {
                this.renderProfileHtml(wrap);
            });
            AlgoNotifications.updateBadge();
        }
    };

    // ==========================================
    // 6. Auto-Mount into Navbars & Expose API
    // ==========================================
    function autoMountNavbarButtons() {
        // Find navbar target containers
        const targets = document.querySelectorAll('.top-navbar-right, .codelab-navbar .d-flex.align-items-center.gap-2');
        targets.forEach(right => {
            // Standalone Theme and Settings buttons are removed as requested.
            // Ensure only Notification Bell and the Profile Bar exist.

            // Clean up legacy standalone settings or theme buttons if dynamically mounted
            const legacyTheme = right.querySelector('.theme-toggle-btn');
            if (legacyTheme && !legacyTheme.closest('.navbar-profile-dropdown') && !legacyTheme.closest('.algolearn-settings-modal')) {
                legacyTheme.remove();
            }
            const legacySettings = right.querySelector('#nav-btn-settings');
            if (legacySettings && !legacySettings.closest('.navbar-profile-dropdown')) {
                legacySettings.remove();
            }

            // Notification button: round circular trigger matching UI
            let notifBtn = right.querySelector('.btn-open-notifications, #nav-btn-notifications');
            if (!notifBtn) {
                notifBtn = document.createElement('button');
                notifBtn.type = 'button';
                notifBtn.className = 'btn btn-sm btn-outline-secondary position-relative btn-open-notifications nav-circle-btn';
                notifBtn.id = 'nav-btn-notifications';
                notifBtn.title = 'Notifications & System Alerts (Shift+N)';
                notifBtn.innerHTML = `
                    <i class="bi bi-bell-fill text-sky-400"></i>
                    <span class="notification-badge-dot d-none"></span>
                `;
            }

            // Insert notification bell before profileWrap if profileWrap exists
            const profileWrap = right.querySelector('.navbar-profile-wrap');
            if (profileWrap) {
                right.insertBefore(notifBtn, profileWrap);
            } else {
                right.appendChild(notifBtn);
            }
        });

        // Initialize / mount Profile Bar
        AlgoProfile.init();

        // Also add quick links to the slide drawer if present
        const drawerBody = document.querySelector('.drawer-body');
        if (drawerBody && !drawerBody.querySelector('.drawer-settings-item')) {
            const quickSec = drawerBody.querySelector('.drawer-section[data-section="navigation"] .drawer-list');
            if (quickSec) {
                const settingsLink = document.createElement('a');
                settingsLink.href = '#';
                settingsLink.className = 'drawer-list-item drawer-settings-item';
                settingsLink.innerHTML = `
                    <div class="drawer-item-title">
                        <i class="bi bi-gear-fill text-sky-500"></i>
                        <span>Studio Settings & Theme</span>
                    </div>
                    <span class="badge bg-secondary small">Hub</span>
                `;
                settingsLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.AlgoLearnDrawer) window.AlgoLearnDrawer.close();
                    AlgoSettings.open();
                });

                const notifLink = document.createElement('a');
                notifLink.href = '#';
                notifLink.className = 'drawer-list-item drawer-notif-item';
                notifLink.innerHTML = `
                    <div class="drawer-item-title">
                        <i class="bi bi-bell-fill text-warning"></i>
                        <span>Notification Center</span>
                    </div>
                    <span class="badge bg-primary small notification-badge-count d-none">0</span>
                `;
                notifLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.AlgoLearnDrawer) window.AlgoLearnDrawer.close();
                    AlgoNotifications.open();
                });

                quickSec.appendChild(settingsLink);
                quickSec.appendChild(notifLink);
            }
        }

        AlgoNotifications.updateBadge();
    }

    // Live theme observer to keep settings cards synchronized
    try {
        const themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((m) => {
                if (m.attributeName === 'data-theme') {
                    AlgoSettings.syncPreferencesUI();
                    AlgoProfile.updateAllProfileBars();
                }
            });
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    } catch (e) {}

    // Auto-init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AlgoNotifications.init();
            AlgoSettings.init();
            autoMountNavbarButtons();
        });
    } else {
        AlgoNotifications.init();
        AlgoSettings.init();
        autoMountNavbarButtons();
    }

    // Expose globally
    window.AlgoSettings = AlgoSettings;
    window.AlgoNotifications = AlgoNotifications;
    window.AlgoProfile = AlgoProfile;

})();
