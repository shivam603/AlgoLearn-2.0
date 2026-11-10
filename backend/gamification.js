/**
 * AlgoLearn Gamification, Skill Mastery & Global Leaderboard Engine
 * Tracks persistent XP, Levels, Daily Streaks, Solved Problems, Topic Mastery & Badges.
 */

const LEVEL_TITLES = [
    { minXp: 0, level: 1, title: 'Syntax Novice' },
    { minXp: 100, level: 2, title: 'Loop Explorer' },
    { minXp: 250, level: 3, title: 'Array Strategist' },
    { minXp: 450, level: 4, title: 'Pointer Architect' },
    { minXp: 750, level: 5, title: 'Graph Navigator' },
    { minXp: 1150, level: 6, title: 'DP Mastermind' },
    { minXp: 1650, level: 7, title: 'Grandmaster Engineer' }
];

const BADGE_DEFS = [
    { id: 'first_blood', name: 'First Solve', icon: 'bi-check2-circle', desc: 'Accepted your first CodeLab problem', check: p => (p.solvedProblems || []).length >= 1 },
    { id: 'problem_crusher', name: 'DSA Tactician', icon: 'bi-trophy-fill', desc: 'Solved 3 or more CodeLab problems', check: p => (p.solvedProblems || []).length >= 3 },
    { id: 'ten_solves', name: 'Deca Solver', icon: 'bi-award-fill', desc: 'Solved 10 or more CodeLab problems', check: p => (p.solvedProblems || []).length >= 10 },
    { id: 'thirty_solves', name: 'Century Grinder', icon: 'bi-gem', desc: 'Solved 30 or more CodeLab problems', check: p => (p.solvedProblems || []).length >= 30 },
    { id: 'polyglot', name: 'Polyglot Coder', icon: 'bi-translate', desc: 'Solved problems in 2+ languages', check: p => (p.languagesUsed || []).length >= 2 },
    { id: 'duel_champion', name: 'Arena Victor', icon: 'bi-lightning-charge-fill', desc: 'Won a 1v1 Coding Duel', check: p => (p.duelsWon || 0) >= 1 },
    { id: 'streak_fire', name: 'Streak Ignited', icon: 'bi-fire', desc: 'Maintained an active learning streak', check: p => (p.streakDays || 1) >= 2 },
    { id: 'xp_500', name: 'Elite Scholar', icon: 'bi-stars', desc: 'Reached 500+ total XP', check: p => (p.xp || 0) >= 500 }
];

const DEFAULT_TOPIC_STATS = {
    'Arrays & Hashing': 20,
    'Stack & Queue': 15,
    'Searching': 25,
    'Sorting & Intervals': 20,
    'Dynamic Programming': 10,
    'Graphs & Trees': 15
};

function computeLevelInfo(xp = 0) {
    let current = LEVEL_TITLES[0];
    let next = LEVEL_TITLES[1] || null;
    for (let i = 0; i < LEVEL_TITLES.length; i++) {
        if (xp >= LEVEL_TITLES[i].minXp) {
            current = LEVEL_TITLES[i];
            next = LEVEL_TITLES[i + 1] || null;
        }
    }
    const base = current.minXp;
    const cap = next ? next.minXp : current.minXp + 500;
    const pct = Math.max(0, Math.min(100, Math.round(((xp - base) / Math.max(1, cap - base)) * 100)));
    return {
        level: current.level,
        levelTitle: current.title,
        currentLevelXp: base,
        nextLevelXp: cap,
        progressPct: pct
    };
}

function getTodayStr() {
    return new Date().toISOString().slice(0, 10);
}

class GamificationService {
    constructor() {
        this.collection = null;
        this.inMemory = new Map();
    }

    async init(db) {
        if (db) {
            try {
                this.collection = db.collection('user_progress');
                await this.collection.createIndex({ userId: 1 }, { unique: true });
                await this.collection.createIndex({ xp: -1 });
            } catch (e) {
                console.warn('[Gamification] DB index warning:', e.message);
            }
        }
        await this.seedBaselineProfiles();
    }

