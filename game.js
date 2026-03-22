// Mystery Manor - Main Game Configuration
const GAME_WIDTH = 960;
const GAME_HEIGHT = 640;
const TILE_SIZE = 16;
const SCALE = 2; // Sprites scale 2x, but canvas renders at full res for crisp text
const TILE = TILE_SIZE * SCALE; // Effective tile size = 32px

// Speed mode (toggled from title screen)
let SPEED_MODE = false;

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, TitleScene, GameScene, AccusationScene, CombatScene, ResultScene],
    audio: {
        disableWebAudio: false
    },
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
