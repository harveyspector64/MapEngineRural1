// main.js
// This script manages the main game loop, user input, and coordinates various game components

import ChunkManager from './src/core/ChunkManager.js';
import Renderer from './src/rendering/Renderer.js';
import { TILES } from './src/features/TerrainGenerator.js';
import WorldManager from './src/core/WorldManager.js';
import UFO from './src/entities/UFO.js';
import VirtualJoystick from './src/controls/VirtualJoystick.js';
import MobileUIController from './src/controls/MobileUIController.js';
import { InteractiveObjectManager, createInteractiveObject, OBJECT_TYPES } from './src/entities/InteractiveObjects.js';

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
let interactiveObjectManager;
let lastTimestamp = 0;
let lastMousePosition = { x: 0, y: 0 };
let lastMouseMoveTime = 0;
let mouseVelocity = { x: 0, y: 0 };

// Set to store currently pressed keys
const keys = new Set();

// Initialize the game
async function init() {
    console.log("Initializing game...");
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Define available sprite types
    const availableSprites = [
        'barn', 'bush', 'crop', 'dirt', 'grass', 'road', 'silo', 'tree', 'water',
        'cow1', 'cow2', 'blackcow1', 'canoe1', 'man1', 'emptycanoe1', 'ufo'
    ];

    // Load sprites
    await renderer.loadSprites(availableSprites);

    // Initialize game components
    worldManager = new WorldManager(Math.random());
    chunkManager = new ChunkManager(canvas.width, canvas.height);
    ufo.onObjectEaten = handleObjectEaten;
    
    ufo = new UFO(canvas.width / 2, canvas.height / 2);
    setupBeamHandlers(); // Added to fix beam issues
    joystick = new VirtualJoystick(canvas);

    interactiveObjectManager = new InteractiveObjectManager();

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

    // Initialize interactive objects
    initializeInteractiveObjects();

    // Setup beam handlers
    setupBeamHandlers();

    console.log("Game initialized. Starting render loop and setting up controls.");
    // Start the render loop
    requestAnimationFrame(render);
    // Set up event listeners
    setupControls();
    // Set up debug information display
    setupDebugInfo();
}

// Initialize interactive objects in the visible chunks
function initializeInteractiveObjects() {
    console.log("Initializing interactive objects...");
    const initialChunks = chunkManager.getVisibleChunkCoordinates(cameraX, cameraY);
    initialChunks.forEach(({x, y}) => {
        const chunkKey = `${x},${y}`;
        const chunk = chunkManager.getChunk(x, y);
        if (chunk) {
            addObjectsToChunk(chunk, chunkKey);
        }
    });
    console.log("Interactive objects initialized.");
}

// Add interactive objects to a chunk
function addObjectsToChunk(chunk, chunkKey) {
    const chunkSize = chunkManager.chunkSize;
    const tileSize = renderer.tileSize;
    const chunkPixelSize = chunkSize * tileSize;

    // Add cow groups
    const cowGroupChance = 0.4; // 40% chance for a chunk to have cows
    if (Math.random() < cowGroupChance) {
        const groupCount = Math.floor(Math.random() * 2) + 1; // 1-2 groups per chunk
        for (let g = 0; g < groupCount; g++) {
            const groupSize = Math.floor(Math.random() * 3) + 2; // 2-4 cows per group
            const groupX = Math.floor(Math.random() * chunkSize);
            const groupY = Math.floor(Math.random() * chunkSize);
            
            for (let i = 0; i < groupSize; i++) {
                const offsetX = Math.floor(Math.random() * 5) - 2; // -2 to 2
                const offsetY = Math.floor(Math.random() * 5) - 2; // -2 to 2
                const x = (groupX + offsetX + chunkSize) % chunkSize;
                const y = (groupY + offsetY + chunkSize) % chunkSize;
                
                if (chunk.terrain[y][x] === TILES.GRASS) {
                    const worldX = chunk.x * chunkPixelSize + x * tileSize;
                    const worldY = chunk.y * chunkPixelSize + y * tileSize;
                    const cow = createInteractiveObject(OBJECT_TYPES.COW, worldX, worldY);
                    interactiveObjectManager.addObject(cow, chunkKey);
                }
            }
        }
    }

    // Add canoes to water tiles
    let waterTiles = [];
    for (let y = 0; y < chunkSize; y++) {
        for (let x = 0; x < chunkSize; x++) {
            if (chunk.terrain[y][x] === TILES.WATER) {
                waterTiles.push({x, y});
            }
        }
    }

    if (waterTiles.length > 0) {
        const canoeCount = Math.floor(Math.random() * 3) + 1; // 1-3 canoes per lake
        for (let i = 0; i < canoeCount; i++) {
            if (Math.random() < 0.7) { // 70% chance to place a canoe
                const tileIndex = Math.floor(Math.random() * waterTiles.length);
                const {x, y} = waterTiles[tileIndex];
                const worldX = chunk.x * chunkPixelSize + x * tileSize;
                const worldY = chunk.y * chunkPixelSize + y * tileSize;
                const canoe = createInteractiveObject(OBJECT_TYPES.CANOE, worldX, worldY);
                canoe.isMoving = Math.random() < 0.5; // 50% chance for a canoe to be moving
                interactiveObjectManager.addObject(canoe, chunkKey);
            }
        }
    }
}

