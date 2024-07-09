// File: main.js

import TerrainGenerator from './src/features/TerrainGenerator.js';
import Renderer from './src/rendering/Renderer.js';
import StructureGenerator from './src/features/StructureGenerator.js';
import WaypointGenerator from './src/features/WaypointGenerator.js';
import RoadGenerator from './src/features/RoadGenerator.js';
import { TILES } from './src/features/TerrainGenerator.js';

const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

async function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mapWidth = Math.ceil(canvas.width / renderer.tileSize);
    const mapHeight = Math.ceil(canvas.height / renderer.tileSize);

    await renderer.loadSprites(Object.values(TILES).concat(['barn', 'silo']));

    const terrainGenerator = new TerrainGenerator(mapWidth, mapHeight);
    const terrain = terrainGenerator.generate();

    const structureGenerator = new StructureGenerator(terrain);
    const structures = structureGenerator.generate();

    const POIs = {
        primary: structures.map(structure => structure.position),
        secondary: [] // Add any additional secondary POIs if needed
    };

    const waypointGenerator = new WaypointGenerator(terrain, POIs);
    const waypoints = waypointGenerator.generateWaypoints();

    const roadGenerator = new RoadGenerator(terrain);
    const roads = roadGenerator.generateRoads(waypoints);

    renderer.render(terrain);
    
    console.log('Map generated with dimensions:', mapWidth, 'x', mapHeight);
    console.log('Structures:', structures);
    console.log('Roads:', roads);
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
