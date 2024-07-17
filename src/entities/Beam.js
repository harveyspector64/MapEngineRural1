// src/entities/Beam.js

export default class Beam {
    constructor(ufo) {
        this.ufo = ufo;
        this.isActive = false;
        this.direction = { x: 0, y: 1 }; // Default direction is down
        this.minLength = 64; // Minimum beam length in pixels
        this.maxLength = 320; // Maximum beam length in pixels
        this.length = this.minLength; // Current beam length
        this.retractionSpeed = 100; // pixels per second
        this.expansionSpeed = 200; // pixels per second
        this.targetLength = 0;
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }

    setDirection(dx, dy) {
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length !== 0) {
            this.direction = { x: dx / length, y: dy / length };
        }
    }

    setLength(length) {
        this.targetLength = Math.max(0, Math.min(length, this.maxLength));
    }

    getEndPoint() {
        const ufoPos = this.ufo.getPosition();
        return {
            x: ufoPos.x + this.direction.x * this.length,
            y: ufoPos.y + this.direction.y * this.length
        };
    }

    increaseLength() {
        this.targetLength = Math.min(this.targetLength + 5, this.maxLength);
    }

    decreaseLength() {
        this.targetLength = Math.max(this.targetLength - 5, this.minLength);
    }

    update(deltaTime) {
        if (this.length < this.targetLength) {
            this.length = Math.min(this.length + this.expansionSpeed * deltaTime / 1000, this.targetLength);
        } else if (this.length > this.targetLength) {
            this.length = Math.max(this.length - this.retractionSpeed * deltaTime / 1000, this.targetLength);
        }

        if (this.length === 0) {
            this.isActive = false;
        }
    }
}
