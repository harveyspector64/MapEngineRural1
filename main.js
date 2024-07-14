// main.js
import ChunkManager from './src/core/ChunkManager.js';
import Renderer from './src/rendering/Renderer.js';
import { TILES } from './src/features/TerrainGenerator.js';
import WorldManager from './src/core/WorldManager.js';
import UFO from './src/entities/UFO.js';
import VirtualJoystick from './src/controls/VirtualJoystick.js';
import MobileUIController from './src/controls/MobileUIController.js';

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
let joystick;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let targetZoomLevel = 1;
let targetCameraX = 0;
let targetCameraY = 0;
let mobileUIController;

const keys = new Set();

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
    joystick = new VirtualJoystick(canvas);
    if (isMobile) {
    mobileUIController = new MobileUIController(canvas, ufo);
}
    if (isMobile) {
    mobileUIController = new MobileUIController(canvas, ufo);
    mobileUIController.onZoomIn = zoomIn;
    mobileUIController.onZoomOut = zoomOut;
}

    cameraX = ufo.x - canvas.width / 2;
    cameraY = ufo.y - canvas.height / 2;

    chunkManager.updateViewport(cameraX, cameraY);

    render();
    setupControls();
    setupDebugInfo();
}

function render() {
    ufo.update();

    // Smoothly adjust zoom level
    const zoomLerpFactor = 0.1;
    zoomLevel += (targetZoomLevel - zoomLevel) * zoomLerpFactor;

    // Smoothly adjust camera position
    const cameraLerpFactor = 0.1;
    cameraX += (targetCameraX - cameraX) * cameraLerpFactor;
    cameraY += (targetCameraY - cameraY) * cameraLerpFactor;

    // Update target camera position to follow UFO
    const ufoPos = ufo.getPosition();
    targetCameraX = ufoPos.x - canvas.width / (2 * zoomLevel);
    targetCameraY = ufoPos.y - canvas.height / (2 * zoomLevel);

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
    renderer.drawBeam(ufo);

        if (isMobile) {
        mobileUIController.draw();
    }
    
    if (isMobile) {
        joystick.draw();
    }

    renderer.drawChunkBoundaries(Array.from(chunkManager.loadedChunks.values()));

    chunkManager.updateViewport(cameraX, cameraY);
    updateDebugInfo();

    requestAnimationFrame(render);
}

function setupControls() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    document.body.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    
    // Add these new lines
    window.addEventListener('keydown', handleBeamControls);
    canvas.addEventListener('wheel', handleMouseWheel, { passive: false });
}

function handleBeamControls(e) {
    // Toggle beam with 'B' key
    if (e.key === 'b' || e.key === 'B') {
        ufo.toggleBeam();
        console.log(`Beam ${ufo.beam.isActive ? 'activated' : 'deactivated'}`);
    }

    // Control beam direction and length if active
    if (ufo.beam.isActive) {
        switch(e.key) {
            case 'ArrowUp':
                ufo.setBeamDirection(0, -1);
                console.log('Beam direction: Up');
                break;
            case 'ArrowDown':
                ufo.setBeamDirection(0, 1);
                console.log('Beam direction: Down');
                break;
            case 'ArrowLeft':
                ufo.setBeamDirection(-1, 0);
                console.log('Beam direction: Left');
                break;
            case 'ArrowRight':
                ufo.setBeamDirection(1, 0);
                console.log('Beam direction: Right');
                break;
            case '+':
            case '=':
                ufo.beam.increaseLength();
                console.log(`Beam length increased: ${ufo.beam.length}`);
                break;
            case '-':
                ufo.beam.decreaseLength();
                console.log(`Beam length decreased: ${ufo.beam.length}`);
                break;
        }
    }
}

function handleKeyDown(e) {
    keys.add(e.key);
    updateUFOMovement();
}

function handleKeyUp(e) {
    keys.delete(e.key);
    updateUFOMovement();
}

