// src/entities/InteractiveObjects.js

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
        this.angularVelocity = 0;
    }

update(deltaTime) {
    if (!this.isBeingAbducted) {
        const oldX = this.x;
        const oldY = this.y;
        
        // Apply velocity
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
        // Apply friction (air resistance)
        const friction = 0.99;
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        
        if (Math.abs(this.x - oldX) > 0.01 || Math.abs(this.y - oldY) > 0.01) {
            console.log(`Object ${this.type} moved from (${oldX.toFixed(2)}, ${oldY.toFixed(2)}) to (${this.x.toFixed(2)}, ${this.y.toFixed(2)})`);
            console.log(`Current velocity: (${this.velocity.x.toFixed(2)}, ${this.velocity.y.toFixed(2)})`);
        }
    }
}

    handleWorldBoundaries() {
        const worldBoundary = 10000; // Adjust based on your world size
        const bounceFactor = 0.8; // How much velocity is retained after bouncing

        if (Math.abs(this.x) > worldBoundary) {
            this.x = Math.sign(this.x) * worldBoundary;
            this.velocity.x *= -bounceFactor;
        }
        if (Math.abs(this.y) > worldBoundary) {
            this.y = Math.sign(this.y) * worldBoundary;
            this.velocity.y *= -bounceFactor;
        }
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

        checkGroundCollision(groundY) {
        if (this.y > groundY) {
            this.y = groundY;
            this.velocity.y *= -0.6; // Bounce factor
            this.angularVelocity += this.velocity.x * 0.1; // Add spin based on horizontal velocity
            this.velocity.x *= 0.8; // Friction with ground
        }
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
        const chunkObjects = this.objects.get(chunkKey);
        if (!chunkObjects.includes(object)) {
            chunkObjects.push(object);
            console.log(`Object added to chunk ${chunkKey}:`, object);
        } else {
            console.log(`Object already in chunk ${chunkKey}:`, object);
        }
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
