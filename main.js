// main.js
import ChunkManager from './src/core/ChunkManager.js';
import Renderer from './src/rendering/Renderer.js';
import { TILES } from './src/features/TerrainGenerator.js';

const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

let chunkManager;

async function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    await renderer.loadSprites(Object.values(TILES).concat(['barn', 'silo', 'road']));

    chunkManager = new ChunkManager(canvas.width, canvas.height);
    
    // Initial update for center of the map
    chunkManager.updateViewport(0, 0);

    render();
}

function render() {
    renderer.clear();
    const visibleChunks = chunkManager.getVisibleChunkCoordinates(0, 0);
    visibleChunks.forEach(({x, y}) => {
        const chunk = chunkManager.getChunk(x, y);
        if (chunk) {
            renderer.renderChunk(chunk);
        }
    });
    requestAnimationFrame(render);
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
