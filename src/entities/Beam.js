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
        this.mode = 'scan'; // Default mode
        this.availableModes = ['scan', 'abduct', 'mutilate', 'crop-circle'];
        this.direction = { x: 0, y: 1 }; // Default direction is down
        
        console.log('Beam initialized');
    }

    // Activate the beam
    activate() {
        this.isActive = true;
        console.log('Beam activated');
    }

    // Deactivate the beam
    deactivate() {
        this.isActive = false;
        console.log('Beam deactivated');
    }

    // Toggle beam activation
    toggle() {
        this.isActive = !this.isActive;
        console.log(`Beam ${this.isActive ? 'activated' : 'deactivated'}`);
    }

    // Set the direction of the beam
    setDirection(dx, dy) {
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length !== 0) {
            this.direction = { x: dx / length, y: dy / length };
            console.log(`Beam direction set to: (${this.direction.x.toFixed(2)}, ${this.direction.y.toFixed(2)})`);
        }
    }

    // Increase beam length
    increaseLength() {
        this.length = Math.min(this.length + this.lengthChangeRate, this.maxLength);
        console.log(`Beam length increased to: ${this.length}`);
    }

    // Decrease beam length
    decreaseLength() {
        this.length = Math.max(this.length - this.lengthChangeRate, this.minLength);
        console.log(`Beam length decreased to: ${this.length}`);
    }

    // Set beam length directly
    setLength(length) {
        this.length = Math.max(this.minLength, Math.min(length, this.maxLength));
        console.log(`Beam length set to: ${this.length}`);
    }

    // Get the end point of the beam
    getEndPoint() {
        const ufoPos = this.ufo.getPosition();
        return {
            x: ufoPos.x + this.direction.x * this.length,
            y: ufoPos.y + this.direction.y * this.length
        };
    }

    // Set beam mode
    setMode(mode) {
        if (this.availableModes.includes(mode)) {
            this.mode = mode;
            console.log(`Beam mode set to: ${this.mode}`);
        } else {
            console.error(`Invalid beam mode: ${mode}`);
        }
    }

// Cycle through available beam modes
    cycleMode() {
        const currentIndex = this.availableModes.indexOf(this.mode);
        const nextIndex = (currentIndex + 1) % this.availableModes.length;
        this.mode = this.availableModes[nextIndex];
        console.log(`Beam mode cycled to: ${this.mode}`);
    }
}
