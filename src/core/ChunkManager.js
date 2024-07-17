// src/core/ChunkManager.js

import MapGenerator from './MapGenerator.js';
import WorldManager from './WorldManager.js';
import { Cow, Canoe } from '../entities/NPC.js';

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
    console.log(`Updating viewport. Center: (${centerX}, ${centerY}), Zoom: ${this.zoomLevel}`);
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
                    const chunk = this.generateChunk(x, y);
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
        const chunk = this.mapGenerator.generateChunk(x, y, chunkSeed, regionType);
        
        // Add NPCs to the chunk
        chunk.npcs = this.generateNPCs(chunk);
        
        return chunk;
    }

        generateNPCs(chunk) {
        const npcs = [];
        const { terrain } = chunk;

        // Generate cows
        const grassTiles = this.findTiles(terrain, 'grass');
        const cowCount = Math.floor(Math.random() * 4) + 2; // 2-5 cows
        for (let i = 0; i < cowCount; i++) {
            if (grassTiles.length > 0) {
                const index = Math.floor(Math.random() * grassTiles.length);
                const [x, y] = grassTiles.splice(index, 1)[0];
                npcs.push(new Cow(x, y));
            }
        }

        // Generate canoes
        const waterTiles = this.findTiles(terrain, 'water');
        const canoeCount = Math.floor(Math.random() * 3) + 1; // 1-3 canoes
        for (let i = 0; i < canoeCount; i++) {
            if (waterTiles.length > 0) {
                const index = Math.floor(Math.random() * waterTiles.length);
                const [x, y] = waterTiles.splice(index, 1)[0];
                npcs.push(new Canoe(x, y));
            }
        }

        return npcs;
    }

    findTiles(terrain, tileType) {
        const tiles = [];
        for (let y = 0; y < terrain.length; y++) {
            for (let x = 0; x < terrain[y].length; x++) {
                if (terrain[y][x] === tileType) {
                    tiles.push([x, y]);
                }
            }
        }
        return tiles;
    }

    setZoom(zoom) {
        this.zoomLevel = zoom;
    }
}
