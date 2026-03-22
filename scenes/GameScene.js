// GameScene - Main gameplay: explore rooms, talk to NPCs, find clues
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.gameMode = data.mode || 'detective';
        this.playerDir = 'down';
        this.dialogueActive = false;
        this.journalOpen = false;
        this.idleTimer = 0;
        this.transitioning = false;

        // Restore state if returning from accusation screen
        if (data.restoreState) {
            this.restoredState = data.restoreState;
        } else {
            this.restoredState = null;
        }
    }

    create() {
        this.cameras.main.resetFX();
        // Restore or fresh start
        if (this.restoredState) {
            const s = this.restoredState;
            this.killer = s.killer;
            this.killerIndex = s.killerIndex;
            this.victimName = s.victimName;
            this.weapon = s.weapon;
            this.crimeRoom = s.crimeRoom;
            this.npcData = s.npcData;
            this.allClues = s.allClues;
            this.totalClues = s.totalClues;
            this.cluesFound = s.cluesFound;
            this.npcsInterviewed = s.npcsInterviewed;
            this.gameTime = s.gameTime;
            this.currentRoomId = s.currentRoomId || 'entrance';
        } else {
            this.cluesFound = [];
            this.npcsInterviewed = [];
            this.gameTime = 0;
            this.currentRoomId = 'entrance';
            this.setupMystery();
        }

        // ===== INPUT SYSTEM =====
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey('W');
        this.keyA = this.input.keyboard.addKey('A');
        this.keyS = this.input.keyboard.addKey('S');
        this.keyD = this.input.keyboard.addKey('D');

        // Action queue — fed by DOM keydown + mouse click
        this.actionQueue = [];
        this._onKeyDown = (e) => {
            if (e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
                e.preventDefault();
                this.actionQueue.push('interact');
            } else if (e.key === 'j' || e.key === 'J') {
                this.actionQueue.push('journal');
            } else if (e.key === 'Escape') {
                this.actionQueue.push('escape');
            }
        };
        window.addEventListener('keydown', this._onKeyDown);

        this.input.on('pointerdown', () => {
            this.actionQueue.push('interact');
        });

        // Clean up DOM listener on scene stop
        this.events.once('shutdown', () => {
            window.removeEventListener('keydown', this._onKeyDown);
        });
        this.events.once('destroy', () => {
            window.removeEventListener('keydown', this._onKeyDown);
        });

        // Groups
        this.tileGroup = this.add.group();
        this.furnitureGroup = this.add.group();
        this.npcGroup = this.add.group();

        this.loadRoom(this.currentRoomId);
        this.createUI();

        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Start investigation music
        SoundManager.playInvestigationMusic();
        this.footstepTimer = 0;

        // Touch controls
        if (TouchControls.enabled) {
            TouchControls.show();
            TouchControls.setButtonLabel('ACT');
            TouchControls.showJournal();
        }

        this.time.addEvent({ delay: 1000, callback: () => { this.gameTime++; }, loop: true });

        this.time.delayedCall(600, () => {
            this.showDialogue('bear',
                'Oh my... A murder at Mystery Manor!\nI must investigate at once.\nBetter speak to everyone and search for clues.', () => {});
        });
    }

    // ==================== MYSTERY SETUP ====================
    setupMystery() {
        const suspects = ['fox', 'peacock', 'badger', 'rabbit', 'cat', 'parrot'];
        this.killerIndex = Phaser.Math.Between(0, suspects.length - 1);
        this.killer = suspects[this.killerIndex];
        this.victimName = 'Lord Reginald Dormouse';

        const weapons = ['a candlestick', 'a letter opener', 'poison in the wine', 'a heavy book', 'garden shears', 'a silk scarf'];
        this.weapon = weapons[Phaser.Math.Between(0, weapons.length - 1)];

        const crimeRooms = ['bedroom', 'library', 'kitchen', 'garden', 'basement'];
        this.crimeRoom = crimeRooms[Phaser.Math.Between(0, crimeRooms.length - 1)];

        this.npcData = {
            fox: {
                name: 'Frederick Fox', role: 'The Butler', room: 'entrance', color: '#D4762C',
                alibi: this.killer === 'fox'
                    ? 'I was polishing the silverware in the entrance hall all evening. Never left, not even for a moment.'
                    : 'I was polishing silverware in the entrance hall. I did step out briefly to fetch polish from the kitchen.',
                killerTell: 'I heard nothing unusual. The manor was completely silent.',
                innocentInfo: `I heard a commotion from the ${this.crimeRoom} around midnight.`
            },
            peacock: {
                name: 'Penelope Peacock', role: 'The Singer', room: 'garden', color: '#2A9B7A',
                alibi: this.killer === 'peacock'
                    ? 'I was practicing my aria in the garden all night. The fresh air helps my voice.'
                    : 'I was in the garden practicing scales. Took a break around 11 to get water from the kitchen.',
                killerTell: 'I was far too focused on my music to notice anything.',
                innocentInfo: 'I saw a shadow moving quickly past the garden window near midnight.'
            },
            badger: {
                name: 'Boris Badger', role: 'The Chef', room: 'kitchen', color: '#888888',
                alibi: this.killer === 'badger'
                    ? 'I was in my kitchen preparing breakfast. Was there the entire time. Ask anyone.'
                    : 'I was cooking most of the night. Stepped out to check on a noise in the hallway around 11:30.',
                killerTell: 'Everything was perfectly normal. Nothing out of place in my kitchen.',
                innocentInfo: 'Someone borrowed my kitchen knife that evening. Never returned it.'
            },
            rabbit: {
                name: 'Rosie Rabbit', role: 'The Maid', room: 'bedroom', color: '#DDCCBB',
                alibi: this.killer === 'rabbit'
                    ? 'I was t-tidying the bedroom upstairs. I was there all night, I swear!'
                    : 'I was cleaning the bedroom. Around midnight I heard a loud thud from below.',
                killerTell: 'N-no, I didn\'t see anything! Why would I? I was just cleaning!',
                innocentInfo: `I found muddy footprints leading from the ${this.crimeRoom} when I did my rounds.`
            },
            cat: {
                name: 'Sir Charles Cat', role: 'The Aristocrat', room: 'library', color: '#66CC66',
                alibi: this.killer === 'cat'
                    ? 'I was reading in the library all evening. A gripping novel. Never moved from my chair.'
                    : 'I was in the library reading until about 11. Then I went for a nightcap.',
                killerTell: 'I was far too absorbed in my book to notice anything. Terribly sorry.',
                innocentInfo: `I noticed someone rifling through the bookshelves. Books about ${this.crimeRoom === 'garden' ? 'botany' : this.crimeRoom === 'kitchen' ? 'poisons' : 'lockpicking'} were pulled out.`
            },
            parrot: {
                name: 'Captain Polly', role: 'The Witness', room: 'basement', color: '#FF4444',
                alibi: this.killer === 'parrot'
                    ? 'SQUAWK! I was in the basement guarding the wine! Nobody gets past Captain Polly!'
                    : 'SQUAWK! I was counting bottles! Got bored and flew around the manor for a bit.',
                killerTell: `I SAW EVERYTHING! It was... *thinks* ...the ${suspects[(this.killerIndex + 2) % 6]}! SQUAWK!`,
                innocentInfo: Phaser.Math.Between(0, 1) === 0
                    ? `SQUAWK! I know who did it! The ${this.killer}! ...or maybe I dreamt it.`
                    : `SQUAWK! It was the ${suspects[(this.killerIndex + 3) % 6]}! ...actually, don't hold me to that.`
            }
        };

        this.generateClues();
    }

    generateClues() {
        const kData = this.npcData[this.killer];
        const crimeRoom = this.crimeRoom;

        this.allClues = {
            painting_clue: { text: `A small portrait. ${kData.name}'s portrait has a fresh scratch, as if they tried to hide something.`, decisive: true, found: false },
            table_note: { text: `A torn note: "Meet me in the ${crimeRoom} at midnight. Come alone. - ${kData.name.split(' ')[0]}"`, decisive: true, found: false },
            stove_clue: { text: crimeRoom === 'kitchen' ? 'The stove is still warm. Scorch marks that don\'t match normal cooking.' : 'The stove is cold. Hasn\'t been used in hours. Boris\'s cooking alibi checks out.', decisive: false, found: false },
            barrel_clue: { text: `Behind the barrels: a scrap of fabric matching ${kData.role.toLowerCase()}'s outfit.`, decisive: false, found: false },
            kitchen_note: { text: 'A shopping list. At the bottom: "Need to get rid of evidence before morning."', decisive: false, found: false },
            book_clue: { text: `A book on "Criminal Methods" was recently read. A bookmark of colored fabric sits inside — it matches ${kData.role.toLowerCase()}'s clothing.`, decisive: true, found: false },
            desk_clue: { text: `A half-written letter: "If anything happens to me, know that I discovered ${kData.name}'s secret..."`, decisive: true, found: false },
            shelf_clue: { text: `Hidden compartment! Inside: a map of the manor with the ${crimeRoom} circled in red.`, decisive: false, found: false },
            chest_clue: { text: `Old letters. One says: "The ${kData.role.toLowerCase()} has been acting strangely lately..."`, decisive: false, found: false },
            bed_clue: { text: 'Under the bed: muddy footprints leading to the window. Someone came in from outside.', decisive: false, found: false },
            portrait_clue: { text: `Lord Reginald's portrait. His eyes seem to stare toward the ${crimeRoom}.`, decisive: false, found: false },
            garden_clue: { text: `Inside the barrel: ${this.weapon}! Hastily hidden.`, decisive: true, found: false },
            path_clue: { text: `Fresh footprints in the mud lead from the back door toward the ${crimeRoom}.`, decisive: false, found: false },
            bush_clue: { text: `Torn clothing on a barrel nail. The fabric matches ${kData.role.toLowerCase()}'s outfit.`, decisive: true, found: false },
            basement_chest_clue: { text: `Lord Reginald's diary. Last entry: "I fear for my life. The ${kData.role.toLowerCase()} knows what I found out."`, decisive: true, found: false },
            basement_barrel_clue: { text: 'Barrels recently moved. Scratch marks suggest someone searched here in a hurry.', decisive: false, found: false },
            corner_clue: { text: 'A recently extinguished candle. Wax drippings trail toward the door.', decisive: false, found: false }
        };
        this.totalClues = Object.keys(this.allClues).length;
    }

    // ==================== ROOM LOADING ====================
    loadRoom(roomId) {
        this.currentRoomId = roomId;
        const room = ManorMap.getRoom(roomId);

        // Clear everything
        this.tileGroup.clear(true, true);
        this.furnitureGroup.clear(true, true);
        this.npcGroup.clear(true, true);
        if (this.wallBodies) this.wallBodies.forEach(b => b.destroy());
        this.wallBodies = [];
        if (this.furnitureBodies) this.furnitureBodies.forEach(b => b.destroy());
        this.furnitureBodies = [];
        if (this.doorZones) this.doorZones.forEach(z => z.destroy());
        this.doorZones = [];
        if (this.interactZones) this.interactZones.forEach(z => z.destroy());
        this.interactZones = [];
        if (this.sparkles) this.sparkles.forEach(s => s.destroy());
        this.sparkles = [];
        if (this.npcSprites) this.npcSprites.forEach(n => { if (n.nameLabel) n.nameLabel.destroy(); n.destroy(); });
        this.npcSprites = [];
        if (this.rainDrops) this.rainDrops.forEach(d => d.destroy());
        this.rainDrops = [];

        this.cameras.main.setBackgroundColor(room.ambientColor);

        // Center room in viewport
        const roomPxW = room.width * TILE;
        const roomPxH = room.height * TILE;
        const ox = (GAME_WIDTH - roomPxW) / 2;
        const oy = (GAME_HEIGHT - roomPxH) / 2;
        this.roomOX = ox;
        this.roomOY = oy;

        // Render tiles
        for (let y = 0; y < room.height; y++) {
            for (let x = 0; x < room.width; x++) {
                const tt = room.layout[y][x];
                const tex = TILE_TEXTURES[tt];
                if (!tex) continue;

                const px = ox + x * TILE + TILE / 2;
                const py = oy + y * TILE + TILE / 2;
                this.add.image(px, py, tex).setScale(SCALE);

                if (ManorMap.isSolid(tt)) {
                    const w = this.physics.add.staticImage(px, py, tex).setScale(SCALE).setVisible(false);
                    w.body.setSize(TILE, TILE);
                    w.refreshBody();
                    this.wallBodies.push(w);
                }
            }
        }

        // Furniture
        room.furniture.forEach(f => {
            const fx = ox + f.x * TILE + (f.w * TILE) / 2;
            const fy = oy + f.y * TILE + (f.h * TILE) / 2;
            this.add.image(fx, fy, f.type).setScale(SCALE);
            if (f.solid) {
                const fb = this.physics.add.staticImage(fx, fy, f.type).setScale(SCALE).setVisible(false);
                fb.body.setSize(f.w * TILE, f.h * TILE);
                fb.refreshBody();
                this.furnitureBodies.push(fb);
            }
        });

        // Doors — use the door tile positions from the layout
        room.doors.forEach(door => {
            const dx = ox + door.x * TILE + TILE / 2;
            const dy = oy + door.y * TILE + TILE / 2;
            const zone = this.add.zone(dx, dy, TILE * 1.2, TILE * 1.2);
            this.physics.add.existing(zone, true);
            zone.doorData = door;
            this.doorZones.push(zone);
        });

        // Interactables with sparkles
        room.interactables.forEach(inter => {
            const ix = ox + inter.x * TILE + TILE / 2;
            const iy = oy + inter.y * TILE + TILE / 2;
            const zone = this.add.zone(ix, iy, TILE * 2, TILE * 2);
            this.physics.add.existing(zone, true);
            zone.interactData = inter;
            this.interactZones.push(zone);

            if (!this.allClues[inter.clueId] || !this.allClues[inter.clueId].found) {
                const sp = this.add.image(ix, iy - 20, 'sparkle').setScale(SCALE).setAlpha(0.8).setDepth(8);
                this.tweens.add({ targets: sp, alpha: 0.3, y: iy - 26, duration: 800, yoyo: true, repeat: -1 });
                this.sparkles.push(sp);
            }
        });

        // NPCs
        room.npcSpawns.forEach(npcKey => {
            const npcType = npcKey.replace('npc_', '');
            const npcInfo = this.npcData[npcType];
            if (!npcInfo) return;

            const nx = ox + (room.width / 2 + Phaser.Math.Between(-3, 3)) * TILE;
            const ny = oy + (room.height / 2 + Phaser.Math.Between(-1, 1)) * TILE;
            const npc = this.physics.add.staticSprite(nx, ny, npcKey, 0).setScale(SCALE).setDepth(9);
            npc.npcType = npcType;
            npc.npcKey = npcKey;
            npc.body.setSize(TILE * 0.8, TILE * 0.8);
            npc.refreshBody();
            npc.play(`${npcKey}_idle`);

            const label = this.add.text(nx, ny - 28, npcInfo.name.split(' ')[0], {
                fontFamily: 'monospace', fontSize: '13px', color: npcInfo.color,
                backgroundColor: '#000000AA', padding: { x: 4, y: 2 }
            }).setOrigin(0.5).setDepth(9);
            npc.nameLabel = label;

            // Blue "!" marker above NPCs not yet interviewed
            if (!this.npcsInterviewed.includes(npcType)) {
                const marker = this.add.text(nx, ny - 44, '!', {
                    fontFamily: 'monospace', fontSize: '18px', color: '#44AAFF', fontStyle: 'bold',
                    backgroundColor: '#000000CC', padding: { x: 4, y: 1 }
                }).setOrigin(0.5).setDepth(10);
                this.tweens.add({ targets: marker, y: ny - 50, duration: 600, yoyo: true, repeat: -1 });
                this.sparkles.push(marker); // reuse sparkles array for cleanup
            }

            this.npcSprites.push(npc);
        });

        // Victim in bedroom
        if (room.victimSpawn) {
            const vx = ox + room.victimSpawn.x * TILE;
            const vy = oy + room.victimSpawn.y * TILE;
            this.add.sprite(vx, vy, 'npc_victim', 0).setScale(SCALE).setAngle(90).setAlpha(0.8);
            const ol = this.add.graphics();
            ol.lineStyle(2, 0xFFFFFF, 0.3);
            ol.strokeRect(vx - 20, vy - 12, 40, 24);
        }

        // Player
        if (!this.player) {
            const sp = room.playerSpawn;
            this.player = this.physics.add.sprite(
                ox + sp.x * TILE + TILE / 2,
                oy + sp.y * TILE + TILE / 2,
                'bear', 0
            ).setScale(SCALE).setDepth(10);
            this.player.body.setSize(12, 12);
            this.player.body.setOffset(2, 4);
        }

        // Setup collisions
        this.wallBodies.forEach(w => this.physics.add.collider(this.player, w));
        this.furnitureBodies.forEach(f => this.physics.add.collider(this.player, f));
        this.npcSprites.forEach(n => this.physics.add.collider(this.player, n));

        // Room label
        if (this.roomLabel) this.roomLabel.destroy();
        this.roomLabel = this.add.text(GAME_WIDTH / 2, 16, room.name, {
            fontFamily: 'monospace', fontSize: '18px', color: '#CCAA44',
            backgroundColor: '#000000BB', padding: { x: 10, y: 4 }
        }).setOrigin(0.5).setDepth(20).setScrollFactor(0);

        // Rain in garden
        if (this.currentRoomId === 'garden') {
            for (let i = 0; i < 40; i++) {
                const d = this.add.rectangle(
                    Phaser.Math.Between(ox, ox + roomPxW),
                    Phaser.Math.Between(oy, oy + roomPxH),
                    2, Phaser.Math.Between(6, 10), 0x5577AA, 0.4
                ).setDepth(5);
                this.rainDrops.push(d);
            }
        }
    }

    // ==================== UI ====================
    createUI() {
        this.clueGoal = SPEED_MODE ? 1 : 3;
        this.interviewGoal = SPEED_MODE ? 1 : 3;

        const cCount = this.cluesFound.length;
        const cDone = cCount >= this.clueGoal;
        this.clueText = this.add.text(GAME_WIDTH - 20, 16,
            `Clues: ${cCount}${cDone ? ' ✓' : ` (need ${this.clueGoal})`}`, {
            fontFamily: 'monospace', fontSize: '14px', color: cDone ? '#44CC44' : '#FF4444',
            backgroundColor: '#000000BB', padding: { x: 6, y: 3 }
        }).setOrigin(1, 0.5).setDepth(20).setScrollFactor(0);

        const iCount = this.npcsInterviewed.length;
        const iDone = iCount >= this.interviewGoal;
        this.interviewText = this.add.text(GAME_WIDTH - 20, 40,
            `Interviewed: ${iCount}${iDone ? ' ✓' : ` (need ${this.interviewGoal})`}`, {
            fontFamily: 'monospace', fontSize: '14px', color: iDone ? '#44CC44' : '#4488FF',
            backgroundColor: '#000000BB', padding: { x: 6, y: 3 }
        }).setOrigin(1, 0.5).setDepth(20).setScrollFactor(0);

        this.promptText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, '', {
            fontFamily: 'monospace', fontSize: '16px', color: '#FFFFFF',
            backgroundColor: '#000000DD', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(20).setScrollFactor(0).setVisible(false);

        this.journalHint = this.add.text(20, 16, '[J] Journal', {
            fontFamily: 'monospace', fontSize: '13px', color: '#665588',
            backgroundColor: '#000000BB', padding: { x: 6, y: 3 }
        }).setDepth(20).setScrollFactor(0);
    }

    // ==================== DIALOGUE ====================
    showDialogue(speakerType, fullText, onComplete) {
        // Force-clean any stuck dialogue state
        if (this.dialogueActive) {
            // If dialogue is active but elements are gone, reset
            if (!this.dialogueBg || !this.dialogueBg.active) {
                this.dialogueActive = false;
                this.dialogueReady = false;
                this.dialogueCallback = null;
                if (this.typewriterTimer) { this.typewriterTimer.remove(); this.typewriterTimer = null; }
            } else {
                return; // Legitimate active dialogue, skip
            }
        }
        this.dialogueActive = true;
        this.currentFullText = fullText;

        const textSpeed = SPEED_MODE ? 10 : 25;

        this.dialogueBorder = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 100, GAME_WIDTH - 36, 184, 0xCCAA44).setDepth(29).setScrollFactor(0);
        this.dialogueBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 100, GAME_WIDTH - 44, 176, 0x222244).setDepth(30).setScrollFactor(0);

        let speakerName = 'Detective Bear', speakerColor = '#CCAA44';
        if (speakerType !== 'bear' && this.npcData[speakerType]) {
            speakerName = this.npcData[speakerType].name;
            speakerColor = this.npcData[speakerType].color;
        }

        this.dialogueName = this.add.text(50, GAME_HEIGHT - 182, speakerName, {
            fontFamily: 'monospace', fontSize: '16px', color: speakerColor, fontStyle: 'bold'
        }).setDepth(31).setScrollFactor(0);

        this.dialogueText = this.add.text(50, GAME_HEIGHT - 158, '', {
            fontFamily: 'monospace', fontSize: '15px', color: '#DDDDEE',
            wordWrap: { width: GAME_WIDTH - 100 }, lineSpacing: 6
        }).setDepth(31).setScrollFactor(0);

        this.dialogueContinue = this.add.text(GAME_WIDTH - 50, GAME_HEIGHT - 18, '[ Click / Space ]', {
            fontFamily: 'monospace', fontSize: '13px', color: '#8877AA'
        }).setOrigin(1, 0.5).setDepth(31).setScrollFactor(0).setVisible(false);

        let ci = 0;
        const self = this;
        this.typewriterTimer = this.time.addEvent({
            delay: textSpeed,
            callback: () => {
                if (!self.dialogueText || !self.dialogueText.active) {
                    if (self.typewriterTimer) { self.typewriterTimer.remove(); self.typewriterTimer = null; }
                    return;
                }
                ci++;
                self.dialogueText.setText(fullText.substring(0, ci));
                    SoundManager.playDialogueBlip();
                if (ci >= fullText.length) {
                    self.typewriterTimer.remove();
                    self.typewriterTimer = null;
                    if (self.dialogueContinue && self.dialogueContinue.active) self.dialogueContinue.setVisible(true);
                    self.dialogueReady = true;
                }
            },
            loop: true
        });

        this.dialogueCallback = onComplete;
        this.dialogueReady = false;
    }

    closeDialogue() {
        if (!this.dialogueActive) return;
        [this.dialogueBg, this.dialogueBorder, this.dialogueName, this.dialogueText, this.dialogueContinue]
            .forEach(el => { if (el && el.active) el.destroy(); });
        if (this.typewriterTimer) { this.typewriterTimer.remove(); this.typewriterTimer = null; }
        this.dialogueActive = false;
        this.dialogueReady = false;
        if (this.dialogueCallback) {
            const cb = this.dialogueCallback;
            this.dialogueCallback = null;
            try { cb(); } catch(e) { /* prevent stall from callback errors */ }
        }
    }

    skipTypewriter() {
        if (this.typewriterTimer) {
            this.typewriterTimer.remove();
            this.typewriterTimer = null;
        }
        if (this.dialogueText && this.dialogueText.active && this.currentFullText) {
            this.dialogueText.setText(this.currentFullText);
        }
        if (this.dialogueContinue && this.dialogueContinue.active) this.dialogueContinue.setVisible(true);
        this.dialogueReady = true;
    }

    // ==================== JOURNAL ====================
    showJournal() {
        if (this.journalOpen) return;
        this.journalOpen = true;
        this.journalElements = [];

        const cx = GAME_WIDTH / 2, cy = GAME_HEIGHT / 2;

        this.journalElements.push(
            this.add.rectangle(cx, cy, 610, 510, 0x5B3A1A).setDepth(40).setScrollFactor(0),
            this.add.rectangle(cx, cy, 600, 500, 0xE4D4B0).setDepth(40).setScrollFactor(0)
        );

        this.journalElements.push(this.add.text(cx, cy - 230, "Detective's Journal", {
            fontFamily: 'monospace', fontSize: '22px', color: '#5B3A1A', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(41).setScrollFactor(0));

        this.journalElements.push(this.add.text(cx - 280, cy - 200,
            `Case: The Murder of ${this.victimName}\nTime elapsed: ${Math.floor(this.gameTime/60)}m ${this.gameTime%60}s`, {
            fontFamily: 'monospace', fontSize: '13px', color: '#7B5B3B', lineSpacing: 4
        }).setDepth(41).setScrollFactor(0));

        let clueStr = '--- CLUES FOUND ---\n\n';
        if (this.cluesFound.length === 0) clueStr += 'No clues found yet. Keep searching!';
        else this.cluesFound.forEach((id, i) => {
            const c = this.allClues[id];
            clueStr += `${i+1}. ${c.text.length > 80 ? c.text.substring(0,80)+'...' : c.text}\n`;
        });

        this.journalElements.push(this.add.text(cx - 280, cy - 150, clueStr, {
            fontFamily: 'monospace', fontSize: '11px', color: '#5B3A1A',
            wordWrap: { width: 560 }, lineSpacing: 3
        }).setDepth(41).setScrollFactor(0));

        let intStr = '\n--- SUSPECT INTERVIEWS ---\n\n';
        ['fox','peacock','badger','rabbit','cat','parrot'].forEach(s => {
            intStr += `${this.npcsInterviewed.includes(s) ? '✓' : '○'} ${this.npcData[s].name} — ${this.npcData[s].role}\n`;
        });

        this.journalElements.push(this.add.text(cx - 280, cy + 60, intStr, {
            fontFamily: 'monospace', fontSize: '11px', color: '#5B3A1A',
            wordWrap: { width: 560 }, lineSpacing: 3
        }).setDepth(41).setScrollFactor(0));

        this.journalElements.push(this.add.text(cx, cy + 235, 'Press J or ESC to close', {
            fontFamily: 'monospace', fontSize: '14px', color: '#8B6B4B'
        }).setOrigin(0.5).setDepth(41).setScrollFactor(0));
    }

    closeJournal() {
        if (!this.journalOpen) return;
        this.journalElements.forEach(el => el.destroy());
        this.journalOpen = false;
    }

    // ==================== INTERACTIONS ====================
    handleInteraction() {
        if (this.dialogueActive || this.journalOpen) return;

        for (const npc of this.npcSprites) {
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y) < TILE * 2) {
                this.interactWithNPC(npc.npcType);
                return;
            }
        }

        for (const zone of this.interactZones) {
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, zone.x, zone.y) < TILE * 1.5) {
                const data = zone.interactData;
                if (data.type === 'accusation') { this.handleAccusation(); return; }
                this.searchObject(data);
                return;
            }
        }
    }

    // Build a snapshot of current game state (for passing between scenes)
    getGameState() {
        return {
            npcData: this.npcData, killer: this.killer, killerIndex: this.killerIndex,
            cluesFound: this.cluesFound, npcsInterviewed: this.npcsInterviewed,
            gameTime: this.gameTime, totalClues: this.totalClues,
            weapon: this.weapon, crimeRoom: this.crimeRoom, victimName: this.victimName,
            allClues: this.allClues, currentRoomId: this.currentRoomId
        };
    }

    handleAccusation() {
        const minClues = SPEED_MODE ? 1 : 3;
        const minInt = SPEED_MODE ? 1 : 3;

        if (this.cluesFound.length >= minClues && this.npcsInterviewed.length >= minInt) {
            SoundManager.playAccusationSting();
            this.showDialogue('bear', 'I believe I have enough evidence.\nTime to make my accusation!', () => {
                SoundManager.stopMusic();
                this.scene.start('AccusationScene', this.getGameState());
            });
        } else {
            this.showDialogue('bear',
                `I need more evidence first.\nClues: ${this.cluesFound.length}/${minClues} minimum | Interviews: ${this.npcsInterviewed.length}/${minInt} minimum`, () => {});
        }
    }

    interactWithNPC(npcType) {
        const npc = this.npcData[npcType];
        const isKiller = npcType === this.killer;
        const sprite = this.npcSprites.find(n => n.npcType === npcType);
        if (sprite) sprite.play(`${sprite.npcKey}_talk`);

        const greetings = {
            fox: 'Good evening, detective. How may I assist?',
            peacock: 'Oh, hello there, detective darling~',
            badger: 'Make it quick. I have work to do.',
            rabbit: 'O-oh! You startled me!',
            cat: '*adjusts monocle* Ah, the detective.',
            parrot: 'SQUAWK! What do you want?'
        };

        this.showDialogue('bear', `Frightfully sorry to bother you, ${npc.name}.\nMight I ask a few questions?`, () => {
            this.showDialogue(npcType, greetings[npcType], () => {
                this.showDialogue(npcType, npc.alibi, () => {
                    this.showDialogue(npcType, isKiller ? npc.killerTell : npc.innocentInfo, () => {
                        if (!this.npcsInterviewed.includes(npcType)) {
                            this.npcsInterviewed.push(npcType);
                            const iDone = this.npcsInterviewed.length >= this.interviewGoal;
                            this.interviewText.setText(`Interviewed: ${this.npcsInterviewed.length}${iDone ? ' ✓' : ` (need ${this.interviewGoal})`}`);
                            if (iDone) this.interviewText.setColor('#44CC44');
                        }
                        this.showDialogue('bear', 'Most illuminating. Thank you.', () => {
                            if (sprite) sprite.play(`${sprite.npcKey}_idle`);
                        });
                    });
                });
            });
        });
    }

    searchObject(data) {
        const clue = this.allClues[data.clueId];
        if (!clue) return;

        if (clue.found) {
            this.showDialogue('bear', `I've already searched the ${data.label}.`, () => {});
            return;
        }

        this.showDialogue('bear', `Let me look at the ${data.label}...`, () => {
            clue.found = true;
            this.cluesFound.push(data.clueId);
            const cDone = this.cluesFound.length >= this.clueGoal;
            this.clueText.setText(`Clues: ${this.cluesFound.length}${cDone ? ' ✓' : ` (need ${this.clueGoal})`}`);
            if (cDone) this.clueText.setColor('#44CC44');

            SoundManager.playClueFound();
            this.player.play('bear_aha');
            this.time.delayedCall(800, () => this.player.play('bear_idle'));

            this.showDialogue('bear', `Aha! ${clue.text}`, () => {
                if (clue.decisive) {
                    this.showDialogue('bear', 'This could be very important evidence!', () => {});
                }
            });
        });
    }

    // ==================== UPDATE ====================
    update(time, delta) {
        // Drain the action queue
        const actions = this.actionQueue.splice(0);
        // Merge touch action button into actions
        if (TouchControls.enabled && TouchControls.consumeAction()) {
            actions.push('interact');
        }
        // Merge touch journal button
        if (TouchControls.enabled && TouchControls.consumeJournal()) {
            actions.push('journal');
        }
        const hasInteract = actions.includes('interact');
        const hasJournal = actions.includes('journal');
        const hasEscape = actions.includes('escape');

        if (this.transitioning) {
            // Safety valve: don't stay stuck transitioning forever
            if (!this._transitionStart) this._transitionStart = time;
            if (time - this._transitionStart > 3000) {
                this.transitioning = false;
                this._transitionStart = 0;
                this.cameras.main.resetFX();
                this.cameras.main.setAlpha(1);
            }
            return;
        }
        this._transitionStart = 0;

        // --- DIALOGUE MODE ---
        if (this.dialogueActive) {
            // Safety: if dialogue elements are gone, force-reset
            if (!this.dialogueBg || !this.dialogueBg.active) {
                this.dialogueActive = false;
                this.dialogueReady = false;
                this.dialogueCallback = null;
            } else {
                if (hasInteract) {
                    if (this.dialogueReady) this.closeDialogue();
                    else this.skipTypewriter();
                }
                this.player.body.setVelocity(0);
                return;
            }
        }

        // --- JOURNAL MODE ---
        if (this.journalOpen) {
            if (hasJournal || hasEscape || hasInteract) this.closeJournal();
            this.player.body.setVelocity(0);
            return;
        }

        // --- NORMAL GAMEPLAY ---
        if (hasJournal) { this.showJournal(); return; }
        if (hasInteract) this.handleInteraction();

        // Movement (keyboard + touch joystick)
        const speed = SPEED_MODE ? 250 : 160;
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.keyA.isDown) { vx = -speed; this.playerDir = 'left'; }
        else if (this.cursors.right.isDown || this.keyD.isDown) { vx = speed; this.playerDir = 'right'; }
        if (this.cursors.up.isDown || this.keyW.isDown) { vy = -speed; this.playerDir = 'up'; }
        else if (this.cursors.down.isDown || this.keyS.isDown) { vy = speed; this.playerDir = 'down'; }

        // Touch joystick override
        if (TouchControls.enabled) {
            const touch = TouchControls.getMovement(speed);
            if (touch.dir) {
                vx = touch.vx;
                vy = touch.vy;
                this.playerDir = touch.dir;
            }
        }

        this.player.body.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            this.player.play(`bear_walk_${this.playerDir}`, true);
            this.idleTimer = 0;
            this.footstepTimer = (this.footstepTimer || 0) + delta;
            if (this.footstepTimer > 280) { SoundManager.playFootstep(); this.footstepTimer = 0; }
        } else {
            this.idleTimer += delta;
            if (this.idleTimer > 5000 && this.idleTimer < 7000) this.player.play('bear_eat', true);
            else if (this.idleTimer >= 7000) { this.idleTimer = 0; this.player.play('bear_idle', true); }
            else this.player.play('bear_idle', true);
        }

        this.checkDoors();
        this.updatePrompt();

        // Rain animation
        if (this.rainDrops && this.rainDrops.length > 0) {
            const room = ManorMap.getRoom(this.currentRoomId);
            this.rainDrops.forEach(d => {
                d.y += 2.5;
                if (d.y > this.roomOY + room.height * TILE) {
                    d.y = this.roomOY;
                    d.x = Phaser.Math.Between(this.roomOX, this.roomOX + room.width * TILE);
                }
            });
        }
    }

    checkDoors() {
        if (this.transitioning) return;
        for (const zone of this.doorZones) {
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, zone.x, zone.y) < TILE * 0.9) {
                this.transitioning = true;
                this.player.body.setVelocity(0);
                const door = zone.doorData;

                SoundManager.playDoorOpen();
                this.cameras.main.resetFX();
                this.cameras.main.fadeOut(200, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.loadRoom(door.targetRoom);
                    this.player.setPosition(
                        this.roomOX + door.targetX * TILE + TILE / 2,
                        this.roomOY + door.targetY * TILE + TILE / 2
                    );
                    this.player.body.setVelocity(0);
                    this.cameras.main.fadeIn(200, 0, 0, 0);
                    this.time.delayedCall(300, () => { this.transitioning = false; });
                });
                break;
            }
        }
    }

    updatePrompt() {
        let show = false;
        for (const npc of this.npcSprites) {
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y) < TILE * 2) {
                this.promptText.setText(`Click or [Space] Talk to ${this.npcData[npc.npcType].name.split(' ')[0]}`);
                show = true; break;
            }
        }
        if (!show) {
            for (const zone of this.interactZones) {
                if (Phaser.Math.Distance.Between(this.player.x, this.player.y, zone.x, zone.y) < TILE * 1.5) {
                    const d = zone.interactData;
                    this.promptText.setText(d.type === 'accusation' ? 'Click or [Space] Make Accusation' : `Click or [Space] Search ${d.label}`);
                    show = true; break;
                }
            }
        }
        this.promptText.setVisible(show);
    }
}
