// File: src/core/AStar.js

class AStar {
    constructor(grid) {
        this.grid = grid;
    }

    findPath(start, goal, options = {}) {
        const { heuristic = this.manhattanDistance, costFunction = () => 1 } = options;

        const openSet = [start];
        const cameFrom = {};
        const gScore = { [this.key(start)]: 0 };
        const fScore = { [this.key(start)]: heuristic(start, goal) };

        while (openSet.length > 0) {
            const current = this.lowestFScore(openSet, fScore);
            if (this.key(current) === this.key(goal)) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.splice(openSet.indexOf(current), 1);
            for (const neighbor of this.getNeighbors(current)) {
                const tentativeGScore = gScore[this.key(current)] + costFunction(current, neighbor);

                if (tentativeGScore < (gScore[this.key(neighbor)] || Infinity)) {
                    cameFrom[this.key(neighbor)] = current;
                    gScore[this.key(neighbor)] = tentativeGScore;
                    fScore[this.key(neighbor)] = gScore[this.key(neighbor)] + heuristic(neighbor, goal);
                    if (!openSet.some(node => this.key(node) === this.key(neighbor))) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        return null; // No path found
    }

    key(node) {
        return `${node.x},${node.y}`;
    }

    lowestFScore(nodes, fScore) {
        return nodes.reduce((lowest, node) => 
            (fScore[this.key(node)] < fScore[this.key(lowest)] ? node : lowest));
    }

    getNeighbors(node) {
        const { x, y } = node;
        return [
            { x: x + 1, y }, { x: x - 1, y },
            { x, y: y + 1 }, { x, y: y - 1 }
        ].filter(({ x, y }) => 
            x >= 0 && x < this.grid[0].length && y >= 0 && y < this.grid.length);
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        while (cameFrom[this.key(current)]) {
            current = cameFrom[this.key(current)];
            path.unshift(current);
        }
        return path;
    }

    manhattanDistance(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
}

export default AStar;
