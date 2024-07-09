// src/core/MapGenerator.js
import TerrainGenerator from '../features/TerrainGenerator.js';
import RoadGenerator from '../features/RoadGenerator.js';
import StructureGenerator from '../features/StructureGenerator.js';

export default class MapGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generate() {
        console.log('Generating map...');
        
        // Generate terrain
        const terrainGenerator = new TerrainGenerator(this.width, this.height);
        const terrain = terrainGenerator.generate();

        // Generate structures
        const structureGenerator = new StructureGenerator(terrain);
        const structures = structureGenerator.generate();

        // Generate roads
        const roadGenerator = new RoadGenerator(terrain, structures);
        const roads = roadGenerator.generate();

        // Apply roads to terrain
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (roads[y][x]) {
                    terrain[y][x] = 'road';
                }
            }
        }

        console.log('Map generation complete.');
        return { terrain, structures };
    }
}
