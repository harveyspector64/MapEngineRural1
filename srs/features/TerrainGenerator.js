// File: src/features/TerrainGenerator.js

import WaveFunctionCollapse from '../core/WaveFunctionCollapse.js';

const TILES = {
    GRASS: 'grass',
    WATER: 'water',
    FIELD: 'field',
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

class TerrainGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.wfc = new WaveFunctionCollapse(width, height, TILE_SET);
    }

    generate() {
        // Modify WFC to use our adjacency rules
        this.wfc.getValidNeighbors = (tileType) => new Set(ADJACENCY_RULES[tileType]);

        // Generate the terrain
        const terrain = this.wfc.collapse();

        // Post-processing: Ensure water bodies are connected and fields are in reasonable sizes
        this.connectWaterBodies(terrain);
        this.adjustFieldSizes(terrain);

        return terrain;
    }

    connectWaterBodies(terrain) {
        // Implementation to ensure water tiles are connected
        // This could involve flood fill and connecting separate water bodies
    }

    adjustFieldSizes(terrain) {
        // Implementation to ensure fields are in reasonable sizes
        // This could involve merging small fields and splitting large ones
    }
}

export default TerrainGenerator;
