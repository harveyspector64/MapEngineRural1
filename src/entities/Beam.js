// src/entities/Beam.js

export default class Beam {
    constructor(ufo) {
        this.ufo = ufo;
        this.isActive = false;
        this.direction = { x: 0, y: 1 };
        this.minLength = 0;
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
            this.captureStrength = 0.2;  // Increased from 0.1 for stronger hold
        }
    }


    releaseObject() {
        if (this.capturedObject) {
            const throwSpeed = 500; // Base throw speed
            const ufoVelocity = this.ufo.getVelocity(); // Assume UFO class has a getVelocity method
            
            // Combine beam direction, throw speed, and UFO velocity
            this.capturedObject.velocity = {
                x: this.direction.x * throwSpeed + ufoVelocity.x,
                y: this.direction.y * throwSpeed + ufoVelocity.y
            };
            
            this.capturedObject.isBeingAbducted = false;
            this.capturedObject = null;
        }
    }
}

    update(deltaTime) {
        if (this.capturedObject) {
            const ufoPos = this.ufo.getPosition();
            const targetX = ufoPos.x + this.direction.x * this.length;
            const targetY = ufoPos.y + this.direction.y * this.length;

            // Use deltaTime for smoother movement
            const lerpFactor = 1 - Math.pow(1 - this.captureStrength, deltaTime * 60);
            this.capturedObject.x += (targetX - this.capturedObject.x) * lerpFactor;
            this.capturedObject.y += (targetY - this.capturedObject.y) * lerpFactor;

            // Check if object is fully retracted
            const distToUfo = Math.sqrt(
                Math.pow(this.capturedObject.x - ufoPos.x, 2) +
                Math.pow(this.capturedObject.y - ufoPos.y, 2)
            );

            if (distToUfo <= 16) {  // Assuming UFO radius is 16
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
