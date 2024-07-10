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
        this.terrain = Array(height).fill().map(() => Array(width).fill(TILES.GRASS));
    }

    generate() {
        this.generateBaseTerrain();
        this.generateWater();
        this.generateForests();
        this.generateFarmland();
        this.smoothTransitions();
        return this.terrain;
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


    smoothTransitions() {
        const newTerrain = JSON.parse(JSON.stringify(this.terrain));
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const currentTile = this.terrain[y][x];
                const neighbors = this.getNeighbors(x, y);
                
                if (currentTile === TILES.GRASS) {
                    if (this.countTileType(neighbors, TILES.WATER) > 4) {
                        newTerrain[y][x] = TILES.WATER;
                    } else if (this.countTileType(neighbors, TILES.TREE) > 4) {
                        newTerrain[y][x] = TILES.TREE;
                    } else if (this.countTileType(neighbors, TILES.FIELD) > 4) {
                        newTerrain[y][x] = TILES.FIELD;
                    }
                }
            }
        }
        
        this.terrain = newTerrain;
    }

    getNeighbors(x, y) {
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (this.isValidPosition(nx, ny)) {
                    neighbors.push(this.terrain[ny][nx]);
                }
            }
        }
        return neighbors;
    }

    countTileType(tiles, type) {
        return tiles.filter(tile => tile === type).length;
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
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
