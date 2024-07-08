// File: src/core/WaveFunctionCollapse.js
export default class WaveFunctionCollapse {
    constructor(width, height, tileSet) {
        this.width = width;
        this.height = height;
        this.tileSet = tileSet;
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
        return this.tileSet.filter(tile => this.isValidPlacement(tile, x, y));
    }

    isValidPlacement(tile, x, y) {
        // Implement your adjacency rules here
        return true; // Placeholder
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
