// src/entities/UFO.js
import Beam from './Beam.js';

export default class UFO {
    constructor(x, y, speed = 5) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.rotation = 0;
        this.vx = 0;
        this.vy = 0;
        this.actualVx = 0;
        this.actualVy = 0;
        this.acceleration = 0.99;
        this.maxSpeed = 35;
        this.friction = 0.82;
        this.beam = new Beam(this);
        this.radius = 16; // Assuming UFO sprite is 32x32 pixels
        this.isFlashing = false;
        this.eatenObjects = []; // New property to store eaten objects
    }

    update(deltaTime) {
        const oldX = this.x;
        const oldY = this.y;
        
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Calculate actual velocity based on position change
        this.actualVx = (this.x - oldX) / deltaTime;
        this.actualVy = (this.y - oldY) / deltaTime;
        
        if (this.vx !== 0 || this.vy !== 0) {
            this.rotation = Math.atan2(this.vy, this.vx);
        }
        this.beam.update(deltaTime);
    }

    move(dx, dy) {
        this.vx += dx * this.acceleration;
        this.vy += dy * this.acceleration;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            const ratio = this.maxSpeed / speed;
            this.vx *= ratio;
            this.vy *= ratio;
        }
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getVelocity() {
        return { x: this.actualVx, y: this.actualVy };
    }

    activateBeam() {
        this.beam.activate();
    }

    deactivateBeam() {
        this.beam.deactivate();
    }

    setBeamDirection(dx, dy) {
        this.beam.setDirection(dx, dy);
    }

    setBeamLength(length) {
        this.beam.setLength(length);
    }

    eatObject(object) {
        console.log("UFO ate object:", object);
        this.eatenObjects.push(object);
        this.flashEffect();
        // You can add any additional effects or scoring here
    }

        canEatObject(object) {
        const distance = Math.sqrt(
            Math.pow(object.x - this.x, 2) + Math.pow(object.y - this.y, 2)
        );
        return distance <= this.radius;
    }

    flashEffect() {
        this.isFlashing = true;
        setTimeout(() => {
            this.isFlashing = false;
        }, 200); // Flash for 200ms
    }
}
