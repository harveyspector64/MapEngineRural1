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
        
        // Place barns
        for (let i = 0; i < 3; i++) {
            const position = this.findSuitablePosition(STRUCTURES.BARN);
            if (position) {
                structures.push({ type: STRUCTURES.BARN, position });
                this.applyStructureToTerrain(position, STRUCTURES.BARN);
            }
        }

        // Place silos
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
        // Check if the surrounding area is suitable for the structure
        // For simplicity, we'll just check if it's on grass and near a field
        if (this.terrain[y][x] !== TILES.GRASS) return false;

        const surroundings = this.getSurroundings(x, y);
        return surroundings.some(tile => tile === TILES.FIELD);
    }

    getSurroundings(x, y) {
        const surroundings = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < this.terrain[0].length && ny >= 0 && ny < this.terrain.length) {
                    surroundings.push(this.terrain[ny][nx]);
                }
            }
        }
        return surroundings;
    }

    applyStructureToTerrain(position, structureType) {
        this.terrain[position.y][position.x] = structureType;
    }
}
