// src/features/TerrainGenerator.js

export const TILES = {
    GRASS: 'grass',
    WATER: 'water',
    FIELD: 'dirt',
    CROP: 'crop',
    TREE: 'tree',
    BUSH: 'bush',
};

const REGION_TYPES = {
    FARMLAND: 'farmland',
    FOREST: 'forest',
    MIXED: 'mixed',
    LAKESIDE: 'lakeside'
};

export default class TerrainGenerator {
    constructor(width, height, seed, chunkX, chunkY) {
        this.width = width;
        this.height = height;
        this.noiseSeed = seed;
        this.chunkX = chunkX;
        this.chunkY = chunkY;
        this.gridSize = 64;
        
        // Initialize permutation table for Perlin noise
        this.p = new Array(512);
        const permutation = Array.from({length: 256}, (_, i) => i);
        for (let i = 0; i < 256; i++) {
            const j = Math.floor(this.seededRandom() * (i + 1));
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }
        for (let i = 0; i < 512; i++) {
            this.p[i] = permutation[i & 255];
        }

        console.log(`TerrainGenerator initialized for chunk (${chunkX}, ${chunkY}) with seed: ${seed}`);
    }

    seededRandom() {
        const x = Math.sin(this.noiseSeed++) * 10000;
        return x - Math.floor(x);
    }

    generate() {
        console.log("Starting terrain generation...");
        let terrain = this.generateBaseTerrain();
        const regions = this.assignRegions();
        terrain = this.generateRegionFeatures(terrain, regions);
        terrain = this.smoothTransitions(terrain);
        terrain = this.addNaturalElements(terrain, regions);
        console.log("Terrain generation completed.");
        return terrain;
    }

    generateBaseTerrain() {
        console.log("Generating base terrain (all grass)");
        return Array(this.height).fill().map(() => Array(this.width).fill(TILES.GRASS));
    }

    assignRegions() {
        console.log("Assigning regions...");
        const regions = [];
        for (let y = 0; y < this.height; y += this.gridSize) {
            for (let x = 0; x < this.width; x += this.gridSize) {
                const regionType = this.getRandomRegionType();
                regions.push({x, y, type: regionType});
            }
        }
        console.log(`${regions.length} regions assigned.`);
        return regions;
    }

    getRandomRegionType() {
        const types = Object.values(REGION_TYPES);
        return types[Math.floor(Math.random() * types.length)];
    }

    generateRegionFeatures(terrain, regions) {
        console.log("Generating region features...");
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
        console.log(`Generating farmland at (${region.x}, ${region.y})`);
        const minFieldSize = 8;
        const maxFieldSize = 16;
        let y = region.y;
        while (y < Math.min(region.y + this.gridSize, this.height)) {
            let x = region.x;
            while (x < Math.min(region.x + this.gridSize, this.width)) {
                if (Math.random() > 0.2) {
                    const fieldWidth = minFieldSize + Math.floor(Math.random() * (maxFieldSize - minFieldSize));
                    const fieldHeight = minFieldSize + Math.floor(Math.random() * (maxFieldSize - minFieldSize));
                    this.placeRectangularField(terrain, x, y, fieldWidth, fieldHeight);
                    x += fieldWidth;
                } else {
                    x += minFieldSize;
                }
            }
            y += maxFieldSize;
        }
    }

    placeRectangularField(terrain, x, y, width, height) {
        const isCrop = Math.random() > 0.3;
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
        console.log(`Generating forest at (${region.x}, ${region.y})`);
        const isDenseForest = Math.random() > 0.5;
        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y++) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x++) {
                const noiseValue = this.noise(x / 20, y / 20);
                if (isDenseForest && noiseValue > 0.3 || (!isDenseForest && noiseValue > 0.6)) {
                    terrain[y][x] = Math.random() > 0.7 ? TILES.TREE : TILES.BUSH;
                }
            }
        }
    }

    generateMixedRegion(terrain, region) {
        console.log(`Generating mixed region at (${region.x}, ${region.y})`);
        this.generateForest(terrain, region);
        this.generateFarmland(terrain, region);
    }

    generateLakeside(terrain, region) {
        console.log(`Generating lakeside at (${region.x}, ${region.y})`);
        this.generateLake(terrain, region);
        this.generateForest(terrain, region);
    }

    generateLake(terrain, region) {
        const centerX = region.x + this.gridSize / 2;
        const centerY = region.y + this.gridSize / 2;
        const maxRadius = this.gridSize * 0.6;

        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y++) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < maxRadius * (0.5 + this.noise(x / 30, y / 30) * 0.5)) {
                    terrain[y][x] = TILES.WATER;
                }
            }
        }
    }

    addNaturalElements(terrain, regions) {
        console.log("Adding natural elements...");
        regions.forEach(region => {
            if (region.type === REGION_TYPES.FARMLAND) {
                this.addVegetationNearFarmland(terrain, region);
            } else {
                this.addGeneralVegetation(terrain, region);
            }
        });
        return terrain;
    }

    addVegetationNearFarmland(terrain, region) {
        const openGrassChance = 1.5; // Higher chance for open grass near farmland
        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y++) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x++) {
                if (terrain[y][x] === TILES.GRASS) {
                    this.addTreesAndBushes(terrain, x, y, openGrassChance);
                }
            }
        }
    }

    addGeneralVegetation(terrain, region) {
        const openGrassChance = 0.3; // Lower chance for open grass in other regions
        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y++) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x++) {
                if (terrain[y][x] === TILES.GRASS) {
                    this.addTreesAndBushes(terrain, x, y, openGrassChance);
                }
            }
        }
    }

    addTreesAndBushes(terrain, x, y, openGrassChance) {
        const chance = Math.random();
        if (chance < 0.05) {
            terrain[y][x] = TILES.TREE;
        } else if (chance < 0.1) {
            terrain[y][x] = TILES.BUSH;
        } else if (chance < openGrassChance) {
            terrain[y][x] = TILES.GRASS;
        }
    }

    smoothTransitions(terrain) {
        console.log("Smoothing terrain transitions...");
        const smoothed = JSON.parse(JSON.stringify(terrain));
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (terrain[y][x] === TILES.GRASS) {
                    this.smoothGrassTransition(terrain, smoothed, x, y);
                }
            }
        }
        return smoothed;
    }

    smoothGrassTransition(terrain, smoothed, x, y) {
        const neighborhoodSize = 2;
        let treesCount = 0;
        let bushesCount = 0;

        for (let dy = -neighborhoodSize; dy <= neighborhoodSize; dy++) {
            for (let dx = -neighborhoodSize; dx <= neighborhoodSize; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    if (terrain[ny][nx] === TILES.TREE) treesCount++;
                    if (terrain[ny][nx] === TILES.BUSH) bushesCount++;
                }
            }
        }

        if (treesCount > 0 && Math.random() < treesCount / 10) {
            smoothed[y][x] = TILES.TREE;
        } else if (bushesCount > 0 && Math.random() < bushesCount / 8) {
            smoothed[y][x] = TILES.BUSH;
        }
    }

    // Perlin noise implementation
    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x += this.chunkX * this.width;
        y += this.chunkY * this.height;
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
