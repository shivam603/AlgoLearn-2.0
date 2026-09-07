/**
 * AlgoLearn Time-Travel Stepper & Scrubber Engine
 * Records state snapshots of the array, pointer highlights, active code lines, and operation descriptions.
 * Allows arbitrary backwards and forwards replay, pause/play, and scrubber navigation.
 */

const TimeTravel = {
    frames: [],
    currentFrameIndex: -1,
    isPlaying: false,
    playInterval: null,
    playbackSpeed: 180, // ms per frame
    onFrameRender: null,

    reset() {
        this.pause();
        this.frames = [];
        this.currentFrameIndex = -1;
        this.updateUI();
    },

    captureFrame(snapshot) {
        // snapshot: { array: number[], activeIndices: { index: number, color: string }[], desc: string, type: string, lineKey: string, phase: string }
        this.frames.push({
            id: this.frames.length,
            array: [...snapshot.array],
            activeIndices: snapshot.activeIndices ? [...snapshot.activeIndices] : [],
            desc: snapshot.desc || '',
            type: snapshot.type || 'INFO',
            lineKey: snapshot.lineKey || '',
            phase: snapshot.phase || ''
        });
        this.currentFrameIndex = this.frames.length - 1;
        this.updateUI();
    },

    jumpToFrame(index) {
        if (!this.frames.length) return;
        this.currentFrameIndex = Math.max(0, Math.min(this.frames.length - 1, index));
        this.renderCurrentFrame();
        this.updateUI();
    },

    stepForward() {
        this.pause();
        if (this.currentFrameIndex < this.frames.length - 1) {
            this.currentFrameIndex++;
            this.renderCurrentFrame();
            this.updateUI();
        }
    },

    stepBackward() {
        this.pause();
        if (this.currentFrameIndex > 0) {
            this.currentFrameIndex--;
            this.renderCurrentFrame();
            this.updateUI();
        }
    },

    play() {
        if (!this.frames.length) return;
        if (this.currentFrameIndex >= this.frames.length - 1) {
            this.currentFrameIndex = 0;
        }
        this.isPlaying = true;
        this.updatePlayPauseBtn();

        if (this.playInterval) clearInterval(this.playInterval);
        this.playInterval = setInterval(() => {
            if (this.currentFrameIndex < this.frames.length - 1) {
                this.currentFrameIndex++;
                this.renderCurrentFrame();
                this.updateUI();
            } else {
                this.pause();
            }
        }, this.playbackSpeed);
    },

    pause() {
        this.isPlaying = false;
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
        this.updatePlayPauseBtn();
    },

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    setSpeed(speedMs) {
        this.playbackSpeed = Math.max(20, Math.min(1000, speedMs));
        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    },

    renderCurrentFrame() {
        if (this.currentFrameIndex < 0 || this.currentFrameIndex >= this.frames.length) return;
        const frame = this.frames[this.currentFrameIndex];

        if (typeof this.onFrameRender === 'function') {
            this.onFrameRender(frame);
        } else if (typeof window.renderArrayBarsFromSnapshot === 'function') {
            window.renderArrayBarsFromSnapshot(frame);
        }

        if (window.CodeSync && frame.lineKey) {
            window.CodeSync.highlightLine(frame.lineKey);
        }

        if (window.AlgoAudio && frame.type === 'COMPARE' && frame.activeIndices.length >= 2) {
            const valA = frame.array[frame.activeIndices[0].index];
            const valB = frame.array[frame.activeIndices[1].index];
            window.AlgoAudio.playCompare(valA, valB);
        } else if (window.AlgoAudio && frame.type === 'SWAP' && frame.activeIndices.length >= 2) {
            const valA = frame.array[frame.activeIndices[0].index];
            const valB = frame.array[frame.activeIndices[1].index];
            window.AlgoAudio.playSwap(valA, valB);
        }
    },

    updatePlayPauseBtn() {
        const playBtns = document.querySelectorAll('.btn-stepper-play');
        playBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            const text = btn.querySelector('.stepper-play-text');
            if (this.isPlaying) {
                if (icon) icon.className = 'bi bi-pause-fill';
                if (text) text.textContent = 'Pause';
            } else {
                if (icon) icon.className = 'bi bi-play-fill';
                if (text) text.textContent = 'Play';
            }
        });
    },

    updateUI() {
        const slider = document.getElementById('stepper-slider');
        const counter = document.getElementById('stepper-counter');
        const descEl = document.getElementById('stepper-desc');
        const prevBtn = document.querySelector('.btn-stepper-prev');
        const nextBtn = document.querySelector('.btn-stepper-next');

        const total = this.frames.length;
        const cur = total > 0 ? this.currentFrameIndex + 1 : 0;

        if (slider) {
            slider.max = Math.max(0, total - 1);
            slider.value = Math.max(0, this.currentFrameIndex);
            slider.disabled = total <= 1;
        }

        if (counter) {
            counter.textContent = `${cur} / ${total} steps`;
        }

        if (prevBtn) prevBtn.disabled = this.currentFrameIndex <= 0;
        if (nextBtn) nextBtn.disabled = this.currentFrameIndex >= total - 1;

        if (descEl && this.currentFrameIndex >= 0 && this.frames[this.currentFrameIndex]) {
            descEl.textContent = this.frames[this.currentFrameIndex].desc;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('stepper-slider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            TimeTravel.jumpToFrame(parseInt(e.target.value, 10));
        });
    }

    document.querySelectorAll('.btn-stepper-play').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            TimeTravel.togglePlay();
        });
    });

    document.querySelectorAll('.btn-stepper-prev').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            TimeTravel.stepBackward();
        });
    });

    document.querySelectorAll('.btn-stepper-next').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            TimeTravel.stepForward();
        });
    });

    document.querySelectorAll('.btn-stepper-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            TimeTravel.jumpToFrame(0);
        });
    });
});

if (typeof window !== 'undefined') {
    window.TimeTravel = TimeTravel;
}
