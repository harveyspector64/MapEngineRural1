import { TILES } from './TerrainGenerator.js';

export default class RoadGenerator {
    constructor(terrain) {
        this.terrain = terrain;
    }

    generateRoads() {
        console.log('Starting road generation...');
        const edgePoints = this.findFieldEdges();
        console.log(`Field edges found: ${edgePoints.length} points`);

        if (edgePoints.length > 1) {
            console.log(`Edge points:`, edgePoints.slice(0, 10)); // Log first 10 edge points for debugging
        } else {
            console.log('Not enough edge points to create a road.');
        }

        console.log('Road generation completed.');
    }

    findFieldEdges() {
        const edges = [];
        for (let y = 0; y < this.terrain.length; y++) {
            for (let x = 0; x < this.terrain[0].length; x++) {
                if (this.isFieldEdge(x, y)) {
                    edges.push({ x, y });
                }
            }
        }
        console.log(`findFieldEdges: Detected ${edges.length} edges`);
        return edges;
    }

    isFieldEdge(x, y) {
        if (this.terrain[y][x] !== TILES.FIELD) return false;
        const neighbors = [
            { x: x + 1, y }, { x: x - 1, y },
            { x, y: y + 1 }, { x, y: y - 1 }
        ];
        return neighbors.some(neighbor => 
            this.isWithinBounds(neighbor.x, neighbor.y) &&
            this.terrain[neighbor.y][neighbor.x] !== TILES.FIELD
        );
    }

    isWithinBounds(x, y) {
        return x >= 0 && x < this.terrain[0].length && y >= 0 && y < this.terrain.length;
    }
}
