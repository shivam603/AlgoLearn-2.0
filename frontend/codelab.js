/**
 * AlgoLearn CodeLab — Interactive Studio Engine
 * Monaco Editor Controller, Debugger State Machine, and Real-time Visualizer Synchronizer.
 */

const CodeLabApp = {
    editor: null,
    currentLang: 'javascript',
    currentTemplateKey: 'bubble',
    breakpoints: new Set(),
    decorations: [],
    
    // Execution & Debugger State
    traceSteps: [],
    currentStepIndex: 0,
    isPlaying: false,
    playInterval: null,
    stepDelay: 350,
    activeWatches: ['arr', 'i', 'j', 'temp'],
    lastVariablesState: {},
    worker: null,

    init() {
        this.initMonaco();
        this.bindControls();
        this.loadTemplate(this.currentTemplateKey);
        this.renderWatchPanel();
    },

    // ==========================================
    // 1. Monaco Editor Initialization
    // ==========================================
    initMonaco() {
        if (typeof require === 'undefined') {
            console.error("Monaco require loader missing");
            return;
        }

        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });

        require(['vs/editor/editor.main'], () => {
            const container = document.getElementById('monaco-editor-container');
            if (!container) return;

            this.editor = monaco.editor.create(container, {
                value: CodeLabTemplates.bubble.code.javascript,
                language: 'javascript',
                theme: 'vs-dark',
                fontSize: 13,
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                glyphMargin: true,
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
                cursorBlinking: 'smooth',
                renderWhitespace: 'selection'
            });

            // Gutter breakpoint click listener
            this.editor.onMouseDown((e) => {
                if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
                    const line = e.target.position.lineNumber;
                    this.toggleBreakpoint(line);
                }
            });

            this.logConsole("CodeLab Monaco Editor ready. Click line numbers to set breakpoints.", "info");
        });
    },

    // ==========================================
    // 2. Breakpoint Management
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
            if (step && step.line) {
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

    // ==========================================
    // 3. Template & Language Switching
    // ==========================================
    loadTemplate(templateKey) {
        this.currentTemplateKey = templateKey;
        const template = CodeLabTemplates[templateKey];
        if (!template) return;

        const code = template.code[this.currentLang] || template.code.javascript;
        if (this.editor) {
            this.editor.setValue(code);
            monaco.editor.setModelLanguage(this.editor.getModel(), this.currentLang === 'js' ? 'javascript' : this.currentLang);
        }

        document.getElementById('vis-algorithm-name').textContent = template.name;
        document.getElementById('vis-category-badge').textContent = template.category;
        this.resetExecution();
        this.logConsole(`Loaded template: ${template.name} (${this.currentLang.toUpperCase()})`);
    },

    setLanguage(lang) {
        this.currentLang = lang;
        this.loadTemplate(this.currentTemplateKey);
    },

    // ==========================================
    // 4. Execution & Debugging Controller
    // ==========================================
    async startExecution(debugMode = false) {
        const code = this.editor ? this.editor.getValue() : '';
        this.logConsole(`Preparing execution tracing for ${this.currentLang.toUpperCase()}...`);

        // Update UI status
        document.getElementById('exec-status-badge').className = 'badge bg-primary';
        document.getElementById('exec-status-badge').textContent = 'Tracing...';

        try {
            const result = await CodeLabTracer.traceJavaScript(code);
            
            if (!result.success) {
                this.logConsole(`Error [${result.error.type}]: ${result.error.message} (Line ${result.error.line})`, 'error');
                document.getElementById('exec-status-badge').className = 'badge bg-danger';
                document.getElementById('exec-status-badge').textContent = 'Error';
                if (result.error.line && this.editor) {
                    this.editor.revealLineInCenter(result.error.line);
                }
                return;
            }

            this.traceSteps = result.trace;
            this.currentStepIndex = 0;
            this.logConsole(`Generated ${this.traceSteps.length} execution steps successfully.`);

            if (this.traceSteps.length === 0) {
                this.logConsole("Execution produced no trace events.", "warn");
                return;
            }

            this.enablePlaybackControls(true);

            if (debugMode) {
                // Pause at first line or first breakpoint
                this.pause();
                this.renderStep(this.traceSteps[0]);
                document.getElementById('exec-status-badge').className = 'badge bg-warning text-dark';
                document.getElementById('exec-status-badge').textContent = 'Paused (Debug)';
            } else {
                // Continuous run
                this.play();
            }
        } catch (err) {
            this.logConsole("Execution tracing failed: " + err.message, "error");
        }
    },

    play() {
        this.isPlaying = true;
        document.getElementById('btn-run').classList.add('d-none');
        document.getElementById('btn-pause').classList.remove('d-none');
        document.getElementById('exec-status-badge').className = 'badge bg-success';
        document.getElementById('exec-status-badge').textContent = 'Running';

        if (this.playInterval) clearInterval(this.playInterval);

        this.playInterval = setInterval(() => {
            if (this.currentStepIndex >= this.traceSteps.length - 1) {
                this.pause();
                document.getElementById('exec-status-badge').className = 'badge bg-info text-dark';
                document.getElementById('exec-status-badge').textContent = 'Completed';
                this.logConsole("Execution complete.", "info");
                return;
            }

            this.currentStepIndex++;
            const step = this.traceSteps[this.currentStepIndex];

            // Breakpoint hit check
            if (this.breakpoints.has(step.line)) {
                this.pause();
                this.renderStep(step);
                document.getElementById('exec-status-badge').className = 'badge bg-warning text-dark';
                document.getElementById('exec-status-badge').textContent = `Paused on Breakpoint (L${step.line})`;
                this.logConsole(`Hit breakpoint at line ${step.line}`);
                return;
            }

            this.renderStep(step);
        }, this.stepDelay);
    },

    pause() {
        this.isPlaying = false;
        if (this.playInterval) clearInterval(this.playInterval);
        document.getElementById('btn-run').classList.remove('d-none');
        document.getElementById('btn-pause').classList.add('d-none');
        document.getElementById('exec-status-badge').className = 'badge bg-warning text-dark';
        document.getElementById('exec-status-badge').textContent = 'Paused';
    },

    stepOver() {
        this.pause();
        if (this.currentStepIndex < this.traceSteps.length - 1) {
            this.currentStepIndex++;
            this.renderStep(this.traceSteps[this.currentStepIndex]);
        }
    },

    stepInto() {
        this.stepOver();
    },

    stepOut() {
        this.pause();
        if (this.traceSteps.length === 0) return;
        const currentDepth = (this.traceSteps[this.currentStepIndex]?.callStack || []).length;
        
        while (this.currentStepIndex < this.traceSteps.length - 1) {
            this.currentStepIndex++;
            const nextDepth = (this.traceSteps[this.currentStepIndex]?.callStack || []).length;
            if (nextDepth < currentDepth) {
                break;
            }
        }
        this.renderStep(this.traceSteps[this.currentStepIndex]);
    },

    continueExecution() {
        this.play();
    },

    stop() {
        this.pause();
        this.currentStepIndex = 0;
        this.refreshDecorations();
        document.getElementById('exec-status-badge').className = 'badge bg-secondary';
        document.getElementById('exec-status-badge').textContent = 'Stopped';
    },

    resetExecution() {
        this.stop();
        this.traceSteps = [];
        this.currentStepIndex = 0;
        this.enablePlaybackControls(false);
        this.refreshDecorations();
        document.getElementById('step-counter').textContent = 'Step 0 / 0';
        document.getElementById('vis-canvas-container').innerHTML = `
            <div class="text-center text-muted-custom py-5">
                <i class="bi bi-play-circle display-4 mb-2 d-block"></i>
                <span>Click <strong>Run Code</strong> or <strong>Debug</strong> to start visualization</span>
            </div>
        `;
        document.getElementById('variables-body').innerHTML = '<tr><td colspan="3" class="text-muted text-center py-2">No active variables</td></tr>';
        document.getElementById('call-stack-list').innerHTML = '<li class="call-stack-item active"><span>global</span><span class="badge bg-secondary">depth 0</span></li>';
    },

    enablePlaybackControls(enabled) {
        ['btn-step-over', 'btn-step-into', 'btn-step-out', 'btn-continue', 'btn-stop'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = !enabled;
        });
    },

    // ==========================================
    // 5. Live Visualization & Panel Synchronization
    // ==========================================
    renderStep(step) {
        if (!step) return;

        // 1. Update Step Counter & Status
        document.getElementById('step-counter').textContent = `Step ${this.currentStepIndex + 1} / ${this.traceSteps.length}`;
        document.getElementById('vis-step-desc').textContent = step.description;

        // 2. Highlight Editor Line
        this.refreshDecorations();

        // 3. Render Visualizer Canvas (Array / Nodes / etc.)
        this.renderVisualizationCanvas(step);

        // 4. Update Variables Inspector
        this.renderVariablesTable(step.variables || {});

        // 5. Update Call Stack
        this.renderCallStack(step.callStack || []);

        // 6. Update Watch Expressions
        this.updateWatches(step.variables || {});

        // 7. Stream Console Log Output
        if (step.output) {
            this.logConsole(step.output, 'log');
        }
    },

    renderVisualizationCanvas(step) {
        const container = document.getElementById('vis-canvas-container');
        if (!container) return;

        // Case A: Array Visualization (Sorting & Searching)
        if (step.arrayState && Array.isArray(step.arrayState)) {
            const arr = step.arrayState;
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

                // Pointer badges (e.g. i, j, low, mid, high)
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

        // Case B: Linked List / Queue / Stack Visualization
        const vars = step.variables || {};
        let detectedCollection = null;
        for (let k of ['items', 'queue', 'stack', 'visited', 'order']) {
            if (Array.isArray(vars[k])) {
                detectedCollection = vars[k];
                break;
            }
        }

        if (detectedCollection) {
            let html = '<div class="vis-nodes-list">';
            detectedCollection.forEach((item, idx) => {
                html += `
                    <div class="vis-node-box">
                        <span>${typeof item === 'object' ? JSON.stringify(item) : item}</span>
                        ${idx < detectedCollection.length - 1 ? '<i class="bi bi-arrow-right vis-node-arrow"></i>' : ''}
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }
    },

    renderVariablesTable(variables) {
        const tbody = document.getElementById('variables-body');
        if (!tbody) return;

        const entries = Object.entries(variables);
        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-muted text-center py-2">No variables in scope</td></tr>';
            return;
        }

        let html = '';
        for (let [name, val] of entries) {
            const type = Array.isArray(val) ? `Array[${val.length}]` : typeof val;
            const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
            const isUpdated = this.lastVariablesState[name] !== undefined && this.lastVariablesState[name] !== strVal;

            html += `
                <tr class="${isUpdated ? 'var-updated' : ''}">
                    <td class="fw-bold text-sky-400">${name}</td>
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
            const isActive = i === stack.length - 1;
            html += `
                <li class="call-stack-item ${isActive ? 'active' : ''}">
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

    renderWatchPanel() {
        const list = document.getElementById('watch-list');
        if (!list) return;

        let html = '';
        this.activeWatches.forEach(expr => {
            html += `
                <div class="watch-item">
                    <span class="fw-bold text-warning">${expr}</span>
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
        p.innerHTML = `<span class="text-muted small">[${time}]</span> ${msg}`;
        box.appendChild(p);
        box.scrollTop = box.scrollHeight;
    },

    clearConsole() {
        const box = document.getElementById('console-output-box');
        if (box) box.innerHTML = '';
    },

    // ==========================================
    // 6. UI Event Listeners & Toolbar
    // ==========================================
    bindControls() {
        // Algorithm template dropdown
        document.getElementById('template-select')?.addEventListener('change', (e) => {
            this.loadTemplate(e.target.value);
        });

        // Language selector
        document.getElementById('language-select')?.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });

        // Execution buttons
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
                    this.play(); // reload interval with new speed
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

        // Keyboard shortcuts: F10 step over, F8 continue
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F10') {
                e.preventDefault();
                this.stepOver();
            } else if (e.key === 'F8') {
                e.preventDefault();
                this.continueExecution();
            }
        });
    }
};

window.addEventListener('DOMContentLoaded', () => {
    CodeLabApp.init();
});
