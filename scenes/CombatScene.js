// CombatScene — Top-down arena fight after making an accusation
class CombatScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CombatScene' });
    }

    init(data) {
        this.accusedSuspect = data.accusedSuspect;
        this.correct = data.correct;
        this.gameState = data.gameState;
        this.npcData = data.gameState.npcData;
    }

    create() {
        try {
            this._createArena();
        } catch (e) {
            // Show error on screen so we can debug
            this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2,
                'Combat Error:\n' + e.message + '\n' + e.stack,
                { fontFamily: 'monospace', fontSize: '12px', color: '#FF0000', wordWrap: { width: 800 } }
            ).setOrigin(0.5);
        }
    }

    _createArena() {
        this.cameras.main.resetFX();
        this.cameras.main.setBackgroundColor('#2A1A3E');

        const suspectData = this.npcData[this.accusedSuspect];
        const suspectKey = 'npc_' + this.accusedSuspect;

        // ===== ARENA FLOOR (simple rectangles, no textures needed) =====
        // Checkerboard stone floor
        for (let x = 0; x < GAME_WIDTH; x += TILE) {
            for (let y = 0; y < GAME_HEIGHT; y += TILE) {
                const shade = ((x / TILE + y / TILE) % 2 === 0) ? 0x3A3450 : 0x332E48;
                this.add.rectangle(x + TILE/2, y + TILE/2, TILE, TILE, shade);
            }
        }

        // Visible border walls
        const wallColor = 0x5A4A3A;
        for (let x = 0; x < GAME_WIDTH; x += TILE) {
            this.add.rectangle(x + TILE/2, TILE/2, TILE, TILE, wallColor);
            this.add.rectangle(x + TILE/2, GAME_HEIGHT - TILE/2, TILE, TILE, wallColor);
        }
        for (let y = TILE; y < GAME_HEIGHT - TILE; y += TILE) {
            this.add.rectangle(TILE/2, y + TILE/2, TILE, TILE, wallColor);
            this.add.rectangle(GAME_WIDTH - TILE/2, y + TILE/2, TILE, TILE, wallColor);
        }

        // Physics walls (invisible colliders)
        this.walls = this.physics.add.staticGroup();
        const wb = [
            this.add.zone(GAME_WIDTH/2, TILE/2, GAME_WIDTH, TILE),
            this.add.zone(GAME_WIDTH/2, GAME_HEIGHT - TILE/2, GAME_WIDTH, TILE),
            this.add.zone(TILE/2, GAME_HEIGHT/2, TILE, GAME_HEIGHT),
            this.add.zone(GAME_WIDTH - TILE/2, GAME_HEIGHT/2, TILE, GAME_HEIGHT)
        ];
        wb.forEach(w => {
            this.physics.add.existing(w, true);
            this.walls.add(w);
        });

        // ===== BEAR (player) =====
        this.bear = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 120, 'bear', 0)
            .setScale(SCALE + 1).setDepth(10);
        this.bear.body.setSize(10, 10);
        this.bear.body.setOffset(3, 4);
        this.bear.setCollideWorldBounds(true);
        this.bearHP = 3;
        this.bearInvincible = false;
        this.bearAlive = true;
        this.bearDir = 'up';

        // ===== SUSPECT (enemy) =====
        this.enemy = this.physics.add.sprite(GAME_WIDTH / 2, 120, suspectKey, 0)
            .setScale(SCALE + 1).setDepth(10);
        this.enemy.body.setSize(12, 12);
        this.enemy.body.setOffset(2, 2);
        this.enemy.setCollideWorldBounds(true);
        this.enemyHP = SPEED_MODE ? 2 : 3;
        this.enemyMaxHP = this.enemyHP;
        this.enemyAlive = true;
        this.enemyMoveTimer = 0;
        this.enemySpeed = SPEED_MODE ? 40 : 70;

        // Wall collisions
        this.physics.add.collider(this.bear, this.walls);
        this.physics.add.collider(this.enemy, this.walls);

        // ===== BULLETS (simple array, no group) =====
        this.activeBullets = [];

        // ===== KNIFE =====
        this.knifeActive = false;
        this.knifeCooldown = 0;
        this.generateKnifeTexture();

        // ===== INPUT =====
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey('W');
        this.keyA = this.input.keyboard.addKey('A');
        this.keyS = this.input.keyboard.addKey('S');
        this.keyD = this.input.keyboard.addKey('D');

        this.actionQueue = [];
        this._onKeyDown = (e) => {
            if (e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
                e.preventDefault();
                this.actionQueue.push('attack');
            }
        };
        window.addEventListener('keydown', this._onKeyDown);
        this.input.on('pointerdown', () => this.actionQueue.push('attack'));

        this.events.once('shutdown', () => window.removeEventListener('keydown', this._onKeyDown));
        this.events.once('destroy', () => window.removeEventListener('keydown', this._onKeyDown));

        // ===== UI =====
        this.heartsText = this.add.text(20, GAME_HEIGHT - 36, this.getHeartsString(), {
            fontFamily: 'monospace', fontSize: '22px', color: '#FF4444',
            backgroundColor: '#00000088', padding: { x: 6, y: 3 }
        }).setDepth(30);

        // Enemy health bar
        this.enemyHPBarBg = this.add.rectangle(GAME_WIDTH/2, 50, 204, 18, 0x111111).setDepth(30);
        this.enemyHPBar = this.add.rectangle(GAME_WIDTH/2, 50, 200, 14, 0xCC3333).setDepth(31);
        this.add.text(GAME_WIDTH/2, 30, suspectData.name, {
            fontFamily: 'monospace', fontSize: '14px', color: suspectData.color, fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(30);

        this.add.text(GAME_WIDTH/2, GAME_HEIGHT - 36,
            'WASD/Arrows = dodge  |  Click/Space = stab', {
            fontFamily: 'monospace', fontSize: '13px', color: '#AAAACC',
            backgroundColor: '#00000088', padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setDepth(30);

        // ===== SHOOTING TIMER =====
        this.shootTimer = 0;
        this.shootInterval = SPEED_MODE ? 1200 : 700;

        // ===== INTRO OVERLAY =====
        this.gameStarted = false;
        this.introOverlay = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5).setDepth(35);

        this.introText = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - 30,
            '"' + suspectData.name + '! I\'m placing you under arrest!"', {
            fontFamily: 'monospace', fontSize: '18px', color: '#CCAA44',
            fontStyle: 'italic', backgroundColor: '#000000CC', padding: { x: 16, y: 10 }
        }).setOrigin(0.5).setDepth(40);

        var retorts = {
            fox: '"You\'ll have to catch me first, detective."',
            peacock: '"How DARE you! I\'ll show you a real performance!"',
            badger: '"Nobody arrests Boris Badger! NOBODY!"',
            rabbit: '"N-no! Stay away from me!"',
            cat: '"How uncouth. Very well... en garde."',
            parrot: '"SQUAWK! YOU\'LL NEVER TAKE ME ALIVE!"'
        };

        this.retortText = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 15,
            retorts[this.accusedSuspect] || '"..."', {
            fontFamily: 'monospace', fontSize: '14px', color: '#CC8888',
            fontStyle: 'italic', backgroundColor: '#000000CC', padding: { x: 12, y: 8 }
        }).setOrigin(0.5).setDepth(40);

        this.startPrompt = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 65,
            'Click or press Space to fight!', {
            fontFamily: 'monospace', fontSize: '16px', color: '#FFFFFF',
            backgroundColor: '#5A4A7ABB', padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setDepth(40);

        this.tweens.add({
            targets: this.startPrompt, alpha: 0.4,
            duration: 600, yoyo: true, repeat: -1
        });

        SoundManager.playCombatMusic();
        this.cameras.main.fadeIn(500);
    }

    generateKnifeTexture() {
        if (this.textures.exists('knife')) return;
        var c = document.createElement('canvas');
        c.width = 16; c.height = 16;
        var ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#CCCCDD';
        ctx.fillRect(6, 0, 4, 10);
        ctx.fillStyle = '#AAAACC';
        ctx.fillRect(7, 0, 2, 10);
        ctx.fillStyle = '#664422';
        ctx.fillRect(5, 10, 6, 5);
        ctx.fillStyle = '#CCAA44';
        ctx.fillRect(5, 10, 6, 1);
        this.textures.addCanvas('knife', c);
    }

    getHeartsString() {
        return '♥'.repeat(this.bearHP) + '♡'.repeat(3 - this.bearHP);
    }

    // ===== SHOOTING =====
    shootAtBear() {
        if (!this.enemyAlive || !this.bearAlive) return;

        var patterns = {
            fox: 'single', peacock: 'fan', badger: 'single',
            rabbit: 'burst', cat: 'ring', parrot: 'random'
        };
        var p = patterns[this.accusedSuspect] || 'single';

        if (p === 'single') {
            this.fireBullet(this.enemy.x, this.enemy.y, this.bear.x, this.bear.y, 180);
        } else if (p === 'fan') {
            var angle = Math.atan2(this.bear.y - this.enemy.y, this.bear.x - this.enemy.x);
            for (var i = 0; i < 5; i++) {
                var a = angle - 0.3 + 0.15 * i;
                this.fireBullet(this.enemy.x, this.enemy.y,
                    this.enemy.x + Math.cos(a) * 400, this.enemy.y + Math.sin(a) * 400, 150);
            }
        } else if (p === 'burst') {
            for (var i = 0; i < 3; i++) {
                this.time.delayedCall(i * 150, () => {
                    if (this.enemyAlive && this.bearAlive)
                        this.fireBullet(this.enemy.x, this.enemy.y, this.bear.x, this.bear.y, 200);
                });
            }
        } else if (p === 'ring') {
            for (var i = 0; i < 8; i++) {
                var a = (Math.PI * 2 / 8) * i;
                this.fireBullet(this.enemy.x, this.enemy.y,
                    this.enemy.x + Math.cos(a) * 400, this.enemy.y + Math.sin(a) * 400, 120);
            }
        } else if (p === 'random') {
            for (var i = 0; i < 4; i++) {
                this.fireBullet(this.enemy.x, this.enemy.y,
                    Phaser.Math.Between(50, GAME_WIDTH - 50),
                    Phaser.Math.Between(100, GAME_HEIGHT - 50), 160);
            }
        }
    }

    fireBullet(fromX, fromY, toX, toY, speed) {
        SoundManager.playBulletFire();
        // Simple colored circle as bullet - no texture needed
        var color = 0xFF4444;
        try {
            var c = this.npcData[this.accusedSuspect].color;
            color = parseInt(c.replace('#', ''), 16);
        } catch(e) {}

        var bullet = this.add.circle(fromX, fromY, 5, color).setDepth(8);
        this.physics.world.enable(bullet);
        var angle = Math.atan2(toY - fromY, toX - fromX);
        bullet.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        bullet.body.setCircle(5);
        this.activeBullets.push(bullet);

        this.time.delayedCall(3000, () => {
            if (bullet && bullet.active) bullet.destroy();
        });
    }

    // ===== COLLISION =====
    checkBulletCollisions() {
        if (!this.bearAlive || this.bearInvincible) return;
        for (var i = this.activeBullets.length - 1; i >= 0; i--) {
            var b = this.activeBullets[i];
            if (!b || !b.active) {
                this.activeBullets.splice(i, 1);
                continue;
            }
            if (b.x < -20 || b.x > GAME_WIDTH + 20 || b.y < -20 || b.y > GAME_HEIGHT + 20) {
                b.destroy();
                this.activeBullets.splice(i, 1);
                continue;
            }
            var dx = b.x - this.bear.x;
            var dy = b.y - this.bear.y;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
                b.destroy();
                this.activeBullets.splice(i, 1);
                this.bearTakeHit();
                break;
            }
        }
    }

    bearTakeHit() {
        if (this.bearInvincible || !this.bearAlive) return;
        SoundManager.playHit();
        this.bearHP--;
        this.heartsText.setText(this.getHeartsString());
        this.bearInvincible = true;

        this.bear.setTint(0xFF0000);
        this.tweens.add({
            targets: this.bear, alpha: 0.3,
            duration: 100, yoyo: true, repeat: 5,
            onComplete: () => {
                if (this.bear && this.bear.active) {
                    this.bear.clearTint();
                    this.bear.setAlpha(1);
                }
                this.bearInvincible = false;
            }
        });
        this.cameras.main.shake(200, 0.01);

        if (this.bearHP <= 0) this.bearDies();
    }

    knifeHitEnemy() {
        if (!this.enemyAlive) return;
        SoundManager.playEnemyHit();
        this.enemyHP--;

        var pct = Math.max(0, this.enemyHP / this.enemyMaxHP);
        this.enemyHPBar.setScale(pct, 1);
        this.enemyHPBar.x = GAME_WIDTH/2 - (200 * (1 - pct)) / 2;

        this.enemy.setTint(0xFFFFFF);
        this.time.delayedCall(150, () => {
            if (this.enemy && this.enemy.active) this.enemy.clearTint();
        });

        var angle = Math.atan2(this.enemy.y - this.bear.y, this.enemy.x - this.bear.x);
        this.enemy.body.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
        this.time.delayedCall(200, () => {
            if (this.enemy && this.enemy.body) this.enemy.body.setVelocity(0, 0);
        });

        if (this.enemyHP <= 0) this.enemyDies();
    }

    doKnifeAttack() {
        if (this.knifeActive || !this.bearAlive || this.knifeCooldown > 0) return;
        SoundManager.playKnifeSlash();
        this.knifeActive = true;
        this.knifeCooldown = 200; // Fast cooldown — mash away!

        var offsets = {
            up: { x: 0, y: -40 }, down: { x: 0, y: 40 },
            left: { x: -40, y: 0 }, right: { x: 40, y: 0 }
        };
        var dir = this.bearDir || 'up';
        var off = offsets[dir];

        var knife = this.physics.add.image(
            this.bear.x + off.x, this.bear.y + off.y, 'knife'
        ).setScale(SCALE + 1).setDepth(11);

        var angles = { up: 0, right: 90, down: 180, left: 270 };
        knife.setAngle(angles[dir] || 0);
        knife.body.setSize(20, 20); // Big hitbox

        this.physics.add.overlap(knife, this.enemy, () => {
            this.knifeHitEnemy();
            knife.destroy();
        });

        // Longer lunge range
        this.tweens.add({
            targets: knife,
            x: knife.x + off.x * 0.8,
            y: knife.y + off.y * 0.8,
            duration: 120,
            yoyo: true,
            onComplete: () => {
                if (knife && knife.active) knife.destroy();
                this.knifeActive = false;
            }
        });
    }

    // ===== DEATH =====
    bearDies() {
        SoundManager.stopMusic();
        this.bearAlive = false;
        this.bear.setTint(0xFF0000);
        this.bear.body.setVelocity(0, 0);

        this.time.delayedCall(500, () => {
            this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, 'DEFEATED!', {
                fontFamily: 'monospace', fontSize: '36px', color: '#CC3333', fontStyle: 'bold',
                backgroundColor: '#000000CC', padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setDepth(50);

            this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 50,
                '"A detective must know when to retreat..."', {
                fontFamily: 'monospace', fontSize: '14px', color: '#CCAA44', fontStyle: 'italic'
            }).setOrigin(0.5).setDepth(50);

            this.time.delayedCall(2500, () => this.goToResult(false));
        });
    }

    enemyDies() {
        SoundManager.stopMusic();
        this.enemyAlive = false;
        this.enemy.setTint(0xFF0000);
        this.enemy.body.setVelocity(0, 0);

        this.activeBullets.forEach(b => { if (b && b.active) b.destroy(); });
        this.activeBullets = [];

        this.time.delayedCall(300, () => {
            var name = this.npcData[this.accusedSuspect].name;
            this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, 'APPREHENDED!', {
                fontFamily: 'monospace', fontSize: '36px', color: '#44CC44', fontStyle: 'bold',
                backgroundColor: '#000000CC', padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setDepth(50);

            this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 50,
                name + ' has been captured!', {
                fontFamily: 'monospace', fontSize: '16px', color: '#CCAA44',
                backgroundColor: '#000000AA', padding: { x: 10, y: 5 }
            }).setOrigin(0.5).setDepth(50);

            this.time.delayedCall(2500, () => this.goToResult(true));
        });
    }

    goToResult(wonFight) {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('ResultScene', {
                correct: this.correct,
                wonFight: wonFight,
                accusedSuspect: this.accusedSuspect,
                killer: this.gameState.killer,
                npcData: this.gameState.npcData,
                cluesFound: this.gameState.cluesFound,
                npcsInterviewed: this.gameState.npcsInterviewed,
                gameTime: this.gameState.gameTime,
                totalClues: this.gameState.totalClues,
                weapon: this.gameState.weapon,
                crimeRoom: this.gameState.crimeRoom,
                victimName: this.gameState.victimName
            });
        });
    }

    // ===== ENEMY AI =====
    updateEnemyMovement(delta) {
        if (!this.enemyAlive) return;
        this.enemyMoveTimer += delta;
        if (this.enemyMoveTimer > 1500) {
            this.enemyMoveTimer = 0;
            var tx = Phaser.Math.Between(100, GAME_WIDTH - 100);
            var ty = Phaser.Math.Between(80, GAME_HEIGHT / 2);
            var angle = Math.atan2(ty - this.enemy.y, tx - this.enemy.x);
            this.enemy.body.setVelocity(
                Math.cos(angle) * this.enemySpeed,
                Math.sin(angle) * this.enemySpeed
            );
            this.time.delayedCall(800, () => {
                if (this.enemy && this.enemy.body && this.enemyAlive)
                    this.enemy.body.setVelocity(0, 0);
            });
        }
    }

    // ===== UPDATE =====
    update(time, delta) {
        var actions = this.actionQueue.splice(0);
        var hasAttack = actions.includes('attack');

        if (!this.gameStarted) {
            if (hasAttack) {
                this.gameStarted = true;
                if (this.introText) this.introText.destroy();
                if (this.retortText) this.retortText.destroy();
                if (this.startPrompt) this.startPrompt.destroy();
                if (this.introOverlay) this.introOverlay.destroy();
            }
            return;
        }

        if (!this.bearAlive || !this.enemyAlive) return;

        // Bear movement
        var speed = 220;
        var vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.keyA.isDown) { vx = -speed; this.bearDir = 'left'; }
        else if (this.cursors.right.isDown || this.keyD.isDown) { vx = speed; this.bearDir = 'right'; }
        if (this.cursors.up.isDown || this.keyW.isDown) { vy = -speed; this.bearDir = 'up'; }
        else if (this.cursors.down.isDown || this.keyS.isDown) { vy = speed; this.bearDir = 'down'; }

        this.bear.body.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            this.bear.play('bear_walk_' + this.bearDir, true);
        } else {
            this.bear.play('bear_idle', true);
        }

        // Attack
        if (this.knifeCooldown > 0) this.knifeCooldown -= delta;
        if (hasAttack) {
            var angle = Math.atan2(this.enemy.y - this.bear.y, this.enemy.x - this.bear.x);
            var deg = Phaser.Math.RadToDeg(angle);
            if (deg >= -45 && deg < 45) this.bearDir = 'right';
            else if (deg >= 45 && deg < 135) this.bearDir = 'down';
            else if (deg >= -135 && deg < -45) this.bearDir = 'up';
            else this.bearDir = 'left';
            this.doKnifeAttack();
        }

        // Enemy
        this.updateEnemyMovement(delta);
        this.shootTimer += delta;
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            this.shootAtBear();
        }

        // Bullet collisions
        this.checkBulletCollisions();
    }
}