    async seedBaselineProfiles() {
        const seeds = [
            {
                userId: 'usr_101',
                username: 'dev',
                fullName: 'Alex Rivera',
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                xp: 480,
                streakDays: 5,
                lastActiveDate: getTodayStr(),
                solvedProblems: ['two_sum', 'valid_parentheses', 'binary_search'],
                languagesUsed: ['python', 'java'],
                duelsPlayed: 4,
                duelsWon: 3,
                quizzesCompleted: 6,
                topicStats: {
                    'Arrays & Hashing': 82,
                    'Stack & Queue': 74,
                    'Searching': 88,
                    'Sorting & Intervals': 65,
                    'Dynamic Programming': 45,
                    'Graphs & Trees': 58
                }
            },
            {
                userId: 'usr_102',
                username: 'student',
                fullName: 'Sarah Chen',
                avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
                xp: 620,
                streakDays: 7,
                lastActiveDate: getTodayStr(),
                solvedProblems: ['two_sum', 'valid_parentheses', 'max_subarray', 'merge_intervals'],
                languagesUsed: ['cpp', 'python'],
                duelsPlayed: 6,
                duelsWon: 5,
                quizzesCompleted: 9,
                topicStats: {
                    'Arrays & Hashing': 90,
                    'Stack & Queue': 85,
                    'Searching': 78,
                    'Sorting & Intervals': 88,
                    'Dynamic Programming': 72,
                    'Graphs & Trees': 66
                }
            },
            {
                userId: 'usr_seed_priya',
                username: 'priya_algo',
                fullName: 'Priya Nair',
                avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=PriyaNair',
                xp: 390,
                streakDays: 4,
                lastActiveDate: getTodayStr(),
                solvedProblems: ['two_sum', 'binary_search', 'climbing_stairs'],
                languagesUsed: ['java'],
                duelsPlayed: 3,
                duelsWon: 2,
                quizzesCompleted: 5,
                topicStats: {
                    'Arrays & Hashing': 72,
                    'Stack & Queue': 60,
                    'Searching': 80,
                    'Sorting & Intervals': 55,
                    'Dynamic Programming': 62,
                    'Graphs & Trees': 48
                }
            },
            {
                userId: 'usr_seed_rohan',
                username: 'rohan_dp',
                fullName: 'Rohan Mehta',
                avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=RohanMehta',
                xp: 270,
                streakDays: 2,
                lastActiveDate: getTodayStr(),
                solvedProblems: ['two_sum', 'climbing_stairs'],
                languagesUsed: ['javascript'],
                duelsPlayed: 2,
                duelsWon: 1,
                quizzesCompleted: 4,
                topicStats: {
                    'Arrays & Hashing': 64,
                    'Stack & Queue': 52,
                    'Searching': 50,
                    'Sorting & Intervals': 40,
                    'Dynamic Programming': 58,
                    'Graphs & Trees': 35
                }
            }
        ];

        for (const seed of seeds) {
            this.inMemory.set(seed.userId, seed);
            if (this.collection) {
                try {
                    await this.collection.updateOne(
                        { userId: seed.userId },
                        { $setOnInsert: seed },
                        { upsert: true }
                    );
                } catch (e) {}
            }
        }
    }

    enrichProfile(doc) {
        const xp = Number(doc.xp || 0);
        const levelInfo = computeLevelInfo(xp);
        const badges = BADGE_DEFS.map(b => ({
            id: b.id,
            name: b.name,
            icon: b.icon,
            desc: b.desc,
            earned: Boolean(b.check(doc))
        }));
        return {
            userId: doc.userId,
            username: doc.username || 'learner',
            fullName: doc.fullName || doc.username || 'Learner',
            avatarUrl: doc.avatarUrl || '',
            xp,
            ...levelInfo,
            streakDays: doc.streakDays || 1,
            lastActiveDate: doc.lastActiveDate || getTodayStr(),
            solvedProblems: Array.isArray(doc.solvedProblems) ? doc.solvedProblems : [],
            languagesUsed: Array.isArray(doc.languagesUsed) ? doc.languagesUsed : [],
            duelsPlayed: doc.duelsPlayed || 0,
            duelsWon: doc.duelsWon || 0,
            quizzesCompleted: doc.quizzesCompleted || 0,
            topicStats: { ...DEFAULT_TOPIC_STATS, ...(doc.topicStats || {}) },
            badges
        };
    }

    async getRawDoc(user) {
        const uid = String(user.userId || user.id);
        let doc = null;
        if (this.collection) {
            doc = await this.collection.findOne({ userId: uid });
        }
        if (!doc) doc = this.inMemory.get(uid);
        if (!doc) {
            doc = {
                userId: uid,
                username: user.username || 'learner',
                fullName: user.fullName || user.username || 'Learner',
                avatarUrl: user.avatarUrl || '',
                xp: 50,
                streakDays: 1,
                lastActiveDate: getTodayStr(),
                solvedProblems: [],
                languagesUsed: [],
                duelsPlayed: 0,
                duelsWon: 0,
                quizzesCompleted: 0,
                topicStats: { ...DEFAULT_TOPIC_STATS }
            };
            this.inMemory.set(uid, doc);
            if (this.collection) {
                try { await this.collection.insertOne(doc); } catch (e) {}
            }
        }
        return doc;
    }

    async saveDoc(doc) {
        this.inMemory.set(doc.userId, doc);
        if (this.collection) {
            await this.collection.updateOne(
                { userId: doc.userId },
                { $set: doc },
                { upsert: true }
            );
        }
    }

