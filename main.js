// main.js
import ChunkManager from './src/core/ChunkManager.js';
import Renderer from './src/rendering/Renderer.js';
import { TILES } from './src/features/TerrainGenerator.js';

const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

let chunkManager;
let cameraX = 0;
let cameraY = 0;

async function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    await renderer.loadSprites(Object.values(TILES).concat(['barn', 'silo', 'road']));

    chunkManager = new ChunkManager(canvas.width, canvas.height);
    
    // Initial update for center of the map
    chunkManager.updateViewport(cameraX, cameraY);

    render();
    setupControls();
    setupDebugInfo();
}

function render() {
    renderer.clear();
    renderer.setCamera(cameraX, cameraY);
    const visibleChunks = chunkManager.getVisibleChunkCoordinates(cameraX, cameraY);
    visibleChunks.forEach(({x, y}) => {
        const chunk = chunkManager.getChunk(x, y);
        if (chunk) {
            renderer.renderChunk(chunk);
        }
    });
    
    // Draw chunk boundaries for debugging
    renderer.drawChunkBoundaries(Array.from(chunkManager.loadedChunks.values()));

    requestAnimationFrame(render);
}

function setupControls() {
    window.addEventListener('keydown', (e) => {
        const moveDistance = 16; // One tile size
        switch(e.key) {
            case 'ArrowUp':
                cameraY -= moveDistance;
                break;
            case 'ArrowDown':
                cameraY += moveDistance;
                break;
            case 'ArrowLeft':
                cameraX -= moveDistance;
                break;
            case 'ArrowRight':
                cameraX += moveDistance;
                break;
        }
        chunkManager.updateViewport(cameraX, cameraY);
        updateDebugInfo();
    });
}

function setupDebugInfo() {
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debug-info';
    debugDiv.style.position = 'absolute';
    debugDiv.style.top = '10px';
    debugDiv.style.left = '10px';
    debugDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugDiv.style.color = 'white';
    debugDiv.style.padding = '10px';
    document.body.appendChild(debugDiv);
    updateDebugInfo();
}

function updateDebugInfo() {
    const debugDiv = document.getElementById('debug-info');
    const currentChunkX = Math.floor(cameraX / (chunkManager.chunkSize * renderer.tileSize));
    const currentChunkY = Math.floor(cameraY / (chunkManager.chunkSize * renderer.tileSize));
    debugDiv.innerHTML = `
        Camera: (${cameraX}, ${cameraY})<br>
        Current Chunk: (${currentChunkX}, ${currentChunkY})<br>
        Loaded Chunks: ${chunkManager.loadedChunks.size}
    `;
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
