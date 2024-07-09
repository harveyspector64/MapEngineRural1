export default class RoadGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.width = terrain[0].length;
        this.height = terrain.length;
        this.roads = Array(this.height).fill().map(() => Array(this.width).fill(0));
        this.maxRoads = 5;
        this.maxLength = Math.max(this.width, this.height);
    }

    generate() {
        console.log("Starting simple road generation");
        for (let i = 0; i < this.maxRoads; i++) {
            this.generateSingleRoad();
        }
        return this.applyRoadsToTerrain();
    }

    generateSingleRoad() {
        const start = this.getRandomEdgePoint();
        let current = {...start};
        let length = 0;

        while (length < this.maxLength) {
            this.roads[current.y][current.x] = 1;
            const next = this.getNextRoadTile(current);
            if (!next) break;
            current = next;
            length++;
        }
    }

    getNextRoadTile(current) {
        const directions = [
            {dx: 1, dy: 0},
            {dx: -1, dy: 0},
            {dx: 0, dy: 1},
            {dx: 0, dy: -1}
        ];
        
        const validDirections = directions.filter(dir => {
            const newX = current.x + dir.dx;
            const newY = current.y + dir.dy;
            return this.isValidTile(newX, newY) && this.terrain[newY][newX] !== 'water';
        });

        if (validDirections.length === 0) return null;

        const chosenDir = validDirections[Math.floor(Math.random() * validDirections.length)];
        return {
            x: current.x + chosenDir.dx,
            y: current.y + chosenDir.dy
        };
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
