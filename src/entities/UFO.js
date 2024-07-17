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
        this.capturedNPC = null;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;
        if (this.vx !== 0 || this.vy !== 0) {
            this.rotation = Math.atan2(this.vy, this.vx);
        }

        this.beam.update(deltaTime);

        if (this.capturedNPC) {
            this.capturedNPC.x = this.x + this.beam.direction.x * this.beam.length;
            this.capturedNPC.y = this.y + this.beam.direction.y * this.beam.length;
        }
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

    captureNPC(npc) {
        this.capturedNPC = npc;
        if (npc.type === 'canoe') {
            npc.sprite = 'man1';
        }
    }

    releaseNPC() {
        if (this.capturedNPC) {
            // Apply momentum when releasing
            const momentum = 5; // Adjust as needed
            this.capturedNPC.direction = {
                x: this.beam.direction.x * momentum,
                y: this.beam.direction.y * momentum
            };
            this.capturedNPC = null;
        }
    }
}
