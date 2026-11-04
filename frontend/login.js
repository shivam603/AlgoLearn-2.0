/**
 * AlgoLearn — Authenticated Gateway Client Logic
 * Handles real authentication, OAuth simulation, form switching & validation
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authAlert = document.getElementById('auth-alert');
    const authAlertMsg = document.getElementById('auth-alert-msg');
    const groupFullName = document.getElementById('group-fullname');
    const groupRemember = document.getElementById('group-remember');
    const socialGroup = document.getElementById('social-group');
    const dividerWrap = document.getElementById('divider-wrap');
    const demoHintBox = document.getElementById('demo-hint-box');
    const btnSubmit = document.getElementById('btn-submit');
    const btnSubmitText = document.getElementById('btn-submit-text');
    const btnSubmitIcon = document.getElementById('btn-submit-icon');
    const btnSpinner = document.getElementById('btn-spinner');
    const btnSwitchMode = document.getElementById('btn-switch-mode');
    const switchModeText = document.getElementById('switch-mode-text');
    const btnTogglePassword = document.getElementById('btn-toggle-password');
    const iconTogglePassword = document.getElementById('icon-toggle-password');
    const inputIdentity = document.getElementById('input-identity');
    const inputPassword = document.getElementById('input-password');
    const inputFullName = document.getElementById('input-fullname');
    const chkRemember = document.getElementById('chk-remember');
    const btnFillDev = document.getElementById('btn-fill-dev');
    const btnOauthGithub = document.getElementById('btn-oauth-github');
    const btnOauthGoogle = document.getElementById('btn-oauth-google');
    const btnForgotPassword = document.getElementById('btn-forgot-password');
    const forgotModalEl = document.getElementById('forgotModal');
    const btnSendReset = document.getElementById('btn-send-reset');
    const modalResetEmail = document.getElementById('modal-reset-email');
    const forgotModalAlert = document.getElementById('forgot-modal-alert');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const loginCard = document.getElementById('login-card');

    let isRegisterMode = false;

    // Check for redirect parameter
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect') || 'codelab.html';

    // -------------------------------------------------------------
    // 1. Theme Initialization & Sync
    // -------------------------------------------------------------
    function initTheme() {
        const savedTheme = localStorage.getItem('algolearn-theme') || 'light';
        applyTheme(savedTheme);
    }

    function applyTheme(theme) {
        document.body.classList.remove('theme-dark', 'theme-neon');
        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
            themeToggleIcon.className = 'bi bi-moon-stars-fill';
        } else if (theme === 'neon') {
            document.body.classList.add('theme-neon');
            themeToggleIcon.className = 'bi bi-lightning-charge-fill';
        } else {
            themeToggleIcon.className = 'bi bi-sun-fill';
        }
        localStorage.setItem('algolearn-theme', theme);
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('algolearn-theme') || 'light';
        const nextTheme = currentTheme === 'light' ? 'dark' : (currentTheme === 'dark' ? 'neon' : 'light');
        applyTheme(nextTheme);
    });

    initTheme();

    // -------------------------------------------------------------
    // 2. Already Logged In Session Check
    // -------------------------------------------------------------
    const existingToken = localStorage.getItem('algolearn_token');
    if (existingToken) {
        fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${existingToken}` }
        })
        .then(r => r.json())
        .then(data => {
            if (data && data.success && data.user) {
                showAlert(`Welcome back, ${data.user.fullName}! Redirecting to your workspace...`, 'success');
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 800);
            }
        })
        .catch(() => {
            // Token invalid or expired, continue showing login form
            localStorage.removeItem('algolearn_token');
            localStorage.removeItem('algolearn_user');
        });
    }

    // -------------------------------------------------------------
    // 3. Password Visibility Toggle
    // -------------------------------------------------------------
    btnTogglePassword.addEventListener('click', () => {
        const isPassword = inputPassword.getAttribute('type') === 'password';
        inputPassword.setAttribute('type', isPassword ? 'text' : 'password');
        iconTogglePassword.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
    });

    // -------------------------------------------------------------
    // 4. Quick Demo Fill (dev@university.edu / algo123)
    // -------------------------------------------------------------
    if (btnFillDev) {
        btnFillDev.addEventListener('click', () => {
            if (isRegisterMode) toggleMode(false);
            inputIdentity.value = 'dev@university.edu';
            inputPassword.value = 'algo123';
            showAlert('Filled pre-seeded developer student credentials. Click "Sign In" below to continue!', 'success');
            inputPassword.focus();
        });
    }

    // -------------------------------------------------------------
    // 5. Mode Switch (Sign In <-> Sign Up)
    // -------------------------------------------------------------
    function toggleMode(register) {
        isRegisterMode = register;
        hideAlert();

        if (isRegisterMode) {
            authTitle.textContent = 'Create Your Workspace';
            authSubtitle.textContent = 'Join the AlgoLearn developer platform & master algorithms visually with CodeLab.';
            groupFullName.classList.remove('d-none');
            groupRemember.classList.add('d-none');
            socialGroup.classList.add('d-none');
            dividerWrap.classList.add('d-none');
            demoHintBox.classList.add('d-none');
            btnSubmitText.textContent = 'Create Account & Enter CodeLab';
            switchModeText.textContent = 'Already have a workspace?';
            btnSwitchMode.textContent = 'Sign in instead';
            inputFullName.focus();
        } else {
            authTitle.textContent = 'Sign In to Your Workspace';
            authSubtitle.textContent = 'Continue your Data Structures & Algorithms journey, interactive visualizers, and CodeLab studio.';
            groupFullName.classList.add('d-none');
            groupRemember.classList.remove('d-none');
            socialGroup.classList.remove('d-none');
            dividerWrap.classList.remove('d-none');
            demoHintBox.classList.remove('d-none');
            btnSubmitText.textContent = 'Sign In to CodeLab';
            switchModeText.textContent = 'New to algorithmic mastery?';
            btnSwitchMode.textContent = 'Sign up for free';
            inputIdentity.focus();
        }
    }

    btnSwitchMode.addEventListener('click', () => {
        toggleMode(!isRegisterMode);
    });

    // -------------------------------------------------------------
    // 6. Form Submission (Login / Register)
    // -------------------------------------------------------------
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const identity = inputIdentity.value.trim();
        const password = inputPassword.value;
        const fullName = inputFullName.value.trim();
        const rememberMe = chkRemember.checked;

        if (!identity || !password) {
            showAlert('Please provide both your Email/ID and Password.', 'error');
            return;
        }

        if (isRegisterMode && !fullName) {
            showAlert('Please enter your Full Name to register.', 'error');
            return;
        }

        setLoading(true);

        const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
        const payload = isRegisterMode
            ? { fullName, email: identity, password }
            : { identity, password, rememberMe };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Authentication failed. Please check your credentials.');
            }

            // Save session credentials
            localStorage.setItem('algolearn_token', data.token);
            localStorage.setItem('algolearn_user', JSON.stringify(data.user));

            showAlert(data.message || 'Authenticated successfully! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 600);

        } catch (err) {
            showAlert(err.message, 'error');
            shakeCard();
        } finally {
            setLoading(false);
        }
    });

    // -------------------------------------------------------------
    // 7. Social OAuth Authentication (GitHub & Google)
    // -------------------------------------------------------------
    async function handleOAuth(provider) {
        hideAlert();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/oauth-mock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'OAuth authentication failed');
            }

            localStorage.setItem('algolearn_token', data.token);
            localStorage.setItem('algolearn_user', JSON.stringify(data.user));

            showAlert(data.message || 'Signed in via OAuth! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 550);

        } catch (err) {
            showAlert(err.message, 'error');
            shakeCard();
        } finally {
            setLoading(false);
        }
    }

    btnOauthGithub.addEventListener('click', () => handleOAuth('github'));
    btnOauthGoogle.addEventListener('click', () => handleOAuth('google'));

    // -------------------------------------------------------------
    // 8. Forgot Password Dialog
    // -------------------------------------------------------------
    const forgotModal = new bootstrap.Modal(forgotModalEl);

    btnForgotPassword.addEventListener('click', () => {
        forgotModalAlert.classList.add('d-none');
        modalResetEmail.value = inputIdentity.value || '';
        forgotModal.show();
    });

    btnSendReset.addEventListener('click', () => {
        const email = modalResetEmail.value.trim();
        if (!email) {
            modalResetEmail.focus();
            return;
        }

        forgotModalAlert.classList.remove('d-none');
        btnSendReset.textContent = 'Sent!';
        btnSendReset.disabled = true;

        setTimeout(() => {
            forgotModal.hide();
            btnSendReset.textContent = 'Send Instructions';
            btnSendReset.disabled = false;
            showAlert(`Password reset guidance dispatched to ${email}.`, 'success');
        }, 1200);
    });

    // -------------------------------------------------------------
    // 9. Alert & UI Helpers
    // -------------------------------------------------------------
    function showAlert(msg, type = 'error') {
        authAlert.className = `login-alert-box alert-${type}`;
        authAlertMsg.textContent = msg;
        authAlert.classList.remove('d-none');
    }

    function hideAlert() {
        authAlert.classList.add('d-none');
    }

    function setLoading(isLoading) {
        if (isLoading) {
            btnSubmit.disabled = true;
            btnSubmitIcon.classList.add('d-none');
            btnSpinner.classList.remove('d-none');
        } else {
            btnSubmit.disabled = false;
            btnSubmitIcon.classList.remove('d-none');
            btnSpinner.classList.add('d-none');
        }
    }

    function shakeCard() {
        loginCard.style.animation = 'none';
        void loginCard.offsetWidth; // trigger reflow
        loginCard.style.animation = 'shake-horizontal 0.4s ease-in-out';
    }
});

// CSS shake animation keyframe injected dynamically
const styleShake = document.createElement('style');
styleShake.textContent = `
@keyframes shake-horizontal {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-8px); }
    40%, 80% { transform: translateX(8px); }
}
`;
document.head.appendChild(styleShake);
