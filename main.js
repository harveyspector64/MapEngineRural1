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
}

function render() {
    renderer.clear();
    const visibleChunks = chunkManager.getVisibleChunkCoordinates(cameraX, cameraY);
    visibleChunks.forEach(({x, y}) => {
        const chunk = chunkManager.getChunk(x, y);
        if (chunk) {
            renderer.renderChunk(chunk);
        }
    });
    requestAnimationFrame(render);
}

function setupControls() {
    window.addEventListener('keydown', (e) => {
        const moveDistance = 5;
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
    });
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
