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
    const bufferSize = 2; // Load 2 extra chunks in each direction
    let newChunks = 0;
    let reloadedChunks = 0;
    
    for (let dy = -bufferSize; dy <= bufferSize; dy++) {
        for (let dx = -bufferSize; dx <= bufferSize; dx++) {
            visibleChunks.forEach(({x, y}) => {
                const bufferX = x + dx;
                const bufferY = y + dy;
                const key = `${bufferX},${bufferY}`;
                
                if (!this.loadedChunks.has(key)) {
                    if (this.recentlyUnloaded.has(key)) {
                        this.loadedChunks.set(key, this.recentlyUnloaded.get(key));
                        this.recentlyUnloaded.delete(key);
                        reloadedChunks++;
                    } else {
                        const chunk = this.generateChunk(bufferX, bufferY);
                        this.loadedChunks.set(key, chunk);
                        newChunks++;
                    }
                }
            });
        }
    }

    // Unload chunks that are far from the visible area
    this.loadedChunks.forEach((chunk, key) => {
        const [x, y] = key.split(',').map(Number);
        const isVisible = visibleChunks.some(vc => 
            Math.abs(vc.x - x) <= bufferSize && Math.abs(vc.y - y) <= bufferSize
        );
        if (!isVisible) {
            this.recentlyUnloaded.set(key, chunk);
            this.loadedChunks.delete(key);
        }
    });

    // Limit the size of recentlyUnloaded cache
    while (this.recentlyUnloaded.size > 100) {
        const oldestKey = this.recentlyUnloaded.keys().next().value;
        this.recentlyUnloaded.delete(oldestKey);
    }

    if (newChunks > 0 || reloadedChunks > 0) {
        console.log(`Chunks updated: ${newChunks} new, ${reloadedChunks} reloaded. Total: ${this.loadedChunks.size}`);
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
        
        return visibleChunks;
    }

getChunk(x, y) {
    const key = `${x},${y}`;
    const chunk = this.loadedChunks.get(key) || this.recentlyUnloaded.get(key);
    if (!chunk) {
        console.warn(`Chunk not found: (${x}, ${y})`);
    } else if (!chunk.terrain) {
        console.error(`Chunk found but has no terrain: (${x}, ${y})`, chunk);
    }
    return chunk;
}

    generateChunk(x, y) {
        const chunkSeed = this.worldManager.getChunkSeed(x, y);
        const regionType = this.worldManager.getRegionType(x, y);
        return this.mapGenerator.generateChunk(x, y, chunkSeed, regionType);
    }

    setZoom(zoom) {
        this.zoomLevel = zoom;
    }
}
