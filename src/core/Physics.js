// src/core/Physics.js

export default class Physics {
    static MAX_VELOCITY = 500;
    static FRICTION = 0.98;
    static WORLD_BOUNDS = {
        minX: -100000,
        maxX: 100000,
        minY: -100000,
        maxY: 100000
    };

    static applyThrow(object, velocity, deltaTime) {
        // Apply throw velocity
        object.x += velocity.x * deltaTime;
        object.y += velocity.y * deltaTime;

        // Apply friction
        velocity.x *= Math.pow(this.FRICTION, deltaTime * 60);
        velocity.y *= Math.pow(this.FRICTION, deltaTime * 60);

        // Cap velocity
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        if (speed > this.MAX_VELOCITY) {
            const scale = this.MAX_VELOCITY / speed;
            velocity.x *= scale;
            velocity.y *= scale;
        }

        // Keep object within world bounds
        object.x = Math.max(this.WORLD_BOUNDS.minX, Math.min(object.x, this.WORLD_BOUNDS.maxX));
        object.y = Math.max(this.WORLD_BOUNDS.minY, Math.min(object.y, this.WORLD_BOUNDS.maxY));

        // Apply rotation based on velocity
        object.rotation = Math.atan2(velocity.y, velocity.x);

        return { x: object.x, y: object.y, rotation: object.rotation, velocity: velocity };
    }

    static checkTerrainCollision(object, getTerrain, tileSize) {
        const tileX = Math.floor(object.x / tileSize);
        const tileY = Math.floor(object.y / tileSize);

        // Check surrounding tiles
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkX = tileX + dx;
                const checkY = tileY + dy;

                const tile = getTerrain(checkX, checkY);
                if (tile && tile !== 'grass' && tile !== 'dirt' && tile !== 'crop') {
                    // Collision detected, adjust position and reverse velocity
                    const bounceReduction = 0.5;
                    object.velocity.x *= -bounceReduction;
                    object.velocity.y *= -bounceReduction;
                    object.x += object.velocity.x * 0.1;
                    object.y += object.velocity.y * 0.1;
                    return true;
                }
            }
        }
        return false;
    }

    static updateNPCMovement(npc, deltaTime, getTerrain, tileSize) {
        if (!npc || !npc.isMoving) return;

        const speed = npc.moveSpeed * deltaTime;
        const newX = npc.x + Math.cos(npc.moveDirection) * speed;
        const newY = npc.y + Math.sin(npc.moveDirection) * speed;

        if (!this.checkTerrainCollision({ x: newX, y: newY, velocity: { x: 0, y: 0 } }, getTerrain, tileSize)) {
            npc.x = newX;
            npc.y = newY;
        } else {
            npc.moveDirection = Math.random() * Math.PI * 2;
        }

        if (Math.random() < 0.02) {
            npc.moveDirection = Math.random() * Math.PI * 2;
        }

        npc.rotation = npc.moveDirection;
    }
}
