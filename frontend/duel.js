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

document.addEventListener('DOMContentLoaded', () => {
    DuelArena.init();
});

if (typeof window !== 'undefined') {
    window.DuelArena = DuelArena;
}
