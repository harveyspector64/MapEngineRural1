// src/entities/Beam.js

export default class Beam {
    constructor(ufo) {
        this.ufo = ufo;
        this.isActive = false;
        this.direction = { x: 0, y: 1 }; // Default direction is down
        this.minLength = 64; // Minimum beam length in pixels
        this.maxLength = 320; // Maximum beam length in pixels
        this.length = this.minLength; // Current beam length
        this.lengthChangeRate = 2; // Pixels to change per update
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }

    toggle() {
        this.isActive = !this.isActive;
    }

    setDirection(dx, dy) {
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length !== 0) {
            this.direction = { x: dx / length, y: dy / length };
        }
    }

    increaseLength() {
        this.length = Math.min(this.length + this.lengthChangeRate, this.maxLength);
    }

    decreaseLength() {
        this.length = Math.max(this.length - this.lengthChangeRate, this.minLength);
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
}
