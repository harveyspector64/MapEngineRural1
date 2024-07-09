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

        console.log(`Generated ${structures.length} structures`);

        // Generate roads
        const roadGenerator = new RoadGenerator(terrain, structures);
        let roads;
        try {
            if (typeof roadGenerator.generate !== 'function') {
                throw new Error('generate method is not defined in RoadGenerator');
            }
            roads = roadGenerator.generate();
        } catch (error) {
            console.error('Error generating roads:', error);
            roads = Array(this.height).fill().map(() => Array(this.width).fill(false));
        }

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
