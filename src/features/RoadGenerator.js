// src/features/RoadGenerator.js

import { TILES } from './TerrainGenerator.js';

const ROAD_TILE = 'road';

export default class RoadGenerator {
    constructor() {
        // Remove any parameters from the constructor
        // We'll generate roads for each chunk separately
    }

    generate(terrain, structures) {
        const width = terrain[0].length;
        const height = terrain.length;
        const roads = Array(height).fill().map(() => Array(width).fill(false));

        this.generatePrimaryRoad(terrain, roads);
        this.generateSecondaryRoads(terrain, roads);
        this.connectStructures(terrain, structures, roads);

        return roads;
    }

    generatePrimaryRoad(terrain, roads) {
        const height = terrain.length;
        const width = terrain[0].length;
        let y = Math.floor(height / 2);
        for (let x = 0; x < width; x++) {
            if (Math.random() < 0.1) y += Math.random() < 0.5 ? 1 : -1;
            y = Math.max(1, Math.min(height - 2, y));
            if (this.isValidRoadPosition(terrain, x, y)) {
                roads[y][x] = true;
            }
        }
    }

    generateSecondaryRoads(terrain, roads) {
        const width = terrain[0].length;
        const height = terrain.length;
        const numSecondaryRoads = Math.floor(width / 50);
        for (let i = 0; i < numSecondaryRoads; i++) {
            const x = Math.floor((i + 1) * width / (numSecondaryRoads + 1));
            for (let y = 0; y < height; y++) {
                if (this.isValidRoadPosition(terrain, x, y)) {
                    roads[y][x] = true;
                }
            }
        }
    }

    connectStructures(terrain, structures, roads) {
        structures.forEach(structure => {
            const { x, y } = structure.position;
            this.connectToNearestRoad(terrain, roads, x, y);
        });
    }

    connectToNearestRoad(terrain, roads, startX, startY) {
        const width = terrain[0].length;
        const height = terrain.length;
        const maxDistance = Math.max(width, height);
        for (let d = 1; d < maxDistance; d++) {
            for (let y = Math.max(0, startY - d); y <= Math.min(height - 1, startY + d); y++) {
                for (let x = Math.max(0, startX - d); x <= Math.min(width - 1, startX + d); x++) {
                    if (roads[y][x]) {
                        this.createSimplePath(terrain, roads, startX, startY, x, y);
                        return;
                    }
                }
            }
        }
    }

    createSimplePath(terrain, roads, startX, startY, endX, endY) {
        let x = startX;
        let y = startY;
        while (x !== endX || y !== endY) {
            if (x !== endX) {
                x += x < endX ? 1 : -1;
                if (this.isValidRoadPosition(terrain, x, y)) roads[y][x] = true;
            } else if (y !== endY) {
                y += y < endY ? 1 : -1;
                if (this.isValidRoadPosition(terrain, x, y)) roads[y][x] = true;
            }
        }
    }

    isValidRoadPosition(terrain, x, y) {
        return terrain[y] && terrain[y][x] && terrain[y][x] !== TILES.WATER && terrain[y][x] !== TILES.MOUNTAIN;
    }
}
