// BootScene - Generate all assets then move to title
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        // Show loading text
        const loadText = this.add.text(
            GAME_WIDTH / 2, GAME_HEIGHT / 2,
            'Loading Mystery Manor...',
            { fontFamily: 'monospace', fontSize: '12px', color: '#CCAA44' }
        ).setOrigin(0.5);

        // Generate all pixel art assets
        AssetGenerator.generateAll(this);

        // Create animations
        this.createAnimations();

        // Brief delay for dramatic effect, then go to title
        this.time.delayedCall(500, () => {
            this.scene.start('TitleScene');
        });
    }

    createAnimations() {
        // Bear walk animations
        this.anims.create({
            key: 'bear_walk_down',
            frames: this.anims.generateFrameNumbers('bear', { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'bear_walk_up',
            frames: this.anims.generateFrameNumbers('bear', { start: 2, end: 3 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'bear_walk_left',
            frames: this.anims.generateFrameNumbers('bear', { start: 4, end: 5 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'bear_walk_right',
            frames: this.anims.generateFrameNumbers('bear', { start: 6, end: 7 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'bear_idle',
            frames: [{ key: 'bear', frame: 0 }],
            frameRate: 1,
            repeat: 0
        });
        this.anims.create({
            key: 'bear_eat',
            frames: [{ key: 'bear', frame: 8 }],
            frameRate: 1,
            repeat: 0
        });
        this.anims.create({
            key: 'bear_aha',
            frames: [{ key: 'bear', frame: 9 }],
            frameRate: 1,
            repeat: 0
        });

        // NPC idle animations
        const npcTypes = ['fox', 'peacock', 'badger', 'rabbit', 'cat', 'parrot', 'victim'];
        npcTypes.forEach(type => {
            this.anims.create({
                key: `npc_${type}_idle`,
                frames: [{ key: `npc_${type}`, frame: 0 }],
                frameRate: 1,
                repeat: 0
            });
            this.anims.create({
                key: `npc_${type}_talk`,
                frames: this.anims.generateFrameNumbers(`npc_${type}`, { start: 0, end: 1 }),
                frameRate: 4,
                repeat: -1
            });
        });
    }
}
