// src/core/WorldManager.js

export default class WorldManager {
    constructor(seed = Math.random()) {
        this.masterSeed = seed;
        console.log(`WorldManager initialized with master seed: ${this.masterSeed}`);
    }

    getChunkSeed(chunkX, chunkY) {
        // Use a simple but effective method to generate a unique seed for each chunk
        const chunkSeed = this.masterSeed * (chunkX * 373 + chunkY * 653);
        return (chunkSeed - Math.floor(chunkSeed)) * 1000000;
    }

    getRegionType(chunkX, chunkY) {
        // Implement a simple, deterministic method to assign region types
        const regionSeed = this.getChunkSeed(Math.floor(chunkX / 2), Math.floor(chunkY / 2));
        const regionTypes = ['farmland', 'forest', 'mixed', 'lakeside'];
        return regionTypes[Math.floor(regionSeed * regionTypes.length)];
    }
}
