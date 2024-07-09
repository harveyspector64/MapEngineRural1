// src/features/RoadGenerator.js

// Make sure to import TILES from your TerrainGenerator.js file
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
        this.initializeRoadGrid();
        this.connectStructures();
        this.addLocalRoads();
        this.smoothRoads();
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

    initializeRoadGrid() {
        const gridSize = 10;
        this.roadGrid = Array(Math.ceil(this.height / gridSize))
            .fill()
            .map(() => Array(Math.ceil(this.width / gridSize)).fill().map(() => []));

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.roads[y][x]) {
                    const gridY = Math.floor(y / gridSize);
                    const gridX = Math.floor(x / gridSize);
                    this.roadGrid[gridY][gridX].push({x, y});
                }
            }
        }
    }

    connectStructures() {
        this.structures.forEach(structure => {
            const { x, y } = structure.position;
            const nearestRoad = this.findNearestRoad(x, y);
            if (nearestRoad) {
                this.createSmoothRoad(x, y, nearestRoad.x, nearestRoad.y);
            }
        });
    }

    addLocalRoads() {
        const numLocalRoads = Math.floor(this.width * this.height / 10000);
        for (let i = 0; i < numLocalRoads; i++) {
            const startX = Math.floor(Math.random() * this.width);
            const startY = Math.floor(Math.random() * this.height);
            const nearestRoad = this.findNearestRoad(startX, startY);
            if (nearestRoad) {
                this.createSmoothRoad(startX, startY, nearestRoad.x, nearestRoad.y);
            }
        }
    }

    findNearestRoad(x, y) {
        if (!this.roadGrid) {
            this.initializeRoadGrid();
        }

        const gridSize = 10;
        const startGridX = Math.floor(x / gridSize);
        const startGridY = Math.floor(y / gridSize);

        let nearest = null;
        let minDist = Infinity;

        for (let radius = 0; radius < Math.max(this.width, this.height) / gridSize; radius++) {
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const gridX = startGridX + dx;
                        const gridY = startGridY + dy;
                        if (gridX >= 0 && gridX < this.roadGrid[0].length && gridY >= 0 && gridY < this.roadGrid.length) {
                            for (const road of this.roadGrid[gridY][gridX]) {
                                const dist = Math.sqrt((x - road.x) ** 2 + (y - road.y) ** 2);
                                if (dist < minDist) {
                                    minDist = dist;
                                    nearest = road;
                                }
                            }
                        }
                    }
                }
            }
            if (nearest) break;
        }

        return nearest;
    }

    createSmoothRoad(startX, startY, endX, endY) {
        const points = this.generateSmoothPath(startX, startY, endX, endY);
        for (let i = 1; i < points.length; i++) {
            this.drawSmoothLine(points[i-1].x, points[i-1].y, points[i].x, points[i].y);
        }
    }

    generateSmoothPath(startX, startY, endX, endY) {
        const points = [{x: startX, y: startY}];
        let currentX = startX;
        let currentY = startY;

        while (currentX !== endX || currentY !== endY) {
            const dx = endX - currentX;
            const dy = endY - currentY;

            if (Math.abs(dx) > Math.abs(dy)) {
                currentX += Math.sign(dx);
                if (Math.random() < Math.abs(dy) / Math.abs(dx)) {
                    currentY += Math.sign(dy);
                }
            } else {
                currentY += Math.sign(dy);
                if (Math.random() < Math.abs(dx) / Math.abs(dy)) {
                    currentX += Math.sign(dx);
                }
            }

            points.push({x: currentX, y: currentY});
        }

        return points;
    }

    drawSmoothLine(x0, y0, x1, y1) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            this.placeRoad(x0, y0);

            if ((x0 === x1) && (y0 === y1)) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    }

    smoothRoads() {
        const newRoads = JSON.parse(JSON.stringify(this.roads));

        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.roads[y][x]) {
                    this.smoothRoadTile(x, y, newRoads);
                }
            }
        }

        this.roads = newRoads;
    }

    smoothRoadTile(x, y, newRoads) {
        const neighbors = [
            {dx: -1, dy: 0}, {dx: 1, dy: 0},
            {dx: 0, dy: -1}, {dx: 0, dy: 1}
        ];

        let roadNeighbors = 0;
        for (const {dx, dy} of neighbors) {
            if (this.roads[y + dy][x + dx]) {
                roadNeighbors++;
            }
        }

        if (roadNeighbors <= 1) {
            newRoads[y][x] = false;
            this.terrain[y][x] = TILES.GRASS; // or whatever the default terrain is
        } else {
            newRoads[y][x] = true;
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
