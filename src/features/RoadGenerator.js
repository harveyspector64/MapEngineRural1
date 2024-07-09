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
        console.log('Generating roads...');
        this.generatePrimaryRoad();
        this.generateSecondaryRoads();
        this.connectStructures();
        return this.roads;
    }

    generatePrimaryRoad() {
        console.log('Generating primary road...');
        let y = Math.floor(this.height / 2);
        for (let x = 0; x < this.width; x++) {
            if (Math.random() < 0.1) y += Math.random() < 0.5 ? 1 : -1;
            y = Math.max(1, Math.min(this.height - 2, y));
            
            let attempts = 0;
            while (this.terrain[y][x] === TILES.WATER && attempts < 5) {
                y += Math.random() < 0.5 ? 1 : -1;
                y = Math.max(1, Math.min(this.height - 2, y));
                attempts++;
            }
            
            if (attempts < 5) {
                this.placeRoad(x, y);
                if (Math.random() < 0.7 && y < this.height - 1) this.placeRoad(x, y + 1);
            }
        }
    }

    generateSecondaryRoads() {
        console.log('Generating secondary roads...');
        const numSecondaryRoads = Math.floor(this.width / 30);
        for (let i = 0; i < numSecondaryRoads; i++) {
            const startX = Math.floor((i + 0.5) * this.width / numSecondaryRoads);
            this.createOrganicRoad(startX, 0, startX, this.height - 1);
        }
    }

    createOrganicRoad(startX, startY, endX, endY) {
        let x = startX, y = startY;
        while (y !== endY) {
            if (this.isValidRoadPosition(x, y)) {
                this.placeRoad(x, y);
                if (Math.random() < 0.2) x += Math.random() < 0.5 ? 1 : -1;
                x = Math.max(0, Math.min(this.width - 1, x));
                y += y < endY ? 1 : -1;
            
                if (this.terrain[y][x] === TILES.WATER) {
                    x = x > this.width / 2 ? x - 1 : x + 1;
                    x = Math.max(0, Math.min(this.width - 1, x));
                }
            } else {
                x += Math.random() < 0.5 ? 1 : -1;
                x = Math.max(0, Math.min(this.width - 1, x));
            }
        }
    }

    connectStructures() {
        console.log('Connecting structures...');
        this.structures.forEach((structure, index) => {
            console.log(`Connecting structure ${index + 1}/${this.structures.length}`);
            const { x, y } = structure.position;
            const nearestRoad = this.findNearestRoad(x, y);
            if (nearestRoad) {
                this.createOrganicRoad(x, y, nearestRoad.x, nearestRoad.y);
            } else {
                console.warn(`No nearby road found for structure at (${x}, ${y})`);
            }
        });
    }

    findNearestRoad(x, y) {
        console.log(`Finding nearest road to (${x}, ${y})`);
        let nearest = null;
        let minDist = Infinity;
        const maxSearchDist = Math.max(this.width, this.height) / 2;

        for (let dy = -maxSearchDist; dy <= maxSearchDist; dy++) {
            for (let dx = -maxSearchDist; dx <= maxSearchDist; dx++) {
                const nx = Math.floor(x + dx);
                const ny = Math.floor(y + dy);
                if (this.isValidPosition(nx, ny) && this.roads[ny][nx]) {
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = { x: nx, y: ny };
                    }
                }
            }
        }

        if (!nearest) {
            console.warn(`No road found within search distance for (${x}, ${y})`);
        }

        return nearest;
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
        } else {
            console.warn(`Attempted to place road at invalid position (${x}, ${y})`);
        }
    }
}
