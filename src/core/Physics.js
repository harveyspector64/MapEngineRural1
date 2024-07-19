// src/core/Physics.js

export default class Physics {
    static applyThrow(object, velocity, deltaTime) {
        // Apply throw velocity
        object.x += velocity.x * deltaTime;
        object.y += velocity.y * deltaTime;

        // Apply gravity (adjust this value to change the gravity strength)
        const gravity = 9.8 * 50; // Increased for more visible effect
        object.y += 0.5 * gravity * deltaTime * deltaTime;

        // Apply air resistance
        const airResistance = 0.99;
        velocity.x *= Math.pow(airResistance, deltaTime * 60);
        velocity.y *= Math.pow(airResistance, deltaTime * 60);

        // Apply rotation based on velocity
        object.rotation += (Math.abs(velocity.x) + Math.abs(velocity.y)) * 0.01;

        return { x: object.x, y: object.y, rotation: object.rotation };
    }

    static checkTerrainCollision(object, terrain, tileSize) {
        const tileX = Math.floor(object.x / tileSize);
        const tileY = Math.floor(object.y / tileSize);

        // Check surrounding tiles
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkX = tileX + dx;
                const checkY = tileY + dy;

                if (terrain[checkY] && terrain[checkY][checkX]) {
                    const tile = terrain[checkY][checkX];
                    if (tile === 'water') {
                        // Object lands on water
                        object.x = (tileX + 0.5) * tileSize;
                        object.y = (tileY + 0.5) * tileSize;
                        object.velocity = { x: 0, y: 0 };
                        object.rotation = 0;
                        return true;
                    } else if (tile !== 'grass' && tile !== 'dirt' && tile !== 'crop') {
                        // Object collides with non-passable terrain
                        const bounceReduction = 0.5;
                        object.velocity.x *= -bounceReduction;
                        object.velocity.y *= -bounceReduction;
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static updateNPCMovement(npc, deltaTime, terrain, tileSize) {
        if (npc.isMoving) {
            const speed = npc.moveSpeed * deltaTime;
            const newX = npc.x + Math.cos(npc.moveDirection) * speed;
            const newY = npc.y + Math.sin(npc.moveDirection) * speed;

            // Check if the new position is valid (not colliding with obstacles)
            if (!this.checkTerrainCollision({ x: newX, y: newY }, terrain, tileSize)) {
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
}