// Set up event listeners for user input
function setupControls() {
    console.log("Setting up controls...");
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
    canvas.addEventListener('contextmenu', (e) => {
    // Allow right-click to work normally
});
    console.log("Controls set up complete.");
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
// Modify the mousedown event listener
function handleMouseDown(e) {
    if (e.button === 0) { // Left click
        e.preventDefault();
        isMouseDown = true;
        ufo.activateBeam();
        updateBeamFromMouse(e);
    }
}

// Handle mouse movement
function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const currentMousePosition = {
        x: (e.clientX - rect.left) / zoomLevel + cameraX,
        y: (e.clientY - rect.top) / zoomLevel + cameraY
    };

    if (isMouseDown) {
        updateBeamFromMouse(currentMousePosition);
    }

    const currentTime = performance.now();
    const timeDelta = currentTime - lastMouseMoveTime;

    if (timeDelta > 0) {
        mouseVelocity = {
            x: (currentMousePosition.x - lastMousePosition.x) / timeDelta * 1000,
            y: (currentMousePosition.y - lastMousePosition.y) / timeDelta * 1000
        };
    }

    lastMousePosition = currentMousePosition;
    lastMouseMoveTime = currentTime;
}


// Call this function when the beam is deactivated (e.g., in handleMouseUp)
function handleMouseUp(e) {
    isMouseDown = false;
    if (ufo.beam.capturedObject) {
        const ufoPos = ufo.getPosition();
        const objPos = ufo.beam.capturedObject.getPosition();
        const distToUfo = Math.sqrt(
            Math.pow(objPos.x - ufoPos.x, 2) + Math.pow(objPos.y - ufoPos.y, 2)
        );

        if (distToUfo <= ufo.radius && ufo.beam.length <= ufo.beam.minLength) {
            ufo.eatObject(ufo.beam.capturedObject);
            ufo.beam.releaseObject(); // Release the object after eating
        } else {
            const throwVelocity = {
                x: mouseVelocity.x * 0.5,
                y: mouseVelocity.y * 0.5
            };
            const releasedObject = ufo.beam.releaseObject(throwVelocity);
            if (releasedObject) {
                const chunkKey = getChunkKeyForPosition(releasedObject.x, releasedObject.y);
                interactiveObjectManager.addObject(releasedObject, chunkKey);
            }
        }
    }
    ufo.deactivateBeam();
    console.log('Beam deactivated');
}

// Add this function to handle object eating
function handleObjectEaten(object) {
    console.log("Object eaten by UFO:", object);
    if (object && typeof object.x === 'number' && typeof object.y === 'number') {
        const chunkKey = getChunkKeyForPosition(object.x, object.y);
        interactiveObjectManager.removeObject(object, chunkKey);
        console.log("Object removed from game world");
    } else {
        console.error("Invalid object eaten:", object);
    }
}

