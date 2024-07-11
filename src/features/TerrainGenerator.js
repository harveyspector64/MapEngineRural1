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
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.gridSize = 64; // Defines the size of regions
        this.debug = true; // Set to true for detailed console logging
        
        // Initialize permutation table for Perlin noise
        this.p = new Array(512);
        this.initPermutationTable();
    }

    initPermutationTable() {
        const permutation = Array.from({length: 256}, (_, i) => i);
        for (let i = 0; i < 256; i++) {
            const j = Math.floor(Math.random() * (i + 1));
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }
        for (let i = 0; i < 512; i++) {
            this.p[i] = permutation[i & 255];
        }
    }

generate(chunkX, chunkY) {
    if (this.debug) console.log(`Generating terrain for chunk (${chunkX}, ${chunkY})`);
        let terrain = this.generateBaseTerrain();
        const regions = this.assignRegions(chunkX, chunkY);
        terrain = this.generateRegionFeatures(terrain, regions, chunkX, chunkY);
        terrain = this.smoothTransitions(terrain);
        terrain = this.addNaturalElements(terrain, regions, chunkX, chunkY);
        
        if (this.debug) this.debugPrintTerrainStats(terrain);
        
        return terrain;
    }

    generateBaseTerrain() {
        if (this.debug) console.log("Generating base terrain (all grass)");
        return Array(this.height).fill().map(() => Array(this.width).fill(TILES.GRASS));
    }

    assignRegions(chunkX, chunkY) {
        if (this.debug) console.log("Assigning regions...");
        const regions = [];
        for (let y = 0; y < this.height; y += this.gridSize) {
            for (let x = 0; x < this.width; x += this.gridSize) {
const worldX = chunkX * this.width + x;
const worldY = chunkY * this.height + y;
                const regionType = this.getRandomRegionType(worldX, worldY);
                regions.push({x, y, type: regionType});
                if (this.debug) console.log(`Region at (${x}, ${y}): ${regionType}`);
            }
        }
        if (this.debug) console.log(`${regions.length} regions assigned.`);
        return regions;
    }

    getRandomRegionType(x, y) {
        const noiseValue = this.noise(x / 1000, y / 1000, 0);
        if (this.debug) console.log(`Noise value for region at (${x}, ${y}): ${noiseValue}`);
        if (noiseValue < 0.3) return REGION_TYPES.FARMLAND;
        if (noiseValue < 0.6) return REGION_TYPES.FOREST;
        if (noiseValue < 0.8) return REGION_TYPES.MIXED;
        return REGION_TYPES.LAKESIDE;
    }

    generateRegionFeatures(terrain, regions, chunkX, chunkY) {
        if (this.debug) console.log("Generating region features...");
        regions.forEach(region => {
            switch (region.type) {
                case REGION_TYPES.FARMLAND:
                    this.generateFarmland(terrain, region, chunkX, chunkY);
                    break;
                case REGION_TYPES.FOREST:
                    this.generateForest(terrain, region, chunkX, chunkY);
                    break;
                case REGION_TYPES.MIXED:
                    this.generateMixedRegion(terrain, region, chunkX, chunkY);
                    break;
                case REGION_TYPES.LAKESIDE:
                    this.generateLakeside(terrain, region, chunkX, chunkY);
                    break;
            }
        });
        return terrain;
    }

    generateFarmland(terrain, region, chunkX, chunkY) {
        if (this.debug) console.log(`Generating farmland at (${region.x}, ${region.y})`);
        const minFieldSize = 8;
        const maxFieldSize = 16;
        let y = region.y;
        while (y < Math.min(region.y + this.gridSize, this.height)) {
            let x = region.x;
            while (x < Math.min(region.x + this.gridSize, this.width)) {
                const worldX = chunkX * this.width + x;
                const worldY = chunkY * this.height + y;
                if (this.noise(worldX / 100, worldY / 100, 0.5) > 0.3) {
                    const fieldWidth = minFieldSize + Math.floor(this.noise(worldX / 50, worldY / 50, 1) * (maxFieldSize - minFieldSize));
                    const fieldHeight = minFieldSize + Math.floor(this.noise(worldX / 50, worldY / 50, 2) * (maxFieldSize - minFieldSize));
                    this.placeRectangularField(terrain, x, y, fieldWidth, fieldHeight, chunkX, chunkY);
                    x += fieldWidth;
                } else {
                    x += minFieldSize;
                }
            }
            y += maxFieldSize;
        }
    }

    placeRectangularField(terrain, x, y, width, height, chunkX, chunkY) {
        const worldX = chunkX * this.width + x;
        const worldY = chunkY * this.height + y;
        const isCrop = this.noise(worldX / 50, worldY / 50, 3) > 0.5;
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                const tx = x + dx;
                const ty = y + dy;
                if (tx < this.width && ty < this.height) {
                    terrain[ty][tx] = isCrop ? TILES.CROP : TILES.FIELD;
                }
            }
        }
        if (this.debug) console.log(`Placed ${isCrop ? 'crop' : 'field'} at (${x}, ${y}), size: ${width}x${height}`);
    }

    generateForest(terrain, region, chunkX, chunkY) {
        if (this.debug) console.log(`Generating forest at (${region.x}, ${region.y})`);
        const worldX = chunkX * this.width + region.x;
        const worldY = chunkY * this.height + region.y;
        const isDenseForest = this.noise(worldX / 500, worldY / 500, 4) > 0.5;
        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y++) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x++) {
                const localWorldX = chunkX * this.width + x;
                const localWorldY = chunkY * this.height + y;
                const noiseValue = this.noise(localWorldX / 20, localWorldY / 20, 5);
                if (isDenseForest && noiseValue > 0.3 || (!isDenseForest && noiseValue > 0.6)) {
                    terrain[y][x] = this.noise(localWorldX / 10, localWorldY / 10, 6) > 0.7 ? TILES.TREE : TILES.BUSH;
                    if (this.debug) console.log(`Placed ${terrain[y][x]} at (${x}, ${y})`);
                }
            }
        }
    }

    generateMixedRegion(terrain, region, chunkX, chunkY) {
        if (this.debug) console.log(`Generating mixed region at (${region.x}, ${region.y})`);
        this.generateForest(terrain, region, chunkX, chunkY);
        this.generateFarmland(terrain, region, chunkX, chunkY);
    }

    generateLakeside(terrain, region, chunkX, chunkY) {
        if (this.debug) console.log(`Generating lakeside at (${region.x}, ${region.y})`);
        this.generateLake(terrain, region, chunkX, chunkY);
        this.generateForest(terrain, region, chunkX, chunkY);
    }

    generateLake(terrain, region, chunkX, chunkY) {
        const centerX = region.x + this.gridSize / 2;
        const centerY = region.y + this.gridSize / 2;
        const maxRadius = this.gridSize * 0.6;

        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y++) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const worldX = chunkX * this.width + x;
                const worldY = chunkY * this.height + y;
                if (distance < maxRadius * (0.5 + this.noise(worldX / 30, worldY / 30, 7) * 0.5)) {
                    terrain[y][x] = TILES.WATER;
                    if (this.debug) console.log(`Placed water at (${x}, ${y})`);
                }
            }
        }
    }

    addNaturalElements(terrain, regions, chunkX, chunkY) {
        if (this.debug) console.log("Adding natural elements...");
        regions.forEach(region => {
            if (region.type === REGION_TYPES.FARMLAND) {
                this.addVegetationNearFarmland(terrain, region, chunkX, chunkY);
            } else {
                this.addGeneralVegetation(terrain, region, chunkX, chunkY);
            }
        });
        return terrain;
    }

    addVegetationNearFarmland(terrain, region, chunkX, chunkY) {
        const openGrassChance = 1.5; // Higher chance for open grass near farmland
        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y++) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x++) {
                if (terrain[y][x] === TILES.GRASS) {
                    this.addTreesAndBushes(terrain, x, y, openGrassChance, chunkX, chunkY);
                }
            }
        }
    }

    addGeneralVegetation(terrain, region, chunkX, chunkY) {
        const openGrassChance = 0.3; // Lower chance for open grass in other regions
        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y++) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x++) {
                if (terrain[y][x] === TILES.GRASS) {
                    this.addTreesAndBushes(terrain, x, y, openGrassChance, chunkX, chunkY);
                }
            }
        }
    }

    addTreesAndBushes(terrain, x, y, openGrassChance, chunkX, chunkY) {
        const worldX = chunkX * this.width + x;
        const worldY = chunkY * this.height + y;
        const chance = this.noise(worldX / 10, worldY / 10, 8);
        if (chance < 0.05) {
            terrain[y][x] = TILES.TREE;
            if (this.debug) console.log(`Placed tree at (${x}, ${y})`);
        } else if (chance < 0.1) {
            terrain[y][x] = TILES.BUSH;
            if (this.debug) console.log(`Placed bush at (${x}, ${y})`);
        } else if (chance < openGrassChance) {
            terrain[y][x] = TILES.GRASS;
        }
    }

    smoothTransitions(terrain) {
        if (this.debug) console.log("Smoothing terrain transitions...");
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
            if (this.debug) console.log(`Smoothing: Placed tree at (${x}, ${y})`);
        } else if (bushesCount > 0 && Math.random() < bushesCount / 8) {
            smoothed[y][x] = TILES.BUSH;
            if (this.debug) console.log(`Smoothing: Placed bush at (${x}, ${y})`);
        }
    }

    noise(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        const A = this.p[X] + Y, AA = this.p[A] + Z, AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y, BA = this.p[B] + Z, BB = this.p[B + 1] + Z;
        return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z),
                                                      this.grad(this.p[BA], x - 1, y, z)),
                                         this.lerp(u, this.grad(this.p[AB], x, y - 1, z),
                                                      this.grad(this.p[BB], x - 1, y - 1, z))),
                            this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1),
                                                      this.grad(this.p[BA + 1], x - 1, y, z - 1)),
                                         this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1),
                                                      this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y,
              v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    debugPrintTerrainStats(terrain) {
        const stats = {};
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = terrain[y][x];
                stats[tile] = (stats[tile] || 0) + 1;
            }
        }
        console.log("Terrain Statistics:");
        for (const [tile, count] of Object.entries(stats)) {
            console.log(`${tile}: ${count} (${(count / (this.width * this.height) * 100).toFixed(2)}%)`);
        }
    }
}
