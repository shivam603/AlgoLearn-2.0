/**
 * AlgoLearn CodeLab Automated Coding Judge & Empirical Complexity Profiler
 * Supports 100 Curated LeetCode Problems (30 Easy / 40 Medium / 30 Hard)
 * across Python, JavaScript, Java, C++, and C.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec, spawnSync } = require('child_process');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const { PROBLEMS, COUNTS } = require('./problems');
const {
    compareTestOutput,
    buildPythonHarness,
    buildJavaScriptHarness,
    buildJavaHarness,
    buildCppHarness,
    buildCHarness,
    generateScaledInputsForProblem,
    buildPythonProfileScript,
    buildJavaScriptProfileScript
} = require('./codelab-harness');

function resolvePythonBin() {
    try {
        if (spawnSync('python', ['--version'], { stdio: 'ignore' }).status === 0) return 'python';
    } catch (e) {}
    return 'python3';
}
const PYTHON_BIN = resolvePythonBin();

function getProblemById(problemId) {
    return PROBLEMS.find(p => p.id === problemId) || null;
}

function getPublicProblems(solvedIds = []) {
    const solvedSet = new Set(solvedIds || []);
    return PROBLEMS.map(p => ({
        id: p.id,
        leetcodeId: p.leetcodeId,
        title: p.title,
        difficulty: p.difficulty,
        topic: p.topic,
        xpReward: p.xpReward,
        optimalTime: p.optimalTime,
        optimalSpace: p.optimalSpace,
        description: p.description,
        examples: p.examples,
        constraints: p.constraints,
        vis: p.vis || { type: 'array', studio: 'visualize-ds.html', studioLabel: 'Data Structure Visualizer' },
        io: p.io ? {
            pyFn: p.io.pyFn,
            jsFn: p.io.jsFn,
            javaMethod: p.io.javaMethod,
            cppMethod: p.io.cppMethod,
            cFn: p.io.cFn,
            params: p.io.params,
            returnType: p.io.returnType
        } : null,
        duelSkeletons: p.duelSkeletons,
        starterCode: p.starterCode,
        visibleTests: p.tests.filter(tc => !tc.hidden),
        hiddenCount: p.tests.filter(tc => tc.hidden).length,
        totalTests: p.tests.length,
        solved: solvedSet.has(p.id)
    }));
}

function normalizeLanguage(lang) {
    const l = String(lang || 'python').toLowerCase().trim();
    if (l === 'py' || l === 'python') return 'python';
    if (l === 'js' || l === 'javascript') return 'javascript';
    if (l === 'java') return 'java';
    if (l === 'cpp' || l === 'c++') return 'cpp';
    if (l === 'c') return 'c';
    return 'python';
}

function execPromise(cmd, cwd, timeoutMs = 6000) {
    return new Promise((resolve) => {
        exec(cmd, { cwd, timeout: timeoutMs, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
            resolve({ err, stdout: stdout || '', stderr: stderr || '' });
        });
    });
}

async function judgeCode({ problemId, language, code }) {
    const problem = getProblemById(problemId);
    if (!problem) {
        return { success: false, verdict: 'Error', error: `Unknown problem: ${problemId}` };
    }
    const lang = normalizeLanguage(language);
    if (!code || !String(code).trim()) {
        return { success: false, verdict: 'Compilation Error', error: 'Source code cannot be empty.' };
    }

    const tmpDir = path.join(os.tmpdir(), `algolearn_judge_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    const startWall = Date.now();

    try {
        let runRes;
        if (lang === 'python') {
            fs.writeFileSync(path.join(tmpDir, 'judge_main.py'), buildPythonHarness(problem, code, problem.tests), 'utf8');
            runRes = await execPromise(`${PYTHON_BIN} judge_main.py`, tmpDir, 6000);
        } else if (lang === 'javascript') {
            fs.writeFileSync(path.join(tmpDir, 'judge_main.js'), buildJavaScriptHarness(problem, code, problem.tests), 'utf8');
            runRes = await execPromise('node judge_main.js', tmpDir, 6000);
        } else if (lang === 'java') {
            fs.writeFileSync(path.join(tmpDir, 'JudgeRunner.java'), buildJavaHarness(problem, code, problem.tests), 'utf8');
            const comp = await execPromise('javac JudgeRunner.java', tmpDir, 9000);
            if (comp.err) {
                return {
                    success: true,
                    problemId: problem.id,
                    language: lang,
                    verdict: 'Compilation Error',
                    passedCount: 0,
                    totalCount: problem.tests.length,
                    runtimeMs: Date.now() - startWall,
                    error: (comp.stderr || comp.stdout || comp.err.message).trim(),
                    results: []
                };
            }
            runRes = await execPromise('java JudgeRunner', tmpDir, 6000);
        } else if (lang === 'cpp') {
            fs.writeFileSync(path.join(tmpDir, 'judge_main.cpp'), buildCppHarness(problem, code, problem.tests), 'utf8');
            const exeName = process.platform === 'win32' ? 'judge_main.exe' : './judge_main';
            const comp = await execPromise('g++ -O2 judge_main.cpp -o judge_main', tmpDir, 12000);
            if (comp.err) {
                return {
                    success: true,
                    problemId: problem.id,
                    language: lang,
                    verdict: 'Compilation Error',
                    passedCount: 0,
                    totalCount: problem.tests.length,
                    runtimeMs: Date.now() - startWall,
                    error: (comp.stderr || comp.stdout || comp.err.message).trim(),
                    results: []
                };
            }
            runRes = await execPromise(exeName, tmpDir, 6000);
        } else if (lang === 'c') {
            fs.writeFileSync(path.join(tmpDir, 'judge_main.c'), buildCHarness(problem, code, problem.tests), 'utf8');
            const exeName = process.platform === 'win32' ? 'judge_main.exe' : './judge_main';
            const comp = await execPromise('gcc -O2 judge_main.c -o judge_main', tmpDir, 10000);
            if (comp.err) {
                return {
                    success: true,
                    problemId: problem.id,
                    language: lang,
                    verdict: 'Compilation Error',
                    passedCount: 0,
                    totalCount: problem.tests.length,
                    runtimeMs: Date.now() - startWall,
                    error: (comp.stderr || comp.stdout || comp.err.message).trim(),
                    results: []
                };
            }
            runRes = await execPromise(exeName, tmpDir, 6000);
        }

        const resultPath = path.join(tmpDir, 'result.json');
        if (!fs.existsSync(resultPath)) {
            const errMsg = (runRes && (runRes.stderr || runRes.stdout || (runRes.err && runRes.err.message))) || 'Execution failed without output';
            const isTimeout = Boolean(runRes && runRes.err && runRes.err.killed);
            return {
                success: true,
                problemId: problem.id,
                language: lang,
                verdict: isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
                passedCount: 0,
                totalCount: problem.tests.length,
                runtimeMs: Date.now() - startWall,
                error: errMsg.trim(),
                results: []
            };
        }

        const rawResults = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
        let passedCount = 0;
        let totalRuntimeMs = 0;

        const results = problem.tests.map((tc, idx) => {
            const item = rawResults[idx] || { ok: false, error: 'Not executed' };
            const rt = Number(item.runtimeMs || 0);
            totalRuntimeMs += rt;

            const passed = item.ok ? compareTestOutput(problem, tc, item.actual) : false;
            if (passed) passedCount++;

            return {
                id: tc.id,
                name: tc.name,
                hidden: tc.hidden,
                passed,
                inputDisplay: tc.hidden ? 'Hidden Test Input' : JSON.stringify(tc.input),
                expectedDisplay: tc.hidden ? 'Hidden' : JSON.stringify(tc.expected),
                actualDisplay: item.ok ? JSON.stringify(item.actual) : (item.error || 'Error'),
                runtimeMs: Math.round(rt * 1000) / 1000,
                error: item.ok ? null : item.error
            };
        });

        const verdict = passedCount === problem.tests.length
            ? 'Accepted'
            : results.some(r => r.error) ? 'Runtime Error' : 'Wrong Answer';

        return {
            success: true,
            problemId: problem.id,
            leetcodeId: problem.leetcodeId,
            title: problem.title,
            language: lang,
            verdict,
            passedCount,
            totalCount: problem.tests.length,
            runtimeMs: Math.max(1, Math.round(totalRuntimeMs * 100) / 100),
            xpReward: verdict === 'Accepted' ? problem.xpReward : 0,
            optimalTime: problem.optimalTime,
            optimalSpace: problem.optimalSpace,
            results
        };
    } catch (err) {
        return {
            success: false,
            verdict: 'Runtime Error',
            error: err.message,
            results: []
        };
    } finally {
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
    }
}

// ============================================================================
// Empirical Big-O Complexity Profiler
// ============================================================================

function classifyComplexityFromPoints(points) {
    if (!Array.isArray(points) || points.length < 3) {
        return { estimated: 'O(n)', r2: 0.9, note: 'Insufficient points for multi-point regression.' };
    }

    const ns = points.map(p => Math.max(2, p.n));
    const ys = points.map(p => Math.max(1, Number(p.ops || p.timeMs || 1)));

    const models = [
        { name: 'O(1)', fn: () => 1 },
        { name: 'O(log n)', fn: (n) => Math.log2(n) },
        { name: 'O(n)', fn: (n) => n },
        { name: 'O(n log n)', fn: (n) => n * Math.log2(n) },
        { name: 'O(n²)', fn: (n) => n * n }
    ];

    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    if (maxY / Math.max(1, minY) <= 1.35 && ns[ns.length - 1] / ns[0] >= 4) {
        return { estimated: 'O(1)', r2: 0.99, note: 'Operations remain constant as input grows.' };
    }

    const yRatio = ys[ys.length - 1] / Math.max(1, ys[0]);
    if (ns[ns.length - 1] <= 35 && yRatio > 500) {
        return { estimated: 'O(2^n)', r2: 0.98, note: 'Exponential branching growth detected across small N.' };
    }

    let best = { name: 'O(n)', r2: -Infinity };
    const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
    const ssTot = ys.reduce((a, y) => a + Math.pow(y - meanY, 2), 0) || 1;

    for (const m of models) {
        if (m.name === 'O(1)') continue;
        const xs = ns.map(m.fn);
        const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
        let num = 0, den = 0;
        for (let i = 0; i < xs.length; i++) {
            num += (xs[i] - meanX) * (ys[i] - meanY);
            den += Math.pow(xs[i] - meanX, 2);
        }
        if (den === 0 || num <= 0) continue;
        const slope = num / den;
        const intercept = meanY - slope * meanX;
        let ssRes = 0;
        for (let i = 0; i < xs.length; i++) {
            const pred = slope * xs[i] + intercept;
            ssRes += Math.pow(ys[i] - pred, 2);
        }
        const r2 = 1 - ssRes / ssTot;
        if (r2 > best.r2) {
            best = { name: m.name, r2 };
        }
    }

    return {
        estimated: best.name,
        r2: Math.max(0, Math.min(1, Math.round(best.r2 * 1000) / 1000)),
        note: `Fitted against scaled inputs N = [${ns.join(', ')}].`
    };
}

function instrumentJavaScriptForStepCount(userCode) {
    try {
        const ast = parser.parse(userCode, { sourceType: 'script', errorRecovery: true });
        traverse(ast, {
            Loop(pathNode) {
                const inc = t.expressionStatement(t.updateExpression('++', t.identifier('__ops__')));
                if (!t.isBlockStatement(pathNode.node.body)) {
                    pathNode.node.body = t.blockStatement([inc, pathNode.node.body]);
                } else {
                    pathNode.node.body.body.unshift(inc);
                }
            },
            Function(pathNode) {
                const inc = t.expressionStatement(t.updateExpression('++', t.identifier('__ops__')));
                if (t.isBlockStatement(pathNode.node.body)) {
                    pathNode.node.body.body.unshift(inc);
                }
            }
        });
        return generate(ast).code;
    } catch (e) {
        return userCode;
    }
}

async function profileCode({ problemId, language, code }) {
    const lang = normalizeLanguage(language);
    const problem = getProblemById(problemId);

    if (!problem) {
        const lines = String(code || '').split('\n');
        let maxLoopDepth = 0;
        let currDepth = 0;
        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (/^\b(for|while)\b/.test(line)) {
                currDepth++;
                if (currDepth > maxLoopDepth) maxLoopDepth = currDepth;
            }
            if (line === '}' && currDepth > 0) currDepth--;
        }
        const hasSort = /\.sort\(|Arrays\.sort|std::sort|\bqsort\b/.test(code || '');
        let est = 'O(1)';
        if (maxLoopDepth >= 2) est = 'O(n^2)';
        else if (hasSort) est = 'O(n log n)';
        else if (maxLoopDepth === 1) est = 'O(n)';
        const ns = [10, 25, 50, 100, 200];
        const fn = est === 'O(n^2)' ? n => n * n : est === 'O(n log n)' ? n => Math.round(n * Math.log2(n)) : est === 'O(n)' ? n => n : () => 5;
        return {
            success: true,
            mode: 'heuristic-custom',
            estimatedComplexity: est,
            r2: 0.95,
            optimalTime: 'Depends on problem',
            advice: `Detected loop nesting depth = ${maxLoopDepth}${hasSort ? ' with sorting' : ''}. Switch to Problems mode for empirical live benchmarking!`,
            points: ns.map(n => ({ n, ops: fn(n), timeMs: Math.round((fn(n) / 500) * 100) / 100 }))
        };
    }

    const sizes = problem.profileSizes || [20, 60, 120, 240, 480];
    const scaled = generateScaledInputsForProblem(problem, sizes);
    const tmpDir = path.join(os.tmpdir(), `algolearn_prof_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    try {
        if (lang === 'python') {
            const script = buildPythonProfileScript(problem, code, scaled);
            fs.writeFileSync(path.join(tmpDir, 'prof.py'), script, 'utf8');
            await execPromise(`${PYTHON_BIN} prof.py`, tmpDir, 7000);
        } else if (lang === 'javascript') {
            const instrCode = instrumentJavaScriptForStepCount(code);
            const script = buildJavaScriptProfileScript(problem, instrCode, scaled);
            fs.writeFileSync(path.join(tmpDir, 'prof.js'), script, 'utf8');
            await execPromise('node prof.js', tmpDir, 7000);
        } else {
            const judgeCases = scaled.map((item, idx) => ({ id: idx + 1, name: `N=${item.n}`, hidden: false, input: item.input, expected: null }));
            if (lang === 'java') {
                fs.writeFileSync(path.join(tmpDir, 'JudgeRunner.java'), buildJavaHarness(problem, code, judgeCases), 'utf8');
                const comp = await execPromise('javac JudgeRunner.java', tmpDir, 9000);
                if (!comp.err) await execPromise('java JudgeRunner', tmpDir, 6000);
            } else if (lang === 'cpp') {
                fs.writeFileSync(path.join(tmpDir, 'judge_main.cpp'), buildCppHarness(problem, code, judgeCases), 'utf8');
                const exe = process.platform === 'win32' ? 'judge_main.exe' : './judge_main';
                const comp = await execPromise('g++ -O2 judge_main.cpp -o judge_main', tmpDir, 12000);
                if (!comp.err) await execPromise(exe, tmpDir, 6000);
            } else if (lang === 'c') {
                fs.writeFileSync(path.join(tmpDir, 'judge_main.c'), buildCHarness(problem, code, judgeCases), 'utf8');
                const exe = process.platform === 'win32' ? 'judge_main.exe' : './judge_main';
                const comp = await execPromise('gcc -O2 judge_main.c -o judge_main', tmpDir, 10000);
                if (!comp.err) await execPromise(exe, tmpDir, 6000);
            }
            const resFile = path.join(tmpDir, 'result.json');
            if (fs.existsSync(resFile)) {
                const raw = JSON.parse(fs.readFileSync(resFile, 'utf8'));
                const pts = scaled.map((item, idx) => {
                    const rt = Math.max(0.001, Number(raw[idx]?.runtimeMs || 0.001));
                    return { n: item.n, ops: Math.round(rt * 1000), timeMs: Math.round(rt * 1000) / 1000 };
                });
                fs.writeFileSync(path.join(tmpDir, 'profile.json'), JSON.stringify(pts), 'utf8');
            }
        }

        const profPath = path.join(tmpDir, 'profile.json');
        if (!fs.existsSync(profPath)) {
            return { success: false, error: 'Profiler could not execute code. Check for syntax/compile errors first.' };
        }

        const points = JSON.parse(fs.readFileSync(profPath, 'utf8'));
        const fit = classifyComplexityFromPoints(points);

        const isOptimal = fit.estimated === problem.optimalTime ||
            (problem.optimalTime === 'O(n)' && (fit.estimated === 'O(1)' || fit.estimated === 'O(log n)')) ||
            (problem.optimalTime === 'O(n log n)' && (fit.estimated === 'O(n)' || fit.estimated === 'O(n log n)'));

        const advice = isOptimal
            ? `Great job! Your empirical growth matches ${fit.estimated}, meeting the optimal ${problem.optimalTime} target.`
            : `Empirical measurements suggest ${fit.estimated} scaling. Can you optimize toward ${problem.optimalTime}?`;

        return {
            success: true,
            mode: 'empirical',
            problemId: problem.id,
            language: lang,
            estimatedComplexity: fit.estimated,
            r2: fit.r2,
            optimalTime: problem.optimalTime,
            optimalSpace: problem.optimalSpace,
            isOptimal,
            advice,
            points
        };
    } catch (err) {
        return { success: false, error: err.message };
    } finally {
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
    }
}

module.exports = {
    PROBLEMS,
    COUNTS,
    getProblemById,
    getPublicProblems,
    judgeCode,
    profileCode
};
