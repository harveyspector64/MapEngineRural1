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
            console.log(`Object ${this.type} updated: position (${this.x.toFixed(2)}, ${this.y.toFixed(2)}), velocity (${this.velocity.x.toFixed(2)}, ${this.velocity.y.toFixed(2)})`);

            // Check for terrain collision
            Physics.checkTerrainCollision(this, getTerrain, tileSize);

            // Check if object has moved to a new chunk
            return this.checkChunkTransition(tileSize);
        }
        return false;
    }

    checkChunkTransition(tileSize) {
        const chunkSize = 64 * tileSize;
        const currentChunk = {
            x: Math.floor(this.x / chunkSize),
            y: Math.floor(this.y / chunkSize)
        };

        if (!this.lastChunk || 
            this.lastChunk.x !== currentChunk.x || 
            this.lastChunk.y !== currentChunk.y) {
            if (isFinite(this.x) && isFinite(this.y)) {
                console.log(`Object ${this.type} moved from chunk ${JSON.stringify(this.lastChunk)} to ${JSON.stringify(currentChunk)}`);
                const oldChunk = this.lastChunk;
                this.lastChunk = currentChunk;
                return { oldChunk, newChunk: currentChunk };
            } else {
                console.warn(`Object ${this.type} at invalid position: (${this.x}, ${this.y}). Attempting to recover.`);
                this.x = Math.max(Physics.WORLD_BOUNDS.minX, Math.min(this.x || 0, Physics.WORLD_BOUNDS.maxX));
                this.y = Math.max(Physics.WORLD_BOUNDS.minY, Math.min(this.y || 0, Physics.WORLD_BOUNDS.maxY));
                this.velocity = { x: 0, y: 0 };
                this.lastChunk = currentChunk;
                return { oldChunk: null, newChunk: currentChunk };
            }
        }
        return null;
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
        chunkObjects.forEach(obj => {
            const chunkTransition = obj.update(deltaTime, getTerrain, tileSize);
            if (chunkTransition) {
                const { oldChunk, newChunk } = chunkTransition;
                if (oldChunk) {
                    const oldChunkKey = `${oldChunk.x},${oldChunk.y}`;
                    this.removeObject(obj, oldChunkKey);
                }
                const newChunkKey = `${newChunk.x},${newChunk.y}`;
                this.addObject(obj, newChunkKey);
            }
        });
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

    getAllObjects() {
        return Array.from(this.objects.values()).flat();
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
