// src/rendering/Renderer.js

export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 16;
        this.sprites = {};
        this.cameraX = 0;
        this.cameraY = 0;
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
        console.log("All sprites loaded successfully");
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderChunk(chunk) {
        const { x: chunkX, y: chunkY, terrain } = chunk;
        const chunkPixelSize = terrain.length * this.tileSize;
        const offsetX = chunkX * chunkPixelSize - this.cameraX;
        const offsetY = chunkY * chunkPixelSize - this.cameraY;

        // Only render if the chunk is visible
        if (offsetX + chunkPixelSize < 0 || offsetX > this.canvas.width ||
            offsetY + chunkPixelSize < 0 || offsetY > this.canvas.height) {
            return;
        }

        for (let y = 0; y < terrain.length; y++) {
            for (let x = 0; x < terrain[y].length; x++) {
                const tile = terrain[y][x];
                const sprite = this.sprites[tile];
                if (sprite) {
                    this.ctx.drawImage(
                        sprite, 
                        offsetX + x * this.tileSize, 
                        offsetY + y * this.tileSize, 
                        this.tileSize, 
                        this.tileSize
                    );
                }
            }
        }
    }

    setCamera(x, y) {
        this.cameraX = x;
        this.cameraY = y;
    }

    // Debug method to show chunk boundaries
    drawChunkBoundaries(chunks) {
        this.ctx.strokeStyle = 'red';
        chunks.forEach(chunk => {
            const chunkSize = chunk.terrain.length * this.tileSize;
            this.ctx.strokeRect(
                chunk.x * chunkSize - this.cameraX,
                chunk.y * chunkSize - this.cameraY,
                chunkSize,
                chunkSize
            );
        });
    }
}
