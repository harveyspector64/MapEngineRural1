// File: src/features/RoadGenerator.js

import { TILES } from './TerrainGenerator.js';

export default class RoadGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generateHighway(terrain) {
        const startEdge = Math.random() < 0.5 ? 'left' : 'top';
        const endEdge = startEdge === 'left' ? 'right' : 'bottom';
        const highway = [];
        let x = startEdge === 'left' ? 0 : Math.floor(this.width / 2);
        let y = startEdge === 'top' ? 0 : Math.floor(this.height / 2);

        while ((startEdge === 'left' && x < this.width) || (startEdge === 'top' && y < this.height)) {
            terrain[y][x] = TILES.HIGHWAY;
            highway.push({ x, y });
            if (Math.random() < 0.5) {
                x += startEdge === 'left' ? 1 : 0;
                y += startEdge === 'top' ? 1 : 0;
            } else {
                x += startEdge === 'top' ? (Math.random() < 0.5 ? 1 : -1) : 0;
                y += startEdge === 'left' ? (Math.random() < 0.5 ? 1 : -1) : 0;
                x = Math.max(0, Math.min(this.width - 1, x));
                y = Math.max(0, Math.min(this.height - 1, y));
            }
        }

        return highway;
    }

    generateSmallerRoads(terrain, highway) {
        highway.forEach(({ x, y }) => {
            if (Math.random() < 0.3) {
                let length = Math.floor(Math.random() * 10) + 5;
                let direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                for (let i = 0; i < length; i++) {
                    if (direction === 'horizontal') {
                        x = (x + 1) % this.width;
                    } else {
                        y = (y + 1) % this.height;
                    }
                    if (terrain[y][x] === TILES.GRASS || terrain[y][x] === TILES.FIELD) {
                        terrain[y][x] = TILES.ROAD;
                    }
                }
            }
        });
    }
}
