// main.js

import TerrainGenerator from './src/features/TerrainGenerator.js';
import Renderer from './src/rendering/Renderer.js';
import StructureGenerator from './src/features/StructureGenerator.js';
import RoadGenerator from './src/features/RoadGenerator.js';
import { TILES } from './src/features/TerrainGenerator.js';

const canvas = document.getElementById('mapCanvas');
const renderer = new Renderer(canvas);

async function init() {
    console.log("Initializing...");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mapWidth = Math.ceil(canvas.width / renderer.tileSize);
    const mapHeight = Math.ceil(canvas.height / renderer.tileSize);

    console.log("Map dimensions:", mapWidth, "x", mapHeight);

    // Load all sprites, including 'road'
    await renderer.loadSprites(Object.values(TILES).concat(['barn', 'silo']));

    const terrainGenerator = new TerrainGenerator(mapWidth, mapHeight);
    let terrain = terrainGenerator.generate();
    console.log("Terrain generated");

    // Generate roads
    const roadGenerator = new RoadGenerator(terrain);
    terrain = roadGenerator.generate();
    console.log("Roads generated");

    const structureGenerator = new StructureGenerator(terrain);
    const structures = structureGenerator.generate();
    console.log("Structures generated");

    renderer.render(terrain);
    console.log("Map rendered");
    
    // Debug: Count and log the number of each tile type
    const tileCounts = Object.fromEntries(
        Object.values(TILES).map(tile => [tile, terrain.flat().filter(t => t === tile).length])
    );
    console.log("Tile counts:", tileCounts);
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
