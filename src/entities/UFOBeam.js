export default class UFOBeam {
    constructor(ufo) {
        this.ufo = ufo;
        this.isActive = false;
        this.direction = { x: 0, y: 1 }; // Default down
        this.maxRange = 5; // tiles
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }

    setDirection(dx, dy) {
        this.direction = { x: dx, y: dy };
    }

    getBeamEnd() {
        const ufoPos = this.ufo.getPosition();
        return {
            x: ufoPos.x + this.direction.x * this.maxRange * 16, // Assuming 16px tiles
            y: ufoPos.y + this.direction.y * this.maxRange * 16
        };
    }
}
