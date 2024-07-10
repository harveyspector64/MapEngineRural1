// src/features/StructureGenerator.js

import { TILES } from './TerrainGenerator.js';

export const STRUCTURES = {
    BARN: 'barn',
    SILO: 'silo'
};

export default class StructureGenerator {
    constructor() {
        // No need for parameters in the constructor
    }

    generate(terrain) {
        const structures = [];
        
        // Place barns on farmland
        for (let i = 0; i < 3; i++) {
            const position = this.findSuitablePosition(terrain, STRUCTURES.BARN);
            if (position) {
                structures.push({ type: STRUCTURES.BARN, position });
                this.applyStructureToTerrain(terrain, position, STRUCTURES.BARN);
            }
        }

        // Place silos on farmland
        for (let i = 0; i < 2; i++) {
            const position = this.findSuitablePosition(terrain, STRUCTURES.SILO);
            if (position) {
                structures.push({ type: STRUCTURES.SILO, position });
                this.applyStructureToTerrain(terrain, position, STRUCTURES.SILO);
            }
        }

        return structures;
    }

    findSuitablePosition(terrain, structureType) {
        const maxAttempts = 100;
        for (let i = 0; i < maxAttempts; i++) {
            const x = Math.floor(Math.random() * terrain[0].length);
            const y = Math.floor(Math.random() * terrain.length);

            if (this.isSuitableForStructure(terrain, x, y, structureType)) {
                return { x, y };
            }
        }
        return null;
    }

    isSuitableForStructure(terrain, x, y, structureType) {
        // Ensure the structure is placed on farmland tiles (dirt or crop)
        const suitableTiles = [TILES.FIELD, TILES.CROP];
        return suitableTiles.includes(terrain[y][x]);
    }

    applyStructureToTerrain(terrain, position, structureType) {
        terrain[position.y][position.x] = structureType;
    }
}
