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
        this.generatePrimaryRoads();
        this.connectStructures();
        this.addRandomLocalRoads();
        return this.roads;
    }

    generatePrimaryRoads() {
        // For now, let's create a single primary road
        const startY = Math.floor(this.height / 2) + Math.floor(Math.random() * (this.height / 4)) - Math.floor(this.height / 8);
        for (let x = 0; x < this.width; x++) {
            const y = startY + Math.floor(Math.sin(x / 20) * 5); // Add some curvature
            this.placeRoad(x, y);
        }
    }

    connectStructures() {
        this.structures.forEach(structure => {
            const { x, y } = structure.position;
            const nearestRoad = this.findNearestRoad(x, y);
            if (nearestRoad) {
                this.createLocalRoad(x, y, nearestRoad.x, nearestRoad.y);
            }
        });
    }

    addRandomLocalRoads() {
        const numRandomRoads = Math.floor(Math.random() * 3) + 2; // 2-4 random roads
        for (let i = 0; i < numRandomRoads; i++) {
            const startX = Math.floor(Math.random() * this.width);
            const startY = Math.floor(Math.random() * this.height);
            const endX = Math.floor(Math.random() * this.width);
            const endY = Math.floor(Math.random() * this.height);
            this.createLocalRoad(startX, startY, endX, endY);
        }
    }

    findNearestRoad(x, y) {
        let nearest = null;
        let minDist = Infinity;
        for (let ry = 0; ry < this.height; ry++) {
            for (let rx = 0; rx < this.width; rx++) {
                if (this.roads[ry][rx]) {
                    const dist = Math.sqrt((x - rx) ** 2 + (y - ry) ** 2);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = { x: rx, y: ry };
                    }
                }
            }
        }
        return nearest;
    }

    createLocalRoad(startX, startY, endX, endY) {
        // Simple line drawing algorithm (Bresenham's)
        let x = startX;
        let y = startY;
        const dx = Math.abs(endX - startX);
        const dy = Math.abs(endY - startY);
        const sx = startX < endX ? 1 : -1;
        const sy = startY < endY ? 1 : -1;
        let err = dx - dy;

        while (true) {
            this.placeRoad(x, y);
            if (x === endX && y === endY) break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }

    placeRoad(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.roads[y][x] = true;
            this.terrain[y][x] = ROAD_TILE;
        }
    }
}
