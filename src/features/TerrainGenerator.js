// File: src/features/TerrainGenerator.js

import WaveFunctionCollapse from '../core/WaveFunctionCollapse.js';

export const TILES = {
    GRASS: 'grass',
    WATER: 'water',
    FIELD: 'field',
    TREE: 'tree',
    BUSH: 'bush',
    HILL: 'hill'
};

export const TILE_SET = [
    { type: TILES.GRASS, weight: 10 },
    { type: TILES.WATER, weight: 2 },
    { type: TILES.FIELD, weight: 5 },
    { type: TILES.TREE, weight: 3 },
    { type: TILES.BUSH, weight: 2 },
    { type: TILES.HILL, weight: 1 }
];

export const ADJACENCY_RULES = {
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
        this.wfc = new WaveFunctionCollapse(width, height, TILE_SET);
    }

    generate() {
        this.wfc.getValidNeighbors = this.getValidNeighbors.bind(this);
        const terrain = this.wfc.collapse();
        this.postProcessTerrain(terrain);
        return terrain;
    }

    getValidNeighbors(tileType, dx, dy) {
        const validNeighbors = new Set(ADJACENCY_RULES[tileType]);
        
        // Additional rules for more realistic placement
        if (tileType === TILES.WATER) {
            // Water is more likely to have water neighbors
            if (Math.random() < 0.7) {
                return new Set([TILES.WATER]);
            }
        } else if (tileType === TILES.FIELD) {
            // Fields tend to cluster
            if (Math.random() < 0.6) {
                return new Set([TILES.FIELD, TILES.GRASS]);
            }
        } else if (tileType === TILES.TREE) {
            // Trees tend to form small forests
            if (Math.random() < 0.5) {
                return new Set([TILES.TREE, TILES.BUSH]);
            }
        }

        return validNeighbors;
    }

    postProcessTerrain(terrain) {
        this.connectWaterBodies(terrain);
        this.adjustFieldSizes(terrain);
        this.createForests(terrain);
    }

    connectWaterBodies(terrain) {
        // Implementation to ensure water tiles are connected
        // This could involve flood fill and connecting separate water bodies
        // For simplicity, we'll just ensure there's a minimum number of water tiles
        let waterCount = terrain.flat().filter(tile => tile === TILES.WATER).length;
        const minWaterTiles = Math.floor(this.width * this.height * 0.1); // 10% of the map
        
        while (waterCount < minWaterTiles) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            if (terrain[y][x] !== TILES.WATER) {
                terrain[y][x] = TILES.WATER;
                waterCount++;
            }
        }
    }

    adjustFieldSizes(terrain) {
        // Implementation to ensure fields are in reasonable sizes
        // This could involve merging small fields and splitting large ones
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (terrain[y][x] === TILES.FIELD) {
                    const fieldSize = this.getFieldSize(terrain, x, y);
                    if (fieldSize < 3) {
                        // Convert small fields to grass
                        this.convertField(terrain, x, y, TILES.GRASS);
                    } else if (fieldSize > 20) {
                        // Split large fields
                        this.splitField(terrain, x, y);
                    }
                }
            }
        }
    }

    getFieldSize(terrain, startX, startY) {
        const visited = new Set();
        const stack = [{x: startX, y: startY}];
        let size = 0;

        while (stack.length > 0) {
            const {x, y} = stack.pop();
            const key = `${x},${y}`;
            if (visited.has(key)) continue;

            visited.add(key);
            if (terrain[y][x] === TILES.FIELD) {
                size++;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx, ny = y + dy;
                        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                            stack.push({x: nx, y: ny});
                        }
                    }
                }
            }
        }

        return size;
    }

    convertField(terrain, startX, startY, newTile) {
        const stack = [{x: startX, y: startY}];
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            if (terrain[y][x] === TILES.FIELD) {
                terrain[y][x] = newTile;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx, ny = y + dy;
                        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                            stack.push({x: nx, y: ny});
                        }
                    }
                }
            }
        }
    }

    splitField(terrain, x, y) {
        // For simplicity, we'll just add some grass patches to the field
        for (let i = 0; i < 5; i++) {
            const dx = Math.floor(Math.random() * 5) - 2;
            const dy = Math.floor(Math.random() * 5) - 2;
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && terrain[ny][nx] === TILES.FIELD) {
                terrain[ny][nx] = TILES.GRASS;
            }
        }
    }

    createForests(terrain) {
        // Create clusters of trees to form forests
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (terrain[y][x] === TILES.TREE && Math.random() < 0.3) {
                    this.growForest(terrain, x, y);
                }
            }
        }
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
}
