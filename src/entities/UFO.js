// src/entities/UFO.js

export default class UFO {
    constructor(x, y, speed = 5) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.sprite = null;
        this.rotation = 0;
        
    }

    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
        if (dx !== 0 || dy !== 0) {
            this.rotation = Math.atan2(dy, dx);
            }
        }
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}
