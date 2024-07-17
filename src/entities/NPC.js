// src/entities/NPC.js

export class NPC {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.state = 'idle';
        this.movementTimer = 0;
        this.movementInterval = Math.random() * 5000 + 2000; // Random interval between 2-7 seconds
        this.speed = 0.5;
        this.direction = { x: 0, y: 0 };
    }

    update(deltaTime) {
        this.movementTimer += deltaTime;

        if (this.movementTimer >= this.movementInterval) {
            this.movementTimer = 0;
            this.changeState();
        }

        if (this.state === 'moving') {
            this.x += this.direction.x * this.speed * deltaTime / 1000;
            this.y += this.direction.y * this.speed * deltaTime / 1000;
        }
    }

    changeState() {
        if (this.state === 'idle') {
            this.state = 'moving';
            this.direction = {
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1
            };
            // Normalize direction
            const magnitude = Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2);
            this.direction.x /= magnitude;
            this.direction.y /= magnitude;
        } else {
            this.state = 'idle';
            this.direction = { x: 0, y: 0 };
        }
    }
}

export class Cow extends NPC {
    constructor(x, y) {
        super('cow', x, y);
        this.sprite = Math.random() < 0.2 ? 'blackcow1' : (Math.random() < 0.5 ? 'cow1' : 'cow2');
    }
}

export class Canoe extends NPC {
    constructor(x, y) {
        super('canoe', x, y);
        this.sprite = 'canoe1';
        this.speed = 0.2; // Slower speed for canoes
    }

    update(deltaTime) {
        super.update(deltaTime);
        // Add slight oscillation to simulate water movement
        this.y += Math.sin(Date.now() / 1000) * 0.01;
    }
}
