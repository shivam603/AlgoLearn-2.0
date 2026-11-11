/**
 * AlgoLearn Live 1v1 Multiplayer Coding Duel Server (Socket.IO)
 * Handles matchmaking/rooms, countdown sync, live opponent progress telemetry,
 * server-authoritative judge verdicts, and AlgoBot solo sparring mode.
 */

const { Server } = require('socket.io');
const codelabJudge = require('./codelab-judge');
const gamification = require('./gamification');

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

function attachDuelServer(httpServer, { getSession }) {
    const io = new Server(httpServer, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    const rooms = new Map();

    function findPlayerInRoom(room, socketId, playerId) {
        if (!room || !Array.isArray(room.players)) return null;
        return room.players.find(p =>
            p.socketId === socketId ||
            (playerId && !p.isBot && p.playerId === playerId)
        ) || null;
    }

    function clearRoomDisconnectCleanup(room) {
        if (room && room.disconnectTimer) {
            clearTimeout(room.disconnectTimer);
            room.disconnectTimer = null;
        }
    }

    // Cleanup rooms older than 45 minutes periodically
    const cleanupTimer = setInterval(() => {
        const cutoff = Date.now() - 45 * 60 * 1000;
        for (const [code, room] of rooms.entries()) {
            if (room.createdAt < cutoff) {
                if (room.botTimer) clearInterval(room.botTimer);
                clearRoomDisconnectCleanup(room);
                rooms.delete(code);
            }
        }
    }, 5 * 60 * 1000);
    if (cleanupTimer.unref) cleanupTimer.unref();

    function serializeRoom(room) {
        const problem = codelabJudge.getProblemById(room.problemId);
        return {
            code: room.code,
            status: room.status,
            problemId: room.problemId,
            problem: problem ? {
                id: problem.id,
                leetcodeId: problem.leetcodeId,
                title: problem.title,
                difficulty: problem.difficulty,
                topic: problem.topic,
                xpReward: problem.xpReward,
                description: problem.description,
                examples: problem.examples,
                constraints: problem.constraints,
                visibleTests: problem.tests.filter(tc => !tc.hidden).slice(0, 1),
                optimalTime: problem.optimalTime,
                optimalSpace: problem.optimalSpace,
                vis: problem.vis || { type: 'array', studio: 'visualize-ds.html', studioLabel: 'Algorithm Visualizer' },
                duelSkeletons: problem.duelSkeletons,
                totalTests: problem.tests.length
            } : null,
            winner: room.winner,
            startedAt: room.startedAt,
            players: room.players.map(p => ({
                socketId: p.socketId,
                name: p.name,
                avatarUrl: p.avatarUrl,
                isBot: Boolean(p.isBot),
                language: p.language,
                passedTests: p.passedTests,
                totalTests: p.totalTests,
                statusText: p.statusText,
                chars: p.chars
            }))
        };
    }

    function startCountdownAndMatch(room) {
        if (room.status !== 'waiting') return;
        room.status = 'countdown';
        io.to(room.code).emit('duel:room_state', serializeRoom(room));

        let count = 3;
        io.to(room.code).emit('duel:countdown', { count });
        const tick = setInterval(() => {
            count--;
            if (!rooms.has(room.code)) {
                clearInterval(tick);
                return;
            }
            if (count > 0) {
                io.to(room.code).emit('duel:countdown', { count });
            } else {
                clearInterval(tick);
                room.status = 'active';
                room.startedAt = Date.now();
                io.to(room.code).emit('duel:start', serializeRoom(room));
                if (room.hasBot) {
                    launchBotSimulation(room);
                }
            }
        }, 850);
    }

    function launchBotSimulation(room) {
        const problem = codelabJudge.getProblemById(room.problemId);
        const totalTests = problem ? problem.tests.length : 5;
        const diff = problem ? problem.difficulty : 'Easy';
        const intervalMs = diff === 'Hard' ? 7500 : (diff === 'Medium' ? 6000 : 4500);
        let step = 0;

        room.botTimer = setInterval(async () => {
            if (!rooms.has(room.code) || room.status !== 'active') {
                clearInterval(room.botTimer);
                room.botTimer = null;
                return;
            }
            step++;
            const bot = room.players.find(p => p.isBot);
            if (!bot) return;

            bot.chars = Math.min(260, step * 28);
            if (step === 3) {
                bot.passedTests = Math.max(1, Math.floor(totalTests / 2));
                bot.statusText = `Passed ${bot.passedTests}/${totalTests} checks...`;
            } else if (step === 6) {
                bot.passedTests = Math.max(1, totalTests - 1);
                bot.statusText = `Debugging edge case (${bot.passedTests}/${totalTests})...`;
            } else if (step >= 10) {
                bot.passedTests = totalTests;
                bot.statusText = 'Accepted!';
                await finishMatch(room, bot, Math.round((Date.now() - room.startedAt) / 1000));
                clearInterval(room.botTimer);
                room.botTimer = null;
                return;
            } else {
                bot.statusText = 'Implementing optimal approach...';
            }

            io.to(room.code).emit('duel:room_state', serializeRoom(room));
        }, intervalMs);
    }

    async function finishMatch(room, winnerPlayer, elapsedSec) {
        if (room.status === 'finished') return;
        room.status = 'finished';
        room.winner = {
            socketId: winnerPlayer.socketId,
            name: winnerPlayer.name,
            isBot: Boolean(winnerPlayer.isBot),
            elapsedSec
        };
        if (room.botTimer) {
            clearInterval(room.botTimer);
            room.botTimer = null;
        }

        // Persist XP for authenticated human players
        const xpAwards = {};
        for (const player of room.players) {
            if (!player.isBot && player.session) {
                const won = player.socketId === winnerPlayer.socketId;
                const res = await gamification.recordDuelResult(player.session, { won });
                if (res) xpAwards[player.socketId] = res.gainedXp;
            }
        }

        io.to(room.code).emit('duel:finished', {
            room: serializeRoom(room),
            xpAwards
        });
    }

    io.on('connection', (socket) => {
        socket.on('duel:create', async (payload = {}, ack) => {
            try {
                const { problemId = 'two_sum', difficulty = 'All', playerName = 'Coder', playerId = '', token = '', vsBot = false } = payload;
                let problem = null;
                if (problemId === 'random') {
                    const pool = (difficulty && difficulty !== 'All')
                        ? codelabJudge.PROBLEMS.filter(p => p.difficulty === difficulty)
                        : codelabJudge.PROBLEMS;
                    const activePool = pool.length ? pool : codelabJudge.PROBLEMS;
                    problem = activePool[Math.floor(Math.random() * activePool.length)];
                } else {
                    problem = codelabJudge.getProblemById(problemId) || codelabJudge.PROBLEMS[0];
                }
                const session = token ? await getSession(token) : null;

                let roomCode = generateRoomCode();
                while (rooms.has(roomCode)) roomCode = generateRoomCode();

                const hostPlayer = {
                    socketId: socket.id,
                    playerId: playerId ? String(playerId) : socket.id,
                    name: session ? (session.fullName || session.username) : String(playerName || 'Player 1').slice(0, 28),
                    avatarUrl: session ? session.avatarUrl : '',
                    session,
                    isBot: false,
                    disconnected: false,
                    language: 'python',
                    passedTests: 0,
                    totalTests: problem.tests.length,
                    statusText: 'Ready in arena',
                    chars: 0
                };

                const room = {
                    code: roomCode,
                    problemId: problem.id,
                    status: 'waiting',
                    players: [hostPlayer],
                    hasBot: Boolean(vsBot),
                    winner: null,
                    createdAt: Date.now(),
                    startedAt: null,
                    botTimer: null,
                    disconnectTimer: null
                };

                if (vsBot) {
                    room.players.push({
                        socketId: 'algobot_' + roomCode,
                        playerId: 'algobot_' + roomCode,
                        name: 'AlgoBot (Sparring AI)',
                        avatarUrl: 'algolearn-icon.png',
                        session: null,
                        isBot: true,
                        disconnected: false,
                        language: 'python',
                        passedTests: 0,
                        totalTests: problem.tests.length,
                        statusText: 'Warming up...',
                        chars: 0
                    });
                }

                rooms.set(roomCode, room);
                socket.join(roomCode);
                socket.data.duelRoom = roomCode;

                const serialized = serializeRoom(room);
                if (typeof ack === 'function') ack({ success: true, room: serialized });
                io.to(roomCode).emit('duel:room_state', serialized);

                if (vsBot) {
                    setTimeout(() => startCountdownAndMatch(room), 400);
                }
            } catch (err) {
                if (typeof ack === 'function') ack({ success: false, error: err.message });
            }
        });

        socket.on('duel:join', async (payload = {}, ack) => {
            try {
                const roomCode = String(payload.roomCode || '').trim().toUpperCase();
                const room = rooms.get(roomCode);
                if (!room) {
                    if (typeof ack === 'function') ack({ success: false, error: 'Duel room not found. Check your 6-character code.' });
                    return;
                }

                const existingPlayer = payload.playerId ? findPlayerInRoom(room, socket.id, String(payload.playerId)) : null;
                if (existingPlayer) {
                    existingPlayer.socketId = socket.id;
                    existingPlayer.disconnected = false;
                    clearRoomDisconnectCleanup(room);
                    socket.join(roomCode);
                    socket.data.duelRoom = roomCode;
                    const serialized = serializeRoom(room);
                    if (typeof ack === 'function') ack({ success: true, room: serialized });
                    io.to(roomCode).emit('duel:room_state', serialized);
                    return;
                }

                if (room.players.length >= 2) {
                    if (typeof ack === 'function') ack({ success: false, error: 'This duel room already has 2 players.' });
                    return;
                }

                const problem = codelabJudge.getProblemById(room.problemId);
                const session = payload.token ? await getSession(payload.token) : null;

                const challenger = {
                    socketId: socket.id,
                    playerId: payload.playerId ? String(payload.playerId) : socket.id,
                    name: session ? (session.fullName || session.username) : String(payload.playerName || 'Challenger').slice(0, 28),
                    avatarUrl: session ? session.avatarUrl : '',
                    session,
                    isBot: false,
                    disconnected: false,
                    language: 'python',
                    passedTests: 0,
                    totalTests: problem ? problem.tests.length : 5,
                    statusText: 'Joined arena!',
                    chars: 0
                };

                room.players.push(challenger);
                clearRoomDisconnectCleanup(room);
                socket.join(roomCode);
                socket.data.duelRoom = roomCode;

                const serialized = serializeRoom(room);
                if (typeof ack === 'function') ack({ success: true, room: serialized });
                io.to(roomCode).emit('duel:room_state', serialized);

                startCountdownAndMatch(room);
            } catch (err) {
                if (typeof ack === 'function') ack({ success: false, error: err.message });
            }
        });

        socket.on('duel:rejoin', (payload = {}, ack) => {
            const roomCode = String(payload.roomCode || '').trim().toUpperCase();
            const room = roomCode ? rooms.get(roomCode) : null;
            if (!room) {
                if (typeof ack === 'function') ack({ success: false, error: 'Room expired or no longer exists.' });
                return;
            }
            const player = findPlayerInRoom(room, socket.id, payload.playerId ? String(payload.playerId) : '');
            if (!player) {
                if (typeof ack === 'function') ack({ success: false, error: 'Player session not found in room.' });
                return;
            }
            player.socketId = socket.id;
            player.disconnected = false;
            clearRoomDisconnectCleanup(room);
            socket.join(roomCode);
            socket.data.duelRoom = roomCode;
            const serialized = serializeRoom(room);
            if (typeof ack === 'function') ack({ success: true, room: serialized });
            io.to(roomCode).emit('duel:room_state', serialized);
        });

        socket.on('duel:progress', (payload = {}) => {
            const roomCode = socket.data.duelRoom || (payload.roomCode ? String(payload.roomCode).trim().toUpperCase() : '');
            const room = roomCode ? rooms.get(roomCode) : null;
            if (!room || room.status !== 'active') return;

            const player = findPlayerInRoom(room, socket.id, payload.playerId ? String(payload.playerId) : '');
            if (!player) return;

            if (player.socketId !== socket.id) {
                player.socketId = socket.id;
                player.disconnected = false;
                clearRoomDisconnectCleanup(room);
                socket.join(roomCode);
                socket.data.duelRoom = roomCode;
            }

            if (payload.language) player.language = String(payload.language);
            if (typeof payload.chars === 'number') player.chars = payload.chars;
            if (typeof payload.statusText === 'string') player.statusText = payload.statusText.slice(0, 60);

            io.to(roomCode).emit('duel:room_state', serializeRoom(room));
        });

        socket.on('duel:submit', async (payload = {}, ack) => {
            const roomCode = socket.data.duelRoom || (payload.roomCode ? String(payload.roomCode).trim().toUpperCase() : '');
            const room = roomCode ? rooms.get(roomCode) : null;
            if (!room) {
                if (typeof ack === 'function') ack({ success: false, error: 'Duel room expired or server restarted. You can still verify your code via Judge below or start a new match.' });
                return;
            }

            const player = findPlayerInRoom(room, socket.id, payload.playerId ? String(payload.playerId) : '');
            if (!player) {
                if (typeof ack === 'function') ack({ success: false, error: 'Player session disconnected from room.' });
                return;
            }

            if (player.socketId !== socket.id) {
                player.socketId = socket.id;
                player.disconnected = false;
                clearRoomDisconnectCleanup(room);
                socket.join(roomCode);
                socket.data.duelRoom = roomCode;
            }

            const wasAlreadyFinished = room.status === 'finished';
            if (payload.language) player.language = String(payload.language);
            player.statusText = 'Running Judge...';
            io.to(roomCode).emit('duel:room_state', serializeRoom(room));

            const result = await codelabJudge.judgeCode({
                problemId: room.problemId,
                language: payload.language || player.language,
                code: payload.code || ''
            });

            player.passedTests = result.passedCount || 0;
            player.totalTests = result.totalCount || player.totalTests;
            player.statusText = result.verdict === 'Accepted'
                ? 'Accepted! 🏆'
                : `${result.verdict} (${player.passedTests}/${player.totalTests})`;

            if (typeof ack === 'function') ack({ success: true, result, matchAlreadyFinished: wasAlreadyFinished });
            socket.emit('duel:judge_result', result);
            io.to(roomCode).emit('duel:room_state', serializeRoom(room));

            if (!wasAlreadyFinished && result.verdict === 'Accepted') {
                const elapsedSec = room.startedAt ? Math.max(1, Math.round((Date.now() - room.startedAt) / 1000)) : 1;
                await finishMatch(room, player, elapsedSec);
            }
        });

        socket.on('duel:leave', () => {
            const roomCode = socket.data.duelRoom;
            const room = roomCode ? rooms.get(roomCode) : null;
            if (!room) return;
            socket.leave(roomCode);
            socket.data.duelRoom = null;
            room.players = room.players.filter(p => p.socketId !== socket.id);
            const hasHumanLeft = room.players.some(p => !p.isBot);
            if (!hasHumanLeft) {
                if (room.botTimer) clearInterval(room.botTimer);
                clearRoomDisconnectCleanup(room);
                rooms.delete(roomCode);
            } else {
                io.to(roomCode).emit('duel:room_state', serializeRoom(room));
            }
        });

        socket.on('disconnect', () => {
            const roomCode = socket.data.duelRoom;
            const room = roomCode ? rooms.get(roomCode) : null;
            if (!room) return;

            const player = room.players.find(p => p.socketId === socket.id);
            if (player) player.disconnected = true;

            const anyHumanConnected = room.players.some(p => !p.isBot && !p.disconnected);
            if (!anyHumanConnected) {
                clearRoomDisconnectCleanup(room);
                room.disconnectTimer = setTimeout(() => {
                    const current = rooms.get(roomCode);
                    if (!current) return;
                    const stillDisconnected = !current.players.some(p => !p.isBot && !p.disconnected);
                    if (stillDisconnected) {
                        if (current.botTimer) clearInterval(current.botTimer);
                        rooms.delete(roomCode);
                    }
                }, 120000);
                if (room.disconnectTimer.unref) room.disconnectTimer.unref();
            } else {
                io.to(roomCode).emit('duel:room_state', serializeRoom(room));
            }
        });
    });

    return io;
}

module.exports = { attachDuelServer };

