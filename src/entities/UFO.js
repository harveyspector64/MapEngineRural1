// src/entities/UFO.js

export default class UFO {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.sprite = null; // We'll load this in the Renderer
    }

    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }
}
