export default class RoadGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.width = terrain[0].length;
        this.height = terrain.length;
        this.roads = Array(this.height).fill().map(() => Array(this.width).fill(0));
        this.maxMainRoads = 2;
        this.maxBranchRoads = 5;
        this.maxLength = Math.max(this.width, this.height);
    }

    generate() {
        console.log("Starting refined road generation");
        this.generateMainRoads();
        this.generateBranchRoads();
        return this.applyRoadsToTerrain();
    }

    generateMainRoads() {
        for (let i = 0; i < this.maxMainRoads; i++) {
            const start = this.getRandomEdgePoint();
            const end = this.getOppositeEdgePoint(start);
            this.buildRoad(start, end);
        }
    }

    generateBranchRoads() {
        for (let i = 0; i < this.maxBranchRoads; i++) {
            const start = this.findRoadTile();
            if (start) {
                const end = this.getRandomPoint();
                this.buildRoad(start, end);
            }
        }
    }

    buildRoad(start, end) {
        let current = {...start};
        let steps = 0;
        while ((current.x !== end.x || current.y !== end.y) && steps < this.maxLength) {
            this.roads[current.y][current.x] = 1;
            const next = this.getNextRoadTile(current, end);
            if (!next) break;
            current = next;
            steps++;
        }
    }

    getNextRoadTile(current, end) {
        const directions = [
            {dx: Math.sign(end.x - current.x), dy: 0},
            {dx: 0, dy: Math.sign(end.y - current.y)},
        ].filter(dir => dir.dx !== 0 || dir.dy !== 0);

        for (const dir of directions) {
            const newX = current.x + dir.dx;
            const newY = current.y + dir.dy;
            if (this.isValidRoadTile(newX, newY)) {
                return {x: newX, y: newY};
            }
        }
        return null;
    }

    isValidRoadTile(x, y) {
        if (!this.isValidTile(x, y)) return false;
        if (this.terrain[y][x] === 'water') return false;
        if (this.roads[y][x] === 1) return false;
        
        const adjacentRoads = this.getAdjacentTiles(x, y).filter(tile => this.roads[tile.y][tile.x] === 1);
        return adjacentRoads.length <= 1;
    }

    getAdjacentTiles(x, y) {
        return [
            {x: x+1, y}, {x: x-1, y},
            {x, y: y+1}, {x, y: y-1}
        ].filter(tile => this.isValidTile(tile.x, tile.y));
    }

    findRoadTile() {
        const roadTiles = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.roads[y][x] === 1) {
                    roadTiles.push({x, y});
                }
            }
        }
        return roadTiles.length > 0 ? roadTiles[Math.floor(Math.random() * roadTiles.length)] : null;
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

    getRandomPoint() {
        return {
            x: Math.floor(Math.random() * this.width),
            y: Math.floor(Math.random() * this.height)
        };
    }

    isValidTile(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    applyRoadsToTerrain() {
        console.log("Applying roads to terrain");
        const newTerrain = JSON.parse(JSON.stringify(this.terrain));
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.roads[y][x] === 1) {
                    newTerrain[y][x] = 'road';
                }
            }
        }
        return newTerrain;
    }
}