// Update beam position and length based on mouse position
function updateBeamFromMouse(mousePosition) {
    const ufoPos = ufo.getPosition();
    const dx = mousePosition.x - ufoPos.x;
    const dy = mousePosition.y - ufoPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const ufoRadius = 16;  // Assuming the UFO sprite is 32x32 pixels

    if (distance > ufoRadius) {
        ufo.setBeamDirection(dx / distance, dy / distance);
        ufo.setBeamLength(distance - ufoRadius);
        console.log(`Beam directed to (${dx.toFixed(2)}, ${dy.toFixed(2)}), length: ${(distance - ufoRadius).toFixed(2)}`);
    } else {
        ufo.setBeamLength(0);
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
            debugDiv.style.fontFamily = 'monospace';
            debugDiv.style.fontSize = '12px';
            debugDiv.style.zIndex = '1000';
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
        FPS: ${(1000 / (performance.now() - lastTimestamp)).toFixed(2)}<br>
        Beam Active: ${ufo.beam.isActive}<br>
        Captured Object: ${ufo.beam.capturedObject ? ufo.beam.capturedObject.type : 'None'}
    `;
}

// Main render loop
function render(timestamp) {
    // Calculate delta time
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = (timestamp - lastTimestamp) / 1000; // Convert to seconds
    lastTimestamp = timestamp;

    // Update game state
    ufo.update(deltaTime);
    updateUFOMovement();

    // Smoothly adjust zoom level
    const zoomLerpFactor = 0.1;
    zoomLevel += (targetZoomLevel - zoomLevel) * zoomLerpFactor;

    // Smoothly adjust camera position
    const cameraLerpFactor = 0.1;
    const ufoPos = ufo.getPosition();
    targetCameraX = ufoPos.x - canvas.width / (2 * zoomLevel);
    targetCameraY = ufoPos.y - canvas.height / (2 * zoomLevel);
    cameraX += (targetCameraX - cameraX) * cameraLerpFactor;
    cameraY += (targetCameraY - cameraY) * cameraLerpFactor;

    // Clear the canvas and set camera and zoom
    renderer.clear();
    renderer.setCamera(cameraX, cameraY);
    renderer.setZoom(zoomLevel);

    // Render visible chunks and their objects
    const visibleChunks = chunkManager.getVisibleChunkCoordinates(cameraX, cameraY);
    visibleChunks.forEach(({x, y}) => {
        const chunkKey = `${x},${y}`;
        const chunk = chunkManager.getChunk(x, y);
        if (chunk) {
            renderer.renderChunk(chunk);
            // Update and render interactive objects
            interactiveObjectManager.updateObjects(deltaTime, chunkKey);
            const objects = interactiveObjectManager.getObjectsInChunk(chunkKey);
            objects.forEach(obj => renderer.renderInteractiveObject(obj));
        } else {
            console.warn(`Missing chunk at (${x}, ${y})`);
        }
    });
    
    // Render UFO and beam
    renderer.renderUFO(ufo);
    renderer.drawBeam(ufo);
    
    // Render mobile-specific UI elements
    if (isMobile) {
        joystick.draw();
        mobileUIController.draw();
    }

    // Draw chunk boundaries (for debugging)
    renderer.drawChunkBoundaries(Array.from(chunkManager.loadedChunks.values()));

    // Update chunk manager
    chunkManager.updateViewport(cameraX, cameraY);

    // Check for beam interactions
    checkBeamInteractions();

    // Update debug info
    updateDebugInfo();

    // Request next frame
    requestAnimationFrame(render);
}

// Check for interactions between the beam and interactive objects
function checkBeamInteractions() {
    if (ufo.beam.isActive && !ufo.beam.capturedObject) {
        const beamEnd = ufo.beam.getEndPoint();
        const visibleChunks = chunkManager.getVisibleChunkCoordinates(cameraX, cameraY);
        
        for (const {x, y} of visibleChunks) {
            const chunkKey = `${x},${y}`;
            const objects = interactiveObjectManager.getObjectsInChunk(chunkKey);
            
            for (const obj of objects) {
                const objPos = obj.getPosition();
                const distance = Math.sqrt(
                    Math.pow(objPos.x - beamEnd.x, 2) + Math.pow(objPos.y - beamEnd.y, 2)
                );
                
                if (distance < renderer.tileSize / 2) {  // If object is within capture range
                    if (obj.type === OBJECT_TYPES.CANOE) {
                        // Replace canoe with empty canoe and create fisherman
                        const emptyCanoe = createInteractiveObject(OBJECT_TYPES.EMPTY_CANOE, objPos.x, objPos.y);
                        const fisherman = createInteractiveObject(OBJECT_TYPES.FISHERMAN, objPos.x, objPos.y);
                        interactiveObjectManager.removeObject(obj, chunkKey);
                        interactiveObjectManager.addObject(emptyCanoe, chunkKey);
                        ufo.beam.captureObject(fisherman);
                        interactiveObjectManager.addObject(fisherman, chunkKey);
                        console.log("Fisherman captured:", fisherman);
                    } else {
                        ufo.beam.captureObject(obj);
                    }
                    console.log(`Captured object: ${obj.type}`);
                    return; // Use return instead of break to exit the function
                }
            }
        }
    }
}

function setupBeamHandlers() {
    ufo.beam.onObjectEaten = handleObjectEaten;
    ufo.beam.onObjectReleased = handleObjectReleased;
}

function handleObjectAbducted(object) {
    console.log("Handling abducted object:", object);
    if (object && typeof object.x === 'number' && typeof object.y === 'number') {
        const chunkKey = getChunkKeyForPosition(object.x, object.y);
        interactiveObjectManager.removeObject(object, chunkKey);
        console.log("Object removed from game world");
    } else {
        console.error("Invalid object abducted:", object);
    }
}

function handleObjectReleased(object) {
    console.log("Object released:", object);
    if (object && typeof object.x === 'number' && typeof object.y === 'number') {
        const chunkKey = getChunkKeyForPosition(object.x, object.y);
        interactiveObjectManager.addObject(object, chunkKey);
        console.log("Object added/kept in game world");
    } else {
        console.error("Invalid object released:", object);
    }
}

function handleObjectThrown(object) {
    console.log("Handling thrown object:", object);
    if (object && typeof object.x === 'number' && typeof object.y === 'number') {
        const chunkKey = getChunkKeyForPosition(object.x, object.y);
        interactiveObjectManager.addObject(object, chunkKey);
        console.log("Object added/kept in game world");
    } else {
        console.error("Invalid object thrown:", object);
    }
}

function getChunkKeyForPosition(x, y) {
    const chunkSize = chunkManager.chunkSize * renderer.tileSize;
    const chunkX = Math.floor(x / chunkSize);
    const chunkY = Math.floor(y / chunkSize);
    return `${chunkX},${chunkY}`;
}

// Initialize the game
init();

// Event listeners for game initialization and window resizing
window.addEventListener('load', init);
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderer.setCanvasSize(canvas.width, canvas.height);
});
                
