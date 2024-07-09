export default class RoadGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.width = terrain[0].length;
        this.height = terrain.length;
        this.roads = Array(this.height).fill().map(() => Array(this.width).fill(0));
        this.maxMainRoads = 2;
        this.maxSecondaryRoads = 5;
        this.maxTertiaryRoads = 10;
        this.minBranchDistance = 10;
    }

    generate() {
        console.log("Starting refined road generation");
        this.generateMainRoads();
        this.generateSecondaryRoads();
        this.generateTertiaryRoads();
        this.cleanupDeadEnds();
        return this.applyRoadsToTerrain();
    }

    generateMainRoads() {
        for (let i = 0; i < this.maxMainRoads; i++) {
            const start = this.getRandomEdgePoint();
            const end = this.getOppositeEdgePoint(start);
            this.buildRoad(start, end, 2); // 2 represents main road
        }
    }

    generateSecondaryRoads() {
        for (let i = 0; i < this.maxSecondaryRoads; i++) {
            const start = this.findRoadTile(2); // Start from a main road
            if (start) {
                const end = this.getRandomEdgePoint();
                this.buildRoad(start, end, 1); // 1 represents secondary road
            }
        }
    }

    generateTertiaryRoads() {
        for (let i = 0; i < this.maxTertiaryRoads; i++) {
            const start = this.findRoadTile(1); // Start from a secondary road
            if (start) {
                const end = this.findNearestField(start);
                this.buildRoad(start, end, 0); // 0 represents tertiary road
            }
        }
    }

    buildRoad(start, end, roadType) {
        let current = {...start};
        while (current.x !== end.x || current.y !== end.y) {
            this.roads[current.y][current.x] = roadType + 1;
            const next = this.getNextRoadTile(current, end, roadType);
            if (!next) break;
            current = next;
        }
    }

    getNextRoadTile(current, end, roadType) {
        const options = [
            {x: current.x + 1, y: current.y},
            {x: current.x - 1, y: current.y},
            {x: current.x, y: current.y + 1},
            {x: current.x, y: current.y - 1}
        ].filter(p => this.isValidTile(p.x, p.y));

        return options.reduce((best, option) => {
            const score = this.getTileScore(option, end, roadType);
            return score > best.score ? {tile: option, score} : best;
        }, {tile: null, score: -Infinity}).tile;
    }

    getTileScore(tile, end, roadType) {
        let score = -this.distance(tile, end);
        if (this.isFieldEdge(tile)) score += 5;
        if (this.roads[tile.y][tile.x] > 0) score -= 10;
        if (this.terrain[tile.y][tile.x] === 'crop') score -= 5;
        return score;
    }

    isFieldEdge(tile) {
        const neighbors = this.getNeighbors(tile);
        return neighbors.some(n => this.terrain[n.y][n.x] === 'crop') &&
               neighbors.some(n => this.terrain[n.y][n.x] !== 'crop');
    }

    findRoadTile(minType) {
        const candidates = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.roads[y][x] > minType) {
                    candidates.push({x, y});
                }
            }
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    findNearestField(start) {
        // Implementation to find the nearest field tile
        // This is a placeholder and should be implemented based on your terrain structure
    }

    cleanupDeadEnds() {
        let changed;
        do {
            changed = false;
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (this.roads[y][x] > 0 && this.countRoadNeighbors(x, y) === 1) {
                        this.roads[y][x] = 0;
                        changed = true;
                    }
                }
            }
        } while (changed);
    }

    countRoadNeighbors(x, y) {
        return this.getNeighbors({x, y}).filter(n => this.roads[n.y][n.x] > 0).length;
    }

    getNeighbors(tile) {
        return [
            {x: tile.x + 1, y: tile.y},
            {x: tile.x - 1, y: tile.y},
            {x: tile.x, y: tile.y + 1},
            {x: tile.x, y: tile.y - 1}
        ].filter(p => this.isValidTile(p.x, p.y));
    }

    // ... (other helper methods like getRandomEdgePoint, getOppositeEdgePoint, distance, isValidTile)

    applyRoadsToTerrain() {
        const newTerrain = JSON.parse(JSON.stringify(this.terrain));
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.roads[y][x] > 0) {
                    newTerrain[y][x] = 'road';
                }
            }
        }
        return newTerrain;
    }
}
