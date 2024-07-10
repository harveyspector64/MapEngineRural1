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
    }

    generate(chunkX, chunkY) {
        this.chunkX = chunkX;
        this.chunkY = chunkY;
        this.seed = chunkX * 374761393 + chunkY * 668265263; // Large prime numbers
        
        let terrain = this.generateBaseTerrain();
        const regions = this.assignRegions();
        terrain = this.generateRegionFeatures(terrain, regions);
        terrain = this.smoothTransitions(terrain);
        terrain = this.addNaturalElements(terrain, regions);
        return terrain;
    }

    getRandom(x, y) {
        const localSeed = this.seed + x * 198491317 + y * 6542989;
        return this.seededRandom(localSeed);
    }

    seededRandom(seed) {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    generateBaseTerrain() {
        return Array(this.height).fill().map(() => Array(this.width).fill(TILES.GRASS));
    }

    assignRegions() {
        const regions = [];
        for (let y = 0; y < this.height; y += this.gridSize) {
            for (let x = 0; x < this.width; x += this.gridSize) {
                const regionType = this.getRandomRegionType(x, y);
                regions.push({x, y, type: regionType});
            }
        }
        return regions;
    }

    getRandomRegionType(x, y) {
        const types = Object.values(REGION_TYPES);
        return types[Math.floor(this.getRandom(x, y) * types.length)];
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
        const minFieldSize = 8;
        const maxFieldSize = 16;
        let y = region.y;
        while (y < Math.min(region.y + this.gridSize, this.height)) {
            let x = region.x;
            while (x < Math.min(region.x + this.gridSize, this.width)) {
                if (this.getRandom(x, y) > 0.2) {
                    const fieldWidth = minFieldSize + Math.floor(this.getRandom(x, y) * (maxFieldSize - minFieldSize));
                    const fieldHeight = minFieldSize + Math.floor(this.getRandom(x + 1, y) * (maxFieldSize - minFieldSize));
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
        const isCrop = this.getRandom(x, y) > 0.3;
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
        const isDenseForest = this.getRandom(region.x, region.y) > 0.5;
        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y++) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x++) {
                const noiseValue = this.noise(x, y);
                if (isDenseForest && noiseValue > 0.3 || (!isDenseForest && noiseValue > 0.6)) {
                    terrain[y][x] = this.getRandom(x, y) > 0.7 ? TILES.TREE : TILES.BUSH;
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
        const maxRadius = this.gridSize * 0.6;

        const points = this.generateLakePoints(centerX, centerY, maxRadius);

        for (let y = region.y; y < Math.min(region.y + this.gridSize, this.height); y++) {
            for (let x = region.x; x < Math.min(region.x + this.gridSize, this.width); x++) {
                if (this.isInsideLake(x, y, points)) {
                    terrain[y][x] = TILES.WATER;
                }
            }
        }
    }

    generateLakePoints(centerX, centerY, maxRadius) {
        const numPoints = 8 + Math.floor(this.getRandom(centerX, centerY) * 5);
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * 2 * Math.PI;
            const radius = maxRadius * (0.5 + this.getRandom(centerX + i, centerY) * 0.5);
            points.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }
        return points;
    }

    isInsideLake(x, y, points) {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i].x, yi = points[i].y;
            const xj = points[j].x, yj = points[j].y;
            const intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    addNaturalElements(terrain, regions) {
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
        const chance = this.getRandom(x, y);
        if (chance < 0.05) {
            terrain[y][x] = TILES.TREE;
        } else if (chance < 0.1) {
            terrain[y][x] = TILES.BUSH;
        } else if (chance < openGrassChance) {
            terrain[y][x] = TILES.GRASS;
        }
    }

    smoothTransitions(terrain) {
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

        if (treesCount > 0 && this.getRandom(x, y) < treesCount / 10) {
            smoothed[y][x] = TILES.TREE;
        } else if (bushesCount > 0 && this.getRandom(x, y) < bushesCount / 8) {
            smoothed[y][x] = TILES.BUSH;
        }
    }

    noise(x, y) {
        // Improved noise function using multiple octaves
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        const persistence = 0.5;

        for (let i = 0; i < 4; i++) {  // Using 4 octaves
            value += this.smoothNoise(x * frequency, y * frequency) * amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return value;
    }

    smoothNoise(x, y) {
        // Get fractional part of x and y
        const fractX = x - Math.floor(x);
        const fractY = y - Math.floor(y);

        // Wrap around
        const x1 = (Math.floor(x) + this.width) % this.width;
        const y1 = (Math.floor(y) + this.height) % this.height;

        // Neighbor values
        const x2 = (x1 + this.width - 1) % this.width;
        const y2 = (y1 + this.height - 1) % this.height;

        // Smooth the noise with bilinear interpolation
        const value = this.fractionalInterpolate(
            this.fractionalInterpolate(this.getRandom(x1, y1), this.getRandom(x2, y1), fractX),
            this.fractionalInterpolate(this.getRandom(x1, y2), this.getRandom(x2, y2), fractX),
            fractY
        );

        return value;
    }

    fractionalInterpolate(a, b, x) {
        const ft = x * Math.PI;
        const f = (1 - Math.cos(ft)) * 0.5;
        return a * (1 - f) + b * f;
    }
}
