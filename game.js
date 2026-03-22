// Mystery Manor - Main Game Configuration
const TILE_SIZE = 16;
const SCALE = 2; // Sprites scale 2x, but canvas renders at full res for crisp text
const TILE = TILE_SIZE * SCALE; // Effective tile size = 32px

// On mobile, match the screen's aspect ratio so there are zero black bars
// Keep height at 640 and stretch width to fit the screen exactly
const _isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
const _screenW = window.innerWidth || 960;
const _screenH = window.innerHeight || 640;
const _aspect = _screenW / _screenH;

let GAME_WIDTH, GAME_HEIGHT;
if (_isMobile) {
    // In landscape, width > height, so aspect > 1
    // In portrait (before rotation), aspect < 1 — still set landscape dims
    if (_aspect >= 1) {
        GAME_HEIGHT = 640;
        GAME_WIDTH = Math.round(640 * _aspect);
    } else {
        // Portrait: assume they'll rotate, so use inverted aspect
        GAME_HEIGHT = 640;
        GAME_WIDTH = Math.round(640 / _aspect);
    }
} else {
    GAME_WIDTH = 960;
    GAME_HEIGHT = 640;
}

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
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
