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
     * Enrich trace steps with multi-structure state (1D arrays, 2D matrices/DP tables,
     * dicts/hash maps, scalars, per-cell/per-element mutation diffs, and index pointers).
     */
    enrichSteps(steps) {
        let lastKnownArray = null;
        let lastKnownArrName = null;
        let lastKnownChangedIdx = [];
        let prevSnapshots = {};
        const everMutated = new Set();

        const PREFERRED_ARR_NAMES = /^(dp|memo|res|ans|out|result|merged|dist|pref|suf|left_?max|right_?max|stack|st|q|queue|heap|arr|a)$/i;
        const POINTER_VAR_NAMES = /^(i|j|k|l|r|m|p|q|idx|index|mid|low|lo|high|hi|left|right|start|end|slow|fast|curr|cur|prev|top|ptr|pos|row|col|step)$/i;

        const tryParseCollection = (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
                const t = val.trim();
                if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))) {
                    try {
                        const normalized = t
                            .replace(/^\{/, '[').replace(/\}$/, ']')
                            .replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null')
                            .replace(/'([^']*)'/g, '"$1"');
                        const parsed = JSON.parse(normalized);
                        if (Array.isArray(parsed)) return parsed;
                    } catch (e) {
                        const inner = t.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
                        if (inner.length > 0 && inner.every(s => /^-?\d+(\.\d+)?$/.test(s))) {
                            return inner.map(Number);
                        }
                    }
                }
            }
            return null;
        };

        const isNodeObject = (v) => {
            if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
            if (v.__type__ === 'ListNode' || v.__type__ === 'TreeNode') return true;
            return ('val' in v && ('next' in v || ('left' in v && 'right' in v)));
        };

        return steps.map((step) => {
            const vars = step.variables || {};
            const arrays1D = [];
            const matrices2D = [];
            const dicts = [];
            const scalars = [];
            const changedVars = [];
            const curSnapshots = {};

            for (const [key, rawVal] of Object.entries(vars)) {
                if (typeof rawVal === 'string' && (rawVal.startsWith('<function ') || rawVal.startsWith('<class ') || rawVal.startsWith('<module ') || rawVal.startsWith('[Function'))) {
                    continue;
                }
                if (key === '_dbg_a0') continue;

                let snap = '';
                try { snap = JSON.stringify(rawVal); } catch (e) { snap = String(rawVal); }
                curSnapshots[key] = snap;
                const varChanged = prevSnapshots[key] !== undefined && prevSnapshots[key] !== snap;
                const justCreated = prevSnapshots[key] === undefined && key !== '<return>';
                if (varChanged) {
                    changedVars.push(key);
                    everMutated.add(key);
                }

                // A. Scalar primitive
                if (rawVal === null || typeof rawVal === 'number' || typeof rawVal === 'boolean' || (typeof rawVal === 'string' && !tryParseCollection(rawVal))) {
                    let prevParsed;
                    if (varChanged && prevSnapshots[key] !== undefined) {
                        try { prevParsed = JSON.parse(prevSnapshots[key]); } catch (e) { prevParsed = prevSnapshots[key]; }
                    }
                    scalars.push({
                        name: key,
                        value: rawVal,
                        prevValue: prevParsed,
                        changed: varChanged || (key === '<return>' && rawVal !== null)
                    });
                    continue;
                }

                // B. 1D or 2D array / matrix
                const parsedArr = tryParseCollection(rawVal);
                if (parsedArr && parsedArr.length > 0) {
                    if (Array.isArray(parsedArr[0])) {
                        // 2D Matrix / DP table / Grid
                        let prevRows = null;
                        if (prevSnapshots[key]) {
                            try { prevRows = JSON.parse(prevSnapshots[key]); } catch (e) { prevRows = null; }
                        }
                        const changedCells = [];
                        if (Array.isArray(prevRows)) {
                            for (let r = 0; r < parsedArr.length; r++) {
                                const row = parsedArr[r];
                                if (!Array.isArray(row)) continue;
                                for (let c = 0; c < row.length; c++) {
                                    const pv = prevRows[r] ? prevRows[r][c] : undefined;
                                    if (JSON.stringify(row[c]) !== JSON.stringify(pv)) {
                                        changedCells.push(`${r},${c}`);
                                    }
                                }
                            }
                        }
                        matrices2D.push({
                            name: key,
                            rows: parsedArr,
                            prevRows: Array.isArray(prevRows) ? prevRows : null,
                            changedCells,
                            changed: varChanged || changedCells.length > 0,
                            hasMutatedBefore: everMutated.has(key)
                        });
                    } else {
                        // 1D Array
                        let prevArr = null;
                        if (prevSnapshots[key]) {
                            try {
                                const p = tryParseCollection(JSON.parse(prevSnapshots[key]));
                                if (Array.isArray(p)) prevArr = p;
                            } catch (e) {}
                        }
                        const changedIndices = [];
                        if (Array.isArray(prevArr)) {
                            for (let idx = 0; idx < parsedArr.length; idx++) {
                                if (JSON.stringify(parsedArr[idx]) !== JSON.stringify(prevArr[idx])) {
                                    changedIndices.push(idx);
                                }
                            }
                        }
                        const isNumeric = parsedArr.some(x => typeof x === 'number' && !Number.isNaN(x));
                        arrays1D.push({
                            name: key,
                            values: parsedArr,
                            prevValues: prevArr,
                            changedIndices,
                            isNumeric,
                            changed: varChanged || changedIndices.length > 0,
                            justCreated,
                            hasMutatedBefore: everMutated.has(key)
                        });
                    }
                    continue;
                }

                // C. Plain Dictionary / Hash Map (exclude TreeNode/ListNode instances)
                if (rawVal && typeof rawVal === 'object' && !Array.isArray(rawVal) && !isNodeObject(rawVal) && rawVal.__type__ !== 'module') {
                    let prevDict = null;
                    if (prevSnapshots[key]) {
                        try { prevDict = JSON.parse(prevSnapshots[key]); } catch (e) {}
                    }
                    const entries = Object.entries(rawVal).filter(([dk]) => dk !== '__type__' && dk !== '...');
                    const changedKeys = [];
                    if (prevDict && typeof prevDict === 'object') {
                        for (const [dk, dv] of entries) {
                            if (JSON.stringify(dv) !== JSON.stringify(prevDict[dk])) changedKeys.push(dk);
                        }
                    }
                    if (entries.length > 0 || key.match(/map|seen|dict|freq|count|memo|dp|cache|adj/i)) {
                        dicts.push({ name: key, entries, changedKeys, changed: varChanged || changedKeys.length > 0 });
                    }
                }
            }

            // Rank arrays1D so active/mutated/working arrays appear BEFORE static input arrays
            const scoredArrays = arrays1D.slice().sort((a, b) => {
                const score = (x) => {
                    let s = 0;
                    if (x.changed) s += 100;
                    if (x.hasMutatedBefore) s += 60;
                    if (PREFERRED_ARR_NAMES.test(x.name)) s += 30;
                    if (x.isNumeric) s += 15;
                    if (x.justCreated && !/^(nums|height|prices|coins)$/i.test(x.name)) s += 10;
                    return s;
                };
                return score(b) - score(a);
            });

            // Rank matrices2D so recently mutated DP/grid comes first
            matrices2D.sort((a, b) => {
                const sa = (a.changed ? 100 : 0) + (a.hasMutatedBefore ? 50 : 0) + (/^(dp|memo|grid|board|matrix)$/i.test(a.name) ? 20 : 0);
                const sb = (b.changed ? 100 : 0) + (b.hasMutatedBefore ? 50 : 0) + (/^(dp|memo|grid|board|matrix)$/i.test(b.name) ? 20 : 0);
                return sb - sa;
            });

            step.arrays1D = scoredArrays;
            step.matrices2D = matrices2D;
            step.dicts = dicts;
            step.scalars = scalars;
            step.changedVars = changedVars;

            // Preserve compatible step.arrayState / step.arrayVarName / step.activeIndices / step.pointers
            if (scoredArrays.length > 0 && scoredArrays[0].isNumeric) {
                const top = scoredArrays[0];
                step.arrayState = top.values.map(x => (typeof x === 'number' ? x : Number(x) || 0));
                step.arrayVarName = top.name;
                step.changedIndices = top.changedIndices;
                if (top.changedIndices.length > 0 && (!step.activeIndices || step.activeIndices.length === 0)) {
                    step.activeIndices = top.changedIndices.slice();
                }
                lastKnownArray = step.arrayState;
                lastKnownArrName = step.arrayVarName;
                lastKnownChangedIdx = top.changedIndices;
            } else if (!step.arrayState && lastKnownArray && matrices2D.length === 0) {
                step.arrayState = lastKnownArray;
                step.arrayVarName = lastKnownArrName;
                step.changedIndices = [];
            }

            // Detect pointers accurately (prioritize canonical index variable names)
            const ptrMap = {};
            const allScalarInts = [];
            for (const [k, v] of Object.entries(vars)) {
                const num = typeof v === 'number' && Number.isInteger(v)
                    ? v
                    : (typeof v === 'string' && /^-?\d+$/.test(v) ? parseInt(v, 10) : null);
                if (num !== null) {
                    allScalarInts.push([k, num]);
                    if (step.arrayState && num >= 0 && num < step.arrayState.length && k !== step.arrayVarName) {
                        if (POINTER_VAR_NAMES.test(k)) {
                            ptrMap[k] = num;
                        }
                    }
                }
            }
            if (step.arrayState && Object.keys(ptrMap).length === 0) {
                for (const [k, num] of allScalarInts) {
                    if (num >= 0 && num < step.arrayState.length && k !== step.arrayVarName && !/^(ans|res|best|sum|total|profit|max|min|m|n|gap|count|cnt|water|lMax|rMax|curSum|maxSum|currSum|area)$/i.test(k)) {
                        ptrMap[k] = num;
                    }
                }
            }
            step.allScalarInts = Object.fromEntries(allScalarInts);
            step.pointers = ptrMap;

            // Update snapshot map only for non-empty variable scopes (avoid wiping across tiny __init__ frames)
            if (Object.keys(curSnapshots).length > 0 && !(step.function && step.function.startsWith('_dbg_'))) {
                prevSnapshots = { ...prevSnapshots, ...curSnapshots };
            }

            return step;
        });
    }
};

window.CodeLabTracer = CodeLabTracer;
