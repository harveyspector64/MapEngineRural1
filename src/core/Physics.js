// src/core/Physics.js

export default class Physics {
    static MAX_THROW_VELOCITY = 1000; // Maximum throw velocity
    static FRICTION = 0.98; // Friction coefficient
    static AIR_RESISTANCE = 0.995; // Air resistance coefficient

    static applyThrow(object, velocity, deltaTime) {
        // Cap the velocity
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        if (speed > this.MAX_VELOCITY) {
            const scale = this.MAX_VELOCITY / speed;
            velocity.x *= scale;
            velocity.y *= scale;
        }

        // Apply throw velocity
        object.x += velocity.x * deltaTime;
        object.y += velocity.y * deltaTime;

        // Apply friction and air resistance
        velocity.x *= Math.pow(this.FRICTION * this.AIR_RESISTANCE, deltaTime * 60);
        velocity.y *= Math.pow(this.FRICTION * this.AIR_RESISTANCE, deltaTime * 60);

        // Apply rotation based on velocity
        object.rotation += (Math.abs(velocity.x) + Math.abs(velocity.y)) * 0.01;

        // Ensure rotation stays within 0-360 degrees
        object.rotation = object.rotation % (2 * Math.PI);

        return { x: object.x, y: object.y, rotation: object.rotation, velocity: velocity };
    }

    static checkTerrainCollision(object, getTerrain, tileSize) {
        if (!object || typeof object.x !== 'number' || typeof object.y !== 'number') {
            console.warn('Invalid object passed to checkTerrainCollision:', object);
            return false;
        }

        const tileX = Math.floor(object.x / tileSize);
        const tileY = Math.floor(object.y / tileSize);

        // Check surrounding tiles
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkX = tileX + dx;
                const checkY = tileY + dy;

                const tile = getTerrain(checkX, checkY);
                if (tile) {
                    if (tile === 'water') {
                        // Object lands on water
                        object.x = (tileX + 0.5) * tileSize;
                        object.y = (tileY + 0.5) * tileSize;
                        object.velocity = { x: 0, y: 0 };
                        return true;
                    } else if (tile !== 'grass' && tile !== 'dirt' && tile !== 'crop') {
                        // Object collides with non-passable terrain
                        const bounceReduction = 0.5;
                        object.velocity.x *= -bounceReduction;
                        object.velocity.y *= -bounceReduction;
                        // Adjust position to prevent sticking
                        object.x += object.velocity.x * 0.1;
                        object.y += object.velocity.y * 0.1;
                        return true;
                    }
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

        // Check if the new position is valid (not colliding with obstacles)
        if (!this.checkTerrainCollision({ x: newX, y: newY, velocity: { x: 0, y: 0 } }, getTerrain, tileSize)) {
            npc.x = newX;
            npc.y = newY;
        } else {
            // If collision occurred, change direction
            npc.moveDirection = Math.random() * Math.PI * 2;
        }

        // Randomly change direction occasionally
        if (Math.random() < 0.02) {
            npc.moveDirection = Math.random() * Math.PI * 2;
        }

        // Apply slight rotation for visual interest
        npc.rotation += (Math.random() - 0.5) * 0.1;
        npc.rotation = npc.rotation % (2 * Math.PI);
    }
}
