// Mystery Manor - Runtime Pixel Art Asset Generator
// All sprites and tiles are drawn procedurally — no external files needed

const AssetGenerator = {

    // Color palettes
    COLORS: {
        bear: { body: '#8B6914', dark: '#6B4F10', light: '#A88832', hat: '#CC3333', coat: '#2244AA', coatDark: '#1A3388', suitcase: '#664422', nose: '#222222', eyes: '#222222' },
        fox: { body: '#D4762C', dark: '#B85A1A', light: '#E89850', outfit: '#333333', outfitLight: '#555555', eyes: '#2A5A2A' },
        peacock: { body: '#1A6B5A', dark: '#0E4A3C', light: '#2A9B7A', plume: '#2244CC', plumeLight: '#44AAFF', eyes: '#AA2222' },
        badger: { body: '#888888', dark: '#555555', light: '#BBBBBB', stripe: '#FFFFFF', hat: '#FFFFFF', eyes: '#222222' },
        rabbit: { body: '#DDCCBB', dark: '#BBAA99', light: '#EEDDCC', ears: '#FFAAAA', apron: '#FFFFFF', eyes: '#AA3333' },
        cat: { body: '#222222', dark: '#111111', light: '#444444', hat: '#222222', monocle: '#CCAA44', eyes: '#44CC44' },
        parrot: { body: '#CC2222', dark: '#991111', light: '#EE4444', wing: '#22AA22', beak: '#FFAA22', eyes: '#222222' },
        victim: { body: '#AA8866', dark: '#886644', light: '#CCAA88', outfit: '#774488', eyes: '#222222' }
    },

    generateAll(scene) {
        this.generateBear(scene);
        this.generateNPCs(scene);
        this.generateTiles(scene);
        this.generateFurniture(scene);
        this.generateUI(scene);
        this.generateEffects(scene);
    },

    // Helper: create a canvas, draw on it, add as texture
    makeTexture(scene, key, width, height, drawFn) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx);
        if (scene.textures.exists(key)) scene.textures.remove(key);
        scene.textures.addCanvas(key, canvas);
    },

    // Helper: create spritesheet from canvas
    makeSpriteSheet(scene, key, frameW, frameH, frames, drawFn) {
        const canvas = document.createElement('canvas');
        canvas.width = frameW * frames;
        canvas.height = frameH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx, frameW, frameH);
        if (scene.textures.exists(key)) scene.textures.remove(key);
        scene.textures.addSpriteSheet(key, canvas, { frameWidth: frameW, frameHeight: frameH });
    },

    px(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
    },

    rect(ctx, x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    },

    // ===================== BEAR DETECTIVE =====================
    generateBear(scene) {
        const c = this.COLORS.bear;
        // 4 directions x 2 walk frames = 8 frames, plus idle(eating) + aha = 10 frames
        // Frame order: down0, down1, up0, up1, left0, left1, right0, right1, idle, aha
        this.makeSpriteSheet(scene, 'bear', 16, 16, 10, (ctx, fw, fh) => {
            for (let f = 0; f < 10; f++) {
                const ox = f * fw;
                this.drawBearFrame(ctx, ox, f, c);
            }
        });
    },

    drawBearFrame(ctx, ox, frame, c) {
        const dir = Math.floor(frame / 2); // 0=down,1=up,2=left,3=right
        const step = frame % 2;

        // Special frames
        if (frame === 8) { this.drawBearIdle(ctx, ox, c); return; }
        if (frame === 9) { this.drawBearAha(ctx, ox, c); return; }

        // Body
        this.rect(ctx, ox+5, 6, 6, 7, c.body);
        this.rect(ctx, ox+6, 5, 4, 1, c.body);

        // Head
        this.rect(ctx, ox+4, 1, 8, 5, c.body);
        this.rect(ctx, ox+5, 0, 6, 1, c.body);

        // Coat (blue)
        this.rect(ctx, ox+5, 7, 6, 5, c.coat);
        this.rect(ctx, ox+4, 8, 1, 3, c.coat);
        this.rect(ctx, ox+11, 8, 1, 3, c.coat);

        // Hat (red)
        this.rect(ctx, ox+5, 0, 6, 2, c.hat);
        this.rect(ctx, ox+4, 1, 8, 1, c.hat);

        if (dir === 0) { // Facing down
            // Face
            this.px(ctx, ox+6, 3, c.eyes);
            this.px(ctx, ox+9, 3, c.eyes);
            this.px(ctx, ox+7, 4, c.nose);
            this.px(ctx, ox+8, 4, c.nose);
            // Ears
            this.px(ctx, ox+4, 1, c.light);
            this.px(ctx, ox+11, 1, c.light);
        } else if (dir === 1) { // Facing up
            this.px(ctx, ox+4, 1, c.light);
            this.px(ctx, ox+11, 1, c.light);
            // Back of hat
            this.rect(ctx, ox+5, 0, 6, 2, c.hat);
        } else if (dir === 2) { // Facing left
            this.px(ctx, ox+5, 3, c.eyes);
            this.px(ctx, ox+5, 4, c.nose);
            this.px(ctx, ox+4, 1, c.light);
            // Suitcase in right hand
            this.rect(ctx, ox+10, 10, 3, 3, c.suitcase);
            this.rect(ctx, ox+10, 10, 3, 1, c.dark);
        } else { // Facing right
            this.px(ctx, ox+10, 3, c.eyes);
            this.px(ctx, ox+10, 4, c.nose);
            this.px(ctx, ox+11, 1, c.light);
            // Suitcase in left hand
            this.rect(ctx, ox+3, 10, 3, 3, c.suitcase);
            this.rect(ctx, ox+3, 10, 3, 1, c.dark);
        }

        // Legs (with walk animation)
        if (step === 0) {
            this.rect(ctx, ox+6, 12, 2, 3, c.dark);
            this.rect(ctx, ox+9, 12, 2, 3, c.dark);
        } else {
            this.rect(ctx, ox+5, 12, 2, 3, c.dark);
            this.rect(ctx, ox+10, 12, 2, 3, c.dark);
        }

        // Feet
        this.rect(ctx, ox+5, 14, 3, 2, c.dark);
        this.rect(ctx, ox+9, 14, 3, 2, c.dark);
    },

    drawBearIdle(ctx, ox, c) {
        // Bear eating a marmalade sandwich
        this.rect(ctx, ox+5, 6, 6, 7, c.body);
        this.rect(ctx, ox+6, 5, 4, 1, c.body);
        this.rect(ctx, ox+4, 1, 8, 5, c.body);
        this.rect(ctx, ox+5, 0, 6, 1, c.body);
        this.rect(ctx, ox+5, 7, 6, 5, c.coat);
        this.rect(ctx, ox+5, 0, 6, 2, c.hat);
        this.rect(ctx, ox+4, 1, 8, 1, c.hat);
        // Face
        this.px(ctx, ox+6, 3, c.eyes);
        this.px(ctx, ox+9, 3, c.eyes);
        // Sandwich near mouth
        this.rect(ctx, ox+7, 4, 3, 2, '#FFAA44');
        this.rect(ctx, ox+7, 4, 3, 1, '#DD8822');
        // Legs
        this.rect(ctx, ox+6, 12, 2, 4, c.dark);
        this.rect(ctx, ox+9, 12, 2, 4, c.dark);
    },

    drawBearAha(ctx, ox, c) {
        // Bear holding something up triumphantly
        this.rect(ctx, ox+5, 6, 6, 7, c.body);
        this.rect(ctx, ox+6, 5, 4, 1, c.body);
        this.rect(ctx, ox+4, 1, 8, 5, c.body);
        this.rect(ctx, ox+5, 0, 6, 1, c.body);
        this.rect(ctx, ox+5, 7, 6, 5, c.coat);
        this.rect(ctx, ox+5, 0, 6, 2, c.hat);
        this.rect(ctx, ox+4, 1, 8, 1, c.hat);
        // Face - excited
        this.px(ctx, ox+6, 3, c.eyes);
        this.px(ctx, ox+9, 3, c.eyes);
        this.px(ctx, ox+7, 5, c.nose);
        this.px(ctx, ox+8, 5, c.nose);
        // Raised arm with sparkle
        this.rect(ctx, ox+11, 3, 2, 1, c.coat);
        this.rect(ctx, ox+12, 1, 2, 2, '#FFFF44');
        this.px(ctx, ox+13, 0, '#FFFF88');
        this.px(ctx, ox+14, 1, '#FFFF88');
        // Legs
        this.rect(ctx, ox+6, 12, 2, 4, c.dark);
        this.rect(ctx, ox+9, 12, 2, 4, c.dark);
    },

    // ===================== NPC SUSPECTS =====================
    generateNPCs(scene) {
        this.generateNPC(scene, 'npc_fox', this.COLORS.fox, 'fox');
        this.generateNPC(scene, 'npc_peacock', this.COLORS.peacock, 'peacock');
        this.generateNPC(scene, 'npc_badger', this.COLORS.badger, 'badger');
        this.generateNPC(scene, 'npc_rabbit', this.COLORS.rabbit, 'rabbit');
        this.generateNPC(scene, 'npc_cat', this.COLORS.cat, 'cat');
        this.generateNPC(scene, 'npc_parrot', this.COLORS.parrot, 'parrot');
        this.generateNPC(scene, 'npc_victim', this.COLORS.victim, 'victim');
    },

    generateNPC(scene, key, c, type) {
        // 2 frames: idle, talking
        this.makeSpriteSheet(scene, key, 16, 16, 2, (ctx, fw, fh) => {
            for (let f = 0; f < 2; f++) {
                const ox = f * fw;
                this.drawNPCFrame(ctx, ox, f, c, type);
            }
        });
    },

    drawNPCFrame(ctx, ox, frame, c, type) {
        // Base body
        this.rect(ctx, ox+5, 6, 6, 7, c.body);
        this.rect(ctx, ox+6, 5, 4, 1, c.body);
        this.rect(ctx, ox+4, 1, 8, 5, c.body);
        this.rect(ctx, ox+5, 0, 6, 1, c.body);
        // Legs
        this.rect(ctx, ox+6, 12, 2, 4, c.dark);
        this.rect(ctx, ox+9, 12, 2, 4, c.dark);

        switch(type) {
            case 'fox':
                // Butler outfit
                this.rect(ctx, ox+5, 7, 6, 5, c.outfit);
                this.rect(ctx, ox+7, 7, 2, 1, c.outfitLight); // bow tie
                // Pointy ears
                this.px(ctx, ox+4, 0, c.body);
                this.px(ctx, ox+11, 0, c.body);
                // Snout
                this.rect(ctx, ox+6, 4, 4, 2, c.light);
                this.px(ctx, ox+7, 4, c.dark); // nose
                // Eyes
                this.px(ctx, ox+6, 2, c.eyes);
                this.px(ctx, ox+9, 2, c.eyes);
                // Tail
                this.rect(ctx, ox+12, 8, 2, 1, c.body);
                this.px(ctx, ox+14, 7, c.light);
                break;

            case 'peacock':
                // Plumage on head
                this.rect(ctx, ox+5, -1, 6, 2, c.plume);
                this.px(ctx, ox+7, -1, c.plumeLight);
                this.px(ctx, ox+9, -1, c.plumeLight);
                this.px(ctx, ox+6, 0, c.plumeLight);
                // Beak
                this.rect(ctx, ox+7, 4, 2, 1, '#DDAA22');
                // Eyes
                this.px(ctx, ox+6, 3, c.eyes);
                this.px(ctx, ox+9, 3, c.eyes);
                // Tail feathers
                this.rect(ctx, ox+2, 8, 3, 4, c.plume);
                this.rect(ctx, ox+11, 8, 3, 4, c.plume);
                this.px(ctx, ox+2, 9, c.plumeLight);
                this.px(ctx, ox+13, 9, c.plumeLight);
                break;

            case 'badger':
                // Chef hat
                this.rect(ctx, ox+5, -2, 6, 3, c.hat);
                this.rect(ctx, ox+4, 0, 8, 1, c.hat);
                // White stripe on face
                this.rect(ctx, ox+7, 1, 2, 4, c.stripe);
                // Eyes
                this.px(ctx, ox+6, 3, c.eyes);
                this.px(ctx, ox+9, 3, c.eyes);
                // Nose
                this.px(ctx, ox+7, 4, c.dark);
                // Apron
                this.rect(ctx, ox+6, 8, 4, 4, '#DDDDDD');
                break;

            case 'rabbit':
                // Long ears
                this.rect(ctx, ox+5, -3, 2, 4, c.body);
                this.rect(ctx, ox+9, -3, 2, 4, c.body);
                this.px(ctx, ox+5, -2, c.ears);
                this.px(ctx, ox+10, -2, c.ears);
                // Apron
                this.rect(ctx, ox+6, 7, 4, 5, c.apron);
                // Face
                this.px(ctx, ox+6, 3, c.eyes);
                this.px(ctx, ox+9, 3, c.eyes);
                this.px(ctx, ox+7, 4, '#FFAAAA');
                this.px(ctx, ox+8, 4, '#FFAAAA');
                break;

            case 'cat':
                // Top hat
                this.rect(ctx, ox+5, -3, 6, 4, c.hat);
                this.rect(ctx, ox+4, 0, 8, 1, c.dark);
                // Pointy ears
                this.px(ctx, ox+4, 0, c.body);
                this.px(ctx, ox+11, 0, c.body);
                // Monocle
                this.px(ctx, ox+9, 2, c.monocle);
                this.px(ctx, ox+10, 3, c.monocle);
                this.px(ctx, ox+9, 3, c.monocle);
                // Eyes
                this.px(ctx, ox+6, 2, c.eyes);
                this.px(ctx, ox+9, 2, c.eyes);
                // Whiskers
                this.px(ctx, ox+4, 4, c.light);
                this.px(ctx, ox+11, 4, c.light);
                break;

            case 'parrot':
                // Beak
                this.rect(ctx, ox+6, 3, 2, 2, c.beak);
                this.px(ctx, ox+5, 4, c.beak);
                // Wing
                this.rect(ctx, ox+4, 7, 3, 4, c.wing);
                this.rect(ctx, ox+9, 7, 3, 4, c.wing);
                // Eyes
                this.px(ctx, ox+6, 2, c.eyes);
                this.px(ctx, ox+9, 2, c.eyes);
                // Head crest
                this.px(ctx, ox+7, -1, c.body);
                this.px(ctx, ox+8, -1, '#FFAA22');
                // Tail
                this.rect(ctx, ox+6, 13, 4, 3, c.body);
                this.px(ctx, ox+7, 15, c.wing);
                this.px(ctx, ox+8, 15, c.beak);
                break;

            case 'victim':
                // Fancy outfit
                this.rect(ctx, ox+5, 7, 6, 5, c.outfit);
                // Crown/tiara
                this.px(ctx, ox+6, 0, '#FFDD44');
                this.px(ctx, ox+8, 0, '#FFDD44');
                this.px(ctx, ox+10, 0, '#FFDD44');
                this.px(ctx, ox+7, -1, '#FFDD44');
                this.px(ctx, ox+9, -1, '#FFDD44');
                // Eyes (X's - they're dead)
                this.px(ctx, ox+6, 2, '#AA0000');
                this.px(ctx, ox+7, 3, '#AA0000');
                this.px(ctx, ox+6, 3, '#AA0000');
                this.px(ctx, ox+7, 2, '#AA0000');
                this.px(ctx, ox+9, 2, '#AA0000');
                this.px(ctx, ox+10, 3, '#AA0000');
                this.px(ctx, ox+9, 3, '#AA0000');
                this.px(ctx, ox+10, 2, '#AA0000');
                break;
        }

        // Talking animation - slight bounce
        if (frame === 1) {
            // We already drew at normal position, the scene will handle the bounce via tween
        }
    },

    // ===================== TILES =====================
    generateTiles(scene) {
        // Wood floor
        this.makeTexture(scene, 'tile_wood', 16, 16, (ctx) => {
            this.rect(ctx, 0, 0, 16, 16, '#8B6B4A');
            // Plank lines
            ctx.fillStyle = '#7A5C3D';
            for (let y = 0; y < 16; y += 4) {
                this.rect(ctx, 0, y, 16, 1, '#7A5C3D');
            }
            // Plank offsets
            this.px(ctx, 7, 0, '#7A5C3D');
            this.rect(ctx, 7, 0, 1, 4, '#7A5C3D');
            this.rect(ctx, 12, 4, 1, 4, '#7A5C3D');
            this.rect(ctx, 4, 8, 1, 4, '#7A5C3D');
            this.rect(ctx, 10, 12, 1, 4, '#7A5C3D');
        });

        // Stone floor
        this.makeTexture(scene, 'tile_stone', 16, 16, (ctx) => {
            this.rect(ctx, 0, 0, 16, 16, '#777788');
            ctx.fillStyle = '#666677';
            this.rect(ctx, 0, 0, 8, 8, '#6A6A7A');
            this.rect(ctx, 8, 8, 8, 8, '#6A6A7A');
            // Grout lines
            this.rect(ctx, 0, 7, 16, 2, '#555566');
            this.rect(ctx, 7, 0, 2, 16, '#555566');
        });

        // Grass tile
        this.makeTexture(scene, 'tile_grass', 16, 16, (ctx) => {
            this.rect(ctx, 0, 0, 16, 16, '#3A6B35');
            // Random grass details
            const spots = [[2,3],[8,1],[12,6],[4,10],[9,12],[14,9],[1,7],[6,14],[11,3]];
            spots.forEach(([x,y]) => this.px(ctx, x, y, '#4A7B45'));
            const dark = [[3,6],[7,9],[13,2],[0,13],[10,7]];
            dark.forEach(([x,y]) => this.px(ctx, x, y, '#2D5A28'));
        });

        // Wall
        this.makeTexture(scene, 'tile_wall', 16, 16, (ctx) => {
            this.rect(ctx, 0, 0, 16, 16, '#4A3A2A');
            // Brick pattern
            ctx.fillStyle = '#3D2F22';
            for (let y = 0; y < 16; y += 4) {
                this.rect(ctx, 0, y+3, 16, 1, '#3D2F22');
            }
            this.rect(ctx, 7, 0, 1, 4, '#3D2F22');
            this.rect(ctx, 3, 4, 1, 4, '#3D2F22');
            this.rect(ctx, 11, 4, 1, 4, '#3D2F22');
            this.rect(ctx, 7, 8, 1, 4, '#3D2F22');
            this.rect(ctx, 3, 12, 1, 4, '#3D2F22');
            this.rect(ctx, 11, 12, 1, 4, '#3D2F22');
        });

        // Wall top (darker, for visual depth)
        this.makeTexture(scene, 'tile_wall_top', 16, 16, (ctx) => {
            this.rect(ctx, 0, 0, 16, 16, '#3A2A1A');
            this.rect(ctx, 0, 14, 16, 2, '#2A1A0A');
        });

        // Door
        this.makeTexture(scene, 'tile_door', 16, 16, (ctx) => {
            this.rect(ctx, 0, 0, 16, 16, '#6B4226');
            this.rect(ctx, 2, 2, 12, 12, '#7B5236');
            // Door handle
            this.rect(ctx, 10, 7, 2, 2, '#CCAA44');
            // Top arch
            this.rect(ctx, 2, 1, 12, 1, '#5B3216');
        });

        // Window (with rain)
        this.makeTexture(scene, 'tile_window', 16, 16, (ctx) => {
            this.rect(ctx, 0, 0, 16, 16, '#4A3A2A');
            this.rect(ctx, 2, 2, 12, 12, '#2A3A5A');
            // Cross frame
            this.rect(ctx, 7, 2, 2, 12, '#4A3A2A');
            this.rect(ctx, 2, 7, 12, 2, '#4A3A2A');
            // Rain streaks
            this.px(ctx, 4, 4, '#4A5A7A');
            this.px(ctx, 4, 6, '#4A5A7A');
            this.px(ctx, 10, 3, '#4A5A7A');
            this.px(ctx, 10, 5, '#4A5A7A');
            this.px(ctx, 12, 10, '#4A5A7A');
        });

        // Carpet (red)
        this.makeTexture(scene, 'tile_carpet', 16, 16, (ctx) => {
            this.rect(ctx, 0, 0, 16, 16, '#882233');
            // Pattern
            this.px(ctx, 4, 4, '#993344');
            this.px(ctx, 12, 4, '#993344');
            this.px(ctx, 4, 12, '#993344');
            this.px(ctx, 12, 12, '#993344');
            this.px(ctx, 8, 8, '#993344');
        });

        // Dark floor (basement)
        this.makeTexture(scene, 'tile_dark', 16, 16, (ctx) => {
            this.rect(ctx, 0, 0, 16, 16, '#3A3A3A');
            this.px(ctx, 3, 5, '#333333');
            this.px(ctx, 9, 2, '#333333');
            this.px(ctx, 12, 11, '#333333');
            this.px(ctx, 6, 13, '#444444');
        });

        // Kitchen tile floor
        this.makeTexture(scene, 'tile_kitchen', 16, 16, (ctx) => {
            this.rect(ctx, 0, 0, 8, 8, '#CCBBAA');
            this.rect(ctx, 8, 0, 8, 8, '#BBAA99');
            this.rect(ctx, 0, 8, 8, 8, '#BBAA99');
            this.rect(ctx, 8, 8, 8, 8, '#CCBBAA');
        });
    },

    // ===================== FURNITURE =====================
    generateFurniture(scene) {
        // Bookshelf
        this.makeTexture(scene, 'furniture_bookshelf', 16, 16, (ctx) => {
            this.rect(ctx, 0, 0, 16, 16, '#5B3A1A');
            // Shelves
            this.rect(ctx, 0, 5, 16, 1, '#4A2A0A');
            this.rect(ctx, 0, 10, 16, 1, '#4A2A0A');
            // Books
            this.rect(ctx, 1, 1, 2, 4, '#CC3333');
            this.rect(ctx, 4, 1, 2, 4, '#3333CC');
            this.rect(ctx, 7, 2, 2, 3, '#33CC33');
            this.rect(ctx, 10, 1, 2, 4, '#CCCC33');
            this.rect(ctx, 13, 1, 2, 4, '#CC33CC');
            this.rect(ctx, 1, 6, 3, 4, '#3366CC');
            this.rect(ctx, 5, 6, 2, 4, '#CC6633');
            this.rect(ctx, 8, 7, 3, 3, '#66CC33');
            this.rect(ctx, 12, 6, 3, 4, '#CC3366');
            this.rect(ctx, 2, 11, 2, 4, '#6633CC');
            this.rect(ctx, 5, 11, 3, 4, '#33CCCC');
            this.rect(ctx, 9, 12, 2, 3, '#CC9933');
            this.rect(ctx, 12, 11, 3, 4, '#339933');
        });

        // Table
        this.makeTexture(scene, 'furniture_table', 32, 16, (ctx) => {
            // Table top
            this.rect(ctx, 0, 4, 32, 4, '#7B5B3B');
            this.rect(ctx, 0, 4, 32, 1, '#8B6B4B');
            // Legs
            this.rect(ctx, 1, 8, 2, 8, '#6B4B2B');
            this.rect(ctx, 29, 8, 2, 8, '#6B4B2B');
        });

        // Chair
        this.makeTexture(scene, 'furniture_chair', 16, 16, (ctx) => {
            // Back
            this.rect(ctx, 3, 0, 10, 2, '#7B5B3B');
            this.rect(ctx, 4, 2, 8, 4, '#6B4B2B');
            // Seat
            this.rect(ctx, 2, 6, 12, 3, '#7B5B3B');
            // Legs
            this.rect(ctx, 3, 9, 2, 7, '#5B3B1B');
            this.rect(ctx, 11, 9, 2, 7, '#5B3B1B');
        });

        // Bed
        this.makeTexture(scene, 'furniture_bed', 32, 16, (ctx) => {
            // Frame
            this.rect(ctx, 0, 4, 32, 12, '#5B3A1A');
            // Mattress
            this.rect(ctx, 1, 5, 30, 8, '#EEDDCC');
            // Pillow
            this.rect(ctx, 1, 5, 8, 5, '#FFFFFF');
            this.rect(ctx, 2, 6, 6, 3, '#EEEEFF');
            // Blanket
            this.rect(ctx, 10, 5, 21, 8, '#334488');
            this.rect(ctx, 10, 5, 21, 1, '#445599');
            // Headboard
            this.rect(ctx, 0, 0, 2, 16, '#4A2A0A');
        });

        // Stove
        this.makeTexture(scene, 'furniture_stove', 16, 16, (ctx) => {
            this.rect(ctx, 0, 0, 16, 16, '#555555');
            this.rect(ctx, 0, 0, 16, 2, '#666666');
            // Burners
            this.rect(ctx, 2, 3, 4, 4, '#333333');
            this.rect(ctx, 10, 3, 4, 4, '#333333');
            // Oven door
            this.rect(ctx, 2, 9, 12, 6, '#444444');
            this.rect(ctx, 3, 10, 10, 4, '#3A3A3A');
            this.rect(ctx, 6, 9, 4, 1, '#777777'); // handle
        });

        // Painting
        this.makeTexture(scene, 'furniture_painting', 16, 16, (ctx) => {
            // Frame
            this.rect(ctx, 0, 0, 16, 16, '#AA8833');
            this.rect(ctx, 1, 1, 14, 14, '#2A4A2A');
            // Simple landscape
            this.rect(ctx, 1, 9, 14, 6, '#3A5A3A');
            this.rect(ctx, 1, 1, 14, 8, '#4A6AAA');
            // Sun
            this.rect(ctx, 10, 3, 3, 3, '#FFDD44');
            // Hills
            this.rect(ctx, 1, 8, 7, 3, '#3A6A3A');
            this.rect(ctx, 6, 7, 9, 4, '#4A7A4A');
        });

        // Chest/drawer (interactive)
        this.makeTexture(scene, 'furniture_chest', 16, 16, (ctx) => {
            this.rect(ctx, 1, 4, 14, 10, '#6B4422');
            this.rect(ctx, 1, 4, 14, 2, '#7B5432');
            // Lock
            this.rect(ctx, 7, 6, 2, 2, '#CCAA44');
            // Rim
            this.rect(ctx, 0, 3, 16, 1, '#5B3412');
            this.rect(ctx, 0, 14, 16, 2, '#5B3412');
        });

        // Candelabra
        this.makeTexture(scene, 'furniture_candle', 16, 16, (ctx) => {
            // Base
            this.rect(ctx, 5, 12, 6, 4, '#CCAA44');
            // Stem
            this.rect(ctx, 7, 4, 2, 8, '#CCAA44');
            // Candle holders
            this.rect(ctx, 3, 4, 4, 2, '#CCAA44');
            this.rect(ctx, 9, 4, 4, 2, '#CCAA44');
            // Candles
            this.rect(ctx, 4, 1, 2, 3, '#EEEEDD');
            this.rect(ctx, 10, 1, 2, 3, '#EEEEDD');
            // Flames
            this.px(ctx, 4, 0, '#FFAA22');
            this.px(ctx, 5, 0, '#FFDD44');
            this.px(ctx, 10, 0, '#FFAA22');
            this.px(ctx, 11, 0, '#FFDD44');
        });

        // Rug
        this.makeTexture(scene, 'furniture_rug', 48, 32, (ctx) => {
            // Outer border
            this.rect(ctx, 0, 0, 48, 32, '#882244');
            this.rect(ctx, 2, 2, 44, 28, '#AA3355');
            this.rect(ctx, 4, 4, 40, 24, '#882244');
            this.rect(ctx, 6, 6, 36, 20, '#993355');
            // Center pattern
            this.rect(ctx, 20, 12, 8, 8, '#AA4466');
            this.px(ctx, 24, 16, '#CC6688');
        });

        // Barrel
        this.makeTexture(scene, 'furniture_barrel', 16, 16, (ctx) => {
            this.rect(ctx, 3, 1, 10, 14, '#7B5B3B');
            this.rect(ctx, 4, 0, 8, 1, '#6B4B2B');
            this.rect(ctx, 4, 15, 8, 1, '#6B4B2B');
            // Bands
            this.rect(ctx, 2, 3, 12, 1, '#888888');
            this.rect(ctx, 2, 11, 12, 1, '#888888');
            // Highlight
            this.rect(ctx, 6, 2, 2, 12, '#8B6B4B');
        });

        // Clue sparkle — bright RED so it pops on the map
        this.makeTexture(scene, 'sparkle', 8, 8, (ctx) => {
            this.px(ctx, 3, 0, '#FF2222');
            this.px(ctx, 4, 0, '#FF2222');
            this.px(ctx, 0, 3, '#FF2222');
            this.px(ctx, 7, 3, '#FF2222');
            this.px(ctx, 0, 4, '#FF2222');
            this.px(ctx, 7, 4, '#FF2222');
            this.px(ctx, 3, 7, '#FF2222');
            this.px(ctx, 4, 7, '#FF2222');
            this.px(ctx, 2, 2, '#FF6666');
            this.px(ctx, 5, 2, '#FF6666');
            this.px(ctx, 2, 5, '#FF6666');
            this.px(ctx, 5, 5, '#FF6666');
            this.px(ctx, 3, 3, '#FFFFFF');
            this.px(ctx, 4, 3, '#FFFFFF');
            this.px(ctx, 3, 4, '#FFFFFF');
            this.px(ctx, 4, 4, '#FFFFFF');
        });
    },

    // ===================== UI ELEMENTS =====================
    generateUI(scene) {
        // Dialogue box background
        this.makeTexture(scene, 'ui_dialogue', 460, 100, (ctx) => {
            // Outer border
            this.rect(ctx, 0, 0, 460, 100, '#1A1A2E');
            this.rect(ctx, 2, 2, 456, 96, '#2A2A4E');
            this.rect(ctx, 4, 4, 452, 92, '#1A1A3E');
            // Inner
            this.rect(ctx, 6, 6, 448, 88, '#222244');
        });

        // Portrait frame
        this.makeTexture(scene, 'ui_portrait_frame', 48, 48, (ctx) => {
            this.rect(ctx, 0, 0, 48, 48, '#AA8833');
            this.rect(ctx, 2, 2, 44, 44, '#222244');
        });

        // Journal background
        this.makeTexture(scene, 'ui_journal', 300, 240, (ctx) => {
            // Old paper
            this.rect(ctx, 0, 0, 300, 240, '#5B3A1A');
            this.rect(ctx, 4, 4, 292, 232, '#D4C4A0');
            this.rect(ctx, 8, 8, 284, 224, '#E4D4B0');
            // Lines
            ctx.fillStyle = '#CCBB99';
            for (let y = 30; y < 230; y += 16) {
                this.rect(ctx, 12, y, 276, 1, '#CCBB99');
            }
            // Red margin line
            this.rect(ctx, 40, 4, 1, 232, '#CC8888');
        });

        // Button
        this.makeTexture(scene, 'ui_button', 120, 32, (ctx) => {
            this.rect(ctx, 0, 0, 120, 32, '#4A3A6A');
            this.rect(ctx, 1, 1, 118, 30, '#6A5A8A');
            this.rect(ctx, 2, 2, 116, 28, '#5A4A7A');
            // Highlight top edge
            this.rect(ctx, 2, 2, 116, 1, '#7A6A9A');
        });

        // Button hover
        this.makeTexture(scene, 'ui_button_hover', 120, 32, (ctx) => {
            this.rect(ctx, 0, 0, 120, 32, '#6A5A8A');
            this.rect(ctx, 1, 1, 118, 30, '#8A7AAA');
            this.rect(ctx, 2, 2, 116, 28, '#7A6A9A');
            this.rect(ctx, 2, 2, 116, 1, '#9A8ABA');
        });

        // Clue icon (magnifying glass)
        this.makeTexture(scene, 'ui_clue_icon', 12, 12, (ctx) => {
            // Glass
            ctx.strokeStyle = '#CCAA44';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(5, 5, 4, 0, Math.PI * 2);
            ctx.stroke();
            // Handle
            this.rect(ctx, 8, 8, 4, 2, '#CCAA44');
            this.rect(ctx, 9, 9, 3, 2, '#CCAA44');
        });
    },

    // ===================== EFFECTS =====================
    generateEffects(scene) {
        // Rain drop
        this.makeTexture(scene, 'raindrop', 2, 6, (ctx) => {
            this.rect(ctx, 0, 0, 2, 6, '#5577AA');
            this.px(ctx, 0, 0, '#7799CC');
        });

        // Confetti particle
        this.makeTexture(scene, 'confetti', 4, 4, (ctx) => {
            this.rect(ctx, 0, 0, 4, 4, '#FF4444');
        });

        // Footprint
        this.makeTexture(scene, 'footprint', 8, 8, (ctx) => {
            this.rect(ctx, 2, 1, 4, 6, '#44332266');
            this.px(ctx, 3, 0, '#44332244');
            this.px(ctx, 4, 0, '#44332244');
        });
    }
};
