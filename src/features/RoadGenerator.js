// src/features/RoadGenerator.js

import { TILES } from './TerrainGenerator.js';
import AStar from '../core/AStar.js';

export default class RoadGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.width = terrain[0].length;
        this.height = terrain.length;
        this.astar = new AStar(terrain);
    }

    generate() {
        console.log("Starting road generation");
        const keyPoints = this.generateKeyPoints();
        console.log("Key points generated:", keyPoints);

        const mainRoads = this.generateMainRoads(keyPoints);
        console.log("Main roads generated:", mainRoads.length);

        this.applyRoadsToTerrain(mainRoads);

        const roadTiles = this.terrain.flat().filter(tile => tile === TILES.ROAD).length;
        console.log(`Generated ${roadTiles} road tiles`);

        return this.terrain;
    }

    generateKeyPoints() {
        // For simplicity, let's just use the four corners of the map
        return [
            {x: 0, y: 0},
            {x: this.width - 1, y: 0},
            {x: 0, y: this.height - 1},
            {x: this.width - 1, y: this.height - 1}
        ];
    }

    generateMainRoads(keyPoints) {
        const roads = [];
        for (let i = 0; i < keyPoints.length; i++) {
            for (let j = i + 1; j < keyPoints.length; j++) {
                const path = this.astar.findPath(keyPoints[i], keyPoints[j], {
                    costFunction: this.roadCostFunction.bind(this)
                });
                if (path) {
                    console.log(`Path found from (${keyPoints[i].x},${keyPoints[i].y}) to (${keyPoints[j].x},${keyPoints[j].y})`);
                    roads.push(path);
                } else {
                    console.warn(`No path found between (${keyPoints[i].x},${keyPoints[i].y}) and (${keyPoints[j].x},${keyPoints[j].y})`);
                }
            }
        }
        return roads;
    }

    roadCostFunction(current, neighbor) {
        const tile = this.terrain[neighbor.y][neighbor.x];
        if (tile === TILES.WATER) return 100; // Avoid water
        if (tile === TILES.FIELD || tile === TILES.CROP) return 2; // Prefer going through fields
        return 1; // Default cost
    }

    applyRoadsToTerrain(roads) {
        roads.forEach(road => {
            road.forEach(point => {
                this.terrain[point.y][point.x] = TILES.ROAD;
            });
        });
    }
}
