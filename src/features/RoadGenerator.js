// src/features/RoadGenerator.js

import AStar from '../core/AStar.js';
import { TILES } from './TerrainGenerator.js';

export default class RoadGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.astar = new AStar(terrain);
    }

    generate() {
        const roadPaths = [];
        const potentialRoadPoints = this.findFarmlandEdges();

        for (let i = 0; i < potentialRoadPoints.length - 1; i++) {
            if (Math.random() > 0.5) {
                const startPoint = potentialRoadPoints[i];
                const endPoint = potentialRoadPoints[i + 1];
                const roadPath = this.astar.findPath(startPoint, endPoint, {
                    heuristic: this.roadHeuristic.bind(this),
                    costFunction: this.roadCostFunction.bind(this)
                });

                if (roadPath) {
                    this.applyRoadToTerrain(roadPath);
                    roadPaths.push(roadPath);
                }
            }
        }

        return roadPaths;
    }

    findFarmlandEdges() {
        const edges = [];
        for (let y = 1; y < this.terrain.length - 1; y++) {
            for (let x = 1; x < this.terrain[0].length - 1; x++) {
                if (this.terrain[y][x] === TILES.FIELD || this.terrain[y][x] === TILES.CROP) {
                    if (this.isEdge(x, y)) {
                        edges.push({ x, y });
                    }
                }
            }
        }
        return edges;
    }

    isEdge(x, y) {
        const directions = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, 
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
        ];
        for (const { dx, dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (this.terrain[ny][nx] === TILES.GRASS || this.terrain[ny][nx] === TILES.WATER) {
                return true;
            }
        }
        return false;
    }

    roadHeuristic(a, b) {
        return this.astar.manhattanDistance(a, b);
    }

    roadCostFunction(current, neighbor) {
        const neighborTile = this.terrain[neighbor.y][neighbor.x];
        if (neighborTile === TILES.WATER) return 100;
        if (neighborTile === TILES.GRASS) return 1;
        if (neighborTile === TILES.FIELD) return 2;
        return 1;
    }

    applyRoadToTerrain(path) {
        path.forEach(point => {
            this.terrain[point.y][point.x] = TILES.ROAD;
        });
    }
}
