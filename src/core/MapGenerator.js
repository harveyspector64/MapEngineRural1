// src/core/MapGenerator.js
import TerrainGenerator from '../features/TerrainGenerator.js';

export default class MapGenerator {
    constructor(chunkSize = 64) {
        this.chunkSize = chunkSize;
        this.terrainGenerator = new TerrainGenerator(chunkSize, chunkSize);
    }

    generateChunk(chunkX, chunkY) {
        console.log(`MapGenerator: Generating chunk at (${chunkX}, ${chunkY})`);
        const terrain = this.terrainGenerator.generate(chunkX, chunkY);
        
        return {
            x: chunkX,
            y: chunkY,
            terrain: terrain
        };
    }
}
