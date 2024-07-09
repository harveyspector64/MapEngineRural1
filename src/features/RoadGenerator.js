// src/features/RoadGenerator.js

import { TILES } from './TerrainGenerator.js';

const ROAD_TILE = 'road';

export default class RoadGenerator {
    constructor(terrain, structures) {
        this.terrain = terrain;
        this.structures = structures;
        this.width = terrain[0].length;
        this.height = terrain.length;
        this.roads = Array(this.height).fill().map(() => Array(this.width).fill(false));
    }

    generate() {
        this.generatePrimaryRoad();
        this.generateSecondaryRoads();
        this.connectStructures();
        return this.roads;
    }

    generatePrimaryRoad() {
        const y = Math.floor(this.height / 2);
        for (let x = 0; x < this.width; x++) {
            if (this.isValidRoadPosition(x, y)) {
                this.placeRoad(x, y);
                if (x % 2 === 0 && this.isValidRoadPosition(x, y + 1)) {
                    this.placeRoad(x, y + 1);
                }
            }
        }
    }

    generateSecondaryRoads() {
        const numSecondaryRoads = Math.floor(this.width / 50);
        for (let i = 0; i < numSecondaryRoads; i++) {
            const x = Math.floor((i + 1) * this.width / (numSecondaryRoads + 1));
            this.createVerticalRoad(x);
        }
    }

    createVerticalRoad(x) {
        for (let y = 0; y < this.height; y++) {
            if (this.isValidRoadPosition(x, y)) {
                this.placeRoad(x, y);
            }
        }
    }

    connectStructures() {
        this.structures.forEach(structure => {
            const { x, y } = structure.position;
            this.connectToNearestRoad(x, y);
        });
    }

    connectToNearestRoad(startX, startY) {
        const maxDistance = Math.max(this.width, this.height);
        for (let d = 1; d < maxDistance; d++) {
            for (let y = Math.max(0, startY - d); y <= Math.min(this.height - 1, startY + d); y++) {
                for (let x = Math.max(0, startX - d); x <= Math.min(this.width - 1, startX + d); x++) {
                    if (this.roads[y][x]) {
                        this.createSimplePath(startX, startY, x, y);
                        return;
                    }
                }
            }
        }
    }

    createSimplePath(startX, startY, endX, endY) {
        let x = startX;
        let y = startY;
        while (x !== endX || y !== endY) {
            if (x !== endX) {
                x += x < endX ? 1 : -1;
                if (this.isValidRoadPosition(x, y)) this.placeRoad(x, y);
            } else if (y !== endY) {
                y += y < endY ? 1 : -1;
                if (this.isValidRoadPosition(x, y)) this.placeRoad(x, y);
            }
        }
    }

    isValidRoadPosition(x, y) {
        return this.isValidPosition(x, y) && 
               this.terrain[y][x] !== TILES.WATER &&
               !this.roads[y][x];
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    placeRoad(x, y) {
        if (this.isValidPosition(x, y)) {
            this.roads[y][x] = true;
            this.terrain[y][x] = ROAD_TILE;
        }
    }
}
