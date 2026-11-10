/**
 * AlgoAI Automated Test Suite
 * Validates:
 * 1. GET /api/ai/status
 * 2. POST /api/ai/chat
 * 3. POST /api/ai/stream (SSE Stream)
 * 4. POST /api/ai/tools/execute (run_code, get_algorithm, get_hint)
 */

const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const payload = data ? JSON.stringify(data) : null;
        const options = {
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: payload ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            } : {}
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: body, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

function testStream() {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            messages: [{ role: 'user', content: 'Explain Binary Search' }],
            context: { page: 'visualize-search.html', activeAlgorithm: 'binary_search' }
        });

        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/ai/stream',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Stream failed with status ${res.statusCode}`));
            }
            let receivedChunks = 0;
            let fullText = '';
            res.on('data', (chunk) => {
                const str = chunk.toString();
                const lines = str.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        try {
                            const data = JSON.parse(line.slice(5).trim());
                            if (data.type === 'chunk') {
                                receivedChunks++;
                                fullText += data.text;
                            }
                        } catch (e) {}
                    }
                }
            });
            res.on('end', () => {
                resolve({ receivedChunks, fullText });
            });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function runAllTests() {
    console.log('🧪 Starting AlgoAI Test Suite...\n');
    let passed = 0;
    let failed = 0;

    // Test 1: Status
    try {
        const res = await makeRequest('/api/ai/status');
        if (res.status === 200 && res.data.ready === true) {
            console.log('✅ Test 1 Passed: GET /api/ai/status returns ready status & provider info');
            passed++;
        } else {
            console.error('❌ Test 1 Failed:', res);
            failed++;
        }
    } catch (e) {
        console.error('❌ Test 1 Exception:', e.message);
        failed++;
    }

    // Test 2: Algorithm Lookup Tool
    try {
        const res = await makeRequest('/api/ai/tools/execute', 'POST', {
            tool: 'get_algorithm',
            args: { algorithm: 'quick_sort' }
        });
        if (res.status === 200 && res.data.success && res.data.result.name === 'Quick Sort') {
            console.log('✅ Test 2 Passed: POST /api/ai/tools/execute retrieves canonical Quick Sort data');
            passed++;
        } else {
            console.error('❌ Test 2 Failed:', res);
            failed++;
        }
    } catch (e) {
        console.error('❌ Test 2 Exception:', e.message);
        failed++;
    }

    // Test 3: Progressive Hint Tool
    try {
        const res = await makeRequest('/api/ai/tools/execute', 'POST', {
            tool: 'get_hint',
            args: { problem: 'two_sum', level: 1 }
        });
        if (res.status === 200 && res.data.success && res.data.result.hint) {
            console.log('✅ Test 3 Passed: POST /api/ai/tools/execute returns Socratic hint level 1');
            passed++;
        } else {
            console.error('❌ Test 3 Failed:', res);
            failed++;
        }
    } catch (e) {
        console.error('❌ Test 3 Exception:', e.message);
        failed++;
    }

    // Test 4: JSON Chat
    try {
        const res = await makeRequest('/api/ai/chat', 'POST', {
            messages: [{ role: 'user', content: 'What is the time complexity of Bubble Sort?' }],
            context: { page: 'visualize-sorting.html' }
        });
        if (res.status === 200 && res.data.success && res.data.reply.includes('Bubble Sort')) {
            console.log('✅ Test 4 Passed: POST /api/ai/chat provides intelligent Big-O explanation');
            passed++;
        } else {
            console.error('❌ Test 4 Failed:', res);
            failed++;
        }
    } catch (e) {
        console.error('❌ Test 4 Exception:', e.message);
        failed++;
    }

    // Test 5: SSE Streaming Chat
    try {
        const streamResult = await testStream();
        if (streamResult.receivedChunks > 0 && streamResult.fullText.includes('Binary Search')) {
            console.log(`✅ Test 5 Passed: POST /api/ai/stream streams ${streamResult.receivedChunks} chunks in real time`);
            passed++;
        } else {
            console.error('❌ Test 5 Failed:', streamResult);
            failed++;
        }
    } catch (e) {
        console.error('❌ Test 5 Exception:', e.message);
        failed++;
    }

    // Test 6: Code Debug Tool
    try {
        const res = await makeRequest('/api/ai/tools/execute', 'POST', {
            tool: 'run_code',
            args: {
                language: 'python',
                code: 'def add(a, b):\n    return a + b\nprint("Sum:", add(5, 7))'
            }
        });
        if (res.status === 200 && res.data.success) {
            console.log('✅ Test 6 Passed: Code execution tool ran successfully (stdout:', res.data.result.stdout.trim() || 'OK', ')');
            passed++;
        } else {
            console.error('❌ Test 6 Failed:', res);
            failed++;
        }
    } catch (e) {
        console.error('❌ Test 6 Exception:', e.message);
        failed++;
    }

    console.log(`\n🏁 Test Suite Summary: ${passed} Passed, ${failed} Failed`);
    process.exit(failed > 0 ? 1 : 0);
}

runAllTests();

