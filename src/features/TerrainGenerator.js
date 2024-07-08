// src/features/TerrainGenerator.js

export const TILES = {
    GRASS: 'grass',
    WATER: 'water',
    FIELD: 'dirt',
    CROP: 'crop',
    TREE: 'tree',
    BUSH: 'bush'
};

const REGION_TYPES = {
    FARMLAND: 'farmland',
    FOREST: 'forest',
    MIXED: 'mixed',
    LAKESIDE: 'lakeside'
};

export default class TerrainGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.noiseSeed = Math.random();
        this.gridSize = 50; // Size of each grid section
        
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
        const regions = this.assignRegions();
        terrain = this.generateRegionFeatures(terrain, regions);
        return terrain;
    }

    generateBaseTerrain() {
        return Array(this.height).fill().map(() => Array(this.width).fill(TILES.GRASS));
    }

    assignRegions() {
        const regions = [];
        for (let y = 0; y < this.height; y += this.gridSize) {
            for (let x = 0; x < this.width; x += this.gridSize) {
                const regionType = this.getRandomRegionType();
                regions.push({x, y, type: regionType});
            }
        }
        return regions;
    }

    getRandomRegionType() {
        const types = Object.values(REGION_TYPES);
        return types[Math.floor(Math.random() * types.length)];
    }

    generateRegionFeatures(terrain, regions) {
        regions.forEach(region => {
            switch (region.type) {
                case REGION_TYPES.FARMLAND:
                    this.generateFarmland(terrain, region);
                    break;
                case REGION_TYPES.FOREST:
                    this.generateForest(terrain, region);
                    break;
                case REGION_TYPES.MIXED:
                    this.generateMixedRegion(terrain, region);
                    break;
                case REGION_TYPES.LAKESIDE:
                    this.generateLakeside(terrain, region);
                    break;
            }
        });
        return terrain;
    }

    generateFarmland(terrain, region) {
        const fieldSize = 10;
        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y += fieldSize) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x += fieldSize) {
                if (Math.random() > 0.3) {
                    this.placeRectangularField(terrain, x, y, fieldSize, fieldSize);
                }
            }
        }
    }

    placeRectangularField(terrain, x, y, width, height) {
        const isCrop = Math.random() > 0.5;
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                const tx = x + dx;
                const ty = y + dy;
                if (tx < this.width && ty < this.height) {
                    terrain[ty][tx] = isCrop ? TILES.CROP : TILES.FIELD;
                }
            }
        }
    }

    generateForest(terrain, region) {
        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y++) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x++) {
                if (Math.random() > 0.3) {
                    terrain[y][x] = Math.random() > 0.7 ? TILES.TREE : TILES.BUSH;
                }
            }
        }
    }

    generateMixedRegion(terrain, region) {
        this.generateForest(terrain, region);
        this.generateFarmland(terrain, region);
    }

    generateLakeside(terrain, region) {
        this.generateLake(terrain, region);
        this.generateForest(terrain, region);
    }

    generateLake(terrain, region) {
        const centerX = region.x + this.gridSize / 2;
        const centerY = region.y + this.gridSize / 2;
        const maxRadius = this.gridSize / 2;

        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y++) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < maxRadius * (0.5 + this.noise(x / 20, y / 20) * 0.5)) {
                    terrain[y][x] = TILES.WATER;
                }
            }
        }
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
