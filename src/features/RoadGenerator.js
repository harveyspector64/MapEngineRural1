import AStar from '../core/AStar.js';
import { TILES } from './TerrainGenerator.js';

export default class RoadGenerator {
    constructor(terrain, renderer) {
        this.terrain = terrain;
        this.renderer = renderer;
        this.astar = new AStar(terrain);
    }

    generateRoads() {
        console.log('Starting road generation...');
        const edgePoints = this.findFieldEdges();
        console.log(`Field edges found: ${edgePoints.length} points`);

        // Limit the number of edges to process
        const maxEdges = 10;  // Adjust this number as needed
        const prioritizedEdges = this.prioritizeEdges(edgePoints).slice(0, maxEdges);
        console.log(`Prioritized and limited edges to process: ${prioritizedEdges.length} points`);

        // Generate roads incrementally
        this.generateRoadsIncrementally(prioritizedEdges, 0);
    }

    generateRoadsIncrementally(edges, index) {
        if (index >= edges.length - 1) {
            console.log('Road generation completed.');
            this.renderer.render(this.terrain);  // Render the updated terrain
            return;
        }

        const startPoint = edges[index];
        const endPoint = edges[index + 1];
        console.log(`Creating road from (${startPoint.x}, ${startPoint.y}) to (${endPoint.x}, ${endPoint.y})`);
        
        setTimeout(() => {
            const roadCreated = this.createRoad(startPoint, endPoint);
            if (roadCreated) {
                this.generateRoadsIncrementally(edges, index + 1);
            } else {
                console.warn(`Failed to create road from (${startPoint.x}, ${startPoint.y}) to (${endPoint.x}, ${endPoint.y})`);
            }
        }, 50);  // Adjust the delay as needed to prevent freezing
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

    prioritizeEdges(edges) {
        // For now, return the edges sorted by their x and y coordinates
        return edges.sort((a, b) => a.y - b.y || a.x - b.x);
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

    createRoad(start, end) {
        console.log(`Creating road from (${start.x}, ${start.y}) to (${end.x}, ${end.y})`);
        try {
            const path = this.astar.findPath(start, end, {
                heuristic: this.roadHeuristic.bind(this),
                costFunction: this.roadCostFunction.bind(this),
                maxIterations: 1000 // Safety check to avoid infinite loops
            });
            if (path) {
                if (path.length > 20) { // Prevent excessively long paths
                    console.warn(`Path too long from (${start.x}, ${start.y}) to (${end.x}, ${end.y}): ${path.length} steps`);
                    return false;
                }
                this.applyRoadToTerrain(path);
                console.log('Road applied to terrain:', path);
                return true;
            } else {
                console.log(`No path found from (${start.x}, ${start.y}) to (${end.x}, ${end.y})`);
                return false;
            }
        } catch (error) {
            console.error('Error during pathfinding:', error);
            return false;
        }
    }

    roadHeuristic(a, b) {
        return this.astar.manhattanDistance(a, b);
    }

    roadCostFunction(current, neighbor) {
        const neighborTile = this.terrain[neighbor.y][neighbor.x];
        if (neighborTile === TILES.WATER) return 100;
        if (neighborTile === TILES.GRASS) return 1;
        if (neighborTile === TILES.FIELD) return 2;
        if (neighborTile === TILES.HILL) return 5;
        return 1;
    }

    applyRoadToTerrain(path) {
        path.forEach(point => {
            if (this.isWithinBounds(point.x, point.y)) {
                this.terrain[point.y][point.x] = TILES.ROAD;
            }
        });
    }
}
