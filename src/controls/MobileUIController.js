// src/controls/MobileUIController.js

export default class MobileUIController {
    constructor(canvas, ufo) {
        this.canvas = canvas;
        this.ufo = ufo;
        this.ctx = canvas.getContext('2d');
        this.isExpanded = false;
        
        // Define UI element positions
        this.beamControlButton = { x: 20, y: 20, radius: 30 };
        this.zoomInButton = { x: canvas.width - 70, y: canvas.height - 70, width: 50, height: 50 };
        this.zoomOutButton = { x: canvas.width - 70, y: canvas.height - 130, width: 50, height: 50 };
        this.expandedControls = {
            x: 20,
            y: 70,
            width: 200,
            height: 250,
            toggleButton: { x: 120, y: 90, radius: 30 },
            directionPad: { x: 120, y: 170, radius: 50 },
            lengthSlider: { x: 40, y: 240, width: 160, height: 20 },
            modeButton: { x: 40, y: 90, width: 60, height: 30 }
        };
        
        // Touch handling flags
        this.isDraggingDirection = false;
        this.isDraggingLength = false;
        
        // Zoom control
        this.zoomInterval = null;
        this.zoomSpeed = 0.05;
        
        console.log('MobileUIController initialized');
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
        const e = this.expandedControls;
        
        // Draw expanded control background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(e.x, e.y, e.width, e.height);
        
        // Draw beam toggle button
        this.ctx.beginPath();
        this.ctx.arc(e.toggleButton.x, e.toggleButton.y, e.toggleButton.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ufo.beam.isActive ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'white';
        this.ctx.stroke();
        
        // Draw direction pad
        this.ctx.beginPath();
        this.ctx.arc(e.directionPad.x, e.directionPad.y, e.directionPad.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'white';
        this.ctx.stroke();
        
        // Draw current beam direction
        const dirX = e.directionPad.x + this.ufo.beam.direction.x * e.directionPad.radius;
        const dirY = e.directionPad.y + this.ufo.beam.direction.y * e.directionPad.radius;
        this.ctx.beginPath();
        this.ctx.arc(dirX, dirY, 10, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        
        // Draw length slider
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(e.lengthSlider.x, e.lengthSlider.y, e.lengthSlider.width, e.lengthSlider.height);
        
        // Draw slider handle
        const handlePos = e.lengthSlider.x + (this.ufo.beam.length - this.ufo.beam.minLength) / 
                          (this.ufo.beam.maxLength - this.ufo.beam.minLength) * e.lengthSlider.width;
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(handlePos - 5, e.lengthSlider.y - 5, 10, e.lengthSlider.height + 10);

        // Draw mode button
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fillRect(e.modeButton.x, e.modeButton.y, e.modeButton.width, e.modeButton.height);
        this.ctx.strokeStyle = 'white';
        this.ctx.strokeRect(e.modeButton.x, e.modeButton.y, e.modeButton.width, e.modeButton.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(this.ufo.beam.mode, e.modeButton.x + 5, e.modeButton.y + 20);
    }

    handleTouch(x, y) {
        if (this.isPointInCircle(x, y, this.beamControlButton)) {
            this.isExpanded = !this.isExpanded;
            console.log(`Beam control ${this.isExpanded ? 'expanded' : 'collapsed'}`);
            return true;
        }

        if (this.isPointInRect(x, y, this.zoomInButton)) {
            this.startZoom('in');
            return true;
        }

        if (this.isPointInRect(x, y, this.zoomOutButton)) {
            this.startZoom('out');
            return true;
        }

        if (this.isExpanded) {
            const e = this.expandedControls;
            if (this.isPointInCircle(x, y, e.toggleButton)) {
                this.ufo.toggleBeam();
                console.log(`Beam ${this.ufo.beam.isActive ? 'activated' : 'deactivated'}`);
                return true;
            }
            if (this.isPointInCircle(x, y, e.directionPad)) {
                this.isDraggingDirection = true;
                this.handleDirectionTouch(x, y);
                return true;
            }
            if (this.isPointInRect(x, y, e.lengthSlider)) {
                this.isDraggingLength = true;
                this.handleLengthTouch(x);
                return true;
            }
            if (this.isPointInRect(x, y, e.modeButton)) {
                this.ufo.beam.cycleMode();
                console.log(`Beam mode changed to: ${this.ufo.beam.mode}`);
                return true;
            }
        }

        return false;
    }

    handleMove(x, y) {
        if (this.isDraggingDirection) {
            this.handleDirectionTouch(x, y);
            return true;
        }
        if (this.isDraggingLength) {
            this.handleLengthTouch(x);
            return true;
        }
        return false;
    }

    handleEnd() {
        this.stopZoom();
        this.isDraggingDirection = false;
        this.isDraggingLength = false;
    }

    handleDirectionTouch(x, y) {
        const e = this.expandedControls;
        const dx = x - e.directionPad.x;
        const dy = y - e.directionPad.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length !== 0) {
            this.ufo.setBeamDirection(dx / length, dy / length);
            console.log(`Beam direction set to: (${(dx / length).toFixed(2)}, ${(dy / length).toFixed(2)})`);
        }
    }

    handleLengthTouch(x) {
        const e = this.expandedControls;
        const ratio = (x - e.lengthSlider.x) / e.lengthSlider.width;
        const newLength = this.ufo.beam.minLength + ratio * (this.ufo.beam.maxLength - this.ufo.beam.minLength);
        this.ufo.beam.setLength(newLength);
        console.log(`Beam length set to: ${newLength.toFixed(2)}`);
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

    startZoom(direction) {
        this.stopZoom(); // Clear any existing interval
        this.zoomInterval = setInterval(() => {
            if (direction === 'in') {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        }, 100); // Adjust the interval for smooth zooming
    }

    stopZoom() {
        if (this.zoomInterval) {
            clearInterval(this.zoomInterval);
            this.zoomInterval = null;
        }
    }

    zoomIn() {
        if (this.onZoomIn) {
            this.onZoomIn();
            console.log('Zooming in');
        }
    }

    zoomOut() {
        if (this.onZoomOut) {
            this.onZoomOut();
            console.log('Zooming out');
        }
    }
}
