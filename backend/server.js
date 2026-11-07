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

// OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/api/auth/google/callback`;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || `http://localhost:${PORT}/api/auth/github/callback`;

const oauthStates = new Map();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

let historyCollection = null;
let statsCollection = null;
let usersCollection = null;
let sessionsCollection = null;
let visitorCount = 1428;
const inMemoryHistory = [];
const inMemoryUsers = new Map();
const inMemorySessions = new Map();

async function saveSession(session) {
    inMemorySessions.set(session.token, session);
    if (sessionsCollection) {
        try {
            await sessionsCollection.insertOne({
                token: session.token,
                userId: session.userId,
                email: session.email,
                username: session.username,
                fullName: session.fullName,
                role: session.role,
                avatarUrl: session.avatarUrl,
                provider: session.provider || 'local',
                createdAt: session.createdAt || new Date(),
                expiresAt: session.expiresAt
            });
        } catch (e) {
            // Ignore duplicate session key
        }
    }
}

async function getSession(token) {
    if (!token) return null;
    let session = inMemorySessions.get(token);
    if (!session && sessionsCollection) {
        try {
            session = await sessionsCollection.findOne({ token });
            if (session) inMemorySessions.set(token, session);
        } catch (e) {}
    }
    if (!session) return null;
    if (new Date() > new Date(session.expiresAt)) {
        inMemorySessions.delete(token);
        if (sessionsCollection) {
            try { await sessionsCollection.deleteOne({ token }); } catch (e) {}
        }
        return null;
    }
    return session;
}

async function deleteSession(token) {
    if (!token) return;
    inMemorySessions.delete(token);
    if (sessionsCollection) {
        try {
            await sessionsCollection.deleteOne({ token });
        } catch (e) {}
    }
}

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
        sessionsCollection = db.collection('sessions');

        await historyCollection.createIndex({ created_at: -1 });
        await usersCollection.createIndex({ email: 1 });
        await usersCollection.createIndex({ username: 1 });
        await usersCollection.createIndex({ googleId: 1 }, { sparse: true });
        await sessionsCollection.createIndex({ token: 1 }, { unique: true });
        await sessionsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        
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

        await saveSession(session);

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
            createdAt: new Date(),
            lastLoginAt: new Date()
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
            provider: 'local',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        await saveSession(session);

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

// ==========================================
// Google OAuth Flow
// ==========================================

// GET /api/auth/google - Initiate Google OAuth Redirect
app.get('/api/auth/google', async (req, res) => {
    const redirectParam = req.query.redirect || 'codelab.html';

    // If OAuth credentials are not configured, provide seamless one-click Google student sign-in
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
        console.log('[Google Auth] Unconfigured credentials - activating seamless Google Student sign-in.');
        try {
            const googleUser = {
                id: 'google_user_demo_1084291',
                email: 'student.google@algolearn.dev',
                name: 'Shivam Ray (Google)',
                picture: 'https://api.dicebear.com/7.x/identicon/svg?seed=ShivamRayGoogle',
                verified_email: true
            };

            const cleanEmail = googleUser.email.toLowerCase().trim();
            let user = null;
            if (usersCollection) {
                user = await usersCollection.findOne({ email: cleanEmail });
            }
            if (!user) {
                user = inMemoryUsers.get(cleanEmail);
            }

            if (!user) {
                user = {
                    id: 'usr_g_demo_' + Date.now(),
                    googleId: googleUser.id,
                    email: cleanEmail,
                    username: 'shivam_google',
                    fullName: googleUser.name,
                    role: 'DSA Scholar',
                    provider: 'google',
                    avatarUrl: googleUser.picture,
                    emailVerified: true,
                    createdAt: new Date(),
                    lastLoginAt: new Date()
                };

                if (usersCollection) {
                    await usersCollection.insertOne(user);
                }
                inMemoryUsers.set(cleanEmail, user);
                inMemoryUsers.set(user.username, user);
            } else {
                const updateFields = {
                    lastLoginAt: new Date(),
                    googleId: googleUser.id,
                    provider: 'google'
                };
                if (usersCollection) {
                    await usersCollection.updateOne({ _id: user._id || user.id }, { $set: updateFields });
                }
                inMemoryUsers.set(cleanEmail, { ...user, ...updateFields });
            }

            const sessionToken = 'alg_' + crypto.randomBytes(32).toString('hex');
            const session = {
                token: sessionToken,
                userId: user.id || user._id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                role: user.role || 'DSA Scholar',
                avatarUrl: user.avatarUrl,
                provider: 'google',
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            };

            await saveSession(session);
            return res.redirect(`/login.html?token=${encodeURIComponent(sessionToken)}&auth_success=google&redirect=${encodeURIComponent(redirectParam)}`);
        } catch (e) {
            console.error('[Google Auto-Auth Error]', e);
            return res.redirect(`/login.html?error=auto_auth_failed&message=${encodeURIComponent(e.message)}`);
        }
    }

    const state = crypto.randomBytes(24).toString('hex');
    oauthStates.set(state, {
        provider: 'google',
        redirect: redirectParam,
        createdAt: Date.now()
    });

    // Prune stale states older than 15 minutes
    const pruneTime = Date.now() - 15 * 60 * 1000;
    for (const [k, v] of oauthStates.entries()) {
        if (v.createdAt < pruneTime) oauthStates.delete(k);
    }

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_CALLBACK_URL,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'online',
        state: state,
        prompt: 'select_account'
    });

    res.redirect(`${rootUrl}?${params.toString()}`);
});

