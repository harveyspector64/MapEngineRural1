// src/rendering/Renderer.js

export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 16;
        this.sprites = {};
        this.cameraX = 0;
        this.cameraY = 0;
        this.zoomLevel = 1;
    }

    async loadSprites(tileTypes) {
        const loadPromises = [...tileTypes, 'ufo'].map(type => 
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
    if (!chunk || !chunk.terrain) {
        console.error("Attempted to render invalid chunk:", chunk);
        return;
    }

    const { x: chunkX, y: chunkY, terrain } = chunk;
    const chunkPixelSize = terrain.length * this.tileSize;
    const offsetX = (chunkX * chunkPixelSize - this.cameraX) * this.zoomLevel;
    const offsetY = (chunkY * chunkPixelSize - this.cameraY) * this.zoomLevel;

    // Only render if the chunk is visible
    if (offsetX + chunkPixelSize * this.zoomLevel < 0 || offsetX > this.canvas.width ||
        offsetY + chunkPixelSize * this.zoomLevel < 0 || offsetY > this.canvas.height) {
        return;
    }

    for (let y = 0; y < terrain.length; y++) {
        for (let x = 0; x < terrain[y].length; x++) {
            const tile = terrain[y][x];
            const sprite = this.sprites[tile];
            if (sprite) {
                this.ctx.drawImage(
                    sprite, 
                    offsetX + x * this.tileSize * this.zoomLevel, 
                    offsetY + y * this.tileSize * this.zoomLevel, 
                    this.tileSize * this.zoomLevel, 
                    this.tileSize * this.zoomLevel
                );
            } else {
                console.warn(`Missing sprite for tile type: ${tile}`);
            }
        }
    }

    // Render NPCs
    if (chunk.npcs) {
        chunk.npcs.forEach(npc => {
            const sprite = this.sprites[npc.sprite || npc.type];
            if (sprite) {
                const screenX = offsetX + npc.x * this.tileSize * this.zoomLevel;
                const screenY = offsetY + npc.y * this.tileSize * this.zoomLevel;
                this.ctx.drawImage(
                    sprite,
                    screenX,
                    screenY,
                    this.tileSize * this.zoomLevel,
                    this.tileSize * this.zoomLevel
                );
            }
        });
    }
}

    renderUFO(ufo) {
        const sprite = this.sprites['ufo'];
        if (sprite) {
            const { x, y } = ufo.getPosition();
            this.ctx.save();
            this.ctx.translate((x - this.cameraX) * this.zoomLevel, (y - this.cameraY) * this.zoomLevel);
            this.ctx.rotate(ufo.rotation);
            this.ctx.drawImage(sprite, -16 * this.zoomLevel, -16 * this.zoomLevel, 32 * this.zoomLevel, 32 * this.zoomLevel);
            this.ctx.restore();
        }
    }

drawBeam(ufo) {
    if (!ufo.beam.isActive || ufo.beam.length === 0) return;

    const ufoPos = ufo.getPosition();
    const endPoint = ufo.beam.getEndPoint();

    this.ctx.save();
    
    // Create a clipping region for the beam
    this.ctx.beginPath();
    this.ctx.moveTo((ufoPos.x - this.cameraX) * this.zoomLevel, (ufoPos.y - this.cameraY) * this.zoomLevel);
    
    // Draw an arc at the end of the beam
    const beamAngle = Math.atan2(endPoint.y - ufoPos.y, endPoint.x - ufoPos.x);
    const beamWidth = ufo.beam.length * 0.2; // Adjust for desired width
    this.ctx.arc(
        (endPoint.x - this.cameraX) * this.zoomLevel,
        (endPoint.y - this.cameraY) * this.zoomLevel,
        beamWidth * this.zoomLevel,
        beamAngle - Math.PI / 2,
        beamAngle + Math.PI / 2
    );
    this.ctx.closePath();
    this.ctx.clip();

    // Draw the beam gradient
    const gradient = this.ctx.createRadialGradient(
        (ufoPos.x - this.cameraX) * this.zoomLevel,
        (ufoPos.y - this.cameraY) * this.zoomLevel,
        0,
        (ufoPos.x - this.cameraX) * this.zoomLevel,
        (ufoPos.y - this.cameraY) * this.zoomLevel,
        ufo.beam.length * this.zoomLevel
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
        (ufoPos.x - this.cameraX - ufo.beam.length) * this.zoomLevel,
        (ufoPos.y - this.cameraY - ufo.beam.length) * this.zoomLevel,
        ufo.beam.length * 2 * this.zoomLevel,
        ufo.beam.length * 2 * this.zoomLevel
    );

    // Add glow effect
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.lineWidth = 2 * this.zoomLevel;
    this.ctx.stroke();

    this.ctx.restore();

    // Render captured NPC if any
    if (ufo.capturedNPC) {
        const sprite = this.sprites[ufo.capturedNPC.sprite || ufo.capturedNPC.type];
        if (sprite) {
            this.ctx.drawImage(
                sprite,
                (endPoint.x - this.cameraX) * this.zoomLevel - (this.tileSize * this.zoomLevel) / 2,
                (endPoint.y - this.cameraY) * this.zoomLevel - (this.tileSize * this.zoomLevel) / 2,
                this.tileSize * this.zoomLevel,
                this.tileSize * this.zoomLevel
            );
        }
    }
}
    
    setCamera(x, y) {
        this.cameraX = x;
        this.cameraY = y;
    }

    setZoom(zoom) {
        this.zoomLevel = zoom;
    }

    drawChunkBoundaries(chunks) {
        this.ctx.strokeStyle = 'red';
        chunks.forEach(chunk => {
            if (!chunk || !chunk.terrain) {
                console.error("Invalid chunk in drawChunkBoundaries:", chunk);
                return;
            }
            const chunkSize = chunk.terrain.length * this.tileSize;
            this.ctx.strokeRect(
                (chunk.x * chunkSize - this.cameraX) * this.zoomLevel,
                (chunk.y * chunkSize - this.cameraY) * this.zoomLevel,
                chunkSize * this.zoomLevel,
                chunkSize * this.zoomLevel
            );
        });
    }
}
