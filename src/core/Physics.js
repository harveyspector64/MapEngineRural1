// src/core/Physics.js

export default class Physics {
    static applyThrow(object, velocity, deltaTime) {
        // Apply throw velocity
        object.x += velocity.x * deltaTime;
        object.y += velocity.y * deltaTime;

        // Apply minimal "gravity" (more like friction) for top-down perspective
        const friction = 0.5; // Adjust this value to change the slowdown rate
        velocity.x *= Math.pow(1 - friction, deltaTime);
        velocity.y *= Math.pow(1 - friction, deltaTime);

        // Apply rotation based on velocity
        object.rotation += (Math.abs(velocity.x) + Math.abs(velocity.y)) * 0.01;

        // Gradually slow down the object
        const slowdown = 0.99;
        velocity.x *= Math.pow(slowdown, deltaTime * 60);
        velocity.y *= Math.pow(slowdown, deltaTime * 60);

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
                        object.rotation = 0;
                        return true;
                    } else if (tile !== 'grass' && tile !== 'dirt' && tile !== 'crop') {
                        // Object collides with non-passable terrain
                        const bounceReduction = 0.7;
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
    }
}
