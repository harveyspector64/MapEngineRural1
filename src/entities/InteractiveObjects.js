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
        this.mass = this.getMassByType(type);
    }

    getMassByType(type) {
        switch (type) {
            case OBJECT_TYPES.COW: return 500; // kg
            case OBJECT_TYPES.CANOE: return 100; // kg
            case OBJECT_TYPES.EMPTY_CANOE: return 80; // kg
            case OBJECT_TYPES.FISHERMAN: return 70; // kg
            default: return 50; // kg
        }
    }

    update(deltaTime, getTerrain, tileSize) {
        if (!this.isBeingAbducted) {
            if (this.type === OBJECT_TYPES.CANOE || this.type === OBJECT_TYPES.COW) {
                Physics.updateNPCMovement(this, deltaTime, getTerrain, tileSize);
            }

            // Apply environmental effects (e.g., wind, water current)
            this.applyEnvironmentalEffects(deltaTime, getTerrain, tileSize);

            // Apply throwing physics
            const updatedPosition = Physics.applyThrow(this, this.velocity, deltaTime);
            this.x = updatedPosition.x;
            this.y = updatedPosition.y;
            this.rotation = updatedPosition.rotation;

            // Check for terrain collision
            Physics.checkTerrainCollision(this, getTerrain, tileSize);
        }
    }

    applyEnvironmentalEffects(deltaTime, getTerrain, tileSize) {
        const tileX = Math.floor(this.x / tileSize);
        const tileY = Math.floor(this.y / tileSize);
        const tile = getTerrain(tileX, tileY);

        if (tile === 'water' && this.type === OBJECT_TYPES.CANOE) {
            // Apply water current
            const currentStrength = 10; // Adjust as needed
            this.x += Math.cos(this.rotation) * currentStrength * deltaTime;
            this.y += Math.sin(this.rotation) * currentStrength * deltaTime;
        }

        // Apply wind effect (you can make this more complex based on weather conditions)
        const windStrength = 5; // Adjust as needed
        const windDirection = Math.PI / 4; // 45 degrees, adjust as needed
        this.x += Math.cos(windDirection) * windStrength * deltaTime;
        this.y += Math.sin(windDirection) * windStrength * deltaTime;
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
