// main.js
// This script manages the main game loop, user input, and coordinates various game components

import ChunkManager from './src/core/ChunkManager.js';
import Renderer from './src/rendering/Renderer.js';
import { TILES } from './src/features/TerrainGenerator.js';
import WorldManager from './src/core/WorldManager.js';
import UFO from './src/entities/UFO.js';
import VirtualJoystick from './src/controls/VirtualJoystick.js';
import MobileUIController from './src/controls/MobileUIController.js';

// Get the canvas element and create a renderer
const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

// Declare variables for game components and state
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
let mousePosition = { x: 0, y: 0 };
let isMouseDown = false;
let lastTimestamp = 0;

// Set to store currently pressed keys
const keys = new Set();

// Initialize the game
async function init() {
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Define available sprite types
    const availableSprites = [
        'barn', 'bush', 'crop', 'dirt', 'grass', 'road', 'silo', 'tree', 'water',
        'man1', 'canoe1', 'emptycanoe1', 'cow1', 'cow2', 'blackcow1'
    ];

    // Load sprites
    await renderer.loadSprites(availableSprites);

    // Initialize game components
    worldManager = new WorldManager(Math.random());
    chunkManager = new ChunkManager(canvas.width, canvas.height);
    
    ufo = new UFO(canvas.width / 2, canvas.height / 2);
    joystick = new VirtualJoystick(canvas);

    // Set initial camera position
    cameraX = ufo.x - canvas.width / 2;
    cameraY = ufo.y - canvas.height / 2;

    // Update the viewport
    chunkManager.updateViewport(cameraX, cameraY);

    // Initialize mobile UI if on a mobile device
    if (isMobile) {
        mobileUIController = new MobileUIController(canvas, ufo);
        mobileUIController.onZoomIn = zoomIn;
        mobileUIController.onZoomOut = zoomOut;
    }

    // Start the game loop
    requestAnimationFrame(gameLoop);

    // Set up event listeners
    setupControls();
    // Set up debug information display
    setupDebugInfo();
}

// Set up event listeners for user input
function setupControls() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyboardZoom);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    document.body.addEventListener('touchmove', preventDefaultTouch, { passive: false });
}

// Handle key press events
function handleKeyDown(e) {
    keys.add(e.key.toLowerCase());
    updateUFOMovement();
}

// Handle key release events
function handleKeyUp(e) {
    keys.delete(e.key.toLowerCase());
    updateUFOMovement();

    // Handle beam deactivation and NPC release
    if (e.key === ' ') { // Space key
        ufo.deactivateBeam();
        ufo.releaseNPC();
    }
}

// Update UFO movement based on pressed keys
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

// Handle mouse wheel events for zooming
function handleWheel(e) {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY);
    const zoomSpeed = 0.1;
    const zoomDelta = delta * zoomSpeed;
    targetZoomLevel = Math.max(0.5, Math.min(4, targetZoomLevel + zoomDelta));
    console.log(`Zoom level adjusted: ${targetZoomLevel.toFixed(2)}`);
}

// Handle mouse button press
function handleMouseDown(e) {
    isMouseDown = true;
    updateBeamFromMouse(e);
}

// Handle mouse movement
function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mousePosition.x = (e.clientX - rect.left) / zoomLevel + cameraX;
    mousePosition.y = (e.clientY - rect.top) / zoomLevel + cameraY;

    if (isMouseDown) {
        updateBeamFromMouse(e);
    }
}

// Handle mouse button release
function handleMouseUp(e) {
    isMouseDown = false;
    ufo.deactivateBeam();
    console.log('Beam deactivated');
}

// Update beam position and length based on mouse position
function updateBeamFromMouse(e) {
    const ufoPos = ufo.getPosition();
    const dx = mousePosition.x - ufoPos.x;
    const dy = mousePosition.y - ufoPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Define the UFO's radius (adjust this value as needed)
    const ufoRadius = 16;  // Assuming the UFO sprite is 32x32 pixels

    if (distance > ufoRadius) {
        // Beam is outside the UFO
        ufo.setBeamDirection(dx / distance, dy / distance);
        ufo.setBeamLength(distance - ufoRadius);
        ufo.activateBeam();
        console.log(`Beam activated and directed to (${dx.toFixed(2)}, ${dy.toFixed(2)}), length: ${(distance - ufoRadius).toFixed(2)}`);
    } else {
        // Beam is inside or at the edge of the UFO
        ufo.setBeamLength(0);
        ufo.deactivateBeam();
        console.log('Beam fully retracted');
    }
}

// Handle touch start events
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

// Handle touch move events
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

// Handle touch end events
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

// Calculate distance between two touch points
function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Prevent default touch behavior
function preventDefaultTouch(e) {
    e.preventDefault();
}

// Handle keyboard zoom events
function handleKeyboardZoom(e) {
    if (e.key === '=' || e.key === '+') {
        zoomIn();
    } else if (e.key === '-' || e.key === '_') {
        zoomOut();
    }
}

// Zoom in function
function zoomIn() {
    targetZoomLevel = Math.min(targetZoomLevel * 1.1, 4);
    console.log(`Zooming in. Target zoom level: ${targetZoomLevel.toFixed(2)}`);
}

// Zoom out function
function zoomOut() {
    targetZoomLevel = Math.max(targetZoomLevel / 1.1, 0.5);
    console.log(`Zooming out. Target zoom level: ${targetZoomLevel.toFixed(2)}`);
}

// Set up debug information display
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

// Update debug information
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
        Recently Unloaded: ${chunkManager.recentlyUnloaded.size}<br>
        Beam Active: ${ufo.beam.isActive}<br>
        Beam Length: ${ufo.beam.length.toFixed(2)}<br>
        Captured NPC: ${ufo.capturedNPC ? ufo.capturedNPC.type : 'None'}
    `;
}

// Main game loop
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    ufo.update(deltaTime);
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
            // Update NPCs in the chunk
            if (chunk.npcs) {
                chunk.npcs.forEach(npc => npc.update(deltaTime));
            }
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

    // Check for UFO beam interactions
    if (ufo.beam.isActive && !ufo.capturedNPC) {
        const interactionRadius = 10; // Adjust as needed
        visibleChunks.forEach(({x, y}) => {
            const chunk = chunkManager.getChunk(x, y);
            if (chunk && chunk.npcs) {
                chunk.npcs.forEach(npc => {
                    const dx = (chunk.x * chunkManager.chunkSize + npc.x) - ufo.beam.getEndPoint().x;
                    const dy = (chunk.y * chunkManager.chunkSize + npc.y) - ufo.beam.getEndPoint().y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < interactionRadius) {
                        ufo.captureNPC(npc);
                        if (npc.type === 'canoe') {
                            npc.sprite = 'emptycanoe1';
                            const man = new NPC('man', npc.x, npc.y);
                            man.sprite = 'man1';
                            chunk.npcs.push(man);
                            ufo.captureNPC(man);
                        }
                    }
                });
            }
        });
    }

    updateDebugInfo();

    requestAnimationFrame(gameLoop);
}

// Event listeners for game initialization and window resizing
window.addEventListener('load', init);
window.addEventListener('resize', init);
