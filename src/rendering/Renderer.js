drawBeam(ufo) {
    if (!ufo.beam.isActive || ufo.beam.length === 0) return;

    const ufoPos = ufo.getPosition();
    const endPoint = ufo.beam.getEndPoint();

    this.ctx.save();
    
    // Create a clipping region for the beam
    this.ctx.beginPath();
    this.ctx.moveTo((ufoPos.x - this.cameraX) * this.zoomLevel, (ufoPos.y - this.cameraY) * this.zoomLevel);
    
    // Draw an arc at the end of the beam
    const beamAngle = Math.atan2(endPoint.y - ufoPos.y, endPoint.x - ufoPos.x);
    const beamWidth = ufo.beam.length * 0.2; // Adjust for desired width
    this.ctx.arc(
        (endPoint.x - this.cameraX) * this.zoomLevel,
        (endPoint.y - this.cameraY) * this.zoomLevel,
        beamWidth * this.zoomLevel,
        beamAngle - Math.PI / 2,
        beamAngle + Math.PI / 2
    );
    this.ctx.closePath();
    this.ctx.clip();

    // Draw the beam gradient
    const gradient = this.ctx.createRadialGradient(
        (ufoPos.x - this.cameraX) * this.zoomLevel,
        (ufoPos.y - this.cameraY) * this.zoomLevel,
        0,
        (ufoPos.x - this.cameraX) * this.zoomLevel,
        (ufoPos.y - this.cameraY) * this.zoomLevel,
        ufo.beam.length * this.zoomLevel
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
        (ufoPos.x - this.cameraX - ufo.beam.length) * this.zoomLevel,
        (ufoPos.y - this.cameraY - ufo.beam.length) * this.zoomLevel,
        ufo.beam.length * 2 * this.zoomLevel,
        ufo.beam.length * 2 * this.zoomLevel
    );

    // Add glow effect
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.lineWidth = 2 * this.zoomLevel;
    this.ctx.stroke();

    this.ctx.restore();

    // Render captured NPC if any
    if (ufo.capturedNPC) {
        const sprite = this.sprites[ufo.capturedNPC.sprite || ufo.capturedNPC.type];
        if (sprite) {
            this.ctx.drawImage(
                sprite,
                (endPoint.x - this.cameraX) * this.zoomLevel - (this.tileSize * this.zoomLevel) / 2,
                (endPoint.y - this.cameraY) * this.zoomLevel - (this.tileSize * this.zoomLevel) / 2,
                this.tileSize * this.zoomLevel,
                this.tileSize * this.zoomLevel
            );
        }
    }
}
