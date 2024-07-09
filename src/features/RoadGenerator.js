// File: src/features/RoadGenerator.js

import AStar from '../core/AStar.js';
import { TILES } from './TerrainGenerator.js';

export default class RoadGenerator {
    constructor(terrain) {
        if (!terrain) {
            console.error('Terrain is not defined');
        }
        this.terrain = terrain;
        this.roads = [];
    }

    generateRoads(waypoints) {
        for (let i = 0; i < waypoints.length - 1; i++) {
            const start = waypoints[i];
            const end = waypoints[i + 1];
            const initialPath = this.randomWalkWithBias(start, end);
            const refinedPath = this.refinePath(initialPath);
            this.roads.push(...refinedPath);
        }
        return this.roads;
    }

    randomWalkWithBias(start, end) {
        let path = [start];
        let current = start;
        while (current.x !== end.x || current.y !== end.y) {
            const nextStep = this.getNextStep(current, end);
            if (!nextStep) break; // If no valid next step, terminate
            path.push(nextStep);
            current = nextStep;
        }
        return path;
    }

    getNextStep(current, end) {
        const possibleSteps = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
        ];
        // Filter steps based on terrain suitability
        const validSteps = possibleSteps.filter(step => this.isValidStep(step));
        if (validSteps.length === 0) return null;
        // Bias towards moving closer to the end point
        validSteps.sort((a, b) => this.distance(a, end) - this.distance(b, end));
        return validSteps[0];
    }

    isValidStep(step) {
        return step.x >= 0 && step.x < this.terrain[0].length && 
               step.y >= 0 && step.y < this.terrain.length && 
               this.isPassableTerrain(this.terrain[step.y][step.x]);
    }

    distance(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    isPassableTerrain(tile) {
        const impassableTypes = [TILES.WATER];
        return !impassableTypes.includes(tile);
    }

    refinePath(segment) {
        const aStar = new AStar(this.terrain);
        return aStar.findPath(segment[0], segment[segment.length - 1], {
            heuristic: this.heuristic,
            costFunction: this.cost.bind(this) // Ensure this is bound to the instance
        });
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    cost(current, neighbor) {
        if (!this.terrain) {
            console.error('Terrain is undefined in cost function');
        }
        const terrainType = this.terrain[neighbor.y][neighbor.x];
        console.log(`Current: (${current.x}, ${current.y}), Neighbor: (${neighbor.x}, ${neighbor.y}), Terrain: ${terrainType}`);
        switch (terrainType) {
            case TILES.GRASS: return 1;
            case TILES.FIELD: return 2;
            case TILES.WATER: return 100;
            default: return 1;
        }
    }
}
