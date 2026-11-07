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
    // Enforce Welcome Agreement: Must complete Welcome before login
    // -------------------------------------------------------------
    const hasCompletedWelcome = localStorage.getItem('algolearn_welcomed') === 'true';
    if (!hasCompletedWelcome && !urlParams.get('token') && !urlParams.get('error') && !urlParams.get('message')) {
        window.location.replace('index.html');
        return;
    }

    // -------------------------------------------------------------
    // 1. Theme Initialization & Sync (Fully synced with AlgoTheme)
    // -------------------------------------------------------------
    function initTheme() {
        const globalTheme = localStorage.getItem('algolearn_theme') || localStorage.getItem('algolearn-theme') || 'sky';
        const normalized = (globalTheme === 'cyberpunk' || globalTheme === 'neon') ? 'neon' : (globalTheme === 'dark' ? 'dark' : 'light');
        applyTheme(normalized);
    }

    function applyTheme(theme) {
        document.body.classList.remove('theme-dark', 'theme-neon', 'theme-light');
        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeToggleIcon) themeToggleIcon.className = 'bi bi-moon-stars-fill text-info';
            localStorage.setItem('algolearn_theme', 'dark');
            localStorage.setItem('algolearn-theme', 'dark');
        } else if (theme === 'neon' || theme === 'cyberpunk') {
            document.body.classList.add('theme-neon');
            document.documentElement.setAttribute('data-theme', 'cyberpunk');
            if (themeToggleIcon) themeToggleIcon.className = 'bi bi-cpu-fill text-success';
            localStorage.setItem('algolearn_theme', 'cyberpunk');
            localStorage.setItem('algolearn-theme', 'neon');
        } else {
            document.body.classList.add('theme-light');
            document.documentElement.setAttribute('data-theme', 'sky');
            if (themeToggleIcon) themeToggleIcon.className = 'bi bi-sun-fill text-warning';
            localStorage.setItem('algolearn_theme', 'sky');
            localStorage.setItem('algolearn-theme', 'light');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTheme = localStorage.getItem('algolearn_theme') || 'sky';
            const nextTheme = currentTheme === 'sky' ? 'dark' : (currentTheme === 'dark' ? 'neon' : 'light');
            applyTheme(nextTheme);
        });
    }

    initTheme();

    // -------------------------------------------------------------
    // 2. Query Parameters Handling (OAuth Callback & Error Notices)
    // -------------------------------------------------------------
    const callbackToken = urlParams.get('token');
    const authSuccess = urlParams.get('auth_success');
    const authError = urlParams.get('error');
    const authMessage = urlParams.get('message');

    if (callbackToken && authSuccess) {
        // Successful OAuth callback redirect from backend
        localStorage.setItem('algolearn_token', callbackToken);
        const providerName = authSuccess === 'google' ? 'Google' : (authSuccess === 'github' ? 'GitHub' : 'OAuth');
        showAlert(`Authenticated successfully with ${providerName}! Loading your workspace...`, 'success');

        fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${callbackToken}` }
        })
        .then(r => r.json())
        .then(data => {
            if (data && data.success && data.user) {
                localStorage.setItem('algolearn_user', JSON.stringify(data.user));
            }
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 700);
        })
        .catch(() => {
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 800);
        });
    } else if (authError) {
        let errorDesc = '';
        switch (authError) {
            case 'google_unconfigured':
                errorDesc = 'Google OAuth is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable Google Sign-In.';
                break;
            case 'github_unconfigured':
                errorDesc = 'GitHub OAuth is not configured yet. Please configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.';
                break;
            case 'access_denied':
                errorDesc = 'Sign-in cancelled or access denied by provider.';
                break;
            case 'invalid_state':
                errorDesc = 'OAuth session state validation failed. Please try signing in again.';
                break;
            case 'auth_required':
                errorDesc = 'Authentication required. Please sign in or register to access CodeLab Studio.';
                break;
            case 'session_expired':
                errorDesc = 'Your session has expired. Please sign in again to continue.';
                break;
            case 'token_exchange_failed':
                errorDesc = authMessage ? decodeURIComponent(authMessage) : 'Failed to exchange authorization token with provider.';
                break;
            default:
                errorDesc = authMessage ? decodeURIComponent(authMessage) : `Authentication notice: ${authError}`;
        }
        showAlert(errorDesc, 'error');
        shakeCard();
    } else if (authMessage === 'logged_out') {
        showAlert('You have been signed out successfully.', 'success');
    } else {
        // -------------------------------------------------------------
        // 3. Already Logged In Session Check (only if no errors pending)
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
                localStorage.removeItem('algolearn_token');
                localStorage.removeItem('algolearn_user');
            });
        }
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
    // 7. Social OAuth Authentication (Google & GitHub)
    // -------------------------------------------------------------
    function initiateOAuth(provider) {
        hideAlert();
        setLoading(true);
        const endpoint = provider === 'google' ? '/api/auth/google' : '/api/auth/github';
        window.location.href = `${endpoint}?redirect=${encodeURIComponent(redirectUrl)}`;
    }

    btnOauthGoogle.addEventListener('click', () => initiateOAuth('google'));
    btnOauthGithub.addEventListener('click', () => initiateOAuth('github'));

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
