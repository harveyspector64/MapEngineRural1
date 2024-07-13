// src/core/MapGenerator.js

import TerrainGenerator from '../features/TerrainGenerator.js';
import RoadGenerator from '../features/RoadGenerator.js';
import StructureGenerator from '../features/StructureGenerator.js';

export default class MapGenerator {
    constructor(chunkSize = 64) {
        this.chunkSize = chunkSize;
        this.roadGenerator = new RoadGenerator();
        this.structureGenerator = new StructureGenerator();
    }

    generateChunk(chunkX, chunkY, seed, regionType) {
        const terrainGenerator = new TerrainGenerator(this.chunkSize, this.chunkSize, seed, chunkX, chunkY);
        
        // Generate base terrain for the chunk
        const terrain = terrainGenerator.generate(regionType);

        // Generate structures for the chunk
        const structures = this.structureGenerator.generate(terrain);

        // Generate roads for the chunk
        const roads = this.roadGenerator.generate(terrain, structures);

        // Apply roads to terrain
        for (let y = 0; y < this.chunkSize; y++) {
            for (let x = 0; x < this.chunkSize; x++) {
                if (roads[y][x]) {
                    terrain[y][x] = 'road';
                }
            }
        }

        return {
            x: chunkX,
            y: chunkY,
            terrain,
            structures,
            roads
        };
    }
}
