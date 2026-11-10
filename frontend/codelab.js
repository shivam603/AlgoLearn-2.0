/**
 * AlgoLearn CodeLab — Universal Live Code Debugging System
 * Monaco Editor Controller, Real Multi-Language Debugger State Machine,
 * Containerized Live Trace Synchronizer, and Visualizer Inspector.
 */

const CodeLabApp = {
    editor: null,
    currentLang: 'python',
    editorMode: 'write', // 'write', 'predefined', or 'problems'
    currentTemplateKey: 'custom',
    activeViewMode: 'state', // 'state' (Live State Inspector) or 'visualizer' (Algorithm Visualizer)
    breakpoints: new Set(),
    decorations: [],
    errorDecorations: [],
    savedCustomCode: {},
    savedProblemCode: {},
    problemsList: [],
    problemsLoaded: false,
    problemDiffFilter: 'All',
    initialViewVisualizer: false,
    currentProblemId: 'two_sum',
    customProblemInputs: {},
    visSubMode: 'live', // 'live' (container execution trace) or 'walkthrough' (editable ProblemVisualizerEngine)
    activeProblemVisInstance: null,
    editorSyncTimer: null,
    lastJudgeResult: null,
    lastProfileResult: null,
    currentError: null,
    isProgrammaticChange: false,

    // Execution & Debugger State
    traceSteps: [],
    currentStepIndex: 0,
    isPlaying: false,
    playInterval: null,
    stepDelay: 350,
    activeWatches: ['arr', 'total', 'result', 'nums', 'i', 'j', 'sum', 'count'],
    lastVariablesState: {},

    init() {
        this.initMonaco();
        this.bindControls();
        this.renderWatchPanel();
        this.loadProblems();
    },

    // ==========================================
    // 1. Monaco Editor Initialization
    // ==========================================
    getMonacoLanguage(lang) {
        switch (lang) {
            case 'python': return 'python';
            case 'javascript': return 'javascript';
            case 'c': return 'c';
            case 'cpp': return 'cpp';
            case 'java': return 'java';
            default: return 'python';
        }
    },

    initMonaco() {
        if (typeof require === 'undefined') {
            console.error("Monaco require loader missing");
            return;
        }

        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });

        require(['vs/editor/editor.main'], () => {
            const container = document.getElementById('monaco-editor-container');
            if (!container) return;

            const currentTheme = document.documentElement.getAttribute('data-theme');
            const initialMonacoTheme = currentTheme === 'cyberpunk' ? 'cyberpunk-neon' : 'vs-dark';
            if (currentTheme === 'cyberpunk' && window.AlgoTheme) {
                window.AlgoTheme.applyTheme('cyberpunk', false);
            }

            const initialCode = CodeLabTemplates.custom.code[this.currentLang] || CodeLabTemplates.custom.code.python;

            this.editor = monaco.editor.create(container, {
                value: initialCode,
                language: this.getMonacoLanguage(this.currentLang),
                theme: initialMonacoTheme,
                fontSize: 13,
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                glyphMargin: true,
                automaticLayout: true,
                wordWrap: 'on',
                wrappingStrategy: 'advanced',
                scrollBeyondLastColumn: 0,
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                lineDecorationsWidth: 8,
                minimap: { enabled: false },
                tabSize: 4,
                cursorBlinking: 'smooth',
                renderWhitespace: 'selection',
                scrollbar: {
                    horizontal: 'auto',
                    vertical: 'auto',
                    horizontalScrollbarSize: 8,
                    verticalScrollbarSize: 8
                }
            });

            // Gutter breakpoint click listener
            this.editor.onMouseDown((e) => {
                if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
                    const line = e.target.position.lineNumber;
                    this.toggleBreakpoint(line);
                }
            });

            // Keep track of user custom / problem code modifications
            this.editor.onDidChangeModelContent(() => {
                if (this.isProgrammaticChange) return;
                if (this.editorMode === 'write') {
                    this.savedCustomCode[this.currentLang] = this.editor.getValue();
                } else if (this.editorMode === 'problems' && this.currentProblemId) {
                    this.savedProblemCode[`${this.currentProblemId}:${this.currentLang}`] = this.editor.getValue();
                    if (this.editorSyncTimer) clearTimeout(this.editorSyncTimer);
                    this.editorSyncTimer = setTimeout(() => this.syncVisualizerFromEditorCall(), 380);
                }
                if (this.traceSteps.length > 0 && !this.isPlaying) {
                    const descEl = document.getElementById('vis-step-desc');
                    if (descEl) descEl.textContent = 'Code edited — Run/Debug to refresh trace';
                    const badge = document.getElementById('exec-status-badge');
                    if (badge && badge.textContent === 'Completed') badge.textContent = 'Edited';
                }
            });

            window.monacoEditor = this.editor;
            window.CodeLabApp = this;

            // Load buffered code snippet sent from AlgoAI on another page
            const bufferedSnippet = localStorage.getItem('algolearn_snippet_buffer');
            const bufferedLang = localStorage.getItem('algolearn_snippet_lang');
            if (bufferedSnippet) {
                localStorage.removeItem('algolearn_snippet_buffer');
                localStorage.removeItem('algolearn_snippet_lang');
                setTimeout(() => {
                    this.applyAiSnippet(bufferedSnippet, bufferedLang);
                }, 80);
            } else {
                this.applyInitialUrlParams();
            }

            this.logConsole(`Universal Live Debugger ready. Select any language (${this.currentLang.toUpperCase()}) and click line numbers to set breakpoints.`, "info");
        });
    },

    toggleWordWrap() {
        if (!this.editor) return;
        const currentWrap = this.editor.getOption(monaco.editor.EditorOption.wordWrap);
        const newWrap = currentWrap === 'on' ? 'off' : 'on';
        this.editor.updateOptions({ wordWrap: newWrap });
        const btn = document.getElementById('btn-toggle-wrap');
        if (btn) {
            btn.classList.toggle('btn-sky', newWrap === 'on');
            btn.classList.toggle('btn-outline-info', newWrap === 'on');
            btn.classList.toggle('btn-outline-secondary', newWrap !== 'on');
            btn.title = `Toggle Word Wrap (currently ${newWrap.toUpperCase()})`;
        }
        this.logConsole(`Word wrap set to: ${newWrap.toUpperCase()}`);
    },

    // ==========================================
    // 2. Breakpoint & Error Highlighting
    // ==========================================
    toggleBreakpoint(line) {
        if (this.breakpoints.has(line)) {
            this.breakpoints.delete(line);
            this.logConsole(`Breakpoint removed from line ${line}`);
        } else {
            this.breakpoints.add(line);
            this.logConsole(`Breakpoint set on line ${line}`);
        }
        this.refreshDecorations();
    },

    refreshDecorations() {
        if (!this.editor) return;

        const newDecorations = [];

        // 1. Breakpoints
        for (let bp of this.breakpoints) {
            newDecorations.push({
                range: new monaco.Range(bp, 1, bp, 1),
                options: {
                    isWholeLine: false,
                    glyphMarginClassName: 'monaco-glyph-breakpoint'
                }
            });
        }

        // 2. Currently Executing Line
        if (this.traceSteps.length > 0 && this.currentStepIndex < this.traceSteps.length) {
            const step = this.traceSteps[this.currentStepIndex];
            if (step && step.line && step.line > 0) {
                newDecorations.push({
                    range: new monaco.Range(step.line, 1, step.line, 1),
                    options: {
                        isWholeLine: true,
                        className: 'monaco-executing-line',
                        glyphMarginClassName: 'monaco-executing-glyph'
                    }
                });
                this.editor.revealLineInCenterIfOutsideViewport(step.line);
            }
        }

        this.decorations = this.editor.deltaDecorations(this.decorations, newDecorations);
    },

    highlightErrorLine(line) {
        if (!this.editor) return;
        const errDecs = [];
        if (line && line > 0) {
            errDecs.push({
                range: new monaco.Range(line, 1, line, 1),
                options: {
                    isWholeLine: true,
                    className: 'monaco-error-line',
                    glyphMarginClassName: 'monaco-error-glyph'
                }
            });
            this.editor.revealLineInCenter(line);
        }
        this.errorDecorations = this.editor.deltaDecorations(this.errorDecorations, errDecs);
    },

    clearErrorHighlights() {
        if (this.editor && this.errorDecorations.length > 0) {
            this.errorDecorations = this.editor.deltaDecorations(this.errorDecorations, []);
        }
    },

    // ==========================================
    // 3. Error Card & Diagnostics Controller
    // ==========================================
    showErrorCard(errData) {
        const errorCard = document.getElementById('vis-error-container');
        if (!errorCard) return;

        this.currentError = errData;
        errorCard.classList.remove('d-none');

        const titleEl = document.getElementById('error-card-title');
        const subEl = document.getElementById('error-card-subtitle');
        const typeBadge = document.getElementById('error-card-type-badge');
        const lineBadge = document.getElementById('error-card-line-badge');
        const langTag = document.getElementById('error-card-lang-tag');
        const msgEl = document.getElementById('error-card-message');

        if (titleEl) titleEl.textContent = errData.title || 'Compilation / Execution Error';
        if (subEl) subEl.textContent = errData.subtitle || 'Code failed to compile or encountered an exception';
        if (typeBadge) typeBadge.textContent = (errData.type || 'ERROR').toUpperCase();
        if (lineBadge) lineBadge.textContent = errData.line ? `Line ${errData.line}` : 'Line -';
        if (langTag) langTag.textContent = (errData.language || this.currentLang).toUpperCase();
        if (msgEl) msgEl.textContent = errData.message || errData.rawStderr || 'Unknown error occurred.';

        const jumpBtn = document.getElementById('btn-jump-error-line');
        if (jumpBtn) {
            if (errData.line && errData.line > 0) {
                jumpBtn.innerHTML = `<i class="bi bi-cursor-fill me-1"></i> Jump to Line ${errData.line} in Editor`;
                jumpBtn.disabled = false;
            } else {
                jumpBtn.innerHTML = `<i class="bi bi-cursor-fill me-1"></i> Jump to Line in Editor`;
                jumpBtn.disabled = true;
            }
        }
    },

    hideErrorCard() {
        const errorCard = document.getElementById('vis-error-container');
        if (errorCard) errorCard.classList.add('d-none');
        this.clearErrorHighlights();
        this.currentError = null;
    },

    jumpToErrorLine() {
        if (this.currentError && this.currentError.line) {
            const line = this.currentError.line;
            if (this.editor && line > 0) {
                this.editor.revealLineInCenter(line);
                this.editor.setPosition({ lineNumber: line, column: this.currentError.column || 1 });
                this.editor.focus();
                this.highlightErrorLine(line);
            }
        }
    },

    dismissError() {
        this.hideErrorCard();
        if (this.editor) {
            this.editor.focus();
        }
    },

    applyAiSnippet(code, lang) {
        if (!code || !this.editor) return;
        const langMap = { python: 'python', py: 'python', javascript: 'javascript', js: 'javascript', java: 'java', cpp: 'cpp', 'c++': 'cpp', c: 'c' };
        const normLang = lang ? (langMap[String(lang).toLowerCase()] || null) : null;

        if (this.editorMode === 'predefined') {
            this.setEditorMode('write');
        }
        if (normLang && ['python', 'javascript', 'c', 'cpp', 'java'].includes(normLang)) {
            if (this.editorMode === 'problems') {
                this.savedProblemCode[`${this.currentProblemId}:${normLang}`] = code;
            } else {
                this.savedCustomCode[normLang] = code;
            }
            const sel = document.getElementById('language-select');
            if (sel) sel.value = normLang;
            if (this.currentLang !== normLang) {
                this.setLanguage(normLang);
            }
        }

        this.isProgrammaticChange = true;
        this.editor.setValue(code);
        if (this.editorMode === 'problems') {
            this.savedProblemCode[`${this.currentProblemId}:${this.currentLang}`] = code;
        } else {
            this.savedCustomCode[this.currentLang] = code;
        }
        this.isProgrammaticChange = false;
        this.hideErrorCard();
        this.editor.revealLine(1);
        this.editor.focus();
        this.logConsole(`[AlgoAI] Applied snippet (${(normLang || this.currentLang).toUpperCase()}) into CodeLab editor.`, 'info');
    },

    askAlgoAIToFixError() {
        const code = this.editor ? this.editor.getValue() : '';
        const err = this.currentError || {};
        if (window.__algoai_instance && typeof window.__algoai_instance.askToFixError === 'function') {
            window.__algoai_instance.askToFixError({
                code,
                language: this.currentLang,
                error: {
                    type: err.type || 'ERROR',
                    title: err.title || 'Execution Error',
                    line: err.line || null,
                    message: err.message || err.rawStderr || 'Unknown compiler/runtime error'
                }
            });
        }
    },

    // ==========================================
    // 4. Mode & Language Switching (Write, Predefined, Problems Judge)
    // ==========================================
    applyInitialUrlParams() {
        try {
            const params = new URLSearchParams(window.location.search);
            const modeParam = params.get('mode');
            const problemParam = params.get('problem');
            const diffParam = params.get('difficulty');
            const viewParam = params.get('view');
            if (diffParam && ['All', 'Easy', 'Medium', 'Hard'].includes(diffParam)) {
                this.problemDiffFilter = diffParam;
                const diffSel = document.getElementById('problem-diff-filter');
                if (diffSel) diffSel.value = diffParam;
            }
            if (viewParam === 'visualizer') {
                this.initialViewVisualizer = true;
            }
            if (problemParam) this.currentProblemId = problemParam;
            if (modeParam === 'problems' || problemParam) {
                this.setEditorMode('problems').then(() => {
                    if (this.initialViewVisualizer) this.switchViewportMode('visualizer');
                });
            } else if (modeParam === 'predefined') {
                this.setEditorMode('predefined');
            } else if (this.initialViewVisualizer) {
                this.switchViewportMode('visualizer');
            }
        } catch (e) {}
    },

    async loadProblems() {
        try {
            const token = localStorage.getItem('algolearn_token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch('/api/codelab/problems', { headers });
            const data = await res.json();
            if (data && data.success && Array.isArray(data.problems)) {
                this.problemsList = data.problems;
                this.problemsLoaded = true;
                this.renderProblemSelectOptions();
                if (this.editorMode === 'problems') {
                    this.loadProblem(this.currentProblemId);
                    if (this.initialViewVisualizer) {
                        this.switchViewportMode('visualizer');
                    }
                }
            }
        } catch (e) {
            this.logConsole('Could not load problem bank: ' + e.message, 'warn');
        }
    },

    renderProblemSelectOptions() {
        const select = document.getElementById('problem-select');
        if (!select || !this.problemsList.length) return;
        const filtered = (this.problemDiffFilter && this.problemDiffFilter !== 'All')
            ? this.problemsList.filter(p => p.difficulty === this.problemDiffFilter)
            : this.problemsList;
        const list = filtered.length ? filtered : this.problemsList;
        select.innerHTML = list.map(p => {
            const mark = p.solved ? ' ✓' : '';
            const lc = p.leetcodeId ? `#${p.leetcodeId} ` : '';
            return `<option value="${escapeHtml(p.id)}">${lc}${escapeHtml(p.title)} (${escapeHtml(p.difficulty[0])})${mark}</option>`;
        }).join('');
        if (list.some(p => p.id === this.currentProblemId)) {
            select.value = this.currentProblemId;
        } else {
            this.currentProblemId = list[0].id;
            select.value = this.currentProblemId;
        }
    },

    async setEditorMode(mode) {
        const prevMode = this.editorMode;
        if (this.editor) {
            if (prevMode === 'write') {
                this.savedCustomCode[this.currentLang] = this.editor.getValue();
            } else if (prevMode === 'problems' && this.currentProblemId) {
                this.savedProblemCode[`${this.currentProblemId}:${this.currentLang}`] = this.editor.getValue();
            }
        }

        this.editorMode = mode;
        const btnWrite = document.getElementById('btn-mode-write');
        const btnPredefined = document.getElementById('btn-mode-predefined');
        const btnProblems = document.getElementById('btn-mode-problems');
        const subWrite = document.getElementById('subtoolbar-write-mode');
        const subPredefined = document.getElementById('subtoolbar-predefined-mode');
        const subProblems = document.getElementById('subtoolbar-problems-mode');
        const judgeSubmitBtn = document.getElementById('btn-judge-submit');

        [btnWrite, btnPredefined, btnProblems].forEach(b => {
            b?.classList.remove('active', 'btn-sky');
            b?.classList.add('btn-outline-secondary');
        });
        [subWrite, subPredefined, subProblems].forEach(s => {
            s?.classList.add('d-none');
            s?.classList.remove('d-flex');
        });

        if (mode === 'write') {
            btnWrite?.classList.add('active', 'btn-sky');
            btnWrite?.classList.remove('btn-outline-secondary');
            subWrite?.classList.remove('d-none');
            subWrite?.classList.add('d-flex');
            judgeSubmitBtn?.classList.add('d-none');

            document.getElementById('vis-algorithm-name').textContent = 'Custom Code Studio';
            document.getElementById('vis-category-badge').textContent = 'Custom Workspace';

            const saved = this.savedCustomCode[this.currentLang] || CodeLabTemplates.custom?.code[this.currentLang] || '';
            this.isProgrammaticChange = true;
            if (this.editor) {
                this.editor.setValue(saved);
                monaco.editor.setModelLanguage(this.editor.getModel(), this.getMonacoLanguage(this.currentLang));
                this.editor.setScrollLeft(0);
                this.editor.revealLine(1);
            }
            this.isProgrammaticChange = false;

            this.currentTemplateKey = 'custom';
            this.switchViewportMode('state');
            this.switchTab('vars');
            this.resetExecution();
            this.logConsole(`Switched to Custom Code mode (${this.currentLang.toUpperCase()}). Type or paste any code.`);
        } else if (mode === 'predefined') {
            btnPredefined?.classList.add('active', 'btn-sky');
            btnPredefined?.classList.remove('btn-outline-secondary');
            subPredefined?.classList.remove('d-none');
            subPredefined?.classList.add('d-flex');
            judgeSubmitBtn?.classList.add('d-none');

            this.switchTab('vars');
            const algoSelect = document.getElementById('predefined-algo-select');
            const selectedAlgo = algoSelect ? algoSelect.value : 'bubble';
            this.loadPredefinedAlgorithm(selectedAlgo);
        } else if (mode === 'problems') {
            btnProblems?.classList.add('active', 'btn-sky');
            btnProblems?.classList.remove('btn-outline-secondary');
            subProblems?.classList.remove('d-none');
            subProblems?.classList.add('d-flex');
            judgeSubmitBtn?.classList.remove('d-none');

            this.currentTemplateKey = 'problem';
            this.switchTab('problem');
            if (!this.problemsLoaded) {
                await this.loadProblems();
            }
            if (this.problemsList.length) {
                this.loadProblem(this.currentProblemId);
            }
        }
    },

    loadProblem(problemId) {
        const problem = this.problemsList.find(p => p.id === problemId) || this.problemsList[0];
        if (!problem) return;
        this.currentProblemId = problem.id;

        const select = document.getElementById('problem-select');
        if (select) select.value = problem.id;

        const diffBadge = document.getElementById('problem-difficulty-badge');
        if (diffBadge) {
            diffBadge.textContent = problem.difficulty;
            diffBadge.className = `badge small ${problem.difficulty === 'Easy' ? 'bg-success text-white' : problem.difficulty === 'Medium' ? 'bg-warning text-dark' : 'bg-danger text-white'}`;
        }
        const xpBadge = document.getElementById('problem-xp-badge');
        if (xpBadge) {
            xpBadge.textContent = problem.solved ? `Solved (+${problem.xpReward} XP)` : `+${problem.xpReward} XP`;
        }

        const key = `${problem.id}:${this.currentLang}`;
        const code = this.savedProblemCode[key] !== undefined
            ? this.savedProblemCode[key]
            : ((problem.starterCode && problem.starterCode[this.currentLang]) || '');

        this.isProgrammaticChange = true;
        if (this.editor) {
            this.editor.setValue(code);
            monaco.editor.setModelLanguage(this.editor.getModel(), this.getMonacoLanguage(this.currentLang));
            this.editor.setScrollLeft(0);
            this.editor.revealLine(1);
        }
        this.isProgrammaticChange = false;

        document.getElementById('vis-algorithm-name').textContent = problem.title;
        document.getElementById('vis-category-badge').textContent = `${problem.difficulty} • ${problem.topic}`;

        this.renderProblemPrompt(problem);
        this.resetJudgeResultsPanel();
        this.resetExecution();
        this.logConsole(`[Judge] Loaded challenge "#${problem.leetcodeId || ''} ${problem.title}" (${this.currentLang.toUpperCase()}).`);
    },

    loadProblemSkeleton() {
        const problem = this.problemsList.find(p => p.id === this.currentProblemId);
        if (!problem) return;
        const key = `${problem.id}:${this.currentLang}`;
        const skel = (problem.duelSkeletons && problem.duelSkeletons[this.currentLang])
            || (problem.starterCode && problem.starterCode[this.currentLang])
            || '';
        this.savedProblemCode[key] = skel;
        this.isProgrammaticChange = true;
        this.editor?.setValue(skel);
        this.editor?.revealLine(1);
        this.isProgrammaticChange = false;
        this.resetExecution();
        this.logConsole(`[Judge] Loaded practice skeleton for "${problem.title}" (${this.currentLang.toUpperCase()}).`);
    },

    getDefaultProblemInput(problem) {
        if (problem && Array.isArray(problem.visibleTests) && problem.visibleTests[0] && problem.visibleTests[0].input) {
            return JSON.parse(JSON.stringify(problem.visibleTests[0].input));
        }
        if (window.ProblemVisualizerEngine && typeof window.ProblemVisualizerEngine.parseSampleInput === 'function') {
            return window.ProblemVisualizerEngine.parseSampleInput(problem);
        }
        return {};
    },

    parseLiteralValue(expr, topEnv = {}) {
        const t = String(expr || '').trim();
        if (!t) return undefined;
        if (Object.prototype.hasOwnProperty.call(topEnv, t)) {
            return JSON.parse(JSON.stringify(topEnv[t]));
        }
        const norm = t
            .replace(/\bNone\b/g, 'null')
            .replace(/\bTrue\b/g, 'true')
            .replace(/\bFalse\b/g, 'false')
            .replace(/'([^']*)'/g, '"$1"');
        return JSON.parse(norm);
    },

    extractEditorInputOverride(problem, lang, rawCode) {
        if (!problem || !problem.io || !rawCode) return null;
        const params = problem.io.params || [];
        if (params.length === 0) return null;
        const fn = lang === 'python' ? problem.io.pyFn : (lang === 'javascript' ? problem.io.jsFn : null);
        if (!fn) return null;

        const lines = rawCode.split('\n');
        const topEnv = {};
        const assignRe = lang === 'python'
            ? /^([a-zA-Z_]\w*)\s*=\s*(.+)$/
            : /^(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(.+?);?\s*$/;
        for (const ln of lines) {
            const m = ln.match(assignRe);
            if (m && !/^def\s|^function\s|^class\s/.test(ln)) {
                try { topEnv[m[1]] = this.parseLiteralValue(m[2], topEnv); } catch (e) {}
            }
        }

        const isDefLine = (ln) => new RegExp(`^\\s*(?:def|function)\\s+${fn}\\b`).test(ln) || new RegExp(`^(?:const|let|var)\\s+${fn}\\s*=`).test(ln);
        for (let i = 0; i < lines.length; i++) {
            const ln = lines[i];
            if (!/^[^\s#\/]/.test(ln) || isDefLine(ln)) continue;
            const re = new RegExp(`\\b${fn}\\s*\\(`);
            const match = re.exec(ln);
            if (!match) continue;

            const rest = lines.slice(i).join('\n');
            const openIdx = match.index + match[0].length - 1;
            let depth = 0, inStr = null, endIdx = -1;
            for (let k = openIdx; k < rest.length; k++) {
                const c = rest[k];
                if (inStr) {
                    if (c === inStr && rest[k - 1] !== '\\') inStr = null;
                } else {
                    if (c === '"' || c === "'") inStr = c;
                    else if (c === '(' || c === '[' || c === '{') depth++;
                    else if (c === ')' || c === ']' || c === '}') {
                        depth--;
                        if (depth === 0 && c === ')') { endIdx = k; break; }
                    }
                }
            }
            if (endIdx <= openIdx) continue;
            const argsStr = rest.slice(openIdx + 1, endIdx).trim();
            if (!argsStr) continue;

            const args = [];
            let aDepth = 0, aStr = null, start = 0;
            for (let k = 0; k < argsStr.length; k++) {
                const c = argsStr[k];
                if (aStr) {
                    if (c === aStr && argsStr[k - 1] !== '\\') aStr = null;
                } else {
                    if (c === '"' || c === "'") aStr = c;
                    else if (c === '(' || c === '[' || c === '{') aDepth++;
                    else if (c === ')' || c === ']' || c === '}') aDepth--;
                    else if (c === ',' && aDepth === 0) {
                        args.push(argsStr.slice(start, k).trim());
                        start = k + 1;
                    }
                }
            }
            args.push(argsStr.slice(start).trim());

            const parsedObj = this.getDefaultProblemInput(problem);
            let ok = true;
            for (let pIdx = 0; pIdx < Math.min(args.length, params.length); pIdx++) {
                try {
                    parsedObj[params[pIdx].name] = this.parseLiteralValue(args[pIdx], topEnv);
                } catch (e) {
                    ok = false;
                    break;
                }
            }
            if (ok && args.length > 0) return parsedObj;
        }
        return null;
    },

    getActiveProblemInput(problem) {
        if (!problem) return {};
        if (this.customProblemInputs[problem.id]) {
            return JSON.parse(JSON.stringify(this.customProblemInputs[problem.id]));
        }
        if (this.editorMode === 'problems' && this.editor) {
            const edIn = this.extractEditorInputOverride(problem, this.currentLang, this.editor.getValue());
            if (edIn) return edIn;
        }
        return this.getDefaultProblemInput(problem);
    },

    syncVisualizerFromEditorCall() {
        if (this.editorMode !== 'problems' || !this.editor) return;
        const problem = this.problemsList.find(p => p.id === this.currentProblemId);
        if (!problem) return;
        const edIn = this.extractEditorInputOverride(problem, this.currentLang, this.editor.getValue());
        if (!edIn) return;
        this.customProblemInputs[problem.id] = edIn;
        if (this.activeViewMode === 'visualizer' && this.activeProblemVisInstance && typeof this.activeProblemVisInstance.setInput === 'function' && (this.traceSteps.length === 0 || this.visSubMode === 'walkthrough')) {
            this.activeProblemVisInstance.setInput(edIn);
        }
    },

    renderProblemVisualizer(problemObj, mountTargetEl = null) {
        const rootCanvas = document.getElementById('vis-canvas-container');
        const container = mountTargetEl || rootCanvas;
        if (!container) return;
        if (this.activeProblemVisInstance && typeof this.activeProblemVisInstance.destroy === 'function') {
            this.activeProblemVisInstance.destroy();
            this.activeProblemVisInstance = null;
        }
        const problem = problemObj || this.problemsList.find(p => p.id === this.currentProblemId);
        if (problem && window.ProblemVisualizerEngine) {
            if (rootCanvas) {
                rootCanvas.classList.remove('live-multi');
                rootCanvas.classList.add('pve-mode');
            }
            container.classList.add('pve-mode');
            const initialInput = this.getActiveProblemInput(problem);
            this.activeProblemVisInstance = window.ProblemVisualizerEngine.mount(container, problem, {
                showStudioLink: true,
                initialInput,
                onInputChange: (newIn) => {
                    this.customProblemInputs[problem.id] = newIn;
                    this.logConsole(`[Visualizer] Recomputed "${problem.title}" for input ${JSON.stringify(newIn)}.`);
                },
                onRunWithInput: (newIn) => {
                    this.customProblemInputs[problem.id] = newIn;
                    this.visSubMode = 'live';
                    this.startExecution(true, true);
                }
            });
        }
    },

    resetProblemStarter() {
        const problem = this.problemsList.find(p => p.id === this.currentProblemId);
        if (!problem) return;
        const key = `${problem.id}:${this.currentLang}`;
        delete this.savedProblemCode[key];
        const starter = (problem.starterCode && problem.starterCode[this.currentLang]) || '';
        this.isProgrammaticChange = true;
        this.editor?.setValue(starter);
        this.isProgrammaticChange = false;
        this.resetExecution();
        this.logConsole(`[Judge] Reset "${problem.title}" to starter template.`);
    },

    formatInlineBackticks(str) {
        return escapeHtml(str).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\$O\(([^$]+)\)\$/g, '<code>O($1)</code>');
    },

    renderProblemPrompt(problem) {
        const container = document.getElementById('problem-prompt-body');
        if (!container) return;
        const diffCls = problem.difficulty === 'Easy' ? 'bg-success text-white' : problem.difficulty === 'Medium' ? 'bg-warning text-dark' : 'bg-danger text-white';

        const examplesHtml = (problem.examples || []).map((ex, i) => `
            <div class="problem-example-box">
                <div class="text-info fw-bold mb-1" style="font-size:0.7rem;">Example ${i + 1}</div>
                <div><span class="text-muted">Input:</span> <span class="text-white">${escapeHtml(ex.input)}</span></div>
                <div><span class="text-muted">Output:</span> <span class="text-success fw-bold">${escapeHtml(ex.output)}</span></div>
                ${ex.explanation ? `<div class="text-muted mt-1" style="font-size:0.7rem;">${escapeHtml(ex.explanation)}</div>` : ''}
            </div>
        `).join('');

        const constraintsHtml = (problem.constraints || []).map(c => `<li><code>${escapeHtml(c)}</code></li>`).join('');

        container.innerHTML = `
            <div class="problem-card-block">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                    <h6 class="mb-0 text-white fw-bold">${problem.leetcodeId ? `<span class="text-info font-monospace me-1">#${problem.leetcodeId}</span>` : ''}${escapeHtml(problem.title)}</h6>
                    <span class="badge ${diffCls}">${escapeHtml(problem.difficulty)}</span>
                </div>
                <div class="d-flex flex-wrap gap-1 mb-2">
                    <span class="badge bg-secondary">${escapeHtml(problem.topic)}</span>
                    <span class="badge bg-info text-dark">Target: ${escapeHtml(problem.optimalTime || 'O(n)')}</span>
                    <span class="badge bg-warning text-dark">+${problem.xpReward} XP</span>
                    ${problem.solved ? '<span class="badge bg-success"><i class="bi bi-check-lg me-1"></i>Solved</span>' : ''}
                </div>
                <p class="mb-2" style="color:#e2e8f0;">${this.formatInlineBackticks(problem.description)}</p>
                <div class="small fw-bold text-info mt-3 mb-2">Examples</div>
                ${examplesHtml}
                <div class="small fw-bold text-info mt-3 mb-1">Constraints (${problem.visibleTests?.length || 3} public + ${problem.hiddenCount || 3} hidden tests)</div>
                <ul class="ps-3 mb-3 small text-muted">${constraintsHtml}</ul>
                <div class="d-flex flex-wrap gap-2">
                    <button type="button" class="btn btn-xs btn-outline-info py-1 px-2" id="btn-problem-ai-hint" style="font-size:0.74rem;">
                        <i class="bi bi-lightbulb-fill me-1"></i> Ask AlgoAI
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-primary py-1 px-2" id="btn-problem-visualize" style="font-size:0.74rem;">
                        <i class="bi bi-bar-chart-fill me-1"></i> Visualize
                    </button>
                    <a href="duel.html?problem=${encodeURIComponent(problem.id)}" class="btn btn-xs btn-outline-warning py-1 px-2" style="font-size:0.74rem;">
                        <i class="bi bi-lightning-charge-fill me-1"></i> 1v1 Duel
                    </a>
                    <button type="button" class="btn btn-xs btn-outline-success py-1 px-2" id="btn-problem-quick-submit" style="font-size:0.74rem;">
                        <i class="bi bi-check2-all me-1"></i> Submit
                    </button>
                </div>
            </div>
        `;

        container.querySelector('#btn-problem-ai-hint')?.addEventListener('click', () => {
            if (window.__algoai_instance && typeof window.__algoai_instance.askQuestion === 'function') {
                const code = this.editor ? this.editor.getValue() : '';
                window.__algoai_instance.askQuestion(
                    `Give me a concise Socratic hint (do NOT spoil the full code) for "${problem.title}" (${problem.topic}, target ${problem.optimalTime}). Here is my current ${this.currentLang} code:\n\`\`\`${this.currentLang}\n${code}\n\`\`\``
                );
            }
        });
        container.querySelector('#btn-problem-visualize')?.addEventListener('click', () => {
            this.switchViewportMode('visualizer');
            this.renderProblemVisualizer(problem);
        });
        container.querySelector('#btn-problem-quick-submit')?.addEventListener('click', () => {
            this.submitProblemSolution();
        });
    },

    resetJudgeResultsPanel() {
        const container = document.getElementById('judge-results-body');
        if (!container) return;
        container.innerHTML = `
            <div id="judge-verdict-slot">
                <div class="text-center text-muted py-4 small">
                    <i class="bi bi-check2-square fs-3 d-block mb-2 text-info"></i>
                    Click <strong>Submit &amp; Judge</strong> or <strong>Big-O Profile</strong> in the bottom bar to evaluate your code.
                </div>
            </div>
            <div id="profiler-output-slot"></div>
        `;
    },

    toPythonLiteral(val) {
        if (val === null || val === undefined) return 'None';
        if (typeof val === 'boolean') return val ? 'True' : 'False';
        if (typeof val === 'number') return Number.isFinite(val) ? String(val) : 'None';
        if (typeof val === 'string') return JSON.stringify(val);
        if (Array.isArray(val)) return '[' + val.map(v => this.toPythonLiteral(v)).join(', ') + ']';
        if (typeof val === 'object') {
            return '{' + Object.entries(val).map(([k, v]) => `${JSON.stringify(k)}: ${this.toPythonLiteral(v)}`).join(', ') + '}';
        }
        return 'None';
    },

    buildProblemDebugCode(rawCode, forceInputDriver = false) {
        const problem = this.problemsList.find(p => p.id === this.currentProblemId);
        if (!problem || !problem.io || !Array.isArray(problem.visibleTests) || !problem.visibleTests[0]) {
            return rawCode;
        }
        const io = problem.io;
        const sample = this.getActiveProblemInput(problem) || (problem.visibleTests[0].input || {});
        const params = io.params || [];
        const ret = io.returnType;
        const hasList = params.some(p => p.type === 'ListNode' || p.type === 'ListNodeCycle') || ret === 'ListNode';
        const hasTree = params.some(p => p.type === 'TreeNode') || ret === 'TreeNode';

        if (this.currentLang === 'python') {
            const fn = io.pyFn;
            const isTopCallLine = (ln) => fn && /^[^\s#]/.test(ln)
                && !new RegExp(`^def\\s+${fn}\\b`).test(ln)
                && new RegExp(`\\b${fn}\\s*\\(`).test(ln);
            const hasTopLevelCall = fn && rawCode.split('\n').some(isTopCallLine);
            if (!fn) return rawCode;
            if (!forceInputDriver && (rawCode.includes(`print(${fn}(`) || hasTopLevelCall)) return rawCode;
            const baseCode = forceInputDriver && hasTopLevelCall
                ? rawCode.split('\n').filter(ln => !isTopCallLine(ln)).join('\n')
                : rawCode;
            const lines = ['\n'];
            if (hasList && !/^\s*class\s+ListNode\b/m.test(baseCode)) {
                lines.push('class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next');
            }
            if (hasTree && !/^\s*class\s+TreeNode\b/m.test(baseCode)) {
                lines.push('class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right');
            }
            if (hasList) {
                lines.push('def _dbg_build_list(arr, pos=-1):\n    if not arr: return None\n    ns = [ListNode(v) for v in arr]\n    for i in range(len(ns) - 1): ns[i].next = ns[i + 1]\n    if pos is not None and pos >= 0 and pos < len(ns): ns[-1].next = ns[pos]\n    return ns[0]\ndef _dbg_to_list(h):\n    r, s = [], set()\n    while h and id(h) not in s and len(r) < 1000:\n        s.add(id(h)); r.append(h.val); h = h.next\n    return r');
            }
            if (hasTree) {
                lines.push('def _dbg_build_tree(arr):\n    if not arr or arr[0] is None: return None\n    root = TreeNode(arr[0]); q = [root]; i = 1\n    while q and i < len(arr):\n        n = q.pop(0)\n        if i < len(arr) and arr[i] is not None: n.left = TreeNode(arr[i]); q.append(n.left)\n        i += 1\n        if i < len(arr) and arr[i] is not None: n.right = TreeNode(arr[i]); q.append(n.right)\n        i += 1\n    return root\ndef _dbg_to_tree(root):\n    if not root: return []\n    r, q = [], [root]\n    while q:\n        n = q.pop(0)\n        if n is None: r.append(None)\n        else: r.append(n.val); q.append(n.left); q.append(n.right)\n    while r and r[-1] is None: r.pop()\n    return r');
            }
            const args = params.map(pm => {
                const pyLit = this.toPythonLiteral(sample[pm.name] ?? null);
                if (pm.type === 'char[][]') return `[list(r) for r in ${pyLit}]`;
                if (pm.type === 'ListNode') return `_dbg_build_list(${pyLit})`;
                if (pm.type === 'ListNodeCycle') return `_dbg_build_list(${pyLit}, ${Number(sample.pos ?? -1)})`;
                if (pm.type === 'TreeNode') return `_dbg_build_tree(${pyLit})`;
                return pyLit;
            });
            if (ret === 'void_arr0' || ret === 'void_char0') {
                lines.push(`_dbg_a0 = ${args[0]}`);
                lines.push(`${fn}(_dbg_a0${args.length > 1 ? ', ' + args.slice(1).join(', ') : ''})`);
                lines.push('print(_dbg_a0)');
            } else if (ret === 'ListNode') {
                lines.push(`print(_dbg_to_list(${fn}(${args.join(', ')})))`);
            } else if (ret === 'TreeNode') {
                lines.push(`print(_dbg_to_tree(${fn}(${args.join(', ')})))`);
            } else {
                lines.push(`print(${fn}(${args.join(', ')}))`);
            }
            return baseCode + lines.join('\n');
        }

        if (this.currentLang === 'javascript') {
            const fn = io.jsFn;
            const isTopCallLine = (ln) => fn && /^[^\s/]/.test(ln)
                && !new RegExp(`^(?:function\\s+${fn}|(?:const|let|var)\\s+${fn}\\s*=)`).test(ln)
                && new RegExp(`\\b${fn}\\s*\\(`).test(ln);
            const hasTopLevelCall = fn && rawCode.split('\n').some(isTopCallLine);
            if (!fn) return rawCode;
            if (!forceInputDriver && (rawCode.includes(`console.log(${fn}(`) || hasTopLevelCall)) return rawCode;
            const baseCode = forceInputDriver && hasTopLevelCall
                ? rawCode.split('\n').filter(ln => !isTopCallLine(ln)).join('\n')
                : rawCode;
            const lines = ['\n'];
            if (hasList && !/\bfunction\s+ListNode\b/.test(baseCode)) {
                lines.push('function ListNode(val, next) { this.val = (val === undefined ? 0 : val); this.next = (next === undefined ? null : next); }');
            }
            if (hasTree && !/\bfunction\s+TreeNode\b/.test(baseCode)) {
                lines.push('function TreeNode(val, left, right) { this.val = (val === undefined ? 0 : val); this.left = (left === undefined ? null : left); this.right = (right === undefined ? null : right); }');
            }
            if (hasList) {
                lines.push('function _dbgBuildList(a, pos = -1) { if (!a || !a.length) return null; const ns = a.map(v => new ListNode(v)); for (let i = 0; i < ns.length - 1; i++) ns[i].next = ns[i + 1]; if (pos >= 0 && pos < ns.length) ns[ns.length - 1].next = ns[pos]; return ns[0]; }');
                lines.push('function _dbgToList(h) { const r = [], s = new Set(); while (h && !s.has(h) && r.length < 1000) { s.add(h); r.push(h.val); h = h.next; } return r; }');
            }
            if (hasTree) {
                lines.push('function _dbgBuildTree(a) { if (!a || a[0] === null) return null; const root = new TreeNode(a[0]); const q = [root]; let i = 1; while (q.length && i < a.length) { const n = q.shift(); if (i < a.length && a[i] !== null) { n.left = new TreeNode(a[i]); q.push(n.left); } i++; if (i < a.length && a[i] !== null) { n.right = new TreeNode(a[i]); q.push(n.right); } i++; } return root; }');
                lines.push('function _dbgToTree(root) { if (!root) return []; const r = [], q = [root]; while (q.length) { const n = q.shift(); if (!n) r.push(null); else { r.push(n.val); q.push(n.left, n.right); } } while (r.length && r[r.length - 1] === null) r.pop(); return r; }');
            }
            const args = params.map(pm => {
                const jsLit = JSON.stringify(sample[pm.name] ?? null);
                if (pm.type === 'char[][]') return `(${jsLit}).map(r => Array.isArray(r) ? r : r.split(""))`;
                if (pm.type === 'ListNode') return `_dbgBuildList(${jsLit})`;
                if (pm.type === 'ListNodeCycle') return `_dbgBuildList(${jsLit}, ${Number(sample.pos ?? -1)})`;
                if (pm.type === 'TreeNode') return `_dbgBuildTree(${jsLit})`;
                return jsLit;
            });
            if (ret === 'void_arr0' || ret === 'void_char0') {
                lines.push(`const _dbgA0 = ${args[0]};`);
                lines.push(`${fn}(_dbgA0${args.length > 1 ? ', ' + args.slice(1).join(', ') : ''});`);
                lines.push('console.log(JSON.stringify(_dbgA0));');
            } else if (ret === 'ListNode') {
                lines.push(`console.log(JSON.stringify(_dbgToList(${fn}(${args.join(', ')}))));`);
            } else if (ret === 'TreeNode') {
                lines.push(`console.log(JSON.stringify(_dbgToTree(${fn}(${args.join(', ')}))));`);
            } else {
                lines.push(`console.log(JSON.stringify(${fn}(${args.join(', ')})));`);
            }
            return baseCode + lines.join('\n');
        }
        return rawCode;
    },

    async submitProblemSolution() {
        if (this.editorMode !== 'problems') {
            await this.setEditorMode('problems');
        }
        const code = this.editor ? this.editor.getValue() : '';
        if (!code.trim()) {
            this.logConsole('Editor is empty. Write your solution before submitting.', 'warn');
            return;
        }

        const btn = document.getElementById('btn-judge-submit');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> <span>Judging...</span>';
        }

        this.switchTab('judge');
        const verdictSlot = document.getElementById('judge-verdict-slot') || document.getElementById('judge-results-body');
        if (verdictSlot) {
            verdictSlot.innerHTML = `
                <div class="judge-verdict-banner wrong text-center py-4">
                    <div class="spinner-border spinner-border-sm text-info mb-2"></div>
                    <div class="small text-white fw-semibold">Running isolated visible &amp; hidden test suites...</div>
                </div>
            `;
        }

        try {
            const token = localStorage.getItem('algolearn_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/codelab/judge', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    problemId: this.currentProblemId,
                    language: this.currentLang,
                    code
                })
            });
            const data = await res.json();
            this.lastJudgeResult = data;
            this.renderJudgeVerdict(data);

            const statusBadge = document.getElementById('exec-status-badge');
            if (data.verdict === 'Accepted') {
                if (statusBadge) {
                    statusBadge.className = 'badge bg-success';
                    statusBadge.textContent = `Accepted (${data.passedCount}/${data.totalCount})`;
                }
                const prob = this.problemsList.find(p => p.id === this.currentProblemId);
                if (prob && !prob.solved) {
                    prob.solved = true;
                    this.renderProblemSelectOptions();
                    this.renderProblemPrompt(prob);
                    const xpBadge = document.getElementById('problem-xp-badge');
                    if (xpBadge) xpBadge.textContent = `Solved (+${prob.xpReward} XP)`;
                }
                if (data.gamification && data.gamification.gainedXp) {
                    this.showXpToast(`+${data.gamification.gainedXp} XP Earned! (${data.gamification.profile?.levelTitle || 'Level Up'})`);
                }
                this.logConsole(`[Judge] Accepted! Passed ${data.passedCount}/${data.totalCount} test cases in ${data.runtimeMs}ms.`, 'info');
            } else {
                if (statusBadge) {
                    statusBadge.className = 'badge bg-danger';
                    statusBadge.textContent = data.verdict || 'Failed';
                }
                this.logConsole(`[Judge] ${data.verdict}: ${data.passedCount || 0}/${data.totalCount || 0} passed.`, 'error');
            }
        } catch (err) {
            if (verdictSlot) {
                verdictSlot.innerHTML = `<div class="judge-verdict-banner error"><strong class="text-danger">Judge Error:</strong> <span class="small text-white">${escapeHtml(err.message)}</span></div>`;
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-check2-all"></i> <span>Submit &amp; Judge</span>';
            }
        }
    },

    renderJudgeVerdict(data) {
        if (!document.getElementById('judge-verdict-slot')) {
            this.resetJudgeResultsPanel();
        }
        const slot = document.getElementById('judge-verdict-slot');
        if (!slot) return;

        const isAccepted = data.verdict === 'Accepted';
        const isCompileOrRuntime = data.verdict === 'Compilation Error' || data.verdict === 'Runtime Error' || data.verdict === 'Time Limit Exceeded';
        const bannerCls = isAccepted ? 'accepted' : isCompileOrRuntime ? 'error' : 'wrong';
        const titleColor = isAccepted ? 'text-success' : isCompileOrRuntime ? 'text-danger' : 'text-warning';
        const iconCls = isAccepted ? 'bi-check-circle-fill' : isCompileOrRuntime ? 'bi-exclamation-octagon-fill' : 'bi-x-circle-fill';

        const failedTest = (data.results || []).find(r => !r.passed) || null;
        const testsHtml = (data.results || []).map(r => `
            <div class="judge-testcase-item ${r.passed ? 'pass' : 'fail'}">
                <div class="d-flex align-items-center justify-content-between mb-1">
                    <span class="fw-bold ${r.passed ? 'text-success' : 'text-danger'}">
                        <i class="bi ${r.passed ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1"></i>
                        ${escapeHtml(r.name)} ${r.hidden ? '<span class="badge bg-secondary ms-1" style="font-size:0.62rem;">Hidden</span>' : ''}
                    </span>
                    <span class="text-muted font-monospace" style="font-size:0.68rem;">${r.runtimeMs} ms</span>
                </div>
                ${r.hidden ? `<div class="text-muted small">${r.passed ? 'Hidden edge-case test passed.' : 'Hidden edge-case failed.'}</div>` : `
                    <div class="font-monospace small text-muted">In: <span class="text-white">${escapeHtml(r.inputDisplay)}</span></div>
                    <div class="font-monospace small text-muted">Expected: <span class="text-info">${escapeHtml(r.expectedDisplay)}</span> | Got: <span class="${r.passed ? 'text-success' : 'text-danger'}">${escapeHtml(r.actualDisplay)}</span></div>
                `}
            </div>
        `).join('');

        slot.innerHTML = `
            <div class="judge-verdict-banner ${bannerCls}">
                <div class="d-flex align-items-center justify-content-between mb-1">
                    <div class="fw-bold ${titleColor} fs-6">
                        <i class="bi ${iconCls} me-1"></i> ${escapeHtml(data.verdict || 'Error')}
                    </div>
                    <span class="badge bg-dark border border-secondary font-monospace">${data.runtimeMs || 0} ms</span>
                </div>
                <div class="small text-white mb-2">
                    Passed <strong>${data.passedCount || 0} / ${data.totalCount || 0}</strong> test cases (${escapeHtml((data.language || this.currentLang).toUpperCase())})
                    ${data.gamification?.gainedXp ? `<span class="badge bg-success ms-2">+${data.gamification.gainedXp} XP</span>` : ''}
                </div>
                ${data.error ? `<pre class="p-2 rounded bg-black text-danger small font-monospace mb-2" style="white-space:pre-wrap; max-height:140px; overflow:auto;">${escapeHtml(data.error)}</pre>` : ''}
                <div class="d-flex flex-wrap gap-2 mt-2">
                    <button type="button" class="btn btn-xs btn-outline-info py-1 px-2" id="btn-judge-run-profile" style="font-size:0.72rem;">
                        <i class="bi bi-graph-up-arrow me-1"></i> Measure Big-O
                    </button>
                    ${!isAccepted ? `
                        <button type="button" class="btn btn-xs btn-warning text-dark fw-bold py-1 px-2" id="btn-judge-ai-help" style="font-size:0.72rem;">
                            <i class="bi bi-stars me-1"></i> Ask AlgoAI Why It Failed
                        </button>
                    ` : `
                        <a href="dashboard.html" class="btn btn-xs btn-outline-success py-1 px-2" style="font-size:0.72rem;">
                            <i class="bi bi-trophy me-1"></i> View Progress &amp; XP
                        </a>
                    `}
                </div>
            </div>
            ${testsHtml}
        `;

        slot.querySelector('#btn-judge-run-profile')?.addEventListener('click', () => this.runComplexityProfiler());
        slot.querySelector('#btn-judge-ai-help')?.addEventListener('click', () => {
            if (window.__algoai_instance && typeof window.__algoai_instance.askQuestion === 'function') {
                const code = this.editor ? this.editor.getValue() : '';
                const failSummary = data.error
                    ? `Compiler/Runtime error:\n${data.error}`
                    : failedTest
                        ? `Failed test "${failedTest.name}": Input=${failedTest.inputDisplay}, Expected=${failedTest.expectedDisplay}, Got=${failedTest.actualDisplay}`
                        : `Verdict: ${data.verdict}`;
                window.__algoai_instance.askQuestion(
                    `My ${this.currentLang} solution for "${this.currentProblemId}" got "${data.verdict}" (${data.passedCount}/${data.totalCount} passed).\n${failSummary}\nPlease diagnose the exact bug and show me how to fix it.\n\`\`\`${this.currentLang}\n${code}\n\`\`\``
                );
            }
        });
    },

    async runComplexityProfiler() {
        const code = this.editor ? this.editor.getValue() : '';
        if (!code.trim()) {
            this.logConsole('Editor is empty. Write code before running Big-O Profiler.', 'warn');
            return;
        }

        const btn = document.getElementById('btn-profile-bigo');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> <span>Profiling...</span>';
        }

        this.switchTab('judge');
        if (!document.getElementById('profiler-output-slot')) {
            this.resetJudgeResultsPanel();
            const vSlot = document.getElementById('judge-verdict-slot');
            if (vSlot) vSlot.innerHTML = '';
        }
        const profSlot = document.getElementById('profiler-output-slot') || document.getElementById('judge-results-body');
        if (profSlot) {
            profSlot.innerHTML = `
                <div class="profiler-chart-card text-center py-3">
                    <div class="spinner-border spinner-border-sm text-info mb-2"></div>
                    <div class="small text-info fw-semibold">Benchmarking operations across scaled input sizes N...</div>
                </div>
            `;
        }

        try {
            const res = await fetch('/api/codelab/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemId: this.editorMode === 'problems' ? this.currentProblemId : null,
                    language: this.currentLang,
                    code
                })
            });
            const data = await res.json();
            this.lastProfileResult = data;

            if (!data.success) {
                profSlot.innerHTML = `<div class="profiler-chart-card text-danger small"><strong>Profiler Failed:</strong> ${escapeHtml(data.error || 'Could not execute code')}</div>`;
                return;
            }

            const svgHtml = this.renderProfilerSvg(data.points || []);
            const rowsHtml = (data.points || []).map(pt => `
                <div class="d-flex justify-content-between font-monospace" style="font-size:0.7rem; color:#cbd5e1;">
                    <span>N = ${pt.n}</span>
                    <span>${pt.ops} ops</span>
                    <span>${pt.timeMs} ms</span>
                </div>
            `).join('');

            profSlot.innerHTML = `
                <div class="profiler-chart-card">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="fw-bold text-info small"><i class="bi bi-graph-up-arrow me-1"></i> Empirical Big-O Profiler</span>
                        <span class="badge ${data.isOptimal === false ? 'bg-warning text-dark' : 'bg-info text-dark'} fw-bold">${escapeHtml(data.estimatedComplexity || 'O(n)')}</span>
                    </div>
                    <div class="d-flex justify-content-between small mb-2" style="font-size:0.72rem;">
                        <span class="text-muted">Fit R²: <strong class="text-white">${data.r2 ?? '-'}</strong></span>
                        <span class="text-muted">Optimal Target: <strong class="text-success">${escapeHtml(data.optimalTime || 'Depends')}</strong></span>
                    </div>
                    ${svgHtml}
                    <p class="small mt-2 mb-2" style="font-size:0.74rem; color:#e2e8f0;">${escapeHtml(data.advice || '')}</p>
                    <div class="p-2 rounded bg-black bg-opacity-50">${rowsHtml}</div>
                </div>
            `;
            this.logConsole(`[Profiler] Measured time complexity: ${data.estimatedComplexity} (R² = ${data.r2}).`, 'info');
        } catch (err) {
            if (profSlot) profSlot.innerHTML = `<div class="profiler-chart-card text-danger small">${escapeHtml(err.message)}</div>`;
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-graph-up-arrow"></i> <span>Big-O Profile</span>';
            }
        }
    },

    renderProfilerSvg(points) {
        if (!Array.isArray(points) || points.length === 0) return '';
        const W = 320, H = 155, padL = 32, padR = 14, padT = 14, padB = 24;
        const innerW = W - padL - padR;
        const innerH = H - padT - padB;
        const ns = points.map(p => p.n);
        const ys = points.map(p => Number(p.ops || p.timeMs || 1));
        const minN = Math.min(...ns), maxN = Math.max(...ns, minN + 1);
        const maxY = Math.max(...ys, 1);

        const toX = (n, i) => points.length === 1 ? padL + innerW / 2 : padL + (i / (points.length - 1)) * innerW;
        const toY = (val) => padT + innerH - (val / maxY) * innerH;

        // Reference curves scaled cleanly to maxY at maxN
        const buildRef = (fn, color, label) => {
            const maxRef = Math.max(fn(maxN), 1e-6);
            const ptsStr = points.map((p, i) => {
                const scaled = (fn(p.n) / maxRef) * maxY;
                return `${toX(p.n, i).toFixed(1)},${toY(scaled).toFixed(1)}`;
            }).join(' ');
            return `<polyline fill="none" stroke="${color}" stroke-width="1.3" stroke-dasharray="4 3" opacity="0.65" points="${ptsStr}" />`;
        };

        const actualPts = points.map((p, i) => `${toX(p.n, i).toFixed(1)},${toY(ys[i]).toFixed(1)}`).join(' ');
        const circles = points.map((p, i) => `<circle cx="${toX(p.n, i).toFixed(1)}" cy="${toY(ys[i]).toFixed(1)}" r="3.6" fill="#38bdf8" stroke="#ffffff" stroke-width="1.2" />`).join('');

        return `
            <svg class="profiler-svg" viewBox="0 0 ${W} ${H}" aria-label="Empirical complexity growth chart">
                <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H - padB}" stroke="#475569" stroke-width="1" />
                <line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="#475569" stroke-width="1" />
                ${buildRef(n => Math.log2(Math.max(2, n)), '#10b981', 'O(log n)')}
                ${buildRef(n => n, '#f59e0b', 'O(n)')}
                ${buildRef(n => n * n, '#ef4444', 'O(n^2)')}
                <polyline fill="none" stroke="#38bdf8" stroke-width="2.5" points="${actualPts}" />
                ${circles}
                <text x="${padL}" y="${H - 6}" fill="#94a3b8" font-size="9" font-family="monospace">N=${minN}</text>
                <text x="${W - padR}" y="${H - 6}" fill="#94a3b8" font-size="9" font-family="monospace" text-anchor="end">N=${maxN}</text>
                <text x="4" y="${padT + 8}" fill="#94a3b8" font-size="9" font-family="monospace">Ops</text>
            </svg>
            <div class="d-flex justify-content-center gap-3 mt-1" style="font-size:0.65rem; color:#94a3b8;">
                <span><span style="color:#38bdf8;">&#9679;</span> Your Code</span>
                <span><span style="color:#10b981;">--</span> O(log n)</span>
                <span><span style="color:#f59e0b;">--</span> O(n)</span>
                <span><span style="color:#ef4444;">--</span> O(n²)</span>
            </div>
        `;
    },

    showXpToast(msg) {
        const existing = document.querySelector('.codelab-xp-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'codelab-xp-toast';
        toast.innerHTML = `<i class="bi bi-stars fs-5"></i><span>${escapeHtml(msg)}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4200);
    },

    loadPredefinedAlgorithm(algoKey) {
        this.currentTemplateKey = algoKey;
        const template = CodeLabTemplates[algoKey];
        if (!template) return;

        let code = template.code[this.currentLang];
        if (!code && this.currentLang === 'c') {
            code = template.code.cpp;
        }
        if (!code) {
            code = template.code.python || template.code.javascript || '';
        }

        this.isProgrammaticChange = true;
        if (this.editor) {
            this.editor.setValue(code);
            monaco.editor.setModelLanguage(this.editor.getModel(), this.getMonacoLanguage(this.currentLang));
            this.editor.setScrollLeft(0);
            this.editor.revealLine(1);
        }
        this.isProgrammaticChange = false;

        const pill = document.getElementById('predefined-lang-pill');
        if (pill) {
            pill.textContent = `${this.currentLang.toUpperCase()} Code`;
        }

        document.getElementById('vis-algorithm-name').textContent = template.name;
        document.getElementById('vis-category-badge').textContent = template.category;

        this.resetExecution();
        this.logConsole(`Loaded predefined algorithm: ${template.name} in ${this.currentLang.toUpperCase()}`);
    },

    resetToStarterCode() {
        const starter = CodeLabTemplates.custom?.code[this.currentLang] || '';
        this.isProgrammaticChange = true;
        this.editor?.setValue(starter);
        this.isProgrammaticChange = false;
        this.savedCustomCode[this.currentLang] = starter;
        this.resetExecution();
        this.logConsole(`Reset to standard ${this.currentLang.toUpperCase()} starter template`);
    },

    clearEditor() {
        this.isProgrammaticChange = true;
        this.editor?.setValue('');
        this.isProgrammaticChange = false;
        this.resetExecution();
        this.logConsole("Editor cleared.");
    },

    setLanguage(lang) {
        this.currentLang = lang;
        if (this.editor) {
            monaco.editor.setModelLanguage(this.editor.getModel(), this.getMonacoLanguage(lang));
        }

        const pill = document.getElementById('predefined-lang-pill');
        if (pill) {
            pill.textContent = `${lang.toUpperCase()} Code`;
        }

        if (this.editorMode === 'predefined') {
            const algoSelect = document.getElementById('predefined-algo-select');
            const algoKey = algoSelect ? algoSelect.value : 'bubble';
            this.loadPredefinedAlgorithm(algoKey);
        } else if (this.editorMode === 'problems') {
            this.loadProblem(this.currentProblemId);
        } else {
            const saved = this.savedCustomCode[lang];
            this.isProgrammaticChange = true;
            if (saved) {
                this.editor?.setValue(saved);
            } else {
                const starter = CodeLabTemplates.custom?.code[lang] || '';
                this.editor?.setValue(starter);
            }
            if (this.editor) {
                this.editor.setScrollLeft(0);
                this.editor.revealLine(1);
            }
            this.isProgrammaticChange = false;
        }

        this.resetExecution();
        this.logConsole(`Switched language to: ${lang.toUpperCase()}`);
    },

    switchViewportMode(mode) {
        this.activeViewMode = mode;
        const stateBtn = document.getElementById('btn-view-state');
        const visBtn = document.getElementById('btn-view-visualizer');
        const stateContainer = document.getElementById('vis-live-state-container');
        const visContainer = document.getElementById('vis-canvas-container');

        if (mode === 'state') {
            if (this.activeProblemVisInstance && typeof this.activeProblemVisInstance.destroy === 'function') {
                this.activeProblemVisInstance.destroy();
                this.activeProblemVisInstance = null;
            }
            stateBtn?.classList.add('active');
            visBtn?.classList.remove('active');
            stateContainer?.classList.remove('d-none');
            visContainer?.classList.add('d-none');
        } else {
            visBtn?.classList.add('active');
            stateBtn?.classList.remove('active');
            visContainer?.classList.remove('d-none');
            stateContainer?.classList.add('d-none');
            if (this.traceSteps.length > 0 && this.currentStepIndex < this.traceSteps.length) {
                this.renderVisualizationCanvas(this.traceSteps[this.currentStepIndex]);
            } else if (this.editorMode === 'problems') {
                this.renderProblemVisualizer();
            }
        }
    },

    // ==========================================
    // 5. Universal Debugger Execution Engine
    // ==========================================
    async startExecution(debugMode = false, forceInputDriver = false) {
        const rawCode = this.editor ? this.editor.getValue() : '';
        if (!rawCode.trim()) {
            this.logConsole("Editor is empty. Write or paste code to debug.", "warn");
            return;
        }

        this.visSubMode = 'live';
        if (this.activeProblemVisInstance && typeof this.activeProblemVisInstance.destroy === 'function') {
            this.activeProblemVisInstance.destroy();
            this.activeProblemVisInstance = null;
        }

        let code = rawCode;
        if (this.editorMode === 'problems') {
            code = this.buildProblemDebugCode(rawCode, forceInputDriver);
            if (code !== rawCode) {
                const prob = this.problemsList.find(p => p.id === this.currentProblemId);
                const activeIn = this.getActiveProblemInput(prob);
                this.logConsole(`[Debugger] Appended driver call for ${this.currentProblemId} with input ${JSON.stringify(activeIn)}.`);
            } else if (['java', 'cpp', 'c'].includes(this.currentLang)) {
                this.logConsole(`[Judge Note] Use "Submit & Judge" to run the multi-test harness for ${this.currentLang.toUpperCase()}.`, 'info');
            }
        }

        this.hideErrorCard();
        this.clearErrorHighlights();
        this.logConsole(`[Debugger] Initializing containerized execution trace for ${this.currentLang.toUpperCase()}...`);

        // Update UI status badge
        const badge = document.getElementById('exec-status-badge');
        badge.className = 'badge bg-primary';
        badge.textContent = 'Tracing...';

        try {
            const result = await CodeLabTracer.trace(code, this.currentLang, Array.from(this.breakpoints));

            if (!result.success) {
                const err = result.error || {};
                const errLine = err.line || 1;
                this.logConsole(`Compilation / Execution Error [${err.type || 'Error'}]: ${err.message}`, 'error');
                if (result.stderr) {
                    this.logConsole(result.stderr, 'error');
                }

                badge.className = 'badge bg-danger';
                badge.textContent = `Error L${errLine}`;
                this.highlightErrorLine(errLine);

                // Show prominent Error Notification Card in center viewport
                this.showErrorCard({
                    title: err.type === 'CompilationError' ? 'Compilation Failed' : 'Runtime / Execution Error',
                    subtitle: `Check line ${errLine} in your ${this.currentLang.toUpperCase()} code`,
                    type: err.type || 'ExecutionError',
                    line: errLine,
                    column: err.column,
                    message: err.message || result.stderr || 'Execution failed',
                    rawStderr: result.stderr,
                    language: this.currentLang
                });
                return;
            }

            this.traceSteps = result.trace || [];
            this.currentStepIndex = 0;
            this.lastVariablesState = {};

            if (this.traceSteps.length === 0) {
                this.logConsole("Program executed successfully but produced 0 trace steps.", "warn");
                if (result.stdout) this.logConsole(result.stdout, 'log');
                badge.className = 'badge bg-info text-dark';
                badge.textContent = 'Completed (0 steps)';
                return;
            }

            this.logConsole(`[Debugger] Generated ${this.traceSteps.length} live execution steps in isolated Docker sandbox.`);
            this.enablePlaybackControls(true);

            if (result.hasRuntimeError && result.error) {
                this.logConsole(`[Runtime Notice] Program encounters ${result.error.type}: ${result.error.message} at line ${result.error.line}. Debugging up to crash point.`, 'warn');
            }

            if (debugMode) {
                // Pause at step 0 (or first breakpoint)
                this.pause();
                this.renderStep(this.traceSteps[0]);
                badge.className = 'badge bg-warning text-dark';
                badge.textContent = 'Paused (Debug)';
                this.switchTab('vars');
            } else {
                // Continuous playback
                this.play();
                this.switchTab('vars');
            }
        } catch (err) {
            this.logConsole("Debugging invocation failed: " + err.message, "error");
            badge.className = 'badge bg-danger';
            badge.textContent = 'System Error';
            this.showErrorCard({
                title: 'Debugger Service Error',
                subtitle: 'Failed to communicate with execution sandbox',
                type: 'ServiceError',
                line: 1,
                message: err.message,
                language: this.currentLang
            });
        }
    },

    switchTab(target) {
        document.querySelectorAll('.codelab-tab-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-target') === target);
        });
        document.querySelectorAll('.codelab-tab-content').forEach(sec => {
            sec.classList.add('d-none');
        });
        document.getElementById(`deck-section-${target}`)?.classList.remove('d-none');
    },

    play() {
        this.isPlaying = true;
        document.getElementById('btn-run')?.classList.add('d-none');
        document.getElementById('btn-pause')?.classList.remove('d-none');

        const badge = document.getElementById('exec-status-badge');
        badge.className = 'badge bg-success';
        badge.textContent = 'Running';

        if (this.playInterval) clearInterval(this.playInterval);

        this.playInterval = setInterval(() => {
            if (this.currentStepIndex >= this.traceSteps.length - 1) {
                this.pause();
                badge.className = 'badge bg-info text-dark';
                badge.textContent = 'Completed';
                this.logConsole("Execution complete.", "info");
                return;
            }

            this.currentStepIndex++;
            const step = this.traceSteps[this.currentStepIndex];

            // Breakpoint hit check
            if (this.breakpoints.has(step.line)) {
                this.pause();
                this.renderStep(step);
                badge.className = 'badge bg-warning text-dark';
                badge.textContent = `Breakpoint (L${step.line})`;
                this.logConsole(`Hit breakpoint at line ${step.line}`);
                return;
            }

            this.renderStep(step);
        }, this.stepDelay);
    },

    pause() {
        this.isPlaying = false;
        if (this.playInterval) clearInterval(this.playInterval);
        document.getElementById('btn-run')?.classList.remove('d-none');
        document.getElementById('btn-pause')?.classList.add('d-none');
        const badge = document.getElementById('exec-status-badge');
        badge.className = 'badge bg-warning text-dark';
        badge.textContent = 'Paused';
    },

    stepOver() {
        this.pause();
        if (this.currentStepIndex >= this.traceSteps.length - 1) return;

        const currentStep = this.traceSteps[this.currentStepIndex];
        const currentDepth = (currentStep && currentStep.callStack) ? currentStep.callStack.length : 0;

        // Step to next step that is at the same depth or higher
        let targetIndex = this.currentStepIndex + 1;
        while (targetIndex < this.traceSteps.length - 1) {
            const nextStep = this.traceSteps[targetIndex];
            const nextDepth = (nextStep && nextStep.callStack) ? nextStep.callStack.length : 0;
            if (nextDepth <= currentDepth) {
                break;
            }
            targetIndex++;
        }

        this.currentStepIndex = targetIndex;
        this.renderStep(this.traceSteps[this.currentStepIndex]);
    },

    stepInto() {
        this.pause();
        if (this.currentStepIndex < this.traceSteps.length - 1) {
            this.currentStepIndex++;
            this.renderStep(this.traceSteps[this.currentStepIndex]);
        }
    },

    stepOut() {
        this.pause();
        if (this.currentStepIndex >= this.traceSteps.length - 1) return;

        const currentStep = this.traceSteps[this.currentStepIndex];
        const currentDepth = (currentStep && currentStep.callStack) ? currentStep.callStack.length : 1;

        let targetIndex = this.currentStepIndex + 1;
        while (targetIndex < this.traceSteps.length - 1) {
            const nextStep = this.traceSteps[targetIndex];
            const nextDepth = (nextStep && nextStep.callStack) ? nextStep.callStack.length : 0;
            if (nextDepth < currentDepth) {
                break;
            }
            targetIndex++;
        }

        this.currentStepIndex = targetIndex;
        this.renderStep(this.traceSteps[this.currentStepIndex]);
    },

    continueExecution() {
        this.play();
    },

    stop() {
        this.pause();
        this.currentStepIndex = 0;
        this.refreshDecorations();
        const badge = document.getElementById('exec-status-badge');
        badge.className = 'badge bg-secondary';
        badge.textContent = 'Stopped';
    },

    resetExecution() {
        this.stop();
        this.clearErrorHighlights();
        this.hideErrorCard();
        this.traceSteps = [];
        this.currentStepIndex = 0;
        this.visSubMode = 'live';
        if (this.activeProblemVisInstance && typeof this.activeProblemVisInstance.destroy === 'function') {
            this.activeProblemVisInstance.destroy();
            this.activeProblemVisInstance = null;
        }
        this.lastVariablesState = {};
        this.enablePlaybackControls(false);
        this.refreshDecorations();

        document.getElementById('step-counter').textContent = 'Step 0 / 0';
        const badge = document.getElementById('exec-status-badge');
        badge.className = 'badge bg-secondary';
        badge.textContent = 'Ready';

        document.getElementById('state-event-badge').textContent = 'IDLE';
        document.getElementById('state-func-name').textContent = 'None';
        document.getElementById('state-line-badge').textContent = 'Line -';
        document.getElementById('state-current-desc').innerHTML = 'Click <strong>Run Code</strong> or <strong>Debug</strong> to start live execution tracing.';
        document.getElementById('variables-body').innerHTML = '<tr><td colspan="3" class="text-muted text-center py-2">No active variables</td></tr>';
        document.getElementById('call-stack-list').innerHTML = '<li class="call-stack-item active"><span>global</span><span class="badge bg-secondary">depth 0</span></li>';

        this.renderInitialMemoryPreview();
        this.renderInitialPreview(this.currentTemplateKey);
    },

    enablePlaybackControls(enabled) {
        ['btn-step-over', 'btn-step-into', 'btn-step-out', 'btn-continue', 'btn-stop'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = !enabled;
        });
    },

    // ==========================================
    // 5. Live State & Panels Synchronization
    // ==========================================
    renderStep(step) {
        if (!step) return;

        // 1. Update Step Counter & Badges
        document.getElementById('step-counter').textContent = `Step ${this.currentStepIndex + 1} / ${this.traceSteps.length}`;
        document.getElementById('vis-step-desc').textContent = step.description;

        // 2. Update Live State Inspector Card
        document.getElementById('state-event-badge').textContent = (step.eventType || 'STEP').toUpperCase();
        document.getElementById('state-func-name').textContent = step.function || 'global';
        document.getElementById('state-line-badge').textContent = `Line ${step.line || '-'}`;
        document.getElementById('state-current-desc').textContent = step.description || `Executing line ${step.line}`;

        // 3. Highlight Monaco Editor Line
        this.refreshDecorations();

        // 4. Update Variables Inspector (with change detection)
        this.renderVariablesTable(step.variables || {}, step.variableTypes || {});

        // 5. Update Call Stack Inspector
        this.renderCallStack(step.callStack || []);

        // 6. Update Watch Expressions
        this.updateWatches(step.variables || {});

        // 7. Stream Console Log Output
        if (step.output) {
            this.logConsole(step.output, 'log');
        }

        // 8. Render Dynamic Memory State & Algorithm Visualizer Canvas
        this.renderDynamicMemoryDisplay(step);
        this.renderVisualizationCanvas(step);
    },

    renderVariablesTable(variables, variableTypes = {}) {
        const tbody = document.getElementById('variables-body');
        if (!tbody) return;

        const entries = Object.entries(variables);
        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-muted text-center py-2">No variables in scope</td></tr>';
            return;
        }

        let html = '';
        for (let [name, val] of entries) {
            const type = variableTypes[name] || (Array.isArray(val) ? `Array[${val.length}]` : typeof val);
            const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
            const isUpdated = this.lastVariablesState[name] !== undefined && this.lastVariablesState[name] !== strVal;

            html += `
                <tr class="${isUpdated ? 'var-updated' : ''}">
                    <td class="fw-bold text-sky-400 font-monospace">${name}</td>
                    <td><span class="var-type-badge">${type}</span></td>
                    <td class="font-monospace text-truncate" style="max-width: 140px;" title="${strVal}">${strVal}</td>
                </tr>
            `;
            this.lastVariablesState[name] = strVal;
        }
        tbody.innerHTML = html;
    },

    renderCallStack(stack) {
        const list = document.getElementById('call-stack-list');
        if (!list) return;

        if (stack.length === 0) {
            list.innerHTML = '<li class="call-stack-item active"><span>global</span><span class="badge bg-secondary">depth 0</span></li>';
            return;
        }

        let html = '';
        for (let i = stack.length - 1; i >= 0; i--) {
            const frame = stack[i];
            const isActive = (i === stack.length - 1);
            html += `
                <li class="call-stack-item ${isActive ? 'active' : ''}" style="cursor: pointer;" onclick="CodeLabApp.revealSourceLine(${frame.line})">
                    <div>
                        <i class="bi bi-layers-fill text-sky-600 me-2"></i>
                        <strong>${frame.name}()</strong>
                        <span class="text-muted small ms-1">:L${frame.line}</span>
                    </div>
                    <span class="badge ${isActive ? 'bg-primary' : 'bg-secondary'}">depth ${frame.depth}</span>
                </li>
            `;
        }
        list.innerHTML = html;
    },

    revealSourceLine(line) {
        if (this.editor && line > 0) {
            this.editor.revealLineInCenter(line);
            this.editor.setPosition({ lineNumber: line, column: 1 });
        }
    },

    detectLinkedList(vars) {
        if (!vars || typeof vars !== 'object') return null;

        const candidateKeys = ['head', 'reversed', 'list', 'curr', 'node', 'first', 'l1', 'l2', 'tail'];
        const allKeys = Object.keys(vars);
        const orderedKeys = [...candidateKeys.filter(c => vars[c]), ...allKeys.filter(k => !candidateKeys.includes(k))];

        for (const k of orderedKeys) {
            const val = vars[k];
            if (!val || typeof val !== 'object' || Array.isArray(val)) continue;

            // Exclude TreeNode objects from LinkedList detector
            if (val.__type__ === 'TreeNode' || ('left' in val && 'right' in val)) continue;

            const isList = val.__type__ === 'ListNode' || ('next' in val && ('val' in val || 'value' in val || 'data' in val));
            if (!isList) continue;

            const nodes = [];
            let curr = val;
            const seen = new Set();

            while (curr && typeof curr === 'object' && !Array.isArray(curr) && nodes.length < 25) {
                if (seen.has(curr)) {
                    nodes.push({ val: 'CYCLE', isCycle: true });
                    break;
                }
                seen.add(curr);

                const nodeVal = ('val' in curr) ? curr.val :
                               (('value' in curr) ? curr.value :
                               (('data' in curr) ? curr.data : JSON.stringify(curr)));
                nodes.push({ val: nodeVal });

                if ('next' in curr && typeof curr.next === 'string' && /circular/i.test(curr.next)) {
                    nodes.push({ val: 'CYCLE', isCycle: true });
                    break;
                }
                if ('next' in curr && curr.next) {
                    curr = curr.next;
                } else {
                    break;
                }
            }

            if (nodes.length > 0) {
                return { varName: k, nodes };
            }
        }
        return null;
    },

    renderLinkedListHtml(llData) {
        let html = '<div class="live-section-box">';
        html += `<div class="live-section-hdr"><span><i class="bi bi-link-45deg text-sky-400 me-1"></i> Linked List: <strong class="text-white">${escapeHtml(llData.varName)}</strong></span><span>${llData.nodes.length} nodes</span></div>`;
        html += '<div class="vis-nodes-list py-2">';
        llData.nodes.forEach((n, idx) => {
            const valStr = typeof n.val === 'object' ? JSON.stringify(n.val) : String(n.val);
            html += `
                <div class="vis-node-box ${n.isCycle ? 'border-danger text-danger' : ''}">
                    <span class="badge bg-primary bg-opacity-75 me-1" style="font-size:0.65rem;">node</span>
                    <span>${escapeHtml(valStr)}</span>
                </div>
            `;
            if (idx < llData.nodes.length - 1) {
                html += '<i class="bi bi-arrow-right vis-node-arrow"></i>';
            }
        });
        html += '<i class="bi bi-arrow-right vis-node-arrow"></i>';
        html += '<span class="badge bg-dark border border-secondary text-muted font-monospace py-2 px-3">null</span>';
        html += '</div></div>';
        return html;
    },

    detectBinaryTree(vars) {
        if (!vars || typeof vars !== 'object') return null;

        const candidateKeys = ['root', 'tree', 'subRoot', 'p', 'q', 't1', 't2', 'node', 'curr'];
        const allKeys = Object.keys(vars);
        const orderedKeys = [...candidateKeys.filter(c => vars[c]), ...allKeys.filter(k => !candidateKeys.includes(k))];

        for (const k of orderedKeys) {
            const val = vars[k];
            if (!val || typeof val !== 'object' || Array.isArray(val)) continue;
            const isTree = val.__type__ === 'TreeNode' || (('left' in val && 'right' in val) && ('val' in val || 'value' in val || 'data' in val));
            if (!isTree) continue;

            const heap = [];
            const q = [{ node: val, idx: 0 }];
            const seen = new Set();
            let nodeCount = 0;

            while (q.length > 0 && nodeCount < 31) {
                const { node, idx } = q.shift();
                if (!node || typeof node !== 'object' || seen.has(node) || idx >= 15) continue;
                seen.add(node);
                const nVal = ('val' in node) ? node.val : (('value' in node) ? node.value : (('data' in node) ? node.data : '?'));
                heap[idx] = nVal;
                nodeCount++;
                if (node.left && typeof node.left === 'object') q.push({ node: node.left, idx: 2 * idx + 1 });
                if (node.right && typeof node.right === 'object') q.push({ node: node.right, idx: 2 * idx + 2 });
            }

            if (nodeCount > 0) {
                return { varName: k, heap, nodeCount };
            }
        }
        return null;
    },

    renderBinaryTreeHtml(treeData) {
        const heap = treeData.heap || [];
        let maxIdx = 0;
        for (let i = 0; i < heap.length; i++) {
            if (heap[i] !== undefined && heap[i] !== null) maxIdx = i;
        }
        const depth = Math.floor(Math.log2(Math.max(1, maxIdx + 1)));
        const W = 440;
        const H = Math.max(120, (depth + 1) * 48 + 18);

        const posOf = (idx) => {
            const lvl = Math.floor(Math.log2(idx + 1));
            const pos = idx - (Math.pow(2, lvl) - 1);
            const cols = Math.pow(2, lvl);
            return {
                x: (W / cols) * (pos + 0.5),
                y: 26 + lvl * 46
            };
        };

        let edgesSvg = '';
        let nodesSvg = '';
        for (let i = 0; i < heap.length; i++) {
            if (heap[i] === undefined || heap[i] === null) continue;
            const p = posOf(i);
            const leftIdx = 2 * i + 1;
            const rightIdx = 2 * i + 2;
            if (leftIdx < heap.length && heap[leftIdx] !== undefined && heap[leftIdx] !== null) {
                const c = posOf(leftIdx);
                edgesSvg += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${c.x.toFixed(1)}" y2="${c.y.toFixed(1)}" stroke="#475569" stroke-width="1.8" />`;
            }
            if (rightIdx < heap.length && heap[rightIdx] !== undefined && heap[rightIdx] !== null) {
                const c = posOf(rightIdx);
                edgesSvg += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${c.x.toFixed(1)}" y2="${c.y.toFixed(1)}" stroke="#475569" stroke-width="1.8" />`;
            }
            const label = escapeHtml(String(heap[i]).slice(0, 6));
            nodesSvg += `
                <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="15" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
                <text x="${p.x.toFixed(1)}" y="${(p.y + 4).toFixed(1)}" fill="#f8fafc" font-size="11" font-weight="700" font-family="JetBrains Mono, monospace" text-anchor="middle">${label}</text>
            `;
        }

        return `
            <div class="live-section-box">
                <div class="live-section-hdr">
                    <span><i class="bi bi-diagram-3 text-sky-400 me-1"></i> Binary Tree: <strong class="text-white">${escapeHtml(treeData.varName)}</strong></span>
                    <span>${treeData.nodeCount} nodes</span>
                </div>
                <div class="d-flex justify-content-center w-100 overflow-auto">
                    <svg viewBox="0 0 ${W} ${H}" style="width:100%; max-width:440px; height:${H}px;">
                        ${edgesSvg}
                        ${nodesSvg}
                    </svg>
                </div>
            </div>
        `;
    },

    renderScalarsStrip(step) {
        const list = Array.isArray(step.scalars) ? step.scalars : [];
        const visible = list.filter(s => s && s.name !== '_dbg_a0');
        if (visible.length === 0) return '';

        const pills = visible.slice(0, 14).map(sc => {
            const isRet = sc.name === '<return>';
            const label = isRet ? 'return' : sc.name;
            const curStr = sc.value === null ? 'null' : (typeof sc.value === 'object' ? JSON.stringify(sc.value) : String(sc.value));
            const prevStr = sc.prevValue === null ? 'null' : (sc.prevValue !== undefined ? (typeof sc.prevValue === 'object' ? JSON.stringify(sc.prevValue) : String(sc.prevValue)) : '');
            const hasDiff = sc.changed && sc.prevValue !== undefined && prevStr !== curStr && !isRet;
            return `
                <span class="live-scalar-pill ${sc.changed ? 'changed' : ''}">
                    <span class="${isRet ? 'text-success' : 'text-sky-400'} fw-bold">${escapeHtml(label)}</span>
                    <span class="text-muted">=</span>
                    ${hasDiff
                        ? `<span class="live-delta-tag">${escapeHtml(prevStr)} → ${escapeHtml(curStr)}</span>`
                        : `<strong class="text-white">${escapeHtml(curStr)}</strong>`}
                </span>
            `;
        }).join('');

        return `<div class="live-scalars-strip">${pills}</div>`;
    },

    renderMatrix2DHtml(matObj, scalarInts = {}) {
        const rows = Array.isArray(matObj.rows) ? matObj.rows : [];
        if (rows.length === 0) return '';
        const maxRows = Math.min(rows.length, 14);
        const fullCols = Math.max(...rows.map(r => (Array.isArray(r) ? r.length : 0)), 0);
        const maxCols = Math.min(fullCols, 14);
        if (maxCols === 0) return '';

        const changedSet = new Set(matObj.changedCells || []);

        // Detect active (row, col) coordinates from loop scalar variables (e.g., dp[l][r] or grid[r][c])
        let activeRow = -1;
        let activeCol = -1;
        if (scalarInts.row !== undefined || scalarInts.col !== undefined || scalarInts.c !== undefined) {
            activeRow = scalarInts.row ?? scalarInts.r ?? scalarInts.i ?? -1;
            activeCol = scalarInts.col ?? scalarInts.c ?? scalarInts.j ?? -1;
        } else if (scalarInts.l !== undefined && scalarInts.r !== undefined) {
            activeRow = scalarInts.l;
            activeCol = scalarInts.r;
        } else {
            activeRow = scalarInts.i ?? scalarInts.r ?? -1;
            activeCol = scalarInts.j ?? scalarInts.k ?? -1;
        }
        if (activeRow < 0 || activeRow >= rows.length) activeRow = -1;
        if (activeCol < 0 || activeCol >= fullCols) activeCol = -1;

        let thead = '<tr><th class="live-matrix-hdr"></th>';
        for (let c = 0; c < maxCols; c++) {
            thead += `<th class="live-matrix-hdr ${c === activeCol ? 'col-active' : ''}">${c}</th>`;
        }
        if (fullCols > maxCols) thead += `<th class="live-matrix-hdr">+${fullCols - maxCols}</th>`;
        thead += '</tr>';

        let tbody = '';
        for (let r = 0; r < maxRows; r++) {
            const row = Array.isArray(rows[r]) ? rows[r] : [];
            tbody += `<tr><th class="live-matrix-hdr ${r === activeRow ? 'row-active' : ''}">${r}</th>`;
            for (let c = 0; c < maxCols; c++) {
                const cellVal = c < row.length ? row[c] : '';
                const key = `${r},${c}`;
                const isChanged = changedSet.has(key);
                const isCursor = !isChanged && r === activeRow && c === activeCol;
                const isNonZero = cellVal !== 0 && cellVal !== '0' && cellVal !== false && cellVal !== null && cellVal !== '' && cellVal !== '.';

                const cls = ['live-matrix-cell'];
                if (isChanged) cls.push('cell-changed');
                else if (isCursor) cls.push('cell-cursor');
                else if (isNonZero) cls.push('nonzero');

                let disp = cellVal === null ? '·' : (cellVal === true ? 'T' : (cellVal === false ? 'F' : String(cellVal)));
                if (disp.length > 6) disp = disp.slice(0, 5) + '…';

                const prevVal = matObj.prevRows?.[r]?.[c];
                const title = isChanged && prevVal !== undefined ? ` title="Previous: ${escapeHtml(String(prevVal))}"` : '';
                tbody += `<td class="${cls.join(' ')}"${title}>${escapeHtml(disp)}</td>`;
            }
            if (fullCols > maxCols) tbody += `<td class="live-matrix-cell text-muted">…</td>`;
            tbody += '</tr>';
        }

        const truncNote = (rows.length > maxRows || fullCols > maxCols) ? ` (showing ${maxRows}×${maxCols})` : '';
        return `
            <div class="live-section-box">
                <div class="live-section-hdr">
                    <span><i class="bi bi-grid-3x3-gap text-sky-400 me-1"></i> Matrix / DP: <strong class="text-white">${escapeHtml(matObj.name)}</strong> <span class="text-muted">[${rows.length}×${fullCols}]${truncNote}</span></span>
                    ${changedSet.size > 0 ? '<span class="badge bg-warning text-dark">Cell Updated</span>' : (activeRow >= 0 && activeCol >= 0 ? `<span class="text-info">[${activeRow}][${activeCol}]</span>` : '')}
                </div>
                <div class="live-matrix-scroll">
                    <table class="live-matrix-table">
                        <thead>${thead}</thead>
                        <tbody>${tbody}</tbody>
                    </table>
                </div>
            </div>
        `;
    },

    render1DArraySectionHtml(arrObj, pointers = {}, activeIdxs = [], stepEventType = 'step', compact = false) {
        const vals = Array.isArray(arrObj.values) ? arrObj.values : [];
        if (vals.length === 0) return '';
        const changedSet = new Set(arrObj.changedIndices || []);
        const activeSet = new Set(activeIdxs || []);
        const maxShow = Math.min(vals.length, 24);
        const truncNote = vals.length > maxShow ? ` (showing ${maxShow})` : '';

        // Compact box strip (used for secondary arrays or non-numeric / large arrays / alongside 2D matrix)
        if (compact || !arrObj.isNumeric || vals.length > 18) {
            let cells = '';
            for (let idx = 0; idx < maxShow; idx++) {
                const v = vals[idx];
                const isMut = changedSet.has(idx);
                const matchingPtrs = [];
                if (!compact) {
                    for (const [pName, pIdx] of Object.entries(pointers)) {
                        if (pIdx === idx) matchingPtrs.push(pName);
                    }
                }
                const isActive = matchingPtrs.length > 0 || activeSet.has(idx);
                const ptrHtml = matchingPtrs.length > 0 ? `<span class="vis-pointer-marker">${escapeHtml(matchingPtrs.join(','))}</span>` : '';
                const disp = v === null ? 'null' : (typeof v === 'object' ? JSON.stringify(v) : String(v));
                const boxStyle = (!isMut && isActive) ? ' style="border-color:#f59e0b; background:rgba(245,158,11,0.14);"' : '';
                const prev = arrObj.prevValues?.[idx];
                const titleAttr = (isMut && prev !== undefined) ? ` title="Was: ${escapeHtml(String(prev))}"` : '';
                cells += `
                    <div class="d-flex flex-column align-items-center">
                        <div class="live-cell-box ${isMut ? 'mutated' : ''}"${boxStyle}${titleAttr}>
                            ${ptrHtml}
                            ${escapeHtml(disp.length > 10 ? disp.slice(0, 9) + '…' : disp)}
                        </div>
                        <span class="vis-bar-idx">[${idx}]</span>
                    </div>
                `;
            }
            return `
                <div class="live-section-box">
                    <div class="live-section-hdr">
                        <span><i class="bi bi-list-ol text-sky-400 me-1"></i> Array: <strong class="text-white">${escapeHtml(arrObj.name)}</strong> <span class="text-muted">[${vals.length}]${truncNote}</span></span>
                        ${arrObj.changed ? '<span class="badge bg-warning text-dark">Updated</span>' : ''}
                    </div>
                    <div class="live-cell-row">${cells}</div>
                </div>
            `;
        }

        // Bar visualizer (handles both positive & negative numbers cleanly)
        const numVals = vals.slice(0, maxShow).map(x => (typeof x === 'number' && !Number.isNaN(x)) ? x : 0);
        const minVal = Math.min(...numVals, 0);
        const maxVal = Math.max(...numVals, 1);
        const span = Math.max(maxVal - minVal, 1);

        let barsHtml = '';
        for (let i = 0; i < maxShow; i++) {
            const val = vals[i];
            const num = numVals[i];
            const barH = Math.max(22, Math.round(((num - minVal) / span) * 115) + 20);
            const matchingPtrs = [];
            for (const [pName, pIdx] of Object.entries(pointers)) {
                if (pIdx === i) matchingPtrs.push(pName);
            }
            const isMut = changedSet.has(i);
            const isAct = activeSet.has(i);
            let barClass = 'vis-bar';
            if (isMut) barClass += ' mutated';
            else if (stepEventType === 'swap' && isAct) barClass += ' swapping';
            else if (matchingPtrs.length > 0 || isAct) barClass += ' comparing';

            const ptrHtml = matchingPtrs.length > 0
                ? `<div class="vis-pointer-marker">${escapeHtml(matchingPtrs.join(','))}</div>`
                : '';
            const prev = arrObj.prevValues?.[i];
            const valTitle = (isMut && prev !== undefined) ? ` title="Was: ${escapeHtml(String(prev))}"` : '';

            barsHtml += `
                <div class="vis-bar-col ${matchingPtrs.length > 0 ? 'has-pointer' : ''}"${valTitle}>
                    ${ptrHtml}
                    <span class="vis-bar-val">${escapeHtml(String(val))}</span>
                    <div class="${barClass}" style="height:${barH}px;"></div>
                    <span class="vis-bar-idx">[${i}]</span>
                </div>
            `;
        }

        return `
            <div class="live-section-box">
                <div class="live-section-hdr">
                    <span><i class="bi bi-bar-chart-fill text-sky-400 me-1"></i> Array: <strong class="text-white">${escapeHtml(arrObj.name)}</strong> <span class="text-muted">[${vals.length}]</span></span>
                    ${arrObj.changed ? '<span class="badge bg-warning text-dark">Mutated</span>' : ''}
                </div>
                <div class="vis-bars-wrap">${barsHtml}</div>
            </div>
        `;
    },

    renderDictsHtml(dicts) {
        if (!Array.isArray(dicts) || dicts.length === 0) return '';
        return dicts.slice(0, 3).map(d => {
            const changedSet = new Set(d.changedKeys || []);
            const entriesHtml = d.entries.length === 0
                ? '<span class="text-muted small font-monospace">{} (empty)</span>'
                : d.entries.slice(0, 18).map(([dk, dv]) => {
                    const isChg = changedSet.has(dk);
                    const valStr = typeof dv === 'object' ? JSON.stringify(dv) : String(dv);
                    return `
                        <span class="live-scalar-pill ${isChg ? 'changed' : ''}">
                            <span class="text-info fw-bold">${escapeHtml(dk)}</span>
                            <span class="text-muted">→</span>
                            <span class="text-white">${escapeHtml(valStr.length > 18 ? valStr.slice(0, 17) + '…' : valStr)}</span>
                        </span>
                    `;
                }).join('');
            return `
                <div class="live-section-box">
                    <div class="live-section-hdr">
                        <span><i class="bi bi-braces text-sky-400 me-1"></i> Hash Map: <strong class="text-white">${escapeHtml(d.name)}</strong></span>
                        <span>${d.entries.length} keys</span>
                    </div>
                    <div class="live-scalars-strip">${entriesHtml}</div>
                </div>
            `;
        }).join('');
    },

    buildLiveVisualHtml(step, { fullStage = true } = {}) {
        const vars = step.variables || {};
        const scalarsHtml = this.renderScalarsStrip(step);
        const matrices = Array.isArray(step.matrices2D) ? step.matrices2D : [];
        const arrays = Array.isArray(step.arrays1D) ? step.arrays1D : [];
        const dicts = Array.isArray(step.dicts) ? step.dicts : [];
        const treeData = this.detectBinaryTree(vars);
        const llData = treeData ? null : this.detectLinkedList(vars);

        const sections = [];
        if (scalarsHtml) sections.push(scalarsHtml);

        matrices.slice(0, 2).forEach(m => {
            sections.push(this.renderMatrix2DHtml(m, step.allScalarInts || {}));
        });

        if (treeData) {
            sections.push(this.renderBinaryTreeHtml(treeData));
        }
        if (llData) {
            sections.push(this.renderLinkedListHtml(llData));
        }

        if (arrays.length > 0) {
            const primaryCompact = matrices.length > 0 || Boolean(treeData) || Boolean(llData);
            sections.push(this.render1DArraySectionHtml(
                arrays[0],
                step.pointers || {},
                step.activeIndices || [],
                step.eventType || 'step',
                primaryCompact
            ));
            arrays.slice(1, fullStage ? 3 : 2).forEach(secArr => {
                sections.push(this.render1DArraySectionHtml(secArr, {}, [], 'step', true));
            });
        } else if (step.arrayState && step.arrayState.length > 0 && matrices.length === 0) {
            sections.push(this.render1DArraySectionHtml(
                {
                    name: step.arrayVarName || 'data',
                    values: step.arrayState,
                    changedIndices: step.changedIndices || [],
                    isNumeric: step.arrayState.some(x => typeof x === 'number'),
                    changed: (step.changedIndices || []).length > 0
                },
                step.pointers || {},
                step.activeIndices || [],
                step.eventType || 'step',
                false
            ));
        }

        const dictsHtml = this.renderDictsHtml(dicts);
        if (dictsHtml) sections.push(dictsHtml);

        if (sections.length === 0) return '';
        return `<div class="codelab-live-stage">${sections.join('')}</div>`;
    },

    renderDynamicMemoryDisplay(step) {
        const container = document.getElementById('live-memory-display');
        const countLabel = document.getElementById('memory-items-count');
        if (!container) return;

        const vars = step.variables || {};
        const matrices = Array.isArray(step.matrices2D) ? step.matrices2D : [];
        const arrays = Array.isArray(step.arrays1D) ? step.arrays1D : [];
        const dicts = Array.isArray(step.dicts) ? step.dicts : [];
        const treeData = this.detectBinaryTree(vars);
        const llData = treeData ? null : this.detectLinkedList(vars);

        const summaryParts = [];
        matrices.slice(0, 2).forEach(m => summaryParts.push(`${m.name}[${m.rows.length}×${(m.rows[0] || []).length}]`));
        if (treeData) summaryParts.push(`${treeData.varName}(${treeData.nodeCount}n)`);
        if (llData) summaryParts.push(`${llData.varName}(${llData.nodes.length}n)`);
        arrays.slice(0, 2).forEach(a => summaryParts.push(`${a.name}[${a.values.length}]`));
        dicts.slice(0, 1).forEach(d => summaryParts.push(`${d.name}{${d.entries.length}}`));

        const liveHtml = this.buildLiveVisualHtml(step, { fullStage: false });
        if (liveHtml) {
            if (countLabel) {
                countLabel.textContent = summaryParts.length > 0
                    ? summaryParts.slice(0, 3).join(' · ')
                    : `${Object.keys(vars).length} vars`;
            }
            container.style.setProperty('align-items', 'flex-start', 'important');
            container.innerHTML = liveHtml;
            return;
        }

        container.style.removeProperty('align-items');
        if (countLabel) countLabel.textContent = '0 items';
        container.innerHTML = `
            <div class="text-center text-muted-custom py-4">
                <i class="bi bi-cpu display-5 mb-2 d-block opacity-50"></i>
                <span>No memory structures or active variables in this scope</span>
            </div>
        `;
    },

    renderInitialMemoryPreview() {
        const container = document.getElementById('live-memory-display');
        const countLabel = document.getElementById('memory-items-count');
        if (countLabel) countLabel.textContent = '0 items';
        if (container) {
            container.style.removeProperty('align-items');
            container.innerHTML = `
                <div class="text-center text-muted-custom py-4">
                    <i class="bi bi-play-circle display-5 mb-2 d-block opacity-50"></i>
                    <span>Variables and memory states will visualize here in real-time</span>
                </div>
            `;
        }
    },

    // ==========================================
    // 6. Preserved Algorithm Visualizer Canvas
    // ==========================================
    renderVisualizationCanvas(step) {
        const container = document.getElementById('vis-canvas-container');
        if (!container) return;

        const vars = step.variables || {};

        // Problems Mode Walkthrough Toggle: editable input step-by-step walkthrough during active trace
        if (this.editorMode === 'problems' && this.visSubMode === 'walkthrough') {
            container.classList.remove('live-multi');
            container.classList.add('pve-mode');
            const problem = this.problemsList.find(p => p.id === this.currentProblemId);
            container.innerHTML = `
                <div class="vis-canvas-subbar">
                    <span class="small text-info fw-bold"><i class="bi bi-sliders me-1"></i> Walkthrough Studio (Edit Input)</span>
                    <button type="button" class="btn btn-xs btn-info text-dark fw-bold py-1 px-2" id="btn-vis-switch-live" style="font-size:0.72rem;">
                        <i class="bi bi-activity me-1"></i> Back to Live Trace
                    </button>
                </div>
                <div id="codelab-pve-host" class="w-100"></div>
            `;
            container.querySelector('#btn-vis-switch-live')?.addEventListener('click', () => {
                this.visSubMode = 'live';
                if (this.activeProblemVisInstance && typeof this.activeProblemVisInstance.destroy === 'function') {
                    this.activeProblemVisInstance.destroy();
                    this.activeProblemVisInstance = null;
                }
                this.renderVisualizationCanvas(this.traceSteps[this.currentStepIndex] || step);
            });
            const hostEl = container.querySelector('#codelab-pve-host');
            if (problem && hostEl) {
                this.renderProblemVisualizer(problem, hostEl);
            }
            return;
        }

        if (this.activeProblemVisInstance && typeof this.activeProblemVisInstance.destroy === 'function') {
            this.activeProblemVisInstance.destroy();
            this.activeProblemVisInstance = null;
        }
        container.classList.remove('pve-mode');

        // Case 1: Stack Visualization (LIFO Beaker — preserved for stack templates / dsType)
        const isStack = step.dsType === 'stack' || (this.editorMode !== 'problems' && (vars.stack !== undefined || this.currentTemplateKey === 'stack'));
        if (isStack && (vars.s !== undefined || vars.stack !== undefined || step.arrayState)) {
            const rawStack = vars.stack !== undefined ? vars.stack : (vars.s !== undefined ? vars.s : step.arrayState);
            const stackArr = Array.isArray(rawStack) ? rawStack : (rawStack && rawStack._items ? rawStack._items : []);

            container.classList.remove('live-multi');
            let html = this.renderScalarsStrip(step);
            html += '<div class="d-flex flex-column align-items-center gap-2 w-100">';
            html += '<div class="text-muted small fw-bold"><i class="bi bi-stack me-1"></i> Stack (LIFO) View</div>';
            html += '<div class="vis-stack-wrap">';
            if (stackArr.length === 0) {
                html += '<div class="text-muted small py-4 text-center">Empty Stack (Ready for Push)</div>';
            } else {
                for (let i = 0; i < stackArr.length; i++) {
                    const isTop = (i === stackArr.length - 1);
                    html += `
                        <div class="vis-stack-item ${isTop ? 'top-item' : ''}">
                            ${isTop ? '<span class="badge bg-dark position-absolute start-0 ms-2" style="font-size:0.6rem;">TOP</span>' : ''}
                            <span>${escapeHtml(String(stackArr[i]))}</span>
                        </div>
                    `;
                }
            }
            html += '</div></div>';
            container.innerHTML = html;
            return;
        }

        // Case 2: Queue Visualization (FIFO Conveyor — preserved for queue templates / dsType)
        const isQueue = step.dsType === 'queue' || (this.editorMode !== 'problems' && (vars.q !== undefined || vars.queue !== undefined || this.currentTemplateKey === 'queue'));
        if (isQueue && (vars.q !== undefined || vars.queue !== undefined || step.arrayState)) {
            const rawQueue = vars.q !== undefined ? vars.q : (vars.queue !== undefined ? vars.queue : step.arrayState);
            const queueArr = Array.isArray(rawQueue) ? rawQueue : (rawQueue && rawQueue._items ? rawQueue._items : []);

            container.classList.remove('live-multi');
            let html = this.renderScalarsStrip(step);
            html += '<div class="d-flex flex-column align-items-center gap-2 w-100">';
            html += '<div class="text-muted small fw-bold"><i class="bi bi-arrow-left-right me-1"></i> Queue (FIFO) Conveyor</div>';
            html += '<div class="d-flex justify-content-between w-100 text-muted small px-3"><span>FRONT (Exit)</span><span>REAR (Entry)</span></div>';
            html += '<div class="vis-queue-wrap">';
            if (queueArr.length === 0) {
                html += '<div class="text-muted small py-2 px-4 text-center">Empty Queue</div>';
            } else {
                for (let i = 0; i < queueArr.length; i++) {
                    html += `<div class="vis-queue-item">${escapeHtml(String(queueArr[i]))}</div>`;
                }
            }
            html += '</div></div>';
            container.innerHTML = html;
            return;
        }

        // Case 3: Multi-Structure Live Trace Stage (Problems, Write, Predefined Arrays/Trees/LinkedLists/Matrices/Dicts)
        const liveHtml = this.buildLiveVisualHtml(step, { fullStage: true });
        if (liveHtml) {
            container.classList.add('live-multi');
            let subbar = '';
            if (this.editorMode === 'problems') {
                subbar = `
                    <div class="vis-canvas-subbar">
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-info text-dark">LIVE TRACE</span>
                            <span class="small text-white font-monospace">Step ${this.currentStepIndex + 1} / ${this.traceSteps.length}</span>
                        </div>
                        <button type="button" class="btn btn-xs btn-outline-info py-1 px-2" id="btn-vis-switch-walkthrough" style="font-size:0.72rem;">
                            <i class="bi bi-sliders me-1"></i> Problem Walkthrough (Edit Input)
                        </button>
                    </div>
                `;
            }
            container.innerHTML = subbar + liveHtml;
            if (this.editorMode === 'problems') {
                container.querySelector('#btn-vis-switch-walkthrough')?.addEventListener('click', () => {
                    this.visSubMode = 'walkthrough';
                    this.renderVisualizationCanvas(this.traceSteps[this.currentStepIndex] || step);
                });
            }
            return;
        }

        container.classList.remove('live-multi');
        this.renderInitialPreview(this.currentTemplateKey);
    },

    renderInitialPreview(templateKey) {
        const container = document.getElementById('vis-canvas-container');
        if (!container) return;
        container.classList.remove('live-multi');

        // Problems Judge Mode: Render Interactive 100-Problem Algorithm Visualizer
        if (this.editorMode === 'problems' || templateKey === 'problem') {
            const problem = this.problemsList.find(p => p.id === this.currentProblemId);
            if (problem && window.ProblemVisualizerEngine) {
                this.renderProblemVisualizer(problem, container);
                return;
            }
        }

        if (this.activeProblemVisInstance && typeof this.activeProblemVisInstance.destroy === 'function') {
            this.activeProblemVisInstance.destroy();
            this.activeProblemVisInstance = null;
        }
        container.classList.remove('pve-mode');

        // Custom Code Mode: Show clean placeholder, NEVER dummy bubble sort bars
        if (templateKey === 'custom' || this.editorMode === 'write') {
            container.innerHTML = `
                <div class="vis-custom-empty-state py-5 px-3 text-center">
                    <div class="mb-3">
                        <i class="bi bi-code-square display-4 text-sky-400 opacity-75"></i>
                    </div>
                    <h5 class="text-white fw-bold mb-2">Universal Code Visualizer</h5>
                    <p class="text-muted small mx-auto" style="max-width: 380px;">
                        Write or paste any custom program in ${this.currentLang.toUpperCase()}. Variables, arrays, and data structures will render here dynamically during execution.
                    </p>
                    <div class="d-inline-flex align-items-center gap-2 mt-3 px-3 py-1 rounded-pill bg-dark border border-secondary border-opacity-50 text-info small">
                        <i class="bi bi-play-circle me-1"></i> Press <strong>Debug</strong> or <strong>Run Code</strong> to begin
                    </div>
                </div>
            `;
            return;
        }

        if (templateKey === 'stack') {
            container.innerHTML = `
                <div class="d-flex flex-column align-items-center gap-2">
                    <div class="text-muted small fw-bold"><i class="bi bi-stack me-1"></i> Stack (LIFO) Ready</div>
                    <div class="vis-stack-wrap">
                        <div class="text-muted small py-4 text-center">Empty Stack (Ready for Push)</div>
                    </div>
                </div>
            `;
            return;
        }

        if (templateKey === 'queue') {
            container.innerHTML = `
                <div class="d-flex flex-column align-items-center gap-2">
                    <div class="text-muted small fw-bold"><i class="bi bi-arrow-left-right me-1"></i> Queue (FIFO) Ready</div>
                    <div class="d-flex justify-content-between w-100 text-muted small px-3"><span>FRONT (Exit)</span><span>REAR (Entry)</span></div>
                    <div class="vis-queue-wrap">
                        <div class="text-muted small py-2 px-4 text-center">Empty Queue</div>
                    </div>
                </div>
            `;
            return;
        }

        if (templateKey === 'linkedlist') {
            container.innerHTML = `
                <div class="d-flex flex-column align-items-center gap-2">
                    <div class="text-muted small fw-bold"><i class="bi bi-link-45deg me-1"></i> Singly Linked List</div>
                    <div class="vis-nodes-list">
                        <div class="vis-node-box"><span>10</span></div><i class="bi bi-arrow-right vis-node-arrow"></i>
                        <div class="vis-node-box"><span>20</span></div><i class="bi bi-arrow-right vis-node-arrow"></i>
                        <div class="vis-node-box"><span>30</span></div><i class="bi bi-arrow-right vis-node-arrow"></i>
                        <div class="vis-node-box"><span>40</span></div><i class="bi bi-arrow-right vis-node-arrow"></i>
                        <span class="text-muted font-monospace">null</span>
                    </div>
                </div>
            `;
            return;
        }

        // Default Array Bars preview for predefined sorting & searching
        const dummyArr = [45, 12, 85, 32, 89, 39, 69, 22];
        const maxVal = 89;
        let html = '<div class="vis-bars-wrap">';
        for (let i = 0; i < dummyArr.length; i++) {
            const val = dummyArr[i];
            const heightPct = Math.max(Math.round((val / maxVal) * 180), 20);
            html += `
                <div class="vis-bar-col">
                    <span class="vis-bar-val">${val}</span>
                    <div class="vis-bar" style="height:${heightPct}px;"></div>
                    <span class="vis-bar-idx">[${i}]</span>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    },

    // ==========================================
    // 7. Watch Expressions & Console
    // ==========================================
    renderWatchPanel() {
        const list = document.getElementById('watch-list');
        if (!list) return;

        let html = '';
        this.activeWatches.forEach(expr => {
            html += `
                <div class="watch-item">
                    <span class="fw-bold text-warning font-monospace">${expr}</span>
                    <span id="watch-val-${expr}" class="text-muted font-monospace">-</span>
                    <button type="button" class="btn btn-sm text-danger p-0 border-0" onclick="CodeLabApp.removeWatch('${expr}')">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
            `;
        });
        list.innerHTML = html;
    },

    addWatch(expr) {
        if (!expr || this.activeWatches.includes(expr)) return;
        this.activeWatches.push(expr);
        this.renderWatchPanel();
        if (this.traceSteps[this.currentStepIndex]) {
            this.updateWatches(this.traceSteps[this.currentStepIndex].variables || {});
        }
    },

    removeWatch(expr) {
        this.activeWatches = this.activeWatches.filter(w => w !== expr);
        this.renderWatchPanel();
    },

    updateWatches(variables) {
        this.activeWatches.forEach(expr => {
            const el = document.getElementById(`watch-val-${expr}`);
            if (!el) return;

            try {
                if (variables[expr] !== undefined) {
                    const val = variables[expr];
                    el.textContent = typeof val === 'object' ? JSON.stringify(val) : String(val);
                    el.className = 'text-white font-monospace';
                } else {
                    el.textContent = 'undefined';
                    el.className = 'text-muted font-monospace';
                }
            } catch (e) {
                el.textContent = 'err';
                el.className = 'text-danger font-monospace';
            }
        });
    },

    logConsole(msg, type = 'log') {
        const box = document.getElementById('console-output-box');
        if (!box) return;

        const p = document.createElement('div');
        p.className = `console-msg ${type}`;
        const time = new Date().toLocaleTimeString();
        p.innerHTML = `<span class="text-muted small">[${time}]</span> ${escapeHtml(msg)}`;
        box.appendChild(p);
        box.scrollTop = box.scrollHeight;
    },

    clearConsole() {
        const box = document.getElementById('console-output-box');
        if (box) box.innerHTML = '';
    },

    // ==========================================
    // 8. UI Event Listeners & Shortcuts
    // ==========================================
    bindControls() {
        // Mode Switches (Write Custom Code, Predefined Code, Coding Judge Problems)
        document.getElementById('btn-mode-write')?.addEventListener('click', () => {
            this.setEditorMode('write');
        });
        document.getElementById('btn-mode-predefined')?.addEventListener('click', () => {
            this.setEditorMode('predefined');
        });
        document.getElementById('btn-mode-problems')?.addEventListener('click', () => {
            this.setEditorMode('problems');
        });

        // Problems Judge controls & Bottom Judge/Profiler actions
        document.getElementById('problem-diff-filter')?.addEventListener('change', (e) => {
            this.problemDiffFilter = e.target.value || 'All';
            const prevId = this.currentProblemId;
            this.renderProblemSelectOptions();
            if (this.currentProblemId !== prevId) {
                this.loadProblem(this.currentProblemId);
            }
        });
        document.getElementById('problem-select')?.addEventListener('change', (e) => {
            this.loadProblem(e.target.value);
        });
        document.getElementById('btn-problem-skeleton')?.addEventListener('click', () => {
            this.loadProblemSkeleton();
        });
        document.getElementById('btn-problem-reset')?.addEventListener('click', () => {
            this.resetProblemStarter();
        });
        document.getElementById('btn-judge-submit')?.addEventListener('click', () => {
            this.submitProblemSolution();
        });
        document.getElementById('btn-profile-bigo')?.addEventListener('click', () => {
            this.runComplexityProfiler();
        });

        // Subtoolbar helpers for Custom Code
        document.getElementById('btn-editor-starter')?.addEventListener('click', () => {
            this.resetToStarterCode();
        });
        document.getElementById('btn-editor-clear')?.addEventListener('click', () => {
            this.clearEditor();
        });

        // Predefined algorithm select
        document.getElementById('predefined-algo-select')?.addEventListener('change', (e) => {
            this.loadPredefinedAlgorithm(e.target.value);
        });

        // Language selector
        document.getElementById('language-select')?.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });

        // Word Wrap toggle button
        document.getElementById('btn-toggle-wrap')?.addEventListener('click', () => {
            this.toggleWordWrap();
        });

        // Error notification card buttons
        document.getElementById('btn-algoai-fix-error')?.addEventListener('click', () => {
            this.askAlgoAIToFixError();
        });
        document.getElementById('btn-jump-error-line')?.addEventListener('click', () => {
            this.jumpToErrorLine();
        });
        document.getElementById('btn-view-console-error')?.addEventListener('click', () => {
            this.switchTab('console');
        });
        document.getElementById('btn-dismiss-error')?.addEventListener('click', () => {
            this.dismissError();
        });

        // Dual Mode Viewport Switchers
        document.getElementById('btn-view-state')?.addEventListener('click', () => {
            this.switchViewportMode('state');
        });
        document.getElementById('btn-view-visualizer')?.addEventListener('click', () => {
            this.switchViewportMode('visualizer');
        });

        // Execution Toolbar
        document.getElementById('btn-run')?.addEventListener('click', () => this.startExecution(false));
        document.getElementById('btn-debug')?.addEventListener('click', () => this.startExecution(true));
        document.getElementById('btn-pause')?.addEventListener('click', () => this.pause());
        document.getElementById('btn-step-over')?.addEventListener('click', () => this.stepOver());
        document.getElementById('btn-step-into')?.addEventListener('click', () => this.stepInto());
        document.getElementById('btn-step-out')?.addEventListener('click', () => this.stepOut());
        document.getElementById('btn-continue')?.addEventListener('click', () => this.continueExecution());
        document.getElementById('btn-stop')?.addEventListener('click', () => this.stop());
        document.getElementById('btn-reset')?.addEventListener('click', () => this.resetExecution());

        // Speed slider
        const speedSlider = document.getElementById('exec-speed-slider');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.stepDelay = parseInt(e.target.value, 10);
                document.getElementById('speed-ms-label').textContent = `${this.stepDelay}ms`;
                if (this.isPlaying) {
                    this.play();
                }
            });
        }

        // Watch expression input
        document.getElementById('add-watch-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('watch-expr-input');
            if (input && input.value.trim()) {
                this.addWatch(input.value.trim());
                input.value = '';
            }
        });

        // Clear console
        document.getElementById('btn-clear-console')?.addEventListener('click', () => this.clearConsole());

        // Keyboard shortcuts: F10 step over, F11 step into, Shift+F11 step out, F8 continue, F5 run
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F10') {
                e.preventDefault();
                this.stepOver();
            } else if (e.key === 'F11') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.stepOut();
                } else {
                    this.stepInto();
                }
            } else if (e.key === 'F8') {
                e.preventDefault();
                this.continueExecution();
            } else if (e.key === 'F5') {
                e.preventDefault();
                this.startExecution(true);
            }
        });
    }
};

function escapeHtml(str) {
    if (typeof str !== 'string') return String(str);
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.addEventListener('DOMContentLoaded', () => {
    CodeLabApp.init();
});

window.CodeLabApp = CodeLabApp;
