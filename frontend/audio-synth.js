/**
 * AlgoLearn Web Audio Synthesizer
 * Generates real-time acoustic feedback for algorithm operations (comparisons, swaps, writes, sorted).
 */

const AlgoAudio = {
    ctx: null,
    enabled: localStorage.getItem('algolearn_sound_enabled') === 'true',
    volume: parseFloat(localStorage.getItem('algolearn_sound_volume') || '0.15'),
    waveform: localStorage.getItem('algolearn_sound_waveform') || 'triangle', // 'sine' | 'triangle' | 'sawtooth' | 'square'
    minFreq: 120,
    maxFreq: 900,
    activeVoices: 0,
    maxConcurrentVoices: 6,

    init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('algolearn_sound_enabled', this.enabled);
        if (this.enabled) {
            this.init();
            this.playTone(440, 0.08, 'sine');
        }
        this.updateUI();
        return this.enabled;
    },

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, parseFloat(vol)));
        localStorage.setItem('algolearn_sound_volume', this.volume);
    },

    setWaveform(type) {
        this.waveform = type;
        localStorage.setItem('algolearn_sound_waveform', type);
    },

    mapValueToFreq(val, maxVal = 250) {
        const ratio = Math.max(0, Math.min(1, val / maxVal));
        // Exponential scaling for musical pitch sensation
        return this.minFreq * Math.pow(this.maxFreq / this.minFreq, ratio);
    },

    playTone(freq, duration = 0.04, customWaveform = null) {
        if (!this.enabled || this.volume <= 0) return;
        this.init();
        if (!this.ctx) return;

        if (this.activeVoices >= this.maxConcurrentVoices) return;
        this.activeVoices++;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = customWaveform || this.waveform;
            osc.frequency.setValueAtTime(Math.max(40, Math.min(3000, freq)), this.ctx.currentTime);

            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(this.volume, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + duration + 0.01);

            osc.onended = () => {
                osc.disconnect();
                gain.disconnect();
                this.activeVoices = Math.max(0, this.activeVoices - 1);
            };
        } catch (e) {
            this.activeVoices = Math.max(0, this.activeVoices - 1);
        }
    },

    playCompare(valA, valB, maxVal = 250) {
        if (!this.enabled) return;
        const freqA = this.mapValueToFreq(valA, maxVal);
        this.playTone(freqA, 0.03, this.waveform);
        if (valB !== undefined && valB !== valA) {
            setTimeout(() => {
                const freqB = this.mapValueToFreq(valB, maxVal);
                this.playTone(freqB, 0.03, this.waveform);
            }, 15);
        }
    },

    playSwap(valA, valB, maxVal = 250) {
        if (!this.enabled) return;
        const freqA = this.mapValueToFreq(valA, maxVal);
        const freqB = this.mapValueToFreq(valB, maxVal);
        // Play quick chord
        this.playTone(freqA, 0.06, 'sawtooth');
        this.playTone(freqB, 0.06, 'sine');
    },

    playWrite(val, maxVal = 250) {
        if (!this.enabled) return;
        const freq = this.mapValueToFreq(val, maxVal);
        this.playTone(freq, 0.04, 'square');
    },

    playPivot(val, maxVal = 250) {
        if (!this.enabled) return;
        const freq = this.mapValueToFreq(val, maxVal);
        this.playTone(freq * 1.5, 0.07, 'sine');
    },

    playSortedSweep(values, maxVal = 250, delayBetween = 25) {
        if (!this.enabled || !values || !values.length) return;
        values.forEach((val, idx) => {
            setTimeout(() => {
                const freq = this.mapValueToFreq(val, maxVal);
                this.playTone(freq, 0.05, 'triangle');
            }, idx * delayBetween);
        });
    },

    updateUI() {
        const soundBtns = document.querySelectorAll('.btn-sound-toggle');
        soundBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            const text = btn.querySelector('.sound-btn-text');
            if (this.enabled) {
                btn.classList.add('btn-sound-active');
                btn.classList.remove('btn-sound-muted');
                if (icon) icon.className = 'bi bi-volume-up-fill text-sky-600';
                if (text) text.textContent = 'Sound ON';
            } else {
                btn.classList.remove('btn-sound-active');
                btn.classList.add('btn-sound-muted');
                if (icon) icon.className = 'bi bi-volume-mute-fill text-muted';
                if (text) text.textContent = 'Sound OFF';
            }
        });
    }
};

// Auto-bind sound toggle buttons when page loads
document.addEventListener('DOMContentLoaded', () => {
    AlgoAudio.updateUI();
    document.querySelectorAll('.btn-sound-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            AlgoAudio.toggle();
        });
    });

    const volSlider = document.getElementById('sound-volume-slider');
    if (volSlider) {
        volSlider.value = Math.round(AlgoAudio.volume * 100);
        volSlider.addEventListener('input', (e) => {
            AlgoAudio.setVolume(parseFloat(e.target.value) / 100);
        });
    }

    const waveSelect = document.getElementById('sound-wave-select');
    if (waveSelect) {
        waveSelect.value = AlgoAudio.waveform;
        waveSelect.addEventListener('change', (e) => {
            AlgoAudio.setWaveform(e.target.value);
        });
    }
});

if (typeof window !== 'undefined') {
    window.AlgoAudio = AlgoAudio;
}
