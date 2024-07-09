import AStar from '../core/AStar.js';
import { TILES } from './TerrainGenerator.js';

class RoadGenerator {
    constructor(terrain, suitabilityMap) {
        this.terrain = terrain;
        this.suitabilityMap = suitabilityMap;
        this.astar = new AStar(suitabilityMap);
    }

    generateRoads(keyPoints) {
        console.log('Starting road generation...');
        for (let i = 0; i < keyPoints.length - 1; i++) {
            const startPoint = keyPoints[i];
            const endPoint = keyPoints[i + 1];
            console.log(`Creating road from (${startPoint.x}, ${startPoint.y}) to (${endPoint.x}, ${endPoint.y})`);
            const path = this.astar.findPath(startPoint, endPoint, {
                heuristic: this.roadHeuristic.bind(this),
                costFunction: this.roadCostFunction.bind(this),
                maxIterations: 1000 // Safety check to avoid infinite loops
            });
            if (path) {
                this.applyRoadToTerrain(path);
                console.log('Road applied to terrain:', path);
            } else {
                console.log(`No path found from (${startPoint.x}, ${startPoint.y}) to (${endPoint.x}, ${endPoint.y})`);
            }
        }
        console.log('Road generation completed.');
    }

    roadHeuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    roadCostFunction(current, neighbor) {
        return this.suitabilityMap[neighbor.y][neighbor.x];
    }

    applyRoadToTerrain(path) {
        path.forEach(point => {
            if (this.isWithinBounds(point.x, point.y)) {
                this.terrain[point.y][point.x] = TILES.ROAD;
            }
        });
    }

    isWithinBounds(x, y) {
        return x >= 0 && x < this.terrain[0].length && y >= 0 && y < this.terrain.length;
    }
}

export default RoadGenerator;
