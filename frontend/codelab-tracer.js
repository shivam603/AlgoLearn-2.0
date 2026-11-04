/**
 * CodeLab Execution Tracing Engine
 * Instruments and executes real user-written code step-by-step, generating structured trace events
 * for synchronized visualizers, breakpoints, and live state inspection.
 */

const CodeLabTracer = {
    MAX_OPERATIONS: 25000,

    /**
     * Parse and extract line statements to inject trace points
     */
    instrumentCode(userCode, options = {}) {
        const lines = userCode.split('\n');
        let instrumented = [];
        let functionDepthTracker = 0;

        instrumented.push(`
            const __traceEvents = [];
            let __opCount = 0;
            const __callStack = [{ name: 'global', line: 1, depth: 0 }];
            
            // Console redirect
            const console = {
                log: (...args) => {
                    const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                    __traceEvents.push({
                        type: 'log',
                        output: text,
                        line: __currentLine || 1,
                        callStack: JSON.parse(JSON.stringify(__callStack))
                    });
                },
                warn: (...args) => console.log('[WARN]', ...args),
                error: (...args) => console.log('[ERROR]', ...args),
                info: (...args) => console.log('[INFO]', ...args)
            };

            let __currentLine = 1;
            function __recordStep(lineNum, eventType, desc, vars = {}, activeIndices = []) {
                if (++__opCount > ${this.MAX_OPERATIONS}) {
                    throw new Error("Execution limit exceeded (" + ${this.MAX_OPERATIONS} + " steps). Possible infinite loop detected.");
                }
                __currentLine = lineNum;
                
                // Deep clone variables safely
                const sanitizedVars = {};
                for (let k in vars) {
                    if (k.startsWith('__')) continue;
                    try {
                        const val = vars[k];
                        if (typeof val === 'function') {
                            sanitizedVars[k] = '[Function ' + (val.name || 'anonymous') + ']';
                        } else if (val === undefined) {
                            sanitizedVars[k] = 'undefined';
                        } else if (val === null) {
                            sanitizedVars[k] = null;
                        } else if (Array.isArray(val)) {
                            sanitizedVars[k] = val.slice(0, 100);
                        } else if (typeof val === 'object') {
                            sanitizedVars[k] = JSON.parse(JSON.stringify(val));
                        } else {
                            sanitizedVars[k] = val;
                        }
                    } catch(e) {
                        sanitizedVars[k] = String(vars[k]);
                    }
                }

                // Detect active primary data structure (e.g. array, list, tree)
                let primaryArray = null;
                for (let k of ['arr', 'numbers', 'items', 'list', 'nums', 'data', 'queue', 'stack']) {
                    if (Array.isArray(sanitizedVars[k])) {
                        primaryArray = [...sanitizedVars[k]];
                        break;
                    }
                }
                if (!primaryArray) {
                    for (let k in sanitizedVars) {
                        if (Array.isArray(sanitizedVars[k])) {
                            primaryArray = [...sanitizedVars[k]];
                            break;
                        }
                    }
                }

                __traceEvents.push({
                    stepIndex: __traceEvents.length + 1,
                    line: lineNum,
                    eventType: eventType || 'line',
                    description: desc || ('Executing line ' + lineNum),
                    variables: sanitizedVars,
                    arrayState: primaryArray,
                    activeIndices: activeIndices || [],
                    callStack: JSON.parse(JSON.stringify(__callStack))
                });
            }
        `);

        // Line-by-line instrumenter
        for (let idx = 0; idx < lines.length; idx++) {
            const lineNum = idx + 1;
            const line = lines[idx];
            const trimmed = line.trim();

            // Skip empty lines or pure comment lines from instrumentation
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                instrumented.push(line);
                continue;
            }

            // Function call tracking
            if (trimmed.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/)) {
                const funcName = trimmed.match(/function\s+([a-zA-Z0-9_$]+)/)[1];
                instrumented.push(line);
                instrumented.push(`
                    __callStack.push({ name: '${funcName}', line: ${lineNum}, depth: __callStack.length });
                    __recordStep(${lineNum}, 'call', 'Enter function ${funcName}()', typeof varsSnapshot !== 'undefined' ? varsSnapshot() : {});
                `);
                continue;
            }

            // Function return tracking
            if (trimmed.startsWith('return ') || trimmed === 'return;' || trimmed === 'return') {
                instrumented.push(`
                    __recordStep(${lineNum}, 'return', 'Return statement', typeof varsSnapshot !== 'undefined' ? varsSnapshot() : {});
                    if (__callStack.length > 1) __callStack.pop();
                `);
                instrumented.push(line);
                continue;
            }

            // For statements: inject step check before the body
            if (trimmed.startsWith('for ') || trimmed.startsWith('for(') || trimmed.startsWith('while ') || trimmed.startsWith('while(')) {
                instrumented.push(`__recordStep(${lineNum}, 'loop', 'Loop condition evaluated', typeof varsSnapshot !== 'undefined' ? varsSnapshot() : {});`);
                instrumented.push(line);
                continue;
            }

            // If statements
            if (trimmed.startsWith('if ') || trimmed.startsWith('if(') || trimmed.startsWith('else if') || trimmed.startsWith('else')) {
                instrumented.push(`__recordStep(${lineNum}, 'branch', 'Evaluating conditional branch', typeof varsSnapshot !== 'undefined' ? varsSnapshot() : {});`);
                instrumented.push(line);
                continue;
            }

            // Standard line execution
            instrumented.push(line);
            // Don't inject between opening braces alone
            if (trimmed !== '{' && trimmed !== '}') {
                instrumented.push(`__recordStep(${lineNum}, 'line', 'Executed line ${lineNum}', typeof varsSnapshot !== 'undefined' ? varsSnapshot() : {});`);
            }
        }

        // Variable capture helper: extracts all visible local variable names in scope
        const varMatches = userCode.match(/(?:let|const|var)\s+([a-zA-Z0-9_$]+)/g) || [];
        const detectedVarNames = [...new Set(varMatches.map(m => m.split(/\s+/)[1]))];

        const varsSnapshotCode = `
            function varsSnapshot() {
                const s = {};
                ${detectedVarNames.map(v => `try { if (typeof ${v} !== 'undefined') s['${v}'] = ${v}; } catch(e){}`).join('\n')}
                return s;
            }
        `;

        instrumented.push(varsSnapshotCode);
        instrumented.push(`
            return __traceEvents;
        `);

        return instrumented.join('\n');
    },

    /**
     * Executes JavaScript user code and returns the full structured trace timeline
     */
    async traceJavaScript(userCode) {
        try {
            // First pass: syntax check
            new Function(userCode);
        } catch (syntaxErr) {
            return {
                success: false,
                error: {
                    type: 'SyntaxError',
                    message: syntaxErr.message,
                    line: this.extractLineNumber(syntaxErr) || 1
                },
                trace: []
            };
        }

        try {
            const instrumented = this.instrumentCode(userCode);
            // Execute in dedicated function scope
            const runner = new Function(instrumented);
            const traceEvents = runner();

            // Enrich events with array comparison & swap detection
            const enriched = this.enrichArrayOperations(traceEvents);

            return {
                success: true,
                trace: enriched,
                error: null
            };
        } catch (runtimeErr) {
            return {
                success: false,
                error: {
                    type: 'RuntimeError',
                    message: runtimeErr.message,
                    line: this.extractLineNumber(runtimeErr) || 1
                },
                trace: []
            };
        }
    },

    /**
     * Identifies comparisons and swaps between consecutive array states
     */
    enrichArrayOperations(steps) {
        if (!steps || steps.length === 0) return [];

        let lastArrayState = null;

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const vars = step.variables || {};

            // Identify pointers like i, j, minIdx, low, mid, high
            const pointers = {};
            for (let p of ['i', 'j', 'k', 'low', 'mid', 'high', 'left', 'right', 'minIdx', 'pi']) {
                if (typeof vars[p] === 'number') {
                    pointers[p] = vars[p];
                }
            }
            step.pointers = pointers;

            if (step.arrayState && Array.isArray(step.arrayState)) {
                const currentArr = step.arrayState;

                if (lastArrayState && lastArrayState.length === currentArr.length) {
                    const diffIndices = [];
                    for (let idx = 0; idx < currentArr.length; idx++) {
                        if (currentArr[idx] !== lastArrayState[idx]) {
                            diffIndices.push(idx);
                        }
                    }

                    // Exactly 2 indices changed -> swap!
                    if (diffIndices.length === 2) {
                        step.eventType = 'swap';
                        step.activeIndices = diffIndices;
                        step.description = `Swapped array[${diffIndices[0]}] (${currentArr[diffIndices[0]]}) and array[${diffIndices[1]}] (${currentArr[diffIndices[1]]})`;
                    } else if (diffIndices.length > 0) {
                        step.eventType = 'mutate';
                        step.activeIndices = diffIndices;
                        step.description = `Array updated at index ${diffIndices.join(', ')}`;
                    }
                }

                // If no swap detected but pointers are comparing
                if (step.eventType !== 'swap' && step.activeIndices.length === 0) {
                    if (typeof pointers.j === 'number' && typeof pointers.i === 'number') {
                        step.activeIndices = [pointers.j, pointers.j + 1];
                    } else if (typeof pointers.mid === 'number') {
                        step.activeIndices = [pointers.mid];
                    }
                }

                lastArrayState = [...currentArr];
            }
        }

        return steps;
    },

    extractLineNumber(err) {
        if (!err.stack) return 1;
        const match = err.stack.match(/<anonymous>:(\d+):(\d+)/) || err.stack.match(/:(\d+):(\d+)/);
        return match ? parseInt(match[1], 10) : 1;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeLabTracer;
}
