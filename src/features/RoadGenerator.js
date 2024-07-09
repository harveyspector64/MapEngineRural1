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
        this.generateLocalRoads();
        return this.roads;
    }

    generatePrimaryRoad() {
        let x = 0;
        let y = Math.floor(this.height / 2);

        while (x < this.width - 1) {
            if (this.isValidRoadPosition(x, y) && this.isValidRoadPosition(x+1, y) &&
                this.isValidRoadPosition(x, y+1) && this.isValidRoadPosition(x+1, y+1)) {
                this.placePrimaryRoad(x, y);
                x += 2;
            } else {
                // Find the nearest valid position
                let found = false;
                for (let offset = 1; offset < 10 && !found; offset++) {
                    for (let dy of [-offset, offset]) {
                        if (this.isValidRoadPosition(x, y + dy) && this.isValidRoadPosition(x+1, y + dy) &&
                            this.isValidRoadPosition(x, y + dy + 1) && this.isValidRoadPosition(x+1, y + dy + 1)) {
                            y += dy;
                            found = true;
                            break;
                        }
                    }
                }
                if (!found) x += 2; // Skip if no valid position found
            }
        }
    }

    generateSecondaryRoads() {
        for (let x = 0; x < this.width; x += Math.floor(this.width / 4)) {
            let y = this.findNearestPrimaryRoad(x);
            if (y !== null) {
                this.createSecondaryRoad(x, y, Math.random() < 0.5 ? -1 : 1);
            }
        }
    }

    createSecondaryRoad(startX, startY, direction) {
        let x = startX;
        let y = startY;
        while (y >= 0 && y < this.height) {
            if (this.isValidRoadPosition(x, y)) {
                this.placeRoad(x, y);
                y += direction;
                if (Math.random() < 0.2) x += Math.random() < 0.5 ? -1 : 1;
            } else {
                break;
            }
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

    generateLocalRoads() {
        for (let i = 0; i < this.width * this.height / 10000; i++) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            if (this.isValidRoadPosition(x, y)) {
                this.createLocalRoadNetwork(x, y);
            }
        }
    }

    createLocalRoadNetwork(startX, startY) {
        const queue = [{x: startX, y: startY}];
        const visited = new Set();

        while (queue.length > 0 && visited.size < 20) {
            const {x, y} = queue.shift();
            if (visited.has(`${x},${y}`) || !this.isValidRoadPosition(x, y)) continue;

            visited.add(`${x},${y}`);
            this.placeRoad(x, y);

            for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
                const nx = x + dx;
                const ny = y + dy;
                if (this.isValidPosition(nx, ny) && Math.random() < 0.7) {
                    queue.push({x: nx, y: ny});
                }
            }
        }
    }

    createLocalRoad(startX, startY, endX, endY) {
        const path = this.findPath(startX, startY, endX, endY);
        path.forEach(({x, y}) => this.placeRoad(x, y));
    }

    findPath(startX, startY, endX, endY) {
        // Simple A* pathfinding
        const openSet = [{x: startX, y: startY, g: 0, h: this.heuristic(startX, startY, endX, endY)}];
        const cameFrom = {};
        const gScore = {[`${startX},${startY}`]: 0};

        while (openSet.length > 0) {
            const current = openSet.reduce((a, b) => (a.g + a.h < b.g + b.h) ? a : b);
            if (current.x === endX && current.y === endY) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.splice(openSet.indexOf(current), 1);
            for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
                const neighbor = {x: current.x + dx, y: current.y + dy};
                if (!this.isValidPosition(neighbor.x, neighbor.y)) continue;

                const tentativeGScore = gScore[`${current.x},${current.y}`] + 1;
                if (tentativeGScore < (gScore[`${neighbor.x},${neighbor.y}`] || Infinity)) {
                    cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                    gScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore;
                    neighbor.g = tentativeGScore;
                    neighbor.h = this.heuristic(neighbor.x, neighbor.y, endX, endY);
                    if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        return []; // No path found
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        while (cameFrom[`${current.x},${current.y}`]) {
            current = cameFrom[`${current.x},${current.y}`];
            path.unshift(current);
        }
        return path;
    }

    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    findNearestPrimaryRoad(x) {
        for (let y = 0; y < this.height; y++) {
            if (this.roads[y][x]) return y;
        }
        return null;
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

    placePrimaryRoad(x, y) {
        for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
                this.placeRoad(x + dx, y + dy);
            }
        }
    }
}
