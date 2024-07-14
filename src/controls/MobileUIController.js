// src/controls/MobileUIController.js

export default class MobileUIController {
    constructor(canvas, ufo) {
        this.canvas = canvas;
        this.ufo = ufo;
        this.ctx = canvas.getContext('2d');
        this.isExpanded = false;
        this.beamControlButton = { x: 20, y: 20, radius: 30 };
        this.zoomInButton = { x: canvas.width - 70, y: canvas.height - 70, width: 50, height: 50 };
        this.zoomOutButton = { x: canvas.width - 70, y: canvas.height - 130, width: 50, height: 50 };
    }

    draw() {
        this.drawBeamControlButton();
        this.drawZoomButtons();
        if (this.isExpanded) {
            this.drawExpandedControls();
        }
    }

    drawBeamControlButton() {
        this.ctx.beginPath();
        this.ctx.arc(this.beamControlButton.x, this.beamControlButton.y, this.beamControlButton.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'white';
        this.ctx.stroke();
        
        // Draw an icon or text to indicate beam control
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('B', this.beamControlButton.x - 6, this.beamControlButton.y + 7);
    }

    drawZoomButtons() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.strokeStyle = 'white';
        
        // Zoom In button
        this.ctx.fillRect(this.zoomInButton.x, this.zoomInButton.y, this.zoomInButton.width, this.zoomInButton.height);
        this.ctx.strokeRect(this.zoomInButton.x, this.zoomInButton.y, this.zoomInButton.width, this.zoomInButton.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.fillText('+', this.zoomInButton.x + 17, this.zoomInButton.y + 35);
        
        // Zoom Out button
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fillRect(this.zoomOutButton.x, this.zoomOutButton.y, this.zoomOutButton.width, this.zoomOutButton.height);
        this.ctx.strokeRect(this.zoomOutButton.x, this.zoomOutButton.y, this.zoomOutButton.width, this.zoomOutButton.height);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('-', this.zoomOutButton.x + 20, this.zoomOutButton.y + 35);
    }

    drawExpandedControls() {
        // Implement expanded beam controls here
        // This will include the beam direction control and length slider
    }

    handleTouch(x, y) {
        if (this.isPointInCircle(x, y, this.beamControlButton)) {
            this.isExpanded = !this.isExpanded;
            return true;
        }

        if (this.isPointInRect(x, y, this.zoomInButton)) {
            // Implement zoom in
            return true;
        }

        if (this.isPointInRect(x, y, this.zoomOutButton)) {
            // Implement zoom out
            return true;
        }

        if (this.isExpanded) {
            // Handle touches in the expanded control area
            return true;
        }

        return false;
    }

    isPointInCircle(x, y, circle) {
        const dx = x - circle.x;
        const dy = y - circle.y;
        return dx * dx + dy * dy <= circle.radius * circle.radius;
    }

    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }
}
