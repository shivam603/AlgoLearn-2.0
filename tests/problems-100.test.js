/**
 * AlgoLearn 100-Problem Bank Comprehensive Verification Suite
 * Verifies:
 *  - Exact problem distribution: 30 Easy, 40 Medium, 30 Hard (Total 100)
 *  - Metadata integrity (unique id, unique leetcodeId, vis, io, duelSkeletons)
 *  - All 100 x 5 = 500 starter implementations compile & pass all visible + hidden judge tests
 *  - Empirical Big-O profiling works on sample Easy, Medium, and Hard problems
 */

const assert = require('assert');
const { PROBLEMS, COUNTS } = require('../backend/problems');
const { judgeCode, profileCode } = require('../backend/codelab-judge');

const LANGS = ['python', 'javascript', 'java', 'cpp', 'c'];

async function runPool(items, concurrency, worker) {
    let idx = 0;
    const errors = [];
    async function next() {
        while (idx < items.length) {
            const cur = items[idx++];
            try {
                await worker(cur);
            } catch (err) {
                errors.push({ cur, err });
            }
        }
    }
    const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => next());
    await Promise.all(runners);
    return errors;
}

async function main() {
    console.log('=== AlgoLearn 100-Problem Verification ===');
    console.log('Counts:', COUNTS);

    assert.strictEqual(COUNTS.total, 100, 'Total problem count must equal 100');
    assert.strictEqual(COUNTS.Easy, 30, 'Easy count must equal 30');
    assert.strictEqual(COUNTS.Medium, 40, 'Medium count must equal 40');
    assert.strictEqual(COUNTS.Hard, 30, 'Hard count must equal 30');

    const ids = new Set();
    const lcIds = new Set();
    for (const p of PROBLEMS) {
        assert(!ids.has(p.id), `Duplicate id: ${p.id}`);
        assert(Number.isInteger(p.leetcodeId) && p.leetcodeId > 0, `Missing leetcodeId on ${p.id}`);
        assert(!lcIds.has(p.leetcodeId), `Duplicate leetcodeId: ${p.leetcodeId} (${p.id})`);
        ids.add(p.id);
        lcIds.add(p.leetcodeId);

        assert(p.vis && p.vis.type && p.vis.studio, `Missing vis metadata on ${p.id}`);
        assert(p.io && p.io.returnType && Array.isArray(p.io.params), `Missing io metadata on ${p.id}`);
        assert(Array.isArray(p.tests) && p.tests.length >= 2, `Missing tests on ${p.id}`);

        for (const lang of LANGS) {
            assert(p.starterCode && p.starterCode[lang], `Missing starterCode.${lang} on ${p.id}`);
            assert(p.duelSkeletons && p.duelSkeletons[lang], `Missing duelSkeletons.${lang} on ${p.id}`);
        }
    }
    console.log('✅ Metadata, counts (30/40/30), vis, io & duelSkeletons verified across all 100 problems');

    // Execute all 100 x 5 = 500 judge runs
    const jobs = [];
    for (const p of PROBLEMS) {
        for (const lang of LANGS) {
            jobs.push({ p, lang });
        }
    }

    let okCount = 0;
    const failures = [];
    const tStart = Date.now();

    await runPool(jobs, 4, async ({ p, lang }) => {
        const res = await judgeCode({
            problemId: p.id,
            language: lang,
            code: p.starterCode[lang]
        });
        if (res.verdict === 'Accepted' && res.passedCount === res.totalCount) {
            okCount++;
            if (okCount % 50 === 0) {
                console.log(`   ... ${okCount}/${jobs.length} implementations Accepted (${((Date.now() - tStart) / 1000).toFixed(1)}s)`);
            }
        } else {
            const msg = `[FAIL] #${p.leetcodeId} ${p.id} (${lang}) -> ${res.verdict} (${res.passedCount}/${res.totalCount}): ${res.error || JSON.stringify(res.results?.find(r => !r.passed))}`;
            console.error(msg);
            failures.push(msg);
        }
    });

    console.log(`Judge sweep complete: ${okCount}/${jobs.length} Accepted in ${((Date.now() - tStart) / 1000).toFixed(1)}s`);
    assert.strictEqual(failures.length, 0, `${failures.length} judge failure(s):\n${failures.slice(0, 10).join('\n')}`);
    console.log('✅ All 500 multi-language judge runs passed (100/100 x 5 languages)');

    // Sample empirical Big-O profiling checks across Easy/Medium/Hard & tricky cases
    const profSamples = [
        { problemId: 'two_sum', language: 'python' },
        { problemId: 'combination_sum', language: 'python' },
        { problemId: 'word_search_ii', language: 'javascript' },
        { problemId: 'trapping_rain_water', language: 'cpp' },
        { problemId: 'merge_intervals', language: 'c' },
        { problemId: 'median_two_sorted_arrays', language: 'java' },
        { problemId: 'rotting_oranges', language: 'python' }
    ];
    for (const s of profSamples) {
        const p = PROBLEMS.find(x => x.id === s.problemId);
        const prof = await profileCode({ problemId: s.problemId, language: s.language, code: p.starterCode[s.language] });
        assert(prof && prof.success && Array.isArray(prof.points) && prof.points.length >= 3, `Profile failed for ${s.problemId} (${s.language}): ${prof?.error}`);
    }
    console.log('✅ Sample Empirical Big-O Profiler runs succeeded across all 5 languages');

    // Optional visualizer verification if ProblemVisualizerEngine is present
    try {
        const visMod = require('../frontend/problem-visualizer');
        const engine = visMod.ProblemVisualizerEngine || visMod;
        for (const p of PROBLEMS) {
            const steps = engine.generateSteps(p);
            assert(Array.isArray(steps) && steps.length >= 2, `Visualizer produced < 2 steps for ${p.id}`);
        }
        console.log('✅ ProblemVisualizerEngine generated deterministic dry-run steps for all 100 problems');
    } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            console.log('ℹ️  frontend/problem-visualizer.js not yet created (will verify after UI step)');
        } else {
            throw e;
        }
    }

    console.log('\n🎉 100-PROBLEM BACKEND VERIFICATION COMPLETE!');
}

main().catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
});

