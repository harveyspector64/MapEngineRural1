// main.js
import ChunkManager from './src/core/ChunkManager.js';
import Renderer from './src/rendering/Renderer.js';
import { TILES } from './src/features/TerrainGenerator.js';
import WorldManager from './src/core/WorldManager.js';

const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

let chunkManager;
let worldManager;
let cameraX = 0;
let cameraY = 0;
let zoomLevel = 1;
let isDragging = false;
let lastTouchX = 0;
let lastTouchY = 0;

async function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const availableSprites = [
        'barn', 'bush', 'crop', 'dirt', 'grass', 'road', 'silo', 'tree', 'water'
    ];

    await renderer.loadSprites(availableSprites);

    worldManager = new WorldManager(Math.random()); // You can provide a specific seed if desired
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
    renderer.setZoom(zoomLevel);
    const visibleChunks = chunkManager.getVisibleChunkCoordinates(cameraX, cameraY);
    visibleChunks.forEach(({x, y}) => {
        const chunk = chunkManager.getChunk(x, y);
        if (chunk) {
            renderer.renderChunk(chunk);
        } else {
            console.warn(`Missing chunk at (${x}, ${y})`);
        }
    });
    
    // Draw chunk boundaries for debugging
    renderer.drawChunkBoundaries(Array.from(chunkManager.loadedChunks.values()));

    requestAnimationFrame(render);
}

function setupControls() {
    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);

    // Mouse wheel zoom
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Touch controls
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    // Prevent default touch behavior
    document.body.addEventListener('touchmove', preventDefaultTouch, { passive: false });
}

function handleKeyDown(e) {
    const moveDistance = 16 / zoomLevel; // Adjust movement based on zoom
    switch(e.key) {
        case 'ArrowUp': cameraY -= moveDistance; break;
        case 'ArrowDown': cameraY += moveDistance; break;
        case 'ArrowLeft': cameraX -= moveDistance; break;
        case 'ArrowRight': cameraX += moveDistance; break;
    }
    chunkManager.updateViewport(cameraX, cameraY);
    updateDebugInfo();
}

function handleWheel(e) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const zoomDelta = -Math.sign(e.deltaY) * zoomSpeed;
    const newZoom = Math.max(0.5, Math.min(4, zoomLevel + zoomDelta));
    
    // Zoom towards cursor position
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    cameraX += (mouseX / zoomLevel - mouseX / newZoom);
    cameraY += (mouseY / zoomLevel - mouseY / newZoom);
    
    zoomLevel = newZoom;
    renderer.setZoom(zoomLevel);
    chunkManager.updateViewport(cameraX, cameraY);
    updateDebugInfo();
}

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        isDragging = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    }
}

function handleTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = (touchX - lastTouchX) / zoomLevel;
    const deltaY = (touchY - lastTouchY) / zoomLevel;

    cameraX -= deltaX;
    cameraY -= deltaY;

    lastTouchX = touchX;
    lastTouchY = touchY;

    chunkManager.updateViewport(cameraX, cameraY);
    updateDebugInfo();
}

function handleTouchEnd() {
    isDragging = false;
}

function preventDefaultTouch(e) {
    e.preventDefault();
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
        Camera: (${cameraX.toFixed(2)}, ${cameraY.toFixed(2)})<br>
        Zoom: ${zoomLevel.toFixed(2)}x<br>
        Current Chunk: (${currentChunkX}, ${currentChunkY})<br>
        Loaded Chunks: ${chunkManager.loadedChunks.size}<br>
        Recently Unloaded: ${chunkManager.recentlyUnloaded.size}
    `;
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
