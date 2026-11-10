/**
 * AlgoAI — Senior DSA Mentor, Agentic Companion & Conversational Pair Programmer
 * AlgoLearn Interactive Learning Platform
 *
 * Capabilities:
 * - Powered by live Google Gemini multi-model cascade (with offline Built-in Mentor fallback)
 * - Synced Multi-Session Chat Threads (MongoDB when signed in, localStorage for guests)
 * - Glassmorphic, draggable chat studio matching AlgoLearn's Sky Light / Dark / Cyberpunk design
 * - Draggable floating AI companion (Muse orb with rotating dashed orbit & online pulse)
 * - One-click CodeLab Studio Error Diagnostics & Live Code Patching
 * - Agentic Visualizer Launching directly from chat ("Visualize Quick Sort on [42, 7, 19]")
 * - Voice Input (Mic dictation) & Read-Aloud Narration synced with Web Speech API
 * - Socratic Progressive Hints & Technical Mock Interview modes
 */

(function () {
    'use strict';

    // =========================================================================
    // 1. Context Extraction Engine
    // =========================================================================
    function getApplicationContext() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';

        let activeLanguage = 'java';
        let activeCode = '';
        let activeAlgorithm = '';

        // CodeLab Monaco Editor detection
        const editorInstance = window.monacoEditor || (window.CodeLabApp && window.CodeLabApp.editor);
        if (editorInstance && typeof editorInstance.getValue === 'function') {
            activeCode = editorInstance.getValue();
            const langSelect = document.getElementById('language-select') || document.querySelector('.language-picker');
            if (langSelect && langSelect.value) {
                activeLanguage = langSelect.value;
            } else if (window.CodeLabApp && window.CodeLabApp.currentLang) {
                activeLanguage = window.CodeLabApp.currentLang;
            }
        }

        // Active visualizer detection
        const visualizerHeading = document.querySelector('h1, h2, .algo-title, .visualizer-title');
        if (visualizerHeading) {
            activeAlgorithm = visualizerHeading.innerText.trim();
        }

        return {
            page,
            activeLanguage,
            activeCode: activeCode ? activeCode.slice(0, 4000) : '',
            activeAlgorithm,
            theme: document.documentElement.getAttribute('data-theme') || 'sky'
        };
    }

    // =========================================================================
    // 2. High-Fidelity Markdown, Math & Agentic Action Formatter
    // =========================================================================
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatMath(expr) {
        if (!expr) return '';
        return expr
            .replace(/\\log\b/g, 'log')
            .replace(/\\le\b/g, '≤')
            .replace(/\\ge\b/g, '≥')
            .replace(/\\ne\b/g, '≠')
            .replace(/\\approx\b/g, '≈')
            .replace(/\\infty\b/g, '∞')
            .replace(/\\times\b/g, '×')
            .replace(/\\cdot\b/g, '·')
            .replace(/\\pm\b/g, '±')
            .replace(/\\sqrt\s*\{([^}]+)\}/g, '√($1)')
            .replace(/\\sqrt\b/g, '√')
            .replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '($1 / $2)')
            .replace(/\\lfloor\s*(.*?)\s*\\rfloor/g, '⌊$1⌋')
            .replace(/\\lceil\s*(.*?)\s*\\rceil/g, '⌈$1⌉')
            .replace(/\\text\{([^}]+)\}/g, '$1')
            .replace(/\^2\b/g, '²')
            .replace(/\^3\b/g, '³')
            .replace(/\^n\b/g, 'ⁿ')
            .replace(/\\sum/g, '∑');
    }

    function stripMarkdownForSpeech(md) {
        if (!md) return '';
        return String(md)
            .replace(/\[\[ALGOAI_ACTION:[\s\S]*?\]\]/g, '')
            .replace(/```[\s\S]*?```/g, ' Code snippet provided on screen. ')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\$\$([\s\S]+?)\$\$/g, (_, e) => formatMath(e))
            .replace(/\$([^\$\n]+?)\$/g, (_, e) => formatMath(e))
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/^#{1,6}\s*/gm, '')
            .replace(/[*_~>-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function renderMarkdown(md) {
        if (!md) return '';

        // 0. Extract complete Agentic Action directives & hide incomplete trailing tags while streaming
        const actions = [];
        let parsed = md.replace(/\[\[ALGOAI_ACTION:([\s\S]*?)\]\]/g, (match, jsonStr) => {
            try {
                const actionObj = JSON.parse(jsonStr.trim());
                actions.push(actionObj);
                return `__ALGOAI_ACTION_${actions.length - 1}__`;
            } catch (e) {
                return '';
            }
        });
        parsed = parsed.replace(/\[\[ALGOAI_ACTION:[\s\S]*$/, '');

        // 1. Code blocks: ```lang ... ```
        const codeBlocks = [];
        parsed = parsed.replace(/```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
            const id = `code-block-${Date.now()}-${codeBlocks.length}-${Math.random().toString(36).substr(2, 5)}`;
            const rawLang = (lang || 'python').trim().toLowerCase();
            const cleanLang = (lang || 'code').toUpperCase();
            codeBlocks.push({ id, lang: cleanLang, rawLang, code });
            return `__ALGOAI_CODE_BLOCK_${codeBlocks.length - 1}__`;
        });

        // 2. Display math ($$...$$) and inline math ($...$)
        parsed = parsed.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
            return `<div class="algoai-math-block"><span class="algoai-math">${escapeHtml(formatMath(expr.trim()))}</span></div>`;
        });
        parsed = parsed.replace(/\$([^\$\n]+?)\$/g, (match, expr) => {
            return `<span class="algoai-math-inline">${escapeHtml(formatMath(expr.trim()))}</span>`;
        });

        // 3. Inline code
        parsed = parsed.replace(/`([^`]+)`/g, (match, code) => `<code>${escapeHtml(code)}</code>`);

        // 4. Tables
        parsed = parsed.replace(/((?:\|[^\n]+\|\n?)+)/g, (match) => {
            const rows = match.trim().split('\n');
            if (rows.length < 2) return match;
            let tableHtml = '<div class="algoai-table-wrap"><table class="algoai-table">';
            rows.forEach((row, idx) => {
                const cols = row.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1);
                if (idx === 1 && cols.some(c => c.trim().startsWith('-'))) return;
                const tag = idx === 0 ? 'th' : 'td';
                tableHtml += '<tr>';
                cols.forEach(col => {
                    tableHtml += `<${tag}>${col.trim()}</${tag}>`;
                });
                tableHtml += '</tr>';
            });
            tableHtml += '</table></div>';
            return tableHtml;
        });

        // 5. Mentor Step Headings: e.g. "#### 1. Intuition"
        parsed = parsed.replace(/^#{1,4}\s*(\d+)\.\s*(.+?)$/gm, (match, num, title) => {
            return `<div class="algoai-step-heading"><span class="algoai-step-badge">${num}</span><h4 class="algoai-step-title">${title}</h4></div>`;
        });

        // 6. Headers
        parsed = parsed.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
        parsed = parsed.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
        parsed = parsed.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
        parsed = parsed.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

        // 7. Horizontal Rules
        parsed = parsed.replace(/^---+$/gm, '<hr class="algoai-divider">');

        // 8. Blockquotes
        parsed = parsed.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

        // 9. Bold & Italic
        parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // 10. Links
        parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        // 11. Unordered lists (- or *)
        parsed = parsed.replace(/(?:^[ \t]*[-*]\s+.+(?:\n|$))+/gm, (match) => {
            const items = match.trim().split('\n').map(l => {
                const clean = l.replace(/^[ \t]*[-*]\s+/, '').trim();
                return `<li>${clean}</li>`;
            }).join('');
            return `<ul>${items}</ul>\n\n`;
        });

        // 12. Ordered lists (1. 2. 3.)
        parsed = parsed.replace(/(?:^[ \t]*\d+\.\s+.+(?:\n|$))+/gm, (match) => {
            const lines = match.trim().split('\n');
            let firstNum = 1;
            const items = lines.map((l, i) => {
                const numMatch = l.match(/^[ \t]*(\d+)\.\s+(.*)$/);
                const num = numMatch ? parseInt(numMatch[1], 10) : (i + 1);
                if (i === 0) firstNum = num;
                const clean = numMatch ? numMatch[2].trim() : l.trim();
                return `<li value="${num}">${clean}</li>`;
            }).join('');
            return `<ol start="${firstNum}">${items}</ol>\n\n`;
        });

        // 13. Paragraphs
        const paragraphs = parsed.split(/\n\n+/);
        parsed = paragraphs.map(p => {
            p = p.trim();
            if (!p) return '';
            if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<block') || p.startsWith('<div') || p.startsWith('<hr') || p.startsWith('__ALGOAI_CODE_BLOCK_') || p.startsWith('__ALGOAI_ACTION_')) {
                return p;
            }
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        }).join('\n');

        // 14. Re-inject Code Blocks
        codeBlocks.forEach((block, idx) => {
            const blockPlaceholder = `__ALGOAI_CODE_BLOCK_${idx}__`;
            const codeBlockHtml = `
                <div class="algoai-code-wrapper" id="${block.id}">
                    <div class="algoai-code-header">
                        <span class="algoai-code-lang"><i class="bi bi-code-slash"></i> ${block.lang}</span>
                        <div class="algoai-code-actions">
                            <button type="button" class="algoai-code-btn copy-code-btn" data-block="${block.id}" title="Copy snippet to clipboard">
                                <i class="bi bi-clipboard"></i> Copy
                            </button>
                            <button type="button" class="algoai-code-btn apply-codelab-btn" data-block="${block.id}" data-lang="${escapeHtml(block.rawLang)}" title="Inject directly into CodeLab editor">
                                <i class="bi bi-box-arrow-in-down-right"></i> Apply to CodeLab
                            </button>
                        </div>
                    </div>
                    <pre class="algoai-code-pre"><code>${escapeHtml(block.code)}</code></pre>
                </div>
            `;
            parsed = parsed.replace(blockPlaceholder, codeBlockHtml);
        });

        // 15. Re-inject Agentic Action Launchers
        actions.forEach((act, idx) => {
            const actPlaceholder = `__ALGOAI_ACTION_${idx}__`;
            const icon = act.type === 'visualize' ? 'bi-play-circle-fill' : 'bi-box-arrow-up-right';
            const label = act.label || (act.algo ? `Launch ${act.algo} Visualizer` : 'Open Visualizer');
            const encoded = escapeHtml(JSON.stringify(act));
            const actionHtml = `
                <div class="algoai-agent-action-wrap">
                    <button type="button" class="algoai-agent-action-btn" data-action="${encoded}">
                        <i class="bi ${icon}"></i> <span>${escapeHtml(label)}</span>
                    </button>
                </div>
            `;
            parsed = parsed.replace(actPlaceholder, actionHtml);
        });

        return parsed;
    }

    // =========================================================================
    // 3. AlgoAI UI Controller
    // =========================================================================
    class AlgoAIController {
        constructor() {
            this.isOpen = false;
            this.isMaximized = false;
            this.isMinimized = false;
            this.isStreaming = false;
            this.hintMode = false;
            this.interviewMode = false;
            this.messages = [];
            this.threads = [];
            this.currentThreadId = null;
            this.threadsKey = 'algolearn_chat_threads';
            this.legacyKey = 'algolearn_chat_history';
            this.abortController = null;
            this.recognition = null;
            this.isRecording = false;
            this.providerLabel = 'Senior Pair Programmer';
            this.activeSpeakBtn = null;

            this.createDOM();
            this.initDraggableLauncher();
            this.initDraggablePanel();
            this.bindEvents();
            this.fetchProviderStatus();
            this.loadHistory();
        }

        getAuthToken() {
            return localStorage.getItem('algolearn_token') || '';
        }

        // Build DOM Elements
        createDOM() {
            if (document.getElementById('algoai-launcher')) return;

            // 1. Draggable Floating Companion Launcher
            const launcher = document.createElement('div');
            launcher.id = 'algoai-launcher';
            launcher.className = 'algoai-launcher';
            launcher.title = 'AlgoAI — Senior DSA Mentor (Drag anywhere or click to chat)';
            launcher.innerHTML = `
                <div class="algoai-launcher-glow"></div>
                <div class="algoai-launcher-ring"></div>
                <div class="algoai-launcher-orb">
                    <img src="algolearn-icon.png" alt="AlgoLearn Logo" class="algoai-launcher-logo-img" draggable="false" />
                </div>
                <div class="algoai-launcher-pill">
                    <span class="algoai-launcher-pulse"></span>
                    <span>AlgoAI</span>
                </div>
                <div class="algoai-launcher-tip"><i class="bi bi-arrows-move"></i> Drag anywhere</div>
            `;
            document.body.appendChild(launcher);
            this.launcherEl = launcher;

            // Restore saved Launcher position
            const savedLauncherPos = localStorage.getItem('algolearn_launcher_pos') || localStorage.getItem('algolearn_muse_pos');
            if (savedLauncherPos) {
                try {
                    const pos = JSON.parse(savedLauncherPos);
                    if (pos.left !== undefined && pos.top !== undefined) {
                        const safeLeft = Math.max(10, Math.min(pos.left, window.innerWidth - 75));
                        const safeTop = Math.max(10, Math.min(pos.top, window.innerHeight - 75));
                        this.launcherEl.style.left = `${safeLeft}px`;
                        this.launcherEl.style.top = `${safeTop}px`;
                        this.launcherEl.style.bottom = 'auto';
                        this.launcherEl.style.right = 'auto';
                    }
                } catch (e) {}
            }

            // 2. Draggable Glassmorphic Chat Studio Panel
            const panel = document.createElement('div');
            panel.id = 'algoai-panel';
            panel.className = 'algoai-panel algoai-hidden';
            panel.innerHTML = `
                <!-- Panel Header / Drag Bar -->
                <div class="algoai-header" id="algoai-header">
                    <div class="algoai-header-left">
                        <div class="algoai-header-icon-badge">
                            <img src="algolearn-icon.png" alt="AlgoAI" class="algoai-header-logo-img" draggable="false" />
                            <span class="algoai-header-online-dot"></span>
                        </div>
                        <div class="algoai-header-title-wrap">
                            <div class="algoai-header-brand-row">
                                <span class="algoai-header-brand">Algo<span class="algoai-brand-accent">AI</span></span>
                                <span class="algoai-header-badge"><i class="bi bi-stars"></i> DSA Mentor</span>
                            </div>
                            <span class="algoai-header-status" id="algoai-header-status"><span class="status-pulse-dot"></span> Connecting...</span>
                        </div>
                    </div>

                    <div class="algoai-header-controls">
                        <button type="button" class="algoai-ctrl-btn" id="algoai-threads-btn" title="Saved Conversation Threads">
                            <i class="bi bi-clock-history"></i>
                        </button>
                        <button type="button" class="algoai-ctrl-btn" id="algoai-new-chat-btn" title="Start New Chat">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                        <button type="button" class="algoai-ctrl-btn" id="algoai-maximize-btn" title="Expand / Restore Widescreen Studio">
                            <i class="bi bi-arrows-angle-expand"></i>
                        </button>
                        <button type="button" class="algoai-ctrl-btn" id="algoai-minimize-btn" title="Minimize">
                            <i class="bi bi-dash-lg"></i>
                        </button>
                        <button type="button" class="algoai-ctrl-btn btn-close-ai" id="algoai-close-btn" title="Close (Esc)">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>

                <!-- Multi-Session Saved Threads Drawer -->
                <div class="algoai-threads-drawer d-none" id="algoai-threads-drawer"></div>

                <!-- Context Awareness Strip -->
                <div class="algoai-context-strip">
                    <div class="algoai-context-pill" id="algoai-context-pill">
                        <i class="bi bi-compass"></i>
                        <span id="algoai-context-text">Page: index.html</span>
                    </div>
                    <div class="algoai-context-actions">
                        <button type="button" class="algoai-action-chip" id="algoai-toggle-hint-btn" title="Toggle Socratic Progressive Hints">
                            <i class="bi bi-lightbulb"></i> <span id="algoai-hint-status-text">Hints</span>
                        </button>
                        <button type="button" class="algoai-action-chip" id="algoai-toggle-interview-btn" title="Toggle FAANG Technical Mock Interview Mode">
                            <i class="bi bi-person-workspace"></i> <span id="algoai-interview-status-text">Interview</span>
                        </button>
                        <button type="button" class="algoai-action-chip" id="algoai-clear-btn" title="Clear current conversation">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                </div>

                <!-- Quick Topic Starters Bar -->
                <div class="algoai-quick-bar" id="algoai-quick-bar">
                    <button type="button" class="algoai-quick-chip" data-prompt="What is DSA and why is it important in technical interviews?">
                        <i class="bi bi-cpu"></i> What is DSA?
                    </button>
                    <button type="button" class="algoai-quick-chip" data-prompt="Visualize Quick Sort on [42, 12, 85, 23, 64, 9, 51, 30]">
                        <i class="bi bi-play-circle"></i> Animate Quick Sort
                    </button>
                    <button type="button" class="algoai-quick-chip" data-prompt="Explain Stack vs Queue with Java examples.">
                        <i class="bi bi-layers"></i> Stack vs Queue
                    </button>
                    <button type="button" class="algoai-quick-chip" data-prompt="Explain Big-O time and space complexity with examples.">
                        <i class="bi bi-speedometer2"></i> Big-O Guide
                    </button>
                    <button type="button" class="algoai-quick-chip" data-prompt="Give me a progressive hint on how to solve Two Sum in O(n) time.">
                        <i class="bi bi-lightbulb"></i> Two Sum Hint
                    </button>
                    <button type="button" class="algoai-quick-chip" data-prompt="Can you review and optimize the code currently in my CodeLab editor?">
                        <i class="bi bi-bug"></i> Review My Code
                    </button>
                </div>

                <!-- Messages Container -->
                <div class="algoai-messages" id="algoai-messages"></div>

                <!-- Footer & Input Dock -->
                <div class="algoai-footer">
                    <div class="algoai-input-row">
                        <textarea class="algoai-textarea" id="algoai-textarea" rows="1" placeholder="Ask AlgoAI anything or request a visualization..."></textarea>
                        <button type="button" class="algoai-mic-btn" id="algoai-mic-btn" title="Voice Input (Speak your question)">
                            <i class="bi bi-mic"></i>
                        </button>
                        <button type="button" class="algoai-send-btn" id="algoai-send-btn" title="Send message (Enter)">
                            <i class="bi bi-arrow-up"></i>
                        </button>
                    </div>
                    <div class="algoai-footer-options">
                        <label class="algoai-context-toggle-label" title="Attach active CodeLab code or visualizer state to prompt">
                            <input type="checkbox" id="algoai-attach-context-chk" checked />
                            <span id="algoai-attach-context-label">Include page context</span>
                        </label>
                        <span class="algoai-char-counter">Press <kbd class="algoai-kbd">Ctrl + /</kbd> to toggle</span>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);
            this.panelEl = panel;

            panel.addEventListener('scroll', () => {
                if (panel.scrollTop !== 0) panel.scrollTop = 0;
            });

            // Element references
            this.messagesEl = panel.querySelector('#algoai-messages');
            this.textareaEl = panel.querySelector('#algoai-textarea');
            this.sendBtnEl = panel.querySelector('#algoai-send-btn');
            this.micBtnEl = panel.querySelector('#algoai-mic-btn');
            this.contextTextEl = panel.querySelector('#algoai-context-text');
            this.attachContextChk = panel.querySelector('#algoai-attach-context-chk');
            this.attachContextLabel = panel.querySelector('#algoai-attach-context-label');
            this.hintBtn = panel.querySelector('#algoai-toggle-hint-btn');
            this.hintStatusText = panel.querySelector('#algoai-hint-status-text');
            this.interviewBtn = panel.querySelector('#algoai-toggle-interview-btn');
            this.interviewStatusText = panel.querySelector('#algoai-interview-status-text');
            this.statusEl = panel.querySelector('#algoai-header-status');
            this.threadsDrawerEl = panel.querySelector('#algoai-threads-drawer');

            // Restore saved panel position if available
            const savedChatPos = localStorage.getItem('algolearn_chat_pos');
            if (savedChatPos) {
                try {
                    const pos = JSON.parse(savedChatPos);
                    if (pos.left !== undefined && pos.top !== undefined) {
                        const safeLeft = Math.max(10, Math.min(pos.left, window.innerWidth - 380));
                        const safeTop = Math.max(10, Math.min(pos.top, window.innerHeight - 150));
                        this.panelEl.style.left = `${safeLeft}px`;
                        this.panelEl.style.top = `${safeTop}px`;
                        this.panelEl.style.bottom = 'auto';
                        this.panelEl.style.right = 'auto';
                    }
                } catch (e) {}
            }
        }

        async fetchProviderStatus() {
            try {
                const res = await fetch('/api/ai/status');
                if (!res.ok) return;
                const data = await res.json();
                this.updateStatusBadge(data.provider, data.model);
            } catch (e) {
                this.updateStatusBadge('built-in-expert', 'AlgoAI Engine');
            }
        }

        updateStatusBadge(provider, model) {
            if (!this.statusEl) return;
            let text = 'Senior Pair Programmer • Online';
            if (provider === 'gemini' && model) {
                const clean = String(model).replace(/^models\//, '');
                text = `${clean} • Live AI Mentor`;
            } else if (provider === 'groq' || provider === 'openai') {
                text = `${model} • Live AI Mentor`;
            }
            this.statusEl.innerHTML = `<span class="status-pulse-dot"></span> ${escapeHtml(text)}`;
        }

        // =====================================================================
        // 4. Draggable Companion Launcher Implementation
        // =====================================================================
        initDraggableLauncher() {
            let isDragging = false;
            let hasMoved = false;
            let startX = 0, startY = 0;
            let initialLeft = 0, initialTop = 0;

            const onStart = (e) => {
                if (this.isOpen) return;
                isDragging = true;
                hasMoved = false;

                const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
                const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
                startX = clientX;
                startY = clientY;

                const rect = this.launcherEl.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;

                this.launcherEl.classList.add('algoai-dragging');
            };

            const onMove = (e) => {
                if (!isDragging) return;
                const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
                const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
                if (clientX === undefined || clientY === undefined) return;

                const dx = clientX - startX;
                const dy = clientY - startY;
                if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved = true;

                if (hasMoved) {
                    const maxLeft = window.innerWidth - this.launcherEl.offsetWidth - 10;
                    const maxTop = window.innerHeight - this.launcherEl.offsetHeight - 10;
                    const newLeft = Math.max(10, Math.min(initialLeft + dx, maxLeft));
                    const newTop = Math.max(10, Math.min(initialTop + dy, maxTop));

                    this.launcherEl.style.left = `${newLeft}px`;
                    this.launcherEl.style.top = `${newTop}px`;
                    this.launcherEl.style.right = 'auto';
                    this.launcherEl.style.bottom = 'auto';
                }
            };

            const onEnd = () => {
                if (!isDragging) return;
                isDragging = false;
                this.launcherEl.classList.remove('algoai-dragging');

                if (hasMoved) {
                    const rect = this.launcherEl.getBoundingClientRect();
                    localStorage.setItem('algolearn_launcher_pos', JSON.stringify({ left: Math.round(rect.left), top: Math.round(rect.top) }));
                } else {
                    this.togglePanel();
                }
            };

            this.launcherEl.addEventListener('mousedown', onStart);
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onEnd);
            this.launcherEl.addEventListener('touchstart', onStart, { passive: true });
            window.addEventListener('touchmove', onMove, { passive: true });
            window.addEventListener('touchend', onEnd);
        }

        // =====================================================================
        // 5. Draggable Chat Studio Panel Implementation
        // =====================================================================
        initDraggablePanel() {
            let isDragging = false;
            let startX = 0, startY = 0;
            let initialLeft = 0, initialTop = 0;
            const header = this.panelEl.querySelector('#algoai-header');

            const onStart = (e) => {
                if (this.isMaximized || e.target.closest('.algoai-ctrl-btn')) return;
                isDragging = true;
                const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
                const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
                startX = clientX;
                startY = clientY;
                const rect = this.panelEl.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;
                this.panelEl.classList.add('algoai-panel-dragging');
            };

            const onMove = (e) => {
                if (!isDragging) return;
                const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
                const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
                if (clientX === undefined || clientY === undefined) return;
                const maxLeft = window.innerWidth - this.panelEl.offsetWidth - 10;
                const maxTop = window.innerHeight - this.panelEl.offsetHeight - 10;
                const newLeft = Math.max(10, Math.min(initialLeft + (clientX - startX), maxLeft));
                const newTop = Math.max(10, Math.min(initialTop + (clientY - startY), maxTop));
                this.panelEl.style.left = `${newLeft}px`;
                this.panelEl.style.top = `${newTop}px`;
                this.panelEl.style.right = 'auto';
                this.panelEl.style.bottom = 'auto';
            };

            const onEnd = () => {
                if (!isDragging) return;
                isDragging = false;
                this.panelEl.classList.remove('algoai-panel-dragging');
                const rect = this.panelEl.getBoundingClientRect();
                localStorage.setItem('algolearn_chat_pos', JSON.stringify({ left: Math.round(rect.left), top: Math.round(rect.top) }));
            };

            header.addEventListener('mousedown', onStart);
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onEnd);
            header.addEventListener('touchstart', onStart, { passive: true });
            window.addEventListener('touchmove', onMove, { passive: true });
            window.addEventListener('touchend', onEnd);
        }

        // =====================================================================
        // 6. Interactive Event Bindings & Voice Support
        // =====================================================================
        bindEvents() {
            this.panelEl.querySelector('#algoai-close-btn').addEventListener('click', () => this.closePanel());
            this.panelEl.querySelector('#algoai-minimize-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMinimize();
            });

            this.panelEl.querySelector('.algoai-header').addEventListener('click', (e) => {
                if (this.isMinimized && !e.target.closest('.algoai-ctrl-btn')) {
                    this.toggleMinimize();
                }
            });

            this.panelEl.querySelector('#algoai-maximize-btn').addEventListener('click', () => {
                if (this.isMinimized) {
                    this.isMinimized = false;
                    this.panelEl.classList.remove('algoai-minimized');
                }
                this.isMaximized = !this.isMaximized;
                this.panelEl.classList.toggle('algoai-maximized', this.isMaximized);
                const maxIcon = this.panelEl.querySelector('#algoai-maximize-btn i');
                if (maxIcon) {
                    maxIcon.className = this.isMaximized ? 'bi bi-arrows-angle-contract' : 'bi bi-arrows-angle-expand';
                }
            });

            // Threads Drawer & New Chat
            this.panelEl.querySelector('#algoai-threads-btn').addEventListener('click', () => {
                this.toggleThreadsDrawer();
            });
            this.panelEl.querySelector('#algoai-new-chat-btn').addEventListener('click', () => {
                this.startNewThread();
            });

            // Clear Current Thread
            this.panelEl.querySelector('#algoai-clear-btn').addEventListener('click', () => {
                this.clearHistory();
            });

            // Toggle Socratic Hints Mode
            this.hintBtn.addEventListener('click', () => {
                this.hintMode = !this.hintMode;
                this.hintBtn.classList.toggle('active', this.hintMode);
                if (this.hintStatusText) {
                    this.hintStatusText.textContent = this.hintMode ? 'Hints: On' : 'Hints';
                }
                if (this.hintMode) {
                    this.appendAssistantBubble('💡 **Socratic Progressive Hint Mode Activated!**\nWhenever you ask for help on any problem, I will guide you step-by-step with clues without spoiling the full solution.');
                }
            });

            // Toggle Technical Mock Interview Mode
            this.interviewBtn.addEventListener('click', () => {
                this.interviewMode = !this.interviewMode;
                this.interviewBtn.classList.toggle('interview-active', this.interviewMode);
                if (this.interviewStatusText) {
                    this.interviewStatusText.textContent = this.interviewMode ? 'Interview: Live' : 'Interview';
                }
                if (this.interviewMode) {
                    this.textareaEl.value = 'Start a 1-on-1 FAANG technical mock interview with me. Give me a warm coding challenge and evaluate my approach step-by-step.';
                    this.handleSendMessage();
                } else {
                    this.appendAssistantBubble('🎙️ **Mock Interview Mode Ended.** Switching back to Mentor Mode — ask anything whenever you\'re ready!');
                }
            });

            // Voice Input (Mic Dictation)
            this.initVoiceInput();

            // Auto-expanding textarea
            this.textareaEl.addEventListener('input', () => {
                this.textareaEl.style.height = 'auto';
                const newHeight = Math.min(this.textareaEl.scrollHeight, 120);
                this.textareaEl.style.height = `${newHeight}px`;
                this.textareaEl.style.overflowY = this.textareaEl.scrollHeight > 120 ? 'auto' : 'hidden';
            });

            // Enter sends, Shift+Enter newline
            this.textareaEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });

            this.sendBtnEl.addEventListener('click', () => {
                if (this.isStreaming) {
                    this.abortStreaming();
                } else {
                    this.handleSendMessage();
                }
            });

            // Keyboard shortcuts
            window.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                    e.preventDefault();
                    this.togglePanel();
                }
                if (e.key === 'Escape' && this.isOpen) {
                    this.closePanel();
                }
            });

            // Delegated Click Handlers inside Panel
            this.panelEl.addEventListener('click', (e) => {
                // 1. Copy Code
                const copyBtn = e.target.closest('.copy-code-btn');
                if (copyBtn) {
                    const blockId = copyBtn.getAttribute('data-block');
                    const pre = document.querySelector(`#${blockId} pre code`);
                    if (pre) {
                        navigator.clipboard.writeText(pre.innerText).then(() => {
                            copyBtn.classList.add('copied');
                            copyBtn.innerHTML = '<i class="bi bi-check2"></i> Copied!';
                            setTimeout(() => {
                                copyBtn.classList.remove('copied');
                                copyBtn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
                            }, 2000);
                        });
                    }
                    return;
                }

                // 2. Apply Code to CodeLab Studio (preserves language!)
                const applyBtn = e.target.closest('.apply-codelab-btn');
                if (applyBtn) {
                    const blockId = applyBtn.getAttribute('data-block');
                    const lang = applyBtn.getAttribute('data-lang') || '';
                    const pre = document.querySelector(`#${blockId} pre code`);
                    if (pre) {
                        const codeText = pre.innerText;
                        if (window.CodeLabApp && typeof window.CodeLabApp.applyAiSnippet === 'function') {
                            window.CodeLabApp.applyAiSnippet(codeText, lang);
                            applyBtn.innerHTML = '<i class="bi bi-check2-all"></i> Applied!';
                            setTimeout(() => {
                                applyBtn.innerHTML = '<i class="bi bi-box-arrow-in-down-right"></i> Apply to CodeLab';
                            }, 2200);
                        } else if (window.monacoEditor) {
                            window.monacoEditor.setValue(codeText);
                            applyBtn.innerHTML = '<i class="bi bi-check2-all"></i> Applied!';
                            setTimeout(() => {
                                applyBtn.innerHTML = '<i class="bi bi-box-arrow-in-down-right"></i> Apply to CodeLab';
                            }, 2200);
                        } else {
                            localStorage.setItem('algolearn_snippet_buffer', codeText);
                            if (lang) localStorage.setItem('algolearn_snippet_lang', lang);
                            window.location.href = 'codelab.html';
                        }
                    }
                    return;
                }

                // 3. Agentic Visualizer Action Button
                const agentBtn = e.target.closest('.algoai-agent-action-btn');
                if (agentBtn) {
                    try {
                        const action = JSON.parse(agentBtn.getAttribute('data-action'));
                        this.executeAgentAction(action);
                    } catch (err) {
                        console.warn('Invalid action payload', err);
                    }
                    return;
                }

                // 4. Read Aloud Speak Button
                const speakBtn = e.target.closest('.algoai-msg-speak-btn');
                if (speakBtn) {
                    const msgRow = speakBtn.closest('.algoai-msg-row');
                    const idx = msgRow ? parseInt(msgRow.getAttribute('data-msg-index'), 10) : -1;
                    const text = (idx >= 0 && this.messages[idx]) ? this.messages[idx].content : '';
                    this.toggleSpeakResponse(speakBtn, text);
                    return;
                }

                // 5. Thread Switch / Delete in Drawer
                const delThreadBtn = e.target.closest('.algoai-thread-del');
                if (delThreadBtn) {
                    e.stopPropagation();
                    const threadId = delThreadBtn.getAttribute('data-thread-id');
                    this.deleteThread(threadId);
                    return;
                }

                const threadItem = e.target.closest('.algoai-thread-item');
                if (threadItem) {
                    const threadId = threadItem.getAttribute('data-thread-id');
                    this.switchToThread(threadId);
                    return;
                }

                // 6. Suggested Prompt Chips
                const chip = e.target.closest('.algoai-suggestion-chip, .algoai-quick-chip');
                if (chip) {
                    const prompt = chip.getAttribute('data-prompt') || chip.innerText.trim();
                    this.textareaEl.value = prompt;
                    this.handleSendMessage();
                }
            });
        }

        initVoiceInput() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                this.micBtnEl.title = 'Voice dictation requires Chrome/Edge Web Speech API';
                this.micBtnEl.addEventListener('click', () => {
                    this.appendAssistantBubble('🎤 Voice dictation is supported in Chrome and Microsoft Edge. You can type your question below anytime!');
                });
                return;
            }

            this.micBtnEl.addEventListener('click', () => {
                if (this.isRecording && this.recognition) {
                    this.recognition.stop();
                    return;
                }
                const rec = new SpeechRecognition();
                rec.lang = 'en-US';
                rec.interimResults = false;
                rec.maxAlternatives = 1;

                rec.onstart = () => {
                    this.isRecording = true;
                    this.micBtnEl.classList.add('recording');
                    this.micBtnEl.innerHTML = '<i class="bi bi-stop-circle-fill"></i>';
                };
                rec.onresult = (event) => {
                    const transcript = event.results?.[0]?.[0]?.transcript || '';
                    if (transcript) {
                        this.textareaEl.value = (this.textareaEl.value ? this.textareaEl.value + ' ' : '') + transcript;
                        this.textareaEl.dispatchEvent(new Event('input'));
                        this.textareaEl.focus();
                    }
                };
                rec.onerror = () => {
                    this.isRecording = false;
                    this.micBtnEl.classList.remove('recording');
                    this.micBtnEl.innerHTML = '<i class="bi bi-mic"></i>';
                };
                rec.onend = () => {
                    this.isRecording = false;
                    this.micBtnEl.classList.remove('recording');
                    this.micBtnEl.innerHTML = '<i class="bi bi-mic"></i>';
                };

                this.recognition = rec;
                rec.start();
            });
        }

        toggleSpeakResponse(btn, markdownText) {
            const synth = window.speechSynthesis;
            if (!synth) return;

            if (btn.classList.contains('speaking')) {
                synth.cancel();
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="bi bi-volume-up"></i> Listen';
                this.activeSpeakBtn = null;
                return;
            }

            synth.cancel();
            if (this.activeSpeakBtn) {
                this.activeSpeakBtn.classList.remove('speaking');
                this.activeSpeakBtn.innerHTML = '<i class="bi bi-volume-up"></i> Listen';
            }

            const cleanText = stripMarkdownForSpeech(markdownText);
            if (!cleanText) return;

            const utterance = new SpeechSynthesisUtterance(cleanText);
            if (window.VoiceNarrator && window.VoiceNarrator.voice) {
                utterance.voice = window.VoiceNarrator.voice;
            }
            utterance.rate = 1.08;

            btn.classList.add('speaking');
            btn.innerHTML = '<i class="bi bi-stop-fill"></i> Stop';
            this.activeSpeakBtn = btn;

            utterance.onend = utterance.onerror = () => {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="bi bi-volume-up"></i> Listen';
                if (this.activeSpeakBtn === btn) this.activeSpeakBtn = null;
            };
            synth.speak(utterance);
        }

        executeAgentAction(action) {
            if (!action) return;
            if (action.type === 'visualize' && action.category === 'sorting') {
                const isSortingPage = window.location.pathname.includes('visualize-sorting');
                if (isSortingPage && window.AlgoVisualizerBridge) {
                    window.AlgoVisualizerBridge.runSorting(action.algo, action.array);
                    return;
                }
                localStorage.setItem('algolearn_visualizer_action', JSON.stringify(action));
                const params = new URLSearchParams();
                if (action.algo) params.set('algo', action.algo);
                if (Array.isArray(action.array) && action.array.length > 0) {
                    params.set('array', action.array.join(','));
                }
                window.location.href = `visualize-sorting.html?${params.toString()}`;
                return;
            }
            if (action.type === 'navigate' && action.page) {
                window.location.href = action.page;
            }
        }

        // Public API triggered from CodeLab's "Ask AlgoAI to Fix" button
        askToFixError({ code, language, error }) {
            this.openPanel();
            if (this.isMinimized) this.toggleMinimize();
            if (this.isStreaming) this.abortStreaming();

            const lineLabel = error && error.line ? ` on Line ${error.line}` : '';
            const promptText = `Help me fix this ${(language || 'code').toUpperCase()} ${(error?.type || 'error')}${lineLabel}: \`${String(error?.message || '').split('\n')[0].slice(0, 120)}\``;

            this.handleSendMessage(promptText, {
                activeCode: code,
                activeLanguage: language,
                activeError: error
            });
        }

        togglePanel() {
            if (this.isOpen) this.closePanel();
            else this.openPanel();
        }

        openPanel() {
            this.isOpen = true;
            this.panelEl.classList.remove('algoai-hidden');
            this.launcherEl.classList.add('algoai-launcher-hidden');
            document.body.classList.add('algoai-open');
            this.updateContextDisplay();
            this.panelEl.scrollTop = 0;
            setTimeout(() => {
                this.panelEl.scrollTop = 0;
                this.textareaEl.focus();
            }, 150);
            this.scrollToBottom();
        }

        closePanel() {
            this.isOpen = false;
            this.panelEl.classList.add('algoai-hidden');
            this.launcherEl.classList.remove('algoai-launcher-hidden');
            document.body.classList.remove('algoai-open');
            if (this.isMinimized) {
                this.isMinimized = false;
                this.panelEl.classList.remove('algoai-minimized');
            }
        }

        toggleMinimize() {
            this.isMinimized = !this.isMinimized;
            this.panelEl.classList.toggle('algoai-minimized', this.isMinimized);
            const minBtn = this.panelEl.querySelector('#algoai-minimize-btn');
            const minIcon = minBtn ? minBtn.querySelector('i') : null;
            if (minIcon) minIcon.className = this.isMinimized ? 'bi bi-window-stack' : 'bi bi-dash-lg';
            if (minBtn) minBtn.title = this.isMinimized ? 'Restore Studio' : 'Minimize';
            if (!this.isMinimized) {
                this.panelEl.scrollTop = 0;
                this.scrollToBottom();
                setTimeout(() => this.textareaEl.focus(), 100);
            }
        }

        updateContextDisplay() {
            const ctx = getApplicationContext();
            let label = `Page: ${ctx.page}`;
            if (ctx.page.includes('codelab')) {
                label = `CodeLab: ${ctx.activeLanguage.toUpperCase()} Studio`;
                this.attachContextLabel.textContent = `Include CodeLab (${ctx.activeLanguage.toUpperCase()}) code`;
            } else if (ctx.activeAlgorithm) {
                label = `Visualizer: ${ctx.activeAlgorithm.replace(/_/g, ' ').slice(0, 24)}`;
                this.attachContextLabel.textContent = `Include ${ctx.activeAlgorithm.slice(0, 18)} context`;
            }
            this.contextTextEl.textContent = label;
        }

        // =====================================================================
        // 7. Multi-Session Chat History (Local + MongoDB Synced)
        // =====================================================================
        generateThreadId() {
            return 'thr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        }

        loadThreadsFromLocal() {
            try {
                const raw = localStorage.getItem(this.threadsKey);
                if (raw) {
                    const arr = JSON.parse(raw);
                    if (Array.isArray(arr)) return arr;
                }
            } catch (e) {}

            // Migrate single legacy thread cleanly if present
            try {
                const legacy = localStorage.getItem(this.legacyKey);
                if (legacy) {
                    const msgs = JSON.parse(legacy);
                    if (Array.isArray(msgs) && msgs.length > 0) {
                        const firstUser = msgs.find(m => m.role === 'user');
                        return [{
                            id: this.generateThreadId(),
                            title: firstUser ? firstUser.content.slice(0, 42) : 'Previous Session',
                            updatedAt: Date.now(),
                            messages: msgs
                        }];
                    }
                }
            } catch (e) {}
            return [];
        }

        async loadHistory() {
            this.threads = this.loadThreadsFromLocal();

            // Attempt MongoDB sync if user is logged in
            const token = this.getAuthToken();
            if (token) {
                try {
                    const res = await fetch('/api/ai/threads', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data.threads) && data.threads.length > 0) {
                            this.threads = data.threads;
                            localStorage.setItem(this.threadsKey, JSON.stringify(this.threads.slice(0, 25)));
                        }
                    }
                } catch (e) {}
            }

            if (this.threads.length > 0) {
                const latest = this.threads[0];
                this.currentThreadId = latest.id;
                this.messages = Array.isArray(latest.messages) ? latest.messages : [];
                this.renderAllMessages();
            } else {
                this.currentThreadId = this.generateThreadId();
                this.messages = [];
                this.renderWelcome();
            }
        }

        saveHistory() {
            if (!this.currentThreadId) this.currentThreadId = this.generateThreadId();
            const firstUser = this.messages.find(m => m.role === 'user');
            const title = firstUser
                ? firstUser.content.replace(/[`*_#]/g, '').trim().slice(0, 46)
                : 'New AlgoAI Chat';

            const threadObj = {
                id: this.currentThreadId,
                title: title || 'New AlgoAI Chat',
                updatedAt: new Date().toISOString(),
                messages: this.messages.slice(-30)
            };

            const existingIdx = this.threads.findIndex(t => t.id === this.currentThreadId);
            if (existingIdx >= 0) this.threads.splice(existingIdx, 1);
            this.threads.unshift(threadObj);
            this.threads = this.threads.slice(0, 25);

            try {
                localStorage.setItem(this.threadsKey, JSON.stringify(this.threads));
                localStorage.setItem(this.legacyKey, JSON.stringify(this.messages.slice(-30)));
            } catch (e) {}

            // Async cloud sync if authenticated
            const token = this.getAuthToken();
            if (token && this.messages.length > 0) {
                fetch('/api/ai/threads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(threadObj)
                }).catch(() => {});
            }

            if (!this.threadsDrawerEl.classList.contains('d-none')) {
                this.renderThreadsDrawer();
            }
        }

        toggleThreadsDrawer() {
            const isHidden = this.threadsDrawerEl.classList.contains('d-none');
            this.threadsDrawerEl.classList.toggle('d-none', !isHidden);
            if (isHidden) this.renderThreadsDrawer();
        }

        renderThreadsDrawer() {
            const token = this.getAuthToken();
            const syncLabel = token
                ? '<span class="algoai-sync-badge"><i class="bi bi-cloud-check-fill"></i> Cloud Synced</span>'
                : '<span class="algoai-sync-badge" style="color: var(--algoai-text-muted);"><i class="bi bi-device-ssd"></i> Saved Locally</span>';

            if (!this.threads.length) {
                this.threadsDrawerEl.innerHTML = `
                    <div class="algoai-threads-drawer-header">
                        <span>Saved Sessions</span>
                        ${syncLabel}
                    </div>
                    <div style="font-size:0.75rem;color:var(--algoai-text-muted);padding:4px 0;">No saved conversations yet. Start chatting below!</div>
                `;
                return;
            }

            const itemsHtml = this.threads.map(t => {
                const isActive = t.id === this.currentThreadId;
                const count = Array.isArray(t.messages) ? t.messages.length : (t.messageCount || 0);
                return `
                    <div class="algoai-thread-item ${isActive ? 'active' : ''}" data-thread-id="${escapeHtml(t.id)}">
                        <div class="algoai-thread-meta">
                            <span class="algoai-thread-title">${escapeHtml(t.title || 'New AlgoAI Chat')}</span>
                            <span class="algoai-thread-sub">${count} messages</span>
                        </div>
                        <button type="button" class="algoai-thread-del" data-thread-id="${escapeHtml(t.id)}" title="Delete thread">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                `;
            }).join('');

            this.threadsDrawerEl.innerHTML = `
                <div class="algoai-threads-drawer-header">
                    <span>Conversation History (${this.threads.length})</span>
                    ${syncLabel}
                </div>
                ${itemsHtml}
            `;
        }

        switchToThread(threadId) {
            const target = this.threads.find(t => t.id === threadId);
            if (!target) return;
            if (this.isStreaming) this.abortStreaming();
            this.currentThreadId = target.id;
            this.messages = Array.isArray(target.messages) ? target.messages : [];
            this.threadsDrawerEl.classList.add('d-none');
            this.renderAllMessages();
        }

        startNewThread() {
            if (this.isStreaming) this.abortStreaming();
            this.currentThreadId = this.generateThreadId();
            this.messages = [];
            this.threadsDrawerEl.classList.add('d-none');
            this.renderWelcome();
            this.textareaEl.focus();
        }

        deleteThread(threadId) {
            this.threads = this.threads.filter(t => t.id !== threadId);
            try {
                localStorage.setItem(this.threadsKey, JSON.stringify(this.threads));
            } catch (e) {}

            const token = this.getAuthToken();
            if (token) {
                fetch(`/api/ai/threads/${encodeURIComponent(threadId)}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(() => {});
            }

            if (this.currentThreadId === threadId) {
                if (this.threads.length > 0) {
                    this.currentThreadId = this.threads[0].id;
                    this.messages = this.threads[0].messages || [];
                    this.renderAllMessages();
                } else {
                    this.currentThreadId = this.generateThreadId();
                    this.messages = [];
                    this.renderWelcome();
                }
            }
            this.renderThreadsDrawer();
        }

        clearHistory() {
            if (this.currentThreadId) {
                this.deleteThread(this.currentThreadId);
            } else {
                this.messages = [];
                this.renderWelcome();
            }
        }

        renderWelcome() {
            const welcomeHtml = `
                <div class="algoai-welcome-card">
                    <div class="algoai-welcome-header">
                        <div class="algoai-welcome-logo-ring">
                            <img src="algolearn-icon.png" alt="AlgoAI" class="algoai-welcome-logo-img" />
                        </div>
                        <div class="algoai-welcome-title-wrap">
                            <h3 class="algoai-welcome-title">Welcome to AlgoAI</h3>
                            <p class="algoai-welcome-sub">Pair Programmer • Live Gemini AI & CodeLab Debugger</p>
                        </div>
                    </div>

                    <div class="algoai-welcome-body">
                        <p class="algoai-welcome-intro">
                            Ask anything in natural language — debug compiler errors, explore <strong>Big-O complexity</strong>, practice mock interviews, or animate algorithms live on custom inputs.
                        </p>
                    </div>

                    <div class="algoai-welcome-topics-section">
                        <span class="algoai-welcome-topics-label"><i class="bi bi-stars"></i> Try Asking</span>
                        <div class="algoai-suggestions-grid">
                            <button type="button" class="algoai-suggestion-chip" data-prompt="Visualize Quick Sort on [42, 12, 85, 23, 64, 9, 51, 30]">
                                <i class="bi bi-play-circle"></i> <span>Animate Quick Sort</span>
                            </button>
                            <button type="button" class="algoai-suggestion-chip" data-prompt="Explain Stack vs Queue with real-world analogies and Java examples.">
                                <i class="bi bi-layers"></i> <span>Stack vs Queue</span>
                            </button>
                            <button type="button" class="algoai-suggestion-chip" data-prompt="Explain Big-O time and space complexity with interview examples.">
                                <i class="bi bi-speedometer2"></i> <span>Big-O Complexity</span>
                            </button>
                            <button type="button" class="algoai-suggestion-chip" data-prompt="Trace Binary Search step-by-step on [5, 12, 24, 38, 51, 72] for target 51.">
                                <i class="bi bi-search"></i> <span>Trace Binary Search</span>
                            </button>
                            <button type="button" class="algoai-suggestion-chip" data-prompt="Give me a progressive hint on how to solve the Two Sum problem in O(n) time.">
                                <i class="bi bi-lightbulb"></i> <span>Two Sum Hint</span>
                            </button>
                            <button type="button" class="algoai-suggestion-chip" data-prompt="Can you debug and optimize the code currently in my CodeLab editor?">
                                <i class="bi bi-bug"></i> <span>Review My Code</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            this.messagesEl.innerHTML = welcomeHtml;
        }

        renderAllMessages() {
            if (this.messages.length === 0) {
                this.renderWelcome();
                return;
            }
            this.messagesEl.innerHTML = '';
            this.messages.forEach((msg, index) => {
                this.appendBubble(msg.role, msg.content, false, index);
            });
            this.scrollToBottom();
        }

        appendBubble(role, content, save = true, explicitIndex = null) {
            const welcomeCard = this.messagesEl.querySelector('.algoai-welcome-card');
            if (welcomeCard) welcomeCard.remove();

            if (save) {
                this.messages.push({ role, content, timestamp: Date.now() });
                this.saveHistory();
            }

            const msgIndex = explicitIndex !== null ? explicitIndex : (this.messages.length - 1);
            const row = document.createElement('div');
            row.className = `algoai-msg-row ${role}`;
            row.setAttribute('data-msg-index', String(msgIndex));

            const avatarHtml = role === 'assistant'
                ? `<div class="algoai-msg-avatar">
                    <img src="algolearn-icon.png" alt="AlgoAI" class="algoai-msg-logo-img" draggable="false" />
                   </div>`
                : '';

            const speakFooter = role === 'assistant'
                ? `<div class="algoai-msg-actions">
                    <button type="button" class="algoai-msg-speak-btn" title="Listen to explanation aloud">
                        <i class="bi bi-volume-up"></i> Listen
                    </button>
                   </div>`
                : '';

            const bubbleHtml = `<div class="algoai-bubble">${renderMarkdown(content)}${speakFooter}</div>`;
            row.innerHTML = `${avatarHtml}${bubbleHtml}`;
            this.messagesEl.appendChild(row);

            this.scrollToBottom();
            return row;
        }

        appendAssistantBubble(content) {
            return this.appendBubble('assistant', content);
        }

        scrollToBottom() {
            if (this.messagesEl) {
                this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
            }
        }

        // =====================================================================
        // 8. Real-time Streaming Message Handler
        // =====================================================================
        async handleSendMessage(overridePrompt = null, extraContext = null) {
            const rawText = (overridePrompt !== null ? overridePrompt : this.textareaEl.value).trim();
            if (!rawText || this.isStreaming) return;

            if (overridePrompt === null) {
                this.textareaEl.value = '';
                this.textareaEl.style.height = 'auto';
                this.textareaEl.style.overflowY = 'hidden';
            }

            this.appendBubble('user', rawText, true);

            const assistantRow = document.createElement('div');
            assistantRow.className = 'algoai-msg-row assistant';
            assistantRow.innerHTML = `
                <div class="algoai-msg-avatar">
                    <img src="algolearn-icon.png" alt="AlgoAI" class="algoai-msg-logo-img" draggable="false" />
                </div>
                <div class="algoai-bubble">
                    <span class="algoai-stream-text"></span>
                    <span class="algoai-streaming-cursor"></span>
                </div>
            `;
            this.messagesEl.appendChild(assistantRow);
            this.scrollToBottom();

            const textSpan = assistantRow.querySelector('.algoai-stream-text');
            const cursorSpan = assistantRow.querySelector('.algoai-streaming-cursor');
            const bubbleEl = assistantRow.querySelector('.algoai-bubble');

            this.isStreaming = true;
            this.sendBtnEl.classList.add('stop-btn');
            this.sendBtnEl.innerHTML = '<i class="bi bi-stop-fill"></i>';
            this.sendBtnEl.title = 'Stop response';

            const appCtx = getApplicationContext();
            const includeContext = this.attachContextChk ? this.attachContextChk.checked : true;
            const contextPayload = includeContext ? { ...appCtx } : { page: appCtx.page, theme: appCtx.theme };
            if (extraContext) {
                Object.assign(contextPayload, extraContext);
            }
            if (this.hintMode) contextPayload.hintMode = true;
            if (this.interviewMode) contextPayload.interviewMode = true;

            const messagesPayload = this.messages.map(m => ({ role: m.role, content: m.content }));
            this.abortController = new AbortController();
            let fullAssistantResponse = '';

            try {
                const response = await fetch('/api/ai/stream', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: messagesPayload,
                        context: contextPayload
                    }),
                    signal: this.abortController.signal
                });

                if (!response.ok) throw new Error(`HTTP error ${response.status}`);

                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed.startsWith('data:')) continue;
                        const jsonStr = trimmed.slice(5).trim();
                        if (!jsonStr) continue;

                        try {
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.type === 'chunk' && parsed.text) {
                                fullAssistantResponse += parsed.text;
                                textSpan.innerHTML = renderMarkdown(fullAssistantResponse);
                                this.scrollToBottom();
                            } else if (parsed.type === 'done' && parsed.provider) {
                                this.updateStatusBadge(parsed.provider, parsed.model);
                            } else if (parsed.type === 'tool_result') {
                                const toolBadge = document.createElement('div');
                                toolBadge.className = 'algoai-tool-call-badge';
                                toolBadge.innerHTML = `<i class="bi bi-terminal"></i> <span>Executed: ${parsed.tool}</span>`;
                                bubbleEl.insertBefore(toolBadge, textSpan);
                            }
                        } catch (e) {}
                    }
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('[AlgoAI Client Stream Error]:', err);
                    fullAssistantResponse += `\n\n*(Connection notice: Reconnected to Built-in Mentor)*`;
                }
            } finally {
                if (cursorSpan) cursorSpan.remove();

                this.messages.push({
                    role: 'assistant',
                    content: fullAssistantResponse,
                    timestamp: Date.now()
                });
                const savedIndex = this.messages.length - 1;
                assistantRow.setAttribute('data-msg-index', String(savedIndex));

                const speakFooter = `<div class="algoai-msg-actions">
                    <button type="button" class="algoai-msg-speak-btn" title="Listen to explanation aloud">
                        <i class="bi bi-volume-up"></i> Listen
                    </button>
                </div>`;
                bubbleEl.innerHTML = `${renderMarkdown(fullAssistantResponse)}${speakFooter}`;

                this.saveHistory();

                this.isStreaming = false;
                this.sendBtnEl.classList.remove('stop-btn');
                this.sendBtnEl.innerHTML = '<i class="bi bi-arrow-up"></i>';
                this.sendBtnEl.title = 'Send message (Enter)';
                this.scrollToBottom();
            }
        }

        abortStreaming() {
            if (this.abortController) {
                this.abortController.abort();
                this.abortController = null;
            }
            this.isStreaming = false;
            this.sendBtnEl.classList.remove('stop-btn');
            this.sendBtnEl.innerHTML = '<i class="bi bi-arrow-up"></i>';
            this.sendBtnEl.title = 'Send message (Enter)';
        }
    }

    // =========================================================================
    // 9. Auto-initialization on DOM Ready
    // =========================================================================
    function initAlgoAI() {
        if (window.__algoai_instance) return;
        window.__algoai_instance = new AlgoAIController();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAlgoAI);
    } else {
        initAlgoAI();
    }
})();
