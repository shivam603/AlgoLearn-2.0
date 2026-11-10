/**
 * Unified 100-Problem Bank Aggregator (30 Easy + 40 Medium + 30 Hard)
 */

const { generateDuelSkeleton } = require('../codelab-harness');
const EASY_PROBLEMS = require('./easy');
const MEDIUM_PROBLEMS = require('./medium');
const HARD_PROBLEMS = require('./hard');

const RAW_PROBLEMS = [...EASY_PROBLEMS, ...MEDIUM_PROBLEMS, ...HARD_PROBLEMS];

// Validate counts & uniqueness at boot time
const seenIds = new Set();
const PROBLEMS = RAW_PROBLEMS.map((p) => {
    if (seenIds.has(p.id)) {
        throw new Error(`Duplicate problem ID detected: ${p.id}`);
    }
    seenIds.add(p.id);
    return {
        ...p,
        duelSkeletons: generateDuelSkeleton(p)
    };
});

const COUNTS = {
    total: PROBLEMS.length,
    Easy: EASY_PROBLEMS.length,
    Medium: MEDIUM_PROBLEMS.length,
    Hard: HARD_PROBLEMS.length
};

module.exports = {
    PROBLEMS,
    EASY_PROBLEMS,
    MEDIUM_PROBLEMS,
    HARD_PROBLEMS,
    COUNTS
};

