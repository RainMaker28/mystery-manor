// audio.js — Mystery Manor Sound Manager
// All music & SFX generated procedurally via Web Audio API
// No external audio files needed

const SoundManager = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    currentMusic: null,
    musicEnabled: true,
    sfxEnabled: true,

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.35;
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.5;
            this.sfxGain.connect(this.masterGain);
        } catch(e) {
            console.warn('Web Audio not available:', e);
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    stopMusic() {
        if (this.currentMusic) {
            try { this.currentMusic.stop(); } catch(e) {}
            this.currentMusic = null;
        }
        // Clear any lingering timeouts
        clearTimeout(this._titleTimeout);
        clearTimeout(this._investTimeout);
        clearTimeout(this._combatTimeout);
        this._titleTimeout = null;
        this._investTimeout = null;
        this._combatTimeout = null;
    },

    // =====================================================
    // UTILITY: note frequencies
    // =====================================================
    note(name, octave) {
        const notes = { C:0, 'C#':1, Db:1, D:2, 'D#':3, Eb:3, E:4, F:5, 'F#':6, Gb:6, G:7, 'G#':8, Ab:8, A:9, 'A#':10, Bb:10, B:11 };
        const semitone = notes[name];
        if (semitone === undefined) return 440;
        return 440 * Math.pow(2, (semitone - 9) / 12 + (octave - 4));
    },

    // Create an oscillator with envelope
    osc(type, freq, startTime, duration, gain, dest) {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(gain, startTime + 0.01);
        g.gain.linearRampToValueAtTime(gain * 0.7, startTime + duration * 0.6);
        g.gain.linearRampToValueAtTime(0, startTime + duration);
        o.connect(g);
        g.connect(dest || this.sfxGain);
        o.start(startTime);
        o.stop(startTime + duration + 0.05);
        return o;
    },

    // Play a sequence of notes
    playSequence(notes, bpm, waveType, dest, loopCallback) {
        if (!this.ctx) return null;
        const beatDur = 60 / bpm;
        let t = this.ctx.currentTime + 0.05;
        const startTime = t;

        notes.forEach(n => {
            if (n.note !== 'R') { // R = rest
                const freq = this.note(n.note, n.oct || 4);
                const dur = beatDur * (n.dur || 1);
                this.osc(waveType, freq, t, dur * 0.9, n.vol || 0.3, dest);
            }
            t += beatDur * (n.dur || 1);
        });

        const totalDuration = t - startTime;
        return { duration: totalDuration, endTime: t };
    },

    // =====================================================
    // TITLE THEME — Professor Layton inspired
    // Gentle waltz in 3/4, music box feel, minor key
    // =====================================================
    playTitleMusic() {
        if (!this.ctx || !this.musicEnabled) return;
        this.stopMusic();
        this.resume();

        const self = this;
        let stopped = false;

        function playLoop() {
            if (stopped) return;

            const bpm = 140;
            const beatDur = 60 / bpm;
            let t = self.ctx.currentTime + 0.05;

            // Melody — gentle, mysterious waltz (A minor / E minor feel)
            // Professor Layton has that bittersweet accordion-waltz quality
            const melody = [
                // Bar 1-2: opening phrase
                { note: 'E', oct: 5, dur: 1 }, { note: 'D', oct: 5, dur: 0.5 }, { note: 'C', oct: 5, dur: 0.5 },
                { note: 'B', oct: 4, dur: 1 }, { note: 'A', oct: 4, dur: 1 },
                { note: 'C', oct: 5, dur: 1 }, { note: 'B', oct: 4, dur: 0.5 }, { note: 'A', oct: 4, dur: 0.5 },
                { note: 'G#', oct: 4, dur: 1 }, { note: 'A', oct: 4, dur: 1 },
                // Bar 3-4: development
                { note: 'E', oct: 5, dur: 1 }, { note: 'F', oct: 5, dur: 0.5 }, { note: 'E', oct: 5, dur: 0.5 },
                { note: 'D', oct: 5, dur: 1 }, { note: 'C', oct: 5, dur: 1 },
                { note: 'B', oct: 4, dur: 0.5 }, { note: 'C', oct: 5, dur: 0.5 }, { note: 'B', oct: 4, dur: 0.5 }, { note: 'A', oct: 4, dur: 0.5 },
                { note: 'A', oct: 4, dur: 2 },
                // Bar 5-6: higher phrase
                { note: 'A', oct: 5, dur: 1 }, { note: 'G', oct: 5, dur: 0.5 }, { note: 'F', oct: 5, dur: 0.5 },
                { note: 'E', oct: 5, dur: 1 }, { note: 'D', oct: 5, dur: 1 },
                { note: 'C', oct: 5, dur: 1 }, { note: 'D', oct: 5, dur: 0.5 }, { note: 'E', oct: 5, dur: 0.5 },
                { note: 'D', oct: 5, dur: 1 }, { note: 'C', oct: 5, dur: 1 },
                // Bar 7-8: resolve
                { note: 'B', oct: 4, dur: 1 }, { note: 'C', oct: 5, dur: 0.5 }, { note: 'B', oct: 4, dur: 0.5 },
                { note: 'A', oct: 4, dur: 1.5 }, { note: 'R', dur: 0.5 },
                { note: 'E', oct: 4, dur: 1 }, { note: 'A', oct: 4, dur: 1 },
                { note: 'A', oct: 4, dur: 2 },
            ];

            // Bass — waltz pattern (oom-pah-pah)
            const bassNotes = [
                'A', 'E', 'E', 'A', 'E', 'E',
                'C', 'G', 'G', 'A', 'E', 'E',
                'F', 'C', 'C', 'E', 'B', 'B',
                'A', 'E', 'E', 'A', 'E', 'E',
                'F', 'C', 'C', 'D', 'A', 'A',
                'E', 'B', 'B', 'A', 'E', 'E',
                'F', 'C', 'C', 'E', 'B', 'B',
                'A', 'E', 'E', 'A', 'R', 'R',
            ];

            // Play melody
            melody.forEach(n => {
                if (n.note !== 'R') {
                    const freq = self.note(n.note, n.oct || 4);
                    const dur = beatDur * (n.dur || 1);
                    // Triangle wave for music box feel
                    self.osc('triangle', freq, t, dur * 0.85, 0.2, self.musicGain);
                    // Soft square wave harmony
                    self.osc('square', freq * 0.5, t, dur * 0.7, 0.06, self.musicGain);
                }
                t += beatDur * (n.dur || 1);
            });

            // Play bass
            let tb = self.ctx.currentTime + 0.05;
            bassNotes.forEach(n => {
                if (n !== 'R') {
                    const freq = self.note(n, 3);
                    self.osc('triangle', freq, tb, beatDur * 0.8, 0.12, self.musicGain);
                }
                tb += beatDur;
            });

            const totalBeats = melody.reduce((sum, n) => sum + (n.dur || 1), 0);
            const loopDuration = totalBeats * beatDur;

            self._titleTimeout = setTimeout(() => {
                if (!stopped) playLoop();
            }, loopDuration * 1000);
        }

        playLoop();
        this.currentMusic = { stop() { stopped = true; clearTimeout(self._titleTimeout); } };
    },

    // =====================================================
    // INVESTIGATION — Pink Panther inspired
    // Slinky, sneaky melody in E minor, swung rhythm
    // =====================================================
    playInvestigationMusic() {
        if (!this.ctx || !this.musicEnabled) return;
        this.stopMusic();
        this.resume();

        const self = this;
        let stopped = false;

        function playLoop() {
            if (stopped) return;

            const bpm = 120;
            const beatDur = 60 / bpm;
            let t = self.ctx.currentTime + 0.05;

            // The iconic Pink Panther riff — sneaky chromatic walk
            const melody = [
                // The classic dun-dun, dun-dun, dun-dun-dun-dun-duuun
                { note: 'E', oct: 4, dur: 0.75 }, { note: 'R', dur: 0.25 },
                { note: 'F#', oct: 4, dur: 0.75 }, { note: 'R', dur: 0.25 },
                { note: 'G', oct: 4, dur: 0.75 }, { note: 'R', dur: 0.25 },
                { note: 'G#', oct: 4, dur: 0.75 }, { note: 'R', dur: 0.25 },
                // Resolve up
                { note: 'A', oct: 4, dur: 0.5 }, { note: 'R', dur: 0.5 },
                { note: 'B', oct: 4, dur: 0.5 }, { note: 'R', dur: 0.5 },
                { note: 'E', oct: 5, dur: 1.5 }, { note: 'R', dur: 0.5 },
                // Second phrase — descending
                { note: 'E', oct: 5, dur: 0.75 }, { note: 'R', dur: 0.25 },
                { note: 'Eb', oct: 5, dur: 0.75 }, { note: 'R', dur: 0.25 },
                { note: 'D', oct: 5, dur: 0.75 }, { note: 'R', dur: 0.25 },
                { note: 'C#', oct: 5, dur: 0.75 }, { note: 'R', dur: 0.25 },
                // Slinky resolve
                { note: 'C', oct: 5, dur: 0.5 }, { note: 'B', oct: 4, dur: 0.5 },
                { note: 'A', oct: 4, dur: 0.5 }, { note: 'G', oct: 4, dur: 0.5 },
                { note: 'E', oct: 4, dur: 1.5 }, { note: 'R', dur: 0.5 },
                // Repeat with variation
                { note: 'E', oct: 4, dur: 0.5 }, { note: 'G', oct: 4, dur: 0.5 },
                { note: 'B', oct: 4, dur: 0.5 }, { note: 'E', oct: 5, dur: 0.5 },
                { note: 'D', oct: 5, dur: 0.75 }, { note: 'C', oct: 5, dur: 0.75 },
                { note: 'B', oct: 4, dur: 0.5 },
                { note: 'A', oct: 4, dur: 0.5 }, { note: 'G#', oct: 4, dur: 0.5 },
                { note: 'A', oct: 4, dur: 0.5 }, { note: 'B', oct: 4, dur: 0.5 },
                { note: 'E', oct: 4, dur: 2 }, { note: 'R', dur: 1 },
            ];

            // Walking bass — slinky pizzicato feel
            const bassPattern = [
                'E', 'R', 'B', 'R', 'E', 'R', 'B', 'R',
                'A', 'R', 'E', 'R', 'A', 'R', 'E', 'R',
                'E', 'R', 'B', 'R', 'E', 'R', 'B', 'R',
                'A', 'R', 'G', 'R', 'E', 'R', 'R', 'R',
                'E', 'R', 'G', 'R', 'B', 'R', 'E', 'R',
                'A', 'R', 'G#', 'R', 'A', 'R', 'B', 'R',
                'E', 'R', 'R', 'R', 'R', 'R', 'R', 'R',
            ];

            // Play melody with sawtooth for that sax-like tone
            melody.forEach(n => {
                if (n.note !== 'R') {
                    const freq = self.note(n.note, n.oct || 4);
                    const dur = beatDur * (n.dur || 1);
                    self.osc('sawtooth', freq, t, dur * 0.8, 0.1, self.musicGain);
                    // Sub-octave for warmth
                    self.osc('triangle', freq * 0.5, t, dur * 0.6, 0.06, self.musicGain);
                }
                t += beatDur * (n.dur || 1);
            });

            // Play bass
            let tb = self.ctx.currentTime + 0.05;
            bassPattern.forEach(n => {
                if (n !== 'R') {
                    const freq = self.note(n, 2);
                    self.osc('triangle', freq, tb, beatDur * 0.7, 0.15, self.musicGain);
                }
                tb += beatDur * 0.5;
            });

            const totalBeats = melody.reduce((sum, n) => sum + (n.dur || 1), 0);
            const loopDuration = totalBeats * beatDur;

            self._investTimeout = setTimeout(() => {
                if (!stopped) playLoop();
            }, loopDuration * 1000);
        }

        playLoop();
        this.currentMusic = { stop() { stopped = true; clearTimeout(self._investTimeout); } };
    },

    // =====================================================
    // COMBAT — Megalovania inspired
    // Driving, intense, D minor, fast square wave lead
    // =====================================================
    playCombatMusic() {
        if (!this.ctx || !this.musicEnabled) return;
        this.stopMusic();
        this.resume();

        const self = this;
        let stopped = false;

        function playLoop() {
            if (stopped) return;

            const bpm = 240; // Fast!
            const beatDur = 60 / bpm;
            let t = self.ctx.currentTime + 0.05;

            // Megalovania-inspired melody
            // The iconic opening: D D D(octave up) A... Ab G F D F G
            const melody = [
                // Bar 1-2: the iconic riff
                { note: 'D', oct: 4, dur: 1 }, { note: 'D', oct: 4, dur: 1 },
                { note: 'D', oct: 5, dur: 1 }, { note: 'R', dur: 0.5 }, { note: 'A', oct: 4, dur: 1.5 },
                { note: 'R', dur: 0.5 }, { note: 'Ab', oct: 4, dur: 1.5 },
                { note: 'G', oct: 4, dur: 1 }, { note: 'F', oct: 4, dur: 1 },
                { note: 'D', oct: 4, dur: 1 }, { note: 'F', oct: 4, dur: 1 }, { note: 'G', oct: 4, dur: 1 },
                // Bar 3-4: second phrase
                { note: 'C', oct: 4, dur: 1 }, { note: 'C', oct: 4, dur: 1 },
                { note: 'D', oct: 5, dur: 1 }, { note: 'R', dur: 0.5 }, { note: 'A', oct: 4, dur: 1.5 },
                { note: 'R', dur: 0.5 }, { note: 'Ab', oct: 4, dur: 1.5 },
                { note: 'G', oct: 4, dur: 1 }, { note: 'F', oct: 4, dur: 1 },
                { note: 'D', oct: 4, dur: 1 }, { note: 'F', oct: 4, dur: 1 }, { note: 'G', oct: 4, dur: 1 },
                // Bar 5-6: variation going higher
                { note: 'B', oct: 3, dur: 1 }, { note: 'B', oct: 3, dur: 1 },
                { note: 'D', oct: 5, dur: 1 }, { note: 'R', dur: 0.5 }, { note: 'A', oct: 4, dur: 1.5 },
                { note: 'R', dur: 0.5 }, { note: 'Ab', oct: 4, dur: 1.5 },
                { note: 'G', oct: 4, dur: 1 }, { note: 'F', oct: 4, dur: 1 },
                { note: 'D', oct: 4, dur: 1 }, { note: 'F', oct: 4, dur: 1 }, { note: 'G', oct: 4, dur: 1 },
                // Bar 7-8: ending phrase
                { note: 'Bb', oct: 3, dur: 1 }, { note: 'Bb', oct: 3, dur: 1 },
                { note: 'D', oct: 5, dur: 1 }, { note: 'R', dur: 0.5 }, { note: 'A', oct: 4, dur: 1.5 },
                { note: 'R', dur: 0.5 }, { note: 'Ab', oct: 4, dur: 1.5 },
                { note: 'G', oct: 4, dur: 1 }, { note: 'F', oct: 4, dur: 1 },
                { note: 'D', oct: 4, dur: 1 }, { note: 'F', oct: 4, dur: 1 }, { note: 'G', oct: 4, dur: 1 },
            ];

            // Driving bass
            const bassNotes = [
                'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D',
                'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C',
                'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B',
                'Bb', 'Bb', 'Bb', 'Bb', 'Bb', 'Bb', 'Bb', 'Bb', 'Bb', 'Bb', 'Bb', 'Bb',
            ];

            // Melody — square wave for that chiptune punch
            melody.forEach(n => {
                if (n.note !== 'R') {
                    const freq = self.note(n.note, n.oct || 4);
                    const dur = beatDur * (n.dur || 1);
                    self.osc('square', freq, t, dur * 0.85, 0.15, self.musicGain);
                }
                t += beatDur * (n.dur || 1);
            });

            // Bass — triangle wave, pumping
            let tb = self.ctx.currentTime + 0.05;
            bassNotes.forEach(n => {
                if (n !== 'R') {
                    const freq = self.note(n, 2);
                    self.osc('triangle', freq, tb, beatDur * 0.8, 0.18, self.musicGain);
                }
                tb += beatDur;
            });

            // Simple drum-like kick on every beat
            for (let i = 0; i < 48; i++) {
                const kickT = self.ctx.currentTime + 0.05 + i * beatDur;
                if (i % 2 === 0) {
                    const kickOsc = self.ctx.createOscillator();
                    const kickGain = self.ctx.createGain();
                    kickOsc.type = 'sine';
                    kickOsc.frequency.setValueAtTime(150, kickT);
                    kickOsc.frequency.exponentialRampToValueAtTime(30, kickT + 0.1);
                    kickGain.gain.setValueAtTime(0.2, kickT);
                    kickGain.gain.linearRampToValueAtTime(0, kickT + 0.1);
                    kickOsc.connect(kickGain);
                    kickGain.connect(self.musicGain);
                    kickOsc.start(kickT);
                    kickOsc.stop(kickT + 0.15);
                }
            }

            const totalBeats = melody.reduce((sum, n) => sum + (n.dur || 1), 0);
            const loopDuration = totalBeats * beatDur;

            self._combatTimeout = setTimeout(() => {
                if (!stopped) playLoop();
            }, loopDuration * 1000);
        }

        playLoop();
        this.currentMusic = { stop() { stopped = true; clearTimeout(self._combatTimeout); } };
    },

    // =====================================================
    // VICTORY JINGLE — Jazzy, triumphant
    // =====================================================
    playVictoryJingle() {
        if (!this.ctx || !this.sfxEnabled) return;
        this.resume();
        const t = this.ctx.currentTime;
        const bpm = 180;
        const b = 60 / bpm;

        // Triumphant jazz lick — rising, punchy, celebratory
        const notes = [
            { note: 'C', oct: 5, time: 0, dur: 0.5 },
            { note: 'E', oct: 5, time: b*0.5, dur: 0.5 },
            { note: 'G', oct: 5, time: b*1, dur: 0.5 },
            { note: 'A', oct: 5, time: b*1.5, dur: 0.5 },
            { note: 'B', oct: 5, time: b*2, dur: 0.3 },
            { note: 'R', time: b*2.3, dur: 0.2 },
            { note: 'G', oct: 5, time: b*2.5, dur: 0.3 },
            { note: 'A', oct: 5, time: b*2.8, dur: 0.3 },
            { note: 'C', oct: 6, time: b*3.5, dur: 1.5 },
            { note: 'E', oct: 5, time: b*3.5, dur: 1.5 }, // harmony
        ];

        notes.forEach(n => {
            if (n.note !== 'R') {
                const freq = this.note(n.note, n.oct);
                this.osc('square', freq, t + n.time, n.dur, 0.15, this.sfxGain);
                this.osc('triangle', freq, t + n.time, n.dur, 0.1, this.sfxGain);
            }
        });
    },

    // =====================================================
    // DEFEAT JINGLE — Sad, descending
    // =====================================================
    playDefeatJingle() {
        if (!this.ctx || !this.sfxEnabled) return;
        this.resume();
        const t = this.ctx.currentTime;
        const b = 0.25;

        const notes = [
            { note: 'E', oct: 5, time: 0 },
            { note: 'Eb', oct: 5, time: b },
            { note: 'D', oct: 5, time: b*2 },
            { note: 'C#', oct: 5, time: b*3 },
            { note: 'C', oct: 5, time: b*4 },
            { note: 'B', oct: 4, time: b*5 },
            { note: 'Bb', oct: 4, time: b*6 },
            { note: 'A', oct: 4, time: b*8, dur: 1.5 },
        ];

        notes.forEach(n => {
            const freq = this.note(n.note, n.oct);
            this.osc('triangle', freq, t + n.time, n.dur || 0.3, 0.2, this.sfxGain);
        });
    },

    // =====================================================
    // SOUND EFFECTS
    // =====================================================

    // Footstep — soft tap
    playFootstep() {
        if (!this.ctx || !this.sfxEnabled) return;
        this.resume();
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(200 + Math.random() * 100, t);
        o.frequency.exponentialRampToValueAtTime(80, t + 0.06);
        g.gain.setValueAtTime(0.08, t);
        g.gain.linearRampToValueAtTime(0, t + 0.06);
        o.connect(g);
        g.connect(this.sfxGain);
        o.start(t);
        o.stop(t + 0.08);
    },

    // Door transition — whooshy creak
    playDoorOpen() {
        if (!this.ctx || !this.sfxEnabled) return;
        this.resume();
        const t = this.ctx.currentTime;
        // Creak (rising pitch)
        const o1 = this.ctx.createOscillator();
        const g1 = this.ctx.createGain();
        o1.type = 'sawtooth';
        o1.frequency.setValueAtTime(80, t);
        o1.frequency.exponentialRampToValueAtTime(300, t + 0.3);
        g1.gain.setValueAtTime(0.06, t);
        g1.gain.linearRampToValueAtTime(0, t + 0.3);
        o1.connect(g1);
        g1.connect(this.sfxGain);
        o1.start(t);
        o1.stop(t + 0.35);

        // Low thud
        const o2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        o2.type = 'sine';
        o2.frequency.setValueAtTime(60, t + 0.1);
        o2.frequency.exponentialRampToValueAtTime(30, t + 0.4);
        g2.gain.setValueAtTime(0.15, t + 0.1);
        g2.gain.linearRampToValueAtTime(0, t + 0.4);
        o2.connect(g2);
        g2.connect(this.sfxGain);
        o2.start(t + 0.1);
        o2.stop(t + 0.45);
    },

    // Clue found — magical rising chime
    playClueFound() {
        if (!this.ctx || !this.sfxEnabled) return;
        this.resume();
        const t = this.ctx.currentTime;
        const notes = [
            { freq: this.note('E', 5), time: 0 },
            { freq: this.note('G', 5), time: 0.1 },
            { freq: this.note('B', 5), time: 0.2 },
            { freq: this.note('E', 6), time: 0.35 },
        ];
        notes.forEach(n => {
            this.osc('triangle', n.freq, t + n.time, 0.3, 0.2, this.sfxGain);
            this.osc('square', n.freq * 2, t + n.time, 0.15, 0.05, this.sfxGain);
        });
    },

    // Dialogue blip — per character, short boop
    _lastBlipTime: 0,
    playDialogueBlip() {
        if (!this.ctx || !this.sfxEnabled) return;
        const now = this.ctx.currentTime;
        if (now - this._lastBlipTime < 0.04) return; // throttle
        this._lastBlipTime = now;
        this.resume();
        const freq = 380 + Math.random() * 80;
        this.osc('square', freq, now, 0.04, 0.06, this.sfxGain);
    },

    // NPC dialogue blip — different pitch per character
    playNPCBlip(npcType) {
        if (!this.ctx || !this.sfxEnabled) return;
        const now = this.ctx.currentTime;
        if (now - this._lastBlipTime < 0.04) return;
        this._lastBlipTime = now;
        this.resume();
        const pitches = {
            fox: 280, peacock: 500, badger: 180,
            rabbit: 550, cat: 350, parrot: 600
        };
        const freq = (pitches[npcType] || 400) + Math.random() * 40;
        this.osc('square', freq, now, 0.04, 0.06, this.sfxGain);
    },

    // Knife slash
    playKnifeSlash() {
        if (!this.ctx || !this.sfxEnabled) return;
        this.resume();
        const t = this.ctx.currentTime;
        // White noise burst for slash
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.15, t);
        g.gain.linearRampToValueAtTime(0, t + 0.1);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        noise.connect(filter);
        filter.connect(g);
        g.connect(this.sfxGain);
        noise.start(t);
        noise.stop(t + 0.12);

        // Metallic ring
        this.osc('square', 800, t, 0.08, 0.08, this.sfxGain);
        this.osc('square', 1200, t + 0.02, 0.06, 0.05, this.sfxGain);
    },

    // Bullet fire
    playBulletFire() {
        if (!this.ctx || !this.sfxEnabled) return;
        this.resume();
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(600, t);
        o.frequency.exponentialRampToValueAtTime(100, t + 0.15);
        g.gain.setValueAtTime(0.1, t);
        g.gain.linearRampToValueAtTime(0, t + 0.15);
        o.connect(g);
        g.connect(this.sfxGain);
        o.start(t);
        o.stop(t + 0.18);
    },

    // Player hit — ouch
    playHit() {
        if (!this.ctx || !this.sfxEnabled) return;
        this.resume();
        const t = this.ctx.currentTime;
        this.osc('square', 200, t, 0.1, 0.2, this.sfxGain);
        this.osc('square', 150, t + 0.05, 0.15, 0.15, this.sfxGain);
        this.osc('sine', 80, t, 0.2, 0.2, this.sfxGain);
    },

    // Enemy hit
    playEnemyHit() {
        if (!this.ctx || !this.sfxEnabled) return;
        this.resume();
        const t = this.ctx.currentTime;
        this.osc('square', 400, t, 0.08, 0.12, this.sfxGain);
        this.osc('triangle', 300, t + 0.04, 0.08, 0.1, this.sfxGain);
    },

    // Accusation drumroll
    playDrumroll() {
        if (!this.ctx || !this.sfxEnabled) return;
        this.resume();
        const t = this.ctx.currentTime;
        // Snare-like noise hits, getting faster
        for (let i = 0; i < 20; i++) {
            const delay = i * (0.12 - i * 0.004); // accelerating
            const bufferSize = this.ctx.sampleRate * 0.05;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) data[j] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const g = this.ctx.createGain();
            const vol = 0.05 + (i / 20) * 0.15;
            g.gain.setValueAtTime(vol, t + delay);
            g.gain.linearRampToValueAtTime(0, t + delay + 0.05);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000;
            noise.connect(filter);
            filter.connect(g);
            g.connect(this.sfxGain);
            noise.start(t + delay);
            noise.stop(t + delay + 0.06);
        }
    },

    // UI click
    playClick() {
        if (!this.ctx || !this.sfxEnabled) return;
        this.resume();
        const t = this.ctx.currentTime;
        this.osc('square', 600, t, 0.05, 0.08, this.sfxGain);
    },

    // Accusation sting — dramatic!
    playAccusationSting() {
        if (!this.ctx || !this.sfxEnabled) return;
        this.resume();
        const t = this.ctx.currentTime;
        this.osc('square', this.note('D', 4), t, 0.3, 0.15, this.sfxGain);
        this.osc('square', this.note('F', 4), t, 0.3, 0.15, this.sfxGain);
        this.osc('square', this.note('Ab', 4), t, 0.3, 0.15, this.sfxGain);
        // Resolve
        this.osc('triangle', this.note('D', 3), t + 0.35, 0.5, 0.2, this.sfxGain);
        this.osc('square', this.note('D', 5), t + 0.35, 0.5, 0.1, this.sfxGain);
    },
};
