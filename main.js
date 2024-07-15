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
let mobileUIController;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let targetZoomLevel = 1;
let targetCameraX = 0;
let targetCameraY = 0;
let isHoldingE = false;
let mousePosition = { x: 0, y: 0 };

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

    cameraX = ufo.x - canvas.width / 2;
    cameraY = ufo.y - canvas.height / 2;

    chunkManager.updateViewport(cameraX, cameraY);

    if (isMobile) {
        mobileUIController = new MobileUIController(canvas, ufo);
        mobileUIController.onZoomIn = zoomIn;
        mobileUIController.onZoomOut = zoomOut;
    }

    render();
    setupControls();
    setupDebugInfo();
}

function setupControls() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyboardZoom);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    document.body.addEventListener('touchmove', preventDefaultTouch, { passive: false });
}

function handleKeyDown(e) {
    keys.add(e.key.toLowerCase());
    if (e.key.toLowerCase() === 'e') {
        isHoldingE = true;
        toggleBeam();
    }
    updateUFOMovement();
}

function handleKeyUp(e) {
    keys.delete(e.key.toLowerCase());
    if (e.key.toLowerCase() === 'e') {
        isHoldingE = false;
    }
    updateUFOMovement();
}

function updateUFOMovement() {
    let dx = 0, dy = 0;
    if (keys.has('w') || keys.has('arrowup')) dy -= 1;
    if (keys.has('s') || keys.has('arrowdown')) dy += 1;
    if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
    if (keys.has('d') || keys.has('arrowright')) dx += 1;
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        dx /= Math.sqrt(2);
        dy /= Math.sqrt(2);
    }
    
    ufo.move(dx, dy);
}

function handleWheel(e) {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY);
    
    if (ufo.beam.isActive && isHoldingE) {
        // Adjust beam length
        if (delta > 0) {
            ufo.beam.increaseLength();
        } else {
            ufo.beam.decreaseLength();
        }
        console.log(`Beam length adjusted: ${ufo.beam.length}`);
    } else {
        // Zoom in/out
        const zoomSpeed = 0.1;
        const zoomDelta = delta * zoomSpeed;
        targetZoomLevel = Math.max(0.5, Math.min(4, targetZoomLevel + zoomDelta));
        console.log(`Zoom level adjusted: ${targetZoomLevel.toFixed(2)}`);
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mousePosition.x = (e.clientX - rect.left) / zoomLevel + cameraX;
    mousePosition.y = (e.clientY - rect.top) / zoomLevel + cameraY;
}

function handleMouseClick(e) {
    if (ufo.beam.isActive) {
        const ufoPos = ufo.getPosition();
        const dx = mousePosition.x - ufoPos.x;
        const dy = mousePosition.y - ufoPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        ufo.setBeamDirection(dx / distance, dy / distance);
        ufo.setBeamLength(distance);
        
        console.log(`Beam directed to (${dx.toFixed(2)}, ${dy.toFixed(2)}), length: ${distance.toFixed(2)}`);
    }
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

function toggleBeam() {
    ufo.toggleBeam();
    console.log(`Beam ${ufo.beam.isActive ? 'activated' : 'deactivated'}`);
}

function handleKeyboardZoom(e) {
    if (e.key === '=' || e.key === '+') {
        zoomIn();
    } else if (e.key === '-' || e.key === '_') {
        zoomOut();
    }
}

function zoomIn() {
    targetZoomLevel = Math.min(targetZoomLevel * 1.1, 4);
    console.log(`Zooming in. Target zoom level: ${targetZoomLevel.toFixed(2)}`);
}

function zoomOut() {
    targetZoomLevel = Math.max(targetZoomLevel / 1.1, 0.5);
    console.log(`Zooming out. Target zoom level: ${targetZoomLevel.toFixed(2)}`);
}

function setupDebugInfo() {
    if (!isMobile) {
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
}

function updateDebugInfo() {
    if (isMobile) return;

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

function render() {
    ufo.update();
    updateUFOMovement();

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
        joystick.draw();
        mobileUIController.draw();
    }

    renderer.drawChunkBoundaries(Array.from(chunkManager.loadedChunks.values()));

    chunkManager.updateViewport(cameraX, cameraY);
    updateDebugInfo();

    requestAnimationFrame(render);
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
