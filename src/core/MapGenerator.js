// src/core/MapGenerator.js
import TerrainGenerator from '../features/TerrainGenerator.js';
import StructureGenerator from '../features/StructureGenerator.js';
import RoadGenerator from '../features/RoadGenerator.js';

export default class MapGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.noiseSeed = Math.random();
    }

    generate() {
        // Generate terrain
        const terrainGenerator = new TerrainGenerator(this.width, this.height);
        let terrain = terrainGenerator.generate();

        // Generate roads
        const roadGenerator = new RoadGenerator(terrain, this.noiseSeed);
        terrain = roadGenerator.generate();

        // Generate structures
        const structureGenerator = new StructureGenerator(terrain);
        const structures = structureGenerator.generate();

        return { terrain, structures };
    }
}
