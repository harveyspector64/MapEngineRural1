// File: src/rendering/Renderer.js
export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 32;
        this.sprites = {};
    }

    async loadSprites(tileTypes) {
        const loadPromises = tileTypes.map(type => 
            new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.sprites[type] = img;
                    resolve();
                };
                img.onerror = reject;
                img.src = `assets/sprites/${type}.png`;
            })
        );
        await Promise.all(loadPromises);
    }

    render(terrain) {
        for (let y = 0; y < terrain.length; y++) {
            for (let x = 0; x < terrain[y].length; x++) {
                const tile = terrain[y][x];
                const sprite = this.sprites[tile];
                if (sprite) {
                    this.ctx.drawImage(sprite, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }
}
