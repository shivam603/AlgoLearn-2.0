const path = require('path');

// Safely load dotenv if present (in development or environments with dotenv installed)
try {
    const dotenv = require('dotenv');
    dotenv.config({ path: path.join(__dirname, '../.env') });
    dotenv.config();
} catch (e) {
    // In production environments (like Render), environment variables are injected directly into process.env
}

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'sortingVisualizer';
const COLLECTION_NAME = process.env.MONGO_COLLECTION || 'history';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

let historyCollection = null;
let statsCollection = null;
let usersCollection = null;
let visitorCount = 1428;
const inMemoryHistory = [];
const inMemoryUsers = new Map();
const inMemorySessions = new Map();

function hashPassword(password, salt) {
    if (!salt) salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

function verifyPassword(password, salt, hash) {
    if (!password || !salt || !hash) return false;
    const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return computed === hash;
}

async function seedDefaultUsers() {
    const defaultUsers = [
        {
            email: 'dev@university.edu',
            username: 'dev',
            fullName: 'Alex Rivera',
            role: 'Student Developer',
            provider: 'local',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            password: 'algo123'
        },
        {
            email: 'student@algolearn.io',
            username: 'student',
            fullName: 'Sarah Chen',
            role: 'Competitive Programmer',
            provider: 'local',
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
            password: 'algo123'
        }
    ];

    for (const u of defaultUsers) {
        const { salt, hash } = hashPassword(u.password);
        const userDoc = {
            id: 'usr_' + (u.username === 'dev' ? '101' : '102'),
            email: u.email.toLowerCase(),
            username: u.username.toLowerCase(),
            fullName: u.fullName,
            role: u.role,
            provider: u.provider,
            avatarUrl: u.avatarUrl,
            salt,
            passwordHash: hash,
            createdAt: new Date()
        };
        inMemoryUsers.set(userDoc.email, userDoc);
        inMemoryUsers.set(userDoc.username, userDoc);

        if (usersCollection) {
            try {
                await usersCollection.updateOne(
                    { email: userDoc.email },
                    { $setOnInsert: userDoc },
                    { upsert: true }
                );
            } catch (e) {
                // Ignore duplicate index errors on initial seed
            }
        }
    }
}

async function initDatabase() {
    try {
        const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
        await client.connect();
        const db = client.db(DB_NAME);
        historyCollection = db.collection(COLLECTION_NAME);
        statsCollection = db.collection('stats');
        usersCollection = db.collection('users');
        await historyCollection.createIndex({ created_at: -1 });
        await usersCollection.createIndex({ email: 1 });
        await usersCollection.createIndex({ username: 1 });
        
        const metricDoc = await statsCollection.findOne({ _id: 'site_metrics' });
        if (metricDoc && typeof metricDoc.visitor_count === 'number') {
            visitorCount = metricDoc.visitor_count;
        }
        console.log(`Connected to MongoDB at ${MONGO_URI}`);
    } catch (err) {
        console.warn(`[AlgoLearn Warning] MongoDB not reachable at ${MONGO_URI}. Falling back to in-memory history storage.`);
    } finally {
        await seedDefaultUsers();
    }
}

app.get('/api/visitors', async (req, res) => {
    try {
        visitorCount++;
        if (statsCollection) {
            await statsCollection.updateOne(
                { _id: 'site_metrics' },
                { $set: { visitor_count: visitorCount } },
                { upsert: true }
            );
        }
        res.json({ visitors: visitorCount, success: true });
    } catch (err) {
        res.json({ visitors: visitorCount, success: true });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        if (historyCollection) {
            const rows = await historyCollection
                .find({})
                .sort({ created_at: -1 })
                .limit(20)
                .toArray();
            return res.json(rows.map(row => ({
                id: row._id,
                algorithm: row.algorithm,
                size: row.size,
                speed: row.speed,
                duration_ms: row.duration_ms,
                time_complexity: row.time_complexity,
                space_complexity: row.space_complexity,
                array_data: row.array_data,
                created_at: row.created_at
            })));
        }
        res.json(inMemoryHistory.slice(0, 20));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/history', async (req, res) => {
    const { algorithm, array, size, speed, duration, time_complexity, space_complexity } = req.body;
    if (!algorithm || !Array.isArray(array) || typeof duration !== 'number') {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const createdAt = new Date();
    const entry = {
        algorithm,
        array_data: array,
        size,
        speed,
        duration_ms: duration,
        time_complexity: time_complexity || '',
        space_complexity: space_complexity || '',
        created_at: createdAt
    };

    try {
        if (historyCollection) {
            const result = await historyCollection.insertOne(entry);
            return res.status(201).json({
                id: result.insertedId,
                ...entry
            });
        }
        entry.id = 'mem_' + Date.now();
        inMemoryHistory.unshift(entry);
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/history', async (req, res) => {
    try {
        if (historyCollection) {
            const result = await historyCollection.deleteMany({});
            return res.json({ deletedCount: result.deletedCount });
        }
        const count = inMemoryHistory.length;
        inMemoryHistory.length = 0;
        res.json({ deletedCount: count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Authentication Endpoints
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { identity, password, rememberMe } = req.body;
        if (!identity || !password) {
            return res.status(400).json({ success: false, error: 'Email / Username and Password are required.' });
        }

        const cleanIdentity = identity.trim().toLowerCase().replace(/^@/, '');
        let user = null;

        if (usersCollection) {
            user = await usersCollection.findOne({
                $or: [
                    { email: cleanIdentity },
                    { username: cleanIdentity }
                ]
            });
        }

        if (!user) {
            user = inMemoryUsers.get(cleanIdentity);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Account not found. Please verify your email or click "Sign up for free" below.'
            });
        }

        if (!user.salt || !user.passwordHash) {
            return res.status(401).json({
                success: false,
                error: 'This account was authenticated via OAuth (' + (user.provider || 'external') + '). Please use that sign-in option.'
            });
        }

        const valid = verifyPassword(password, user.salt, user.passwordHash);
        if (!valid) {
            return res.status(401).json({
                success: false,
                error: 'Incorrect password. Please try again or use "Forgot password?".'
            });
        }

        // Generate session token
        const token = 'alg_' + crypto.randomBytes(32).toString('hex');
        const sessionDurationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const session = {
            token,
            userId: user.id || user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: user.role || 'Student',
            avatarUrl: user.avatarUrl,
            expiresAt: new Date(Date.now() + sessionDurationMs)
        };

        inMemorySessions.set(token, session);

        res.json({
            success: true,
            message: 'Signed in successfully. Welcome back!',
            token,
            user: {
                id: session.userId,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                avatarUrl: user.avatarUrl
            }
        });
    } catch (err) {
        console.error('[Auth Error]', err);
        res.status(500).json({ success: false, error: 'Internal authentication error: ' + err.message });
    }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, username } = req.body;
        if (!email || !password || !fullName) {
            return res.status(400).json({ success: false, error: 'Full name, email and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = (username ? username.trim().toLowerCase().replace(/^@/, '') : cleanEmail.split('@')[0]);

        // Check if user already exists
        let existing = null;
        if (usersCollection) {
            existing = await usersCollection.findOne({
                $or: [{ email: cleanEmail }, { username: cleanUsername }]
            });
        }
        if (!existing) {
            existing = inMemoryUsers.get(cleanEmail) || inMemoryUsers.get(cleanUsername);
        }

        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'An account with this email or username already exists. Please sign in.'
            });
        }

        const { salt, hash } = hashPassword(password);
        const newUser = {
            id: 'usr_' + Date.now(),
            email: cleanEmail,
            username: cleanUsername,
            fullName: fullName.trim(),
            role: 'Student Developer',
            provider: 'local',
            avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
            salt,
            passwordHash: hash,
            createdAt: new Date()
        };

        if (usersCollection) {
            await usersCollection.insertOne(newUser);
        }
        inMemoryUsers.set(cleanEmail, newUser);
        inMemoryUsers.set(cleanUsername, newUser);

        const token = 'alg_' + crypto.randomBytes(32).toString('hex');
        const session = {
            token,
            userId: newUser.id,
            email: newUser.email,
            username: newUser.username,
            fullName: newUser.fullName,
            role: newUser.role,
            avatarUrl: newUser.avatarUrl,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        inMemorySessions.set(token, session);

        res.status(201).json({
            success: true,
            message: 'Account created successfully! Welcome to AlgoLearn.',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                fullName: newUser.fullName,
                role: newUser.role,
                avatarUrl: newUser.avatarUrl
            }
        });
    } catch (err) {
        console.error('[Registration Error]', err);
        res.status(500).json({ success: false, error: 'Registration failed: ' + err.message });
    }
});

// POST /api/auth/oauth-mock (GitHub & Google)
app.post('/api/auth/oauth-mock', async (req, res) => {
    try {
        const { provider } = req.body;
        const isGithub = provider === 'github';
        const providerName = isGithub ? 'GitHub' : 'Google';

        const mockAccount = isGithub ? {
            id: 'usr_gh_' + Date.now(),
            email: 'developer.gh@users.noreply.github.com',
            username: 'octo_developer',
            fullName: 'GitHub Developer',
            role: 'Dev Pick Engineer',
            provider: 'github',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        } : {
            id: 'usr_g_' + Date.now(),
            email: 'student.google@gmail.com',
            username: 'google_scholar',
            fullName: 'Google Scholar Student',
            role: 'DSA Scholar',
            provider: 'google',
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
        };

        inMemoryUsers.set(mockAccount.email, mockAccount);
        inMemoryUsers.set(mockAccount.username, mockAccount);

        const token = 'alg_' + crypto.randomBytes(32).toString('hex');
        const session = {
            token,
            userId: mockAccount.id,
            ...mockAccount,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        inMemorySessions.set(token, session);

        res.json({
            success: true,
            message: `Authenticated seamlessly with ${providerName}!`,
            token,
            user: mockAccount
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.query.token;

    if (!token || !inMemorySessions.has(token)) {
        return res.status(401).json({ success: false, error: 'Not authenticated or session expired' });
    }

    const session = inMemorySessions.get(token);
    if (new Date() > new Date(session.expiresAt)) {
        inMemorySessions.delete(token);
        return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
    }

    res.json({
        success: true,
        user: {
            id: session.userId,
            email: session.email,
            username: session.username,
            fullName: session.fullName,
            role: session.role,
            avatarUrl: session.avatarUrl
        }
    });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.body.token;
    if (token) {
        inMemorySessions.delete(token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
});

// Page routing
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/welcome.html'));
});

app.get('/codelab', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/codelab.html'));
});

app.get('/visualize', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/visualize.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`AlgoLearn server running at http://localhost:${PORT}`);
    });
});
