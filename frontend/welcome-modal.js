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
                        <div class="welcome-brand-badge">
                            <img src="algolearn-icon.png" alt="AlgoLearn Emblem" class="welcome-brand-badge-icon" />
                            <span class="welcome-brand-badge-text">AlgoLearn Studio</span>
                        </div>
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

                    <!-- RIGHT COLUMN: Official AlgoLearn Dark Theme Logo -->
                    <div class="welcome-graphic-col">
                        <div class="welcome-glow-emblem-wrap">
                            <div class="ambient-glow-layer glow-blue"></div>
                            <div class="ambient-glow-layer glow-teal"></div>

                            <div class="welcome-logo-card">
                                <img src="algolearn-logo-dark.jpg" alt="AlgoLearn Official Logo - Black Theme" class="welcome-logo-img" />
                            </div>
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
