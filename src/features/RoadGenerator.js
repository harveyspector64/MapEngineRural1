export default class RoadGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.width = terrain[0].length;
        this.height = terrain.length;
        this.roads = Array(this.height).fill().map(() => Array(this.width).fill(0));
    }

    generate() {
        console.log("Starting road generation");
        this.generateMainRoads();
        this.generateSecondaryRoads();
        this.ensureConnectivity();
        return this.applyRoadsToTerrain();
    }

    generateMainRoads() {
        console.log("Generating main roads");
        const numMainRoads = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numMainRoads; i++) {
            const start = this.getRandomEdgePoint();
            const end = this.getOppositeEdgePoint(start);
            this.buildRoadBetweenPoints(start, end, true);
        }
    }

    generateSecondaryRoads() {
        console.log("Generating secondary roads");
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.roads[y][x] && Math.random() < this.branchProbability(x, y)) {
                    const end = this.getRandomEdgePoint();
                    this.buildRoadBetweenPoints({x, y}, end, false);
                }
            }
        }
    }

    buildRoadBetweenPoints(start, end, isMainRoad) {
        let current = {...start};
        while (current.x !== end.x || current.y !== end.y) {
            this.roads[current.y][current.x] = 1;
            const next = this.getNextRoadTile(current, end, isMainRoad);
            if (!next) break; // No valid path found
            current = next;
        }
    }

    getNextRoadTile(current, end, isMainRoad) {
        const options = [
            {x: current.x + 1, y: current.y},
            {x: current.x - 1, y: current.y},
            {x: current.x, y: current.y + 1},
            {x: current.x, y: current.y - 1}
        ].filter(p => this.isValidTile(p.x, p.y));

        options.sort((a, b) => {
            const distA = this.distance(a, end);
            const distB = this.distance(b, end);
            const suitA = this.getTileSuitability(a.x, a.y, isMainRoad);
            const suitB = this.getTileSuitability(b.x, b.y, isMainRoad);
            return (distA - distB) * 2 + (suitB - suitA);
        });

        return options[0];
    }

    getTileSuitability(x, y, isMainRoad) {
        // Simple suitability check, can be expanded later
        if (this.terrain[y][x] === 'water') return 0;
        if (this.terrain[y][x] === 'crop' && !isMainRoad) return 1;
        return 10;
    }

    ensureConnectivity() {
        // Placeholder for future implementation
        console.log("Ensuring road connectivity");
    }

    applyRoadsToTerrain() {
        console.log("Applying roads to terrain");
        const newTerrain = JSON.parse(JSON.stringify(this.terrain));
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.roads[y][x]) {
                    newTerrain[y][x] = 'road';
                }
            }
        }
        return newTerrain;
    }

    getRandomEdgePoint() {
        const edge = Math.floor(Math.random() * 4);
        switch(edge) {
            case 0: return {x: 0, y: Math.floor(Math.random() * this.height)};
            case 1: return {x: this.width - 1, y: Math.floor(Math.random() * this.height)};
            case 2: return {x: Math.floor(Math.random() * this.width), y: 0};
            case 3: return {x: Math.floor(Math.random() * this.width), y: this.height - 1};
        }
    }

    getOppositeEdgePoint(point) {
        if (point.x === 0) return {x: this.width - 1, y: Math.floor(Math.random() * this.height)};
        if (point.x === this.width - 1) return {x: 0, y: Math.floor(Math.random() * this.height)};
        if (point.y === 0) return {x: Math.floor(Math.random() * this.width), y: this.height - 1};
        return {x: Math.floor(Math.random() * this.width), y: 0};
    }

    branchProbability(x, y) {
        // Simple probability function, can be adjusted
        return 0.1;
    }

    distance(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    isValidTile(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
}
