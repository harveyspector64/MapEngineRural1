// src/core/Physics.js

import { OBJECT_TYPES } from '../entities/InteractiveObjects.js';

export default class Physics {
    static applyThrow(object, velocity, deltaTime) {
        // Apply throw velocity
        object.x += velocity.x * deltaTime;
        object.y += velocity.y * deltaTime;

        // Apply friction based on object type and terrain
        const frictionCoefficient = this.getFrictionCoefficient(object.type);
        velocity.x *= Math.pow(frictionCoefficient, deltaTime * 60);
        velocity.y *= Math.pow(frictionCoefficient, deltaTime * 60);

        // Apply rotation based on velocity
        object.rotation += (Math.abs(velocity.x) + Math.abs(velocity.y)) * 0.01;

        return { x: object.x, y: object.y, rotation: object.rotation };
    }

    static getFrictionCoefficient(objectType) {
        switch (objectType) {
            case OBJECT_TYPES.COW: return 0.95;
            case OBJECT_TYPES.CANOE: return 0.99; // Less friction for water
            case OBJECT_TYPES.EMPTY_CANOE: return 0.99;
            case OBJECT_TYPES.FISHERMAN: return 0.9;
            default: return 0.98;
        }
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

    static updateNPCMovement(npc, deltaTime, getTerrain, tileSize) {
        if (!npc || !npc.isMoving) return;

        const speed = npc.moveSpeed * deltaTime;
        let newX = npc.x + Math.cos(npc.moveDirection) * speed;
        let newY = npc.y + Math.sin(npc.moveDirection) * speed;

        // Check if the new position is valid (not colliding with obstacles)
        const tileX = Math.floor(newX / tileSize);
        const tileY = Math.floor(newY / tileSize);
        const tile = getTerrain(tileX, tileY);

        if (tile && (tile === 'grass' || tile === 'dirt' || tile === 'crop')) {
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

        // Apply smooth rotation based on movement direction
        const targetRotation = Math.atan2(Math.sin(npc.moveDirection), Math.cos(npc.moveDirection));
        const rotationDiff = targetRotation - npc.rotation;
        npc.rotation += rotationDiff * 0.1; // Adjust this value to change rotation speed
    }

    static applyBeamForce(object, ufoPosition, beamStrength, deltaTime) {
        const dx = ufoPosition.x - object.x;
        const dy = ufoPosition.y - object.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const forceMagnitude = beamStrength / (distance * distance);
            const forceX = (dx / distance) * forceMagnitude;
            const forceY = (dy / distance) * forceMagnitude;
            
            // Apply force based on object mass
            object.velocity.x += (forceX / object.mass) * deltaTime;
            object.velocity.y += (forceY / object.mass) * deltaTime;
            
            // Add slight wobble
            const wobbleStrength = 0.5;
            object.velocity.x += (Math.random() - 0.5) * wobbleStrength;
            object.velocity.y += (Math.random() - 0.5) * wobbleStrength;
        }
    }
}
