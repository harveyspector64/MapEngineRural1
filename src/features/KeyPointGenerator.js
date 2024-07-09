class KeyPointGenerator {
    constructor(terrain) {
        this.terrain = terrain;
    }

    generateKeyPoints(count) {
        const keyPoints = [];
        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * this.terrain[0].length);
            const y = Math.floor(Math.random() * this.terrain.length);
            keyPoints.push({ x, y });
        }
        console.log(`Generated ${keyPoints.length} key points:`, keyPoints);
        return keyPoints;
    }
}

export default KeyPointGenerator;
