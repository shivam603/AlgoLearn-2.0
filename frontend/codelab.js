/**
 * AlgoLearn CodeLab — Universal Live Code Debugging System
 * Monaco Editor Controller, Real Multi-Language Debugger State Machine,
 * Containerized Live Trace Synchronizer, and Visualizer Inspector.
 */

const CodeLabApp = {
    editor: null,
    currentLang: 'python',
    editorMode: 'write', // 'write' (Write Custom Code) or 'predefined' (Predefined Written Code)
    currentTemplateKey: 'custom',
    activeViewMode: 'state', // 'state' (Live State Inspector) or 'visualizer' (Algorithm Visualizer)
    breakpoints: new Set(),
    decorations: [],
    errorDecorations: [],
    savedCustomCode: {},
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

            // Keep track of user custom code modifications
            this.editor.onDidChangeModelContent(() => {
                if (this.isProgrammaticChange) return;
                if (this.editorMode === 'write') {
                    this.savedCustomCode[this.currentLang] = this.editor.getValue();
                }
            });

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

    // ==========================================
    // 4. Mode & Language Switching (Write Code vs Predefined Code)
    // ==========================================
    setEditorMode(mode) {
        this.editorMode = mode;
        const btnWrite = document.getElementById('btn-mode-write');
        const btnPredefined = document.getElementById('btn-mode-predefined');
        const subWrite = document.getElementById('subtoolbar-write-mode');
        const subPredefined = document.getElementById('subtoolbar-predefined-mode');

        if (mode === 'write') {
            btnWrite?.classList.add('active', 'btn-sky');
            btnWrite?.classList.remove('btn-outline-secondary');
            btnPredefined?.classList.remove('active', 'btn-sky');
            btnPredefined?.classList.add('btn-outline-secondary');

            subWrite?.classList.remove('d-none');
            subWrite?.classList.add('d-flex');
            subPredefined?.classList.add('d-none');
            subPredefined?.classList.remove('d-flex');

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
            this.resetExecution();
            this.logConsole(`Switched to Custom Code mode (${this.currentLang.toUpperCase()}). Type or paste any code.`);
        } else {
            btnPredefined?.classList.add('active', 'btn-sky');
            btnPredefined?.classList.remove('btn-outline-secondary');
            btnWrite?.classList.remove('active', 'btn-sky');
            btnWrite?.classList.add('btn-outline-secondary');

            subPredefined?.classList.remove('d-none');
            subPredefined?.classList.add('d-flex');
            subWrite?.classList.add('d-none');
            subWrite?.classList.remove('d-flex');

            if (this.editor) {
                this.savedCustomCode[this.currentLang] = this.editor.getValue();
            }

            const algoSelect = document.getElementById('predefined-algo-select');
            const selectedAlgo = algoSelect ? algoSelect.value : 'bubble';
            this.loadPredefinedAlgorithm(selectedAlgo);
        }
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
            stateBtn?.classList.add('active');
            visBtn?.classList.remove('active');
            stateContainer?.classList.remove('d-none');
            visContainer?.classList.add('d-none');
        } else {
            visBtn?.classList.add('active');
            stateBtn?.classList.remove('active');
            visContainer?.classList.remove('d-none');
            stateContainer?.classList.add('d-none');
        }
    },

    // ==========================================
    // 5. Universal Debugger Execution Engine
    // ==========================================
    async startExecution(debugMode = false) {
        const code = this.editor ? this.editor.getValue() : '';
        if (!code.trim()) {
            this.logConsole("Editor is empty. Write or paste code to debug.", "warn");
            return;
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

        const candidateKeys = ['head', 'reversed', 'list', 'curr', 'node', 'first', 'root', 'l1', 'l2', 'tail'];
        const allKeys = Object.keys(vars);
        const orderedKeys = [...candidateKeys.filter(c => vars[c]), ...allKeys.filter(k => !candidateKeys.includes(k))];

        for (const k of orderedKeys) {
            const val = vars[k];
            if (!val || typeof val !== 'object' || Array.isArray(val)) continue;

            const hasNext = 'next' in val;
            const hasVal = ('val' in val) || ('value' in val) || ('data' in val);

            if (hasNext || hasVal) {
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

                    if ('next' in curr && curr.next) {
                        curr = curr.next;
                    } else {
                        break;
                    }
                }

                if (nodes.length > 0) {
                    return {
                        varName: k,
                        nodes: nodes
                    };
                }
            }
        }
        return null;
    },

    renderLinkedListHtml(llData) {
        let html = '<div class="d-flex flex-column align-items-center gap-3 w-100 py-3">';
        html += `<div class="text-sky-400 small fw-bold font-monospace"><i class="bi bi-link-45deg me-1"></i> Singly Linked List: <span class="text-white">${llData.varName}</span> (${llData.nodes.length} nodes)</div>`;
        html += '<div class="vis-nodes-list">';
        llData.nodes.forEach((n, idx) => {
            const valStr = typeof n.val === 'object' ? JSON.stringify(n.val) : String(n.val);
            html += `
                <div class="vis-node-box ${n.isCycle ? 'border-danger text-danger' : ''}">
                    <span class="badge bg-primary bg-opacity-75 me-1" style="font-size:0.65rem;">node</span>
                    <span>${valStr}</span>
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

    renderDynamicMemoryDisplay(step) {
        const container = document.getElementById('live-memory-display');
        const countLabel = document.getElementById('memory-items-count');
        if (!container) return;

        const vars = step.variables || {};

        // 1. Check if enriched arrayState exists (from CodeLabTracer)
        let primaryArr = step.arrayState || null;
        let arrName = step.arrayVarName || '';

        // 2. Otherwise search variables for an array
        if (!primaryArr) {
            for (let [k, v] of Object.entries(vars)) {
                if (Array.isArray(v) && v.length > 0) {
                    primaryArr = v;
                    arrName = k;
                    break;
                }
            }
        }

        const pointers = step.pointers || {};

        if (primaryArr && primaryArr.length > 0) {
            if (countLabel) countLabel.textContent = `${arrName || 'data'}: ${primaryArr.length} elements`;
            const numericVals = primaryArr.filter(x => typeof x === 'number');
            const maxVal = numericVals.length > 0 ? Math.max(...numericVals, 10) : 50;

            let html = '<div class="vis-bars-wrap">';
            primaryArr.forEach((val, idx) => {
                const isNum = typeof val === 'number';
                const heightPct = isNum ? Math.max(Math.round((val / maxVal) * 160), 28) : 48;

                // Find if any pointer points to this index
                const matchingPointers = [];
                for (const [pName, pIdx] of Object.entries(pointers)) {
                    if (pIdx === idx) matchingPointers.push(pName);
                }

                const hasPointer = matchingPointers.length > 0;
                const pointerHtml = hasPointer 
                    ? `<span class="vis-pointer-marker">${matchingPointers.join(', ')}</span>`
                    : '';

                const barBg = hasPointer
                    ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)';

                html += `
                    <div class="vis-bar-col ${hasPointer ? 'has-pointer' : ''}">
                        ${pointerHtml}
                        <span class="vis-bar-val">${val}</span>
                        <div class="vis-bar" style="height:${heightPct}px; background: ${barBg};"></div>
                        <span class="vis-bar-idx">[${idx}]</span>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
            return;
        }

        // 3. Check for Linked List in variables
        const linkedList = this.detectLinkedList(vars);
        if (linkedList) {
            if (countLabel) countLabel.textContent = `${linkedList.varName}: ${linkedList.nodes.length} nodes`;
            container.innerHTML = this.renderLinkedListHtml(linkedList);
            return;
        }

        // 4. Otherwise render variable cards
        const keys = Object.keys(vars);
        if (keys.length > 0) {
            if (countLabel) countLabel.textContent = `${keys.length} variables`;
            let html = '<div class="d-flex flex-wrap gap-2 justify-content-center p-2 w-100">';
            for (let [k, v] of Object.entries(vars)) {
                const str = typeof v === 'object' ? JSON.stringify(v) : String(v);
                html += `
                    <div class="px-3 py-2 rounded font-monospace" style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(56, 189, 248, 0.3);">
                        <span class="text-sky-400 fw-bold small">${k}</span>:
                        <span class="text-white small">${str}</span>
                    </div>
                `;
            }
            html += '</div>';
            container.innerHTML = html;
            return;
        }

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
        if (container) {
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

        // Case 1: Stack Visualization (LIFO Beaker)
        const isStack = step.dsType === 'stack' || vars.s !== undefined || vars.stack !== undefined || this.currentTemplateKey === 'stack';
        if (isStack && (vars.s !== undefined || vars.stack !== undefined || step.arrayState)) {
            const rawStack = vars.s !== undefined ? vars.s : (vars.stack !== undefined ? vars.stack : step.arrayState);
            const stackArr = Array.isArray(rawStack) ? rawStack : (rawStack && rawStack._items ? rawStack._items : []);

            let html = '<div class="d-flex flex-column align-items-center gap-2">';
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
                            <span>${stackArr[i]}</span>
                        </div>
                    `;
                }
            }
            html += '</div></div>';
            container.innerHTML = html;
            return;
        }

        // Case 2: Queue Visualization (FIFO Conveyor)
        const isQueue = step.dsType === 'queue' || vars.q !== undefined || vars.queue !== undefined || this.currentTemplateKey === 'queue';
        if (isQueue && (vars.q !== undefined || vars.queue !== undefined || step.arrayState)) {
            const rawQueue = vars.q !== undefined ? vars.q : (vars.queue !== undefined ? vars.queue : step.arrayState);
            const queueArr = Array.isArray(rawQueue) ? rawQueue : (rawQueue && rawQueue._items ? rawQueue._items : []);

            let html = '<div class="d-flex flex-column align-items-center gap-2">';
            html += '<div class="text-muted small fw-bold"><i class="bi bi-arrow-left-right me-1"></i> Queue (FIFO) Conveyor</div>';
            html += '<div class="d-flex justify-content-between w-100 text-muted small px-3"><span>FRONT (Exit)</span><span>REAR (Entry)</span></div>';
            html += '<div class="vis-queue-wrap">';
            if (queueArr.length === 0) {
                html += '<div class="text-muted small py-2 px-4 text-center">Empty Queue</div>';
            } else {
                for (let i = 0; i < queueArr.length; i++) {
                    html += `<div class="vis-queue-item">${queueArr[i]}</div>`;
                }
            }
            html += '</div></div>';
            container.innerHTML = html;
            return;
        }

        // Case 3: Array Visualization (Sorting & Searching)
        const arr = step.arrayState || (Array.isArray(vars.arr) ? vars.arr : (Array.isArray(vars.numbers) ? vars.numbers : null));
        if (arr && Array.isArray(arr)) {
            const maxVal = Math.max(...arr.map(v => typeof v === 'number' ? v : 10), 10);
            const activeIdxs = step.activeIndices || [];
            const pointers = step.pointers || {};

            let html = '<div class="vis-bars-wrap">';
            for (let i = 0; i < arr.length; i++) {
                const val = arr[i];
                const heightPct = Math.max(Math.round((val / maxVal) * 180), 20);

                let barClass = 'vis-bar';
                if (step.eventType === 'swap' && activeIdxs.includes(i)) {
                    barClass += ' swapping';
                } else if (activeIdxs.includes(i)) {
                    barClass += ' comparing';
                }

                let pointerTags = [];
                for (let p in pointers) {
                    if (pointers[p] === i) {
                        pointerTags.push(p);
                    }
                }
                const pointerHtml = pointerTags.length > 0 ? 
                    `<div class="vis-pointer-marker">${pointerTags.join(',')}</div>` : '';

                html += `
                    <div class="vis-bar-col">
                        ${pointerHtml}
                        <span class="vis-bar-val">${val}</span>
                        <div class="${barClass}" style="height:${heightPct}px;"></div>
                        <span class="vis-bar-idx">[${i}]</span>
                    </div>
                `;
            }
            html += '</div>';
            container.innerHTML = html;
            return;
        }

        // Case 4: Linked List Visualization
        const linkedList = this.detectLinkedList(vars);
        if (linkedList) {
            container.innerHTML = this.renderLinkedListHtml(linkedList);
            return;
        }

        // Case 5: Custom Code Mode (Never show dummy bubble sort bars!)
        if (this.editorMode === 'write' || this.currentTemplateKey === 'custom') {
            const keys = Object.keys(vars);
            if (keys.length > 0) {
                let html = '<div class="d-flex flex-column align-items-center gap-3 w-100 py-3">';
                html += '<div class="text-sky-400 small fw-bold font-monospace"><i class="bi bi-cpu me-1"></i> Custom Code State</div>';
                html += '<div class="d-flex flex-wrap gap-2 justify-content-center p-2 w-100">';
                for (let [k, v] of Object.entries(vars)) {
                    const str = typeof v === 'object' ? JSON.stringify(v) : String(v);
                    html += `
                        <div class="px-3 py-2 rounded font-monospace" style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(56, 189, 248, 0.3);">
                            <span class="text-sky-400 fw-bold small">${k}</span>:
                            <span class="text-white small">${str}</span>
                        </div>
                    `;
                }
                html += '</div></div>';
                container.innerHTML = html;
                return;
            }
            this.renderInitialPreview('custom');
            return;
        }

        // Case 6: Predefined Algorithm Preview
        this.renderInitialPreview(this.currentTemplateKey);
    },

    renderInitialPreview(templateKey) {
        const container = document.getElementById('vis-canvas-container');
        if (!container) return;

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
        // Mode Switches (Write Custom Code vs Predefined Code)
        document.getElementById('btn-mode-write')?.addEventListener('click', () => {
            this.setEditorMode('write');
        });
        document.getElementById('btn-mode-predefined')?.addEventListener('click', () => {
            this.setEditorMode('predefined');
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
