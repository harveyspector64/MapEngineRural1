export default class RoadGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.width = terrain[0].length;
        this.height = terrain.length;
        this.roads = Array(this.height).fill().map(() => Array(this.width).fill(0));
    }

    generate() {
        this.generateMainRoads();
        this.generateSecondaryRoads();
        this.ensureConnectivity();
        return this.applyRoadsToTerrain();
    }

    generateMainRoads() {
        // Generate 2-4 main roads connecting opposite edges
        const numMainRoads = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numMainRoads; i++) {
            const start = this.getRandomEdgePoint();
            const end = this.getOppositeEdgePoint(start);
            this.buildRoadBetweenPoints(start, end, true);
        }
    }

    generateSecondaryRoads() {
        // Branch secondary roads from main roads
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

        // Sort options by distance to end and terrain suitability
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
        // Implement logic to determine tile suitability for roads
        // Consider terrain type, avoiding fields unless necessary, etc.
    }

    ensureConnectivity() {
        // Implement flood fill to check connectivity
        // Add necessary connections if roads are disconnected
    }

    // Helper methods (getRandomEdgePoint, getOppositeEdgePoint, distance, isValidTile, etc.)

    applyRoadsToTerrain() {
        // Apply road tiles to the terrain based on this.roads
    }
}
