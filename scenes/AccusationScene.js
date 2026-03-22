// AccusationScene - Pick the killer from the lineup, then fight them
class AccusationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AccusationScene' });
    }

    init(data) {
        // Store full game state so we can pass it back or forward
        this.gameState = data;
        this.npcData = data.npcData;
        this.killer = data.killer;
    }

    create() {
        this.cameras.main.resetFX();
        if (TouchControls.enabled) TouchControls.hide();
        this.cameras.main.setBackgroundColor('#1A1A2E');
        this.cameras.main.fadeIn(500);
        updateSafeZone();

        const cx = GAME_WIDTH / 2;
        const sy = (y) => SAFE.top + 8 + (y - 40) / 480 * (SAFE.bottom - SAFE.top - 16);

        this.add.text(cx, sy(40), 'THE ACCUSATION', {
            fontFamily: 'monospace', fontSize: '28px', color: '#CC3333', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(cx, sy(72), 'Who killed ' + this.gameState.victimName + '?', {
            fontFamily: 'monospace', fontSize: '16px', color: '#CCAA44'
        }).setOrigin(0.5);

        // Suspect lineup
        const suspects = ['fox', 'peacock', 'badger', 'rabbit', 'cat', 'parrot'];
        const startX = 100;
        const spacing = (GAME_WIDTH - 200) / 5;
        const lineupY = sy(200);

        suspects.forEach((suspect, i) => {
            const x = startX + i * spacing;
            const y = lineupY;
            const data = this.npcData[suspect];

            const bg = this.add.rectangle(x, y, 110, 130, 0x2A2A4E)
                .setInteractive({ useHandCursor: true });
            const border = this.add.rectangle(x, y, 114, 134, 0x444466);
            border.setStrokeStyle(2, 0x444466);
            border.setFillStyle(0, 0);

            this.add.sprite(x, y - 18, `npc_${suspect}`, 0).setScale(3.5);

            this.add.text(x, y + 36, data.name.split(' ')[0], {
                fontFamily: 'monospace', fontSize: '12px', color: data.color
            }).setOrigin(0.5);

            this.add.text(x, y + 50, data.role, {
                fontFamily: 'monospace', fontSize: '10px', color: '#8877AA'
            }).setOrigin(0.5);

            if (this.gameState.npcsInterviewed.includes(suspect)) {
                this.add.text(x + 42, y - 52, '✓', {
                    fontFamily: 'monospace', fontSize: '16px', color: '#44CC44'
                }).setOrigin(0.5);
            }

            bg.on('pointerover', () => {
                bg.setFillStyle(0x4A4A6E);
                border.setStrokeStyle(3, 0xCCAA44);
            });
            bg.on('pointerout', () => {
                bg.setFillStyle(0x2A2A4E);
                border.setStrokeStyle(2, 0x444466);
            });
            bg.on('pointerdown', () => this.makeAccusation(suspect));
        });

        this.add.sprite(cx, sy(370), 'bear', 0).setScale(3.5);

        this.add.text(cx, sy(410), '"Let me think carefully... One of you is the killer."', {
            fontFamily: 'monospace', fontSize: '13px', color: '#CCAA44', fontStyle: 'italic'
        }).setOrigin(0.5);

        this.add.text(cx, sy(445), `Evidence: ${this.gameState.cluesFound.length} clues | ${this.gameState.npcsInterviewed.length} interviews`, {
            fontFamily: 'monospace', fontSize: '13px', color: '#665588'
        }).setOrigin(0.5);

        // Go back button — restores full game state
        const backBtn = this.add.text(cx, sy(490), '[ Go back and investigate more ]', {
            fontFamily: 'monospace', fontSize: '14px', color: '#665588'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        backBtn.on('pointerover', () => backBtn.setColor('#CCAA44'));
        backBtn.on('pointerout', () => backBtn.setColor('#665588'));
        backBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', {
                    mode: 'detective',
                    restoreState: this.gameState
                });
            });
        });
    }

    makeAccusation(suspect) {
        // Go to CombatScene — fight the accused, THEN reveal
        SoundManager.playDrumroll();
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('CombatScene', {
                accusedSuspect: suspect,
                correct: suspect === this.killer,
                gameState: this.gameState
            });
        });
    }
}
