// src/rendering/Renderer.js

export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 32; // Updated to 32x32 as per your specification
        this.sprites = {};
        this.cameraX = 0;
        this.cameraY = 0;
        this.zoomLevel = 1;
    }

async loadSprites(tileTypes) {
    console.log("Loading sprites...");
    const allTypes = [...tileTypes, 'ufo']; // Ensure 'ufo' is included
    const loadPromises = allTypes.map(type => 
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
                console.warn(`Missing sprite for tile type: ${tile} at (${x}, ${y}) in chunk (${chunkX}, ${chunkY})`);
                // Draw a placeholder color for missing sprites
                this.ctx.fillStyle = 'magenta';
                this.ctx.fillRect(
                    offsetX + x * this.tileSize * this.zoomLevel, 
                    offsetY + y * this.tileSize * this.zoomLevel, 
                    this.tileSize * this.zoomLevel, 
                    this.tileSize * this.zoomLevel
                );
            }
        }
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
        } else {
            console.warn("Missing UFO sprite");
        }
    }

    renderInteractiveObject(obj) {
        const sprite = this.sprites[obj.sprite];
        if (sprite) {
            const screenX = (obj.x - this.cameraX) * this.zoomLevel;
            const screenY = (obj.y - this.cameraY) * this.zoomLevel;
            
            this.ctx.save();
            this.ctx.translate(screenX, screenY);
            
            // If object is being abducted, apply a scaling effect
            if (obj.isBeingAbducted) {
                const scaleY = 1 + Math.sin(Date.now() / 200) * 0.1; // Pulsating effect
                this.ctx.scale(1, scaleY);
            }
            
            this.ctx.drawImage(
                sprite,
                -this.tileSize / 2 * this.zoomLevel,
                -this.tileSize / 2 * this.zoomLevel,
                this.tileSize * this.zoomLevel,
                this.tileSize * this.zoomLevel
            );
            
            this.ctx.restore();
        } else {
            console.warn(`Missing sprite for object type: ${obj.type}`);
        }
    }

drawBeam(ufo) {
    if (!ufo.beam.isActive) return;

    const ufoPos = ufo.getPosition();
    const startPoint = { x: ufoPos.x, y: ufoPos.y };
    const endPoint = ufo.beam.getEndPoint();

    this.ctx.save();
    this.ctx.beginPath();

    const ufoRadius = 16; // Assuming UFO sprite is 32x32 pixels
    const beamStartX = startPoint.x + ufo.beam.direction.x * ufoRadius;
    const beamStartY = startPoint.y + ufo.beam.direction.y * ufoRadius;

    // Create a cone-like shape for the beam
    const beamEndWidth = 20 * this.zoomLevel; // Adjust this value to change the end width of the beam
    const beamStartWidth = 5 * this.zoomLevel; // Adjust this value to change the start width of the beam

    const perpX = -ufo.beam.direction.y;
    const perpY = ufo.beam.direction.x;

    this.ctx.moveTo(
        (beamStartX - perpX * beamStartWidth - this.cameraX) * this.zoomLevel,
        (beamStartY - perpY * beamStartWidth - this.cameraY) * this.zoomLevel
    );
    this.ctx.lineTo(
        (endPoint.x - perpX * beamEndWidth - this.cameraX) * this.zoomLevel,
        (endPoint.y - perpY * beamEndWidth - this.cameraY) * this.zoomLevel
    );
    this.ctx.lineTo(
        (endPoint.x + perpX * beamEndWidth - this.cameraX) * this.zoomLevel,
        (endPoint.y + perpY * beamEndWidth - this.cameraY) * this.zoomLevel
    );
    this.ctx.lineTo(
        (beamStartX + perpX * beamStartWidth - this.cameraX) * this.zoomLevel,
        (beamStartY + perpY * beamStartWidth - this.cameraY) * this.zoomLevel
    );

    const gradient = this.ctx.createLinearGradient(
        (beamStartX - this.cameraX) * this.zoomLevel,
        (beamStartY - this.cameraY) * this.zoomLevel,
        (endPoint.x - this.cameraX) * this.zoomLevel,
        (endPoint.y - this.cameraY) * this.zoomLevel
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    this.ctx.restore();
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

    setCanvasSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}
