// src/features/TerrainGenerator.js

export const TILES = {
    GRASS: 'grass',
    WATER: 'water',
    FIELD: 'dirt',
    CROP: 'crop',
    TREE: 'tree',
    BUSH: 'bush'
};

export default class TerrainGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.noiseSeed = Math.random();
        
        this.p = new Array(512);
        const permutation = Array.from({length: 256}, (_, i) => i);
        for (let i = 0; i < 256; i++) {
            const j = Math.floor(Math.random() * (i + 1));
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }
        for (let i = 0; i < 512; i++) {
            this.p[i] = permutation[i & 255];
        }
    }

    generate() {
        let terrain = this.generateBaseTerrain();
        terrain = this.generateWaterBodies(terrain);
        terrain = this.generateFields(terrain);
        terrain = this.generateForests(terrain);
        return terrain;
    }

    generateBaseTerrain() {
        const terrain = [];
        for (let y = 0; y < this.height; y++) {
            terrain[y] = [];
            for (let x = 0; x < this.width; x++) {
                terrain[y][x] = TILES.GRASS;
            }
        }
        return terrain;
    }

    generateWaterBodies(terrain) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const value = this.noise(x / 50 + 1000, y / 50 + 1000);
                if (value > 0.7) {
                    terrain[y][x] = TILES.WATER;
                }
            }
        }
        return terrain;
    }

    generateFields(terrain) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const value = this.noise(x / 40 + 2000, y / 40 + 2000);
                if (value > 0.5 && terrain[y][x] === TILES.GRASS) {
                    if (Math.random() > 0.5) {
                        terrain[y][x] = TILES.FIELD;
                    } else {
                        terrain[y][x] = TILES.CROP;
                    }
                }
            }
        }
        return terrain;
    }

    generateForests(terrain) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const value = this.noise(x / 30 + 3000, y / 30 + 3000);
                if (value > 0.6 && terrain[y][x] === TILES.GRASS) {
                    terrain[y][x] = Math.random() > 0.3 ? TILES.TREE : TILES.BUSH;
                }
            }
        }
        return terrain;
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const A = this.p[X] + Y, B = this.p[X + 1] + Y;
        return this.lerp(v, this.lerp(u, this.grad(this.p[A], x, y), 
                                         this.grad(this.p[B], x - 1, y)),
                            this.lerp(u, this.grad(this.p[A + 1], x, y - 1),
                                         this.grad(this.p[B + 1], x - 1, y - 1)));
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
}
