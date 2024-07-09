// src/core/MapGenerator.js
import TerrainGenerator from '../features/TerrainGenerator.js';
// import RiverGenerator from '../features/RiverGenerator.js';  // Commented out for now
import RoadGenerator from '../features/RoadGenerator.js';
import StructureGenerator from '../features/StructureGenerator.js';

export default class MapGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generate() {
        // Generate terrain
        const terrainGenerator = new TerrainGenerator(this.width, this.height);
        const terrain = terrainGenerator.generate();

        // Generate rivers (commented out for now)
        // const riverGenerator = new RiverGenerator(terrain);
        // riverGenerator.generate();

        // Generate structures
        const structureGenerator = new StructureGenerator(terrain);
        const structures = structureGenerator.generate();

        // Generate roads
        const roadGenerator = new RoadGenerator(terrain, structures);
        const roads = roadGenerator.generate();

        return { terrain, structures, roads };
    }
}
