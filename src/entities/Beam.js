// src/entities/Beam.js

export default class Beam {
    constructor(ufo) {
        this.ufo = ufo;
        this.isActive = false;
        this.direction = { x: 0, y: 1 }; // Default direction is down
        this.minLength = 64; // Minimum beam length in pixels
        this.maxLength = 320; // Maximum beam length in pixels
        this.length = this.minLength; // Current beam length
        this.capturedObject = null;
        this.capturePoint = { x: 0, y: 0 }; // Point where object is captured in beam
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
        this.updateCapturedObjectPosition();
    }

    setLength(length) {
        this.length = Math.max(this.minLength, Math.min(length, this.maxLength));
        this.updateCapturedObjectPosition();
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
            this.capturedObject.isBeingAbducted = false;
            // Apply throwing velocity
            const throwSpeed = 10; // Adjust as needed
            this.capturedObject.velocity = {
                x: this.direction.x * throwSpeed,
                y: this.direction.y * throwSpeed
            };
            this.capturedObject = null;
        }
    }

    updateCapturedObjectPosition() {
        if (this.capturedObject) {
            const ufoPos = this.ufo.getPosition();
            const newPos = {
                x: ufoPos.x + this.direction.x * this.length * this.capturePoint.x,
                y: ufoPos.y + this.direction.y * this.length * this.capturePoint.y
            };
            this.capturedObject.setPosition(newPos.x, newPos.y);
        }
    }

    update() {
        this.updateCapturedObjectPosition();
        if (this.capturedObject && this.length <= this.minLength) {
            console.log("Object fully retracted into UFO");
            this.capturedObject = null;
        }
    }
