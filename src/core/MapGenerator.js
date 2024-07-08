// File: src/core/MapGenerator.js
import TerrainGenerator from '../features/TerrainGenerator.js';
import RiverGenerator from '../features/RiverGenerator.js';
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

        // Generate rivers
        const riverGenerator = new RiverGenerator(terrain);
        const riverStart = { x: 0, y: Math.floor(Math.random() * this.height) };
        const riverEnd = { x: this.width - 1, y: Math.floor(Math.random() * this.height) };
        riverGenerator.generate(riverStart, riverEnd);

        // Generate roads
        const roadGenerator = new RoadGenerator(terrain);
        const roadStart = { x: Math.floor(this.width / 4), y: 0 };
        const roadEnd = { x: Math.floor(3 * this.width / 4), y: this.height - 1 };
        roadGenerator.generate(roadStart, roadEnd);

        // Generate structures
        const structureGenerator = new StructureGenerator(terrain);
        const structures = structureGenerator.generate();

        return { terrain, structures };
    }
}
