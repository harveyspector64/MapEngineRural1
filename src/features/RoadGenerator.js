// src/features/RoadGenerator.js

import { TILES } from './TerrainGenerator.js';

export default class RoadGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.width = terrain[0].length;
        this.height = terrain.length;
    }

    generate() {
        console.log("Starting dynamic road generation");
        
        // Generate a main road
        this.generateMainRoad();
        
        // Generate a few branch roads
        const branchPoints = this.selectBranchPoints();
        branchPoints.forEach(point => this.generateBranchRoad(point));

        const roadTiles = this.terrain.flat().filter(tile => tile === TILES.ROAD).length;
        console.log(`Generated ${roadTiles} road tiles`);

        return this.terrain;
    }

    generateMainRoad() {
        const startY = Math.floor(this.height / 2);
        let x = 0;
        let y = startY;

        while (x < this.width) {
            this.terrain[y][x] = TILES.ROAD;
            x++;
            if (Math.random() < 0.2) { // 20% chance to move up or down
                y += Math.random() < 0.5 ? 1 : -1;
                y = Math.max(0, Math.min(y, this.height - 1)); // Keep within bounds
            }
        }
    }

    selectBranchPoints() {
        const branchPoints = [];
        for (let x = 0; x < this.width; x += Math.floor(this.width / 3)) {
            for (let y = 0; y < this.height; y++) {
                if (this.terrain[y][x] === TILES.ROAD) {
                    branchPoints.push({x, y});
                    break;
                }
            }
        }
        return branchPoints;
    }

    generateBranchRoad(start) {
        let x = start.x;
        let y = start.y;
        const direction = Math.random() < 0.5 ? 1 : -1; // Up or down

        while (y >= 0 && y < this.height) {
            this.terrain[y][x] = TILES.ROAD;
            y += direction;
            if (Math.random() < 0.3) { // 30% chance to move left or right
                x += Math.random() < 0.5 ? 1 : -1;
                x = Math.max(0, Math.min(x, this.width - 1)); // Keep within bounds
            }
        }
    }
}
