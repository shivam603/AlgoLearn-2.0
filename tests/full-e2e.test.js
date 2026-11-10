/**
 * AlgoLearn End-to-End Test Suite (Implementations 1, 2 & 3)
 * Verifies Auth, AI Threads, Automated Judge, Empirical Big-O Profiler,
 * Gamification/Leaderboard, Dashboard HTML, and Socket.IO 1v1 Multiplayer Duels.
 */

const assert = require('assert');
const http = require('http');
const { io } = require('socket.io-client');

const BASE_PORT = Number(process.env.PORT || 3000);
const BASE_URL = `http://localhost:${BASE_PORT}`;

function req(path, method = 'GET', body = null, token = null) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const headers = {};
        if (payload) {
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = Buffer.byteLength(payload);
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const r = http.request({
            hostname: 'localhost',
            port: BASE_PORT,
            path,
            method,
            headers
        }, (res) => {
            let raw = '';
            res.on('data', c => raw += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(raw), raw });
                } catch (e) {
                    resolve({ status: res.statusCode, data: null, raw });
                }
            });
        });
        r.on('error', reject);
        if (payload) r.write(payload);
        r.end();
    });
}

async function run() {
    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        try {
            await fn();
            console.log(`✅ ${name}`);
            passed++;
        } catch (err) {
            console.error(`❌ ${name}: ${err.message}`);
            failed++;
        }
    }

    let token = '';
    let problems = [];

    await test('Unauthenticated protected endpoints return 401', async () => {
        const t = await req('/api/ai/threads');
        const g = await req('/api/gamification/me');
        assert.strictEqual(t.status, 401);
        assert.strictEqual(g.status, 401);
    });

    await test('Login with seeded account dev/algo123 succeeds', async () => {
        const res = await req('/api/auth/login', 'POST', { identity: 'dev', password: 'algo123' });
        assert.strictEqual(res.status, 200);
        assert(res.data && res.data.success && res.data.token);
        token = res.data.token;
    });

    await test('AI Threads CRUD persists & deletes cleanly', async () => {
        const tid = 'test_thread_' + Date.now();
        const post = await req('/api/ai/threads', 'POST', {
            id: tid,
            title: 'E2E Test Thread',
            messages: [{ role: 'user', content: 'Hello AlgoAI' }]
        }, token);
        assert.strictEqual(post.status, 200);
        assert(post.data.success);

        const list = await req('/api/ai/threads', 'GET', null, token);
        assert(list.data.threads.some(t => t.id === tid));

        const del = await req(`/api/ai/threads/${encodeURIComponent(tid)}`, 'DELETE', null, token);
        assert.strictEqual(del.status, 200);
        assert(del.data.success);
    });

    await test('GET /api/codelab/problems returns 100 problems (30 Easy / 40 Medium / 30 Hard)', async () => {
        const res = await req('/api/codelab/problems', 'GET', null, token);
        assert.strictEqual(res.status, 200);
        assert(res.data.success);
        assert.deepStrictEqual(res.data.counts, { total: 100, Easy: 30, Medium: 40, Hard: 30 });
        problems = res.data.problems;
        assert.strictEqual(problems.length, 100);
        assert.strictEqual(problems.filter(p => p.difficulty === 'Easy').length, 30);
        assert.strictEqual(problems.filter(p => p.difficulty === 'Medium').length, 40);
        assert.strictEqual(problems.filter(p => p.difficulty === 'Hard').length, 30);
        for (const p of problems) {
            assert(p.leetcodeId > 0, `Missing leetcodeId on ${p.id}`);
            assert(p.vis && p.vis.type, `Missing vis metadata on ${p.id}`);
            assert(p.duelSkeletons && p.duelSkeletons.python && p.duelSkeletons.java, `Missing duelSkeletons on ${p.id}`);
            assert(p.starterCode && p.starterCode.python && p.starterCode.javascript && p.starterCode.java && p.starterCode.cpp && p.starterCode.c, `Missing starterCode on ${p.id}`);
        }
    });

    await test('Judge accepts valid Python two_sum solution & awards gamification state', async () => {
        const twoSum = problems.find(p => p.id === 'two_sum');
        const res = await req('/api/codelab/judge', 'POST', {
            problemId: 'two_sum',
            language: 'python',
            code: twoSum.starterCode.python
        }, token);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.verdict, 'Accepted');
        assert.strictEqual(res.data.passedCount, res.data.totalCount);
        assert(res.data.gamification && res.data.gamification.profile);
    });

    await test('Judge accepts Medium (C++) & Hard (Java) problems cleanly', async () => {
        const med = problems.find(p => p.id === 'coin_change');
        const medRes = await req('/api/codelab/judge', 'POST', {
            problemId: med.id,
            language: 'cpp',
            code: med.starterCode.cpp
        }, token);
        assert.strictEqual(medRes.status, 200);
        assert.strictEqual(medRes.data.verdict, 'Accepted');

        const hard = problems.find(p => p.id === 'trapping_rain_water');
        const hardRes = await req('/api/codelab/judge', 'POST', {
            problemId: hard.id,
            language: 'java',
            code: hard.starterCode.java
        }, token);
        assert.strictEqual(hardRes.status, 200);
        assert.strictEqual(hardRes.data.verdict, 'Accepted');
    });

    await test('Judge detects Wrong Answer cleanly', async () => {
        const res = await req('/api/codelab/judge', 'POST', {
            problemId: 'two_sum',
            language: 'python',
            code: 'def two_sum(nums, target):\n    return [0, 0]'
        }, token);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.verdict, 'Wrong Answer');
        assert(res.data.passedCount < res.data.totalCount);
    });

    await test('Judge detects Compilation Error in Java cleanly', async () => {
        const res = await req('/api/codelab/judge', 'POST', {
            problemId: 'valid_parentheses',
            language: 'java',
            code: 'class Solution { public boolean isValid(String s) { broken syntax } }'
        }, token);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.verdict, 'Compilation Error');
    });

    await test('Empirical Big-O Profiler measures O(log n) for Python binary_search', async () => {
        const bs = problems.find(p => p.id === 'binary_search');
        const res = await req('/api/codelab/profile', 'POST', {
            problemId: 'binary_search',
            language: 'python',
            code: bs.starterCode.python
        });
        assert.strictEqual(res.status, 200);
        assert(res.data.success);
        assert.strictEqual(res.data.estimatedComplexity, 'O(log n)');
        assert(res.data.points.length >= 4);
    });

    await test('Empirical Big-O Profiler measures O(n) for JS two_sum', async () => {
        const ts = problems.find(p => p.id === 'two_sum');
        const res = await req('/api/codelab/profile', 'POST', {
            problemId: 'two_sum',
            language: 'javascript',
            code: ts.starterCode.javascript
        });
        assert.strictEqual(res.status, 200);
        assert(res.data.success);
        assert.strictEqual(res.data.estimatedComplexity, 'O(n)');
    });

    await test('Gamification profile, XP event & global leaderboard work cleanly', async () => {
        const before = await req('/api/gamification/me', 'GET', null, token);
        assert.strictEqual(before.status, 200);
        const xpBefore = before.data.profile.xp;

        const evt = await req('/api/gamification/event', 'POST', {
            type: 'quiz',
            topic: 'Searching',
            amount: 20
        }, token);
        assert.strictEqual(evt.status, 200);
        assert(evt.data.profile.xp >= xpBefore + 20);

        const lb = await req('/api/leaderboard', 'GET', null, token);
        assert.strictEqual(lb.status, 200);
        assert(Array.isArray(lb.data.leaderboard) && lb.data.leaderboard.length >= 2);
        assert(lb.data.leaderboard[0].xp >= lb.data.leaderboard[1].xp);
    });

    await test('Frontend HTML & ProblemVisualizerEngine serve cleanly', async () => {
        const d = await req('/dashboard');
        const duel = await req('/duel.html');
        const vis = await req('/visualize.html');
        const codelab = await req('/codelab.html');
        const pve = await req('/problem-visualizer.js');
        assert.strictEqual(d.status, 200);
        assert(d.raw.includes('dash-skill-radar'));
        assert(d.raw.includes('dash-problem-search'));
        assert.strictEqual(duel.status, 200);
        assert(duel.raw.includes('/socket.io/socket.io.js'));
        assert(duel.raw.includes('problem-visualizer.js'));
        assert.strictEqual(vis.status, 200);
        assert(vis.raw.includes('leetcode-100-visualizer-hub'));
        assert.strictEqual(codelab.status, 200);
        assert(codelab.raw.includes('problem-diff-filter'));
        assert.strictEqual(pve.status, 200);
        assert(pve.raw.includes('ProblemVisualizerEngine'));
    });

    await test('Socket.IO Random Hard Duel omits spoiler code and serves duelSkeletons + vis', async () => {
        const client = io(BASE_URL, { transports: ['websocket'] });
        try {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Random Hard duel timeout')), 10000);
                client.on('connect', () => {
                    client.emit('duel:create', {
                        problemId: 'random',
                        difficulty: 'Hard',
                        playerName: 'HardTester',
                        vsBot: false
                    }, (ack) => {
                        clearTimeout(timeout);
                        try {
                            assert(ack && ack.success && ack.room && ack.room.problem);
                            assert.strictEqual(ack.room.problem.difficulty, 'Hard');
                            assert.strictEqual(ack.room.problem.starterCode, undefined, 'Must not leak starterCode');
                            assert(ack.room.problem.duelSkeletons && ack.room.problem.duelSkeletons.python);
                            assert(ack.room.problem.vis && ack.room.problem.vis.type);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
                client.on('connect_error', reject);
            });
        } finally {
            client.disconnect();
        }
    });

    await test('Socket.IO 1v1 AlgoBot Sparring match starts & resolves Accepted winner', async () => {
        const cs = problems.find(p => p.id === 'climbing_stairs');
        const client = io(BASE_URL, { transports: ['websocket'] });
        try {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('AlgoBot match timeout')), 12000);
                client.on('connect', () => {
                    client.emit('duel:create', {
                        problemId: 'climbing_stairs',
                        playerName: 'BotChallenger',
                        vsBot: true
                    }, (ack) => {
                        if (!ack || !ack.success) return reject(new Error('Failed create'));
                    });
                });
                client.on('duel:start', () => {
                    client.emit('duel:submit', {
                        language: 'python',
                        code: cs.starterCode.python
                    });
                });
                client.on('duel:finished', ({ room }) => {
                    clearTimeout(timeout);
                    try {
                        assert.strictEqual(room.winner.socketId, client.id);
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });
                client.on('connect_error', reject);
            });
        } finally {
            client.disconnect();
        }
    });

    await test('Socket.IO Peer vs Peer 1v1 room create, join, start & win sync works', async () => {
        const ts = problems.find(p => p.id === 'two_sum');
        const host = io(BASE_URL, { transports: ['websocket'] });
        const guest = io(BASE_URL, { transports: ['websocket'] });
        try {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Peer duel timeout')), 12000);
                let hostStarted = false;
                let guestStarted = false;

                host.on('connect', () => {
                    host.emit('duel:create', {
                        problemId: 'two_sum',
                        playerName: 'HostPlayer',
                        vsBot: false
                    }, (ack) => {
                        if (!ack || !ack.success) return reject(new Error('Host create failed'));
                        const joinNow = () => {
                            guest.emit('duel:join', {
                                roomCode: ack.room.code,
                                playerName: 'GuestWinner'
                            }, (jAck) => {
                                if (!jAck || !jAck.success) reject(new Error('Guest join failed'));
                            });
                        };
                        if (guest.connected) joinNow();
                        else guest.once('connect', joinNow);
                    });
                });

                const maybeSubmit = () => {
                    if (hostStarted && guestStarted) {
                        guest.emit('duel:submit', {
                            language: 'javascript',
                            code: ts.starterCode.javascript
                        });
                    }
                };

                host.on('duel:start', () => { hostStarted = true; maybeSubmit(); });
                guest.on('duel:start', () => { guestStarted = true; maybeSubmit(); });

                let hostFinished = false;
                let guestFinished = false;
                const checkDone = (winnerSocketId) => {
                    assert.strictEqual(winnerSocketId, guest.id);
                    if (hostFinished && guestFinished) {
                        clearTimeout(timeout);
                        resolve();
                    }
                };
                host.on('duel:finished', ({ room }) => { hostFinished = true; checkDone(room.winner.socketId); });
                guest.on('duel:finished', ({ room }) => { guestFinished = true; checkDone(room.winner.socketId); });
            });
        } finally {
            host.disconnect();
            guest.disconnect();
        }
    });

    console.log(`\n🏁 E2E Suite Summary: ${passed} Passed, ${failed} Failed`);
    process.exit(failed > 0 ? 1 : 0);
}

run();

