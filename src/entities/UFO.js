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
            const beamEnd = this.beam.getEndPoint();
            this.capturedNPC.x = beamEnd.x;
            this.capturedNPC.y = beamEnd.y;

            // Check if NPC is close enough to be "eaten"
            const distToUFO = Math.sqrt((this.x - beamEnd.x) ** 2 + (this.y - beamEnd.y) ** 2);
            if (distToUFO < 16) { // 16 is half the UFO's width
                this.eatNPC();
            }
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
        if (this.capturedNPC) {
            this.releaseNPC();
        }
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
            const throwForce = 10; // Adjust as needed
            this.capturedNPC.vx = this.beam.direction.x * throwForce + this.vx;
            this.capturedNPC.vy = this.beam.direction.y * throwForce + this.vy;
            this.capturedNPC = null;
        }
    }

    eatNPC() {
        console.log(`NPC ${this.capturedNPC.type} has been captured by the UFO!`);
        // Here you might want to add some score or trigger some event
        this.capturedNPC = null;
    }
}
