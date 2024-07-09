// src/features/RoadGenerator.js

import { TILES } from './TerrainGenerator.js';

export default class RoadGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.width = terrain[0].length;
        this.height = terrain.length;
    }

    generate() {
        console.log("Starting simplified road generation");
        
        // Generate a simple crossroad
        this.generateHorizontalRoad(Math.floor(this.height / 2));
        this.generateVerticalRoad(Math.floor(this.width / 2));

        const roadTiles = this.terrain.flat().filter(tile => tile === TILES.ROAD).length;
        console.log(`Generated ${roadTiles} road tiles`);

        return this.terrain;
    }

    generateHorizontalRoad(y) {
        for (let x = 0; x < this.width; x++) {
            this.terrain[y][x] = TILES.ROAD;
        }
    }

    generateVerticalRoad(x) {
        for (let y = 0; y < this.height; y++) {
            this.terrain[y][x] = TILES.ROAD;
        }
    }
}
