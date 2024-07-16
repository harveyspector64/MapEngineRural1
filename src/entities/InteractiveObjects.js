// src/entities/InteractiveObjects.js

import { TILES } from '../features/TerrainGenerator.js';

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
    }

    update(deltaTime) {
        if (!this.isBeingAbducted) {
            this.updateAI(deltaTime);
        }
        // Apply velocity (for throwing physics)
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        // Apply friction
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
    }

    updateAI(deltaTime) {
        // Implement basic AI here (e.g., cow grazing)
        if (this.type === OBJECT_TYPES.COW) {
            // Simple random movement for cows
            if (Math.random() < 0.01) {
                this.velocity.x = (Math.random() - 0.5) * 0.5;
                this.velocity.y = (Math.random() - 0.5) * 0.5;
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
        this.objects.get(chunkKey).push(object);
    }

    getObjectsInChunk(chunkKey) {
        return this.objects.get(chunkKey) || [];
    }

    updateObjects(deltaTime, chunkKey) {
        const chunkObjects = this.getObjectsInChunk(chunkKey);
        chunkObjects.forEach(obj => obj.update(deltaTime));
    }

    removeObject(object, chunkKey) {
        const chunkObjects = this.getObjectsInChunk(chunkKey);
        const index = chunkObjects.indexOf(object);
        if (index !== -1) {
            chunkObjects.splice(index, 1);
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
