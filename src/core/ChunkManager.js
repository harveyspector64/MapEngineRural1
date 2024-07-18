// src/core/ChunkManager.js

import MapGenerator from './MapGenerator.js';
import WorldManager from './WorldManager.js';

export default class ChunkManager {
    constructor(viewportWidth, viewportHeight, chunkSize = 64) {
        this.worldManager = new WorldManager();
        this.mapGenerator = new MapGenerator(chunkSize);
        this.chunkSize = chunkSize;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.loadedChunks = new Map();
        this.recentlyUnloaded = new Map();
        this.zoomLevel = 1;
        console.log(`ChunkManager initialized with viewport: ${viewportWidth}x${viewportHeight}, chunkSize: ${chunkSize}`);
    }

updateViewport(centerX, centerY) {
    const visibleChunks = this.getVisibleChunkCoordinates(centerX, centerY);
    let newChunks = 0;
    let reloadedChunks = 0;
    
    visibleChunks.forEach(({x, y}) => {
        const key = `${x},${y}`;
        if (!this.loadedChunks.has(key)) {
            if (this.recentlyUnloaded.has(key)) {
                this.loadedChunks.set(key, this.recentlyUnloaded.get(key));
                this.recentlyUnloaded.delete(key);
                reloadedChunks++;
            } else {
                const chunk = this.generateChunk(x, y);
                this.loadedChunks.set(key, chunk);
                newChunks++;
            }
        }
    });

    let unloadedChunks = 0;
    this.loadedChunks.forEach((chunk, key) => {
        const [x, y] = key.split(',').map(Number);
        if (!visibleChunks.some(vc => vc.x === x && vc.y === y)) {
            this.recentlyUnloaded.set(key, chunk);
            this.loadedChunks.delete(key);
            unloadedChunks++;
        }
    });

    // Limit the size of recentlyUnloaded cache
    while (this.recentlyUnloaded.size > 20) {
        const oldestKey = this.recentlyUnloaded.keys().next().value;
        this.recentlyUnloaded.delete(oldestKey);
    }

    if (newChunks > 0 || reloadedChunks > 0 || unloadedChunks > 0) {
        console.log(`Chunks updated: ${newChunks} new, ${reloadedChunks} reloaded, ${unloadedChunks} unloaded. Total: ${this.loadedChunks.size}`);
    }
}

    getVisibleChunkCoordinates(centerX, centerY) {
        const chunkCenterX = Math.floor(centerX / (this.chunkSize * 16));
        const chunkCenterY = Math.floor(centerY / (this.chunkSize * 16));
        const viewChunksX = Math.ceil(this.viewportWidth / (this.chunkSize * 16 * this.zoomLevel)) + 2;
        const viewChunksY = Math.ceil(this.viewportHeight / (this.chunkSize * 16 * this.zoomLevel)) + 2;
        
        const visibleChunks = [];
        for (let y = chunkCenterY - viewChunksY; y <= chunkCenterY + viewChunksY; y++) {
            for (let x = chunkCenterX - viewChunksX; x <= chunkCenterX + viewChunksX; x++) {
                visibleChunks.push({x, y});
            }
        }
        
        console.log(`Visible chunks: ${visibleChunks.length}`);
        return visibleChunks;
    }

    getChunk(x, y) {
        const key = `${x},${y}`;
        return this.loadedChunks.get(key) || this.recentlyUnloaded.get(key);
    }

    generateChunk(x, y) {
        const chunkSeed = this.worldManager.getChunkSeed(x, y);
        const regionType = this.worldManager.getRegionType(x, y);
        console.log(`Generating chunk (${x}, ${y}) with seed: ${chunkSeed}, region: ${regionType}`);
        return this.mapGenerator.generateChunk(x, y, chunkSeed, regionType);
    }

    setZoom(zoom) {
        this.zoomLevel = zoom;
    }
}
