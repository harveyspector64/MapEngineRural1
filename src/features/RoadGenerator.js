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
        this.removeIsolatedRoads();
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
            const nearestRoadPoint = this.findNearestRoadPoint(x, y);
            if (nearestRoadPoint) {
                this.createRoadToStructure(x, y, nearestRoadPoint.x, nearestRoadPoint.y);
            }
        });
    }

    findNearestRoadPoint(x, y) {
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

    createRoadToStructure(startX, startY, endX, endY) {
        let x = startX;
        let y = startY;

        while (x !== endX || y !== endY) {
            this.placeRoad(x, y);

            const dx = endX - x;
            const dy = endY - y;

            if (Math.abs(dx) > Math.abs(dy)) {
                x += Math.sign(dx);
            } else {
                y += Math.sign(dy);
            }
        }

        this.placeRoad(endX, endY);
    }

    removeIsolatedRoads() {
        const newRoads = JSON.parse(JSON.stringify(this.roads));

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.roads[y][x] && this.isIsolatedRoad(x, y)) {
                    newRoads[y][x] = false;
                    this.terrain[y][x] = TILES.GRASS; // or whatever the default terrain is
                }
            }
        }

        this.roads = newRoads;
    }

    isIsolatedRoad(x, y) {
        const neighbors = [
            {dx: -1, dy: 0}, {dx: 1, dy: 0},
            {dx: 0, dy: -1}, {dx: 0, dy: 1}
        ];

        let connectedNeighbors = 0;
        for (const {dx, dy} of neighbors) {
            if (this.isValidPosition(x + dx, y + dy) && this.roads[y + dy][x + dx]) {
                connectedNeighbors++;
            }
        }

        return connectedNeighbors <= 1;
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
