// Mystery Manor - Room and Map Definitions
// TILE is defined in game.js (= TILE_SIZE * SCALE = 32)

// Tile types
const T = {
    EMPTY: 0,
    WOOD: 1,
    STONE: 2,
    GRASS: 3,
    WALL: 4,
    WALL_TOP: 5,
    DOOR: 6,
    WINDOW: 7,
    CARPET: 8,
    DARK: 9,
    KITCHEN: 10
};

// Map tile to texture key
const TILE_TEXTURES = {
    [T.EMPTY]: null,
    [T.WOOD]: 'tile_wood',
    [T.STONE]: 'tile_stone',
    [T.GRASS]: 'tile_grass',
    [T.WALL]: 'tile_wall',
    [T.WALL_TOP]: 'tile_wall_top',
    [T.DOOR]: 'tile_door',
    [T.WINDOW]: 'tile_window',
    [T.CARPET]: 'tile_carpet',
    [T.DARK]: 'tile_dark',
    [T.KITCHEN]: 'tile_kitchen'
};

// Collision tiles — doors (6) are NOT solid so player can walk through them
const SOLID_TILES = [T.WALL, T.WALL_TOP, T.WINDOW];

const ManorMap = {

    rooms: {
        entrance: {
            name: 'Entrance Hall',
            width: 20,
            height: 14,
            playerSpawn: { x: 10, y: 10 },
            ambientColor: '#332222',
            floorTile: T.CARPET,
            layout: [
                //  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9
                [5,5,5,5,5,5,5,5,5,6,6,5,5,5,5,5,5,5,5,5],  // row 0: doors to bedroom at (9,0) and (10,0)
                [4,4,4,4,4,7,4,4,4,4,4,4,4,4,7,4,4,4,4,4],
                [4,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,4],
                [4,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,4],
                [4,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,4],
                [4,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,4],
                [6,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,6],  // row 6: left door to kitchen, right door to library
                [4,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,4],
                [4,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,4],
                [4,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,4],
                [4,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,4],
                [4,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,4],
                [4,4,4,4,4,4,4,4,4,6,6,4,4,4,4,4,4,4,4,4],  // row 12: doors to garden at (9,12) and (10,12)
                [5,5,5,5,5,5,5,5,5,6,6,5,5,5,5,5,5,5,5,5]   // row 13: also door tiles so player can exit
            ],
            furniture: [
                { type: 'furniture_rug', x: 7, y: 5, w: 3, h: 2, solid: false },
                { type: 'furniture_candle', x: 3, y: 2, w: 1, h: 1, solid: true },
                { type: 'furniture_candle', x: 16, y: 2, w: 1, h: 1, solid: true },
                { type: 'furniture_table', x: 9, y: 3, w: 2, h: 1, solid: true },
                { type: 'furniture_painting', x: 10, y: 1, w: 1, h: 1, solid: false, wallMount: true }
            ],
            interactables: [
                { id: 'entrance_painting', type: 'painting', x: 10, y: 2, label: 'Old Painting', clueId: 'painting_clue' },
                { id: 'entrance_table', type: 'search', x: 9, y: 4, label: 'Entrance Table', clueId: 'table_note' },
                { id: 'accusation_podium', type: 'accusation', x: 10, y: 8, label: 'Accusation Podium' }
            ],
            doors: [
                { x: 0, y: 6, targetRoom: 'kitchen', targetX: 18, targetY: 6, side: 'left' },
                { x: 19, y: 6, targetRoom: 'library', targetX: 1, targetY: 6, side: 'right' },
                { x: 9, y: 0, targetRoom: 'bedroom', targetX: 9, targetY: 11, side: 'top' },
                { x: 10, y: 0, targetRoom: 'bedroom', targetX: 10, targetY: 11, side: 'top' },
                { x: 9, y: 13, targetRoom: 'garden', targetX: 9, targetY: 2, side: 'bottom' },
                { x: 10, y: 13, targetRoom: 'garden', targetX: 10, targetY: 2, side: 'bottom' }
            ],
            npcSpawns: ['npc_fox'],
            victimSpawn: null
        },

        kitchen: {
            name: 'Kitchen',
            width: 20,
            height: 14,
            playerSpawn: { x: 18, y: 6 },
            ambientColor: '#332211',
            floorTile: T.KITCHEN,
            layout: [
                [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
                [4,4,4,4,4,4,4,7,4,4,4,4,7,4,4,4,4,4,4,4],
                [4,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,4],
                [4,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,4],
                [4,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,4],
                [4,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,4],
                [4,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,6],  // door at (19,6)
                [4,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,4],
                [4,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,4],
                [4,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,4],
                [4,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,4],
                [4,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,4],
                [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
                [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]
            ],
            furniture: [
                { type: 'furniture_stove', x: 2, y: 2, w: 1, h: 1, solid: true },
                { type: 'furniture_table', x: 8, y: 6, w: 2, h: 1, solid: true },
                { type: 'furniture_barrel', x: 2, y: 10, w: 1, h: 1, solid: true },
                { type: 'furniture_barrel', x: 3, y: 10, w: 1, h: 1, solid: true }
            ],
            interactables: [
                { id: 'kitchen_stove', type: 'search', x: 2, y: 3, label: 'Stove', clueId: 'stove_clue' },
                { id: 'kitchen_barrel', type: 'search', x: 2, y: 9, label: 'Barrels', clueId: 'barrel_clue' },
                { id: 'kitchen_table', type: 'search', x: 9, y: 7, label: 'Kitchen Table', clueId: 'kitchen_note' }
            ],
            doors: [
                { x: 19, y: 6, targetRoom: 'entrance', targetX: 1, targetY: 6, side: 'right' }
            ],
            npcSpawns: ['npc_badger'],
            victimSpawn: null
        },

        library: {
            name: 'Library',
            width: 20,
            height: 14,
            playerSpawn: { x: 1, y: 6 },
            ambientColor: '#221122',
            floorTile: T.WOOD,
            layout: [
                [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
                [4,4,4,4,4,7,4,4,4,4,4,4,4,4,7,4,4,4,4,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],  // door at (0,6)
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
                [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]
            ],
            furniture: [
                { type: 'furniture_bookshelf', x: 2, y: 2, w: 1, h: 1, solid: true },
                { type: 'furniture_bookshelf', x: 4, y: 2, w: 1, h: 1, solid: true },
                { type: 'furniture_bookshelf', x: 6, y: 2, w: 1, h: 1, solid: true },
                { type: 'furniture_bookshelf', x: 17, y: 2, w: 1, h: 1, solid: true },
                { type: 'furniture_bookshelf', x: 17, y: 4, w: 1, h: 1, solid: true },
                { type: 'furniture_chair', x: 9, y: 5, w: 1, h: 1, solid: true },
                { type: 'furniture_chair', x: 12, y: 5, w: 1, h: 1, solid: true },
                { type: 'furniture_table', x: 9, y: 7, w: 2, h: 1, solid: true },
                { type: 'furniture_candle', x: 10, y: 7, w: 1, h: 1, solid: false }
            ],
            interactables: [
                { id: 'library_bookshelf', type: 'search', x: 3, y: 3, label: 'Bookshelf', clueId: 'book_clue' },
                { id: 'library_desk', type: 'search', x: 10, y: 8, label: 'Reading Table', clueId: 'desk_clue' },
                { id: 'library_shelf2', type: 'search', x: 17, y: 3, label: 'Private Shelf', clueId: 'shelf_clue' }
            ],
            doors: [
                { x: 0, y: 6, targetRoom: 'entrance', targetX: 18, targetY: 6, side: 'left' }
            ],
            npcSpawns: ['npc_cat'],
            victimSpawn: null
        },

        bedroom: {
            name: 'Bedroom',
            width: 20,
            height: 14,
            playerSpawn: { x: 10, y: 11 },
            ambientColor: '#222233',
            floorTile: T.WOOD,
            layout: [
                [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
                [4,4,4,4,4,4,7,4,4,4,4,4,7,4,4,4,4,4,4,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],  // door at (0,6) to basement
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4],
                [4,4,4,4,4,4,4,4,4,6,6,4,4,4,4,4,4,4,4,4],  // doors to entrance at (9,12) and (10,12)
                [5,5,5,5,5,5,5,5,5,6,6,5,5,5,5,5,5,5,5,5]   // row 13 also passable
            ],
            furniture: [
                { type: 'furniture_bed', x: 2, y: 3, w: 2, h: 1, solid: true },
                { type: 'furniture_chest', x: 16, y: 3, w: 1, h: 1, solid: true },
                { type: 'furniture_candle', x: 5, y: 3, w: 1, h: 1, solid: true },
                { type: 'furniture_painting', x: 9, y: 1, w: 1, h: 1, solid: false, wallMount: true },
                { type: 'furniture_chair', x: 15, y: 6, w: 1, h: 1, solid: true }
            ],
            interactables: [
                { id: 'bedroom_chest', type: 'search', x: 16, y: 4, label: 'Chest', clueId: 'chest_clue' },
                { id: 'bedroom_bed', type: 'search', x: 3, y: 4, label: 'Under the Bed', clueId: 'bed_clue' },
                { id: 'bedroom_painting', type: 'painting', x: 9, y: 2, label: 'Portrait', clueId: 'portrait_clue' }
            ],
            doors: [
                { x: 9, y: 12, targetRoom: 'entrance', targetX: 9, targetY: 2, side: 'bottom' },
                { x: 10, y: 12, targetRoom: 'entrance', targetX: 10, targetY: 2, side: 'bottom' },
                { x: 0, y: 6, targetRoom: 'basement', targetX: 16, targetY: 6, side: 'left' }
            ],
            npcSpawns: ['npc_rabbit'],
            victimSpawn: { x: 10, y: 6 }
        },

        garden: {
            name: 'Garden',
            width: 24,
            height: 14,
            playerSpawn: { x: 10, y: 2 },
            ambientColor: '#112211',
            floorTile: T.GRASS,
            layout: [
                [5,5,5,5,5,5,5,5,5,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5],  // row 0: passable at (9,0) and (10,0)
                [4,4,4,4,4,4,4,4,4,6,6,4,4,4,4,4,4,4,4,4,4,4,4,4],  // row 1: doors at (9,1) and (10,1)
                [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4],
                [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4],
                [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4],
                [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4],
                [4,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,4],
                [4,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,4],
                [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4],
                [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4],
                [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4],
                [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4],
                [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
                [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]
            ],
            furniture: [
                { type: 'furniture_barrel', x: 3, y: 4, w: 1, h: 1, solid: true },
                { type: 'furniture_barrel', x: 20, y: 4, w: 1, h: 1, solid: true },
                { type: 'furniture_barrel', x: 20, y: 9, w: 1, h: 1, solid: true }
            ],
            interactables: [
                { id: 'garden_barrel', type: 'search', x: 3, y: 5, label: 'Garden Barrel', clueId: 'garden_clue' },
                { id: 'garden_fountain', type: 'search', x: 12, y: 7, label: 'Stone Path', clueId: 'path_clue' },
                { id: 'garden_bush', type: 'search', x: 20, y: 5, label: 'Behind the Barrels', clueId: 'bush_clue' }
            ],
            doors: [
                { x: 9, y: 1, targetRoom: 'entrance', targetX: 9, targetY: 11, side: 'top' },
                { x: 10, y: 1, targetRoom: 'entrance', targetX: 10, targetY: 11, side: 'top' }
            ],
            npcSpawns: ['npc_peacock'],
            victimSpawn: null
        },

        basement: {
            name: 'Basement',
            width: 18,
            height: 14,
            playerSpawn: { x: 16, y: 6 },
            ambientColor: '#111111',
            floorTile: T.DARK,
            layout: [
                [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
                [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
                [4,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,4],
                [4,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,4],
                [4,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,4],
                [4,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,4],
                [4,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,6],  // door at (17,6)
                [4,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,4],
                [4,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,4],
                [4,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,4],
                [4,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,4],
                [4,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,4],
                [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
                [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]
            ],
            furniture: [
                { type: 'furniture_barrel', x: 2, y: 3, w: 1, h: 1, solid: true },
                { type: 'furniture_barrel', x: 3, y: 3, w: 1, h: 1, solid: true },
                { type: 'furniture_barrel', x: 4, y: 3, w: 1, h: 1, solid: true },
                { type: 'furniture_chest', x: 2, y: 9, w: 1, h: 1, solid: true },
                { type: 'furniture_candle', x: 8, y: 5, w: 1, h: 1, solid: true }
            ],
            interactables: [
                { id: 'basement_chest', type: 'search', x: 2, y: 8, label: 'Old Chest', clueId: 'basement_chest_clue' },
                { id: 'basement_barrels', type: 'search', x: 3, y: 4, label: 'Dusty Barrels', clueId: 'basement_barrel_clue' },
                { id: 'basement_corner', type: 'search', x: 15, y: 10, label: 'Dark Corner', clueId: 'corner_clue' }
            ],
            doors: [
                { x: 17, y: 6, targetRoom: 'bedroom', targetX: 1, targetY: 6, side: 'right' }
            ],
            npcSpawns: ['npc_parrot'],
            victimSpawn: null
        }
    },

    getRoomList() {
        return Object.keys(this.rooms);
    },

    getRoom(roomId) {
        return this.rooms[roomId];
    },

    isSolid(tileType) {
        return SOLID_TILES.includes(tileType);
    },

    getTileAt(room, x, y) {
        if (y < 0 || y >= room.layout.length || x < 0 || x >= room.layout[0].length) {
            return T.WALL;
        }
        return room.layout[y][x];
    }
};
