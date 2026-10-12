/**
 * SOUNDS.JS
 * Генерация звуков через Web Audio API.
 * Никаких внешних аудиофайлов — всё синтезируется на лету.
 */

const SoundModule = {
    ctx: null,
    enabled: true,
    tickTimeout: null,

    init() {
        // AudioContext создаётся только после первого клика (требование браузеров)
        document.addEventListener('click', () => {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });

        // Кнопка вкл/выкл звука (если есть в разметке)
        const toggleBtn = document.querySelector('[data-sound-toggle]');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.enabled = !this.enabled;
                toggleBtn.textContent = this.enabled ? '🔊' : '🔇';
                localStorage.setItem('doors_sound_enabled', this.enabled);
            });
            const saved = localStorage.getItem('doors_sound_enabled');
            if (saved !== null) {
                this.enabled = saved === 'true';
                toggleBtn.textContent = this.enabled ? '🔊' : '🔇';
            }
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

    // Простой тон
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

    // Тик при прокрутке рулетки
    tick() {
        this._playTone(800 + Math.random() * 200, 0.05, 'square', 0.08);
    },

    // Звук покупки/открытия кейса (старт)
    caseOpen() {
        this._playTone(200, 0.15, 'sawtooth', 0.1);
        this._playTone(300, 0.1, 'sawtooth', 0.08, 0.05);
    },

    // Запускает серию тиков с замедлением (имитация физики рулетки CS:GO)
    playSpinTicks(totalDuration) {
        if (!this.enabled) return;
        let elapsed = 0;
        let interval = 50; // стартовый интервал между тиками (мс)

        const scheduleTick = () => {
            if (elapsed >= totalDuration - 200) return;
            this.tick();
            elapsed += interval;
            // Увеличиваем интервал — имитация замедления
            interval *= 1.08;
            this.tickTimeout = setTimeout(scheduleTick, interval);
        };

        scheduleTick();
    },

    stopTicks() {
        clearTimeout(this.tickTimeout);
    },

    // Звук результата в зависимости от редкости
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
                
