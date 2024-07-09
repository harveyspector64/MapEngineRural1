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
        this.smoothRoads();
        this.removeIsolatedRoads();
        return this.roads;
    }

    generatePrimaryRoad() {
        console.log('Generating primary road...');
        let y = Math.floor(this.height / 2);
        for (let x = 0; x < this.width; x++) {
            // Use simplex noise for smoother variations
            y += this.noise(x * 0.05) * 2 - 1;
            y = Math.max(1, Math.min(this.height - 2, Math.round(y)));
            
            if (!this.isWater(x, y)) {
                this.placeRoad(x, y);
                this.placeRoad(x, y + 1);  // Make it consistently 2 tiles wide
            }
        }
    }

    generateSecondaryRoads() {
        console.log('Generating secondary roads...');
        const numSecondaryRoads = Math.floor(this.width / 30);
        for (let i = 0; i < numSecondaryRoads; i++) {
            const startX = Math.floor((i + 0.5) * this.width / numSecondaryRoads);
            this.createSecondaryRoad(startX, 0, startX, this.height - 1);
        }
    }

    createSecondaryRoad(startX, startY, endX, endY) {
        const path = this.findPath(startX, startY, endX, endY);
        path.forEach(({x, y}) => this.placeRoad(x, y));
    }

    connectStructures() {
        console.log('Connecting structures...');
        this.structures.forEach((structure, index) => {
            console.log(`Connecting structure ${index + 1}/${this.structures.length}`);
            const { x, y } = structure.position;
            const nearestRoad = this.findNearestRoad(x, y);
            if (nearestRoad) {
                const path = this.findPath(x, y, nearestRoad.x, nearestRoad.y);
                path.forEach(({x, y}) => this.placeRoad(x, y));
            }
        });
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

        return nearest;
    }

    smoothRoads() {
        console.log('Smoothing roads...');
        const newRoads = JSON.parse(JSON.stringify(this.roads));
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.roads[y][x]) {
                    // Check for diagonal connections and fill them in
                    if (this.roads[y-1][x-1] && !this.roads[y-1][x] && !this.roads[y][x-1]) {
                        newRoads[y-1][x] = true;
                        newRoads[y][x-1] = true;
                    }
                    if (this.roads[y-1][x+1] && !this.roads[y-1][x] && !this.roads[y][x+1]) {
                        newRoads[y-1][x] = true;
                        newRoads[y][x+1] = true;
                    }
                    if (this.roads[y+1][x-1] && !this.roads[y+1][x] && !this.roads[y][x-1]) {
                        newRoads[y+1][x] = true;
                        newRoads[y][x-1] = true;
                    }
                    if (this.roads[y+1][x+1] && !this.roads[y+1][x] && !this.roads[y][x+1]) {
                        newRoads[y+1][x] = true;
                        newRoads[y][x+1] = true;
                    }
                }
            }
        }
        this.roads = newRoads;
    }

    removeIsolatedRoads() {
        console.log('Removing isolated roads...');
        const newRoads = JSON.parse(JSON.stringify(this.roads));
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.roads[y][x] && this.countAdjacentRoads(x, y) < 2) {
                    newRoads[y][x] = false;
                }
            }
        }
        this.roads = newRoads;
    }

    countAdjacentRoads(x, y) {
        let count = 0;
        for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
            if (this.isValidPosition(x + dx, y + dy) && this.roads[y + dy][x + dx]) {
                count++;
            }
        }
        return count;
    }

    isValidRoadPosition(x, y) {
        return this.isValidPosition(x, y) && !this.isWater(x, y) && !this.roads[y][x];
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    isWater(x, y) {
        return this.terrain[y][x] === TILES.WATER;
    }

    placeRoad(x, y) {
        if (this.isValidPosition(x, y)) {
            this.roads[y][x] = true;
            this.terrain[y][x] = ROAD_TILE;
        }
    }

    // Simple noise function (you might want to use a proper noise library for better results)
    noise(x) {
        const X = Math.floor(x) & 255;
        x -= Math.floor(x);
        const u = this.fade(x);
        return this.lerp(u, this.grad(this.p[X], x), this.grad(this.p[X+1], x-1)) * 2;
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x) {
        const h = hash & 15;
        const grad = 1 + (h & 7);
        return (h & 8 ? -grad : grad) * x;
    }

    p = new Array(512);
    constructor(terrain, structures) {
        // ... (previous constructor code)
        
        // Initialize permutation table
        const permutation = Array.from({length: 256}, (_, i) => i);
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }
        for (let i = 0; i < 512; i++) {
            this.p[i] = permutation[i & 255];
        }
    }
}
