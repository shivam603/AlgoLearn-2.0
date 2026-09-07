/**
 * AlgoLearn Dynamic Programming & Recursion Visualizer Engine
 * Solves 0/1 Knapsack, LCS, and Fibonacci with step-by-step matrix animations and backtracking.
 */

const DPVisualizer = {
    currentProblem: 'knapsack', // 'knapsack' | 'lcs' | 'fibonacci'
    steps: [],
    currentStepIdx: 0,
    isAnimating: false,
    interval: null,

    init() {
        this.bindEvents();
        this.setupProblem('knapsack');
    },

    bindEvents() {
        const select = document.getElementById('dp-problem-select');
        const runBtn = document.getElementById('btn-dp-run');
        const stepBtn = document.getElementById('btn-dp-step');

        if (select) {
            select.addEventListener('change', (e) => {
                this.setupProblem(e.target.value);
            });
        }

        if (runBtn) {
            runBtn.addEventListener('click', () => {
                this.runComputation();
            });
        }

        if (stepBtn) {
            stepBtn.addEventListener('click', () => {
                this.stepForward();
            });
        }
    },

    setupProblem(problemKey) {
        this.currentProblem = problemKey;
        this.steps = [];
        this.currentStepIdx = 0;
        if (this.interval) clearInterval(this.interval);

        document.querySelectorAll('.dp-param-section').forEach(sec => sec.classList.add('d-none'));

        const formulaTitle = document.getElementById('dp-formula-title');
        const formulaDesc = document.getElementById('dp-formula-desc');
        const timeEl = document.getElementById('dp-time');
        const spaceEl = document.getElementById('dp-space');

        if (problemKey === 'knapsack') {
            document.getElementById('knapsack-inputs')?.classList.remove('d-none');
            if (formulaTitle) formulaTitle.textContent = '0/1 Knapsack Recurrence';
            if (formulaDesc) formulaDesc.textContent = 'dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]])';
            if (timeEl) timeEl.textContent = 'O(N × W)';
            if (spaceEl) spaceEl.textContent = 'O(N × W)';
            this.buildKnapsackGrid();
        } else if (problemKey === 'lcs') {
            document.getElementById('lcs-inputs')?.classList.remove('d-none');
            if (formulaTitle) formulaTitle.textContent = 'LCS Recurrence Relation';
            if (formulaDesc) formulaDesc.textContent = 's1[i-1] == s2[j-1] ? 1 + dp[i-1][j-1] : max(dp[i-1][j], dp[i][j-1])';
            if (timeEl) timeEl.textContent = 'O(M × N)';
            if (spaceEl) spaceEl.textContent = 'O(M × N)';
            this.buildLCSGrid();
        } else if (problemKey === 'fibonacci') {
            document.getElementById('fib-inputs')?.classList.remove('d-none');
            if (formulaTitle) formulaTitle.textContent = 'Fibonacci Recurrence';
            if (formulaDesc) formulaDesc.textContent = 'dp[i] = dp[i-1] + dp[i-2] | Base: dp[0]=0, dp[1]=1';
            if (timeEl) timeEl.textContent = 'O(N) vs O(2^N)';
            if (spaceEl) spaceEl.textContent = 'O(N)';
            this.buildFibonacciGrid();
        }
    },

    parseKnapsackItems() {
        const str = document.getElementById('knapsack-items')?.value || '1:1, 3:4, 4:5, 5:7';
        return str.split(',').map(pair => {
            const [w, v] = pair.trim().split(':').map(n => parseInt(n, 10));
            return { weight: w || 1, value: v || 1 };
        });
    },

    buildKnapsackGrid() {
        const capacity = parseInt(document.getElementById('knapsack-cap')?.value || '7', 10);
        const items = this.parseKnapsackItems();
        const container = document.getElementById('dp-matrix-container');
        if (!container) return;

        const rows = items.length + 1;
        const cols = capacity + 1;

        container.style.gridTemplateColumns = `repeat(${cols + 1}, minmax(42px, 1fr))`;
        container.innerHTML = '';

        // Header corner
        const corner = document.createElement('div');
        corner.className = 'dp-cell cell-header';
        corner.textContent = 'Item\\W';
        container.appendChild(corner);

        // Column headers (weights 0..W)
        for (let w = 0; w <= capacity; w++) {
            const h = document.createElement('div');
            h.className = 'dp-cell cell-header';
            h.textContent = w;
            container.appendChild(h);
        }

        // Rows
        for (let i = 0; i <= items.length; i++) {
            const rHeader = document.createElement('div');
            rHeader.className = 'dp-cell cell-header';
            rHeader.textContent = i === 0 ? 'Ø' : `#${i} (w:${items[i - 1].weight}, v:${items[i - 1].value})`;
            container.appendChild(rHeader);

            for (let w = 0; w <= capacity; w++) {
                const cell = document.createElement('div');
                cell.className = 'dp-cell';
                cell.id = `dp-cell-${i}-${w}`;
                cell.textContent = i === 0 || w === 0 ? '0' : '—';
                container.appendChild(cell);
            }
        }
    },

    buildLCSGrid() {
        const s1 = (document.getElementById('lcs-str1')?.value || 'ALGORITHM').toUpperCase();
        const s2 = (document.getElementById('lcs-str2')?.value || 'LOGARITHM').toUpperCase();
        const container = document.getElementById('dp-matrix-container');
        if (!container) return;

        const rows = s1.length + 1;
        const cols = s2.length + 1;

        container.style.gridTemplateColumns = `repeat(${cols + 1}, minmax(42px, 1fr))`;
        container.innerHTML = '';

        const corner = document.createElement('div');
        corner.className = 'dp-cell cell-header';
        corner.textContent = 'Ø';
        container.appendChild(corner);

        // Header row s2
        const h0 = document.createElement('div');
        h0.className = 'dp-cell cell-header';
        h0.textContent = 'Ø';
        container.appendChild(h0);

        for (let j = 0; j < s2.length; j++) {
            const h = document.createElement('div');
            h.className = 'dp-cell cell-header';
            h.textContent = s2[j];
            container.appendChild(h);
        }

        // Rows for s1
        for (let i = 0; i <= s1.length; i++) {
            const rHeader = document.createElement('div');
            rHeader.className = 'dp-cell cell-header';
            rHeader.textContent = i === 0 ? 'Ø' : s1[i - 1];
            container.appendChild(rHeader);

            for (let j = 0; j <= s2.length; j++) {
                const cell = document.createElement('div');
                cell.className = 'dp-cell';
                cell.id = `dp-cell-${i}-${j}`;
                cell.textContent = i === 0 || j === 0 ? '0' : '—';
                container.appendChild(cell);
            }
        }
    },

    buildFibonacciGrid() {
        const n = parseInt(document.getElementById('fib-n')?.value || '6', 10);
        const container = document.getElementById('dp-matrix-container');
        if (!container) return;

        container.style.gridTemplateColumns = `repeat(${n + 1}, minmax(54px, 1fr))`;
        container.innerHTML = '';

        for (let i = 0; i <= n; i++) {
            const cell = document.createElement('div');
            cell.className = 'dp-cell';
            cell.id = `dp-cell-fib-${i}`;
            cell.innerHTML = `<span class="small text-muted" style="font-size:0.65rem;">F(${i})</span><br><strong>${i <= 1 ? i : '—'}</strong>`;
            container.appendChild(cell);
        }
    },

    runComputation() {
        if (this.isAnimating) return;
        this.generateSteps();
        this.currentStepIdx = 0;
        this.isAnimating = true;

        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => {
            if (this.currentStepIdx < this.steps.length) {
                this.applyStep(this.steps[this.currentStepIdx]);
                this.currentStepIdx++;
            } else {
                clearInterval(this.interval);
                this.isAnimating = false;
            }
        }, 120);
    },

    stepForward() {
        if (!this.steps.length) this.generateSteps();
        if (this.currentStepIdx < this.steps.length) {
            this.applyStep(this.steps[this.currentStepIdx]);
            this.currentStepIdx++;
        }
    },

    generateSteps() {
        this.steps = [];
        if (this.currentProblem === 'knapsack') {
            const capacity = parseInt(document.getElementById('knapsack-cap')?.value || '7', 10);
            const items = this.parseKnapsackItems();
            const dp = Array.from({ length: items.length + 1 }, () => Array(capacity + 1).fill(0));

            for (let i = 1; i <= items.length; i++) {
                const wt = items[i - 1].weight;
                const val = items[i - 1].value;
                for (let w = 1; w <= capacity; w++) {
                    if (wt <= w) {
                        dp[i][w] = Math.max(dp[i - 1][w], val + dp[i - 1][w - wt]);
                    } else {
                        dp[i][w] = dp[i - 1][w];
                    }
                    this.steps.push({ i, w, val: dp[i][w], desc: `Item #${i} at Cap ${w} = ${dp[i][w]}` });
                }
            }

            // Backtrack optimal items
            const chosen = [];
            let currW = capacity;
            for (let i = items.length; i > 0; i--) {
                if (dp[i][currW] !== dp[i - 1][currW]) {
                    chosen.push(i);
                    currW -= items[i - 1].weight;
                }
            }
            this.optimalValue = dp[items.length][capacity];
            this.optimalDesc = `Optimal Max Value: $${this.optimalValue} using items [ ${chosen.reverse().map(c => '#' + c).join(', ')} ]`;
        } else if (this.currentProblem === 'lcs') {
            const s1 = (document.getElementById('lcs-str1')?.value || 'ALGORITHM').toUpperCase();
            const s2 = (document.getElementById('lcs-str2')?.value || 'LOGARITHM').toUpperCase();
            const dp = Array.from({ length: s1.length + 1 }, () => Array(s2.length + 1).fill(0));

            for (let i = 1; i <= s1.length; i++) {
                for (let j = 1; j <= s2.length; j++) {
                    if (s1[i - 1] === s2[j - 1]) {
                        dp[i][j] = 1 + dp[i - 1][j - 1];
                    } else {
                        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                    }
                    this.steps.push({ i, j, val: dp[i][j], desc: `Compare '${s1[i - 1]}' with '${s2[j - 1]}' → LCS = ${dp[i][j]}` });
                }
            }

            // Backtrack string
            let lcsStr = '';
            let i = s1.length, j = s2.length;
            while (i > 0 && j > 0) {
                if (s1[i - 1] === s2[j - 1]) {
                    lcsStr = s1[i - 1] + lcsStr;
                    i--; j--;
                } else if (dp[i - 1][j] >= dp[i][j - 1]) {
                    i--;
                } else {
                    j--;
                }
            }
            this.optimalValue = dp[s1.length][s2.length];
            this.optimalDesc = `LCS Length: ${this.optimalValue} (Subsequence: "${lcsStr}")`;
        } else if (this.currentProblem === 'fibonacci') {
            const n = parseInt(document.getElementById('fib-n')?.value || '6', 10);
            const fib = [0, 1];
            for (let i = 2; i <= n; i++) {
                fib[i] = fib[i - 1] + fib[i - 2];
                this.steps.push({ i, val: fib[i], desc: `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${fib[i]}` });
            }
            this.optimalValue = fib[n];
            this.optimalDesc = `F(${n}) = ${fib[n]} (Computed in ${n} linear steps instead of 2^${n} recursive calls!)`;
        }
    },

    applyStep(step) {
        document.querySelectorAll('.dp-cell.cell-active').forEach(c => c.classList.remove('cell-active'));

        let cell = null;
        if (this.currentProblem === 'fibonacci') {
            cell = document.getElementById(`dp-cell-fib-${step.i}`);
            if (cell) {
                cell.classList.add('cell-active');
                cell.innerHTML = `<span class="small text-muted" style="font-size:0.65rem;">F(${step.i})</span><br><strong>${step.val}</strong>`;
            }
        } else {
            cell = document.getElementById(`dp-cell-${step.i}-${step.w !== undefined ? step.w : step.j}`);
            if (cell) {
                cell.classList.add('cell-active');
                cell.textContent = step.val;
            }
        }

        const badge = document.getElementById('dp-step-badge');
        if (badge) badge.textContent = `Step ${this.currentStepIdx + 1} / ${this.steps.length}`;

        if (window.AlgoAudio) {
            window.AlgoAudio.playTone(250 + (step.val * 35), 0.05, 'sine');
        }

        // If completed
        if (this.currentStepIdx === this.steps.length - 1) {
            const solVal = document.getElementById('dp-solution-val');
            const solText = document.getElementById('dp-solution-text');
            if (solVal) solVal.textContent = this.optimalValue;
            if (solText) solText.textContent = this.optimalDesc;
            if (cell) cell.classList.add('cell-highlight');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    DPVisualizer.init();
});

if (typeof window !== 'undefined') {
    window.DPVisualizer = DPVisualizer;
}