function handleMouseWheel(e) {
    if (ufo.beam.isActive) {
        if (e.deltaY < 0) {
            ufo.beam.increaseLength();
        } else {
            ufo.beam.decreaseLength();
        }
        console.log(`Beam length adjusted: ${ufo.beam.length}`);
        e.preventDefault();
    }
}

function updateUFOMovement() {
    let dx = 0, dy = 0;
    if (keys.has('ArrowUp')) dy -= 1;
    if (keys.has('ArrowDown')) dy += 1;
    if (keys.has('ArrowLeft')) dx -= 1;
    if (keys.has('ArrowRight')) dx += 1;
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        dx /= Math.sqrt(2);
        dy /= Math.sqrt(2);
    }
    
    ufo.move(dx, dy);
}

function handleWheel(e) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const zoomDelta = -Math.sign(e.deltaY) * zoomSpeed;
    targetZoomLevel = Math.max(0.5, Math.min(4, targetZoomLevel + zoomDelta));
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const ufoPos = ufo.getPosition();
    
    // Calculate the point to zoom towards (80% UFO position, 20% mouse position)
    const zoomTargetX = ufoPos.x * 0.8 + (cameraX + mouseX / zoomLevel) * 0.2;
    const zoomTargetY = ufoPos.y * 0.8 + (cameraY + mouseY / zoomLevel) * 0.2;
    
    // Set target camera position
    targetCameraX = zoomTargetX - (canvas.width / 2) / targetZoomLevel;
    targetCameraY = zoomTargetY - (canvas.height / 2) / targetZoomLevel;
}

function handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (isMobile && mobileUIController.handleTouch(touch.clientX, touch.clientY)) {
            // Touch was handled by mobile UI
            return;
        }
        joystick.start(touch.clientX, touch.clientY);
    } else if (e.touches.length === 2) {
        lastTouchDistance = getTouchDistance(e.touches);
    }
}

function zoomIn() {
    targetZoomLevel = Math.min(targetZoomLevel + 0.1, 4);
    console.log(`Zooming in. New zoom level: ${targetZoomLevel.toFixed(2)}`);
}

function zoomOut() {
    targetZoomLevel = Math.max(targetZoomLevel - 0.1, 0.5);
    console.log(`Zooming out. New zoom level: ${targetZoomLevel.toFixed(2)}`);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (isMobile && mobileUIController.handleMove(touch.clientX, touch.clientY)) {
            // Touch move was handled by mobile UI
            return;
        }
        joystick.move(touch.clientX, touch.clientY);
        const { dx, dy } = joystick.getInput();
        ufo.move(dx, dy);
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
        
        const ufoPos = ufo.getPosition();
        const worldX = (ufoPos.x - cameraX) * zoomLevel + canvasMidX;
        const worldY = (ufoPos.y - cameraY) * zoomLevel + canvasMidY;
        
        zoomLevel = newZoom;
        renderer.setZoom(zoomLevel);
        chunkManager.setZoom(zoomLevel);
        
        cameraX = ufoPos.x - worldX / zoomLevel + canvasMidX / zoomLevel;
        cameraY = ufoPos.y - worldY / zoomLevel + canvasMidY / zoomLevel;
        
        lastTouchDistance = currentDistance;
    }
}

function handleTouchEnd(e) {
    if (e.touches.length === 0) {
        joystick.end();
        if (isMobile) {
            mobileUIController.handleEnd();
        }
    }
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
    let debugDiv = document.getElementById('debug-info');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'debug-info';
        debugDiv.style.position = 'absolute';
        debugDiv.style.top = '10px';
        debugDiv.style.left = '10px';
        debugDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        debugDiv.style.color = 'white';
        debugDiv.style.padding = '10px';
        document.body.appendChild(debugDiv);
    }
}

function updateDebugInfo() {
    const debugDiv = document.getElementById('debug-info');
    if (!debugDiv) return;

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
