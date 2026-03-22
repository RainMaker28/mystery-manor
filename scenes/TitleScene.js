// TitleScene - Main menu with mode selection
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        this.cameras.main.resetFX();
        SoundManager.init();
        SoundManager.stopMusic();
        // Don't auto-play title music — browsers block it before user interaction
        // Instead, start it on first click anywhere on the scene
        this._musicStarted = false;
        this.input.on('pointerdown', () => {
            if (!this._musicStarted) {
                this._musicStarted = true;
                SoundManager.resume();
                SoundManager.playTitleMusic();
            }
        });
        const cx = GAME_WIDTH / 2;

        // Dark background
        this.cameras.main.setBackgroundColor('#1A1A2E');

        // Rain effect in background
        this.rainParticles = [];
        for (let i = 0; i < 50; i++) {
            const drop = this.add.rectangle(
                Phaser.Math.Between(0, GAME_WIDTH),
                Phaser.Math.Between(0, GAME_HEIGHT),
                2, Phaser.Math.Between(6, 12),
                0x5577AA, 0.3
            );
            this.rainParticles.push(drop);
        }

        // Manor silhouette
        this.drawManorSilhouette();

        // Title text with shadow
        this.add.text(cx + 2, 72, 'MYSTERY MANOR', {
            fontFamily: 'monospace',
            fontSize: '52px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(cx, 70, 'MYSTERY MANOR', {
            fontFamily: 'monospace',
            fontSize: '52px',
            color: '#CCAA44',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(cx, 115, 'A Bear Detective Story', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#8877AA'
        }).setOrigin(0.5);

        // Bear character preview
        if (this.textures.exists('bear')) {
            this.bearPreview = this.add.sprite(cx, 190, 'bear', 0).setScale(5);
            this.time.addEvent({
                delay: 3000,
                callback: () => {
                    if (this.bearPreview) {
                        this.bearPreview.play('bear_eat');
                        this.time.delayedCall(2000, () => {
                            if (this.bearPreview) this.bearPreview.play('bear_idle');
                        });
                    }
                },
                loop: true
            });
        }

        // Detective Mode button
        this.createButton(cx, 300, 'Detective Mode', () => {
            SoundManager.init();
            SoundManager.resume();
            SoundManager.playClick();
            SoundManager.stopMusic();
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', { mode: 'detective' });
            });
        });

        // Survival Mode button (coming soon)
        this.createButton(cx, 360, 'Survival Mode', null, true);

        this.add.text(cx + 130, 360, 'SOON', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#CCAA44',
            backgroundColor: '#333355',
            padding: { x: 6, y: 2 }
        }).setOrigin(0.5);

        // Speed mode toggle
        const speedLabel = this.add.text(cx, 420, `Quick Mode: ${SPEED_MODE ? 'ON' : 'OFF'}`, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: SPEED_MODE ? '#44CC44' : '#665588',
            backgroundColor: '#1A1A2E',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.add.text(cx, 445, 'Fewer clues needed, faster text, shorter game', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#554477'
        }).setOrigin(0.5);

        speedLabel.on('pointerdown', () => {
            SoundManager.init(); SoundManager.resume(); SoundManager.playClick();
            SPEED_MODE = !SPEED_MODE;
            speedLabel.setText(`Quick Mode: ${SPEED_MODE ? 'ON' : 'OFF'}`);
            speedLabel.setColor(SPEED_MODE ? '#44CC44' : '#665588');
        });

        // Instructions
        this.add.text(cx, 500, 'Arrow keys / WASD to move  |  Click or Space to interact  |  J for journal', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#665588'
        }).setOrigin(0.5);

        this.add.text(cx, 530, 'Find the killer. Make your accusation.', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#887799'
        }).setOrigin(0.5);

        // Flickering candle effect
        this.flickerTimer = this.time.addEvent({
            delay: 150,
            callback: this.flickerCandles,
            callbackScope: this,
            loop: true
        });

        this.flame1 = this.add.rectangle(cx - 185, 68, 6, 8, 0xFFAA22);
        this.flame2 = this.add.rectangle(cx + 185, 68, 6, 8, 0xFFAA22);

        // Fade in
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    createButton(x, y, text, callback, disabled = false) {
        const bg = this.add.rectangle(x, y, 260, 48, disabled ? 0x333344 : 0x5A4A7A)
            .setOrigin(0.5);

        const label = this.add.text(x, y, text, {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: disabled ? '#666677' : '#DDCCEE',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        if (!disabled && callback) {
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerover', () => {
                bg.setFillStyle(0x7A6A9A);
                label.setColor('#FFFFFF');
            });
            bg.on('pointerout', () => {
                bg.setFillStyle(0x5A4A7A);
                label.setColor('#DDCCEE');
            });
            bg.on('pointerdown', callback);
        }
    }

    drawManorSilhouette() {
        const g = this.add.graphics();
        g.fillStyle(0x0D0D1A, 1);
        // Main building
        g.fillRect(280, 230, 400, 420);
        // Roof
        g.fillTriangle(260, 240, 480, 150, 700, 240);
        // Towers
        g.fillRect(260, 180, 60, 470);
        g.fillRect(640, 180, 60, 470);
        // Tower tops
        g.fillTriangle(250, 190, 290, 130, 330, 190);
        g.fillTriangle(630, 190, 670, 130, 710, 190);
        // Windows (lit)
        g.fillStyle(0x2A3A5A, 0.5);
        g.fillRect(340, 270, 24, 28);
        g.fillRect(420, 270, 24, 28);
        g.fillRect(520, 270, 24, 28);
        g.fillRect(600, 270, 24, 28);
        // Door
        g.fillStyle(0x3A2A1A, 1);
        g.fillRect(456, 300, 48, 80);
    }

    flickerCandles() {
        if (this.flame1 && this.flame2) {
            const colors = [0xFFAA22, 0xFFCC44, 0xFF8811, 0xFFDD66];
            const c = colors[Phaser.Math.Between(0, colors.length - 1)];
            this.flame1.setFillStyle(c);
            this.flame2.setFillStyle(c);
            this.flame1.setSize(Phaser.Math.Between(4, 8), Phaser.Math.Between(6, 10));
            this.flame2.setSize(Phaser.Math.Between(4, 8), Phaser.Math.Between(6, 10));
        }
    }

    update() {
        this.rainParticles.forEach(drop => {
            drop.y += 3;
            if (drop.y > GAME_HEIGHT) {
                drop.y = -10;
                drop.x = Phaser.Math.Between(0, GAME_WIDTH);
            }
        });
    }
}
