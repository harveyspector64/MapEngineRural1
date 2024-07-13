// main.js
import ChunkManager from './src/core/ChunkManager.js';
import Renderer from './src/rendering/Renderer.js';
import { TILES } from './src/features/TerrainGenerator.js';
import WorldManager from './src/core/WorldManager.js';
import UFO from './src/entities/UFO.js';

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
let lastTouchDistance = 0;
let ufo;

async function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const availableSprites = [
        'barn', 'bush', 'crop', 'dirt', 'grass', 'road', 'silo', 'tree', 'water'
    ];

    await renderer.loadSprites(availableSprites);

    worldManager = new WorldManager(Math.random());
    chunkManager = new ChunkManager(canvas.width, canvas.height);
    
    ufo = new UFO(canvas.width / 2, canvas.height / 2);

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
    
    renderer.renderUFO(ufo);
    
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

    // Mobile UFO controls
    setupMobileControls();
}

function handleKeyDown(e) {
    const moveDistance = 16 / zoomLevel;
    switch(e.key) {
        case 'ArrowUp': 
            ufo.move(0, -1);
            cameraY -= moveDistance; 
            break;
        case 'ArrowDown': 
            ufo.move(0, 1);
            cameraY += moveDistance; 
            break;
        case 'ArrowLeft': 
            ufo.move(-1, 0);
            cameraX -= moveDistance; 
            break;
        case 'ArrowRight': 
            ufo.move(1, 0);
            cameraX += moveDistance; 
            break;
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
    chunkManager.setZoom(zoomLevel);
    chunkManager.updateViewport(cameraX, cameraY);
    updateDebugInfo();
}

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        isDragging = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        // Start of pinch, record initial distance
        lastTouchDistance = getTouchDistance(e.touches);
    }
}

function handleTouchMove(e) {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
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
    } else if (e.touches.length === 2) {
        // Pinch-to-zoom
        const currentDistance = getTouchDistance(e.touches);
        const distanceDelta = currentDistance - lastTouchDistance;
        
        // Adjust zoom based on pinch gesture
        const zoomDelta = distanceDelta * 0.005;
        const newZoom = Math.max(0.5, Math.min(4, zoomLevel + zoomDelta));
        
        // Calculate the midpoint of the two touches
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        
        // Zoom towards the midpoint of the pinch
        const rect = canvas.getBoundingClientRect();
        const canvasMidX = midX - rect.left;
        const canvasMidY = midY - rect.top;
        
        cameraX += (canvasMidX / zoomLevel - canvasMidX / newZoom);
        cameraY += (canvasMidY / zoomLevel - canvasMidY / newZoom);
        
        zoomLevel = newZoom;
        renderer.setZoom(zoomLevel);
        chunkManager.setZoom(zoomLevel);
        chunkManager.updateViewport(cameraX, cameraY);
        updateDebugInfo();
        
        lastTouchDistance = currentDistance;
    }
}

function handleTouchEnd() {
    isDragging = false;
    lastTouchDistance = 0;
}

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function preventDefaultTouch(e) {
    e.preventDefault();
}

function setupMobileControls() {
    const controlsDiv = document.createElement('div');
    controlsDiv.id = 'mobile-controls';
    controlsDiv.style.position = 'absolute';
    controlsDiv.style.bottom = '20px';
    controlsDiv.style.left = '50%';
    controlsDiv.style.transform = 'translateX(-50%)';
    controlsDiv.style.display = 'flex';
    controlsDiv.style.justifyContent = 'center';
    controlsDiv.style.alignItems = 'center';

    const directions = ['up', 'down', 'left', 'right'];
    directions.forEach(direction => {
        const button = document.createElement('button');
        button.textContent = direction;
        button.style.margin = '0 10px';
        button.style.padding = '20px';
        button.style.fontSize = '24px';
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            moveUFO(direction);
        });
        controlsDiv.appendChild(button);
    });

    document.body.appendChild(controlsDiv);
}

function moveUFO(direction) {
    const moveDistance = 16 / zoomLevel;
    switch(direction) {
        case 'up':
            ufo.move(0, -1);
            cameraY -= moveDistance;
            break;
        case 'down':
            ufo.move(0, 1);
            cameraY += moveDistance;
            break;
        case 'left':
            ufo.move(-1, 0);
            cameraX -= moveDistance;
            break;
        case 'right':
            ufo.move(1, 0);
            cameraX += moveDistance;
            break;
    }
    chunkManager.updateViewport(cameraX, cameraY);
    updateDebugInfo();
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
    const ufoPos = ufo.getPosition();
    debugDiv.innerHTML = `
        Camera: (${cameraX.toFixed(2)}, ${cameraY.toFixed(2)})<br>
        UFO: (${ufoPos.x.toFixed(2)}, ${ufoPos.y.toFixed(2)})<br>
        Zoom: ${zoomLevel.toFixed(2)}x<br>
        Current Chunk: (${currentChunkX}, ${currentChunkY})<br>
        Loaded Chunks: ${chunkManager.loadedChunks.size}<br>
        Recently Unloaded: ${chunkManager.recentlyUnloaded.size}
    `;
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
