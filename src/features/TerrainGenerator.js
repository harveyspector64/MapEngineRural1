// src/features/TerrainGenerator.js

export const TILES = {
    GRASS: 'grass',
    WATER: 'water',
    FIELD: 'dirt',
    CROP: 'crop',
    TREE: 'tree',
    BUSH: 'bush',
    MOUNTAIN: 'mountain'
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
    }

    generate() {
        let terrain = this.generateBaseTerrain();
        terrain = this.generateRegionFeatures(terrain);
        terrain = this.smoothTransitions(terrain);
        terrain = this.addNaturalElements(terrain);
        return terrain;
    }

    generateBaseTerrain() {
        return Array(this.height).fill().map(() => Array(this.width).fill(TILES.GRASS));
    }

    generateRegionFeatures(terrain) {
        const regionType = this.getRandomRegionType();
        switch (regionType) {
            case REGION_TYPES.FARMLAND:
                this.generateFarmland(terrain);
                break;
            case REGION_TYPES.FOREST:
                this.generateForest(terrain);
                break;
            case REGION_TYPES.MIXED:
                this.generateMixedRegion(terrain);
                break;
            case REGION_TYPES.LAKESIDE:
                this.generateLakeside(terrain);
                break;
        }
        return terrain;
    }

    getRandomRegionType() {
        const types = Object.values(REGION_TYPES);
        return types[Math.floor(Math.random() * types.length)];
    }

    generateFarmland(terrain) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (Math.random() < 0.7) {
                    terrain[y][x] = Math.random() < 0.5 ? TILES.FIELD : TILES.CROP;
                }
            }
        }
    }

    generateForest(terrain) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (Math.random() < 0.6) {
                    terrain[y][x] = Math.random() < 0.7 ? TILES.TREE : TILES.BUSH;
                }
            }
        }
    }

    generateMixedRegion(terrain) {
        this.generateFarmland(terrain);
        this.generateForest(terrain);
    }

    generateLakeside(terrain) {
        this.generateLake(terrain);
        this.generateForest(terrain);
    }

    generateLake(terrain) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const maxRadius = Math.min(this.width, this.height) / 3;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < maxRadius * (0.5 + Math.random() * 0.5)) {
                    terrain[y][x] = TILES.WATER;
                }
            }
        }
    }

    smoothTransitions(terrain) {
        // Simple smoothing: average with neighbors
        const smoothed = JSON.parse(JSON.stringify(terrain));
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const neighbors = [
                    terrain[y-1][x], terrain[y+1][x],
                    terrain[y][x-1], terrain[y][x+1]
                ];
                const mostCommon = this.getMostCommonTile(neighbors);
                if (mostCommon !== terrain[y][x]) {
                    smoothed[y][x] = Math.random() < 0.5 ? mostCommon : terrain[y][x];
                }
            }
        }
        return smoothed;
    }

    getMostCommonTile(tiles) {
        const counts = tiles.reduce((acc, tile) => {
            acc[tile] = (acc[tile] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    addNaturalElements(terrain) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (terrain[y][x] === TILES.GRASS && Math.random() < 0.1) {
                    terrain[y][x] = Math.random() < 0.7 ? TILES.BUSH : TILES.TREE;
                }
            }
        }
        return terrain;
    }
}
