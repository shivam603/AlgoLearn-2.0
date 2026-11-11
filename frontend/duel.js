/**
 * AlgoLearn Algorithm Duel & Multi-Race Engine
 * Runs 2 to 4 sorting algorithms concurrently with step generators on identical arrays.
 */

const DuelArena = {
    racers: [],
    baseArray: [],
    isRunning: false,
    timerInterval: null,
    startTime: 0,
    racerConfigs: [
        { id: 0, algo: 'quick', name: 'Quick Sort', color: '#0ea5e9' },
        { id: 1, algo: 'merge', name: 'Merge Sort', color: '#8b5cf6' },
        { id: 2, algo: 'insertion', name: 'Insertion Sort', color: '#10b981' },
        { id: 3, algo: 'bubble', name: 'Bubble Sort', color: '#f59e0b' }
    ],

    init() {
        this.bindControls();
        this.generateDataset();
        this.setupRacers();
        this.renderLeaderboard();
    },

    bindControls() {
        const countSelect = document.getElementById('duel-grid-count');
        const sizeSlider = document.getElementById('duel-size-slider');
        const sizeVal = document.getElementById('duel-size-val');
        const presetSelect = document.getElementById('duel-preset');
        const startBtn = document.getElementById('btn-duel-start');
        const resetBtn = document.getElementById('btn-duel-reset');

        if (countSelect) {
            countSelect.addEventListener('change', () => {
                this.setupRacers();
            });
        }

        if (sizeSlider && sizeVal) {
            sizeSlider.addEventListener('input', (e) => {
                sizeVal.textContent = e.target.value;
                this.generateDataset();
                this.setupRacers();
            });
        }

        if (presetSelect) {
            presetSelect.addEventListener('change', () => {
                this.generateDataset();
                this.setupRacers();
            });
        }

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (this.isRunning) return;
                this.startDuel();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetDuel();
            });
        }
    },

    generateDataset() {
        const size = parseInt(document.getElementById('duel-size-slider')?.value || '30', 10);
        const preset = document.getElementById('duel-preset')?.value || 'random';
        const arr = [];

        if (preset === 'nearly_sorted') {
            for (let i = 1; i <= size; i++) arr.push(Math.round((i / size) * 160) + 15);
            for (let k = 0; k < Math.max(2, Math.floor(size / 10)); k++) {
                const a = Math.floor(Math.random() * size);
                const b = Math.floor(Math.random() * size);
                const t = arr[a]; arr[a] = arr[b]; arr[b] = t;
            }
        } else if (preset === 'reversed') {
            for (let i = size; i >= 1; i--) arr.push(Math.round((i / size) * 160) + 15);
        } else if (preset === 'few_unique') {
            const pool = [25, 65, 110, 155];
            for (let i = 0; i < size; i++) arr.push(pool[Math.floor(Math.random() * pool.length)]);
        } else {
            for (let i = 0; i < size; i++) arr.push(Math.floor(Math.random() * 160) + 15);
        }

        this.baseArray = arr;
    },

    setupRacers() {
        const count = parseInt(document.getElementById('duel-grid-count')?.value || '4', 10);
        const container = document.getElementById('duel-racers-container');
        if (!container) return;

        container.innerHTML = '';
        this.racers = [];

        for (let i = 0; i < count; i++) {
            const config = this.racerConfigs[i];
            const racer = {
                id: i,
                algo: config.algo,
                name: config.name,
                array: [...this.baseArray],
                comparisons: 0,
                swaps: 0,
                status: 'Ready',
                rank: null,
                durationMs: 0,
                generator: null,
                isFinished: false,
                activeA: -1,
                activeB: -1
            };

            this.racers.push(racer);

            const card = document.createElement('div');
            card.className = 'duel-racer-card';
            card.id = `duel-racer-${i}`;
            card.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <select class="form-select form-select-sm fw-bold border-0 bg-transparent text-sky-900" style="width: auto;" onchange="DuelArena.changeRacerAlgo(${i}, this.value)">
                        <option value="quick" ${config.algo === 'quick' ? 'selected' : ''}>⚡ Quick Sort</option>
                        <option value="merge" ${config.algo === 'merge' ? 'selected' : ''}>🔀 Merge Sort</option>
                        <option value="heap" ${config.algo === 'heap' ? 'selected' : ''}>🌳 Heap Sort</option>
                        <option value="insertion" ${config.algo === 'insertion' ? 'selected' : ''}>📥 Insertion Sort</option>
                        <option value="selection" ${config.algo === 'selection' ? 'selected' : ''}>🔍 Selection Sort</option>
                        <option value="bubble" ${config.algo === 'bubble' ? 'selected' : ''}>🫧 Bubble Sort</option>
                    </select>
                    <span class="badge bg-secondary racer-status-badge" id="racer-status-${i}">Ready</span>
                </div>
                <div class="duel-canvas-mini" id="duel-canvas-${i}"></div>
                <div class="d-flex justify-content-between text-muted-custom small mt-1" style="font-size:0.75rem;">
                    <span>Compares: <strong id="racer-comp-${i}" class="text-dark">0</strong></span>
                    <span>Swaps: <strong id="racer-swap-${i}" class="text-dark">0</strong></span>
                    <span>Time: <strong id="racer-time-${i}" class="text-dark">0ms</strong></span>
                </div>
            `;
            container.appendChild(card);
            this.renderRacerBars(racer);
        }

        this.renderLeaderboard();
    },

    changeRacerAlgo(racerIdx, algoKey) {
        if (this.isRunning || !this.racers[racerIdx]) return;
        const names = {
            quick: 'Quick Sort',
            merge: 'Merge Sort',
            heap: 'Heap Sort',
            insertion: 'Insertion Sort',
            selection: 'Selection Sort',
            bubble: 'Bubble Sort'
        };
        this.racers[racerIdx].algo = algoKey;
        this.racers[racerIdx].name = names[algoKey] || algoKey;
        this.racerConfigs[racerIdx].algo = algoKey;
        this.racerConfigs[racerIdx].name = this.racers[racerIdx].name;
        this.renderLeaderboard();
    },

    renderRacerBars(racer) {
        const canvas = document.getElementById(`duel-canvas-${racer.id}`);
        if (!canvas) return;

        canvas.innerHTML = '';
        const maxVal = Math.max(...this.baseArray, 180);
        racer.array.forEach((val, idx) => {
            const bar = document.createElement('div');
            bar.className = 'duel-bar-mini';
            bar.style.height = `${(val / maxVal) * 100}%`;

            if (racer.isFinished) {
                bar.style.background = '#10b981';
            } else if (idx === racer.activeA || idx === racer.activeB) {
                bar.style.background = '#f59e0b';
            } else {
                bar.style.background = '#0284c7';
            }
            canvas.appendChild(bar);
        });
    },

    // Step Generators for each algorithm
    *createBubbleGenerator(arr, racer) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                racer.activeA = j;
                racer.activeB = j + 1;
                racer.comparisons++;
                yield;
                if (arr[j] > arr[j + 1]) {
                    const temp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = temp;
                    racer.swaps++;
                    yield;
                }
            }
        }
    },

    *createSelectionGenerator(arr, racer) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                racer.activeA = j;
                racer.activeB = minIdx;
                racer.comparisons++;
                if (arr[j] < arr[minIdx]) minIdx = j;
                yield;
            }
            if (minIdx !== i) {
                const temp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = temp;
                racer.swaps++;
                yield;
            }
        }
    },

    *createInsertionGenerator(arr, racer) {
        const n = arr.length;
        for (let i = 1; i < n; i++) {
            const key = arr[i];
            let j = i - 1;
            while (j >= 0) {
                racer.activeA = j;
                racer.activeB = j + 1;
                racer.comparisons++;
                yield;
                if (arr[j] > key) {
                    arr[j + 1] = arr[j];
                    racer.swaps++;
                    j--;
                    yield;
                } else {
                    break;
                }
            }
            arr[j + 1] = key;
            racer.swaps++;
            yield;
        }
    },

    *createQuickGenerator(arr, racer) {
        function* partition(low, high) {
            const pivot = arr[high];
            let i = low - 1;
            for (let j = low; j < high; j++) {
                racer.activeA = j;
                racer.activeB = high;
                racer.comparisons++;
                yield;
                if (arr[j] < pivot) {
                    i++;
                    const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
                    racer.swaps++;
                    yield;
                }
            }
            const temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
            racer.swaps++;
            yield;
            return i + 1;
        }

        function* qsort(low, high) {
            if (low < high) {
                const piGen = partition(low, high);
                let piResult = piGen.next();
                while (!piResult.done) {
                    yield;
                    piResult = piGen.next();
                }
                const pi = piResult.value;
                yield* qsort(low, pi - 1);
                yield* qsort(pi + 1, high);
            }
        }

        yield* qsort(0, arr.length - 1);
    },

    *createMergeGenerator(arr, racer) {
        function* merge(l, m, r) {
            const left = arr.slice(l, m + 1);
            const right = arr.slice(m + 1, r + 1);
            let i = 0, j = 0, k = l;

            while (i < left.length && j < right.length) {
                racer.activeA = k;
                racer.activeB = m + 1 + j;
                racer.comparisons++;
                yield;
                if (left[i] <= right[j]) {
                    arr[k] = left[i];
                    i++;
                } else {
                    arr[k] = right[j];
                    j++;
                }
                racer.swaps++;
                k++;
                yield;
            }

            while (i < left.length) {
                arr[k++] = left[i++];
                racer.swaps++;
                yield;
            }
            while (j < right.length) {
                arr[k++] = right[j++];
                racer.swaps++;
                yield;
            }
        }

        function* msort(l, r) {
            if (l < r) {
                const m = Math.floor((l + r) / 2);
                yield* msort(l, m);
                yield* msort(m + 1, r);
                yield* merge(l, m, r);
            }
        }

        yield* msort(0, arr.length - 1);
    },

    *createHeapGenerator(arr, racer) {
        function* heapify(n, i) {
            let largest = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;

            if (l < n) {
                racer.activeA = l;
                racer.activeB = largest;
                racer.comparisons++;
                yield;
                if (arr[l] > arr[largest]) largest = l;
            }
            if (r < n) {
                racer.activeA = r;
                racer.activeB = largest;
                racer.comparisons++;
                yield;
                if (arr[r] > arr[largest]) largest = r;
            }

            if (largest !== i) {
                const temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;
                racer.swaps++;
                yield;
                yield* heapify(n, largest);
            }
        }

        const n = arr.length;
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            yield* heapify(n, i);
        }
        for (let i = n - 1; i > 0; i--) {
            const temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
            racer.swaps++;
            yield;
            yield* heapify(i, 0);
        }
    },

    startDuel() {
        this.isRunning = true;
        this.startTime = Date.now();
        let finishedCount = 0;
        let currentRank = 1;

        const badge = document.getElementById('duel-status-badge');
        const startBtn = document.getElementById('btn-duel-start');
        if (badge) {
            badge.className = 'badge bg-warning text-dark';
            badge.innerHTML = '<i class="bi bi-hourglass-split"></i> Race in Progress...';
        }
        if (startBtn) startBtn.disabled = true;

        // Initialize generators
        this.racers.forEach(r => {
            r.array = [...this.baseArray];
            r.comparisons = 0;
            r.swaps = 0;
            r.isFinished = false;
            r.status = 'Racing 🏎️';
            r.rank = null;
            r.durationMs = 0;

            if (r.algo === 'quick') r.generator = this.createQuickGenerator(r.array, r);
            else if (r.algo === 'merge') r.generator = this.createMergeGenerator(r.array, r);
            else if (r.algo === 'heap') r.generator = this.createHeapGenerator(r.array, r);
            else if (r.algo === 'insertion') r.generator = this.createInsertionGenerator(r.array, r);
            else if (r.algo === 'selection') r.generator = this.createSelectionGenerator(r.array, r);
            else r.generator = this.createBubbleGenerator(r.array, r);
        });

        const tick = () => {
            if (!this.isRunning) return;

            const now = Date.now();
            let anyRunning = false;

            this.racers.forEach(r => {
                if (r.isFinished) return;
                anyRunning = true;

                // Step multiple operations per tick for smooth racing
                for (let step = 0; step < 2; step++) {
                    const result = r.generator.next();
                    if (result.done) {
                        r.isFinished = true;
                        r.activeA = -1;
                        r.activeB = -1;
                        r.durationMs = now - this.startTime;
                        r.rank = currentRank++;
                        r.status = `Finished #${r.rank} 🏆`;
                        finishedCount++;
                        break;
                    }
                }

                if (!r.isFinished) {
                    r.durationMs = now - this.startTime;
                }

                // Update racer UI
                const compEl = document.getElementById(`racer-comp-${r.id}`);
                const swapEl = document.getElementById(`racer-swap-${r.id}`);
                const timeEl = document.getElementById(`racer-time-${r.id}`);
                const statusBadge = document.getElementById(`racer-status-${r.id}`);

                if (compEl) compEl.textContent = r.comparisons;
                if (swapEl) swapEl.textContent = r.swaps;
                if (timeEl) timeEl.textContent = `${r.durationMs}ms`;
                if (statusBadge) {
                    statusBadge.textContent = r.status;
                    statusBadge.className = r.isFinished ? 'badge bg-success' : 'badge bg-primary';
                }

                this.renderRacerBars(r);
            });

            this.renderLeaderboard();

            if (anyRunning) {
                requestAnimationFrame(tick);
            } else {
                this.finishDuel();
            }
        };

        requestAnimationFrame(tick);
    },

    finishDuel() {
        this.isRunning = false;
        const badge = document.getElementById('duel-status-badge');
        const startBtn = document.getElementById('btn-duel-start');
        if (badge) {
            badge.className = 'badge bg-success';
            badge.innerHTML = '<i class="bi bi-check-circle-fill"></i> Duel Completed!';
        }
        if (startBtn) startBtn.disabled = false;
        if (window.AlgoAudio) {
            window.AlgoAudio.playTone(600, 0.15, 'sine');
            setTimeout(() => window.AlgoAudio.playTone(800, 0.2, 'triangle'), 120);
        }
    },

    resetDuel() {
        this.isRunning = false;
        const startBtn = document.getElementById('btn-duel-start');
        const badge = document.getElementById('duel-status-badge');
        if (startBtn) startBtn.disabled = false;
        if (badge) {
            badge.className = 'badge bg-secondary';
            badge.textContent = 'Ready for Duel';
        }
        this.generateDataset();
        this.setupRacers();
    },

    renderLeaderboard() {
        const body = document.getElementById('duel-leaderboard-body');
        if (!body) return;

        const sorted = [...this.racers].sort((a, b) => {
            if (a.rank && b.rank) return a.rank - b.rank;
            if (a.rank) return -1;
            if (b.rank) return 1;
            return a.comparisons + a.swaps - (b.comparisons + b.swaps);
        });

        body.innerHTML = '';
        sorted.forEach((r, idx) => {
            const rankLabel = r.rank ? `#${r.rank}` : `—`;
            const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : '';
            const totalOps = r.comparisons + r.swaps;
            const efficiency = totalOps === 0 ? '—' : totalOps < 200 ? '⭐⭐⭐⭐⭐ High' : totalOps < 600 ? '⭐⭐⭐⭐ Good' : '⭐⭐ Moderate';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="fw-bold">${medal} ${rankLabel}</td>
                <td class="fw-semibold text-sky-900">${r.name}</td>
                <td><span class="badge ${r.isFinished ? 'bg-success' : this.isRunning ? 'bg-primary' : 'bg-secondary'}">${r.status}</span></td>
                <td>${r.durationMs} ms</td>
                <td>${r.comparisons.toLocaleString()}</td>
                <td>${r.swaps.toLocaleString()}</td>
                <td><span class="badge-sky">${efficiency}</span></td>
            `;
            body.appendChild(row);
        });
    }
};

/**
 * AlgoLearn Live 1v1 Multiplayer Coding Duel Client (Socket.IO)
 * Connects to /socket.io, manages lobby/room codes, AlgoBot sparring,
 * live opponent progress telemetry, and server-authoritative judge verdicts.
 */
const LiveDuelClient = {
    socket: null,
    problems: [],
    difficultyFilter: 'All',
    pendingUrlProblem: null,
    lobbyVisInstance: null,
    arenaVisInstance: null,
    currentRoom: null,
    currentLang: 'python',
    playerId: '',
    drafts: {},
    timerInterval: null,
    lastProgressSentAt: 0,

    getPlayerId() {
        if (this.playerId) return this.playerId;
        try {
            let pid = sessionStorage.getItem('algolearn_duel_pid');
            if (!pid) {
                pid = 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
                sessionStorage.setItem('algolearn_duel_pid', pid);
            }
            this.playerId = pid;
            return pid;
        } catch (e) {
            this.playerId = 'p_' + Math.random().toString(36).slice(2, 10);
            return this.playerId;
        }
    },

    SKELETONS: {
        two_sum: {
            python: `def two_sum(nums, target):\n    # Return indices [i, j] such that nums[i] + nums[j] == target\n    pass`,
            javascript: `function twoSum(nums, target) {\n    // Return [i, j] such that nums[i] + nums[j] === target\n    \n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}`,
            cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};`,
            c: `void twoSum(const int* nums, int n, int target, int* outIdx) {\n    // Store answer indices in outIdx[0] and outIdx[1]\n    outIdx[0] = 0; outIdx[1] = 1;\n}`
        },
        valid_parentheses: {
            python: `def is_valid(s):\n    # Return True if brackets in s are balanced\n    pass`,
            javascript: `function isValid(s) {\n    // Return true if brackets in s are balanced\n    \n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}`,
            cpp: `#include <string>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};`,
            c: `int isValid(const char* s) {\n    // Return 1 if balanced, 0 otherwise\n    return 0;\n}`
        },
        binary_search: {
            python: `def binary_search(nums, target):\n    # Return index of target in sorted nums, or -1\n    pass`,
            javascript: `function binarySearch(nums, target) {\n    // Return index of target in sorted nums, or -1\n    return -1;\n}`,
            java: `class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};`,
            c: `int binarySearch(const int* nums, int n, int target) {\n    return -1;\n}`
        },
        max_subarray: {
            python: `def max_subarray(nums):\n    # Return maximum contiguous subarray sum\n    pass`,
            javascript: `function maxSubArray(nums) {\n    // Return maximum contiguous subarray sum\n    \n}`,
            java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};`,
            c: `int maxSubArray(const int* nums, int n) {\n    return 0;\n}`
        },
        climbing_stairs: {
            python: `def climb_stairs(n):\n    # Distinct ways to climb n stairs (1 or 2 steps)\n    pass`,
            javascript: `function climbStairs(n) {\n    // Distinct ways to climb n stairs (1 or 2 steps)\n    \n}`,
            java: `class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};`,
            c: `long long climbStairs(int n) {\n    return 0;\n}`
        },
        merge_intervals: {
            python: `def merge_intervals(intervals):\n    # Return merged non-overlapping [[start, end], ...]\n    pass`,
            javascript: `function mergeIntervals(intervals) {\n    // Return merged non-overlapping [[start, end], ...]\n    return [];\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int[][] merge(int[][] intervals) {\n        return new int[0][0];\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> mergeIntervals(vector<vector<int>>& intervals) {\n        return {};\n    }\n};`,
            c: `int mergeIntervals(int intervals[][2], int n, int out[][2]) {\n    return 0;\n}`
        }
    },

    init() {
        this.bindModeTabs();
        this.prefillUser();
        this.loadProblems();
        this.connectSocket();
        this.bindLobbyControls();
        this.applyUrlParams();
    },

    esc(s) {
        return String(s ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    bindModeTabs() {
        const btnLive = document.getElementById('btn-duel-tab-live');
        const btnRace = document.getElementById('btn-duel-tab-race');
        const secLive = document.getElementById('duel-section-live');
        const secRace = document.getElementById('duel-section-race');

        const setTab = (mode) => {
            if (mode === 'race') {
                btnRace?.classList.add('active');
                btnLive?.classList.remove('active');
                secRace?.classList.remove('d-none');
                secLive?.classList.add('d-none');
            } else {
                btnLive?.classList.add('active');
                btnRace?.classList.remove('active');
                secLive?.classList.remove('d-none');
                secRace?.classList.add('d-none');
            }
        };

        btnLive?.addEventListener('click', () => setTab('live'));
        btnRace?.addEventListener('click', () => setTab('race'));
        this.setModeTab = setTab;
    },

    prefillUser() {
        const input = document.getElementById('live-player-name');
        if (!input) return;
        try {
            const u = JSON.parse(localStorage.getItem('algolearn_user') || 'null');
            if (u && (u.fullName || u.username)) {
                input.value = u.fullName || u.username;
                return;
            }
        } catch (e) {}
        if (!input.value) input.value = 'Coder-' + Math.floor(100 + Math.random() * 899);
    },

    async loadProblems() {
        try {
            const res = await fetch('/api/codelab/problems');
            const data = await res.json();
            if (data && data.success && Array.isArray(data.problems)) {
                this.problems = data.problems;
                this.renderProblemSelect();
            }
        } catch (e) {}
    },

    getFilteredProblems() {
        if (!this.difficultyFilter || this.difficultyFilter === 'All') return this.problems;
        return this.problems.filter(p => p.difficulty === this.difficultyFilter);
    },

    renderProblemSelect() {
        const sel = document.getElementById('live-problem-select');
        if (!sel) return;
        const list = this.getFilteredProblems();
        const prev = this.pendingUrlProblem || sel.value;
        const diffLbl = this.difficultyFilter === 'All' ? 'All 100' : this.difficultyFilter;
        const opts = [`<option value="random">🎲 Random Problem (${this.esc(diffLbl)})</option>`];
        list.forEach(p => {
            const lc = p.leetcodeId ? `#${p.leetcodeId} ` : '';
            opts.push(`<option value="${this.esc(p.id)}">${lc}${this.esc(p.title)} (${this.esc(p.difficulty)})</option>`);
        });
        sel.innerHTML = opts.join('');
        if (this.pendingUrlProblem && this.problems.some(p => p.id === this.pendingUrlProblem)) {
            if (!list.some(p => p.id === this.pendingUrlProblem)) {
                this.difficultyFilter = 'All';
                const df = document.getElementById('live-diff-filter');
                if (df) df.value = 'All';
                this.renderProblemSelect();
                return;
            }
            sel.value = this.pendingUrlProblem;
            this.pendingUrlProblem = null;
        } else if (prev && prev !== 'random' && list.some(p => p.id === prev)) {
            sel.value = prev;
        }
    },

    mountLobbyVisualizer() {
        const wrap = document.getElementById('live-lobby-vis-wrap');
        if (!wrap || wrap.classList.contains('d-none')) return;
        if (this.lobbyVisInstance && this.lobbyVisInstance.destroy) this.lobbyVisInstance.destroy();
        const val = document.getElementById('live-problem-select')?.value;
        const filtered = this.getFilteredProblems();
        const p = (val && val !== 'random' ? this.problems.find(x => x.id === val) : null) || filtered[0] || this.problems[0];
        if (p && window.ProblemVisualizerEngine) {
            this.lobbyVisInstance = window.ProblemVisualizerEngine.mount(wrap, p, { showStudioLink: true });
        }
    },

    applyUrlParams() {
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('tab') === 'race' && this.setModeTab) {
                this.setModeTab('race');
            }
            const room = params.get('room');
            if (room) {
                const input = document.getElementById('live-room-code-input');
                if (input) input.value = room.toUpperCase();
            }
            const diff = params.get('difficulty');
            if (diff && ['All', 'Easy', 'Medium', 'Hard'].includes(diff)) {
                this.difficultyFilter = diff;
                const df = document.getElementById('live-diff-filter');
                if (df) df.value = diff;
            }
            const prob = params.get('problem');
            if (prob) {
                this.pendingUrlProblem = prob;
                if (this.problems.length) this.renderProblemSelect();
            }
        } catch (e) {}
    },

    connectSocket() {
        const statusEl = document.getElementById('live-socket-status');
        if (typeof io !== 'function') {
            if (statusEl) statusEl.innerHTML = '<span class="badge bg-danger">Socket.IO unavailable</span>';
            return;
        }

        this.socket = io();
        this.socket.on('connect', () => {
            if (statusEl) statusEl.innerHTML = '<span class="badge bg-success"><i class="bi bi-broadcast me-1"></i>Arena Online (Socket.IO)</span>';
            if (this.currentRoom && this.currentRoom.code) {
                this.socket.emit('duel:rejoin', {
                    roomCode: this.currentRoom.code,
                    playerId: this.getPlayerId()
                }, (ack) => {
                    if (ack && ack.success && ack.room) {
                        this.currentRoom = ack.room;
                        this.renderRoomState(ack.room);
                    }
                });
            }
        });
        this.socket.on('disconnect', () => {
            if (statusEl) statusEl.innerHTML = '<span class="badge bg-warning text-dark">Reconnecting...</span>';
        });

        this.socket.on('duel:room_state', (room) => {
            this.currentRoom = room;
            this.renderRoomState(room);
        });

        this.socket.on('duel:countdown', ({ count }) => {
            document.getElementById('live-duel-lobby')?.classList.add('d-none');
            document.getElementById('live-waiting-banner')?.classList.add('d-none');
            const banner = document.getElementById('live-countdown-banner');
            const num = document.getElementById('live-countdown-number');
            banner?.classList.remove('d-none');
            if (num) num.textContent = count > 0 ? String(count) : 'GO!';
        });

        this.socket.on('duel:start', (room) => {
            this.currentRoom = room;
            document.getElementById('live-countdown-banner')?.classList.add('d-none');
            document.getElementById('live-waiting-banner')?.classList.add('d-none');
            document.getElementById('live-duel-lobby')?.classList.add('d-none');
            document.getElementById('live-duel-arena')?.classList.remove('d-none');
            document.getElementById('live-match-result-banner')?.classList.add('d-none');

            this.setupArenaForRoom(room);
            this.renderRoomState(room);
            this.startMatchClock(room.startedAt || Date.now());
        });

        this.socket.on('duel:judge_result', (result) => {
            this.renderJudgeFeedback(result);
        });

        this.socket.on('duel:finished', ({ room, xpAwards }) => {
            this.currentRoom = room;
            this.renderRoomState(room);
            this.stopMatchClock();

            const banner = document.getElementById('live-match-result-banner');
            const textEl = document.getElementById('live-match-result-text');
            if (!banner || !textEl) return;

            const myId = this.socket ? this.socket.id : '';
            const iWon = room.winner && room.winner.socketId === myId;
            const gained = (xpAwards && xpAwards[myId]) ? ` (+${xpAwards[myId]} XP awarded!)` : '';

            banner.classList.remove('d-none', 'alert-success', 'alert-warning');
            banner.classList.add(iWon ? 'alert-success' : 'alert-warning');
            textEl.innerHTML = iWon
                ? `Victory! You solved "${this.esc(room.problem?.title)}" first in ${room.winner.elapsedSec}s!${this.esc(gained)}`
                : `${this.esc(room.winner?.name || 'Opponent')} finished first in ${room.winner?.elapsedSec || 0}s!${this.esc(gained)}`;
        });
    },

    bindLobbyControls() {
        const showLobbyError = (msg) => {
            const el = document.getElementById('live-lobby-alert');
            if (!el) return;
            if (!msg) {
                el.classList.add('d-none');
                return;
            }
            el.textContent = msg;
            el.classList.remove('d-none');
        };

        const createRoom = (vsBot) => {
            showLobbyError('');
            if (!this.socket || !this.socket.connected) {
                showLobbyError('Waiting for Arena connection. Please retry in a moment.');
                return;
            }
            const problemId = document.getElementById('live-problem-select')?.value || 'two_sum';
            const difficulty = this.difficultyFilter || 'All';
            const playerName = document.getElementById('live-player-name')?.value.trim() || 'Player 1';
            const token = localStorage.getItem('algolearn_token') || '';
            const playerId = this.getPlayerId();

            this.socket.emit('duel:create', { problemId, difficulty, playerName, playerId, token, vsBot }, (ack) => {
                if (!ack || !ack.success) {
                    showLobbyError((ack && ack.error) || 'Failed to create room.');
                    return;
                }
                this.currentRoom = ack.room;
                if (!vsBot) {
                    document.getElementById('live-duel-lobby')?.classList.add('d-none');
                    document.getElementById('live-waiting-banner')?.classList.remove('d-none');
                    const codeEl = document.getElementById('live-waiting-code');
                    if (codeEl) codeEl.textContent = ack.room.code;
                }
            });
        };

        document.getElementById('live-diff-filter')?.addEventListener('change', (e) => {
            this.difficultyFilter = e.target.value || 'All';
            this.renderProblemSelect();
            this.mountLobbyVisualizer();
        });
        document.getElementById('live-problem-select')?.addEventListener('change', () => {
            this.mountLobbyVisualizer();
        });
        document.getElementById('btn-live-pick-random')?.addEventListener('click', () => {
            const list = this.getFilteredProblems();
            const sel = document.getElementById('live-problem-select');
            if (sel && list.length) {
                const chosen = list[Math.floor(Math.random() * list.length)];
                sel.value = chosen.id;
                this.mountLobbyVisualizer();
            }
        });
        document.getElementById('btn-lobby-preview-vis')?.addEventListener('click', () => {
            const wrap = document.getElementById('live-lobby-vis-wrap');
            if (!wrap) return;
            wrap.classList.toggle('d-none');
            if (!wrap.classList.contains('d-none')) {
                this.mountLobbyVisualizer();
            } else if (this.lobbyVisInstance?.destroy) {
                this.lobbyVisInstance.destroy();
            }
        });
        document.getElementById('btn-arena-toggle-vis')?.addEventListener('click', () => {
            const wrap = document.getElementById('live-arena-vis-wrap');
            if (!wrap || !this.currentRoom?.problem) return;
            wrap.classList.toggle('d-none');
            if (!wrap.classList.contains('d-none')) {
                if (this.arenaVisInstance?.destroy) this.arenaVisInstance.destroy();
                if (window.ProblemVisualizerEngine) {
                    this.arenaVisInstance = window.ProblemVisualizerEngine.mount(wrap, this.currentRoom.problem, { showStudioLink: true });
                }
            } else if (this.arenaVisInstance?.destroy) {
                this.arenaVisInstance.destroy();
            }
        });

        document.getElementById('btn-create-duel-room')?.addEventListener('click', () => createRoom(false));
        document.getElementById('btn-spar-algobot')?.addEventListener('click', () => createRoom(true));

        document.getElementById('btn-join-duel-room')?.addEventListener('click', () => {
            showLobbyError('');
            const roomCode = (document.getElementById('live-room-code-input')?.value || '').trim().toUpperCase();
            if (!roomCode) {
                showLobbyError('Enter a 6-character room code to join.');
                return;
            }
            if (!this.socket || !this.socket.connected) {
                showLobbyError('Waiting for Arena connection.');
                return;
            }
            const playerName = document.getElementById('live-player-name')?.value.trim() || 'Challenger';
            const token = localStorage.getItem('algolearn_token') || '';
            const playerId = this.getPlayerId();
            this.socket.emit('duel:join', { roomCode, playerName, playerId, token }, (ack) => {
                if (!ack || !ack.success) {
                    showLobbyError((ack && ack.error) || 'Could not join room.');
                }
            });
        });

        document.getElementById('btn-copy-room-code')?.addEventListener('click', () => {
            if (this.currentRoom?.code && navigator.clipboard) {
                navigator.clipboard.writeText(this.currentRoom.code).catch(() => {});
            }
        });
        document.getElementById('btn-copy-room-link')?.addEventListener('click', () => {
            if (this.currentRoom?.code && navigator.clipboard) {
                const url = `${window.location.origin}/duel.html?room=${this.currentRoom.code}`;
                navigator.clipboard.writeText(url).catch(() => {});
            }
        });

        const resetToLobby = () => {
            this.stopMatchClock();
            if (this.socket && this.socket.connected) {
                this.socket.emit('duel:leave');
            }
            this.currentRoom = null;
            this.drafts = {};
            document.getElementById('live-waiting-banner')?.classList.add('d-none');
            document.getElementById('live-countdown-banner')?.classList.add('d-none');
            document.getElementById('live-duel-arena')?.classList.add('d-none');
            document.getElementById('live-duel-lobby')?.classList.remove('d-none');
        };
        document.getElementById('btn-leave-duel-room')?.addEventListener('click', resetToLobby);
        document.getElementById('btn-live-new-match')?.addEventListener('click', resetToLobby);

        // Code editor events
        const editor = document.getElementById('live-code-editor');
        const langSel = document.getElementById('live-arena-lang');
        if (langSel && editor) {
            langSel.addEventListener('change', (e) => {
                this.drafts[this.currentLang] = editor.value;
                this.currentLang = e.target.value;
                editor.value = this.drafts[this.currentLang] !== undefined
                    ? this.drafts[this.currentLang]
                    : this.getStarterForCurrentRoom(this.currentLang);
                this.updateCharCount();
                const langEl = document.getElementById('duel-p1-lang');
                if (langEl) langEl.textContent = this.currentLang.toUpperCase();
                this.emitProgress('Switched to ' + this.currentLang.toUpperCase());
            });
        }

        if (editor) {
            editor.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const s = editor.selectionStart;
                    const end = editor.selectionEnd;
                    editor.value = editor.value.substring(0, s) + '    ' + editor.value.substring(end);
                    editor.selectionStart = editor.selectionEnd = s + 4;
                }
            });
            editor.addEventListener('input', () => {
                this.drafts[this.currentLang] = editor.value;
                this.updateCharCount();
                const now = Date.now();
                if (now - this.lastProgressSentAt > 1200) {
                    this.lastProgressSentAt = now;
                    this.emitProgress(`Coding (${editor.value.length} chars)...`);
                }
            });
        }

        document.getElementById('btn-live-reset-starter')?.addEventListener('click', () => {
            if (!editor) return;
            const sk = this.getStarterForCurrentRoom(this.currentLang);
            editor.value = sk;
            this.drafts[this.currentLang] = sk;
            this.updateCharCount();
        });

        document.getElementById('btn-live-submit')?.addEventListener('click', () => {
            this.submitCurrentSolution();
        });
    },

    async submitViaHttpJudge(problemId, language, code) {
        const token = localStorage.getItem('algolearn_token') || '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/codelab/judge', {
            method: 'POST',
            headers,
            body: JSON.stringify({ problemId, language, code })
        });
        return await res.json();
    },

    async submitCurrentSolution() {
        const editor = document.getElementById('live-code-editor');
        const btn = document.getElementById('btn-live-submit');
        const code = editor ? editor.value : '';
        if (!code.trim()) {
            this.renderJudgeFeedback({
                verdict: 'Compilation Error',
                passedCount: 0,
                totalCount: this.currentRoom?.problem?.totalTests || 0,
                runtimeMs: 0,
                error: 'Editor cannot be empty.',
                results: []
            });
            return;
        }
        if (!this.currentRoom) return;

        const restoreBtn = () => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-check2-all me-1"></i> Submit Solution to Judge';
            }
        };

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Judging...';
        }
        const statusEl = document.getElementById('live-editor-status');
        if (statusEl) statusEl.textContent = 'Running testcases on Judge...';

        const runFallback = async (reasonMsg = '') => {
            try {
                const pid = this.currentRoom?.problemId || this.currentRoom?.problem?.id || 'two_sum';
                const result = await this.submitViaHttpJudge(pid, this.currentLang, code);
                if (reasonMsg && result && !result.matchNotice) {
                    result.matchNotice = reasonMsg;
                }
                this.renderJudgeFeedback(result);
                const passed = result.passedCount || 0;
                const total = result.totalCount || 0;
                const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
                const barEl = document.getElementById('duel-p1-bar');
                const testsEl = document.getElementById('duel-p1-tests');
                const stEl = document.getElementById('duel-p1-status');
                const langEl = document.getElementById('duel-p1-lang');
                if (barEl) barEl.style.width = `${pct}%`;
                if (testsEl) testsEl.textContent = `${passed} / ${total} tests passed`;
                if (langEl) langEl.textContent = this.currentLang.toUpperCase();
                if (stEl) {
                    stEl.textContent = result.verdict === 'Accepted' ? 'Accepted! 🏆' : `${result.verdict} (${passed}/${total})`;
                    stEl.className = `badge ${result.verdict === 'Accepted' ? 'bg-success' : 'bg-danger'}`;
                }
            } catch (err) {
                this.renderJudgeFeedback({
                    verdict: 'Submission Error',
                    passedCount: 0,
                    totalCount: this.currentRoom?.problem?.totalTests || 0,
                    runtimeMs: 0,
                    error: 'Could not reach Judge server: ' + (err.message || 'Network error'),
                    results: []
                });
            } finally {
                restoreBtn();
            }
        };

        if (!this.socket || !this.socket.connected) {
            await runFallback('Arena WebSocket disconnected — graded directly via CodeLab Judge.');
            return;
        }

        let settled = false;
        const guardTimer = setTimeout(() => {
            if (!settled) {
                settled = true;
                runFallback('Live room timed out — graded directly via CodeLab Judge.');
            }
        }, 25000);

        this.socket.emit('duel:submit', {
            roomCode: this.currentRoom.code,
            playerId: this.getPlayerId(),
            language: this.currentLang,
            code
        }, async (ack) => {
            if (settled) return;
            settled = true;
            clearTimeout(guardTimer);
            if (!ack || !ack.success || !ack.result) {
                await runFallback(ack && ack.error ? ack.error : '');
                return;
            }
            const res = ack.result;
            if (ack.matchAlreadyFinished) {
                res.matchNotice = 'Match had already ended, but your solution was still graded against all testcases.';
            }
            this.renderJudgeFeedback(res);
            restoreBtn();
        });
    },

    getStarterForCurrentRoom(lang) {
        if (this.currentRoom?.problem?.duelSkeletons?.[lang]) {
            return this.currentRoom.problem.duelSkeletons[lang];
        }
        const pid = this.currentRoom?.problemId || 'two_sum';
        if (this.SKELETONS[pid] && this.SKELETONS[pid][lang]) {
            return this.SKELETONS[pid][lang];
        }
        return this.currentRoom?.problem?.starterCode?.[lang] || '';
    },

    setupArenaForRoom(room) {
        const p = room.problem || {};
        this.drafts = {};
        if (this.arenaVisInstance?.destroy) this.arenaVisInstance.destroy();
        const arenaVisWrap = document.getElementById('live-arena-vis-wrap');
        if (arenaVisWrap) {
            arenaVisWrap.classList.add('d-none');
            arenaVisWrap.innerHTML = '';
        }

        const titleEl = document.getElementById('live-arena-problem-title');
        const diffEl = document.getElementById('live-arena-diff-badge');
        const topicEl = document.getElementById('live-arena-topic-badge');
        const optEl = document.getElementById('live-arena-optimal-badge');
        const descEl = document.getElementById('live-arena-desc');
        const exEl = document.getElementById('live-arena-examples');
        const roomBadge = document.getElementById('live-arena-room-badge');
        const feedbackEl = document.getElementById('live-judge-feedback');

        if (roomBadge) roomBadge.textContent = `ROOM ${room.code}`;
        if (titleEl) titleEl.textContent = (p.leetcodeId ? `#${p.leetcodeId} ` : '') + (p.title || 'Coding Challenge');
        if (diffEl) {
            diffEl.textContent = p.difficulty || 'Easy';
            diffEl.className = `badge ${p.difficulty === 'Hard' ? 'bg-danger text-white' : (p.difficulty === 'Medium' ? 'bg-warning text-dark' : 'bg-success text-white')}`;
        }
        if (topicEl) topicEl.textContent = p.topic || 'DSA';
        if (optEl) optEl.textContent = `Target: ${p.optimalTime || 'O(n)'}`;
        if (descEl) {
            descEl.innerHTML = this.esc(p.description || '').replace(/`([^`]+)`/g, '<code>$1</code>');
        }
        if (exEl) {
            exEl.innerHTML = (p.examples || []).map((ex, i) => `
                <div class="p-2 rounded bg-dark text-white font-monospace mb-2" style="font-size:0.75rem; border-left:3px solid #38bdf8;">
                    <div class="text-info fw-bold">Example ${i + 1}</div>
                    <div>In: ${this.esc(ex.input)}</div>
                    <div>Out: <span class="text-success fw-bold">${this.esc(ex.output)}</span></div>
                </div>
            `).join('');
        }
        if (feedbackEl) feedbackEl.innerHTML = '';

        const editor = document.getElementById('live-code-editor');
        const langSel = document.getElementById('live-arena-lang');
        if (langSel) this.currentLang = langSel.value || 'python';
        if (editor) {
            editor.value = this.getStarterForCurrentRoom(this.currentLang);
            this.drafts[this.currentLang] = editor.value;
            this.updateCharCount();
        }
    },

    updateCharCount() {
        const editor = document.getElementById('live-code-editor');
        const el = document.getElementById('live-char-count');
        if (editor && el) el.textContent = `${editor.value.length} chars`;
    },

    emitProgress(statusText) {
        if (!this.socket || !this.currentRoom) return;
        const editor = document.getElementById('live-code-editor');
        this.socket.emit('duel:progress', {
            roomCode: this.currentRoom.code,
            playerId: this.getPlayerId(),
            language: this.currentLang,
            chars: editor ? editor.value.length : 0,
            statusText
        });
    },

    renderRoomState(room) {
        if (!room || !Array.isArray(room.players)) return;
        const myId = this.socket ? this.socket.id : '';
        const me = room.players.find(p => p.socketId === myId) || room.players[0];
        const opp = room.players.find(p => p !== me) || null;

        const renderSlot = (slotNum, player) => {
            const nameEl = document.getElementById(`duel-p${slotNum}-name`);
            const stEl = document.getElementById(`duel-p${slotNum}-status`);
            const barEl = document.getElementById(`duel-p${slotNum}-bar`);
            const testsEl = document.getElementById(`duel-p${slotNum}-tests`);
            const langEl = document.getElementById(`duel-p${slotNum}-lang`);
            if (!player) {
                if (nameEl) nameEl.textContent = 'Waiting for opponent...';
                return;
            }
            const pct = player.totalTests > 0 ? Math.round((player.passedTests / player.totalTests) * 100) : 0;
            if (nameEl) nameEl.textContent = player.socketId === myId ? `${player.name} (You)` : player.name;
            if (stEl) {
                stEl.textContent = player.statusText || 'Ready';
                stEl.className = `badge ${player.statusText?.includes('Accepted') ? 'bg-success' : slotNum === 1 ? 'bg-primary' : 'bg-warning text-dark'}`;
            }
            if (barEl) barEl.style.width = `${pct}%`;
            if (testsEl) testsEl.textContent = `${player.passedTests} / ${player.totalTests} tests passed`;
            if (langEl) langEl.textContent = (player.language || 'python').toUpperCase();
        };

        renderSlot(1, me);
        renderSlot(2, opp);
    },

    renderJudgeFeedback(result) {
        const el = document.getElementById('live-judge-feedback');
        const statusEl = document.getElementById('live-editor-status');
        if (!el) return;
        const ok = result.verdict === 'Accepted';
        const passed = result.passedCount || 0;
        const total = result.totalCount || 0;
        const firstFail = (result.results || []).find(r => !r.passed);
        if (statusEl) {
            statusEl.textContent = `${result.verdict || 'Judged'} — ${passed}/${total} tests passed`;
        }
        const pillsHtml = Array.isArray(result.results) && result.results.length
            ? `<div class="d-flex flex-wrap gap-1 mt-1">${result.results.map((r, idx) => `<span class="badge ${r.passed ? 'bg-success' : 'bg-danger'}" style="font-size:0.68rem;">${r.passed ? '✓' : '✕'} ${this.esc(r.name || 'Test ' + (idx + 1))}</span>`).join('')}</div>`
            : '';
        el.innerHTML = `
            <div class="alert ${ok ? 'alert-success' : 'alert-danger'} py-2 px-3 small mb-0">
                <div class="fw-bold">${this.esc(result.verdict)} — ${passed}/${total} Tests (${result.runtimeMs || 0}ms)</div>
                ${result.matchNotice ? `<div class="small mt-1 opacity-75">${this.esc(result.matchNotice)}</div>` : ''}
                ${pillsHtml}
                ${result.error ? `<pre class="mb-0 mt-1 small text-danger" style="white-space:pre-wrap; max-height:110px; overflow:auto;">${this.esc(result.error)}</pre>` : ''}
                ${firstFail && !firstFail.hidden ? `<div class="mt-1 font-monospace" style="font-size:0.72rem;">Failed ${this.esc(firstFail.name)}: expected ${this.esc(firstFail.expectedDisplay)}, got ${this.esc(firstFail.actualDisplay)}</div>` : ''}
            </div>
        `;
        try {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {}
    },

    startMatchClock(startedAt) {
        this.stopMatchClock();
        const el = document.getElementById('live-match-timer');
        const update = () => {
            const sec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
            const mm = String(Math.floor(sec / 60)).padStart(2, '0');
            const ss = String(sec % 60).padStart(2, '0');
            if (el) el.textContent = `${mm}:${ss}`;
        };
        update();
        this.timerInterval = setInterval(update, 1000);
    },

    stopMatchClock() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    DuelArena.init();
    LiveDuelClient.init();
});

if (typeof window !== 'undefined') {
    window.DuelArena = DuelArena;
    window.LiveDuelClient = LiveDuelClient;
}
