// File: src/features/WaypointGenerator.js

export default class WaypointGenerator {
    constructor(terrain, POIs) {
        this.terrain = terrain;
        this.POIs = POIs;
        this.waypoints = [];
    }

    generateWaypoints() {
        this.addPrimaryWaypoints();
        this.addSecondaryWaypoints();
        return this.waypoints;
    }

    addPrimaryWaypoints() {
        this.waypoints.push(...this.POIs.primary);
    }

    addSecondaryWaypoints() {
        this.terrain.forEach((row, y) => {
            row.forEach((tile, x) => {
                if (this.shouldPlaceWaypoint(x, y)) {
                    this.waypoints.push({ x, y });
                }
            });
        });
    }

    shouldPlaceWaypoint(x, y) {
        // Check proximity to POIs and terrain suitability
        const isNearPOI = this.POIs.secondary.some(poi => 
            Math.abs(poi.x - x) <= 5 && Math.abs(poi.y - y) <= 5);
        const isClearTerrain = this.isPassableTerrain(this.terrain[y][x]);
        return isNearPOI && isClearTerrain;
    }

    isPassableTerrain(tile) {
        // Define passable terrain types
        const passableTypes = ['grass', 'field'];
        return passableTypes.includes(tile);
    }
}
