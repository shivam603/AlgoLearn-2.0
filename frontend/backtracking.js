/**
 * AlgoLearn Backtracking & Recursion Engine
 * Solves N-Queens and Tower of Hanoi with animated recursive state transitions.
 */

const BacktrackingVisualizer = {
    currentTab: 'nqueens', // 'nqueens' | 'hanoi'
    nQueensSize: 4,
    board: [],
    isAnimating: false,
    stepsCount: 0,
    backtracksCount: 0,

    // Hanoi State
    hanoiDisks: 4,
    pegs: { A: [], B: [], C: [] },

    init() {
        this.bindEvents();
        this.setupNQueens(4);
        this.setupHanoi(4);
    },

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.bt-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.bt-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const target = btn.getAttribute('data-target');
                this.currentTab = target;

                document.querySelectorAll('.bt-section-block').forEach(sec => sec.classList.add('d-none'));
                document.getElementById(`section-${target}`)?.classList.remove('d-none');
            });
        });

        // N-Queens controls
        const nqSlider = document.getElementById('nqueens-size');
        const nqVal = document.getElementById('nqueens-size-val');
        const nqStart = document.getElementById('btn-nqueens-start');
        const nqReset = document.getElementById('btn-nqueens-reset');

        if (nqSlider && nqVal) {
            nqSlider.addEventListener('input', (e) => {
                const n = parseInt(e.target.value, 10);
                nqVal.textContent = n;
                this.setupNQueens(n);
            });
        }

        if (nqStart) {
            nqStart.addEventListener('click', () => {
                if (this.isAnimating) return;
                this.solveNQueens();
            });
        }

        if (nqReset) {
            nqReset.addEventListener('click', () => {
                this.setupNQueens(this.nQueensSize);
            });
        }

        // Hanoi controls
        const hanoiSlider = document.getElementById('hanoi-disk-count');
        const hanoiVal = document.getElementById('hanoi-disk-val');
        const hanoiStart = document.getElementById('btn-hanoi-start');
        const hanoiReset = document.getElementById('btn-hanoi-reset');

        if (hanoiSlider && hanoiVal) {
            hanoiSlider.addEventListener('input', (e) => {
                const n = parseInt(e.target.value, 10);
                hanoiVal.textContent = n;
                this.setupHanoi(n);
            });
        }

        if (hanoiStart) {
            hanoiStart.addEventListener('click', () => {
                if (this.isAnimating) return;
                this.solveHanoi();
            });
        }

        if (hanoiReset) {
            hanoiReset.addEventListener('click', () => {
                this.setupHanoi(this.hanoiDisks);
            });
        }
    },

    // ==========================================
    // N-Queens Implementation
    // ==========================================
    setupNQueens(n) {
        this.nQueensSize = n;
        this.stepsCount = 0;
        this.backtracksCount = 0;
        this.board = Array.from({ length: n }, () => Array(n).fill(0));
        this.updateMetrics();

        const container = document.getElementById('nqueens-board');
        if (!container) return;

        container.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
        container.style.width = `${Math.min(460, n * 60)}px`;
        container.style.height = `${Math.min(460, n * 60)}px`;
        container.innerHTML = '';

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const sq = document.createElement('div');
                sq.className = `chess-square ${(r + c) % 2 === 0 ? 'sq-light' : 'sq-dark'}`;
                sq.id = `sq-${r}-${c}`;
                container.appendChild(sq);
            }
        }

        const banner = document.getElementById('nqueens-status-banner');
        if (banner) banner.textContent = `Board initialized (${n}x${n}). Ready to solve.`;
    },

    isSafe(row, col) {
        // Check this row on left side
        for (let i = 0; i < col; i++) {
            if (this.board[row][i] === 1) return false;
        }
        // Check upper diagonal on left side
        for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
            if (this.board[i][j] === 1) return false;
        }
        // Check lower diagonal on left side
        for (let i = row, j = col; j >= 0 && i < this.nQueensSize; i++, j--) {
            if (this.board[i][j] === 1) return false;
        }
        return true;
    },

    async solveNQueens() {
        this.isAnimating = true;
        this.stepsCount = 0;
        this.backtracksCount = 0;
        const speed = parseInt(document.getElementById('nqueens-speed')?.value || '200', 10);
        const banner = document.getElementById('nqueens-status-banner');

        if (window.VoiceNarrator) {
            window.VoiceNarrator.speak(`Solving ${this.nQueensSize}-Queens problem using recursive backtracking.`);
        }

        const solveUtil = async (col) => {
            if (col >= this.nQueensSize) return true;

            for (let i = 0; i < this.nQueensSize; i++) {
                this.stepsCount++;
                this.updateMetrics();

                const sq = document.getElementById(`sq-${i}-${col}`);
                if (sq) sq.classList.add('sq-checking');
                if (window.AlgoAudio) window.AlgoAudio.playTone(300 + (col * 60), 0.04, 'sine');

                await new Promise(r => setTimeout(r, speed));

                if (this.isSafe(i, col)) {
                    this.board[i][col] = 1;
                    if (sq) {
                        sq.classList.remove('sq-checking');
                        sq.classList.add('sq-queen');
                        sq.innerHTML = '<span class="queen-icon">👑</span>';
                    }
                    if (banner) banner.textContent = `Placed Queen at Row ${i + 1}, Col ${col + 1}.`;
                    if (window.AlgoAudio) window.AlgoAudio.playTone(550, 0.08, 'triangle');

                    await new Promise(r => setTimeout(r, speed));

                    if (await solveUtil(col + 1)) return true;

                    // Backtrack
                    this.backtracksCount++;
                    this.board[i][col] = 0;
                    if (sq) {
                        sq.classList.remove('sq-queen');
                        sq.classList.add('sq-conflict');
                        sq.innerHTML = '';
                    }
                    if (banner) banner.textContent = `Backtracking: Removed Queen from Row ${i + 1}, Col ${col + 1}.`;
                    if (window.AlgoAudio) window.AlgoAudio.playTone(180, 0.06, 'sawtooth');

                    await new Promise(r => setTimeout(r, speed));
                    if (sq) sq.classList.remove('sq-conflict');
                } else {
                    if (sq) {
                        sq.classList.remove('sq-checking');
                        sq.classList.add('sq-conflict');
                    }
                    await new Promise(r => setTimeout(r, speed * 0.6));
                    if (sq) sq.classList.remove('sq-conflict');
                }
            }
            return false;
        };

        const res = await solveUtil(0);
        if (res) {
            if (banner) banner.innerHTML = `🎉 <strong class="text-success">Found valid ${this.nQueensSize}-Queens configuration!</strong>`;
            if (window.VoiceNarrator) window.VoiceNarrator.speak(`Success! Found safe placement for all ${this.nQueensSize} queens without conflicts.`, true);
        } else {
            if (banner) banner.textContent = `No solution exists for ${this.nQueensSize}-Queens.`;
        }
        this.isAnimating = false;
    },

    // ==========================================
    // Tower of Hanoi Implementation
    // ==========================================
    setupHanoi(n) {
        this.hanoiDisks = n;
        this.stepsCount = 0;
        this.backtracksCount = 0;
        this.pegs = { A: [], B: [], C: [] };
        this.updateMetrics();

        for (let i = n; i >= 1; i--) {
            this.pegs.A.push(i);
        }

        this.renderHanoi();

        const banner = document.getElementById('hanoi-status-banner');
        const minMoves = Math.pow(2, n) - 1;
        if (banner) banner.innerHTML = `Ready. Minimum moves required: <strong>${minMoves}</strong>.`;
    },

    renderHanoi() {
        const container = document.getElementById('hanoi-canvas');
        if (!container) return;
        container.innerHTML = '';

        const pegLabels = ['A', 'B', 'C'];
        pegLabels.forEach(pegName => {
            const pegWrapper = document.createElement('div');
            pegWrapper.className = 'hanoi-peg-wrapper';

            const pegRod = document.createElement('div');
            pegRod.className = 'hanoi-peg-rod';

            const diskStack = document.createElement('div');
            diskStack.className = 'hanoi-disk-stack';

            const disks = this.pegs[pegName] || [];
            disks.forEach(diskSize => {
                const disk = document.createElement('div');
                disk.className = 'hanoi-disk';
                disk.style.width = `${40 + diskSize * 24}px`;
                disk.style.backgroundColor = this.getDiskColor(diskSize);
                disk.textContent = diskSize;
                diskStack.appendChild(disk);
            });

            const pegBase = document.createElement('div');
            pegBase.className = 'hanoi-peg-base';
            pegBase.textContent = `Peg ${pegName}`;

            pegWrapper.appendChild(pegRod);
            pegWrapper.appendChild(diskStack);
            pegWrapper.appendChild(pegBase);
            container.appendChild(pegWrapper);
        });
    },

    getDiskColor(size) {
        const colors = ['#0284c7', '#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        return colors[(size - 1) % colors.length];
    },

    async solveHanoi() {
        this.isAnimating = true;
        this.stepsCount = 0;
        const speed = parseInt(document.getElementById('hanoi-speed')?.value || '350', 10);
        const banner = document.getElementById('hanoi-status-banner');

        if (window.VoiceNarrator) {
            window.VoiceNarrator.speak(`Solving Tower of Hanoi for ${this.hanoiDisks} disks.`);
        }

        const moveDisk = async (fromPeg, toPeg) => {
            const disk = this.pegs[fromPeg].pop();
            this.pegs[toPeg].push(disk);
            this.stepsCount++;
            this.updateMetrics();
            this.renderHanoi();

            if (banner) banner.textContent = `Move #${this.stepsCount}: Disk ${disk} from Peg ${fromPeg} ➔ Peg ${toPeg}`;
            if (window.AlgoAudio) window.AlgoAudio.playTone(320 + (disk * 70), 0.08, 'triangle');

            await new Promise(r => setTimeout(r, speed));
        };

        const hanoiRecursive = async (n, from, to, aux) => {
            if (n === 1) {
                await moveDisk(from, to);
                return;
            }
            await hanoiRecursive(n - 1, from, aux, to);
            await moveDisk(from, to);
            await hanoiRecursive(n - 1, aux, to, from);
        };

        await hanoiRecursive(this.hanoiDisks, 'A', 'C', 'B');

        if (banner) banner.innerHTML = `🏆 <strong class="text-success">Tower of Hanoi solved in ${this.stepsCount} moves!</strong>`;
        if (window.VoiceNarrator) window.VoiceNarrator.speak(`All ${this.hanoiDisks} disks transferred to Peg C in optimal ${this.stepsCount} moves.`, true);
        this.isAnimating = false;
    },

    updateMetrics() {
        const movesEl = document.getElementById('bt-metric-moves');
        const btEl = document.getElementById('bt-metric-backtracks');
        if (movesEl) movesEl.textContent = `Steps: ${this.stepsCount}`;
        if (btEl) btEl.textContent = `Backtracks: ${this.backtracksCount}`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    BacktrackingVisualizer.init();
});

if (typeof window !== 'undefined') {
    window.BacktrackingVisualizer = BacktrackingVisualizer;
}
