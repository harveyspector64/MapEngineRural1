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
        this.gridSize = 64; // Size of each region
        
        // Initialize permutation table for noise generation
        this.p = new Array(512);
        const permutation = Array.from({length: 256}, (_, i) => i);
        for (let i = 0; i < 256; i++) {
            const j = Math.floor(Math.random() * (i + 1));
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }
        for (let i = 0; i < 512; i++) {
            this.p[i] = permutation[i & 255];
        }

        console.log(`TerrainGenerator initialized with dimensions: ${width}x${height}`);
    }

    generate() {
        console.time('Terrain Generation');
        console.log('Starting terrain generation...');

        let terrain = this.generateBaseTerrain();
        console.log('Base terrain generated');

        const regions = this.assignRegions();
        console.log(`${regions.length} regions assigned`);

        terrain = this.generateRegionFeatures(terrain, regions);
        console.log('Region features generated');

        terrain = this.smoothTransitions(terrain);
        console.log('Transitions smoothed');

        terrain = this.enhanceGrassAreas(terrain);
        console.log('Grass areas enhanced');

        terrain = this.generateRivers(terrain);
        console.log('Rivers generated');

        console.timeEnd('Terrain Generation');
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
        regions.forEach((region, index) => {
            console.log(`Generating features for region ${index + 1}/${regions.length} (${region.type})`);
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
        const endY = Math.min(y + height, this.height);
        const endX = Math.min(x + width, this.width);
        for (let dy = y; dy < endY; dy++) {
            for (let dx = x; dx < endX; dx++) {
                terrain[dy][dx] = isCrop ? TILES.CROP : TILES.FIELD;
            }
        }
    }

    generateForest(terrain, region) {
        const isDenseForest = Math.random() > 0.5;
        const endY = Math.min(region.y + this.gridSize, this.height);
        const endX = Math.min(region.x + this.gridSize, this.width);
        for (let y = region.y; y < endY; y++) {
            for (let x = region.x; x < endX; x++) {
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

        const endY = Math.min(region.y + this.gridSize, this.height);
        const endX = Math.min(region.x + this.gridSize, this.width);
        for (let y = region.y; y < endY; y++) {
            for (let x = region.x; x < endX; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < maxRadius * (0.5 + this.noise(x / 30, y / 30) * 0.5)) {
                    terrain[y][x] = TILES.WATER;
                }
            }
        }
    }

    smoothTransitions(terrain) {
        console.log('Smoothing transitions...');
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

    enhanceGrassAreas(terrain) {
        console.log('Enhancing grass areas...');
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (terrain[y][x] === TILES.GRASS) {
                    const noiseValue = this.noise(x / 50, y / 50);
                    if (noiseValue > 0.75) {
                        // Single tree or bush
                        terrain[y][x] = Math.random() > 0.5 ? TILES.TREE : TILES.BUSH;
                    } else if (noiseValue > 0.7) {
                        // Small cluster
                        this.createSmallCluster(terrain, x, y);
                    }
                }
            }
        }
        return terrain;
    }

    createSmallCluster(terrain, centerX, centerY) {
        const clusterSize = 3;
        for (let dy = -clusterSize; dy <= clusterSize; dy++) {
            for (let dx = -clusterSize; dx <= clusterSize; dx++) {
                const x = centerX + dx;
                const y = centerY + dy;
                if (x >= 0 && x < this.width && y >= 0 && y < this.height && 
                    terrain[y][x] === TILES.GRASS && Math.random() > 0.5) {
                    terrain[y][x] = Math.random() > 0.5 ? TILES.TREE : TILES.BUSH;
                }
            }
        }
    }

    generateRivers(terrain) {
        console.log('Generating rivers...');
        const numRivers = Math.floor(Math.random() * 3) + 1; // 1 to 3 rivers
        for (let i = 0; i < numRivers; i++) {
            const start = this.chooseRiverStart();
            const end = this.chooseRiverEnd(start);
            const path = this.findRiverPath(terrain, start, end);
            if (path) {
                this.carveRiverPath(terrain, path);
                this.addTributaries(terrain, path);
                console.log(`River ${i + 1} generated`);
            } else {
                console.log(`Failed to generate river ${i + 1}`);
            }
        }
        return terrain;
    }

    chooseRiverStart() {
        // For simplicity, start from the edge of the map
        const side = Math.floor(Math.random() * 4);
        switch(side) {
            case 0: return {x: 0, y: Math.floor(Math.random() * this.height)};
            case 1: return {x: this.width - 1, y: Math.floor(Math.random() * this.height)};
            case 2: return {x: Math.floor(Math.random() * this.width), y: 0};
            case 3: return {x: Math.floor(Math.random() * this.width), y: this.height - 1};
        }
    }

    chooseRiverEnd(start) {
        // Choose an end point on the opposite side of the map
        if (start.x === 0) return {x: this.width - 1, y: Math.floor(Math.random() * this.height)};
        if (start.x === this.width - 1) return {x: 0, y: Math.floor(Math.random() * this.height)};
        if (start.y === 0) return {x: Math.floor(Math.random() * this.width), y: this.height - 1};
        return {x: Math.floor(Math.random() * this.width), y: 0};
    }

    findRiverPath(terrain, start, end) {
        const openSet = [start];
        const cameFrom = {};
        const gScore = {[this.key(start)]: 0};
        const fScore = {[this.key(start)]: this.heuristic(start, end)};
        const momentum = {[this.key(start)]: {dx: 0, dy: 0}};

        while (openSet.length > 0) {
            const current = this.lowestFScore(openSet, fScore);
            if (this.key(current) === this.key(end)) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.splice(openSet.indexOf(current), 1);
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                const tentativeGScore = gScore[this.key(current)] + this.riverCost(terrain, current, neighbor, momentum[this.key(current)]);
                
                if (!gScore[this.key(neighbor)] || tentativeGScore < gScore[this.key(neighbor)]) {
                    cameFrom[this.key(neighbor)] = current;
                    gScore[this.key(neighbor)] = tentativeGScore;
                    fScore[this.key(neighbor)] = gScore[this.key(neighbor)] + this.heuristic(neighbor, end);
                    momentum[this.key(neighbor)] = {
                        dx: neighbor.x - current.x,
                        dy: neighbor.y - current.y
                    };
                    if (!openSet.some(node => this.key(node) === this.key(neighbor))) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        return null; // No path found
    }

    riverCost(terrain, current, neighbor, currentMomentum) {
        const base = 1;
        const elevationCost = this.getElevation(neighbor.x, neighbor.y) * 0.5;
        const momentumCost = (currentMomentum.dx !== neighbor.x - current.x || currentMomentum.dy !== neighbor.y - current.y) ? 0.5 : 0;
        const noiseFactor = this.noise(neighbor.x / 20, neighbor.y / 20) * 0.5;
        return base + elevationCost + momentumCost + noiseFactor;
    }

    getElevation(x, y) {
        // Simulate elevation using noise
        return this.noise(x / 100, y / 100);
    }

carveRiverPath(terrain, path) {
        for (const point of path) {
            terrain[point.y][point.x] = TILES.WATER;
            // Add width to the river
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = point.x + dx;
                    const ny = point.y + dy;
                    if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && Math.random() > 0.3) {
                        terrain[ny][nx] = TILES.WATER;
                    }
                }
            }
        }
    }

    addTributaries(terrain, mainPath) {
        const numTributaries = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numTributaries; i++) {
            const startIndex = Math.floor(Math.random() * (mainPath.length - 1));
            const start = mainPath[startIndex];
            const end = this.chooseRandomPointNearby(start);
            const tributaryPath = this.findRiverPath(terrain, end, start);
            if (tributaryPath) {
                this.carveTributaryPath(terrain, tributaryPath);
            }
        }
    }

    carveTributaryPath(terrain, path) {
        for (const point of path) {
            if (Math.random() > 0.3) { // Make tributaries narrower
                terrain[point.y][point.x] = TILES.WATER;
            }
        }
    }

    chooseRandomPointNearby(point) {
        const distance = Math.floor(Math.random() * 20) + 10;
        const angle = Math.random() * 2 * Math.PI;
        const x = Math.floor(point.x + Math.cos(angle) * distance);
        const y = Math.floor(point.y + Math.sin(angle) * distance);
        return {
            x: Math.max(0, Math.min(this.width - 1, x)),
            y: Math.max(0, Math.min(this.height - 1, y))
        };
    }

    key(node) {
        return `${node.x},${node.y}`;
    }

    lowestFScore(nodes, fScore) {
        return nodes.reduce((lowest, node) => 
            (fScore[this.key(node)] < fScore[this.key(lowest)] ? node : lowest));
    }

    getNeighbors(node) {
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const x = node.x + dx;
                const y = node.y + dy;
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    neighbors.push({x, y});
                }
            }
        }
        return neighbors;
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        while (cameFrom[this.key(current)]) {
            current = cameFrom[this.key(current)];
            path.unshift(current);
        }
        return path;
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
