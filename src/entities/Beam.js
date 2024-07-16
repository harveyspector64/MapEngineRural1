// src/entities/Beam.js

export default class Beam {
    constructor(ufo) {
        this.ufo = ufo;
        this.isActive = false;
        this.direction = { x: 0, y: 1 };
        this.minLength = 64;
        this.maxLength = 320;
        this.length = this.minLength;
        this.capturedObject = null;
        this.capturePoint = { x: 0, y: 0 };
        this.captureStrength = 0.1; // Adjust this value to change how "sticky" the beam is
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
            // Set initial capture point
            const ufoPos = this.ufo.getPosition();
            const objectPos = object.getPosition();
            this.capturePoint = {
                x: (objectPos.x - ufoPos.x) / this.length,
                y: (objectPos.y - ufoPos.y) / this.length
            };
        }
    }

    releaseObject() {
        if (this.capturedObject) {
            const throwSpeed = 500; // Adjust this value to change throw speed
            this.capturedObject.velocity = {
                x: this.direction.x * throwSpeed,
                y: this.direction.y * throwSpeed
            };
            this.capturedObject.isBeingAbducted = false;
            this.capturedObject = null;
        }
    }

    update(deltaTime) {
        if (this.capturedObject) {
            const ufoPos = this.ufo.getPosition();
            const targetX = ufoPos.x + this.direction.x * this.length * this.capturePoint.x;
            const targetY = ufoPos.y + this.direction.y * this.length * this.capturePoint.y;

            // Smoothly move the object towards the target position
            this.capturedObject.x += (targetX - this.capturedObject.x) * this.captureStrength;
            this.capturedObject.y += (targetY - this.capturedObject.y) * this.captureStrength;

            // Check if object is fully retracted
            const distToUfo = Math.sqrt(
                Math.pow(this.capturedObject.x - ufoPos.x, 2) +
                Math.pow(this.capturedObject.y - ufoPos.y, 2)
            );

            if (distToUfo <= this.minLength) {
                console.log("Object fully retracted into UFO");
                this.capturedObject.isBeingAbducted = false;
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
