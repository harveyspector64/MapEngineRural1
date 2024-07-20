// src/entities/InteractiveObjects.js

import Physics from '../core/Physics.js';

export const OBJECT_TYPES = {
    COW: 'cow',
    CANOE: 'canoe',
    EMPTY_CANOE: 'emptyCanoe',
    FISHERMAN: 'fisherman'
};

export class InteractiveObject {
    constructor(type, x, y, sprite) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.isBeingAbducted = false;
        this.velocity = { x: 0, y: 0 };
        this.rotation = 0;
        this.isMoving = type === OBJECT_TYPES.COW || type === OBJECT_TYPES.CANOE;
        this.moveDirection = Math.random() * Math.PI * 2;
        this.moveSpeed = 5 + Math.random() * 5; // 5-10 pixels per second
        this.lastChunk = null;
    }

    update(deltaTime, getTerrain, tileSize) {
        if (!this.isBeingAbducted) {
            if (this.isMoving) {
                Physics.updateNPCMovement(this, deltaTime, getTerrain, tileSize);
            }

            // Apply throwing physics
            const updatedState = Physics.applyThrow(this, this.velocity, deltaTime);
            this.x = updatedState.x;
            this.y = updatedState.y;
            this.rotation = updatedState.rotation;
            this.velocity = updatedState.velocity;

            // Check for terrain collision
            Physics.checkTerrainCollision(this, getTerrain, tileSize);

            // Check if object has moved to a new chunk
            this.checkChunkTransition(tileSize);
        }
    }

    checkChunkTransition(tileSize) {
        const chunkSize = 64 * tileSize; // Assuming 64 tiles per chunk
        const currentChunk = {
            x: Math.floor(this.x / chunkSize),
            y: Math.floor(this.y / chunkSize)
        };

        if (!this.lastChunk || 
            this.lastChunk.x !== currentChunk.x || 
            this.lastChunk.y !== currentChunk.y) {
            if (isFinite(currentChunk.x) && isFinite(currentChunk.y)) {
                console.log(`Object ${this.type} moved from chunk ${JSON.stringify(this.lastChunk)} to ${JSON.stringify(currentChunk)}`);
                this.lastChunk = currentChunk;
                // Here you would implement logic to update the object's chunk in your chunk management system
            } else {
                console.warn(`Object ${this.type} moved to an invalid chunk position: ${JSON.stringify(currentChunk)}`);
                // Handle the out-of-bounds object (e.g., remove it or place it back in a valid position)
            }
        }
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }
}

export class InteractiveObjectManager {
    constructor() {
        this.objects = new Map();
    }

    addObject(object, chunkKey) {
        if (!this.objects.has(chunkKey)) {
            this.objects.set(chunkKey, []);
        }
        if (!this.objects.get(chunkKey).includes(object)) {
            this.objects.get(chunkKey).push(object);
            console.log(`Object added to chunk ${chunkKey}:`, object);
        } else {
            console.log(`Object already in chunk ${chunkKey}:`, object);
        }
    }

    getObjectsInChunk(chunkKey) {
        return this.objects.get(chunkKey) || [];
    }

    updateObjects(deltaTime, chunkKey, getTerrain, tileSize) {
        const chunkObjects = this.getObjectsInChunk(chunkKey);
        chunkObjects.forEach(obj => obj.update(deltaTime, getTerrain, tileSize));
    }

    removeObject(object, chunkKey) {
        const chunkObjects = this.getObjectsInChunk(chunkKey);
        const index = chunkObjects.indexOf(object);
        if (index !== -1) {
            chunkObjects.splice(index, 1);
            console.log(`Object removed from chunk ${chunkKey}:`, object);
        } else {
            console.log(`Object not found in chunk ${chunkKey}:`, object);
        }
    }
}

export function createInteractiveObject(type, x, y) {
    let sprite;
    switch (type) {
        case OBJECT_TYPES.COW:
            sprite = Math.random() < 0.2 ? 'blackcow1' : (Math.random() < 0.5 ? 'cow1' : 'cow2');
            break;
        case OBJECT_TYPES.CANOE:
            sprite = 'canoe1';
            break;
        case OBJECT_TYPES.EMPTY_CANOE:
            sprite = 'emptycanoe1';
            break;
        case OBJECT_TYPES.FISHERMAN:
            sprite = 'man1';
            break;
        default:
            throw new Error(`Unknown object type: ${type}`);
    }
    return new InteractiveObject(type, x, y, sprite);
}