    touchStreak(doc) {
        const today = getTodayStr();
        if (!doc.lastActiveDate) {
            doc.streakDays = 1;
            doc.lastActiveDate = today;
            return;
        }
        if (doc.lastActiveDate === today) return;
        const prev = new Date(doc.lastActiveDate);
        const curr = new Date(today);
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            doc.streakDays = (doc.streakDays || 1) + 1;
        } else if (diffDays > 1) {
            doc.streakDays = 1;
        }
        doc.lastActiveDate = today;
    }

    mapTopicBucket(topic = '') {
        const t = topic.toLowerCase();
        if (t.includes('stack') || t.includes('queue') || t.includes('linked')) return 'Stack & Queue';
        if (t.includes('search') || t.includes('two pointer') || t.includes('sliding')) return 'Searching';
        if (t.includes('sort') || t.includes('interval') || t.includes('heap') || t.includes('greedy')) return 'Sorting & Intervals';
        if (t.includes('dynamic') || t.includes('dp') || t.includes('backtrack')) return 'Dynamic Programming';
        if (t.includes('graph') || t.includes('tree') || t.includes('bst')) return 'Graphs & Trees';
        return 'Arrays & Hashing';
    }

    async getProgress(user) {
        const doc = await this.getRawDoc(user);
        return this.enrichProfile(doc);
    }

    async recordProblemSolve(user, { problemId, topic, language, xpReward = 50 }) {
        if (!user) return null;
        const doc = await this.getRawDoc(user);
        this.touchStreak(doc);

        doc.solvedProblems = Array.isArray(doc.solvedProblems) ? doc.solvedProblems : [];
        doc.languagesUsed = Array.isArray(doc.languagesUsed) ? doc.languagesUsed : [];
        doc.topicStats = { ...DEFAULT_TOPIC_STATS, ...(doc.topicStats || {}) };

        const firstSolve = !doc.solvedProblems.includes(problemId);
        let gainedXp = 0;
        if (firstSolve) {
            doc.solvedProblems.push(problemId);
            gainedXp = xpReward;
            const bucket = this.mapTopicBucket(topic);
            doc.topicStats[bucket] = Math.min(100, (doc.topicStats[bucket] || 15) + 18);
        } else {
            gainedXp = 5; // Repeat practice boost
        }

        if (language && !doc.languagesUsed.includes(language)) {
            doc.languagesUsed.push(language);
        }

        doc.xp = (doc.xp || 0) + gainedXp;
        await this.saveDoc(doc);
        return { gainedXp, firstSolve, profile: this.enrichProfile(doc) };
    }

    async recordDuelResult(user, { won }) {
        if (!user) return null;
        const doc = await this.getRawDoc(user);
        this.touchStreak(doc);
        doc.duelsPlayed = (doc.duelsPlayed || 0) + 1;
        if (won) doc.duelsWon = (doc.duelsWon || 0) + 1;
        const gainedXp = won ? 120 : 35;
        doc.xp = (doc.xp || 0) + gainedXp;
        doc.topicStats = { ...DEFAULT_TOPIC_STATS, ...(doc.topicStats || {}) };
        doc.topicStats['Sorting & Intervals'] = Math.min(100, (doc.topicStats['Sorting & Intervals'] || 20) + (won ? 12 : 4));
        await this.saveDoc(doc);
        return { gainedXp, profile: this.enrichProfile(doc) };
    }

    async recordLearningEvent(user, { type = 'practice', topic = '', amount = 15 }) {
        if (!user) return null;
        const doc = await this.getRawDoc(user);
        this.touchStreak(doc);
        const safeXp = Math.max(5, Math.min(100, Number(amount) || 15));
        doc.xp = (doc.xp || 0) + safeXp;
        if (type === 'quiz' || type === 'challenge') {
            doc.quizzesCompleted = (doc.quizzesCompleted || 0) + 1;
        }
        doc.topicStats = { ...DEFAULT_TOPIC_STATS, ...(doc.topicStats || {}) };
        const bucket = this.mapTopicBucket(topic);
        doc.topicStats[bucket] = Math.min(100, (doc.topicStats[bucket] || 15) + 6);
        await this.saveDoc(doc);
        return { gainedXp: safeXp, profile: this.enrichProfile(doc) };
    }

    async getLeaderboard(currentUserId = null, limit = 20) {
        let rows = [];
        if (this.collection) {
            rows = await this.collection.find({}).sort({ xp: -1 }).limit(limit).toArray();
        } else {
            rows = Array.from(this.inMemory.values()).sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, limit);
        }

        return rows.map((row, idx) => {
            const enriched = this.enrichProfile(row);
            return {
                rank: idx + 1,
                isCurrentUser: Boolean(currentUserId && String(row.userId) === String(currentUserId)),
                userId: enriched.userId,
                username: enriched.username,
                fullName: enriched.fullName,
                avatarUrl: enriched.avatarUrl,
                xp: enriched.xp,
                level: enriched.level,
                levelTitle: enriched.levelTitle,
                streakDays: enriched.streakDays,
                solvedCount: enriched.solvedProblems.length,
                duelsWon: enriched.duelsWon,
                badgesCount: enriched.badges.filter(b => b.earned).length
            };
        });
    }
}

module.exports = new GamificationService();

