// src/core/MapGenerator.js
import TerrainGenerator from '../features/TerrainGenerator.js';
import RoadGenerator from '../features/RoadGenerator.js';
import StructureGenerator from '../features/StructureGenerator.js';

const GENERATION_TIMEOUT = 10000; // 10 seconds timeout

export default class MapGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generate() {
        return new Promise((resolve, reject) => {
            console.log('Generating map...');
            
            const terrainGenerator = new TerrainGenerator(this.width, this.height);
            const terrain = terrainGenerator.generate();

            const structureGenerator = new StructureGenerator(terrain);
            const structures = structureGenerator.generate();

            console.log(`Generated ${structures.length} structures`);

            const roadGenerator = new RoadGenerator(terrain, structures);
            
            const timeoutId = setTimeout(() => {
                reject(new Error('Map generation timed out'));
            }, GENERATION_TIMEOUT);

            try {
                const roads = roadGenerator.generate();
                
                // Apply roads to terrain
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        if (roads[y][x]) {
                            terrain[y][x] = 'road';
                        }
                    }
                }

                clearTimeout(timeoutId);
                console.log('Map generation complete.');
                resolve({ terrain, structures });
            } catch (error) {
                clearTimeout(timeoutId);
                console.error('Error generating roads:', error);
                // Resolve with the map without roads if road generation fails
                resolve({ terrain, structures });
            }
        });
    }
}
