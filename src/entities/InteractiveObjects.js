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
            // Apply velocity
            this.x += this.velocity.x * deltaTime;
            this.y += this.velocity.y * deltaTime;

            // Apply rotation
            this.rotation += this.angularVelocity * deltaTime;

            // Apply friction (slows down movement over time)
            const friction = 0.95;
            this.velocity.x *= friction;
            this.velocity.y *= friction;
            this.angularVelocity *= friction;

            // Limit maximum speed
            const maxSpeed = 200; // Adjust as needed
            const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
            if (speed > maxSpeed) {
                this.velocity.x = (this.velocity.x / speed) * maxSpeed;
                this.velocity.y = (this.velocity.y / speed) * maxSpeed;
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

    // Add a method for basic AI movement (e.g., for cows)
    moveRandomly(deltaTime) {
        if (Math.random() < 0.02) { // 2% chance to change direction each update
            const angle = Math.random() * Math.PI * 2;
            const speed = 20; // Adjust for desired movement speed
            this.velocity.x = Math.cos(angle) * speed;
            this.velocity.y = Math.sin(angle) * speed;
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
        this.objects.get(chunkKey).push(object);
    }

    getObjectsInChunk(chunkKey) {
        return this.objects.get(chunkKey) || [];
    }

    updateObjects(deltaTime, chunkKey) {
        const chunkObjects = this.getObjectsInChunk(chunkKey);
        chunkObjects.forEach(obj => {
            obj.update(deltaTime);
            if (obj.type === OBJECT_TYPES.COW) {
                obj.moveRandomly(deltaTime);
            }
        });
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
