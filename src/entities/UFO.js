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
        this.acceleration = 0.99;
        this.maxSpeed = 35;
        this.friction = 0.82;
        this.beam = new Beam(this);
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vx *= this.friction;
        this.vy *= this.friction;
        if (this.vx !== 0 || this.vy !== 0) {
            this.rotation = Math.atan2(this.vy, this.vx);
        }
        this.beam.update();
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

    captureObject(object) {
        this.beam.captureObject(object);
    }

    releaseObject() {
        this.beam.releaseObject();
    }
}
