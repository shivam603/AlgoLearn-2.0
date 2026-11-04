/**
 * CodeLab Isolated Web Worker
 * Executes user code safely off the main browser UI thread with execution timeouts and infinite loop guards.
 */

importScripts('codelab-tracer.js');

self.onmessage = async function (e) {
    const { action, code, language, options } = e.data;

    if (action === 'RUN_TRACE') {
        try {
            if (language === 'javascript' || language === 'js') {
                const result = await CodeLabTracer.traceJavaScript(code);
                self.postMessage({
                    type: 'RESULT',
                    success: result.success,
                    trace: result.trace,
                    error: result.error
                });
            } else {
                // Non-JS fallback/mock tracer: translates structure to visual simulation
                self.postMessage({
                    type: 'RESULT',
                    success: true,
                    trace: generateGenericTrace(code, language),
                    error: null
                });
            }
        } catch (err) {
            self.postMessage({
                type: 'RESULT',
                success: false,
                error: {
                    type: 'ExecutionError',
                    message: err.message,
                    line: 1
                },
                trace: []
            });
        }
    }
};

function generateGenericTrace(code, lang) {
    const lines = code.split('\n');
    const trace = [];
    let dummyArr = [45, 12, 85, 32, 89, 39, 69, 22];

    for (let i = 0; i < Math.min(lines.length, 30); i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('//') || line.startsWith('#')) continue;

        trace.push({
            stepIndex: trace.length + 1,
            line: i + 1,
            eventType: 'line',
            description: `[${lang.toUpperCase()}] Executed line ${i + 1}`,
            variables: { line: i + 1, status: 'Simulated Execution' },
            arrayState: [...dummyArr],
            activeIndices: [i % dummyArr.length],
            callStack: [{ name: 'main', line: i + 1, depth: 1 }]
        });
    }
    return trace;
}