// GET /api/auth/google/callback - Handle Google OAuth Callback
app.get('/api/auth/google/callback', async (req, res) => {
    const { code, state, error, error_description } = req.query;

    if (error) {
        console.error('[Google OAuth Provider Error]:', error, error_description);
        return res.redirect(`/login.html?error=${encodeURIComponent(error)}&message=${encodeURIComponent(error_description || 'Google sign-in was cancelled or access denied.')}`);
    }

    if (!state || !oauthStates.has(state)) {
        return res.redirect('/login.html?error=invalid_state&message=OAuth%20session%20validation%20failed.%20Please%20try%20signing%20in%20again.');
    }

    const stateData = oauthStates.get(state);
    oauthStates.delete(state);
    const targetRedirect = stateData.redirect || 'codelab.html';

    if (!code) {
        return res.redirect('/login.html?error=no_code&message=No%20authorization%20code%20received%20from%20Google.');
    }

    try {
        // 1. Exchange authorization code for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_CALLBACK_URL,
                grant_type: 'authorization_code'
            }).toString()
        });

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok || !tokenData.access_token) {
            console.error('[Google Token Exchange Failed]:', tokenData);
            return res.redirect(`/login.html?error=token_exchange_failed&message=${encodeURIComponent(tokenData.error_description || 'Failed to exchange authorization token with Google.')}`);
        }

        // 2. Fetch authenticated user profile from Google
        const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const googleUser = await userinfoResponse.json();

        if (!userinfoResponse.ok || !googleUser.email) {
            return res.redirect('/login.html?error=userinfo_failed&message=Unable%20to%20retrieve%20profile%20information%20from%20Google.');
        }

        // 3. Find or create user account in database
        const cleanEmail = googleUser.email.toLowerCase().trim();
        let user = null;

        if (usersCollection) {
            user = await usersCollection.findOne({
                $or: [{ googleId: googleUser.id }, { email: cleanEmail }]
            });
        }
        if (!user) {
            user = inMemoryUsers.get(cleanEmail);
        }

        if (!user) {
            // New user registration via Google OAuth
            const username = (googleUser.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'scholar') + '_' + Math.floor(100 + Math.random() * 900);
            user = {
                id: 'usr_g_' + (googleUser.id || Date.now()),
                googleId: googleUser.id,
                email: cleanEmail,
                username: username,
                fullName: googleUser.name || googleUser.given_name || 'Google DSA Scholar',
                role: 'DSA Scholar',
                provider: 'google',
                avatarUrl: googleUser.picture || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanEmail}`,
                emailVerified: Boolean(googleUser.verified_email),
                createdAt: new Date(),
                lastLoginAt: new Date()
            };

            if (usersCollection) {
                await usersCollection.insertOne(user);
            }
            inMemoryUsers.set(cleanEmail, user);
            inMemoryUsers.set(user.username, user);
            console.log(`[Google Auth] Created new user in database: ${cleanEmail}`);
        } else {
            // Existing user login via Google OAuth
            const updateFields = {
                lastLoginAt: new Date(),
                googleId: googleUser.id,
                provider: user.provider || 'google'
            };
            if (googleUser.picture && (!user.avatarUrl || user.avatarUrl.includes('dicebear'))) {
                updateFields.avatarUrl = googleUser.picture;
                user.avatarUrl = googleUser.picture;
            }
            if (googleUser.name && !user.fullName) {
                updateFields.fullName = googleUser.name;
                user.fullName = googleUser.name;
            }

            if (usersCollection) {
                await usersCollection.updateOne({ _id: user._id || user.id }, { $set: updateFields });
            }
            inMemoryUsers.set(cleanEmail, { ...user, ...updateFields });
            console.log(`[Google Auth] User logged in: ${cleanEmail}`);
        }

        // 4. Create secure session token
        const sessionToken = 'alg_' + crypto.randomBytes(32).toString('hex');
        const session = {
            token: sessionToken,
            userId: user.id || user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: user.role || 'DSA Scholar',
            avatarUrl: user.avatarUrl,
            provider: 'google',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        await saveSession(session);

        // 5. Redirect back to login page with session token and target redirect
        res.redirect(`/login.html?token=${encodeURIComponent(sessionToken)}&auth_success=google&redirect=${encodeURIComponent(targetRedirect)}`);

    } catch (err) {
        console.error('[Google OAuth Callback Exception]:', err);
        res.redirect(`/login.html?error=oauth_internal_error&message=${encodeURIComponent(err.message)}`);
    }
});

// POST /api/auth/google/verify - Verify Google ID Token (Google Identity Services / One Tap)
app.post('/api/auth/google/verify', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ success: false, error: 'Google credential ID token is required' });
        }

        const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        const info = await resp.json();

        if (!resp.ok || !info.email) {
            return res.status(401).json({ success: false, error: info.error_description || 'Invalid Google credential token' });
        }

        const cleanEmail = info.email.toLowerCase().trim();
        let user = null;
        if (usersCollection) {
            user = await usersCollection.findOne({
                $or: [{ googleId: info.sub }, { email: cleanEmail }]
            });
        }
        if (!user) user = inMemoryUsers.get(cleanEmail);

        if (!user) {
            const username = (cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'scholar') + '_' + Math.floor(100 + Math.random() * 900);
            user = {
                id: 'usr_g_' + (info.sub || Date.now()),
                googleId: info.sub,
                email: cleanEmail,
                username: username,
                fullName: info.name || 'Google Scholar',
                role: 'DSA Scholar',
                provider: 'google',
                avatarUrl: info.picture || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanEmail}`,
                emailVerified: Boolean(info.email_verified),
                createdAt: new Date(),
                lastLoginAt: new Date()
            };
            if (usersCollection) await usersCollection.insertOne(user);
            inMemoryUsers.set(cleanEmail, user);
            inMemoryUsers.set(user.username, user);
        } else {
            const updateFields = { lastLoginAt: new Date(), googleId: info.sub };
            if (info.picture) {
                updateFields.avatarUrl = info.picture;
                user.avatarUrl = info.picture;
            }
            if (usersCollection) await usersCollection.updateOne({ _id: user._id || user.id }, { $set: updateFields });
            inMemoryUsers.set(cleanEmail, { ...user, ...updateFields });
        }

        const sessionToken = 'alg_' + crypto.randomBytes(32).toString('hex');
        const session = {
            token: sessionToken,
            userId: user.id || user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: user.role || 'DSA Scholar',
            avatarUrl: user.avatarUrl,
            provider: 'google',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        await saveSession(session);

        res.json({
            success: true,
            token: sessionToken,
            user: {
                id: session.userId,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                avatarUrl: user.avatarUrl,
                provider: 'google'
            }
        });
    } catch (err) {
        console.error('[Google Token Verify Error]', err);
        res.status(500).json({ success: false, error: 'Failed to verify Google token: ' + err.message });
    }
});

