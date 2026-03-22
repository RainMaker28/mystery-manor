// ResultScene - Win or lose reveal (now with combat outcomes)
class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultScene' });
    }

    init(data) {
        this.correct = data.correct;           // Did they pick the real killer?
        this.wonFight = data.wonFight;          // Did they win the combat?
        this.accusedSuspect = data.accusedSuspect;
        this.killer = data.killer;
        this.npcData = data.npcData;
        this.cluesFound = data.cluesFound;
        this.npcsInterviewed = data.npcsInterviewed;
        this.gameTime = data.gameTime;
        this.totalClues = data.totalClues;
        this.weapon = data.weapon;
        this.crimeRoom = data.crimeRoom;
        this.victimName = data.victimName;
    }

    create() {
        this.cameras.main.resetFX();
        if (TouchControls.enabled) TouchControls.hide();
        this.cameras.main.setBackgroundColor('#0D0D1A');
        this.cameras.main.fadeIn(1000);

        const cx = GAME_WIDTH / 2;
        const killerData = this.npcData[this.killer];
        const accusedData = this.npcData[this.accusedSuspect];

        // 4 outcomes:
        // 1. Won fight + correct accusation  → BEST: Case solved, killer caught
        // 2. Won fight + wrong accusation    → Beat an innocent person, real killer escapes
        // 3. Lost fight + correct accusation → You were right but they got away
        // 4. Lost fight + wrong accusation   → Total failure

        if (this.wonFight && this.correct) {
            SoundManager.playVictoryJingle();
            this.showPerfectVictory(cx, killerData);
        } else if (this.wonFight && !this.correct) {
            SoundManager.playDefeatJingle();
            this.showWrongAccusation(cx, killerData, accusedData);
        } else if (!this.wonFight && this.correct) {
            SoundManager.playDefeatJingle();
            this.showKillerEscaped(cx, killerData);
        } else {
            SoundManager.playDefeatJingle();
            this.showTotalDefeat(cx, killerData, accusedData);
        }
    }

    // --- OUTCOME 1: Won fight + correct accusation ---
    showPerfectVictory(cx, killerData) {
        this.time.delayedCall(500, () => {
            this.add.text(cx, 30, 'CASE SOLVED!', {
                fontFamily: 'monospace', fontSize: '40px', color: '#44CC44', fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(cx, 65, 'You defeated and unmasked the killer!', {
                fontFamily: 'monospace', fontSize: '16px', color: '#88CC88'
            }).setOrigin(0.5);

            this.add.sprite(cx - 60, 140, 'bear', 9).setScale(5);
            this.add.sprite(cx + 60, 140, `npc_${this.killer}`, 0).setScale(5).setAlpha(0.6);
            this.add.text(cx, 140, '⛓', { fontSize: '28px' }).setOrigin(0.5);

            this.add.text(cx, 200, `"${killerData.name}, you are under arrest\nfor the murder of ${this.victimName}!"`, {
                fontFamily: 'monospace', fontSize: '15px', color: '#CCAA44', fontStyle: 'italic', align: 'center'
            }).setOrigin(0.5);

            const confessions = {
                fox: '"Very well, detective. I confess. Lord Reginald discovered I\'d been embezzling."',
                peacock: '"Fine! He threatened to reveal I can\'t actually sing! My career would be ruined!"',
                badger: '"He insulted my cooking for the LAST time! Nobody criticises Boris\'s soufflé!"',
                rabbit: '"I-I didn\'t mean to! He caught me stealing the silverware... I panicked!"',
                cat: '"The old fool found my gambling debts. He was going to cut me off entirely."',
                parrot: '"SQUAWK! He tried to put me in a CAGE! NOBODY cages Captain Polly! SQUAWK!"'
            };

            this.add.text(cx, 260, confessions[this.killer], {
                fontFamily: 'monospace', fontSize: '13px', color: '#CC8888', fontStyle: 'italic',
                wordWrap: { width: 700 }, align: 'center'
            }).setOrigin(0.5);

            this.showCaseReport(cx, 300);

            let rating = '⭐';
            if (this.cluesFound.length >= this.totalClues * 0.8 && this.npcsInterviewed.length === 6) rating = '⭐⭐⭐';
            else if (this.cluesFound.length >= this.totalClues * 0.5) rating = '⭐⭐';

            this.add.text(cx, 460, `Detective Rating: ${rating}`, {
                fontFamily: 'monospace', fontSize: '20px', color: '#CCAA44'
            }).setOrigin(0.5);

            this.createConfetti();
        });

        this.time.delayedCall(2000, () => this.addPlayAgain(cx));
    }

    // --- OUTCOME 2: Won fight + wrong accusation ---
    showWrongAccusation(cx, killerData, accusedData) {
        this.time.delayedCall(500, () => {
            this.add.text(cx, 30, 'WRONG SUSPECT!', {
                fontFamily: 'monospace', fontSize: '40px', color: '#CC8833', fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(cx, 65, `You defeated ${accusedData.name}... but they weren't the killer!`, {
                fontFamily: 'monospace', fontSize: '16px', color: '#CC8888', align: 'center'
            }).setOrigin(0.5);

            this.add.sprite(cx - 80, 150, 'bear', 0).setScale(5);
            this.add.sprite(cx, 150, `npc_${this.accusedSuspect}`, 0).setScale(5).setAlpha(0.5);
            this.add.sprite(cx + 80, 150, `npc_${this.killer}`, 0).setScale(5);

            this.add.text(cx + 80, 105, '← REAL KILLER', {
                fontFamily: 'monospace', fontSize: '11px', color: '#CC3333'
            }).setOrigin(0.5);

            this.add.text(cx, 220, `"Wait... ${accusedData.name} is innocent?!"`, {
                fontFamily: 'monospace', fontSize: '16px', color: '#CCAA44', fontStyle: 'italic'
            }).setOrigin(0.5);

            this.add.text(cx, 260, `The real killer was ${killerData.name}!`, {
                fontFamily: 'monospace', fontSize: '20px', color: '#CC3333', fontStyle: 'bold'
            }).setOrigin(0.5);

            const taunts = {
                fox: '"Better luck next time, detective. I\'m quite good at covering my tracks."',
                peacock: '"Oh darling, did you really think you could outsmart ME?"',
                badger: '"Ha! You couldn\'t find a clue if it was served on a silver platter!"',
                rabbit: '"Oh... I\'m actually quite relieved and terrified at the same time!"',
                cat: '"*adjusts monocle* Elementary, my dear bear. You weren\'t clever enough."',
                parrot: '"SQUAWK! FOOLED YOU! Captain Polly wins again! HAHAHAHA!"'
            };

            this.add.text(cx, 310, taunts[this.killer], {
                fontFamily: 'monospace', fontSize: '13px', color: '#CC8888', fontStyle: 'italic',
                wordWrap: { width: 700 }, align: 'center'
            }).setOrigin(0.5);

            this.add.text(cx, 370, '"I won the fight, but got the wrong suspect.\nBack to detective school for me..."', {
                fontFamily: 'monospace', fontSize: '15px', color: '#CCAA44', fontStyle: 'italic', align: 'center'
            }).setOrigin(0.5);

            this.showCaseReport(cx, 410);
        });

        this.time.delayedCall(2000, () => this.addPlayAgain(cx));
    }

    // --- OUTCOME 3: Lost fight + correct accusation ---
    showKillerEscaped(cx, killerData) {
        this.time.delayedCall(500, () => {
            this.add.text(cx, 30, 'THE KILLER ESCAPED!', {
                fontFamily: 'monospace', fontSize: '40px', color: '#CC3333', fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(cx, 65, 'You were right... but they overpowered you!', {
                fontFamily: 'monospace', fontSize: '16px', color: '#CC8888'
            }).setOrigin(0.5);

            this.add.sprite(cx - 60, 150, 'bear', 0).setScale(5).setAlpha(0.5);
            this.add.sprite(cx + 60, 150, `npc_${this.killer}`, 0).setScale(5);

            this.add.text(cx, 220, `${killerData.name} WAS the killer!`, {
                fontFamily: 'monospace', fontSize: '20px', color: '#CCAA44', fontStyle: 'bold'
            }).setOrigin(0.5);

            const escapeLines = {
                fox: '"You figured it out... but you\'ll never catch me now! *vanishes into the night*"',
                peacock: '"Bravo, detective! Correct! But a star like me always makes a dramatic exit!"',
                badger: '"You\'re right, it was me. But you\'re too slow! Boris escapes!"',
                rabbit: '"Eep! You knew it was me?! Well... bye!! *sprints away at rabbit speed*"',
                cat: '"Impressive deduction. But nine lives means nine escapes. *disappears*"',
                parrot: '"SQUAWK! RIGHT ANSWER! WRONG OUTCOME! Captain Polly flies free! SQUAWK!"'
            };

            this.add.text(cx, 280, escapeLines[this.killer], {
                fontFamily: 'monospace', fontSize: '13px', color: '#CC8888', fontStyle: 'italic',
                wordWrap: { width: 700 }, align: 'center'
            }).setOrigin(0.5);

            this.add.text(cx, 340, '"My detective instincts were right...\nbut I need to work on my fighting skills!"', {
                fontFamily: 'monospace', fontSize: '15px', color: '#CCAA44', fontStyle: 'italic', align: 'center'
            }).setOrigin(0.5);

            this.showCaseReport(cx, 400);
        });

        this.time.delayedCall(2000, () => this.addPlayAgain(cx));
    }

    // --- OUTCOME 4: Lost fight + wrong accusation ---
    showTotalDefeat(cx, killerData, accusedData) {
        this.time.delayedCall(500, () => {
            this.add.text(cx, 30, 'TOTAL DEFEAT!', {
                fontFamily: 'monospace', fontSize: '40px', color: '#CC3333', fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(cx, 65, 'Wrong suspect AND they beat you in combat!', {
                fontFamily: 'monospace', fontSize: '16px', color: '#CC4444'
            }).setOrigin(0.5);

            this.add.sprite(cx - 80, 150, 'bear', 0).setScale(5).setAlpha(0.4);
            this.add.sprite(cx, 150, `npc_${this.accusedSuspect}`, 0).setScale(5);
            this.add.sprite(cx + 80, 150, `npc_${this.killer}`, 0).setScale(5);

            this.add.text(cx + 80, 105, '← REAL KILLER', {
                fontFamily: 'monospace', fontSize: '11px', color: '#CC3333'
            }).setOrigin(0.5);

            this.add.text(cx, 220, `${accusedData.name} was innocent!\n${killerData.name} was the real killer!`, {
                fontFamily: 'monospace', fontSize: '18px', color: '#CC8833', fontStyle: 'bold', align: 'center'
            }).setOrigin(0.5);

            const mockLines = {
                fox: '"Oh dear, wrong on ALL counts! Perhaps try a different profession?"',
                peacock: '"Darling, that was EMBARRASSING. Wrong person AND you lost the fight!"',
                badger: '"Hah! You got everything wrong! Worst detective ever!"',
                rabbit: '"Oh no, you got beaten up AND blamed the wrong person... that\'s rough."',
                cat: '"Completely wrong. How utterly... predictable. *yawns*"',
                parrot: '"SQUAWK! WRONG WRONG WRONG! WORST DETECTIVE EVER! SQUAWK HAHAHA!"'
            };

            this.add.text(cx, 290, mockLines[this.killer], {
                fontFamily: 'monospace', fontSize: '13px', color: '#CC8888', fontStyle: 'italic',
                wordWrap: { width: 700 }, align: 'center'
            }).setOrigin(0.5);

            this.add.text(cx, 350, '"I need more practice... at EVERYTHING.\nBut a bear never gives up!"', {
                fontFamily: 'monospace', fontSize: '15px', color: '#CCAA44', fontStyle: 'italic', align: 'center'
            }).setOrigin(0.5);

            this.showCaseReport(cx, 410);
        });

        this.time.delayedCall(2000, () => this.addPlayAgain(cx));
    }

    // --- Shared helpers ---
    showCaseReport(cx, startY) {
        this.add.text(cx, startY, '--- CASE REPORT ---', {
            fontFamily: 'monospace', fontSize: '14px', color: '#8877AA'
        }).setOrigin(0.5);

        const m = Math.floor(this.gameTime / 60), s = this.gameTime % 60;
        this.add.text(cx, startY + 45, [
            `Time: ${m}m ${s}s`,
            `Clues: ${this.cluesFound.length}/${this.totalClues}`,
            `Interviews: ${this.npcsInterviewed.length}/6`,
            `Weapon: ${this.weapon}`,
            `Scene: ${this.crimeRoom}`
        ].join('  |  '), {
            fontFamily: 'monospace', fontSize: '12px', color: '#887799', align: 'center'
        }).setOrigin(0.5);
    }

    addPlayAgain(cx) {
        const btn = this.add.rectangle(cx, 560, 280, 40, 0x5A4A7A).setInteractive({ useHandCursor: true });
        const label = this.add.text(cx, 560, 'Play Again (New Mystery)', {
            fontFamily: 'monospace', fontSize: '16px', color: '#DDCCEE'
        }).setOrigin(0.5);

        btn.on('pointerover', () => { btn.setFillStyle(0x7A6A9A); label.setColor('#FFFFFF'); });
        btn.on('pointerout', () => { btn.setFillStyle(0x5A4A7A); label.setColor('#DDCCEE'); });
        btn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'));
        });
    }

    createConfetti() {
        const colors = [0xFF4444, 0x44FF44, 0x4444FF, 0xFFFF44, 0xFF44FF, 0x44FFFF, 0xCCAA44];
        for (let i = 0; i < 60; i++) {
            const c = this.add.rectangle(
                Phaser.Math.Between(0, GAME_WIDTH), -10,
                Phaser.Math.Between(4, 8), Phaser.Math.Between(4, 8),
                colors[Phaser.Math.Between(0, colors.length - 1)]
            );
            this.tweens.add({
                targets: c, y: GAME_HEIGHT + 20,
                x: c.x + Phaser.Math.Between(-80, 80),
                angle: Phaser.Math.Between(0, 360),
                duration: Phaser.Math.Between(2000, 4000),
                delay: Phaser.Math.Between(0, 1500),
                ease: 'Quad.easeIn'
            });
        }
    }
}
