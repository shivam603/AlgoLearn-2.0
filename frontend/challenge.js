/**
 * AlgoLearn "Guess the Next Step" Challenge Engine
 * Simulates algorithm execution to a breakpoint, asks predictive questions, tracks score/streak.
 */

const DSAChallenge = {
    score: 0,
    streak: 0,
    currentRound: 0,
    totalRounds: 5,
    totalAttempted: 0,
    totalCorrect: 0,
    isAnswered: false,

    challenges: [
        {
            algo: 'Quick Sort (Lomuto Partition)',
            array: [34, 12, 68, 45, 23],
            pivotIdx: 4, // 23
            activeIdxA: 0, // 34
            activeIdxB: 4, // 23
            question: 'Comparing element array[0] (34) with pivot array[4] (23). Since 34 > 23, what is the next action?',
            options: [
                { text: 'Advance j without swapping (34 remains in place, i does not increment)', correct: true },
                { text: 'Swap 34 with 23 immediately', correct: false },
                { text: 'Increment i and swap array[0] with array[1]', correct: false },
                { text: 'Terminate the partition loop', correct: false }
            ],
            trace: [
                { type: 'PIVOT', desc: 'Selected array[4] (23) as partition pivot.' },
                { type: 'COMPARE', desc: 'Comparing array[0] (34) vs pivot (23).' }
            ],
            explanation: 'In Lomuto Partitioning, if array[j] > pivot, we simply advance the scan index j without incrementing the smaller elements pointer i or performing a swap.'
        },
        {
            algo: 'Bubble Sort (Pass 1)',
            array: [52, 14, 88, 30, 9],
            activeIdxA: 0,
            activeIdxB: 1,
            question: 'Comparing array[0] (52) and array[1] (14). What happens next?',
            options: [
                { text: 'Swap array[0] and array[1] because 52 > 14', correct: true },
                { text: 'Move directly to comparing array[1] and array[2] without swapping', correct: false },
                { text: 'Lock 52 in its final sorted position at index 0', correct: false },
                { text: 'Reset the loop from the beginning', correct: false }
            ],
            trace: [
                { type: 'INFO', desc: 'Started Bubble Sort Pass 1 / 4.' },
                { type: 'COMPARE', desc: 'Compare array[0] (52) vs array[1] (14).' }
            ],
            explanation: 'Since array[0] (52) is strictly greater than array[1] (14), Bubble Sort immediately swaps them to float the larger element toward the right.'
        },
        {
            algo: 'Binary Search',
            array: [10, 25, 38, 44, 59, 72, 85],
            target: 72,
            activeIdxA: 3, // mid = 44
            question: 'Target is 72. Current search range is [0..6]. Midpoint is index 3 (value 44). How should the search boundaries update?',
            options: [
                { text: 'Set low = mid + 1 (search right subarray [4..6]) because 72 > 44', correct: true },
                { text: 'Set high = mid - 1 (search left subarray [0..2]) because 72 > 44', correct: false },
                { text: 'Return index 3 as found', correct: false },
                { text: 'Perform linear scan from index 0 to 3', correct: false }
            ],
            trace: [
                { type: 'INFO', desc: 'Target = 72 in sorted array [10, 25, 38, 44, 59, 72, 85].' },
                { type: 'CALC', desc: 'Calculated mid = (0 + 6) / 2 = index 3 (value 44).' },
                { type: 'COMPARE', desc: 'Compare target 72 vs array[3] (44).' }
            ],
            explanation: 'Since the target (72) is greater than the middle element (44), the target can only exist in the right half of the sorted array, so we adjust low = mid + 1.'
        },
        {
            algo: 'Insertion Sort',
            array: [15, 40, 80, 25, 90],
            activeIdxA: 3, // key = 25
            activeIdxB: 2, // 80
            question: 'Inserting key = 25 into sorted prefix [15, 40, 80]. Comparing 25 with 80. What happens next?',
            options: [
                { text: 'Shift 80 to the right (array[3] = 80) and compare 25 with 40', correct: true },
                { text: 'Insert 25 at index 0 immediately', correct: false },
                { text: 'Swap 25 with 90 at the end of the array', correct: false },
                { text: 'Terminate insertion since 25 is smaller than 80', correct: false }
            ],
            trace: [
                { type: 'INFO', desc: 'Sorted prefix: [15, 40, 80]. Selecting key = array[3] (25).' },
                { type: 'COMPARE', desc: 'Compare key (25) vs array[2] (80) → 25 < 80.' }
            ],
            explanation: 'Because 25 < 80, element 80 shifts one position to the right to open space for the key, and the search continues leftward against 40.'
        },
        {
            algo: 'Merge Sort (Merge Step)',
            array: [12, 35, 10, 42],
            activeIdxA: 0, // Left subarray: [12, 35]
            activeIdxB: 2, // Right subarray: [10, 42]
            question: 'Merging sorted subarrays L = [12, 35] and R = [10, 42]. First comparison: L[0] (12) vs R[0] (10). Which element is written to the merged array first?',
            options: [
                { text: '10 from R[0] because 10 < 12', correct: true },
                { text: '12 from L[0] because left has priority', correct: false },
                { text: 'Both 12 and 10 simultaneously', correct: false },
                { text: '42 from R[1] because it is the largest', correct: false }
            ],
            trace: [
                { type: 'INFO', desc: 'Subarray L = [12, 35], Subarray R = [10, 42].' },
                { type: 'COMPARE', desc: 'Compare L[0] (12) vs R[0] (10).' }
            ],
            explanation: 'The merge algorithm selects the smaller of the two head elements. Since 10 < 12, R[0] (10) is written into the merged array first, and R pointer advances.'
        }
    ],

    init() {
        this.currentRound = 0;
        this.score = 0;
        this.streak = 0;
        this.totalAttempted = 0;
        this.totalCorrect = 0;
        this.loadRound(0);
        this.bindEvents();
    },

    bindEvents() {
        const nextBtn = document.getElementById('btn-next-question');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentRound++;
                if (this.currentRound < this.challenges.length) {
                    this.loadRound(this.currentRound);
                } else {
                    this.showCompletionModal();
                }
            });
        }
    },

    loadRound(roundIdx) {
        this.isAnswered = false;
        const c = this.challenges[roundIdx];

        // Update tags
        const algoTag = document.getElementById('challenge-algo-tag');
        const stageTag = document.getElementById('challenge-stage-tag');
        const qText = document.getElementById('challenge-question-text');
        const nextBtn = document.getElementById('btn-next-question');
        const feedbackCard = document.getElementById('challenge-feedback-card');
        const roundEl = document.getElementById('challenge-round');

        if (algoTag) algoTag.textContent = c.algo;
        if (stageTag) stageTag.textContent = `Round #${roundIdx + 1}`;
        if (qText) qText.textContent = c.question;
        if (nextBtn) nextBtn.classList.add('d-none');
        if (feedbackCard) feedbackCard.classList.add('d-none');
        if (roundEl) roundEl.textContent = `${roundIdx + 1} / ${this.challenges.length}`;

        this.renderCanvas(c);
        this.renderOptions(c);
        this.renderTrace(c);
    },

    renderCanvas(challenge) {
        const canvas = document.getElementById('challenge-canvas');
        if (!canvas) return;
        canvas.innerHTML = '';

        const maxVal = Math.max(...challenge.array, 100);
        challenge.array.forEach((val, idx) => {
            const bar = document.createElement('div');
            bar.className = 'duel-bar-mini';
            bar.style.height = `${(val / maxVal) * 100}%`;
            bar.style.position = 'relative';

            if (idx === challenge.pivotIdx) {
                bar.style.background = '#ef4444'; // Pivot Red
            } else if (idx === challenge.activeIdxA || idx === challenge.activeIdxB) {
                bar.style.background = '#f59e0b'; // Compare Yellow
            } else {
                bar.style.background = '#0284c7';
            }

            bar.innerHTML = `<span style="position:absolute; bottom:2px; left:50%; transform:translateX(-50%); font-size:0.68rem; color:#ffffff; font-weight:bold;">${val}</span>`;
            canvas.appendChild(bar);
        });
    },

    renderOptions(challenge) {
        const container = document.getElementById('challenge-options-container');
        if (!container) return;
        container.innerHTML = '';

        challenge.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-outline-secondary text-start p-3 small fw-semibold challenge-opt-btn';
            btn.style.borderRadius = '8px';
            btn.innerHTML = `<span class="badge bg-light text-dark border me-2">${String.fromCharCode(65 + idx)}</span> ${opt.text}`;
            btn.addEventListener('click', () => {
                if (this.isAnswered) return;
                this.evaluateAnswer(opt, btn, challenge);
            });
            container.appendChild(btn);
        });
    },

    renderTrace(challenge) {
        const tape = document.getElementById('challenge-step-tape');
        if (!tape) return;
        tape.innerHTML = '';

        challenge.trace.forEach(t => {
            const pill = document.createElement('div');
            pill.className = 'step-pill-card';
            pill.innerHTML = `
                <span class="step-pill-badge badge-compare">${t.type}</span>
                <span class="text-dark small flex-grow-1">${t.desc}</span>
            `;
            tape.appendChild(pill);
        });
    },

    evaluateAnswer(selectedOpt, btnEl, challenge) {
        this.isAnswered = true;
        this.totalAttempted++;

        const isCorrect = selectedOpt.correct;
        if (isCorrect) {
            this.streak++;
            const points = 100 * this.streak;
            this.score += points;
            this.totalCorrect++;

            btnEl.classList.remove('btn-outline-secondary');
            btnEl.classList.add('btn-success');
            if (window.AlgoAudio) window.AlgoAudio.playTone(600, 0.12, 'triangle');
        } else {
            this.streak = 0;
            btnEl.classList.remove('btn-outline-secondary');
            btnEl.classList.add('btn-danger');

            // Highlight the correct one
            document.querySelectorAll('.challenge-opt-btn').forEach(b => {
                challenge.options.forEach(opt => {
                    if (opt.correct && b.textContent.includes(opt.text)) {
                        b.classList.remove('btn-outline-secondary');
                        b.classList.add('btn-success');
                    }
                });
            });
            if (window.AlgoAudio) window.AlgoAudio.playTone(200, 0.15, 'sawtooth');
        }

        this.updateScoreboard();

        // Show feedback
        const feedbackCard = document.getElementById('challenge-feedback-card');
        const heading = document.getElementById('feedback-heading');
        const body = document.getElementById('feedback-body');
        const nextBtn = document.getElementById('btn-next-question');

        if (feedbackCard && heading && body) {
            feedbackCard.classList.remove('d-none');
            heading.textContent = isCorrect ? '🎉 Correct Prediction!' : '❌ Incorrect Prediction';
            heading.className = `h6 fw-bold mb-1 ${isCorrect ? 'text-success' : 'text-danger'}`;
            body.textContent = challenge.explanation;
        }

        if (nextBtn) {
            nextBtn.classList.remove('d-none');
            nextBtn.textContent = this.currentRound < this.challenges.length - 1 ? 'Next Challenge Round ➔' : 'View Final Score 🏆';
        }
    },

    updateScoreboard() {
        const scoreEl = document.getElementById('challenge-score');
        const streakEl = document.getElementById('challenge-streak');
        const accEl = document.getElementById('challenge-accuracy');

        if (scoreEl) scoreEl.textContent = `${this.score} pts`;
        if (streakEl) streakEl.textContent = `🔥 ${this.streak} Streak`;
        if (accEl) {
            const acc = this.totalAttempted > 0 ? Math.round((this.totalCorrect / this.totalAttempted) * 100) : 100;
            accEl.textContent = `${acc}%`;
        }
    },

    showCompletionModal() {
        const qText = document.getElementById('challenge-question-text');
        const container = document.getElementById('challenge-options-container');
        const nextBtn = document.getElementById('btn-next-question');
        const feedbackCard = document.getElementById('challenge-feedback-card');

        if (qText) qText.innerHTML = `🏆 Challenge Completed! Final Score: <strong>${this.score} pts</strong> (${this.totalCorrect}/${this.challenges.length} correct)`;
        if (container) {
            container.innerHTML = `
                <div class="alert alert-success text-center">
                    <h5>Outstanding algorithmic mastery!</h5>
                    <p class="small mb-2">You completed all ${this.challenges.length} rounds of prediction challenges.</p>
                    <button type="button" class="btn btn-primary btn-sm" onclick="DSAChallenge.init()">
                        <i class="bi bi-arrow-repeat"></i> Play Again
                    </button>
                    <a href="duel.html" class="btn btn-warning btn-sm ms-2">
                        <i class="bi bi-fire"></i> Try Duel Arena
                    </a>
                </div>
            `;
        }
        if (nextBtn) nextBtn.classList.add('d-none');
        if (feedbackCard) feedbackCard.classList.add('d-none');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    DSAChallenge.init();
});

if (typeof window !== 'undefined') {
    window.DSAChallenge = DSAChallenge;
}
