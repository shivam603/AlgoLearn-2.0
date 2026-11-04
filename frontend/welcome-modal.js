/**
 * AlgoLearn — Welcome & Onboarding Modal Engine
 * Modeled after the Google AI Studio Onboarding Experience.
 */

(function () {
    const WELCOME_KEY = 'algolearn_welcomed';

    function initWelcomeModal() {
        // If already rendered, do nothing
        if (document.getElementById('algolearn-welcome-backdrop')) return;

        // Create Modal Backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'algolearn-welcome-backdrop';
        backdrop.className = 'welcome-modal-backdrop';
        backdrop.setAttribute('role', 'dialog');
        backdrop.setAttribute('aria-modal', 'true');
        backdrop.setAttribute('aria-label', 'Welcome to AlgoLearn Studio');

        backdrop.innerHTML = `
            <div class="welcome-modal-card">
                <button type="button" class="welcome-modal-close-btn" id="modal-close-btn" aria-label="Close Welcome Screen">
                    <i class="bi bi-x-lg"></i>
                </button>

                <div class="welcome-container" style="max-width:100%; gap: 3.5rem;">
                    <!-- LEFT COLUMN -->
                    <div class="welcome-content-col">
                        <h1 class="welcome-title">Welcome to AlgoLearn Studio</h1>
                        <p class="welcome-subtitle">The modern way to code, debug & master algorithms visually.</p>

                        <p class="welcome-description">
                            AlgoLearn 2.0 combines full interactive visualizers with <strong>CodeLab Studio</strong>—a live Monaco IDE with real-time memory synchronization and step-by-step execution tracing. Code runs safely in a browser-isolated sandbox.
                        </p>

                        <form id="modal-welcome-form" onsubmit="return false;">
                            <div class="welcome-checkbox-group">
                                <!-- Checkbox 1 (Required) -->
                                <label class="custom-checkbox-row" id="modal-row-acknowledge" for="modal-chk-acknowledge">
                                    <input type="checkbox" id="modal-chk-acknowledge" checked required />
                                    <span class="custom-checkbox-box">
                                        <i class="bi bi-check-lg"></i>
                                    </span>
                                    <span class="checkbox-label-text">
                                        <span class="checkbox-required-star">*</span> I acknowledge that I am using AlgoLearn for educational, competitive programming, and technical interview preparation.
                                    </span>
                                </label>

                                <!-- Checkbox 2 (Audio Synth) -->
                                <label class="custom-checkbox-row" for="modal-chk-audio">
                                    <input type="checkbox" id="modal-chk-audio" checked />
                                    <span class="custom-checkbox-box">
                                        <i class="bi bi-check-lg"></i>
                                    </span>
                                    <span class="checkbox-label-text">
                                        Enable real-time Web Audio Synthesizer (auditory pitch feedback during array comparisons, swaps, and graph traversals).
                                    </span>
                                </label>

                                <!-- Checkbox 3 (Hints) -->
                                <label class="custom-checkbox-row" for="modal-chk-hints">
                                    <input type="checkbox" id="modal-chk-hints" checked />
                                    <span class="custom-checkbox-box">
                                        <i class="bi bi-check-lg"></i>
                                    </span>
                                    <span class="checkbox-label-text">
                                        Enable interactive debugging tooltips, keyboard shortcuts (F10 Step Over, F8 Continue), and memory change highlights.
                                    </span>
                                </label>
                            </div>

                            <p class="welcome-terms-note">
                                By clicking "Continue" you enter the AlgoLearn 2.0 Studio experience. You can toggle between <strong>Light</strong>, <strong>Midnight Dark</strong>, and <strong>Cyberpunk Neon</strong> themes anytime from the navigation bar.
                            </p>

                            <div class="welcome-btn-row">
                                <button type="button" class="btn-welcome-continue" id="modal-btn-continue">
                                    <span>Continue</span>
                                    <i class="bi bi-arrow-right"></i>
                                </button>
                                <a href="codelab.html" class="welcome-secondary-btn" id="modal-btn-open-codelab">
                                    <span>Direct to CodeLab</span>
                                </a>
                            </div>
                        </form>
                    </div>

                    <!-- RIGHT COLUMN: Radiant Chromatic Neon Logo -->
                    <div class="welcome-graphic-col">
                        <div class="welcome-glow-emblem-wrap">
                            <div class="ambient-glow-layer glow-blue"></div>
                            <div class="ambient-glow-layer glow-red"></div>
                            <div class="ambient-glow-layer glow-amber-green"></div>

                            <svg class="welcome-svg-emblem" viewBox="0 0 520 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="modal-glyph-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stop-color="#24262d" />
                                        <stop offset="50%" stop-color="#191a20" />
                                        <stop offset="100%" stop-color="#111216" />
                                    </linearGradient>

                                    <linearGradient id="modal-edge-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
                                        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.4" />
                                    </linearGradient>

                                    <linearGradient id="modal-edge-red" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stop-color="#ff4d6d" stop-opacity="0.9" />
                                        <stop offset="100%" stop-color="#c9184a" stop-opacity="0.4" />
                                    </linearGradient>

                                    <linearGradient id="modal-edge-amber-green" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9" />
                                        <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.8" />
                                        <stop offset="100%" stop-color="#10b981" stop-opacity="0.9" />
                                    </linearGradient>

                                    <filter id="modal-neon-glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur1" />
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
                                        <feMerge>
                                            <feMergeNode in="blur1" />
                                            <feMergeNode in="blur2" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>

                                    <filter id="modal-neon-glow-red" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur1" />
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
                                        <feMerge>
                                            <feMergeNode in="blur1" />
                                            <feMergeNode in="blur2" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>

                                    <filter id="modal-neon-glow-amber-green" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur1" />
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur2" />
                                        <feMerge>
                                            <feMergeNode in="blur1" />
                                            <feMergeNode in="blur2" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                <!-- Left Glyph: 'A' -->
                                <g class="glyph-group glyph-a">
                                    <path d="M 85,25 C 102,12 128,12 145,25 L 188,125 C 206,148 196,185 168,185 C 142,185 125,178 115,178 C 105,178 88,185 62,185 C 34,185 24,148 42,125 Z"
                                          fill="none" stroke="#0099ff" stroke-width="12" filter="url(#modal-neon-glow-blue)" opacity="0.85" />
                                    <path d="M 85,25 C 102,12 128,12 145,25 L 188,125 C 206,148 196,185 168,185 C 142,185 125,178 115,178 C 105,178 88,185 62,185 C 34,185 24,148 42,125 Z"
                                          fill="url(#modal-glyph-body-grad)" stroke="url(#modal-edge-blue)" stroke-width="2.5" />
                                </g>

                                <!-- Middle Glyph: 'I' / 'L' -->
                                <g class="glyph-group glyph-i">
                                    <rect x="232" y="22" width="76" height="162" rx="38"
                                          fill="none" stroke="#ff2a55" stroke-width="12" filter="url(#modal-neon-glow-red)" opacity="0.85" />
                                    <rect x="232" y="22" width="76" height="162" rx="38"
                                          fill="url(#modal-glyph-body-grad)" stroke="url(#modal-edge-red)" stroke-width="2.5" />
                                </g>

                                <!-- Right Glyph: 'S' -->
                                <g class="glyph-group glyph-s">
                                    <path d="M 345,58 C 345,36 364,22 386,22 L 460,22 C 484,22 502,38 502,60 C 502,82 484,98 460,98 L 405,98 C 385,98 375,108 375,122 L 375,122 C 375,122 345,58 345,58 Z"
                                          fill="none" stroke="#fbbf24" stroke-width="10" filter="url(#modal-neon-glow-amber-green)" opacity="0.85" />
                                    <path d="M 372,122 C 372,122 342,142 342,160 C 342,182 360,198 384,198 L 458,198 C 480,198 498,184 498,162 C 498,140 480,124 458,124 L 405,124 C 385,124 372,122 372,122 Z"
                                          fill="none" stroke="#10b981" stroke-width="10" filter="url(#modal-neon-glow-amber-green)" opacity="0.85" />

                                    <path d="M 345,58 C 345,36 364,22 386,22 L 460,22 C 484,22 502,38 502,60 C 502,82 484,98 460,98 L 402,98 C 372,98 345,80 345,58 Z"
                                          fill="url(#modal-glyph-body-grad)" stroke="url(#modal-edge-amber-green)" stroke-width="2.5" />
                                    <path d="M 498,162 C 498,184 479,198 457,198 L 383,198 C 359,198 341,182 341,160 C 341,138 359,122 383,122 L 441,122 C 471,122 498,140 498,162 Z"
                                          fill="url(#modal-glyph-body-grad)" stroke="url(#modal-edge-amber-green)" stroke-width="2.5" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);

        // Event Listeners inside modal
        const closeBtn = backdrop.querySelector('#modal-close-btn');
        const continueBtn = backdrop.querySelector('#modal-btn-continue');
        const chkAcknowledge = backdrop.querySelector('#modal-chk-acknowledge');
        const chkAudio = backdrop.querySelector('#modal-chk-audio');
        const chkHints = backdrop.querySelector('#modal-chk-hints');
        const rowAcknowledge = backdrop.querySelector('#modal-row-acknowledge');
        const directCodeLabBtn = backdrop.querySelector('#modal-btn-open-codelab');

        function dismissModal() {
            backdrop.classList.remove('active');
            localStorage.setItem(WELCOME_KEY, 'true');
        }

        closeBtn.addEventListener('click', dismissModal);

        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) dismissModal();
        });

        continueBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!chkAcknowledge.checked) {
                rowAcknowledge.classList.add('shake-it');
                chkAcknowledge.focus();
                setTimeout(() => rowAcknowledge.classList.remove('shake-it'), 500);
                return;
            }

            localStorage.setItem(WELCOME_KEY, 'true');
            localStorage.setItem('algolearn_sound_enabled', chkAudio.checked ? 'true' : 'false');
            localStorage.setItem('algolearn_hints_enabled', chkHints.checked ? 'true' : 'false');
            dismissModal();
        });

        directCodeLabBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem(WELCOME_KEY, 'true');
            localStorage.setItem('algolearn_sound_enabled', chkAudio.checked ? 'true' : 'false');
            localStorage.setItem('algolearn_hints_enabled', chkHints.checked ? 'true' : 'false');
            window.location.href = 'codelab.html';
        });
    }

    // Public method to show the modal anytime
    window.openAlgoWelcomeModal = function () {
        initWelcomeModal();
        const backdrop = document.getElementById('algolearn-welcome-backdrop');
        if (backdrop) {
            backdrop.classList.add('active');
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        initWelcomeModal();

        // Check if first-time visitor on homepage or user requested via URL param ?welcome=1
        const urlParams = new URLSearchParams(window.location.search);
        const forceWelcome = urlParams.get('welcome') === '1' || urlParams.get('onboarding') === '1';
        const hasBeenWelcomed = localStorage.getItem(WELCOME_KEY);

        if (forceWelcome || (!hasBeenWelcomed && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === ''))) {
            setTimeout(() => {
                window.openAlgoWelcomeModal();
            }, 600);
        }

        // Attach to any button with data-trigger="welcome-modal" or .welcome-trigger-btn
        document.querySelectorAll('.welcome-trigger-btn, [data-trigger="welcome-modal"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.openAlgoWelcomeModal();
            });
        });
    });
})();
