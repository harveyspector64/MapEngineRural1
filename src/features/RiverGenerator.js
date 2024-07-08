// File: src/features/RiverGenerator.js
import AStar from '../core/AStar.js';
import { TILES } from './TerrainGenerator.js';

export default class RiverGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.astar = new AStar(terrain);
    }

    generate(startPoint, endPoint) {
        const riverPath = this.astar.findPath(startPoint, endPoint, {
            heuristic: this.riverHeuristic.bind(this),
            costFunction: this.riverCostFunction.bind(this)
        });

        if (riverPath) {
            this.applyRiverToTerrain(riverPath);
        }

        return riverPath;
    }

    riverHeuristic(a, b) {
        // Encourage meandering by reducing the heuristic value
        return this.astar.manhattanDistance(a, b) * 0.8;
    }

    riverCostFunction(current, neighbor) {
        // Prefer lower elevations and existing water
        const currentTile = this.terrain[current.y][current.x];
        const neighborTile = this.terrain[neighbor.y][neighbor.x];

        if (neighborTile === TILES.WATER) return 0.1;
        if (neighborTile === TILES.GRASS) return 0.5;
        if (neighborTile === TILES.FIELD) return 1;
        if (neighborTile === TILES.HILL) return 5;

        return 1;
    }

    applyRiverToTerrain(path) {
        path.forEach(point => {
            this.terrain[point.y][point.x] = TILES.WATER;
        });
    }
}