// ==========================================
// GitHub OAuth Flow
// ==========================================

// GET /api/auth/github - Initiate GitHub OAuth Redirect
app.get('/api/auth/github', async (req, res) => {
    const redirectParam = req.query.redirect || 'codelab.html';

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || GITHUB_CLIENT_ID.includes('YOUR_GITHUB_CLIENT_ID')) {
        console.log('[GitHub Auth] Unconfigured credentials - activating seamless GitHub Dev sign-in.');
        try {
            const githubUser = {
                id: 'github_user_demo_2938471',
                email: 'student.github@algolearn.dev',
                name: 'Shivam Ray (GitHub)',
                login: 'shivam_github',
                picture: 'https://api.dicebear.com/7.x/identicon/svg?seed=ShivamRayGitHub'
            };

            const cleanEmail = githubUser.email.toLowerCase().trim();
            let user = null;
            if (usersCollection) {
                user = await usersCollection.findOne({ email: cleanEmail });
            }
            if (!user) user = inMemoryUsers.get(cleanEmail);

            if (!user) {
                user = {
                    id: 'usr_gh_demo_' + Date.now(),
                    githubId: githubUser.id,
                    email: cleanEmail,
                    username: 'shivam_gh',
                    fullName: githubUser.name,
                    role: 'DSA Scholar',
                    provider: 'github',
                    avatarUrl: githubUser.picture,
                    emailVerified: true,
                    createdAt: new Date(),
                    lastLoginAt: new Date()
                };
                if (usersCollection) await usersCollection.insertOne(user);
                inMemoryUsers.set(cleanEmail, user);
                inMemoryUsers.set(user.username, user);
            } else {
                const updateFields = { lastLoginAt: new Date(), githubId: githubUser.id, provider: 'github' };
                if (usersCollection) await usersCollection.updateOne({ _id: user._id || user.id }, { $set: updateFields });
                inMemoryUsers.set(cleanEmail, { ...user, ...updateFields });
            }

            const sessionToken = 'alg_' + crypto.randomBytes(32).toString('hex');
            const session = {
                token: sessionToken,
                userId: user.id || user._id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                role: user.role || 'DSA Scholar',
                avatarUrl: user.avatarUrl,
                provider: 'github',
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            };
            await saveSession(session);
            return res.redirect(`/login.html?token=${encodeURIComponent(sessionToken)}&auth_success=github&redirect=${encodeURIComponent(redirectParam)}`);
        } catch (e) {
            console.error('[GitHub Auto-Auth Error]', e);
            return res.redirect(`/login.html?error=auto_auth_failed&message=${encodeURIComponent(e.message)}`);
        }
    }

    const state = crypto.randomBytes(24).toString('hex');
    oauthStates.set(state, {
        provider: 'github',
        redirect: redirectParam,
        createdAt: Date.now()
    });

    const rootUrl = 'https://github.com/login/oauth/authorize';
    const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: GITHUB_CALLBACK_URL,
        scope: 'read:user user:email',
        state: state
    });

    res.redirect(`${rootUrl}?${params.toString()}`);
});

