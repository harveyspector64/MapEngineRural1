// src/core/ChunkManager.js

import MapGenerator from './MapGenerator.js';
import WorldManager from './WorldManager.js';

export default class ChunkManager {
    constructor(viewportWidth, viewportHeight, chunkSize = 64) {
        this.worldManager = new WorldManager(); // New: Added WorldManager
        this.mapGenerator = new MapGenerator(chunkSize);
        this.chunkSize = chunkSize;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.loadedChunks = new Map();
        this.recentlyUnloaded = new Map();
        console.log(`ChunkManager initialized with viewport: ${viewportWidth}x${viewportHeight}, chunkSize: ${chunkSize}`);
    }

    // This method remains unchanged
    updateViewport(centerX, centerY) {
        console.log(`Updating viewport. Center: (${centerX}, ${centerY})`);
        const visibleChunks = this.getVisibleChunkCoordinates(centerX, centerY);
        
        // Load new chunks
        visibleChunks.forEach(({x, y}) => {
            const key = `${x},${y}`;
            if (!this.loadedChunks.has(key)) {
                if (this.recentlyUnloaded.has(key)) {
                    console.log(`Reloading cached chunk at (${x}, ${y})`);
                    this.loadedChunks.set(key, this.recentlyUnloaded.get(key));
                    this.recentlyUnloaded.delete(key);
                } else {
                    console.log(`Generating new chunk at (${x}, ${y})`);
                    const chunk = this.generateChunk(x, y); // Changed: Now calls generateChunk method
                    this.loadedChunks.set(key, chunk);
                }
            }
        });

        // Unload chunks that are no longer visible
        this.loadedChunks.forEach((chunk, key) => {
            const [x, y] = key.split(',').map(Number);
            if (!visibleChunks.some(vc => vc.x === x && vc.y === y)) {
                console.log(`Unloading chunk at (${x}, ${y})`);
                this.recentlyUnloaded.set(key, chunk);
                this.loadedChunks.delete(key);
            }
        });

        // Limit the size of recentlyUnloaded cache
        if (this.recentlyUnloaded.size > 20) {
            const oldestKey = this.recentlyUnloaded.keys().next().value;
            this.recentlyUnloaded.delete(oldestKey);
        }

        console.log(`Total loaded chunks: ${this.loadedChunks.size}, Recently unloaded: ${this.recentlyUnloaded.size}`);
    }

    // This method remains unchanged
    getVisibleChunkCoordinates(centerX, centerY) {
        const chunkCenterX = Math.floor(centerX / (this.chunkSize * 16));
        const chunkCenterY = Math.floor(centerY / (this.chunkSize * 16));
        const viewChunksX = Math.ceil(this.viewportWidth / (this.chunkSize * 16)) + 2;
        const viewChunksY = Math.ceil(this.viewportHeight / (this.chunkSize * 16)) + 2;
        
        const visibleChunks = [];
        for (let y = chunkCenterY - viewChunksY; y <= chunkCenterY + viewChunksY; y++) {
            for (let x = chunkCenterX - viewChunksX; x <= chunkCenterX + viewChunksX; x++) {
                visibleChunks.push({x, y});
            }
        }
        
        console.log(`Visible chunks: ${visibleChunks.length}`);
        return visibleChunks;
    }

    // This method remains unchanged
    getChunk(x, y) {
        const key = `${x},${y}`;
        return this.loadedChunks.get(key) || this.recentlyUnloaded.get(key);
    }

    // New method: Generate a chunk using WorldManager and MapGenerator
    generateChunk(x, y) {
        const chunkSeed = this.worldManager.getChunkSeed(x, y);
        const regionType = this.worldManager.getRegionType(x, y);
        console.log(`Generating chunk (${x}, ${y}) with seed: ${chunkSeed}, region: ${regionType}`);
        return this.mapGenerator.generateChunk(x, y, chunkSeed, regionType);
    }
}
