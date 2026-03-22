// Mystery Manor - Main Game Configuration
const GAME_WIDTH = 960;
const GAME_HEIGHT = 640;
const TILE_SIZE = 16;
const SCALE = 2; // Sprites scale 2x, but canvas renders at full res for crisp text
const TILE = TILE_SIZE * SCALE; // Effective tile size = 32px

// Speed mode (toggled from title screen)
let SPEED_MODE = false;

// Safe zone: how much the ENVELOP scaling crops off each edge (in game coords)
// Updated after game boots — scenes use this to keep UI visible
const SAFE = { top: 0, bottom: GAME_HEIGHT, left: 0, right: GAME_WIDTH };

function updateSafeZone() {
    if (!game || !game.canvas) return;
    const cw = game.canvas.clientWidth || GAME_WIDTH;
    const ch = game.canvas.clientHeight || GAME_HEIGHT;
    const scaleX = cw / GAME_WIDTH;
    const scaleY = ch / GAME_HEIGHT;
    const scale = Math.max(scaleX, scaleY); // ENVELOP uses max
    const visibleW = cw / scale;
    const visibleH = ch / scale;
    const cropX = (GAME_WIDTH - visibleW) / 2;
    const cropY = (GAME_HEIGHT - visibleH) / 2;
    SAFE.top = Math.ceil(cropY) + 4;
    SAFE.bottom = GAME_HEIGHT - Math.ceil(cropY) - 4;
    SAFE.left = Math.ceil(cropX) + 4;
    SAFE.right = GAME_WIDTH - Math.ceil(cropX) - 4;
}

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

// Recalculate safe zone when the game resizes or orientation changes
window.addEventListener('resize', () => { setTimeout(updateSafeZone, 100); });
game.events.on('ready', updateSafeZone);
