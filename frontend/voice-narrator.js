/**
 * AlgoLearn AI Voiceover & Narration Engine
 * Utilizes the browser's Web Speech API to provide live spoken commentary during algorithm execution.
 */

const VoiceNarrator = {
    synth: typeof window !== 'undefined' ? window.speechSynthesis : null,
    enabled: localStorage.getItem('algolearn_voice_enabled') === 'true',
    rate: parseFloat(localStorage.getItem('algolearn_voice_rate') || '1.15'),
    pitch: 1.0,
    voice: null,
    lastSpokenTime: 0,
    minIntervalMs: 800, // Debounce rapid triggers

    init() {
        if (!this.synth) return;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
        this.updateUI();
    },

    loadVoices() {
        if (!this.synth) return;
        const voices = this.synth.getVoices();
        // Prefer natural English voices (Google, Samantha, Daniel, Karen, Alex)
        this.voice = voices.find(v => (v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen')))) 
                  || voices.find(v => v.lang.startsWith('en')) 
                  || voices[0];
    },

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('algolearn_voice_enabled', this.enabled);
        if (this.enabled) {
            this.speak('Voice commentary activated.', true);
        } else {
            this.stop();
        }
        this.updateUI();
        return this.enabled;
    },

    speak(text, force = false) {
        if (!this.enabled || !this.synth) return;

        const now = Date.now();
        if (!force && now - this.lastSpokenTime < this.minIntervalMs) {
            return; // Throttle to prevent speech backlog
        }
        this.lastSpokenTime = now;

        try {
            this.synth.cancel(); // Cancel current phrase to speak immediate state
            const utterance = new SpeechSynthesisUtterance(text);
            if (this.voice) utterance.voice = this.voice;
            utterance.rate = this.rate;
            utterance.pitch = this.pitch;
            this.synth.speak(utterance);
        } catch (e) {
            console.warn('Speech synthesis error:', e);
        }
    },

    stop() {
        if (this.synth) {
            this.synth.cancel();
        }
    },

    updateUI() {
        document.querySelectorAll('.btn-voice-toggle').forEach(btn => {
            const icon = btn.querySelector('i');
            const label = btn.querySelector('.voice-btn-text');
            if (this.enabled) {
                btn.classList.add('btn-voice-active');
                btn.classList.remove('btn-voice-muted');
                if (icon) icon.className = 'bi bi-mic-fill text-danger';
                if (label) label.textContent = 'Voice ON';
            } else {
                btn.classList.remove('btn-voice-active');
                btn.classList.add('btn-voice-muted');
                if (icon) icon.className = 'bi bi-mic-mute-fill text-muted';
                if (label) label.textContent = 'Voice OFF';
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    VoiceNarrator.init();
    document.querySelectorAll('.btn-voice-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            VoiceNarrator.toggle();
        });
    });
});

if (typeof window !== 'undefined') {
    window.VoiceNarrator = VoiceNarrator;
}
