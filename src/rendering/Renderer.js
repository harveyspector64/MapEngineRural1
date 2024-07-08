// File: src/rendering/Renderer.js
import { TILES } from '../features/TerrainGenerator.js';
import { STRUCTURES } from '../features/StructureGenerator.js';

export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 32; // Size of our sprite tiles
        this.loadSprites();
    }

    loadSprites() {
        this.sprites = {};
        const spriteNames = [...Object.values(TILES), ...Object.values(STRUCTURES)];
        spriteNames.forEach(name => {
            const img = new Image();
            img.src = `assets/sprites/${name}.png`;
            this.sprites[name] = img;
        });
    }

    render(terrain) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
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
