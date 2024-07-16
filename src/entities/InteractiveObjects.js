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
        this.isMoving = false;
        this.moveDirection = Math.random() * Math.PI * 2;
        this.moveSpeed = 5 + Math.random() * 5; // 5-10 pixels per second
    }

    update(deltaTime) {
        if (!this.isBeingAbducted) {
            if (this.type === OBJECT_TYPES.CANOE && this.isMoving) {
                this.x += Math.cos(this.moveDirection) * this.moveSpeed * deltaTime;
                this.y += Math.sin(this.moveDirection) * this.moveSpeed * deltaTime;

                // Randomly change direction occasionally
                if (Math.random() < 0.01) {
                    this.moveDirection = Math.random() * Math.PI * 2;
                }
            }

            // Apply velocity (for throwing physics)
            this.x += this.velocity.x * deltaTime;
            this.y += this.velocity.y * deltaTime;
            
            // Apply friction
            const friction = 0.98;
            this.velocity.x *= friction;
            this.velocity.y *= friction;

            // Apply rotation
            this.rotation += this.angularVelocity * deltaTime;
            this.angularVelocity *= friction;
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
