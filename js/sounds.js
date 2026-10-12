/**
 * SOUNDS.JS
 * Генерация звуков через Web Audio API. Аудиофайлы не нужны.
 */

const SoundModule = {
    ctx: null,
    enabled: true,
    tickTimeoutId: null,

    init() {
        this.enabled = Storage.getSoundEnabled();

        document.addEventListener('click', () => {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });

        const toggleBtn = document.querySelector('[data-sound-toggle]');
        if (toggleBtn) {
            toggleBtn.textContent = this.enabled ? '🔊' : '🔇';
            toggleBtn.addEventListener('click', () => {
                this.enabled = !this.enabled;
                toggleBtn.textContent = this.enabled ? '🔊' : '🔇';
                Storage.setSoundEnabled(this.enabled);
            });
        }
    },

    _ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    _playTone(freq, duration, type = 'sine', volume = 0.15, delay = 0) {
        if (!this.enabled) return;
        this._ensureContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    },

    tick() {
        this._playTone(800 + Math.random() * 200, 0.05, 'square', 0.08);
    },

    caseOpen() {
        this._playTone(200, 0.15, 'sawtooth', 0.1);
        this._playTone(300, 0.1, 'sawtooth', 0.08, 0.05);
    },

    playSpinTicks(totalDuration) {
        if (!this.enabled) return;
        let elapsed = 0;
        let interval = 50;

        const scheduleTick = () => {
            if (elapsed >= totalDuration - 200) return;
            this.tick();
            elapsed += interval;
            interval *= 1.08;
            this.tickTimeoutId = setTimeout(scheduleTick, interval);
        };

        scheduleTick();
    },

    stopTicks() {
        clearTimeout(this.tickTimeoutId);
    },

    reveal(rarity) {
        if (!this.enabled) return;

        const sounds = {
            common: () => {
                this._playTone(440, 0.2, 'sine', 0.15);
            },
            uncommon: () => {
                this._playTone(523, 0.15, 'sine', 0.15);
                this._playTone(659, 0.2, 'sine', 0.15, 0.1);
            },
            rare: () => {
                this._playTone(523, 0.15, 'triangle', 0.15);
                this._playTone(659, 0.15, 'triangle', 0.15, 0.1);
                this._playTone(784, 0.25, 'triangle', 0.15, 0.2);
            },
            epic: () => {
                this._playTone(392, 0.15, 'sawtooth', 0.12);
                this._playTone(523, 0.15, 'sawtooth', 0.12, 0.1);
                this._playTone(659, 0.15, 'sawtooth', 0.12, 0.2);
                this._playTone(784, 0.3, 'sawtooth', 0.15, 0.3);
            },
            legendary: () => {
                this._playTone(392, 0.2, 'square', 0.12);
                this._playTone(523, 0.2, 'square', 0.12, 0.15);
                this._playTone(659, 0.2, 'square', 0.12, 0.3);
                this._playTone(784, 0.2, 'square', 0.15, 0.45);
                this._playTone(1047, 0.5, 'square', 0.18, 0.6);
            },
            mythic: () => {
                [392, 523, 659, 784, 1047, 1319].forEach((freq, i) => {
                    this._playTone(freq, 0.25, 'square', 0.15, i * 0.12);
                });
                this._playTone(1568, 0.8, 'sawtooth', 0.2, 0.9);
            }
        };

        (sounds[rarity] || sounds.common)();
    },

    upgradeSpin() {
        this._playTone(300, 0.1, 'square', 0.1);
    },

    upgradeWin() {
        this._playTone(523, 0.15, 'square', 0.15);
        this._playTone(784, 0.15, 'square', 0.15, 0.1);
        this._playTone(1047, 0.4, 'square', 0.2, 0.2);
    },

    upgradeLose() {
        this._playTone(300, 0.3, 'sawtooth', 0.15);
        this._playTone(200, 0.4, 'sawtooth', 0.15, 0.2);
    },

    click() {
        this._playTone(600, 0.05, 'square', 0.08);
    },

    bonus() {
        [523, 659, 784, 1047].forEach((freq, i) => {
            this._playTone(freq, 0.2, 'sine', 0.15, i * 0.1);
        });
    }
};
