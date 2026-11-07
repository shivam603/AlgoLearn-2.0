/**
 * AlgoLearn Theme Engine
 * Supports 'sky' (Light), 'dark' (Midnight Dark), and 'cyberpunk' (Cyberpunk Neon).
 */

const AlgoTheme = {
    themes: ['sky', 'dark', 'cyberpunk'],
    currentTheme: localStorage.getItem('algolearn_theme') || 'sky',

    init() {
        this.applyTheme(this.currentTheme, false);
        this.renderNavbarThemeToggle();
        this.bindToggleEvents();
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

        // Synchronize Monaco Editor theme if Monaco is active
        if (typeof window !== 'undefined' && window.monaco && window.monaco.editor) {
            try {
                if (themeName === 'cyberpunk') {
                    if (!window._monacoCyberpunkDefined) {
                        window.monaco.editor.defineTheme('cyberpunk-neon', {
                            base: 'vs-dark',
                            inherit: true,
                            rules: [
                                { token: 'comment', foreground: '67e8f9', fontStyle: 'italic' },
                                { token: 'keyword', foreground: '00f0ff', fontStyle: 'bold' },
                                { token: 'string', foreground: '00ff9f' },
                                { token: 'number', foreground: 'ff007f' },
                                { token: 'type', foreground: 'ffe600' },
                                { token: 'identifier', foreground: 'f0fdfa' },
                                { token: 'delimiter', foreground: '00f0ff' }
                            ],
                            colors: {
                                'editor.background': '#040814',
                                'editor.foreground': '#f0fdfa',
                                'editorLineNumber.foreground': '#00e1ff44',
                                'editorLineNumber.activeForeground': '#00f0ff',
                                'editor.lineHighlightBackground': '#00f0ff0d',
                                'editorCursor.foreground': '#00f0ff',
                                'editor.selectionBackground': '#ff007f35',
                                'editorGutter.background': '#030712'
                            }
                        });
                        window._monacoCyberpunkDefined = true;
                    }
                    window.monaco.editor.setTheme('cyberpunk-neon');
                } else {
                    window.monaco.editor.setTheme('vs-dark');
                }
            } catch (err) {
                console.warn('Monaco theme switch failed:', err);
            }
        }
    },

    bindToggleEvents() {
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            if (btn._hasThemeListener) return;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.cycleTheme();
            });
            btn._hasThemeListener = true;
        });
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

            // Special Cyberpunk Neon glow styling on button itself
            if (this.currentTheme === 'cyberpunk') {
                btn.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.4)';
                btn.style.borderColor = '#00f0ff';
            } else {
                btn.style.boxShadow = '';
                btn.style.borderColor = '';
            }
        });

        // Update Profile dropdown theme pills if active
        document.querySelectorAll('.profile-theme-btn').forEach(btn => {
            const target = btn.getAttribute('data-theme-target');
            if (target === this.currentTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        const profileThemeLabel = document.getElementById('profile-current-theme-label');
        if (profileThemeLabel) {
            profileThemeLabel.textContent = labels[this.currentTheme] || this.currentTheme;
        }
    },

    renderNavbarThemeToggle() {
        // Standalone navbar theme toggle disabled in favor of unified Profile Bar & Settings Hub.
        // We still bind any explicitly placed theme-toggle-btn elements and update states.
        this.bindToggleEvents();
        this.updateToggleButtons();
    }
};

// Initialize immediately so theme doesn't flicker
AlgoTheme.init();

document.addEventListener('DOMContentLoaded', () => {
    AlgoTheme.renderNavbarThemeToggle();
    AlgoTheme.bindToggleEvents();
});

if (typeof window !== 'undefined') {
    window.AlgoTheme = AlgoTheme;
}
