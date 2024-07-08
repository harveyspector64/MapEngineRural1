// File: src/core/WaveFunctionCollapse.js

class WaveFunctionCollapse {
    constructor(width, height, tileSet) {
        this.width = width;
        this.height = height;
        this.tileSet = tileSet;
        this.grid = [];
        this.initializeGrid();
    }

    initializeGrid() {
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = new Set(this.tileSet.map(tile => tile.type));
            }
        }
    }

    collapse() {
        while (!this.isFullyCollapsed()) {
            const { x, y } = this.findLowestEntropyCell();
            this.collapseCell(x, y);
            this.propagate(x, y);
        }
        return this.grid;
    }

    isFullyCollapsed() {
        return this.grid.every(row => row.every(cell => cell.size === 1));
    }

    findLowestEntropyCell() {
        let minEntropy = Infinity;
        let candidates = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cellSize = this.grid[y][x].size;
                if (cellSize > 1 && cellSize <= minEntropy) {
                    if (cellSize < minEntropy) {
                        minEntropy = cellSize;
                        candidates = [];
                    }
                    candidates.push({ x, y });
                }
            }
        }

        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    collapseCell(x, y) {
        const options = Array.from(this.grid[y][x]);
        const selectedTile = options[Math.floor(Math.random() * options.length)];
        this.grid[y][x] = new Set([selectedTile]);
    }

    propagate(x, y) {
        const stack = [{ x, y }];

        while (stack.length > 0) {
            const { x, y } = stack.pop();
            const currentTile = Array.from(this.grid[y][x])[0];

            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;

                    const nx = x + dx;
                    const ny = y + dy;

                    if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                        const neighborSet = this.grid[ny][nx];
                        const validNeighbors = this.getValidNeighbors(currentTile, dx, dy);

                        const newNeighborSet = new Set([...neighborSet].filter(tile => validNeighbors.has(tile)));

                        if (newNeighborSet.size < neighborSet.size) {
                            this.grid[ny][nx] = newNeighborSet;
                            stack.push({ x: nx, y: ny });
                        }
                    }
                }
            }
        }
    }

    getValidNeighbors(tileType, dx, dy) {
        // This method should return a set of valid neighboring tile types
        // based on the current tile type and the direction.
        // You'll need to define these rules based on your specific tile set.
        // For now, we'll return all tile types as valid.
        return new Set(this.tileSet.map(tile => tile.type));
    }
}

export default WaveFunctionCollapse;
