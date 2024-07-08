// File: src/features/RoadGenerator.js
import AStar from '../core/AStar.js';
import { TILES } from './TerrainGenerator.js';

export default class RoadGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.astar = new AStar(terrain);
    }

    generate(startPoint, endPoint) {
        const roadPath = this.astar.findPath(startPoint, endPoint, {
            heuristic: this.roadHeuristic.bind(this),
            costFunction: this.roadCostFunction.bind(this)
        });

        if (roadPath) {
            this.applyRoadToTerrain(roadPath);
        }

        return roadPath;
    }

    roadHeuristic(a, b) {
        // Roads should be more direct than rivers
        return this.astar.manhattanDistance(a, b);
    }

    roadCostFunction(current, neighbor) {
        // Prefer flat terrain and avoid water
        const currentTile = this.terrain[current.y][current.x];
        const neighborTile = this.terrain[neighbor.y][neighbor.x];

        if (neighborTile === TILES.WATER) return 100;
        if (neighborTile === TILES.GRASS) return 1;
        if (neighborTile === TILES.FIELD) return 2;
        if (neighborTile === TILES.HILL) return 5;

        return 1;
    }

    applyRoadToTerrain(path) {
        path.forEach(point => {
            this.terrain[point.y][point.x] = TILES.ROAD;
        });
    }
}
