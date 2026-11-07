/**
 * CodeLab Universal Execution Tracer
 * Communicates with the backend containerized debug engine via /api/debug/trace.
 * Supports Python, JavaScript, C, C++, and Java with real-time execution tracing,
 * breakpoints, stack inspection, variable tracking, and output streaming.
 */

const CodeLabTracer = {
    /**
     * Primary entry point: trace user code in any supported language
     */
    async trace(userCode, language = 'javascript', breakpoints = []) {
        const lang = (language || 'javascript').toLowerCase();

        try {
            const token = localStorage.getItem('algolearn_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/debug/trace', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    code: userCode,
                    language: lang,
                    breakpoints: Array.from(breakpoints || [])
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                return {
                    success: false,
                    error: errData.error || {
                        type: 'ServerError',
                        message: `Server returned error status ${response.status}`,
                        line: 1
                    },
                    stdout: '',
                    stderr: '',
                    trace: []
                };
            }

            const data = await response.json();

            if (!data.success) {
                const errObj = data.error || {};
                return {
                    success: false,
                    error: {
                        type: errObj.type || 'CompilationError',
                        message: errObj.message || data.stderr || 'Execution failed',
                        line: errObj.line || 1,
                        column: errObj.column || 1,
                        raw: errObj.raw || data.stderr || ''
                    },
                    stdout: data.stdout || '',
                    stderr: data.stderr || '',
                    trace: []
                };
            }

            const steps = data.steps || [];
            const enriched = this.enrichSteps(steps);

            return {
                success: true,
                language: data.language || lang,
                totalSteps: enriched.length,
                trace: enriched,
                stdout: data.stdout || '',
                stderr: data.stderr || '',
                hasRuntimeError: data.hasRuntimeError || false,
                error: data.error || null
            };
        } catch (err) {
            return {
                success: false,
                error: {
                    type: 'ConnectionError',
                    message: err.message || 'Could not communicate with debugger service',
                    line: 1
                },
                stdout: '',
                stderr: err.message,
                trace: []
            };
        }
    },

    /**
     * Enrich trace steps with detected collection/array structures for real-time visualization
     */
    enrichSteps(steps) {
        let lastKnownArray = null;
        let lastKnownArrName = null;

        return steps.map((step, idx) => {
            const vars = step.variables || {};

            // Helper to parse arrays from any language format
            const parseArray = (val) => {
                if (Array.isArray(val) && val.length > 0) return val;
                if (typeof val === 'string') {
                    const t = val.trim();
                    if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))) {
                        try {
                            const p = JSON.parse(t.replace(/^\{/, '[').replace(/\}$/, ']'));
                            if (Array.isArray(p)) return p;
                        } catch (e) {
                            const inner = t.slice(1, -1).split(',').map(s => Number(s.trim()));
                            if (inner.length > 0 && inner.every(n => !isNaN(n))) return inner;
                        }
                    }
                }
                return null;
            };

            // 1. Detect array state for visual bar representation
            for (const [key, val] of Object.entries(vars)) {
                const arr = parseArray(val);
                if (arr && arr.length > 0 && arr.some(x => typeof x === 'number')) {
                    step.arrayState = arr.map(x => (typeof x === 'number' ? x : Number(x) || 0));
                    step.arrayVarName = key;
                    lastKnownArray = step.arrayState;
                    lastKnownArrName = key;
                    break;
                }
            }

            // Carry over array state if current line is inside loop / function where array is still valid
            if (!step.arrayState && lastKnownArray) {
                step.arrayState = lastKnownArray;
                step.arrayVarName = lastKnownArrName;
            }

            // 2. Detect pointers (indices matching array bounds)
            if (step.arrayState) {
                const len = step.arrayState.length;
                const pointers = {};
                for (const [k, v] of Object.entries(vars)) {
                    let num = typeof v === 'number' ? v : (typeof v === 'string' && /^-?\d+$/.test(v) ? parseInt(v, 10) : null);
                    if (num !== null && num >= 0 && num < len && k !== step.arrayVarName) {
                        pointers[k] = num;
                    }
                }
                step.pointers = pointers;
            }

            return step;
        });
    }
};

window.CodeLabTracer = CodeLabTracer;
