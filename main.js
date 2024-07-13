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

const UFO_SPEED = 3; // Adjust this value to change UFO speed
const CAMERA_LERP = 0.1; // Adjust this value to change camera smoothness (0-1)

async function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const availableSprites = [
        'barn', 'bush', 'crop', 'dirt', 'grass', 'road', 'silo', 'tree', 'water'
    ];

    await renderer.loadSprites(availableSprites);

    worldManager = new WorldManager(Math.random());
    chunkManager = new ChunkManager(canvas.width, canvas.height);
    
    ufo = new UFO(canvas.width / 2, canvas.height / 2, UFO_SPEED);
    cameraX = ufo.x - canvas.width / 2;
    cameraY = ufo.y - canvas.height / 2;

    chunkManager.updateViewport(cameraX, cameraY);

    render();
    setupControls();
    setupDebugInfo();
}

function render() {
    // Smoothly move camera towards UFO
    const targetCameraX = ufo.x - canvas.width / 2;
    const targetCameraY = ufo.y - canvas.height / 2;
    cameraX += (targetCameraX - cameraX) * CAMERA_LERP;
    cameraY += (targetCameraY - cameraY) * CAMERA_LERP;

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
    
    renderer.drawChunkBoundaries(Array.from(chunkManager.loadedChunks.values()));

    chunkManager.updateViewport(cameraX, cameraY);
    updateDebugInfo();

    requestAnimationFrame(render);
}

function setupControls() {
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    document.body.addEventListener('touchmove', preventDefaultTouch, { passive: false });
}

function handleKeyDown(e) {
    switch(e.key) {
        case 'ArrowUp': ufo.move(0, -1); break;
        case 'ArrowDown': ufo.move(0, 1); break;
        case 'ArrowLeft': ufo.move(-1, 0); break;
        case 'ArrowRight': ufo.move(1, 0); break;
    }
}

function handleWheel(e) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const zoomDelta = -Math.sign(e.deltaY) * zoomSpeed;
    const newZoom = Math.max(0.5, Math.min(4, zoomLevel + zoomDelta));
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    cameraX += (mouseX / zoomLevel - mouseX / newZoom);
    cameraY += (mouseY / zoomLevel - mouseY / newZoom);
    
    zoomLevel = newZoom;
    renderer.setZoom(zoomLevel);
    chunkManager.setZoom(zoomLevel);
}

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        isDragging = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
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

        ufo.move(deltaX / UFO_SPEED, deltaY / UFO_SPEED);

        lastTouchX = touchX;
        lastTouchY = touchY;
    } else if (e.touches.length === 2) {
        const currentDistance = getTouchDistance(e.touches);
        const distanceDelta = currentDistance - lastTouchDistance;
        
        const zoomDelta = distanceDelta * 0.005;
        const newZoom = Math.max(0.5, Math.min(4, zoomLevel + zoomDelta));
        
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        
        const rect = canvas.getBoundingClientRect();
        const canvasMidX = midX - rect.left;
        const canvasMidY = midY - rect.top;
        
        cameraX += (canvasMidX / zoomLevel - canvasMidX / newZoom);
        cameraY += (canvasMidY / zoomLevel - canvasMidY / newZoom);
        
        zoomLevel = newZoom;
        renderer.setZoom(zoomLevel);
        chunkManager.setZoom(zoomLevel);
        
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
