import SimplexNoise from 'https://cdn.jsdelivr.net/npm/simplex-noise@3.0.0/dist/esm/simplex-noise.js';

class SuitabilityMapGenerator {
    constructor(terrain) {
        this.terrain = terrain;
        this.noise = new SimplexNoise();
    }

    generateSuitabilityMap() {
        const suitabilityMap = [];
        for (let y = 0; y < this.terrain.length; y++) {
            suitabilityMap[y] = [];
            for (let x = 0; x < this.terrain[0].length; x++) {
                const noiseValue = this.noise.noise2D(x / 50, y / 50);
                suitabilityMap[y][x] = this.calculateSuitability(noiseValue, this.terrain[y][x]);
            }
        }
        console.log('Suitability map generated:', suitabilityMap);
        return suitabilityMap;
    }

    calculateSuitability(noiseValue, tile) {
        // Adjust this function based on your terrain types
        switch (tile) {
            case 'GRASS': return noiseValue * 10;
            case 'FIELD': return noiseValue * 5;
            case 'HILL': return noiseValue * 20;
            case 'WATER': return 100;
            default: return noiseValue * 10;
        }
    }
}

export default SuitabilityMapGenerator;
