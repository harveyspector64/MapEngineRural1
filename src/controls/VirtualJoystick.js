
// src/controls/VirtualJoystick.js

export default class VirtualJoystick {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.baseX = 0;
        this.baseY = 0;
        this.stickX = 0;
        this.stickY = 0;
        this.active = false;
        this.maxDistance = 50;
    }

    start(x, y) {
        this.active = true;
        this.baseX = x;
        this.baseY = y;
        this.stickX = x;
        this.stickY = y;
    }

    move(x, y) {
        if (!this.active) return;
        
        const dx = x - this.baseX;
        const dy = y - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.maxDistance) {
            this.stickX = this.baseX + (dx / distance) * this.maxDistance;
            this.stickY = this.baseY + (dy / distance) * this.maxDistance;
        } else {
            this.stickX = x;
            this.stickY = y;
        }
    }

    end() {
        this.active = false;
    }

    getInput() {
        if (!this.active) return { dx: 0, dy: 0 };
        
        const dx = this.stickX - this.baseX;
        const dy = this.stickY - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return {
            dx: dx / this.maxDistance,
            dy: dy / this.maxDistance
        };
    }

    draw() {
        if (!this.active) return;
        
        this.ctx.beginPath();
        this.ctx.arc(this.baseX, this.baseY, this.maxDistance, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(this.stickX, this.stickY, 20, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fill();
    }
}
