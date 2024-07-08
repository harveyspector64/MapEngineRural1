import AStar from '../core/AStar.js';
import { TILES } from './TerrainGenerator.js';

/**
 * Class responsible for generating roads on the terrain.
 */
export default class RoadGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.astar = new AStar(terrain);
    }

    /**
     * Generates roads on the terrain.
     */
    generateRoads() {
        console.log('Starting road generation...');
        const edgePoints = this.findFieldEdges();
        console.log('Field edges found:', edgePoints);

        edgePoints.forEach((startPoint, index) => {
            if (index < edgePoints.length - 1) {
                const endPoint = edgePoints[index + 1];
                this.createRoad(startPoint, endPoint);
            }
        });

        console.log('Road generation completed.');
    }

    /**
     * Finds the edges of the farmland fields to place roads along them.
     * @returns {Array} An array of points representing the edges of farmland fields.
     */
    findFieldEdges() {
        const edges = [];
        for (let y = 0; y < this.terrain.length; y++) {
            for (let x = 0; x < this.terrain[0].length; x++) {
                if (this.isFieldEdge(x, y)) {
                    edges.push({ x, y });
                }
            }
        }
        return edges;
    }

    /**
     * Checks if a given tile is on the edge of a field.
     * @param {number} x - The x-coordinate of the tile.
     * @param {number} y - The y-coordinate of the tile.
     * @returns {boolean} True if the tile is on the edge of a field, false otherwise.
     */
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

    /**
     * Checks if the given coordinates are within the bounds of the terrain.
     * @param {number} x - The x-coordinate to check.
     * @param {number} y - The y-coordinate to check.
     * @returns {boolean} True if the coordinates are within bounds, false otherwise.
     */
    isWithinBounds(x, y) {
        return x >= 0 && x < this.terrain[0].length && y >= 0 && y < this.terrain.length;
    }

    /**
     * Creates a road between two points using A* pathfinding.
     * @param {Object} start - The starting point of the road.
     * @param {Object} end - The ending point of the road.
     */
    createRoad(start, end) {
        console.log(`Creating road from (${start.x}, ${start.y}) to (${end.x}, ${end.y})`);
        const path = this.astar.findPath(start, end, {
            heuristic: this.roadHeuristic.bind(this),
            costFunction: this.roadCostFunction.bind(this)
        });
        if (path) {
            this.applyRoadToTerrain(path);
        } else {
            console.log(`No path found from (${start.x}, ${start.y}) to (${end.x}, ${end.y})`);
        }
    }

    /**
     * Custom heuristic for road pathfinding.
     * @param {Object} a - The current node.
     * @param {Object} b - The goal node.
     * @returns {number} The heuristic value.
     */
    roadHeuristic(a, b) {
        return this.astar.manhattanDistance(a, b);
    }

    /**
     * Custom cost function for road pathfinding.
     * @param {Object} current - The current node.
     * @param {Object} neighbor - The neighboring node.
     * @returns {number} The cost value.
     */
    roadCostFunction(current, neighbor) {
        const neighborTile = this.terrain[neighbor.y][neighbor.x];
        if (neighborTile === TILES.WATER) return 100;
        if (neighborTile === TILES.GRASS) return 1;
        if (neighborTile === TILES.FIELD) return 2;
        if (neighborTile === TILES.HILL) return 5;
        return 1;
    }

    /**
     * Applies the road path to the terrain.
     * @param {Array} path - The path to apply as a road.
     */
    applyRoadToTerrain(path) {
        path.forEach(point => {
            this.terrain[point.y][point.x] = TILES.ROAD;
        });
        console.log('Road applied to terrain:', path);
    }
}
