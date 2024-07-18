// src/entities/Beam.js

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
            const ufoPos = this.ufo.getPosition();
            const objPos = this.capturedObject.getPosition();
            const distToUfo = Math.sqrt(
                Math.pow(objPos.x - ufoPos.x, 2) + Math.pow(objPos.y - ufoPos.y, 2)
            );

            if (distToUfo <= this.ufoRadius && this.length <= this.minLength) {
                if (this.ufo.eatObject(this.capturedObject)) {
                    console.log("Object eaten by UFO");
                    this.capturedObject = null;
                    return null;
                }
            }

            console.log("Object released:", this.capturedObject);
            this.capturedObject.isBeingAbducted = false;
            
            // Apply throw velocity
            this.capturedObject.velocity = {
                x: throwVelocity.x,
                y: throwVelocity.y
            };
            
            const releasedObject = this.capturedObject;
            this.capturedObject = null;
            return releasedObject;
        }
        return null;
    }

    update(deltaTime) {
        if (this.capturedObject) {
            const ufoPos = this.ufo.getPosition();
            const targetX = ufoPos.x + this.direction.x * this.length;
            const targetY = ufoPos.y + this.direction.y * this.length;

            const lerpFactor = 1 - Math.pow(1 - this.captureStrength, deltaTime * 60);
            this.capturedObject.x += (targetX - this.capturedObject.x) * lerpFactor;
            this.capturedObject.y += (targetY - this.capturedObject.y) * lerpFactor;

            const distToUfo = Math.sqrt(
                Math.pow(this.capturedObject.x - ufoPos.x, 2) +
                Math.pow(this.capturedObject.y - ufoPos.y, 2)
            );

            // Check if object is fully retracted
            if (distToUfo <= this.ufoRadius && this.length <= this.minLength) {
                console.log("Object fully retracted into UFO");
                if (typeof this.onObjectAbducted === 'function') {
                    this.onObjectAbducted(this.capturedObject);
                }
                this.capturedObject = null;
            }
        }
    }

    increaseLength() {
        this.setLength(this.length + 5);
    }

    decreaseLength() {
        this.setLength(this.length - 5);
    }
}
