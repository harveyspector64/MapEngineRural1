// File: src/core/WaveFunctionCollapse.js
export default class WaveFunctionCollapse {
    constructor(width, height, tileSet, adjacencyRules) {
        this.width = width;
        this.height = height;
        this.tileSet = tileSet;
        this.adjacencyRules = adjacencyRules;
        this.grid = Array(height).fill().map(() => Array(width).fill(null));
    }

    collapse() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.grid[y][x]) {
                    this.collapseCell(x, y);
                }
            }
        }
        return this.grid;
    }

    collapseCell(x, y) {
        const validTiles = this.getValidTiles(x, y);
        const selectedTile = this.selectWeightedRandomTile(validTiles);
        this.grid[y][x] = selectedTile;
    }

    getValidTiles(x, y) {
        const neighbors = this.getNeighbors(x, y);
        let validTiles = this.tileSet;

        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && this.grid[ny][nx]) {
                validTiles = validTiles.filter(tile => 
                    this.adjacencyRules[this.grid[ny][nx]].includes(tile.type)
                );
            }
        }

        return validTiles;
    }

    getNeighbors(x, y) {
        const neighbors = {};
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                neighbors[`${dx},${dy}`] = this.grid[ny][nx];
            }
        }
        return neighbors;
    }

    selectWeightedRandomTile(tiles) {
        const totalWeight = tiles.reduce((sum, tile) => sum + tile.weight, 0);
        let random = Math.random() * totalWeight;
        for (let tile of tiles) {
            if (random < tile.weight) return tile.type;
            random -= tile.weight;
        }
        return tiles[tiles.length - 1].type;
    }
}

// File: src/features/TerrainGenerator.js
import WaveFunctionCollapse from '../core/WaveFunctionCollapse.js';

export const TILES = {
    GRASS: 'grass',
    WATER: 'water',
    FIELD: 'dirt',
    TREE: 'tree',
    BUSH: 'bush',
    HILL: 'hill'
};

const TILE_SET = [
    { type: TILES.GRASS, weight: 10 },
    { type: TILES.WATER, weight: 2 },
    { type: TILES.FIELD, weight: 5 },
    { type: TILES.TREE, weight: 3 },
    { type: TILES.BUSH, weight: 2 },
    { type: TILES.HILL, weight: 1 }
];

const ADJACENCY_RULES = {
    [TILES.GRASS]: [TILES.GRASS, TILES.FIELD, TILES.TREE, TILES.BUSH, TILES.HILL, TILES.WATER],
    [TILES.WATER]: [TILES.WATER, TILES.GRASS],
    [TILES.FIELD]: [TILES.FIELD, TILES.GRASS],
    [TILES.TREE]: [TILES.TREE, TILES.GRASS, TILES.BUSH],
    [TILES.BUSH]: [TILES.BUSH, TILES.GRASS, TILES.TREE],
    [TILES.HILL]: [TILES.HILL, TILES.GRASS]
};

export default class TerrainGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.wfc = new WaveFunctionCollapse(width, height, TILE_SET, ADJACENCY_RULES);
    }

    generate() {
        let terrain = this.wfc.collapse();
        terrain = this.createForests(terrain);
        terrain = this.createFarmland(terrain);
        terrain = this.createLakes(terrain);
        return terrain;
    }

    createForests(terrain) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (terrain[y][x] === TILES.TREE && Math.random() < 0.3) {
                    this.growForest(terrain, x, y);
                }
            }
        }
        return terrain;
    }

    growForest(terrain, x, y) {
        const forestSize = Math.floor(Math.random() * 10) + 5;
        for (let i = 0; i < forestSize; i++) {
            const dx = Math.floor(Math.random() * 5) - 2;
            const dy = Math.floor(Math.random() * 5) - 2;
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && terrain[ny][nx] === TILES.GRASS) {
                terrain[ny][nx] = Math.random() < 0.7 ? TILES.TREE : TILES.BUSH;
            }
        }
    }

    createFarmland(terrain) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (terrain[y][x] === TILES.FIELD && Math.random() < 0.4) {
                    this.createFarm(terrain, x, y);
                }
            }
        }
        return terrain;
    }

    createFarm(terrain, x, y) {
        const farmSize = Math.floor(Math.random() * 5) + 3;
        for (let dy = 0; dy < farmSize; dy++) {
            for (let dx = 0; dx < farmSize; dx++) {
                const nx = x + dx, ny = y + dy;
                if (nx < this.width && ny < this.height && terrain[ny][nx] === TILES.GRASS) {
                    terrain[ny][nx] = TILES.FIELD;
                }
            }
        }
    }

    createLakes(terrain) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (terrain[y][x] === TILES.WATER && Math.random() < 0.2) {
                    this.growLake(terrain, x, y);
                }
            }
        }
        return terrain;
    }

    growLake(terrain, x, y) {
        const lakeSize = Math.floor(Math.random() * 15) + 5;
        for (let i = 0; i < lakeSize; i++) {
            const dx = Math.floor(Math.random() * 5) - 2;
            const dy = Math.floor(Math.random() * 5) - 2;
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && 
                (terrain[ny][nx] === TILES.GRASS || terrain[ny][nx] === TILES.WATER)) {
                terrain[ny][nx] = TILES.WATER;
            }
        }
    }
}
