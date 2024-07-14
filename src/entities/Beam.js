// src/entities/Beam.js

export default class Beam {
    constructor(ufo) {
        this.ufo = ufo;
        this.isActive = false;
        this.direction = { x: 0, y: 1 }; // Default direction is down
        this.length = 64; // Length of the beam in pixels
    }

    // Activate the beam
    activate() {
        this.isActive = true;
    }

    // Deactivate the beam
    deactivate() {
        this.isActive = false;
    }

    // Toggle beam activation
    toggle() {
        this.isActive = !this.isActive;
    }

    // Set the direction of the beam
    setDirection(dx, dy) {
        this.direction = { x: dx, y: dy };
    }

    // Get the end point of the beam
    getEndPoint() {
        const ufoPos = this.ufo.getPosition();
        return {
            x: ufoPos.x + this.direction.x * this.length,
            y: ufoPos.y + this.direction.y * this.length
        };
    }
}
