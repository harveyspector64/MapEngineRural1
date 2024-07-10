// src/core/ChunkManager.js
import MapGenerator from './MapGenerator.js';

export default class ChunkManager {
    constructor(viewportWidth, viewportHeight, chunkSize = 64) {
        this.mapGenerator = new MapGenerator(chunkSize);
        this.chunkSize = chunkSize;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.loadedChunks = new Map();
    }

    updateViewport(centerX, centerY) {
        const visibleChunks = this.getVisibleChunkCoordinates(centerX, centerY);
        
        // Load new chunks
        visibleChunks.forEach(({x, y}) => {
            const key = `${x},${y}`;
            if (!this.loadedChunks.has(key)) {
                const chunk = this.mapGenerator.generateChunk(x, y);
                this.loadedChunks.set(key, chunk);
            }
        });

        // Unload chunks that are no longer visible
        this.loadedChunks.forEach((chunk, key) => {
            const [x, y] = key.split(',').map(Number);
            if (!visibleChunks.some(vc => vc.x === x && vc.y === y)) {
                this.loadedChunks.delete(key);
            }
        });
    }

    getVisibleChunkCoordinates(centerX, centerY) {
        const startChunkX = Math.floor((centerX - this.viewportWidth / 2) / this.chunkSize);
        const startChunkY = Math.floor((centerY - this.viewportHeight / 2) / this.chunkSize);
        const endChunkX = Math.ceil((centerX + this.viewportWidth / 2) / this.chunkSize);
        const endChunkY = Math.ceil((centerY + this.viewportHeight / 2) / this.chunkSize);

        const visibleChunks = [];
        for (let x = startChunkX; x <= endChunkX; x++) {
            for (let y = startChunkY; y <= endChunkY; y++) {
                visibleChunks.push({x, y});
            }
        }
        return visibleChunks;
    }

    getChunk(x, y) {
        const key = `${x},${y}`;
        return this.loadedChunks.get(key);
    }
}