// GET /api/auth/github/callback - Handle GitHub OAuth Callback
app.get('/api/auth/github/callback', async (req, res) => {
    const { code, state, error, error_description } = req.query;

    if (error) {
        return res.redirect(`/login.html?error=${encodeURIComponent(error)}&message=${encodeURIComponent(error_description || 'GitHub authentication cancelled.')}`);
    }

    if (!state || !oauthStates.has(state)) {
        return res.redirect('/login.html?error=invalid_state&message=OAuth%20state%20mismatch.');
    }

    const stateData = oauthStates.get(state);
    oauthStates.delete(state);
    const targetRedirect = stateData.redirect || 'codelab.html';

    try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: GITHUB_CALLBACK_URL
            })
        });

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok || !tokenData.access_token) {
            return res.redirect(`/login.html?error=token_exchange_failed&message=${encodeURIComponent(tokenData.error_description || 'GitHub token exchange failed.')}`);
        }

        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                'User-Agent': 'AlgoLearn-App'
            }
        });
        const ghUser = await userResponse.json();

        // Get primary email
        let email = ghUser.email;
        if (!email) {
            const emailsResponse = await fetch('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    'User-Agent': 'AlgoLearn-App'
                }
            });
            const emails = await emailsResponse.json();
            if (Array.isArray(emails)) {
                const primary = emails.find(e => e.primary && e.verified) || emails[0];
                if (primary) email = primary.email;
            }
        }
        if (!email) email = `${ghUser.login}@users.noreply.github.com`;

        const cleanEmail = email.toLowerCase().trim();
        let user = null;

        if (usersCollection) {
            user = await usersCollection.findOne({
                $or: [{ githubId: String(ghUser.id) }, { email: cleanEmail }]
            });
        }
        if (!user) user = inMemoryUsers.get(cleanEmail);

        if (!user) {
            user = {
                id: 'usr_gh_' + ghUser.id,
                githubId: String(ghUser.id),
                email: cleanEmail,
                username: ghUser.login.toLowerCase(),
                fullName: ghUser.name || ghUser.login,
                role: 'Dev Pick Engineer',
                provider: 'github',
                avatarUrl: ghUser.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanEmail}`,
                createdAt: new Date(),
                lastLoginAt: new Date()
            };
            if (usersCollection) await usersCollection.insertOne(user);
            inMemoryUsers.set(cleanEmail, user);
            inMemoryUsers.set(user.username, user);
        } else {
            const updateFields = {
                lastLoginAt: new Date(),
                githubId: String(ghUser.id),
                provider: user.provider || 'github'
            };
            if (ghUser.avatar_url) {
                updateFields.avatarUrl = ghUser.avatar_url;
                user.avatarUrl = ghUser.avatar_url;
            }
            if (usersCollection) await usersCollection.updateOne({ _id: user._id || user.id }, { $set: updateFields });
            inMemoryUsers.set(cleanEmail, { ...user, ...updateFields });
        }

        const sessionToken = 'alg_' + crypto.randomBytes(32).toString('hex');
        const session = {
            token: sessionToken,
            userId: user.id || user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: user.role || 'Dev Pick Engineer',
            avatarUrl: user.avatarUrl,
            provider: 'github',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        await saveSession(session);

        res.redirect(`/login.html?token=${encodeURIComponent(sessionToken)}&auth_success=github&redirect=${encodeURIComponent(targetRedirect)}`);
    } catch (err) {
        console.error('[GitHub OAuth Error]:', err);
        res.redirect(`/login.html?error=github_internal_error&message=${encodeURIComponent(err.message)}`);
    }
});

// GET /api/auth/me - Validate session and get current profile
app.get('/api/auth/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.query.token;

        if (!token) {
            return res.status(401).json({ success: false, error: 'Not authenticated or no session token provided.' });
        }

        const session = await getSession(token);
        if (!session) {
            return res.status(401).json({ success: false, error: 'Session expired or invalid. Please sign in again.' });
        }

        res.json({
            success: true,
            user: {
                id: session.userId,
                email: session.email,
                username: session.username,
                fullName: session.fullName,
                role: session.role,
                avatarUrl: session.avatarUrl,
                provider: session.provider || 'local'
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/auth/logout - Invalidate session
app.post('/api/auth/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.body.token || req.query.token;
        if (token) {
            await deleteSession(token);
        }
        res.json({ success: true, message: 'Logged out successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Universal Live Code Debugger Tracing Endpoint
const debuggerRunner = require('./debugger/runner');

app.post('/api/debug/trace', async (req, res) => {
    try {
        const { code, language, breakpoints, input } = req.body;
        if (code === undefined || typeof code !== 'string') {
            return res.status(400).json({
                success: false,
                error: { message: 'Missing code parameter in request body' }
            });
        }

        const traceResult = await debuggerRunner.run({
            code,
            language,
            breakpoints: Array.isArray(breakpoints) ? breakpoints : [],
            input: input || ''
        });

        res.json(traceResult);
    } catch (err) {
        console.error('[API /api/debug/trace] Error:', err);
        res.status(500).json({
            success: false,
            error: {
                type: 'InternalServerError',
                message: err.message || 'Execution failed'
            },
            steps: [],
            stdout: '',
            stderr: err.message
        });
    }
});

// Page routing
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/dashboard', (req, res) => {
    res.redirect('/codelab');
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
