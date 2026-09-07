/**
 * AlgoLearn Theme Engine
 * Supports 'sky' (Light), 'dark' (Midnight Dark), and 'cyberpunk' (Neon Matrix).
 */

const AlgoTheme = {
    themes: ['sky', 'dark', 'cyberpunk'],
    currentTheme: localStorage.getItem('algolearn_theme') || 'sky',

    init() {
        this.applyTheme(this.currentTheme, false);
        this.renderNavbarThemeToggle();
    },

    setTheme(themeName) {
        if (!this.themes.includes(themeName)) return;
        this.currentTheme = themeName;
        localStorage.setItem('algolearn_theme', themeName);
        this.applyTheme(themeName, true);
    },

    cycleTheme() {
        const nextIdx = (this.themes.indexOf(this.currentTheme) + 1) % this.themes.length;
        this.setTheme(this.themes[nextIdx]);
    },

    applyTheme(themeName, animate = false) {
        if (animate) {
            document.documentElement.classList.add('theme-transition');
            setTimeout(() => {
                document.documentElement.classList.remove('theme-transition');
            }, 300);
        }

        document.documentElement.setAttribute('data-theme', themeName);
        this.updateToggleButtons();
    },

    updateToggleButtons() {
        const icons = {
            sky: 'bi-sun-fill text-warning',
            dark: 'bi-moon-stars-fill text-info',
            cyberpunk: 'bi-cpu-fill text-success'
        };
        const labels = {
            sky: 'Light Mode',
            dark: 'Midnight Dark',
            cyberpunk: 'Cyberpunk Neon'
        };

        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            const iconEl = btn.querySelector('i');
            const labelEl = btn.querySelector('.theme-label');
            if (iconEl) iconEl.className = `bi ${icons[this.currentTheme] || 'bi-sun-fill'}`;
            if (labelEl) labelEl.textContent = labels[this.currentTheme] || 'Theme';
            btn.title = `Current Theme: ${labels[this.currentTheme]} (Click to switch)`;
        });
    },

    renderNavbarThemeToggle() {
        const navRights = document.querySelectorAll('.top-navbar-right');
        navRights.forEach(right => {
            if (right.querySelector('.theme-toggle-btn')) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-sm btn-outline-secondary theme-toggle-btn d-flex align-items-center gap-1';
            btn.style.cssText = 'border-radius:20px; padding: 4px 10px; font-size: 0.8rem; border-color: rgba(14,165,233,0.3);';
            btn.innerHTML = `<i class="bi bi-sun-fill text-warning"></i> <span class="theme-label d-none d-md-inline">Light Mode</span>`;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.cycleTheme();
            });
            // Insert before the all functions button
            right.insertBefore(btn, right.lastElementChild);
        });
        this.updateToggleButtons();
    }
};

// Initialize immediately so theme doesn't flicker
AlgoTheme.init();

document.addEventListener('DOMContentLoaded', () => {
    AlgoTheme.renderNavbarThemeToggle();
});

if (typeof window !== 'undefined') {
    window.AlgoTheme = AlgoTheme;
}
