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
        this.connectStructures();
        this.addLocalRoads();
        return this.roads;
    }

    generatePrimaryRoad() {
        let x = 0;
        let y = Math.floor(this.height / 2);
        const endX = this.width - 1;

        while (x <= endX) {
            this.placeRoad(x, y);

            // Determine next position
            const nextSteps = [
                {x: x+1, y: y-1},
                {x: x+1, y: y},
                {x: x+1, y: y+1}
            ].filter(pos => this.isValidPosition(pos.x, pos.y));

            if (nextSteps.length === 0) break;

            // Choose next step based on terrain
            const nextStep = this.chooseNextStep(nextSteps);
            x = nextStep.x;
            y = nextStep.y;
        }
    }

    chooseNextStep(steps) {
        // Prefer flat terrain, avoid water
        const weights = steps.map(step => {
            if (this.terrain[step.y][step.x] === TILES.WATER) return 0;
            if (this.terrain[step.y][step.x] === TILES.GRASS) return 3;
            if (this.terrain[step.y][step.x] === TILES.FIELD) return 2;
            return 1;
        });

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < steps.length; i++) {
            if (random < weights[i]) return steps[i];
            random -= weights[i];
        }

        return steps[steps.length - 1];
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

    addLocalRoads() {
        const numLocalRoads = Math.floor(this.width * this.height / 10000); // Adjust as needed
        for (let i = 0; i < numLocalRoads; i++) {
            const startX = Math.floor(Math.random() * this.width);
            const startY = Math.floor(Math.random() * this.height);
            const nearestRoad = this.findNearestRoad(startX, startY);
            if (nearestRoad) {
                this.createLocalRoad(startX, startY, nearestRoad.x, nearestRoad.y);
            }
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
        if (this.isValidPosition(x, y)) {
            this.roads[y][x] = true;
            this.terrain[y][x] = ROAD_TILE;
        }
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
}
