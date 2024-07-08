// src/features/StructureGenerator.js

import { TILES } from './TerrainGenerator.js';

export const STRUCTURES = {
    BARN: 'barn',
    SILO: 'silo'
};

export default class StructureGenerator {
    constructor(terrain) {
        this.terrain = terrain;
    }

    generate() {
        const structures = [];
        
        // Place barns on farmland
        for (let i = 0; i < 3; i++) {
            const position = this.findSuitablePosition(STRUCTURES.BARN);
            if (position) {
                structures.push({ type: STRUCTURES.BARN, position });
                this.applyStructureToTerrain(position, STRUCTURES.BARN);
            }
        }

        // Place silos on farmland
        for (let i = 0; i < 2; i++) {
            const position = this.findSuitablePosition(STRUCTURES.SILO);
            if (position) {
                structures.push({ type: STRUCTURES.SILO, position });
                this.applyStructureToTerrain(position, STRUCTURES.SILO);
            }
        }

        return structures;
    }

    findSuitablePosition(structureType) {
        const maxAttempts = 100;
        for (let i = 0; i < maxAttempts; i++) {
            const x = Math.floor(Math.random() * this.terrain[0].length);
            const y = Math.floor(Math.random() * this.terrain.length);

            if (this.isSuitableForStructure(x, y, structureType)) {
                return { x, y };
            }
        }
        return null;
    }

    isSuitableForStructure(x, y, structureType) {
        // Ensure the structure is placed on farmland tiles (dirt or crop)
        const suitableTiles = [TILES.FIELD, TILES.CROP];
        return suitableTiles.includes(this.terrain[y][x]);
    }

    applyStructureToTerrain(position, structureType) {
        this.terrain[position.y][position.x] = structureType;
    }
}
