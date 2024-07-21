// src/entities/Beam.js

import Physics from '../core/Physics.js';

export default class Beam {
    constructor(ufo) {
        this.ufo = ufo;
        this.isActive = false;
        this.direction = { x: 0, y: 1 };
        this.minLength = 0;
        this.maxLength = 320;
        this.length = this.minLength;
        this.capturedObject = null;
        this.captureStrength = 0.2;
        this.ufoRadius = 16; // Assuming UFO sprite is 32x32 pixels
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
        this.releaseObject();
    }

    setDirection(dx, dy) {
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length !== 0) {
            this.direction = { x: dx / length, y: dy / length };
        }
    }

    setLength(length) {
        this.length = Math.max(this.minLength, Math.min(length, this.maxLength));
    }

    getEndPoint() {
        const ufoPos = this.ufo.getPosition();
        return {
            x: ufoPos.x + this.direction.x * this.length,
            y: ufoPos.y + this.direction.y * this.length
        };
    }

    captureObject(object) {
        if (!this.capturedObject) {
            this.capturedObject = object;
            this.capturedObject.isBeingAbducted = true;
            console.log("Object captured:", object);
        }
    }

    releaseObject(throwVelocity = { x: 0, y: 0 }) {
        if (this.capturedObject) {
            console.log("Object released:", this.capturedObject);
            this.capturedObject.isBeingAbducted = false;
            
            // Apply throw velocity
            this.capturedObject.velocity.x = throwVelocity.x;
            this.capturedObject.velocity.y = throwVelocity.y;
            
            const releasedObject = this.capturedObject;
            this.capturedObject = null;
            return releasedObject;
        }
        return null;
    }

    update(deltaTime) {
        if (this.capturedObject) {
            const endPoint = this.getEndPoint();
            
            // Update captured object's position to match beam end point
            this.capturedObject.x = endPoint.x;
            this.capturedObject.y = endPoint.y;

            const ufoPos = this.ufo.getPosition();
            const distToUfo = Math.sqrt(
                Math.pow(this.capturedObject.x - ufoPos.x, 2) +
                Math.pow(this.capturedObject.y - ufoPos.y, 2)
            );

            // Check if object is fully retracted
            if (distToUfo <= this.ufoRadius && this.length <= this.minLength) {
                console.log("Object fully retracted into UFO");
                if (this.ufo.eatObject(this.capturedObject)) {
                    console.log("Object eaten by UFO");
                    if (typeof this.onObjectEaten === 'function') {
                        this.onObjectEaten(this.capturedObject);
                    }
                    this.capturedObject = null;
                }
            }
        }

        // Update beam length based on UFO movement
        if (this.isActive) {
            const ufoVelocity = this.ufo.getVelocity();
            const velocityMagnitude = Math.sqrt(ufoVelocity.x * ufoVelocity.x + ufoVelocity.y * ufoVelocity.y);
            const lengthChange = velocityMagnitude * deltaTime * 0.5; // Adjust this factor to change beam responsiveness
            this.setLength(this.length + lengthChange);
        }
    }

    increaseLength() {
        this.setLength(this.length + 5);
    }

    decreaseLength() {
        this.setLength(this.length - 5);
    }
}
