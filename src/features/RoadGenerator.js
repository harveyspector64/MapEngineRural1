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

        // Initialize permutation table for noise function
        this.p = new Array(512);
        const permutation = Array.from({length: 256}, (_, i) => i);
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }
        for (let i = 0; i < 512; i++) {
            this.p[i] = permutation[i & 255];
        }
    }

    // ... (all other methods remain the same)

    // Simple noise function
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
}
