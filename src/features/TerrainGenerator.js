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

export default class TerrainGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.wfc = new WaveFunctionCollapse(width, height, TILE_SET);
    }

    generate() {
        return this.wfc.collapse();
    }
}
