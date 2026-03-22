// touch.js — Virtual joystick + action button for mobile/tablet
// Only shows on touch-capable devices. Invisible on desktop.

const TouchControls = {
    enabled: false,
    joystick: null,
    actionBtn: null,
    joyData: { active: false, dx: 0, dy: 0 },
    actionPressed: false,
    _actionQueue: null, // reference to scene's action queue

    init() {
        // Only enable on touch devices
        if (!('ontouchstart' in window) && !navigator.maxTouchPoints) return;
        this.enabled = true;
        this.createOverlay();
    },

    createOverlay() {
        // Container div over the game canvas
        if (document.getElementById('touch-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'touch-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1000;';
        document.body.appendChild(overlay);

        // ===== JOYSTICK (bottom-left) =====
        const joyBase = document.createElement('div');
        joyBase.id = 'joy-base';
        joyBase.style.cssText = `
            position:absolute; bottom:20px; left:20px;
            width:130px; height:130px; border-radius:50%;
            background:rgba(255,255,255,0.12); border:2px solid rgba(255,255,255,0.25);
            pointer-events:auto; touch-action:none;
        `;
        overlay.appendChild(joyBase);

        const joyKnob = document.createElement('div');
        joyKnob.id = 'joy-knob';
        joyKnob.style.cssText = `
            position:absolute; width:50px; height:50px; border-radius:50%;
            background:rgba(255,255,255,0.4); border:2px solid rgba(255,255,255,0.6);
            top:50%; left:50%; transform:translate(-50%,-50%);
            pointer-events:none;
        `;
        joyBase.appendChild(joyKnob);

        this.joystick = { base: joyBase, knob: joyKnob };

        // Joystick touch handling
        const self = this;
        const baseRect = () => joyBase.getBoundingClientRect();

        joyBase.addEventListener('touchstart', (e) => {
            e.preventDefault();
            self.joyData.active = true;
            self._updateJoystick(e.touches[0], baseRect());
        }, { passive: false });

        joyBase.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (self.joyData.active) {
                self._updateJoystick(e.touches[0], baseRect());
            }
        }, { passive: false });

        joyBase.addEventListener('touchend', (e) => {
            e.preventDefault();
            self.joyData.active = false;
            self.joyData.dx = 0;
            self.joyData.dy = 0;
            joyKnob.style.transform = 'translate(-50%,-50%)';
        }, { passive: false });

        joyBase.addEventListener('touchcancel', (e) => {
            self.joyData.active = false;
            self.joyData.dx = 0;
            self.joyData.dy = 0;
            joyKnob.style.transform = 'translate(-50%,-50%)';
        });

        // ===== ACTION BUTTON (bottom-right) =====
        const actBtn = document.createElement('div');
        actBtn.id = 'action-btn';
        actBtn.style.cssText = `
            position:absolute; bottom:35px; right:30px;
            width:80px; height:80px; border-radius:50%;
            background:rgba(204,170,68,0.25); border:3px solid rgba(204,170,68,0.5);
            pointer-events:auto; touch-action:none;
            display:flex; align-items:center; justify-content:center;
            font-family:monospace; font-size:13px; color:rgba(255,255,255,0.7);
            font-weight:bold; user-select:none; -webkit-user-select:none;
        `;
        actBtn.textContent = 'ACT';
        overlay.appendChild(actBtn);

        this.actionBtn = actBtn;

        actBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            self.actionPressed = true;
            actBtn.style.background = 'rgba(204,170,68,0.5)';
            actBtn.style.transform = 'scale(0.9)';
        }, { passive: false });

        actBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            self.actionPressed = false;
            actBtn.style.background = 'rgba(204,170,68,0.25)';
            actBtn.style.transform = 'scale(1)';
        }, { passive: false });

        actBtn.addEventListener('touchcancel', (e) => {
            self.actionPressed = false;
            actBtn.style.background = 'rgba(204,170,68,0.25)';
            actBtn.style.transform = 'scale(1)';
        });
    },

    _updateJoystick(touch, rect) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = touch.clientX - cx;
        let dy = touch.clientY - cy;

        // Clamp to radius
        const maxR = rect.width / 2 - 10;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxR) {
            dx = (dx / dist) * maxR;
            dy = (dy / dist) * maxR;
        }

        // Normalize to -1..1
        this.joyData.dx = dx / maxR;
        this.joyData.dy = dy / maxR;

        // Move knob visually
        this.joystick.knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    },

    // Call from scene's update to get movement
    getMovement(speed) {
        if (!this.enabled || !this.joyData.active) return { vx: 0, vy: 0, dir: null };

        const deadzone = 0.2;
        let vx = 0, vy = 0, dir = null;

        if (Math.abs(this.joyData.dx) > deadzone || Math.abs(this.joyData.dy) > deadzone) {
            vx = this.joyData.dx * speed;
            vy = this.joyData.dy * speed;

            // Determine primary direction for animation
            if (Math.abs(this.joyData.dx) > Math.abs(this.joyData.dy)) {
                dir = this.joyData.dx > 0 ? 'right' : 'left';
            } else {
                dir = this.joyData.dy > 0 ? 'down' : 'up';
            }
        }

        return { vx, vy, dir };
    },

    // Check if action button was just pressed (consume the press)
    // In 'hold' mode, returns true every call while held (for combat mashing)
    consumeAction(holdMode) {
        if (holdMode) {
            return this.actionPressed;
        }
        if (this.actionPressed) {
            this.actionPressed = false;
            return true;
        }
        return false;
    },

    // Set button label (changes between scenes)
    setButtonLabel(text) {
        if (this.actionBtn) {
            this.actionBtn.textContent = text;
        }
    },

    // Show/hide controls
    show() {
        const el = document.getElementById('touch-overlay');
        if (el) el.style.display = 'block';
    },

    hide() {
        const el = document.getElementById('touch-overlay');
        if (el) el.style.display = 'none';
    },

    destroy() {
        const el = document.getElementById('touch-overlay');
        if (el) el.remove();
    }
};
