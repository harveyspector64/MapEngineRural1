// In src/core/Physics.js

export default class Physics {
    static MAX_VELOCITY = 1000;
    static FRICTION = 0.98;
    static AIR_RESISTANCE = 0.995;

    static applyThrow(object, initialVelocity, deltaTime) {
        // Apply initial velocity
        object.x += initialVelocity.x * deltaTime;
        object.y += initialVelocity.y * deltaTime;

        // Apply air resistance
        object.velocity = {
            x: object.velocity.x * Math.pow(this.AIR_RESISTANCE, deltaTime * 60),
            y: object.velocity.y * Math.pow(this.AIR_RESISTANCE, deltaTime * 60)
        };

        // Apply friction if object is on the ground
        if (this.isOnGround(object)) {
            object.velocity.x *= Math.pow(this.FRICTION, deltaTime * 60);
            object.velocity.y *= Math.pow(this.FRICTION, deltaTime * 60);
        }

        // Update position based on current velocity
        object.x += object.velocity.x * deltaTime;
        object.y += object.velocity.y * deltaTime;

        // Cap velocity
        const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
        if (speed > this.MAX_VELOCITY) {
            const scale = this.MAX_VELOCITY / speed;
            object.velocity.x *= scale;
            object.velocity.y *= scale;
        }

        // Update rotation based on movement direction
        if (speed > 1) {
            object.rotation = Math.atan2(object.velocity.y, object.velocity.x);
        }

        return {
            x: object.x,
            y: object.y,
            rotation: object.rotation,
            velocity: object.velocity
        };
    }

    static isOnGround(object) {
        // Implement ground detection logic here
        // For now, we'll assume objects are always on the ground in this 2D top-down view
        return true;
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
