/**
 * AlgoLearn Interactive Problem Visualizer Engine
 * Generates deterministic, input-driven step-by-step algorithm walkthrough frames
 * for all 100 curated LeetCode problems and renders theme-adaptive interactive canvases
 * with live editable inputs.
 * Compatible with browser globals (window.ProblemVisualizerEngine) and Node.js testing.
 */
(function (root) {
    'use strict';

    function esc(s) {
        return String(s ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function clone(v) {
        return v === undefined ? undefined : JSON.parse(JSON.stringify(v));
    }

    function parseSampleInput(problem) {
        if (problem && Array.isArray(problem.tests) && problem.tests[0] && problem.tests[0].input) {
            return clone(problem.tests[0].input);
        }
        if (problem && Array.isArray(problem.visibleTests) && problem.visibleTests[0] && problem.visibleTests[0].input) {
            return clone(problem.visibleTests[0].input);
        }
        const raw = problem && problem.examples && problem.examples[0] && problem.examples[0].input;
        const out = {};
        if (typeof raw === 'string') {
            const parts = [];
            let depth = 0, inStr = false, start = 0;
            for (let i = 0; i < raw.length; i++) {
                const c = raw[i];
                if (c === '"' && raw[i - 1] !== '\\') inStr = !inStr;
                else if (!inStr) {
                    if (c === '[' || c === '{') depth++;
                    else if (c === ']' || c === '}') depth--;
                    else if (c === ',' && depth === 0) {
                        parts.push(raw.slice(start, i).trim());
                        start = i + 1;
                    }
                }
            }
            parts.push(raw.slice(start).trim());
            for (const p of parts) {
                const eq = p.indexOf('=');
                if (eq > 0) {
                    const k = p.slice(0, eq).trim();
                    const vStr = p.slice(eq + 1).trim();
                    try {
                        out[k] = JSON.parse(vStr.replace(/'/g, '"'));
                    } catch (e) {
                        out[k] = vStr;
                    }
                }
            }
        }
        return out;
    }

    function getPresets(problem) {
        if (!problem) return [];
        if (Array.isArray(problem.visibleTests) && problem.visibleTests.length > 0) {
            return problem.visibleTests.map((t, i) => ({
                name: t.name || `Sample ${i + 1}`,
                input: clone(t.input)
            }));
        }
        if (Array.isArray(problem.tests) && problem.tests.length > 0) {
            const pub = problem.tests.filter(t => !t.hidden);
            const use = pub.length > 0 ? pub : problem.tests.slice(0, 3);
            return use.map((t, i) => ({
                name: t.name || `Sample ${i + 1}`,
                input: clone(t.input)
            }));
        }
        const def = parseSampleInput(problem);
        return Object.keys(def).length > 0 ? [{ name: 'Sample 1', input: def }] : [];
    }

    function findMatchingExpected(problem, input) {
        const list = (problem && (problem.tests || problem.visibleTests)) || [];
        if (!Array.isArray(list) || !input) return undefined;
        let inJson = '';
        try { inJson = JSON.stringify(input); } catch (e) { return undefined; }
        for (const t of list) {
            try {
                if (t && t.input && JSON.stringify(t.input) === inJson) {
                    return clone(t.expected);
                }
            } catch (e) {}
        }
        return undefined;
    }

    function toBitArray(num, bits = 8) {
        const n = Number(num) >>> 0;
        const out = [];
        for (let b = bits - 1; b >= 0; b--) {
            out.push((n >>> b) & 1);
        }
        return out;
    }

    // Build real pointer binary tree from LeetCode sparse level-order array
    function buildTree(arr) {
        if (!Array.isArray(arr) || arr.length === 0 || arr[0] === null || arr[0] === undefined) return null;
        const root = { val: arr[0], left: null, right: null };
        const q = [root];
        let i = 1;
        while (q.length > 0 && i < arr.length) {
            const node = q.shift();
            if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
                node.left = { val: arr[i], left: null, right: null };
                q.push(node.left);
            }
            i++;
            if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
                node.right = { val: arr[i], left: null, right: null };
                q.push(node.right);
            }
            i++;
        }
        return root;
    }

    function treeToHeapArray(root, maxDepth = 4) {
        const len = Math.pow(2, maxDepth) - 1;
        const out = Array(len).fill(null);
        function dfs(node, idx) {
            if (!node || idx >= len) return;
            out[idx] = node.val;
            dfs(node.left, 2 * idx + 1);
            dfs(node.right, 2 * idx + 2);
        }
        dfs(root, 0);
        return out;
    }

    function treeToSparseArray(root) {
        if (!root) return [];
        const out = [];
        const q = [root];
        while (q.length > 0 && out.length < 31) {
            const n = q.shift();
            if (!n) {
                out.push(null);
            } else {
                out.push(n.val);
                q.push(n.left);
                q.push(n.right);
            }
        }
        while (out.length > 0 && out[out.length - 1] === null) out.pop();
        return out;
    }

    // =========================================================
    // Primary Step Generator Router
    // =========================================================
    function generateSteps(problem, customInput) {
        if (!problem) return [];
        const id = problem.id;
        const visType = (problem.vis && problem.vis.type) || 'array';
        const input = customInput ? clone(customInput) : parseSampleInput(problem);
        // Only expose exp when input literally matches a stored test (never leak stale default expected on custom input!)
        const exp = findMatchingExpected(problem, input);

        let steps = [];
        try {
            if (id === 'two_sum') steps = genTwoSum(input);
            else if (id === 'trapping_rain_water') steps = genTrapRain(input);
            else if (id === 'container_with_most_water') steps = genContainerWater(input);
            else if (id === 'best_time_buy_sell_stock') steps = genStockEasy(input);
            else if (id === 'valid_palindrome' || id === 'reverse_string') steps = genTwoPointerString(id, input);
            else if (id === 'two_sum_ii' || id === 'three_sum') steps = genTwoThreeSum(id, input);
            else if (
                id === 'longest_substring_no_repeat' ||
                id === 'longest_repeating_char_replacement' ||
                id === 'min_size_subarray_sum' ||
                id === 'minimum_window_substring'
            ) {
                steps = genSlidingWindow(id, input);
            } else if (id === 'sort_colors') steps = genSortColors(input);
            else if (id === 'move_zeroes' || id === 'remove_duplicates_sorted') steps = genFastSlowArray(id, input);
            else if (id === 'n_queens_ii') steps = genNQueens(input);
            else if (visType === 'stack') steps = genStackProblem(id, input);
            else if (visType === 'linked_list') steps = genLinkedListProblem(id, input);
            else if (visType === 'tree') steps = genTreeProblem(id, input);
            else if (visType === 'search') steps = genSearchProblem(id, input);
            else if (visType === 'dp') steps = genDpProblem(id, input);
            else if (visType === 'grid') steps = genGridProblem(id, input);
            else if (visType === 'graph') steps = genGraphProblem(id, input);
            else if (visType === 'intervals') steps = genIntervalsProblem(id, input);
            else if (visType === 'backtracking') steps = genBacktrackingProblem(id, input);
            else if (visType === 'bits') steps = genBitsProblem(id, input);
            else steps = genArrayProblem(id, input, problem);
        } catch (err) {
            steps = [];
        }

        if (!Array.isArray(steps) || steps.length < 3) {
            steps = genFallbackSteps(problem, input, exp);
        }
        return steps;
    }

    // =========================================================
    // 1. Two Sum & Two Pointers & Sliding Window
    // =========================================================
    function genTwoSum(input) {
        const nums = Array.isArray(input.nums) ? input.nums.map(Number) : [2, 7, 11, 15];
        const target = Number(input.target ?? 9);
        const seen = {};
        const steps = [{
            kind: 'array',
            title: 'Initialize Hash Map',
            caption: `Target = ${target}. Store value -> index for O(1) complement lookup.`,
            items: nums.map(String),
            pointers: {},
            active: [],
            done: [],
            badges: { target, map: '{}' }
        }];
        let foundPair = null;
        for (let i = 0; i < nums.length; i++) {
            const need = target - nums[i];
            if (seen[need] !== undefined) {
                foundPair = [seen[need], i];
                steps.push({
                    kind: 'array',
                    title: `Found Complement at i=${i}`,
                    caption: `nums[${i}] = ${nums[i]}, need ${target} - ${nums[i]} = ${need} -> in map at [${seen[need]}]. Return [${seen[need]}, ${i}].`,
                    items: nums.map(String),
                    pointers: { j: seen[need], i },
                    active: [seen[need], i],
                    done: [seen[need], i],
                    badges: { target, need, map: JSON.stringify(seen), answer: `[${seen[need]}, ${i}]` }
                });
                break;
            }
            seen[nums[i]] = i;
            if (steps.length < 18) {
                steps.push({
                    kind: 'array',
                    title: `Scan Index i=${i}`,
                    caption: `nums[${i}] = ${nums[i]}, need = ${need} (missing). Map[${nums[i]}] = ${i}.`,
                    items: nums.map(String),
                    pointers: { i },
                    active: [i],
                    done: [],
                    badges: { target, need, map: JSON.stringify(seen) }
                });
            }
        }
        if (!foundPair) {
            steps.push({
                kind: 'array',
                title: 'Scan Finished — No Valid Pair',
                caption: `No two elements sum to ${target}.`,
                items: nums.map(String),
                pointers: {},
                active: [],
                done: [],
                badges: { target, answer: '[]' }
            });
        }
        return steps;
    }

    function genTrapRain(input) {
        const h = Array.isArray(input.height) && input.height.length ? input.height.map(Number) : [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
        const showH = h.slice(0, 16);
        const n = h.length;
        const leftMax = Array(n).fill(0), rightMax = Array(n).fill(0);
        for (let i = 0; i < n; i++) leftMax[i] = i === 0 ? h[0] : Math.max(leftMax[i - 1], h[i]);
        for (let i = n - 1; i >= 0; i--) rightMax[i] = i === n - 1 ? h[n - 1] : Math.max(rightMax[i + 1], h[i]);
        const finalWater = h.map((v, i) => Math.max(0, Math.min(leftMax[i], rightMax[i]) - v));
        const exactSum = finalWater.reduce((a, b) => a + b, 0);

        const steps = [{
            kind: 'bars',
            title: 'Initialize Two Pointers',
            caption: `Elevation length ${n}. Track leftMax & rightMax squeezing L=0 and R=${n - 1}.`,
            values: showH,
            water: Array(showH.length).fill(0),
            pointers: { L: 0, R: Math.min(showH.length - 1, n - 1) },
            active: [0, Math.min(showH.length - 1, n - 1)],
            badges: { lMax: h[0], rMax: h[n - 1], totalWater: 0 }
        }];
        let l = 0, r = n - 1, lMax = 0, rMax = 0, total = 0;
        const water = Array(showH.length).fill(0);
        while (l < r) {
            if (h[l] <= h[r]) {
                lMax = Math.max(lMax, h[l]);
                const add = Math.max(0, lMax - h[l]);
                if (l < water.length) water[l] = add;
                total += add;
                if (steps.length < 18) {
                    steps.push({
                        kind: 'bars',
                        title: `Move Left (L=${l})`,
                        caption: `h[${l}]=${h[l]} <= h[${r}]=${h[r]}. lMax=${lMax}, trapped=${add}, runningTotal=${total}.`,
                        values: showH,
                        water: water.slice(),
                        pointers: l < showH.length ? { L: l, ...(r < showH.length ? { R: r } : {}) } : {},
                        active: l < showH.length ? [l] : [],
                        badges: { lMax, rMax, totalWater: total }
                    });
                }
                l++;
            } else {
                rMax = Math.max(rMax, h[r]);
                const add = Math.max(0, rMax - h[r]);
                if (r < water.length) water[r] = add;
                total += add;
                if (steps.length < 18) {
                    steps.push({
                        kind: 'bars',
                        title: `Move Right (R=${r})`,
                        caption: `h[${r}]=${h[r]} < h[${l}]=${h[l]}. rMax=${rMax}, trapped=${add}, runningTotal=${total}.`,
                        values: showH,
                        water: water.slice(),
                        pointers: r < showH.length ? { L: l, R: r } : {},
                        active: r < showH.length ? [r] : [],
                        badges: { lMax, rMax, totalWater: total }
                    });
                }
                r--;
            }
        }
        steps.push({
            kind: 'bars',
            title: 'All Elevation Water Computed',
            caption: `Completed scan. Total trapped rainwater = ${exactSum} units.`,
            values: showH,
            water: finalWater.slice(0, showH.length),
            pointers: {},
            active: [],
            done: showH.map((_, idx) => idx),
            badges: { totalWater: exactSum, answer: exactSum }
        });
        return steps;
    }

    function genContainerWater(input) {
        const h = Array.isArray(input.height) && input.height.length ? input.height.map(Number) : [1, 8, 6, 2, 5, 4, 8, 3, 7];
        const showH = h.slice(0, 16);
        let l = 0, r = h.length - 1, best = 0, bestPair = [0, Math.max(0, r)];
        const steps = [{
            kind: 'bars',
            title: 'Initialize L=0, R=n-1',
            caption: `Maximize min(h[L], h[R]) * (R - L). Start at [${l}, ${r}].`,
            values: showH,
            pointers: { L: l, ...(r < showH.length ? { R: r } : {}) },
            active: [l, ...(r < showH.length ? [r] : [])],
            badges: { bestArea: 0 }
        }];
        while (l < r) {
            const area = Math.min(h[l], h[r]) * (r - l);
            if (area > best) { best = area; bestPair = [l, r]; }
            if (steps.length < 18) {
                steps.push({
                    kind: 'bars',
                    title: `Evaluate [${l}, ${r}]`,
                    caption: `Area = min(${h[l]}, ${h[r]}) * (${r} - ${l}) = ${area}. Best = ${best}.`,
                    values: showH,
                    pointers: { L: l, ...(r < showH.length ? { R: r } : {}) },
                    active: [l, ...(r < showH.length ? [r] : [])],
                    badges: { width: r - l, curArea: area, bestArea: best }
                });
            }
            if (h[l] < h[r]) l++; else r--;
        }
        steps.push({
            kind: 'bars',
            title: 'Maximum Area Found',
            caption: `Optimal lines [${bestPair[0]}, ${bestPair[1]}] hold ${best} units of water.`,
            values: showH,
            pointers: bestPair[1] < showH.length ? { L: bestPair[0], R: bestPair[1] } : {},
            active: bestPair.filter(idx => idx < showH.length),
            done: bestPair.filter(idx => idx < showH.length),
            badges: { bestArea: best, answer: best }
        });
        return steps;
    }

    function genStockEasy(input) {
        const prices = Array.isArray(input.prices) && input.prices.length ? input.prices.map(Number) : [7, 1, 5, 3, 6, 4];
        const showP = prices.slice(0, 16);
        let minP = prices[0], minIdx = 0, maxProfit = 0, buyIdx = 0, sellIdx = 0;
        const steps = [{
            kind: 'bars',
            title: 'Track Lowest Buy Price',
            caption: `Start at day 0 (price=${minP}). Scan tracking minPrice & maxProfit.`,
            values: showP,
            pointers: { min: 0 },
            active: [0],
            badges: { minPrice: minP, maxProfit: 0 }
        }];
        for (let i = 1; i < prices.length; i++) {
            if (prices[i] < minP) {
                minP = prices[i];
                minIdx = i;
                if (steps.length < 18) {
                    steps.push({
                        kind: 'bars',
                        title: `New Low Price on Day ${i}`,
                        caption: `price[${i}]=${prices[i]} is new minimum buy price.`,
                        values: showP,
                        pointers: i < showP.length ? { buy: minIdx, cur: i } : {},
                        active: i < showP.length ? [i] : [],
                        badges: { minPrice: minP, maxProfit }
                    });
                }
            } else {
                const prof = prices[i] - minP;
                if (prof > maxProfit) {
                    maxProfit = prof;
                    buyIdx = minIdx;
                    sellIdx = i;
                }
                if (steps.length < 18) {
                    steps.push({
                        kind: 'bars',
                        title: `Check Sell on Day ${i}`,
                        caption: `Sell at ${prices[i]} (bought at ${minP}) -> profit=${prof}. Best=${maxProfit}.`,
                        values: showP,
                        pointers: i < showP.length ? { buy: minIdx, sell: i } : {},
                        active: [minIdx, i].filter(idx => idx < showP.length),
                        badges: { minPrice: minP, profit: prof, maxProfit }
                    });
                }
            }
        }
        steps.push({
            kind: 'bars',
            title: 'Maximum Profit Computed',
            caption: maxProfit > 0 ? `Buy day ${buyIdx} (${prices[buyIdx]}), sell day ${sellIdx} (${prices[sellIdx]}) -> profit = ${maxProfit}.` : 'No profitable trade -> maxProfit = 0.',
            values: showP,
            pointers: (maxProfit > 0 && sellIdx < showP.length) ? { buy: buyIdx, sell: sellIdx } : {},
            done: maxProfit > 0 ? [buyIdx, sellIdx].filter(idx => idx < showP.length) : [],
            active: [],
            badges: { maxProfit, answer: maxProfit }
        });
        return steps;
    }

    function genTwoPointerString(id, input) {
        let chars = Array.isArray(input.s)
            ? input.s.map(String)
            : (id === 'reverse_string'
                ? String(input.s ?? 'hello').split('')
                : String(input.s ?? 'amanaplanacanalpanama').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().split(''));
        if (chars.length === 0) chars = [' '];
        const view = chars.slice(0, 16);
        let l = 0, r = chars.length - 1, isPal = true;
        const steps = [{
            kind: 'array',
            title: id === 'reverse_string' ? 'Two-Pointer In-Place Swap' : 'Two-Pointer Palindrome Check',
            caption: `Initialize L=0 and R=${r}.`,
            items: view.slice(),
            pointers: { L: 0, ...(r < view.length ? { R: r } : {}) },
            active: [0, ...(r < view.length ? [r] : [])],
            done: [],
            badges: { length: chars.length }
        }];
        while (l < r) {
            if (id === 'reverse_string') {
                [chars[l], chars[r]] = [chars[r], chars[l]];
                if (steps.length < 16) {
                    steps.push({
                        kind: 'array',
                        title: `Swap L=${l} & R=${r}`,
                        caption: `Swapped [${l}] <-> [${r}] -> "${chars[l]}" <-> "${chars[r]}".`,
                        items: chars.slice(0, 16),
                        pointers: { L: l, ...(r < 16 ? { R: r } : {}) },
                        active: [l, r].filter(x => x < 16),
                        done: [],
                        badges: { swapped: `${l}<->${r}` }
                    });
                }
            } else {
                const match = chars[l] === chars[r];
                if (!match) isPal = false;
                if (steps.length < 16) {
                    steps.push({
                        kind: 'array',
                        title: `Compare L=${l} ('${chars[l]}') & R=${r} ('${chars[r]}')`,
                        caption: match ? `'${chars[l]}' == '${chars[r]}'. Advance inward.` : `Mismatch ('${chars[l]}' != '${chars[r]}') -> false.`,
                        items: view.slice(),
                        pointers: { L: l, ...(r < 16 ? { R: r } : {}) },
                        active: [l, r].filter(x => x < 16),
                        done: match ? [l, r].filter(x => x < 16) : [],
                        badges: { match }
                    });
                }
                if (!match) break;
            }
            l++; r--;
        }
        steps.push({
            kind: 'array',
            title: id === 'reverse_string' ? 'Reversal Complete' : (isPal ? 'Valid Palindrome (true)' : 'Not a Palindrome (false)'),
            caption: id === 'reverse_string' ? `Output: [${chars.join(', ')}]` : `Result: ${isPal}`,
            items: chars.slice(0, 16),
            pointers: {},
            active: [],
            done: isPal ? view.map((_, i) => i) : [],
            badges: { answer: id === 'reverse_string' ? chars.join('') : isPal }
        });
        return steps;
    }

    function genTwoThreeSum(id, input) {
        const raw = Array.isArray(input.numbers) ? input.numbers.map(Number)
            : (Array.isArray(input.nums) ? input.nums.map(Number) : [-1, 0, 1, 2, -1, -4]);
        const arr = id === 'three_sum' ? raw.slice().sort((a, b) => a - b) : raw.slice();
        const show = arr.slice(0, 15);
        const target = Number(input.target ?? 0);
        const steps = [{
            kind: 'array',
            title: id === 'three_sum' ? 'Sort Array for 3Sum Sweep' : 'Sorted Array Two Pointers',
            caption: id === 'three_sum' ? `Sorted = [${arr.join(', ')}]. Fix i and sweep L, R.` : `Target = ${target}. Initialize L=0, R=${arr.length - 1}.`,
            items: show.map(String),
            pointers: { L: id === 'three_sum' ? Math.min(1, show.length - 1) : 0, ...(arr.length - 1 < show.length ? { R: arr.length - 1 } : {}) },
            active: [],
            done: [],
            badges: { target }
        }];
        if (id === 'two_sum_ii') {
            let l = 0, r = arr.length - 1, ans = [];
            while (l < r) {
                const s = arr[l] + arr[r];
                if (s === target) ans = [l + 1, r + 1];
                if (steps.length < 18) {
                    steps.push({
                        kind: 'array',
                        title: `Sum arr[${l}]+arr[${r}] = ${s}`,
                        caption: s === target ? `Found! Return 1-based [${l + 1}, ${r + 1}].` : (s < target ? `${s} < ${target}: L++` : `${s} > ${target}: R--`),
                        items: show.map(String),
                        pointers: { L: l, R: r },
                        active: [l, r],
                        done: s === target ? [l, r] : [],
                        badges: { sum: s, target, ...(ans.length ? { answer: JSON.stringify(ans) } : {}) }
                    });
                }
                if (s === target) break;
                if (s < target) l++; else r--;
            }
        } else {
            const triplets = [];
            for (let i = 0; i < arr.length - 2; i++) {
                if (i > 0 && arr[i] === arr[i - 1]) continue;
                let l = i + 1, r = arr.length - 1;
                while (l < r) {
                    const s = arr[i] + arr[l] + arr[r];
                    if (s === 0) {
                        triplets.push([arr[i], arr[l], arr[r]]);
                        if (steps.length < 16) {
                            steps.push({
                                kind: 'array',
                                title: `Triplet (${arr[i]}, ${arr[l]}, ${arr[r]})`,
                                caption: `Sum = 0 at [${i}, ${l}, ${r}]. Skip duplicates.`,
                                items: show.map(String),
                                pointers: { i, L: l, ...(r < show.length ? { R: r } : {}) },
                                active: [i, l, r].filter(x => x < show.length),
                                done: [i, l, r].filter(x => x < show.length),
                                badges: { found: triplets.length }
                            });
                        }
                        l++; r--;
                        while (l < r && arr[l] === arr[l - 1]) l++;
                        while (l < r && arr[r] === arr[r + 1]) r--;
                    } else {
                        if (steps.length < 14) {
                            steps.push({
                                kind: 'array',
                                title: `Check i=${i}, L=${l}, R=${r}`,
                                caption: `${arr[i]} + ${arr[l]} + ${arr[r]} = ${s} (${s < 0 ? 'L++' : 'R--'})`,
                                items: show.map(String),
                                pointers: { i, L: l, ...(r < show.length ? { R: r } : {}) },
                                active: [i, l, r].filter(x => x < show.length),
                                done: [],
                                badges: { sum: s, found: triplets.length }
                            });
                        }
                        if (s < 0) l++; else r--;
                    }
                }
            }
            steps.push({
                kind: 'array',
                title: 'Unique Triplets Computed',
                caption: `Found ${triplets.length} triplet(s): ${JSON.stringify(triplets)}`,
                items: show.map(String),
                pointers: {},
                active: [],
                done: show.map((_, k) => k),
                badges: { count: triplets.length, answer: JSON.stringify(triplets) }
            });
        }
        return steps;
    }

    function genSlidingWindow(id, input) {
        if (id === 'longest_substring_no_repeat') {
            const s = String(input.s ?? 'abcabcbb');
            const seq = s.slice(0, 16).split('');
            const last = new Map();
            let l = 0, best = 0, bestRange = [0, -1];
            const steps = [{
                kind: 'array',
                title: 'Initialize Sliding Window [L..R]',
                caption: `Expand R through "${s}"; jump L past repeated characters.`,
                items: seq.length ? seq : ['""'],
                pointers: { L: 0 },
                active: [],
                done: [],
                badges: { bestLen: 0 }
            }];
            for (let r = 0; r < s.length; r++) {
                const ch = s[r];
                if (last.has(ch) && last.get(ch) >= l) l = last.get(ch) + 1;
                last.set(ch, r);
                if (r - l + 1 > best) {
                    best = r - l + 1;
                    bestRange = [l, r];
                }
                if (steps.length < 18 && r < seq.length) {
                    steps.push({
                        kind: 'array',
                        title: `Window [${l}..${r}] "${s.slice(l, r + 1)}"`,
                        caption: `char='${ch}', len=${r - l + 1}, bestLen=${best}.`,
                        items: seq,
                        pointers: { L: l, R: r },
                        active: Array.from({ length: r - l + 1 }, (_, k) => l + k),
                        done: [],
                        badges: { windowLen: r - l + 1, bestLen: best }
                    });
                }
            }
            steps.push({
                kind: 'array',
                title: 'Longest Unique Substring Found',
                caption: `Max length = ${best}${best > 0 ? ` ("${s.slice(bestRange[0], bestRange[1] + 1)}")` : ''}.`,
                items: seq.length ? seq : ['""'],
                pointers: {},
                active: [],
                done: best > 0 ? Array.from({ length: bestRange[1] - bestRange[0] + 1 }, (_, k) => bestRange[0] + k).filter(x => x < seq.length) : [],
                badges: { answer: best }
            });
            return steps;
        }

        if (id === 'longest_repeating_char_replacement') {
            const s = String(input.s ?? 'ABAB');
            const k = Number(input.k ?? 2);
            const seq = s.slice(0, 16).split('');
            const freq = {};
            let l = 0, maxF = 0, best = 0;
            const steps = [{
                kind: 'array',
                title: `Character Replacement Window (k=${k})`,
                caption: `Keep (windowLen - maxFreq) <= ${k} by sliding L forward when exceeded.`,
                items: seq,
                pointers: { L: 0 },
                active: [],
                done: [],
                badges: { k, best: 0 }
            }];
            for (let r = 0; r < s.length; r++) {
                freq[s[r]] = (freq[s[r]] || 0) + 1;
                maxF = Math.max(maxF, freq[s[r]]);
                while ((r - l + 1) - maxF > k) {
                    freq[s[l]]--;
                    l++;
                }
                best = Math.max(best, r - l + 1);
                if (steps.length < 18 && r < seq.length) {
                    steps.push({
                        kind: 'array',
                        title: `Window [${l}..${r}] "${s.slice(l, r + 1)}"`,
                        caption: `maxFreq=${maxF}, replacements=${(r - l + 1) - maxF} <= ${k}. best=${best}.`,
                        items: seq,
                        pointers: { L: l, R: r },
                        active: Array.from({ length: r - l + 1 }, (_, x) => l + x),
                        done: [],
                        badges: { maxFreq: maxF, best }
                    });
                }
            }
            steps.push({
                kind: 'array',
                title: 'Longest Replaced Window Complete',
                caption: `Max length with <= ${k} replacements = ${best}.`,
                items: seq,
                pointers: {},
                active: [],
                done: seq.map((_, i) => i),
                badges: { k, answer: best }
            });
            return steps;
        }

        if (id === 'min_size_subarray_sum') {
            const nums = Array.isArray(input.nums) ? input.nums.map(Number) : [2, 3, 1, 2, 4, 3];
            const target = Number(input.target ?? 7);
            const show = nums.slice(0, 16);
            let l = 0, sum = 0, best = Infinity, bestSpan = null;
            const steps = [{
                kind: 'array',
                title: `Minimum Subarray Sum >= ${target}`,
                caption: `Expand R to grow sum >= ${target}, then shrink L for minimum length.`,
                items: show.map(String),
                pointers: { L: 0 },
                active: [],
                done: [],
                badges: { target, sum: 0, minLen: '∞' }
            }];
            for (let r = 0; r < nums.length; r++) {
                sum += nums[r];
                while (sum >= target) {
                    if (r - l + 1 < best) {
                        best = r - l + 1;
                        bestSpan = [l, r];
                    }
                    sum -= nums[l];
                    l++;
                }
                if (steps.length < 18 && r < show.length) {
                    steps.push({
                        kind: 'array',
                        title: `Expand R=${r} (Window L=${Math.min(l, r)})`,
                        caption: `sum=${sum}, minLen=${best === Infinity ? '∞' : best}.`,
                        items: show.map(String),
                        pointers: { L: Math.min(l, show.length - 1), R: r },
                        active: [r],
                        done: [],
                        badges: { target, sum, minLen: best === Infinity ? '∞' : best }
                    });
                }
            }
            const ans = best === Infinity ? 0 : best;
            steps.push({
                kind: 'array',
                title: 'Minimal Subarray Computed',
                caption: `Minimal length with sum >= ${target} is ${ans}.`,
                items: show.map(String),
                pointers: {},
                active: [],
                done: bestSpan ? Array.from({ length: bestSpan[1] - bestSpan[0] + 1 }, (_, x) => bestSpan[0] + x).filter(x => x < show.length) : [],
                badges: { target, answer: ans }
            });
            return steps;
        }

        // minimum_window_substring
        const s = String(input.s ?? 'ADOBECODEBANC');
        const t = String(input.t ?? 'ABC');
        const seq = s.slice(0, 16).split('');
        const need = {};
        for (const c of t) need[c] = (need[c] || 0) + 1;
        const required = Object.keys(need).length;
        const win = {};
        let formed = 0, l = 0, bestLen = Infinity, bestL = 0, bestR = -1;
        const steps = [{
            kind: 'array',
            title: `Find Minimum Window Containing "${t}"`,
            caption: `Expand R to cover all ${required} required chars, then shrink L.`,
            items: seq,
            pointers: { L: 0 },
            active: [],
            done: [],
            badges: { target: t, formed: `0/${required}` }
        }];
        for (let r = 0; r < s.length; r++) {
            const c = s[r];
            win[c] = (win[c] || 0) + 1;
            if (need[c] && win[c] === need[c]) formed++;
            while (l <= r && formed === required) {
                if (r - l + 1 < bestLen) {
                    bestLen = r - l + 1;
                    bestL = l;
                    bestR = r;
                }
                const lc = s[l];
                win[lc]--;
                if (need[lc] && win[lc] < need[lc]) formed--;
                l++;
            }
            if (steps.length < 18 && r < seq.length) {
                steps.push({
                    kind: 'array',
                    title: `Scan R=${r} ('${c}')`,
                    caption: `Best window so far: "${bestR >= bestL ? s.slice(bestL, bestR + 1) : 'none'}" (len=${bestLen === Infinity ? '∞' : bestLen}).`,
                    items: seq,
                    pointers: { L: Math.min(l, seq.length - 1), R: r },
                    active: [r],
                    done: [],
                    badges: { formed: `${formed}/${required}`, best: bestR >= bestL ? s.slice(bestL, bestR + 1) : '""' }
                });
            }
        }
        const ans = bestR >= bestL ? s.slice(bestL, bestR + 1) : '';
        steps.push({
            kind: 'array',
            title: 'Minimum Window Substring Found',
            caption: `Result = "${ans}" (length ${ans.length}).`,
            items: seq,
            pointers: {},
            active: [],
            done: ans ? Array.from({ length: bestR - bestL + 1 }, (_, x) => bestL + x).filter(x => x < seq.length) : [],
            badges: { answer: `"${ans}"` }
        });
        return steps;
    }

    function genSortColors(input) {
        const a = Array.isArray(input.nums) && input.nums.length ? input.nums.map(Number) : [2, 0, 2, 1, 1, 0];
        let low = 0, mid = 0, high = a.length - 1;
        const steps = [{
            kind: 'array',
            title: 'Dutch National Flag Init',
            caption: `Partition 0s, 1s, 2s with low=0, mid=0, high=${high}.`,
            items: a.slice(0, 16).map(String),
            pointers: { low, mid, ...(high < 16 ? { high } : {}) },
            active: [low, high].filter(x => x < 16),
            done: [],
            badges: { low, mid, high }
        }];
        while (mid <= high) {
            if (a[mid] === 0) {
                [a[low], a[mid]] = [a[mid], a[low]];
                if (steps.length < 18) {
                    steps.push({
                        kind: 'array',
                        title: `a[${mid}]==0: Swap a[${low}] & a[${mid}]`,
                        caption: `Move 0 left. Advance low=${low + 1}, mid=${mid + 1}.`,
                        items: a.slice(0, 16).map(String),
                        pointers: { low, mid, ...(high < 16 ? { high } : {}) },
                        active: [low, mid].filter(x => x < 16),
                        done: [],
                        badges: { low: low + 1, mid: mid + 1, high }
                    });
                }
                low++; mid++;
            } else if (a[mid] === 1) {
                if (steps.length < 18) {
                    steps.push({
                        kind: 'array',
                        title: `a[${mid}]==1: Keep Middle`,
                        caption: `1 in middle partition. Advance mid=${mid + 1}.`,
                        items: a.slice(0, 16).map(String),
                        pointers: { low, mid, ...(high < 16 ? { high } : {}) },
                        active: mid < 16 ? [mid] : [],
                        done: [],
                        badges: { low, mid: mid + 1, high }
                    });
                }
                mid++;
            } else {
                [a[mid], a[high]] = [a[high], a[mid]];
                if (steps.length < 18) {
                    steps.push({
                        kind: 'array',
                        title: `a[${mid}]==2: Swap a[${mid}] & a[${high}]`,
                        caption: `Place 2 at high=${high}. Shrink high=${high - 1}.`,
                        items: a.slice(0, 16).map(String),
                        pointers: { low, mid, ...(high < 16 ? { high } : {}) },
                        active: [mid, high].filter(x => x < 16),
                        done: high < 16 ? [high] : [],
                        badges: { low, mid, high: high - 1 }
                    });
                }
                high--;
            }
        }
        steps.push({
            kind: 'array',
            title: 'In-Place Partition Complete',
            caption: `Sorted array: [${a.join(', ')}]`,
            items: a.slice(0, 16).map(String),
            pointers: {},
            active: [],
            done: a.slice(0, 16).map((_, i) => i),
            badges: { sorted: `[${a.join(',')}]` }
        });
        return steps;
    }

    function genFastSlowArray(id, input) {
        const nums = Array.isArray(input.nums) && input.nums.length ? input.nums.map(Number) : [0, 1, 0, 3, 12];
        let slow = 0;
        const steps = [{
            kind: 'array',
            title: 'Initialize Slow & Fast Pointers',
            caption: id === 'move_zeroes' ? 'Shift non-zeros forward in-place.' : 'Deduplicate sorted array in-place at slow.',
            items: nums.slice(0, 16).map(String),
            pointers: { slow: 0, fast: 0 },
            active: [0],
            done: [],
            badges: { slow: 0 }
        }];
        if (id === 'move_zeroes') {
            for (let fast = 0; fast < nums.length; fast++) {
                if (nums[fast] !== 0) {
                    [nums[slow], nums[fast]] = [nums[fast], nums[slow]];
                    if (steps.length < 18) {
                        steps.push({
                            kind: 'array',
                            title: `Place Non-Zero ${nums[slow]} -> [${slow}]`,
                            caption: `nums[${fast}] != 0 -> swap [${slow}] & [${fast}].`,
                            items: nums.slice(0, 16).map(String),
                            pointers: { slow, ...(fast < 16 ? { fast } : {}) },
                            active: [slow, fast].filter(x => x < 16),
                            done: [],
                            badges: { slow: slow + 1, fast }
                        });
                    }
                    slow++;
                }
            }
        } else {
            slow = nums.length > 0 ? 1 : 0;
            for (let fast = 1; fast < nums.length; fast++) {
                if (nums[fast] !== nums[fast - 1]) {
                    nums[slow] = nums[fast];
                    if (steps.length < 18) {
                        steps.push({
                            kind: 'array',
                            title: `Write Unique ${nums[fast]} -> [${slow}]`,
                            caption: `nums[${fast}] != nums[${fast - 1}] -> store at nums[${slow}].`,
                            items: nums.slice(0, 16).map(String),
                            pointers: { slow, ...(fast < 16 ? { fast } : {}) },
                            active: [slow, fast].filter(x => x < 16),
                            done: slow < 16 ? [slow] : [],
                            badges: { uniqueCount: slow + 1 }
                        });
                    }
                    slow++;
                }
            }
        }
        steps.push({
            kind: 'array',
            title: 'Array Compaction Complete',
            caption: id === 'move_zeroes' ? `Final array: [${nums.join(', ')}]` : `k = ${slow}, prefix: [${nums.slice(0, slow).join(', ')}]`,
            items: nums.slice(0, 16).map(String),
            pointers: {},
            active: [],
            done: nums.slice(0, 16).map((_, i) => i),
            badges: { answer: id === 'move_zeroes' ? `[${nums.join(',')}]` : slow }
        });
        return steps;
    }

    function genNQueens(input) {
        const n = Math.min(Math.max(Number(input.n ?? 4), 1), 7);
        const showN = Math.min(n, 6);
        const board = Array.from({ length: n }, () => Array(n).fill('.'));
        const cols = new Set(), d1 = new Set(), d2 = new Set();
        const steps = [{
            kind: 'grid',
            title: `${n}-Queens Empty Chessboard`,
            caption: `Place ${n} queens row-by-row with no column or diagonal conflicts.`,
            grid: board.slice(0, showN).map(r => r.slice(0, showN)),
            activeCells: [],
            visitedCells: [],
            badges: { row: 0, solutions: 0 }
        }];
        let sols = 0;
        let lastSolBoard = board.slice(0, showN).map(r => r.slice(0, showN));
        function bt(r) {
            if (r === n) {
                sols++;
                lastSolBoard = board.slice(0, showN).map(row => row.slice(0, showN));
                if (steps.length < 18) {
                    const qCells = [];
                    for (let rr = 0; rr < showN; rr++) for (let cc = 0; cc < showN; cc++) if (board[rr][cc] === 'Q') qCells.push(`${rr},${cc}`);
                    steps.push({
                        kind: 'grid',
                        title: `Valid Arrangement #${sols}!`,
                        caption: `Found non-attacking queen placement #${sols}.`,
                        grid: clone(lastSolBoard),
                        activeCells: qCells,
                        visitedCells: qCells,
                        badges: { row: n, solutions: sols }
                    });
                }
                return;
            }
            for (let c = 0; c < n; c++) {
                if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;
                board[r][c] = 'Q';
                cols.add(c); d1.add(r - c); d2.add(r + c);
                if (steps.length < 15 && r < showN && c < showN) {
                    steps.push({
                        kind: 'grid',
                        title: `Place Queen (${r}, ${c})`,
                        caption: `Safe column ${c} & diagonals -> recurse row ${r + 1}.`,
                        grid: board.slice(0, showN).map(row => row.slice(0, showN)),
                        activeCells: [`${r},${c}`],
                        visitedCells: [],
                        badges: { row: r, col: c, solutions: sols }
                    });
                }
                bt(r + 1);
                board[r][c] = '.';
                cols.delete(c); d1.delete(r - c); d2.delete(r + c);
            }
        }
        bt(0);
        steps.push({
            kind: 'grid',
            title: `${n}-Queens Complete`,
            caption: `Total distinct solutions for n=${n}: ${sols}`,
            grid: lastSolBoard,
            activeCells: [],
            visitedCells: [],
            badges: { n, solutions: sols, answer: sols }
        });
        return steps;
    }

    // =========================================================
    // 2. Stack Problems
    // =========================================================
    function genStackProblem(id, input) {
        if (id === 'valid_parentheses' || id === 'longest_valid_parentheses') {
            const s = String(input.s ?? '(()');
            const chars = s.slice(0, 16).split('');
            if (id === 'valid_parentheses') {
                const st = [];
                const pairs = { ')': '(', ']': '[', '}': '{' };
                let valid = true;
                const steps = [{
                    kind: 'stack',
                    title: 'Initialize Empty Bracket Stack',
                    caption: `Validate "${s}" by matching closing brackets with stack top.`,
                    items: chars.length ? chars : ['""'],
                    cursor: -1,
                    stack: [],
                    badges: { length: s.length }
                }];
                for (let i = 0; i < s.length; i++) {
                    const c = s[i];
                    if (c === '(' || c === '[' || c === '{') {
                        st.push(c);
                        if (steps.length < 18 && i < chars.length) {
                            steps.push({
                                kind: 'stack',
                                title: `Push '${c}'`,
                                caption: `Index ${i}: opening '${c}' pushed.`,
                                items: chars,
                                cursor: i,
                                stack: st.slice(),
                                badges: { stackSize: st.length }
                            });
                        }
                    } else {
                        const popped = st.pop();
                        if (popped !== pairs[c]) valid = false;
                        if (steps.length < 18 && i < chars.length) {
                            steps.push({
                                kind: 'stack',
                                title: `Pop & Check '${c}'`,
                                caption: popped === pairs[c] ? `Matched '${c}' with '${popped}'.` : `Mismatch for '${c}' (top='${popped || 'empty'}').`,
                                items: chars,
                                cursor: i,
                                stack: st.slice(),
                                badges: { match: popped === pairs[c], stackSize: st.length }
                            });
                        }
                        if (!valid) break;
                    }
                }
                if (st.length > 0) valid = false;
                steps.push({
                    kind: 'stack',
                    title: valid ? 'Brackets Balanced (true)' : 'Invalid Parentheses (false)',
                    caption: `Input "${s}" is ${valid ? 'VALID (true)' : 'INVALID (false)'}.`,
                    items: chars.length ? chars : ['""'],
                    cursor: chars.length - 1,
                    stack: st.slice(),
                    badges: { answer: valid }
                });
                return steps;
            } else {
                const st = [-1];
                let best = 0;
                const steps = [{
                    kind: 'stack',
                    title: 'Initialize Index Stack [-1]',
                    caption: `Scan "${s}" tracking unmatched index boundaries.`,
                    items: chars.length ? chars : ['""'],
                    cursor: -1,
                    stack: ['@ -1'],
                    badges: { best: 0 }
                }];
                for (let i = 0; i < s.length; i++) {
                    if (s[i] === '(') {
                        st.push(i);
                    } else {
                        st.pop();
                        if (st.length === 0) st.push(i);
                        else best = Math.max(best, i - st[st.length - 1]);
                    }
                    if (steps.length < 18 && i < chars.length) {
                        steps.push({
                            kind: 'stack',
                            title: `Process s[${i}]='${s[i]}'`,
                            caption: `Stack boundary=${st[st.length - 1]}, longestValid=${best}.`,
                            items: chars,
                            cursor: i,
                            stack: st.map(idx => `@${idx}`),
                            badges: { best }
                        });
                    }
                }
                steps.push({
                    kind: 'stack',
                    title: 'Longest Valid Substring Found',
                    caption: `Max valid parentheses length in "${s}" = ${best}.`,
                    items: chars.length ? chars : ['""'],
                    cursor: chars.length - 1,
                    stack: st.map(idx => `@${idx}`),
                    badges: { answer: best }
                });
                return steps;
            }
        }

        if (id === 'evaluate_rpn') {
            const tokens = Array.isArray(input.tokens) && input.tokens.length ? input.tokens.map(String) : ['2', '1', '+', '3', '*'];
            const st = [];
            const steps = [{
                kind: 'stack',
                title: 'Evaluate Reverse Polish Notation',
                caption: 'Push numbers; on operator pop 2 operands and push result.',
                items: tokens.slice(0, 16),
                cursor: -1,
                stack: [],
                badges: {}
            }];
            for (let i = 0; i < tokens.length; i++) {
                const tk = tokens[i];
                if (['+', '-', '*', '/'].includes(tk)) {
                    const b = st.pop(), a = st.pop();
                    const v = tk === '+' ? a + b : tk === '-' ? a - b : tk === '*' ? a * b : Math.trunc(a / b);
                    st.push(v);
                    if (steps.length < 18) {
                        steps.push({
                            kind: 'stack',
                            title: `Apply '${tk}'`,
                            caption: `${a} ${tk} ${b} = ${v} -> push ${v}.`,
                            items: tokens.slice(0, 16),
                            cursor: Math.min(i, 15),
                            stack: st.map(String),
                            badges: { expr: `${a} ${tk} ${b} = ${v}` }
                        });
                    }
                } else {
                    st.push(Number(tk));
                    if (steps.length < 18) {
                        steps.push({
                            kind: 'stack',
                            title: `Push ${tk}`,
                            caption: `Push operand ${tk} onto stack.`,
                            items: tokens.slice(0, 16),
                            cursor: Math.min(i, 15),
                            stack: st.map(String),
                            badges: { top: tk }
                        });
                    }
                }
            }
            const ans = st.length ? st[0] : 0;
            steps.push({
                kind: 'stack',
                title: 'RPN Evaluation Complete',
                caption: `Final expression value = ${ans}.`,
                items: tokens.slice(0, 16),
                cursor: Math.max(0, Math.min(tokens.length - 1, 15)),
                stack: st.map(String),
                badges: { answer: ans }
            });
            return steps;
        }

        if (id === 'daily_temperatures' || id === 'largest_rectangle_histogram') {
            const arr = Array.isArray(input.temperatures) ? input.temperatures.map(Number)
                : (Array.isArray(input.heights) ? input.heights.map(Number) : [2, 1, 5, 6, 2, 3]);
            const show = arr.slice(0, 16);
            const st = [];
            const res = Array(arr.length).fill(0);
            let best = 0;
            const steps = [{
                kind: 'stack',
                title: id === 'daily_temperatures' ? 'Monotonic Decreasing Stack' : 'Monotonic Increasing Stack',
                caption: id === 'daily_temperatures' ? 'Pop cooler days when warmer day arrives.' : 'Pop taller bars to calculate max bounded rectangle.',
                items: show.map(String),
                cursor: -1,
                stack: [],
                badges: id === 'daily_temperatures' ? { ans: JSON.stringify(res) } : { maxArea: 0 }
            }];
            for (let i = 0; i <= arr.length; i++) {
                if (id === 'daily_temperatures' && i === arr.length) break;
                const cur = i === arr.length ? 0 : arr[i];
                while (st.length && (id === 'daily_temperatures' ? arr[st[st.length - 1]] < cur : arr[st[st.length - 1]] > cur)) {
                    const prev = st.pop();
                    if (id === 'daily_temperatures') res[prev] = i - prev;
                    else {
                        const w = st.length ? i - st[st.length - 1] - 1 : i;
                        best = Math.max(best, arr[prev] * w);
                    }
                }
                if (i < arr.length) st.push(i);
                if (steps.length < 18) {
                    steps.push({
                        kind: 'stack',
                        title: i < arr.length ? `Process index ${i} (${arr[i]})` : 'Flush Remaining Stack',
                        caption: id === 'daily_temperatures' ? `Wait days: [${res.join(',')}]` : `Best area so far = ${best}.`,
                        items: show.map(String),
                        cursor: Math.min(i, Math.max(0, show.length - 1)),
                        stack: st.slice(-8).map(idx => `idx ${idx} (${arr[idx]})`),
                        badges: id === 'daily_temperatures' ? { ans: `[${res.join(',')}]` } : { maxArea: best }
                    });
                }
            }
            steps.push({
                kind: 'stack',
                title: 'Monotonic Stack Complete',
                caption: id === 'daily_temperatures' ? `Result: [${res.join(', ')}]` : `Maximum rectangle area = ${best}.`,
                items: show.map(String),
                cursor: Math.max(0, show.length - 1),
                stack: [],
                badges: { answer: id === 'daily_temperatures' ? `[${res.join(',')}]` : best }
            });
            return steps;
        }

        // sliding_window_maximum
        const nums = Array.isArray(input.nums) ? input.nums.map(Number) : [1, 3, -1, -3, 5, 3, 6, 7];
        const k = Math.max(1, Number(input.k ?? 3));
        const show = nums.slice(0, 16);
        const dq = [], out = [];
        const steps = [{
            kind: 'stack',
            title: `Monotonic Deque (Window k=${k})`,
            caption: 'Front of deque holds current window maximum index.',
            items: show.map(String),
            cursor: 0,
            stack: [],
            badges: { k, out: '[]' }
        }];
        for (let i = 0; i < nums.length; i++) {
            if (dq.length && dq[0] <= i - k) dq.shift();
            while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
            dq.push(i);
            if (i >= k - 1) out.push(nums[dq[0]]);
            if (steps.length < 18 && i < show.length) {
                steps.push({
                    kind: 'stack',
                    title: `Slide to i=${i} (${nums[i]})`,
                    caption: i >= k - 1 ? `Window max=${nums[dq[0]]}, out=[${out.join(', ')}].` : `Building initial window of size ${k}.`,
                    items: show.map(String),
                    cursor: i,
                    stack: dq.map(idx => `${nums[idx]}@${idx}`),
                    badges: { frontMax: nums[dq[0]], out: `[${out.join(',')}]` }
                });
            }
        }
        steps.push({
            kind: 'stack',
            title: 'All Window Maxima Computed',
            caption: `Output = [${out.join(', ')}]`,
            items: show.map(String),
            cursor: Math.max(0, show.length - 1),
            stack: [],
            badges: { answer: `[${out.join(',')}]` }
        });
        return steps;
    }

    // =========================================================
    // 3. Linked List Problems
    // =========================================================
    function genLinkedListProblem(id, input) {
        if (id === 'merge_two_sorted_lists') {
            const l1 = Array.isArray(input.list1) ? input.list1.map(Number) : [1, 2, 4];
            const l2 = Array.isArray(input.list2) ? input.list2.map(Number) : [1, 3, 4];
            const merged = [];
            let i = 0, j = 0;
            const steps = [{
                kind: 'linked_list',
                title: 'Two Sorted Input Chains',
                caption: `list1=[${l1.join('->')}] | list2=[${l2.join('->')}]`,
                nodes: l1.length ? l1 : l2,
                pointers: l1.length ? { list1: 0 } : { list2: 0 },
                active: [0],
                badges: { list2: `[${l2.join('->')}]` }
            }];
            while (i < l1.length && j < l2.length) {
                const take1 = l1[i] <= l2[j];
                const val = take1 ? l1[i++] : l2[j++];
                merged.push(val);
                if (steps.length < 14) {
                    steps.push({
                        kind: 'linked_list',
                        title: `Splice Smaller Value (${val})`,
                        caption: `Pick from ${take1 ? 'list1' : 'list2'}: appended ${val}. Remaining l1=${i}, l2=${j}.`,
                        nodes: merged.slice(),
                        pointers: { tail: merged.length - 1 },
                        active: [merged.length - 1],
                        badges: { mergedLen: merged.length }
                    });
                }
            }
            while (i < l1.length) merged.push(l1[i++]);
            while (j < l2.length) merged.push(l2[j++]);
            steps.push({
                kind: 'linked_list',
                title: 'Merged Sorted Linked List',
                caption: merged.length ? `Result: ${merged.join(' -> ')} -> null` : 'Result: [] (empty)',
                nodes: merged,
                pointers: merged.length ? { head: 0 } : {},
                active: merged.map((_, idx) => idx),
                badges: { answer: `[${merged.join(',')}]` }
            });
            return steps;
        }

        if (id === 'linked_list_cycle') {
            const head = Array.isArray(input.head) ? input.head : [3, 2, 0, -4];
            const pos = input.pos ?? -1;
            const n = head.length;
            const steps = [{
                kind: 'linked_list',
                title: "Floyd's Tortoise & Hare Init",
                caption: pos >= 0 && pos < n ? `Tail points to node ${pos}. Both slow & fast start at head.` : 'No cycle (tail -> null).',
                nodes: head,
                cycleTarget: pos,
                pointers: n > 0 ? { slow: 0, fast: 0 } : {},
                active: n > 0 ? [0] : [],
                badges: { pos }
            }];
            let met = false;
            if (pos >= 0 && pos < n && n > 0) {
                let s = 0, f = 0;
                const nextIdx = (idx) => idx + 1 < n ? idx + 1 : pos;
                for (let k = 1; k <= n * 2 + 2; k++) {
                    s = nextIdx(s);
                    f = nextIdx(nextIdx(f));
                    met = s === f;
                    if (steps.length < 16 || met) {
                        steps.push({
                            kind: 'linked_list',
                            title: met ? `Cycle Detected at Node ${s}!` : `Step ${k}: slow->${s}, fast->${f}`,
                            caption: met ? `slow == fast at value ${head[s]} -> return true.` : `slow +1, fast +2.`,
                            nodes: head,
                            cycleTarget: pos,
                            pointers: { slow: s, fast: f },
                            active: [s, f],
                            badges: { met }
                        });
                    }
                    if (met) break;
                }
            }
            steps.push({
                kind: 'linked_list',
                title: met ? 'Cycle Confirmed (true)' : 'No Cycle Found (false)',
                caption: met ? `Cycle detected at entry/meeting loop -> true.` : `Pointer reached null tail -> false.`,
                nodes: head,
                cycleTarget: pos,
                pointers: {},
                active: [],
                badges: { answer: met }
            });
            return steps;
        }

        if (id === 'reverse_nodes_k_group') {
            const head = Array.isArray(input.head) ? input.head.slice() : [1, 2, 3, 4, 5];
            const k = Math.max(1, Number(input.k || 2));
            const cur = head.slice();
            const steps = [{
                kind: 'linked_list',
                title: `Reverse Nodes in Groups of k=${k}`,
                caption: `Original: ${head.join(' -> ')} -> null`,
                nodes: cur.slice(),
                pointers: cur.length ? { groupStart: 0 } : {},
                active: cur.length ? [0] : [],
                badges: { k }
            }];
            for (let start = 0; start + k <= cur.length; start += k) {
                const sub = cur.slice(start, start + k).reverse();
                for (let j = 0; j < k; j++) cur[start + j] = sub[j];
                if (steps.length < 16) {
                    steps.push({
                        kind: 'linked_list',
                        title: `Reverse [${start}..${start + k - 1}]`,
                        caption: `Reversed ${k} nodes -> [${cur.join(' -> ')}].`,
                        nodes: cur.slice(),
                        pointers: { head: start, tail: start + k - 1 },
                        active: Array.from({ length: k }, (_, j) => start + j),
                        badges: { group: `${start}..${start + k - 1}` }
                    });
                }
            }
            steps.push({
                kind: 'linked_list',
                title: 'K-Group Reversal Complete',
                caption: `Final list: ${cur.join(' -> ')} -> null`,
                nodes: cur,
                pointers: cur.length ? { newHead: 0 } : {},
                active: cur.map((_, i) => i),
                badges: { answer: `[${cur.join(',')}]` }
            });
            return steps;
        }

        // reverse_linked_list
        const head = Array.isArray(input.head) ? input.head.slice() : [1, 2, 3, 4, 5];
        const steps = [{
            kind: 'linked_list',
            title: 'Initialize Three Pointers (prev=null, curr=head)',
            caption: `Reverse [${head.join(' -> ')}] in-place.`,
            nodes: head,
            reversedCount: 0,
            pointers: head.length ? { curr: 0 } : {},
            active: head.length ? [0] : [],
            badges: { prev: 'null' }
        }];
        for (let i = 0; i < head.length && steps.length < 16; i++) {
            steps.push({
                kind: 'linked_list',
                title: `Flip Pointer at Node ${head[i]}`,
                caption: `Point ${head[i]}.next -> ${i === 0 ? 'null' : head[i - 1]}.`,
                nodes: head,
                reversedCount: i + 1,
                pointers: { prev: i, curr: i + 1 < head.length ? i + 1 : undefined },
                active: [i],
                badges: { reversedUpTo: i + 1 }
            });
        }
        const rev = head.slice().reverse();
        steps.push({
            kind: 'linked_list',
            title: 'Linked List Reversed',
            caption: rev.length ? `New order: ${rev.join(' -> ')} -> null` : 'Empty list []',
            nodes: rev,
            reversedCount: 0,
            pointers: rev.length ? { newHead: 0 } : {},
            active: rev.map((_, i) => i),
            badges: { answer: `[${rev.join(',')}]` }
        });
        return steps;
    }

    // =========================================================
    // 4. Tree Problems (True Pointer-Based Tree Engine)
    // =========================================================
    function genTreeProblem(id, input) {
        const rawArr = Array.isArray(input.root) ? input.root : [3, 9, 20, null, null, 15, 7];
        const tree = buildTree(rawArr);
        const heapNodes = treeToHeapArray(tree, 4);
        const validHeapIdxs = [];
        for (let i = 0; i < heapNodes.length; i++) if (heapNodes[i] !== null) validHeapIdxs.push(i);

        if (id === 'invert_binary_tree') {
            function cloneTree(n) {
                return n ? { val: n.val, left: cloneTree(n.left), right: cloneTree(n.right) } : null;
            }
            function invertRec(n) {
                if (!n) return null;
                const tmp = n.left;
                n.left = invertRec(n.right);
                n.right = invertRec(tmp);
                return n;
            }
            const invertedRoot = invertRec(cloneTree(tree));
            const invHeap = treeToHeapArray(invertedRoot, 4);
            const sparseOut = treeToSparseArray(invertedRoot);
            return [
                {
                    kind: 'tree',
                    title: 'Original Binary Tree',
                    caption: `Swap left & right subtrees recursively from root.`,
                    nodes: heapNodes,
                    active: tree ? [0] : [],
                    done: [],
                    badges: { root: tree ? tree.val : 'null' }
                },
                {
                    kind: 'tree',
                    title: 'Swap Left & Right Subtrees Recursively',
                    caption: tree ? `Swapped children around root ${tree.val}.` : 'Empty tree.',
                    nodes: invHeap,
                    active: [1, 2].filter(idx => invHeap[idx] !== null),
                    done: tree ? [0] : [],
                    badges: { swappedAt: tree ? tree.val : 'null' }
                },
                {
                    kind: 'tree',
                    title: 'Tree Fully Inverted',
                    caption: `Inverted level-order output: ${JSON.stringify(sparseOut)}`,
                    nodes: invHeap,
                    active: [],
                    done: invHeap.map((v, i) => v !== null ? i : -1).filter(i => i >= 0),
                    badges: { answer: JSON.stringify(sparseOut) }
                }
            ];
        }

        if (id === 'max_depth_binary_tree') {
            function depth(n) { return n ? 1 + Math.max(depth(n.left), depth(n.right)) : 0; }
            const ans = depth(tree);
            const steps = [{
                kind: 'tree',
                title: 'Compute Maximum Depth DFS',
                caption: `depth(node) = 1 + max(depth(left), depth(right)).`,
                nodes: heapNodes,
                active: tree ? [0] : [],
                done: [],
                badges: { nodes: validHeapIdxs.length }
            }];
            const visited = [];
            for (let i = 0; i < validHeapIdxs.length && steps.length < 7; i++) {
                const idx = validHeapIdxs[i];
                visited.push(idx);
                steps.push({
                    kind: 'tree',
                    title: `Visit Node ${heapNodes[idx]} (Level ${Math.floor(Math.log2(idx + 1)) + 1})`,
                    caption: `Inspect subtree depth at node ${heapNodes[idx]}.`,
                    nodes: heapNodes,
                    active: [idx],
                    done: visited.slice(),
                    badges: { curLevel: Math.floor(Math.log2(idx + 1)) + 1 }
                });
            }
            steps.push({
                kind: 'tree',
                title: 'Maximum Depth Computed',
                caption: `Maximum tree depth = ${ans}.`,
                nodes: heapNodes,
                active: [],
                done: validHeapIdxs,
                badges: { answer: ans }
            });
            return steps;
        }

        if (id === 'binary_tree_level_order') {
            const levels = [];
            if (tree) {
                const q = [tree];
                while (q.length) {
                    const sz = q.length, lvl = [];
                    for (let i = 0; i < sz; i++) {
                        const n = q.shift();
                        lvl.push(n.val);
                        if (n.left) q.push(n.left);
                        if (n.right) q.push(n.right);
                    }
                    levels.push(lvl);
                }
            }
            const steps = [{
                kind: 'tree',
                title: 'Level-Order BFS Traversal Init',
                caption: `Process tree level-by-level with a FIFO queue.`,
                nodes: heapNodes,
                active: tree ? [0] : [],
                done: [],
                badges: { levels: 0 }
            }];
            levels.forEach((lvl, li) => {
                const start = Math.pow(2, li) - 1, end = Math.pow(2, li + 1) - 2;
                const lvlIdxs = validHeapIdxs.filter(idx => idx >= start && idx <= end);
                if (steps.length < 7) {
                    steps.push({
                        kind: 'tree',
                        title: `BFS Level ${li}: [${lvl.join(', ')}]`,
                        caption: `Collected ${lvl.length} node(s) at depth ${li}.`,
                        nodes: heapNodes,
                        active: lvlIdxs,
                        done: validHeapIdxs.filter(idx => idx < start),
                        badges: { soFar: JSON.stringify(levels.slice(0, li + 1)) }
                    });
                }
            });
            steps.push({
                kind: 'tree',
                title: 'Level-Order Traversal Complete',
                caption: `Output = ${JSON.stringify(levels)}`,
                nodes: heapNodes,
                active: [],
                done: validHeapIdxs,
                badges: { answer: JSON.stringify(levels) }
            });
            return steps;
        }

        if (id === 'validate_bst') {
            function isValid(node, minV, maxV) {
                if (!node) return true;
                if (node.val <= minV || node.val >= maxV) return false;
                return isValid(node.left, minV, node.val) && isValid(node.right, node.val, maxV);
            }
            const valid = isValid(tree, -Infinity, Infinity);
            const steps = [{
                kind: 'tree',
                title: 'Validate BST Range Bounds',
                caption: `Ensure every node lies strictly within (minBound, maxBound).`,
                nodes: heapNodes,
                active: tree ? [0] : [],
                done: [],
                badges: { nodes: validHeapIdxs.length }
            }];
            const visited = [];
            for (let i = 0; i < validHeapIdxs.length && steps.length < 7; i++) {
                const idx = validHeapIdxs[i];
                visited.push(idx);
                steps.push({
                    kind: 'tree',
                    title: `Check BST Constraint on ${heapNodes[idx]}`,
                    caption: `Verify left subtree < ${heapNodes[idx]} < right subtree.`,
                    nodes: heapNodes,
                    active: [idx],
                    done: visited.slice(),
                    badges: { node: heapNodes[idx] }
                });
            }
            steps.push({
                kind: 'tree',
                title: valid ? 'Valid BST (true)' : 'Invalid BST (false)',
                caption: `Tree ${valid ? 'satisfies' : 'violates'} Binary Search Tree ordering -> ${valid}.`,
                nodes: heapNodes,
                active: [],
                done: valid ? validHeapIdxs : [],
                badges: { answer: valid }
            });
            return steps;
        }

        // binary_tree_max_path_sum
        let bestSum = tree ? tree.val : 0;
        function maxGain(n) {
            if (!n) return 0;
            const lg = Math.max(maxGain(n.left), 0);
            const rg = Math.max(maxGain(n.right), 0);
            bestSum = Math.max(bestSum, n.val + lg + rg);
            return n.val + Math.max(lg, rg);
        }
        maxGain(tree);
        const steps = [{
            kind: 'tree',
            title: 'Postorder Max Path Sum DFS',
            caption: `At each node compute leftGain + rightGain + node.val and update global max.`,
            nodes: heapNodes,
            active: tree ? [0] : [],
            done: [],
            badges: { nodes: validHeapIdxs.length }
        }];
        for (let i = validHeapIdxs.length - 1; i >= 0 && steps.length < 7; i--) {
            const idx = validHeapIdxs[i];
            steps.push({
                kind: 'tree',
                title: `Evaluate Node ${heapNodes[idx]}`,
                caption: `Combine max positive child gains through node ${heapNodes[idx]}.`,
                nodes: heapNodes,
                active: [idx],
                done: validHeapIdxs.slice(i),
                badges: { maxPathSoFar: bestSum }
            });
        }
        steps.push({
            kind: 'tree',
            title: 'Maximum Path Sum Computed',
            caption: `Max path sum = ${bestSum}.`,
            nodes: heapNodes,
            active: [],
            done: validHeapIdxs,
            badges: { answer: bestSum }
        });
        return steps;
    }

    // =========================================================
    // 5. Binary Search & Parametric Search
    // =========================================================
    function genSearchProblem(id, input) {
        if (id === 'sqrtx') {
            const x = Math.max(0, Number(input.x ?? 8));
            if (x === 0) {
                return [
                    { kind: 'search_range', title: 'Base Case x = 0', caption: 'sqrt(0) = 0.', low: 0, mid: 0, high: 0, target: 0, badges: { x: 0, ans: 0 } },
                    { kind: 'search_range', title: 'Check mid = 0', caption: '0^2 = 0.', low: 0, mid: 0, high: 0, target: 0, badges: { ans: 0 } },
                    { kind: 'search_range', title: 'Answer Ready', caption: 'floor(sqrt(0)) = 0.', low: 0, mid: 0, high: 0, target: 0, badges: { answer: 0 } }
                ];
            }
            let l = 1, r = x, ans = 0;
            const steps = [{
                kind: 'search_range',
                title: `Binary Search sqrt(${x})`,
                caption: `Search integer range [1, ${r}] for max mid with mid*mid <= ${x}.`,
                low: l, mid: Math.floor((l + r) / 2), high: r, target: x,
                badges: { x, best: 0 }
            }];
            while (l <= r) {
                const m = Math.floor((l + r) / 2);
                const sq = m * m;
                if (sq <= x) ans = m;
                if (steps.length < 12) {
                    steps.push({
                        kind: 'search_range',
                        title: `Test mid = ${m}`,
                        caption: `${m}^2 = ${sq} ${sq <= x ? '<=' : '>'} ${x}. best=${ans}.`,
                        low: l, mid: m, high: r, target: x,
                        badges: { mid: m, sq, ans }
                    });
                }
                if (sq === x) break;
                if (sq < x) l = m + 1; else r = m - 1;
            }
            steps.push({
                kind: 'search_range',
                title: 'Integer Square Root Converged',
                caption: `floor(sqrt(${x})) = ${ans}.`,
                low: l, mid: ans, high: r, target: x,
                badges: { x, answer: ans }
            });
            return steps;
        }

        if (id === 'median_two_sorted_arrays') {
            const a = Array.isArray(input.nums1) ? input.nums1.map(Number) : [1, 3];
            const b = Array.isArray(input.nums2) ? input.nums2.map(Number) : [2];
            const merged = [...a, ...b].sort((x, y) => x - y);
            const n = merged.length;
            const median = n === 0 ? 0 : (n % 2 === 1 ? merged[(n - 1) >> 1] : (merged[n / 2 - 1] + merged[n / 2]) / 2);
            return [
                {
                    kind: 'array',
                    title: 'Binary Search Partition on Smaller Array',
                    caption: `nums1=[${a.join(',')}], nums2=[${b.join(',')}]. Find median in O(log min(m,n)).`,
                    items: (a.length ? a : b).slice(0, 14).map(String),
                    pointers: { cut1: Math.floor((a.length || b.length) / 2) },
                    active: [],
                    done: [],
                    badges: { nums2: `[${b.join(',')}]`, totalLen: n }
                },
                {
                    kind: 'array',
                    title: 'Validate Cross Partition (L1<=R2 & L2<=R1)',
                    caption: `Merged sorted sequence: [${merged.join(', ')}].`,
                    items: merged.slice(0, 14).map(String),
                    pointers: n ? { mid: Math.floor((n - 1) / 2) } : {},
                    active: n ? [Math.floor((n - 1) / 2)] : [],
                    done: [],
                    badges: { median }
                },
                {
                    kind: 'array',
                    title: 'Median Computed',
                    caption: `Median = ${median}.`,
                    items: merged.slice(0, 14).map(String),
                    pointers: {},
                    active: [],
                    done: n ? [Math.floor((n - 1) / 2)] : [],
                    badges: { answer: median }
                }
            ];
        }

        const nums = Array.isArray(input.nums) && input.nums.length ? input.nums.map(Number)
            : (Array.isArray(input.piles) && input.piles.length ? input.piles.map(Number) : [1, 3, 5, 6]);

        if (id === 'koko_eating_bananas' || id === 'split_array_largest_sum') {
            const limit = Number(id === 'split_array_largest_sum' ? (input.k ?? 2) : (input.h ?? 8));
            const loInit = id === 'split_array_largest_sum' ? Math.max(...nums) : 1;
            const hiInit = id === 'split_array_largest_sum' ? nums.reduce((a, b) => a + b, 0) : Math.max(...nums);
            const feasibleFn = (m) => {
                if (id === 'koko_eating_bananas') {
                    let hrs = 0;
                    for (const p of nums) hrs += Math.ceil(p / m);
                    return hrs <= limit;
                }
                let groups = 1, acc = 0;
                for (const x of nums) {
                    if (acc + x > m) { groups++; acc = x; }
                    else acc += x;
                }
                return groups <= limit;
            };
            const steps = [{
                kind: 'array',
                title: 'Binary Search on Answer Space',
                caption: `Search feasible range [${loInit} .. ${hiInit}] for limit=${limit}.`,
                items: nums.slice(0, 14).map(String),
                pointers: {},
                active: [],
                done: [],
                badges: { low: loInit, high: hiInit, limit }
            }];
            let l = loInit, r = hiInit;
            while (l < r) {
                const m = Math.floor((l + r) / 2);
                const ok = feasibleFn(m);
                if (steps.length < 14) {
                    steps.push({
                        kind: 'array',
                        title: `Test Candidate mid = ${m}`,
                        caption: ok ? `mid=${m} is FEASIBLE -> try smaller (R=${m}).` : `mid=${m} exceeds limit -> raise lower bound (L=${m + 1}).`,
                        items: nums.slice(0, 14).map(String),
                        pointers: {},
                        active: nums.slice(0, 14).map((_, i) => i),
                        done: [],
                        badges: { low: l, mid: m, high: r, feasible: ok }
                    });
                }
                if (ok) r = m; else l = m + 1;
            }
            steps.push({
                kind: 'array',
                title: 'Minimum Feasible Answer Converged',
                caption: `Optimal minimum = ${l}.`,
                items: nums.slice(0, 14).map(String),
                pointers: {},
                active: [],
                done: nums.slice(0, 14).map((_, i) => i),
                badges: { answer: l }
            });
            return steps;
        }

        const target = input.target !== undefined ? Number(input.target) : undefined;
        let l = 0, r = nums.length - 1, foundIdx = -1;
        const steps = [{
            kind: 'array',
            title: 'Initialize Search Bounds [L..R]',
            caption: `L=0, R=${r}${target !== undefined ? `, Target=${target}` : ' (find rotated minimum)'}.`,
            items: nums.slice(0, 16).map(String),
            pointers: { L: l, R: r },
            active: [l, r],
            done: [],
            badges: { L: l, R: r, ...(target !== undefined ? { target } : {}) }
        }];
        if (id === 'find_min_rotated_sorted_array') {
            while (l < r) {
                const m = Math.floor((l + r) / 2);
                if (steps.length < 14) {
                    steps.push({
                        kind: 'array',
                        title: `Compare nums[${m}]=${nums[m]} vs nums[${r}]=${nums[r]}`,
                        caption: nums[m] > nums[r] ? `Min is in right half (L=${m + 1}).` : `Min is at/left of mid (R=${m}).`,
                        items: nums.slice(0, 16).map(String),
                        pointers: { L: l, M: m, R: r },
                        active: [m, r],
                        done: [],
                        badges: { L: l, M: m, R: r }
                    });
                }
                if (nums[m] > nums[r]) l = m + 1; else r = m;
            }
            const ansVal = nums[l];
            steps.push({
                kind: 'array',
                title: 'Rotated Minimum Found',
                caption: `Minimum element is ${ansVal} at index ${l}.`,
                items: nums.slice(0, 16).map(String),
                pointers: { min: l },
                active: [l],
                done: [l],
                badges: { answer: ansVal }
            });
            return steps;
        }

        while (l <= r) {
            const m = Math.floor((l + r) / 2);
            const matched = nums[m] === target;
            if (matched) foundIdx = m;
            if (steps.length < 14 || matched) {
                steps.push({
                    kind: 'array',
                    title: `Check mid=${m} (nums[${m}]=${nums[m]})`,
                    caption: matched ? `Matched target ${target} at index ${m}!` : `${nums[m]} != ${target} -> shrink bounds.`,
                    items: nums.slice(0, 16).map(String),
                    pointers: { L: l, M: m, R: r },
                    active: [m],
                    done: matched ? [m] : [],
                    badges: { L: l, M: m, R: r }
                });
            }
            if (matched) break;
            if (id === 'search_rotated_sorted_array') {
                if (nums[l] <= nums[m]) {
                    if (target >= nums[l] && target < nums[m]) r = m - 1; else l = m + 1;
                } else {
                    if (target > nums[m] && target <= nums[r]) l = m + 1; else r = m - 1;
                }
            } else {
                if (nums[m] < target) l = m + 1; else r = m - 1;
            }
        }
        const finalAns = foundIdx !== -1 ? foundIdx : (id === 'search_insert_position' ? l : -1);
        steps.push({
            kind: 'array',
            title: 'Binary Search Complete',
            caption: id === 'search_insert_position' && foundIdx === -1 ? `Target ${target} inserts at index ${finalAns}.` : `Answer index = ${finalAns}.`,
            items: nums.slice(0, 16).map(String),
            pointers: {},
            active: foundIdx >= 0 ? [foundIdx] : [],
            done: foundIdx >= 0 ? [foundIdx] : [],
            badges: { answer: finalAns }
        });
        return steps;
    }

    // =========================================================
    // 6. Dynamic Programming (ALL 20 DP Problems Input-Driven!)
    // =========================================================
    function genDpProblem(id, input) {
        if (id === 'burst_balloons') {
            const raw = Array.isArray(input.nums) ? input.nums.map(Number).filter(Number.isFinite) : [3, 1, 5, 8];
            const nums = raw.slice(0, 7);
            const a = [1, ...nums, 1];
            const m = a.length;
            const dp = Array.from({ length: m }, () => Array(m).fill(0));
            const formatGrid = () => dp.map(row => row.map(v => String(v)));
            const steps = [{
                kind: 'grid',
                title: `Burst Balloons 2D DP Table (${m}x${m})`,
                caption: `Pad nums -> a = [${a.join(', ')}]. dp[l][r] = max coins from open interval (l, r).`,
                grid: formatGrid(),
                activeCells: [],
                visitedCells: [],
                badges: { padded: `[${a.join(',')}]`, answer: 0 }
            }];
            const filled = [];
            for (let gap = 2; gap < m; gap++) {
                for (let l = 0; l < m - gap; l++) {
                    const r = l + gap;
                    let best = 0, bestK = l + 1;
                    for (let k = l + 1; k < r; k++) {
                        const cand = dp[l][k] + a[l] * a[k] * a[r] + dp[k][r];
                        if (cand > best) {
                            best = cand;
                            bestK = k;
                        }
                    }
                    dp[l][r] = best;
                    filled.push(`${l},${r}`);
                    if (steps.length < 24 || (l === 0 && r === m - 1)) {
                        steps.push({
                            kind: 'grid',
                            title: `Fill dp[${l}][${r}] (gap=${gap}, k=${bestK})`,
                            caption: `Best last burst k=${bestK} (val=${a[bestK]}): dp[${l}][${bestK}](${dp[l][bestK]}) + ${a[l]}*${a[bestK]}*${a[r]} + dp[${bestK}][${r}](${dp[bestK][r]}) = ${best}.`,
                            grid: formatGrid(),
                            activeCells: [`${l},${r}`],
                            visitedCells: filled.slice(0, -1),
                            badges: { gap, l, r, bestK, [`dp[${l}][${r}]`]: best, maxCoins: dp[0][m - 1] }
                        });
                    }
                }
            }
            const ans = m >= 2 ? dp[0][m - 1] : 0;
            steps.push({
                kind: 'grid',
                title: 'Burst Balloons Max Coins Ready',
                caption: `dp[0][${m - 1}] = ${ans} coins for nums=[${nums.join(', ')}].`,
                grid: formatGrid(),
                activeCells: m >= 2 ? [`0,${m - 1}`] : [],
                visitedCells: filled,
                badges: { padded: `[${a.join(',')}]`, answer: ans }
            });
            return steps;
        }

        if (id === 'climbing_stairs' || id === 'fibonacci_number') {
            const n = Math.max(Number(input.n ?? 4), 0);
            const isFib = id === 'fibonacci_number';
            const dp = Array(Math.max(n + 1, 2)).fill(0);
            dp[0] = isFib ? 0 : 1; dp[1] = 1;
            for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
            const showLen = Math.min(n + 1, 14);
            const steps = [{
                kind: 'dp1d',
                title: 'Initialize Base Cases',
                caption: isFib ? 'dp[0] = 0, dp[1] = 1' : 'dp[0] = 1, dp[1] = 1',
                cells: dp.slice(0, showLen).map((v, idx) => idx <= 1 ? v : '?'),
                active: [0, 1].filter(x => x < showLen),
                deps: [],
                formula: 'dp[i] = dp[i-1] + dp[i-2]',
                badges: { n }
            }];
            for (let i = 2; i <= n && steps.length < 14; i++) {
                steps.push({
                    kind: 'dp1d',
                    title: `Compute dp[${i}]`,
                    caption: `dp[${i}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.`,
                    cells: dp.slice(0, showLen).map((v, idx) => idx <= i ? v : '?'),
                    active: [i],
                    deps: [i - 1, i - 2],
                    formula: 'dp[i] = dp[i-1] + dp[i-2]',
                    badges: { i, [`dp[${i}]`]: dp[i] }
                });
            }
            steps.push({
                kind: 'dp1d',
                title: isFib ? `F(${n}) = ${dp[n]}` : `Total Ways = ${dp[n]}`,
                caption: `dp[${n}] = ${dp[n]}.`,
                cells: dp.slice(0, showLen),
                active: [Math.min(n, showLen - 1)],
                deps: [],
                formula: 'dp[i] = dp[i-1] + dp[i-2]',
                badges: { n, answer: dp[n] }
            });
            return steps;
        }

        if (id === 'counting_bits') {
            const n = Math.max(0, Number(input.n ?? 2));
            const dp = Array(n + 1).fill(0);
            for (let i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1);
            const showLen = Math.min(n + 1, 15);
            const steps = [{
                kind: 'dp1d',
                title: 'Base Case dp[0] = 0',
                caption: `Use dp[i] = dp[i >> 1] + (i & 1) across 0..${n}.`,
                cells: dp.slice(0, showLen).map((_, idx) => idx === 0 ? 0 : '?'),
                active: [0],
                deps: [],
                formula: 'dp[i] = dp[i >> 1] + (i & 1)',
                badges: { n }
            }];
            for (let i = 1; i <= n && steps.length < 14; i++) {
                steps.push({
                    kind: 'dp1d',
                    title: `Popcount(${i})`,
                    caption: `dp[${i}] = dp[${i >> 1}] (${dp[i >> 1]}) + (${i} & 1) = ${dp[i]}`,
                    cells: dp.slice(0, showLen).map((v, idx) => idx <= i ? v : '?'),
                    active: [i],
                    deps: [i >> 1],
                    formula: 'dp[i] = dp[i >> 1] + (i & 1)',
                    badges: { soFar: JSON.stringify(dp.slice(0, i + 1)) }
                });
            }
            steps.push({
                kind: 'dp1d',
                title: 'Bit Counts Complete',
                caption: `Result = ${JSON.stringify(dp)}`,
                cells: dp.slice(0, showLen),
                active: [],
                deps: [],
                formula: 'dp[i] = dp[i >> 1] + (i & 1)',
                badges: { answer: JSON.stringify(dp) }
            });
            return steps;
        }

        if (id === 'min_cost_climbing_stairs') {
            const cost = Array.isArray(input.cost) && input.cost.length ? input.cost.map(Number) : [10, 15, 20];
            const n = cost.length;
            const dp = Array(n + 1).fill(0);
            for (let i = 2; i <= n; i++) dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
            const steps = [{
                kind: 'dp1d',
                title: 'Free Start (Step 0 or 1)',
                caption: `Costs = [${cost.join(', ')}]. dp[i] = min cost to reach step i.`,
                cells: dp.slice(0, 15).map((_, i) => i <= 1 ? 0 : '?'),
                active: [0, 1],
                deps: [],
                formula: 'dp[i] = min(dp[i-1]+cost[i-1], dp[i-2]+cost[i-2])',
                badges: {}
            }];
            for (let i = 2; i <= n && steps.length < 15; i++) {
                steps.push({
                    kind: 'dp1d',
                    title: `Reach Step ${i}`,
                    caption: `dp[${i}] = min(${dp[i - 1]}+${cost[i - 1]}, ${dp[i - 2]}+${cost[i - 2]}) = ${dp[i]}`,
                    cells: dp.slice(0, 15).map((v, idx) => idx <= i ? v : '?'),
                    active: [i],
                    deps: [i - 1, i - 2],
                    formula: 'dp[i] = min(dp[i-1]+cost[i-1], dp[i-2]+cost[i-2])',
                    badges: { minCost: dp[i] }
                });
            }
            steps.push({
                kind: 'dp1d',
                title: 'Minimum Climb Cost Ready',
                caption: `Min cost to top = ${dp[n]}.`,
                cells: dp.slice(0, 15),
                active: [Math.min(n, 14)],
                deps: [],
                formula: 'dp[n]',
                badges: { answer: dp[n] }
            });
            return steps;
        }

        if (id === 'max_subarray') {
            const nums = Array.isArray(input.nums) && input.nums.length ? input.nums.map(Number) : [-2, 1, -3, 4, -1, 2, 1, -5, 4];
            let cur = nums[0], best = nums[0];
            const curArr = [cur];
            const showLen = Math.min(nums.length, 14);
            const steps = [{
                kind: 'dp1d',
                title: "Kadane's Algorithm Init",
                caption: `dp[0] = nums[0] = ${cur}.`,
                cells: nums.slice(0, showLen).map((_, i) => i === 0 ? cur : '?'),
                active: [0],
                deps: [],
                formula: 'cur = max(nums[i], cur + nums[i])',
                badges: { cur, best }
            }];
            for (let i = 1; i < nums.length; i++) {
                cur = Math.max(nums[i], cur + nums[i]);
                best = Math.max(best, cur);
                curArr.push(cur);
                if (steps.length < 15 && i < showLen) {
                    steps.push({
                        kind: 'dp1d',
                        title: `Step i=${i} (nums[${i}]=${nums[i]})`,
                        caption: `cur = ${cur}, bestSoFar = ${best}.`,
                        cells: curArr.slice(0, showLen).concat(Array(Math.max(0, showLen - (i + 1))).fill('?')),
                        active: [i],
                        deps: [i - 1],
                        formula: 'cur = max(nums[i], cur + nums[i])',
                        badges: { cur, best }
                    });
                }
            }
            steps.push({
                kind: 'dp1d',
                title: 'Maximum Subarray Sum Computed',
                caption: `Best contiguous subarray sum = ${best}.`,
                cells: curArr.slice(0, showLen),
                active: [],
                deps: [],
                formula: 'max(dp)',
                badges: { answer: best }
            });
            return steps;
        }

        if (id === 'house_robber' || id === 'house_robber_ii') {
            const raw = Array.isArray(input.nums) && input.nums.length ? input.nums.map(Number) : [1, 2, 3, 1];
            const robLine = (arr) => {
                if (!arr.length) return [0];
                const d = Array(arr.length).fill(0);
                d[0] = arr[0];
                if (arr.length > 1) d[1] = Math.max(arr[0], arr[1]);
                for (let i = 2; i < arr.length; i++) d[i] = Math.max(d[i - 1], d[i - 2] + arr[i]);
                return d;
            };
            const line1 = id === 'house_robber_ii' && raw.length > 1 ? raw.slice(0, -1) : raw;
            const line2 = id === 'house_robber_ii' && raw.length > 1 ? raw.slice(1) : [];
            const dp1 = robLine(line1);
            const dp2 = line2.length ? robLine(line2) : [0];
            const exact = id === 'house_robber_ii' && raw.length > 1
                ? Math.max(dp1[dp1.length - 1], dp2[dp2.length - 1])
                : dp1[dp1.length - 1];
            const steps = [{
                kind: 'dp1d',
                title: id === 'house_robber_ii' ? 'Circular Houses (Exclude Last / First)' : 'House Robber 1D DP',
                caption: `Houses: [${raw.join(', ')}].`,
                cells: dp1.slice(0, 14).map((v, i) => i === 0 ? v : '?'),
                active: [0],
                deps: [],
                formula: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i])',
                badges: { maxLoot: dp1[0] }
            }];
            for (let i = 1; i < dp1.length && steps.length < 13; i++) {
                steps.push({
                    kind: 'dp1d',
                    title: `Evaluate House ${i} ($${line1[i]})`,
                    caption: `dp[${i}] = ${dp1[i]}`,
                    cells: dp1.slice(0, 14).map((v, idx) => idx <= i ? v : '?'),
                    active: [i],
                    deps: i >= 2 ? [i - 1, i - 2] : [0],
                    formula: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i])',
                    badges: { pass1Best: dp1[i], ...(line2.length ? { pass2Best: dp2[Math.min(i, dp2.length - 1)] } : {}) }
                });
            }
            steps.push({
                kind: 'dp1d',
                title: 'Optimal Loot Computed',
                caption: `Maximum loot without adjacent houses = ${exact}.`,
                cells: dp1.slice(0, 14),
                active: [Math.min(dp1.length - 1, 13)],
                deps: [],
                formula: id === 'house_robber_ii' ? 'max(rob(0..n-2), rob(1..n-1))' : 'dp[n-1]',
                badges: { answer: exact }
            });
            return steps;
        }

        if (id === 'coin_change') {
            const coins = Array.isArray(input.coins) && input.coins.length ? input.coins.map(Number).filter(c => c > 0) : [1, 2, 5];
            const amt = Math.max(0, Math.min(Number(input.amount ?? 11), 200));
            const INF = amt + 1;
            const dp = Array(amt + 1).fill(INF);
            dp[0] = 0;
            for (let a = 1; a <= amt; a++) {
                for (const c of coins) if (a - c >= 0) dp[a] = Math.min(dp[a], dp[a - c] + 1);
            }
            const showCap = Math.min(amt, 15);
            const steps = [{
                kind: 'dp1d',
                title: `Coin Change Bottom-Up DP (Target=${amt})`,
                caption: `Coins=[${coins.join(',')}]. dp[a] = fewest coins to sum a.`,
                cells: dp.slice(0, showCap + 1).map((_, i) => i === 0 ? 0 : '∞'),
                active: [0],
                deps: [],
                formula: 'dp[a] = min(dp[a], dp[a - c] + 1)',
                badges: { coins: coins.join(',') }
            }];
            for (let a = 1; a <= showCap && steps.length < 14; a++) {
                if (a <= 5 || a === showCap || a % 2 === 0) {
                    steps.push({
                        kind: 'dp1d',
                        title: `Fill dp[${a}]`,
                        caption: `Fewest coins for ${a} = ${dp[a] >= INF ? '∞ (-1)' : dp[a]}.`,
                        cells: dp.slice(0, showCap + 1).map((v, idx) => idx <= a ? (v >= INF ? '∞' : v) : '?'),
                        active: [a],
                        deps: coins.filter(c => a - c >= 0).map(c => a - c),
                        formula: 'dp[a] = min(dp[a], dp[a - c] + 1)',
                        badges: { [`dp[${a}]`]: dp[a] >= INF ? -1 : dp[a] }
                    });
                }
            }
            const finalAns = dp[amt] >= INF ? -1 : dp[amt];
            steps.push({
                kind: 'dp1d',
                title: 'Coin Change Result Ready',
                caption: `dp[${amt}] = ${finalAns} coin(s).`,
                cells: dp.slice(Math.max(0, amt - 14), amt + 1).map(v => v >= INF ? '∞' : v),
                active: [Math.min(amt, 14)],
                deps: [],
                formula: `dp[${amt}]`,
                badges: { target: amt, answer: finalAns }
            });
            return steps;
        }

        if (id === 'unique_paths' || id === 'longest_common_subsequence') {
            const isUp = id === 'unique_paths';
            const s1 = String(input.text1 ?? 'abcde');
            const s2 = String(input.text2 ?? 'ace');
            const fullR = isUp ? Math.max(1, Math.min(Number(input.m || 3), 25)) : s1.length + 1;
            const fullC = isUp ? Math.max(1, Math.min(Number(input.n || 7), 25)) : s2.length + 1;
            const fullDp = Array.from({ length: fullR }, () => Array(fullC).fill(0));
            for (let r = 0; r < fullR; r++) {
                for (let c = 0; c < fullC; c++) {
                    if (isUp) fullDp[r][c] = (r === 0 || c === 0) ? 1 : fullDp[r - 1][c] + fullDp[r][c - 1];
                    else if (r > 0 && c > 0) {
                        fullDp[r][c] = s1[r - 1] === s2[c - 1]
                            ? fullDp[r - 1][c - 1] + 1
                            : Math.max(fullDp[r - 1][c], fullDp[r][c - 1]);
                    }
                }
            }
            const showR = Math.min(fullR, 7), showC = Math.min(fullC, 8);
            const sliceGrid = (filledRow) => fullDp.slice(0, showR).map((row, rr) =>
                row.slice(0, showC).map(v => rr <= filledRow ? String(v) : '?')
            );
            const steps = [{
                kind: 'grid',
                title: isUp ? '2D Path Count Grid Init' : '2D LCS Prefix Matrix Init',
                caption: isUp ? `Grid ${fullR}x${fullC}. Paths count down + right.` : `Compare "${s1}" vs "${s2}".`,
                grid: sliceGrid(-1),
                activeCells: ['0,0'],
                visitedCells: [],
                badges: { rows: fullR, cols: fullC }
            }];
            for (let r = 0; r < showR; r++) {
                steps.push({
                    kind: 'grid',
                    title: `Compute Row ${r}`,
                    caption: `Row ${r} computed from above/left subproblems.`,
                    grid: sliceGrid(r),
                    activeCells: [`${r},${showC - 1}`],
                    visitedCells: [],
                    badges: { rowEnd: fullDp[r][showC - 1] }
                });
            }
            const ans = fullDp[fullR - 1][fullC - 1];
            steps.push({
                kind: 'grid',
                title: 'DP Matrix Answer Ready',
                caption: `dp[${fullR - 1}][${fullC - 1}] = ${ans}.`,
                grid: sliceGrid(showR - 1),
                activeCells: [`${showR - 1},${showC - 1}`],
                visitedCells: [`${showR - 1},${showC - 1}`],
                badges: { answer: ans }
            });
            return steps;
        }

        if (id === 'longest_increasing_subsequence' || id === 'russian_doll_envelopes') {
            const seq = id === 'russian_doll_envelopes'
                ? (Array.isArray(input.envelopes) ? input.envelopes.slice().sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : b[1] - a[1]).map(e => Number(e[1])) : [2, 4, 7, 3])
                : (Array.isArray(input.nums) ? input.nums.map(Number) : [10, 9, 2, 5, 3, 7, 101, 18]);
            const n = seq.length;
            const dp = Array(n).fill(1);
            let best = n ? 1 : 0;
            const showN = Math.min(n, 14);
            const steps = [{
                kind: 'dp1d',
                title: id === 'russian_doll_envelopes' ? 'Sort Envelopes -> LIS on Heights' : 'Longest Increasing Subsequence DP',
                caption: `Initialize dp[i] = 1 for all ${n} items.`,
                cells: dp.slice(0, showN),
                active: n ? [0] : [],
                deps: [],
                formula: 'dp[i] = max(dp[i], dp[j] + 1) for j < i, a[j] < a[i]',
                badges: { best }
            }];
            for (let i = 1; i < n; i++) {
                const used = [];
                for (let j = 0; j < i; j++) {
                    if (seq[j] < seq[i] && dp[j] + 1 > dp[i]) {
                        dp[i] = dp[j] + 1;
                        used.push(j);
                    }
                }
                best = Math.max(best, dp[i]);
                if (steps.length < 16 && i < showN) {
                    steps.push({
                        kind: 'dp1d',
                        title: `Update dp[${i}] (val=${seq[i]})`,
                        caption: `dp[${i}] = ${dp[i]}, maxLIS = ${best}.`,
                        cells: dp.slice(0, showN).map((v, idx) => idx <= i ? v : 1),
                        active: [i],
                        deps: used.filter(u => u < showN),
                        formula: 'dp[i] = max(dp[i], dp[j] + 1)',
                        badges: { val: seq[i], [`dp[${i}]`]: dp[i], best }
                    });
                }
            }
            steps.push({
                kind: 'dp1d',
                title: 'Maximum Subsequence Length Ready',
                caption: `LIS length = ${best}.`,
                cells: dp.slice(0, showN),
                active: [],
                deps: [],
                formula: 'max(dp)',
                badges: { answer: best }
            });
            return steps;
        }

        if (id === 'regular_expression_matching' || id === 'wildcard_matching' || id === 'distinct_subsequences') {
            const s = String(input.s ?? 'aa');
            const p = String(input.p ?? input.t ?? 'a*');
            const m = s.length, n = p.length;
            const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(id === 'distinct_subsequences' ? 0 : false));
            if (id === 'distinct_subsequences') {
                for (let i = 0; i <= m; i++) dp[i][n] = 1;
                for (let i = m - 1; i >= 0; i--) {
                    for (let j = n - 1; j >= 0; j--) {
                        dp[i][j] = dp[i + 1][j] + (s[i] === p[j] ? dp[i + 1][j + 1] : 0);
                    }
                }
            } else if (id === 'regular_expression_matching') {
                dp[0][0] = true;
                for (let j = 2; j <= n; j++) if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2];
                for (let i = 1; i <= m; i++) {
                    for (let j = 1; j <= n; j++) {
                        if (p[j - 1] === '*') {
                            dp[i][j] = dp[i][j - 2] || ((p[j - 2] === '.' || p[j - 2] === s[i - 1]) && dp[i - 1][j]);
                        } else if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {
                            dp[i][j] = dp[i - 1][j - 1];
                        }
                    }
                }
            } else {
                dp[0][0] = true;
                for (let j = 1; j <= n; j++) if (p[j - 1] === '*') dp[0][j] = dp[0][j - 1];
                for (let i = 1; i <= m; i++) {
                    for (let j = 1; j <= n; j++) {
                        if (p[j - 1] === '*') dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
                        else if (p[j - 1] === '?' || p[j - 1] === s[i - 1]) dp[i][j] = dp[i - 1][j - 1];
                    }
                }
            }
            const showR = Math.min(m + 1, 7), showC = Math.min(n + 1, 8);
            const fmt = (rowCap) => dp.slice(0, showR).map((row, rr) =>
                row.slice(0, showC).map(v => rr <= rowCap ? (typeof v === 'boolean' ? (v ? 'T' : 'F') : String(v)) : '?')
            );
            const ans = id === 'distinct_subsequences' ? dp[0][0] : dp[m][n];
            return [
                {
                    kind: 'grid',
                    title: 'String Matching 2D DP Init',
                    caption: `Matching s="${s}" against p="${p}" over ${m + 1}x${n + 1} DP table.`,
                    grid: fmt(0),
                    activeCells: ['0,0'],
                    visitedCells: [],
                    badges: { s, p }
                },
                {
                    kind: 'grid',
                    title: 'Evaluate Prefix / Suffix Transitions',
                    caption: `Propagating states across pattern characters.`,
                    grid: fmt(Math.floor(showR / 2)),
                    activeCells: [`${Math.floor(showR / 2)},${showC - 1}`],
                    visitedCells: [],
                    badges: { progress: '50%' }
                },
                {
                    kind: 'grid',
                    title: 'String Matching Complete',
                    caption: `Computed DP result = ${ans}.`,
                    grid: fmt(showR - 1),
                    activeCells: [id === 'distinct_subsequences' ? '0,0' : `${showR - 1},${showC - 1}`],
                    visitedCells: [],
                    badges: { answer: ans }
                }
            ];
        }

        if (id === 'best_time_stock_iii' || id === 'best_time_stock_iv') {
            const k = id === 'best_time_stock_iii' ? 2 : Math.max(0, Number(input.k ?? 2));
            const prices = Array.isArray(input.prices) ? input.prices.map(Number) : [3, 3, 5, 0, 0, 3, 1, 4];
            let ans = 0;
            if (prices.length > 1 && k > 0) {
                const effK = Math.min(k, Math.floor(prices.length / 2));
                const buy = Array(effK + 1).fill(-Infinity);
                const sell = Array(effK + 1).fill(0);
                for (const p of prices) {
                    for (let t = 1; t <= effK; t++) {
                        buy[t] = Math.max(buy[t], sell[t - 1] - p);
                        sell[t] = Math.max(sell[t], buy[t] + p);
                    }
                }
                ans = sell[effK];
            }
            const steps = [{
                kind: 'dp1d',
                title: `Stock Profit State Machine (k=${k})`,
                caption: `Track buy[t] and sell[t] across ${prices.length} days.`,
                cells: prices.slice(0, 14),
                active: prices.length ? [0] : [],
                deps: [],
                formula: 'sell[t] = max(sell[t], buy[t] + price)',
                badges: { k, pricesLen: prices.length }
            }, {
                kind: 'dp1d',
                title: 'Evaluate Transaction States',
                caption: `Scan daily price swings tracking up to ${k} completed trades.`,
                cells: prices.slice(0, 14),
                active: prices.length > 1 ? [Math.floor(prices.length / 2)] : [],
                deps: [0],
                formula: 'buy[t] = max(buy[t], sell[t-1] - price)',
                badges: { k }
            }, {
                kind: 'dp1d',
                title: 'Maximum Stock Profit Ready',
                caption: `Max profit with <= ${k} transaction(s) = ${ans}.`,
                cells: prices.slice(0, 14),
                active: [],
                deps: [],
                formula: `sell[${k}]`,
                badges: { k, answer: ans }
            }];
            return steps;
        }

        if (id === 'palindrome_partitioning_ii') {
            const s = String(input.s ?? 'aab');
            const n = s.length;
            const cuts = Array.from({ length: n }, (_, i) => i);
            const isPal = Array.from({ length: n }, () => Array(n).fill(false));
            for (let r = 0; r < n; r++) {
                for (let l = 0; l <= r; l++) {
                    if (s[l] === s[r] && (r - l <= 2 || isPal[l + 1][r - 1])) {
                        isPal[l][r] = true;
                        cuts[r] = l === 0 ? 0 : Math.min(cuts[r], cuts[l - 1] + 1);
                    }
                }
            }
            const ans = n ? cuts[n - 1] : 0;
            return [
                { kind: 'dp1d', title: 'Initialize Worst-Case Cuts', caption: `String "${s}": max cuts at index i is i.`, cells: Array.from({ length: Math.min(n, 14) }, (_, i) => i), active: [0], deps: [], formula: 'cuts[r] = min(cuts[l-1] + 1)', badges: { s } },
                { kind: 'dp1d', title: 'Expand Palindrome Segments', caption: `Whenever s[l..r] is palindrome, update cuts[r].`, cells: cuts.slice(0, 14), active: [Math.floor(Math.min(n, 14) / 2)], deps: [0], formula: 'if isPal[l][r]: update cuts[r]', badges: { midCuts: cuts[Math.floor(n / 2)] ?? 0 } },
                { kind: 'dp1d', title: 'Minimum Cuts Computed', caption: `Minimum cuts for "${s}" = ${ans}.`, cells: cuts.slice(0, 14), active: [Math.max(0, Math.min(n - 1, 13))], deps: [], formula: 'cuts[n-1]', badges: { answer: ans } }
            ];
        }

        if (id === 'job_scheduling') {
            const st = Array.isArray(input.startTime) ? input.startTime.map(Number) : [1, 2, 3, 3];
            const et = Array.isArray(input.endTime) ? input.endTime.map(Number) : [3, 4, 5, 6];
            const pr = Array.isArray(input.profit) ? input.profit.map(Number) : [50, 10, 40, 70];
            const jobs = st.map((s, i) => [s, et[i], pr[i]]).sort((a, b) => a[1] - b[1]);
            const n = jobs.length;
            const dp = Array(n + 1).fill(0);
            for (let i = 1; i <= n; i++) {
                let prev = 0;
                for (let j = i - 1; j >= 1; j--) {
                    if (jobs[j - 1][1] <= jobs[i - 1][0]) { prev = j; break; }
                }
                dp[i] = Math.max(dp[i - 1], dp[prev] + jobs[i - 1][2]);
            }
            const ans = dp[n];
            return [
                { kind: 'dp1d', title: 'Sort Jobs by End Time', caption: `Sorted ${n} weighted interval jobs.`, cells: dp.slice(0, 14).map((_, i) => i === 0 ? 0 : '?'), active: [0], deps: [], formula: 'dp[i] = max(dp[i-1], profit[i] + dp[prev])', badges: { jobs: n } },
                { kind: 'dp1d', title: 'Compute Weighted Interval DP', caption: `Track max non-overlapping profit at each job end.`, cells: dp.slice(0, 14), active: [Math.floor(Math.min(n, 13) / 2)], deps: [0], formula: 'binary search latest compatible job', badges: { runningMax: dp[n] } },
                { kind: 'dp1d', title: 'Maximum Job Profit Ready', caption: `Max profit = ${ans}.`, cells: dp.slice(0, 14), active: [Math.min(n, 13)], deps: [], formula: 'dp[n]', badges: { answer: ans } }
            ];
        }

        // Generic DP safeguard (never hardcoded 1,2,'✓')
        const seq = Array.isArray(input.nums) ? input.nums.map(String) : [String(input.n ?? input.s ?? '0')];
        return [
            { kind: 'dp1d', title: 'Initialize DP States', caption: `Input length ${seq.length}.`, cells: seq, active: [0], deps: [], formula: 'Subproblem transition', badges: { n: seq.length } },
            { kind: 'dp1d', title: 'Fill Transition Table', caption: 'Compute subproblems bottom-up.', cells: seq, active: [Math.max(0, seq.length - 1)], deps: [0], formula: 'Optimal substructure', badges: { step: 'fill' } },
            { kind: 'dp1d', title: 'DP Computation Complete', caption: 'Finished dynamic programming sweep.', cells: seq, active: [], deps: [], formula: 'Result ready', badges: { done: true } }
        ];
    }

    // =========================================================
    // 7. Grid Problems (Actual BFS/DFS/DP Solvers)
    // =========================================================
    function genGridProblem(id, input) {
        let rawGrid = input.image || input.grid || input.board || input.matrix || input.dungeon;
        if (!Array.isArray(rawGrid) || !rawGrid.length) rawGrid = [['1', '1'], ['0', '1']];
        const grid = rawGrid.map(row => typeof row === 'string' ? row.split('') : row.map(v => String(v)));
        const R = grid.length, C = grid[0] ? grid[0].length : 0;

        if (id === 'flood_fill') {
            const sr = Math.min(Math.max(Number(input.sr ?? 0), 0), Math.max(0, R - 1));
            const sc = Math.min(Math.max(Number(input.sc ?? 0), 0), Math.max(0, C - 1));
            const newCol = String(input.color ?? 2);
            const g1 = clone(grid), gCur = clone(grid);
            const oldCol = R && C ? gCur[sr][sc] : newCol;
            const visited = [];
            if (R && C && oldCol !== newCol) {
                const q = [[sr, sc]];
                gCur[sr][sc] = newCol;
                visited.push(`${sr},${sc}`);
                while (q.length) {
                    const [r, c] = q.shift();
                    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < R && nc >= 0 && nc < C && gCur[nr][nc] === oldCol) {
                            gCur[nr][nc] = newCol;
                            visited.push(`${nr},${nc}`);
                            q.push([nr, nc]);
                        }
                    }
                }
            }
            const gMid = clone(grid);
            if (R && C) gMid[sr][sc] = newCol;
            return [
                { kind: 'grid', title: `Start Flood Fill at (${sr}, ${sc})`, caption: `Old color '${oldCol}' -> fill connected cells with '${newCol}'.`, grid: g1, activeCells: [`${sr},${sc}`], visitedCells: [], badges: { oldCol, newCol } },
                { kind: 'grid', title: `Paint Origin & Expand 4-Neighbors`, caption: `Recoloring connected component of '${oldCol}'.`, grid: gMid, activeCells: [`${sr},${sc}`], visitedCells: [`${sr},${sc}`], badges: { changed: visited.length } },
                { kind: 'grid', title: 'Flood Fill Complete', caption: `Updated ${visited.length} cell(s) to '${newCol}'.`, grid: gCur, activeCells: [], visitedCells: visited, badges: { answer: `${visited.length} cells painted` } }
            ];
        }

        if (id === 'number_of_islands') {
            const g = grid.map(r => r.slice());
            let islands = 0;
            const seen = [];
            for (let r = 0; r < R; r++) {
                for (let c = 0; c < C; c++) {
                    if (g[r][c] === '1') {
                        islands++;
                        const q = [[r, c]];
                        g[r][c] = '#';
                        while (q.length) {
                            const [cr, cc] = q.shift();
                            seen.push(`${cr},${cc}`);
                            for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                                const nr = cr + dr, nc = cc + dc;
                                if (nr >= 0 && nr < R && nc >= 0 && nc < C && g[nr][nc] === '1') {
                                    g[nr][nc] = '#';
                                    q.push([nr, nc]);
                                }
                            }
                        }
                    }
                }
            }
            return [
                { kind: 'grid', title: `Scan ${R}x${C} Archipelago Grid`, caption: `Trigger DFS/BFS flood fill on every unvisited land cell ('1').`, grid, activeCells: ['0,0'], visitedCells: [], badges: { size: `${R}x${C}` } },
                { kind: 'grid', title: 'Mark Connected Land Components', caption: `Visited ${seen.length} land cell(s) across discovered islands.`, grid, activeCells: seen.slice(0, 4), visitedCells: seen.slice(0, 12), badges: { islandsSoFar: islands } },
                { kind: 'grid', title: 'Island Count Complete', caption: `Total islands = ${islands}.`, grid, activeCells: [], visitedCells: seen, badges: { answer: islands } }
            ];
        }

        if (id === 'rotting_oranges') {
            const g = grid.map(r => r.map(Number));
            const q = [];
            let fresh = 0, mins = 0;
            for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
                if (g[r][c] === 2) q.push([r, c]);
                else if (g[r][c] === 1) fresh++;
            }
            const steps = [{
                kind: 'grid',
                title: 'Multi-Source BFS Init (Minute 0)',
                caption: `Initial rotten=${q.length}, fresh=${fresh}.`,
                grid: g.map(r => r.map(String)),
                activeCells: q.map(([r, c]) => `${r},${c}`),
                visitedCells: [],
                badges: { minute: 0, fresh }
            }];
            while (q.length && fresh > 0) {
                mins++;
                const sz = q.length, newly = [];
                for (let k = 0; k < sz; k++) {
                    const [r, c] = q.shift();
                    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < R && nc >= 0 && nc < C && g[nr][nc] === 1) {
                            g[nr][nc] = 2;
                            fresh--;
                            q.push([nr, nc]);
                            newly.push(`${nr},${nc}`);
                        }
                    }
                }
                if (steps.length < 14) {
                    steps.push({
                        kind: 'grid',
                        title: `Minute ${mins}`,
                        caption: `${newly.length} orange(s) rotted; ${fresh} fresh remaining.`,
                        grid: g.map(r => r.map(String)),
                        activeCells: newly,
                        visitedCells: [],
                        badges: { minute: mins, fresh }
                    });
                }
            }
            const ans = fresh === 0 ? mins : -1;
            steps.push({
                kind: 'grid',
                title: 'Rotting Oranges Complete',
                caption: ans >= 0 ? `All oranges rotted in ${ans} minute(s).` : `Unreachable fresh oranges remain -> -1.`,
                grid: g.map(r => r.map(String)),
                activeCells: [],
                visitedCells: [],
                badges: { answer: ans }
            });
            return steps;
        }

        if (id === 'dungeon_game') {
            const dun = grid.map(r => r.map(Number));
            const dp = Array.from({ length: R }, () => Array(C).fill(1));
            for (let r = R - 1; r >= 0; r--) {
                for (let c = C - 1; c >= 0; c--) {
                    if (r === R - 1 && c === C - 1) dp[r][c] = Math.max(1, 1 - dun[r][c]);
                    else {
                        const nextMin = Math.min(r + 1 < R ? dp[r + 1][c] : Infinity, c + 1 < C ? dp[r][c + 1] : Infinity);
                        dp[r][c] = Math.max(1, nextMin - dun[r][c]);
                    }
                }
            }
            const ans = R && C ? dp[0][0] : 1;
            return [
                { kind: 'grid', title: 'Input Dungeon Rooms', caption: `Bottom-up DP from princess cell (${R - 1},${C - 1}) back to (0,0).`, grid, activeCells: [`${R - 1},${C - 1}`], visitedCells: [], badges: { size: `${R}x${C}` } },
                { kind: 'grid', title: 'Compute Required Min HP Matrix', caption: `At each cell need >= 1 HP after applying room delta.`, grid: dp.map(r => r.map(String)), activeCells: ['0,0'], visitedCells: [`${R - 1},${C - 1}`], badges: { startHp: ans } },
                { kind: 'grid', title: 'Minimum Initial HP Ready', caption: `Knight needs ${ans} initial HP.`, grid: dp.map(r => r.map(String)), activeCells: ['0,0'], visitedCells: [], badges: { answer: ans } }
            ];
        }

        if (id === 'longest_increasing_path_matrix') {
            const mat = grid.map(r => r.map(Number));
            const memo = Array.from({ length: R }, () => Array(C).fill(0));
            const dfs = (r, c) => {
                if (memo[r][c]) return memo[r][c];
                let best = 1;
                for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < R && nc >= 0 && nc < C && mat[nr][nc] > mat[r][c]) {
                        best = Math.max(best, 1 + dfs(nr, nc));
                    }
                }
                return memo[r][c] = best;
            };
            let maxLen = 0;
            for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) maxLen = Math.max(maxLen, dfs(r, c));
            return [
                { kind: 'grid', title: 'Input Matrix Values', caption: `Run memoized DFS from each cell following strictly increasing neighbors.`, grid, activeCells: ['0,0'], visitedCells: [], badges: { size: `${R}x${C}` } },
                { kind: 'grid', title: 'Memoized Path Lengths', caption: `Computed longest strictly increasing path starting at each cell.`, grid: memo.map(r => r.map(String)), activeCells: [], visitedCells: [], badges: { maxLen } },
                { kind: 'grid', title: 'Longest Increasing Path Ready', caption: `Max path length = ${maxLen}.`, grid: memo.map(r => r.map(String)), activeCells: [], visitedCells: [], badges: { answer: maxLen } }
            ];
        }

        if (id === 'maximal_rectangle') {
            const heights = Array(C).fill(0);
            let best = 0;
            for (let r = 0; r < R; r++) {
                for (let c = 0; c < C; c++) heights[c] = grid[r][c] === '1' ? heights[c] + 1 : 0;
                const st = [];
                for (let c = 0; c <= C; c++) {
                    const cur = c === C ? 0 : heights[c];
                    while (st.length && heights[st[st.length - 1]] > cur) {
                        const h = heights[st.pop()];
                        const w = st.length ? c - st[st.length - 1] - 1 : c;
                        best = Math.max(best, h * w);
                    }
                    st.push(c);
                }
            }
            const ones = [];
            for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c] === '1') ones.push(`${r},${c}`);
            return [
                { kind: 'grid', title: 'Binary Matrix Histogram Scan', caption: `Accumulate column heights of consecutive '1's row by row.`, grid, activeCells: ones.slice(0, 3), visitedCells: [], badges: { size: `${R}x${C}` } },
                { kind: 'grid', title: 'Monotonic Stack Per Row', caption: `Compute largest rectangle area in each row histogram.`, grid, activeCells: ones.slice(0, 6), visitedCells: ones, badges: { bestSoFar: best } },
                { kind: 'grid', title: 'Maximal Rectangle Computed', caption: `Largest 1s rectangle area = ${best}.`, grid, activeCells: [], visitedCells: ones, badges: { answer: best } }
            ];
        }

        if (id === 'swim_in_rising_water') {
            const mat = grid.map(r => r.map(Number));
            const seen = Array.from({ length: R }, () => Array(C).fill(false));
            const pq = R && C ? [[mat[0][0], 0, 0]] : [];
            let ans = 0;
            while (pq.length) {
                pq.sort((a, b) => a[0] - b[0]);
                const [t, r, c] = pq.shift();
                if (seen[r][c]) continue;
                seen[r][c] = true;
                ans = Math.max(ans, t);
                if (r === R - 1 && c === C - 1) break;
                for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < R && nc >= 0 && nc < C && !seen[nr][nc]) pq.push([mat[nr][nc], nr, nc]);
                }
            }
            return [
                { kind: 'grid', title: 'Swim in Rising Water (Dijkstra)', caption: `Start at (0,0) and expand lowest adjacent elevation.`, grid, activeCells: ['0,0'], visitedCells: [], badges: { start: R && C ? mat[0][0] : 0 } },
                { kind: 'grid', title: 'Minimax Elevation Frontier', caption: `Always step to minimum reachable cell height.`, grid, activeCells: [`${Math.max(0, R - 1)},${Math.max(0, C - 1)}`], visitedCells: ['0,0'], badges: { peakTime: ans } },
                { kind: 'grid', title: 'Minimum Swim Time Computed', caption: `Minimum time t to reach (${R - 1},${C - 1}) = ${ans}.`, grid, activeCells: [`${Math.max(0, R - 1)},${Math.max(0, C - 1)}`], visitedCells: ['0,0', `${Math.max(0, R - 1)},${Math.max(0, C - 1)}`], badges: { answer: ans } }
            ];
        }

        // word_search / word_search_ii
        const targetWords = Array.isArray(input.words) ? input.words : [String(input.word || 'ABCCED')];
        const findWord = (word) => {
            if (!word) return null;
            const used = Array.from({ length: R }, () => Array(C).fill(false));
            const path = [];
            const dfs = (r, c, idx) => {
                if (idx === word.length) return true;
                if (r < 0 || r >= R || c < 0 || c >= C || used[r][c] || grid[r][c] !== word[idx]) return false;
                used[r][c] = true;
                path.push(`${r},${c}`);
                for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    if (dfs(r + dr, c + dc, idx + 1)) return true;
                }
                path.pop();
                used[r][c] = false;
                return false;
            };
            for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (dfs(r, c, 0)) return path.slice();
            return null;
        };
        if (id === 'word_search_ii') {
            const foundWords = [], highlight = [];
            for (const w of targetWords) {
                const p = findWord(w);
                if (p) { foundWords.push(w); highlight.push(...p); }
            }
            foundWords.sort();
            return [
                { kind: 'grid', title: `Trie + Board DFS (${R}x${C})`, caption: `Search dictionary [${targetWords.join(', ')}] across board.`, grid, activeCells: ['0,0'], visitedCells: [], badges: { words: targetWords.length } },
                { kind: 'grid', title: 'Match Prefix Paths on Board', caption: `Prune dead branches immediately using Trie prefix checks.`, grid, activeCells: highlight.slice(0, 4), visitedCells: highlight, badges: { foundSoFar: foundWords.join(', ') || 'none' } },
                { kind: 'grid', title: 'Word Search II Complete', caption: `Found words: ${JSON.stringify(foundWords)}`, grid, activeCells: [], visitedCells: highlight, badges: { answer: JSON.stringify(foundWords) } }
            ];
        }
        const matchedPath = findWord(targetWords[0]);
        return [
            { kind: 'grid', title: `Word Search for "${targetWords[0]}"`, caption: `Try starting DFS from matching first letter '${targetWords[0][0] || ''}'.`, grid, activeCells: ['0,0'], visitedCells: [], badges: { word: targetWords[0] } },
            { kind: 'grid', title: 'Explore 4-Neighbor Backtracking Paths', caption: matchedPath ? `Found valid character chain of length ${matchedPath.length}.` : `All candidate paths explored.`, grid, activeCells: matchedPath ? matchedPath.slice(0, 3) : [], visitedCells: matchedPath || [], badges: { matched: Boolean(matchedPath) } },
            { kind: 'grid', title: matchedPath ? 'Word Found (true)' : 'Word Not Found (false)', caption: `Result for "${targetWords[0]}" = ${Boolean(matchedPath)}.`, grid, activeCells: [], visitedCells: matchedPath || [], badges: { answer: Boolean(matchedPath) } }
        ];
    }

    // =========================================================
    // 8. Graph Problems (Topological Sort & Word Ladder BFS)
    // =========================================================
    function genGraphProblem(id, input) {
        if (id === 'course_schedule') {
            const n = Math.max(1, Number(input.numCourses ?? 2));
            const showN = Math.min(n, 7);
            const prereqs = Array.isArray(input.prerequisites) ? input.prerequisites : [[1, 0]];
            const adj = Array.from({ length: n }, () => []);
            const indeg = Array(n).fill(0);
            for (const [a, b] of prereqs) {
                if (b < n && a < n) { adj[b].push(a); indeg[a]++; }
            }
            const nodes = Array.from({ length: showN }, (_, i) => `C${i}`);
            const edges = prereqs.map(([a, b]) => [b, a]).filter(([u, v]) => u < showN && v < showN);
            const q = [];
            for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
            const order = [];
            const initQ = q.filter(x => x < showN).map(x => `C${x}`);
            while (q.length) {
                const u = q.shift();
                order.push(u);
                for (const v of adj[u]) {
                    indeg[v]--;
                    if (indeg[v] === 0) q.push(v);
                }
            }
            const canFinish = order.length === n;
            const mid = Math.ceil(order.length / 2);
            return [
                {
                    kind: 'graph',
                    title: "Kahn's Topological Sort Init",
                    caption: `Zero-indegree courses queued: [${initQ.join(', ')}].`,
                    nodes, edges,
                    queue: initQ,
                    visited: [],
                    badges: { courses: n, edges: prereqs.length }
                },
                {
                    kind: 'graph',
                    title: 'Peel Zero-Indegree Courses',
                    caption: `Processed ${mid} course(s) so far: [${order.slice(0, mid).map(x => 'C' + x).join(' -> ')}].`,
                    nodes, edges,
                    queue: order.slice(mid, mid + 2).filter(x => x < showN).map(x => `C${x}`),
                    visited: order.slice(0, mid).filter(x => x < showN).map(x => `C${x}`),
                    badges: { processed: mid }
                },
                {
                    kind: 'graph',
                    title: canFinish ? 'All Courses Ordered (true)' : 'Cycle Detected (false)',
                    caption: canFinish ? `Valid schedule of ${n} course(s) -> true.` : `Only ${order.length}/${n} courses reachable -> false.`,
                    nodes, edges,
                    queue: [],
                    visited: order.filter(x => x < showN).map(x => `C${x}`),
                    badges: { answer: canFinish }
                }
            ];
        }

        // word_ladder
        const bw = String(input.beginWord || 'hit');
        const ew = String(input.endWord || 'cog');
        const wl = Array.isArray(input.wordList) ? input.wordList.map(String) : ['hot', 'dot', 'dog', 'cog'];
        const dict = new Set(wl);
        let ans = 0, foundPath = [];
        if (dict.has(ew)) {
            const q = [[bw, 1, [bw]]];
            const vis = new Set([bw]);
            while (q.length) {
                const [w, dist, path] = q.shift();
                if (w === ew) { ans = dist; foundPath = path; break; }
                for (let i = 0; i < w.length; i++) {
                    for (let c = 97; c <= 122; c++) {
                        const nw = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);
                        if (dict.has(nw) && !vis.has(nw)) {
                            vis.add(nw);
                            q.push([nw, dist + 1, [...path, nw]]);
                        }
                    }
                }
            }
        }
        const disp = foundPath.length ? foundPath.slice(0, 7) : [bw, ...wl.slice(0, 5)];
        const edges = [];
        for (let i = 0; i < disp.length - 1; i++) edges.push([i, i + 1]);
        return [
            { kind: 'graph', title: 'Word Ladder Shortest BFS', caption: `Transform "${bw}" -> "${ew}" changing 1 letter at a time.`, nodes: disp, edges, queue: [bw], visited: [bw], badges: { begin: bw, end: ew } },
            { kind: 'graph', title: 'Expand Level Frontier', caption: foundPath.length ? `Shortest chain: ${foundPath.join(' -> ')}` : `"${ew}" unreachable from "${bw}".`, nodes: disp, edges, queue: disp.slice(1, 3), visited: disp.slice(0, 2), badges: { levels: ans || '∞' } },
            { kind: 'graph', title: 'Word Ladder Result', caption: `Shortest sequence length = ${ans}.`, nodes: disp, edges, queue: [], visited: ans > 0 ? disp : [], badges: { answer: ans } }
        ];
    }

    // =========================================================
    // 9. Intervals (Real Merge / Insert / Non-Overlapping)
    // =========================================================
    function genIntervalsProblem(id, input) {
        const raw = Array.isArray(input.intervals) ? input.intervals.map(iv => iv.slice()) : [[1, 3], [2, 6], [8, 10]];
        const sorted = raw.slice().sort((a, b) => a[0] - b[0]);
        if (input.newInterval) {
            sorted.push(input.newInterval.slice());
            sorted.sort((a, b) => a[0] - b[0]);
        }
        let result, ansVal;
        if (id === 'non_overlapping_intervals') {
            const byEnd = raw.slice().sort((a, b) => a[1] - b[1]);
            let prevEnd = -Infinity, kept = [];
            for (const iv of byEnd) {
                if (iv[0] >= prevEnd) { kept.push(iv); prevEnd = iv[1]; }
            }
            const removals = raw.length - kept.length;
            result = kept;
            ansVal = removals;
        } else {
            const merged = [];
            for (const iv of sorted) {
                if (!merged.length || merged[merged.length - 1][1] < iv[0]) merged.push(iv.slice());
                else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], iv[1]);
            }
            result = merged;
            ansVal = merged;
        }
        return [
            { kind: 'intervals', title: 'Sort Intervals by Start/End', caption: `Evaluate ${sorted.length} interval(s) sequentially.`, intervals: sorted.slice(0, 10), active: sorted.length > 1 ? [0, 1] : [0], badges: { count: sorted.length } },
            { kind: 'intervals', title: id === 'non_overlapping_intervals' ? 'Greedy Prune Overlaps' : 'Merge Overlapping Ranges', caption: id === 'non_overlapping_intervals' ? `Keep interval ending earliest -> remove ${ansVal}.` : `Combine overlapping [s,e] ranges into ${result.length} output interval(s).`, intervals: sorted.slice(0, 10), active: sorted.length > 1 ? [0, 1] : [0], badges: { overlapsResolved: true } },
            { kind: 'intervals', title: 'Intervals Finalized', caption: `Output = ${JSON.stringify(ansVal)}`, intervals: result.slice(0, 10), active: [], badges: { answer: JSON.stringify(ansVal) } }
        ];
    }

    // =========================================================
    // 10. Backtracking (Real Subset/Perm/Comb/Parens/WordBreak)
    // =========================================================
    function genBacktrackingProblem(id, input) {
        let out = [];
        if (id === 'generate_parentheses') {
            const n = Math.max(1, Math.min(Number(input.n ?? 3), 5));
            const bt = (cur, open, close) => {
                if (out.length >= 24) return;
                if (cur.length === 2 * n) { out.push(cur); return; }
                if (open < n) bt(cur + '(', open + 1, close);
                if (close < open) bt(cur + ')', open, close + 1);
            };
            bt('', 0, 0);
        } else if (id === 'subsets') {
            const nums = Array.isArray(input.nums) ? input.nums.slice(0, 5) : [1, 2, 3];
            out = [[]];
            for (const x of nums) {
                const len = out.length;
                for (let i = 0; i < len && out.length < 32; i++) out.push([...out[i], x]);
            }
        } else if (id === 'permutations') {
            const nums = Array.isArray(input.nums) ? input.nums.slice(0, 4) : [1, 2, 3];
            const used = Array(nums.length).fill(false), cur = [];
            const bt = () => {
                if (out.length >= 24) return;
                if (cur.length === nums.length) { out.push(cur.slice()); return; }
                for (let i = 0; i < nums.length; i++) {
                    if (used[i]) continue;
                    used[i] = true; cur.push(nums[i]); bt(); cur.pop(); used[i] = false;
                }
            };
            bt();
        } else if (id === 'combination_sum') {
            const cands = Array.isArray(input.candidates) ? input.candidates.map(Number).sort((a, b) => a - b) : [2, 3, 6, 7];
            const target = Number(input.target ?? 7);
            const cur = [];
            const bt = (idx, rem) => {
                if (out.length >= 20) return;
                if (rem === 0) { out.push(cur.slice()); return; }
                for (let i = idx; i < cands.length; i++) {
                    if (cands[i] <= 0 || cands[i] > rem) break;
                    cur.push(cands[i]); bt(i, rem - cands[i]); cur.pop();
                }
            };
            bt(0, target);
        } else {
            // word_break_ii
            const s = String(input.s ?? 'catsanddog');
            const dict = new Set(Array.isArray(input.wordDict) ? input.wordDict : ['cat', 'cats', 'and', 'sand', 'dog']);
            const cur = [];
            const bt = (idx) => {
                if (out.length >= 16) return;
                if (idx === s.length) { out.push(cur.join(' ')); return; }
                for (let end = idx + 1; end <= s.length; end++) {
                    const sub = s.slice(idx, end);
                    if (dict.has(sub)) { cur.push(sub); bt(end); cur.pop(); }
                }
            };
            bt(0);
        }

        const choices = Array.isArray(input.nums) ? input.nums
            : (Array.isArray(input.candidates) ? input.candidates
                : (Array.isArray(input.wordDict) ? input.wordDict : Array.from({ length: Number(input.n || 3) }, (_, i) => `n${i + 1}`)));
        const expList = out.slice(0, 6).map(x => JSON.stringify(x));
        return [
            { kind: 'array', title: 'Initialize Backtracking Tree', caption: `Explore choices [${choices.join(', ')}] via choose -> recurse -> unchoose.`, items: choices.slice(0, 10).map(String), pointers: choices.length ? { pick: 0 } : {}, active: choices.length ? [0] : [], done: [], badges: { depth: 0 } },
            { kind: 'array', title: 'Recurse Decision Branches', caption: `Example branch generated: ${expList[0] || '[]'}`, items: choices.slice(0, 10).map(String), pointers: choices.length ? { pick: Math.min(1, choices.length - 1) } : {}, active: choices.length > 1 ? [0, 1] : [0], done: [], badges: { countSoFar: out.length } },
            { kind: 'array', title: 'Backtracking Complete', caption: `Generated ${out.length} result(s): ${JSON.stringify(out).slice(0, 75)}`, items: expList.length ? expList : ['[]'], pointers: {}, active: [], done: expList.map((_, i) => i), badges: { answer: `${out.length} results` } }
        ];
    }

    // =========================================================
    // 11. Bits / Math Problems
    // =========================================================
    function genBitsProblem(id, input) {
        if (id === 'palindrome_number') {
            const x = Number(input.x ?? 121);
            const isNeg = x < 0;
            const s = String(x);
            const rev = s.split('').reverse().join('');
            const ans = !isNeg && s === rev;
            const digits = s.split('');
            return [
                { kind: 'bits', title: `Check Digits of x=${x}`, caption: isNeg ? 'Negative integer cannot be palindrome -> false.' : 'Reverse half digits and compare.', bits: digits, active: [0, digits.length - 1], badges: { x } },
                { kind: 'bits', title: 'Compare Forward vs Reversed', caption: `Forward "${s}" vs Reversed "${rev}".`, bits: digits, active: digits.map((_, i) => i), badges: { isPalindrome: ans } },
                { kind: 'bits', title: ans ? 'Palindrome (true)' : 'Not Palindrome (false)', caption: `Result = ${ans}.`, bits: digits, active: [], done: digits.map((_, i) => i), badges: { answer: ans } }
            ];
        }

        if (id === 'number_of_1_bits') {
            let n = Number(input.n ?? 11) >>> 0;
            const orig = n;
            const steps = [{
                kind: 'bits',
                title: `8-Bit Binary of ${orig}`,
                caption: `Clear lowest 1-bit via n &= (n - 1).`,
                bits: toBitArray(n, 8),
                active: [],
                badges: { n: orig, count: 0 }
            }];
            let cnt = 0;
            while (n > 0) {
                n = n & (n - 1);
                cnt++;
                if (steps.length < 12) {
                    steps.push({
                        kind: 'bits',
                        title: `Clear Bit -> count=${cnt}`,
                        caption: `Remaining n = ${n}.`,
                        bits: toBitArray(n, 8),
                        active: toBitArray(n, 8).map((b, i) => b === 1 ? i : -1).filter(i => i >= 0),
                        badges: { remaining: n, count: cnt }
                    });
                }
            }
            steps.push({ kind: 'bits', title: 'Popcount Complete', caption: `${orig} has ${cnt} set 1-bit(s).`, bits: toBitArray(orig, 8), active: [], done: toBitArray(orig, 8).map((b, i) => b ? i : -1).filter(i => i >= 0), badges: { answer: cnt } });
            return steps;
        }

        const nums = Array.isArray(input.nums) ? input.nums.map(Number) : [2, 2, 1];
        let acc = id === 'missing_number' ? nums.length : 0;
        const steps = [{
            kind: 'bits',
            title: id === 'missing_number' ? 'XOR Index ^ Value' : 'XOR Pair Cancellation',
            caption: `Initialize acc = ${acc} (${toBitArray(acc, 6).join('')}).`,
            bits: toBitArray(acc, 6),
            active: [],
            badges: { nums: `[${nums.join(',')}]`, acc }
        }];
        for (let i = 0; i < nums.length; i++) {
            acc = id === 'missing_number' ? (acc ^ i ^ nums[i]) : (acc ^ nums[i]);
            if (steps.length < 14) {
                steps.push({
                    kind: 'bits',
                    title: `XOR with nums[${i}]=${nums[i]}`,
                    caption: `acc becomes ${acc} (bin ${toBitArray(acc, 6).join('')}).`,
                    bits: toBitArray(acc, 6),
                    active: toBitArray(acc, 6).map((b, idx) => b === 1 ? idx : -1).filter(idx => idx >= 0),
                    badges: { acc }
                });
            }
        }
        steps.push({ kind: 'bits', title: 'XOR Result Ready', caption: `Answer = ${acc}.`, bits: toBitArray(acc, 6), active: [], badges: { answer: acc } });
        return steps;
    }

    // =========================================================
    // 12. All Remaining Array / Hashing / Greedy Problems
    // =========================================================
    function genArrayProblem(id, input, problem) {
        const nums = Array.isArray(input.nums) ? input.nums.map(Number) : [];
        if (id === 'contains_duplicate') {
            const seen = new Set();
            let dup = false, dupVal = null;
            for (const x of nums) {
                if (seen.has(x)) { dup = true; dupVal = x; break; }
                seen.add(x);
            }
            const show = nums.slice(0, 14).map(String);
            return [
                { kind: 'array', title: 'Check Duplicates via Hash Set', caption: `Scan [${nums.join(', ')}] checking membership in O(1).`, items: show, pointers: { i: 0 }, active: [0], done: [], badges: { seen: '{}' } },
                { kind: 'array', title: dup ? `Duplicate ${dupVal} Detected!` : 'All Elements Distinct So Far', caption: dup ? `Found repeated element ${dupVal}.` : `Inserted ${seen.size} unique elements.`, items: show, pointers: {}, active: [], done: [], badges: { uniqueCount: seen.size } },
                { kind: 'array', title: 'Contains Duplicate Result', caption: `Result = ${dup}.`, items: show, pointers: {}, active: [], done: show.map((_, i) => i), badges: { answer: dup } }
            ];
        }

        if (id === 'valid_anagram') {
            const s = String(input.s ?? 'anagram'), t = String(input.t ?? 'nagaram');
            const same = s.length === t.length && s.split('').sort().join('') === t.split('').sort().join('');
            const chars = s.slice(0, 14).split('');
            return [
                { kind: 'array', title: 'Count Character Frequencies of s', caption: `s="${s}" (${s.length}), t="${t}" (${t.length}).`, items: chars, pointers: { i: 0 }, active: [0], done: [], badges: { sLen: s.length, tLen: t.length } },
                { kind: 'array', title: 'Subtract Frequencies Using t', caption: `Check if all 26 frequency buckets balance to zero.`, items: t.slice(0, 14).split(''), pointers: {}, active: [], done: [], badges: { sameLength: s.length === t.length } },
                { kind: 'array', title: same ? 'Valid Anagram (true)' : 'Not an Anagram (false)', caption: `"${s}" and "${t}" -> ${same}.`, items: chars, pointers: {}, active: [], done: chars.map((_, i) => i), badges: { answer: same } }
            ];
        }

        if (id === 'majority_element') {
            let cand = null, cnt = 0;
            for (const x of nums) {
                if (cnt === 0) cand = x;
                cnt += (x === cand ? 1 : -1);
            }
            const show = nums.slice(0, 14).map(String);
            return [
                { kind: 'array', title: "Boyer-Moore Majority Vote Init", caption: `Maintain candidate & balance count (+1 match, -1 mismatch).`, items: show, pointers: { i: 0 }, active: [0], done: [], badges: { candidate: nums[0] } },
                { kind: 'array', title: 'Cancel Pairs Across Array', caption: `Surviving candidate = ${cand}.`, items: show, pointers: {}, active: [], done: [], badges: { candidate: cand } },
                { kind: 'array', title: 'Majority Element Found', caption: `Answer = ${cand}.`, items: show, pointers: {}, active: [], done: show.map((_, i) => i), badges: { answer: cand } }
            ];
        }

        if (id === 'longest_common_prefix') {
            const strs = Array.isArray(input.strs) ? input.strs.map(String) : ['flower', 'flow', 'flight'];
            let pref = strs[0] || '';
            for (let i = 1; i < strs.length; i++) {
                while (!strs[i].startsWith(pref)) pref = pref.slice(0, -1);
            }
            return [
                { kind: 'array', title: 'Initialize Prefix from strs[0]', caption: `Start with "${strs[0] || ''}".`, items: strs, pointers: { i: 0 }, active: [0], done: [], badges: { prefix: `"${strs[0] || ''}"` } },
                { kind: 'array', title: 'Shrink Prefix Until Common', caption: `Check each string and trim mismatched suffix characters.`, items: strs, pointers: {}, active: strs.map((_, i) => i), done: [], badges: { commonPrefix: `"${pref}"` } },
                { kind: 'array', title: 'Longest Common Prefix Ready', caption: `LCP = "${pref}"`, items: strs, pointers: {}, active: [], done: strs.map((_, i) => i), badges: { answer: `"${pref}"` } }
            ];
        }

        if (id === 'plus_one') {
            const digits = Array.isArray(input.digits) ? input.digits.map(Number) : [1, 2, 9];
            const out = digits.slice();
            for (let i = out.length - 1; i >= 0; i--) {
                if (out[i] < 9) { out[i]++; break; }
                out[i] = 0;
                if (i === 0) out.unshift(1);
            }
            return [
                { kind: 'array', title: 'Add 1 from Least Significant Digit', caption: `Start at index ${digits.length - 1}.`, items: digits.map(String), pointers: { i: Math.max(0, digits.length - 1) }, active: [Math.max(0, digits.length - 1)], done: [], badges: { carry: 1 } },
                { kind: 'array', title: 'Propagate Carry Across 9s', caption: `Turn trailing 9s into 0 until digit < 9 or prepend 1.`, items: out.map(String), pointers: {}, active: [], done: [], badges: { result: JSON.stringify(out) } },
                { kind: 'array', title: 'Plus One Complete', caption: `Output = [${out.join(', ')}]`, items: out.map(String), pointers: {}, active: [], done: out.map((_, i) => i), badges: { answer: JSON.stringify(out) } }
            ];
        }

        if (id === 'merge_sorted_array') {
            const m = Number(input.m ?? 3), n = Number(input.n ?? 3);
            const n1 = Array.isArray(input.nums1) ? input.nums1.map(Number) : [1, 2, 3, 0, 0, 0];
            const n2 = Array.isArray(input.nums2) ? input.nums2.map(Number) : [2, 5, 6];
            const res = n1.slice(0, m).concat(n2.slice(0, n)).sort((a, b) => a - b);
            return [
                { kind: 'array', title: 'Three-Pointer Reverse Merge Init', caption: `Merge ${m} items in nums1 and ${n} items in nums2 from back.`, items: n1.map(String), pointers: { write: Math.max(0, n1.length - 1) }, active: [Math.max(0, m - 1)], done: [], badges: { m, n } },
                { kind: 'array', title: 'Compare Tails & Place Larger Value', caption: `Place max(nums1[p1], nums2[p2]) at write cursor.`, items: res.map(String), pointers: {}, active: res.map((_, i) => i), done: [], badges: { nums2: JSON.stringify(n2) } },
                { kind: 'array', title: 'In-Place Sorted Merge Complete', caption: `nums1 = [${res.join(', ')}]`, items: res.map(String), pointers: {}, active: [], done: res.map((_, i) => i), badges: { answer: JSON.stringify(res) } }
            ];
        }

        if (id === 'product_of_array_except_self') {
            const n = nums.length;
            const out = Array(n).fill(1);
            let pref = 1;
            for (let i = 0; i < n; i++) { out[i] = pref; pref *= nums[i]; }
            let suf = 1;
            for (let i = n - 1; i >= 0; i--) { out[i] *= suf; suf *= nums[i]; }
            return [
                { kind: 'array', title: 'Left Prefix Products Pass', caption: `Compute product of all elements strictly left of i.`, items: nums.slice(0, 14).map(String), pointers: { i: 0 }, active: [0], done: [], badges: { prefix: 1 } },
                { kind: 'array', title: 'Right Suffix Products Pass', caption: `Multiply running right suffix product into out[i] without division.`, items: out.slice(0, 14).map(String), pointers: {}, active: out.slice(0, 14).map((_, i) => i), done: [], badges: { ans: JSON.stringify(out) } },
                { kind: 'array', title: 'Product Array Ready', caption: `Output = [${out.join(', ')}]`, items: out.slice(0, 14).map(String), pointers: {}, active: [], done: out.slice(0, 14).map((_, i) => i), badges: { answer: JSON.stringify(out) } }
            ];
        }

        if (id === 'subarray_sum_equals_k') {
            const k = Number(input.k ?? 2);
            const map = { 0: 1 };
            let sum = 0, cnt = 0;
            for (const x of nums) {
                sum += x;
                cnt += (map[sum - k] || 0);
                map[sum] = (map[sum] || 0) + 1;
            }
            const show = nums.slice(0, 14).map(String);
            return [
                { kind: 'array', title: `Prefix Sum + Hash Map (k=${k})`, caption: `Track frequency of running prefix sums with {0: 1}.`, items: show, pointers: { i: 0 }, active: [0], done: [], badges: { k, count: 0 } },
                { kind: 'array', title: `Lookup (curSum - ${k}) at Each Step`, caption: `Found ${cnt} matching subarray(s) ending across the scan.`, items: show, pointers: {}, active: show.map((_, i) => i), done: [], badges: { finalSum: sum, count: cnt } },
                { kind: 'array', title: 'Subarray Count Complete', caption: `Total subarrays summing to ${k} = ${cnt}.`, items: show, pointers: {}, active: [], done: show.map((_, i) => i), badges: { answer: cnt } }
            ];
        }

        if (id === 'rotate_array') {
            const n = nums.length;
            const k = n ? (Number(input.k ?? 3) % n) : 0;
            const rotated = n ? nums.slice(n - k).concat(nums.slice(0, n - k)) : [];
            return [
                { kind: 'array', title: `Rotate Right by k=${input.k ?? 3} (mod ${n} = ${k})`, caption: `Input: [${nums.join(', ')}]`, items: nums.slice(0, 14).map(String), pointers: {}, active: [], done: [], badges: { k } },
                { kind: 'array', title: 'Reverse Whole Array, Then Reverse Two Halves', caption: `Reverse [0..n-1], [0..k-1], [k..n-1] in O(1) space.`, items: rotated.slice(0, 14).map(String), pointers: {}, active: rotated.slice(0, 14).map((_, i) => i), done: [], badges: { rotated: JSON.stringify(rotated) } },
                { kind: 'array', title: 'Array Rotated', caption: `Output = [${rotated.join(', ')}]`, items: rotated.slice(0, 14).map(String), pointers: {}, active: [], done: rotated.slice(0, 14).map((_, i) => i), badges: { answer: JSON.stringify(rotated) } }
            ];
        }

        if (id === 'jump_game') {
            let reach = 0, canReach = true;
            for (let i = 0; i < nums.length; i++) {
                if (i > reach) { canReach = false; break; }
                reach = Math.max(reach, i + nums[i]);
            }
            const show = nums.slice(0, 14).map(String);
            return [
                { kind: 'array', title: 'Greedy Farthest Reach Init', caption: `From index 0 can jump up to ${nums[0] || 0}.`, items: show, pointers: { i: 0 }, active: [0], done: [], badges: { reach: nums[0] || 0 } },
                { kind: 'array', title: 'Update Max Reachable Index', caption: `Track max(reach, i + nums[i]) while i <= reach. Max reach = ${reach}.`, items: show, pointers: { reach: Math.min(reach, Math.max(0, show.length - 1)) }, active: show.map((_, i) => i).filter(i => i <= reach), done: [], badges: { reach } },
                { kind: 'array', title: canReach ? 'Last Index Reachable (true)' : 'Stuck Before End (false)', caption: `Reachable = ${canReach}.`, items: show, pointers: {}, active: [], done: canReach ? show.map((_, i) => i) : [], badges: { answer: canReach } }
            ];
        }

        if (id === 'top_k_frequent_elements' || id === 'kth_largest_element' || id === 'longest_consecutive_sequence' || id === 'first_missing_positive' || id === 'candy' || id === 'count_smaller_after_self' || id === 'reverse_pairs' || id === 'group_anagrams') {
            let ans = null;
            if (id === 'top_k_frequent_elements') {
                const k = Number(input.k ?? 2), freq = new Map();
                for (const x of nums) freq.set(x, (freq.get(x) || 0) + 1);
                ans = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, k).map(e => e[0]);
            } else if (id === 'kth_largest_element') {
                const k = Number(input.k ?? 2);
                ans = nums.slice().sort((a, b) => b - a)[k - 1] ?? 0;
            } else if (id === 'longest_consecutive_sequence') {
                const set = new Set(nums);
                let best = 0;
                for (const x of set) if (!set.has(x - 1)) { let y = x; while (set.has(y)) y++; best = Math.max(best, y - x); }
                ans = best;
            } else if (id === 'first_missing_positive') {
                const set = new Set(nums.filter(x => x > 0));
                let miss = 1; while (set.has(miss)) miss++; ans = miss;
            } else if (id === 'candy') {
                const rat = Array.isArray(input.ratings) ? input.ratings.map(Number) : [1, 0, 2];
                const c = Array(rat.length).fill(1);
                for (let i = 1; i < rat.length; i++) if (rat[i] > rat[i - 1]) c[i] = c[i - 1] + 1;
                for (let i = rat.length - 2; i >= 0; i--) if (rat[i] > rat[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);
                ans = c.reduce((a, b) => a + b, 0);
            } else if (id === 'count_smaller_after_self') {
                ans = nums.map((v, i) => { let c = 0; for (let j = i + 1; j < nums.length; j++) if (nums[j] < v) c++; return c; });
            } else if (id === 'reverse_pairs') {
                let c = 0; for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (nums[i] > 2 * nums[j]) c++; ans = c;
            } else if (id === 'group_anagrams') {
                const strs = Array.isArray(input.strs) ? input.strs.map(String) : ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
                const g = new Map();
                for (const s of strs) { const k = s.split('').sort().join(''); if (!g.has(k)) g.set(k, []); g.get(k).push(s); }
                ans = Array.from(g.values());
            }
            const rawItems = (Array.isArray(input.ratings) ? input.ratings : (Array.isArray(input.strs) ? input.strs : nums)).slice(0, 14).map(String);
            const items = rawItems.length ? rawItems : ['empty'];
            const mid = Math.floor(items.length / 2);
            return [
                { kind: 'array', title: `Load Input (${problem.topic})`, caption: `Processing ${items.length} elements.`, items, pointers: { i: 0 }, active: [0], done: [], badges: { n: items.length } },
                { kind: 'array', title: `Apply ${problem.title} Pass`, caption: `Evaluating elements across [0..${items.length - 1}].`, items, pointers: { i: mid }, active: items.slice(0, mid + 1).map((_, k) => k), done: [], badges: { topic: problem.topic } },
                { kind: 'array', title: 'Computation Complete', caption: `Output = ${JSON.stringify(ans)}`, items, pointers: {}, active: [], done: items.map((_, k) => k), badges: { answer: JSON.stringify(ans).slice(0, 60) } }
            ];
        }

        const items = (nums.length ? nums : String(input.s || problem.title).split('')).slice(0, 14).map(String);
        const mid = Math.floor(items.length / 2);
        return [
            { kind: 'array', title: `Load Input (${problem.topic})`, caption: `Target: ${problem.optimalTime || 'O(n)'}.`, items, pointers: { i: 0 }, active: [0], done: [], badges: { n: items.length } },
            { kind: 'array', title: `Process Elements (i=${mid})`, caption: `Maintaining ${problem.topic} invariant.`, items, pointers: { i: mid }, active: items.slice(0, mid + 1).map((_, k) => k), done: [], badges: { topic: problem.topic } },
            { kind: 'array', title: 'Scan Complete', caption: `Processed all ${items.length} element(s).`, items, pointers: {}, active: [], done: items.map((_, k) => k), badges: { done: true } }
        ];
    }

    function genFallbackSteps(problem, input, exp) {
        return [
            { kind: 'array', title: `Initialize ${problem.title}`, caption: `Target ${problem.optimalTime || 'O(n)'}. Input: ${JSON.stringify(input).slice(0, 70)}`, items: ['Input', 'Process', 'Output'], pointers: { step: 0 }, active: [0], done: [], badges: { topic: problem.topic } },
            { kind: 'array', title: 'Apply Core Transition', caption: (problem.description || '').slice(0, 120), items: ['Input', 'Process', 'Output'], pointers: { step: 1 }, active: [1], done: [0], badges: { difficulty: problem.difficulty } },
            { kind: 'array', title: 'Result Ready', caption: exp !== undefined ? `Output: ${JSON.stringify(exp)}` : 'Completed step-through.', items: ['Input', 'Process', 'Output'], pointers: { step: 2 }, active: [2], done: [0, 1, 2], badges: exp !== undefined ? { answer: String(exp) } : { done: true } }
        ];
    }

    // =========================================================
    // Interactive Theme-Adaptive DOM Renderer & Input Editor
    // =========================================================
    function injectStylesOnce() {
        if (typeof document === 'undefined' || document.getElementById('algolearn-pve-styles')) return;
        const style = document.createElement('style');
        style.id = 'algolearn-pve-styles';
        style.textContent = `
            .pve-root {
                display: flex;
                flex-direction: column;
                gap: 0.7rem;
                width: 100%;
                border-radius: 12px;
                padding: 0.9rem;
                background: var(--bg-surface, #0f172a);
                border: 1px solid var(--border-sky, rgba(56, 189, 248, 0.3));
                color: var(--text-primary, #e2e8f0);
            }
            #vis-canvas-container .pve-root {
                background: rgba(15, 23, 42, 0.92);
                border-color: rgba(56, 189, 248, 0.35);
                color: #e2e8f0;
            }
            [data-theme="dark"] .pve-root {
                background: #0f172a;
                border-color: rgba(56, 189, 248, 0.3);
                color: #e2e8f0;
            }
            [data-theme="cyberpunk"] .pve-root {
                background: #050a18;
                border-color: rgba(0, 240, 255, 0.45);
                box-shadow: 0 0 18px rgba(0, 240, 255, 0.14);
                color: #f0fdfa;
            }
            .pve-input-bar {
                display: flex;
                flex-direction: column;
                gap: 0.45rem;
                padding: 0.55rem 0.7rem;
                border-radius: 9px;
                background: rgba(14, 165, 233, 0.08);
                border: 1px solid rgba(56, 189, 248, 0.28);
            }
            #vis-canvas-container .pve-input-bar,
            [data-theme="dark"] .pve-input-bar,
            [data-theme="cyberpunk"] .pve-input-bar {
                background: rgba(2, 6, 23, 0.65);
            }
            .pve-param-row {
                display: flex;
                flex-wrap: wrap;
                gap: 0.45rem;
                align-items: center;
            }
            .pve-param-field {
                display: inline-flex;
                align-items: center;
                gap: 0.3rem;
                flex: 1 1 150px;
                min-width: 0;
            }
            .pve-param-label {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.72rem;
                font-weight: 700;
                color: #38bdf8;
                white-space: nowrap;
            }
            .pve-param-input {
                flex: 1 1 auto;
                min-width: 70px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.74rem;
                padding: 0.22rem 0.45rem;
                border-radius: 6px;
                border: 1px solid rgba(100, 116, 139, 0.45);
                background: rgba(15, 23, 42, 0.85);
                color: #f8fafc;
            }
            .pve-param-input:focus {
                outline: none;
                border-color: #38bdf8;
                box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
            }
            .pve-stage {
                min-height: 170px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 0.75rem;
                border-radius: 10px;
                background: rgba(14, 165, 233, 0.06);
                border: 1px dashed rgba(56, 189, 248, 0.25);
                overflow-x: auto;
            }
            #vis-canvas-container .pve-stage,
            [data-theme="dark"] .pve-stage,
            [data-theme="cyberpunk"] .pve-stage {
                background: rgba(2, 6, 23, 0.65);
            }
            .pve-caption-box {
                padding: 0.65rem 0.85rem;
                border-radius: 8px;
                border-left: 3px solid #0ea5e9;
                background: rgba(14, 165, 233, 0.08);
                font-size: 0.82rem;
            }
            .pve-cell {
                min-width: 40px;
                padding: 0.45rem 0.55rem;
                border-radius: 8px;
                font-family: 'JetBrains Mono', monospace;
                font-weight: 700;
                font-size: 0.82rem;
                text-align: center;
                border: 1.5px solid rgba(100, 116, 139, 0.4);
                background: rgba(148, 163, 184, 0.12);
                transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
            }
            .pve-cell.active {
                border-color: #f59e0b;
                background: rgba(245, 158, 11, 0.22);
                transform: translateY(-3px);
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.28);
            }
            .pve-cell.done { border-color: #10b981; background: rgba(16, 185, 129, 0.22); }
            .pve-cell.dep { border-color: #38bdf8; background: rgba(56, 189, 248, 0.22); }
            .pve-ptr {
                font-size: 0.65rem;
                font-weight: 800;
                padding: 1px 6px;
                border-radius: 999px;
                background: #0284c7;
                color: #fff;
                margin-bottom: 3px;
                font-family: 'JetBrains Mono', monospace;
            }
            .pve-grid-cell {
                min-width: 34px;
                height: 34px;
                padding: 0 5px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                font-family: 'JetBrains Mono', monospace;
                font-weight: 700;
                font-size: 0.76rem;
                border: 1px solid rgba(100, 116, 139, 0.4);
                background: rgba(148, 163, 184, 0.1);
            }
            .pve-grid-cell.active { border-color: #f59e0b; background: rgba(245, 158, 11, 0.34); color: #fff; box-shadow: 0 0 8px rgba(245, 158, 11, 0.35); }
            .pve-grid-cell.visited { border-color: #10b981; background: rgba(16, 185, 129, 0.22); }
            .pve-grid-cell.queen { border-color: #ec4899; background: rgba(236, 72, 153, 0.28); color: #f472b6; }
        `;
        document.head.appendChild(style);
    }

    function renderStageHtml(step) {
        if (!step) return '';
        if (step.kind === 'bars') {
            const vals = step.values || [];
            const water = step.water || [];
            const maxH = Math.max(...vals.map((v, i) => v + (water[i] || 0)), 5);
            const ptrs = step.pointers || {};
            const active = step.active || [];
            const done = step.done || [];
            return `
                <div class="d-flex align-items-end justify-content-center gap-2 py-2" style="min-height:145px;">
                    ${vals.map((v, i) => {
                        const barPx = Math.max(12, Math.round((Math.max(0, v) / maxH) * 95));
                        const watPx = water[i] ? Math.round((water[i] / maxH) * 95) : 0;
                        const tags = Object.entries(ptrs).filter(([, idx]) => idx === i).map(([k]) => k);
                        const color = done.includes(i) ? '#10b981' : (active.includes(i) ? '#f59e0b' : '#0284c7');
                        return `
                            <div class="d-flex flex-column align-items-center" style="min-width:24px;">
                                ${tags.length ? `<div class="pve-ptr">${esc(tags.join(','))}</div>` : '<div style="height:19px;"></div>'}
                                <div class="d-flex flex-column justify-content-end" style="width:22px; height:100px;">
                                    ${watPx > 0 ? `<div style="height:${watPx}px; background:rgba(56,189,248,0.65); border-radius:3px 3px 0 0;" title="Water: ${water[i]}"></div>` : ''}
                                    <div style="height:${barPx}px; background:${color}; border-radius:${watPx > 0 ? '0 0 3px 3px' : '4px 4px 2px 2px'}; transition:height 0.25s ease;"></div>
                                </div>
                                <div class="font-monospace fw-bold mt-1" style="font-size:0.7rem;">${v}</div>
                                <div class="text-muted" style="font-size:0.62rem;">[${i}]</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        if (step.kind === 'array' || step.kind === 'dp1d' || step.kind === 'bits') {
            const arr = step.cells || step.items || step.bits || [];
            const ptrs = step.pointers || {};
            const active = step.active || [];
            const done = step.done || [];
            const deps = step.deps || [];
            return `
                ${step.formula ? `<div class="badge bg-info-subtle text-info border border-info font-monospace mb-3">${esc(step.formula)}</div>` : ''}
                <div class="d-flex flex-wrap align-items-end justify-content-center gap-2">
                    ${arr.map((val, i) => {
                        const tags = Object.entries(ptrs).filter(([, idx]) => idx === i).map(([k]) => k);
                        const cls = done.includes(i) ? 'done' : (active.includes(i) ? 'active' : (deps.includes(i) ? 'dep' : ''));
                        return `
                            <div class="d-flex flex-column align-items-center">
                                ${tags.length ? `<div class="pve-ptr">${esc(tags.join(','))}</div>` : ''}
                                <div class="pve-cell ${cls}">${esc(val)}</div>
                                <div class="text-muted font-monospace mt-1" style="font-size:0.62rem;">${step.kind === 'bits' ? `b${arr.length - 1 - i}` : `[${i}]`}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        if (step.kind === 'stack') {
            const items = step.items || [];
            const st = step.stack || [];
            return `
                <div class="d-flex flex-column gap-3 w-100 align-items-center">
                    <div class="d-flex flex-wrap justify-content-center gap-1">
                        ${items.map((v, i) => `<div class="pve-cell ${step.cursor === i ? 'active' : ''}" style="min-width:34px; padding:0.3rem 0.45rem;">${esc(v)}</div>`).join('')}
                    </div>
                    <div class="d-flex align-items-center gap-2 px-3 py-2 rounded border border-info border-opacity-50 flex-wrap justify-content-center">
                        <span class="small fw-bold text-info font-monospace">STACK / DEQUE:</span>
                        ${st.length === 0 ? '<span class="small text-muted font-monospace">[ empty ]</span>' : st.map((x, i) => `<span class="badge ${i === st.length - 1 ? 'bg-warning text-dark' : 'bg-primary'} font-monospace">${esc(x)}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        if (step.kind === 'grid') {
            const g = step.grid || [];
            const actSet = new Set(step.activeCells || []);
            const visSet = new Set(step.visitedCells || []);
            return `
                <div class="d-flex flex-column gap-1 align-items-center">
                    ${g.map((row, r) => `
                        <div class="d-flex gap-1">
                            ${row.map((cell, c) => {
                                const key = `${r},${c}`;
                                const isQ = cell === 'Q';
                                const cls = isQ ? 'queen' : (actSet.has(key) ? 'active' : (visSet.has(key) ? 'visited' : ''));
                                return `<div class="pve-grid-cell ${cls}">${esc(cell)}</div>`;
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (step.kind === 'linked_list') {
            const nodes = step.nodes || [];
            const ptrs = step.pointers || {};
            const active = step.active || [];
            const revCnt = step.reversedCount || 0;
            return `
                <div class="d-flex flex-wrap align-items-center justify-content-center gap-2 py-2">
                    ${nodes.length === 0 ? '<span class="badge bg-dark border border-secondary text-muted font-monospace py-2 px-3">null</span>' : nodes.map((v, i) => {
                        const tags = Object.entries(ptrs).filter(([, idx]) => idx === i).map(([k]) => k);
                        const arrow = i < nodes.length - 1 ? (i < revCnt - 1 ? '&larr;' : '&rarr;') : (step.cycleTarget >= 0 ? `&#8634; idx ${step.cycleTarget}` : '&rarr; null');
                        return `
                            <div class="d-flex align-items-center gap-1">
                                <div class="d-flex flex-column align-items-center">
                                    ${tags.length ? `<div class="pve-ptr">${esc(tags.join(','))}</div>` : '<div style="height:19px;"></div>'}
                                    <div class="pve-cell ${active.includes(i) ? 'active' : (i < revCnt ? 'done' : '')}" style="min-width:44px;">${esc(v)}</div>
                                </div>
                                <span class="font-monospace fw-bold text-info small">${arrow}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        if (step.kind === 'tree') {
            const nodes = step.nodes || [];
            const act = new Set(step.active || []);
            const done = new Set(step.done || []);
            const coords = {};
            const W = 380, H = 175;
            const maxIdx = Math.min(nodes.length, 15);
            for (let i = 0; i < maxIdx; i++) {
                if (nodes[i] === null || nodes[i] === undefined) continue;
                const lvl = Math.floor(Math.log2(i + 1));
                const posInLvl = i - (Math.pow(2, lvl) - 1);
                const totalInLvl = Math.pow(2, lvl);
                coords[i] = {
                    x: ((posInLvl + 0.5) / totalInLvl) * (W - 30) + 15,
                    y: 26 + lvl * 42
                };
            }
            let svg = '';
            for (const [idxStr, pt] of Object.entries(coords)) {
                const idx = Number(idxStr);
                const parent = Math.floor((idx - 1) / 2);
                if (idx > 0 && coords[parent]) {
                    svg += `<line x1="${coords[parent].x}" y1="${coords[parent].y}" x2="${pt.x}" y2="${pt.y}" stroke="#64748b" stroke-width="2" />`;
                }
            }
            for (const [idxStr, pt] of Object.entries(coords)) {
                const idx = Number(idxStr);
                const fill = done.has(idx) ? '#10b981' : (act.has(idx) ? '#f59e0b' : '#0284c7');
                svg += `
                    <circle cx="${pt.x}" cy="${pt.y}" r="14" fill="${fill}" stroke="#ffffff" stroke-width="2" />
                    <text x="${pt.x}" y="${pt.y + 4}" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700" font-family="monospace">${esc(nodes[idx])}</text>
                `;
            }
            return `<svg viewBox="0 0 ${W} ${H}" style="width:100%; max-width:380px; height:170px;">${svg || `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" fill="#94a3b8" font-size="12" font-family="monospace">(empty tree)</text>`}</svg>`;
        }

        if (step.kind === 'graph') {
            const nodes = step.nodes || [];
            const edges = step.edges || [];
            const visited = new Set(step.visited || []);
            const queue = new Set(step.queue || []);
            const n = Math.max(nodes.length, 1);
            const W = 360, H = 165, cx = W / 2, cy = H / 2, R = 56;
            const pos = nodes.map((_, i) => {
                const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
                return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
            });
            let svg = '';
            for (const [u, v] of edges) {
                if (pos[u] && pos[v]) {
                    svg += `<line x1="${pos[u].x}" y1="${pos[u].y}" x2="${pos[v].x}" y2="${pos[v].y}" stroke="#38bdf8" stroke-width="2" opacity="0.65" />`;
                }
            }
            nodes.forEach((lbl, i) => {
                const fill = visited.has(lbl) ? '#10b981' : (queue.has(lbl) ? '#f59e0b' : '#334155');
                svg += `
                    <circle cx="${pos[i].x}" cy="${pos[i].y}" r="16" fill="${fill}" stroke="#ffffff" stroke-width="1.8" />
                    <text x="${pos[i].x}" y="${pos[i].y + 4}" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="700" font-family="monospace">${esc(lbl)}</text>
                `;
            });
            return `
                <svg viewBox="0 0 ${W} ${H}" style="width:100%; max-width:360px; height:155px;">${svg}</svg>
                <div class="small font-monospace text-info mt-1">Queue: [${esc((step.queue || []).join(', '))}] | Visited: [${esc((step.visited || []).join(', '))}]</div>
            `;
        }

        if (step.kind === 'intervals') {
            const ivs = step.intervals || [];
            const act = new Set(step.active || []);
            let minV = Infinity, maxV = -Infinity;
            ivs.forEach(([s, e]) => { minV = Math.min(minV, s); maxV = Math.max(maxV, e); });
            if (!Number.isFinite(minV)) { minV = 0; maxV = 10; }
            const span = Math.max(maxV - minV, 1);
            return `
                <div class="d-flex flex-column gap-2 w-100 px-2">
                    ${ivs.map(([s, e], idx) => {
                        const leftPct = ((s - minV) / span) * 85;
                        const widthPct = Math.max(10, ((e - s) / span) * 85);
                        return `
                            <div class="position-relative rounded" style="height:24px; background:rgba(100,116,139,0.16);">
                                <div class="position-absolute top-0 bottom-0 rounded d-flex align-items-center justify-content-center text-white font-monospace fw-bold"
                                     style="left:${leftPct.toFixed(1)}%; width:${widthPct.toFixed(1)}%; font-size:0.7rem; background:${act.has(idx) ? '#f59e0b' : '#0284c7'};">
                                    [${s}, ${e}]
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        if (step.kind === 'search_range') {
            return `
                <div class="d-flex flex-wrap gap-3 justify-content-center align-items-center py-3 font-monospace">
                    <div class="pve-cell">low = ${step.low}</div>
                    <div class="pve-cell active">mid = ${step.mid}</div>
                    <div class="pve-cell">high = ${step.high}</div>
                    <div class="pve-cell done">target = ${step.target}</div>
                </div>
            `;
        }

        return '';
    }

    function parseParamText(raw, templateVal, expectedType) {
        const str = String(raw ?? '').trim();
        if (expectedType === 'string' || typeof templateVal === 'string') {
            if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
                return str.slice(1, -1);
            }
            return str;
        }
        if (expectedType === 'int' || expectedType === 'double' || typeof templateVal === 'number') {
            const n = Number(str);
            if (!Number.isFinite(n) || str === '') throw new Error(`Expected valid number, got "${str}"`);
            return n;
        }
        if (expectedType === 'bool' || typeof templateVal === 'boolean') {
            if (/^(true|1)$/i.test(str)) return true;
            if (/^(false|0)$/i.test(str)) return false;
            throw new Error(`Expected true/false, got "${str}"`);
        }
        // Array / Matrix / Generic JSON / Python literal
        const norm = str
            .replace(/\bNone\b/g, 'null')
            .replace(/\bTrue\b/g, 'true')
            .replace(/\bFalse\b/g, 'false')
            .replace(/'([^']*)'/g, '"$1"');
        return JSON.parse(norm);
    }

    function formatParamText(val, expectedType) {
        if (expectedType === 'string' || typeof val === 'string') return String(val ?? '');
        if (typeof val === 'number' || typeof val === 'boolean') return String(val);
        return JSON.stringify(val ?? null);
    }

    function mount(containerEl, problem, options = {}) {
        if (!containerEl || !problem) return null;
        injectStylesOnce();

        const defaultInput = parseSampleInput(problem);
        const presets = getPresets(problem);
        let activeInput = clone(options.initialInput || defaultInput);
        let steps = generateSteps(problem, activeInput);
        let idx = 0;
        let timer = null;
        let delayMs = options.delayMs || 950;

        containerEl.innerHTML = '';
        const rootEl = document.createElement('div');
        rootEl.className = 'pve-root';
        const diffCls = problem.difficulty === 'Easy' ? 'bg-success text-white' : (problem.difficulty === 'Medium' ? 'bg-warning text-dark' : 'bg-danger text-white');
        const lcTag = problem.leetcodeId ? `LC #${problem.leetcodeId}` : '';

        const paramOrder = (problem.io && Array.isArray(problem.io.params) && problem.io.params.length)
            ? problem.io.params.map(pm => ({ name: pm.name, type: pm.type }))
            : Object.keys(activeInput).map(k => ({ name: k, type: null }));
        // Append any extra input keys (e.g. pos for linked_list_cycle)
        for (const k of Object.keys(activeInput)) {
            if (!paramOrder.some(pm => pm.name === k)) paramOrder.push({ name: k, type: null });
        }

        const paramInputsHtml = paramOrder.map(pm => `
            <div class="pve-param-field">
                <label class="pve-param-label" for="pve-in-${esc(pm.name)}">${esc(pm.name)} =</label>
                <input type="text" class="pve-param-input" id="pve-in-${esc(pm.name)}" data-param="${esc(pm.name)}" data-ptype="${esc(pm.type || '')}" value="${esc(formatParamText(activeInput[pm.name], pm.type))}" />
            </div>
        `).join('');

        const presetOptionsHtml = presets.length > 0
            ? `<select id="pve-preset-select" class="form-select form-select-sm py-0" style="width:auto; font-size:0.72rem;" title="Load test preset">
                   ${presets.map((pr, i) => `<option value="${i}">${esc(pr.name)}</option>`).join('')}
                   <option value="custom">Custom Input</option>
               </select>`
            : '';

        rootEl.innerHTML = `
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <span class="badge bg-info text-dark font-monospace">${esc(lcTag)}</span>
                    <strong class="small">${esc(problem.title)}</strong>
                    <span class="badge ${diffCls}" style="font-size:0.66rem;">${esc(problem.difficulty)}</span>
                    <span class="badge bg-secondary" style="font-size:0.66rem;">${esc(problem.vis?.type || 'algo')}</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-dark border border-info text-info font-monospace" id="pve-step-pill">Step 1 / ${steps.length}</span>
                    ${options.showStudioLink && problem.vis?.studio ? `<a href="${esc(problem.vis.studio)}" class="btn btn-xs btn-outline-info py-0 px-2" style="font-size:0.7rem;" target="_blank" rel="noopener">Full Studio <i class="bi bi-box-arrow-up-right ms-1"></i></a>` : ''}
                </div>
            </div>
            ${paramOrder.length > 0 ? `
                <div class="pve-input-bar">
                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <span class="font-monospace fw-bold text-info" style="font-size:0.7rem;"><i class="bi bi-sliders2 me-1"></i>LIVE INPUT (Edit &amp; Apply to recompute)</span>
                        <div class="d-flex align-items-center gap-1 flex-wrap">
                            ${presetOptionsHtml}
                            <button type="button" id="pve-apply-input" class="btn btn-xs btn-info text-dark fw-bold py-0 px-2" style="font-size:0.72rem;"><i class="bi bi-check2 me-1"></i>Apply</button>
                            <button type="button" id="pve-reset-input" class="btn btn-xs btn-outline-secondary py-0 px-2" style="font-size:0.72rem;" title="Reset to default sample input">Reset</button>
                            ${typeof options.onRunWithInput === 'function' ? `<button type="button" id="pve-debug-input" class="btn btn-xs btn-warning text-dark fw-bold py-0 px-2" style="font-size:0.72rem;" title="Run live debugger trace with this input"><i class="bi bi-bug-fill me-1"></i>Debug Input</button>` : ''}
                        </div>
                    </div>
                    <div class="pve-param-row">${paramInputsHtml}</div>
                    <div id="pve-input-error" class="small text-danger font-monospace d-none" style="font-size:0.7rem;"></div>
                </div>
            ` : ''}
            <div class="pve-stage" id="pve-stage"></div>
            <div class="pve-caption-box">
                <div class="fw-bold mb-1" id="pve-step-title"></div>
                <div id="pve-step-caption" class="opacity-90"></div>
                <div id="pve-badges" class="d-flex flex-wrap gap-1 mt-2"></div>
            </div>
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div class="d-flex align-items-center gap-1">
                    <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" id="pve-prev" title="Previous step"><i class="bi bi-skip-backward-fill"></i></button>
                    <button type="button" class="btn btn-sm btn-primary py-0 px-3 fw-bold" id="pve-play"><i class="bi bi-play-fill"></i> Play</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" id="pve-next" title="Next step"><i class="bi bi-skip-forward-fill"></i></button>
                    <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" id="pve-reset" title="Reset steps"><i class="bi bi-arrow-counterclockwise"></i></button>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="small opacity-75">Speed:</span>
                    <select id="pve-speed" class="form-select form-select-sm py-0" style="width:auto; font-size:0.74rem;">
                        <option value="1400">0.7x</option>
                        <option value="950" selected>1x</option>
                        <option value="480">2x</option>
                    </select>
                </div>
            </div>
        `;
        containerEl.appendChild(rootEl);

        const stageEl = rootEl.querySelector('#pve-stage');
        const pillEl = rootEl.querySelector('#pve-step-pill');
        const titleEl = rootEl.querySelector('#pve-step-title');
        const capEl = rootEl.querySelector('#pve-step-caption');
        const badgesEl = rootEl.querySelector('#pve-badges');
        const playBtn = rootEl.querySelector('#pve-play');
        const errEl = rootEl.querySelector('#pve-input-error');
        const presetSel = rootEl.querySelector('#pve-preset-select');

        function stop() {
            if (timer) { clearInterval(timer); timer = null; }
            if (playBtn) playBtn.innerHTML = '<i class="bi bi-play-fill"></i> Play';
        }

        function render() {
            const st = steps[idx] || steps[0];
            if (pillEl) pillEl.textContent = `Step ${idx + 1} / ${steps.length}`;
            if (titleEl) titleEl.textContent = st.title || '';
            if (capEl) capEl.textContent = st.caption || '';
            if (stageEl) stageEl.innerHTML = renderStageHtml(st);
            if (badgesEl) {
                const entries = Object.entries(st.badges || {});
                badgesEl.innerHTML = entries.map(([k, v]) =>
                    `<span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 font-monospace" style="font-size:0.68rem;">${esc(k)}: ${esc(v)}</span>`
                ).join('');
            }
        }

        function syncInputsFromState() {
            rootEl.querySelectorAll('.pve-param-input').forEach(inp => {
                const k = inp.getAttribute('data-param');
                const pt = inp.getAttribute('data-ptype');
                inp.value = formatParamText(activeInput[k], pt);
            });
        }

        function setInput(newInput, notify = true) {
            stop();
            activeInput = clone(newInput);
            steps = generateSteps(problem, activeInput);
            idx = 0;
            if (errEl) errEl.classList.add('d-none');
            syncInputsFromState();
            render();
            if (notify && typeof options.onInputChange === 'function') {
                options.onInputChange(clone(activeInput));
            }
        }

        function applyEditedInputs() {
            const parsed = {};
            try {
                rootEl.querySelectorAll('.pve-param-input').forEach(inp => {
                    const k = inp.getAttribute('data-param');
                    const pt = inp.getAttribute('data-ptype');
                    parsed[k] = parseParamText(inp.value, defaultInput[k], pt);
                });
                if (presetSel) presetSel.value = 'custom';
                setInput(parsed, true);
                return true;
            } catch (err) {
                if (errEl) {
                    errEl.textContent = `Invalid input: ${err.message}`;
                    errEl.classList.remove('d-none');
                }
                return false;
            }
        }

        presetSel?.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'custom') return;
            const pIdx = Number(val);
            if (presets[pIdx]) setInput(presets[pIdx].input, true);
        });
        rootEl.querySelector('#pve-apply-input')?.addEventListener('click', applyEditedInputs);
        rootEl.querySelector('#pve-reset-input')?.addEventListener('click', () => {
            if (presetSel && presets.length > 0) presetSel.value = '0';
            setInput(defaultInput, true);
        });
        rootEl.querySelector('#pve-debug-input')?.addEventListener('click', () => {
            if (applyEditedInputs() && typeof options.onRunWithInput === 'function') {
                options.onRunWithInput(clone(activeInput));
            }
        });
        rootEl.querySelectorAll('.pve-param-input').forEach(inp => {
            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    applyEditedInputs();
                } else if (presetSel) {
                    presetSel.value = 'custom';
                }
            });
        });

        rootEl.querySelector('#pve-prev')?.addEventListener('click', () => { stop(); idx = Math.max(0, idx - 1); render(); });
        rootEl.querySelector('#pve-next')?.addEventListener('click', () => { stop(); idx = Math.min(steps.length - 1, idx + 1); render(); });
        rootEl.querySelector('#pve-reset')?.addEventListener('click', () => { stop(); idx = 0; render(); });
        playBtn?.addEventListener('click', () => {
            if (timer) { stop(); return; }
            if (idx >= steps.length - 1) idx = 0;
            playBtn.innerHTML = '<i class="bi bi-pause-fill"></i> Pause';
            timer = setInterval(() => {
                if (idx < steps.length - 1) { idx++; render(); }
                else stop();
            }, delayMs);
        });
        rootEl.querySelector('#pve-speed')?.addEventListener('change', (e) => {
            delayMs = Number(e.target.value) || 950;
            if (timer) { stop(); playBtn.click(); }
        });

        render();
        return {
            steps,
            getInput: () => clone(activeInput),
            setInput: (inp) => setInput(inp, false),
            destroy: stop,
            next: () => { idx = Math.min(steps.length - 1, idx + 1); render(); }
        };
    }

    const engine = { generateSteps, mount, renderStageHtml, parseSampleInput };
    if (typeof window !== 'undefined') window.ProblemVisualizerEngine = engine;
    if (typeof module !== 'undefined' && module.exports) module.exports = { ProblemVisualizerEngine: engine };
})(typeof window !== 'undefined' ? window : globalThis);
