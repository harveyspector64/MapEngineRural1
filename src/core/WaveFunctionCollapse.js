export default class WaveFunctionCollapse {
    constructor(width, height, tileSet, adjacencyRules) {
        this.width = width;
        this.height = height;
        this.tileSet = tileSet;
        this.adjacencyRules = adjacencyRules;
        this.grid = Array(height).fill().map(() => Array(width).fill(null));
    }

    collapse() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.grid[y][x]) {
                    this.collapseCell(x, y);
                }
            }
        }
        return this.grid;
    }

    collapseCell(x, y) {
        const validTiles = this.getValidTiles(x, y);
        const selectedTile = this.selectWeightedRandomTile(validTiles);
        this.grid[y][x] = selectedTile;
    }

    getValidTiles(x, y) {
        const neighbors = this.getNeighbors(x, y);
        let validTiles = this.tileSet;

        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && this.grid[ny][nx]) {
                validTiles = validTiles.filter(tile => 
                    this.adjacencyRules[this.grid[ny][nx]].includes(tile.type)
                );
            }
        }

        return validTiles;
    }

    getNeighbors(x, y) {
        const neighbors = {};
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                neighbors[`${dx},${dy}`] = this.grid[ny][nx];
            }
        }
        return neighbors;
    }

    selectWeightedRandomTile(tiles) {
        const totalWeight = tiles.reduce((sum, tile) => sum + tile.weight, 0);
        let random = Math.random() * totalWeight;
        for (let tile of tiles) {
            if (random < tile.weight) return tile.type;
            random -= tile.weight;
        }
        return tiles[tiles.length - 1].type;
    }
}
