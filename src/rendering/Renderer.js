// src/rendering/Renderer.js

export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 16; // Make sure this matches your sprite size
        this.sprites = {};
    }

    async loadSprites(tileTypes) {
        console.log("Loading sprites for tile types:", tileTypes);
        const loadPromises = tileTypes.map(type => 
            new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.sprites[type] = img;
                    console.log(`Loaded sprite for ${type}`);
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Failed to load sprite for ${type}`);
                    reject();
                };
                img.src = `assets/sprites/${type}.png`;
            })
        );
        await Promise.all(loadPromises);
        console.log("All sprites loaded:", Object.keys(this.sprites));
    }

    render(terrain) {
        console.log("Starting terrain rendering");
        for (let y = 0; y < terrain.length; y++) {
            for (let x = 0; x < terrain[y].length; x++) {
                const tile = terrain[y][x];
                const sprite = this.sprites[tile];
                if (sprite) {
                    this.ctx.drawImage(sprite, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else {
                    console.warn(`No sprite found for tile type: ${tile} at (${x},${y})`);
                    // Draw a placeholder for missing sprites
                    this.ctx.fillStyle = 'magenta';
                    this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
        console.log("Terrain rendering complete");
    }
}
