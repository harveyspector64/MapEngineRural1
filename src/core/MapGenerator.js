// src/core/MapGenerator.js
import TerrainGenerator from '../features/TerrainGenerator.js';
import RoadGenerator from '../features/RoadGenerator.js';
import StructureGenerator from '../features/StructureGenerator.js';

export default class MapGenerator {
    constructor(chunkSize = 64) {
        this.chunkSize = chunkSize;
        this.terrainGenerator = new TerrainGenerator(chunkSize, chunkSize);
        this.roadGenerator = new RoadGenerator();
        this.structureGenerator = new StructureGenerator();
    }

generateChunk(chunkX, chunkY) {
    // Generate terrain for this chunk
    const terrain = this.terrainGenerator.generate(chunkX, chunkY);
    const structures = this.structureGenerator.generate(terrain);
    const roads = this.roadGenerator.generate(terrain, structures);

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

    getNeighboringChunks(chunkX, chunkY) {
        return [
            {x: chunkX - 1, y: chunkY},
            {x: chunkX + 1, y: chunkY},
            {x: chunkX, y: chunkY - 1},
            {x: chunkX, y: chunkY + 1}
        ];
    }
}
